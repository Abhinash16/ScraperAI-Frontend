<template>
  <div>
    <!-- Page header -->
    <div class="mb-4">
      <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
        Integrations
      </h1>
      <div class="text-body-2 grey--text text--darken-1">
        Connect scraperAI to your website, AI provider and business systems.
      </div>
    </div>

    <v-row>
      <!-- ================= SECTION NAV ================= -->
      <v-col cols="12" md="3">
        <v-card outlined rounded="lg" class="pa-2 integration-nav">
          <template v-for="group in navGroups">
            <div
              :key="group.title + '-title'"
              class="text-caption font-weight-bold text-uppercase grey--text px-3 pt-3 pb-1"
            >
              {{ group.title }}
            </div>
            <v-list :key="group.title" dense nav class="py-0">
              <v-list-item
                v-for="item in group.items"
                :key="item.id"
                :disabled="item.disabled"
                :class="section === item.id ? 'green lighten-5' : ''"
                class="rounded-lg mb-1"
                @click="setSection(item.id)"
              >
                <v-icon
                  size="18"
                  class="mr-3 flex-grow-0"
                  :color="
                    section === item.id ? 'green darken-1' : 'grey darken-1'
                  "
                >
                  {{ item.icon }}
                </v-icon>
                <v-list-item-content>
                  <v-list-item-title
                    :class="
                      section === item.id
                        ? 'green--text text--darken-2 font-weight-bold'
                        : 'grey--text text--darken-3 font-weight-medium'
                    "
                  >
                    {{ item.name }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item-action v-if="item.badge" class="my-0">
                  <v-chip
                    x-small
                    label
                    outlined
                    :color="item.badge.color"
                    class="font-weight-bold px-2"
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
          <div class="d-flex align-center mb-4">
            <v-avatar
              size="44"
              tile
              color="green lighten-5"
              class="rounded-lg mr-4 flex-shrink-0"
            >
              <v-img
                v-if="activeItem.image"
                :src="activeItem.image"
                max-width="24"
                contain
              />
              <v-icon v-else size="22" color="green darken-1">{{
                activeItem.icon
              }}</v-icon>
            </v-avatar>
            <div>
              <div
                class="text-subtitle-1 font-weight-bold grey--text text--darken-4"
              >
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
            <!-- Status -->
            <v-sheet
              rounded="lg"
              :color="openaiConfigured ? 'green lighten-5' : 'amber lighten-5'"
              class="d-flex align-center pa-4 mb-4"
            >
              <v-avatar
                size="36"
                :color="openaiConfigured ? 'success' : 'amber darken-2'"
                class="mr-3 flex-shrink-0"
              >
                <v-icon size="18" color="white">
                  {{ openaiConfigured ? "$circle-check" : "$circle-alert" }}
                </v-icon>
              </v-avatar>
              <div>
                <div class="text-body-2 font-weight-bold grey--text text--darken-4">
                  {{ openaiConfigured ? "OpenAI is connected" : "OpenAI isn't connected yet" }}
                </div>
                <div class="text-caption grey--text text--darken-2">
                  <template v-if="openaiConfigured">
                    All chats are answered with {{ AI_MODEL }}.
                    Automatic replies are {{ chatgptEnabled ? "on" : "off" }}.
                  </template>
                  <template v-else>Connect your OpenAI account so the bot can answer chats.</template>
                </div>
              </div>
            </v-sheet>

            <!-- OpenAI account -->
            <v-card outlined rounded="lg" class="mb-4">
              <div class="d-flex align-center flex-wrap px-5 py-4">
                <v-avatar size="40" tile color="grey lighten-4" class="rounded-lg mr-3 flex-shrink-0">
                  <v-img :src="activeItem.image" max-width="22" contain />
                </v-avatar>
                <div class="flex-grow-1 mr-4 my-1">
                  <div class="d-flex align-center">
                    <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mr-2">
                      OpenAI account
                    </span>
                    <v-chip
                      x-small
                      label
                      :color="openaiConfigured ? 'green lighten-5' : 'grey lighten-4'"
                      :text-color="openaiConfigured ? 'success' : 'grey darken-1'"
                      class="font-weight-bold"
                    >
                      {{ openaiConfigured ? "Connected" : "Not connected" }}
                    </v-chip>
                  </div>
                  <div class="text-caption grey--text text--darken-1">
                    All chats are answered using this API key and model.
                  </div>
                </div>
                <v-btn
                  :outlined="openaiConfigured"
                  :depressed="!openaiConfigured"
                  color="primary"
                  class="my-1"
                  @click="connectChatGptDialog = true"
                >
                  <v-icon left size="16">{{ openaiConfigured ? "$pencil" : "$plug" }}</v-icon>
                  {{ openaiConfigured ? "Edit connection" : "Connect OpenAI" }}
                </v-btn>
              </div>
              <v-divider />
              <v-row no-gutters>
                <v-col cols="12" sm="6">
                  <div class="d-flex align-center px-5 py-3">
                    <v-icon size="16" color="grey" class="mr-3">$key-round</v-icon>
                    <div>
                      <div class="text-caption grey--text">API key</div>
                      <div class="text-body-2 grey--text text--darken-4">
                        {{ openaiConfigured ? "Saved (hidden)" : "Not set" }}
                      </div>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="d-flex align-center px-5 py-3">
                    <v-icon size="16" color="grey" class="mr-3">$brain</v-icon>
                    <div>
                      <div class="text-caption grey--text">Model</div>
                      <div class="text-body-2 grey--text text--darken-4">{{ AI_MODEL }}</div>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card>

            <!-- Automatic replies -->
            <v-card outlined rounded="lg">
              <div class="d-flex align-center px-5 py-4">
                <v-avatar
                  size="40"
                  tile
                  :color="chatgptEnabled ? 'green lighten-5' : 'grey lighten-4'"
                  class="rounded-lg mr-3 flex-shrink-0"
                >
                  <v-icon size="20" :color="chatgptEnabled ? 'success' : 'grey'">$bot</v-icon>
                </v-avatar>
                <div class="flex-grow-1 mr-4">
                  <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
                    Automatic AI replies
                  </div>
                  <div class="text-caption grey--text text--darken-1">
                    Let the AI answer customers on its own, without a human reviewing each reply.
                  </div>
                </div>
                <v-switch
                  v-model="chatgptEnabled"
                  color="success"
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
            <v-card v-if="!userLoaded" outlined rounded="lg" class="pa-4">
              <v-skeleton-loader type="list-item-two-line, list-item-two-line" />
            </v-card>

            <v-alert v-else-if="!canManageSettings" type="warning" text rounded="lg" class="text-body-2">
              You need the <code>settings:manage</code> permission to configure APIs.
            </v-alert>

            <template v-else>
              <v-tabs
                :value="apiConfigTab"
                color="primary"
                background-color="transparent"
                height="44"
                slider-size="3"
                show-arrows
                @change="setSubTab"
              >
                <v-tab
                  v-for="tab in apiConfigTabs"
                  :key="tab.id"
                  :tab-value="tab.id"
                  class="text-body-2 font-weight-bold"
                >
                  <v-icon size="16" class="mr-2">{{ tab.icon }}</v-icon>
                  {{ tab.name }}
                </v-tab>
              </v-tabs>
              <v-divider class="mb-4" />

              <CustomerApiSettings v-if="apiConfigTab === 'customer-api'" />
              <ProductApiSettings v-if="apiConfigTab === 'product-api'" />
            </template>
          </div>

          <!-- ================= WEBHOOKS ================= -->
          <div v-if="section === 'webhooks'">
            <v-tabs
              :value="webhookTab"
              color="primary"
              background-color="transparent"
              height="44"
              slider-size="3"
              show-arrows
              @change="setSubTab"
            >
              <v-tab
                v-for="hook in webhookTypes"
                :key="hook.id"
                :tab-value="hook.id"
                class="text-body-2 font-weight-bold"
              >
                {{ hook.name }}
                <v-icon
                  v-if="webhookStatus(hook.id) === 'on'"
                  size="10"
                  color="success"
                  class="ml-2"
                  title="Enabled"
                >
                  $circle
                </v-icon>
              </v-tab>
            </v-tabs>
            <v-divider class="mb-4" />

            <v-card outlined rounded="lg">
              <div class="d-flex align-center px-5 py-4">
                <v-avatar
                  size="40"
                  tile
                  :color="webhook.enabled ? 'green lighten-5' : 'grey lighten-4'"
                  class="rounded-lg mr-3 flex-shrink-0"
                >
                  <v-icon size="20" :color="webhook.enabled ? 'green darken-1' : 'grey'">$webhook</v-icon>
                </v-avatar>
                <div class="flex-grow-1 mr-4">
                  <div class="d-flex align-center">
                    <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mr-2">
                      {{ activeWebhook.name }} webhook
                    </span>
                    <v-chip
                      x-small
                      label
                      :color="webhook.enabled ? 'green lighten-5' : 'grey lighten-4'"
                      :text-color="webhook.enabled ? 'success' : 'grey darken-1'"
                      class="font-weight-bold"
                    >
                      {{ webhook.enabled ? "On" : "Off" }}
                    </v-chip>
                  </div>
                  <div class="text-caption grey--text text--darken-1">
                    {{ activeWebhook.description }}
                  </div>
                </div>
                <v-switch
                  v-model="webhook.enabled"
                  color="success"
                  inset
                  hide-details
                  class="mt-0 pt-0"
                  :aria-label="`${activeWebhook.name} webhook on or off`"
                />
              </div>
              <v-divider />

              <div class="pa-5">
                <v-alert v-if="autoDisabled" type="warning" text dense rounded="lg" class="text-body-2">
                  Switched off after repeated failures. Escalations are being emailed to your alert
                  addresses. Fix the endpoint and turn it on again.
                </v-alert>

                <div class="d-flex align-center mb-3">
                  <v-icon size="16" color="grey darken-1" class="mr-2">$link</v-icon>
                  <span class="text-caption font-weight-bold text-uppercase grey--text">Endpoint</span>
                </div>
                <v-row dense>
                  <v-col cols="12" sm="3">
                    <v-select v-model="webhook.method" :items="['POST', 'GET', 'PUT']" label="Method" outlined dense />
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

                <v-divider class="my-5" />

                <HeadersEditor v-model="webhook.headerRows" />

                <v-alert text dense color="primary" rounded="lg" class="text-body-2 mt-4 mb-0">
                  <template #prepend>
                    <v-icon color="primary" size="16" class="mr-3">$info</v-icon>
                  </template>
                  <span class="grey--text text--darken-3">
                    After 3 failed attempts, the webhook is disabled automatically.
                  </span>
                </v-alert>
              </div>

              <v-divider />
              <div class="d-flex align-center px-5 py-3">
                <span v-if="!webhook.url" class="text-caption grey--text">Add a URL to save.</span>
                <v-spacer />
                <v-btn
                  color="primary"
                  depressed
                  :disabled="!webhook.url"
                  :loading="webhookSaving"
                  @click="updateWebhook"
                >
                  <v-icon left size="16">$check</v-icon>
                  Save webhook
                </v-btn>
              </div>
            </v-card>

            <EscalationAlertEmails v-if="webhookTab === 'escalate' && canManageSettings" />
          </div>

          <!-- ================= API KEYS ================= -->
          <div v-if="section === 'api-keys'">
            <v-alert text dense color="amber darken-3" rounded="lg" class="text-body-2 py-3 mb-4">
              <template #prepend>
                <v-icon color="amber darken-3" size="18" class="mr-3">$triangle-alert</v-icon>
              </template>
              <span class="grey--text text--darken-3">
                Your API key is disabled until payment is made or the billing cycle lapses. Once we
                receive payment, the key is reactivated.
              </span>
            </v-alert>

            <v-card outlined rounded="lg">
              <div class="d-flex align-center px-5 py-4">
                <v-avatar size="40" tile color="primary lighten-5" class="rounded-lg mr-3 flex-shrink-0">
                  <v-icon size="20" color="primary">$key</v-icon>
                </v-avatar>
                <div>
                  <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Your API key</div>
                  <div class="text-caption grey--text text--darken-1">
                    The website widget uses it to find your chatbot.
                  </div>
                </div>
              </div>
              <v-divider />

              <div class="pa-5">
                <v-sheet color="grey darken-4" dark rounded="lg" class="pa-4 mb-4">
                  <div class="d-flex align-center mb-2">
                    <span class="text-caption font-weight-bold text-uppercase grey--text">API key</span>
                    <v-spacer />
                    <v-btn
                      x-small
                      depressed
                      color="success"
                      :disabled="!currentLoggedInUser.apiKey"
                      @click="copyApiKey"
                    >
                      <v-icon left size="12">$copy</v-icon>
                      Copy
                    </v-btn>
                  </div>
                  <div class="text-body-2 text-break grey--text text--lighten-3">
                    {{ currentLoggedInUser.apiKey || "N/A" }}
                  </div>
                </v-sheet>

                <v-sheet color="green lighten-5" rounded="lg" class="d-flex align-start flex-wrap pa-4">
                  <v-icon size="18" color="success" class="mr-3 mt-1 flex-shrink-0">$shield-check</v-icon>
                  <div class="flex-grow-1 text-body-2 grey--text text--darken-3 mr-3 mb-2">
                    <strong class="grey--text text--darken-4">This key is public by design.</strong>
                    It's in the widget script on your website, so anyone can see it. What protects it is
                    your list of allowed domains: once you add domains, the widget only works on those
                    sites.
                  </div>
                  <v-btn small outlined color="success" @click="setSection('widget')">
                    <v-icon left size="14">$globe-lock</v-icon>
                    Manage allowed domains
                  </v-btn>
                </v-sheet>
              </div>
            </v-card>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- ================= OPENAI DIALOG ================= -->
    <v-dialog v-model="connectChatGptDialog" max-width="520" persistent>
      <v-card rounded="lg">
        <div class="d-flex align-center pa-5">
          <v-avatar size="44" tile color="grey lighten-4" class="rounded-lg mr-4 flex-shrink-0">
            <v-img src="../../assets/images/chatgpt-icon.png" max-width="24" contain></v-img>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6 font-weight-bold grey--text text--darken-4">OpenAI settings</div>
            <div class="text-caption grey--text text--darken-1">
              Configure your chatbot intelligence
            </div>
          </div>
          <v-btn icon aria-label="Close" @click="connectChatGptDialog = false">
            <v-icon>$x</v-icon>
          </v-btn>
        </div>
        <v-divider />
        <v-progress-linear v-if="loading" indeterminate color="success" height="2" />

        <v-card-text class="pa-5">
          <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">
            API key{{ openaiConfigured ? "" : " *" }}
          </div>
          <div class="text-caption grey--text text--darken-1 mb-2">
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
          ></v-text-field>
          <SecretNotice class="mt-2 mb-5" />

          <div class="d-flex align-center mb-1">
            <span class="text-caption font-weight-bold text-uppercase grey--text">AI model</span>
            <v-chip x-small label color="grey lighten-4" class="font-weight-bold ml-2">
              Selection coming soon
            </v-chip>
          </div>
          <div class="text-caption grey--text text--darken-1 mb-2">
            All chats currently use {{ AI_MODEL }}.
          </div>
          <v-text-field
            :value="AI_MODEL"
            outlined
            dense
            disabled
            hide-details
          ></v-text-field>
        </v-card-text>

        <v-divider />
        <v-card-actions class="px-5 py-3">
          <v-spacer />
          <v-btn text :disabled="loading" @click="connectChatGptDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            depressed
            class="font-weight-bold"
            :loading="loading"
            :disabled="!chatgptApiKey"
            @click="updateChatGptSettings"
          >
            Save & continue
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
import EscalationAlertEmails from "@/components/integrations/EscalationAlertEmails.vue";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import SecretNotice from "@/components/SecretNotice.vue";
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
    EscalationAlertEmails,
    ThingsToKnow,
    SecretNotice,
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
        "api-config": this.apiConfigTab,
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

    // Only the escalate webhook falls back to alert emails, and only when
    // the backend switched it off, not the client.
    autoDisabled() {
      if (this.webhookTab !== "escalate") return false;
      const hook = this.currentLoggedInUser.webhooks?.escalate;
      return hook?.enabled === false && (hook.failureCount || 0) >= 3;
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

.integration-content {
  max-width: 900px;
}
</style>
