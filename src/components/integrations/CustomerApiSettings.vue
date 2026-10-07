<template>
  <div>
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
            <div class="text-subtitle-1 font-weight-bold">Customer lookup</div>
            <div class="text-body-2 grey--text text--darken-1">
              The WhatsApp bot calls this API with the customer's phone number
              to fetch their bookings and bills.
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

          <v-divider class="my-4" />

          <HeadersEditor v-model="headerRows" />

          <v-expand-transition>
            <div v-if="form.enabled">
              <v-divider class="my-6" />
              <div class="group-title">Verification</div>
              <v-text-field
                v-model.trim="testPhone"
                label="Test phone number"
                placeholder="9876543210"
                hint="The server calls your API with this number before saving. Saving fails if the call fails."
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

      <!-- TEST PANEL -->
      <v-card outlined rounded="xl" class="pa-6">
        <div class="d-flex align-center mb-1">
          <v-icon small class="mr-2">$flask-conical</v-icon>
          <div class="text-subtitle-1 font-weight-bold">
            Test with phone number
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
            color="primary"
            rounded
            depressed
            height="40"
            type="submit"
            :loading="testing"
            :disabled="testing || !testPanelPhone"
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
          class="text-body-2 mt-2 mb-0"
        >
          {{ testError }}
        </v-alert>

        <template v-if="testResult">
          <div class="mt-4 mb-4">
            <v-chip small dark :color="testResult.found ? 'success' : 'grey'">
              <v-icon x-small left>
                {{
                  testResult.found
                    ? "$user-check"
                    : "$user-minus"
                }}
              </v-icon>
              {{
                testResult.found
                  ? "Customer found"
                  : "Not found — AI treats them as a new customer"
              }}
            </v-chip>
          </div>

          <v-alert
            v-if="ignoredFields.length"
            type="warning"
            text
            dense
            rounded="lg"
            class="text-body-2"
          >
            These fields are returned by your API but not used by the AI yet:
            {{ ignoredFields.join(", ") }}
          </v-alert>

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
                <div v-else class="output-empty">No API response</div>
              </OutputPanel>
            </v-col>
            <v-col cols="12" md="6">
              <OutputPanel
                title="What the AI sees"
                subtitle="This exact text is added to the AI's instructions when a real customer chats."
                :copy-text="testResult.aiContext || ''"
              >
                <pre v-if="testResult.aiContext">{{ testResult.aiContext }}</pre>
                <div v-else class="output-empty">
                  (nothing — customer section is empty)
                </div>
              </OutputPanel>
            </v-col>
          </v-row>
        </template>

        <div class="panel-note mt-4">
          <v-icon x-small class="mr-1">$info</v-icon>
          Real chats look up customers on WhatsApp only (by the sender's
          number). Results are cached for 5 minutes.
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

const ENDPOINT = "/clients/customer-api-settings";

export default {
  name: "CustomerApiSettings",

  components: { HeadersEditor, JsonTree, OutputPanel },

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
      return JSON.stringify({ form: this.form, headers: this.headerRows });
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

<style scoped>
.group-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
  margin-bottom: 12px;
}

.panel-note {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #757575;
}
</style>
