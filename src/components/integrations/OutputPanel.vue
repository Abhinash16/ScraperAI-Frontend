<template>
  <div class="d-flex flex-column fill-height">
    <div class="d-flex align-start mb-2">
      <div class="flex-grow-1">
        <div class="text-caption font-weight-bold text-uppercase grey--text">{{ title }}</div>
        <div v-if="subtitle" class="text-caption grey--text text--darken-1">{{ subtitle }}</div>
      </div>
      <v-btn v-if="copyText" x-small text color="primary" class="ml-2" @click="copy">
        <v-icon left size="12">$copy</v-icon>
        Copy
      </v-btn>
    </div>
    <v-sheet
      color="grey darken-4"
      dark
      rounded="lg"
      max-height="420"
      class="output-box flex-grow-1 overflow-y-auto text-body-2 pa-4"
    >
      <slot />
    </v-sheet>
  </div>
</template>

<script>
// A titled dark output box with an optional Copy button.
export default {
  name: "OutputPanel",

  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: "" },
    copyText: { type: String, default: "" },
  },

  methods: {
    async copy() {
      try {
        await navigator.clipboard.writeText(this.copyText);
        this.$toast.success("Copied");
      } catch {
        this.$toast.error("Couldn't copy to clipboard");
      }
    },
  },
};
</script>

<style scoped>
/* Text passed in by other components (AI context, raw responses) */
.output-box ::v-deep pre {
  margin: 0;
  font-size: 12.5px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
