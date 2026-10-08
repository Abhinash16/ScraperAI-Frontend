<template>
  <div class="notices-page">
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Notices</h1>
        <div class="text-body-2 grey--text text--darken-1">
          Temporary things the bot should tell customers: closures, special
          hours, maintenance, announcements and offers.
        </div>
      </div>
      <v-spacer />
      <v-btn
        v-if="canWrite"
        color="primary"
        depressed
        rounded
        class="font-weight-bold my-1"
        @click="openDialog(null)"
      >
        <v-icon left size="16">$plus</v-icon>
        Add notice
      </v-btn>
    </div>

    <ThingsToKnow feature="notices" />

    <v-card outlined rounded="lg" class="pa-6">
      <v-btn-toggle v-model="when" mandatory dense rounded color="primary" class="mb-4">
        <v-btn value="current" small class="text-none">Active &amp; upcoming</v-btn>
        <v-btn value="past" small class="text-none">Past</v-btn>
      </v-btn-toggle>

      <v-progress-linear v-if="loading" indeterminate color="primary" />
      <v-alert v-else-if="error" type="error" outlined rounded="lg" class="mb-0">
        {{ error }}
        <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
      </v-alert>
      <div v-else-if="!notices.length" class="text-body-2 grey--text py-4">
        {{
          when === "current"
            ? "No active or upcoming notices. Add one when something changes for a few days, like a holiday closure or an offer."
            : "No past notices."
        }}
      </div>

      <div v-for="n in notices" v-else :key="n._id" class="notice-row py-3 d-flex align-start">
        <div class="flex-grow-1 min-w-0 mr-2">
          <div class="d-flex align-center flex-wrap">
            <v-chip x-small :color="typeOf(n).color" text-color="white" class="mr-2">{{ typeOf(n).label }}</v-chip>
            <span class="font-weight-medium mr-2">{{ n.title }}</span>
            <v-chip
              x-small
              outlined
              :color="timing(n).active ? 'success' : 'grey darken-1'"
              class="mr-2"
            >
              {{ timing(n).label }}
            </v-chip>
            <v-chip v-if="n.origin === 'api'" x-small outlined color="indigo" class="mr-2">From your system</v-chip>
          </div>
          <div class="text-caption grey--text text--darken-1 mt-1">
            {{ formatNoticeDates(n) }} · {{ whereLabel(n) }}
            <template v-if="n.hours"> · {{ n.hours.open }}–{{ n.hours.close }}</template>
            <template v-if="n.showInWidget"> · Banner on the website chat</template>
          </div>
          <div v-if="n.text" class="text-body-2 mt-1">{{ n.text }}</div>
        </div>
        <template v-if="canWrite">
          <v-btn icon small aria-label="Edit notice" @click="openDialog(n)">
            <v-icon small>$pencil</v-icon>
          </v-btn>
          <v-btn icon small aria-label="Delete notice" @click="deleting = n">
            <v-icon small color="error">$trash-2</v-icon>
          </v-btn>
        </template>
      </div>
    </v-card>

    <NoticeDialog
      v-model="dialogOpen"
      :notice="editing"
      :location-suggestions="locations"
      @saved="load"
    />

    <v-dialog :value="!!deleting" max-width="440" @input="deleting = null">
      <v-card v-if="deleting" rounded="lg">
        <v-card-title class="text-h6">Delete "{{ deleting.title }}"?</v-card-title>
        <v-card-text class="text-body-2">
          The bot stops mentioning it right away.
          <template v-if="deleting.origin === 'api'">
            It came from your system, which may send it again.
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="removing" @click="deleting = null">Cancel</v-btn>
          <v-btn color="error" depressed rounded class="text-none" :loading="removing" @click="remove">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import NoticeDialog from "@/components/knowledge/NoticeDialog.vue";
import { apiError, can, loadMyPermissions } from "@/utils/knowledge";
import {
  NOTICES_API,
  fetchNotices,
  formatNoticeDates,
  noticeTiming,
  noticeType,
  whereLabel,
} from "@/utils/notices";

export default {
  name: "KnowledgeNotices",

  components: { ThingsToKnow, NoticeDialog },

  data: () => ({
    perms: [],
    when: "current",
    notices: [],
    loading: false,
    error: "",
    dialogOpen: false,
    editing: null,
    deleting: null,
    removing: false,
    // Location names from the Bot Profile's business facts
    locations: [],
  }),

  computed: {
    canWrite() {
      return can(this.perms, "notices:manage") || can(this.perms, "knowledge:write");
    },
  },

  watch: {
    when: { immediate: true, handler: "load" },
  },

  created() {
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => {});
    this.loadLocations();
  },

  methods: {
    formatNoticeDates,
    whereLabel,
    typeOf: (n) => noticeType(n.type),
    timing: (n) => noticeTiming(n),

    async load() {
      this.loading = true;
      this.error = "";
      try {
        this.notices = await fetchNotices(this.when);
      } catch (err) {
        this.error = apiError(err, "Failed to load notices");
      } finally {
        this.loading = false;
      }
    },

    async loadLocations() {
      try {
        const { data } = await apiClient.get("/clients/bot-profile");
        const list = data.data?.draft?.facts?.locations || [];
        this.locations = list.map((l) => l?.name).filter(Boolean);
      } catch {
        this.locations = [];
      }
    },

    openDialog(notice) {
      this.editing = notice;
      this.dialogOpen = true;
    },

    async remove() {
      this.removing = true;
      try {
        await apiClient.delete(`${NOTICES_API}/${this.deleting._id}`);
        this.$toast.success("Notice deleted");
        this.deleting = null;
        this.load();
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to delete the notice"));
      } finally {
        this.removing = false;
      }
    },
  },
};
</script>

<style scoped>
.notice-row {
  border-bottom: 1px solid #eef1f7;
}
.notice-row:last-of-type {
  border-bottom: none;
}
.min-w-0 {
  min-width: 0;
}
</style>
