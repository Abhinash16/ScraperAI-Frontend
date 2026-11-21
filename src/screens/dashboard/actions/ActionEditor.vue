<template>
  <div>
    <ThingsToKnow feature="actions" />

    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <router-link to="/dashboard/actions" class="text-caption text-decoration-none">
          <v-icon size="14" color="primary">$arrow-left</v-icon>
          All actions
        </router-link>
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
          {{ isNew ? "New action" : form.name || "Action" }}
        </h1>
        <div class="text-body-2 grey--text text--darken-1">
          {{ request ? "The bot raises a request in your system by calling your API." : "The bot sends a payment link by calling your API." }}
        </div>
      </div>
      <v-spacer />
      <div class="d-flex align-center mb-2">
        <v-btn v-if="!isNew" text color="error" class="mr-2" @click="deleteOpen = true">
          <v-icon left size="16">$trash-2</v-icon>
          Delete
        </v-btn>
        <v-btn color="primary" depressed class="font-weight-bold" :loading="saving" :disabled="loading" @click="save">
          <v-icon left size="16">$check</v-icon>
          {{ isNew ? "Create action" : "Save" }}
        </v-btn>
      </div>
    </div>

    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="loadError" type="error" text rounded="lg">{{ loadError }}</v-alert>

    <v-row v-else>
      <v-col cols="12" :md="isNew ? 12 : 7">
        <v-alert v-if="error" type="error" text dense rounded="lg" class="mb-4">{{ error }}</v-alert>

        <!-- BASICS -->
        <v-card outlined rounded="lg" class="pa-4 mb-4">
          <SectionTitle icon="$info" title="Basics" />
          <div class="text-body-2 font-weight-medium mb-1">What it does</div>
          <v-btn-toggle
            :value="form.type"
            mandatory
            dense
            color="primary"
            class="mb-1 flex-wrap"
            @change="setType"
          >
            <v-btn v-for="(t, value) in ACTION_TYPES" :key="value" small :value="value">
              <v-icon left size="14">{{ t.icon }}</v-icon>
              {{ t.label }}
            </v-btn>
          </v-btn-toggle>
          <div class="text-caption grey--text text--darken-1 mb-4">{{ ACTION_TYPES[form.type].blurb }}</div>
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.name"
                label="Name"
                :placeholder="request ? 'Raise a service request' : 'Extend a rental'"
                outlined
                dense
                @input="suggestKey"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.key"
                label="Key"
                :placeholder="request ? 'raise_service_request' : 'extension_payment_link'"
                :readonly="!isNew"
                :hint="isNew ? 'Lowercase letters, numbers and _. Can\'t be changed later.' : 'Can\'t be changed: the bot knows the action by it.'"
                persistent-hint
                outlined
                dense
                @input="keyTouched = true"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="form.description"
                label="When should the bot use this?"
                :placeholder="request ? 'The customer reports a problem with their vehicle that our team needs to look at' : 'The customer wants to extend an active rental and pay for it'"
                hint="Tell the bot when to use this, in one or two sentences. It decides from this alone."
                persistent-hint
                rows="2"
                auto-grow
                outlined
                dense
              />
            </v-col>
          </v-row>
          <v-switch
            v-model="form.enabled"
            inset
            hide-details
            color="success"
            class="mt-2"
            :label="form.enabled ? 'On: the bot can use it with customers' : 'Off: only you can try it here'"
          />
        </v-card>

        <!-- INPUTS -->
        <v-card outlined rounded="lg" class="pa-4 mb-4">
          <SectionTitle
            icon="$list-checks"
            title="What the bot asks for"
            text="What the bot must collect before calling your API. It finds these in the customer's data or asks for them."
          >
            <v-btn small outlined color="primary" @click="addInput">
              <v-icon left size="14">$plus</v-icon>
              Add
            </v-btn>
          </SectionTitle>

          <v-sheet
            v-if="!form.inputs.length"
            color="grey lighten-5"
            rounded="lg"
            class="text-body-2 grey--text text-center pa-3"
          >
            Nothing yet. Add one, for example <code>bookingId</code>.
          </v-sheet>

          <v-sheet
            v-for="row in form.inputs"
            :key="row.id"
            outlined
            rounded="lg"
            class="pa-3 mb-2"
          >
            <v-row dense>
              <v-col cols="12" sm="4">
                <v-text-field v-model="row.name" label="Name" placeholder="bookingId" outlined dense hide-details />
              </v-col>
              <v-col cols="7" sm="3">
                <v-select v-model="row.type" :items="INPUT_TYPES" label="Type" outlined dense hide-details />
              </v-col>
              <v-col cols="5" sm="4" class="d-flex align-center">
                <v-checkbox v-model="row.required" label="Required" dense hide-details class="mt-0" />
              </v-col>
              <v-col cols="12" sm="1" class="d-flex align-center justify-end">
                <v-btn icon small title="Remove" @click="removeInput(row)">
                  <v-icon small color="error">$trash-2</v-icon>
                </v-btn>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="row.description"
                  label="What it is (for the bot)"
                  placeholder="The rental's booking ID from the customer's data"
                  outlined
                  dense
                  hide-details
                />
              </v-col>
              <template v-if="row.type === 'integer'">
                <v-col cols="6" sm="3">
                  <v-text-field v-model="row.min" label="Smallest" type="number" outlined dense hide-details />
                </v-col>
                <v-col cols="6" sm="3">
                  <v-text-field v-model="row.max" label="Largest" type="number" outlined dense hide-details />
                </v-col>
              </template>
              <v-col v-if="row.type === 'string'" cols="12" sm="4">
                <v-text-field
                  v-model="row.maxLength"
                  label="Longest answer (optional)"
                  type="number"
                  min="1"
                  :max="LIMITS.maxLengthMax"
                  :placeholder="String(LIMITS.maxLengthDefault)"
                  :title="`Characters, up to ${LIMITS.maxLengthMax}. ${LIMITS.maxLengthDefault} if empty. Use 500 for a problem in the customer's words.`"
                  outlined
                  dense
                  hide-details
                />
              </v-col>
              <v-col cols="12" :sm="row.type === 'integer' ? 6 : row.type === 'string' ? 8 : 12">
                <v-text-field
                  v-model="row.enumText"
                  :label="row.type === 'string' && row.optionsOn ? 'Fallback choices (used only until your API has answered once)' : 'Allowed values (optional)'"
                  placeholder="Comma separated, e.g. gold, silver"
                  outlined
                  dense
                  hide-details
                />
              </v-col>

              <!-- CHOICES FROM THE CLIENT'S API -->
              <v-col v-if="row.type === 'string'" cols="12">
                <v-expansion-panels flat class="choices-panel">
                  <v-expansion-panel>
                    <v-expansion-panel-header class="px-0 py-1">
                      <span class="text-body-2 font-weight-medium">
                        <v-icon size="16" class="mr-2">$list</v-icon>
                        Choices from your API
                        <v-chip x-small label class="ml-2" :color="row.optionsOn ? 'success' : ''" :text-color="row.optionsOn ? 'white' : ''">
                          {{ row.optionsOn ? "On" : "Off" }}
                        </v-chip>
                      </span>
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-switch
                        v-model="row.optionsOn"
                        inset
                        hide-details
                        color="primary"
                        class="mt-0 mb-2"
                        label="Get the list of choices from your API"
                      />
                      <div class="text-caption grey--text text--darken-1 mb-3">
                        For lists that change, like your service request types. Your API's list always
                        wins over the fallback choices. We keep it for the hours you set, and use the
                        last good list if your API is down.
                      </div>
                      <template v-if="row.optionsOn">
                        <ActionStepEditor v-model="row.options" step-name="options" />
                        <div class="text-caption font-weight-bold text-uppercase grey--text mt-5 mb-1">
                          Where the choices are in the response
                        </div>
                        <v-row dense>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="row.options.listPath"
                              label="The list"
                              placeholder="data.types"
                              hint="Empty if the response is the list itself"
                              persistent-hint
                              outlined
                              dense
                            />
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="row.options.valuePath"
                              label="Each choice's value (required)"
                              placeholder="type"
                              hint="What the bot sends to your API"
                              persistent-hint
                              outlined
                              dense
                            />
                          </v-col>
                          <v-col cols="12" sm="4">
                            <v-text-field
                              v-model="row.options.labelPath"
                              label="Name (optional)"
                              placeholder="name"
                              outlined
                              dense
                            />
                          </v-col>
                          <v-col cols="12" sm="4">
                            <v-text-field
                              v-model="row.options.descriptionPath"
                              label="Description (optional)"
                              placeholder="description"
                              hint="Helps the bot pick the right one"
                              persistent-hint
                              outlined
                              dense
                            />
                          </v-col>
                          <v-col cols="12" sm="4">
                            <v-text-field
                              v-model="row.options.activePath"
                              label="In use (optional)"
                              placeholder="active"
                              hint="Choices where this is false are left out"
                              persistent-hint
                              outlined
                              dense
                            />
                          </v-col>
                          <v-col cols="12" sm="4">
                            <v-text-field
                              v-model.number="row.options.cacheHours"
                              label="Keep the list for"
                              type="number"
                              :min="LIMITS.cacheHoursMin"
                              :max="LIMITS.cacheHoursMax"
                              suffix="hours"
                              :hint="`${LIMITS.cacheHoursMin}–${LIMITS.cacheHoursMax}`"
                              persistent-hint
                              outlined
                              dense
                            />
                          </v-col>
                        </v-row>
                      </template>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>

              <!-- CURRENT CHOICES (saved actions only) -->
              <v-col v-if="choices[row.name]" cols="12">
                <v-sheet color="grey lighten-5" rounded="lg" class="pa-2">
                  <div class="d-flex align-center flex-wrap">
                    <span class="text-caption font-weight-bold text-uppercase grey--text mr-1">Current choices</span>
                    <span class="text-caption grey--text">({{ choiceSource(choices[row.name].source) }})</span>
                    <v-spacer />
                    <v-btn
                      v-if="savedHasOptions(row.name)"
                      x-small
                      text
                      color="primary"
                      :loading="choicesLoading === 'refresh'"
                      :disabled="!!choicesLoading"
                      title="Ask your API for the list now"
                      @click="loadChoices(true)"
                    >
                      <v-icon left size="12">$refresh-cw</v-icon>
                      Refresh
                    </v-btn>
                  </div>
                  <div class="d-flex flex-wrap mt-1">
                    <v-chip
                      v-for="o in (choices[row.name].options || []).slice(0, 30)"
                      :key="o.value"
                      x-small
                      label
                      class="mr-1 mb-1"
                      :title="o.description || ''"
                    >
                      {{ o.label && o.label !== o.value ? `${o.label} (${o.value})` : o.value }}
                    </v-chip>
                    <span v-if="(choices[row.name].options || []).length > 30" class="text-caption grey--text">
                      and {{ choices[row.name].options.length - 30 }} more
                    </span>
                    <span v-if="!(choices[row.name].options || []).length" class="text-caption grey--text">
                      No choices yet.
                    </span>
                  </div>
                  <div v-if="choices[row.name].error" class="text-caption grey--text mt-1">
                    {{ choices[row.name].error }}
                  </div>
                  <div v-if="dirty" class="text-caption grey--text mt-1">Shows the saved version.</div>
                </v-sheet>
              </v-col>
            </v-row>
          </v-sheet>
        </v-card>

        <!-- QUOTE -->
        <v-card outlined rounded="lg" class="pa-4 mb-4">
          <SectionTitle
            icon="$tag"
            title="Price check"
:text="request ? 'Optional. Asks your API for a price (e.g. a repair estimate) so the bot can tell the customer before raising the request. It must not change anything.' : 'Optional. Asks your API for the price so the bot can tell the customer before sending the link. It must not change anything.'"
          >
            <v-switch v-model="form.quoteOn" inset hide-details color="primary" class="mt-0" />
          </SectionTitle>
          <ActionStepEditor
            v-if="form.quoteOn"
            v-model="form.quote"
            step-name="quote"
            :placeholders="stepPlaceholders(form, 'quote')"
          />
          <div v-else class="text-body-2 grey--text">
            Off. Turn it on when the price depends on what the customer asks, like the number of days.
          </div>
        </v-card>

        <!-- CREATE -->
        <v-card outlined rounded="lg" class="pa-4 mb-4">
          <SectionTitle
            :icon="request ? '$clipboard-list' : '$credit-card'"
            :title="request ? 'Raise the request' : 'Create the link'"
            :text="createHelp"
          />
          <ActionStepEditor
            v-model="form.create"
            step-name="create"
            :action-type="form.type"
            :placeholders="stepPlaceholders(form, 'create')"
          />
        </v-card>

        <!-- DELIVERY -->
        <v-card outlined rounded="lg" class="pa-4 mb-4">
          <SectionTitle
            icon="$send"
:title="request ? 'Where the bot can use it' : 'Where and how the link is sent'"
            :text="request ? 'Pick the channels the bot can raise this on. It always tells the customer the request\'s ID, on calls too.' : 'Pick the channels the bot can use this on, and who sends the link on each.'"
          />
          <div v-for="c in CHANNELS" :key="c.value" class="d-flex flex-wrap align-center py-2 channel-row">
            <v-checkbox
              :input-value="form.channels.includes(c.value)"
              dense
              hide-details
              class="mt-0 mr-2 channel-check"
              @change="toggleChannel(c.value, $event)"
            >
              <template #label>
                <v-icon size="16" :color="c.color" class="mr-2">{{ c.icon }}</v-icon>
                {{ c.label }}
              </template>
            </v-checkbox>
            <v-spacer />
            <template v-if="!request && form.channels.includes(c.value)">
              <span v-if="c.value === 'voice'" class="text-body-2 grey--text text--darken-1">
                Your system sends it (a link can't be read out on a call)
              </span>
              <v-btn-toggle v-else v-model="form.delivery[c.value]" mandatory dense color="primary">
                <v-btn small value="in_chat">Bot sends it in the chat</v-btn>
                <v-btn small value="client_sends">Your system sends it</v-btn>
              </v-btn-toggle>
            </template>
          </div>
          <div v-if="!request" class="text-caption grey--text text--darken-1 mt-1">
            Your API gets <code v-text="'{{clientSends}}'" /> (true or false) and
            <code v-text="'{{channel}}'" />, so one endpoint can do both. With "Your system sends it",
            send the link to the customer's phone yourself and the bot only says it's on its way.
          </div>

          <div v-if="linkDomainsNeeded" class="mt-4">
            <div class="text-body-2 font-weight-medium mb-1">Allowed link domains</div>
            <div class="text-caption grey--text text--darken-1 mb-2">
              The bot only sends https links on these domains, so a wrong response can never put
              another link in the chat.
            </div>
            <AllowListInput
              ref="domains"
              v-model="form.allowedLinkDomains"
              rule="domain"
              dense
              empty-text="None yet. Add your payment provider's domain, e.g. rzp.io."
            />
          </div>
        </v-card>

        <!-- MESSAGES -->
        <v-card outlined rounded="lg" class="pa-4 mb-4">
          <SectionTitle
            icon="$message-square-text"
            title="What the bot says"
:text="request ? 'Leave a message empty to use the default. Every result from your API can go in as {{result.<name>}}.' : 'Leave a message empty to use the default. Amounts are shown as 2,400.'"
          />
          <div v-for="t in templateFields" :key="t.key" class="mb-3">
            <v-textarea
              v-model="form.templates[t.key]"
              :label="t.label"
              :placeholder="t.placeholder"
              :hint="t.hint"
              persistent-hint
              rows="2"
              auto-grow
              outlined
              dense
            />
            <div class="d-flex flex-wrap mt-1">
              <v-chip
                v-for="p in templatePlaceholders(form, t.key)"
                :key="p"
                x-small
                label
                class="mr-1 mb-1"
                @click="appendTemplate(t.key, p)"
              >
                {{ p }}
              </v-chip>
            </div>
          </div>
          <div v-if="form.channels.includes('voice')" class="text-caption grey--text text--darken-1">
            <v-icon size="14" class="mr-1">$phone</v-icon>
            <template v-if="request">
              On calls these are spoken: keep them short. The ID is read out, so keep it as the only code in the message.
            </template>
            <template v-else>
              On calls these are spoken: keep them short, and avoid raw dates and IDs that sound odd read out.
            </template>
          </div>
        </v-card>

        <!-- SAFETY -->
        <v-card outlined rounded="lg" class="pa-4 mb-4">
          <SectionTitle icon="$shield-check" title="Safety" />
          <v-switch
            v-model="form.confirm"
            inset
            color="success"
            hide-details
            class="mt-0"
            :label="request ? 'Ask before raising it' : 'Ask before sending'"
          />
          <div class="text-caption grey--text text--darken-1 mb-4 ml-1">
            {{ confirmHelp }}
          </div>
          <v-text-field
            v-model.number="form.maxPerChatPerDay"
            :label="request ? 'Requests per chat per day' : 'Links per chat per day'"
            type="number"
            min="1"
            :max="LIMITS.perDayMax"
            :hint="request ? 'The most requests one customer can raise in a day (1–50)' : 'The most links one customer can get in a day (1–50)'"
            persistent-hint
            outlined
            dense
            style="max-width: 260px"
          />
        </v-card>

        <div class="d-flex justify-end mb-6">
          <v-btn color="primary" depressed class="font-weight-bold" :loading="saving" @click="save">
            <v-icon left size="16">$check</v-icon>
            {{ isNew ? "Create action" : "Save" }}
          </v-btn>
        </div>
      </v-col>

      <v-col v-if="!isNew" cols="12" md="5">
        <div class="test-column">
          <ActionTestPanel :action="saved" :unsaved="dirty" :choices="choices" />
        </div>
      </v-col>
    </v-row>

    <ConfirmDialog
      v-model="deleteOpen"
      title="Delete this action?"
      :text="`The bot stops offering “${form.name}” right away. Its past runs stay in the log.`"
      confirm-label="Delete"
      icon="$trash-2"
      :loading="deleting"
      @confirm="remove"
    />
  </div>
</template>

<script>
import AllowListInput from "@/components/AllowListInput.vue";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import ConfirmDialog from "@/components/team/ConfirmDialog.vue";
import ActionStepEditor from "@/components/actions/ActionStepEditor.vue";
import ActionTestPanel from "@/components/actions/ActionTestPanel.vue";
import SectionTitle from "@/components/actions/SectionTitle.vue";
import { apiError } from "@/utils/knowledge";
import { newRow } from "@/utils/integrationApi";
import {
  ACTION_TYPES,
  CHANNELS,
  CREATE_DEFAULTS,
  DEFAULT_REQUEST_TEMPLATES,
  DEFAULT_TEMPLATES,
  INPUT_TYPES,
  CHOICE_SOURCES,
  LIMITS,
  PRESETS,
  actionFromForm,
  blankInput,
  getInputOptions,
  actionToForm,
  createAction,
  deleteAction,
  getAction,
  needsLinkDomains,
  stepPlaceholders,
  templatePlaceholders,
  updateAction,
} from "@/utils/actions";

const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/^[^a-z]+/, "")
    .slice(0, 41);

export default {
  name: "ActionEditor",

  components: { ActionStepEditor, ActionTestPanel, AllowListInput, ConfirmDialog, SectionTitle, ThingsToKnow },

  data: () => ({
    ACTION_TYPES,
    CHANNELS,
    INPUT_TYPES,
    LIMITS,
    form: actionToForm(null),
    saved: null,
    savedSnapshot: "",
    keyTouched: false,
    loading: false,
    loadError: "",
    saving: false,
    error: "",
    deleteOpen: false,
    deleting: false,
    choices: {},
    choicesLoading: "",
  }),

  computed: {
    id() {
      return this.$route.params.id;
    },
    isNew() {
      return !this.id || this.id === "new";
    },
    request() {
      return this.form.type === "request";
    },
    createHelp() {
      return this.request
        ? "Called once, only after the customer says yes, and never retried. Send {{runId}} as the idempotency key: the same key must give back the same request, not a second one."
        : "Called only after the customer says yes. Send {{runId}} as the idempotency key: the same key must give back the same link.";
    },
    confirmHelp() {
      const what = this.request ? "request is raised" : "link is created";
      return this.form.confirm
        ? `The ${what} only after a clear "yes". Our code checks the yes, not the AI.`
        : `The ${what} as soon as the bot has what it needs, without asking.`;
    },
    linkDomainsNeeded() {
      return needsLinkDomains(this.form);
    },
    dirty() {
      return !!this.saved && JSON.stringify(this.form) !== this.savedSnapshot;
    },
    templateFields() {
      if (this.request) {
        return [
          {
            key: "confirm",
            label: "Asking for a yes",
            placeholder: DEFAULT_REQUEST_TEMPLATES.confirm,
            hint: "Sent before the request is raised. Repeat what the customer asked for, so they know what they're saying yes to.",
          },
          {
            key: "sent",
            label: "Request raised",
            placeholder: DEFAULT_REQUEST_TEMPLATES.sent,
            hint: "Must contain {{result.id}}: the customer needs the ID. Said on calls too.",
          },
        ];
      }
      return [
        {
          key: "confirm",
          label: "Asking for a yes",
          placeholder: DEFAULT_TEMPLATES.confirm,
          hint: "Sent before the link is created, with the price if there's a price check.",
        },
        {
          key: "sent",
          label: "Link sent (bot sends it)",
          placeholder: DEFAULT_TEMPLATES.sent,
          hint: "Must contain {{link.url}}.",
        },
        {
          key: "clientSent",
          label: "Link sent (your system sends it)",
          placeholder: DEFAULT_TEMPLATES.clientSent,
          hint: "Said when your system sent the link, and always on calls.",
        },
      ];
    },
  },

  watch: {
    id: { immediate: true, handler: "load" },
    "$route.query.preset"() {
      if (this.isNew) this.load();
    },
  },

  methods: {
    stepPlaceholders,
    templatePlaceholders,

    async load() {
      this.error = "";
      this.loadError = "";
      if (this.isNew) {
        const preset = PRESETS[this.$route.query.preset];
        this.form = actionToForm(preset ? preset.action : null);
        this.keyTouched = !!preset;
        this.saved = null;
        return;
      }
      this.loading = true;
      try {
        this.setSaved(await getAction(this.id));
      } catch (err) {
        this.loadError = apiError(err, "Couldn't load this action.");
      } finally {
        this.loading = false;
      }
    },

    setSaved(action) {
      this.saved = action;
      this.form = actionToForm(action);
      this.savedSnapshot = JSON.stringify(this.form);
      this.choices = {};
      if ((action.inputs || []).some((i) => i.options || (i.enum && i.enum.length))) this.loadChoices(false);
    },

    // The choices each input has now, and where they came from
    async loadChoices(refresh) {
      if (!this.saved) return;
      this.choicesLoading = refresh ? "refresh" : "load";
      try {
        const inputs = await getInputOptions(this.saved.id, refresh);
        this.choices = Object.fromEntries(inputs.map((i) => [i.name, i]));
        if (refresh) this.$toast.success("Choices refreshed");
      } catch (err) {
        if (refresh) this.$toast.error(apiError(err, "Couldn't refresh the choices."));
      } finally {
        this.choicesLoading = "";
      }
    },

    savedHasOptions(name) {
      return !!(this.saved?.inputs || []).find((i) => i.name === name)?.options;
    },

    choiceSource(source) {
      return CHOICE_SOURCES[source] || source;
    },

    suggestKey() {
      if (this.isNew && !this.keyTouched) this.form.key = slugify(this.form.name);
    },

    addInput() {
      this.form.inputs.push(blankInput());
    },

    removeInput(row) {
      this.form.inputs = this.form.inputs.filter((r) => r.id !== row.id);
    },

    // Swap the create step's starting results when they are still the
    // untouched defaults; otherwise just make sure the needed one is there
    setType(type) {
      if (!type || type === this.form.type) return;
      const outputs = this.form.create.outputs;
      const untouched = outputs.every((o) => !o.path.trim());
      if (untouched) {
        this.form.create.outputs = CREATE_DEFAULTS[type].map(([name, path]) => newRow({ name, path }));
      } else if (type === "request" && !outputs.some((o) => o.name.trim() === "id")) {
        this.form.create.outputs.unshift(newRow({ name: "id", path: "" }));
      }
      this.form.type = type;
    },

    toggleChannel(value, on) {
      const set = new Set(this.form.channels);
      on ? set.add(value) : set.delete(value);
      this.form.channels = CHANNELS.map((c) => c.value).filter((c) => set.has(c));
    },

    appendTemplate(key, placeholder) {
      const cur = this.form.templates[key];
      this.form.templates[key] = cur ? `${cur.replace(/\s*$/, "")} ${placeholder}` : placeholder;
    },

    async save() {
      this.error = "";
      if (this.$refs.domains && !this.$refs.domains.commitDraft()) {
        this.error = "Check the link domain you typed.";
        return;
      }
      const { body, error } = actionFromForm(this.form);
      if (error) {
        this.error = error;
        return;
      }
      this.saving = true;
      try {
        if (this.isNew) {
          const action = await createAction(body);
          this.$toast.success("Action created. Try it on the right before turning it on.");
          this.setSaved(action);
          this.$router.replace(`/dashboard/actions/${action.id}`);
        } else {
          this.setSaved(await updateAction(this.id, body));
          this.$toast.success("Saved");
        }
      } catch (err) {
        this.error = apiError(err, "Couldn't save the action.");
      } finally {
        this.saving = false;
      }
    },

    async remove() {
      this.deleting = true;
      try {
        await deleteAction(this.id);
        this.$toast.success("Action deleted");
        this.$router.push("/dashboard/actions");
      } catch (err) {
        this.$toast.error(apiError(err, "Couldn't delete the action."));
      } finally {
        this.deleting = false;
        this.deleteOpen = false;
      }
    },
  },
};
</script>

<style scoped>
.test-column {
  position: sticky;
  top: 80px;
}
.channel-row + .channel-row {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}
.choices-panel >>> .v-expansion-panel-content__wrap {
  padding: 0 0 8px;
}
.choices-panel >>> .v-expansion-panel-header {
  min-height: 36px;
}
.channel-check {
  min-width: 180px;
}
</style>
