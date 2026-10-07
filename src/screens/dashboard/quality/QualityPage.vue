<template>
  <div class="quality-page">
    <!-- Header -->
    <div class="d-flex align-center flex-wrap mb-6">
      <v-avatar size="48" rounded="xl" color="#dcfce7" class="mr-4">
        <v-icon color="black">$circle-check</v-icon>
      </v-avatar>
      <div class="mr-6">
        <div class="text-h5 font-weight-bold">Quality</div>
        <div class="text-body-2 grey--text text--darken-1">
          Test how well your bot answers, before your customers find out.
        </div>
      </div>

      <div v-if="latest" class="d-flex align-center my-1 mr-4">
        <div class="mr-3">
          <div class="text-caption grey--text">Latest pass rate</div>
          <div :class="['text-h5 font-weight-bold', `${passRateColor(latest.passRate)}--text`]">
            {{ formatRate(latest.passRate) }}
          </div>
        </div>
        <div v-if="latestDelta != null && !latest.isBaseline">
          <div class="text-caption grey--text">vs baseline</div>
          <div :class="['font-weight-bold', latestDelta < 0 ? 'error--text' : 'success--text']">
            {{ formatDelta(latestDelta) }}
          </div>
        </div>
        <v-chip v-if="regression" small color="error" text-color="white" class="ml-3">
          <v-icon x-small left>$triangle-alert</v-icon> Regression
        </v-chip>
      </div>

      <v-spacer />
      <v-btn
        text
        rounded
        class="text-none my-1"
        :loading="generating"
        @click="generate"
      >
        <v-icon small class="mr-1">$wand-sparkles</v-icon> Generate from FAQs
      </v-btn>
      <v-btn
        color="primary"
        depressed
        rounded
        class="text-none font-weight-bold ml-2 my-1"
        :disabled="runActive"
        @click="openRun"
      >
        <v-icon small class="mr-1">$play</v-icon> Run tests
      </v-btn>
    </div>

    <ThingsToKnow feature="quality" />

    <!-- Run in progress -->
    <v-alert v-if="runActive" type="info" outlined rounded="xl" class="text-body-2">
      <div class="d-flex align-center">
        <v-progress-circular indeterminate size="18" width="2" color="info" class="mr-3" />
        Testing {{ newest.totals && newest.totals.cases ? `${newest.totals.cases} questions` : "your questions" }}
        with the {{ profileLabel(newest.profileMode).toLowerCase() }}. This takes a minute or
        two; you can leave this page.
      </div>
    </v-alert>
    <v-alert
      v-else-if="newest && newest.status === 'failed'"
      type="error"
      outlined
      rounded="xl"
      class="text-body-2"
    >
      The last run failed: {{ newest.error || "something went wrong." }}
    </v-alert>

    <v-tabs v-model="tab" color="primary" class="quality-tabs mb-6">
      <v-tab tab-value="runs" class="text-none">
        <v-icon small class="mr-2">$history</v-icon> Runs
      </v-tab>
      <v-tab tab-value="cases" class="text-none">
        <v-icon small class="mr-2">$list-checks</v-icon> Test questions
        <span class="grey--text ml-1">({{ activeCaseCount }})</span>
      </v-tab>
    </v-tabs>

    <!-- ============ RUNS ============ -->
    <v-card v-show="tab === 'runs'" outlined rounded="xl" class="pa-6">
      <v-data-table
        :headers="runHeaders"
        :items="runs"
        :loading="runsLoading"
        :items-per-page="20"
        item-key="_id"
        class="clickable-table"
        @click:row="openReport"
      >
        <template #[`item.createdAt`]="{ item }">
          <span class="text-no-wrap">{{ formatDate(item.createdAt) }}</span>
          <v-icon v-if="item.isBaseline" small color="amber darken-2" class="ml-1" title="Baseline">
            $star
          </v-icon>
        </template>
        <template #[`item.note`]="{ item }">
          <span class="grey--text text--darken-2">{{ item.note || "—" }}</span>
        </template>
        <template #[`item.profileMode`]="{ item }">
          <v-chip x-small outlined>{{ profileLabel(item.profileMode) }}</v-chip>
        </template>
        <template #[`item.passRate`]="{ item }">
          <template v-if="item.status === 'done'">
            <span :class="['font-weight-bold', `${passRateColor(item.passRate)}--text`]">
              {{ formatRate(item.passRate) }}
            </span>
            <span class="text-caption grey--text ml-1">
              {{ item.totals ? `${item.totals.passed}/${item.totals.cases}` : "" }}
            </span>
          </template>
          <v-chip v-else x-small :color="runStatus(item).color" text-color="white">
            {{ runStatus(item).label }}
          </v-chip>
        </template>
        <template #[`item.delta`]="{ item }">
          <span
            v-if="deltaOf(item) != null"
            :class="deltaOf(item) < -5 ? 'error--text font-weight-bold' : deltaOf(item) < 0 ? 'error--text' : 'success--text'"
          >
            {{ formatDelta(deltaOf(item)) }}
          </span>
          <span v-else-if="item.isBaseline" class="text-caption grey--text">Baseline</span>
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn
            v-if="item.status === 'done' && !item.isBaseline"
            x-small
            text
            rounded
            class="text-none"
            :loading="baselineBusy === item._id"
            @click.stop="setBaseline(item)"
          >
            Set as baseline
          </v-btn>
        </template>
        <template #no-data>
          <div class="py-6 text-body-2 grey--text">
            No runs yet. Add test questions, then click Run tests.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- ============ TEST QUESTIONS ============ -->
    <v-card v-show="tab === 'cases'" outlined rounded="xl" class="pa-6">
      <div class="d-flex align-center flex-wrap mb-4">
        <v-btn-toggle v-model="caseFilter" mandatory rounded dense color="primary" class="mr-4 my-1">
          <v-btn value="active" small class="text-none">Active</v-btn>
          <v-btn value="inactive" small class="text-none">Turned off</v-btn>
          <v-btn value="all" small class="text-none">All</v-btn>
        </v-btn-toggle>
        <v-text-field
          v-model="caseSearch"
          placeholder="Search questions"
          prepend-inner-icon="$search"
          outlined
          dense
          hide-details
          clearable
          class="search-field my-1"
        />
        <v-spacer />
        <v-btn color="primary" depressed rounded class="text-none my-1" @click="editCase(null)">
          <v-icon small class="mr-1">$plus</v-icon> Add test question
        </v-btn>
      </div>

      <v-data-table
        :headers="caseHeaders"
        :items="filteredCases"
        :loading="casesLoading"
        :items-per-page="20"
        item-key="_id"
        class="clickable-table"
        @click:row="editCase"
      >
        <template #[`item.question`]="{ item }">
          <div class="py-2">
            <div class="font-weight-medium">{{ item.question }}</div>
            <div class="text-caption grey--text text-truncate expected">{{ item.expected }}</div>
          </div>
        </template>
        <template #[`item.origin`]="{ item }">
          <v-chip x-small outlined :color="caseOrigin(item.origin).color">
            {{ caseOrigin(item.origin).label }}
          </v-chip>
          <v-chip v-for="tag in item.tags || []" :key="tag" x-small class="ml-1">{{ tag }}</v-chip>
        </template>
        <template #[`item.active`]="{ item }">
          <div @click.stop>
            <v-switch
              :input-value="item.active"
              inset
              dense
              hide-details
              class="mt-0"
              :loading="caseBusy === item._id"
              :aria-label="item.active ? 'Turn off' : 'Turn on'"
              @change="toggleCase(item, $event)"
            />
          </div>
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn icon small aria-label="Delete test question" @click.stop="deletingCase = item">
            <v-icon small>$trash-2</v-icon>
          </v-btn>
        </template>
        <template #no-data>
          <div class="py-6 text-body-2 grey--text">
            No test questions. Click Generate from FAQs, or add your own.
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Start a run -->
    <v-dialog v-model="runOpen" max-width="460">
      <v-card rounded="xl">
        <v-card-title class="text-h6">Run tests</v-card-title>
        <v-card-text>
          <div class="text-body-2 grey--text text--darken-1 mb-4">
            Every active test question goes through your bot in the sandbox.
            Nothing is sent to customers.
          </div>
          <v-radio-group v-model="runForm.profileMode" class="mt-0" hide-details>
            <v-radio value="published">
              <template #label>
                <div>
                  <div class="text-body-2 font-weight-bold black--text">Live profile</div>
                  <div class="text-caption grey--text">What customers get today.</div>
                </div>
              </template>
            </v-radio>
            <v-radio value="draft" class="mt-2">
              <template #label>
                <div>
                  <div class="text-body-2 font-weight-bold black--text">Test my draft profile</div>
                  <div class="text-caption grey--text">
                    Your saved, unpublished Bot Profile, to check it before publishing.
                  </div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>
          <v-text-field
            v-model="runForm.note"
            label="Note (optional)"
            placeholder="e.g. After updating refund FAQs"
            outlined
            dense
            hide-details
            class="mt-5"
          />
          <v-alert v-if="runError" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
            {{ runError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="starting" @click="runOpen = false">Cancel</v-btn>
          <v-btn color="primary" depressed rounded class="text-none" :loading="starting" @click="startRun">
            Start
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete test question -->
    <v-dialog :value="!!deletingCase" max-width="440" @input="deletingCase = null">
      <v-card v-if="deletingCase" rounded="xl">
        <v-card-title class="text-h6">Delete this test question?</v-card-title>
        <v-card-text class="text-body-2">
          "{{ deletingCase.question }}"
          <template v-if="deletingCase.origin !== 'manual'">
            <br /><br />
            It was made from your FAQs, so Generate from FAQs will add it back.
            To skip it for good, turn it off instead.
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" @click="deletingCase = null">Cancel</v-btn>
          <v-btn color="error" depressed rounded class="text-none" :loading="caseBusy === deletingCase._id" @click="deleteCase">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <CaseDialog v-model="caseOpen" :test-case="caseEditing" @saved="loadCases" @open-item="openItem" />

    <ItemEditorDrawer :item-id="itemId" :permissions="perms" @close="itemId = null" />
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import CaseDialog from "@/components/quality/CaseDialog.vue";
import ItemEditorDrawer from "@/components/knowledge/ItemEditorDrawer.vue";
import { apiError, formatDate, loadMyPermissions } from "@/utils/knowledge";
import {
  EVAL_API,
  PROFILE_MODES,
  RUN_STATUS,
  caseOrigin,
  formatDelta,
  formatRate,
  isRunActive,
  passRateColor,
} from "@/utils/quality";

const POLL_MS = 5000;

export default {
  name: "QualityPage",

  components: { CaseDialog, ItemEditorDrawer, ThingsToKnow },

  data() {
    return {
      tab: this.$route.query.tab === "cases" ? "cases" : "runs",
      perms: [],

      runs: [],
      runsLoading: false,
      pollTimer: null,
      baselineBusy: null,

      runOpen: false,
      runForm: { profileMode: "published", note: "" },
      starting: false,
      runError: "",

      cases: [],
      casesLoading: false,
      caseFilter: "active",
      caseSearch: "",
      caseBusy: null,
      caseOpen: false,
      caseEditing: null,
      deletingCase: null,
      generating: false,

      itemId: null,

      runHeaders: [
        { text: "Date", value: "createdAt", sortable: false },
        { text: "Note", value: "note", sortable: false },
        { text: "Profile", value: "profileMode", sortable: false },
        { text: "Pass rate", value: "passRate", sortable: false },
        { text: "vs baseline", value: "delta", sortable: false },
        { text: "", value: "actions", sortable: false, align: "end" },
      ],
      caseHeaders: [
        { text: "Question", value: "question", sortable: false },
        { text: "From", value: "origin", sortable: false },
        { text: "Active", value: "active", sortable: false },
        { text: "", value: "actions", sortable: false, align: "end" },
      ],
    };
  },

  computed: {
    newest() {
      return this.runs[0] || null;
    },
    runActive() {
      return isRunActive(this.newest);
    },
    baseline() {
      return this.runs.find((r) => r.isBaseline && r.status === "done") || null;
    },
    latest() {
      return this.runs.find((r) => r.status === "done") || null;
    },
    latestDelta() {
      return this.latest ? this.deltaOf(this.latest) : null;
    },
    regression() {
      return this.latestDelta != null && this.latestDelta < -5;
    },
    activeCaseCount() {
      return this.cases.filter((c) => c.active).length;
    },
    filteredCases() {
      const q = (this.caseSearch || "").toLowerCase();
      return this.cases.filter((c) => {
        if (this.caseFilter === "active" && !c.active) return false;
        if (this.caseFilter === "inactive" && c.active) return false;
        return !q || c.question.toLowerCase().includes(q);
      });
    },
  },

  watch: {
    tab(tab) {
      this.$router.replace({ query: tab === "cases" ? { tab } : {} }).catch(() => {});
    },
  },

  created() {
    this.loadRuns();
    this.loadCases();
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => {});
  },

  beforeDestroy() {
    clearTimeout(this.pollTimer);
  },

  methods: {
    formatDate,
    formatRate,
    formatDelta,
    passRateColor,
    caseOrigin,
    profileLabel: (mode) => PROFILE_MODES[mode] || PROFILE_MODES.published,
    runStatus: (run) => RUN_STATUS[run.status] || RUN_STATUS.queued,

    // Pass-rate change against the current baseline, for finished runs
    deltaOf(run) {
      if (!this.baseline || run.isBaseline || run.status !== "done" || run.passRate == null) return null;
      return run.passRate - this.baseline.passRate;
    },

    async loadRuns({ quiet = false } = {}) {
      clearTimeout(this.pollTimer);
      if (!quiet) this.runsLoading = true;
      const wasActive = this.runActive;
      try {
        const { data } = await apiClient.get(`${EVAL_API}/runs`);
        this.runs = data.data || [];
        if (wasActive && !this.runActive && this.newest?.status === "done") {
          this.$toast.success(`Run finished: ${formatRate(this.newest.passRate)} passed`);
        }
      } catch (err) {
        if (!quiet) this.$toast.error(apiError(err, "Failed to load runs"));
      } finally {
        this.runsLoading = false;
      }
      if (this.runActive) this.pollTimer = setTimeout(() => this.loadRuns({ quiet: true }), POLL_MS);
    },

    openReport(run) {
      if (run.status !== "done") return;
      this.$router.push(`/dashboard/quality/runs/${run._id}`);
    },

    async setBaseline(run) {
      this.baselineBusy = run._id;
      try {
        await apiClient.post(`${EVAL_API}/runs/${run._id}/baseline`);
        this.$toast.success("Baseline updated. New runs are compared with this one.");
        this.loadRuns({ quiet: true });
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to set the baseline"));
      } finally {
        this.baselineBusy = null;
      }
    },

    openRun() {
      this.runForm = { profileMode: "published", note: "" };
      this.runError = "";
      this.runOpen = true;
    },

    async startRun() {
      this.starting = true;
      this.runError = "";
      try {
        await apiClient.post(`${EVAL_API}/runs`, {
          profileMode: this.runForm.profileMode,
          note: this.runForm.note.trim() || undefined,
        });
        this.runOpen = false;
        this.tab = "runs";
        this.loadRuns({ quiet: true });
      } catch (err) {
        this.runError = apiError(err, "Couldn't start the run");
      } finally {
        this.starting = false;
      }
    },

    async loadCases() {
      this.casesLoading = true;
      try {
        const { data } = await apiClient.get(`${EVAL_API}/cases`);
        this.cases = data.data || [];
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to load test questions"));
      } finally {
        this.casesLoading = false;
      }
    },

    async generate() {
      this.generating = true;
      try {
        const { data } = await apiClient.post(`${EVAL_API}/cases/generate`);
        const { created = 0, updated = 0, deactivated = 0 } = data.data || {};
        const parts = [`${created} added`, `${updated} updated`];
        if (deactivated) parts.push(`${deactivated} turned off (FAQ removed)`);
        this.$toast.success(`Test questions from FAQs: ${parts.join(", ")}`);
        this.tab = "cases";
        this.loadCases();
      } catch (err) {
        this.$toast.error(apiError(err, "Couldn't generate test questions"));
      } finally {
        this.generating = false;
      }
    },

    editCase(testCase) {
      this.caseEditing = testCase;
      this.caseOpen = true;
    },

    async toggleCase(testCase, active) {
      this.caseBusy = testCase._id;
      try {
        await apiClient.patch(`${EVAL_API}/cases/${testCase._id}`, { active: !!active });
        testCase.active = !!active;
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to update"));
      } finally {
        this.caseBusy = null;
      }
    },

    async deleteCase() {
      const testCase = this.deletingCase;
      this.caseBusy = testCase._id;
      try {
        await apiClient.delete(`${EVAL_API}/cases/${testCase._id}`);
        this.cases = this.cases.filter((c) => c._id !== testCase._id);
        this.deletingCase = null;
        this.$toast.success("Test question deleted");
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to delete"));
      } finally {
        this.caseBusy = null;
      }
    },

    openItem(id) {
      this.caseOpen = false;
      this.itemId = id;
    },
  },
};
</script>

<style scoped>
.quality-tabs {
  border-bottom: 1px solid #e0e0e0;
}
.clickable-table >>> tbody tr {
  cursor: pointer;
}
.search-field {
  max-width: 280px;
}
.expected {
  max-width: 560px;
}
</style>
