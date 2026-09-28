<template>
  <v-card outlined rounded="xl" class="pa-6">
    <div class="d-flex align-start flex-wrap">
      <div class="flex-grow-1 mr-4 mb-2">
        <div class="d-flex align-center flex-wrap">
          <div class="text-subtitle-1 font-weight-bold mr-2">Product catalog</div>
          <v-chip
            v-if="index"
            x-small
            outlined
            :color="sourceInfo.color"
          >
            {{ sourceInfo.label }}
          </v-chip>
        </div>
        <div class="text-body-2 grey--text text--darken-1">
          Product names, SKUs and aliases (never prices) used to spot product
          questions, even with typos. Refreshed every 6 hours and whenever you
          save with the API enabled.
        </div>
      </div>
      <v-btn
        small
        rounded
        outlined
        color="primary"
        class="mb-2"
        :loading="syncing"
        :disabled="syncing || loading || polling"
        @click="sync"
      >
        <v-icon small class="mr-1">mdi-sync</v-icon> Sync now
      </v-btn>
    </div>

    <v-progress-linear v-if="loading && !index" indeterminate color="primary" class="mt-2" />

    <v-alert v-else-if="loadError && !index" type="error" text dense rounded="lg" class="text-body-2 mt-2 mb-0">
      {{ loadError }}
      <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
    </v-alert>

    <template v-else-if="index">
      <div v-if="polling" class="text-body-2 primary--text mt-2 d-flex align-center">
        <v-progress-circular indeterminate size="14" width="2" color="primary" class="mr-2" />
        Syncing catalog…
      </div>
      <div class="summary text-body-2 mt-2">
        <template v-if="index.source">
          <strong>{{ index.productCount || 0 }}</strong> products ·
          <strong>{{ index.aliasCount || 0 }}</strong> aliases
          <template v-if="index.learnedCount">
            ·
            <span :class="{ 'grey--text': index.source === 'api' }">
              <strong>{{ index.learnedCount }}</strong> learned from searches
              <template v-if="index.source === 'api'">
                (not used: catalog API is the source)
              </template>
            </span>
          </template>
          <template v-if="index.syncedAt">
            · synced {{ index.syncedAt | moment("from", "now") }}
          </template>
        </template>
        <span v-else class="grey--text text--darken-1">Not synced yet.</span>
      </div>

      <div v-if="index.lastError" class="text-body-2 amber--text text--darken-3 mt-2 d-flex align-start">
        <v-icon x-small color="amber darken-3" class="mr-1 mt-1">mdi-alert-outline</v-icon>
        <span>{{ index.lastError }}</span>
      </div>

      <v-alert
        v-if="index.source === 'fallback'"
        type="info"
        text
        dense
        rounded="lg"
        class="text-body-2 mt-4 mb-0"
      >
        Add <code>?mode=index</code> support to your product API for best
        results (returns every product with name, sku, category, aliases; no
        prices needed).
      </v-alert>

      <div v-if="sample.length" class="mt-4">
        <div class="group-title">
          Sample
          <span v-if="index.productCount > sample.length">
            (first {{ sample.length }} of {{ index.productCount }})
          </span>
        </div>
        <div class="sample-list">
          <div v-for="(item, i) in sample" :key="item.sku || i" class="sample-row">
            <div class="d-flex align-center flex-wrap">
              <span class="font-weight-medium mr-2">{{ item.name }}</span>
              <span v-if="item.sku" class="text-caption grey--text mr-2">
                {{ item.sku }}
              </span>
              <v-chip
                v-for="alias in item.aliases || []"
                :key="alias"
                x-small
                class="mr-1 my-1"
              >
                {{ alias }}
              </v-chip>
            </div>
          </div>
        </div>
      </div>
    </template>
  </v-card>
</template>

<script>
import apiClient from "@/service/axios";

const ENDPOINT = "/clients/product-api-settings/index";

const SOURCES = {
  api: { label: "From your catalog API", color: "success" },
  fallback: {
    label: "Fallback: names learned from searches",
    color: "amber darken-2",
  },
};

// Catalog index the backend syncs from the product API (?mode=index).
// The parent calls load() again after saving settings.
export default {
  name: "ProductCatalogCard",

  data() {
    return {
      index: null,
      loading: false,
      loadError: "",
      syncing: false,
      polling: false,
      pollTimer: null,
    };
  },

  computed: {
    sourceInfo() {
      return SOURCES[this.index?.source] || { label: "Not synced yet", color: "grey" };
    },

    sample() {
      return Array.isArray(this.index?.sample) ? this.index.sample : [];
    },
  },

  mounted() {
    this.load();
  },

  beforeDestroy() {
    this.stopPolling();
  },

  methods: {
    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get(ENDPOINT);
        this.index = data.data || {};
      } catch (err) {
        this.loadError =
          err.response?.data?.message || "Failed to load the product catalog";
      } finally {
        this.loading = false;
      }
    },

    // Saving with the API enabled starts a background sync: poll every 3 s,
    // up to 4 times, until syncedAt changes.
    pollAfterSave() {
      this.stopPolling();
      const before = this.index?.syncedAt || null;
      let attempts = 0;
      this.polling = true;

      const tick = async () => {
        attempts += 1;
        try {
          const { data } = await apiClient.get(ENDPOINT);
          this.index = data.data || {};
        } catch {
          // keep polling; the Sync-now button stays available afterwards
        }
        const changed = (this.index?.syncedAt || null) !== before;
        if (changed || attempts >= 4) this.stopPolling();
        else this.pollTimer = setTimeout(tick, 3000);
      };
      this.pollTimer = setTimeout(tick, 3000);
    },

    stopPolling() {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
      this.polling = false;
    },

    async sync() {
      this.stopPolling();
      this.syncing = true;
      try {
        const { data } = await apiClient.post(`${ENDPOINT}/sync`);
        this.index = data.data || {};
        this.$toast.success("Catalog synced");
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "Catalog sync failed");
      } finally {
        this.syncing = false;
      }
    },
  },
};
</script>

<style scoped>
.group-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
  margin-bottom: 8px;
}

.sample-list {
  border: 1px solid #e4e8f2;
  border-radius: 12px;
}

.sample-row {
  padding: 8px 14px;
  font-size: 14px;
}

.sample-row + .sample-row {
  border-top: 1px solid #e4e8f2;
}
</style>
