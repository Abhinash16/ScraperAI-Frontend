<template>
  <div class="docs-page">
    <!-- HEADER -->
    <div class="d-flex align-start flex-wrap mb-4">
      <div class="flex-grow-1 mr-4 mb-2">
        <h1 class="text-h5 font-weight-bold mb-1">Guide</h1>
        <p class="text-subtitle-2 grey--text mb-0">
          What each feature does, what to know before going live, and what's
          coming next.
        </p>
      </div>
      <v-btn color="primary" rounded depressed outlined @click="downloadDocs">
        <v-icon left>$download</v-icon>
        Download
      </v-btn>
    </div>

    <v-tabs
      :value="tabIndex"
      show-arrows
      class="mb-6 docs-tabs"
      @change="setTab(TABS[$event].id)"
    >
      <v-tab v-for="t in TABS" :key="t.id" class="text-none">
        <v-icon small left>{{ t.icon }}</v-icon>
        {{ t.name }}
      </v-tab>
    </v-tabs>

    <!-- ================= GO-LIVE CHECKLIST ================= -->
    <div v-if="tab === 'checklist'">
      <v-card outlined rounded="xl" class="pa-6 mb-4">
        <div class="d-flex align-center flex-wrap">
          <v-progress-circular
            :value="readiness"
            size="64"
            width="6"
            color="primary"
            class="mr-4"
          >
            <strong>{{ readiness }}%</strong>
          </v-progress-circular>
          <div>
            <div class="text-subtitle-1 font-weight-bold">
              {{ requiredDone }} of {{ autoRequired.length }} required checks
              passed
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              Ticks are checked automatically where we can. Steps marked
              "Check yourself" are ones we can't verify, so make sure they're
              done.
            </div>
          </div>
        </div>
      </v-card>

      <v-card outlined rounded="xl">
        <template v-for="(item, i) in GO_LIVE_CHECKLIST">
          <v-divider v-if="i" :key="item.id + '-d'" />
          <div :key="item.id" class="d-flex align-start pa-4">
            <v-icon :color="statusColor(item)" class="mr-3 mt-1">
              {{ statusIcon(item) }}
            </v-icon>
            <div class="flex-grow-1 mr-2">
              <div class="font-weight-bold">
                {{ item.title }}
                <v-chip
                  x-small
                  outlined
                  :color="item.required ? 'primary' : 'grey'"
                  class="ml-1"
                >
                  {{ item.required ? "Required" : "Recommended" }}
                </v-chip>
              </div>
              <div class="text-body-2 grey--text text--darken-1">
                {{ item.text }}
              </div>
              <div
                v-if="statusOf(item) === null"
                class="text-caption grey--text mt-1"
              >
                {{ item.check ? "Couldn't check this" : "Check yourself" }}
              </div>
            </div>
            <v-btn small text rounded color="primary" :to="item.route">
              Open
            </v-btn>
          </div>
        </template>
      </v-card>
    </div>

    <!-- ================= FEATURE GUIDES ================= -->
    <div v-if="tab === 'features'">
      <v-expansion-panels v-model="openGuide" flat class="guides">
        <v-expansion-panel
          v-for="g in FEATURE_GUIDES"
          :id="'guide-' + g.id"
          :key="g.id"
          class="guide-panel mb-3"
        >
          <v-expansion-panel-header>
            <div class="d-flex align-center">
              <v-avatar size="36" rounded="lg" color="#eff2fb" class="mr-3">
                <v-icon small color="primary">{{ g.icon }}</v-icon>
              </v-avatar>
              <div>
                <div class="font-weight-bold">{{ g.name }}</div>
                <div class="text-body-2 grey--text text--darken-1">
                  {{ g.summary }}
                </div>
              </div>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-row>
              <v-col cols="12" md="6">
                <div class="field-title">How to use it</div>
                <ol class="text-body-2 list">
                  <li v-for="s in g.steps" :key="s">{{ s }}</li>
                </ol>
              </v-col>
              <v-col cols="12" md="6">
                <div class="field-title">Things to know</div>
                <ul class="text-body-2 list">
                  <li v-for="p in g.thingsToKnow" :key="p">{{ p }}</li>
                </ul>
              </v-col>
            </v-row>
            <ProductApiFormat v-if="g.format" class="mt-2 mb-4" />
            <v-btn small depressed rounded color="primary" :to="g.route">
              Go to {{ g.name }}
            </v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- ================= COMING NEXT ================= -->
    <div v-if="tab === 'coming'">
      <div class="text-body-2 grey--text text--darken-1 mb-4">
        Features we're building next, roughly in order. We'll let you know as
        each one becomes available.
      </div>
      <v-row>
        <v-col v-for="c in COMING_NEXT" :key="c.title" cols="12" sm="6">
          <v-card outlined rounded="xl" class="pa-5 fill-height">
            <div class="d-flex align-center mb-2">
              <v-icon color="primary" class="mr-2">{{ c.icon }}</v-icon>
              <span class="font-weight-bold">{{ c.title }}</span>
            </div>
            <div class="text-body-2 grey--text text--darken-2">
              {{ c.text }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- ================= INSTALL ================= -->
    <div v-if="tab === 'install'">
      <v-card outlined rounded="xl" class="pa-6">
        <div class="font-weight-bold mb-2">1. Copy the script</div>
        <div class="code-box d-flex justify-space-between align-start mb-6">
          <pre class="ma-0">{{ scriptCode }}</pre>
          <v-btn icon small dark @click="copyScript">
            <v-icon small>$copy</v-icon>
          </v-btn>
        </div>

        <div class="font-weight-bold mb-1">2. Add it to your website</div>
        <div class="text-body-2 grey--text text--darken-1 mb-6">
          Paste the script just before the closing
          <code>&lt;/body&gt;</code> tag on every page where you want the chat.
        </div>

        <div class="font-weight-bold mb-1">3. Lock it to your domains</div>
        <div class="text-body-2 grey--text text--darken-1 mb-6">
          In
          <router-link to="/dashboard/integration?section=widget">
            Integrations → Website Widget</router-link
          >, add the domains where you installed it. After that, other
          websites can't use your chatbot.
        </div>

        <div class="font-weight-bold mb-1">4. Check it works</div>
        <div class="text-body-2 grey--text text--darken-1">
          Open your website. The chat bubble appears in the bottom-right
          corner. If it doesn't, make sure the domain you're on is in your
          allowed list, then check the browser console for errors.
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import {
  FEATURE_GUIDES,
  GO_LIVE_CHECKLIST,
  COMING_NEXT,
  PRODUCT_API_FORMAT,
} from "@/content/featureGuides";
import ProductApiFormat from "@/components/integrations/ProductApiFormat.vue";

// Plain-text version of the Product API format, for the download
function formatLines() {
  const f = PRODUCT_API_FORMAT;
  return [
    "  How ScraperAI calls your API:",
    ...f.calls.map((c) => `  - ${c.title}: ${c.request}. ${c.when} ${c.note}`),
    `  Response: ${f.response} Each item:`,
    ...f.example.split("\n").map((l) => `    ${l}`),
    "  Notes:",
    ...f.notes.map((n) => `  - ${n}`),
  ];
}

const TABS = [
  { id: "checklist", name: "Go-live checklist", icon: "$rocket" },
  { id: "features", name: "Feature guides", icon: "$book-open" },
  { id: "coming", name: "Coming next", icon: "$route" },
  { id: "install", name: "Install", icon: "$code" },
];

export default {
  components: { ProductApiFormat },

  data() {
    return {
      TABS,
      FEATURE_GUIDES,
      GO_LIVE_CHECKLIST,
      COMING_NEXT,

      user: {},
      openGuide: null,
      // true / false once known; null means unknown (manual or failed).
      checks: {
        hasPages: null,
        aiConfigured: null,
        domainsSet: null,
        escalateSet: null,
        noPendingGaps: null,
        whatsappOn: null,
      },
    };
  },

  computed: {
    tab() {
      if (this.$route.query.guide) return "features";
      const t = this.$route.query.tab;
      return TABS.some((x) => x.id === t) ? t : "checklist";
    },

    tabIndex() {
      return TABS.findIndex((t) => t.id === this.tab);
    },

    // Only required steps we can verify count toward the score.
    autoRequired() {
      return GO_LIVE_CHECKLIST.filter((i) => i.required && i.check);
    },

    requiredDone() {
      return this.autoRequired.filter((i) => this.statusOf(i) === true).length;
    },

    readiness() {
      if (!this.autoRequired.length) return 0;
      return Math.round((this.requiredDone / this.autoRequired.length) * 100);
    },

    scriptCode() {
      const open = "<" + "script";
      const close = "</" + "script>";
      return `${open} src="https://scraper.ai/chatpanel.js" id="chatPanelScript" data-api-key="${
        this.user.apiKey || "YOUR_API_KEY"
      }">${close}`;
    },
  },

  watch: {
    "$route.query.guide": {
      immediate: true,
      handler(id) {
        const i = FEATURE_GUIDES.findIndex((g) => g.id === id);
        if (i === -1) return;
        this.openGuide = i;
        this.$nextTick(() => {
          const el = document.getElementById("guide-" + id);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      },
    },
  },

  mounted() {
    this.loadUser();
    this.loadPages();
    this.loadDomains();
    this.loadGaps();
  },

  methods: {
    setTab(id) {
      if (id === this.tab) return;
      this.$router.replace({ query: { tab: id } }).catch(() => {});
    },

    statusOf(item) {
      return item.check ? this.checks[item.check] : null;
    },

    statusIcon(item) {
      const s = this.statusOf(item);
      if (s === true) return "$circle-check";
      if (s === false) return "$circle";
      return "$circle-help";
    },

    statusColor(item) {
      const s = this.statusOf(item);
      if (s === true) return "success";
      if (s === false && item.required) return "warning";
      return "grey";
    },

    async loadUser() {
      try {
        const { data } = await apiClient.get("/clients/currentUser");
        const user = data.data || {};
        this.user = user;
        this.checks.aiConfigured =
          user.chatgptConfigured ?? !!user.chatgptApiKey;
        this.checks.escalateSet = !!user.webhooks?.escalate?.url;
        this.checks.whatsappOn = !!user.autoWhatsappEnabled;
      } catch {
        // leave as unknown
      }
    },

    async loadPages() {
      try {
        const { data } = await apiClient.get("/knowledge/sources");
        this.checks.hasPages = (data.data || []).some(
          (s) => s.status !== "paused" && s.stats?.publishedCount > 0,
        );
      } catch {
        // leave as unknown
      }
    },

    // Needs settings:manage; others see this step as "Couldn't check this".
    async loadDomains() {
      try {
        const { data } = await apiClient.get("/clients/widget-settings");
        this.checks.domainsSet = (data.data?.allowedOrigins || []).length > 0;
      } catch {
        // leave as unknown
      }
    },

    async loadGaps() {
      try {
        const { data } = await apiClient.get("/knowledge/gaps", {
          params: { status: "pending", limit: 1, offset: 0 },
        });
        this.checks.noPendingGaps = data.data?.total === 0;
      } catch {
        // leave as unknown
      }
    },

    copyScript() {
      navigator.clipboard.writeText(this.scriptCode);
      this.$toast.success("Script copied");
    },

    downloadDocs() {
      const lines = [
        "scraperAI guide",
        "",
        `Website: ${this.user.company_website || "-"}`,
        "",
        "INSTALL",
        this.scriptCode,
        "Paste before </body>, then add your domains in Integrations > Website Widget.",
        "",
        "GO-LIVE CHECKLIST",
        ...GO_LIVE_CHECKLIST.map(
          (i) =>
            `[${this.statusOf(i) === true ? "x" : " "}] ${i.title}${
              i.required ? " (required)" : ""
            } - ${i.text}`,
        ),
        "",
        "FEATURES",
        ...FEATURE_GUIDES.flatMap((g) => [
          "",
          g.name.toUpperCase(),
          g.summary,
          ...g.steps.map((s, n) => `  ${n + 1}. ${s}`),
          "  Things to know:",
          ...g.thingsToKnow.map((p) => `  - ${p}`),
          ...(g.format ? formatLines() : []),
        ]),
        "",
        "COMING NEXT",
        ...COMING_NEXT.map((c) => `- ${c.title}: ${c.text}`),
      ];

      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "scraperai-guide.txt";
      link.click();
    },
  },
};
</script>

<style scoped>
.docs-page {
  max-width: 1000px;
}

.docs-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.guide-panel {
  border: 1px solid #e0e0e0;
  border-radius: 16px !important;
}

.guide-panel::before {
  box-shadow: none !important;
}

.field-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
  margin-bottom: 8px;
}

.list {
  padding-left: 18px;
}

.list li {
  margin-bottom: 6px;
}

.code-box {
  background: #0f172a;
  color: #fff;
  padding: 14px;
  border-radius: 10px;
  font-size: 13px;
  overflow-x: auto;
}

.code-box pre {
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
