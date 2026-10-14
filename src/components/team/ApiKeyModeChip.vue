<template>
  <v-chip
    x-small
    label
    :color="mode === 'test' ? 'amber lighten-4' : 'green lighten-5'"
    :text-color="mode === 'test' ? 'amber darken-4' : 'green darken-3'"
    class="font-weight-bold"
  >
    {{ mode === "test" ? "Test" : "Live" }}
  </v-chip>
</template>

<script>
// Live / Test chip for an API key (or a chat opened with a test key)
export default {
  name: "ApiKeyModeChip",

  props: {
    mode: { type: String, default: "live" },
  },
};
</script>
