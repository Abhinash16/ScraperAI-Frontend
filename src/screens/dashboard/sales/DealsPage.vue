<template>
  <div>
    <ThingsToKnow feature="leads" />

    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Deals</h1>
        <div class="text-body-2 grey--text text--darken-1">
          Payments your own system reported to us, and whether the bot helped make them.
        </div>
      </div>
      <v-spacer />
      <v-btn text color="primary" class="mb-2" :loading="loading" @click="load">
        <v-icon left size="16">$refresh-cw</v-icon>
        Refresh
      </v-btn>
    </div>

    <v-alert text dense color="primary" rounded="lg" class="text-body-2 py-3">
      <template #prepend>
        <v-icon color="primary" size="18" class="mr-3">$info</v-icon>
      </template>
      <span class="grey--text text--darken-3">
        A payment counts for the bot when it was made within 30 days of the bot's payment link or of
        a chat with the bot. Payments reach us from your own booking system, not from this dashboard.
      </span>
    </v-alert>

    <!-- FILTERS -->
    <v-row dense class="mb-2">
      <v-col cols="12" sm="4">
        <v-select
          v-model="filters.days"
          :items="DAY_CHOICES"
          label="Paid in"
          outlined
          dense
          hide-details
          @change="applyFilters"
        />
      </v-col>
      <v-col cols="12" sm="5">
        <v-select
          v-model="filters.attribution"
          :items="attributionItems"
          label="Did the bot help?"
          outlined
          dense
          clearable
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
        no-data-text="No payments reported in this period."
      >
        <template #[`item.paidAt`]="{ item }">
          <span class="text-no-wrap">{{ formatDate(item.paidAt) }}</span>
        </template>

        <template #[`item.reference`]="{ item }">
          <code v-if="item.reference">{{ item.reference }}</code>
          <span v-else class="grey--text">—</span>
          <div class="text-caption grey--text">
            {{ kindLabel(item.kind) }}
            <template v-if="item.bookingId"> · booking {{ item.bookingId }}</template>
            <template v-if="item.extendId"> · extension {{ item.extendId }}</template>
          </div>
        </template>

        <template #[`item.phone`]="{ item }">
          <span class="text-no-wrap">{{ item.phone || "—" }}</span>
        </template>

        <template #[`item.amount`]="{ item }">
          <span class="font-weight-bold text-no-wrap">{{ formatMoney(item.amount, item.currency) || "—" }}</span>
        </template>

        <template #[`item.attribution`]="{ item }">
          <v-chip x-small label outlined :color="attribution(item).color" class="font-weight-bold text-no-wrap">
            {{ attribution(item).label }}
          </v-chip>
        </template>

        <template #[`item.chat`]="{ item }">
          <v-btn
            v-if="item.chatId"
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
import { apiError, formatDate } from "@/utils/knowledge";
import { ATTRIBUTION, DEAL_KINDS, formatMoney, listDeals } from "@/utils/leads";

const DAY_CHOICES = [
  { value: 7, text: "Last 7 days" },
  { value: 30, text: "Last 30 days" },
  { value: 90, text: "Last 90 days" },
];

const fromQuery = (q) => ({
  days: Number(q.days) || 30,
  attribution: q.attribution || null,
});

export default {
  name: "DealsPage",

  components: { ThingsToKnow },

  data() {
    return {
      DAY_CHOICES,
      items: [],
      total: 0,
      loading: false,
      error: "",
      filters: fromQuery(this.$route.query),
      options: { page: 1, itemsPerPage: 25 },
      headers: [
        { text: "Paid", value: "paidAt" },
        { text: "Reference", value: "reference" },
        { text: "Customer", value: "phone" },
        { text: "Amount", value: "amount", align: "end" },
        { text: "Did the bot help?", value: "attribution" },
        { text: "", value: "chat", align: "end" },
      ],
    };
  },

  computed: {
    attributionItems() {
      return Object.entries(ATTRIBUTION).map(([value, a]) => ({ value, text: a.label }));
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

  methods: {
    formatDate,
    formatMoney,
    kindLabel: (k) => DEAL_KINDS[k] || k || "Payment",
    attribution: (item) => ATTRIBUTION[item.attribution] || ATTRIBUTION.none,

    applyFilters() {
      const query = {};
      if (this.filters.days !== 30) query.days = String(this.filters.days);
      if (this.filters.attribution) query.attribution = this.filters.attribution;
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
      if (this.filters.attribution) params.attribution = this.filters.attribution;
      try {
        const data = await listDeals(params);
        this.items = data.items || [];
        this.total = data.total || 0;
      } catch (err) {
        this.error = apiError(err, "Failed to load deals");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
