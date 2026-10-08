<template>
  <div>
    <v-btn
      text
      small
      color="grey darken-2"
      class="mb-3 px-2"
      to="/dashboard/call-batches"
    >
      <v-icon left size="16">$arrow-left</v-icon>
      All batches
    </v-btn>

    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2 overflow-hidden">
        <h1
          class="text-h6 font-weight-bold grey--text text--darken-4 text-break"
        >
          {{ batchInfo.batchName || "Call batch" }}
        </h1>
        <div class="text-body-2 grey--text text--darken-1">
          How the calls in this batch went, and what to improve.
        </div>
      </div>
      <v-spacer />
      <v-btn
        small
        outlined
        color="primary"
        class="mb-2"
        :loading="loading"
        @click="fetchBatch"
      >
        <v-icon left size="14">$refresh-cw</v-icon>
        Refresh
      </v-btn>
    </div>

    <!-- LOADING -->
    <template v-if="loading && !calls.length">
      <v-row dense class="mb-3">
        <v-col v-for="n in 4" :key="n" cols="6" md="3">
          <v-card outlined rounded="lg" class="pa-3">
            <v-skeleton-loader type="list-item-avatar-two-line" />
          </v-card>
        </v-col>
      </v-row>
      <v-card outlined rounded="lg" class="pa-4">
        <v-skeleton-loader
          type="paragraph, list-item-two-line, list-item-two-line"
        />
      </v-card>
    </template>

    <template v-else>
      <!-- SUMMARY TILES -->
      <v-row dense class="mb-3">
        <v-col cols="6" md="3">
          <v-card
            outlined
            rounded="lg"
            class="d-flex align-center pa-4 fill-height"
          >
            <v-progress-circular
              :value="scoreValue * 20"
              :color="
                scoreValue
                  ? scoreValue >= 4
                    ? 'success'
                    : 'error'
                  : 'grey lighten-2'
              "
              size="48"
              width="5"
              class="mr-3 flex-shrink-0"
            >
              <v-icon size="16" :color="scoreValue >= 4 ? 'success' : 'error'"
                >$star</v-icon
              >
            </v-progress-circular>
            <div>
              <div
                class="text-h6 font-weight-bold"
                :class="scoreText(scoreValue)"
              >
                {{ formatScore(scoreValue) }}
              </div>
              <div class="text-caption grey--text text--darken-1">
                Quality score
              </div>
            </div>
          </v-card>
        </v-col>
        <v-col v-for="t in tiles" :key="t.label" cols="6" md="3">
          <v-card
            outlined
            rounded="lg"
            class="d-flex align-center pa-4 fill-height"
          >
            <v-avatar
              size="44"
              tile
              :color="`${t.tone} lighten-5`"
              class="rounded-lg mr-3 flex-shrink-0"
            >
              <v-icon size="22" :color="t.tone">{{ t.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold grey--text text--darken-4">
                {{ t.value }}
              </div>
              <div class="text-caption grey--text text--darken-1">
                {{ t.label }}
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- SUMMARY + INSIGHTS -->
      <v-card
        v-if="batchInfo.batchSummary || insights.length"
        outlined
        rounded="lg"
        class="mb-4"
      >
        <div v-if="batchInfo.batchSummary" class="d-flex align-start pa-5">
          <v-avatar
            size="36"
            tile
            color="primary lighten-5"
            class="rounded-lg mr-3 flex-shrink-0"
          >
            <v-icon size="18" color="primary">$file-text</v-icon>
          </v-avatar>
          <div>
            <div
              class="text-caption font-weight-bold text-uppercase grey--text mb-1"
            >
              Summary
            </div>
            <div class="text-body-2 grey--text text--darken-3 text-break">
              {{ batchInfo.batchSummary }}
            </div>
          </div>
        </div>

        <template v-if="insights.length">
          <v-divider />
          <div class="d-flex align-center px-5 pt-4">
            <v-icon size="18" color="amber darken-2" class="mr-2"
              >$lightbulb</v-icon
            >
            <span
              class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
            >
              Key insights and recommendations
            </span>
          </div>
          <v-row dense class="pa-4">
            <v-col
              v-for="(insight, index) in insights"
              :key="index"
              cols="12"
              md="6"
            >
              <v-card outlined rounded="lg" class="pa-4 fill-height">
                <div class="d-flex align-start mb-2">
                  <v-icon
                    size="16"
                    color="error"
                    class="mr-2 mt-1 flex-shrink-0"
                    >$circle-alert</v-icon
                  >
                  <span
                    class="text-body-2 font-weight-bold grey--text text--darken-4 text-break"
                  >
                    {{ insight.issue }}
                  </span>
                </div>
                <v-chip
                  x-small
                  label
                  color="grey lighten-4"
                  class="font-weight-bold mb-3"
                >
                  <v-icon left size="10">$repeat</v-icon>
                  {{ insight.frequency }} occurrence{{
                    insight.frequency === 1 ? "" : "s"
                  }}
                </v-chip>
                <v-sheet color="green lighten-5" rounded="lg" class="pa-3">
                  <div
                    class="text-caption font-weight-bold green--text text--darken-2 mb-1"
                  >
                    Suggested action
                  </div>
                  <div class="text-body-2 grey--text text--darken-3 text-break">
                    {{ insight.suggestion }}
                  </div>
                </v-sheet>
              </v-card>
            </v-col>
          </v-row>
        </template>
      </v-card>

      <!-- CALLS -->
      <v-card outlined rounded="lg" class="px-3 py-2 mb-4">
        <v-row dense align="center">
          <v-col cols="12" md="auto" class="overflow-x-auto">
            <v-btn-toggle
              v-model="statusFilter"
              mandatory
              dense
              color="success"
            >
              <v-btn
                v-for="f in STATUS_FILTERS"
                :key="f.value"
                :value="f.value"
                small
              >
                {{ f.label }}
                <span class="grey--text ml-1">({{ countFor(f.value) }})</span>
              </v-btn>
            </v-btn-toggle>
          </v-col>
          <v-spacer />
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="search"
              placeholder="Search agents"
              outlined
              dense
              clearable
              hide-details
            />
          </v-col>
        </v-row>
      </v-card>

      <v-card
        v-if="!filteredCalls.length"
        outlined
        rounded="lg"
        class="d-flex flex-column align-center text-center px-6 py-10"
      >
        <v-avatar color="grey lighten-4" size="56" class="mb-3">
          <v-icon size="24" color="grey">$phone</v-icon>
        </v-avatar>
        <div class="text-body-2 font-weight-bold grey--text text--darken-3">
          {{
            calls.length
              ? "No calls match these filters"
              : "No calls in this batch"
          }}
        </div>
      </v-card>

      <v-card
        v-for="item in filteredCalls"
        :key="item._id"
        outlined
        rounded="lg"
        class="d-flex flex-wrap align-center pa-4 mb-3"
      >
        <div class="d-flex align-center flex-grow-1 mr-4 overflow-hidden">
          <v-avatar
            size="40"
            color="primary lighten-5"
            class="mr-3 flex-shrink-0"
          >
            <span class="primary--text text-body-2 font-weight-bold">{{
              initialOf(item.agentName)
            }}</span>
          </v-avatar>
          <div class="overflow-hidden">
            <div
              class="text-body-2 font-weight-bold grey--text text--darken-4 text-truncate"
            >
              {{ item.agentName || "Unknown agent" }}
            </div>
            <div class="d-flex flex-wrap align-center mt-1">
              <v-chip
                x-small
                label
                :color="statusColor(item.status)"
                text-color="white"
                class="font-weight-bold mr-2"
              >
                <v-icon left size="10">{{ statusIcon(item.status) }}</v-icon>
                {{ item.status | capitalize }}
              </v-chip>
              <v-chip v-if="item.language" x-small label outlined class="mr-2">
                <v-icon left size="10">$globe</v-icon>
                {{ item.language }}
              </v-chip>
              <a
                v-if="item.recordingUrl"
                :href="item.recordingUrl"
                target="_blank"
                rel="noopener"
                class="d-inline-flex align-center text-caption primary--text text-decoration-none"
              >
                <v-icon size="12" color="primary" class="mr-1"
                  >$headphones</v-icon
                >
                Recording
              </a>
            </div>
          </div>
        </div>

        <div class="d-flex align-center ml-auto mt-3 mt-sm-0">
          <div class="text-right mr-4">
            <div
              class="text-h6 font-weight-bold"
              :class="scoreText(item.qualityScore)"
            >
              {{ formatScore(item.qualityScore) }}
            </div>
            <div class="text-caption grey--text">Score</div>
          </div>
          <v-btn
            v-if="item.status === 'failed'"
            small
            outlined
            color="primary"
            :loading="retryingId === item._id"
            @click="retryCall(item._id)"
          >
            <v-icon left size="14">$refresh-cw</v-icon>
            Retry
          </v-btn>
          <v-btn
            v-else-if="item.status === 'completed'"
            small
            depressed
            color="primary"
            @click="viewReport(item)"
          >
            <v-icon left size="14">$file-text</v-icon>
            Report
          </v-btn>
          <v-btn
            v-else-if="item.status === 'processing'"
            small
            text
            color="grey darken-2"
            @click="viewReport(item)"
          >
            View details
          </v-btn>
        </div>
      </v-card>
    </template>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "completed", label: "Completed" },
  { value: "processing", label: "Processing" },
  { value: "failed", label: "Failed" },
];

export default {
  filters: {
    capitalize(value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },

  data() {
    return {
      calls: [],
      batchInfo: {
        averageQualityScore: 0,
        batchSummary: "",
        batchInsights: [],
      },
      loading: false,
      retryingId: null,
      STATUS_FILTERS,
      statusFilter: "all",
      search: "",
    };
  },

  computed: {
    insights() {
      return Array.isArray(this.batchInfo.batchInsights)
        ? this.batchInfo.batchInsights
        : [];
    },
    scoreValue() {
      const s = this.batchInfo.averageQualityScore;
      return typeof s === "number" ? s : 0;
    },
    tiles() {
      return [
        {
          label: "Calls",
          value: this.calls.length,
          icon: "$phone",
          tone: "blue",
        },
        {
          label: "Success rate",
          value: `${this.successRate}%`,
          icon: "$circle-check",
          tone: "green",
        },
        {
          label: "Failed",
          value: this.countFor("failed"),
          icon: "$circle-alert",
          tone: "red",
        },
      ];
    },
    filteredCalls() {
      const q = (this.search || "").trim().toLowerCase();
      return this.calls.filter(
        (c) =>
          (this.statusFilter === "all" || c.status === this.statusFilter) &&
          (!q || (c.agentName || "").toLowerCase().includes(q))
      );
    },
    successRate() {
      if (this.calls.length === 0) return 0;
      const completed = this.calls.filter(
        (call) => call.status === "completed"
      ).length;
      return Math.round((completed / this.calls.length) * 100);
    },
  },

  mounted() {
    this.fetchBatch();
  },

  methods: {
    countFor(status) {
      return status === "all"
        ? this.calls.length
        : this.calls.filter((c) => c.status === status).length;
    },

    initialOf(name) {
      return (name || "?").trim().charAt(0).toUpperCase() || "?";
    },

    formatScore(score) {
      return typeof score === "number" && score
        ? Math.round(score * 100) / 100
        : "—";
    },

    scoreText(score) {
      if (typeof score !== "number" || !score) return "grey--text";
      return score >= 4 ? "success--text" : "error--text";
    },

    statusColor(status) {
      const colorMap = {
        completed: "success",
        failed: "error",
        processing: "warning",
      };
      return colorMap[status] || "grey";
    },

    statusIcon(status) {
      const iconMap = {
        completed: "$circle-check",
        failed: "$circle-alert",
        processing: "$clock",
      };
      return iconMap[status] || "$circle-help";
    },

    async fetchBatch() {
      try {
        this.loading = true;
        const batchId = this.$route.params.id;

        const { data } = await apiClient.get(`/call-analysis/batch/${batchId}`);

        this.batchInfo = data.batch || {
          averageQualityScore: 0,
          batchSummary: "",
          batchInsights: [],
        };
        this.calls = data.calls || [];
      } catch (error) {
        console.error("Failed to fetch batch:", error);
      } finally {
        this.loading = false;
      }
    },

    async retryCall(callId) {
      try {
        this.retryingId = callId;
        await apiClient.post(`/call-analysis/retry/${callId}`);
        await this.fetchBatch();
      } catch (error) {
        console.error("Failed to retry call:", error);
      } finally {
        this.retryingId = null;
      }
    },

    viewReport(call) {
      this.$router.push(`/call-analysis/report/${call._id}`);
    },
  },
};
</script>
