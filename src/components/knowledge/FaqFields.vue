<template>
  <div>
    <v-text-field
      :value="value.question"
      label="Question"
      hint="The question as a customer would ask it."
      persistent-hint
      outlined
      dense
      counter="300"
      :readonly="readonly"
      class="mb-3"
      @input="update('question', $event)"
    />
    <v-textarea
      :value="value.answer"
      label="Answer"
      hint="The bot gives this answer whenever the question matches."
      persistent-hint
      outlined
      rows="5"
      auto-grow
      :counter="FAQ_ANSWER_MAX"
      :readonly="readonly"
      class="mb-3"
      @input="update('answer', $event)"
    />
    <v-combobox
      :value="value.alternates"
      label="Other ways customers ask"
      :hint="`Press Enter after each one. Up to ${FAQ_ALTERNATES_MAX}. More phrasings help the bot match.`"
      persistent-hint
      multiple
      small-chips
      :deletable-chips="!readonly"
      outlined
      dense
      :readonly="readonly"
      :delimiters="['|']"
      class="mb-3"
      @change="update('alternates', clean($event).slice(0, FAQ_ALTERNATES_MAX))"
    />
    <v-combobox
      :value="value.category"
      :items="categories"
      label="Category (optional)"
      placeholder="e.g. Pricing"
      outlined
      dense
      clearable
      hide-details
      :readonly="readonly"
      @change="update('category', ($event || '').trim())"
    />
  </div>
</template>

<script>
import { FAQ_ALTERNATES_MAX, FAQ_ANSWER_MAX } from "@/utils/knowledge";

// v-model is { question, answer, alternates: string[], category }.
export default {
  name: "FaqFields",

  props: {
    value: { type: Object, required: true },
    categories: { type: Array, default: () => [] },
    readonly: { type: Boolean, default: false },
  },

  data: () => ({ FAQ_ANSWER_MAX, FAQ_ALTERNATES_MAX }),

  methods: {
    update(key, val) {
      this.$emit("input", { ...this.value, [key]: val });
    },

    clean(list) {
      return [...new Set((list || []).map((s) => String(s).trim()).filter(Boolean))];
    },
  },
};
</script>
