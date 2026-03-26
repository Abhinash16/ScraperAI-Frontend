<template>
  <div>
    <!-- HEADER -->
    <!-- <v-row>
      <v-col cols="12">
        <div class="text-h5 font-weight-bold">Chatbot Knowledge Score</div>
        <div class="grey--text">
          AI training readiness based on your website knowledge
        </div>
      </v-col>
    </v-row> -->

    <!-- LOADING -->
    <v-row v-if="loading" class="">
      <v-col cols="12">
        <v-card class="pa-6 rounded-xl" elevation="0">
          <v-skeleton-loader type="card, list-item, list-item" />
        </v-card>
      </v-col>
    </v-row>

    <!-- REPORT -->
    <div v-if="report">
      <!-- TRAINING SCORE HERO -->
      <v-row class="">
        <v-col cols="12">
          <v-card elevation="0" class="pa-6 rounded-xl purple lighten-5">
            <div class="text-overline deep-purple--text">
              AI Knowledge Training Score
            </div>

            <div class="d-flex align-center">
              <div class="text-h2 font-weight-bold mr-6">
                {{ report.trainingScore }}%
              </div>

              <v-progress-circular
                :value="report.trainingScore"
                size="90"
                width="9"
                color="deep-purple"
              />
            </div>

            <div class="grey--text mt-2">
              How well your chatbot understands your business
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- KNOWLEDGE METRICS -->
      <v-row class="mt-4">
        <!-- Pages Scraped -->
        <v-col cols="12" md="4">
          <v-card
            elevation="0"
            class="pa-6 rounded-xl blue lighten-5 metric-card"
          >
            <div class="text-overline primary--text">Pages Scraped</div>

            <div class="text-h4 font-weight-bold">
              {{ report.pagesScraped }}
            </div>

            <div class="grey--text text-caption">
              Pages collected for training
            </div>
          </v-card>
        </v-col>

        <!-- Knowledge Tokens -->
        <v-col cols="12" md="4">
          <v-card
            elevation="0"
            class="pa-6 rounded-xl green lighten-5 metric-card"
          >
            <div class="text-overline success--text">Knowledge Tokens</div>

            <div class="text-h4 font-weight-bold">
              {{ formatTokens(report.knowledgeTokens) }}
            </div>

            <v-progress-linear
              :value="tokenCoverage"
              height="6"
              rounded
              color="success"
              class="mt-2"
            />

            <div class="grey--text text-caption mt-1">
              Knowledge volume captured
            </div>
          </v-card>
        </v-col>

        <!-- Status -->
        <v-col cols="12" md="4">
          <v-card
            elevation="0"
            class="pa-6 rounded-xl orange lighten-5 metric-card"
          >
            <div class="text-overline orange--text">Training Status</div>

            <div class="mt-2">
              <v-chip :color="statusColor" dark large>
                {{ report.status }}
              </v-chip>
            </div>

            <div class="grey--text text-caption mt-2">
              Current AI training readiness
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- AI INSIGHT -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card elevation="0" class="pa-6 rounded-xl">
            <div class="text-h6 font-weight-bold mb-4">
              AI Knowledge Insight
            </div>

            <div class="grey--text text--darken-2">
              Your chatbot currently has
              <strong>{{ report.knowledgeTokens }}</strong> knowledge tokens
              from <strong>{{ report.pagesScraped }}</strong> pages. Increasing
              the number of structured pages such as FAQs, product pages, and
              service explanations will significantly improve the chatbot's
              ability to answer customer questions accurately.
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
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
    tokenCoverage() {
      if (!this.report) return 0;

      return Math.min(100, this.report.knowledgeTokens / 50);
    },

    statusColor() {
      if (!this.report) return "grey";

      if (this.report.trainingScore > 80) return "success";
      if (this.report.trainingScore > 50) return "orange";

      return "red";
    },
  },

  methods: {
    formatTokens(tokens) {
      if (!tokens) return 0;

      if (tokens > 1000) {
        return (tokens / 1000).toFixed(1) + "K";
      }

      return tokens;
    },
  },

  async mounted() {
    this.loading = true;

    try {
      const res = await apiClient.get("/dashboard/chatbot-knowledge-score");

      this.report = res.data.data;
    } catch (err) {
      console.error("Knowledge score error", err);
    }

    this.loading = false;
  },
};
</script>

<style scoped>
.metric-card {
  transition: all 0.25s ease;
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}
</style>
