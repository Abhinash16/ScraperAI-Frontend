<template>
  <v-card outlined rounded="lg">
    <div class="d-flex align-center flex-wrap px-5 py-4">
      <v-avatar size="40" tile color="indigo lighten-5" class="rounded-lg mr-3 flex-shrink-0">
        <v-icon size="20" color="indigo">$database</v-icon>
      </v-avatar>
      <div class="flex-grow-1 mr-4 my-1">
        <div class="d-flex align-center flex-wrap">
          <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mr-2">Product catalog</span>
          <v-chip v-if="index" x-small label outlined :color="sourceInfo.color" class="font-weight-bold">
            {{ sourceInfo.label }}
          </v-chip>
        </div>
        <div class="text-caption grey--text text--darken-1">
          Product names, SKUs and aliases (never prices) used to spot product questions, even with
          typos. Refreshed every 6 hours and whenever you save with the API enabled.
        </div>
      </div>
      <v-btn
        small
        outlined
        color="primary"
        class="my-1"
        :loading="syncing"
        :disabled="syncing || loading || polling"
        @click="sync"
      >
        <v-icon left size="14">$refresh-cw</v-icon>
        Sync now
      </v-btn>
    </div>
    <v-divider />

    <div class="pa-5">
      <v-skeleton-loader v-if="loading && !index" type="list-item-two-line" />

      <v-alert v-else-if="loadError && !index" type="error" text dense rounded="lg" class="text-body-2 mb-0">
        <div class="d-flex align-center flex-wrap">
          <span class="mr-4">{{ loadError }}</span>
          <v-spacer />
          <v-btn small outlined color="error" @click="load">Retry</v-btn>
        </div>
      </v-alert>

      <template v-else-if="index">
        <v-sheet v-if="polling" rounded="lg" color="primary lighten-5" class="d-flex align-center px-4 py-2 mb-3">
          <v-progress-circular indeterminate size="14" width="2" color="primary" class="mr-2" />
          <span class="text-body-2 primary--text">Syncing catalog…</span>
        </v-sheet>

        <div v-if="index.source" class="d-flex flex-wrap align-center">
          <v-chip small label color="grey lighten-4" class="font-weight-bold mr-2 my-1">
            <v-icon left size="14">$tag</v-icon>
            {{ index.productCount || 0 }} products
          </v-chip>
          <v-chip small label color="grey lighten-4" class="font-weight-bold mr-2 my-1">
            <v-icon left size="14">$list</v-icon>
            {{ index.aliasCount || 0 }} aliases
          </v-chip>
          <v-chip
            v-if="index.learnedCount"
            small
            label
            :color="index.source === 'api' ? 'grey lighten-4' : 'green lighten-5'"
            :text-color="index.source === 'api' ? 'grey' : 'green darken-2'"
            class="font-weight-bold mr-2 my-1"
            :title="index.source === 'api' ? 'Not used: the catalog API is the source' : ''"
          >
            {{ index.learnedCount }} learned from searches
            <template v-if="index.source === 'api'">&nbsp;(not used)</template>
          </v-chip>
          <span v-if="index.syncedAt" class="d-inline-flex align-center text-caption grey--text text--darken-1 my-1">
            <v-icon size="12" class="mr-1">$clock</v-icon>
            synced {{ index.syncedAt | moment("from", "now") }}
          </span>
        </div>
        <div v-else class="text-body-2 grey--text text--darken-1">Not synced yet.</div>

        <div v-if="index.lastError" class="d-flex align-start text-body-2 amber--text text--darken-3 mt-2">
          <v-icon size="14" color="amber darken-3" class="mr-2 mt-1">$triangle-alert</v-icon>
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
          Add <code>?mode=index</code> support to your product API for best results (returns every
          product with name, sku, category, aliases; no prices needed).
        </v-alert>

        <template v-if="sample.length">
          <div class="d-flex align-center mt-5 mb-2">
            <span class="text-caption font-weight-bold text-uppercase grey--text">Sample</span>
            <span v-if="index.productCount > sample.length" class="text-caption grey--text ml-2">
              (first {{ sample.length }} of {{ index.productCount }})
            </span>
          </div>
          <v-sheet outlined rounded="lg">
            <template v-for="(item, i) in sample">
              <v-divider v-if="i > 0" :key="`d-${item.sku || i}`" />
              <div :key="item.sku || i" class="d-flex align-center flex-wrap px-4 py-2">
                <span class="text-body-2 font-weight-bold grey--text text--darken-4 mr-2">{{ item.name }}</span>
                <span v-if="item.sku" class="text-caption grey--text mr-2">{{ item.sku }}</span>
                <v-chip
                  v-for="alias in item.aliases || []"
                  :key="alias"
                  x-small
                  label
                  color="grey lighten-4"
                  class="mr-1 my-1"
                >
                  {{ alias }}
                </v-chip>
              </div>
            </template>
          </v-sheet>
        </template>
      </template>
    </div>
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
