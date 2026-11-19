<template>
  <div class="d-flex align-start mb-4">
    <v-icon size="18" color="primary" class="mr-2 mt-1">{{ icon }}</v-icon>
    <div class="flex-grow-1">
      <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4">{{ title }}</div>
      <div v-if="text" class="text-body-2 grey--text text--darken-1">{{ text }}</div>
    </div>
    <div v-if="$slots.default" class="ml-2"><slot /></div>
  </div>
</template>

<script>
// Heading of a card section on the action editor, with an optional control on the right.
export default {
  name: "SectionTitle",

  props: {
    icon: { type: String, required: true },
    title: { type: String, required: true },
    text: { type: String, default: "" },
  },
};
</script>
