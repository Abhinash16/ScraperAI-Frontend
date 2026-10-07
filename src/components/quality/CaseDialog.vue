<template>
  <v-dialog :value="value" max-width="640" scrollable @input="$emit('input', $event)">
    <v-card rounded="xl">
      <v-card-title class="text-h6">{{ editing ? "Edit test question" : "Add test question" }}</v-card-title>
      <v-card-text class="pt-2">
        <v-alert
          v-if="generated"
          border="left"
          colored-border
          color="deep-purple"
          elevation="0"
          outlined
          rounded="lg"
          class="text-body-2"
        >
          This question was made from your FAQs, so its expected answer comes
          from the FAQ. To change the answer, edit the FAQ, then click
          Generate from FAQs again.
          <a v-if="testCase.sourceItem" href="#" @click.prevent="$emit('open-item', testCase.sourceItem)">
            Edit the FAQ
          </a>
        </v-alert>

        <v-textarea
          v-model="form.question"
          label="Question"
          hint="Ask it the way a customer would."
          persistent-hint
          outlined
          rows="2"
          auto-grow
          class="mb-3"
        />
        <v-textarea
          v-model="form.expected"
          label="Expected answer"
          hint="What a correct reply must say. The judge compares the bot's reply with this."
          persistent-hint
          outlined
          rows="4"
          auto-grow
          :readonly="generated"
          class="mb-3"
        />
        <v-combobox
          v-model="form.mustNotSay"
          label="Must never say"
          hint="Words or claims that fail the test if the reply contains them, e.g. a competitor's name. Press Enter after each."
          persistent-hint
          multiple
          small-chips
          deletable-chips
          outlined
          dense
          class="mb-3"
        />
        <v-combobox
          v-model="form.tags"
          label="Tags (optional)"
          multiple
          small-chips
          deletable-chips
          outlined
          dense
          hide-details
          class="mb-4"
        />

        <!-- Earlier messages -->
        <div class="d-flex align-center mb-1">
          <div class="text-subtitle-2 font-weight-bold">Earlier messages (optional)</div>
          <v-spacer />
          <v-btn small text rounded color="primary" class="text-none" @click="addTurn">
            <v-icon small class="mr-1">$plus</v-icon> Add message
          </v-btn>
        </div>
        <div class="text-caption grey--text mb-2">
          To test a follow-up question, add the conversation that comes before it.
        </div>
        <div v-for="(turn, i) in form.history" :key="i" class="d-flex align-start">
          <v-select
            v-model="turn.sender"
            :items="SENDERS"
            outlined
            dense
            hide-details
            class="sender-field mr-2 mb-2"
          />
          <v-text-field v-model="turn.text" outlined dense hide-details class="mb-2" />
          <v-btn icon small class="ml-1 mt-1" aria-label="Remove message" @click="form.history.splice(i, 1)">
            <v-icon small>$x</v-icon>
          </v-btn>
        </div>

        <v-alert v-if="error" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
          {{ error }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text rounded class="text-none" :disabled="saving" @click="$emit('input', false)">Cancel</v-btn>
        <v-btn
          color="primary"
          depressed
          rounded
          class="text-none"
          :disabled="!form.question.trim() || !form.expected.trim()"
          :loading="saving"
          @click="save"
        >
          {{ editing ? "Save" : "Add" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import { apiError } from "@/utils/knowledge";
import { EVAL_API, isGenerated } from "@/utils/quality";

const SENDERS = [
  { value: "user", text: "Customer" },
  { value: "bot", text: "Bot" },
];

const clean = (list) => [...new Set((list || []).map((s) => String(s).trim()).filter(Boolean))];

const formOf = (c) => ({
  question: c?.question || "",
  expected: c?.expected || "",
  mustNotSay: [...(c?.mustNotSay || [])],
  tags: [...(c?.tags || [])],
  history: (c?.history || []).map((t) => ({ sender: t.sender, text: t.text })),
});

// v-model opens it. `testCase` set = edit. Emits "saved" and "open-item" (FAQ id).
export default {
  name: "CaseDialog",

  props: {
    value: { type: Boolean, default: false },
    testCase: { type: Object, default: null },
  },

  data: () => ({ SENDERS, form: formOf(null), saving: false, error: "" }),

  computed: {
    editing() {
      return !!this.testCase;
    },
    generated() {
      return isGenerated(this.testCase);
    },
  },

  watch: {
    value(open) {
      if (!open) return;
      this.form = formOf(this.testCase);
      this.error = "";
    },
  },

  methods: {
    addTurn() {
      const last = this.form.history[this.form.history.length - 1];
      this.form.history.push({ sender: last?.sender === "user" ? "bot" : "user", text: "" });
    },

    async save() {
      this.saving = true;
      this.error = "";
      const body = {
        question: this.form.question.trim(),
        mustNotSay: clean(this.form.mustNotSay),
        tags: clean(this.form.tags),
        history: this.form.history
          .map((t) => ({ sender: t.sender, text: t.text.trim() }))
          .filter((t) => t.text),
      };
      if (!this.generated) body.expected = this.form.expected.trim();
      try {
        if (this.editing) await apiClient.patch(`${EVAL_API}/cases/${this.testCase._id}`, body);
        else await apiClient.post(`${EVAL_API}/cases`, body);
        this.$toast.success(this.editing ? "Test question saved" : "Test question added");
        this.$emit("input", false);
        this.$emit("saved");
      } catch (err) {
        this.error = apiError(err, "Failed to save");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.sender-field {
  max-width: 130px;
}
</style>
