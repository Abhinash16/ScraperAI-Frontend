<template>
  <v-card outlined rounded="xl" class="pa-6">
    <div class="d-flex align-center mb-3">
      <v-icon small class="mr-2">$shield-check</v-icon>
      <div class="text-subtitle-1 font-weight-bold">Knowledge health</div>
      <v-spacer />
      <v-btn
        v-if="canCheck"
        small
        text
        rounded
        class="text-none"
        :loading="checking"
        @click="checkNow"
      >
        <v-icon small class="mr-1">$refresh-cw</v-icon> Check now
      </v-btn>
      <v-btn v-if="compact" small text rounded color="primary" class="text-none" to="/dashboard/knowledge">
        Open Knowledge
      </v-btn>
    </div>

    <v-progress-linear v-if="loading && !current" indeterminate color="primary" />
    <div v-else-if="error" class="text-body-2 error--text">{{ error }}</div>

    <div v-else-if="current && current.score == null" class="text-body-2 grey--text text--darken-1">
      No published knowledge yet. The score appears once the bot uses some.
    </div>

    <div v-else-if="current" class="d-flex align-center flex-wrap">
      <div class="mr-8 mb-2">
        <div class="d-flex align-baseline">
          <span :class="['score font-weight-bold', scoreColor]">{{ current.score }}</span>
          <span class="text-body-1 grey--text ml-1">/ 100</span>
          <span v-if="trend" :class="['text-body-2 font-weight-bold ml-3', trend.color]" :title="trend.title">
            <v-icon x-small :color="trend.iconColor">{{ trend.icon }}</v-icon>
            {{ trend.text }}
          </span>
        </div>
        <div class="text-body-2 grey--text text--darken-1">
          {{ current.healthy }} of {{ current.published }} published item{{ current.published === 1 ? " is" : "s are" }}
          healthy
        </div>
      </div>

      <div class="d-flex flex-wrap counts">
        <component
          :is="c.to ? 'router-link' : 'div'"
          v-for="c in counts"
          :key="c.label"
          :to="c.to"
          :class="['count mr-6 mb-2', { link: !!c.to }]"
        >
          <div :class="['text-h6 font-weight-bold', c.value ? c.color : 'grey--text']">{{ c.value }}</div>
          <div class="text-caption grey--text text--darken-1">{{ c.label }}</div>
        </component>
      </div>
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

  data: () => ({ current: null, history: [], loading: false, error: "", checking: false }),

  computed: {
    canCheck() {
      return !this.compact && can(this.permissions, "knowledge:publish");
    },

    scoreColor() {
      const s = this.current?.score;
      return s >= 90 ? "success--text" : s >= 70 ? "amber--text text--darken-3" : "error--text";
    },

    // Current score vs the last weekly snapshot
    trend() {
      const prev = this.history[0];
      if (!prev || prev.score == null || this.current?.score == null) return null;
      const d = this.current.score - prev.score;
      const title = `Since ${formatDate(prev.createdAt)}`;
      if (!d) return { text: "no change", color: "grey--text", icon: "$minus", iconColor: "grey", title };
      return d > 0
        ? { text: `${d}`, color: "success--text", icon: "$trending-up", iconColor: "success", title }
        : { text: `${-d}`, color: "error--text", icon: "$trending-down", iconColor: "error", title };
    },

    counts() {
      const c = this.current || {};
      return [
        { label: "Blockers", value: c.blockers || 0, color: "error--text", to: `${ISSUES}?severity=blocker` },
        { label: "Warnings", value: c.warnings || 0, color: "amber--text text--darken-3", to: `${ISSUES}?severity=warning` },
        { label: "Waiting for review", value: c.needsReview || 0, color: "error--text", to: `${ISSUES}?severity=blocker` },
        { label: "Unanswered questions", value: c.unanswered || 0, color: "primary--text", to: "/dashboard/knowledge-gap" },
        { label: "Failed imports", value: c.failedImports || 0, color: "error--text" },
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

<style scoped>
.score {
  font-size: 40px;
  line-height: 1;
}
.count {
  text-decoration: none;
  color: inherit;
}
.count.link:hover .text-caption {
  text-decoration: underline;
}
</style>
