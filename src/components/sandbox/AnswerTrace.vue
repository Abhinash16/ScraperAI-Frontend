<template>
  <div class="answer-trace">
    <button type="button" class="trace-toggle" @click="open = !open">
      <v-icon x-small class="mr-1">
        {{ open ? "$chevron-up" : "$chevron-down" }}
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
            <span class="mr-4">
              {{ tokens }}
              <span v-if="tokensFirstCall !== undefined" class="grey--text">
                (+{{ tokensFirstCall }} before the tool call)
              </span>
            </span>
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
            <span class="trace-label">
              {{ queries.length > 1 ? "Searches" : "Query" }}
            </span>
            <template v-if="queries.length">
              <code v-for="(q, i) in queries" :key="i" class="mr-1">{{ q }}</code>
            </template>
            <span v-else>—</span>
          </div>
          <div v-if="catalogMatches.length" class="trace-row">
            <span class="trace-label">Catalog</span>
            <v-chip
              v-for="(m, i) in catalogMatches"
              :key="m.sku || i"
              x-small
              outlined
              color="primary"
              class="mr-1 my-1"
            >
              {{ matchLabel(m) }}
            </v-chip>
          </div>
          <pre
            v-if="product.products !== undefined"
            class="trace-pre"
          >{{ formatJson(product.products) }}</pre>
        </template>

        <!-- AI tool calls -->
        <template v-if="toolCalls.length">
          <div class="trace-heading">AI tool calls</div>
          <div v-for="(call, i) in toolCalls" :key="i" class="tool-call">
            <button
              type="button"
              class="tool-toggle"
              @click="toggleTool(i)"
            >
              <v-icon x-small class="mr-1">
                {{ openTools.includes(i) ? "$chevron-down" : "$chevron-right" }}
              </v-icon>
              🔧 AI searched: '{{ call.query }}' →
              <span :class="['ml-1', toolModeClass(call.mode)]">
                {{ call.mode }}
              </span>
              <span class="grey--text ml-1">
                ({{ (call.products || []).length }}
                {{ (call.products || []).length === 1 ? "product" : "products" }})
              </span>
            </button>
            <div v-if="call.error" class="text-caption error--text ml-4">
              {{ call.error }}
            </div>
            <pre
              v-if="openTools.includes(i)"
              class="trace-pre"
            >{{ formatJson(call.products || []) }}</pre>
          </div>
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

        <v-alert
          v-if="trace.knowledgeGap"
          type="warning"
          text
          dense
          rounded="lg"
          class="text-caption my-2"
        >
          The bot said it couldn't answer this from your knowledge, so it was
          logged as a knowledge gap.
        </v-alert>

        <!-- Retrieval: what was searched and which blocks came back -->
        <template v-if="retrieval">
          <div class="trace-heading">Search</div>
          <div v-if="retrieval.query" class="trace-row">
            <span class="trace-label">Searched for</span>
            <span class="mr-2">"{{ retrieval.query }}"</span>
            <v-chip
              v-if="retrieval.rewritten"
              x-small
              outlined
              color="primary"
              title="A follow-up question, rewritten so it makes sense on its own"
            >
              rewritten
            </v-chip>
          </div>
          <div v-if="pricingLabel" class="trace-row">
            <span class="trace-label">Prices from</span>
            <span>{{ pricingLabel }}</span>
          </div>
          <div v-if="blocks.length" class="blocks mt-1">
            <div
              v-for="b in blocks"
              :key="b.key"
              :class="['block-row', { cited: isCited(b) }]"
            >
              <span class="block-key">{{ b.key }}</span>
              <span class="mr-2">{{ blockType(b) }}</span>
              <span class="grey--text mr-2">
                {{ b.vectorScore != null ? `meaning ${b.vectorScore.toFixed(2)}` : "keyword only" }}
                · {{ b.keywordRank != null ? `keyword #${b.keywordRank}` : "meaning only" }}
              </span>
              <v-chip v-if="isCited(b)" x-small color="success" text-color="white">
                Used in the answer
              </v-chip>
            </div>
          </div>
        </template>
        <div v-else-if="citations.length" class="trace-row mt-2">
          <span class="trace-label">Used in the answer</span>
          <span>{{ citations.join(", ") }}</span>
        </div>

        <!-- Matched FAQs (curated answers, used ahead of website text) -->
        <template v-if="curated">
          <div class="trace-heading">
            Matched FAQs
            <span v-if="curatedScores.length" class="grey--text">
              (match {{ curatedScores.map((s) => s.toFixed(2)).join(", ") }})
            </span>
          </div>
          <pre v-if="curated.text" class="trace-pre">{{ curated.text }}</pre>
          <div v-else class="text-caption grey--text">No FAQ matched.</div>
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
import { productModeInfo, catalogMatchLabel } from "@/utils/productModes";

export default {
  name: "AnswerTrace",

  props: {
    trace: { type: Object, required: true },
  },

  data: () => ({ open: false, openTools: [] }),

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
    retrieval() {
      return this.trace.retrieval || null;
    },
    blocks() {
      return Array.isArray(this.retrieval?.blocks) ? this.retrieval.blocks : [];
    },
    citations() {
      return Array.isArray(this.trace.citations) ? this.trace.citations : [];
    },
    pricingLabel() {
      return {
        knowledge: "Knowledge (FAQs, notes and pages)",
        live_only: "Live product data only",
      }[this.trace.pricing] || "";
    },
    // null when no FAQ matched; missing on older traces
    curated() {
      return this.trace.curatedAnswers;
    },
    curatedScores() {
      const scores = this.curated?.scores;
      return Array.isArray(scores) ? scores.filter((s) => typeof s === "number") : [];
    },
    modeInfo() {
      return productModeInfo(this.product?.mode);
    },
    queries() {
      const list = this.product?.queries;
      if (Array.isArray(list)) return list.filter(Boolean);
      return this.product?.query ? [this.product.query] : [];
    },
    catalogMatches() {
      const list = this.product?.catalogMatches;
      return Array.isArray(list) ? list : [];
    },
    toolCalls() {
      return Array.isArray(this.trace.toolCalls) ? this.trace.toolCalls : [];
    },
    tokensFirstCall() {
      return this.trace.tokensFirstCall?.total_tokens;
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
    isCited(block) {
      return this.citations.includes(block.key);
    },

    blockType(block) {
      const label = { faq: "FAQ", note: "Note", page: "Website page" }[block.type] || block.type;
      return block.curated && block.type !== "faq" ? `${label} (curated)` : label;
    },

    matchLabel(match) {
      return catalogMatchLabel(match);
    },
    toolModeClass(mode) {
      return (
        {
          live: "success--text",
          no_match: "amber--text text--darken-3",
          unavailable: "error--text",
        }[mode] || "grey--text"
      );
    },
    toggleTool(i) {
      this.openTools = this.openTools.includes(i)
        ? this.openTools.filter((x) => x !== i)
        : [...this.openTools, i];
    },
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

.blocks {
  border: 1px solid #eef1f7;
  border-radius: 8px;
  padding: 4px 8px;
}

.block-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  padding: 3px 0;
  font-size: 12px;
}

.block-row.cited {
  font-weight: 600;
}

.block-key {
  font-family: monospace;
  background: #eef0ff;
  border-radius: 4px;
  padding: 0 5px;
  margin-right: 8px;
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

.tool-call {
  margin-bottom: 6px;
}

.tool-toggle {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  text-align: left;
  font-size: 13px;
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
