<template>
  <div>
    <!-- HEADER -->
    <v-row>
      <v-col cols="12">
        <div class="text-h5 font-weight-bold">SEO Growth Report</div>
        <div class="grey--text">
          AI analysis of your website's search visibility
        </div>
      </v-col>
    </v-row>

    <!-- LOADING -->
    <v-row v-if="loading" class="mt-4">
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
      <!-- SEO SCORE HERO -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card elevation="0" class="pa-6 rounded-xl green lighten-5">
            <div class="text-overline success--text">SEO Health Score</div>

            <div class="d-flex align-center">
              <div class="text-h2 font-weight-bold mr-6">
                {{ report.seoScore }}
              </div>

              <v-progress-circular
                :value="report.seoScore"
                size="90"
                width="9"
                color="success"
              />
            </div>

            <div class="grey--text mt-2">
              Overall SEO strength of your website
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- SEO METRICS -->
      <v-row class="mt-4">
        <!-- Pages Indexed -->
        <v-col cols="12" md="4">
          <v-card
            elevation="0"
            class="pa-6 rounded-xl blue lighten-5 metric-card"
          >
            <div class="text-overline primary--text">Pages Indexed</div>

            <div class="text-h4 font-weight-bold">
              {{ report.pagesIndexed }}
            </div>

            <div class="grey--text text-caption">
              Pages detected in search engines
            </div>
          </v-card>
        </v-col>

        <!-- Keyword Coverage -->
        <v-col cols="12" md="4">
          <v-card
            elevation="0"
            class="pa-6 rounded-xl purple lighten-5 metric-card"
          >
            <div class="text-overline deep-purple--text">Keyword Coverage</div>

            <div class="text-h4 font-weight-bold">
              {{ report.keywordCoverage }}%
            </div>

            <v-progress-linear
              :value="report.keywordCoverage"
              height="6"
              rounded
              color="deep-purple"
              class="mt-2"
            />

            <div class="grey--text text-caption mt-1">
              Keywords captured vs market potential
            </div>
          </v-card>
        </v-col>

        <!-- Growth Potential -->
        <v-col cols="12" md="4">
          <v-card
            elevation="0"
            class="pa-6 rounded-xl orange lighten-5 metric-card"
          >
            <div class="text-overline orange--text">Growth Potential</div>

            <div class="text-h4 font-weight-bold">
              {{ report.growthPotential }}%
            </div>

            <v-progress-linear
              :value="report.growthPotential"
              height="6"
              rounded
              color="orange"
              class="mt-2"
            />

            <div class="grey--text text-caption mt-1">
              SEO improvement opportunity
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- SEO INSIGHT -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card elevation="0" class="pa-6 rounded-xl">
            <div class="text-h6 font-weight-bold mb-4">AI SEO Insight</div>

            <div class="grey--text text--darken-2">
              Based on your indexed pages and keyword coverage, your website has
              a
              <strong
                >{{ report.growthPotential }}% SEO growth opportunity</strong
              >. Expanding keyword-focused pages and strengthening internal
              linking can significantly increase your organic search visibility.
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

  async mounted() {
    this.loading = true;

    try {
      const res = await apiClient.get("/dashboard/seo-growth-report");

      this.report = res.data.data;
    } catch (err) {
      console.error("SEO report error", err);
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
