<template>
  <div>
    <div v-if="value.length" class="d-flex flex-wrap mb-3">
      <v-chip
        v-for="entry in value"
        :key="entry"
        close
        label
        :small="dense"
        color="green lighten-5"
        text-color="green darken-3"
        class="font-weight-bold mr-2 mb-2"
        :disabled="disabled"
        @click:close="remove(entry)"
      >
        <v-icon left size="14">{{ icon }}</v-icon>
        {{ entry }}
      </v-chip>
    </div>
    <div v-else-if="emptyText" class="text-body-2 grey--text mb-3">{{ emptyText }}</div>

    <v-form class="d-flex align-start" @submit.prevent="add">
      <v-text-field
        v-model.trim="draft"
        :placeholder="placeholder"
        outlined
        dense
        hide-details="auto"
        :error-messages="error"
        :disabled="disabled || value.length >= max"
        class="mr-2"
        @input="error = ''"
      />
      <v-btn
        type="submit"
        depressed
        color="success"
        height="40"
        :disabled="disabled || !draft || value.length >= max"
      >
        <v-icon left size="16">$plus</v-icon>
        Add
      </v-btn>
    </v-form>
  </div>
</template>

<script>
// A list of chips with an input to add more (allowed domains, app IDs).
// v-model is the array; `rule` is one of RULES in utils/allowlist.js.
import { RULES } from "@/utils/allowlist";

export default {
  name: "AllowListInput",

  props: {
    value: { type: Array, default: () => [] },
    rule: { type: String, default: "domain" },
    max: { type: Number, default: 20 },
    emptyText: { type: String, default: "" },
    dense: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },

  data: () => ({ draft: "", error: "" }),

  computed: {
    spec() {
      return RULES[this.rule];
    },
    icon() {
      return this.spec.icon;
    },
    placeholder() {
      return this.spec.placeholder;
    },
  },

  methods: {
    add() {
      const entry = this.spec.normalise(this.draft);
      if (!this.spec.pattern.test(entry)) {
        this.error = this.spec.invalid;
        return;
      }
      if (this.value.includes(entry)) {
        this.error = "Already in the list";
        return;
      }
      if (this.value.length >= this.max) {
        this.error = `You can add up to ${this.max}`;
        return;
      }
      this.$emit("input", [...this.value, entry]);
      this.draft = "";
    },

    remove(entry) {
      this.$emit("input", this.value.filter((v) => v !== entry));
    },

    // Adds what's typed but not yet added; false when it isn't valid.
    commitDraft() {
      if (!this.draft) return true;
      this.add();
      return !this.error;
    },

    reset() {
      this.draft = "";
      this.error = "";
    },
  },
};
</script>
