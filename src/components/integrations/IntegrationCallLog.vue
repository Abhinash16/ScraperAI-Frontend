<template>
  <v-card outlined rounded="lg">
    <div class="d-flex align-center px-5 py-4">
      <v-avatar size="40" tile color="blue-grey lighten-5" class="rounded-lg mr-3 flex-shrink-0">
        <v-icon size="20" color="blue-grey">$history</v-icon>
      </v-avatar>
      <div class="flex-grow-1 mr-4">
        <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Recent calls</div>
        <div class="text-caption grey--text text--darken-1">
          Our calls to your API from live chats, syncs and tests. Kept for 7 days.
        </div>
      </div>
      <v-btn small text color="primary" :loading="loading" @click="load">
        <v-icon left size="14">$refresh-cw</v-icon>
        Refresh
      </v-btn>
    </div>
    <v-divider />

    <div class="pa-5">
      <v-alert v-if="paused" type="error" text rounded="lg" class="text-body-2">
        Calls to your API are paused for {{ circuit.retryInSeconds }}s after repeated failures. The
        bot tells customers live data is unavailable until it recovers.
      </v-alert>

      <v-skeleton-loader v-if="loading && !data" type="list-item, list-item, list-item" />
      <v-alert v-else-if="error" type="error" text dense rounded="lg" class="text-body-2 mb-0">
        {{ error }}
      </v-alert>

      <template v-else-if="data">
        <v-row dense class="mb-3">
          <v-col v-for="t in tiles" :key="t.label" cols="6" sm="3">
            <v-sheet color="grey lighten-5" rounded="lg" class="px-4 py-3 fill-height">
              <div class="text-caption grey--text text--darken-1">{{ t.label }}</div>
              <div class="text-h6 font-weight-bold" :class="t.color || 'grey--text text--darken-4'">
                {{ t.value }}
              </div>
            </v-sheet>
          </v-col>
        </v-row>

        <div v-if="!calls.length" class="text-center text-body-2 grey--text py-6">No calls yet.</div>
        <v-sheet v-else outlined rounded="lg" max-height="360" class="overflow-y-auto">
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
                <td class="text-no-wrap">{{ OPS[c.op] || c.op }}</td>
                <td class="text-no-wrap">
                  <v-chip v-if="c.skipped" x-small label color="grey lighten-4" class="font-weight-bold">
                    Paused
                  </v-chip>
                  <v-chip
                    v-else
                    x-small
                    label
                    :color="c.ok ? 'green lighten-5' : 'red lighten-5'"
                    :text-color="c.ok ? 'success' : 'error'"
                    class="font-weight-bold"
                  >
                    <v-icon left size="10">{{ c.ok ? "$circle-check" : "$circle-x" }}</v-icon>
                    {{ c.ok ? "OK" : "Failed" }}
                  </v-chip>
                  <span v-if="c.attempts > 1" class="text-caption grey--text ml-1">({{ c.attempts }} tries)</span>
                </td>
                <td>{{ c.status || "—" }}</td>
                <td class="text-no-wrap">{{ c.ms != null ? `${c.ms} ms` : "—" }}</td>
                <td class="error-cell error--text" :title="c.error">{{ c.error || "" }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-sheet>
      </template>
    </div>
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
/* One line per error; the full text is in the tooltip */
.error-cell {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
