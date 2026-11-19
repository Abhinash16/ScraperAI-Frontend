<template>
  <div>
    <div v-if="!steps || !steps.length" class="text-body-2 grey--text">No requests were sent.</div>
    <v-sheet
      v-for="(s, i) in steps"
      :key="i"
      outlined
      rounded="lg"
      class="mb-2 step-sheet"
    >
      <div class="d-flex align-center px-3 py-2 step-head" @click="toggle(i)">
        <v-icon size="16" :color="s.ok ? 'success' : 'error'" class="mr-2">
          {{ s.ok ? "$circle-check" : "$circle-alert" }}
        </v-icon>
        <span class="text-body-2 font-weight-medium">{{ stepLabel(s.step) }}</span>
        <v-chip v-if="s.status" x-small label class="ml-2" :color="s.ok ? 'green lighten-5' : 'red lighten-5'">
          HTTP {{ s.status }}
        </v-chip>
        <span v-if="s.ms != null" class="text-caption grey--text ml-2">{{ s.ms }} ms</span>
        <v-spacer />
        <v-icon size="16">{{ open[i] ? "$chevron-up" : "$chevron-down" }}</v-icon>
      </div>
      <div v-if="s.error" class="px-3 pb-2 text-body-2 error--text">{{ s.error }}</div>
      <div v-if="open[i]" class="px-3 pb-3">
        <div class="text-caption grey--text mb-1">Request we sent (secrets hidden)</div>
        <div v-if="s.request" class="text-caption mb-1">
          <code>{{ s.request.method }} {{ s.request.url }}</code>
        </div>
        <JsonTree
          v-if="s.request && (s.request.params || s.request.data)"
          :value="s.request.data || s.request.params"
          :expand-depth="3"
        />
      </div>
    </v-sheet>
  </div>
</template>

<script>
import JsonTree from "@/components/integrations/JsonTree.vue";

// The requests an action run sent to the client's API: [{ step, ok, ms, status, error, request }]
export default {
  name: "ActionSteps",

  components: { JsonTree },

  props: {
    steps: { type: Array, default: () => [] },
  },

  data: () => ({ open: {} }),

  watch: {
    steps() {
      this.open = {};
    },
  },

  methods: {
    toggle(i) {
      this.$set(this.open, i, !this.open[i]);
    },
    stepLabel(step) {
      return { quote: "Price check", create: "Create the link" }[step] || step;
    },
  },
};
</script>

<style scoped>
.step-head {
  cursor: pointer;
}
</style>
