<template>
  <div>
    <ThingsToKnow feature="leads" />

    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Follow-ups</h1>
        <div class="text-body-2 grey--text text--darken-1">
          Customers who were close to buying and went quiet on WhatsApp, and the messages the bot
          sent them. Newest first.
        </div>
      </div>
      <v-spacer />
      <v-btn text color="primary" class="mb-2" :loading="loading" @click="load">
        <v-icon left size="16">$refresh-cw</v-icon>
        Refresh
      </v-btn>
    </div>

    <!-- FILTERS -->
    <v-row dense class="mb-2">
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="filters.status"
          :items="statusItems"
          label="Status"
          outlined
          dense
          clearable
          hide-details
          @change="applyFilters"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="filters.days"
          :items="DAY_CHOICES"
          label="Started"
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
        :footer-props="{ 'items-per-page-options': [20, 50, 100] }"
        item-key="_id"
        disable-sort
        class="follow-table"
      >
        <template #no-data>
          <div class="py-8 text-body-2 grey--text text--darken-1">
            No follow-ups in this period.
            <template v-if="canManageSettings">
              The bot follows up once
              <router-link to="/dashboard/bot-profile?tab=sales">follow-ups</router-link>
              are switched on under sales mode and published.
            </template>
          </div>
        </template>

        <template #[`item.customer`]="{ item }">
          <div class="text-body-2 text-no-wrap">{{ item.phone || "Not known" }}</div>
          <div class="text-caption grey--text text--darken-1">{{ leadWants(item.leadAtStart) || "—" }}</div>
          <v-chip
            v-if="item.leadAtStart && item.leadAtStart.stage"
            x-small
            label
            :color="stageInfo(item.leadAtStart.stage).color"
            text-color="white"
            class="font-weight-bold mt-1"
            title="Lead stage when the first follow-up was due"
          >
            {{ stageInfo(item.leadAtStart.stage).label }}
          </v-chip>
          <div v-if="item.leadAtStart && item.leadAtStart.objection" class="text-caption grey--text text--darken-1 mt-1">
            Concern: {{ item.leadAtStart.objection }}
          </div>
        </template>

        <template #[`item.messages`]="{ item }">
          <div v-if="item.status === 'holdout'" class="text-body-2 grey--text text--darken-1">
            Not followed up: picked for the holdout, to compare with.
          </div>
          <div v-else-if="!(item.nudges || []).length" class="text-body-2 grey--text text--darken-1">
            Nothing sent yet.
          </div>
          <div v-for="(nudge, i) in item.nudges || []" :key="i" class="nudge mb-2">
            <div class="d-flex align-center flex-wrap text-caption">
              <span class="font-weight-bold grey--text text--darken-3 mr-2">{{ triggerLabel(nudge.trigger) }}</span>
              <span class="grey--text mr-2">{{ formatDate(nudge.at) }}</span>
              <v-chip
                v-if="nudge.status !== 'sent'"
                x-small
                label
                :color="nudge.status === 'failed' ? 'red lighten-5' : 'grey lighten-4'"
                :text-color="nudge.status === 'failed' ? 'error' : 'grey darken-2'"
                class="font-weight-bold"
              >
                {{ nudge.status === "failed" ? "Not delivered" : "Not sent" }}
              </v-chip>
            </div>
            <div v-if="nudge.text" class="text-body-2 nudge-text">{{ nudge.text }}</div>
            <div v-if="nudge.reason && nudge.status !== 'sent'" class="text-caption grey--text text--darken-1">
              {{ nudge.reason }}
            </div>
          </div>
        </template>

        <template #[`item.result`]="{ item }">
          <v-chip x-small label :color="followUpStatus(item.status).color" text-color="white" class="font-weight-bold">
            {{ followUpStatus(item.status).label }}
          </v-chip>
          <div v-if="item.repliedAt" class="text-caption success--text mt-1 text-no-wrap">
            <v-icon size="12" color="success">$check</v-icon>
            Replied {{ formatDate(item.repliedAt) }}
          </div>
          <div v-if="item.wonAt" class="text-caption font-weight-bold success--text text-no-wrap">
            Paid<template v-if="item.revenue"> · {{ formatMoney(item.revenue) }}</template>
          </div>
          <div v-if="item.stopReason" class="text-caption grey--text text--darken-1 mt-1">
            {{ stopLabel(item.stopReason) }}
            <template v-if="item.stopReason === 'writer_declined' && declinedReason(item)">
              : {{ declinedReason(item) }}
            </template>
          </div>
        </template>

        <template #[`item.open`]="{ item }">
          <v-btn small text color="primary" :to="`/dashboard/chat/${encodeURIComponent(item.chatId)}`">
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
import {
  FOLLOW_UP_STATUS,
  followUpStatus,
  formatMoney,
  leadWants,
  listFollowUps,
  stageInfo,
  stopLabel,
  triggerLabel,
} from "@/utils/leads";

const DAY_CHOICES = [
  { value: 7, text: "Last 7 days" },
  { value: 30, text: "Last 30 days" },
  { value: 90, text: "Last 90 days" },
];

const fromQuery = (q) => ({
  status: FOLLOW_UP_STATUS[q.status] ? q.status : null,
  days: Number(q.days) || 30,
});

export default {
  name: "FollowUpsPage",

  components: { ThingsToKnow },

  data() {
    return {
      DAY_CHOICES,
      items: [],
      total: 0,
      loading: false,
      error: "",
      perms: null,
      filters: fromQuery(this.$route.query),
      options: { page: 1, itemsPerPage: 20 },
      headers: [
        { text: "Customer", value: "customer", width: 220 },
        { text: "What the bot sent", value: "messages" },
        { text: "Result", value: "result", width: 200 },
        { text: "", value: "open", align: "end" },
      ],
    };
  },

  computed: {
    statusItems() {
      return Object.entries(FOLLOW_UP_STATUS).map(([value, s]) => ({ value, text: s.label }));
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
    formatDate,
    formatMoney,
    leadWants,
    stageInfo,
    stopLabel,
    triggerLabel,
    followUpStatus,

    // The writer's reason on the nudge it declined to send
    declinedReason(item) {
      const skipped = [...(item.nudges || [])].reverse().find((n) => n.status === "skipped" && n.reason);
      return skipped ? skipped.reason : "";
    },

    applyFilters() {
      const query = {};
      if (this.filters.status) query.status = this.filters.status;
      if (this.filters.days !== 30) query.days = String(this.filters.days);
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
      if (this.filters.status) params.status = this.filters.status;
      try {
        const data = await listFollowUps(params);
        this.items = data.items || [];
        this.total = data.total || 0;
      } catch (err) {
        this.error = apiError(err, "Failed to load follow-ups");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.nudge {
  border-left: 3px solid #e3e8ef;
  padding-left: 8px;
  max-width: 560px;
}
.nudge-text {
  white-space: pre-wrap;
}
.follow-table >>> td {
  vertical-align: top;
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
</style>
