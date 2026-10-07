<template>
  <div>
    <div class="text-body-2 grey--text text--darken-1 mb-4">
      We read your imported pages for company details, opening hours,
      locations, links and policies. It's only a suggestion: tick what's
      right, and it's added to your Bot Profile draft. Nothing changes for
      customers until the profile is published.
    </div>

    <div class="d-flex align-start flex-wrap">
      <v-select
        v-model="sourceId"
        :items="websiteSources"
        item-text="name"
        item-value="_id"
        label="Read from"
        :no-data-text="'Import your website first.'"
        outlined
        dense
        hide-details
        class="source-field mr-2 mb-2"
      />
      <v-btn depressed rounded height="40" class="text-none mb-2" :disabled="!sourceId" :loading="reading" @click="read">
        <v-icon small class="mr-1">$wand-sparkles</v-icon> Suggest from website
      </v-btn>
      <v-spacer />
      <v-btn text rounded class="text-none mb-2" to="/dashboard/bot-profile">Open Bot Profile</v-btn>
    </div>

    <v-alert v-if="error" type="error" dense outlined rounded="lg" class="mt-2 text-body-2">
      {{ error }}
    </v-alert>

    <template v-if="suggestion">
      <div v-if="!rows.length && !hasLists" class="text-body-2 grey--text mt-4">
        We couldn't find company details on those pages. Fill them in on the Bot Profile page.
      </div>

      <!-- Single values -->
      <v-simple-table v-if="rows.length" dense class="compare mt-4">
        <thead>
          <tr>
            <th style="width: 40px"></th>
            <th>Field</th>
            <th>Suggested</th>
            <th>In your draft now</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.key">
            <td><v-simple-checkbox v-model="row.use" :ripple="false" /></td>
            <td class="text-no-wrap">{{ row.label }}</td>
            <td class="value">{{ row.suggested }}</td>
            <td class="value grey--text">{{ row.current || "—" }}</td>
          </tr>
        </tbody>
      </v-simple-table>

      <!-- Hours -->
      <div v-if="hours.length" class="mt-5">
        <v-checkbox
          v-model="useHours"
          hide-details
          dense
          class="mt-0"
          :label="currentHours.length ? 'Replace your opening hours with these' : 'Use these opening hours'"
        />
        <div class="list-box text-body-2">
          <span v-for="h in hours" :key="h.day" class="mr-4 text-no-wrap">
            <strong>{{ dayLabel(h.day) }}</strong> {{ h.closed ? "closed" : `${h.open}–${h.close}` }}
          </span>
        </div>
      </div>

      <!-- Lists: each entry can be picked -->
      <div v-for="list in LISTS" :key="list.key" class="mt-5">
        <template v-if="entries[list.key].length">
          <div class="text-subtitle-2 font-weight-bold mb-1">{{ list.title }}</div>
          <div class="list-box">
            <div v-for="(e, i) in entries[list.key]" :key="i" class="d-flex align-start py-1">
              <v-simple-checkbox v-model="e.use" :ripple="false" :disabled="e.exists" class="mr-2" />
              <div class="text-body-2">
                <strong>{{ e.value[list.titleKey] }}</strong>
                <span v-if="list.subKey && e.value[list.subKey]" class="grey--text"> · {{ e.value[list.subKey] }}</span>
                <span v-if="e.exists" class="grey--text"> (already in your draft)</span>
                <div v-if="list.textKey" class="grey--text text--darken-1 policy">{{ e.value[list.textKey] }}</div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div v-if="suggestion.readFrom && suggestion.readFrom.length" class="text-caption grey--text mt-4">
        Read from: {{ suggestion.readFrom.join(", ") }}
      </div>

      <div class="d-flex justify-end mt-4">
        <v-btn
          color="primary"
          depressed
          rounded
          class="text-none font-weight-bold"
          :disabled="!chosenCount"
          :loading="saving"
          @click="save"
        >
          Add {{ chosenCount }} to my draft
        </v-btn>
      </div>
    </template>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import { KNOWLEDGE_API, apiError } from "@/utils/knowledge";
import { SETUP_API } from "@/utils/setup";

const PROFILE_API = "/clients/bot-profile";
const LIST_MAX = 30;

const DAYS = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

const LISTS = [
  { key: "locations", title: "Locations", titleKey: "name", subKey: "address", matchKey: "address" },
  { key: "links", title: "Links", titleKey: "label", subKey: "url", matchKey: "url" },
  { key: "policies", title: "Policies", titleKey: "title", textKey: "text", matchKey: "title" },
];

const same = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

// Emits "changed" after the draft is saved.
export default {
  name: "ProfileStep",

  props: {
    state: { type: Object, required: true },
  },

  data: () => ({
    LISTS,
    allWebsiteSources: [],
    sourceId: null,
    reading: false,
    saving: false,
    error: "",
    suggestion: null,
    draft: null,
    version: 0,
    rows: [],
    hours: [],
    useHours: false,
    entries: { locations: [], links: [], policies: [] },
  }),

  computed: {
    // Prefer the setup's own website sources
    websiteSources() {
      const staged = (this.state.staging || []).filter((s) => s.type === "website");
      return staged.length ? staged : this.allWebsiteSources;
    },
    currentHours() {
      return this.draft?.facts?.hours || [];
    },
    hasLists() {
      return this.hours.length || LISTS.some((l) => this.entries[l.key].length);
    },
    chosenCount() {
      return (
        this.rows.filter((r) => r.use).length +
        (this.useHours ? 1 : 0) +
        LISTS.reduce((n, l) => n + this.entries[l.key].filter((e) => e.use).length, 0)
      );
    },
  },

  watch: {
    websiteSources: {
      immediate: true,
      handler(list) {
        if (!this.sourceId && list.length) this.sourceId = list[0]._id;
      },
    },
  },

  created() {
    if (!(this.state.staging || []).some((s) => s.type === "website")) this.loadAllWebsiteSources();
  },

  methods: {
    dayLabel: (d) => DAYS[d] || d,

    async loadAllWebsiteSources() {
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources`);
        this.allWebsiteSources = (data.data || []).filter((s) => s.type === "website");
      } catch {
        this.allWebsiteSources = [];
      }
    },

    async loadDraft() {
      const { data } = await apiClient.get(PROFILE_API);
      this.draft = data.data?.draft || {};
      this.version = data.data?.version || 0;
    },

    async read() {
      this.reading = true;
      this.error = "";
      this.suggestion = null;
      try {
        const [{ data }] = await Promise.all([
          apiClient.post(`${SETUP_API}/profile-suggestion`, { sourceId: this.sourceId }),
          this.loadDraft(),
        ]);
        this.suggestion = data.data || {};
        this.buildChoices();
      } catch (err) {
        this.error = apiError(err, "Couldn't read your website");
      } finally {
        this.reading = false;
      }
    },

    // Tick by default whatever the draft doesn't have yet
    buildChoices() {
      const s = this.suggestion;
      const facts = s.facts || {};
      const draftFacts = this.draft.facts || {};
      const rows = [];
      const add = (key, label, suggested, current) => {
        if (!suggested) return;
        rows.push({ key, label, suggested, current, use: !current });
      };
      add("companyName", "Company name", s.identity?.companyName, this.draft.identity?.companyName);
      add("phone", "Phone", facts.contact?.phone, draftFacts.contact?.phone);
      add("email", "Email", facts.contact?.email, draftFacts.contact?.email);
      add("website", "Website", facts.contact?.website, draftFacts.contact?.website);
      add("timezone", "Timezone", facts.timezone, draftFacts.timezone);
      this.rows = rows.filter((r) => !same(r.suggested, r.current));

      this.hours = facts.hours || [];
      this.useHours = this.hours.length > 0 && !this.currentHours.length;

      const entries = {};
      LISTS.forEach((l) => {
        const existing = draftFacts[l.key] || [];
        entries[l.key] = (facts[l.key] || []).map((value) => {
          const exists = existing.some((x) => same(x[l.matchKey], value[l.matchKey]));
          return { value, exists, use: !exists };
        });
      });
      this.entries = entries;
    },

    merged() {
      const draft = JSON.parse(JSON.stringify(this.draft || {}));
      draft.identity = draft.identity || {};
      draft.facts = draft.facts || {};
      draft.facts.contact = draft.facts.contact || {};
      this.rows
        .filter((r) => r.use)
        .forEach((r) => {
          if (r.key === "companyName") draft.identity.companyName = r.suggested;
          else if (r.key === "timezone") draft.facts.timezone = r.suggested;
          else draft.facts.contact[r.key] = r.suggested;
        });
      if (this.useHours) draft.facts.hours = this.hours;
      LISTS.forEach((l) => {
        const picked = this.entries[l.key].filter((e) => e.use && !e.exists).map((e) => e.value);
        if (picked.length) draft.facts[l.key] = [...(draft.facts[l.key] || []), ...picked].slice(0, LIST_MAX);
      });
      // Rules and custom instructions are kept as they are
      return draft;
    },

    async save() {
      this.saving = true;
      this.error = "";
      try {
        await apiClient.put(PROFILE_API, { profile: this.merged(), version: this.version });
        this.$toast.success("Added to your Bot Profile draft. Publish it on the Bot Profile page or when you switch over.");
        this.suggestion = null;
        this.$emit("changed");
      } catch (err) {
        this.error = apiError(err, "Failed to save the draft");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.source-field {
  max-width: 320px;
}
.compare .value {
  max-width: 280px;
  word-break: break-word;
}
.list-box {
  border: 1px solid #e4e8f2;
  border-radius: 10px;
  padding: 6px 12px;
  max-height: 300px;
  overflow-y: auto;
}
.policy {
  white-space: pre-wrap;
  font-size: 12px;
}
</style>
