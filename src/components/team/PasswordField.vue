<template>
  <div>
    <v-text-field
      :value="value"
      :label="label"
      :type="show ? 'text' : 'password'"
      prepend-inner-icon="$lock"
      outlined
      dense
      autocomplete="new-password"
      :error-messages="errorMessages"
      :rules="[minRule]"
      hide-details="auto"
      @input="$emit('input', $event)"
    >
      <template v-slot:append>
        <v-btn icon small :title="show ? 'Hide' : 'Show'" @click="show = !show">
          <v-icon size="16">{{ show ? "$eye-off" : "$eye" }}</v-icon>
        </v-btn>
        <v-btn small text color="primary" class="ml-1 px-2" @click="generate">
          <v-icon left size="14">$wand-sparkles</v-icon>
          Generate
        </v-btn>
      </template>
    </v-text-field>

    <div v-if="value" class="d-flex align-center mt-2">
      <v-progress-linear
        :value="strength.score * 25"
        :color="strength.color"
        background-color="grey lighten-3"
        height="4"
        rounded
        class="mr-3"
        :aria-label="`Password strength: ${strength.label}`"
      />
      <span class="text-caption text-no-wrap" :class="`${strength.color.split(' ')[0]}--text`">
        {{ strength.label }}
      </span>
    </div>
    <div v-else class="text-caption grey--text mt-2">At least 8 characters.</div>
  </div>
</template>

<script>
import { generatePassword, passwordStrength } from "@/utils/team";

// Password input with show/hide, a Generate button and a strength hint.
export default {
  name: "PasswordField",

  props: {
    value: { type: String, default: "" },
    label: { type: String, default: "Password" },
    errorMessages: { type: [String, Array], default: () => [] },
  },

  data: () => ({ show: false }),

  computed: {
    strength() {
      return passwordStrength(this.value);
    },
  },

  methods: {
    minRule(v) {
      return !v || v.length >= 8 || "Password must be at least 8 characters";
    },

    generate() {
      this.show = true;
      this.$emit("input", generatePassword());
    },
  },
};
</script>
