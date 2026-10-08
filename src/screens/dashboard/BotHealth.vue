<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
          Bot health
        </h1>
        <div class="text-body-2 grey--text text--darken-1">
          How your bot's live replies went: errors, speed and AI cost.
        </div>
      </div>
      <v-spacer />
      <v-btn-toggle v-model="days" mandatory dense color="success" class="mb-2">
        <v-btn v-for="d in RANGES" :key="d" :value="d" small>
          {{ d === 1 ? "24 hours" : `${d} days` }}
        </v-btn>
      </v-btn-toggle>
    </div>

    <ThingsToKnow feature="bot-health" />

    <!-- OPEN ALERTS -->
    <v-alert
      v-for="a in openAlerts"
      :key="a._id"
      text
      color="error"
      rounded="lg"
      class="text-body-2 py-3"
    >
      <template #prepend>
        <v-avatar size="36" color="error" class="mr-3 flex-shrink-0">
          <v-icon size="18" color="white">$octagon-alert</v-icon>
        </v-avatar>
      </template>
      <div class="d-flex align-center flex-wrap">
        <div class="mr-4">
          <div class="font-weight-bold grey--text text--darken-4">
            {{ a.title }}
          </div>
          <div class="grey--text text--darken-2">
            Since {{ formatDate(a.openedAt) }}. We've emailed your alert
            addresses.
          </div>
        </div>
        <v-spacer />
        <v-btn small outlined color="error" class="my-1" :to="ALERTS_LINK">
          Change who gets alerts
        </v-btn>
      </div>
    </v-alert>

    <!-- RECENT ALERTS -->
    <v-card v-if="recentAlerts.length" outlined rounded="lg" class="mb-4">
      <div class="d-flex align-center flex-wrap px-5 py-3">
        <v-icon size="18" color="grey darken-2" class="mr-2">$history</v-icon>
        <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
          >Recent alerts</span
        >
        <v-spacer />
        <v-btn small text color="primary" :to="ALERTS_LINK"
          >Change who gets alerts</v-btn
        >
      </div>
      <v-divider />
      <template v-for="(a, i) in recentAlerts">
        <v-divider v-if="i > 0" :key="`d-${a._id}`" />
        <div :key="a._id" class="d-flex align-center flex-wrap px-5 py-3">
          <v-icon size="16" color="success" class="mr-3 flex-shrink-0"
            >$circle-check</v-icon
          >
          <div class="flex-grow-1 mr-3 overflow-hidden">
            <div class="text-body-2 grey--text text--darken-3 text-break">
              {{ a.title }}
            </div>
            <div class="text-caption grey--text text--darken-1">
              {{ formatDate(a.openedAt) }}
              <template v-if="a.resolvedAt">
                · lasted {{ duration(a.openedAt, a.resolvedAt) }}</template
              >
            </div>
          </div>
          <v-chip
            x-small
            label
            color="green lighten-5"
            text-color="success"
            class="font-weight-bold"
          >
            Resolved
          </v-chip>
        </div>
      </template>
    </v-card>

    <!-- TABS -->
    <v-tabs
      class="mb-4"
      v-model="view"
      color="primary"
      background-color="transparent"
      slider-size="3"
      height="44"
    >
      <v-tab tab-value="replies" class="text-body-2 font-weight-bold">
        <v-icon size="16" class="mr-2">$message-square-text</v-icon>
        Replies
      </v-tab>
      <v-tab tab-value="conversations" class="text-body-2 font-weight-bold">
        <v-icon size="16" class="mr-2">$messages-square</v-icon>
        Conversations
      </v-tab>
    </v-tabs>

    <ConversationReport v-if="view === 'conversations'" :days="days" />

    <div v-show="view === 'replies'">
      <!-- Loading -->
      <template v-if="statsLoading && !stats">
        <v-row dense class="mb-3">
          <v-col v-for="n in 5" :key="n" cols="6" sm="4" md>
            <v-card outlined rounded="lg" class="pa-3">
              <v-skeleton-loader type="list-item-avatar-two-line" />
            </v-card>
          </v-col>
        </v-row>
        <v-card outlined rounded="lg" class="pa-4">
          <v-skeleton-loader type="image" />
        </v-card>
      </template>

      <v-alert
        v-else-if="statsError"
        type="error"
        text
        rounded="lg"
        class="text-body-2"
      >
        <div class="d-flex align-center flex-wrap">
          <span class="mr-4">{{ statsError }}</span>
          <v-spacer />
          <v-btn small outlined color="error" @click="loadStats">
            <v-icon left size="14">$refresh-cw</v-icon>
            Retry
          </v-btn>
        </div>
      </v-alert>

      <v-card
        v-else-if="stats && !stats.replies"
        outlined
        rounded="lg"
        class="d-flex flex-column align-center text-center px-6 py-12"
      >
        <v-avatar color="green lighten-5" size="64" class="mb-4">
          <v-icon size="28" color="success">$activity</v-icon>
        </v-avatar>
        <div
          class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1"
        >
          No live replies in this period yet
        </div>
        <div class="text-body-2 grey--text text--darken-1">
          Try a longer range. Traces are kept for 30 days.
        </div>
      </v-card>

      <template v-else-if="stats">
        <!-- Tiles -->
        <v-row dense class="mb-3">
          <v-col v-for="t in tiles" :key="t.label" cols="6" sm="4" md>
            <v-card outlined rounded="lg" class="pa-4 fill-height">
              <div class="d-flex align-center mb-2">
                <v-avatar
                  size="32"
                  tile
                  :color="`${t.tone} lighten-5`"
                  class="rounded-lg mr-2 flex-shrink-0"
                >
                  <v-icon size="16" :color="t.tone">{{ t.icon }}</v-icon>
                </v-avatar>
                <span class="text-caption grey--text text--darken-1">{{
                  t.label
                }}</span>
              </div>
              <div
                class="text-h6 font-weight-bold"
                :class="t.color || 'grey--text text--darken-4'"
              >
                {{ t.value }}
              </div>
              <div v-if="t.hint" class="text-caption grey--text">
                {{ t.hint }}
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charts -->
        <v-row dense class="mb-3">
          <v-col cols="12" md="6">
            <v-card outlined rounded="lg" class="fill-height">
              <div
                class="px-4 pt-4 text-subtitle-2 font-weight-bold grey--text text--darken-4"
              >
                Replies and errors per day
              </div>
              <div class="px-2 pb-2">
                <apexchart
                  type="bar"
                  height="240"
                  :options="perDayOptions"
                  :series="perDaySeries"
                />
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card outlined rounded="lg" class="fill-height">
              <div
                class="px-4 pt-4 text-subtitle-2 font-weight-bold grey--text text--darken-4"
              >
                By channel
              </div>
              <div class="px-2 pb-2">
                <apexchart
                  v-if="channelSeries.some((n) => n > 0)"
                  type="donut"
                  height="240"
                  :options="channelOptions"
                  :series="channelSeries"
                />
                <div v-else class="text-center text-body-2 grey--text py-12">
                  No replies.
                </div>
              </div>
            </v-card>
          </v-col>
          <v-col cols="12" sm="6" md="3">
            <v-card outlined rounded="lg" class="fill-height">
              <div
                class="px-4 pt-4 text-subtitle-2 font-weight-bold grey--text text--darken-4"
              >
                Product lookups
              </div>
              <div class="px-2 pb-2">
                <apexchart
                  v-if="lookupSeries[0].data.length"
                  type="bar"
                  height="240"
                  :options="lookupOptions"
                  :series="lookupSeries"
                />
                <div v-else class="text-center text-body-2 grey--text py-12">
                  No product lookups.
                </div>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <!-- Problems -->
      <v-card v-if="stats && stats.replies" outlined rounded="lg">
        <div class="d-flex align-center flex-wrap px-5 py-4">
          <div class="mr-4">
            <div
              class="text-subtitle-1 font-weight-bold grey--text text--darken-4"
            >
              Problems
              <v-chip
                v-if="problemsTotal"
                x-small
                label
                color="red lighten-5"
                text-color="error"
                class="font-weight-bold ml-1"
              >
                {{ problemsTotal }}
              </v-chip>
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              Errors and handoffs. After an error the customer may not have
              received a proper answer, so open the chat.
            </div>
          </div>
        </div>
        <v-divider />

        <div v-if="problemsLoading" class="pa-4">
          <v-skeleton-loader
            type="list-item-avatar-two-line, list-item-avatar-two-line, list-item-avatar-two-line"
          />
        </div>
        <v-alert
          v-else-if="problemsError"
          type="error"
          text
          dense
          rounded="lg"
          class="ma-5 text-body-2"
        >
          {{ problemsError }}
        </v-alert>
        <div
          v-else-if="!problems.length"
          class="d-flex flex-column align-center text-center py-10"
        >
          <v-avatar color="green lighten-5" size="56" class="mb-3">
            <v-icon size="24" color="success">$circle-check</v-icon>
          </v-avatar>
          <div class="text-body-2 font-weight-bold grey--text text--darken-3">
            No errors or handoffs in this period
          </div>
        </div>
        <template v-else>
          <template v-for="(p, i) in problems">
            <v-divider v-if="i > 0" :key="`d-${p._id}`" />
            <div :key="p._id" class="d-flex flex-wrap align-center px-5 py-3">
              <div class="d-flex align-start flex-grow-1 mr-4 overflow-hidden">
                <v-avatar
                  size="36"
                  tile
                  class="rounded-lg mr-3 flex-shrink-0"
                  :color="`${statusInfo(p.status).color} lighten-5`"
                >
                  <v-icon size="18" :color="statusInfo(p.status).color">
                    {{ p.status === "error" ? "$circle-alert" : "$headset" }}
                  </v-icon>
                </v-avatar>
                <div class="overflow-hidden">
                  <div
                    class="text-body-2 font-weight-bold grey--text text--darken-4 text-truncate"
                    :title="p.customerText"
                  >
                    "{{ p.customerText }}"
                  </div>
                  <div class="d-flex flex-wrap align-center mt-1">
                    <v-chip
                      x-small
                      label
                      dark
                      :color="statusInfo(p.status).color"
                      class="font-weight-bold mr-2"
                    >
                      {{ statusInfo(p.status).label }}
                    </v-chip>
                    <v-chip x-small label outlined class="mr-2">
                      <v-icon left size="10">{{
                        p.platform === "whatsapp" ? "$whatsapp" : "$globe"
                      }}</v-icon>
                      {{ PLATFORMS[p.platform] || p.platform }}
                    </v-chip>
                    <span class="text-caption grey--text text--darken-1">{{
                      formatDate(p.createdAt)
                    }}</span>
                  </div>
                  <div
                    v-if="p.error"
                    class="text-caption error--text text-truncate mt-1"
                    :title="p.error"
                  >
                    {{ p.error }}
                  </div>
                </div>
              </div>
              <div class="d-flex align-center ml-auto my-1">
                <v-btn
                  v-if="p.chatId"
                  small
                  text
                  color="grey darken-2"
                  :to="`/dashboard/chat/${p.chatId}`"
                >
                  <v-icon left size="14">$message-square</v-icon>
                  Open chat
                </v-btn>
                <v-btn
                  small
                  depressed
                  color="green lighten-5"
                  class="green--text text--darken-2 ml-2"
                  @click="openTraceId = p._id"
                >
                  <v-icon left size="14">$route</v-icon>
                  Why this answer
                </v-btn>
              </div>
            </div>
          </template>
          <template v-if="pageCount > 1">
            <v-divider />
            <div class="d-flex justify-center py-3">
              <v-pagination
                v-model="page"
                :length="pageCount"
                total-visible="7"
                color="success"
              />
            </div>
          </template>
        </template>
      </v-card>
    </div>

    <!-- TRACE OF ONE PROBLEM -->
    <v-dialog
      :value="!!openTraceId"
      max-width="760"
      scrollable
      @input="openTraceId = null"
    >
      <v-card v-if="openTraceId" rounded="lg">
        <v-card-title class="d-flex align-center">
          <v-avatar
            size="32"
            tile
            color="green lighten-5"
            class="rounded-lg mr-3"
          >
            <v-icon size="16" color="green darken-1">$route</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-bold">Why this answer</span>
          <v-spacer />
          <v-btn icon aria-label="Close" @click="openTraceId = null">
            <v-icon>$x</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider />
        <v-card-text class="pt-4">
          <TraceDetails :trace-id="openTraceId" show-messages />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-6 py-3">
          <v-spacer />
          <v-btn text @click="openTraceId = null">Close</v-btn>
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

// Where alert emails are set
const ALERTS_LINK = "/dashboard/integration?section=webhooks&tab=escalate";

export default {
  name: "BotHealth",

  components: {
    apexchart: VueApexCharts,
    ThingsToKnow,
    TraceDetails,
    ConversationReport,
  },

  data() {
    return {
      ALERTS_LINK,
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
        {
          label: "Replies",
          value: s.replies,
          icon: "$messages-square",
          tone: "indigo",
        },
        {
          label: "Error rate",
          value: `${s.errorRate ?? 0}%`,
          hint: `${s.errors || 0} ${s.errors === 1 ? "error" : "errors"}`,
          color: s.errors ? "error--text" : "",
          icon: "$circle-alert",
          tone: s.errors ? "red" : "green",
        },
        {
          label: "AI answer time",
          value: seconds(latency.p50),
          hint: `median · slowest 5%: ${seconds(latency.p95)}`,
          icon: "$clock",
          tone: "blue",
        },
        {
          label: "Estimated AI cost",
          value: formatCost(s.costUsd),
          hint: "estimate, USD",
          icon: "$chart-column",
          tone: "teal",
        },
        {
          label: '"Let me check" sent',
          value: s.holdingMessages || 0,
          icon: "$message-circle-more",
          tone: "amber",
        },
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
      return Object.entries(this.stats?.productLookup || {}).filter(
        ([, n]) => n > 0
      );
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
          categories: this.lookupEntries.map(([mode]) =>
            productLookupLabel(mode)
          ),
          labels: { formatter: (v) => Math.round(v) },
        },
      };
    },

    pageCount() {
      return Math.ceil(this.problemsTotal / PAGE_SIZE);
    },

    since() {
      return (
        this.stats?.since ||
        new Date(Date.now() - this.days * 86400000).toISOString()
      );
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
