<template>
  <v-card outlined rounded="lg" class="mt-4">
    <div class="d-flex align-start px-5 py-4">
      <v-avatar size="40" tile color="amber lighten-5" class="rounded-lg mr-3 flex-shrink-0">
        <v-icon size="20" color="amber darken-2">$message-circle-warning</v-icon>
      </v-avatar>
      <div>
        <div class="d-flex align-center">
          <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mr-2">
            Alert emails when escalation fails
          </span>
          <span v-if="emails.length" class="text-caption grey--text">
            ({{ emails.length }}/{{ MAX_EMAILS }})
          </span>
        </div>
        <div class="text-caption grey--text text--darken-1">
          If we can't send an escalation to your system, we email these addresses with the customer's
          details so someone can contact them. Leave empty to use your account email<template
            v-if="defaultEmail"
          >
            (<strong>{{ defaultEmail }}</strong>)</template
          >. Up to {{ MAX_EMAILS }} addresses. We also email them when many bot replies fail or your
          product API stops responding.
        </div>
      </div>
    </div>
    <v-divider />

    <div class="pa-5">
      <v-skeleton-loader v-if="loading" type="list-item, list-item" />

      <v-alert v-else-if="loadError" type="error" text rounded="lg" class="text-body-2 mb-0">
        <div class="d-flex align-center flex-wrap">
          <span class="mr-4">{{ loadError }}</span>
          <v-spacer />
          <v-btn small outlined color="error" @click="load">
            <v-icon left size="14">$refresh-cw</v-icon>
            Retry
          </v-btn>
        </div>
      </v-alert>

      <template v-else>
        <div v-if="emails.length" class="d-flex flex-wrap mb-3">
          <v-chip
            v-for="email in emails"
            :key="email"
            close
            label
            color="green lighten-5"
            text-color="green darken-3"
            class="font-weight-bold mr-2 mb-2"
            @click:close="removeEmail(email)"
          >
            <v-icon left size="14">$message-square</v-icon>
            {{ email }}
          </v-chip>
        </div>
        <div v-else class="text-body-2 grey--text mb-3">
          No addresses yet<template v-if="defaultEmail">: alerts go to {{ defaultEmail }}</template>.
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
            class="mr-2"
            @input="draftError = ''"
          />
          <v-btn
            type="submit"
            depressed
            color="success"
            height="40"
            :disabled="!draft || emails.length >= MAX_EMAILS"
          >
            <v-icon left size="16">$plus</v-icon>
            Add
          </v-btn>
        </v-form>

        <v-alert v-if="saveError" type="error" dense text rounded="lg" class="mt-4 mb-0 text-body-2">
          {{ saveError }}
        </v-alert>

        <div class="d-flex align-center mt-4">
          <span v-if="dirty" class="text-caption amber--text text--darken-3 font-weight-bold">
            Unsaved changes
          </span>
          <v-spacer />
          <v-btn v-if="dirty" text class="mr-2" :disabled="saving" @click="reset">Discard</v-btn>
          <v-btn color="primary" depressed :disabled="!dirty" :loading="saving" @click="save">
            Save alert emails
          </v-btn>
        </div>

        <v-divider class="my-5" />

        <v-sheet outlined rounded="lg" class="d-flex align-center px-4 py-3">
          <v-avatar
            size="36"
            tile
            :color="weeklyDigest ? 'green lighten-5' : 'grey lighten-4'"
            class="rounded-lg mr-3 flex-shrink-0"
          >
            <v-icon size="18" :color="weeklyDigest ? 'green darken-1' : 'grey'">$history</v-icon>
          </v-avatar>
          <div class="flex-grow-1 mr-4">
            <div class="text-body-2 font-weight-bold grey--text text--darken-4">Weekly knowledge report</div>
            <div class="text-caption grey--text text--darken-1">
              Every Monday morning: your bot's knowledge health, new problems, unanswered questions and
              what to fix first. Sent to the addresses above.
            </div>
          </div>
          <v-switch
            :input-value="weeklyDigest"
            color="success"
            inset
            hide-details
            class="mt-0 pt-0"
            :loading="savingDigest"
            :disabled="savingDigest"
            aria-label="Weekly knowledge report on or off"
            @change="saveDigest"
          />
        </v-sheet>
      </template>
    </div>
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
