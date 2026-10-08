<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Notices</h1>
        <div class="text-body-2 grey--text text--darken-1">
          Temporary things the bot should tell customers: closures, special hours, maintenance,
          announcements and offers.
        </div>
      </div>
      <v-spacer />
      <v-btn v-if="canWrite" color="primary" depressed class="font-weight-bold mb-2" @click="openDialog(null)">
        <v-icon left size="16">$plus</v-icon>
        Add notice
      </v-btn>
    </div>

    <ThingsToKnow feature="notices" />

    <!-- FILTER -->
    <v-card outlined rounded="lg" class="d-flex align-center flex-wrap px-3 py-2 mb-4">
      <v-btn-toggle v-model="when" mandatory dense color="success" class="my-1">
        <v-btn value="current" small>Active &amp; upcoming</v-btn>
        <v-btn value="past" small>Past</v-btn>
      </v-btn-toggle>
      <v-spacer />
      <span v-if="!loading && !error" class="text-caption grey--text text--darken-1 my-1">
        {{ notices.length }} notice{{ notices.length === 1 ? "" : "s" }}
      </span>
    </v-card>

    <!-- LOADING / ERROR / EMPTY -->
    <template v-if="loading">
      <v-card v-for="i in 3" :key="i" outlined rounded="lg" class="pa-2 mb-3">
        <v-skeleton-loader type="list-item-avatar-three-line" />
      </v-card>
    </template>

    <v-alert v-else-if="error" type="error" text rounded="lg" class="text-body-2">
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ error }}</span>
        <v-spacer />
        <v-btn small outlined color="error" @click="load">
          <v-icon left size="14">$refresh-cw</v-icon>
          Retry
        </v-btn>
      </div>
    </v-alert>

    <v-card
      v-else-if="!notices.length"
      outlined
      rounded="lg"
      class="d-flex flex-column align-center text-center px-6 py-12"
    >
      <v-avatar color="grey lighten-4" size="64" class="mb-4">
        <v-icon size="28" color="grey">$calendar</v-icon>
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1">
        {{ when === "current" ? "No active or upcoming notices" : "No past notices" }}
      </div>
      <div v-if="when === 'current'" class="text-body-2 grey--text text--darken-1 mb-4">
        Add one when something changes for a few days, like a holiday closure or an offer.
      </div>
      <v-btn v-if="canWrite && when === 'current'" small depressed color="primary" @click="openDialog(null)">
        <v-icon left size="14">$plus</v-icon>
        Add notice
      </v-btn>
    </v-card>

    <!-- NOTICES -->
    <template v-else>
      <v-card v-for="n in notices" :key="n._id" outlined rounded="lg" class="d-flex align-start pa-4 mb-3">
        <v-avatar
          size="40"
          tile
          :color="`${typeOf(n).color.split(' ')[0]} lighten-5`"
          class="rounded-lg mr-4 flex-shrink-0"
        >
          <v-icon size="20" :color="typeOf(n).color">
            {{
              n.type === "closed"
                ? "$circle-x"
                : n.type === "special_hours"
                ? "$clock"
                : n.type === "maintenance"
                ? "$triangle-alert"
                : n.type === "promotion"
                ? "$tag"
                : "$info"
            }}
          </v-icon>
        </v-avatar>

        <div class="flex-grow-1 overflow-hidden mr-2">
          <div class="d-flex align-center flex-wrap">
            <span class="text-body-2 font-weight-bold grey--text text--darken-4 text-break mr-2">
              {{ n.title }}
            </span>
            <v-chip x-small label :color="typeOf(n).color" text-color="white" class="font-weight-bold mr-1 my-1">
              {{ typeOf(n).label }}
            </v-chip>
            <v-chip
              x-small
              label
              :color="timing(n).active ? 'green lighten-5' : 'grey lighten-4'"
              :text-color="timing(n).active ? 'green darken-2' : 'grey darken-1'"
              class="font-weight-bold mr-1 my-1"
            >
              {{ timing(n).label }}
            </v-chip>
            <v-chip v-if="n.origin === 'api'" x-small label outlined color="indigo" class="font-weight-bold my-1">
              From your system
            </v-chip>
          </div>

          <div class="d-flex flex-wrap align-center text-caption grey--text text--darken-1 mt-1">
            <span class="d-inline-flex align-center mr-3">
              <v-icon size="12" class="mr-1">$calendar</v-icon>
              {{ formatNoticeDates(n) }}
            </span>
            <span class="d-inline-flex align-center mr-3">
              <v-icon size="12" class="mr-1">$map-pin</v-icon>
              {{ whereLabel(n) }}
            </span>
            <span v-if="n.hours" class="d-inline-flex align-center mr-3">
              <v-icon size="12" class="mr-1">$clock</v-icon>
              {{ n.hours.open }}–{{ n.hours.close }}
            </span>
            <span v-if="n.showInWidget" class="d-inline-flex align-center">
              <v-icon size="12" class="mr-1">$monitor</v-icon>
              Banner on the website chat
            </span>
          </div>

          <div v-if="n.text" class="text-body-2 grey--text text--darken-3 text-break mt-2">{{ n.text }}</div>
        </div>

        <div v-if="canWrite" class="d-flex flex-shrink-0">
          <v-btn icon small aria-label="Edit notice" @click="openDialog(n)">
            <v-icon size="16">$pencil</v-icon>
          </v-btn>
          <v-btn icon small color="error" aria-label="Delete notice" @click="deleting = n">
            <v-icon size="16">$trash-2</v-icon>
          </v-btn>
        </div>
      </v-card>
    </template>

    <NoticeDialog
      v-model="dialogOpen"
      :notice="editing"
      :location-suggestions="locations"
      @saved="load"
    />

    <!-- DELETE -->
    <v-dialog :value="!!deleting" max-width="420" @input="deleting = null">
      <v-card v-if="deleting" rounded="lg">
        <v-card-text class="pt-6 text-center">
          <v-avatar color="error lighten-5" size="56" class="mb-4">
            <v-icon color="error" size="26">$trash-2</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-2">
            Delete "{{ deleting.title }}"?
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            The bot stops mentioning it right away.
            <template v-if="deleting.origin === 'api'">
              It came from your system, which may send it again.
            </template>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-5">
          <v-btn text :disabled="removing" @click="deleting = null">Cancel</v-btn>
          <v-btn color="error" depressed :loading="removing" @click="remove">Delete</v-btn>
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
