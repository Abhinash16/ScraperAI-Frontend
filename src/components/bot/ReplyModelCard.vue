<template>
  <v-card outlined rounded="lg" class="mb-4">
    <div class="px-5 py-4">
      <div class="d-flex align-center">
        <v-icon size="18" color="primary" class="mr-2">$brain</v-icon>
        <span class="text-subtitle-1 font-weight-bold grey--text text--darken-4">Reply model</span>
        <v-spacer />
        <v-chip x-small label outlined>Saved straight away, not part of the draft</v-chip>
      </div>
      <div class="text-body-2 grey--text text--darken-1 mt-1">
        A smarter model answers everything the customer sent in one reply, uses their bookings,
        requests and payments without being asked, and explains photos and location pins. It costs
        more per reply and can take a few seconds longer. Changing it clears saved answers so new
        replies use the new model. Only your account changes.
      </div>
    </div>
    <v-divider />

    <div v-if="loading" class="pa-5">
      <v-skeleton-loader type="list-item-two-line" />
    </div>

    <v-alert v-else-if="loadError" type="error" text dense rounded="lg" class="ma-5 text-body-2">
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ loadError }}</span>
        <v-spacer />
        <v-btn small outlined color="error" @click="load">Retry</v-btn>
      </div>
    </v-alert>

    <div v-else class="pa-5">
      <v-radio-group v-model="model" hide-details class="mt-0">
        <v-radio v-for="c in choices" :key="c.value" :value="c.value">
          <template #label>
            <span class="text-body-2">
              <span class="font-weight-medium grey--text text--darken-4">{{ c.label }}</span>
              <span v-if="c.value === standard" class="grey--text"> · default</span>
            </span>
          </template>
        </v-radio>
      </v-radio-group>

      <div v-if="!isStandard" class="mt-4">
        <div class="text-body-2 font-weight-medium mb-1">Use it for</div>
        <v-radio-group v-model="when" hide-details class="mt-0">
          <v-radio value="auto">
            <template #label>
              <span class="text-body-2">
                Customers with account data, and messages with photos, voice notes or pins
                <span class="success--text font-weight-medium">(recommended)</span>
              </span>
            </template>
          </v-radio>
          <v-radio value="always" label="Every reply" class="text-body-2" />
        </v-radio-group>
        <div class="text-caption grey--text text--darken-1 mt-1">
          {{ when === "always" ? "Every reply uses it, so every reply costs more." : "Other replies use the standard model." }}
        </div>
      </div>

      <v-alert v-if="error" type="error" text dense rounded="lg" class="mt-4 mb-0 text-body-2">{{ error }}</v-alert>

      <div class="d-flex align-center mt-4">
        <span v-if="dirty" class="text-caption grey--text">Not saved yet</span>
        <v-spacer />
        <v-btn v-if="dirty" text class="mr-2" :disabled="saving" @click="reset">Undo</v-btn>
        <v-btn color="primary" depressed :disabled="!dirty" :loading="saving" @click="save">
          <v-icon left size="16">$check</v-icon>
          Save
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script>
import apiClient from "@/service/axios";
import { apiError } from "@/utils/knowledge";

const API = "/clients/reply-model";

// The model the backend falls back to; picking it resets to the default
const STANDARD = "gpt-4o-mini";

export default {
  name: "ReplyModelCard",

  data: () => ({
    standard: STANDARD,
    choices: [],
    saved: null, // { model, when }
    model: "",
    when: "auto",
    loading: true,
    loadError: "",
    saving: false,
    error: "",
  }),

  computed: {
    isStandard() {
      return this.model === STANDARD;
    },
    dirty() {
      if (!this.saved) return false;
      if (this.model !== this.saved.model) return true;
      return !this.isStandard && this.when !== this.saved.when;
    },
  },

  created() {
    this.load();
  },

  methods: {
    apply(data) {
      this.choices = data.choices || [];
      this.saved = { model: data.model, when: data.when };
      this.reset();
    },

    reset() {
      this.error = "";
      this.model = this.saved.model;
      // "never" means the default model; offer the recommended choice if they switch
      this.when = this.saved.when === "always" ? "always" : "auto";
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get(API);
        this.apply(data.data);
      } catch (err) {
        this.loadError = apiError(err, "Couldn't load the reply model.");
      } finally {
        this.loading = false;
      }
    },

    async save() {
      this.saving = true;
      this.error = "";
      try {
        const body = { model: this.model, when: this.isStandard ? "auto" : this.when };
        const { data } = await apiClient.put(API, body);
        this.apply(data.data);
        const label = this.choices.find((c) => c.value === this.saved.model)?.label || this.saved.model;
        this.$toast.success(`Replies now use: ${label}`);
      } catch (err) {
        this.error = apiError(err, "Couldn't change the reply model.");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
