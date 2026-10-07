<template>
  <div class="knowledge-page">
    <!-- Header -->
    <div class="d-flex align-center flex-wrap mb-6">
      <v-avatar size="48" rounded="xl" color="#cde6ff" class="mr-4">
        <v-icon color="black">$folder-open</v-icon>
      </v-avatar>
      <div class="mr-4">
        <div class="text-h5 font-weight-bold">Knowledge</div>
        <div class="text-body-2 grey--text text--darken-1">
          Everything your bot knows, grouped into sources.
        </div>
      </div>
      <v-spacer />
      <v-btn
        text
        rounded
        color="primary"
        class="text-none my-1"
        to="/dashboard/knowledge-gap"
      >
        <v-icon small class="mr-1">$lightbulb</v-icon> Knowledge gaps
      </v-btn>
      <v-btn
        v-if="can(perms, 'knowledge:write')"
        color="primary"
        depressed
        rounded
        class="text-none font-weight-bold ml-2 my-1"
        @click="openCreate"
      >
        <v-icon small class="mr-1">$plus</v-icon> New source
      </v-btn>
    </div>

    <ThingsToKnow feature="knowledge" />

    <v-card v-if="loading && !sources.length" outlined rounded="xl" class="pa-6">
      <v-progress-linear indeterminate color="primary" />
    </v-card>

    <v-alert v-else-if="loadError" type="error" outlined rounded="lg">
      {{ loadError }}
      <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
    </v-alert>

    <v-card
      v-else-if="!sources.length"
      outlined
      rounded="xl"
      class="pa-10 text-center"
    >
      <v-icon size="40" color="grey lighten-1" class="mb-3">$folder</v-icon>
      <div class="text-subtitle-1 font-weight-bold mb-1">No sources yet</div>
      <div class="text-body-2 grey--text text--darken-1 mb-4">
        Import your website, or add notes for facts that aren't online.
      </div>
      <v-btn
        v-if="can(perms, 'knowledge:write')"
        color="primary"
        depressed
        rounded
        class="text-none"
        @click="openCreate"
      >
        Add your first source
      </v-btn>
    </v-card>

    <v-row v-else>
      <v-col
        v-for="source in sources"
        :key="source._id"
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card
          outlined
          rounded="xl"
          :class="['source-card pa-5', { paused: source.status === 'paused' }]"
          :to="`/dashboard/knowledge/${source._id}`"
        >
          <div class="d-flex align-start mb-3">
            <v-avatar size="40" rounded="lg" :color="`${typeOf(source).color} lighten-5`" class="mr-3">
              <v-icon :color="typeOf(source).color">{{ typeOf(source).icon }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1 min-w-0">
              <div class="text-subtitle-1 font-weight-bold text-truncate">
                {{ source.name }}
              </div>
              <div class="text-caption grey--text">
                {{ typeOf(source).label }}
                <template v-if="source.config && source.config.rootUrl">
                  · {{ source.config.rootUrl }}
                </template>
              </div>
            </div>
            <v-chip v-if="source.status === 'paused'" x-small outlined color="warning">
              Paused
            </v-chip>
          </div>

          <div class="d-flex stats text-body-2 mb-3">
            <div class="mr-5">
              <div class="font-weight-bold">{{ stat(source, "itemCount") }}</div>
              <div class="text-caption grey--text">Items</div>
            </div>
            <div class="mr-5">
              <div class="font-weight-bold">{{ stat(source, "publishedCount") }}</div>
              <div class="text-caption grey--text">Published</div>
            </div>
            <div>
              <div class="font-weight-bold">{{ stat(source, "chunkCount") }}</div>
              <div class="text-caption grey--text">Chunks</div>
            </div>
          </div>

          <div class="d-flex align-center">
            <div class="text-caption grey--text">
              Updated {{ formatDate((source.stats && source.stats.lastSyncedAt) || source.updatedAt) }}
            </div>
            <v-spacer />
            <v-tooltip v-if="can(perms, 'knowledge:publish')" bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  :loading="busyId === source._id"
                  :aria-label="source.status === 'paused' ? 'Resume source' : 'Pause source'"
                  v-on="on"
                  @click.prevent.stop="togglePause(source)"
                >
                  <v-icon small>{{ source.status === "paused" ? "$play" : "$pause" }}</v-icon>
                </v-btn>
              </template>
              {{ source.status === "paused" ? "Resume: the bot uses it again" : "Pause: hide it from the bot" }}
            </v-tooltip>
            <v-btn
              v-if="can(perms, 'knowledge:delete')"
              icon
              small
              aria-label="Delete source"
              @click.prevent.stop="deleting = source"
            >
              <v-icon small>$trash-2</v-icon>
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- New source -->
    <v-dialog v-model="createOpen" max-width="480">
      <v-card rounded="xl">
        <v-card-title class="text-h6">New source</v-card-title>
        <v-card-text>
          <v-btn-toggle
            v-model="draft.type"
            mandatory
            rounded
            color="primary"
            class="mb-5"
          >
            <v-btn value="website" class="text-none">
              <v-icon small class="mr-2">$globe</v-icon> Website
            </v-btn>
            <v-btn value="manual" class="text-none">
              <v-icon small class="mr-2">$notebook-pen</v-icon> Notes
            </v-btn>
          </v-btn-toggle>
          <div class="text-body-2 grey--text text--darken-1 mb-4">
            {{
              draft.type === "website"
                ? "Import pages from your site by URL, sitemap, or file. Each page is read once when you import it."
                : "Write facts that aren't on your website, like policies, timings, or contact details."
            }}
          </div>
          <v-text-field
            v-model="draft.name"
            label="Name"
            :placeholder="draft.type === 'website' ? 'Main website' : 'Policies'"
            outlined
            dense
            counter="100"
          />
          <template v-if="draft.type === 'website'">
            <v-text-field
              v-model="draft.rootUrl"
              label="Website address (optional)"
              placeholder="https://example.com"
              outlined
              dense
            />
            <v-switch
              v-model="draft.autoPublish"
              inset
              hide-details
              class="mt-0"
              label="Publish pages as soon as they're imported"
            />
          </template>
          <v-alert
            v-if="createError"
            type="error"
            dense
            outlined
            rounded="lg"
            class="mt-4 mb-0 text-body-2"
          >
            {{ createError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="creating" @click="createOpen = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            depressed
            rounded
            class="text-none"
            :disabled="!draft.name.trim()"
            :loading="creating"
            @click="create"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete source -->
    <v-dialog :value="!!deleting" max-width="460" @input="deleting = null">
      <v-card v-if="deleting" rounded="xl">
        <v-card-title class="text-h6">Delete "{{ deleting.name }}"?</v-card-title>
        <v-card-text class="text-body-2">
          This permanently deletes the source and all
          {{ stat(deleting, "itemCount") }} of its items. The bot stops using
          them right away, and this can't be undone. To hide it from the bot
          for now, pause it instead.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="busyId === deleting._id" @click="deleting = null">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            depressed
            rounded
            class="text-none"
            :loading="busyId === deleting._id"
            @click="remove(deleting)"
          >
            Delete source
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import {
  KNOWLEDGE_API,
  apiError,
  can,
  formatDate,
  loadMyPermissions,
  sourceType,
} from "@/utils/knowledge";

const emptyDraft = () => ({ type: "website", name: "", rootUrl: "", autoPublish: true });

export default {
  name: "KnowledgeSources",

  components: { ThingsToKnow },

  data() {
    return {
      perms: [],
      sources: [],
      loading: false,
      loadError: "",
      busyId: null,

      createOpen: false,
      creating: false,
      createError: "",
      draft: emptyDraft(),

      deleting: null,
    };
  },

  created() {
    this.load();
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => {});
  },

  methods: {
    can,
    formatDate,
    typeOf: (source) => sourceType(source.type),
    stat: (source, key) => source.stats?.[key] ?? 0,

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources`);
        this.sources = data.data || [];
      } catch (err) {
        this.loadError = apiError(err, "Failed to load your knowledge sources");
      } finally {
        this.loading = false;
      }
    },

    openCreate() {
      this.draft = emptyDraft();
      this.createError = "";
      this.createOpen = true;
    },

    async create() {
      this.creating = true;
      this.createError = "";
      const { type, name, rootUrl, autoPublish } = this.draft;
      try {
        const { data } = await apiClient.post(`${KNOWLEDGE_API}/sources`, {
          type,
          name: name.trim(),
          ...(type === "website" ? { config: { rootUrl: rootUrl.trim(), autoPublish } } : {}),
        });
        this.createOpen = false;
        this.$router.push(`/dashboard/knowledge/${data.data._id}`);
      } catch (err) {
        this.createError = apiError(err, "Failed to create the source");
      } finally {
        this.creating = false;
      }
    },

    async togglePause(source) {
      const pause = source.status !== "paused";
      this.busyId = source._id;
      try {
        await apiClient.post(`${KNOWLEDGE_API}/sources/${source._id}/${pause ? "pause" : "resume"}`);
        source.status = pause ? "paused" : "active";
        this.$toast.success(pause ? "Paused. The bot no longer uses this source." : "Resumed");
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to update the source"));
      } finally {
        this.busyId = null;
      }
    },

    async remove(source) {
      this.busyId = source._id;
      try {
        const { data } = await apiClient.delete(`${KNOWLEDGE_API}/sources/${source._id}`);
        this.sources = this.sources.filter((s) => s._id !== source._id);
        this.deleting = null;
        this.$toast.success(`Deleted ${data.data?.items ?? 0} items`);
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to delete the source"));
      } finally {
        this.busyId = null;
      }
    },
  },
};
</script>

<style scoped>
.source-card {
  transition: box-shadow 0.15s;
}
.source-card:hover {
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.06) !important;
}
.source-card.paused {
  opacity: 0.7;
}
.min-w-0 {
  min-width: 0;
}
</style>
