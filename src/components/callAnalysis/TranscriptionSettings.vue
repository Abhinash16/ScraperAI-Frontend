<template>
  <v-dialog
    :value="value"
    max-width="560"
    scrollable
    @input="$emit('input', $event)"
  >
    <v-card rounded="lg">
      <div class="d-flex align-center pa-5">
        <v-avatar
          color="primary lighten-5"
          size="44"
          tile
          class="rounded-lg mr-4 flex-shrink-0"
        >
          <v-icon color="primary" size="22">$mic</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-h6 font-weight-bold grey--text text--darken-4">
            Call settings
          </div>
          <div class="text-caption grey--text text--darken-1">
            How recordings are turned into text before they're scored.
          </div>
        </div>
        <v-btn icon aria-label="Close" @click="$emit('input', false)">
          <v-icon>$x</v-icon>
        </v-btn>
      </div>
      <v-divider />

      <v-card-text class="pa-5">
        <v-skeleton-loader v-if="loading" type="list-item-two-line@3" />

        <v-alert v-else-if="loadError" dense text type="warning" class="mb-0">
          {{ loadError }}
        </v-alert>

        <template v-else>
          <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
            Transcription
          </div>
          <div class="text-body-2 grey--text text--darken-1 mb-3">
            Some options can tell the agent and the customer apart, so the
            transcript shows who said what.
          </div>

          <v-radio-group
            v-model="choice"
            class="mt-0"
            hide-details
            :disabled="!canManage || saving"
          >
            <v-sheet
              v-for="o in options"
              :key="o.value"
              outlined
              rounded="lg"
              class="px-4 py-3 mb-2"
            >
              <v-radio :value="o.value" class="mb-0">
                <template #label>
                  <div>
                    <div class="d-flex flex-wrap align-center">
                      <span
                        class="text-body-2 font-weight-bold grey--text text--darken-4 mr-2"
                        >{{ o.label }}</span
                      >
                      <v-chip
                        v-if="o.separatesSpeakers"
                        x-small
                        label
                        color="green lighten-5"
                        text-color="green darken-2"
                        class="font-weight-bold"
                      >
                        <v-icon left size="10">$users</v-icon>
                        Tells speakers apart
                      </v-chip>
                    </div>
                    <div
                      v-if="o.description"
                      class="text-caption grey--text text--darken-1"
                    >
                      {{ o.description }}
                    </div>
                  </div>
                </template>
              </v-radio>
            </v-sheet>
          </v-radio-group>

          <div class="d-flex align-start text-caption grey--text text--darken-1 mt-3">
            <v-icon size="14" color="grey darken-1" class="mr-2 mt-1"
              >$info</v-icon
            >
            <span>
              Applies to new calls. To re-transcribe an old call, retry it.
              <template v-if="!canManage">
                Only people who can manage settings can change this.
              </template>
            </span>
          </div>
        </template>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-6 py-3">
        <v-spacer />
        <v-btn text @click="$emit('input', false)">
          {{ canManage ? "Cancel" : "Close" }}
        </v-btn>
        <v-btn
          v-if="canManage"
          color="primary"
          depressed
          :disabled="loading || !!loadError || !changed"
          :loading="saving"
          @click="save"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import { can, loadMyPermissions } from "@/utils/knowledge";

// v-radio can't hold null, so "use the platform default" gets its own value
const DEFAULT = "__default__";

export default {
  props: {
    value: { type: Boolean, default: false },
  },

  data() {
    return {
      loading: false,
      saving: false,
      loadError: "",
      settings: null,
      choice: DEFAULT,
      perms: [],
    };
  },

  computed: {
    canManage() {
      return can(this.perms, "settings:manage");
    },
    models() {
      return this.settings?.models || [];
    },
    options() {
      const def = this.models.find((m) => m.id === this.settings?.defaultModel);
      return [
        {
          value: DEFAULT,
          label: `Use default (${def ? def.label : "recommended"})`,
          description: "Follows our recommended option, including if it changes later.",
          separatesSpeakers: false,
        },
        ...this.models.map((m) => ({ ...m, value: m.id })),
      ];
    },
    saved() {
      return this.settings?.transcriptionModel || DEFAULT;
    },
    changed() {
      return this.choice !== this.saved;
    },
  },

  watch: {
    value: {
      immediate: true,
      handler(open) {
        if (open) this.load();
      },
    },
  },

  methods: {
    apply(settings) {
      this.settings = settings;
      this.choice = this.saved;
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const [{ data }, perms] = await Promise.all([
          apiClient.get("/call-analysis/settings"),
          loadMyPermissions().catch(() => []),
        ]);
        this.perms = perms;
        this.apply(data.data);
      } catch (err) {
        this.loadError =
          err.response?.data?.error || "Couldn't load the call settings.";
      } finally {
        this.loading = false;
      }
    },

    async save() {
      this.saving = true;
      try {
        const { data } = await apiClient.put("/call-analysis/settings", {
          transcriptionModel: this.choice === DEFAULT ? null : this.choice,
        });
        this.apply(data.data);
        this.$toast.success("Call settings saved");
        this.$emit("input", false);
      } catch (err) {
        this.$toast.error(
          err.response?.data?.error || "Couldn't save the call settings."
        );
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
