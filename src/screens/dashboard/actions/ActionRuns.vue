<template>
  <div>
    <ThingsToKnow feature="actions" />

    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">What the bot did</h1>
        <div class="text-body-2 grey--text text--darken-1">
          Every time the bot started an action: the price it showed, the link it sent, or why not.
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
      <v-col cols="12" sm="4">
        <v-select
          v-model="filters.status"
          :items="statusItems"
          label="Status"
          multiple
          outlined
          dense
          clearable
          hide-details
          @change="applyFilters"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-select
          v-model="filters.actionKey"
          :items="actionItems"
          label="Action"
          outlined
          dense
          clearable
          hide-details
          @change="applyFilters"
        />
      </v-col>
      <v-col cols="12" sm="4">
        <v-text-field
          v-model.trim="filters.chatId"
          label="Chat"
          placeholder="Chat ID"
          prepend-inner-icon="$search"
          outlined
          dense
          clearable
          hide-details
          @change="applyFilters"
          @click:clear="filters.chatId = ''; applyFilters()"
        />
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" text rounded="lg">{{ error }}</v-alert>

    <v-card outlined rounded="lg">
      <v-data-table
        :headers="headers"
        :items="runs"
        :loading="loading"
        :server-items-length="total"
        :options.sync="options"
        :footer-props="{ 'items-per-page-options': [25, 50, 100] }"
        item-key="_id"
        show-expand
        single-expand
        :expanded.sync="expanded"
        disable-sort
        no-data-text="Nothing yet. Runs appear here when the bot starts an action, or when you create a real link from Try it."
        class="runs-table"
      >
        <template #[`item.createdAt`]="{ item }">
          <span class="text-no-wrap">{{ formatDate(item.createdAt) }}</span>
        </template>

        <template #[`item.actionKey`]="{ item }">
          {{ actionName(item.actionKey) }}
        </template>

        <template #[`item.chatId`]="{ item }">
          <span v-if="isTest(item)" class="grey--text">From Try it</span>
          <router-link v-else :to="`/dashboard/chat/${encodeURIComponent(item.chatId)}`" class="text-truncate d-inline-block chat-link">
            {{ item.chatId }}
          </router-link>
        </template>

        <template #[`item.platform`]="{ item }">
          <span class="text-no-wrap">
            <v-icon size="14" :color="channelInfo(item.platform).color" class="mr-1">{{ channelInfo(item.platform).icon }}</v-icon>
            {{ channelInfo(item.platform).label }}
          </span>
          <div v-if="item.delivery" class="text-caption grey--text">{{ deliveryLabel(item.delivery) }}</div>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip x-small label :color="runStatus(item.status).color" text-color="white" class="text-no-wrap">
            {{ runStatus(item.status).label }}
          </v-chip>
          <v-chip v-if="item.dryRun" x-small label outlined class="ml-1" title="From the sandbox: no link was created">
            Sandbox
          </v-chip>
        </template>

        <template #[`item.amount`]="{ item }">
          {{ formatAmount(runAmount(item)) || "—" }}
        </template>

        <template #[`item.link`]="{ item }">
          <a v-if="item.result && item.result.url" :href="item.result.url" target="_blank" rel="noopener" class="text-no-wrap">
            Open <v-icon size="12" color="primary">$external-link</v-icon>
          </a>
          <span v-else class="grey--text">—</span>
        </template>

        <template #expanded-item="{ headers: cols, item }">
          <td :colspan="cols.length" class="py-4 expanded-cell">
            <v-row dense>
              <v-col cols="12" md="5">
                <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">What the bot collected</div>
                <table class="kv mb-3">
                  <tr v-for="(v, k) in item.inputs || {}" :key="k">
                    <td class="grey--text pr-3">{{ k }}</td>
                    <td>{{ v }}</td>
                  </tr>
                </table>
                <template v-if="item.quote && Object.keys(item.quote).length">
                  <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">Price check gave</div>
                  <table class="kv mb-3">
                    <tr v-for="(v, k) in item.quote" :key="k">
                      <td class="grey--text pr-3">{{ k }}</td>
                      <td class="text-break">{{ show(k, v) }}</td>
                    </tr>
                  </table>
                </template>
                <template v-if="item.result && Object.keys(item.result).length">
                  <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">Link</div>
                  <table class="kv mb-3">
                    <tr v-for="(v, k) in item.result" :key="k">
                      <td class="grey--text pr-3">{{ k }}</td>
                      <td class="text-break">{{ show(k, v) }}</td>
                    </tr>
                  </table>
                </template>
                <div v-if="item.phone" class="text-body-2 mb-2">
                  <span class="grey--text">Phone</span> {{ item.phone }}
                </div>
                <v-alert v-if="item.error" type="error" text dense rounded="lg" class="text-body-2">
                  {{ item.error }}
                </v-alert>
              </v-col>
              <v-col cols="12" md="7">
                <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">Requests to your API</div>
                <ActionSteps :steps="item.steps" />
              </v-col>
            </v-row>
          </td>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import ActionSteps from "@/components/actions/ActionSteps.vue";
import { apiError, formatDate } from "@/utils/knowledge";
import {
  DELIVERY,
  RUN_STATUS,
  channelInfo,
  formatAmount,
  listActions,
  listRuns,
  runAmount,
  runStatus,
} from "@/utils/actions";

const fromQuery = (q) => ({
  status: q.status ? String(q.status).split(",") : [],
  actionKey: q.actionKey || null,
  chatId: q.chatId || "",
});

export default {
  name: "ActionRuns",

  components: { ActionSteps, ThingsToKnow },

  data() {
    return {
      runs: [],
      total: 0,
      loading: false,
      error: "",
      actions: [],
      filters: fromQuery(this.$route.query),
      options: { page: 1, itemsPerPage: 25 },
      expanded: [],
      headers: [
        { text: "Time", value: "createdAt" },
        { text: "Action", value: "actionKey" },
        { text: "Chat", value: "chatId" },
        { text: "Channel", value: "platform" },
        { text: "Status", value: "status" },
        { text: "Amount", value: "amount", align: "end" },
        { text: "Link", value: "link" },
        { text: "", value: "data-table-expand" },
      ],
    };
  },

  computed: {
    statusItems() {
      return Object.entries(RUN_STATUS).map(([value, s]) => ({ value, text: s.label }));
    },
    actionItems() {
      const keys = new Set([
        ...this.actions.map((a) => a.key),
        ...this.runs.map((r) => r.actionKey).filter(Boolean),
        ...(this.filters.actionKey ? [this.filters.actionKey] : []),
      ]);
      return [...keys].map((k) => ({ value: k, text: this.actionName(k) }));
    },
  },

  watch: {
    options: { deep: true, handler: "load" },
    "$route.query"(q) {
      this.filters = fromQuery(q);
      // Back to page 1; changing the page loads through the options watcher
      if (this.options.page !== 1) this.options = { ...this.options, page: 1 };
      else this.load();
    },
  },

  created() {
    // Names for the action keys; needs settings:manage, so it may fail
    listActions()
      .then((a) => (this.actions = a))
      .catch(() => {});
  },

  methods: {
    channelInfo,
    runStatus,
    runAmount,
    formatAmount,
    formatDate,

    actionName(key) {
      return this.actions.find((a) => a.key === key)?.name || key;
    },
    deliveryLabel(d) {
      return DELIVERY[d]?.label || d;
    },
    isTest(run) {
      return String(run.chatId || "").startsWith("test-");
    },
    show(k, v) {
      if (v && typeof v === "object") return JSON.stringify(v);
      return k === "amount" ? formatAmount(v) : v;
    },

    applyFilters() {
      const query = {};
      if (this.filters.status.length) query.status = this.filters.status.join(",");
      if (this.filters.actionKey) query.actionKey = this.filters.actionKey;
      if (this.filters.chatId) query.chatId = this.filters.chatId;
      if (JSON.stringify(query) === JSON.stringify(this.$route.query)) return;
      this.$router.replace({ query }).catch(() => {});
    },

    async load() {
      this.loading = true;
      this.error = "";
      const { page, itemsPerPage } = this.options;
      const params = {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
      };
      if (this.filters.status.length) params.status = this.filters.status.join(",");
      if (this.filters.actionKey) params.actionKey = this.filters.actionKey;
      if (this.filters.chatId) params.chatId = this.filters.chatId;
      try {
        const data = await listRuns(params);
        this.runs = data.runs || [];
        this.total = data.total || 0;
      } catch (err) {
        this.error = apiError(err, "Couldn't load the runs.");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.chat-link {
  max-width: 180px;
  vertical-align: bottom;
}
.kv td {
  vertical-align: top;
  font-size: 0.875rem;
  padding: 1px 0;
}
.expanded-cell {
  background: rgba(0, 0, 0, 0.015);
}
</style>
