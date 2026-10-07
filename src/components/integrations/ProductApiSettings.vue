<template>
  <div>
    <v-alert
      type="info"
      text
      dense
      rounded="lg"
      icon="$info"
      class="text-body-2 mb-6"
    >
      Until a product API is enabled, the assistant will not quote prices and
      will send customers to the product page.
    </v-alert>

    <v-card v-if="loading" outlined rounded="xl" class="pa-6">
      <v-progress-linear indeterminate color="primary" />
    </v-card>

    <v-alert v-else-if="forbidden" type="warning" outlined rounded="xl">
      You need the <code>settings:manage</code> permission to view these
      settings.
    </v-alert>

    <v-alert v-else-if="loadError" type="error" outlined rounded="xl">
      {{ loadError }}
      <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
    </v-alert>

    <template v-else>
      <!-- SETTINGS -->
      <v-card outlined rounded="xl" class="pa-6 mb-6">
        <div class="d-flex align-start mb-4">
          <div class="flex-grow-1 mr-4">
            <div class="text-subtitle-1 font-weight-bold">Product search</div>
            <div class="text-body-2 grey--text text--darken-1">
              When a customer asks about a product or price, the assistant
              searches this API and answers with live results.
            </div>
          </div>
          <v-switch
            v-model="form.enabled"
            color="primary"
            inset
            hide-details
            class="mt-0 pt-0"
            :label="form.enabled ? 'On' : 'Off'"
          />
        </div>

        <v-divider class="mb-6" />

        <v-form ref="form" @submit.prevent="save">
          <div class="group-title">Endpoint</div>
          <v-row dense>
            <v-col cols="12" sm="3">
              <v-select
                v-model="form.method"
                :items="['GET', 'POST']"
                label="Method"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field
                v-model.trim="form.url"
                label="API URL"
                placeholder="https://example.com/api/products/search"
                outlined
                dense
                :rules="[urlRule]"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.trim="form.queryParam"
                label="Query parameter name"
                placeholder="q"
                hint="Query param (GET) or body field (POST) carrying the search text"
                outlined
                dense
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.timeout"
                label="Timeout (ms)"
                type="number"
                min="500"
                max="10000"
                hint="500 – 10000"
                outlined
                dense
                :rules="[rangeRule(500, 10000)]"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <HeadersEditor v-model="headerRows" />

          <v-divider class="my-6" />

          <div class="group-title">Results</div>
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model.trim="form.resultsPath"
                label="Results path"
                placeholder="data.products"
                hint="Dot path to the product list in the response. Leave empty to auto-detect."
                persistent-hint
                outlined
                dense
                class="mb-2"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.maxResults"
                label="Max results"
                type="number"
                min="1"
                max="20"
                hint="1 – 20"
                outlined
                dense
                :rules="[rangeRule(1, 20)]"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.cacheTtl"
                label="Cache TTL (seconds)"
                type="number"
                min="0"
                max="86400"
                hint="0 disables caching · max 86400"
                outlined
                dense
                :rules="[rangeRule(0, 86400)]"
              />
            </v-col>
          </v-row>

          <v-divider class="my-4" />

          <div class="group-title">Triggers</div>
          <v-combobox
            v-model="form.triggerKeywords"
            label="Extra trigger words (optional)"
            placeholder="Type a word and press Enter"
            hint="Product names and aliases from your catalog are detected automatically. Add other words that should trigger a product search. Up to 200, each 50 characters max."
            persistent-hint
            multiple
            small-chips
            deletable-chips
            hide-no-data
            outlined
            dense
            :rules="[keywordsRule]"
            @change="normalizeKeywords"
          />

          <v-expand-transition>
            <div v-if="form.enabled">
              <v-divider class="my-6" />
              <div class="group-title">Verification</div>
              <v-text-field
                v-model.trim="testQuery"
                label="Test query"
                placeholder="activa 6g"
                hint="The server test-calls your API with this query before saving. Saving fails if the call fails."
                persistent-hint
                outlined
                dense
              />
            </div>
          </v-expand-transition>

          <v-alert
            v-if="saveError"
            type="error"
            text
            dense
            rounded="lg"
            class="text-body-2 mt-6 mb-0"
          >
            {{ saveError }}
          </v-alert>

          <div class="d-flex align-center justify-end mt-6">
            <span v-if="dirty" class="text-caption grey--text mr-3">
              Unsaved changes
            </span>
            <v-btn
              v-if="dirty"
              text
              rounded
              class="mr-2"
              :disabled="saving"
              @click="discard"
            >
              Discard
            </v-btn>
            <v-btn
              color="primary"
              rounded
              depressed
              type="submit"
              :loading="saving"
            >
              Save
            </v-btn>
          </div>
        </v-form>
      </v-card>

      <ProductCatalogCard ref="catalog" class="mb-6" />

      <!-- TEST PANEL -->
      <v-card outlined rounded="xl" class="pa-6">
        <div class="d-flex align-center mb-1">
          <v-icon small class="mr-2">$flask-conical</v-icon>
          <div class="text-subtitle-1 font-weight-bold">
            Test with a customer message
          </div>
        </div>
        <div class="text-body-2 grey--text text--darken-1 mb-4">
          Calls your API live (no cache) using the saved settings.
          <span v-if="dirty" class="warning--text text--darken-2">
            Save your changes first to test them.
          </span>
        </div>

        <v-form class="d-flex align-start" @submit.prevent="runTest">
          <v-text-field
            v-model.trim="testMessage"
            label="Test customer message"
            placeholder="What is the monthly rent for Activa 6G?"
            outlined
            dense
            hide-details
            class="mr-2"
            autocomplete="off"
          />
          <v-btn
            color="primary"
            rounded
            depressed
            height="40"
            type="submit"
            :loading="testing"
            :disabled="testing || !testMessage"
          >
            Run test
          </v-btn>
        </v-form>

        <v-alert
          v-if="testError"
          type="error"
          text
          dense
          rounded="lg"
          class="text-body-2 mt-4 mb-0"
        >
          {{ testError }}
        </v-alert>

        <template v-if="testResult">
          <!-- Status row -->
          <div class="result-summary mt-6 mb-4">
            <v-chip small dark :color="modeInfo.color" class="mb-2">
              {{ modeInfo.label }}
            </v-chip>
            <div class="text-body-2 mb-1">
              <span class="grey--text text--darken-1">Detected by:</span>
              <template v-if="detectedBy.length">
                {{ detectedBy.join(" / ") }}
              </template>
              <span v-else class="grey--text">nothing</span>
            </div>
            <div v-if="catalogMatches.length" class="d-flex align-center flex-wrap mb-1">
              <span class="text-body-2 grey--text text--darken-1 mr-2">
                Catalog matches:
              </span>
              <v-chip
                v-for="(m, i) in catalogMatches"
                :key="m.sku || i"
                x-small
                outlined
                color="primary"
                class="mr-1 my-1"
                :title="m.score !== undefined ? `score ${m.score}` : ''"
              >
                {{ matchLabel(m) }}
              </v-chip>
            </div>
            <div class="text-body-2">
              <span class="grey--text text--darken-1">
                {{ queries.length > 1 ? "Searches sent:" : "Search query sent:" }}
              </span>
              <template v-if="queries.length">
                <code
                  v-for="(q, i) in queries"
                  :key="i"
                  class="mr-1"
                >{{ q }}</code>
                <span v-if="queries.length > 1" class="text-caption grey--text">
                  (API response below is for the first)
                </span>
              </template>
              <span v-else class="grey--text">
                (no product name found in the message)
              </span>
            </div>
            <div v-if="testResult.apiError" class="text-body-2 error--text mt-1">
              <v-icon x-small color="error" class="mr-1">
                $circle-alert
              </v-icon>
              {{ testResult.apiError }}
            </div>
          </div>

          <v-row>
            <v-col cols="12" md="6">
              <OutputPanel
                title="API response"
                :copy-text="formatJson(testResult.apiResponse)"
              >
                <JsonTree
                  v-if="hasValue(testResult.apiResponse)"
                  :value="testResult.apiResponse"
                />
                <div v-else class="output-empty">No API call</div>
              </OutputPanel>
            </v-col>
            <v-col cols="12" md="6">
              <OutputPanel
                title="What the AI sees"
                subtitle="This exact text is added to the AI's instructions when a real customer chats."
                :copy-text="testResult.aiContext || ''"
              >
                <pre v-if="testResult.aiContext">{{ testResult.aiContext }}</pre>
                <div v-else class="output-empty">(nothing)</div>
              </OutputPanel>
            </v-col>
          </v-row>

          <!-- Products passed to the AI -->
          <div class="group-title mt-4">
            Products passed to the AI
            <span v-if="products.length">({{ products.length }})</span>
          </div>
          <div v-if="products.length" class="text-caption grey--text mb-2">
            Click a row to see the full item.
          </div>
          <div v-if="products.length" class="products-table">
            <v-simple-table dense>
              <thead>
                <tr>
                  <th class="expand-cell"></th>
                  <th v-for="col in productColumns" :key="col">{{ col }}</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(product, i) in products">
                  <tr
                    :key="`row-${i}`"
                    class="product-row"
                    @click="toggleProduct(i)"
                  >
                    <td class="expand-cell">
                      <v-icon x-small>
                        {{
                          expandedProduct === i
                            ? "$chevron-down"
                            : "$chevron-right"
                        }}
                      </v-icon>
                    </td>
                    <td
                      v-for="col in productColumns"
                      :key="col"
                      :title="formatCell(product[col])"
                    >
                      {{ formatCell(product[col]) }}
                    </td>
                  </tr>
                  <tr v-if="expandedProduct === i" :key="`detail-${i}`">
                    <td :colspan="productColumns.length + 1" class="pa-2">
                      <div class="product-json">
                        <JsonTree :value="product" :expand-depth="3" />
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </v-simple-table>
          </div>
          <div v-else class="text-body-2 grey--text">
            No products passed to the AI.
          </div>
        </template>

        <div class="panel-note mt-4">
          <v-icon x-small class="mr-1">$info</v-icon>
          The AI quotes prices only from this live data. Without a product API
          it never quotes prices and sends customers to the product page.
        </div>
      </v-card>
    </template>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import HeadersEditor from "@/components/integrations/HeadersEditor.vue";
import JsonTree from "@/components/integrations/JsonTree.vue";
import OutputPanel from "@/components/integrations/OutputPanel.vue";
import { rowsFromHeaders, headersFromRows } from "@/utils/apiHeaders";
import {
  productModeInfo,
  catalogMatchLabel,
  detectionSources,
} from "@/utils/productModes";
import ProductCatalogCard from "@/components/integrations/ProductCatalogCard.vue";
import { formatProductCell } from "@/utils/productFormat";

const ENDPOINT = "/clients/product-api-settings";
const MAX_KEYWORDS = 200;
const MAX_KEYWORD_LENGTH = 50;


export default {
  name: "ProductApiSettings",

  components: { HeadersEditor, JsonTree, OutputPanel, ProductCatalogCard },

  data() {
    return {
      loading: false,
      saving: false,
      testing: false,
      forbidden: false,
      loadError: "",
      saveError: "",
      testError: "",

      form: {
        enabled: false,
        url: "",
        method: "GET",
        queryParam: "q",
        resultsPath: "",
        maxResults: 5,
        timeout: 3000,
        cacheTtl: 300,
        triggerKeywords: [],
      },
      headerRows: [],
      savedConfig: null,
      savedSnapshot: "",
      testQuery: "",

      testMessage: "",
      testResult: null,
      lastTestAt: 0,
      expandedProduct: null,
    };
  },

  computed: {
    dirty() {
      return this.snapshot() !== this.savedSnapshot;
    },

    modeInfo() {
      return productModeInfo(this.testResult?.mode);
    },

    detectedBy() {
      return detectionSources(this.testResult);
    },

    catalogMatches() {
      const list = this.testResult?.catalogMatches;
      return Array.isArray(list) ? list : [];
    },

    // Older responses only had `query`.
    queries() {
      const list = this.testResult?.queries;
      if (Array.isArray(list)) return list.filter(Boolean);
      return this.testResult?.query ? [this.testResult.query] : [];
    },

    products() {
      const list = this.testResult?.products;
      return Array.isArray(list) ? list : [];
    },

    // Union of keys across products, in first-seen order.
    productColumns() {
      const cols = [];
      for (const product of this.products) {
        if (!product || typeof product !== "object") continue;
        for (const key of Object.keys(product)) {
          if (!cols.includes(key)) cols.push(key);
        }
      }
      return cols;
    },
  },

  mounted() {
    this.load();
  },

  methods: {
    urlRule(v) {
      if (!v) return !this.form.enabled || "URL is required when enabled";
      return /^https?:\/\/\S+$/i.test(v) || "Enter a valid http(s) URL";
    },

    rangeRule(min, max) {
      return (v) =>
        (v !== "" && v !== null && v >= min && v <= max) ||
        `Between ${min} and ${max}`;
    },

    keywordsRule(v) {
      if ((v || []).length > MAX_KEYWORDS) {
        return `At most ${MAX_KEYWORDS} keywords`;
      }
      return true;
    },

    normalizeKeywords(values) {
      const seen = new Set();
      const cleaned = [];
      let tooLong = false;

      for (const raw of values || []) {
        const kw = String(raw).trim();
        if (!kw) continue;
        if (kw.length > MAX_KEYWORD_LENGTH) {
          tooLong = true;
          continue;
        }
        const lower = kw.toLowerCase();
        if (seen.has(lower)) continue;
        seen.add(lower);
        cleaned.push(kw);
      }

      if (tooLong) {
        this.$toast.error(
          `Keywords must be ${MAX_KEYWORD_LENGTH} characters or fewer`,
        );
      }
      this.form.triggerKeywords = cleaned;
    },

    snapshot() {
      return JSON.stringify({ form: this.form, headers: this.headerRows });
    },

    applyConfig(data) {
      const cfg = data || {};
      this.savedConfig = cfg;
      this.form = {
        enabled: !!cfg.enabled,
        url: cfg.url || "",
        method: cfg.method || "GET",
        queryParam: cfg.queryParam || "q",
        resultsPath: cfg.resultsPath || "",
        maxResults: cfg.maxResults ?? 5,
        timeout: cfg.timeout ?? 3000,
        cacheTtl: cfg.cacheTtl ?? 300,
        triggerKeywords: Array.isArray(cfg.triggerKeywords)
          ? [...cfg.triggerKeywords]
          : [],
      };
      this.headerRows = rowsFromHeaders(cfg.headers);
      this.savedSnapshot = this.snapshot();
    },

    discard() {
      this.saveError = "";
      this.applyConfig(this.savedConfig);
      this.$refs.form.resetValidation();
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      this.forbidden = false;
      try {
        const { data } = await apiClient.get(ENDPOINT);
        this.applyConfig(data.data);
      } catch (err) {
        if (err.response?.status === 403) this.forbidden = true;
        else
          this.loadError =
            err.response?.data?.message || "Failed to load Product API settings";
      } finally {
        this.loading = false;
      }
    },

    async save() {
      this.saveError = "";
      if (!this.$refs.form.validate()) return;

      const { headers, error } = headersFromRows(this.headerRows);
      if (error) {
        this.saveError = error;
        return;
      }

      const body = {
        enabled: this.form.enabled,
        url: this.form.url,
        method: this.form.method,
        queryParam: this.form.queryParam || "q",
        headers,
        resultsPath: this.form.resultsPath,
        maxResults: Number(this.form.maxResults),
        timeout: Number(this.form.timeout),
        cacheTtl: Number(this.form.cacheTtl),
        triggerKeywords: this.form.triggerKeywords,
      };
      if (this.form.enabled && this.testQuery) body.testQuery = this.testQuery;

      this.saving = true;
      try {
        const { data } = await apiClient.put(ENDPOINT, body);
        this.applyConfig(data.data);
        this.$toast.success(data.message || "Product API settings saved");
        // Saving with the API enabled re-syncs the catalog in the background.
        if (this.form.enabled) this.$refs.catalog?.pollAfterSave();
        else this.$refs.catalog?.load();
      } catch (err) {
        this.saveError =
          err.response?.data?.message || "Failed to save Product API settings";
      } finally {
        this.saving = false;
      }
    },

    async runTest() {
      // Test calls hit the live API: ignore repeat clicks / Enter presses.
      if (!this.testMessage || this.testing) return;
      if (Date.now() - this.lastTestAt < 800) return;
      this.lastTestAt = Date.now();

      this.testing = true;
      this.testError = "";
      this.testResult = null;
      this.expandedProduct = null;
      try {
        const { data } = await apiClient.post(`${ENDPOINT}/test`, {
          message: this.testMessage,
        });
        this.testResult = data.data || {};
      } catch (err) {
        this.testError = err.response?.data?.message || "Test failed";
      } finally {
        this.testing = false;
      }
    },

    hasValue(value) {
      return value !== null && value !== undefined;
    },

    formatJson(value) {
      return this.hasValue(value) ? JSON.stringify(value, null, 2) : "";
    },

    matchLabel(match) {
      return catalogMatchLabel(match);
    },

    formatCell(value) {
      return formatProductCell(value);
    },

    toggleProduct(index) {
      this.expandedProduct = this.expandedProduct === index ? null : index;
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
  margin-bottom: 12px;
}

.result-summary {
  background: #f6f8fd;
  border-radius: 12px;
  padding: 14px 16px;
}

.panel-note {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #757575;
}

.products-table {
  border: 1px solid #e4e8f2;
  border-radius: 12px;
  overflow: auto;
  max-height: 360px;
}

.products-table th {
  white-space: nowrap;
}

.products-table td {
  font-size: 13px;
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.products-table td[colspan] {
  max-width: none;
  white-space: normal;
}

.products-table .expand-cell {
  width: 28px;
  padding-right: 0 !important;
}

.product-row {
  cursor: pointer;
}

.product-json {
  background: #0f172a;
  color: #e2e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  max-height: 320px;
  overflow: auto;
}
</style>
