<template>
  <v-dialog :value="value" max-width="620" scrollable @input="$emit('input', $event)">
    <v-card rounded="lg">
      <v-card-title class="text-h6">Add FAQ</v-card-title>
      <v-card-text class="pt-2">
        <FaqFields v-model="faq" :categories="categories" />
        <v-checkbox
          v-if="canPublish"
          v-model="publish"
          hide-details
          label="Publish now, so the bot can use it"
        />
        <v-alert v-if="error" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
          {{ error }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text rounded class="text-none" :disabled="saving" @click="$emit('input', false)">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          depressed
          rounded
          class="text-none"
          :disabled="!faq.question.trim() || !faq.answer.trim()"
          :loading="saving"
          @click="save"
        >
          Add FAQ
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import FaqFields from "@/components/knowledge/FaqFields.vue";
import { KNOWLEDGE_API, apiError } from "@/utils/knowledge";

const emptyFaq = () => ({ question: "", answer: "", alternates: [], category: "" });

// Emits "saved" after the FAQ is created.
export default {
  name: "FaqDialog",

  components: { FaqFields },

  props: {
    value: { type: Boolean, default: false },
    sourceId: { type: String, required: true },
    categories: { type: Array, default: () => [] },
    canPublish: { type: Boolean, default: false },
  },

  data: () => ({ faq: emptyFaq(), publish: false, saving: false, error: "" }),

  watch: {
    value(open) {
      if (!open) return;
      this.faq = emptyFaq();
      this.publish = this.canPublish;
      this.error = "";
    },
  },

  methods: {
    async save() {
      this.saving = true;
      this.error = "";
      const { question, answer, alternates, category } = this.faq;
      try {
        await apiClient.post(`${KNOWLEDGE_API}/sources/${this.sourceId}/items`, {
          question: question.trim(),
          answer: answer.trim(),
          alternates,
          category: category || undefined,
          publish: this.canPublish && this.publish,
        });
        this.$toast.success(this.publish ? "FAQ added and publishing" : "FAQ added as a draft");
        this.$emit("input", false);
        this.$emit("saved");
      } catch (err) {
        this.error = apiError(err, "Failed to add the FAQ");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
