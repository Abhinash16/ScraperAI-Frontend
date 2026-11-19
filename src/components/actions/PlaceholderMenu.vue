<template>
  <v-menu offset-y left max-height="320">
    <template #activator="{ on, attrs }">
      <v-btn icon x-small title="Insert a placeholder" v-bind="attrs" v-on="on">
        <v-icon size="16">$braces</v-icon>
      </v-btn>
    </template>
    <v-list dense>
      <v-subheader>Insert a placeholder</v-subheader>
      <v-list-item v-for="p in items" :key="p.value" @click="$emit('pick', p.value)">
        <v-list-item-content>
          <v-list-item-title><code>{{ p.value }}</code></v-list-item-title>
          <v-list-item-subtitle v-if="p.hint">{{ p.hint }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
// A small {…} button listing placeholders; emits "pick" with the one chosen.
export default {
  name: "PlaceholderMenu",

  props: {
    // [{ value: "{{phone}}", hint }] or ["{{phone}}"]
    placeholders: { type: Array, required: true },
  },

  computed: {
    items() {
      return this.placeholders.map((p) => (typeof p === "string" ? { value: p } : p));
    },
  },
};
</script>
