<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Setup</h1>
        <div class="text-body-2 grey--text text--darken-1">
          Build your bot's knowledge, test it, then go live in one step.
        </div>
      </div>
      <v-spacer />
      <v-chip
        v-if="running"
        small
        label
        color="deep-orange lighten-5"
        text-color="deep-orange darken-2"
        class="font-weight-bold mb-2"
      >
        <v-icon left size="14">$loader-circle</v-icon>
        {{ setup.mode === "replace" ? "Rebuilding knowledge" : "New setup" }} in progress
      </v-chip>
    </div>

    <ThingsToKnow feature="setup" />

    <!-- LOADING / ERROR -->
    <v-alert v-if="!state && loadError" type="error" text rounded="lg" class="text-body-2">
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ loadError }}</span>
        <v-spacer />
        <v-btn small outlined color="error" @click="load">
          <v-icon left size="14">$refresh-cw</v-icon>
          Retry
        </v-btn>
      </div>
    </v-alert>

    <v-row v-else-if="!state">
      <v-col cols="12" md="7" lg="8">
        <v-card outlined rounded="lg" class="pa-4">
          <v-skeleton-loader type="heading, paragraph, list-item-two-line, list-item-two-line, actions" />
        </v-card>
      </v-col>
      <v-col cols="12" md="5" lg="4">
        <v-card outlined rounded="lg" class="pa-4">
          <v-skeleton-loader type="list-item-avatar-two-line, list-item, list-item, list-item" />
        </v-card>
      </v-col>
    </v-row>

    <template v-else>
      <!-- Just switched over -->
      <v-alert
        v-if="result"
        type="success"
        text
        rounded="lg"
        dismissible
        class="text-body-2"
        @input="result = null"
      >
        <div class="font-weight-bold mb-1">You're live.</div>
        {{ result.sourcesLive }} source{{ result.sourcesLive === 1 ? "" : "s" }} went live<template
          v-if="result.sourcesDeleted"
        >, {{ result.sourcesDeleted }} old source{{ result.sourcesDeleted === 1 ? " was" : "s were" }} deleted
          ({{ result.chunksDeleted || 0 }} chunks)</template><template v-if="result.gapsDeleted">,
          {{ result.gapsDeleted }} old knowledge gaps cleared</template><template v-if="result.profilePublished">,
          and your Bot Profile was published</template>.
      </v-alert>

      <v-row>
        <!-- ============ LEFT: start or steps ============ -->
        <v-col cols="12" md="7" lg="8">
          <!-- Not running: start -->
          <v-card v-if="!running" outlined rounded="lg">
            <div class="d-flex align-center pa-5">
              <v-avatar color="primary lighten-5" size="40" tile class="rounded-lg mr-4 flex-shrink-0">
                <v-icon color="primary" size="20">$rocket</v-icon>
              </v-avatar>
              <div>
                <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">
                  Start a setup
                </div>
                <div class="text-body-2 grey--text text--darken-1">
                  Everything you build is staged. You can test it, but customers keep getting
                  your current answers until you switch over.
                </div>
              </div>
            </div>
            <v-divider />

            <div class="pa-5">
              <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">
                What do you want to do?
              </div>
              <v-item-group v-model="startForm.mode" mandatory>
                <v-row dense>
                  <v-col v-for="m in MODES" :key="m.value" cols="12" sm="6">
                    <v-item v-slot="{ active, toggle }" :value="m.value">
                      <v-card
                        :outlined="!active"
                        :color="active ? 'primary lighten-5' : undefined"
                        :elevation="0"
                        rounded="lg"
                        class="d-flex align-start pa-4 fill-height"
                        :aria-pressed="String(active)"
                        @click="toggle"
                      >
                        <v-icon :color="active ? 'primary' : 'grey'" size="20" class="mr-3 mt-1 flex-shrink-0">
                          {{ active ? "$circle-dot" : "$circle" }}
                        </v-icon>
                        <div>
                          <div
                            class="text-body-2 font-weight-bold"
                            :class="active ? 'primary--text' : 'grey--text text--darken-4'"
                          >
                            {{ m.title }}
                          </div>
                          <div class="text-caption grey--text text--darken-1">{{ m.text }}</div>
                        </div>
                      </v-card>
                    </v-item>
                  </v-col>
                </v-row>
              </v-item-group>

              <v-row class="mt-3">
                <v-col cols="12" sm="8">
                  <v-text-field
                    v-model.trim="startForm.websiteUrl"
                    label="Website address (optional)"
                    placeholder="https://example.com"
                    prepend-inner-icon="$globe"
                    outlined
                    dense
                    hide-details
                  />
                </v-col>
              </v-row>

              <v-alert v-if="startError" type="error" dense text rounded="lg" class="mt-4 mb-0 text-body-2">
                {{ startError }}
              </v-alert>
            </div>

            <v-divider />
            <div class="d-flex justify-end px-5 py-3">
              <v-btn
                color="primary"
                depressed
                class="font-weight-bold"
                :loading="busy === 'start'"
                @click="start"
              >
                <v-icon left size="16">$rocket</v-icon>
                Start setup
              </v-btn>
            </div>
          </v-card>

          <!-- Running: steps -->
          <template v-else>
            <v-alert
              v-if="retiring.length"
              text
              dense
              color="blue-grey"
              rounded="lg"
              class="text-body-2 py-3"
            >
              <template #prepend>
                <v-icon color="blue-grey" size="18" class="mr-3">$info</v-icon>
              </template>
              <span class="grey--text text--darken-3">
                Still answering customers until you switch over, then deleted:
                <strong>{{ retiringNames }}</strong>.
              </span>
            </v-alert>

            <v-card outlined rounded="lg" class="px-4 pt-4 pb-1 mb-4">
              <div class="d-flex align-center mb-1 px-2">
                <span class="text-subtitle-1 font-weight-bold grey--text text--darken-4">Steps</span>
                <v-spacer />
                <span class="text-caption grey--text text--darken-1">
                  {{ stepsDone }} of {{ STEPS.length }} done
                </span>
              </div>
              <v-progress-linear
                :value="(stepsDone / STEPS.length) * 100"
                color="primary"
                background-color="grey lighten-3"
                height="4"
                rounded
                class="mx-2 mb-1"
              />

              <v-stepper v-model="step" vertical non-linear flat class="pb-2">
                <template v-for="(s, i) in STEPS">
                  <v-stepper-step
                    :key="`step-${s.id}`"
                    :step="i + 1"
                    :complete="stepDone(s.id)"
                    editable
                    edit-icon="$check"
                    complete-icon="$check"
                    color="primary"
                  >
                    <span class="font-weight-bold">{{ s.title }}</span>
                    <small class="mt-1">{{ s.subtitle }}</small>
                  </v-stepper-step>

                  <v-stepper-content :key="`content-${s.id}`" :step="i + 1">
                    <WebsiteStep v-if="s.id === 'website'" :state="state" @changed="load({ quiet: true })" />
                    <ProfileStep v-else-if="s.id === 'profile'" :state="state" @changed="load({ quiet: true })" />
                    <FaqStep v-else-if="s.id === 'faqs'" :state="state" @changed="load({ quiet: true })" />

                    <v-card v-else-if="s.id === 'issues'" outlined rounded="lg" class="pa-4">
                      <div class="text-body-2 grey--text text--darken-1 mb-4">
                        New knowledge is checked when it's published: contradictions, duplicates
                        and private details. Blockers must be resolved or dismissed before you can
                        go live.
                      </div>
                      <div class="d-flex flex-wrap align-center">
                        <v-chip small label class="font-weight-bold mr-3 my-1">
                          {{ itemDetail("no_blockers") || "Not checked yet" }}
                        </v-chip>
                        <v-btn depressed class="my-1" to="/dashboard/knowledge/issues">
                          <v-icon left size="16">$shield-alert</v-icon>
                          Review issues
                        </v-btn>
                      </div>
                    </v-card>

                    <v-card v-else-if="s.id === 'test'" outlined rounded="lg" class="pa-4">
                      <div class="text-body-2 grey--text text--darken-1 mb-3">
                        Chat with the new knowledge in the sandbox, then run your answer-quality
                        tests on it. Customers see none of this.
                      </div>
                      <div class="text-body-2 mb-4">
                        Latest test run on the new setup:
                        <strong>{{ itemDetail("eval") || "not run yet" }}</strong>
                      </div>
                      <div class="d-flex flex-wrap">
                        <v-btn depressed class="mr-2 my-1" to="/dashboard/sandbox?knowledge=staging">
                          <v-icon left size="16">$flask-conical</v-icon>
                          Try it in the sandbox
                        </v-btn>
                        <v-btn depressed color="primary" class="my-1" to="/dashboard/quality?run=staging">
                          <v-icon left size="16">$play</v-icon>
                          Run tests on the new setup
                        </v-btn>
                      </div>
                    </v-card>

                    <v-card v-else-if="s.id === 'golive'" outlined rounded="lg" class="pa-4">
                      <div class="text-body-2 grey--text text--darken-1 mb-4">
                        When every required item is done, switch over: the new knowledge goes live
                        and the old knowledge is deleted, in one step.
                      </div>
                      <v-btn
                        color="primary"
                        depressed
                        class="font-weight-bold"
                        :disabled="!checklist.ready || !!busy"
                        @click="switchOpen = true"
                      >
                        <v-icon left size="16">$rocket</v-icon>
                        Switch over
                      </v-btn>
                      <div v-if="!checklist.ready" class="text-caption grey--text text--darken-1 mt-2">
                        Finish the required items in the checklist first.
                      </div>
                    </v-card>
                  </v-stepper-content>
                </template>
              </v-stepper>
            </v-card>
          </template>
        </v-col>

        <!-- ============ RIGHT: readiness ============ -->
        <v-col cols="12" md="5" lg="4">
          <v-card outlined rounded="lg">
            <div class="d-flex align-center pa-5">
              <v-progress-circular
                :value="checklist.score || 0"
                :color="checklist.ready ? 'success' : 'primary'"
                size="64"
                width="6"
                class="mr-4 flex-shrink-0"
              >
                <span class="text-body-2 font-weight-bold grey--text text--darken-4">
                  {{ checklist.score || 0 }}%
                </span>
              </v-progress-circular>
              <div>
                <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">
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
            </div>

            <template v-if="running">
              <div class="d-flex px-5 pb-4">
                <v-btn
                  color="primary"
                  depressed
                  class="font-weight-bold flex-grow-1 mr-2"
                  :disabled="!checklist.ready || !!busy"
                  @click="switchOpen = true"
                >
                  <v-icon left size="16">$rocket</v-icon>
                  Switch over
                </v-btn>
                <v-btn outlined color="grey darken-1" :disabled="!!busy" @click="cancelOpen = true">
                  Cancel setup
                </v-btn>
              </div>
            </template>

            <v-divider />

            <div class="py-1">
              <template v-for="(item, i) in checklist.items || []">
                <v-divider v-if="i > 0" :key="`d-${item.key}`" />
                <div :key="item.key" class="d-flex align-start px-5 py-3">
                  <v-icon :color="checkTone(item).color" size="18" class="mr-3 mt-1 flex-shrink-0">
                    {{ checkTone(item).icon }}
                  </v-icon>
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="text-body-2 font-weight-medium grey--text text--darken-4">
                      {{ item.label }}
                      <span v-if="!item.required" class="text-caption grey--text">(optional)</span>
                    </div>
                    <div v-if="item.detail" class="text-caption grey--text text--darken-1">
                      {{ item.detail }}
                    </div>
                    <div v-if="!item.done && item.hint" class="text-caption grey--text text--darken-1">
                      {{ item.hint }}
                    </div>
                    <v-btn
                      v-if="!item.done && LINKS[item.key]"
                      x-small
                      text
                      color="primary"
                      class="px-0 mt-1"
                      :to="LINKS[item.key].to"
                    >
                      {{ LINKS[item.key].label }}
                      <v-icon right size="12">$arrow-right</v-icon>
                    </v-btn>
                  </div>
                </div>
              </template>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- SWITCH OVER -->
    <v-dialog v-model="switchOpen" max-width="500">
      <v-card rounded="lg">
        <v-card-text class="pt-6">
          <div class="d-flex align-center mb-4">
            <v-avatar color="primary lighten-5" size="44" class="mr-3 flex-shrink-0">
              <v-icon color="primary" size="22">$rocket</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold grey--text text--darken-4">
              Switch over to the new knowledge?
            </div>
          </div>
          <div class="text-body-2 grey--text text--darken-3 mb-3">
            <strong>New knowledge goes live</strong>
            ({{ staging.length }} source{{ staging.length === 1 ? "" : "s" }}).
          </div>
          <v-alert v-if="retiring.length" text dense color="error" rounded="lg" class="text-body-2">
            <strong>
              Old knowledge from {{ retiring.length }} source{{ retiring.length === 1 ? "" : "s" }}
              will be deleted
            </strong>
            ({{ retiringNames }}). This can't be undone.
          </v-alert>
          <v-checkbox v-model="switchForm.publishProfile" hide-details dense label="Also publish my Bot Profile draft" />
          <v-checkbox
            v-model="switchForm.dropOldGaps"
            hide-details
            dense
            label="Clear knowledge gaps from before the setup"
          />
          <v-alert v-if="switchError" type="error" dense text rounded="lg" class="mt-4 mb-0 text-body-2">
            {{ switchError }}
          </v-alert>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-6 py-3">
          <v-spacer />
          <v-btn text :disabled="busy === 'switch'" @click="switchOpen = false">Not yet</v-btn>
          <v-btn color="primary" depressed :loading="busy === 'switch'" @click="switchOver">
            Switch over
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- CANCEL -->
    <v-dialog v-model="cancelOpen" max-width="440">
      <v-card rounded="lg">
        <v-card-text class="pt-6">
          <div class="d-flex align-center mb-3">
            <v-avatar color="grey lighten-4" size="44" class="mr-3 flex-shrink-0">
              <v-icon color="grey darken-2" size="22">$x</v-icon>
            </v-avatar>
            <div class="text-h6 font-weight-bold grey--text text--darken-4">Cancel this setup?</div>
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            Your live knowledge stays as it is and nothing is replaced.
          </div>
          <v-checkbox
            v-model="cancelForm.deleteStaged"
            hide-details
            dense
            class="mt-3"
            label="Delete the knowledge this setup built"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-6 py-3">
          <v-spacer />
          <v-btn text :disabled="busy === 'cancel'" @click="cancelOpen = false">Keep going</v-btn>
          <v-btn color="error" depressed :loading="busy === 'cancel'" @click="cancel">
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

const MODES = [
  {
    value: "new",
    title: "New client",
    text: "Nothing is live yet. Set up from scratch.",
  },
  {
    value: "replace",
    title: "Rebuild my knowledge",
    text: "Build new knowledge next to the current one. The current sources keep answering until you switch over, then they're deleted.",
  },
];

export default {
  name: "SetupPage",

  components: { FaqStep, ProfileStep, ThingsToKnow, WebsiteStep },

  data: () => ({
    STEPS,
    MODES,
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
    retiringNames() {
      return this.retiring.map((s) => s.name).join(", ");
    },
    stepsDone() {
      return STEPS.filter((s) => this.stepDone(s.id)).length;
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

    // Done, required and still to do, or optional
    checkTone(item) {
      if (item.done) return { color: "success", icon: "$circle-check" };
      if (item.required) return { color: "amber darken-2", icon: "$circle-alert" };
      return { color: "grey", icon: "$circle" };
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
