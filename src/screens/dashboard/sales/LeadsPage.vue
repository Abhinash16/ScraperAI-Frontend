<template>
  <div>
    <ThingsToKnow feature="leads" />

    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Leads</h1>
        <div class="text-body-2 grey--text text--darken-1">
          With sales mode on, the bot scores every conversation by how close the customer is to
          buying. Hottest first.
        </div>
      </div>
      <v-spacer />
      <v-btn text color="primary" class="mb-2" :loading="loading" @click="load">
        <v-icon left size="16">$refresh-cw</v-icon>
        Refresh
      </v-btn>
    </div>

    <!-- FILTERS -->
    <div class="d-flex flex-wrap align-center mb-2">
      <v-chip-group v-model="filters.stage" multiple column active-class="primary--text" @change="applyFilters">
        <v-chip
          v-for="s in stageChips"
          :key="s.value"
          :value="s.value"
          small
          filter
          outlined
          :title="s.help"
        >
          {{ s.label }}
        </v-chip>
      </v-chip-group>
    </div>
    <v-row dense class="mb-2">
      <v-col cols="12" sm="4">
        <v-select
          v-model="filters.days"
          :items="DAY_CHOICES"
          label="Last active"
          outlined
          dense
          hide-details
          @change="applyFilters"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="filters.platform"
          :items="platformItems"
          label="Channel"
          outlined
          dense
          clearable
          hide-details
          @change="applyFilters"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="filters.minScore"
          :items="SCORE_CHOICES"
          label="Score"
          outlined
          dense
          hide-details
          @change="applyFilters"
        />
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" text rounded="lg">{{ error }}</v-alert>

    <v-card outlined rounded="lg">
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        :server-items-length="total"
        :options.sync="options"
        :footer-props="{ 'items-per-page-options': [25, 50, 100] }"
        item-key="_id"
        disable-sort
        class="leads-table"
      >
        <template #no-data>
          <div class="py-8 text-body-2 grey--text text--darken-1">
            No leads in this period.
            <template v-if="canManageSettings">
              Leads appear once
              <router-link to="/dashboard/bot-profile?tab=sales">sales mode</router-link>
              is switched on and published.
            </template>
          </div>
        </template>

        <template #[`item.lead`]="{ item }">
          <div class="d-flex align-center text-no-wrap">
            <v-chip x-small label :color="stage(item).color" text-color="white" class="font-weight-bold">
              {{ stage(item).label }}
            </v-chip>
            <v-chip
              x-small
              label
              outlined
              :color="scoreColor(score(item))"
              class="font-weight-bold ml-1"
              :title="`Lead score ${score(item)} out of 100`"
            >
              {{ score(item) }}
            </v-chip>
            <v-icon
              v-if="item.lead && item.lead.hotAt"
              size="16"
              color="deep-orange"
              class="ml-1"
              :title="`Turned hot ${formatDate(item.lead.hotAt)}`"
            >
              $flame
            </v-icon>
          </div>
        </template>

        <template #[`item.customer`]="{ item }">
          <div class="text-body-2 text-no-wrap">{{ item.phone || "Not known" }}</div>
          <div class="text-caption grey--text text-no-wrap">
            <v-icon size="12" :color="channelInfo(item.platform).color" class="mr-1">
              {{ channelInfo(item.platform).icon }}
            </v-icon>
            {{ channelInfo(item.platform).label }}
          </div>
        </template>

        <template #[`item.wants`]="{ item }">
          <div class="text-body-2">{{ leadWants(item.lead) || "—" }}</div>
          <div v-if="item.summary" class="text-caption grey--text text--darken-1 summary">{{ item.summary }}</div>
        </template>

        <template #[`item.nextStep`]="{ item }">
          <span class="text-body-2">{{ (item.lead && item.lead.nextStep) || "—" }}</span>
          <div v-if="item.lead && item.lead.linkSentAt" class="text-caption grey--text">
            Link sent<template v-if="item.lead.linkAmount"> · {{ formatMoney(item.lead.linkAmount) }}</template>
          </div>
        </template>

        <template #[`item.lastActivityAt`]="{ item }">
          <span class="text-no-wrap">{{ formatDate(item.lastActivityAt) }}</span>
          <div class="text-caption grey--text">{{ item.open ? "Ongoing" : "Ended" }}</div>
        </template>

        <template #[`item.open`]="{ item }">
          <v-btn
            small
            text
            color="primary"
            :to="`/dashboard/chat/${encodeURIComponent(item.chatId)}`"
          >
            Open chat
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import { apiError, can, formatDate, loadMyPermissions } from "@/utils/knowledge";
import { channelInfo } from "@/utils/actions";
import {
  PLATFORMS,
  STAGES,
  formatMoney,
  leadWants,
  listLeads,
  scoreColor,
  stageInfo,
} from "@/utils/leads";

const DAY_CHOICES = [
  { value: 7, text: "Last 7 days" },
  { value: 30, text: "Last 30 days" },
  { value: 90, text: "Last 90 days" },
];

const SCORE_CHOICES = [
  { value: 0, text: "Any score" },
  { value: 40, text: "40 and up" },
  { value: 70, text: "70 and up (hot by default)" },
  { value: 90, text: "90 and up" },
];

const fromQuery = (q) => ({
  stage: q.stage ? String(q.stage).split(",") : [],
  platform: q.platform || null,
  days: Number(q.days) || 30,
  minScore: Number(q.minScore) || 0,
});

export default {
  name: "LeadsPage",

  components: { ThingsToKnow },

  data() {
    return {
      DAY_CHOICES,
      SCORE_CHOICES,
      items: [],
      total: 0,
      loading: false,
      error: "",
      perms: null,
      filters: fromQuery(this.$route.query),
      options: { page: 1, itemsPerPage: 25 },
      headers: [
        { text: "Lead", value: "lead" },
        { text: "Customer", value: "customer" },
        { text: "What they want", value: "wants" },
        { text: "Next step", value: "nextStep" },
        { text: "Last active", value: "lastActivityAt" },
        { text: "", value: "open", align: "end" },
      ],
    };
  },

  computed: {
    stageChips() {
      return Object.entries(STAGES).map(([value, s]) => ({ value, ...s }));
    },
    platformItems() {
      return Object.entries(PLATFORMS).map(([value, text]) => ({ value, text }));
    },
    canManageSettings() {
      return can(this.perms || [], "settings:manage");
    },
  },

  watch: {
    options: { deep: true, handler: "load" },
    "$route.query"(q) {
      this.filters = fromQuery(q);
      if (this.options.page !== 1) this.options = { ...this.options, page: 1 };
      else this.load();
    },
  },

  created() {
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => {});
  },

  methods: {
    channelInfo,
    formatDate,
    formatMoney,
    leadWants,
    scoreColor,
    stage: (item) => stageInfo(item.lead?.stage),
    score: (item) => item.lead?.score || 0,

    applyFilters() {
      const query = {};
      if (this.filters.stage.length) query.stage = this.filters.stage.join(",");
      if (this.filters.platform) query.platform = this.filters.platform;
      if (this.filters.days !== 30) query.days = String(this.filters.days);
      if (this.filters.minScore) query.minScore = String(this.filters.minScore);
      if (JSON.stringify(query) === JSON.stringify(this.$route.query)) return;
      this.$router.replace({ query }).catch(() => {});
    },

    async load() {
      this.loading = true;
      this.error = "";
      const { page, itemsPerPage } = this.options;
      const params = {
        days: this.filters.days,
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      };
      if (this.filters.stage.length) params.stage = this.filters.stage.join(",");
      if (this.filters.platform) params.platform = this.filters.platform;
      if (this.filters.minScore) params.minScore = this.filters.minScore;
      try {
        const data = await listLeads(params);
        this.items = data.items || [];
        this.total = data.total || 0;
      } catch (err) {
        this.error = apiError(err, "Failed to load leads");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.summary {
  max-width: 420px;
  white-space: normal;
}
.leads-table >>> td {
  vertical-align: top;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
</style>
