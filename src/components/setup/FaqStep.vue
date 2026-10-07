<template>
  <div>
    <div class="text-body-2 grey--text text--darken-1 mb-4">
      The AI reads your imported pages and suggests questions with exact
      answers. FAQ answers take priority over website text, so approve only
      the ones that are right.
    </div>

    <div class="d-flex align-start flex-wrap">
      <v-select
        v-model="websiteSourceId"
        :items="websiteSources"
        item-text="name"
        item-value="_id"
        label="Read from"
        :no-data-text="'Import your website first.'"
        outlined
        dense
        hide-details
        class="source-field mr-2 mb-2"
      />
      <v-btn
        depressed
        rounded
        height="40"
        class="text-none mb-2"
        :disabled="!websiteSourceId || running"
        :loading="starting"
        @click="start"
      >
        <v-icon small class="mr-1">$wand-sparkles</v-icon> Suggest FAQs
      </v-btn>
    </div>

    <v-alert v-if="error" type="error" dense outlined rounded="lg" class="mt-2 text-body-2">
      {{ error }}
    </v-alert>

    <template v-if="faqSource">
      <FaqExtractPanel
        :value="false"
        :source="faqSource"
        class="mt-3"
        @update="(s) => (faqSource = { ...faqSource, ...s })"
        @finished="$emit('changed')"
      />
      <v-card outlined rounded="lg" class="pa-3 d-flex align-center" :to="`/dashboard/knowledge/${faqSource._id}`">
        <v-icon class="mr-3" color="deep-purple">$message-circle-question-mark</v-icon>
        <div class="flex-grow-1">
          <div class="font-weight-medium">{{ faqSource.name }}</div>
          <div class="text-caption grey--text">
            {{ stat("itemCount") }} FAQs · {{ stat("publishedCount") }} approved. Open it to
            approve or reject the suggestions.
          </div>
        </div>
        <v-icon small color="grey">$chevron-right</v-icon>
      </v-card>
    </template>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import FaqExtractPanel from "@/components/knowledge/FaqExtractPanel.vue";
import { KNOWLEDGE_API, apiError } from "@/utils/knowledge";
import { SETUP_API } from "@/utils/setup";

// Emits "changed" when an extraction finishes.
export default {
  name: "FaqStep",

  components: { FaqExtractPanel },

  props: {
    state: { type: Object, required: true },
  },

  data: () => ({
    websiteSourceId: null,
    allWebsiteSources: [],
    faqSource: null,
    starting: false,
    error: "",
  }),

  computed: {
    websiteSources() {
      const staged = (this.state.staging || []).filter((s) => s.type === "website");
      return staged.length ? staged : this.allWebsiteSources;
    },
    running() {
      return this.faqSource?.extraction?.status === "running";
    },
  },

  watch: {
    websiteSources: {
      immediate: true,
      handler(list) {
        if (!this.websiteSourceId && list.length) this.websiteSourceId = list[0]._id;
      },
    },
  },

  created() {
    if (!(this.state.staging || []).some((s) => s.type === "website")) this.loadAllWebsiteSources();
    // Pick up an FAQ source this setup already made, with its progress
    const staged = (this.state.staging || []).find((s) => s.type === "faq");
    if (staged) this.loadFaqSource(staged._id);
  },

  methods: {
    stat(key) {
      return this.faqSource?.stats?.[key] ?? 0;
    },

    async loadAllWebsiteSources() {
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources`);
        this.allWebsiteSources = (data.data || []).filter((s) => s.type === "website");
      } catch {
        this.allWebsiteSources = [];
      }
    },

    async loadFaqSource(id) {
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources/${id}`);
        this.faqSource = data.data;
      } catch {
        // shown again after the next start
      }
    },

    async start() {
      this.starting = true;
      this.error = "";
      try {
        const { data } = await apiClient.post(`${SETUP_API}/faqs`, { websiteSourceId: this.websiteSourceId });
        this.faqSource = data.data;
        this.$emit("changed");
      } catch (err) {
        this.error = apiError(err, "Couldn't start");
      } finally {
        this.starting = false;
      }
    },
  },
};
</script>

<style scoped>
.source-field {
  max-width: 320px;
}
</style>
