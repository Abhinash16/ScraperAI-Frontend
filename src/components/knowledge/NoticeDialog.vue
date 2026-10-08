<template>
  <v-dialog :value="value" max-width="600" scrollable @input="$emit('input', $event)">
    <v-card rounded="lg">
      <v-card-title class="text-h6">{{ notice ? "Edit notice" : "Add notice" }}</v-card-title>
      <v-card-text>
        <v-alert
          v-if="notice && notice.origin === 'api'"
          type="warning"
          text
          dense
          rounded="lg"
          class="text-body-2"
        >
          This notice comes from your system. You can edit it here, but your
          system may overwrite your changes the next time it sends it.
        </v-alert>

        <v-select
          v-model="form.type"
          :items="TYPE_ITEMS"
          label="Type"
          outlined
          dense
        />
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

        <v-switch
          v-model="form.wholeDays"
          inset
          hide-details
          class="mt-0 mb-3"
          label="Whole days"
        />
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
        <div class="text-caption grey--text mb-4">India time (IST). Notices end by themselves.</div>

        <v-row v-if="form.type === 'special_hours'" dense>
          <v-col cols="6">
            <v-text-field v-model="form.open" type="time" label="Opens" outlined dense />
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="form.close" type="time" label="Closes" outlined dense />
          </v-col>
        </v-row>

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

        <v-checkbox
          v-if="BANNER_TYPES.includes(form.type)"
          v-model="form.showInWidget"
          hide-details
          label="Show a banner on the website chat"
        />

        <v-alert v-if="error" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
          {{ error }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text rounded class="text-none" :disabled="saving" @click="$emit('input', false)">Cancel</v-btn>
        <v-btn color="primary" depressed rounded class="text-none" :loading="saving" @click="save">
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
