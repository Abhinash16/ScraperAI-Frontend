<template>
  <div>
    <v-btn
      v-if="!embedded"
      x-small
      text
      color="primary"
      class="px-1"
      :aria-expanded="String(open)"
      @click="open = !open"
    >
      <v-icon left size="12">{{
        open ? "$chevron-up" : "$chevron-down"
      }}</v-icon>
      Why this answer
    </v-btn>

    <v-expand-transition>
      <v-sheet
        v-if="open"
        :outlined="!embedded"
        :rounded="embedded ? false : 'lg'"
        :class="embedded ? '' : 'pa-4 mt-2'"
        class="text-body-2"
      >
        <!-- Overview -->
        <v-row dense>
          <v-col v-for="f in overview" :key="f.label" cols="6" sm="3">
            <div class="text-caption grey--text">{{ f.label }}</div>
            <div
              class="text-body-2 font-weight-bold grey--text text--darken-4 text-break"
            >
              {{ f.value }}
            </div>
          </v-col>
        </v-row>
        <div
          v-if="tokensFirstCall !== undefined"
          class="text-caption grey--text mt-1"
        >
          +{{ tokensFirstCall }} tokens before the tool call
        </div>

        <v-alert
          v-if="trace.error"
          type="error"
          text
          dense
          rounded="lg"
          class="text-caption mt-3 mb-0"
        >
          {{ trace.error }}
        </v-alert>

        <v-alert
          v-if="webhookIntent"
          type="info"
          text
          dense
          rounded="lg"
          class="text-caption mt-3 mb-0"
        >
          In production this would have triggered the '{{ webhookIntent }}'
          webhook.
        </v-alert>

        <!-- Product lookup -->
        <template v-if="product">
          <div
            class="text-caption font-weight-bold text-uppercase grey--text mt-4 mb-2"
          >
            Product lookup
          </div>
          <div class="d-flex flex-wrap align-center mb-1">
            <v-chip
              x-small
              label
              dark
              :color="modeInfo.color"
              class="font-weight-bold mr-2"
            >
              {{ modeInfo.label }}
            </v-chip>
            <span class="grey--text mr-2">{{
              queries.length > 1 ? "Searches" : "Query"
            }}</span>
            <template v-if="queries.length">
              <v-chip
                v-for="(q, i) in queries"
                :key="i"
                x-small
                label
                color="grey lighten-4"
                class="mr-1 my-1"
              >
                {{ q }}
              </v-chip>
            </template>
            <span v-else>—</span>
          </div>
          <div v-if="stockLabel(product)" class="mb-1">
            <span class="grey--text mr-2">Stock</span>{{ stockLabel(product) }}
          </div>
          <div
            v-if="catalogMatches.length"
            class="d-flex flex-wrap align-center mb-1"
          >
            <span class="grey--text mr-2">Catalog</span>
            <v-chip
              v-for="(m, i) in catalogMatches"
              :key="m.sku || i"
              x-small
              label
              outlined
              color="primary"
              class="mr-1 my-1"
            >
              {{ matchLabel(m) }}
            </v-chip>
          </div>
          <v-sheet
            v-if="product.products !== undefined"
            color="grey darken-4"
            dark
            rounded="lg"
            max-height="260"
            class="overflow-y-auto pa-3 mt-1"
          >
            <pre class="text-caption text-pre-wrap text-break">{{
              formatJson(product.products)
            }}</pre>
          </v-sheet>
        </template>

        <!-- AI tool calls -->
        <template v-if="toolCalls.length">
          <div
            class="text-caption font-weight-bold text-uppercase grey--text mt-4 mb-2"
          >
            AI tool calls
          </div>
          <v-sheet
            v-for="(call, i) in toolCalls"
            :key="i"
            outlined
            rounded="lg"
            class="mb-2"
          >
            <div
              class="d-flex flex-wrap align-center px-3 py-2"
              role="button"
              tabindex="0"
              :aria-expanded="String(openTools.includes(i))"
              @click="toggleTool(i)"
              @keydown.enter.prevent="toggleTool(i)"
            >
              <v-icon size="14" class="mr-2">
                {{ openTools.includes(i) ? "$chevron-down" : "$chevron-right" }}
              </v-icon>
              <v-icon size="14" color="grey darken-1" class="mr-1"
                >$search</v-icon
              >
              <span class="mr-1">AI searched</span>
              <span class="font-weight-bold mr-1">'{{ call.query }}'</span>
              <v-icon size="12" class="mr-1">$arrow-right</v-icon>
              <span
                class="font-weight-bold mr-1"
                :class="toolModeClass(call.mode)"
              >
                {{ call.mode === "catalog" ? "In-stock list" : call.mode }}
              </span>
              <span v-if="stockLabel(call)" class="mr-1"
                >· {{ stockLabel(call) }}</span
              >
              <span class="grey--text">
                ({{ (call.products || []).length }}
                {{
                  (call.products || []).length === 1 ? "product" : "products"
                }})
              </span>
            </div>
            <div v-if="call.error" class="text-caption error--text px-3 pb-2">
              {{ call.error }}
            </div>
            <v-sheet
              v-if="openTools.includes(i)"
              color="grey darken-4"
              dark
              max-height="260"
              class="overflow-y-auto pa-3 rounded-b-lg"
            >
              <pre class="text-caption text-pre-wrap text-break">{{
                formatJson(call.products || [])
              }}</pre>
            </v-sheet>
          </v-sheet>
        </template>

        <!-- Notices (closures, special hours, offers) the bot was told -->
        <template v-if="trace.notices">
          <div
            class="text-caption font-weight-bold text-uppercase grey--text mt-4 mb-2"
          >
            Notices the bot knew
          </div>
          <v-sheet
            color="grey lighten-5"
            rounded="lg"
            max-height="260"
            class="overflow-y-auto pa-3"
          >
            <pre class="text-caption text-pre-wrap text-break">{{
              trace.notices
            }}</pre>
          </v-sheet>
        </template>

        <!-- What the bot remembered from this customer's last conversation -->
        <template v-if="trace.memory">
          <div
            class="text-caption font-weight-bold text-uppercase grey--text mt-4 mb-2"
          >
            Remembered from the last conversation
          </div>
          <v-sheet
            color="grey lighten-5"
            rounded="lg"
            max-height="260"
            class="overflow-y-auto pa-3"
          >
            <pre class="text-caption text-pre-wrap text-break">{{
              trace.memory
            }}</pre>
          </v-sheet>
        </template>

        <!-- Customer -->
        <template v-if="customer">
          <div
            class="text-caption font-weight-bold text-uppercase grey--text mt-4 mb-2"
          >
            Customer
          </div>
          <div v-if="customer.apiConfigured === false" class="grey--text">
            Customer API not configured
          </div>
          <div v-else class="d-flex flex-wrap align-center mb-1">
            <span class="grey--text mr-2">Found</span>
            <v-chip
              x-small
              label
              :color="customer.found ? 'success' : 'grey'"
              text-color="white"
              class="font-weight-bold mr-4"
            >
              {{ customer.found ? "Yes" : "No" }}
            </v-chip>
            <template v-if="customer.phone">
              <span class="grey--text mr-2">Phone</span>
              <span>{{ customer.phone }}</span>
            </template>
          </div>
          <v-sheet
            v-if="customer.aiContext"
            color="grey lighten-5"
            rounded="lg"
            max-height="260"
            class="overflow-y-auto pa-3 mt-1"
          >
            <pre class="text-caption text-pre-wrap text-break">{{
              formatText(customer.aiContext)
            }}</pre>
          </v-sheet>
        </template>

        <v-alert
          v-if="trace.knowledgeGap"
          type="warning"
          text
          dense
          rounded="lg"
          class="text-caption mt-3 mb-0"
        >
          The bot said it couldn't answer this from your knowledge, so it was
          logged as a knowledge gap.
        </v-alert>

        <!-- Retrieval: what was searched and which blocks came back -->
        <template v-if="retrieval">
          <div
            class="text-caption font-weight-bold text-uppercase grey--text mt-4 mb-2"
          >
            Search
          </div>
          <div
            v-if="retrieval.query"
            class="d-flex flex-wrap align-center mb-1"
          >
            <span class="grey--text mr-2">Searched for</span>
            <span class="font-weight-bold mr-2">"{{ retrieval.query }}"</span>
            <v-chip
              v-if="retrieval.rewritten"
              x-small
              label
              outlined
              color="primary"
              title="A follow-up question, rewritten so it makes sense on its own"
            >
              rewritten
            </v-chip>
          </div>
          <div v-if="retrieval.mode" class="mb-1">
            <span class="grey--text mr-2">Knowledge</span>
            {{ retrieval.mode === "staging" ? "New setup (staging)" : "Live" }}
          </div>
          <div v-if="pricingLabel" class="mb-1">
            <span class="grey--text mr-2">Prices from</span>{{ pricingLabel }}
          </div>
          <v-sheet v-if="blocks.length" outlined rounded="lg" class="mt-2">
            <template v-for="(b, i) in blocks">
              <v-divider v-if="i > 0" :key="`d-${b.key}`" />
              <div
                :key="b.key"
                class="d-flex flex-wrap align-center text-caption px-3 py-2"
                :class="isCited(b) ? 'green lighten-5' : ''"
              >
                <v-chip
                  x-small
                  label
                  color="primary lighten-5"
                  text-color="primary"
                  class="font-weight-bold mr-2"
                >
                  {{ b.key }}
                </v-chip>
                <span
                  class="mr-2"
                  :class="
                    isCited(b)
                      ? 'font-weight-bold grey--text text--darken-4'
                      : ''
                  "
                >
                  {{ blockType(b) }}
                </span>
                <span class="grey--text mr-2">{{ blockScores(b) }}</span>
                <v-spacer />
                <v-chip
                  v-if="isCited(b)"
                  x-small
                  label
                  color="success"
                  text-color="white"
                  class="font-weight-bold"
                >
                  <v-icon left size="10">$check</v-icon>
                  Used in the answer
                </v-chip>
              </div>
            </template>
          </v-sheet>
        </template>
        <div v-else-if="citations.length" class="mt-3">
          <span class="grey--text mr-2">Used in the answer</span
          >{{ citations.join(", ") }}
        </div>

        <!-- Matched FAQs (curated answers, used ahead of website text) -->
        <template v-if="curated">
          <div
            class="text-caption font-weight-bold text-uppercase grey--text mt-4 mb-2"
          >
            Matched FAQs
            <span
              v-if="curatedScores.length"
              class="text-none font-weight-regular"
            >
              (match {{ curatedScores.map((s) => s.toFixed(2)).join(", ") }})
            </span>
          </div>
          <v-sheet
            v-if="curated.text"
            color="grey lighten-5"
            rounded="lg"
            max-height="260"
            class="overflow-y-auto pa-3"
          >
            <pre class="text-caption text-pre-wrap text-break">{{
              curated.text
            }}</pre>
          </v-sheet>
          <div v-else class="text-caption grey--text">No FAQ matched.</div>
        </template>

        <!-- Website knowledge -->
        <template v-if="knowledge">
          <div
            class="text-caption font-weight-bold text-uppercase grey--text mt-4 mb-2"
          >
            Website knowledge
            <span class="text-none font-weight-regular">
              ({{ chunkCount }} {{ chunkCount === 1 ? "chunk" : "chunks" }})
            </span>
          </div>
          <v-sheet
            v-if="knowledge.text"
            color="grey lighten-5"
            rounded="lg"
            max-height="260"
            class="overflow-y-auto pa-3"
          >
            <pre class="text-caption text-pre-wrap text-break">{{
              knowledge.text
            }}</pre>
          </v-sheet>
          <div v-else class="text-caption grey--text">No knowledge used.</div>
        </template>
      </v-sheet>
    </v-expand-transition>
  </div>
</template>

<script>
import {
  productModeInfo,
  catalogMatchLabel,
  catalogStockLabel,
} from "@/utils/productModes";

export default {
  name: "AnswerTrace",

  props: {
    trace: { type: Object, required: true },
    // Inside another panel: always open, without the toggle
    embedded: { type: Boolean, default: false },
  },

  data() {
    return { open: this.embedded, openTools: [] };
  },

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
      return (
        {
          knowledge: "Knowledge (FAQs, notes and pages)",
          live_only: "Live product data only",
        }[this.trace.pricing] || ""
      );
    },
    // null when no FAQ matched; missing on older traces
    curated() {
      return this.trace.curatedAnswers;
    },
    curatedScores() {
      const scores = this.curated?.scores;
      return Array.isArray(scores)
        ? scores.filter((s) => typeof s === "number")
        : [];
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
    // Intent, confidence, tokens and model, shown as a small grid
    overview() {
      const list = [{ label: "Intent", value: this.trace.intent || "—" }];
      if (this.trace.confidence !== undefined) {
        list.push({
          label: "Confidence",
          value: this.formatConfidence(this.trace.confidence),
        });
      }
      if (this.tokens !== undefined)
        list.push({ label: "Tokens", value: this.tokens });
      if (this.trace.model)
        list.push({ label: "Model", value: this.trace.model });
      return list;
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
      const label =
        { faq: "FAQ", note: "Note", page: "Website page" }[block.type] ||
        block.type;
      return block.curated && block.type !== "faq"
        ? `${label} (curated)`
        : label;
    },

    blockScores(b) {
      const meaning =
        b.vectorScore != null
          ? `meaning ${b.vectorScore.toFixed(2)}`
          : "keyword only";
      const keyword =
        b.keywordRank != null ? `keyword #${b.keywordRank}` : "meaning only";
      return `${meaning} · ${keyword}`;
    },

    matchLabel(match) {
      return catalogMatchLabel(match);
    },
    stockLabel(result) {
      return catalogStockLabel(result);
    },
    toolModeClass(mode) {
      return (
        {
          live: "success--text",
          catalog: "teal--text",
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
