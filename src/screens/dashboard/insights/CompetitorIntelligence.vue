<template>
  <div>
    <!-- HEADER -->
    <!-- <v-row>
      <v-col cols="12">
        <div class="text-h5 font-weight-bold">Competitor Intelligence</div>
        <div class="grey--text">AI analysis of your market competitors</div>
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

    <!-- COMPETITOR CARDS -->
    <v-row v-if="report" class="">
      <v-col v-for="c in report.competitors" :key="c.name" cols="12" md="6">
        <v-card class="pa-6 rounded-xl competitor-card" elevation="0">
          <!-- COMPETITOR HEADER -->
          <div class="d-flex align-center mb-4">
            <v-avatar color="deep-purple" size="36" class="mr-3">
              <v-icon dark>mdi-domain</v-icon>
            </v-avatar>

            <div class="text-h6 font-weight-bold">
              {{ c.name }}
            </div>
          </div>

          <!-- STRENGTHS -->
          <v-card class="pa-4 mb-4 green lighten-5 rounded-lg" elevation="0">
            <div class="text-subtitle-2 success--text font-weight-bold mb-3">
              Strengths
            </div>

            <v-list dense class="rounded-lg">
              <v-list-item v-for="(s, i) in c.strengths" :key="i">
                <v-list-item-icon>
                  <v-icon color="success"> mdi-trending-up </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  {{ s }}
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- WEAKNESSES -->
          <v-card class="pa-4 red lighten-5 rounded-lg" elevation="0">
            <div class="text-subtitle-2 red--text font-weight-bold mb-3">
              Weaknesses
            </div>

            <v-list dense class="rounded-lg">
              <v-list-item v-for="(w, i) in c.weaknesses" :key="i">
                <v-list-item-icon>
                  <v-icon color="red"> mdi-alert-circle </v-icon>
                </v-list-item-icon>

                <v-list-item-content>
                  {{ w }}
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-card>
      </v-col>
    </v-row>

    <!-- AI STRATEGY INSIGHT -->
    <v-row v-if="report" class="mt-4">
      <v-col cols="12">
        <v-card elevation="0" class="pa-6 rounded-xl">
          <div class="text-h6 font-weight-bold mb-4">
            AI Competitive Strategy
          </div>

          <div class="grey--text text--darken-2">
            Based on competitor strengths and weaknesses, the biggest
            opportunity is to build stronger SEO visibility, improve content
            coverage, and provide faster customer support using AI automation.
            Targeting gaps in competitor knowledge content can significantly
            increase your market share.
          </div>
        </v-card>
      </v-col>
    </v-row>
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
      const res = await apiClient.get("/dashboard/competitor-intelligence");
      this.report = res.data.data;
    } catch (err) {
      console.error("Competitor intelligence error", err);
    }

    this.loading = false;
  },
};
</script>

<style scoped>
.competitor-card {
  transition: all 0.25s ease;
}

.competitor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.08);
}
</style>
