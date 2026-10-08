<template>
  <div>
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
            <v-icon size="20" :color="form.enabled ? 'green darken-1' : 'grey'">$user-search</v-icon>
          </v-avatar>
          <div class="flex-grow-1 mr-4">
            <div class="d-flex align-center">
              <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mr-2">
                Customer lookup
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
              The WhatsApp bot calls this API with the customer's phone number to fetch their
              bookings and bills.
            </div>
          </div>
          <v-switch
            v-model="form.enabled"
            color="success"
            inset
            hide-details
            class="mt-0 pt-0"
            aria-label="Customer lookup on or off"
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
                placeholder="https://example.com/api/customer"
                outlined
                dense
                :rules="[urlRule]"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.trim="form.phoneParam"
                label="Phone parameter name"
                placeholder="phone"
                hint="Query param (GET) or body field (POST) carrying the phone number"
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
                :rules="[timeoutRule]"
              />
            </v-col>
          </v-row>

          <ExtraParamsEditor v-model="paramRows" :placeholders="PLACEHOLDERS" class="mt-2" />

          <v-divider class="my-5" />

          <ApiAuthEditor v-model="authForm" />

          <HeadersEditor v-model="headerRows" />

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
                    v-model.trim="testPhone"
                    label="Test phone number"
                    placeholder="9876543210"
                    hint="The server calls your API with this number before saving. Saving fails if the call fails."
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

      <!-- TEST PANEL -->
      <v-card outlined rounded="lg">
        <div class="d-flex align-center px-5 py-4">
          <v-avatar size="40" tile color="green lighten-5" class="rounded-lg mr-3 flex-shrink-0">
            <v-icon size="20" color="green darken-1">$flask-conical</v-icon>
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
              Test with a phone number
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
              v-model.trim="testPanelPhone"
              label="Test phone number"
              placeholder="919876543210"
              hint="Include the country code"
              outlined
              dense
              class="mr-2"
              autocomplete="off"
            />
            <v-btn
              color="success"
              depressed
              height="40"
              type="submit"
              :loading="testing"
              :disabled="testing || !testPanelPhone"
            >
              <v-icon left size="16">$play</v-icon>
              Run test
            </v-btn>
          </v-form>

          <v-alert v-if="testError" type="error" text dense rounded="lg" class="text-body-2 mt-2 mb-0">
            {{ testError }}
          </v-alert>

          <template v-if="testResult">
            <v-sheet
              rounded="lg"
              :color="testResult.found ? 'green lighten-5' : 'grey lighten-4'"
              class="d-flex align-center px-4 py-3 mt-4 mb-4"
            >
              <v-icon size="18" :color="testResult.found ? 'success' : 'grey darken-1'" class="mr-3">
                {{ testResult.found ? "$user-check" : "$user-minus" }}
              </v-icon>
              <span class="text-body-2 font-weight-bold grey--text text--darken-3">
                {{
                  testResult.found
                    ? "Customer found"
                    : "Not found: the AI treats them as a new customer"
                }}
              </span>
            </v-sheet>

            <v-alert v-if="ignoredFields.length" type="warning" text dense rounded="lg" class="text-body-2">
              These fields are returned by your API but not used by the AI yet:
              {{ ignoredFields.join(", ") }}
            </v-alert>

            <v-row dense>
              <v-col cols="12" md="6">
                <OutputPanel title="API response" :copy-text="formatJson(testResult.apiResponse)">
                  <JsonTree v-if="hasValue(testResult.apiResponse)" :value="testResult.apiResponse" />
                  <div v-else class="text-caption grey--text">No API response</div>
                </OutputPanel>
              </v-col>
              <v-col cols="12" md="6">
                <OutputPanel
                  title="What the AI sees"
                  subtitle="This exact text is added to the AI's instructions when a real customer chats."
                  :copy-text="testResult.aiContext || ''"
                >
                  <pre v-if="testResult.aiContext">{{ testResult.aiContext }}</pre>
                  <div v-else class="text-caption grey--text">(nothing: the customer section is empty)</div>
                </OutputPanel>
              </v-col>
            </v-row>
          </template>

          <div class="d-flex align-start text-caption grey--text text--darken-1 mt-4">
            <v-icon size="14" color="grey" class="mr-2 mt-1">$info</v-icon>
            Real chats look up customers on WhatsApp only (by the sender's number). Results are
            cached for 5 minutes.
          </div>
        </div>
      </v-card>

      <IntegrationCallLog kind="customer" class="mt-4" />
    </template>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import HeadersEditor from "@/components/integrations/HeadersEditor.vue";
import JsonTree from "@/components/integrations/JsonTree.vue";
import OutputPanel from "@/components/integrations/OutputPanel.vue";
import { rowsFromHeaders, headersFromRows } from "@/utils/apiHeaders";
import ApiAuthEditor from "@/components/integrations/ApiAuthEditor.vue";
import ExtraParamsEditor from "@/components/integrations/ExtraParamsEditor.vue";
import IntegrationCallLog from "@/components/integrations/IntegrationCallLog.vue";
import {
  authToForm,
  authFromForm,
  pairsToRows,
  rowsToPairs,
} from "@/utils/integrationApi";

const ENDPOINT = "/clients/customer-api-settings";

export default {
  name: "CustomerApiSettings",

  components: {
    HeadersEditor,
    JsonTree,
    OutputPanel,
    ApiAuthEditor,
    ExtraParamsEditor,
    IntegrationCallLog,
  },

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
        phoneParam: "phone",
        timeout: 3000,
      },
      headerRows: [],
      authForm: authToForm(),
      paramRows: [],
      PLACEHOLDERS: ["{{phone}}"],
      savedExtras: "",
      savedConfig: null,
      savedSnapshot: "",
      testPhone: "",

      testPanelPhone: "",
      testResult: null,
      lastTestAt: 0,
    };
  },

  computed: {
    dirty() {
      return this.snapshot() !== this.savedSnapshot;
    },

    ignoredFields() {
      const fields = this.testResult?.ignoredFields;
      return Array.isArray(fields) ? fields : [];
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

    timeoutRule(v) {
      return (v >= 500 && v <= 10000) || "Between 500 and 10000 ms";
    },

    snapshot() {
      return JSON.stringify({
        form: this.form,
        headers: this.headerRows,
        auth: this.authForm,
        params: this.paramRows,
      });
    },

    // The optional fields, as sent to the API, or { error }
    extras() {
      const auth = authFromForm(this.authForm);
      if (auth.error) return { error: auth.error };
      const params = rowsToPairs(this.paramRows);
      if (params.error) return { error: params.error };
      return { values: { auth: auth.auth, extraParams: params.value } };
    },

    applyConfig(data) {
      const cfg = data || {};
      this.savedConfig = cfg;
      this.form = {
        enabled: !!cfg.enabled,
        url: cfg.url || "",
        method: cfg.method || "GET",
        phoneParam: cfg.phoneParam || "phone",
        timeout: cfg.timeout || 3000,
      };
      this.headerRows = rowsFromHeaders(cfg.headers);
      this.authForm = authToForm(cfg.auth);
      this.paramRows = pairsToRows(cfg.extraParams);
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
            err.response?.data?.message || "Failed to load Customer API settings";
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
        phoneParam: this.form.phoneParam || "phone",
        headers,
        timeout: Number(this.form.timeout),
      };
      const extras = this.extras();
      if (extras.error) {
        this.saveError = extras.error;
        return;
      }
      // The optional fields go only when changed, so untouched setups stay as they are
      const saved = JSON.parse(this.savedExtras || "{}");
      Object.entries(extras.values).forEach(([k, v]) => {
        if (JSON.stringify(v) !== JSON.stringify(saved[k])) body[k] = v;
      });
      if (this.form.enabled && this.testPhone) body.testPhone = this.testPhone;

      this.saving = true;
      try {
        const { data } = await apiClient.put(ENDPOINT, body);
        this.applyConfig(data.data);
        this.$toast.success(data.message || "Customer API settings saved");
      } catch (err) {
        this.saveError =
          err.response?.data?.message || "Failed to save Customer API settings";
      } finally {
        this.saving = false;
      }
    },

    async runTest() {
      // Test calls hit the live API: ignore repeat clicks / Enter presses.
      if (!this.testPanelPhone || this.testing) return;
      if (Date.now() - this.lastTestAt < 800) return;
      this.lastTestAt = Date.now();

      this.testing = true;
      this.testError = "";
      this.testResult = null;
      try {
        const { data } = await apiClient.post(`${ENDPOINT}/test`, {
          phone: this.testPanelPhone.replace(/[\s()+-]/g, ""),
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
  },
};
</script>
