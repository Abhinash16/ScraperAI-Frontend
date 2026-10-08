<template>
  <v-card outlined rounded="lg">
    <div class="d-flex align-center px-5 py-4">
      <v-avatar size="40" tile color="green lighten-5" class="rounded-lg mr-3 flex-shrink-0">
        <v-icon size="20" color="green darken-1">$play</v-icon>
      </v-avatar>
      <div>
        <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Try it</div>
        <div class="text-caption grey--text text--darken-1">
          Calls your API with the settings above, including unsaved changes, and shows each step:
          what we sent, what came back, how it maps to our format, and what the AI sees. It also
          checks your full listing.
        </div>
      </div>
    </div>
    <v-divider />

    <div class="pa-5">
      <v-form class="d-flex align-start" @submit.prevent="run">
        <v-text-field
          v-model.trim="query"
          label="Search for"
          placeholder="activa ev"
          prepend-inner-icon="$search"
          outlined
          dense
          class="mr-2"
          autocomplete="off"
        />
        <v-btn
          color="success"
          depressed
          height="40"
          type="submit"
          :loading="running"
          :disabled="running || !query"
        >
          <v-icon left size="16">$play</v-icon>
          Try it
        </v-btn>
      </v-form>

      <v-alert v-if="error" type="error" text dense rounded="lg" class="text-body-2 mt-2 mb-0">
        {{ error }}
      </v-alert>

      <template v-if="result">
        <!-- Listing check -->
        <template v-if="listing">
          <v-sheet
            v-if="listing.ok === false"
            rounded="lg"
            color="red lighten-5"
            class="d-flex align-center px-4 py-3 mb-3"
          >
            <v-icon size="18" color="error" class="mr-3">$circle-alert</v-icon>
            <span class="text-body-2 grey--text text--darken-3">Full listing failed: {{ listing.error }}</span>
          </v-sheet>
          <template v-else>
            <v-sheet
              rounded="lg"
              :color="listingGood ? 'green lighten-5' : 'amber lighten-5'"
              class="d-flex align-center flex-wrap px-4 py-3 mb-3"
            >
              <v-icon size="18" :color="listingGood ? 'success' : 'amber darken-2'" class="mr-3">
                {{ listingGood ? "$circle-check" : "$triangle-alert" }}
              </v-icon>
              <span class="text-body-2 font-weight-bold grey--text text--darken-3 mr-3">Full listing</span>
              <v-chip x-small label class="font-weight-bold mr-1 my-1">{{ listing.items }} products</v-chip>
              <v-chip x-small label class="font-weight-bold mr-1 my-1">{{ listing.withPrices }} with prices</v-chip>
              <v-chip x-small label class="font-weight-bold my-1">
                {{ listing.withAvailability }} with stock status
              </v-chip>
            </v-sheet>
            <v-alert
              v-if="listing.items && !listing.withAvailability"
              type="warning"
              text
              dense
              rounded="lg"
              class="text-body-2 mb-3"
            >
              Your full listing has no stock status, so the bot can't answer "what's available?".
            </v-alert>
            <v-alert
              v-if="listing.items && !listing.withPrices"
              type="warning"
              text
              dense
              rounded="lg"
              class="text-body-2 mb-3"
            >
              Your full listing has no prices, so the bot can't compare or quote prices across
              products.
            </v-alert>
          </template>
        </template>

        <!-- Call result -->
        <div class="d-flex flex-wrap align-center mb-2">
          <v-chip
            small
            label
            :color="result.ok ? 'success' : 'error'"
            text-color="white"
            class="font-weight-bold mr-2 my-1"
          >
            <v-icon left size="14">{{ result.ok ? "$circle-check" : "$circle-x" }}</v-icon>
            {{ result.ok ? "Call worked" : "Call failed" }}
          </v-chip>
          <span v-if="result.ms != null" class="d-inline-flex align-center text-body-2 grey--text text--darken-1 mr-3">
            <v-icon size="14" class="mr-1">$clock</v-icon>
            {{ result.ms }} ms
          </span>
          <span v-if="result.found != null" class="text-body-2 grey--text text--darken-3">
            {{ result.found }} found · {{ products.length }} after mapping
          </span>
        </div>
        <div v-if="result.error" class="text-body-2 error--text mb-2">{{ result.error }}</div>

        <v-tabs v-model="tab" color="primary" background-color="transparent" height="40" slider-size="3" show-arrows>
          <v-tab class="text-body-2 font-weight-bold">Request</v-tab>
          <v-tab class="text-body-2 font-weight-bold">Their response</v-tab>
          <v-tab class="text-body-2 font-weight-bold">After mapping</v-tab>
          <v-tab class="text-body-2 font-weight-bold">What the AI sees</v-tab>
        </v-tabs>
        <v-divider class="mb-3" />

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
              <pre class="ma-0 text-pre-wrap text-break">{{ result.raw.preview }}</pre>
            </template>
            <JsonTree v-else-if="result.raw != null" :value="result.raw" />
            <div v-else class="text-caption grey--text">No response</div>
          </OutputPanel>
        </template>

        <OutputPanel
          v-if="tab === 2"
          title="Products after mapping"
          subtitle="In our format. This is what the bot uses."
          :copy-text="json(products)"
        >
          <JsonTree v-if="products.length" :value="products" />
          <div v-else class="text-caption grey--text">No products</div>
        </OutputPanel>

        <OutputPanel
          v-if="tab === 3"
          title="What the AI sees"
          subtitle="This exact text is added to the AI's instructions."
          :copy-text="result.aiText || ''"
        >
          <pre v-if="result.aiText" class="ma-0 text-pre-wrap text-break">{{ result.aiText }}</pre>
          <div v-else class="text-caption grey--text">(nothing)</div>
        </OutputPanel>
      </template>
    </div>
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
