<template>
  <div class="live-trace">
    <button type="button" class="trace-toggle" @click="open = !open">
      <v-icon x-small class="mr-1">
        {{ open ? "$chevron-up" : "$chevron-down" }}
      </v-icon>
      Why this answer
    </button>

    <v-expand-transition>
      <div v-if="open" class="trace-body mt-2">
        <TraceDetails :trace-id="traceId" />
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import TraceDetails from "@/components/traces/TraceDetails.vue";

// "Why this answer" under a live bot reply. Loads the trace on first open.
export default {
  name: "LiveTrace",

  components: { TraceDetails },

  props: {
    traceId: { type: String, required: true },
  },

  data: () => ({ open: false }),
};
</script>

<style scoped>
.trace-toggle {
  font-size: 12px;
  font-weight: 600;
  color: var(--v-primary-base);
  display: inline-flex;
  align-items: center;
}

.trace-body {
  background: #fff;
  border: 1px solid #e4e8f2;
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 13px;
  text-align: left;
}
</style>
