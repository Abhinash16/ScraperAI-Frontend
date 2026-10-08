<template>
  <div>
    <v-card v-if="loading && !stats" outlined rounded="lg" class="pa-6">
      <v-progress-linear indeterminate color="primary" />
    </v-card>

    <v-alert v-else-if="error" type="error" outlined rounded="lg">
      {{ error }}
      <v-btn small text color="error" class="ml-2" @click="loadStats">Retry</v-btn>
    </v-alert>

    <v-card
      v-else-if="stats && !stats.closed"
      outlined
      rounded="lg"
      class="pa-10 text-center grey--text text--darken-1"
    >
      <v-icon large color="grey lighten-1">$messages-square</v-icon>
      <div class="mt-2">
        No conversations ended in this period yet.
        <template v-if="stats.openNow">{{ stats.openNow }} are open now.</template>
      </div>
    </v-card>

    <template v-else-if="stats">
      <!-- Tiles -->
      <v-row class="mb-2">
        <v-col v-for="t in tiles" :key="t.label" cols="6" sm="4" md>
          <v-card outlined rounded="lg" class="pa-4 fill-height">
            <div class="text-caption grey--text text--darken-1">{{ t.label }}</div>
            <div :class="['text-h5 font-weight-bold', t.color]">{{ t.value }}</div>
            <div v-if="t.hint" class="text-caption grey--text">{{ t.hint }}</div>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mb-2">
        <v-col cols="12" md="7">
          <v-card outlined rounded="lg" class="pa-4 fill-height">
            <div class="text-subtitle-2 font-weight-bold mb-2">How conversations ended, per day</div>
            <apexchart type="bar" height="260" :options="perDayOptions" :series="perDaySeries" />
          </v-card>
        </v-col>
        <v-col cols="12" md="5">
          <v-card outlined rounded="lg" class="pa-4 fill-height">
            <div class="text-subtitle-2 font-weight-bold mb-3">By channel</div>
            <v-simple-table dense class="mb-4">
              <thead>
                <tr>
                  <th />
                  <th class="text-right">Ended</th>
                  <th class="text-right">Resolved by the bot</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in platforms" :key="p.id">
                  <td>{{ p.label }}</td>
                  <td class="text-right">{{ p.closed }}</td>
                  <td class="text-right">{{ p.closed ? `${p.rate}%` : "—" }}</td>
                </tr>
              </tbody>
            </v-simple-table>

            <div class="text-subtitle-2 font-weight-bold mb-2">What customers talked about</div>
            <div v-if="topics.length">
              <v-chip v-for="t in topics" :key="t.topic" small outlined class="mr-1 mb-1">
                {{ t.topic }}
                <span class="grey--text ml-1">{{ t.count }}</span>
              </v-chip>
            </div>
            <div v-else class="text-body-2 grey--text">No topics yet.</div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Conversations list -->
    <v-card v-if="stats" outlined rounded="lg" class="pa-6">
      <div class="d-flex align-center flex-wrap mb-1">
        <div class="text-subtitle-1 font-weight-bold mr-4">Conversations</div>
        <v-btn-toggle v-model="filter" mandatory dense rounded color="primary" class="my-1">
          <v-btn v-for="f in FILTERS" :key="f.value" :value="f.value" small class="text-none">
            {{ f.label }}
          </v-btn>
        </v-btn-toggle>
        <v-spacer />
        <span v-if="total" class="text-caption grey--text">{{ total }} in this period</span>
      </div>
      <div class="text-body-2 grey--text text--darken-1 mb-4">
        {{ FILTERS.find((f) => f.value === filter).help }}
      </div>

      <v-progress-linear v-if="listLoading" indeterminate color="primary" />
      <v-alert v-else-if="listError" type="error" text dense rounded="lg" class="text-body-2 mb-0">
        {{ listError }}
      </v-alert>
      <div v-else-if="!conversations.length" class="text-body-2 grey--text">
        Nothing here for this period.
      </div>
      <template v-else>
        <div v-for="c in conversations" :key="c._id" class="conv-item py-3">
          <div class="d-flex align-center flex-wrap">
            <v-chip x-small outlined :color="outcomeOf(c).color" class="mr-2">{{ outcomeOf(c).label }}</v-chip>
            <span class="text-caption grey--text mr-2">
              {{ PLATFORMS[c.platform] || c.platform }} · {{ formatStart(c.startedAt) }}
              <template v-if="duration(c)"> · {{ duration(c) }}</template>
            </span>
            <v-spacer />
            <v-btn small text rounded color="primary" class="text-none" :to="`/dashboard/chat/${c.chatId}`">
              Open chat
            </v-btn>
          </div>
          <div v-if="c.summary" class="text-body-2 mt-1">{{ c.summary }}</div>
          <div v-if="c.topics && c.topics.length" class="mt-1">
            <v-chip v-for="t in c.topics" :key="t" x-small class="mr-1">{{ t }}</v-chip>
          </div>
        </div>
        <div v-if="pageCount > 1" class="d-flex justify-center mt-4">
          <v-pagination v-model="page" :length="pageCount" total-visible="7" />
        </div>
      </template>
    </v-card>
  </div>
</template>

<script>
import VueApexCharts from "vue-apexcharts";
import apiClient from "@/service/axios";
import { apiError } from "@/utils/knowledge";
import { PLATFORMS } from "@/utils/traces";
import { OUTCOMES, formatDuration, formatStart } from "@/utils/conversations";

const PAGE_SIZE = 20;
const OUTCOME_ORDER = ["ai", "agent", "handed_off", "no_reply"];
const OUTCOME_COLORS = { ai: "#3f51b5", agent: "#43a047", handed_off: "#fb8c00", no_reply: "#f9a825" };

const FILTERS = [
  {
    value: "attention",
    label: "Needs a look",
    outcome: "no_reply,handed_off",
    help: "Conversations where nobody replied, or the bot handed over and nobody from your team replied.",
  },
  { value: "all", label: "All", outcome: undefined, help: "Every conversation that has ended, by when it started." },
];

const pct = (v) => (typeof v === "number" ? `${v}%` : "—");

// Conversations that ended in the last `days`: outcome rates, per-day chart,
// channels, topics, and a list (Needs a look by default).
export default {
  name: "ConversationReport",

  components: { apexchart: VueApexCharts },

  props: {
    days: { type: Number, required: true },
  },

  data: () => ({
    FILTERS,
    PLATFORMS,
    stats: null,
    loading: false,
    error: "",
    filter: "attention",
    conversations: [],
    total: 0,
    page: 1,
    listLoading: false,
    listError: "",
  }),

  computed: {
    tiles() {
      const s = this.stats;
      const avg = s.averages || {};
      return [
        { label: "Resolved by the bot", value: pct(s.aiResolutionRate), hint: "ended without a person or a handoff" },
        { label: "Handed to your team", value: pct(s.handoffRate) },
        {
          label: "No reply sent",
          value: pct(s.noReplyRate),
          color: s.noReplyRate > 0 ? "amber--text text--darken-3" : "",
        },
        { label: "Conversations ended", value: s.closed, hint: `${s.openNow || 0} open now` },
        {
          label: "Average conversation",
          value: avg.messages != null ? `${avg.messages} messages` : "—",
          hint: avg.activeMinutes != null ? `${avg.activeMinutes} min active` : "",
        },
      ];
    },

    perDaySeries() {
      const rows = this.stats?.perDay || [];
      return OUTCOME_ORDER.map((o) => ({ name: OUTCOMES[o].label, data: rows.map((r) => r[o] || 0) }));
    },

    perDayOptions() {
      return {
        chart: { stacked: true, toolbar: { show: false }, fontFamily: "inherit" },
        colors: OUTCOME_ORDER.map((o) => OUTCOME_COLORS[o]),
        dataLabels: { enabled: false },
        legend: { position: "top" },
        plotOptions: { bar: { columnWidth: "60%", borderRadius: 2 } },
        xaxis: { categories: (this.stats?.perDay || []).map((r) => r.day.slice(5)) },
        yaxis: { labels: { formatter: (v) => Math.round(v) } },
      };
    },

    platforms() {
      const by = this.stats?.byPlatform || {};
      return Object.keys(PLATFORMS).map((id) => ({
        id,
        label: PLATFORMS[id],
        closed: by[id]?.closed || 0,
        rate: by[id]?.aiResolutionRate ?? 0,
      }));
    },

    topics() {
      return (this.stats?.topTopics || []).slice(0, 20);
    },

    pageCount() {
      return Math.ceil(this.total / PAGE_SIZE);
    },
  },

  watch: {
    days: { immediate: true, handler: "reload" },
    filter() {
      this.resetPage();
    },
    page: "loadList",
  },

  methods: {
    formatStart,
    duration: formatDuration,
    outcomeOf: (c) => OUTCOMES[c.outcome] || { label: c.outcome || "Open", color: "grey" },

    async reload() {
      await this.loadStats();
      this.resetPage();
    },

    resetPage() {
      if (this.page !== 1) this.page = 1;
      else this.loadList();
    },

    async loadStats() {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await apiClient.get("/conversations/stats", { params: { days: this.days } });
        this.stats = data.data;
      } catch (err) {
        this.stats = null;
        this.error = apiError(err, "Failed to load the conversation report");
      } finally {
        this.loading = false;
      }
    },

    async loadList() {
      if (!this.stats) return;
      this.listLoading = true;
      this.listError = "";
      try {
        const f = FILTERS.find((x) => x.value === this.filter);
        const { data } = await apiClient.get("/conversations", {
          params: {
            outcome: f.outcome,
            // Ended ones only, like the report
            status: "closed",
            from: this.stats.since,
            limit: PAGE_SIZE,
            offset: (this.page - 1) * PAGE_SIZE,
          },
        });
        this.conversations = data.data?.conversations || [];
        this.total = data.data?.total || 0;
      } catch (err) {
        this.conversations = [];
        this.listError = apiError(err, "Failed to load conversations");
      } finally {
        this.listLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.conv-item {
  border-bottom: 1px solid #eef1f7;
}
.conv-item:last-of-type {
  border-bottom: none;
}
</style>
