<template>
  <v-dialog :value="value" max-width="600" scrollable :persistent="saving" @input="close">
    <v-card rounded="lg">
      <div class="d-flex align-center pa-5">
        <v-avatar size="44" tile color="primary lighten-5" class="rounded-lg mr-4 flex-shrink-0">
          <v-icon size="22" color="primary">{{ editing ? "$pencil" : "$key-round" }}</v-icon>
        </v-avatar>
        <div class="flex-grow-1 overflow-hidden">
          <div class="text-h6 font-weight-bold grey--text text--darken-4">
            {{ editing ? "Edit key" : "Create key" }}
          </div>
          <div v-if="editing" class="text-caption grey--text text--darken-1 text-truncate">
            {{ apiKey.kind === "secret" ? "Secret" : "Publishable" }} ·
            {{ apiKey.mode === "test" ? "Test" : "Live" }} · {{ apiKey.key || apiKey.maskedKey }}
          </div>
        </div>
        <v-btn icon aria-label="Close" :disabled="saving" @click="close"><v-icon>$x</v-icon></v-btn>
      </div>
      <v-divider />

      <v-card-text class="pa-5">
        <template v-if="!editing">
          <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">Type</div>
          <v-item-group v-model="form.kind" mandatory class="mb-5">
            <v-row dense>
              <v-col v-for="kind in KINDS" :key="kind.id" cols="12" sm="6">
                <v-item v-slot="{ active, toggle }" :value="kind.id">
                  <v-card
                    outlined
                    rounded="lg"
                    :color="active ? 'primary lighten-5' : ''"
                    :style="active ? { borderColor: 'var(--v-primary-base)' } : {}"
                    class="pa-3 fill-height"
                    @click="!active && toggle()"
                  >
                    <div class="d-flex align-center mb-1">
                      <v-icon size="16" :color="active ? 'primary' : 'grey darken-1'" class="mr-2">
                        {{ kind.icon }}
                      </v-icon>
                      <span class="text-body-2 font-weight-bold grey--text text--darken-4">{{ kind.name }}</span>
                    </div>
                    <div class="text-caption grey--text text--darken-1">{{ kind.text }}</div>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-item-group>

          <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">Mode</div>
          <v-item-group v-model="form.mode" mandatory class="mb-5">
            <v-row dense>
              <v-col v-for="mode in MODES" :key="mode.id" cols="12" sm="6">
                <v-item v-slot="{ active, toggle }" :value="mode.id">
                  <v-card
                    outlined
                    rounded="lg"
                    :color="active ? 'primary lighten-5' : ''"
                    :style="active ? { borderColor: 'var(--v-primary-base)' } : {}"
                    class="pa-3 fill-height"
                    @click="!active && toggle()"
                  >
                    <div class="d-flex align-center mb-1">
                      <v-chip
                        x-small
                        label
                        :color="mode.chipColor"
                        :text-color="mode.chipText"
                        class="font-weight-bold mr-2"
                      >
                        {{ mode.name }}
                      </v-chip>
                    </div>
                    <div class="text-caption grey--text text--darken-1">{{ mode.text }}</div>
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-item-group>
        </template>

        <v-text-field
          v-model="form.name"
          label="Name"
          placeholder="e.g. iOS app, Marketing site"
          outlined
          dense
          counter="80"
          maxlength="80"
          hide-details="auto"
          class="mb-5"
        />

        <template v-if="isPublishable">
          <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">Allowed websites</div>
          <div class="text-caption grey--text text--darken-1 mb-2">
            Use <code>example.com</code> for one site or <code>*.example.com</code> for all its subdomains.
          </div>
          <AllowListInput ref="origins" v-model="form.allowedOrigins" rule="domain" dense class="mb-5" />

          <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">Allowed apps</div>
          <div class="text-caption grey--text text--darken-1 mb-2">
            The iOS bundle ID or Android package name, e.g. <code>com.example.app</code>.
          </div>
          <AllowListInput ref="apps" v-model="form.allowedApps" rule="app" dense class="mb-4" />

          <v-alert
            v-if="!form.allowedOrigins.length && !form.allowedApps.length"
            text
            dense
            color="amber darken-3"
            rounded="lg"
            class="text-body-2 mb-0"
          >
            <span class="grey--text text--darken-3">{{ OPEN_KEY_HINT }}</span>
          </v-alert>
        </template>

        <v-alert v-else-if="!editing" text dense color="primary" rounded="lg" class="text-body-2 mb-0">
          <span class="grey--text text--darken-3">
            You'll see the full secret key once, right after you create it.
          </span>
        </v-alert>

        <v-alert v-if="error" type="error" dense text rounded="lg" class="text-body-2 mt-4 mb-0">
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <v-btn text :disabled="saving" @click="close">Cancel</v-btn>
        <v-btn color="primary" depressed :loading="saving" @click="save">
          {{ editing ? "Save" : "Create key" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import AllowListInput from "@/components/AllowListInput.vue";
import { apiError } from "@/utils/team";
import { API_KEYS_ENDPOINT, OPEN_KEY_HINT } from "@/utils/apiKeys";

const KINDS = [
  {
    id: "publishable",
    name: "Publishable",
    icon: "$globe",
    text: "Goes in your website or app. You choose where it may be used.",
  },
  {
    id: "secret",
    name: "Secret",
    icon: "$lock",
    text: "For your servers only. Never put it in a website or app.",
  },
];

const MODES = [
  {
    id: "live",
    name: "Live",
    chipColor: "green lighten-5",
    chipText: "green darken-3",
    text: "Real chats with your customers.",
  },
  {
    id: "test",
    name: "Test",
    chipColor: "amber lighten-4",
    chipText: "amber darken-4",
    text: "For trying things out: no webhooks, and the chats stay out of your reports.",
  },
];

const emptyForm = () => ({ kind: "publishable", mode: "live", name: "", allowedOrigins: [], allowedApps: [] });

// Creates a key (apiKey null) or edits one's name and allowlists.
// Emits "saved" with the key from the server (with `secret` for a new secret key).
export default {
  name: "ApiKeyDialog",

  components: { AllowListInput },

  props: {
    value: { type: Boolean, default: false },
    apiKey: { type: Object, default: null },
  },

  data: () => ({ KINDS, MODES, OPEN_KEY_HINT, form: emptyForm(), saving: false, error: "" }),

  computed: {
    editing() {
      return !!this.apiKey;
    },
    isPublishable() {
      return (this.editing ? this.apiKey.kind : this.form.kind) === "publishable";
    },
  },

  watch: {
    value(open) {
      if (!open) return;
      const k = this.apiKey;
      this.form = k
        ? { ...emptyForm(), name: k.name, allowedOrigins: [...k.allowedOrigins], allowedApps: [...k.allowedApps] }
        : emptyForm();
      this.error = "";
      this.$nextTick(() => {
        this.$refs.origins?.reset();
        this.$refs.apps?.reset();
      });
    },
  },

  methods: {
    close() {
      if (!this.saving) this.$emit("input", false);
    },

    async save() {
      // Entries typed but not added with "Add" still count
      if (this.isPublishable) {
        const originsOk = this.$refs.origins.commitDraft();
        const appsOk = this.$refs.apps.commitDraft();
        if (!originsOk || !appsOk) return;
      }

      const lists = this.isPublishable
        ? { allowedOrigins: this.form.allowedOrigins, allowedApps: this.form.allowedApps }
        : {};
      const body = this.editing
        ? { name: this.form.name, ...lists }
        : { kind: this.form.kind, mode: this.form.mode, name: this.form.name, ...lists };

      this.saving = true;
      this.error = "";
      try {
        const { data } = this.editing
          ? await apiClient.patch(`${API_KEYS_ENDPOINT}/${this.apiKey.id}`, body)
          : await apiClient.post(API_KEYS_ENDPOINT, body);
        this.$emit("saved", data.data);
        this.$emit("input", false);
      } catch (err) {
        this.error = apiError(err, this.editing ? "Failed to save the key" : "Failed to create the key");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

