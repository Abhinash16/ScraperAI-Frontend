<template>
  <v-card outlined rounded="lg" class="pa-6">
    <div class="d-flex align-center mb-1">
      <v-icon small class="mr-2">$play</v-icon>
      <div class="text-subtitle-1 font-weight-bold">Try it</div>
    </div>
    <div class="text-body-2 grey--text text--darken-1 mb-4">
      Calls your API with the settings above, including unsaved changes, and
      shows each step: what we sent, what came back, how it maps to our
      format, and what the AI sees. It also checks your full listing.
    </div>

    <v-form class="d-flex align-start" @submit.prevent="run">
      <v-text-field
        v-model.trim="query"
        label="Search for"
        placeholder="activa ev"
        outlined
        dense
        class="mr-2"
        autocomplete="off"
      />
      <v-btn
        color="primary"
        rounded
        depressed
        height="40"
        type="submit"
        :loading="running"
        :disabled="running || !query"
      >
        Try it
      </v-btn>
    </v-form>

    <v-alert v-if="error" type="error" text dense rounded="lg" class="text-body-2 mt-2 mb-0">
      {{ error }}
    </v-alert>

    <template v-if="result">
      <!-- Listing check -->
      <div v-if="listing" class="mt-2 mb-3">
        <div v-if="listing.ok === false" class="text-body-2 error--text">
          <v-icon x-small color="error" class="mr-1">$circle-alert</v-icon>
          Full listing failed: {{ listing.error }}
        </div>
        <template v-else>
          <div class="text-body-2">
            <v-icon x-small :color="listingGood ? 'success' : 'warning'" class="mr-1">
              {{ listingGood ? "$circle-check" : "$triangle-alert" }}
            </v-icon>
            Full listing: {{ listing.items }} products · {{ listing.withPrices }}
            with prices · {{ listing.withAvailability }} with stock status
          </div>
          <v-alert
            v-if="listing.items && !listing.withAvailability"
            type="warning"
            text
            dense
            rounded="lg"
            class="text-body-2 mt-2 mb-0"
          >
            Your full listing has no stock status, so the bot can't answer
            "what's available?".
          </v-alert>
          <v-alert
            v-if="listing.items && !listing.withPrices"
            type="warning"
            text
            dense
            rounded="lg"
            class="text-body-2 mt-2 mb-0"
          >
            Your full listing has no prices, so the bot can't compare or quote
            prices across products.
          </v-alert>
        </template>
      </div>

      <div class="text-body-2 mb-2">
        <v-chip small dark :color="result.ok ? 'success' : 'error'" class="mr-2">
          {{ result.ok ? "Call worked" : "Call failed" }}
        </v-chip>
        <span v-if="result.ms != null" class="grey--text text--darken-1 mr-2">{{ result.ms }} ms</span>
        <span v-if="result.found != null">
          {{ result.found }} found · {{ products.length }} after mapping
        </span>
      </div>
      <div v-if="result.error" class="text-body-2 error--text mb-2">{{ result.error }}</div>

      <v-tabs v-model="tab" color="primary" show-arrows class="mb-3">
        <v-tab class="text-none">Request</v-tab>
        <v-tab class="text-none">Their response</v-tab>
        <v-tab class="text-none">After mapping</v-tab>
        <v-tab class="text-none">What the AI sees</v-tab>
      </v-tabs>

      <OutputPanel
        v-if="tab === 0"
        title="What we sent"
        subtitle="Secrets are masked."
        :copy-text="json(result.request)"
      >
        <JsonTree :value="result.request" />
      </OutputPanel>

      <template v-if="tab === 1">
        <OutputPanel
          v-if="result.firstRawItem"
          title="First product, as your API sends it"
          subtitle="Use these field names in the mapping above."
          :copy-text="json(result.firstRawItem)"
          class="mb-4"
        >
          <JsonTree :value="result.firstRawItem" />
        </OutputPanel>
        <OutputPanel title="Full response" :copy-text="json(result.raw)">
          <template v-if="result.raw && result.raw.truncated">
            <div class="text-caption grey--text mb-1">Over 20 KB, so only the start is shown.</div>
            <pre>{{ result.raw.preview }}</pre>
          </template>
          <JsonTree v-else-if="result.raw != null" :value="result.raw" />
          <div v-else class="output-empty">No response</div>
        </OutputPanel>
      </template>

      <OutputPanel
        v-if="tab === 2"
        title="Products after mapping"
        subtitle="In our format. This is what the bot uses."
        :copy-text="json(products)"
      >
        <JsonTree v-if="products.length" :value="products" />
        <div v-else class="output-empty">No products</div>
      </OutputPanel>

      <OutputPanel
        v-if="tab === 3"
        title="What the AI sees"
        subtitle="This exact text is added to the AI's instructions."
        :copy-text="result.aiText || ''"
      >
        <pre v-if="result.aiText">{{ result.aiText }}</pre>
        <div v-else class="output-empty">(nothing)</div>
      </OutputPanel>
    </template>
  </v-card>
</template>

<script>
import apiClient from "@/service/axios";
import JsonTree from "@/components/integrations/JsonTree.vue";
import OutputPanel from "@/components/integrations/OutputPanel.vue";
import { apiError } from "@/utils/knowledge";

// "Try it" for the Product API: POST /preview with the unsaved form.
export default {
  name: "ProductApiPreview",

  components: { JsonTree, OutputPanel },

  props: {
    // () => { settings } | { error }: the current form, same shape as PUT
    getSettings: { type: Function, required: true },
  },

  data: () => ({ query: "", running: false, error: "", result: null, tab: 0 }),

  computed: {
    products() {
      return Array.isArray(this.result?.products) ? this.result.products : [];
    },
    listing() {
      return this.result?.listing || null;
    },
    listingGood() {
      const l = this.listing;
      return l && l.items > 0 && l.withPrices > 0 && l.withAvailability > 0;
    },
  },

  methods: {
    json(v) {
      return v == null ? "" : JSON.stringify(v, null, 2);
    },

    async run() {
      if (!this.query || this.running) return;
      const { settings, error } = this.getSettings();
      if (error) {
        this.error = error;
        return;
      }
      this.running = true;
      this.error = "";
      try {
        const { data } = await apiClient.post("/clients/product-api-settings/preview", {
          query: this.query,
          settings,
        });
        this.result = data.data || {};
        if (this.result.firstRawItem) this.$emit("first-item", this.result.firstRawItem);
      } catch (err) {
        this.result = null;
        this.error = apiError(err, "Preview failed");
      } finally {
        this.running = false;
      }
    },
  },
};
</script>

<style scoped>
pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.output-empty {
  color: #94a3b8;
  font-size: 13px;
}
</style>
