<template>
  <div>
    <!-- HEADER -->
    <!-- <v-row>
      <v-col cols="12">
        <div class="text-h5 font-weight-bold">Keyword Research</div>
        <div class="grey--text">
          AI-powered keyword discovery and SEO opportunities
        </div>
      </v-col>
    </v-row> -->

    <!-- LOADING -->
    <v-row v-if="loading" class="">
      <v-col cols="12">
        <v-card class="pa-6 rounded-xl" elevation="0">
          <v-skeleton-loader
            type="table-heading, table-row@6"
          ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <div v-if="report">
      <!-- KEYWORD OVERVIEW -->
      <v-row class="">
        <v-col cols="12" md="4">
          <v-card
            class="pa-6 rounded-xl blue lighten-5 metric-card"
            elevation="0"
          >
            <div class="text-overline primary--text">Primary Keywords</div>

            <div class="text-h4 font-weight-bold">
              {{ report.primaryKeywords.length }}
            </div>

            <div class="grey--text text-caption">
              Core ranking opportunities
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            class="pa-6 rounded-xl purple lighten-5 metric-card"
            elevation="0"
          >
            <div class="text-overline deep-purple--text">Keyword Gaps</div>

            <div class="text-h4 font-weight-bold">
              {{ report.keywordGaps.length }}
            </div>

            <div class="grey--text text-caption">
              Competitor keyword opportunities
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card
            class="pa-6 rounded-xl green lighten-5 metric-card"
            elevation="0"
          >
            <div class="text-overline success--text">Opportunity Score</div>

            <div class="text-h4 font-weight-bold">{{ opportunityScore }}%</div>

            <v-progress-linear
              :value="opportunityScore"
              height="6"
              rounded
              color="success"
              class="mt-2"
            />

            <div class="grey--text text-caption mt-1">
              SEO keyword growth potential
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- PRIMARY KEYWORDS TABLE -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="pa-6 rounded-xl" elevation="0">
            <div class="text-h6 font-weight-bold mb-4">Primary Keywords</div>

            <v-simple-table>
              <thead>
                <tr>
                  <th class="text-left">Keyword</th>
                  <th class="text-left">Intent</th>
                  <th class="text-left">Opportunity</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(k, i) in report.primaryKeywords" :key="i">
                  <td class="font-weight-medium">
                    {{ k.keyword }}
                  </td>

                  <td>
                    <v-chip
                      small
                      color="blue lighten-4"
                      text-color="blue darken-3"
                    >
                      SEO
                    </v-chip>
                  </td>

                  <td>
                    <v-chip
                      small
                      color="green lighten-4"
                      text-color="green darken-3"
                    >
                      High
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>
        </v-col>
      </v-row>

      <!-- KEYWORD GAPS -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="pa-6 rounded-xl" elevation="0">
            <div class="text-h6 font-weight-bold mb-4">
              Keyword Gaps (Competitor Opportunities)
            </div>

            <div>
              <v-chip
                v-for="(k, i) in report.keywordGaps"
                :key="i"
                class="ma-1"
                color="orange lighten-4"
                text-color="orange darken-3"
                outlined
              >
                {{ k }}
              </v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- AI INSIGHT -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card elevation="0" class="pa-6 rounded-xl">
            <div class="text-h6 font-weight-bold mb-4">AI Keyword Insight</div>

            <div class="grey--text text--darken-2">
              Your business currently targets
              <strong>{{ report.primaryKeywords.length }}</strong>
              core keywords. However, there are
              <strong>{{ report.keywordGaps.length }}</strong>
              additional keywords where competitors are gaining traffic.
              Expanding your content strategy around these keyword gaps can
              significantly increase your organic search visibility and traffic
              growth.
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
    opportunityScore() {
      if (!this.report) return 0;

      const score =
        this.report.keywordGaps.length * 10 +
        this.report.primaryKeywords.length * 5;

      return Math.min(score, 100);
    },
  },

  async mounted() {
    this.loading = true;

    try {
      const res = await apiClient.get("/dashboard/keyword-research");
      this.report = res.data.data;
    } catch (err) {
      console.error("Keyword research error", err);
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
