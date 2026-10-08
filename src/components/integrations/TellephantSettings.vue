<template>
  <div>
    <!-- LOADING / NO ACCESS / ERROR -->
    <v-card v-if="loading && !info" outlined rounded="lg" class="pa-4">
      <v-skeleton-loader type="list-item-avatar-two-line, list-item-two-line, list-item-two-line" />
    </v-card>

    <v-alert v-else-if="forbidden" type="warning" text rounded="lg" class="text-body-2">
      You need the <code>settings:manage</code> permission to set up WhatsApp.
    </v-alert>

    <v-alert v-else-if="loadError && !info" type="error" text rounded="lg" class="text-body-2">
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ loadError }}</span>
        <v-spacer />
        <v-btn small outlined color="error" @click="load">
          <v-icon left size="14">$refresh-cw</v-icon>
          Retry
        </v-btn>
      </div>
    </v-alert>

    <template v-else-if="info">
      <!-- ============ STATUS ============ -->
      <v-sheet
        rounded="lg"
        :color="info.tellephantConfigured && info.autoWhatsappEnabled && receivedViaKey ? 'green lighten-5' : 'amber lighten-5'"
        class="d-flex align-center pa-4 mb-4"
      >
        <v-avatar
          size="36"
          :color="info.tellephantConfigured && info.autoWhatsappEnabled && receivedViaKey ? 'success' : 'amber darken-2'"
          class="mr-3 flex-shrink-0"
        >
          <v-icon size="18" color="white">$whatsapp</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-body-2 font-weight-bold grey--text text--darken-4">
            <template v-if="info.tellephantConfigured && info.autoWhatsappEnabled && receivedViaKey">
              Your WhatsApp bot is live
            </template>
            <template v-else-if="!info.tellephantConfigured">Not connected yet: start with step 1</template>
            <template v-else-if="!receivedViaKey">Almost there: add the webhook and send a test message</template>
            <template v-else>Connected, but automatic replies are off</template>
          </div>
          <div class="text-caption grey--text text--darken-2">
            <template v-if="info.whatsappNumber">Number {{ info.whatsappNumber }} · </template>
            {{ info.provider || "Tellephant" }}
          </div>
        </div>
      </v-sheet>

      <!-- ============ STEP 1: SENDING ============ -->
      <v-card outlined rounded="lg" class="mb-4">
        <div class="d-flex align-start px-5 py-4">
          <v-avatar
            size="28"
            :color="info.tellephantConfigured ? 'success' : 'grey lighten-3'"
            class="mr-3 mt-1 flex-shrink-0"
          >
            <v-icon v-if="info.tellephantConfigured" size="14" color="white">$check</v-icon>
            <span v-else class="text-caption font-weight-bold grey--text text--darken-2">1</span>
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Connect sending</div>
            <div class="text-body-2 grey--text text--darken-1">
              The bot replies through your {{ info.provider || "Tellephant" }} account. The key is
              checked with the provider when you save.
              <span v-if="info.whatsappNumber">
                Number: <strong>{{ info.whatsappNumber }}</strong>
              </span>
            </div>
          </div>
        </div>
        <v-divider />

        <div class="pa-5">
          <v-form class="d-flex align-start" @submit.prevent="saveKey">
            <v-text-field
              v-model.trim="apiKey"
              :label="
                info.tellephantConfigured
                  ? 'API key saved (enter a new one to replace it)'
                  : 'Tellephant / KwikEngage API key'
              "
              prepend-inner-icon="$key-round"
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

          <v-sheet outlined rounded="lg" class="d-flex align-center px-4 py-3">
            <v-icon size="18" :color="info.autoWhatsappEnabled ? 'success' : 'grey'" class="mr-3">
              $bot
            </v-icon>
            <div class="flex-grow-1 mr-4">
              <div class="text-body-2 font-weight-bold grey--text text--darken-4">Automatic replies</div>
              <div class="text-caption grey--text text--darken-1">
                <template v-if="!info.tellephantConfigured">Save an API key first.</template>
                <template v-else-if="info.autoWhatsappEnabled">The bot answers WhatsApp messages.</template>
                <template v-else>The bot doesn't answer WhatsApp messages.</template>
              </div>
            </div>
            <v-switch
              :input-value="info.autoWhatsappEnabled"
              color="success"
              inset
              hide-details
              class="mt-0 pt-0"
              :disabled="!info.tellephantConfigured || savingKey"
              :loading="toggling"
              @change="toggleAutoReply"
            />
          </v-sheet>
        </div>
      </v-card>

      <!-- ============ STEP 2: WEBHOOK ============ -->
      <v-card outlined rounded="lg" class="mb-4">
        <div class="d-flex align-start px-5 py-4">
          <v-avatar size="28" :color="receivedViaKey ? 'success' : 'grey lighten-3'" class="mr-3 mt-1 flex-shrink-0">
            <v-icon v-if="receivedViaKey" size="14" color="white">$check</v-icon>
            <span v-else class="text-caption font-weight-bold grey--text text--darken-2">2</span>
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
              Add the webhook in your WhatsApp provider
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              In your Tellephant / KwikEngage dashboard, set this as the inbound message (incoming
              webhook) URL for your WhatsApp number.
            </div>
          </div>
        </div>
        <v-divider />

        <div class="pa-5">
          <v-sheet color="grey darken-4" dark rounded="lg" class="d-flex flex-wrap align-center pa-3">
            <div class="flex-grow-1 overflow-hidden mr-2 my-1">
              <div class="text-body-2 text-break grey--text text--lighten-3">{{ displayUrl }}</div>
            </div>
            <div class="d-flex flex-shrink-0 my-1">
              <v-btn x-small text @click="showUrl = !showUrl">
                <v-icon left size="12">{{ showUrl ? "$eye-off" : "$eye" }}</v-icon>
                {{ showUrl ? "Hide" : "Show" }}
              </v-btn>
              <v-btn x-small depressed color="success" class="ml-1" @click="copyUrl">
                <v-icon left size="12">$copy</v-icon>
                Copy
              </v-btn>
            </div>
          </v-sheet>
          <div class="d-flex flex-wrap mt-2">
            <v-chip x-small label outlined class="mr-2">Method: {{ info.method || "POST" }}</v-chip>
            <v-chip x-small label outlined>Content-Type: {{ info.contentType || "application/json" }}</v-chip>
          </div>

          <v-alert type="warning" text dense rounded="lg" icon="$shield-alert" class="text-body-2 mt-4 mb-0">
            Keep it secret: anyone with this URL can send messages as your customers.
          </v-alert>
        </div>
      </v-card>

      <!-- ============ STEP 3: TEST ============ -->
      <v-card outlined rounded="lg" class="mb-4">
        <div class="d-flex align-start px-5 py-4">
          <v-avatar size="28" :color="receivedViaKey ? 'success' : 'grey lighten-3'" class="mr-3 mt-1 flex-shrink-0">
            <v-icon v-if="receivedViaKey" size="14" color="white">$check</v-icon>
            <span v-else class="text-caption font-weight-bold grey--text text--darken-2">3</span>
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Test</div>
            <div class="text-body-2 grey--text text--darken-1">
              Send any message to your business WhatsApp number from your phone, then click Refresh.
            </div>
          </div>
        </div>
        <v-divider />

        <div class="pa-5">
          <v-sheet
            rounded="lg"
            :color="!info.lastInbound ? 'grey lighten-5' : receivedViaKey ? 'green lighten-5' : 'amber lighten-5'"
            class="d-flex align-center flex-wrap px-4 py-3"
          >
            <v-icon
              size="18"
              class="mr-3"
              :color="!info.lastInbound ? 'grey' : receivedViaKey ? 'success' : 'amber darken-2'"
            >
              {{ info.lastInbound ? "$message-square-check" : "$message-square" }}
            </v-icon>
            <div class="flex-grow-1 text-body-2 mr-2 my-1">
              <template v-if="info.lastInbound">
                Last message received:
                <strong>{{ info.lastInbound.at | moment("from", "now") }}</strong>
                <span
                  class="font-weight-bold"
                  :class="receivedViaKey ? 'success--text' : 'amber--text text--darken-3'"
                >
                  ({{ receivedViaKey ? "via new URL" : "via OLD URL" }})
                </span>
              </template>
              <span v-else class="grey--text text--darken-1">No messages received yet.</span>
            </div>
            <v-btn small outlined color="primary" class="my-1" :loading="loading" @click="load">
              <v-icon left size="14">$refresh-cw</v-icon>
              Refresh
            </v-btn>
          </v-sheet>
        </div>
      </v-card>

      <!-- ============ STEP 4: OLD URL ============ -->
      <v-card v-if="info.legacyWebhookEnabled" outlined rounded="lg" class="mb-4">
        <div class="d-flex align-start px-5 py-4">
          <v-avatar size="28" color="amber lighten-4" class="mr-3 mt-1 flex-shrink-0">
            <span class="text-caption font-weight-bold amber--text text--darken-4">4</span>
          </v-avatar>
          <div>
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Turn off the old URL</div>
            <div class="text-body-2 grey--text text--darken-1">
              Your old webhook URL (based on your public widget key) still works and is insecure.
            </div>
          </div>
        </div>
        <v-divider />
        <div class="d-flex align-center flex-wrap pa-5">
          <v-btn
            color="warning"
            depressed
            class="mr-3 my-1"
            :disabled="!receivedViaKey"
            :loading="disablingLegacy"
            @click="confirmDisableLegacy"
          >
            <v-icon left size="14">$unlink</v-icon>
            Disable old URL
          </v-btn>
          <span v-if="!receivedViaKey" class="text-caption grey--text text--darken-1 my-1">
            Receive at least one message through the new URL first, or your bot will stop replying.
          </span>
        </div>
      </v-card>

      <!-- ============ HELP ============ -->
      <v-card outlined rounded="lg" class="mb-4">
        <div class="d-flex align-center px-5 py-4">
          <v-icon size="18" color="primary" class="mr-2">$circle-help</v-icon>
          <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
            Why didn't the bot reply?
          </span>
        </div>
        <v-divider />
        <div class="d-flex align-start px-5 py-3">
          <v-icon size="16" color="grey darken-1" class="mr-3 mt-1">$unlink</v-icon>
          <div class="text-body-2 grey--text text--darken-2">
            <strong class="grey--text text--darken-4">Nothing arrives:</strong> the worker isn't
            running, or the webhook URL isn't set in your provider. Check "Last message received"
            above.
          </div>
        </div>
        <v-divider />
        <div class="d-flex align-start px-5 py-3">
          <v-icon size="16" color="grey darken-1" class="mr-3 mt-1">$headset</v-icon>
          <div class="text-body-2 grey--text text--darken-2">
            <strong class="grey--text text--darken-4">Chat escalated to a human:</strong> the bot
            stays silent on purpose (for 30 minutes by default after an escalation).
          </div>
        </div>
        <v-divider />
        <div class="d-flex align-start px-5 py-3">
          <v-icon size="16" color="grey darken-1" class="mr-3 mt-1">$clock</v-icon>
          <div class="text-body-2 grey--text text--darken-2">
            <strong class="grey--text text--darken-4">Daily limit:</strong> 10 AI replies per customer
            per 24 hours. After that the customer gets one "assigning to support" message, then
            silence.
          </div>
        </div>
        <v-divider />
        <div class="d-flex align-start px-5 py-3">
          <v-icon size="16" color="grey darken-1" class="mr-3 mt-1">$file</v-icon>
          <div class="text-body-2 grey--text text--darken-2">
            <strong class="grey--text text--darken-4">Media:</strong> images, video, documents, audio
            and stickers get a fixed acknowledgement, not an AI answer.
          </div>
        </div>
        <v-divider />
        <div class="d-flex align-start px-5 py-3">
          <v-icon size="16" color="grey darken-1" class="mr-3 mt-1">$key</v-icon>
          <div class="text-body-2 grey--text text--darken-2">
            <strong class="grey--text text--darken-4">Invalid Tellephant API key:</strong> replies
            can't be sent.
          </div>
        </div>
      </v-card>

      <!-- ============ DANGER ZONE ============ -->
      <v-card outlined rounded="lg">
        <v-sheet color="red lighten-5" class="d-flex align-center px-5 py-3 rounded-t-lg">
          <v-icon size="16" color="error" class="mr-2">$triangle-alert</v-icon>
          <span class="text-caption font-weight-bold text-uppercase error--text">Danger zone</span>
        </v-sheet>
        <div class="d-flex align-center flex-wrap px-5 py-4">
          <div class="flex-grow-1 mr-4 my-1">
            <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
              Regenerate webhook URL
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              Use this if the URL has leaked. The current URL stops working immediately.
            </div>
          </div>
          <v-btn color="error" outlined class="my-1" :loading="regenerating" @click="confirmRegenerate">
            <v-icon left size="14">$refresh-cw</v-icon>
            Regenerate
          </v-btn>
        </div>
      </v-card>
    </template>

    <!-- ============ CONFIRM DIALOG ============ -->
    <v-dialog v-model="confirm.open" max-width="420">
      <v-card rounded="lg">
        <v-card-text class="pt-6 text-center">
          <v-avatar :color="`${confirm.color} lighten-5`" size="56" class="mb-4">
            <v-icon :color="confirm.color" size="26">$triangle-alert</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-2">{{ confirm.title }}</div>
          <div class="text-body-2 grey--text text--darken-1">{{ confirm.text }}</div>
        </v-card-text>
        <v-card-actions class="justify-center pb-5">
          <v-btn text @click="confirm.open = false">Cancel</v-btn>
          <v-btn depressed :color="confirm.color" @click="runConfirm">{{ confirm.action }}</v-btn>
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
