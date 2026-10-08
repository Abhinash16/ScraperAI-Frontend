<template>
  <div>
    <v-alert text dense color="primary" rounded="lg" class="text-body-2 py-3 mb-4">
      <template #prepend>
        <v-icon color="primary" size="18" class="mr-3">$info</v-icon>
      </template>
      <span class="grey--text text--darken-3">
        Until a product API is enabled, the assistant won't quote prices and sends customers to the
        product page.
      </span>
    </v-alert>

    <!-- FORMAT -->
    <v-card outlined rounded="lg" class="mb-4">
      <div class="d-flex align-start px-5 py-4">
        <v-avatar size="40" tile color="primary lighten-5" class="rounded-lg mr-3 flex-shrink-0">
          <v-icon size="20" color="primary">$braces</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
            What your API must return
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            We call your URL in two ways: a search when a customer names a model
            (<code>?q=…&amp;limit=5</code>), and a full listing
            (<code>?mode=index&amp;limit=2000&amp;q=</code>) for questions like "what's available?".
            Both return the same items.
            <strong>The full listing must include prices and availability</strong>, or the bot can't
            tell customers what's in stock. Respond within 3 seconds.
          </div>
          <div class="d-flex flex-wrap mt-2">
            <v-btn small text color="primary" class="px-2 mr-2" @click="showFormat = !showFormat">
              <v-icon left size="14">{{ showFormat ? "$chevron-up" : "$chevron-down" }}</v-icon>
              See the full format
            </v-btn>
            <v-btn small text color="primary" class="px-2" to="/dashboard/documentation?guide=product-api">
              <v-icon left size="14">$book-open</v-icon>
              Product API guide
            </v-btn>
          </div>
        </div>
      </div>
      <v-expand-transition>
        <div v-if="showFormat">
          <v-divider />
          <ProductApiFormat class="pa-5" />
        </div>
      </v-expand-transition>
    </v-card>

    <!-- LOADING / NO ACCESS / ERROR -->
    <v-card v-if="loading" outlined rounded="lg" class="pa-4">
      <v-skeleton-loader type="list-item-avatar-two-line, list-item-two-line, list-item-two-line" />
    </v-card>

    <v-alert v-else-if="forbidden" type="warning" text rounded="lg" class="text-body-2">
      You need the <code>settings:manage</code> permission to view these settings.
    </v-alert>

    <v-alert v-else-if="loadError" type="error" text rounded="lg" class="text-body-2">
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ loadError }}</span>
        <v-spacer />
        <v-btn small outlined color="error" @click="load">
          <v-icon left size="14">$refresh-cw</v-icon>
          Retry
        </v-btn>
      </div>
    </v-alert>

    <template v-else>
      <!-- SETTINGS -->
      <v-card outlined rounded="lg" class="mb-4">
        <div class="d-flex align-center px-5 py-4">
          <v-avatar
            size="40"
            tile
            :color="form.enabled ? 'green lighten-5' : 'grey lighten-4'"
            class="rounded-lg mr-3 flex-shrink-0"
          >
            <v-icon size="20" :color="form.enabled ? 'green darken-1' : 'grey'">$tag</v-icon>
          </v-avatar>
          <div class="flex-grow-1 mr-4">
            <div class="d-flex align-center">
              <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mr-2">
                Product search
              </span>
              <v-chip
                x-small
                label
                :color="form.enabled ? 'green lighten-5' : 'grey lighten-4'"
                :text-color="form.enabled ? 'success' : 'grey darken-1'"
                class="font-weight-bold"
              >
                {{ form.enabled ? "On" : "Off" }}
              </v-chip>
            </div>
            <div class="text-caption grey--text text--darken-1">
              When a customer asks about a product or price, the assistant searches this API and
              answers with live results.
            </div>
          </div>
          <v-switch
            v-model="form.enabled"
            color="success"
            inset
            hide-details
            class="mt-0 pt-0"
            aria-label="Product search on or off"
          />
        </div>
        <v-divider />

        <v-form ref="form" class="pa-5" @submit.prevent="save">
          <div class="d-flex align-center mb-3">
            <v-icon size="16" color="grey darken-1" class="mr-2">$link</v-icon>
            <span class="text-caption font-weight-bold text-uppercase grey--text">Endpoint</span>
          </div>
          <v-row dense>
            <v-col cols="12" sm="3">
              <v-select v-model="form.method" :items="['GET', 'POST']" label="Method" outlined dense />
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

          <ExtraParamsEditor v-model="paramRows" :placeholders="PLACEHOLDERS" class="mt-2" />

          <v-divider class="my-5" />

          <ApiAuthEditor v-model="authForm" />

          <HeadersEditor v-model="headerRows" />

          <v-divider class="my-5" />

          <div class="d-flex align-center mb-3">
            <v-icon size="16" color="grey darken-1" class="mr-2">$list</v-icon>
            <span class="text-caption font-weight-bold text-uppercase grey--text">Results</span>
          </div>
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

          <v-divider class="my-5" />

          <v-sheet outlined rounded="lg">
            <div class="d-flex align-center px-4 py-3">
              <v-icon size="16" color="grey darken-1" class="mr-2">$route</v-icon>
              <span class="text-caption font-weight-bold text-uppercase grey--text">Field mapping</span>
              <v-chip
                v-if="mappingCount"
                x-small
                label
                color="green lighten-5"
                text-color="success"
                class="font-weight-bold ml-2"
              >
                {{ mappingCount }} mapped
              </v-chip>
              <v-spacer />
              <v-btn small text color="primary" @click="showMapping = !showMapping">
                <v-icon left size="14">{{ showMapping ? "$chevron-up" : "$chevron-down" }}</v-icon>
                {{ showMapping ? "Hide" : "Show" }}
              </v-btn>
            </div>
            <v-expand-transition>
              <div v-if="showMapping">
                <v-divider />
                <FieldMapEditor v-model="mapForm" :suggestions="suggestions" class="pa-4" />
              </div>
            </v-expand-transition>
          </v-sheet>

          <v-divider class="my-5" />

          <div class="d-flex align-center mb-3">
            <v-icon size="16" color="grey darken-1" class="mr-2">$zap</v-icon>
            <span class="text-caption font-weight-bold text-uppercase grey--text">Triggers</span>
          </div>
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
              <v-divider class="my-5" />
              <div class="d-flex align-center mb-3">
            <v-icon size="16" color="grey darken-1" class="mr-2">$shield-check</v-icon>
            <span class="text-caption font-weight-bold text-uppercase grey--text">Verification</span>
          </div>
              <v-row dense>
                <v-col cols="12" md="7">
                  <v-text-field
                    v-model.trim="testQuery"
                    label="Test query"
                    placeholder="activa 6g"
                    hint="The server test-calls your API with this query before saving. Saving fails if the call fails."
                    persistent-hint
                    outlined
                    dense
                  />
                </v-col>
              </v-row>
            </div>
          </v-expand-transition>

          <v-alert v-if="saveError" type="error" text dense rounded="lg" class="text-body-2 mt-5 mb-0">
            {{ saveError }}
          </v-alert>
        </v-form>

        <v-divider />
        <div class="d-flex align-center px-5 py-3">
          <span v-if="dirty" class="text-caption amber--text text--darken-3 font-weight-bold">
            Unsaved changes
          </span>
          <v-spacer />
          <v-btn v-if="dirty" text class="mr-2" :disabled="saving" @click="discard">Discard</v-btn>
          <v-btn color="primary" depressed :loading="saving" @click="save">
            <v-icon left size="16">$check</v-icon>
            Save
          </v-btn>
        </div>
      </v-card>

      <ProductApiPreview :get-settings="previewSettings" class="mb-4" @first-item="onFirstItem" />

      <ProductCatalogCard ref="catalog" class="mb-4" />

      <!-- TEST PANEL -->
      <v-card outlined rounded="lg">
        <div class="d-flex align-center px-5 py-4">
          <v-avatar size="40" tile color="green lighten-5" class="rounded-lg mr-3 flex-shrink-0">
            <v-icon size="20" color="green darken-1">$flask-conical</v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
              Test with a customer message
            </div>
            <div class="text-caption grey--text text--darken-1">
              Calls your API live (no cache) using the saved settings.
              <span v-if="dirty" class="amber--text text--darken-3 font-weight-bold">
                Save your changes first to test them.
              </span>
            </div>
          </div>
        </div>
        <v-divider />

        <div class="pa-5">
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
              color="success"
              depressed
              height="40"
              type="submit"
              :loading="testing"
              :disabled="testing || !testMessage"
            >
              <v-icon left size="16">$play</v-icon>
              Run test
            </v-btn>
          </v-form>

          <v-alert v-if="testError" type="error" text dense rounded="lg" class="text-body-2 mt-4 mb-0">
            {{ testError }}
          </v-alert>

          <template v-if="testResult">
            <!-- Summary -->
            <v-sheet color="grey lighten-5" rounded="lg" class="pa-4 mt-5 mb-4">
              <div class="d-flex flex-wrap align-center mb-2">
                <v-chip small label dark :color="modeInfo.color" class="font-weight-bold mr-2">
                  {{ modeInfo.label }}
                </v-chip>
                <span v-if="stockLabel" class="text-body-2 grey--text text--darken-3">{{ stockLabel }}</span>
              </div>
              <div class="text-body-2 mb-1">
                <span class="grey--text text--darken-1">Detected by:</span>
                <template v-if="detectedBy.length">{{ detectedBy.join(" / ") }}</template>
                <span v-else class="grey--text">nothing</span>
              </div>
              <div v-if="catalogMatches.length" class="d-flex align-center flex-wrap mb-1">
                <span class="text-body-2 grey--text text--darken-1 mr-2">Catalog matches:</span>
                <v-chip
                  v-for="(m, i) in catalogMatches"
                  :key="m.sku || i"
                  x-small
                  label
                  outlined
                  color="primary"
                  class="mr-1 my-1"
                  :title="m.score !== undefined ? `score ${m.score}` : ''"
                >
                  {{ matchLabel(m) }}
                </v-chip>
              </div>
              <div class="d-flex flex-wrap align-center text-body-2">
                <span class="grey--text text--darken-1 mr-2">
                  {{ queries.length > 1 ? "Searches sent:" : "Search query sent:" }}
                </span>
                <template v-if="queries.length">
                  <v-chip
                    v-for="(q, i) in queries"
                    :key="i"
                    x-small
                    label
                    color="grey lighten-3"
                    class="mr-1 my-1"
                  >
                    {{ q }}
                  </v-chip>
                  <span v-if="queries.length > 1" class="text-caption grey--text">
                    (API response below is for the first)
                  </span>
                </template>
                <span v-else class="grey--text">(no product name found in the message)</span>
              </div>
              <div v-if="testResult.apiError" class="d-flex align-center text-body-2 error--text mt-2">
                <v-icon size="14" color="error" class="mr-1">$circle-alert</v-icon>
                {{ testResult.apiError }}
              </div>
            </v-sheet>

            <v-row dense>
              <v-col cols="12" md="6">
                <OutputPanel title="API response" :copy-text="formatJson(testResult.apiResponse)">
                  <JsonTree v-if="hasValue(testResult.apiResponse)" :value="testResult.apiResponse" />
                  <div v-else class="text-caption grey--text">No API call</div>
                </OutputPanel>
              </v-col>
              <v-col cols="12" md="6">
                <OutputPanel
                  title="What the AI sees"
                  subtitle="This exact text is added to the AI's instructions when a real customer chats."
                  :copy-text="testResult.aiContext || ''"
                >
                  <pre v-if="testResult.aiContext">{{ testResult.aiContext }}</pre>
                  <div v-else class="text-caption grey--text">(nothing)</div>
                </OutputPanel>
              </v-col>
            </v-row>

            <!-- Products passed to the AI -->
            <div class="d-flex align-center mt-5 mb-2">
              <v-icon size="16" color="grey darken-1" class="mr-2">$tag</v-icon>
              <span class="text-caption font-weight-bold text-uppercase grey--text">
                Products passed to the AI
              </span>
              <v-chip v-if="products.length" x-small label class="font-weight-bold ml-2">
                {{ products.length }}
              </v-chip>
              <v-spacer />
              <span v-if="products.length" class="text-caption grey--text">
                Click a row to see the full item.
              </span>
            </div>
            <v-sheet v-if="products.length" outlined rounded="lg" max-height="360" class="overflow-y-auto">
              <v-simple-table dense class="products-table">
                <thead>
                  <tr>
                    <th class="expand-cell"></th>
                    <th v-for="col in productColumns" :key="col" class="text-no-wrap">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(product, i) in products">
                    <tr :key="`row-${i}`" class="product-row" @click="toggleProduct(i)">
                      <td class="expand-cell">
                        <v-icon size="14">
                          {{ expandedProduct === i ? "$chevron-down" : "$chevron-right" }}
                        </v-icon>
                      </td>
                      <td v-for="col in productColumns" :key="col" :title="formatCell(product[col])">
                        {{ formatCell(product[col]) }}
                      </td>
                    </tr>
                    <tr v-if="expandedProduct === i" :key="`detail-${i}`">
                      <td :colspan="productColumns.length + 1" class="pa-2">
                        <v-sheet color="grey darken-4" dark rounded="lg" max-height="320" class="overflow-y-auto pa-3">
                          <JsonTree :value="product" :expand-depth="3" />
                        </v-sheet>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </v-simple-table>
            </v-sheet>
            <div v-else class="text-body-2 grey--text">No products passed to the AI.</div>
          </template>

          <div class="d-flex align-start text-caption grey--text text--darken-1 mt-4">
            <v-icon size="14" color="grey" class="mr-2 mt-1">$info</v-icon>
            The AI quotes prices only from this live data. Without a product API it never quotes
            prices and sends customers to the product page.
          </div>
        </div>
      </v-card>

      <IntegrationCallLog kind="product" class="mt-4" />
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
  catalogStockLabel,
  detectionSources,
} from "@/utils/productModes";
import ProductCatalogCard from "@/components/integrations/ProductCatalogCard.vue";
import ProductApiFormat from "@/components/integrations/ProductApiFormat.vue";
import ProductApiPreview from "@/components/integrations/ProductApiPreview.vue";
import ApiAuthEditor from "@/components/integrations/ApiAuthEditor.vue";
import ExtraParamsEditor from "@/components/integrations/ExtraParamsEditor.vue";
import FieldMapEditor from "@/components/integrations/FieldMapEditor.vue";
import IntegrationCallLog from "@/components/integrations/IntegrationCallLog.vue";
import {
  authToForm,
  authFromForm,
  pairsToRows,
  rowsToPairs,
  fieldMapToForm,
  fieldMapFromForm,
  keyPaths,
} from "@/utils/integrationApi";
import { formatProductCell } from "@/utils/productFormat";

const ENDPOINT = "/clients/product-api-settings";
const MAX_KEYWORDS = 200;
const MAX_KEYWORD_LENGTH = 50;


export default {
  name: "ProductApiSettings",

  components: {
    HeadersEditor,
    JsonTree,
    OutputPanel,
    ProductCatalogCard,
    ProductApiFormat,
    ProductApiPreview,
    ApiAuthEditor,
    ExtraParamsEditor,
    FieldMapEditor,
    IntegrationCallLog,
  },

  data() {
    return {
      loading: false,
      saving: false,
      showFormat: false,
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
      authForm: authToForm(),
      paramRows: [],
      mapForm: fieldMapToForm(),
      showMapping: false,
      suggestions: [],
      PLACEHOLDERS: ["{{query}}", "{{limit}}"],
      savedExtras: "",
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

    mappingCount() {
      const { fieldMap } = fieldMapFromForm(this.mapForm);
      return fieldMap ? Object.keys(fieldMap).length : 0;
    },

    modeInfo() {
      return productModeInfo(this.testResult?.mode);
    },

    stockLabel() {
      return catalogStockLabel(this.testResult);
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
      return JSON.stringify({
        form: this.form,
        headers: this.headerRows,
        auth: this.authForm,
        params: this.paramRows,
        map: this.mapForm,
      });
    },

    // The optional fields, as sent to the API, or { error }
    extras() {
      const auth = authFromForm(this.authForm);
      if (auth.error) return { error: auth.error };
      const params = rowsToPairs(this.paramRows);
      if (params.error) return { error: params.error };
      const map = fieldMapFromForm(this.mapForm);
      if (map.error) return { error: map.error };
      return {
        values: { auth: auth.auth, extraParams: params.value, fieldMap: map.fieldMap },
      };
    },

    // The whole form in the PUT shape, or { error }
    settingsBody() {
      const { headers, error } = headersFromRows(this.headerRows);
      if (error) return { error };
      const extras = this.extras();
      if (extras.error) return { error: extras.error };
      return {
        body: {
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
          ...extras.values,
        },
      };
    },

    // Paths in their first product, offered in the mapping editor
    onFirstItem(item) {
      this.suggestions = keyPaths(item);
    },

    previewSettings() {
      const { body, error } = this.settingsBody();
      return error ? { error } : { settings: body };
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
      this.authForm = authToForm(cfg.auth);
      this.paramRows = pairsToRows(cfg.extraParams);
      this.mapForm = fieldMapToForm(cfg.fieldMap);
      this.savedExtras = JSON.stringify(this.extras().values || {});
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

      const { body, error } = this.settingsBody();
      if (error) {
        this.saveError = error;
        return;
      }
      // The optional fields go only when changed, so untouched setups stay as they are
      const saved = JSON.parse(this.savedExtras || "{}");
      ["auth", "extraParams", "fieldMap"].forEach((k) => {
        if (JSON.stringify(body[k]) === JSON.stringify(saved[k])) delete body[k];
      });
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
/* Keep product columns readable: one line per cell, full value on hover */
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
</style>
