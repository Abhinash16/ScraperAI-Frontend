<template>
  <div class="setup-page">
    <!-- Header -->
    <div class="d-flex align-center flex-wrap mb-6">
      <v-avatar size="48" rounded="xl" color="#ffedd5" class="mr-4">
        <v-icon color="black">$rocket</v-icon>
      </v-avatar>
      <div class="mr-4">
        <div class="text-h5 font-weight-bold">Setup</div>
        <div class="text-body-2 grey--text text--darken-1">
          Build your bot's knowledge, test it, then go live in one step.
        </div>
      </div>
      <v-chip v-if="running" small color="deep-orange" text-color="white" class="my-1">
        {{ setup.mode === "replace" ? "Rebuilding knowledge" : "New setup" }} in progress
      </v-chip>
    </div>

    <ThingsToKnow feature="setup" />

    <v-card v-if="!state" outlined rounded="xl" class="pa-6">
      <v-progress-linear v-if="!loadError" indeterminate color="primary" />
      <v-alert v-else type="error" outlined rounded="lg" class="mb-0">
        {{ loadError }}
        <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
      </v-alert>
    </v-card>

    <template v-else>
      <!-- Just switched over -->
      <v-alert v-if="result" type="success" outlined rounded="xl" class="text-body-2" dismissible @input="result = null">
        <div class="font-weight-bold mb-1">You're live.</div>
        {{ result.sourcesLive }} source{{ result.sourcesLive === 1 ? "" : "s" }} went live<template
          v-if="result.sourcesDeleted"
        >, {{ result.sourcesDeleted }} old source{{ result.sourcesDeleted === 1 ? " was" : "s were" }} deleted
          ({{ result.chunksDeleted || 0 }} chunks)</template><template v-if="result.gapsDeleted">,
          {{ result.gapsDeleted }} old knowledge gaps cleared</template><template v-if="result.profilePublished">,
          and your Bot Profile was published</template>.
      </v-alert>

      <!-- ============ NOT RUNNING: start ============ -->
      <v-card v-if="!running" outlined rounded="xl" class="pa-6 mb-4">
        <div class="text-subtitle-1 font-weight-bold mb-1">Start a setup</div>
        <div class="text-body-2 grey--text text--darken-1 mb-4">
          Everything you build during a setup is staged: you can test it, but
          customers keep getting your current answers until you switch over.
        </div>
        <v-radio-group v-model="startForm.mode" class="mt-0" hide-details>
          <v-radio value="new">
            <template #label>
              <div>
                <div class="text-body-2 font-weight-bold black--text">New client</div>
                <div class="text-caption grey--text">Nothing is live yet. Set up from scratch.</div>
              </div>
            </template>
          </v-radio>
          <v-radio value="replace" class="mt-2">
            <template #label>
              <div>
                <div class="text-body-2 font-weight-bold black--text">Rebuild my knowledge</div>
                <div class="text-caption grey--text">
                  Build new knowledge next to the current one. The current
                  sources keep answering until you switch over, then they're
                  deleted.
                </div>
              </div>
            </template>
          </v-radio>
        </v-radio-group>
        <v-text-field
          v-model.trim="startForm.websiteUrl"
          label="Website address (optional)"
          placeholder="https://example.com"
          outlined
          dense
          hide-details
          class="mt-5 url-field"
        />
        <v-alert v-if="startError" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
          {{ startError }}
        </v-alert>
        <div class="d-flex justify-end mt-4">
          <v-btn color="primary" depressed rounded class="text-none font-weight-bold" :loading="busy === 'start'" @click="start">
            Start setup
          </v-btn>
        </div>
      </v-card>

      <!-- ============ RUNNING: steps ============ -->
      <template v-else>
        <v-alert
          v-if="retiring.length"
          border="left"
          colored-border
          color="grey"
          elevation="0"
          outlined
          rounded="xl"
          class="text-body-2"
        >
          Still answering customers until you switch over, then deleted:
          <strong>{{ retiring.map((s) => s.name).join(", ") }}</strong>.
        </v-alert>

        <v-stepper v-model="step" vertical non-linear class="setup-stepper elevation-0 mb-4">
          <template v-for="(s, i) in STEPS">
            <v-stepper-step
              :key="`step-${s.id}`"
              :step="i + 1"
              :complete="stepDone(s.id)"
              editable
              :edit-icon="'$check'"
              :complete-icon="'$check'"
            >
              {{ s.title }}
              <small>{{ s.subtitle }}</small>
            </v-stepper-step>
            <v-stepper-content :key="`content-${s.id}`" :step="i + 1">
              <WebsiteStep v-if="s.id === 'website'" :state="state" @changed="load({ quiet: true })" />
              <ProfileStep v-else-if="s.id === 'profile'" :state="state" @changed="load({ quiet: true })" />
              <FaqStep v-else-if="s.id === 'faqs'" :state="state" @changed="load({ quiet: true })" />

              <div v-else-if="s.id === 'issues'">
                <div class="text-body-2 grey--text text--darken-1 mb-3">
                  New knowledge is checked when it's published: contradictions,
                  duplicates and private details. Blockers must be resolved or
                  dismissed before you can go live.
                </div>
                <div class="d-flex align-center">
                  <span class="text-body-2 mr-4">{{ itemDetail("no_blockers") || "—" }}</span>
                  <v-btn depressed rounded class="text-none" to="/dashboard/knowledge/issues">
                    <v-icon small class="mr-1">$shield-alert</v-icon> Review issues
                  </v-btn>
                </div>
              </div>

              <div v-else-if="s.id === 'test'">
                <div class="text-body-2 grey--text text--darken-1 mb-3">
                  Chat with the new knowledge in the sandbox, then run your
                  answer-quality tests on it. Customers see none of this.
                </div>
                <div class="text-body-2 mb-3">
                  Latest test run on the new setup: <strong>{{ itemDetail("eval") || "not run yet" }}</strong>
                </div>
                <v-btn depressed rounded class="text-none mr-2 mb-2" to="/dashboard/sandbox?knowledge=staging">
                  <v-icon small class="mr-1">$flask-conical</v-icon> Try it in the sandbox
                </v-btn>
                <v-btn depressed rounded color="primary" class="text-none mb-2" to="/dashboard/quality?run=staging">
                  <v-icon small class="mr-1">$play</v-icon> Run tests on the new setup
                </v-btn>
              </div>

              <div v-else-if="s.id === 'golive'">
                <div class="text-body-2 grey--text text--darken-1">
                  When every required item is done, switch over: the new
                  knowledge goes live and the old knowledge is deleted, in one
                  step. See the checklist below.
                </div>
              </div>
            </v-stepper-content>
          </template>
        </v-stepper>
      </template>

      <!-- ============ CHECKLIST ============ -->
      <v-card outlined rounded="xl" class="pa-6">
        <div class="d-flex align-center flex-wrap mb-4">
          <v-progress-circular
            :value="checklist.score || 0"
            :color="checklist.ready ? 'success' : 'primary'"
            size="72"
            width="7"
            class="mr-5 mb-2"
          >
            <span class="font-weight-bold">{{ checklist.score || 0 }}%</span>
          </v-progress-circular>
          <div class="mr-4 mb-2">
            <div class="text-subtitle-1 font-weight-bold">
              {{ running ? "Ready to go live?" : "Go-live readiness" }}
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              <template v-if="checklist.ready">Every required item is done.</template>
              <template v-else>
                {{ requiredLeft }} required item{{ requiredLeft === 1 ? "" : "s" }} left.
              </template>
              <template v-if="!running"> Checked against your live knowledge.</template>
            </div>
          </div>
          <v-spacer />
          <template v-if="running">
            <v-btn text rounded class="text-none mb-2" :disabled="!!busy" @click="cancelOpen = true">
              Cancel setup
            </v-btn>
            <v-btn
              color="primary"
              depressed
              rounded
              class="text-none font-weight-bold ml-2 mb-2"
              :disabled="!checklist.ready || !!busy"
              @click="switchOpen = true"
            >
              <v-icon small class="mr-1">$rocket</v-icon> Switch over
            </v-btn>
          </template>
        </div>

        <div v-for="item in checklist.items || []" :key="item.key" class="check-item d-flex align-start py-2">
          <v-icon :color="item.done ? 'success' : item.required ? 'warning' : 'grey'" class="mr-3 mt-1" small>
            {{ item.done ? "$circle-check" : "$circle" }}
          </v-icon>
          <div class="flex-grow-1">
            <div class="text-body-2 font-weight-medium">
              {{ item.label }}
              <span v-if="!item.required" class="grey--text font-weight-regular">(optional)</span>
              <span v-if="item.detail" class="grey--text font-weight-regular"> · {{ item.detail }}</span>
            </div>
            <div v-if="!item.done && item.hint" class="text-caption grey--text text--darken-1">{{ item.hint }}</div>
          </div>
          <v-btn
            v-if="!item.done && LINKS[item.key]"
            x-small
            text
            rounded
            color="primary"
            class="text-none ml-2"
            :to="LINKS[item.key].to"
          >
            {{ LINKS[item.key].label }}
          </v-btn>
        </div>
      </v-card>
    </template>

    <!-- Switch over -->
    <v-dialog v-model="switchOpen" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="text-h6">Switch over to the new knowledge?</v-card-title>
        <v-card-text class="text-body-2">
          <p>
            <strong>New knowledge goes live</strong> ({{ staging.length }} source{{ staging.length === 1 ? "" : "s" }}).
            <template v-if="retiring.length">
              <strong>Old knowledge from {{ retiring.length }} source{{ retiring.length === 1 ? "" : "s" }} will be deleted</strong>
              ({{ retiring.map((s) => s.name).join(", ") }}). This can't be undone.
            </template>
          </p>
          <v-checkbox v-model="switchForm.publishProfile" hide-details dense label="Also publish my Bot Profile draft" />
          <v-checkbox
            v-model="switchForm.dropOldGaps"
            hide-details
            dense
            label="Clear knowledge gaps from before the setup"
          />
          <v-alert v-if="switchError" type="error" dense outlined rounded="lg" class="mt-4 mb-0">
            {{ switchError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="busy === 'switch'" @click="switchOpen = false">Not yet</v-btn>
          <v-btn color="primary" depressed rounded class="text-none" :loading="busy === 'switch'" @click="switchOver">
            Switch over
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Cancel -->
    <v-dialog v-model="cancelOpen" max-width="460">
      <v-card rounded="xl">
        <v-card-title class="text-h6">Cancel this setup?</v-card-title>
        <v-card-text class="text-body-2">
          Your live knowledge stays as it is and nothing is replaced.
          <v-checkbox
            v-model="cancelForm.deleteStaged"
            hide-details
            dense
            class="mt-3"
            label="Delete the knowledge this setup built"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="busy === 'cancel'" @click="cancelOpen = false">Keep going</v-btn>
          <v-btn color="error" depressed rounded class="text-none" :loading="busy === 'cancel'" @click="cancel">
            Cancel setup
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import FaqStep from "@/components/setup/FaqStep.vue";
import ProfileStep from "@/components/setup/ProfileStep.vue";
import WebsiteStep from "@/components/setup/WebsiteStep.vue";
import { apiError } from "@/utils/knowledge";
import { CHECKLIST_LINKS, SETUP_API } from "@/utils/setup";

const STEPS = [
  { id: "website", title: "Website", subtitle: "Find and import your pages" },
  { id: "profile", title: "Bot Profile", subtitle: "Company details from your website" },
  { id: "faqs", title: "FAQs", subtitle: "Suggested questions and answers" },
  { id: "issues", title: "Review issues", subtitle: "Contradictions and private details" },
  { id: "test", title: "Test", subtitle: "Sandbox and answer-quality tests" },
  { id: "golive", title: "Go live", subtitle: "Switch over" },
];

export default {
  name: "SetupPage",

  components: { FaqStep, ProfileStep, ThingsToKnow, WebsiteStep },

  data: () => ({
    STEPS,
    LINKS: CHECKLIST_LINKS,
    state: null,
    loadError: "",
    step: 1,
    busy: null,
    result: null,

    startForm: { mode: "new", websiteUrl: "" },
    startError: "",

    switchOpen: false,
    switchForm: { publishProfile: true, dropOldGaps: true },
    switchError: "",

    cancelOpen: false,
    cancelForm: { deleteStaged: true },
  }),

  computed: {
    setup() {
      return this.state?.setup || null;
    },
    running() {
      return !!this.setup;
    },
    staging() {
      return this.state?.staging || [];
    },
    retiring() {
      return this.state?.retiring || [];
    },
    checklist() {
      return this.state?.checklist || { items: [], score: 0, ready: false };
    },
    requiredLeft() {
      return (this.checklist.items || []).filter((i) => i.required && !i.done).length;
    },
  },

  created() {
    this.load();
  },

  methods: {
    async load({ quiet = false } = {}) {
      if (!quiet) this.loadError = "";
      try {
        const { data } = await apiClient.get(SETUP_API);
        const first = !this.state;
        this.state = data.data;
        if (first) this.step = this.firstOpenStep();
        if (!this.running && this.setup === null && !this.startForm.websiteUrl) {
          this.startForm.mode = this.hasLiveKnowledge() ? "replace" : "new";
        }
      } catch (err) {
        if (!quiet) this.loadError = apiError(err, "Failed to load the setup");
      }
    },

    // Knowledge already live suggests a rebuild rather than a new setup
    hasLiveKnowledge() {
      const item = (this.checklist.items || []).find((i) => i.key === "knowledge");
      return !!item && /^[1-9]/.test(item.detail || "");
    },

    item(key) {
      return (this.checklist.items || []).find((i) => i.key === key) || null;
    },

    itemDetail(key) {
      return this.item(key)?.detail || "";
    },

    stepDone(id) {
      const has = (type) => this.staging.some((s) => s.type === type && (s.stats?.publishedCount || 0) > 0);
      switch (id) {
        case "website":
          return has("website");
        case "profile":
          return !!this.item("profile")?.done;
        case "faqs":
          return has("faq");
        case "issues":
          return !!this.item("no_blockers")?.done;
        case "test":
          return !!this.item("eval")?.done;
        case "golive":
          return !!this.checklist.ready;
        default:
          return false;
      }
    },

    firstOpenStep() {
      const i = STEPS.findIndex((s) => !this.stepDone(s.id));
      return i === -1 ? STEPS.length : i + 1;
    },

    async start() {
      this.busy = "start";
      this.startError = "";
      try {
        await apiClient.post(`${SETUP_API}/start`, {
          mode: this.startForm.mode,
          websiteUrl: this.startForm.websiteUrl || undefined,
        });
        this.result = null;
        this.state = null;
        await this.load();
        this.step = 1;
      } catch (err) {
        this.startError = apiError(err, "Couldn't start the setup");
      } finally {
        this.busy = null;
      }
    },

    async switchOver() {
      this.busy = "switch";
      this.switchError = "";
      try {
        const { data } = await apiClient.post(`${SETUP_API}/switch-over`, this.switchForm);
        this.result = data.data?.switchOver || {};
        this.switchOpen = false;
        this.$toast.success("Switched over. The new knowledge is live.");
        await this.load({ quiet: true });
      } catch (err) {
        this.switchError = apiError(err, "Couldn't switch over");
      } finally {
        this.busy = null;
      }
    },

    async cancel() {
      this.busy = "cancel";
      try {
        await apiClient.post(`${SETUP_API}/cancel`, this.cancelForm);
        this.cancelOpen = false;
        this.$toast.success("Setup cancelled. Your live knowledge is unchanged.");
        await this.load({ quiet: true });
      } catch (err) {
        this.$toast.error(apiError(err, "Couldn't cancel the setup"));
      } finally {
        this.busy = null;
      }
    },
  },
};
</script>

<style scoped>
.url-field {
  max-width: 420px;
}
.setup-stepper {
  border: 1px solid #e4e8f2;
  border-radius: 16px !important;
}
.check-item {
  border-top: 1px solid #f1f5f9;
}
</style>
