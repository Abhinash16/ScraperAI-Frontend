<template>
  <v-dialog :value="value" max-width="420" @input="$emit('input', $event)">
    <v-card rounded="lg" class="pa-2">
      <v-card-title class="d-flex align-center text-h6 font-weight-bold">
        <v-avatar size="36" :color="`${color} lighten-5`" class="mr-3">
          <v-icon small :color="color">{{ icon }}</v-icon>
        </v-avatar>
        {{ title }}
      </v-card-title>
      <v-card-text class="text-body-2">
        <slot>{{ text }}</slot>
      </v-card-text>
      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <v-btn text rounded :disabled="loading" @click="$emit('input', false)">
          Cancel
        </v-btn>
        <v-btn
          depressed
          rounded
          :color="color"
          :loading="loading"
          @click="$emit('confirm')"
        >
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
