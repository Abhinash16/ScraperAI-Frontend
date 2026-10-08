<template>
  <v-card outlined rounded="xl" class="pa-6 mt-4">
    <div class="text-subtitle-1 font-weight-bold mb-1">
      Alert emails when escalation fails
    </div>
    <div class="text-body-2 grey--text text--darken-1 mb-4">
      If we can't send an escalation to your system, we email these addresses
      with the customer's details so someone can contact them. Leave empty to
      use your account email<template v-if="defaultEmail">
        (<strong>{{ defaultEmail }}</strong>)</template
      >. Up to {{ MAX_EMAILS }} addresses. We also email them when many
      bot replies fail or your product API stops responding.
    </div>

    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <v-alert
      v-else-if="loadError"
      type="error"
      outlined
      rounded="xl"
      class="mb-0"
    >
      {{ loadError }}
      <v-btn small text color="error" class="ml-2" @click="load">
        Retry
      </v-btn>
    </v-alert>

    <template v-else>
      <div v-if="emails.length" class="mb-3">
        <v-chip
          v-for="email in emails"
          :key="email"
          close
          outlined
          class="mr-2 mb-2"
          @click:close="removeEmail(email)"
        >
          {{ email }}
        </v-chip>
      </div>

      <v-form class="d-flex align-start" @submit.prevent="addEmail">
        <v-text-field
          v-model.trim="draft"
          placeholder="support@example.com"
          type="email"
          outlined
          dense
          hide-details="auto"
          :error-messages="draftError"
          :disabled="emails.length >= MAX_EMAILS"
          background-color="#f8fafc"
          class="mr-2"
          @input="draftError = ''"
        />
        <v-btn
          type="submit"
          depressed
          rounded
          height="40"
          :disabled="!draft || emails.length >= MAX_EMAILS"
          class="text-none"
        >
          Add
        </v-btn>
      </v-form>

      <v-alert
        v-if="saveError"
        type="error"
        dense
        outlined
        rounded="lg"
        class="mt-4 mb-0 text-body-2"
      >
        {{ saveError }}
      </v-alert>

      <div class="d-flex justify-end mt-4">
        <v-btn
          v-if="dirty"
          text
          rounded
          class="text-none mr-2"
          :disabled="saving"
          @click="reset"
        >
          Discard
        </v-btn>
        <v-btn
          color="primary"
          depressed
          rounded
          class="text-none font-weight-bold"
          :disabled="!dirty"
          :loading="saving"
          @click="save"
        >
          Save alert emails
        </v-btn>
      </div>

      <v-divider class="my-6" />

      <div class="d-flex align-start">
        <div class="flex-grow-1 mr-4">
          <div class="text-subtitle-2 font-weight-bold">Weekly knowledge report</div>
          <div class="text-body-2 grey--text text--darken-1">
            Every Monday morning: your bot's knowledge health, new problems,
            unanswered questions and what to fix first. Sent to the addresses
            above.
          </div>
        </div>
        <v-switch
          :input-value="weeklyDigest"
          color="primary"
          inset
          hide-details
          class="mt-0 pt-0"
          :loading="savingDigest"
          :disabled="savingDigest"
          :label="weeklyDigest ? 'On' : 'Off'"
          @change="saveDigest"
        />
      </div>
    </template>
  </v-card>
</template>

<script>
import apiClient from "@/service/axios";

const ENDPOINT = "/clients/escalation-alerts";
const MAX_EMAILS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default {
  name: "EscalationAlertEmails",

  data() {
    return {
      MAX_EMAILS,

      saved: [],
      emails: [],
      defaultEmail: "",
      weeklyDigest: true,
      savingDigest: false,
      draft: "",
      draftError: "",

      loading: false,
      loadError: "",
      saving: false,
      saveError: "",
    };
  },

  computed: {
    dirty() {
      return (
        this.emails.length !== this.saved.length ||
        this.emails.some((e, i) => e !== this.saved[i])
      );
    },
  },

  created() {
    this.load();
  },

  methods: {
    apply(data) {
      this.saved = [...(data?.emails || [])];
      this.emails = [...this.saved];
      this.defaultEmail = data?.defaultEmail || "";
      this.weeklyDigest = data?.weeklyDigest !== false;
    },

    // Sent alone, so unsaved address edits stay as they are
    async saveDigest(on) {
      const value = !!on;
      this.weeklyDigest = value;
      this.savingDigest = true;
      try {
        const { data } = await apiClient.put(ENDPOINT, { weeklyDigest: value });
        this.weeklyDigest = data.data?.weeklyDigest !== false;
        this.$toast.success(value ? "Weekly report turned on" : "Weekly report turned off");
      } catch (err) {
        this.weeklyDigest = !value;
        this.$toast.error(err.response?.data?.message || "Failed to update the weekly report");
      } finally {
        this.savingDigest = false;
      }
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get(ENDPOINT);
        this.apply(data.data);
      } catch (err) {
        this.loadError =
          err.response?.data?.message || "Failed to load alert emails";
      } finally {
        this.loading = false;
      }
    },

    addEmail() {
      // Pasting "a@x.com, b@y.com" adds each address.
      const entries = this.draft
        .toLowerCase()
        .split(/[\s,;]+/)
        .filter(Boolean);
      const invalid = entries.find((e) => !EMAIL_RE.test(e));
      if (invalid) {
        this.draftError = `"${invalid}" isn't a valid email address`;
        return;
      }
      const added = entries.filter(
        (e, i) => !this.emails.includes(e) && entries.indexOf(e) === i,
      );
      if (!added.length) {
        this.draftError = "Already in the list";
        return;
      }
      if (this.emails.length + added.length > MAX_EMAILS) {
        this.draftError = `You can add up to ${MAX_EMAILS} addresses`;
        return;
      }
      this.emails.push(...added);
      this.draft = "";
      this.saveError = "";
    },

    removeEmail(email) {
      this.emails = this.emails.filter((e) => e !== email);
      this.saveError = "";
    },

    reset() {
      this.emails = [...this.saved];
      this.draft = "";
      this.draftError = "";
      this.saveError = "";
    },

    async save() {
      this.saving = true;
      this.saveError = "";
      try {
        const { data } = await apiClient.put(ENDPOINT, {
          emails: this.emails,
        });
        this.apply(data.data);
        this.$toast.success(
          this.emails.length
            ? "Alert emails saved"
            : "Alert emails cleared. Alerts go to your account email",
        );
      } catch (err) {
        this.saveError =
          err.response?.data?.message || "Failed to save alert emails";
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
