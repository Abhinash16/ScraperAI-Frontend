<template>
  <div>
    <v-text-field
      :value="value"
      :label="label"
      :type="show ? 'text' : 'password'"
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
          <v-icon small>{{ show ? "$eye-off" : "$eye" }}</v-icon>
        </v-btn>
        <v-btn small text color="primary" class="ml-1 px-2" @click="generate">
          <v-icon small class="mr-1">$wand-sparkles</v-icon> Generate
        </v-btn>
      </template>
    </v-text-field>

    <div v-if="value" class="d-flex align-center mt-2">
      <div class="strength-bar mr-2">
        <div
          v-for="i in 4"
          :key="i"
          :class="['strength-seg', i <= strength.score ? strength.color : 'grey lighten-3']"
        />
      </div>
      <span :class="['text-caption', `${strength.color.split(' ')[0]}--text`]">
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

<style scoped>
.strength-bar {
  display: flex;
  gap: 4px;
  width: 120px;
}

.strength-seg {
  flex: 1;
  height: 4px;
  border-radius: 2px;
}
</style>
