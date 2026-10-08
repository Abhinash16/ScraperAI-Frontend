<template>
  <v-card outlined rounded="lg" class="pa-6">
    <div class="d-flex align-center mb-1">
      <v-icon small class="mr-2">$history</v-icon>
      <div class="text-subtitle-1 font-weight-bold">Recent calls</div>
      <v-spacer />
      <v-btn small text rounded class="text-none" :loading="loading" @click="load">
        <v-icon small class="mr-1">$refresh-cw</v-icon> Refresh
      </v-btn>
    </div>
    <div class="text-body-2 grey--text text--darken-1 mb-4">
      Our calls to your API from live chats, syncs and tests. Kept for 7 days.
    </div>

    <v-alert v-if="paused" type="error" text rounded="lg" class="text-body-2">
      Calls to your API are paused for {{ circuit.retryInSeconds }}s after
      repeated failures. The bot tells customers live data is unavailable
      until it recovers.
    </v-alert>

    <v-progress-linear v-if="loading && !data" indeterminate color="primary" />
    <div v-else-if="error" class="text-body-2 error--text">{{ error }}</div>

    <template v-else-if="data">
      <v-row dense class="mb-3">
        <v-col v-for="t in tiles" :key="t.label" cols="6" sm="3">
          <div class="tile">
            <div class="text-caption grey--text text--darken-1">{{ t.label }}</div>
            <div :class="['text-h6 font-weight-bold', t.color]">{{ t.value }}</div>
          </div>
        </v-col>
      </v-row>

      <div v-if="!calls.length" class="text-body-2 grey--text">No calls yet.</div>
      <div v-else class="calls-table">
        <v-simple-table dense>
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Result</th>
              <th>Status</th>
              <th>Time taken</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in calls" :key="c._id">
              <td class="text-no-wrap">{{ formatDate(c.createdAt) }}</td>
              <td>{{ OPS[c.op] || c.op }}</td>
              <td>
                <span v-if="c.skipped" class="grey--text">Paused</span>
                <v-icon v-else small :color="c.ok ? 'success' : 'error'">
                  {{ c.ok ? "$circle-check" : "$circle-x" }}
                </v-icon>
                <span v-if="c.attempts > 1" class="text-caption grey--text ml-1">
                  ({{ c.attempts }} tries)
                </span>
              </td>
              <td>{{ c.status || "—" }}</td>
              <td>{{ c.ms != null ? `${c.ms} ms` : "—" }}</td>
              <td class="error-cell" :title="c.error">{{ c.error || "" }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </template>
  </v-card>
</template>

<script>
import apiClient from "@/service/axios";
import { apiError, formatDate } from "@/utils/knowledge";

const OPS = { search: "Search", index: "Full listing", lookup: "Lookup", test: "Test" };

// Last 50 calls to a client's Product or Customer API.
export default {
  name: "IntegrationCallLog",

  props: {
    kind: { type: String, required: true }, // "product" | "customer"
  },

  data: () => ({ OPS, data: null, loading: false, error: "" }),

  computed: {
    calls() {
      return this.data?.calls || [];
    },
    circuit() {
      return this.data?.circuit || {};
    },
    paused() {
      return !!this.circuit.paused;
    },
    tiles() {
      const d = this.data?.last24h || {};
      const ms = d.ms || {};
      const fmt = (v) => (typeof v === "number" ? `${v} ms` : "—");
      return [
        { label: "Calls (24h)", value: d.calls || 0 },
        {
          label: "Failure rate",
          value: `${d.failRate ?? 0}%`,
          color: d.failed ? "error--text" : "",
        },
        { label: "Typical time", value: fmt(ms.p50) },
        { label: "Slowest 5%", value: fmt(ms.p95) },
      ];
    },
  },

  created() {
    this.load();
  },

  methods: {
    formatDate,

    async load() {
      this.loading = true;
      this.error = "";
      try {
        const { data } = await apiClient.get("/clients/integration-calls", {
          params: { kind: this.kind },
        });
        this.data = data.data;
      } catch (err) {
        this.error = apiError(err, "Failed to load recent calls");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.tile {
  background: #f6f8fd;
  border-radius: 12px;
  padding: 10px 14px;
}

.calls-table {
  border: 1px solid #e4e8f2;
  border-radius: 12px;
  overflow: auto;
  max-height: 360px;
}

.error-cell {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
