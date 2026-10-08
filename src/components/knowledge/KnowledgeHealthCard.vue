<template>
  <v-card outlined rounded="lg">
    <!-- Header -->
    <div class="d-flex align-center flex-wrap px-5 py-4">
      <v-avatar size="40" tile color="green lighten-5" class="rounded-lg mr-3 flex-shrink-0">
        <v-icon size="20" color="green darken-1">$shield-check</v-icon>
      </v-avatar>
      <div class="flex-grow-1 mr-4 my-1">
        <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Knowledge health</div>
        <div class="text-caption grey--text text--darken-1">
          Share of your published knowledge with no open problems.
        </div>
      </div>
      <v-btn v-if="canCheck" small outlined color="primary" class="my-1" :loading="checking" @click="checkNow">
        <v-icon left size="14">$refresh-cw</v-icon>
        Check now
      </v-btn>
      <v-btn v-if="compact" small text color="primary" class="my-1" to="/dashboard/knowledge">
        Open Knowledge
        <v-icon right size="14">$arrow-right</v-icon>
      </v-btn>
    </div>
    <v-divider />

    <div class="pa-5">
      <v-skeleton-loader v-if="loading && !current" type="list-item-avatar-two-line" />

      <v-alert v-else-if="error" type="error" text dense rounded="lg" class="text-body-2 mb-0">
        {{ error }}
      </v-alert>

      <div v-else-if="current && current.score == null" class="text-body-2 grey--text text--darken-1">
        No published knowledge yet. The score appears once the bot uses some.
      </div>

      <v-row v-else-if="current" dense align="center">
        <!-- Score -->
        <v-col cols="12" md="4">
          <div class="d-flex align-center">
            <v-progress-circular
              :value="current.score"
              :color="current.score >= 90 ? 'success' : current.score >= 70 ? 'amber darken-2' : 'error'"
              size="76"
              width="7"
              class="mr-4 flex-shrink-0"
            >
              <span class="text-h6 font-weight-bold" :class="scoreColor">{{ current.score }}</span>
            </v-progress-circular>
            <div>
              <div class="d-flex align-center flex-wrap">
                <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mr-2">out of 100</span>
                <v-chip
                  v-if="trend"
                  x-small
                  label
                  :color="`${trend.iconColor} lighten-5`"
                  :text-color="trend.iconColor"
                  class="font-weight-bold"
                  :title="trend.title"
                >
                  <v-icon left size="10">{{ trend.icon }}</v-icon>
                  {{ trend.text }}
                </v-chip>
              </div>
              <div class="text-caption grey--text text--darken-1">
                {{ current.healthy }} of {{ current.published }} published item{{
                  current.published === 1 ? " is" : "s are"
                }}
                healthy
              </div>
            </div>
          </div>
        </v-col>

        <!-- Counts -->
        <v-col cols="12" md="8">
          <v-row dense>
            <v-col v-for="c in counts" :key="c.label" cols="6" sm="4" lg>
              <v-card
                flat
                rounded="lg"
                color="grey lighten-5"
                class="px-4 py-3 fill-height"
                :to="c.to"
                :ripple="!!c.to"
              >
                <div class="text-h6 font-weight-bold" :class="c.value ? c.color : 'grey--text'">
                  {{ c.value }}
                </div>
                <div class="text-caption grey--text text--darken-1 text-truncate" :title="c.label">
                  {{ c.label }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script>
import apiClient from "@/service/axios";
import { KNOWLEDGE_API, apiError, can, formatDate } from "@/utils/knowledge";

const ISSUES = "/dashboard/knowledge/issues";

// Score and open problems from GET /knowledge/health. Reusable: Knowledge page
// (full) and dashboard home (compact, with a link to Knowledge).
export default {
  name: "KnowledgeHealthCard",

  props: {
    permissions: { type: Array, default: () => [] },
    compact: { type: Boolean, default: false },
  },

  data: () => ({
    current: null,
    history: [],
    loading: false,
    error: "",
    checking: false,
  }),

  computed: {
    canCheck() {
      return !this.compact && can(this.permissions, "knowledge:publish");
    },

    scoreColor() {
      const s = this.current?.score;
      return s >= 90
        ? "success--text"
        : s >= 70
        ? "amber--text text--darken-3"
        : "error--text";
    },

    // Current score vs the last weekly snapshot
    trend() {
      const prev = this.history[0];
      if (!prev || prev.score == null || this.current?.score == null)
        return null;
      const d = this.current.score - prev.score;
      const title = `Since ${formatDate(prev.createdAt)}`;
      if (!d)
        return {
          text: "no change",
          color: "grey--text",
          icon: "$minus",
          iconColor: "grey",
          title,
        };
      return d > 0
        ? {
            text: `${d}`,
            color: "success--text",
            icon: "$trending-up",
            iconColor: "success",
            title,
          }
        : {
            text: `${-d}`,
            color: "error--text",
            icon: "$trending-down",
            iconColor: "error",
            title,
          };
    },

    counts() {
      const c = this.current || {};
      return [
        {
          label: "Blockers",
          value: c.blockers || 0,
          color: "error--text",
          to: `${ISSUES}?severity=blocker`,
        },
        {
          label: "Warnings",
          value: c.warnings || 0,
          color: "amber--text text--darken-3",
          to: `${ISSUES}?severity=warning`,
        },
        {
          label: "Waiting for review",
          value: c.needsReview || 0,
          color: "error--text",
          to: `${ISSUES}?severity=blocker`,
        },
        {
          label: "Unanswered questions",
          value: c.unanswered || 0,
          color: "primary--text",
          to: "/dashboard/knowledge-gap",
        },
        {
          label: "Failed imports",
          value: c.failedImports || 0,
          color: "error--text",
        },
      ];
    },
  },

  created() {
    this.load();
  },

  methods: {
    apply(data) {
      this.current = data?.current || null;
      this.history = data?.history || [];
    },

    async load() {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/health`);
        this.apply(data.data);
      } catch (err) {
        this.error = apiError(err, "Couldn't load knowledge health");
      } finally {
        this.loading = false;
      }
    },

    async checkNow() {
      this.checking = true;
      try {
        const { data } = await apiClient.post(`${KNOWLEDGE_API}/health/check`);
        this.apply(data.data);
        this.$toast.success("Checks finished");
        this.$emit("checked");
      } catch (err) {
        this.$toast.error(apiError(err, "Checks failed"));
      } finally {
        this.checking = false;
      }
    },
  },
};
</script>
