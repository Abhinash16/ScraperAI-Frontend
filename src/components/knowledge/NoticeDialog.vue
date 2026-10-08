<template>
  <v-dialog :value="value" max-width="600" scrollable @input="$emit('input', $event)">
    <v-card rounded="lg">
      <div class="d-flex align-center pa-5">
        <v-avatar size="44" tile color="primary lighten-5" class="rounded-lg mr-4 flex-shrink-0">
          <v-icon size="22" color="primary">{{ notice ? "$pencil" : "$calendar" }}</v-icon>
        </v-avatar>
        <div class="flex-grow-1">
          <div class="text-h6 font-weight-bold grey--text text--darken-4">
            {{ notice ? "Edit notice" : "Add notice" }}
          </div>
          <div class="text-caption grey--text text--darken-1">
            Something temporary the bot should tell customers.
          </div>
        </div>
        <v-btn icon aria-label="Close" :disabled="saving" @click="$emit('input', false)">
          <v-icon>$x</v-icon>
        </v-btn>
      </div>
      <v-divider />

      <v-card-text class="pa-5">
        <v-alert
          v-if="notice && notice.origin === 'api'"
          type="warning"
          text
          dense
          rounded="lg"
          class="text-body-2"
        >
          This notice comes from your system. You can edit it here, but your system may overwrite your
          changes the next time it sends it.
        </v-alert>

        <!-- What -->
        <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">What</div>
        <v-select v-model="form.type" :items="TYPE_ITEMS" label="Type" outlined dense />
        <v-text-field
          v-model="form.title"
          label="Title"
          placeholder="Koramangala hub closed for Diwali"
          persistent-placeholder
          outlined
          dense
          counter="100"
        />
        <v-textarea
          v-model="form.text"
          label="Details (optional)"
          hint="The bot repeats this to customers: include conditions, codes, what to do instead."
          persistent-hint
          outlined
          rows="3"
          auto-grow
          counter="1000"
          class="mb-2"
        />

        <v-divider class="my-4" />

        <!-- When -->
        <div class="d-flex align-center mb-2">
          <span class="text-caption font-weight-bold text-uppercase grey--text">When</span>
          <v-spacer />
          <v-switch
            v-model="form.wholeDays"
            inset
            hide-details
            color="success"
            class="mt-0 pt-0"
            label="Whole days"
          />
        </div>
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.startDate"
              type="date"
              :label="form.wholeDays ? 'First day' : 'Starts'"
              outlined
              dense
              hide-details
              class="mb-2"
            />
          </v-col>
          <v-col v-if="!form.wholeDays" cols="12" sm="6">
            <v-text-field v-model="form.startTime" type="time" label="At" outlined dense hide-details class="mb-2" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="form.endDate"
              type="date"
              :label="form.wholeDays ? 'Last day' : 'Ends'"
              outlined
              dense
              hide-details
              class="mb-2"
            />
          </v-col>
          <v-col v-if="!form.wholeDays" cols="12" sm="6">
            <v-text-field v-model="form.endTime" type="time" label="At" outlined dense hide-details class="mb-2" />
          </v-col>
        </v-row>
        <div class="text-caption grey--text mb-3">India time (IST). Notices end by themselves.</div>

        <v-row v-if="form.type === 'special_hours'" dense>
          <v-col cols="6">
            <v-text-field v-model="form.open" type="time" label="Opens" outlined dense />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="form.close" type="time" label="Closes" outlined dense />
          </v-col>
        </v-row>

        <v-divider class="my-4" />

        <!-- Where -->
        <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">Where</div>
        <v-combobox
          v-model="form.locations"
          :items="locationSuggestions"
          label="Locations"
          placeholder="Everywhere"
          persistent-placeholder
          hint="Hubs or branches, as named in your Bot Profile's business facts. Leave empty for everywhere."
          persistent-hint
          multiple
          small-chips
          deletable-chips
          outlined
          dense
          class="mb-2"
        />

        <v-sheet
          v-if="BANNER_TYPES.includes(form.type)"
          outlined
          rounded="lg"
          class="d-flex align-center px-4 py-2 mt-3"
        >
          <v-icon size="18" color="grey darken-1" class="mr-3">$monitor</v-icon>
          <v-checkbox
            v-model="form.showInWidget"
            hide-details
            color="success"
            class="mt-0 pt-0"
            label="Show a banner on the website chat"
          />
        </v-sheet>

        <v-alert v-if="error" type="error" dense text rounded="lg" class="mt-4 mb-0 text-body-2">
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <v-btn text :disabled="saving" @click="$emit('input', false)">Cancel</v-btn>
        <v-btn color="primary" depressed :loading="saving" @click="save">
          {{ notice ? "Save" : "Add notice" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import { apiError } from "@/utils/knowledge";
import {
  BANNER_TYPES,
  NOTICES_API,
  NOTICE_TYPES,
  formToNotice,
  noticeToForm,
} from "@/utils/notices";

const TYPE_ITEMS = Object.entries(NOTICE_TYPES).map(([value, t]) => ({ value, text: t.label }));

// Add (notice = null) or edit a notice. Emits "input" and "saved".
export default {
  name: "NoticeDialog",

  props: {
    value: { type: Boolean, default: false },
    notice: { type: Object, default: null },
    locationSuggestions: { type: Array, default: () => [] },
  },

  data: () => ({
    TYPE_ITEMS,
    BANNER_TYPES,
    form: noticeToForm(null),
    saving: false,
    error: "",
  }),

  watch: {
    value: {
      immediate: true,
      handler(open) {
        if (!open) return;
        this.form = noticeToForm(this.notice);
        this.error = "";
      },
    },
  },

  methods: {
    async save() {
      const { body, error } = formToNotice(this.form);
      if (error) {
        this.error = error;
        return;
      }
      this.saving = true;
      this.error = "";
      try {
        const { data } = this.notice
          ? await apiClient.patch(`${NOTICES_API}/${this.notice._id}`, body)
          : await apiClient.post(NOTICES_API, body);
        this.$toast.success(this.notice ? "Notice saved. The bot knows right away." : "Notice added. The bot knows right away.");
        this.$emit("saved", data.data);
        this.$emit("input", false);
      } catch (err) {
        this.error = apiError(err, "Failed to save the notice");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
