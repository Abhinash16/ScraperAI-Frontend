<template>
  <div>
    <!-- ============ STATUS ============ -->
    <v-sheet
      v-if="canManageSettings && !loading && !loadError"
      rounded="lg"
      :color="saved.length ? 'green lighten-5' : 'amber lighten-5'"
      class="d-flex align-center pa-4 mb-4"
    >
      <v-avatar
        size="36"
        :color="saved.length ? 'success' : 'amber darken-2'"
        class="mr-3 flex-shrink-0"
      >
        <v-icon size="18" color="white">{{
          saved.length ? "$shield-check" : "$shield-alert"
        }}</v-icon>
      </v-avatar>
      <div>
        <div
          class="text-body-2 font-weight-bold"
          :class="
            saved.length
              ? 'green--text text--darken-3'
              : 'amber--text text--darken-4'
          "
        >
          <template v-if="saved.length">
            Locked to {{ saved.length }} domain{{
              saved.length === 1 ? "" : "s"
            }}
          </template>
          <template v-else>Any website can load your widget</template>
        </div>
        <div class="text-caption grey--text text--darken-2">
          <template v-if="saved.length">{{ saved.join(", ") }}</template>
          <template v-else
            >Add your domains below so nobody else can embed your
            chatbot.</template
          >
        </div>
      </div>
    </v-sheet>

    <!-- ============ EMBED SCRIPT ============ -->
    <v-card outlined rounded="lg" class="mb-4">
      <div class="d-flex align-center px-5 py-4">
        <v-avatar
          size="32"
          tile
          color="primary lighten-5"
          class="rounded-lg mr-3 flex-shrink-0"
        >
          <v-icon size="16" color="primary">$code</v-icon>
        </v-avatar>
        <div>
          <div
            class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
          >
            Embed script
          </div>
          <div class="text-caption grey--text text--darken-1">
            Paste this before the closing <code>&lt;/body&gt;</code> tag of your
            site's <code>index.html</code>. The chat widget appears on every
            page that loads it.
          </div>
        </div>
      </div>
      <v-divider />
      <div class="pa-5">
        <v-sheet color="grey darken-4" dark rounded="lg" class="pa-4">
          <div class="d-flex align-center mb-2">
            <span
              class="text-caption font-weight-bold text-uppercase grey--text"
              >HTML</span
            >
            <v-spacer />
            <v-btn x-small depressed color="success" @click="copyScript">
              <v-icon left size="12">$copy</v-icon>
              Copy
            </v-btn>
          </div>
          <pre
            class="text-body-2 text-pre-wrap text-break grey--text text--lighten-3"
            >{{ scriptTag }}</pre
          >
        </v-sheet>

        <v-btn
          small
          text
          color="primary"
          class="mt-3 px-2"
          to="/dashboard/documentation"
        >
          <v-icon left size="14">$book-open</v-icon>
          View installation guide
        </v-btn>
      </div>
    </v-card>

    <!-- ============ ALLOWED DOMAINS ============ -->
    <v-card v-if="canManageSettings" outlined rounded="lg" class="mb-4">
      <div class="d-flex align-center px-5 py-4">
        <v-avatar
          size="32"
          tile
          color="green lighten-5"
          class="rounded-lg mr-3 flex-shrink-0"
        >
          <v-icon size="16" color="green darken-1">$globe-lock</v-icon>
        </v-avatar>
        <div>
          <div
            class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
          >
            Allowed domains
            <span v-if="origins.length" class="text-caption grey--text">
              ({{ origins.length }}/{{ MAX_ORIGINS }})
            </span>
          </div>
          <div class="text-caption grey--text text--darken-1">
            The widget only works on these websites. Use
            <code>example.com</code> for one site or
            <code>*.example.com</code> for all its subdomains. Up to
            {{ MAX_ORIGINS }} entries.
          </div>
        </div>
      </div>
      <v-divider />

      <div class="pa-5">
        <v-skeleton-loader v-if="loading" type="list-item, list-item" />

        <v-alert
          v-else-if="loadError"
          type="error"
          text
          rounded="lg"
          class="text-body-2 mb-0"
        >
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
          <div v-if="origins.length" class="d-flex flex-wrap mb-3">
            <v-chip
              v-for="origin in origins"
              :key="origin"
              close
              label
              color="green lighten-5"
              text-color="green darken-3"
              class="font-weight-bold mr-2 mb-2"
              @click:close="removeOrigin(origin)"
            >
              <v-icon left size="14">$globe</v-icon>
              {{ origin }}
            </v-chip>
          </div>
          <div v-else class="text-body-2 grey--text mb-3">
            No domains added yet.
          </div>

          <v-form class="d-flex align-start" @submit.prevent="addOrigin">
            <v-text-field
              v-model.trim="draft"
              placeholder="example.com or *.example.com"
              prepend-inner-icon="$globe"
              outlined
              dense
              hide-details="auto"
              :error-messages="draftError"
              :disabled="origins.length >= MAX_ORIGINS"
              class="mr-2"
              @input="draftError = ''"
            />
            <v-btn
              type="submit"
              depressed
              color="success"
              height="40"
              :disabled="!draft || origins.length >= MAX_ORIGINS"
            >
              <v-icon left size="16">$plus</v-icon>
              Add
            </v-btn>
          </v-form>

          <v-alert
            v-if="saveError"
            type="error"
            dense
            text
            rounded="lg"
            class="mt-4 mb-0 text-body-2"
          >
            {{ saveError }}
          </v-alert>
        </template>
      </div>

      <template v-if="!loading && !loadError">
        <v-divider />
        <div class="d-flex align-center px-5 py-3">
          <span
            v-if="dirty"
            class="text-caption amber--text text--darken-3 font-weight-bold"
          >
            Unsaved changes
          </span>
          <v-spacer />
          <v-btn
            v-if="dirty"
            text
            :disabled="saving"
            class="mr-2"
            @click="reset"
            >Discard</v-btn
          >
          <v-btn
            color="primary"
            depressed
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
    <v-card v-if="canManageSettings" outlined rounded="lg" class="mb-4">
      <div class="d-flex align-center px-5 py-4">
        <v-avatar
          size="32"
          tile
          color="green lighten-5"
          class="rounded-lg mr-3 flex-shrink-0"
        >
          <v-icon size="16" color="green darken-1">$whatsapp</v-icon>
        </v-avatar>
        <div>
          <div
            class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
          >
            Support WhatsApp number (for escalations)
          </div>
          <div class="text-caption grey--text text--darken-1">
            When a website chat is escalated, the bot's reply links to this
            number on WhatsApp. Enter it with the country code. Leave it empty
            and customers see no WhatsApp link, only a note that your team will
            contact them.
          </div>
        </div>
      </div>
      <v-divider />

      <div class="pa-5">
        <v-skeleton-loader v-if="loading" type="list-item" />

        <v-form v-else-if="!loadError" @submit.prevent="saveWhatsapp">
          <v-row dense>
            <v-col cols="12" md="7">
              <v-text-field
                v-model.trim="whatsapp"
                placeholder="919876543210"
                outlined
                dense
                hide-details="auto"
                :error-messages="whatsappError"
                prepend-inner-icon="$whatsapp"
                @input="whatsappError = ''"
              />
            </v-col>
          </v-row>
        </v-form>
      </div>

      <template v-if="!loading && !loadError">
        <v-divider />
        <div class="d-flex align-center px-5 py-3">
          <span
            v-if="whatsappDirty"
            class="text-caption amber--text text--darken-3 font-weight-bold"
          >
            Unsaved changes
          </span>
          <v-spacer />
          <v-btn
            v-if="whatsappDirty"
            text
            :disabled="savingWhatsapp"
            class="mr-2"
            @click="resetWhatsapp"
          >
            Discard
          </v-btn>
          <v-btn
            color="primary"
            depressed
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
    <v-card outlined rounded="lg">
      <div class="d-flex align-center px-5 py-4">
        <v-icon size="18" color="primary" class="mr-2">$info</v-icon>
        <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
          >Things to know</span
        >
      </div>
      <v-divider />
      <template v-for="(point, i) in thingsToKnow">
        <v-divider v-if="i > 0" :key="`d-${point.title}`" />
        <div :key="point.title" class="d-flex align-start px-5 py-3">
          <v-avatar
            size="28"
            tile
            color="primary lighten-5"
            class="rounded-lg mr-3 flex-shrink-0"
          >
            <v-icon size="14" color="primary">{{ point.icon }}</v-icon>
          </v-avatar>
          <div class="text-body-2">
            <span class="font-weight-bold grey--text text--darken-4">{{
              point.title
            }}</span>
            <span class="grey--text text--darken-2"> {{ point.text }}</span>
          </div>
        </div>
      </template>
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
