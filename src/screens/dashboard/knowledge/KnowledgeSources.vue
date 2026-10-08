<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
          Knowledge
        </h1>
        <div class="text-body-2 grey--text text--darken-1">
          Everything your bot knows, grouped into sources.
        </div>
      </div>
      <v-spacer />
      <div class="d-flex flex-wrap align-center mb-2">
        <v-btn
          text
          rounded
          small
          color="grey darken-2"
          class="my-1"
          to="/dashboard/knowledge-gap"
        >
          <v-icon left size="16">$message-circle-question-mark</v-icon>
          Unanswered
        </v-btn>
        <v-btn
          v-if="can(perms, 'knowledge:write')"
          outlined
          color="primary"
          class="ml-2 my-1"
          @click="uploadOpen = true"
        >
          <v-icon left size="16">$upload</v-icon>
          Upload document
        </v-btn>
        <v-btn
          v-if="can(perms, 'knowledge:write')"
          color="primary"
          depressed
          rounded
          class="font-weight-bold ml-2 my-1"
          @click="openCreate"
        >
          <v-icon left size="16">$plus</v-icon>
          New source
        </v-btn>
      </div>
    </div>

    <!-- SUMMARY -->
    <v-row v-if="sources.length" dense class="mb-3">
      <v-col v-for="tile in tiles" :key="tile.label" cols="6" md="3">
        <v-card outlined rounded="lg" class="pa-4 fill-height">
          <div class="d-flex align-center">
            <v-avatar
              :color="`${tile.color} lighten-5`"
              size="36"
              class="rounded-lg mr-3"
            >
              <v-icon :color="tile.color" size="18">{{ tile.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold grey--text text--darken-4">
                {{ tile.value }}
              </div>
              <div class="text-caption grey--text text--darken-1">
                {{ tile.label }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- PROBLEMS -->
    <v-alert
      v-if="problemCount"
      :color="summary.blocker ? 'error' : 'amber darken-3'"
      text
      dense
      rounded="lg"
      class="text-body-2 py-3 mb-4"
    >
      <template #prepend>
        <v-icon
          :color="summary.blocker ? 'error' : 'amber darken-3'"
          size="20"
          class="mr-3"
        >
          $triangle-alert
        </v-icon>
      </template>
      <div class="d-flex align-center flex-wrap">
        <div class="mr-4 grey--text text--darken-3">
          <strong>
            {{ problemCount }} problem{{ problemCount === 1 ? "" : "s" }} need{{
              problemCount === 1 ? "s" : ""
            }}
            attention.
          </strong>
          <template v-if="summary.blocker">
            {{ summary.blocker }} item{{
              summary.blocker === 1 ? " isn't" : "s aren't"
            }}
            live until
            {{ summary.blocker === 1 ? "it's" : "they're" }} reviewed.
          </template>
        </div>
        <v-spacer />
        <v-btn
          small
          depressed
          rounded
          :color="summary.blocker ? 'error' : 'amber darken-3'"
          class="white--text my-1"
          to="/dashboard/knowledge/issues"
        >
          Review issues
          <v-icon right size="14">$arrow-right</v-icon>
        </v-btn>
      </div>
    </v-alert>

    <KnowledgeHealthCard
      :permissions="perms"
      class="mb-4"
      @checked="loadSummary"
    />

    <ThingsToKnow feature="knowledge" />

    <!-- LOADING -->
    <v-row v-if="loading && !sources.length">
      <v-col v-for="n in 3" :key="n" cols="12" sm="6" lg="4">
        <v-card outlined rounded="lg" class="pa-4">
          <v-skeleton-loader
            type="list-item-avatar-two-line, list-item, actions"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- ERROR -->
    <v-alert
      v-else-if="loadError"
      type="error"
      text
      rounded="lg"
      class="text-body-2"
    >
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ loadError }}</span>
        <v-spacer />
        <v-btn small outlined rounded color="error" @click="load">
          <v-icon left size="14">$refresh-cw</v-icon>
          Retry
        </v-btn>
      </div>
    </v-alert>

    <!-- EMPTY -->
    <v-card
      v-else-if="!sources.length"
      outlined
      rounded="lg"
      class="d-flex flex-column align-center text-center px-6 py-12"
    >
      <v-avatar color="primary lighten-5" size="72" class="mb-4">
        <v-icon size="32" color="primary">$folder-open</v-icon>
      </v-avatar>
      <div
        class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1"
      >
        No sources yet
      </div>
      <div class="text-body-2 grey--text text--darken-1 mb-6">
        Import your website, upload a document, add FAQs, or write notes for
        facts that aren't online.
      </div>
      <div class="d-flex flex-wrap justify-center mb-6">
        <v-chip
          v-for="(help, type) in TYPE_HELP"
          :key="type"
          outlined
          :color="sourceType(type).color"
          class="ma-1"
        >
          <v-icon left size="16">{{ sourceType(type).icon }}</v-icon>
          {{ sourceType(type).label }}
        </v-chip>
      </div>
      <v-btn
        v-if="can(perms, 'knowledge:write')"
        color="primary"
        depressed
        rounded
        @click="openCreate"
      >
        <v-icon left size="16">$plus</v-icon>
        Add your first source
      </v-btn>
    </v-card>

    <!-- SOURCES -->
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
          rounded="lg"
          class="d-flex flex-column fill-height"
          :to="`/dashboard/knowledge/${source._id}`"
        >
          <!-- Title -->
          <v-list-item class="px-4 pt-2">
            <v-avatar
              size="40"
              tile
              class="rounded-lg mr-4 flex-shrink-0"
              :color="`${typeOf(source).color} lighten-5`"
            >
              <v-icon :color="typeOf(source).color" size="20">{{
                typeOf(source).icon
              }}</v-icon>
            </v-avatar>
            <v-list-item-content>
              <v-list-item-title
                class="text-subtitle-1 font-weight-bold grey--text text--darken-4"
              >
                {{ source.name }}
              </v-list-item-title>
              <v-list-item-subtitle class="text-caption">
                {{ typeOf(source).label }}
                <template v-if="source.document">
                  · {{ source.document.fileName }} · {{ kindOf(source) }} · v{{
                    source.document.latestVersion
                  }}
                </template>
                <template v-else-if="source.config && source.config.rootUrl">
                  · {{ source.config.rootUrl }}
                </template>
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <!-- State -->
          <div class="d-flex flex-wrap px-4 mb-3">
            <v-chip
              v-for="chip in stateChips(source)"
              :key="chip.label"
              x-small
              label
              :outlined="chip.outlined"
              :color="chip.color"
              :text-color="chip.outlined ? undefined : 'white'"
              class="font-weight-bold mr-1 mb-1"
            >
              {{ chip.label }}
            </v-chip>
            <v-chip
              v-if="docStatus(source)"
              x-small
              label
              outlined
              :color="docStatus(source).color"
              :title="source.document.error || ''"
              class="font-weight-bold mr-1 mb-1"
            >
              <v-icon
                v-if="docStatus(source).busy"
                size="10"
                left
                class="icon-spin"
                >$loader-circle</v-icon
              >
              {{ docStatus(source).label }}
            </v-chip>
          </div>

          <!-- Stats -->
          <div class="px-4">
            <v-row dense no-gutters class="mb-2">
              <v-col v-for="s in statsOf(source)" :key="s.label" cols="4">
                <div
                  class="text-subtitle-1 font-weight-bold grey--text text--darken-4"
                >
                  {{ s.value }}
                </div>
                <div class="text-caption grey--text text--darken-1">
                  {{ s.label }}
                </div>
              </v-col>
            </v-row>
            <v-progress-linear
              :value="publishedPercent(source)"
              color="success"
              background-color="grey lighten-3"
              height="6"
              rounded
              :aria-label="`${publishedPercent(source)}% published`"
            />
            <div class="text-caption grey--text text--darken-1 mt-1">
              {{ publishedPercent(source) }}% published
            </div>
          </div>

          <v-spacer />
          <v-divider class="mt-3" />

          <!-- Footer -->
          <div class="d-flex align-center px-4 py-2">
            <v-icon size="14" color="grey" class="mr-1">$clock</v-icon>
            <span class="text-caption grey--text text--darken-1 text-truncate">
              Updated
              {{
                formatDate(
                  (source.stats && source.stats.lastSyncedAt) ||
                    source.updatedAt
                )
              }}
            </span>
            <v-spacer />
            <v-tooltip v-if="can(perms, 'knowledge:publish')" bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  :loading="busyId === source._id"
                  :aria-label="
                    source.status === 'paused'
                      ? 'Resume source'
                      : 'Pause source'
                  "
                  v-on="on"
                  @click.prevent.stop="togglePause(source)"
                >
                  <v-icon size="16">{{
                    source.status === "paused" ? "$play" : "$pause"
                  }}</v-icon>
                </v-btn>
              </template>
              {{
                source.status === "paused"
                  ? "Resume: the bot uses it again"
                  : "Pause: hide it from the bot"
              }}
            </v-tooltip>
            <v-tooltip v-if="can(perms, 'knowledge:delete')" bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  color="error"
                  v-bind="attrs"
                  aria-label="Delete source"
                  v-on="on"
                  @click.prevent.stop="deleting = source"
                >
                  <v-icon size="16">$trash-2</v-icon>
                </v-btn>
              </template>
              Delete source
            </v-tooltip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- NEW SOURCE -->
    <v-dialog v-model="createOpen" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">New source</v-card-title>
        <v-card-subtitle class="text-body-2">
          Choose what kind of knowledge you want to add.
        </v-card-subtitle>
        <v-card-text>
          <v-item-group v-model="draft.type" mandatory class="mb-4">
            <v-row dense>
              <v-col v-for="(help, type) in TYPE_HELP" :key="type" cols="4">
                <v-item v-slot="{ active, toggle }" :value="type">
                  <v-card
                    :outlined="!active"
                    rounded="lg"
                    :color="active ? 'primary lighten-5' : undefined"
                    :elevation="0"
                    class="d-flex flex-column align-center text-center pa-3 fill-height"
                    :class="
                      active ? 'primary--text' : 'grey--text text--darken-2'
                    "
                    @click="toggle"
                  >
                    <v-icon
                      :color="active ? 'primary' : sourceType(type).color"
                      class="mb-1"
                    >
                      {{ sourceType(type).icon }}
                    </v-icon>
                    <span class="text-body-2 font-weight-bold">
                      {{ TYPE_LABEL[type] }}
                    </span>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-item-group>

          <v-alert
            text
            dense
            color="primary"
            rounded="lg"
            class="text-body-2 mb-5"
          >
            {{ TYPE_HELP[draft.type] }}
          </v-alert>

          <v-text-field
            v-model="draft.name"
            label="Name"
            :placeholder="NAME_PLACEHOLDER[draft.type]"
            outlined
            dense
            counter="100"
          />
          <template v-if="draft.type === 'website'">
            <v-text-field
              v-model="draft.rootUrl"
              label="Website address (optional)"
              placeholder="https://example.com"
              prepend-inner-icon="$globe"
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
            text
            rounded="lg"
            class="mt-4 mb-0 text-body-2"
          >
            {{ createError }}
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-6 py-3">
          <v-spacer />
          <v-btn text rounded :disabled="creating" @click="createOpen = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            depressed
            rounded
            :disabled="!draft.name.trim()"
            :loading="creating"
            @click="create"
          >
            Create source
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE SOURCE -->
    <v-dialog :value="!!deleting" max-width="440" @input="deleting = null">
      <v-card v-if="deleting" rounded="lg">
        <v-card-text class="pt-6 text-center">
          <v-avatar color="error lighten-5" size="56" class="mb-4">
            <v-icon color="error" size="26">$trash-2</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-2">
            Delete "{{ deleting.name }}"?
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            <template v-if="deleting.type === 'document'">
              Deletes the document and its
              <strong>{{ stat(deleting, "itemCount") }}</strong> sections from
              the bot immediately. This can't be undone.
            </template>
            <template v-else>
              This permanently deletes the source and all
              <strong>{{ stat(deleting, "itemCount") }}</strong> of its items.
              The bot stops using them right away, and this can't be undone.
            </template>
            To hide it from the bot for now, pause it instead.
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-5">
          <v-btn
            text
            rounded
            :disabled="busyId === deleting._id"
            @click="deleting = null"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            depressed
            rounded
            :loading="busyId === deleting._id"
            @click="remove(deleting)"
          >
            Delete source
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <DocumentUploadDialog
      v-model="uploadOpen"
      :can-publish="can(perms, 'knowledge:publish')"
      @uploaded="(s) => $router.push(`/dashboard/knowledge/${s._id}`)"
    />
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import DocumentUploadDialog from "@/components/knowledge/DocumentUploadDialog.vue";
import KnowledgeHealthCard from "@/components/knowledge/KnowledgeHealthCard.vue";
import {
  DOCUMENT_KINDS,
  DOCUMENT_STATUS,
  KNOWLEDGE_API,
  apiError,
  can,
  formatDate,
  loadIssueSummary,
  loadMyPermissions,
  sourceType,
} from "@/utils/knowledge";

const TYPE_HELP = {
  website:
    "Import pages from your site by URL, sitemap, or file. Each page is read once when you import it.",
  faq: "Questions and exact answers. The bot gives these answers ahead of website text. Add them by hand, import a CSV, or let the AI suggest them from your website.",
  manual:
    "Write facts that aren't on your website, like policies, timings, or contact details.",
};

// Short names for the New source type picker
const TYPE_LABEL = { website: "Website", faq: "FAQs", manual: "Notes" };

const NAME_PLACEHOLDER = {
  website: "Main website",
  faq: "Customer FAQs",
  manual: "Policies",
};

const emptyDraft = () => ({
  type: "website",
  name: "",
  rootUrl: "",
  autoPublish: true,
});

export default {
  name: "KnowledgeSources",

  components: { ThingsToKnow, DocumentUploadDialog, KnowledgeHealthCard },

  data() {
    return {
      TYPE_HELP,
      TYPE_LABEL,
      NAME_PLACEHOLDER,
      perms: [],
      summary: null,
      sources: [],
      loading: false,
      loadError: "",
      busyId: null,

      createOpen: false,
      creating: false,
      createError: "",
      draft: emptyDraft(),

      deleting: null,
      uploadOpen: false,
      pollTimer: null,
    };
  },

  computed: {
    tiles() {
      const sum = (key) =>
        this.sources.reduce((n, s) => n + this.stat(s, key), 0);
      return [
        {
          label: "Sources",
          value: this.sources.length,
          icon: "$folder-open",
          color: "indigo",
        },
        {
          label: "Items",
          value: sum("itemCount"),
          icon: "$files",
          color: "blue",
        },
        {
          label: "Published",
          value: sum("publishedCount"),
          icon: "$circle-check",
          color: "green",
        },
        {
          label: "Need attention",
          value: this.problemCount,
          icon: "$triangle-alert",
          color: this.summary && this.summary.blocker ? "red" : "amber",
        },
      ];
    },

    problemCount() {
      return this.summary
        ? (this.summary.blocker || 0) + (this.summary.warning || 0)
        : 0;
    },
  },

  created() {
    this.load();
    this.loadSummary();
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => {});
  },

  beforeDestroy() {
    clearTimeout(this.pollTimer);
  },

  methods: {
    can,
    formatDate,
    typeOf: (source) => sourceType(source.type),
    sourceType,
    stat: (source, key) => source.stats?.[key] ?? 0,
    kindOf: (source) =>
      DOCUMENT_KINDS[source.document?.kind] || source.document?.kind,
    docStatus: (source) =>
      source.document ? DOCUMENT_STATUS[source.document.status] || null : null,

    async loadSummary() {
      this.summary = await loadIssueSummary();
    },

    statsOf(source) {
      return [
        { label: "Items", value: this.stat(source, "itemCount") },
        { label: "Published", value: this.stat(source, "publishedCount") },
        { label: "Chunks", value: this.stat(source, "chunkCount") },
      ];
    },

    publishedPercent(source) {
      const total = this.stat(source, "itemCount");
      return total
        ? Math.round((this.stat(source, "publishedCount") / total) * 100)
        : 0;
    },

    // Live / paused / staging / being replaced
    stateChips(source) {
      const chips = [];
      if (source.status === "paused") {
        chips.push({ label: "Paused", color: "amber darken-3" });
      } else if (source.stage === "staging") {
        chips.push({ label: "Staging", color: "deep-orange" });
      } else {
        chips.push({ label: "Live", color: "success" });
      }
      if (source.status === "paused" && source.stage === "staging") {
        chips.push({ label: "Staging", color: "deep-orange" });
      }
      if (source.retiring) {
        chips.push({
          label: "Being replaced",
          color: "grey darken-1",
          outlined: true,
        });
      }
      return chips;
    },

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
      // Documents being read: refresh until they're done
      clearTimeout(this.pollTimer);
      if (this.sources.some((s) => s.document?.status === "processing")) {
        this.pollTimer = setTimeout(this.load, 5000);
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
          ...(type === "website"
            ? { config: { rootUrl: rootUrl.trim(), autoPublish } }
            : {}),
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
        await apiClient.post(
          `${KNOWLEDGE_API}/sources/${source._id}/${pause ? "pause" : "resume"}`
        );
        source.status = pause ? "paused" : "active";
        this.$toast.success(
          pause ? "Paused. The bot no longer uses this source." : "Resumed"
        );
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to update the source"));
      } finally {
        this.busyId = null;
      }
    },

    async remove(source) {
      this.busyId = source._id;
      try {
        const { data } = await apiClient.delete(
          `${KNOWLEDGE_API}/sources/${source._id}`
        );
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
