<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Guide</h1>
        <div class="text-body-2 grey--text text--darken-1">
          What each feature does, what to know before going live, and what's coming next.
        </div>
      </div>
      <v-spacer />
      <v-btn outlined color="primary" class="mb-2" @click="downloadDocs">
        <v-icon left size="16">$download</v-icon>
        Download
      </v-btn>
    </div>

    <v-tabs
      class="mb-4"
      :value="tabIndex"
      color="primary"
      background-color="transparent"
      height="44"
      slider-size="3"
      show-arrows
      @change="setTab(TABS[$event].id)"
    >
      <v-tab v-for="t in TABS" :key="t.id" class="text-body-2 font-weight-bold">
        <v-icon size="16" class="mr-2">{{ t.icon }}</v-icon>
        {{ t.name }}
      </v-tab>
    </v-tabs>

    <!-- ================= GO-LIVE CHECKLIST ================= -->
    <div v-if="tab === 'checklist'">
      <v-card outlined rounded="lg" class="mb-4">
        <div class="d-flex align-center flex-wrap pa-5">
          <v-progress-circular
            :value="readiness"
            :color="readiness === 100 ? 'success' : 'primary'"
            size="72"
            width="7"
            class="mr-5 mb-2 flex-shrink-0"
          >
            <span class="text-body-1 font-weight-bold grey--text text--darken-4">{{ readiness }}%</span>
          </v-progress-circular>
          <div class="flex-grow-1 mb-2">
            <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">
              {{ requiredDone }} of {{ autoRequired.length }} required checks passed
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              Ticks are checked automatically where we can. Steps marked "Check yourself" are ones we
              can't verify, so make sure they're done.
            </div>
          </div>
        </div>
      </v-card>

      <v-card outlined rounded="lg">
        <template v-for="(item, i) in GO_LIVE_CHECKLIST">
          <v-divider v-if="i" :key="item.id + '-d'" />
          <div :key="item.id" class="d-flex align-start flex-wrap px-5 py-4">
            <v-icon size="20" :color="statusColor(item)" class="mr-3 mt-1 flex-shrink-0">
              {{ statusIcon(item) }}
            </v-icon>
            <div class="flex-grow-1 mr-3 overflow-hidden">
              <div class="d-flex flex-wrap align-center">
                <span class="text-body-2 font-weight-bold grey--text text--darken-4 mr-2">{{ item.title }}</span>
                <v-chip
                  x-small
                  label
                  :color="item.required ? 'primary lighten-5' : 'grey lighten-4'"
                  :text-color="item.required ? 'primary' : 'grey darken-1'"
                  class="font-weight-bold"
                >
                  {{ item.required ? "Required" : "Recommended" }}
                </v-chip>
              </div>
              <div class="text-body-2 grey--text text--darken-1">{{ item.text }}</div>
              <div v-if="statusOf(item) === null" class="d-flex align-center text-caption grey--text mt-1">
                <v-icon size="12" class="mr-1">$info</v-icon>
                {{ item.check ? "Couldn't check this" : "Check yourself" }}
              </div>
            </div>
            <v-btn small outlined color="primary" class="mt-1" :to="item.route">
              Open
              <v-icon right size="14">$arrow-right</v-icon>
            </v-btn>
          </div>
        </template>
      </v-card>
    </div>

    <!-- ================= FEATURE GUIDES ================= -->
    <div v-if="tab === 'features'">
      <v-expansion-panels v-model="openGuide" flat>
        <v-expansion-panel
          v-for="g in FEATURE_GUIDES"
          :id="'guide-' + g.id"
          :key="g.id"
          class="guide-panel mb-3"
        >
          <v-expansion-panel-header class="py-3">
            <div class="d-flex align-center">
              <v-avatar size="40" tile color="primary lighten-5" class="rounded-lg mr-3 flex-shrink-0">
                <v-icon size="20" color="primary">{{ g.icon }}</v-icon>
              </v-avatar>
              <div class="overflow-hidden">
                <div class="text-body-2 font-weight-bold grey--text text--darken-4">{{ g.name }}</div>
                <div class="text-caption grey--text text--darken-1">{{ g.summary }}</div>
              </div>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-divider class="mb-4" />
            <v-row dense>
              <v-col cols="12" md="6">
                <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">How to use it</div>
                <v-sheet outlined rounded="lg">
                  <template v-for="(step, i) in g.steps">
                    <v-divider v-if="i > 0" :key="`sd-${i}`" />
                    <div :key="`s-${i}`" class="d-flex align-start px-4 py-2">
                      <v-avatar size="22" color="green lighten-5" class="mr-3 mt-1 flex-shrink-0">
                        <span class="text-caption font-weight-bold green--text text--darken-2">{{ i + 1 }}</span>
                      </v-avatar>
                      <span class="text-body-2 grey--text text--darken-3">{{ step }}</span>
                    </div>
                  </template>
                </v-sheet>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">Things to know</div>
                <v-sheet outlined rounded="lg">
                  <template v-for="(point, i) in g.thingsToKnow">
                    <v-divider v-if="i > 0" :key="`pd-${i}`" />
                    <div :key="`p-${i}`" class="d-flex align-start px-4 py-2">
                      <v-icon size="14" color="primary" class="mr-3 mt-1 flex-shrink-0">$info</v-icon>
                      <span class="text-body-2 grey--text text--darken-3">{{ point }}</span>
                    </div>
                  </template>
                </v-sheet>
              </v-col>
            </v-row>
            <ProductApiFormat v-if="g.format" class="mt-4" />
            <v-btn v-if="g.route" small depressed color="primary" class="mt-4" :to="g.route">
              Go to {{ g.name }}
              <v-icon right size="14">$arrow-right</v-icon>
            </v-btn>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>

    <!-- ================= COMING NEXT ================= -->
    <div v-if="tab === 'coming'">
      <div class="text-body-2 grey--text text--darken-1 mb-4">
        Features we're building next, roughly in order. We'll let you know as each one becomes
        available.
      </div>
      <v-row dense>
        <v-col v-for="(c, i) in COMING_NEXT" :key="c.title" cols="12" sm="6">
          <v-card outlined rounded="lg" class="d-flex align-start pa-4 fill-height">
            <v-avatar size="40" tile color="primary lighten-5" class="rounded-lg mr-3 flex-shrink-0">
              <v-icon size="20" color="primary">{{ c.icon }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="d-flex align-center">
                <span class="text-body-2 font-weight-bold grey--text text--darken-4 mr-2">{{ c.title }}</span>
                <v-chip x-small label color="grey lighten-4" class="font-weight-bold">#{{ i + 1 }}</v-chip>
              </div>
              <div class="text-body-2 grey--text text--darken-2">{{ c.text }}</div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- ================= INSTALL ================= -->
    <div v-if="tab === 'install'">
      <v-card outlined rounded="lg">
        <div class="d-flex align-start px-5 py-4">
          <v-avatar size="28" color="green" class="mr-3 flex-shrink-0">
            <span class="text-caption font-weight-bold white--text">1</span>
          </v-avatar>
          <div class="flex-grow-1 overflow-hidden">
            <div class="text-body-2 font-weight-bold grey--text text--darken-4 mb-2">Copy the script</div>
            <v-sheet color="grey darken-4" dark rounded="lg" class="d-flex align-start pa-3">
              <pre class="flex-grow-1 ma-0 text-caption text-pre-wrap text-break grey--text text--lighten-3">{{ scriptCode }}</pre>
              <v-btn x-small depressed color="success" class="ml-2 flex-shrink-0" @click="copyScript">
                <v-icon left size="12">$copy</v-icon>
                Copy
              </v-btn>
            </v-sheet>
          </div>
        </div>
        <v-divider />
        <div class="d-flex align-start px-5 py-4">
          <v-avatar size="28" color="green" class="mr-3 flex-shrink-0">
            <span class="text-caption font-weight-bold white--text">2</span>
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-bold grey--text text--darken-4 mb-1">Add it to your website</div>
            <div class="text-body-2 grey--text text--darken-1">
              Paste the script just before the closing <code>&lt;/body&gt;</code> tag on every page
              where you want the chat.
            </div>
          </div>
        </div>
        <v-divider />
        <div class="d-flex align-start px-5 py-4">
          <v-avatar size="28" color="green" class="mr-3 flex-shrink-0">
            <span class="text-caption font-weight-bold white--text">3</span>
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-bold grey--text text--darken-4 mb-1">Lock it to your domains</div>
            <div class="text-body-2 grey--text text--darken-1">
              In
              <router-link to="/dashboard/integration?section=widget">Integrations → Website Widget</router-link>,
              add the domains where you installed it. After that, other websites can't use your
              chatbot.
            </div>
          </div>
        </div>
        <v-divider />
        <div class="d-flex align-start px-5 py-4">
          <v-avatar size="28" color="green" class="mr-3 flex-shrink-0">
            <span class="text-caption font-weight-bold white--text">4</span>
          </v-avatar>
          <div>
            <div class="text-body-2 font-weight-bold grey--text text--darken-4 mb-1">Check it works</div>
            <div class="text-body-2 grey--text text--darken-1">
              Open your website. The chat bubble appears in the bottom-right corner. If it doesn't,
              make sure the domain you're on is in your allowed list, then check the browser console
              for errors.
            </div>
          </div>
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
    `  ${f.mapping.intro}`,
    ...f.mapping.theirs.split("\n").map((l) => `    ${l}`),
    `  ${f.mapping.map}`,
    ...f.mapping.ours.split("\n").map((l) => `    ${l}`),
    `  ${f.mapping.stock}`,
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
/* Outline each guide; Vuetify 2 panels have no border option */
.guide-panel {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px !important;
}

.guide-panel::before {
  box-shadow: none !important;
}
</style>
