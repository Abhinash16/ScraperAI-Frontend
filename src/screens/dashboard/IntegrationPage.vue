<template>
  <div>
    <!-- Page header -->
    <div class="mb-6">
      <div class="text-h5 font-weight-bold">Integrations</div>
      <div class="text-body-2 grey--text text--darken-1">
        Connect scraperAI to your website, AI provider and business systems.
      </div>
    </div>

    <v-row>
      <!-- ================= SECTION NAV ================= -->
      <v-col cols="12" md="3">
        <v-card outlined rounded="xl" class="pa-2 integration-nav">
          <template v-for="group in navGroups">
            <div :key="group.title + '-title'" class="nav-group-title">
              {{ group.title }}
            </div>
            <v-list :key="group.title" dense nav class="py-0">
              <v-list-item
                v-for="item in group.items"
                :key="item.id"
                :disabled="item.disabled"
                :class="{ 'nav-active': section === item.id }"
                class="rounded-lg"
                @click="setSection(item.id)"
              >
                <v-list-item-icon class="mr-3">
                  <v-icon small :color="section === item.id ? 'primary' : ''">
                    {{ item.icon }}
                  </v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title class="font-weight-medium">
                    {{ item.name }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action v-if="item.badge" class="my-0">
                  <v-chip
                    x-small
                    outlined
                    :color="item.badge.color"
                    class="px-2"
                  >
                    {{ item.badge.text }}
                  </v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </template>
        </v-card>
      </v-col>

      <!-- ================= CONTENT ================= -->
      <v-col cols="12" md="9">
        <div class="integration-content">
          <!-- Section header -->
          <div class="d-flex align-center mb-6">
            <v-avatar size="48" rounded="xl" color="#cde6ff" class="mr-4">
              <v-img
                v-if="activeItem.image"
                :src="activeItem.image"
                max-width="28"
                contain
              />
              <v-icon v-else color="black">{{ activeItem.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold">
                {{ activeItem.title || activeItem.name }}
              </div>
              <div class="text-body-2 grey--text text--darken-1">
                {{ activeItem.description }}
              </div>
            </div>
          </div>

          <ThingsToKnow v-if="sectionGuide" :feature="sectionGuide" />

          <!-- ================= WEBSITE WIDGET ================= -->
          <div v-if="section === 'widget'">
            <WidgetSettings
              :api-key="currentLoggedInUser.apiKey"
              :can-manage-settings="canManageSettings"
            />
          </div>

          <!-- ================= TELLEPHANT (WHATSAPP) ================= -->
          <div v-if="section === 'tellephant'">
            <TellephantSettings @saved="currentLoggedInUserInfo" />
          </div>

          <!-- ================= AI PROVIDER ================= -->
          <div v-if="section === 'ai-provider'">
            <v-card outlined rounded="xl" class="pa-6 mb-4">
              <div class="d-flex align-center flex-wrap">
                <div class="flex-grow-1 mr-4 mb-2">
                  <div class="d-flex align-center">
                    <div class="text-subtitle-1 font-weight-bold mr-2">
                      OpenAI account
                    </div>
                    <v-chip
                      x-small
                      outlined
                      :color="openaiConfigured ? 'success' : 'grey'"
                    >
                      {{ openaiConfigured ? "Connected" : "Not connected" }}
                    </v-chip>
                  </div>
                  <div class="text-body-2 grey--text text--darken-1">
                    All chats are answered using this API key and model.
                    <span v-if="openaiConfigured">
                      Model: <strong>{{ AI_MODEL }}</strong>
                    </span>
                  </div>
                </div>
                <v-btn
                  color="primary"
                  depressed
                  rounded
                  class="mb-2"
                  @click="connectChatGptDialog = true"
                >
                  {{ openaiConfigured ? "Edit connection" : "Connect OpenAI" }}
                </v-btn>
              </div>
            </v-card>

            <v-card outlined rounded="xl" class="pa-6">
              <div class="d-flex align-center">
                <div class="flex-grow-1 mr-4">
                  <div class="text-subtitle-1 font-weight-bold">
                    Automatic AI replies
                  </div>
                  <div class="text-body-2 grey--text text--darken-1">
                    Let the AI answer customers on its own, without a human
                    reviewing each reply.
                  </div>
                </div>
                <v-switch
                  v-model="chatgptEnabled"
                  color="primary"
                  inset
                  hide-details
                  class="mt-0 pt-0"
                  :loading="loading"
                  @change="updateChatGptStatus"
                />
              </div>
            </v-card>
          </div>

          <!-- ================= API CONFIG ================= -->
          <div v-if="section === 'api-config'">
            <v-card v-if="!userLoaded" outlined rounded="xl" class="pa-6">
              <v-progress-linear indeterminate color="primary" />
            </v-card>

            <v-alert
              v-else-if="!canManageSettings"
              type="warning"
              outlined
              rounded="xl"
            >
              You need the <code>settings:manage</code> permission to configure
              APIs.
            </v-alert>

            <template v-else>
              <v-tabs
                :value="apiConfigTab"
                color="primary"
                class="sub-tabs mb-6"
                show-arrows
                @change="setSubTab"
              >
                <v-tab
                  v-for="tab in apiConfigTabs"
                  :key="tab.id"
                  :tab-value="tab.id"
                  class="text-none"
                >
                  <v-icon small class="mr-2">{{ tab.icon }}</v-icon>
                  {{ tab.name }}
                </v-tab>
              </v-tabs>

              <CustomerApiSettings v-if="apiConfigTab === 'customer-api'" />
              <ProductApiSettings v-if="apiConfigTab === 'product-api'" />
            </template>
          </div>

          <!-- ================= WEBHOOKS ================= -->
          <div v-if="section === 'webhooks'">
            <v-tabs
              :value="webhookTab"
              color="primary"
              class="sub-tabs mb-6"
              show-arrows
              @change="setSubTab"
            >
              <v-tab
                v-for="hook in webhookTypes"
                :key="hook.id"
                :tab-value="hook.id"
                class="text-none"
              >
                {{ hook.name }}
                <span
                  v-if="webhookStatus(hook.id) === 'on'"
                  class="status-dot success ml-2"
                  title="Enabled"
                />
              </v-tab>
            </v-tabs>

            <v-card outlined rounded="xl" class="pa-6">
              <div class="d-flex align-start mb-4">
                <div class="flex-grow-1 mr-4">
                  <div class="text-subtitle-1 font-weight-bold">
                    {{ activeWebhook.name }} webhook
                  </div>
                  <div class="text-body-2 grey--text text--darken-1">
                    {{ activeWebhook.description }}
                  </div>
                </div>
                <v-switch
                  v-model="webhook.enabled"
                  color="primary"
                  inset
                  hide-details
                  class="mt-0 pt-0"
                  :label="webhook.enabled ? 'On' : 'Off'"
                />
              </div>

              <v-divider class="mb-6" />

              <div class="field-group-title">Endpoint</div>
              <v-row dense>
                <v-col cols="12" sm="3">
                  <v-select
                    v-model="webhook.method"
                    :items="['POST', 'GET', 'PUT']"
                    label="Method"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="12" sm="9">
                  <v-text-field
                    v-model.trim="webhook.url"
                    label="Webhook URL"
                    placeholder="https://example.com/hooks/scraperai"
                    outlined
                    dense
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <v-text-field
                    v-model.number="webhook.timeout"
                    label="Timeout (ms)"
                    type="number"
                    outlined
                    dense
                  />
                </v-col>
              </v-row>

              <v-divider class="mb-6" />

              <HeadersEditor v-model="webhook.headerRows" />

              <v-alert
                type="info"
                text
                dense
                rounded="lg"
                class="text-body-2 mt-4 mb-0"
              >
                After 3 failed attempts, the webhook is disabled automatically.
              </v-alert>

              <div class="d-flex justify-end mt-6">
                <v-btn
                  color="primary"
                  rounded
                  depressed
                  :disabled="!webhook.url"
                  :loading="webhookSaving"
                  @click="updateWebhook"
                >
                  Save webhook
                </v-btn>
              </div>
            </v-card>
          </div>

          <!-- ================= API KEYS ================= -->
          <div v-if="section === 'api-keys'">
            <v-alert
              border="left"
              colored-border
              color="warning"
              elevation="0"
              outlined
              rounded="xl"
              class="text-body-2 mb-4"
            >
              Your API key is disabled until payment is made or the billing
              cycle lapses. Once we receive payment, the key is reactivated.
            </v-alert>

            <v-card outlined rounded="xl" class="pa-6">
              <div class="code-box mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="code-label">API KEY</span>
                  <v-btn
                    x-small
                    color="primary"
                    depressed
                    rounded
                    :disabled="!currentLoggedInUser.apiKey"
                    @click="copyApiKey"
                  >
                    <v-icon x-small class="mr-1">$copy</v-icon> Copy
                  </v-btn>
                </div>
                <code class="code-text">
                  {{ currentLoggedInUser.apiKey || "N/A" }}
                </code>
              </div>

              <div class="d-flex align-start">
                <v-icon small color="primary" class="mr-2 mt-1">
                  $shield-check
                </v-icon>
                <div class="grey--text text--darken-3 text-body-2">
                  <strong>This key is public by design.</strong> It's in the
                  widget script on your website, so anyone can see it. What
                  protects it is your
                  <a @click="setSection('widget')">list of allowed domains</a>:
                  once you add domains, the widget only works on those sites.
                </div>
              </div>
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ================= OPENAI DIALOG ================= -->
    <v-dialog
      v-model="connectChatGptDialog"
      max-width="550"
      persistent
      rounded="xl"
      overlay-color="#2c3e50"
      overlay-opacity="0.8"
    >
      <v-card rounded="xl" :loading="loading">
        <v-card-title class="d-flex align-center pb-0">
          <v-avatar color="#eff2fb" rounded="xl" size="50" class="mr-4">
            <v-img src="../../assets/images/chatgpt-icon.png"></v-img>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold black--text">
              OpenAI Settings
            </div>
            <div class="text-caption grey--text text--darken-1">
              Configure your chatbot intelligence
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn icon @click="connectChatGptDialog = false">
            <v-icon>$x</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-6">
          <div class="mb-5">
            <label
              class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
            >
              API Key{{ openaiConfigured ? "" : " *" }}
            </label>
            <div class="text-caption mb-2">
              {{
                openaiConfigured
                  ? "A key is saved. Leave this empty to keep it, or enter a new key to replace it."
                  : "Connect your OpenAI account. Your key is never shown again after you save it."
              }}
            </div>
            <v-text-field
              v-model.trim="chatgptApiKey"
              :placeholder="openaiConfigured ? '•••••••• (saved)' : 'sk-...'"
              type="password"
              autocomplete="new-password"
              outlined
              dense
              hide-details="auto"
              color="primary"
              background-color="#f8fafc"
            ></v-text-field>
          </div>

          <div class="mb-2">
            <label
              class="text-subtitle-2 font-weight-bold black--text d-block mb-1"
            >
              AI Model
              <v-chip x-small outlined color="grey" class="ml-1">
                Selection coming soon
              </v-chip>
            </label>
            <div class="text-caption mb-2">
              All chats currently use {{ AI_MODEL }}.
            </div>
            <v-text-field
              :value="AI_MODEL"
              outlined
              dense
              disabled
              hide-details
              background-color="#f1f3f4"
            ></v-text-field>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-btn
            block
            x-large
            color="primary"
            @click="updateChatGptSettings"
            :loading="loading"
            :disabled="!chatgptApiKey"
            depressed
            rounded
            class="text-none font-weight-bold"
          >
            Save & Continue
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import CustomerApiSettings from "@/components/integrations/CustomerApiSettings.vue";
import ProductApiSettings from "@/components/integrations/ProductApiSettings.vue";
import HeadersEditor from "@/components/integrations/HeadersEditor.vue";
import TellephantSettings from "@/components/integrations/TellephantSettings.vue";
import WidgetSettings from "@/components/integrations/WidgetSettings.vue";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import { rowsFromHeaders, headersFromRows } from "@/utils/apiHeaders";
import chatgptIcon from "@/assets/images/chatgpt-icon.png";

// The backend always answers with this model; per-client model and system
// prompt settings aren't supported yet.
const AI_MODEL = "gpt-4o-mini";

const WEBHOOK_TYPES = [
  {
    id: "escalate",
    name: "Escalate",
    description: "Called when a conversation is escalated to your team.",
  },
  {
    id: "upsell",
    name: "Upsell",
    description: "Called when the assistant spots an upsell opportunity.",
  },
  {
    id: "followup",
    name: "Follow-up",
    description: "Called when a customer should be followed up with.",
  },
];

// Sub-tabs under API Config. Add future API integrations here.
const API_CONFIG_TABS = [
  { id: "customer-api", name: "Customer API", icon: "$user-search" },
  { id: "product-api", name: "Product API", icon: "$tag" },
];

export default {
  components: {
    CustomerApiSettings,
    ProductApiSettings,
    HeadersEditor,
    TellephantSettings,
    WidgetSettings,
    ThingsToKnow,
  },

  data() {
    return {
      loading: false,
      webhookSaving: false,
      userLoaded: false,
      chatgptEnabled: false,
      currentLoggedInUser: {},
      connectChatGptDialog: false,
      chatgptApiKey: "",
      AI_MODEL,

      webhookTypes: WEBHOOK_TYPES,
      apiConfigTabs: API_CONFIG_TABS,

      webhook: {
        enabled: true,
        url: "",
        method: "POST",
        headerRows: [],
        timeout: 5000,
      },
    };
  },

  computed: {
    // chatgptConfigured replaces the raw key in /currentUser; the key
    // fallback only covers the backend rollout.
    openaiConfigured() {
      const user = this.currentLoggedInUser;
      return user.chatgptConfigured ?? !!user.chatgptApiKey;
    },

    canManageSettings() {
      const permissions =
        this.currentLoggedInUser?.user?.roleId?.permissions || [];
      return (
        permissions.includes("*") || permissions.includes("settings:manage")
      );
    },

    navGroups() {
      const hasKey = this.openaiConfigured;
      const activeHooks = WEBHOOK_TYPES.filter(
        (h) => this.webhookStatus(h.id) === "on",
      ).length;

      const groups = [
        {
          title: "Channels",
          items: [
            {
              id: "widget",
              name: "Website Widget",
              icon: "$code",
              description:
                "Add the chat widget to your website and choose which domains can use it.",
            },
            this.canManageSettings && {
              id: "tellephant",
              name: "Tellephant",
              icon: "$whatsapp",
              title: "WhatsApp · Tellephant",
              description:
                "Connect your WhatsApp Business number and let the bot reply automatically.",
              badge: this.currentLoggedInUser.autoWhatsappEnabled
                ? { text: "On", color: "success" }
                : null,
            },
          ].filter(Boolean),
        },
        {
          title: "AI",
          items: [
            {
              id: "ai-provider",
              name: "AI Provider",
              icon: "$bot",
              image: chatgptIcon,
              title: "ChatGPT",
              description: "The OpenAI account and model that power your chats.",
              badge: hasKey ? { text: "On", color: "success" } : null,
            },
          ],
        },
        {
          title: "Automation",
          items: [
            this.canManageSettings && {
              id: "api-config",
              name: "API Config",
              icon: "$plug",
              description:
                "Connect your own systems so the assistant can answer with live data.",
            },
            {
              id: "webhooks",
              name: "Webhooks",
              icon: "$webhook",
              description:
                "Notify your systems when something happens in a conversation.",
              badge: activeHooks
                ? { text: `${activeHooks} on`, color: "success" }
                : null,
            },
          ].filter(Boolean),
        },
        {
          title: "Developer",
          items: [
            {
              id: "api-keys",
              name: "API Keys",
              icon: "$key",
              title: "API Key",
              description:
                "Your account key. The website widget uses it to find your chatbot.",
              badge: { text: "Legacy", color: "warning" },
            },
            {
              id: "database",
              name: "Database",
              icon: "$database",
              disabled: true,
              badge: { text: "Retired", color: "grey" },
            },
          ],
        },
      ];

      return groups;
    },

    navItems() {
      return this.navGroups.flatMap((g) => g.items);
    },

    section() {
      const requested = this.$route.query.section;
      if (requested === "api-config") return requested; // gated inside the section
      const item = this.navItems.find((i) => i.id === requested);
      return item && !item.disabled ? item.id : "widget";
    },

    activeItem() {
      if (this.section === "api-config") {
        return {
          icon: "$plug",
          name: "API Config",
          description:
            "Connect your own systems so the assistant can answer with live data.",
        };
      }
      return this.navItems.find((i) => i.id === this.section) || {};
    },

    // Widget has its own "Things to know" panel inside WidgetSettings.
    sectionGuide() {
      return {
        tellephant: "whatsapp",
        "ai-provider": "ai-provider",
        webhooks: "webhooks",
        "api-config": "webhooks",
      }[this.section];
    },

    apiConfigTab() {
      const tab = this.$route.query.tab;
      return API_CONFIG_TABS.some((t) => t.id === tab)
        ? tab
        : API_CONFIG_TABS[0].id;
    },

    webhookTab() {
      const tab = this.$route.query.tab;
      return WEBHOOK_TYPES.some((t) => t.id === tab)
        ? tab
        : WEBHOOK_TYPES[0].id;
    },

    activeWebhook() {
      return WEBHOOK_TYPES.find((w) => w.id === this.webhookTab);
    },
  },

  watch: {
    webhookTab() {
      this.loadWebhookData();
    },
  },

  mounted() {
    this.currentLoggedInUserInfo();
  },

  methods: {
    setSection(id) {
      if (id === this.section) return;
      this.$router.replace({ query: { section: id } }).catch(() => {});
    },

    setSubTab(tab) {
      this.$router
        .replace({ query: { ...this.$route.query, tab } })
        .catch(() => {});
    },

    webhookStatus(id) {
      const hook = this.currentLoggedInUser.webhooks?.[id];
      if (!hook || !hook.url) return "none";
      return hook.enabled === false ? "off" : "on";
    },

    async currentLoggedInUserInfo() {
      try {
        const { data } = await apiClient.get("/clients/currentUser");
        const user = data.data;

        this.currentLoggedInUser = user;
        this.chatgptApiKey = ""; // never pre-filled; only sent when replaced
        this.chatgptEnabled = user.chatgptEnabled;
        this.loadWebhookData();
      } catch {
        this.$toast.error("Failed to load integration settings");
      } finally {
        this.userLoaded = true;
      }
    },

    async updateChatGptStatus() {
      try {
        this.loading = true;
        await apiClient.post("/clients/settings/chatgpt", {
          chatgptEnabled: this.chatgptEnabled,
        });
        this.$toast.success(
          this.chatgptEnabled
            ? "Automatic AI replies turned on"
            : "Automatic AI replies turned off",
        );
        this.currentLoggedInUserInfo();
      } catch (err) {
        this.chatgptEnabled = !this.chatgptEnabled;
        this.$toast.error(err.response?.data?.message || "Update failed");
      } finally {
        this.loading = false;
      }
    },

    async updateChatGptSettings() {
      try {
        this.loading = true;
        await apiClient.post("/clients/settings/chatgpt", {
          chatgptApiKey: this.chatgptApiKey,
        });
        this.connectChatGptDialog = false;
        this.$toast.success("OpenAI settings saved");
        this.currentLoggedInUserInfo();
      } catch (err) {
        this.$toast.error(
          err.response?.data?.message || "Failed to save OpenAI settings",
        );
      } finally {
        this.loading = false;
      }
    },

    loadWebhookData() {
      const webhookData = this.currentLoggedInUser.webhooks?.[this.webhookTab];

      this.webhook = {
        enabled: webhookData?.enabled ?? true,
        url: webhookData?.url || "",
        method: webhookData?.method || "POST",
        headerRows: rowsFromHeaders(webhookData?.headers),
        timeout: webhookData?.timeout || 5000,
      };
    },

    async updateWebhook() {
      if (this.webhook.enabled && !this.webhook.url) {
        this.$toast.error("Please enter webhook URL first");
        return;
      }

      const { headers, error } = headersFromRows(this.webhook.headerRows);
      if (error) {
        this.$toast.error(error);
        return;
      }

      this.webhookSaving = true;
      try {
        const { data } = await apiClient.put("/clients/webhook", {
          intent: this.webhookTab,
          url: this.webhook.url,
          method: this.webhook.method,
          headers,
          timeout: Number(this.webhook.timeout),
          enabled: this.webhook.enabled,
        });

        this.$toast.success(data.message || "Webhook updated");
        this.currentLoggedInUserInfo();
      } catch (err) {
        this.$toast.error(
          err.response?.data?.message || "Webhook update failed",
        );
      } finally {
        this.webhookSaving = false;
      }
    },

    copyApiKey() {
      navigator.clipboard.writeText(this.currentLoggedInUser.apiKey);
      this.$toast.success("API key copied");
    },
  },
};
</script>

<style scoped>
.integration-nav {
  position: sticky;
  top: 88px;
}

.nav-group-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #9e9e9e;
  padding: 12px 12px 4px;
}

.nav-active {
  background: #eff2fb;
}

.nav-active .v-list-item__title {
  color: var(--v-primary-base);
  font-weight: 700 !important;
}

.integration-content {
  max-width: 900px;
}

.sub-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.field-group-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
  margin-bottom: 12px;
}

.code-box {
  background: #0f172a;
  padding: 14px 16px;
  border-radius: 12px;
}

.code-label {
  font-size: 11px;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.code-text {
  display: block;
  background: transparent !important;
  color: #e2e8f0 !important;
  padding: 0 !important;
  font-family: monospace !important;
  font-size: 13px;
  font-weight: 400;
  white-space: pre-wrap;
  word-break: break-all;
  box-shadow: none !important;
}
</style>
