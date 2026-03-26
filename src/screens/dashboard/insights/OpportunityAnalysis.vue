<template>
  <div>
    <!-- PAGE HEADER -->
    <!-- <v-row>
      <v-col cols="12">
        <div class="text-h5 font-weight-bold">Opportunity Analysis</div>
        <div class="grey--text">AI-powered market opportunity insights</div>
      </v-col>
    </v-row> -->

    <!-- LOADING -->
    <v-row v-if="loading" class="">
      <v-col cols="12">
        <v-card class="pa-6 rounded-xl" elevation="0">
          <v-skeleton-loader
            type="card, list-item, list-item"
          ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <!-- REPORT -->
    <div v-if="report">
      <!-- OPPORTUNITY SCORE -->
      <v-row class="">
        <v-col cols="12">
          <v-card elevation="0" class="pa-6 rounded-xl blue lighten-5">
            <div class="text-overline primary--text">AI Opportunity Score</div>

            <div class="d-flex align-center">
              <div class="text-h2 font-weight-bold mr-6">
                {{ report.opportunityScore }}%
              </div>

              <v-progress-circular
                :value="report.opportunityScore"
                size="80"
                width="8"
                color="primary"
              />
            </div>

            <div class="grey--text mt-2">
              Estimated growth potential for this business
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- INSIGHT CARDS -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card class="pa-6 rounded-xl" elevation="0">
            <div class="text-overline grey--text">Market Gap</div>

            <div class="text-h6 font-weight-medium mt-2">
              {{ report.marketGap }}
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-6 rounded-xl green lighten-5" elevation="0">
            <div class="text-overline success--text">Revenue Opportunity</div>

            <div class="text-h6 font-weight-medium mt-2">
              {{ report.revenueOpportunity }}
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- CONTENT IDEAS -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="pa-6 rounded-xl" elevation="0">
            <div class="text-h6 font-weight-bold mb-4">
              AI Content Opportunities
            </div>

            <v-list dense>
              <v-list-item
                v-for="(c, index) in report.contentIdeas"
                :key="index"
              >
                <v-list-item-icon>
                  <v-icon color="deep-purple"> mdi-lightbulb-on </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  {{ c }}
                </v-list-item-content>
              </v-list-item>
            </v-list>
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

  async mounted() {
    this.loading = true;

    try {
      const res = await apiClient.get("/dashboard/opportunity-analysis");

      this.report = res.data.data;
    } catch (err) {
      console.error("Opportunity analysis error", err);
    }

    this.loading = false;
  },
};
</script>

<style scoped>
.v-card {
  transition: all 0.25s ease;
}

.v-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}
</style>
