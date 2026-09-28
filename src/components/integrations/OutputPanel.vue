<template>
  <div class="output-panel">
    <div class="d-flex align-start mb-2">
      <div class="flex-grow-1">
        <div class="output-title">{{ title }}</div>
        <div v-if="subtitle" class="text-caption grey--text text--darken-1">
          {{ subtitle }}
        </div>
      </div>
      <v-btn
        v-if="copyText"
        x-small
        text
        rounded
        color="primary"
        class="ml-2"
        @click="copy"
      >
        <v-icon x-small class="mr-1">mdi-content-copy</v-icon> Copy
      </v-btn>
    </div>
    <div class="output-box">
      <slot />
    </div>
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
.output-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.output-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
}

.output-box {
  flex: 1 1 auto;
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px 16px;
  border-radius: 12px;
  max-height: 420px;
  overflow: auto;
}

.output-box ::v-deep pre {
  margin: 0;
  font-family: monospace;
  font-size: 12.5px;
  white-space: pre-wrap;
  word-break: break-word;
}

.output-box ::v-deep .output-empty {
  color: #94a3b8;
  font-style: italic;
  font-size: 13px;
}
</style>
