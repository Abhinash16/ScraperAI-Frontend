<template>
  <div class="answer-trace">
    <button type="button" class="trace-toggle" @click="open = !open">
      <v-icon x-small class="mr-1">
        {{ open ? "mdi-chevron-up" : "mdi-chevron-down" }}
      </v-icon>
      Why this answer
    </button>

    <v-expand-transition>
      <div v-if="open" class="trace-body mt-2">
        <!-- Intent -->
        <div class="trace-row">
          <span class="trace-label">Intent</span>
          <span>{{ trace.intent || "—" }}</span>
          <template v-if="trace.confidence !== undefined">
            <span class="trace-label ml-4">Confidence</span>
            <span>{{ formatConfidence(trace.confidence) }}</span>
          </template>
        </div>

        <div v-if="tokens !== undefined || trace.model" class="trace-row">
          <template v-if="tokens !== undefined">
            <span class="trace-label">Tokens</span>
            <span class="mr-4">{{ tokens }}</span>
          </template>
          <template v-if="trace.model">
            <span class="trace-label">Model</span>
            <span>{{ trace.model }}</span>
          </template>
        </div>

        <v-alert
          v-if="trace.error"
          type="error"
          text
          dense
          rounded="lg"
          class="text-caption my-2"
        >
          {{ trace.error }}
        </v-alert>

        <v-alert
          v-if="webhookIntent"
          type="info"
          text
          dense
          rounded="lg"
          class="text-caption my-2"
        >
          In production this would have triggered the '{{ webhookIntent }}'
          webhook.
        </v-alert>

        <!-- Product lookup -->
        <template v-if="product">
          <div class="trace-heading">Product lookup</div>
          <div class="trace-row">
            <v-chip x-small dark :color="modeInfo.color" class="mr-2">
              {{ modeInfo.label }}
            </v-chip>
            <span class="trace-label">Query</span>
            <code v-if="product.query">{{ product.query }}</code>
            <span v-else>—</span>
          </div>
          <pre
            v-if="product.products !== undefined"
            class="trace-pre"
          >{{ formatJson(product.products) }}</pre>
        </template>

        <!-- Customer -->
        <template v-if="customer">
          <div class="trace-heading">Customer</div>
          <div v-if="customer.apiConfigured === false" class="trace-row">
            <span class="grey--text">Customer API not configured</span>
          </div>
          <div v-else class="trace-row">
            <span class="trace-label">Found</span>
            <span :class="customer.found ? 'success--text' : 'grey--text'">
              {{ customer.found ? "Yes" : "No" }}
            </span>
            <template v-if="customer.phone">
              <span class="trace-label ml-4">Phone</span>
              <span>{{ customer.phone }}</span>
            </template>
          </div>
          <pre v-if="customer.aiContext" class="trace-pre">{{
            formatText(customer.aiContext)
          }}</pre>
        </template>

        <!-- Website knowledge -->
        <template v-if="knowledge">
          <div class="trace-heading">
            Website knowledge
            <span class="grey--text">
              ({{ chunkCount }} {{ chunkCount === 1 ? "chunk" : "chunks" }})
            </span>
          </div>
          <pre v-if="knowledge.text" class="trace-pre">{{ knowledge.text }}</pre>
          <div v-else class="text-caption grey--text">No knowledge used.</div>
        </template>
      </div>
    </v-expand-transition>
  </div>
</template>

<script>
import { productModeInfo } from "@/utils/productModes";

export default {
  name: "AnswerTrace",

  props: {
    trace: { type: Object, required: true },
  },

  data: () => ({ open: false }),

  computed: {
    product() {
      return this.trace.productLookup;
    },
    customer() {
      return this.trace.customer;
    },
    knowledge() {
      return this.trace.websiteKnowledge;
    },
    modeInfo() {
      return productModeInfo(this.product?.mode);
    },
    chunkCount() {
      return (this.knowledge?.chunkIds || []).length;
    },
    tokens() {
      return this.trace.tokens?.total_tokens;
    },
    webhookIntent() {
      const skipped = this.trace.webhookSkipped;
      if (!skipped) return "";
      if (typeof skipped === "string") return skipped;
      return skipped.intent || this.trace.intent || "unknown";
    },
  },

  methods: {
    formatConfidence(value) {
      return typeof value === "number" && value <= 1
        ? `${Math.round(value * 100)}%`
        : value;
    },
    formatJson(value) {
      return JSON.stringify(value, null, 2);
    },
    formatText(value) {
      return typeof value === "string" ? value : JSON.stringify(value, null, 2);
    },
  },
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
}

.trace-heading {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #757575;
  margin: 12px 0 6px;
}

.trace-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 4px;
}

.trace-label {
  color: #757575;
  margin-right: 6px;
}

.trace-pre {
  background: #0f172a;
  color: #e2e8f0;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 260px;
  overflow: auto;
  margin: 4px 0 0;
}
</style>
