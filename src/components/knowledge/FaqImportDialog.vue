<template>
  <v-dialog :value="value" max-width="560" scrollable @input="$emit('input', $event)">
    <v-card rounded="lg">
      <v-card-title class="text-h6">Import FAQs from CSV</v-card-title>
      <v-card-text class="pt-2">
        <div class="text-body-2 grey--text text--darken-1 mb-4">
          Columns: <code>question</code>, <code>answer</code>,
          <code>category</code> and <code>alternates</code> (other ways to ask,
          separated with <code>|</code> or <code>;</code>). Questions already in
          this source are skipped.
          <a href="#" class="d-inline-flex align-center" @click.prevent="downloadTemplate">
            <v-icon x-small color="primary" class="mr-1">$download</v-icon>
            Download a template
          </a>
        </div>

        <v-file-input
          v-model="file"
          label="CSV file"
          accept=".csv,text/csv"
          prepend-icon=""
          prepend-inner-icon="$file-spreadsheet"
          outlined
          dense
          show-size
          hide-details
          class="mb-2"
        />
        <v-checkbox
          v-if="canPublish"
          v-model="publish"
          hide-details
          label="Publish them now, so the bot can use them"
        />

        <v-alert v-if="error" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
          {{ error }}
        </v-alert>

        <template v-if="result">
          <v-alert
            :type="result.errors.length ? 'warning' : 'success'"
            dense
            outlined
            rounded="lg"
            class="mt-4 mb-2 text-body-2"
          >
            {{ result.created }} FAQ{{ result.created === 1 ? "" : "s" }} added<template
              v-if="result.skipped"
            >, {{ result.skipped }} already in this source</template><template
              v-if="result.errors.length"
            >, {{ result.errors.length }} row{{ result.errors.length === 1 ? "" : "s" }} not imported</template>.
          </v-alert>
          <div v-if="result.errors.length" class="row-errors text-body-2">
            <div v-for="e in result.errors" :key="e.row" class="mb-1">
              <strong>Line {{ e.row }}:</strong> {{ e.error }}
            </div>
          </div>
        </template>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text rounded class="text-none" :disabled="importing" @click="$emit('input', false)">
          {{ result ? "Close" : "Cancel" }}
        </v-btn>
        <v-btn
          color="primary"
          depressed
          rounded
          class="text-none"
          :disabled="!file"
          :loading="importing"
          @click="run"
        >
          Import
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import { KNOWLEDGE_API, apiError } from "@/utils/knowledge";

const TEMPLATE = [
  "question,answer,category,alternates",
  '"What are your opening hours?","We are open 9am to 7pm, Monday to Saturday.",Timings,"When do you open?|Are you open on Sunday?"',
  '"Do you deliver?","Yes, we deliver within the city. Delivery is free on orders above Rs 999.",Delivery,"Is delivery free?;Can I get it delivered?"',
].join("\n");

// Emits "imported" after rows were created.
export default {
  name: "FaqImportDialog",

  props: {
    value: { type: Boolean, default: false },
    sourceId: { type: String, required: true },
    canPublish: { type: Boolean, default: false },
  },

  data: () => ({ file: null, publish: false, importing: false, error: "", result: null }),

  watch: {
    value(open) {
      if (!open) return;
      this.file = null;
      this.publish = false;
      this.error = "";
      this.result = null;
    },
  },

  methods: {
    async run() {
      this.importing = true;
      this.error = "";
      this.result = null;
      const form = new FormData();
      form.append("file", this.file);
      try {
        const { data } = await apiClient.post(
          `${KNOWLEDGE_API}/sources/${this.sourceId}/import/faqs`,
          form,
          { params: this.canPublish && this.publish ? { publish: true } : {} },
        );
        this.result = { created: 0, skipped: 0, errors: [], ...data.data };
        this.file = null;
        if (this.result.created) this.$emit("imported");
      } catch (err) {
        this.error = apiError(err, "Import failed");
      } finally {
        this.importing = false;
      }
    },

    downloadTemplate() {
      const url = URL.createObjectURL(new Blob([TEMPLATE + "\n"], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "faq-template.csv";
      link.click();
      URL.revokeObjectURL(url);
    },
  },
};
</script>

<style scoped>
.row-errors {
  max-height: 200px;
  overflow-y: auto;
}
</style>
