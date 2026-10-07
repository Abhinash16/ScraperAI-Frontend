<template>
  <div class="run-page">
    <v-btn text rounded small class="text-none mb-4 px-2" to="/dashboard/quality">
      <v-icon small class="mr-1">$arrow-left</v-icon> Quality
    </v-btn>

    <v-card v-if="!run" outlined rounded="xl" class="pa-6">
      <v-progress-linear v-if="!loadError" indeterminate color="primary" />
      <v-alert v-else type="error" outlined rounded="lg" class="mb-0">
        {{ loadError }}
        <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
      </v-alert>
    </v-card>

    <template v-else>
      <!-- Header -->
      <div class="d-flex align-center flex-wrap mb-6">
        <div class="mr-4">
          <div class="d-flex align-center">
            <div class="text-h5 font-weight-bold">Test run</div>
            <v-chip v-if="run.isBaseline" small outlined color="amber darken-2" class="ml-3">
              <v-icon x-small left>$star</v-icon> Baseline
            </v-chip>
            <v-chip v-if="comparison && comparison.regression" small color="error" text-color="white" class="ml-2">
              <v-icon x-small left>$triangle-alert</v-icon> Regression
            </v-chip>
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            {{ formatDate(run.createdAt) }} · {{ profileLabel(run.profileMode) }}
            <template v-if="run.note"> · {{ run.note }}</template>
          </div>
        </div>
        <v-spacer />
        <v-btn
          v-if="run.status === 'done' && !run.isBaseline"
          text
          rounded
          class="text-none my-1"
          :loading="baselineBusy"
          @click="setBaseline"
        >
          <v-icon small class="mr-1">$star</v-icon> Set as baseline
        </v-btn>
      </div>

      <v-alert v-if="run.status !== 'done'" :type="run.status === 'failed' ? 'error' : 'info'" outlined rounded="xl">
        {{ run.status === "failed" ? `This run failed: ${run.error || "something went wrong."}` : "This run hasn't finished yet." }}
      </v-alert>

      <!-- Summary -->
      <v-row class="mb-2">
        <v-col cols="6" md="3">
          <v-card outlined rounded="xl" class="pa-4 fill-height">
            <div class="text-caption grey--text">Pass rate</div>
            <div :class="['text-h4 font-weight-bold', `${passRateColor(run.passRate)}--text`]">
              {{ formatRate(run.passRate) }}
            </div>
            <div class="text-caption grey--text">
              {{ totals.passed }} passed · {{ totals.failed }} failed<template v-if="totals.errored">
                · {{ totals.errored }} errors</template>
            </div>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card outlined rounded="xl" class="pa-4 fill-height">
            <div class="text-caption grey--text">vs baseline</div>
            <template v-if="comparison">
              <div :class="['text-h4 font-weight-bold', comparison.delta < 0 ? 'error--text' : 'success--text']">
                {{ formatDelta(comparison.delta) }}
              </div>
              <div class="text-caption grey--text">
                Baseline {{ formatRate(comparison.baselinePassRate) }}<template v-if="newlyFailing.size">
                  · {{ newlyFailing.size }} newly failing</template>
              </div>
            </template>
            <div v-else class="text-body-2 grey--text mt-2">
              {{ run.isBaseline ? "This is the baseline." : "No baseline to compare with." }}
            </div>
          </v-card>
        </v-col>
        <v-col cols="12" md="6">
          <v-card outlined rounded="xl" class="pa-4 fill-height">
            <div class="text-caption grey--text mb-2">Average scores</div>
            <div class="d-flex flex-wrap">
              <div v-for="s in SCORE_KEYS" :key="s.key" class="mr-6 mb-1">
                <div :class="['text-h6 font-weight-bold', `${scoreColor(averages[s.key])}--text`]">
                  {{ averages[s.key] != null ? averages[s.key].toFixed(1) : "—" }}<span class="text-caption grey--text"> /5</span>
                </div>
                <div class="text-caption grey--text">{{ s.label }}</div>
              </div>
              <div class="mb-1">
                <div :class="['text-h6 font-weight-bold', averages.policy >= 1 ? 'success--text' : 'error--text']">
                  {{ averages.policy != null ? `${Math.round(averages.policy * 100)}%` : "—" }}
                </div>
                <div class="text-caption grey--text">Follows rules</div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Results -->
      <div class="d-flex align-center flex-wrap mb-4">
        <v-btn-toggle v-model="filter" mandatory rounded dense color="primary" class="my-1">
          <v-btn value="all" small class="text-none">All ({{ results.length }})</v-btn>
          <v-btn value="failed" small class="text-none">Failed ({{ failedCount }})</v-btn>
          <v-btn v-if="comparison" value="new" small class="text-none">
            Newly failing ({{ newlyFailing.size }})
          </v-btn>
        </v-btn-toggle>
      </div>

      <div v-if="!shown.length" class="text-body-2 grey--text py-6">
        {{ filter === "all" ? "No results in this run." : "Nothing here. Every question in this filter passed." }}
      </div>

      <v-card
        v-for="(r, i) in shown"
        :key="r.case || i"
        outlined
        rounded="xl"
        :class="['pa-5 mb-3 result', { failing: !r.pass }]"
      >
        <div class="d-flex align-start flex-wrap mb-3">
          <v-chip small :color="r.error ? 'grey' : r.pass ? 'success' : 'error'" text-color="white" class="mr-3">
            <v-icon x-small left>{{ r.error ? "$circle-alert" : r.pass ? "$check" : "$x" }}</v-icon>
            {{ r.error ? "Error" : r.pass ? "Pass" : "Fail" }}
          </v-chip>
          <div class="text-subtitle-1 font-weight-bold flex-grow-1 question">{{ r.question }}</div>
          <v-chip v-if="newlyFailing.has(r.case)" x-small outlined color="error" class="ml-2 mt-1">
            Newly failing
          </v-chip>
        </div>

        <v-row dense>
          <v-col cols="12" md="6">
            <div class="text-caption grey--text mb-1">Expected</div>
            <div class="answer text-body-2">{{ r.expected }}</div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="text-caption grey--text mb-1">
              Bot replied
              <span v-if="r.latencyMs" class="ml-1">· {{ (r.latencyMs / 1000).toFixed(1) }}s</span>
            </div>
            <div v-if="r.error" class="answer text-body-2 error--text">{{ r.error }}</div>
            <!-- eslint-disable-next-line vue/no-v-html -->
            <div v-else class="answer text-body-2" v-html="replyHtml(r)"></div>
          </v-col>
        </v-row>

        <div v-if="r.scores" class="d-flex align-center flex-wrap mt-3">
          <v-chip
            v-for="s in SCORE_KEYS"
            :key="s.key"
            x-small
            outlined
            :color="scoreColor(r.scores[s.key])"
            class="mr-2 mb-1"
          >
            {{ s.label }} {{ r.scores[s.key] != null ? r.scores[s.key] : "—" }}/5
          </v-chip>
          <v-chip
            x-small
            outlined
            :color="r.scores.policy >= 1 ? 'success' : 'error'"
            class="mr-2 mb-1"
          >
            {{ r.scores.policy >= 1 ? "Follows rules" : "Breaks a rule" }}
          </v-chip>
          <v-chip v-if="r.mustNotSayHit" x-small color="error" text-color="white" class="mb-1">
            Said "{{ r.mustNotSayHit }}"
          </v-chip>
        </div>

        <div v-if="r.reasons" class="text-body-2 grey--text text--darken-2 mt-2">
          <strong>Judge:</strong> {{ r.reasons }}
        </div>

        <div class="d-flex align-center flex-wrap mt-2">
          <button
            v-if="r.retrieved && (r.retrieved.curated || r.retrieved.website)"
            type="button"
            class="knew-toggle text-caption"
            @click="toggle(r)"
          >
            <v-icon x-small>{{ isOpen(r) ? "$chevron-down" : "$chevron-right" }}</v-icon>
            What the bot knew
          </button>
          <v-spacer />
          <v-btn
            v-if="!r.pass && sourceItemOf(r)"
            small
            text
            rounded
            color="primary"
            class="text-none"
            @click="itemId = sourceItemOf(r)"
          >
            <v-icon small class="mr-1">$pencil</v-icon> Fix knowledge
          </v-btn>
          <v-btn
            v-if="!r.pass && caseOf(r)"
            small
            text
            rounded
            class="text-none"
            @click="editCase(r)"
          >
            Edit test question
          </v-btn>
        </div>
        <v-expand-transition>
          <div v-if="isOpen(r)" class="mt-2">
            <template v-if="r.retrieved.curated">
              <div class="text-caption font-weight-bold mb-1">Matched FAQs</div>
              <pre class="knew">{{ r.retrieved.curated }}</pre>
            </template>
            <template v-if="r.retrieved.website">
              <div class="text-caption font-weight-bold mb-1 mt-2">Website knowledge</div>
              <pre class="knew">{{ r.retrieved.website }}</pre>
            </template>
          </div>
        </v-expand-transition>
      </v-card>
    </template>

    <ItemEditorDrawer :item-id="itemId" :permissions="perms" @close="itemId = null" />
    <CaseDialog v-model="caseOpen" :test-case="caseEditing" @saved="loadCases" @open-item="openItem" />
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import CaseDialog from "@/components/quality/CaseDialog.vue";
import ItemEditorDrawer from "@/components/knowledge/ItemEditorDrawer.vue";
import { apiError, formatDate, loadMyPermissions } from "@/utils/knowledge";
import {
  EVAL_API,
  PROFILE_MODES,
  SCORE_KEYS,
  formatDelta,
  formatRate,
  passRateColor,
  scoreColor,
} from "@/utils/quality";

const escapeHtml = (text) =>
  String(text || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

export default {
  name: "QualityRun",

  components: { CaseDialog, ItemEditorDrawer },

  data: () => ({
    SCORE_KEYS,
    perms: [],
    run: null,
    loadError: "",
    baselineBusy: false,
    filter: "all",
    openKeys: [],
    cases: [],
    itemId: null,
    caseOpen: false,
    caseEditing: null,
  }),

  computed: {
    results() {
      return this.run?.results || [];
    },
    totals() {
      return { passed: 0, failed: 0, errored: 0, ...(this.run?.totals || {}) };
    },
    averages() {
      return this.run?.averages || {};
    },
    comparison() {
      return this.run?.comparison || null;
    },
    newlyFailing() {
      return new Set(this.comparison?.newlyFailing || []);
    },
    failedCount() {
      return this.results.filter((r) => !r.pass).length;
    },
    shown() {
      if (this.filter === "failed") return this.results.filter((r) => !r.pass);
      if (this.filter === "new") return this.results.filter((r) => this.newlyFailing.has(r.case));
      return this.results;
    },
  },

  watch: {
    "$route.params.runId"() {
      this.load();
    },
  },

  created() {
    this.load();
    this.loadCases();
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => {});
  },

  methods: {
    formatDate,
    formatRate,
    formatDelta,
    passRateColor,
    scoreColor,
    profileLabel: (mode) => PROFILE_MODES[mode] || PROFILE_MODES.published,

    async load() {
      this.loadError = "";
      try {
        const { data } = await apiClient.get(`${EVAL_API}/runs/${this.$route.params.runId}`);
        this.run = data.data;
        // Start on the failures when there are some
        if (this.results.some((r) => !r.pass)) this.filter = "failed";
      } catch (err) {
        this.loadError = apiError(err, "Failed to load this run");
      }
    },

    // Cases give us the FAQ behind a generated question
    async loadCases() {
      try {
        const { data } = await apiClient.get(`${EVAL_API}/cases`);
        this.cases = data.data || [];
      } catch {
        this.cases = [];
      }
    },

    caseOf(result) {
      return this.cases.find((c) => c._id === result.case) || null;
    },

    sourceItemOf(result) {
      return this.caseOf(result)?.sourceItem || null;
    },

    editCase(result) {
      this.caseEditing = this.caseOf(result);
      this.caseOpen = true;
    },

    openItem(id) {
      this.caseOpen = false;
      this.itemId = id;
    },

    // The reply with a "must never say" hit marked
    replyHtml(result) {
      let html = escapeHtml(result.reply || "");
      const hit = result.mustNotSayHit && escapeHtml(result.mustNotSayHit);
      if (hit) {
        const pattern = new RegExp(hit.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        html = html.replace(pattern, (m) => `<mark class="hit">${m}</mark>`);
      }
      return html || '<span class="grey--text">No reply</span>';
    },

    keyOf(result) {
      return result.case || result.question;
    },

    isOpen(result) {
      return this.openKeys.includes(this.keyOf(result));
    },

    toggle(result) {
      const key = this.keyOf(result);
      this.openKeys = this.isOpen(result) ? this.openKeys.filter((k) => k !== key) : [...this.openKeys, key];
    },

    async setBaseline() {
      this.baselineBusy = true;
      try {
        await apiClient.post(`${EVAL_API}/runs/${this.run._id}/baseline`);
        this.$toast.success("Baseline updated. New runs are compared with this one.");
        await this.load();
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to set the baseline"));
      } finally {
        this.baselineBusy = false;
      }
    },
  },
};
</script>

<style scoped>
.result.failing {
  border-left: 3px solid #ef4444 !important;
}
.question {
  min-width: 0;
}
.answer {
  white-space: pre-wrap;
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px 12px;
}
.answer >>> mark.hit {
  background: #fecaca;
  padding: 0 2px;
  border-radius: 3px;
}
.knew-toggle {
  color: #6c6ef6;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}
.knew {
  white-space: pre-wrap;
  font-size: 12px;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 10px 12px;
  max-height: 260px;
  overflow-y: auto;
}
</style>
