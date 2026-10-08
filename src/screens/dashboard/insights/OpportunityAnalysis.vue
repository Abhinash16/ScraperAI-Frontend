<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Opportunities</h1>
        <div class="text-body-2 grey--text text--darken-1">
          AI-spotted gaps in your market and ideas to grow from them.
        </div>
      </div>
      <v-spacer />
      <v-btn small outlined color="primary" class="mb-2" :loading="loading" @click="load">
        <v-icon left size="14">$refresh-cw</v-icon>
        Refresh
      </v-btn>
    </div>

    <!-- LOADING -->
    <template v-if="loading && !report">
      <v-card outlined rounded="lg" class="pa-4 mb-4">
        <v-skeleton-loader type="list-item-avatar-three-line" />
      </v-card>
      <v-row dense>
        <v-col v-for="n in 2" :key="n" cols="12" md="6">
          <v-card outlined rounded="lg" class="pa-3">
            <v-skeleton-loader type="list-item-two-line" />
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- ERROR -->
    <v-card
      v-else-if="!report"
      outlined
      rounded="lg"
      class="d-flex flex-column align-center text-center px-6 py-12"
    >
      <v-avatar color="grey lighten-4" size="64" class="mb-4">
        <v-icon size="28" color="grey">$trending-up</v-icon>
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1">
        Couldn't load your opportunity analysis
      </div>
      <div class="text-body-2 grey--text text--darken-1 mb-4">
        Check your connection and try again.
      </div>
      <v-btn small depressed color="primary" @click="load">
        <v-icon left size="14">$refresh-cw</v-icon>
        Try again
      </v-btn>
    </v-card>

    <!-- REPORT -->
    <template v-else>
      <!-- Score -->
      <v-card outlined rounded="lg" class="mb-4">
        <div class="d-flex flex-wrap align-center pa-5">
          <v-progress-circular
            :value="report.opportunityScore"
            :color="scoreColor"
            size="112"
            width="10"
            class="mr-6 mb-2 flex-shrink-0"
          >
            <span class="text-h5 font-weight-bold grey--text text--darken-4">
              {{ report.opportunityScore }}%
            </span>
          </v-progress-circular>
          <div class="flex-grow-1 mb-2">
            <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">
              AI opportunity score
            </div>
            <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-1">
              {{ scoreLabel }}
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              Estimated growth potential for your business.
            </div>
          </div>
        </div>
      </v-card>

      <!-- Market gap + revenue -->
      <v-row dense class="mb-3">
        <v-col cols="12" md="6">
          <v-card outlined rounded="lg" class="pa-5 fill-height">
            <div class="d-flex align-center mb-3">
              <v-avatar size="36" tile color="amber lighten-5" class="rounded-lg mr-3">
                <v-icon size="18" color="amber darken-2">$search</v-icon>
              </v-avatar>
              <span class="text-caption font-weight-bold text-uppercase grey--text">Market gap</span>
            </div>
            <div class="text-body-1 grey--text text--darken-4 text-break">
              {{ report.marketGap || "—" }}
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card outlined rounded="lg" class="pa-5 fill-height">
            <div class="d-flex align-center mb-3">
              <v-avatar size="36" tile color="green lighten-5" class="rounded-lg mr-3">
                <v-icon size="18" color="green darken-1">$trending-up</v-icon>
              </v-avatar>
              <span class="text-caption font-weight-bold text-uppercase grey--text">
                Revenue opportunity
              </span>
            </div>
            <div class="text-body-1 grey--text text--darken-4 text-break">
              {{ report.revenueOpportunity || "—" }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Content ideas -->
      <v-card outlined rounded="lg">
        <div class="d-flex align-center px-5 py-4">
          <v-icon size="18" color="deep-purple" class="mr-2">$lightbulb</v-icon>
          <span class="text-subtitle-1 font-weight-bold grey--text text--darken-4">
            Content ideas
          </span>
          <v-chip v-if="ideas.length" x-small label class="font-weight-bold ml-2">
            {{ ideas.length }}
          </v-chip>
          <v-spacer />
          <v-btn small text color="primary" to="/dashboard/knowledge">
            Add to knowledge
            <v-icon right size="14">$arrow-right</v-icon>
          </v-btn>
        </div>
        <v-divider />

        <div v-if="!ideas.length" class="text-center text-body-2 grey--text py-8">
          No content ideas yet.
        </div>
        <template v-for="(idea, i) in ideas">
          <v-divider v-if="i > 0" :key="`d-${i}`" />
          <div :key="i" class="d-flex align-start px-5 py-3">
            <v-avatar size="28" color="deep-purple lighten-5" class="mr-3 flex-shrink-0">
              <span class="text-caption font-weight-bold deep-purple--text">{{ i + 1 }}</span>
            </v-avatar>
            <div class="text-body-2 grey--text text--darken-3 text-break pt-1">{{ idea }}</div>
          </div>
        </template>
      </v-card>
    </template>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      report: null,
      loading: false,
    };
  },

  computed: {
    ideas() {
      return Array.isArray(this.report?.contentIdeas) ? this.report.contentIdeas : [];
    },

    scoreColor() {
      const score = this.report?.opportunityScore || 0;
      if (score > 70) return "success";
      if (score > 40) return "primary";
      return "amber darken-2";
    },

    scoreLabel() {
      const score = this.report?.opportunityScore || 0;
      if (score > 70) return "Strong growth potential";
      if (score > 40) return "Good room to grow";
      return "Some room to grow";
    },
  },

  mounted() {
    this.load();
  },

  methods: {
    async load() {
      this.loading = true;

      try {
        const res = await apiClient.get("/dashboard/opportunity-analysis");

        this.report = res.data.data;
      } catch (err) {
        console.error("Opportunity analysis error", err);
      }

      this.loading = false;
    },
  },
};
</script>
