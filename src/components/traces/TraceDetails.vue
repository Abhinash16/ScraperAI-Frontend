<template>
  <div class="trace-details">
    <v-progress-linear v-if="loading" indeterminate color="primary" />

    <div v-else-if="loadError" class="text-caption grey--text text--darken-1">
      {{ loadError }}
    </div>

    <template v-else-if="data">
      <div v-if="showMessages" class="mb-3 text-body-2">
        <div class="detail-label">Customer</div>
        <div class="message-text mb-2">{{ data.customerText || "—" }}</div>
        <div class="detail-label">Bot</div>
        <div class="message-text">{{ data.reply || "—" }}</div>
      </div>

      <v-alert
        v-if="data.status === 'error'"
        type="error"
        text
        dense
        rounded="lg"
        class="text-caption mb-2"
      >
        {{ data.error || "This reply failed." }}
      </v-alert>

      <div class="summary text-caption mb-2">
        <span v-if="platform" class="mr-3">{{ platform }}</span>
        <span v-if="data.latencyMs != null" class="mr-3">
          <span class="grey--text">Time</span> {{ seconds(data.latencyMs) }}
        </span>
        <span v-if="data.tokens" class="mr-3">
          <span class="grey--text">Tokens</span> {{ data.tokens.total }}
        </span>
        <span v-if="data.costUsd != null" class="mr-3" title="Estimate from OpenAI list prices">
          <span class="grey--text">Cost</span> {{ cost(data.costUsd) }}
        </span>
        <span v-if="productLabel" class="mr-3">
          <span class="grey--text">Products</span> {{ productLabel }}
        </span>
        <span v-if="data.toolCalls" class="mr-3">
          {{ data.toolCalls }} AI {{ data.toolCalls === 1 ? "search" : "searches" }}
        </span>
        <span v-if="data.batchSize > 1" class="mr-3">
          Answered {{ data.batchSize }} messages together
        </span>
        <span v-if="data.holdingMessage && data.holdingMessage.sent" class="mr-3">
          Sent "let me check" first
        </span>
      </div>

      <div v-if="sourceNote" class="text-body-2">{{ sourceNote }}</div>

      <template v-if="data.trace">
        <div v-if="data.trace.truncated" class="text-caption grey--text mb-1">
          This answer's full details were too large to keep; only the summary
          is shown.
        </div>
        <AnswerTrace :trace="data.trace" embedded />
      </template>
    </template>
  </div>
</template>

<script>
import AnswerTrace from "@/components/sandbox/AnswerTrace.vue";
import { apiError } from "@/utils/knowledge";
import {
  fetchTrace,
  formatCost,
  formatSeconds,
  PLATFORMS,
  productLookupLabel,
  SOURCE_NOTES,
} from "@/utils/traces";

// The "Why this answer" details of one live reply, loaded by trace id.
export default {
  name: "TraceDetails",

  components: { AnswerTrace },

  props: {
    traceId: { type: String, required: true },
    // Show the customer's message and the reply (when opened outside the chat)
    showMessages: { type: Boolean, default: false },
  },

  data: () => ({ data: null, loading: false, loadError: "" }),

  computed: {
    platform() {
      return PLATFORMS[this.data?.platform] || "";
    },
    productLabel() {
      return productLookupLabel(this.data?.productLookup);
    },
    sourceNote() {
      return SOURCE_NOTES[this.data?.source] || "";
    },
  },

  watch: {
    traceId: { immediate: true, handler: "load" },
  },

  methods: {
    seconds: formatSeconds,
    cost: formatCost,

    async load() {
      this.loading = true;
      this.loadError = "";
      this.data = null;
      try {
        this.data = await fetchTrace(this.traceId);
      } catch (err) {
        this.loadError = apiError(err, "Couldn't load the details of this answer.");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.summary {
  display: flex;
  flex-wrap: wrap;
  row-gap: 2px;
}

.detail-label {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #757575;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
