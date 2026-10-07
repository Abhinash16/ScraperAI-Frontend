<template>
  <div class="bot-profile-page">
    <!-- Header -->
    <div class="d-flex align-center flex-wrap mb-6">
      <v-avatar size="48" rounded="xl" color="#cde6ff" class="mr-4">
        <v-icon color="black">$user-cog</v-icon>
      </v-avatar>
      <div class="mr-4">
        <div class="text-h5 font-weight-bold">Bot Profile</div>
        <div class="text-body-2 grey--text text--darken-1">
          Your bot's name, tone, business facts, and rules.
        </div>
      </div>
      <v-chip
        v-if="loaded"
        small
        outlined
        :color="statusChip.color"
        class="mt-2 mt-sm-0"
      >
        <v-icon x-small left>{{ statusChip.icon }}</v-icon>
        {{ statusChip.text }}
      </v-chip>
    </div>

    <ThingsToKnow feature="bot-profile" />

    <v-card v-if="!loaded" outlined rounded="xl" class="pa-6">
      <v-progress-linear v-if="!loadError" indeterminate color="primary" />
      <v-alert v-else type="error" outlined rounded="lg" class="mb-0">
        {{ loadError }}
        <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
      </v-alert>
    </v-card>

    <template v-else>
      <!-- ============ ACTIONS ============ -->
      <v-card outlined rounded="xl" class="pa-4 mb-4 action-bar">
        <div class="d-flex align-center flex-wrap">
          <div class="text-body-2 grey--text text--darken-2 mr-4 my-1">
            <template v-if="dirty">You have unsaved changes.</template>
            <template v-else-if="hasUnpublishedChanges">
              Draft saved. Test it in the sandbox, then publish it to go live.
            </template>
            <template v-else-if="publishedVersion">
              Live chats use version {{ publishedVersion }}, published
              {{ formatDate(publishedAt) }}.
            </template>
            <template v-else>Nothing is published yet.</template>
          </div>
          <v-spacer />
          <v-btn
            v-if="dirty"
            text
            rounded
            class="text-none my-1"
            :disabled="saving"
            @click="discard"
          >
            Discard
          </v-btn>
          <v-btn
            depressed
            rounded
            class="text-none ml-2 my-1"
            :disabled="!dirty"
            :loading="saving"
            @click="save"
          >
            Save draft
          </v-btn>
          <v-btn
            text
            rounded
            color="primary"
            class="text-none ml-2 my-1"
            to="/dashboard/sandbox"
          >
            <v-icon small class="mr-1">$flask-conical</v-icon>
            Test in sandbox
          </v-btn>
          <v-btn
            color="primary"
            depressed
            rounded
            class="text-none font-weight-bold ml-2 my-1"
            :disabled="dirty || !hasUnpublishedChanges"
            :loading="publishing"
            @click="publish"
          >
            Publish
          </v-btn>
        </div>
        <div v-if="dirty" class="text-caption grey--text mt-1">
          The sandbox tests your saved draft, so save before testing.
        </div>

        <v-alert
          v-if="actionError"
          type="error"
          dense
          outlined
          rounded="lg"
          class="mt-3 mb-0 text-body-2"
        >
          {{ actionError }}
          <v-btn
            v-if="conflict"
            small
            text
            color="error"
            class="ml-2"
            @click="load"
          >
            Reload
          </v-btn>
        </v-alert>
      </v-card>

      <v-tabs v-model="tab" color="primary" class="profile-tabs mb-6" show-arrows>
        <v-tab v-for="t in TABS" :key="t.id" :tab-value="t.id" class="text-none">
          <v-icon small class="mr-2">{{ t.icon }}</v-icon> {{ t.label }}
        </v-tab>
      </v-tabs>

      <!-- ============ IDENTITY ============ -->
      <v-card v-show="tab === 'identity'" outlined rounded="xl" class="pa-6">
        <v-row dense>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.identity.botName"
              label="Bot name"
              placeholder="e.g. Aria"
              outlined
              dense
              :counter="LINE_MAX"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="form.identity.companyName"
              label="Company name"
              hint="Leave empty to use the company name on your account."
              persistent-hint
              outlined
              dense
              :counter="LINE_MAX"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.identity.role"
              :items="ROLES"
              label="What the bot does"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.identity.tone"
              :items="TONES"
              label="Tone"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.identity.greeting"
              label="Greeting"
              hint='What the bot says when someone says "hi". Leave empty for the default.'
              persistent-hint
              outlined
              rows="2"
              auto-grow
              :counter="LINE_MAX"
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.identity.emoji"
              :items="EMOJI"
              label="Emoji"
              outlined
              dense
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-combobox
              v-model="form.identity.languages"
              label="Languages"
              hint="Type a language and press Enter, e.g. English, Hindi."
              persistent-hint
              multiple
              small-chips
              deletable-chips
              outlined
              dense
            />
          </v-col>
          <v-col cols="12">
            <v-switch
              v-model="form.identity.replyInCustomerLanguage"
              inset
              hide-details
              class="mt-0"
              label="Reply in the customer's language"
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- ============ BUSINESS FACTS ============ -->
      <div v-show="tab === 'facts'">
        <v-alert
          border="left"
          colored-border
          color="primary"
          elevation="0"
          outlined
          rounded="xl"
          class="text-body-2"
        >
          These facts override anything the bot learned from your website. If
          your site says one thing and this page says another, the bot uses
          this page.
        </v-alert>

        <v-card outlined rounded="xl" class="pa-6 mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-4">Opening hours</div>
          <v-autocomplete
            v-if="timezones.length"
            v-model="form.facts.timezone"
            :items="timezones"
            label="Timezone"
            outlined
            dense
            clearable
            class="tz-field"
          />
          <v-text-field
            v-else
            v-model="form.facts.timezone"
            label="Timezone"
            placeholder="Asia/Kolkata"
            outlined
            dense
            class="tz-field"
          />

          <div v-for="day in DAYS" :key="day.id" class="d-flex align-center flex-wrap hours-row">
            <div class="day-label text-body-2 font-weight-medium">{{ day.label }}</div>
            <v-btn-toggle
              v-model="form.facts.hours[day.id].mode"
              dense
              rounded
              color="primary"
              class="mr-4 my-1"
            >
              <v-btn small value="" class="text-none">Not set</v-btn>
              <v-btn small value="open" class="text-none">Open</v-btn>
              <v-btn small value="closed" class="text-none">Closed</v-btn>
            </v-btn-toggle>
            <template v-if="form.facts.hours[day.id].mode === 'open'">
              <input
                v-model="form.facts.hours[day.id].open"
                type="time"
                class="time-input my-1"
                :aria-label="`${day.label} opening time`"
              />
              <span class="mx-2 grey--text">to</span>
              <input
                v-model="form.facts.hours[day.id].close"
                type="time"
                class="time-input my-1"
                :aria-label="`${day.label} closing time`"
              />
            </template>
          </div>
        </v-card>

        <v-card outlined rounded="xl" class="pa-6 mb-4">
          <div class="text-subtitle-1 font-weight-bold mb-4">Contact</div>
          <v-row dense>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.facts.contact.phone" label="Phone" outlined dense />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="form.facts.contact.email" label="Email" outlined dense />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="form.facts.contact.website"
                label="Website"
                placeholder="https://"
                outlined
                dense
              />
            </v-col>
          </v-row>
        </v-card>

        <v-card
          v-for="list in FACT_LISTS"
          :key="list.key"
          outlined
          rounded="xl"
          class="pa-6 mb-4"
        >
          <div class="d-flex align-center mb-1">
            <div class="text-subtitle-1 font-weight-bold">{{ list.title }}</div>
            <v-spacer />
            <v-btn
              small
              text
              rounded
              color="primary"
              class="text-none"
              :disabled="form.facts[list.key].length >= LIST_MAX"
              @click="addRow(list)"
            >
              <v-icon small class="mr-1">$plus</v-icon> Add
            </v-btn>
          </div>
          <div class="text-body-2 grey--text text--darken-1 mb-4">{{ list.help }}</div>

          <div
            v-for="(row, i) in form.facts[list.key]"
            :key="i"
            class="d-flex align-start"
          >
            <v-row dense>
              <v-col
                v-for="field in list.fields"
                :key="field.key"
                cols="12"
                :md="field.md"
              >
                <v-textarea
                  v-if="field.textarea"
                  v-model="row[field.key]"
                  :label="field.label"
                  :counter="field.max"
                  rows="3"
                  auto-grow
                  outlined
                  dense
                />
                <v-text-field
                  v-else
                  v-model="row[field.key]"
                  :label="field.label"
                  :placeholder="field.placeholder"
                  :counter="field.max"
                  outlined
                  dense
                />
              </v-col>
            </v-row>
            <v-btn
              icon
              small
              class="ml-2 mt-1"
              :aria-label="`Remove ${list.title.toLowerCase()} row`"
              @click="form.facts[list.key].splice(i, 1)"
            >
              <v-icon small>$x</v-icon>
            </v-btn>
          </div>
          <div v-if="!form.facts[list.key].length" class="text-body-2 grey--text">
            None added.
          </div>
        </v-card>
      </div>

      <!-- ============ RULES ============ -->
      <v-card v-show="tab === 'rules'" outlined rounded="xl" class="pa-6">
        <div class="text-body-2 grey--text text--darken-1 mb-4">
          One rule per line. Up to {{ LIST_MAX }} lines each, {{ LINE_MAX }}
          characters per line.
        </div>
        <v-row dense>
          <v-col cols="12" md="6">
            <v-textarea
              v-model="form.rules.do"
              label="Always"
              placeholder="Mention free delivery on orders over ₹999"
              outlined
              rows="5"
              auto-grow
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea
              v-model="form.rules.dont"
              label="Never"
              placeholder="Promise delivery dates"
              outlined
              rows="5"
              auto-grow
            />
          </v-col>
          <v-col cols="12">
            <v-combobox
              v-model="form.rules.refuseTopics"
              label="Topics to refuse"
              hint="The bot politely declines these. Type a topic and press Enter."
              persistent-hint
              multiple
              small-chips
              deletable-chips
              outlined
              dense
              class="mb-4"
            />
          </v-col>
          <v-col cols="12">
            <div class="text-subtitle-2 font-weight-bold mb-1">Prices</div>
            <div class="text-body-2 grey--text text--darken-1 mb-2">
              Where the bot may take prices from when it quotes one.
            </div>
            <v-radio-group v-model="form.rules.pricing" class="mt-0 mb-4" hide-details>
              <v-radio v-for="p in PRICING" :key="p.value" :value="p.value" class="mb-2">
                <template #label>
                  <div>
                    <div class="text-body-2 font-weight-bold black--text">{{ p.text }}</div>
                    <div class="text-caption grey--text">{{ p.help }}</div>
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="form.rules.disclaimers"
              label="Disclaimers"
              hint="Added to answers where they apply, one per line."
              persistent-hint
              outlined
              rows="3"
              auto-grow
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- ============ ESCALATION ============ -->
      <v-card v-show="tab === 'escalation'" outlined rounded="xl" class="pa-6">
        <v-combobox
          v-model="form.rules.escalation.keywords"
          label="Escalation keywords"
          hint='A message with any of these always goes to a person, e.g. "refund", "complaint", "talk to a human".'
          persistent-hint
          multiple
          small-chips
          deletable-chips
          outlined
          dense
          class="mb-6"
        />

        <div class="text-subtitle-2 font-weight-bold mb-1">
          Confidence threshold: {{ form.rules.escalation.confidenceThreshold.toFixed(2) }}
        </div>
        <div class="text-body-2 grey--text text--darken-1 mb-2">
          When the bot is less sure than this, it hands the chat to your team
          instead of answering. Higher means more handoffs. The default is
          {{ DEFAULT_THRESHOLD }}.
        </div>
        <v-slider
          v-model="form.rules.escalation.confidenceThreshold"
          min="0"
          max="1"
          step="0.05"
          thumb-label
          hide-details
          class="threshold-slider"
        />

        <v-btn
          text
          rounded
          color="primary"
          class="text-none mt-4 px-2"
          to="/dashboard/integration?section=webhooks"
        >
          <v-icon small class="mr-1">$webhook</v-icon>
          Set where escalations are sent
        </v-btn>
      </v-card>

      <!-- ============ ADVANCED ============ -->
      <v-card v-show="tab === 'advanced'" outlined rounded="xl" class="pa-6">
        <div class="text-body-2 grey--text text--darken-1 mb-4">
          Anything the other sections don't cover. Write it as plain
          instructions to the bot.
        </div>
        <v-textarea
          v-model="form.customInstructions"
          label="Custom instructions"
          outlined
          rows="10"
          auto-grow
          :counter="CUSTOM_MAX"
        />
      </v-card>

      <!-- ============ HISTORY ============ -->
      <v-card v-show="tab === 'history'" outlined rounded="xl" class="pa-6">
        <div class="text-body-2 grey--text text--darken-1 mb-4">
          Your last 20 published versions. Restoring one publishes it again
          right away and replaces your draft with it.
        </div>

        <v-progress-linear v-if="historyLoading" indeterminate color="primary" />
        <v-alert v-else-if="historyError" type="error" outlined rounded="lg" class="mb-0">
          {{ historyError }}
          <v-btn small text color="error" class="ml-2" @click="loadHistory">
            Retry
          </v-btn>
        </v-alert>
        <div v-else-if="!history.length" class="text-body-2 grey--text">
          Nothing has been published yet.
        </div>
        <v-simple-table v-else>
          <thead>
            <tr>
              <th>Version</th>
              <th>Published</th>
              <th>By</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in history" :key="item.version">
              <td>
                v{{ item.version }}
                <v-chip v-if="item.live" x-small color="success" class="ml-2">Live</v-chip>
              </td>
              <td>{{ formatDate(item.publishedAt) }}</td>
              <td>{{ personName(item.publishedBy) }}</td>
              <td class="text-right text-no-wrap">
                <v-btn small text rounded class="text-none" @click="viewing = item">
                  View
                </v-btn>
                <v-btn
                  small
                  text
                  rounded
                  color="primary"
                  class="text-none"
                  :disabled="item.live"
                  @click="restoring = item"
                >
                  Restore
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card>
    </template>

    <!-- View a published version -->
    <v-dialog :value="!!viewing" max-width="720" scrollable @input="viewing = null">
      <v-card v-if="viewing" rounded="xl">
        <v-card-title class="text-h6">Version {{ viewing.version }}</v-card-title>
        <v-card-text>
          <pre class="version-content">{{ JSON.stringify(viewing.content, null, 2) }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" @click="viewing = null">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirm restore -->
    <v-dialog :value="!!restoring" max-width="460" @input="restoring = null">
      <v-card v-if="restoring" rounded="xl">
        <v-card-title class="text-h6">Restore version {{ restoring.version }}?</v-card-title>
        <v-card-text class="text-body-2">
          This publishes version {{ restoring.version }} again, so live chats
          start using it right away.
          <strong v-if="dirty || hasUnpublishedChanges">
            Your current draft, including changes you haven't published, will
            be replaced.
          </strong>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="rollingBack" @click="restoring = null">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            depressed
            rounded
            class="text-none"
            :loading="rollingBack"
            @click="rollback"
          >
            Restore and publish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ThingsToKnow from "@/components/ThingsToKnow.vue";

const ENDPOINT = "/clients/bot-profile";

// Backend limits
const LIST_MAX = 30;
const LINE_MAX = 300;
const POLICY_MAX = 2000;
const CUSTOM_MAX = 10000;
const DEFAULT_THRESHOLD = 0.6;
const DEFAULT_TIMEZONE = "Asia/Kolkata";

const TABS = [
  { id: "identity", label: "Identity", icon: "$user" },
  { id: "facts", label: "Business facts", icon: "$store" },
  { id: "rules", label: "Rules", icon: "$list-checks" },
  { id: "escalation", label: "Escalation", icon: "$headset" },
  { id: "advanced", label: "Advanced", icon: "$braces" },
  { id: "history", label: "History", icon: "$history" },
];

const ROLES = [
  { value: "support_sales", text: "Support and sales" },
  { value: "support", text: "Support only" },
  { value: "information", text: "Information only" },
];

const TONES = [
  { value: "friendly", text: "Friendly" },
  { value: "formal", text: "Formal" },
  { value: "concise", text: "Concise" },
];

// v-select can't hold null reliably, so emoji maps to strings here.
const EMOJI = [
  { value: "auto", text: "Let the bot decide" },
  { value: "on", text: "Use emoji" },
  { value: "off", text: "No emoji" },
];

const PRICING = [
  {
    value: "auto",
    text: "Automatic (recommended)",
    help: "Live product data when a product API is connected, otherwise prices written in your knowledge.",
  },
  {
    value: "live_only",
    text: "Live product data only",
    help: "Never quote prices from your knowledge.",
  },
  {
    value: "knowledge",
    text: "From knowledge",
    help: "Quote prices exactly as written in your FAQs, notes and pages.",
  },
];

const DAYS = [
  { id: "mon", label: "Monday" },
  { id: "tue", label: "Tuesday" },
  { id: "wed", label: "Wednesday" },
  { id: "thu", label: "Thursday" },
  { id: "fri", label: "Friday" },
  { id: "sat", label: "Saturday" },
  { id: "sun", label: "Sunday" },
];

const FACT_LISTS = [
  {
    key: "locations",
    title: "Locations",
    help: "Stores, offices, or branches customers can visit.",
    fields: [
      { key: "name", label: "Name", md: 4, max: LINE_MAX },
      { key: "address", label: "Address", md: 5, max: LINE_MAX },
      { key: "mapUrl", label: "Map link", md: 3, placeholder: "https://", max: LINE_MAX },
    ],
  },
  {
    key: "links",
    title: "Links",
    help: "Pages the bot can share, like booking, pricing, or a menu.",
    fields: [
      { key: "label", label: "Label", md: 4, max: LINE_MAX },
      { key: "url", label: "URL", md: 8, placeholder: "https://", max: LINE_MAX },
    ],
  },
  {
    key: "policies",
    title: "Policies",
    help: "Refunds, cancellations, warranty, delivery, and so on.",
    fields: [
      { key: "title", label: "Title", md: 12, max: LINE_MAX },
      { key: "text", label: "Policy", md: 12, textarea: true, max: POLICY_MAX },
    ],
  },
];

const str = (v) => (typeof v === "string" ? v : "");
const arr = (v) => (Array.isArray(v) ? v : []);
const lines = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
const clean = (list) => arr(list).map((s) => String(s).trim()).filter(Boolean);

// API profile → editable form. Lists of sentences become one-per-line text,
// and hours become one entry per weekday.
function toForm(profile = {}) {
  const identity = profile.identity || {};
  const facts = profile.facts || {};
  const rules = profile.rules || {};
  const escalation = rules.escalation || {};

  const hours = {};
  DAYS.forEach(({ id }) => {
    const h = arr(facts.hours).find((x) => x.day === id);
    hours[id] = {
      mode: h ? (h.closed ? "closed" : "open") : "",
      open: str(h?.open) || "09:00",
      close: str(h?.close) || "18:00",
    };
  });

  const rows = (list, keys) =>
    arr(list).map((r) => Object.fromEntries(keys.map((k) => [k, str(r?.[k])])));

  return {
    identity: {
      botName: str(identity.botName),
      companyName: str(identity.companyName),
      role: identity.role || "support_sales",
      tone: identity.tone || "friendly",
      greeting: str(identity.greeting),
      emoji: identity.emoji === true ? "on" : identity.emoji === false ? "off" : "auto",
      languages: arr(identity.languages),
      replyInCustomerLanguage: !!identity.replyInCustomerLanguage,
    },
    facts: {
      timezone: str(facts.timezone) || DEFAULT_TIMEZONE,
      hours,
      locations: rows(facts.locations, ["name", "address", "mapUrl"]),
      contact: {
        phone: str(facts.contact?.phone),
        email: str(facts.contact?.email),
        website: str(facts.contact?.website),
      },
      links: rows(facts.links, ["label", "url"]),
      policies: rows(facts.policies, ["title", "text"]),
    },
    rules: {
      do: arr(rules.do).join("\n"),
      dont: arr(rules.dont).join("\n"),
      refuseTopics: arr(rules.refuseTopics),
      disclaimers: arr(rules.disclaimers).join("\n"),
      pricing: PRICING.some((p) => p.value === rules.pricing) ? rules.pricing : "auto",
      escalation: {
        keywords: arr(escalation.keywords),
        confidenceThreshold:
          typeof escalation.confidenceThreshold === "number"
            ? escalation.confidenceThreshold
            : DEFAULT_THRESHOLD,
      },
    },
    customInstructions: str(profile.customInstructions),
  };
}

// Editable form → API profile. Blank lines and empty rows are dropped.
function toProfile(form) {
  const trimRow = (row) =>
    Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v.trim()]));
  const rows = (list) =>
    list.map(trimRow).filter((r) => Object.values(r).some(Boolean));

  return {
    identity: {
      ...form.identity,
      botName: form.identity.botName.trim(),
      companyName: form.identity.companyName.trim(),
      greeting: form.identity.greeting.trim(),
      emoji: { on: true, off: false }[form.identity.emoji] ?? null,
      languages: clean(form.identity.languages),
    },
    facts: {
      timezone: (form.facts.timezone || "").trim(),
      hours: DAYS.filter(({ id }) => form.facts.hours[id].mode).map(({ id }) => {
        const h = form.facts.hours[id];
        return h.mode === "closed"
          ? { day: id, closed: true }
          : { day: id, open: h.open, close: h.close, closed: false };
      }),
      locations: rows(form.facts.locations),
      contact: trimRow(form.facts.contact),
      links: rows(form.facts.links),
      policies: rows(form.facts.policies),
    },
    rules: {
      do: lines(form.rules.do),
      dont: lines(form.rules.dont),
      refuseTopics: clean(form.rules.refuseTopics),
      disclaimers: lines(form.rules.disclaimers),
      pricing: form.rules.pricing,
      escalation: {
        keywords: clean(form.rules.escalation.keywords),
        confidenceThreshold: form.rules.escalation.confidenceThreshold,
      },
    },
    customInstructions: form.customInstructions.trim(),
  };
}

function supportedTimezones() {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return [];
  }
}

export default {
  name: "BotProfile",

  components: { ThingsToKnow },

  data() {
    return {
      TABS,
      ROLES,
      TONES,
      EMOJI,
      PRICING,
      DAYS,
      FACT_LISTS,
      LIST_MAX,
      LINE_MAX,
      CUSTOM_MAX,
      DEFAULT_THRESHOLD,
      timezones: supportedTimezones(),

      tab: "identity",

      loaded: false,
      loadError: "",
      form: toForm(),
      savedJson: JSON.stringify(toProfile(toForm())),
      version: 0,
      publishedVersion: null,
      publishedAt: null,
      hasUnpublishedChanges: false,

      saving: false,
      publishing: false,
      actionError: "",
      conflict: false,

      history: [],
      historyLoaded: false,
      historyLoading: false,
      historyError: "",
      viewing: null,
      restoring: null,
      rollingBack: false,
    };
  },

  computed: {
    dirty() {
      return JSON.stringify(toProfile(this.form)) !== this.savedJson;
    },

    statusChip() {
      if (this.dirty || this.hasUnpublishedChanges) {
        return { text: "Draft: unpublished changes", color: "warning", icon: "$pencil" };
      }
      if (this.publishedVersion) {
        return { text: `Live: version ${this.publishedVersion}`, color: "success", icon: "$circle-check" };
      }
      return { text: "Not published", color: "grey", icon: "$circle" };
    },
  },

  watch: {
    tab(tab) {
      if (tab === "history" && !this.historyLoaded) this.loadHistory();
    },
  },

  created() {
    this.load();
    window.addEventListener("beforeunload", this.onBeforeUnload);
  },

  beforeDestroy() {
    window.removeEventListener("beforeunload", this.onBeforeUnload);
  },

  beforeRouteLeave(to, from, next) {
    if (this.dirty && !window.confirm("You have unsaved changes. Leave without saving?")) {
      next(false);
      return;
    }
    next();
  },

  methods: {
    apply(data) {
      this.form = toForm(data?.draft || {});
      this.savedJson = JSON.stringify(toProfile(this.form));
      this.version = data?.version || 0;
      this.publishedVersion = data?.publishedVersion || null;
      this.publishedAt = data?.publishedAt || null;
      this.hasUnpublishedChanges = !!data?.hasUnpublishedChanges;
    },

    setError(err, fallback) {
      this.conflict = err.response?.status === 409;
      this.actionError = err.response?.data?.message || fallback;
    },

    async load() {
      this.loadError = "";
      this.actionError = "";
      this.conflict = false;
      try {
        const { data } = await apiClient.get(ENDPOINT);
        this.apply(data.data);
        this.loaded = true;
      } catch (err) {
        this.loadError = err.response?.data?.message || "Failed to load the bot profile";
      }
    },

    discard() {
      this.form = toForm(JSON.parse(this.savedJson));
      this.actionError = "";
    },

    addRow(list) {
      this.form.facts[list.key].push(
        Object.fromEntries(list.fields.map((f) => [f.key, ""]))
      );
    },

    async save() {
      this.saving = true;
      this.actionError = "";
      try {
        const { data } = await apiClient.put(ENDPOINT, {
          profile: toProfile(this.form),
          version: this.version,
        });
        this.apply(data.data);
        this.$toast.success("Draft saved");
      } catch (err) {
        this.setError(err, "Failed to save the draft");
      } finally {
        this.saving = false;
      }
    },

    async publish() {
      this.publishing = true;
      this.actionError = "";
      try {
        await apiClient.post(`${ENDPOINT}/publish`, { version: this.version });
        await this.load();
        this.historyLoaded = false;
        this.$toast.success("Published. Live chats now use this profile.");
      } catch (err) {
        this.setError(err, "Failed to publish");
      } finally {
        this.publishing = false;
      }
    },

    async loadHistory() {
      this.historyLoading = true;
      this.historyError = "";
      try {
        const { data } = await apiClient.get(`${ENDPOINT}/history`);
        this.history = arr(data.data);
        this.historyLoaded = true;
      } catch (err) {
        this.historyError = err.response?.data?.message || "Failed to load history";
      } finally {
        this.historyLoading = false;
      }
    },

    async rollback() {
      const { version } = this.restoring;
      this.rollingBack = true;
      try {
        await apiClient.post(`${ENDPOINT}/rollback`, { version });
        this.restoring = null;
        await Promise.all([this.load(), this.loadHistory()]);
        this.$toast.success(`Version ${version} restored and published`);
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "Failed to restore");
      } finally {
        this.rollingBack = false;
      }
    },

    onBeforeUnload(e) {
      if (!this.dirty) return;
      e.preventDefault();
      e.returnValue = "";
    },

    formatDate(value) {
      return value
        ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
        : "";
    },

    // null: the account owner, a service token, or the migration
    personName(p) {
      return p?.name || p?.email || "Owner or system";
    },
  },
};
</script>

<style scoped>
.profile-tabs {
  border-bottom: 1px solid #e0e0e0;
}

.action-bar {
  position: sticky;
  top: 8px;
  z-index: 2;
}

.tz-field {
  max-width: 360px;
}

.hours-row {
  min-height: 44px;
}

.day-label {
  width: 110px;
}

.time-input {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 14px;
}

.threshold-slider {
  max-width: 480px;
}

.version-content {
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
