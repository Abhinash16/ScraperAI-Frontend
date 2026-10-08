<template>
  <v-dialog :value="value" max-width="420" @input="$emit('input', $event)">
    <v-card rounded="lg">
      <v-card-text class="pt-6 text-center">
        <v-avatar size="56" :color="`${color} lighten-5`" class="mb-4">
          <v-icon size="26" :color="color">{{ icon }}</v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-2">{{ title }}</div>
        <div class="text-body-2 grey--text text--darken-1">
          <slot>{{ text }}</slot>
        </div>
      </v-card-text>
      <v-card-actions class="justify-center pb-5">
        <v-btn text :disabled="loading" @click="$emit('input', false)">Cancel</v-btn>
        <v-btn depressed :color="color" :loading="loading" @click="$emit('confirm')">
          {{ confirmLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
// Generic confirm dialog. v-model controls visibility; emits "confirm".
export default {
  name: "ConfirmDialog",

  props: {
    value: { type: Boolean, default: false },
    title: { type: String, required: true },
    text: { type: String, default: "" },
    confirmLabel: { type: String, default: "Confirm" },
    color: { type: String, default: "error" },
    icon: { type: String, default: "$triangle-alert" },
    loading: { type: Boolean, default: false },
  },
};
</script>
