<template>
  <div class="bot-health-page">
    <!-- Header -->
    <div class="d-flex align-center flex-wrap mb-6">
      <v-avatar size="48" rounded="xl" color="#e0f2fe" class="mr-4">
        <v-icon color="black">$activity</v-icon>
      </v-avatar>
      <div class="mr-6">
        <div class="text-h5 font-weight-bold">Bot health</div>
        <div class="text-body-2 grey--text text--darken-1">
          How your bot's live replies went: errors, speed, and AI cost.
        </div>
      </div>
      <v-spacer />
      <v-btn-toggle
        v-model="days"
        mandatory
        dense
        rounded
        color="primary"
        class="my-1"
      >
        <v-btn v-for="d in RANGES" :key="d" :value="d" small class="text-none">
          {{ d === 1 ? "24 hours" : `${d} days` }}
        </v-btn>
      </v-btn-toggle>
    </div>

    <ThingsToKnow feature="bot-health" />

    <!-- Alerts: open ones as banners, recent ones as a list -->
    <v-alert
      v-for="a in openAlerts"
      :key="a._id"
      type="error"
      prominent
      rounded="xl"
      class="mb-4"
    >
      <div class="font-weight-bold">{{ a.title }}</div>
      <div class="text-body-2">
        Since {{ formatDate(a.openedAt) }}. We've emailed your alert addresses.
        <router-link to="/dashboard/integration?section=webhooks&tab=escalate" class="white--text">
          Change who gets alerts
        </router-link>
      </div>
    </v-alert>

    <v-card v-if="recentAlerts.length" outlined rounded="xl" class="pa-6 mb-6">
      <div class="d-flex align-center mb-2">
        <div class="text-subtitle-1 font-weight-bold">Recent alerts</div>
        <v-spacer />
        <v-btn
          small
          text
          rounded
          color="primary"
          class="text-none"
          to="/dashboard/integration?section=webhooks&tab=escalate"
        >
          Change who gets alerts
        </v-btn>
      </div>
      <div v-for="a in recentAlerts" :key="a._id" class="d-flex align-start py-1 grey--text text--darken-1">
        <v-icon x-small color="grey" class="mr-2 mt-1">$circle-check</v-icon>
        <div class="text-body-2">
          {{ a.title }}
          <span class="text-caption">
            · {{ formatDate(a.openedAt) }}
            <template v-if="a.resolvedAt">· lasted {{ duration(a.openedAt, a.resolvedAt) }}</template>
          </span>
        </div>
      </div>
    </v-card>

    <v-tabs v-model="view" color="primary" class="health-tabs mb-6">
      <v-tab tab-value="replies" class="text-none">Replies</v-tab>
      <v-tab tab-value="conversations" class="text-none">Conversations</v-tab>
    </v-tabs>

    <ConversationReport v-if="view === 'conversations'" :days="days" />

    <div v-show="view === 'replies'">
      <v-card v-if="statsLoading && !stats" outlined rounded="xl" class="pa-6">
        <v-progress-linear indeterminate color="primary" />
      </v-card>

      <v-alert v-else-if="statsError" type="error" outlined rounded="xl">
        {{ statsError }}
        <v-btn small text color="error" class="ml-2" @click="loadStats">Retry</v-btn>
      </v-alert>

      <v-card
        v-else-if="stats && !stats.replies"
        outlined
        rounded="xl"
        class="pa-10 text-center grey--text text--darken-1"
      >
        <v-icon large color="grey lighten-1">$activity</v-icon>
        <div class="mt-2">
          No live replies in this period yet. Traces are kept for 30 days.
        </div>
      </v-card>

      <template v-else-if="stats">
        <!-- Tiles -->
        <v-row class="mb-2">
          <v-col v-for="t in tiles" :key="t.label" cols="6" sm="4" md>
            <v-card outlined rounded="xl" class="pa-4 fill-height">
              <div class="text-caption grey--text text--darken-1">{{ t.label }}</div>
              <div :class="['text-h5 font-weight-bold', t.color]">{{ t.value }}</div>
              <div v-if="t.hint" class="text-caption grey--text">{{ t.hint }}</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charts -->
        <v-row class="mb-2">
          <v-col cols="12" md="6">
            <v-card outlined rounded="xl" class="pa-4 fill-height">
              <div class="text-subtitle-2 font-weight-bold mb-2">Replies and errors per day</div>
              <apexchart type="bar" height="240" :options="perDayOptions" :series="perDaySeries" />
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card outlined rounded="xl" class="pa-4 fill-height">
              <div class="text-subtitle-2 font-weight-bold mb-2">By channel</div>
              <apexchart
                v-if="channelSeries.some((n) => n > 0)"
                type="donut"
                height="240"
                :options="channelOptions"
                :series="channelSeries"
              />
              <div v-else class="text-body-2 grey--text">No replies.</div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card outlined rounded="xl" class="pa-4 fill-height">
              <div class="text-subtitle-2 font-weight-bold mb-2">Product lookups</div>
              <apexchart
                v-if="lookupSeries[0].data.length"
                type="bar"
                height="240"
                :options="lookupOptions"
                :series="lookupSeries"
              />
              <div v-else class="text-body-2 grey--text">No product lookups.</div>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <!-- Problems -->
      <v-card v-if="stats && stats.replies" outlined rounded="xl" class="pa-6">
        <div class="d-flex align-center mb-1">
          <div class="text-subtitle-1 font-weight-bold">Problems</div>
          <v-spacer />
          <span v-if="problemsTotal" class="text-caption grey--text">
            {{ problemsTotal }} in this period
          </span>
        </div>
        <div class="text-body-2 grey--text text--darken-1 mb-4">
          Errors and handoffs. After an error the customer may not have received
          a proper answer, so open the chat.
        </div>

        <v-progress-linear v-if="problemsLoading" indeterminate color="primary" />
        <v-alert v-else-if="problemsError" type="error" text dense rounded="lg" class="text-body-2 mb-0">
          {{ problemsError }}
        </v-alert>
        <div v-else-if="!problems.length" class="text-body-2 grey--text">
          No errors or handoffs in this period.
        </div>
        <template v-else>
          <v-simple-table dense>
            <thead>
              <tr>
                <th>Time</th>
                <th>Channel</th>
                <th>Customer message</th>
                <th>What happened</th>
                <th class="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in problems" :key="p._id">
                <td class="text-no-wrap">{{ formatDate(p.createdAt) }}</td>
                <td>{{ PLATFORMS[p.platform] || p.platform }}</td>
                <td class="message-cell" :title="p.customerText">{{ p.customerText }}</td>
                <td class="problem-cell">
                  <v-chip x-small dark :color="statusInfo(p.status).color" class="mr-1">
                    {{ statusInfo(p.status).label }}
                  </v-chip>
                  <span v-if="p.error" class="text-caption" :title="p.error">{{ p.error }}</span>
                </td>
                <td class="text-right text-no-wrap">
                  <v-btn
                    v-if="p.chatId"
                    small
                    text
                    rounded
                    class="text-none"
                    :to="`/dashboard/chat/${p.chatId}`"
                  >
                    Open chat
                  </v-btn>
                  <v-btn small text rounded color="primary" class="text-none" @click="openTraceId = p._id">
                    Why this answer
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
          <div v-if="pageCount > 1" class="d-flex justify-center mt-4">
            <v-pagination v-model="page" :length="pageCount" total-visible="7" />
          </div>
        </template>
      </v-card>
    </div>

    <!-- Trace of one problem -->
    <v-dialog :value="!!openTraceId" max-width="720" scrollable @input="openTraceId = null">
      <v-card v-if="openTraceId" rounded="xl">
        <v-card-title class="text-h6">Why this answer</v-card-title>
        <v-card-text>
          <TraceDetails :trace-id="openTraceId" show-messages />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" @click="openTraceId = null">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import VueApexCharts from "vue-apexcharts";
import apiClient from "@/service/axios";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import TraceDetails from "@/components/traces/TraceDetails.vue";
import ConversationReport from "@/components/chats/ConversationReport.vue";
import { apiError, formatDate } from "@/utils/knowledge";
import {
  TRACES_API,
  PLATFORMS,
  statusInfo,
  formatCost,
  formatSeconds as seconds,
  formatDuration,
  productLookupLabel,
} from "@/utils/traces";

const RANGES = [1, 7, 30];
const PAGE_SIZE = 20;

export default {
  name: "BotHealth",

  components: { apexchart: VueApexCharts, ThingsToKnow, TraceDetails, ConversationReport },

  data() {
    return {
      RANGES,
      PLATFORMS,
      days: 7,
      view: "replies",

      stats: null,
      statsLoading: false,
      statsError: "",

      problems: [],
      problemsTotal: 0,
      problemsLoading: false,
      problemsError: "",
      page: 1,

      openTraceId: null,

      alerts: [],
    };
  },

  computed: {
    openAlerts() {
      return this.alerts.filter((a) => a.status === "open");
    },

    recentAlerts() {
      return this.alerts.filter((a) => a.status !== "open");
    },

    tiles() {
      const s = this.stats;
      const latency = s.aiLatencyMs || {};
      return [
        { label: "Replies", value: s.replies },
        {
          label: "Error rate",
          value: `${s.errorRate ?? 0}%`,
          hint: `${s.errors || 0} ${s.errors === 1 ? "error" : "errors"}`,
          color: s.errors ? "error--text" : "",
        },
        {
          label: "AI answer time",
          value: seconds(latency.p50),
          hint: `median · slowest 5%: ${seconds(latency.p95)}`,
        },
        {
          label: "Estimated AI cost",
          value: formatCost(s.costUsd),
          hint: "estimate, USD",
        },
        { label: '"Let me check" sent', value: s.holdingMessages || 0 },
      ];
    },

    perDaySeries() {
      const rows = this.stats?.perDay || [];
      return [
        { name: "Replies", data: rows.map((r) => r.replies) },
        { name: "Errors", data: rows.map((r) => r.errors) },
      ];
    },

    perDayOptions() {
      return {
        chart: { toolbar: { show: false }, fontFamily: "inherit" },
        colors: ["#3f51b5", "#e53935"],
        dataLabels: { enabled: false },
        legend: { position: "top" },
        plotOptions: { bar: { columnWidth: "60%", borderRadius: 3 } },
        xaxis: {
          categories: (this.stats?.perDay || []).map((r) => r.day.slice(5)),
        },
        yaxis: { labels: { formatter: (v) => Math.round(v) } },
      };
    },

    channelSeries() {
      const p = this.stats?.byPlatform || {};
      return [p.web || 0, p.whatsapp || 0];
    },

    channelOptions() {
      return {
        labels: [PLATFORMS.web, PLATFORMS.whatsapp],
        colors: ["#3f51b5", "#25d366"],
        legend: { position: "bottom" },
        chart: { fontFamily: "inherit" },
      };
    },

    lookupEntries() {
      return Object.entries(this.stats?.productLookup || {}).filter(([, n]) => n > 0);
    },

    lookupSeries() {
      return [{ name: "Lookups", data: this.lookupEntries.map(([, n]) => n) }];
    },

    lookupOptions() {
      return {
        chart: { toolbar: { show: false }, fontFamily: "inherit" },
        colors: ["#009688"],
        dataLabels: { enabled: false },
        plotOptions: { bar: { horizontal: true, borderRadius: 3 } },
        xaxis: {
          categories: this.lookupEntries.map(([mode]) => productLookupLabel(mode)),
          labels: { formatter: (v) => Math.round(v) },
        },
      };
    },

    pageCount() {
      return Math.ceil(this.problemsTotal / PAGE_SIZE);
    },

    since() {
      return this.stats?.since || new Date(Date.now() - this.days * 86400000).toISOString();
    },
  },

  watch: {
    days: { immediate: true, handler: "reload" },
    page: "loadProblems",
  },

  created() {
    this.loadAlerts();
  },

  methods: {
    formatDate,
    statusInfo,
    duration: formatDuration,

    // Not tied to the range: open alerts first, then the last 7 days'
    async loadAlerts() {
      try {
        const { data } = await apiClient.get(`${TRACES_API}/alerts`);
        this.alerts = Array.isArray(data.data) ? data.data : [];
      } catch {
        this.alerts = [];
      }
    },

    async reload() {
      await this.loadStats();
      if (this.page !== 1) this.page = 1; // the watcher reloads problems
      else this.loadProblems();
    },

    async loadStats() {
      this.statsLoading = true;
      this.statsError = "";
      try {
        const { data } = await apiClient.get(`${TRACES_API}/stats`, {
          params: { days: this.days },
        });
        this.stats = data.data;
      } catch (err) {
        this.stats = null;
        this.statsError = apiError(err, "Failed to load bot health");
      } finally {
        this.statsLoading = false;
      }
    },

    async loadProblems() {
      if (!this.stats?.replies) return;
      this.problemsLoading = true;
      this.problemsError = "";
      try {
        const { data } = await apiClient.get(TRACES_API, {
          params: {
            status: "error,handoff",
            from: this.since,
            limit: PAGE_SIZE,
            offset: (this.page - 1) * PAGE_SIZE,
          },
        });
        this.problems = data.data?.traces || [];
        this.problemsTotal = data.data?.total || 0;
      } catch (err) {
        this.problems = [];
        this.problemsError = apiError(err, "Failed to load problems");
      } finally {
        this.problemsLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.health-tabs {
  border-bottom: 1px solid #e0e0e0;
}
.message-cell {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.problem-cell {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
