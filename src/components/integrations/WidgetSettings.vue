<template>
  <div>
    <!-- ============ EMBED SCRIPT ============ -->
    <v-card outlined rounded="lg" class="pa-6 mb-4">
      <div class="text-subtitle-1 font-weight-bold mb-1">Embed script</div>
      <div class="text-body-2 grey--text text--darken-1 mb-4">
        Paste this before the closing <code>&lt;/body&gt;</code> tag of your
        site's <code>index.html</code>. The chat widget appears on every page
        that loads it.
      </div>

      <div class="code-box">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="code-label">HTML</span>
          <v-btn x-small color="primary" depressed rounded @click="copyScript">
            <v-icon x-small class="mr-1">$copy</v-icon> Copy
          </v-btn>
        </div>
        <code class="code-text">{{ scriptTag }}</code>
      </div>

      <v-btn
        text
        rounded
        color="primary"
        class="mt-4 px-2"
        to="/dashboard/documentation"
      >
        <v-icon small class="mr-1">$book-open</v-icon>
        View installation guide
      </v-btn>
    </v-card>

    <!-- ============ ALLOWED DOMAINS ============ -->
    <v-card v-if="canManageSettings" outlined rounded="lg" class="pa-6 mb-4">
      <div class="text-subtitle-1 font-weight-bold mb-1">Allowed domains</div>
      <div class="text-body-2 grey--text text--darken-1 mb-4">
        The widget only works on these websites. Use <code>example.com</code>
        for one site or <code>*.example.com</code> for all its subdomains. Up
        to {{ MAX_ORIGINS }} entries.
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-alert
        v-else-if="loadError"
        type="error"
        outlined
        rounded="lg"
        class="mb-0"
      >
        {{ loadError }}
        <v-btn small text color="error" class="ml-2" @click="load">
          Retry
        </v-btn>
      </v-alert>

      <template v-else>
        <v-alert
          v-if="!saved.length"
          border="left"
          colored-border
          color="warning"
          elevation="0"
          outlined
          rounded="lg"
          class="text-body-2"
        >
          <strong>Any website can load your widget right now.</strong> Add your
          domains so nobody else can embed your chatbot with your key.
        </v-alert>

        <div v-if="origins.length" class="mb-3">
          <v-chip
            v-for="origin in origins"
            :key="origin"
            close
            outlined
            class="mr-2 mb-2"
            @click:close="removeOrigin(origin)"
          >
            {{ origin }}
          </v-chip>
        </div>

        <v-form class="d-flex align-start" @submit.prevent="addOrigin">
          <v-text-field
            v-model.trim="draft"
            placeholder="example.com or *.example.com"
            outlined
            dense
            hide-details="auto"
            :error-messages="draftError"
            :disabled="origins.length >= MAX_ORIGINS"
            background-color="#f8fafc"
            class="mr-2"
            @input="draftError = ''"
          />
          <v-btn
            type="submit"
            depressed
            rounded
            height="40"
            :disabled="!draft || origins.length >= MAX_ORIGINS"
            class="text-none"
          >
            Add
          </v-btn>
        </v-form>

        <v-alert
          v-if="saveError"
          type="error"
          dense
          outlined
          rounded="lg"
          class="mt-4 mb-0 text-body-2"
        >
          {{ saveError }}
        </v-alert>

        <div class="d-flex justify-end mt-4">
          <v-btn
            v-if="dirty"
            text
            rounded
            class="text-none mr-2"
            :disabled="saving"
            @click="reset"
          >
            Discard
          </v-btn>
          <v-btn
            color="primary"
            depressed
            rounded
            class="text-none font-weight-bold"
            :disabled="!dirty"
            :loading="saving"
            @click="save"
          >
            Save domains
          </v-btn>
        </div>
      </template>
    </v-card>

    <!-- ============ SUPPORT WHATSAPP ============ -->
    <v-card v-if="canManageSettings" outlined rounded="lg" class="pa-6 mb-4">
      <div class="text-subtitle-1 font-weight-bold mb-1">
        Support WhatsApp number (for escalations)
      </div>
      <div class="text-body-2 grey--text text--darken-1 mb-4">
        When a website chat is escalated, the bot's reply links to this number
        on WhatsApp. Enter it with the country code. Leave it empty and
        customers see no WhatsApp link, only a note that your team will
        contact them.
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <template v-else-if="!loadError">
        <v-form @submit.prevent="saveWhatsapp">
          <v-text-field
            v-model.trim="whatsapp"
            placeholder="919876543210"
            outlined
            dense
            hide-details="auto"
            :error-messages="whatsappError"
            background-color="#f8fafc"
            prepend-inner-icon="$whatsapp"
            @input="whatsappError = ''"
          />
        </v-form>

        <div class="d-flex justify-end mt-4">
          <v-btn
            v-if="whatsappDirty"
            text
            rounded
            class="text-none mr-2"
            :disabled="savingWhatsapp"
            @click="resetWhatsapp"
          >
            Discard
          </v-btn>
          <v-btn
            color="primary"
            depressed
            rounded
            class="text-none font-weight-bold"
            :disabled="!whatsappDirty"
            :loading="savingWhatsapp"
            @click="saveWhatsapp"
          >
            Save number
          </v-btn>
        </div>
      </template>
    </v-card>

    <!-- ============ THINGS TO KNOW ============ -->
    <v-card outlined rounded="lg" class="pa-6">
      <div class="text-subtitle-1 font-weight-bold mb-3">Things to know</div>
      <div v-for="point in thingsToKnow" :key="point.title" class="d-flex mb-3">
        <v-icon small color="primary" class="mr-3 mt-1">
          {{ point.icon }}
        </v-icon>
        <div class="text-body-2">
          <strong>{{ point.title }}</strong>
          <span class="grey--text text--darken-2"> {{ point.text }}</span>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

const ENDPOINT = "/clients/widget-settings";
const MAX_ORIGINS = 20;
// Mirrors the backend rule: a hostname, optionally prefixed with "*.".
const ORIGIN_RE =
  /^(\*\.)?([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
// Mirrors the backend rule: strip spaces, dashes, brackets and a leading "+",
// then 10–15 digits.
const stripPhone = (input) => input.replace(/[\s\-()]/g, "").replace(/^\+/, "");
const PHONE_RE = /^\d{10,15}$/;

const THINGS_TO_KNOW = [
  {
    icon: "$globe-lock",
    title: "Listed domains only.",
    text: "Once you add any domain, the chat only works on the websites in this list. Leave it empty and it works everywhere.",
  },
  {
    icon: "$user-lock",
    title: "Private visitor sessions.",
    text: "Each visitor gets their own session issued by our server, so no one can read another visitor's chat.",
  },
  {
    icon: "$key-round",
    title: "The key in the script is public.",
    text: "Anyone can see it in your page source, and that's expected. The domain list is what stops other sites from using it.",
  },
  {
    icon: "$history",
    title: "Existing chats are kept.",
    text: "Visitors who chatted before this update still see their previous conversation.",
  },
  {
    icon: "$whatsapp",
    title: "Set your support WhatsApp number.",
    text: "Escalated website chats link to it so customers can reach your team. Without it, customers see no WhatsApp link.",
  },
];

// Normalises what people paste ("https://www.Example.com/path") to a hostname.
function normalise(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/[/?#:].*$/, "");
}

export default {
  name: "WidgetSettings",

  props: {
    apiKey: { type: String, default: "" },
    canManageSettings: { type: Boolean, default: false },
  },

  data() {
    return {
      MAX_ORIGINS,
      thingsToKnow: THINGS_TO_KNOW,

      saved: [],
      origins: [],
      draft: "",
      draftError: "",

      loading: false,
      loadError: "",
      saving: false,
      saveError: "",

      savedWhatsapp: "",
      whatsapp: "",
      whatsappError: "",
      savingWhatsapp: false,
    };
  },

  computed: {
    scriptTag() {
      const close = "</" + "script>";
      return `<script src="https://scraper.ai/chatpanel.js" id="chatPanelScript" data-api-key="${
        this.apiKey || "YOUR_API_KEY"
      }">${close}`;
    },

    dirty() {
      return (
        this.origins.length !== this.saved.length ||
        this.origins.some((o, i) => o !== this.saved[i])
      );
    },

    whatsappDirty() {
      return this.whatsapp !== this.savedWhatsapp;
    },
  },

  watch: {
    canManageSettings: {
      immediate: true,
      handler(can) {
        if (can) this.load();
      },
    },
  },

  methods: {
    applyOrigins(data) {
      this.saved = [...(data?.allowedOrigins || [])];
      this.origins = [...this.saved];
    },

    applyWhatsapp(data) {
      this.savedWhatsapp = data?.supportWhatsapp || "";
      this.whatsapp = this.savedWhatsapp;
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get(ENDPOINT);
        this.applyOrigins(data.data);
        this.applyWhatsapp(data.data);
      } catch (err) {
        this.loadError =
          err.response?.data?.message || "Failed to load widget settings";
      } finally {
        this.loading = false;
      }
    },

    addOrigin() {
      const origin = normalise(this.draft);
      if (!ORIGIN_RE.test(origin)) {
        this.draftError = "Enter a domain like example.com or *.example.com";
        return;
      }
      if (this.origins.includes(origin)) {
        this.draftError = "Already in the list";
        return;
      }
      if (this.origins.length >= MAX_ORIGINS) {
        this.draftError = `You can add up to ${MAX_ORIGINS} domains`;
        return;
      }
      this.origins.push(origin);
      this.draft = "";
      this.saveError = "";
    },

    removeOrigin(origin) {
      this.origins = this.origins.filter((o) => o !== origin);
      this.saveError = "";
    },

    reset() {
      this.origins = [...this.saved];
      this.draft = "";
      this.draftError = "";
      this.saveError = "";
    },

    async save() {
      this.saving = true;
      this.saveError = "";
      try {
        const { data } = await apiClient.put(ENDPOINT, {
          allowedOrigins: this.origins,
        });
        this.applyOrigins(data.data);
        this.$toast.success("Allowed domains saved");
      } catch (err) {
        this.saveError =
          err.response?.data?.message || "Failed to save allowed domains";
      } finally {
        this.saving = false;
      }
    },

    resetWhatsapp() {
      this.whatsapp = this.savedWhatsapp;
      this.whatsappError = "";
    },

    async saveWhatsapp() {
      const supportWhatsapp = stripPhone(this.whatsapp);
      if (supportWhatsapp && !PHONE_RE.test(supportWhatsapp)) {
        this.whatsappError =
          "Enter 10–15 digits with the country code, e.g. 919876543210";
        return;
      }
      this.savingWhatsapp = true;
      this.whatsappError = "";
      try {
        const { data } = await apiClient.put(ENDPOINT, { supportWhatsapp });
        this.applyWhatsapp(data.data);
        this.$toast.success(
          supportWhatsapp ? "Support number saved" : "Support number removed"
        );
      } catch (err) {
        this.whatsappError =
          err.response?.data?.message || "Failed to save the support number";
      } finally {
        this.savingWhatsapp = false;
      }
    },

    copyScript() {
      navigator.clipboard.writeText(this.scriptTag);
      this.$toast.success("Script copied");
    },
  },
};
</script>

<style scoped>
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
