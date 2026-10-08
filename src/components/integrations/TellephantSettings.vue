<template>
  <div>
    <v-card v-if="loading && !info" outlined rounded="xl" class="pa-6">
      <v-progress-linear indeterminate color="primary" />
    </v-card>

    <v-alert v-else-if="forbidden" type="warning" outlined rounded="xl">
      You need the <code>settings:manage</code> permission to set up WhatsApp.
    </v-alert>

    <v-alert v-else-if="loadError && !info" type="error" outlined rounded="xl">
      {{ loadError }}
      <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
    </v-alert>

    <template v-else-if="info">
      <!-- ============ STEP 1: SENDING ============ -->
      <v-card outlined rounded="xl" class="step pa-6 mb-4">
        <div class="step-header">
          <span :class="['step-badge', { done: info.tellephantConfigured }]">
            <v-icon v-if="info.tellephantConfigured" small color="white">
              $check
            </v-icon>
            <template v-else>1</template>
          </span>
          <div class="flex-grow-1">
            <div class="text-subtitle-1 font-weight-bold">Connect sending</div>
            <div class="text-body-2 grey--text text--darken-1">
              The bot replies through your {{ info.provider || "Tellephant" }}
              account. The key is checked with the provider when you save.
              <span v-if="info.whatsappNumber">
                Number: <strong>{{ info.whatsappNumber }}</strong>
              </span>
            </div>
          </div>
        </div>

        <v-form class="d-flex align-start mt-4" @submit.prevent="saveKey">
          <v-text-field
            v-model.trim="apiKey"
            :label="
              info.tellephantConfigured
                ? 'API key saved (enter a new one to replace it)'
                : 'Tellephant / KwikEngage API key'
            "
            outlined
            dense
            autocomplete="new-password"
            class="mr-2"
            :type="showKey ? 'text' : 'password'"
            :append-icon="showKey ? '$eye-off' : '$eye'"
            :error-messages="keyError"
            @click:append="showKey = !showKey"
            @input="keyError = ''"
          />
          <v-btn
            color="primary"
            rounded
            depressed
            height="40"
            type="submit"
            :loading="savingKey"
            :disabled="!apiKey"
          >
            Save key
          </v-btn>
        </v-form>
        <SecretNotice class="mb-4" />

        <div class="d-flex align-center sub-row pa-4">
          <div class="flex-grow-1 mr-4">
            <div class="font-weight-medium">Automatic replies</div>
            <div
              v-if="!info.tellephantConfigured"
              class="text-caption grey--text text--darken-1"
            >
              Save an API key first.
            </div>
          </div>
          <v-switch
            :input-value="info.autoWhatsappEnabled"
            color="primary"
            inset
            hide-details
            class="mt-0 pt-0"
            :disabled="!info.tellephantConfigured || savingKey"
            :loading="toggling"
            @change="toggleAutoReply"
          />
        </div>
      </v-card>

      <!-- ============ STEP 2: WEBHOOK ============ -->
      <v-card outlined rounded="xl" class="step pa-6 mb-4">
        <div class="step-header">
          <span :class="['step-badge', { done: receivedViaKey }]">
            <v-icon v-if="receivedViaKey" small color="white">$check</v-icon>
            <template v-else>2</template>
          </span>
          <div class="flex-grow-1">
            <div class="text-subtitle-1 font-weight-bold">
              Add the webhook in your WhatsApp provider
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              In your Tellephant / KwikEngage dashboard, set this as the inbound
              message (incoming webhook) URL for your WhatsApp number.
            </div>
          </div>
        </div>

        <div class="webhook-box mt-4">
          <code class="webhook-url">{{ displayUrl }}</code>
          <div class="d-flex flex-shrink-0 ml-2">
            <v-btn x-small text dark @click="showUrl = !showUrl">
              <v-icon x-small class="mr-1">
                {{ showUrl ? "$eye-off" : "$eye" }}
              </v-icon>
              {{ showUrl ? "Hide" : "Show" }}
            </v-btn>
            <v-btn x-small depressed rounded color="primary" @click="copyUrl">
              <v-icon x-small class="mr-1">$copy</v-icon> Copy
            </v-btn>
          </div>
        </div>
        <div class="text-caption grey--text text--darken-1 mt-2">
          Method: {{ info.method || "POST" }} · Content-Type:
          {{ info.contentType || "application/json" }}
        </div>

        <v-alert
          type="warning"
          text
          dense
          rounded="lg"
          icon="$shield-alert"
          class="text-body-2 mt-4 mb-0"
        >
          Keep it secret: anyone with this URL can send messages as your
          customers.
        </v-alert>
      </v-card>

      <!-- ============ STEP 3: TEST ============ -->
      <v-card outlined rounded="xl" class="step pa-6 mb-4">
        <div class="step-header">
          <span :class="['step-badge', { done: receivedViaKey }]">
            <v-icon v-if="receivedViaKey" small color="white">$check</v-icon>
            <template v-else>3</template>
          </span>
          <div class="flex-grow-1">
            <div class="text-subtitle-1 font-weight-bold">Test</div>
            <div class="text-body-2 grey--text text--darken-1">
              Send any message to your business WhatsApp number from your
              phone, then click Refresh.
            </div>
          </div>
        </div>

        <div class="d-flex align-center flex-wrap sub-row pa-4 mt-4">
          <v-icon
            small
            class="mr-2"
            :color="
              !info.lastInbound ? 'grey' : receivedViaKey ? 'success' : 'warning'
            "
          >
            {{ info.lastInbound ? "$message-square-check" : "$message-square" }}
          </v-icon>
          <div class="flex-grow-1 text-body-2">
            <template v-if="info.lastInbound">
              Last message received:
              <strong>{{ info.lastInbound.at | moment("from", "now") }}</strong>
              <span :class="receivedViaKey ? 'success--text' : 'warning--text text--darken-2'">
                ({{ receivedViaKey ? "via new URL" : "via OLD URL" }})
              </span>
            </template>
            <span v-else class="grey--text text--darken-1">
              No messages received yet.
            </span>
          </div>
          <v-btn small rounded outlined color="primary" :loading="loading" @click="load">
            <v-icon small class="mr-1">$refresh-cw</v-icon> Refresh
          </v-btn>
        </div>
      </v-card>

      <!-- ============ STEP 4: OLD URL ============ -->
      <v-card
        v-if="info.legacyWebhookEnabled"
        outlined
        rounded="xl"
        class="step pa-6 mb-4"
      >
        <div class="step-header">
          <span class="step-badge">4</span>
          <div class="flex-grow-1">
            <div class="text-subtitle-1 font-weight-bold">
              Turn off the old URL
            </div>
          </div>
        </div>

        <v-alert
          type="warning"
          outlined
          dense
          rounded="lg"
          class="text-body-2 mt-4"
        >
          Your old webhook URL (based on your public widget key) still works and
          is insecure.
        </v-alert>

        <div class="d-flex align-center flex-wrap">
          <v-btn
            color="warning"
            rounded
            depressed
            class="mr-3"
            :disabled="!receivedViaKey"
            :loading="disablingLegacy"
            @click="confirmDisableLegacy"
          >
            Disable old URL
          </v-btn>
          <span v-if="!receivedViaKey" class="text-caption grey--text text--darken-1">
            Receive at least one message through the new URL first, or your bot
            will stop replying.
          </span>
        </div>
      </v-card>

      <!-- ============ HELP ============ -->
      <v-card outlined rounded="xl" class="pa-6 mb-4">
        <div class="d-flex align-center mb-3">
          <v-icon small class="mr-2">$circle-help</v-icon>
          <div class="text-subtitle-1 font-weight-bold">
            Why didn't the bot reply?
          </div>
        </div>
        <ul class="help-list text-body-2">
          <li>
            <strong>Nothing arrives:</strong> the worker isn't running, or the
            webhook URL isn't set in your provider. Check "Last message
            received" above.
          </li>
          <li>
            <strong>Chat escalated to a human:</strong> the bot stays silent on
            purpose (for 30 minutes by default after an escalation).
          </li>
          <li>
            <strong>Daily limit:</strong> 10 AI replies per customer per 24
            hours. After that the customer gets one "assigning to support"
            message, then silence.
          </li>
          <li>
            <strong>Media:</strong> images, video, documents, audio and stickers
            get a fixed acknowledgement, not an AI answer.
          </li>
          <li>
            <strong>Invalid Tellephant API key:</strong> replies can't be sent.
          </li>
        </ul>
      </v-card>

      <!-- ============ DANGER ZONE ============ -->
      <v-card outlined rounded="xl" class="danger-zone pa-6">
        <div class="d-flex align-center flex-wrap">
          <div class="flex-grow-1 mr-4 mb-2">
            <div class="text-subtitle-1 font-weight-bold error--text">
              Regenerate webhook URL
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              Use this if the URL has leaked. The current URL stops working
              immediately.
            </div>
          </div>
          <v-btn
            color="error"
            outlined
            rounded
            class="mb-2"
            :loading="regenerating"
            @click="confirmRegenerate"
          >
            Regenerate
          </v-btn>
        </div>
      </v-card>
    </template>

    <!-- ============ CONFIRM DIALOG ============ -->
    <v-dialog v-model="confirm.open" max-width="420">
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">
          {{ confirm.title }}
        </v-card-title>
        <v-card-text class="text-body-2">{{ confirm.text }}</v-card-text>
        <v-card-actions class="px-4 pb-4">
          <v-spacer />
          <v-btn text rounded @click="confirm.open = false">Cancel</v-btn>
          <v-btn
            depressed
            rounded
            :color="confirm.color"
            @click="runConfirm"
          >
            {{ confirm.action }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import SecretNotice from "@/components/SecretNotice.vue";

const ENDPOINT = "/clients/whatsapp-integration";

// WhatsApp (Tellephant / KwikEngage) setup. Emits "saved" after changes so
// the Integrations page can refresh its sidebar badge.
export default {
  name: "TellephantSettings",

  components: { SecretNotice },

  data() {
    return {
      info: null,
      loading: false,
      loadError: "",
      forbidden: false,

      apiKey: "",
      showKey: false,
      keyError: "",
      savingKey: false,
      toggling: false,

      showUrl: false,
      disablingLegacy: false,
      regenerating: false,

      confirm: { open: false, title: "", text: "", action: "", color: "", run: null },
    };
  },

  computed: {
    receivedViaKey() {
      return this.info?.lastInbound?.via === "key";
    },

    displayUrl() {
      const url = this.info?.webhookUrl || "";
      if (this.showUrl) return url;
      const marker = "/webhook/";
      const i = url.indexOf(marker);
      if (i === -1) return "••••••••";
      const secret = url.slice(i + marker.length);
      return `${url.slice(0, i + marker.length)}••••••••${secret.slice(-4)}`;
    },
  },

  mounted() {
    this.load();
  },

  methods: {
    apply(data) {
      this.info = data || {};
    },

    errorMessage(err, fallback) {
      return err.response?.data?.message || fallback;
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get(ENDPOINT);
        this.apply(data.data);
      } catch (err) {
        if (err.response?.status === 403) this.forbidden = true;
        else if (this.info) this.$toast.error(this.errorMessage(err, "Refresh failed"));
        else this.loadError = this.errorMessage(err, "Failed to load WhatsApp settings");
      } finally {
        this.loading = false;
      }
    },

    async saveKey() {
      if (!this.apiKey) return;
      this.savingKey = true;
      this.keyError = "";
      try {
        await apiClient.put("/clients/whatsapp-settings", {
          tellephantApiKey: this.apiKey,
          autoWhatsappEnabled: !!this.info.autoWhatsappEnabled,
        });
        this.apiKey = "";
        this.showKey = false;
        this.$toast.success("API key saved");
        await this.load();
        this.$emit("saved");
      } catch (err) {
        this.keyError = this.errorMessage(err, "Failed to save the API key");
      } finally {
        this.savingKey = false;
      }
    },

    // Sends only the toggle; the stored key is kept (key is never returned).
    async toggleAutoReply(value) {
      const previous = this.info.autoWhatsappEnabled;
      this.info.autoWhatsappEnabled = value;
      this.toggling = true;
      try {
        await apiClient.put("/clients/whatsapp-settings", {
          autoWhatsappEnabled: value,
        });
        this.$toast.success("Automatic replies setting saved");
        this.$emit("saved");
      } catch (err) {
        this.info.autoWhatsappEnabled = previous;
        this.$toast.error(this.errorMessage(err, "Update failed"));
      } finally {
        this.toggling = false;
      }
    },

    async copyUrl() {
      try {
        await navigator.clipboard.writeText(this.info.webhookUrl);
        this.$toast.success("Webhook URL copied");
      } catch {
        this.$toast.error("Couldn't copy to clipboard");
      }
    },

    openConfirm(options) {
      this.confirm = { ...options, open: true };
    },

    runConfirm() {
      const run = this.confirm.run;
      this.confirm.open = false;
      if (run) run();
    },

    confirmDisableLegacy() {
      this.openConfirm({
        title: "Disable the old webhook URL?",
        text: "Messages sent to the old URL (based on your public widget key) will be rejected. Make sure your provider uses the new URL.",
        action: "Disable old URL",
        color: "warning",
        run: this.disableLegacy,
      });
    },

    async disableLegacy() {
      this.disablingLegacy = true;
      try {
        const { data } = await apiClient.put(ENDPOINT, {
          legacyWebhookEnabled: false,
        });
        this.apply(data.data);
        this.$toast.success("Old webhook URL disabled");
      } catch (err) {
        this.$toast.error(this.errorMessage(err, "Failed to disable old URL"));
      } finally {
        this.disablingLegacy = false;
      }
    },

    confirmRegenerate() {
      this.openConfirm({
        title: "Regenerate webhook URL?",
        text: "The current URL stops working immediately; you must update it in your provider right away.",
        action: "Regenerate",
        color: "error",
        run: this.regenerate,
      });
    },

    async regenerate() {
      this.regenerating = true;
      try {
        const { data } = await apiClient.post(`${ENDPOINT}/regenerate-key`);
        this.apply(data.data);
        this.showUrl = true;
        this.$toast.success("New webhook URL created. Update it in your provider now.");
      } catch (err) {
        this.$toast.error(this.errorMessage(err, "Failed to regenerate URL"));
      } finally {
        this.regenerating = false;
      }
    },
  },
};
</script>

<style scoped>
.step-header {
  display: flex;
  align-items: flex-start;
}

.step-badge {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-right: 14px;
  margin-top: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  background: #eff2fb;
  color: var(--v-primary-base);
}

.step-badge.done {
  background: var(--v-success-base);
}

.sub-row {
  background: #f6f8fd;
  border-radius: 12px;
}

.webhook-box {
  display: flex;
  align-items: center;
  background: #0f172a;
  border-radius: 12px;
  padding: 10px 12px 10px 16px;
}

.webhook-url {
  flex: 1 1 auto;
  min-width: 0;
  background: transparent !important;
  color: #e2e8f0 !important;
  padding: 0 !important;
  box-shadow: none !important;
  font-family: monospace !important;
  font-size: 13px;
  font-weight: 400;
  word-break: break-all;
}

.help-list {
  padding-left: 20px;
  margin: 0;
}

.help-list li {
  margin-bottom: 8px;
  color: #424242;
}

.danger-zone {
  border-color: #f5c2c2 !important;
}
</style>
