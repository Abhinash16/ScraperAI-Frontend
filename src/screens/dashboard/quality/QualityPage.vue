<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
          Test runs
        </h1>
        <div class="text-body-2 grey--text text--darken-1">
          Test how well your bot answers, before your customers find out.
        </div>
      </div>
      <v-spacer />
      <div class="d-flex flex-wrap align-center mb-2">
        <v-btn
          outlined
          color="primary"
          class="my-1"
          :loading="generating"
          @click="generate"
        >
          <v-icon left size="16">$wand-sparkles</v-icon>
          Generate from FAQs
        </v-btn>
        <v-btn
          color="success"
          depressed
          class="font-weight-bold ml-2 my-1"
          :disabled="runActive"
          @click="openRun"
        >
          <v-icon left size="16">$play</v-icon>
          Run tests
        </v-btn>
      </div>
    </div>

    <!-- SUMMARY -->
    <v-row dense class="mb-3">
      <v-col cols="6" md="3">
        <v-card
          outlined
          rounded="lg"
          class="d-flex align-center pa-4 fill-height"
        >
          <v-progress-circular
            :value="latest ? latest.passRate || 0 : 0"
            :color="latest ? passRateColor(latest.passRate) : 'grey lighten-2'"
            size="44"
            width="5"
            class="mr-3 flex-shrink-0"
          >
            <v-icon
              size="16"
              :color="latest ? passRateColor(latest.passRate) : 'grey'"
              >$circle-check</v-icon
            >
          </v-progress-circular>
          <div>
            <div
              class="text-h6 font-weight-bold"
              :class="latest ? rateText(latest.passRate) : 'grey--text'"
            >
              {{ latest ? formatRate(latest.passRate) : "—" }}
            </div>
            <div class="text-caption grey--text text--darken-1">
              Latest pass rate
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card
          outlined
          rounded="lg"
          class="d-flex align-center pa-4 fill-height"
        >
          <v-avatar
            size="44"
            tile
            class="rounded-lg mr-3 flex-shrink-0"
            :color="regression ? 'red lighten-5' : 'green lighten-5'"
          >
            <v-icon size="20" :color="regression ? 'error' : 'success'">
              {{
                latestDelta != null && latestDelta < 0
                  ? "$trending-down"
                  : "$trending-up"
              }}
            </v-icon>
          </v-avatar>
          <div>
            <div
              class="text-h6 font-weight-bold"
              :class="
                latestDelta == null
                  ? 'grey--text'
                  : latestDelta < 0
                  ? 'error--text'
                  : 'success--text'
              "
            >
              {{
                latestDelta != null && latest && !latest.isBaseline
                  ? formatDelta(latestDelta)
                  : "—"
              }}
            </div>
            <div class="text-caption grey--text text--darken-1">
              vs baseline
              <v-chip
                v-if="regression"
                x-small
                label
                color="error"
                class="font-weight-bold ml-1"
              >
                Regression
              </v-chip>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card
          outlined
          rounded="lg"
          class="d-flex align-center pa-4 fill-height"
        >
          <v-avatar
            size="44"
            tile
            color="indigo lighten-5"
            class="rounded-lg mr-3 flex-shrink-0"
          >
            <v-icon size="20" color="indigo">$list-checks</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold grey--text text--darken-4">
              {{ activeCaseCount }}
            </div>
            <div class="text-caption grey--text text--darken-1">
              Active questions
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card
          outlined
          rounded="lg"
          class="d-flex align-center pa-4 fill-height"
        >
          <v-avatar
            size="44"
            tile
            color="blue-grey lighten-5"
            class="rounded-lg mr-3 flex-shrink-0"
          >
            <v-icon size="20" color="blue-grey">$history</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold grey--text text--darken-4">
              {{ runs.length }}
            </div>
            <div class="text-caption grey--text text--darken-1">Runs</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <ThingsToKnow feature="quality" />

    <!-- Run in progress / failed -->
    <v-alert
      v-if="runActive"
      text
      dense
      color="info"
      rounded="lg"
      class="text-body-2 py-3"
    >
      <template #prepend>
        <v-progress-circular
          indeterminate
          size="18"
          width="2"
          color="info"
          class="mr-3"
        />
      </template>
      <span class="grey--text text--darken-3">
        Testing {{ runningCount }} with the
        {{ profileLabel(newest.profileMode).toLowerCase() }}. This takes a
        minute or two; you can leave this page.
      </span>
    </v-alert>
    <v-alert
      v-else-if="newest && newest.status === 'failed'"
      type="error"
      text
      dense
      rounded="lg"
      class="text-body-2 py-3"
    >
      The last run failed: {{ newest.error || "something went wrong." }}
    </v-alert>

    <!-- TABS -->
    <v-tabs
      class="mb-4"
      v-model="tab"
      color="primary"
      background-color="transparent"
      slider-size="3"
      height="44"
    >
      <v-tab tab-value="runs" class="text-body-2 font-weight-bold">
        <v-icon size="16" class="mr-2">$history</v-icon>
        Runs
      </v-tab>
      <v-tab tab-value="cases" class="text-body-2 font-weight-bold">
        <v-icon size="16" class="mr-2">$list-checks</v-icon>
        Test questions
        <v-chip x-small label class="font-weight-bold ml-2">{{
          activeCaseCount
        }}</v-chip>
      </v-tab>
    </v-tabs>

    <!-- ============ RUNS ============ -->
    <div v-show="tab === 'runs'">
      <v-data-iterator
        :items="runs"
        :loading="runsLoading"
        :items-per-page="20"
        :footer-props="{ itemsPerPageOptions: [20, 50, 100] }"
        item-key="_id"
      >
        <template #loading>
          <v-card
            v-for="n in 3"
            :key="n"
            outlined
            rounded="lg"
            class="pa-2 mb-3"
          >
            <v-skeleton-loader type="list-item-avatar-two-line" />
          </v-card>
        </template>

        <template #no-data>
          <v-card
            outlined
            rounded="lg"
            class="d-flex flex-column align-center text-center px-6 py-12 mb-3"
          >
            <v-avatar color="green lighten-5" size="64" class="mb-4">
              <v-icon size="28" color="success">$play</v-icon>
            </v-avatar>
            <div
              class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1"
            >
              No runs yet
            </div>
            <div class="text-body-2 grey--text text--darken-1 mb-4">
              Add test questions, then run them to see how well your bot
              answers.
            </div>
            <v-btn
              depressed
              color="success"
              :disabled="runActive"
              @click="openRun"
            >
              <v-icon left size="16">$play</v-icon>
              Run tests
            </v-btn>
          </v-card>
        </template>

        <template #default="{ items }">
          <v-card
            v-for="run in items"
            :key="run._id"
            outlined
            rounded="lg"
            class="d-flex flex-wrap align-center pa-4 mb-3"
            @click="openReport(run)"
          >
            <div class="d-flex align-center flex-grow-1 mr-4 overflow-hidden">
              <v-progress-circular
                v-if="run.status === 'done'"
                :value="run.passRate || 0"
                :color="passRateColor(run.passRate)"
                size="52"
                width="5"
                class="mr-4 flex-shrink-0"
              >
                <span
                  class="text-caption font-weight-bold"
                  :class="rateText(run.passRate)"
                >
                  {{ formatRate(run.passRate) }}
                </span>
              </v-progress-circular>
              <v-avatar
                v-else
                size="52"
                color="grey lighten-4"
                class="mr-4 flex-shrink-0"
              >
                <v-progress-circular
                  v-if="run.status === 'running' || run.status === 'queued'"
                  indeterminate
                  size="20"
                  width="2"
                  color="primary"
                />
                <v-icon v-else size="20" color="error">$circle-x</v-icon>
              </v-avatar>

              <div class="overflow-hidden">
                <div class="d-flex flex-wrap align-center">
                  <span
                    class="text-body-2 font-weight-bold grey--text text--darken-4 mr-2"
                  >
                    {{ formatDate(run.createdAt) }}
                  </span>
                  <v-chip
                    v-if="run.isBaseline"
                    x-small
                    label
                    color="amber lighten-5"
                    text-color="amber darken-4"
                    class="font-weight-bold mr-1"
                  >
                    <v-icon left size="10">$star</v-icon>
                    Baseline
                  </v-chip>
                  <v-chip
                    v-if="run.status !== 'done'"
                    x-small
                    label
                    :color="runStatus(run).color"
                    text-color="white"
                    class="font-weight-bold mr-1"
                  >
                    {{ runStatus(run).label }}
                  </v-chip>
                </div>
                <div
                  class="text-caption grey--text text--darken-1 text-truncate"
                >
                  {{ run.note || "No note" }}
                </div>
                <div class="d-flex flex-wrap align-center mt-1">
                  <v-chip x-small label outlined class="mr-1">{{
                    profileLabel(run.profileMode)
                  }}</v-chip>
                  <v-chip
                    v-if="run.knowledgeMode === 'staging'"
                    x-small
                    label
                    outlined
                    color="deep-orange"
                    class="mr-1"
                  >
                    Staging
                  </v-chip>
                  <span
                    v-if="run.status === 'done' && run.totals"
                    class="text-caption grey--text text--darken-1"
                  >
                    {{ run.totals.passed }}/{{ run.totals.cases }} passed
                  </span>
                </div>
              </div>
            </div>

            <div class="d-flex align-center ml-auto mt-3 mt-sm-0" @click.stop>
              <span
                v-if="deltaOf(run) != null"
                class="text-body-2 font-weight-bold mr-3"
                :class="deltaOf(run) < 0 ? 'error--text' : 'success--text'"
              >
                {{ formatDelta(deltaOf(run)) }}
              </span>
              <v-btn
                v-if="run.status === 'done' && !run.isBaseline"
                small
                text
                color="amber darken-3"
                :loading="baselineBusy === run._id"
                @click="setBaseline(run)"
              >
                <v-icon left size="14">$star</v-icon>
                Set as baseline
              </v-btn>
              <v-icon size="18" color="grey lighten-1" class="ml-1"
                >$chevron-right</v-icon
              >
            </div>
          </v-card>
        </template>
      </v-data-iterator>
    </div>

    <!-- ============ TEST QUESTIONS ============ -->
    <div v-show="tab === 'cases'">
      <v-card outlined rounded="lg" class="px-3 py-2 mb-4">
        <v-row dense align="center">
          <v-col cols="12" md="auto">
            <v-btn-toggle v-model="caseFilter" mandatory dense color="success">
              <v-btn value="active" small>Active</v-btn>
              <v-btn value="inactive" small>Turned off</v-btn>
              <v-btn value="all" small>All</v-btn>
            </v-btn-toggle>
          </v-col>
          <v-col cols="12" sm="8" md="4">
            <v-text-field
              v-model="caseSearch"
              placeholder="Search questions"
              outlined
              dense
              hide-details
              clearable
            />
          </v-col>
          <v-spacer />
          <v-col cols="12" sm="4" md="auto" class="text-right">
            <v-btn depressed color="primary" @click="editCase(null)">
              <v-icon left size="16">$plus</v-icon>
              Add test question
            </v-btn>
          </v-col>
        </v-row>
      </v-card>

      <v-data-iterator
        :items="filteredCases"
        :loading="casesLoading"
        :items-per-page="20"
        :footer-props="{ itemsPerPageOptions: [20, 50, 100] }"
        item-key="_id"
      >
        <template #loading>
          <v-card
            v-for="n in 4"
            :key="n"
            outlined
            rounded="lg"
            class="pa-2 mb-3"
          >
            <v-skeleton-loader type="list-item-two-line" />
          </v-card>
        </template>

        <template #no-data>
          <v-card
            outlined
            rounded="lg"
            class="d-flex flex-column align-center text-center px-6 py-12 mb-3"
          >
            <v-avatar color="indigo lighten-5" size="64" class="mb-4">
              <v-icon size="28" color="indigo">$list-checks</v-icon>
            </v-avatar>
            <div
              class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1"
            >
              No test questions
            </div>
            <div class="text-body-2 grey--text text--darken-1 mb-4">
              Make them from your FAQs in one click, or add your own.
            </div>
            <div class="d-flex flex-wrap justify-center">
              <v-btn
                outlined
                color="primary"
                class="ma-1"
                :loading="generating"
                @click="generate"
              >
                <v-icon left size="16">$wand-sparkles</v-icon>
                Generate from FAQs
              </v-btn>
              <v-btn
                depressed
                color="primary"
                class="ma-1"
                @click="editCase(null)"
              >
                <v-icon left size="16">$plus</v-icon>
                Add test question
              </v-btn>
            </div>
          </v-card>
        </template>

        <template #default="{ items }">
          <v-card
            v-for="item in items"
            :key="item._id"
            outlined
            rounded="lg"
            class="d-flex align-center pa-4 mb-3"
            @click="editCase(item)"
          >
            <v-avatar
              size="36"
              tile
              class="rounded-lg mr-4 flex-shrink-0"
              :color="item.active ? 'green lighten-5' : 'grey lighten-4'"
            >
              <v-icon size="18" :color="item.active ? 'success' : 'grey'"
                >$message-circle-question-mark</v-icon
              >
            </v-avatar>
            <div class="flex-grow-1 overflow-hidden mr-3">
              <div
                class="text-body-2 font-weight-bold text-break"
                :class="
                  item.active ? 'grey--text text--darken-4' : 'grey--text'
                "
              >
                {{ item.question }}
              </div>
              <div class="text-caption grey--text text--darken-1 text-truncate">
                {{ item.expected }}
              </div>
              <div class="d-flex flex-wrap align-center mt-1">
                <v-chip
                  x-small
                  label
                  outlined
                  :color="caseOrigin(item.origin).color"
                  class="mr-1"
                >
                  {{ caseOrigin(item.origin).label }}
                </v-chip>
                <v-chip
                  v-for="tag in item.tags || []"
                  :key="tag"
                  x-small
                  label
                  class="mr-1"
                  >{{ tag }}</v-chip
                >
              </div>
            </div>
            <div class="d-flex align-center flex-shrink-0" @click.stop>
              <v-switch
                :input-value="item.active"
                inset
                dense
                hide-details
                color="success"
                class="mt-0 pt-0"
                :loading="caseBusy === item._id"
                :aria-label="item.active ? 'Turn off' : 'Turn on'"
                @change="toggleCase(item, $event)"
              />
              <v-btn
                icon
                small
                color="error"
                aria-label="Delete test question"
                @click="deletingCase = item"
              >
                <v-icon size="16">$trash-2</v-icon>
              </v-btn>
            </div>
          </v-card>
        </template>
      </v-data-iterator>
    </div>

    <!-- START A RUN -->
    <v-dialog v-model="runOpen" max-width="520">
      <v-card rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">Run tests</v-card-title>
        <v-card-subtitle class="text-body-2">
          Every active test question goes through your bot in the sandbox.
          Nothing is sent to customers.
        </v-card-subtitle>
        <v-card-text>
          <div
            class="text-caption font-weight-bold text-uppercase grey--text mb-2"
          >
            Bot Profile
          </div>
          <v-item-group v-model="runForm.profileMode" mandatory class="mb-5">
            <v-row dense>
              <v-col
                v-for="m in PROFILE_OPTIONS"
                :key="m.value"
                cols="12"
                sm="6"
              >
                <v-item v-slot="{ active, toggle }" :value="m.value">
                  <v-card
                    :outlined="!active"
                    :color="active ? 'green lighten-5' : undefined"
                    :elevation="0"
                    rounded="lg"
                    class="d-flex align-start pa-3 fill-height"
                    :aria-pressed="String(active)"
                    @click="toggle"
                  >
                    <v-icon
                      size="18"
                      :color="active ? 'green darken-1' : 'grey lighten-1'"
                      class="mr-2 mt-1 flex-shrink-0"
                    >
                      {{ active ? "$circle-check" : "$circle" }}
                    </v-icon>
                    <div>
                      <div
                        class="text-body-2 font-weight-bold"
                        :class="
                          active
                            ? 'green--text text--darken-2'
                            : 'grey--text text--darken-4'
                        "
                      >
                        {{ m.title }}
                      </div>
                      <div class="text-caption grey--text text--darken-1">
                        {{ m.text }}
                      </div>
                    </div>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-item-group>

          <template v-if="setupRunning">
            <div
              class="text-caption font-weight-bold text-uppercase grey--text mb-2"
            >
              Knowledge
            </div>
            <v-item-group
              v-model="runForm.knowledgeMode"
              mandatory
              class="mb-1"
            >
              <v-row dense>
                <v-col
                  v-for="k in KNOWLEDGE_OPTIONS"
                  :key="k.value"
                  cols="12"
                  sm="6"
                >
                  <v-item v-slot="{ active, toggle }" :value="k.value">
                    <v-card
                      :outlined="!active"
                      :color="active ? 'green lighten-5' : undefined"
                      :elevation="0"
                      rounded="lg"
                      class="d-flex align-center pa-3 fill-height"
                      :aria-pressed="String(active)"
                      @click="toggle"
                    >
                      <v-icon
                        size="18"
                        :color="active ? 'green darken-1' : 'grey lighten-1'"
                        class="mr-2 flex-shrink-0"
                      >
                        {{ active ? "$circle-check" : "$circle" }}
                      </v-icon>
                      <span
                        class="text-body-2 font-weight-bold"
                        :class="
                          active
                            ? 'green--text text--darken-2'
                            : 'grey--text text--darken-4'
                        "
                      >
                        {{ k.title }}
                      </span>
                    </v-card>
                  </v-item>
                </v-col>
              </v-row>
            </v-item-group>
            <div class="text-caption grey--text text--darken-1 mb-5">
              The setup checklist counts runs on the new setup (staging).
            </div>
          </template>

          <v-text-field
            v-model="runForm.note"
            label="Note (optional)"
            placeholder="e.g. After updating refund FAQs"
            outlined
            dense
            hide-details
          />
          <v-alert
            v-if="runError"
            type="error"
            dense
            text
            rounded="lg"
            class="mt-4 mb-0 text-body-2"
          >
            {{ runError }}
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-6 py-3">
          <v-spacer />
          <v-btn text :disabled="starting" @click="runOpen = false"
            >Cancel</v-btn
          >
          <v-btn
            color="success"
            depressed
            :loading="starting"
            @click="startRun"
          >
            <v-icon left size="16">$play</v-icon>
            Start
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE TEST QUESTION -->
    <v-dialog
      :value="!!deletingCase"
      max-width="440"
      @input="deletingCase = null"
    >
      <v-card v-if="deletingCase" rounded="lg">
        <v-card-text class="pt-6 text-center">
          <v-avatar color="error lighten-5" size="56" class="mb-4">
            <v-icon color="error" size="26">$trash-2</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-2">
            Delete this test question?
          </div>
          <div
            class="text-body-2 grey--text text--darken-3 font-italic text-break mb-2"
          >
            "{{ deletingCase.question }}"
          </div>
          <v-alert
            v-if="deletingCase.origin !== 'manual'"
            text
            dense
            color="amber darken-3"
            rounded="lg"
            class="text-body-2 text-left mb-0"
          >
            It was made from your FAQs, so Generate from FAQs will add it back.
            To skip it for good, turn it off instead.
          </v-alert>
        </v-card-text>
        <v-card-actions class="justify-center pb-5">
          <v-btn text @click="deletingCase = null">Cancel</v-btn>
          <v-btn
            color="error"
            depressed
            :loading="caseBusy === deletingCase._id"
            @click="deleteCase"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <CaseDialog
      v-model="caseOpen"
      :test-case="caseEditing"
      @saved="loadCases"
      @open-item="openItem"
    />

    <ItemEditorDrawer
      :item-id="itemId"
      :permissions="perms"
      @close="itemId = null"
    />
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import CaseDialog from "@/components/quality/CaseDialog.vue";
import ItemEditorDrawer from "@/components/knowledge/ItemEditorDrawer.vue";
import { apiError, formatDate, loadMyPermissions } from "@/utils/knowledge";
import { isSetupRunning, loadSetup } from "@/utils/setup";
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

const PROFILE_OPTIONS = [
  {
    value: "published",
    title: "Live profile",
    text: "What customers get today.",
  },
  {
    value: "draft",
    title: "Test my draft profile",
    text: "Your saved, unpublished Bot Profile, to check it before publishing.",
  },
];

const KNOWLEDGE_OPTIONS = [
  { value: "live", title: "Live knowledge" },
  { value: "staging", title: "New setup (staging)" },
];

export default {
  name: "QualityPage",

  components: { CaseDialog, ItemEditorDrawer, ThingsToKnow },

  data() {
    return {
      PROFILE_OPTIONS,
      KNOWLEDGE_OPTIONS,
      tab: this.$route.query.tab === "cases" ? "cases" : "runs",
      perms: [],

      runs: [],
      runsLoading: false,
      pollTimer: null,
      baselineBusy: null,

      runOpen: false,
      runForm: { profileMode: "published", knowledgeMode: "live", note: "" },
      setupRunning: false,
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
    runningCount() {
      const n = this.newest?.totals?.cases;
      return n ? `${n} questions` : "your questions";
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
      this.$router
        .replace({ query: tab === "cases" ? { tab } : {} })
        .catch(() => {});
    },
  },

  created() {
    this.loadRuns();
    this.loadCases();
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => {});
    // The Setup page links here with ?run=staging to open "Run tests"
    const openRunNow = this.$route.query.run === "staging";
    if (openRunNow) this.$router.replace({ query: {} }).catch(() => {});
    loadSetup().then((state) => {
      this.setupRunning = isSetupRunning(state);
      if (openRunNow) this.openRun();
    });
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
    // Text classes for a pass-rate colour, e.g. "amber darken-2" → amber text, darkened
    rateText(rate) {
      const [name, shade] = passRateColor(rate).split(" ");
      return shade ? `${name}--text text--${shade}` : `${name}--text`;
    },
    profileLabel: (mode) => PROFILE_MODES[mode] || PROFILE_MODES.published,
    runStatus: (run) => RUN_STATUS[run.status] || RUN_STATUS.queued,

    // Pass-rate change against the current baseline, for finished runs
    deltaOf(run) {
      if (
        !this.baseline ||
        run.isBaseline ||
        run.status !== "done" ||
        run.passRate == null
      )
        return null;
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
          this.$toast.success(
            `Run finished: ${formatRate(this.newest.passRate)} passed`
          );
        }
      } catch (err) {
        if (!quiet) this.$toast.error(apiError(err, "Failed to load runs"));
      } finally {
        this.runsLoading = false;
      }
      if (this.runActive)
        this.pollTimer = setTimeout(
          () => this.loadRuns({ quiet: true }),
          POLL_MS
        );
    },

    openReport(run) {
      if (run.status !== "done") return;
      this.$router.push(`/dashboard/quality/runs/${run._id}`);
    },

    async setBaseline(run) {
      this.baselineBusy = run._id;
      try {
        await apiClient.post(`${EVAL_API}/runs/${run._id}/baseline`);
        this.$toast.success(
          "Baseline updated. New runs are compared with this one."
        );
        this.loadRuns({ quiet: true });
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to set the baseline"));
      } finally {
        this.baselineBusy = null;
      }
    },

    openRun() {
      this.runForm = {
        profileMode: "published",
        knowledgeMode: this.setupRunning ? "staging" : "live",
        note: "",
      };
      this.runError = "";
      this.runOpen = true;
    },

    async startRun() {
      this.starting = true;
      this.runError = "";
      try {
        await apiClient.post(`${EVAL_API}/runs`, {
          profileMode: this.runForm.profileMode,
          knowledgeMode: this.setupRunning
            ? this.runForm.knowledgeMode
            : undefined,
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
        await apiClient.patch(`${EVAL_API}/cases/${testCase._id}`, {
          active: !!active,
        });
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
