<template>
  <div>
    <!-- Loader -->
    <v-overlay :value="loading" opacity="0.25">
      <v-progress-circular indeterminate size="70" width="6" color="primary" />
    </v-overlay>

    <!-- Error -->
    <v-snackbar v-model="snackbar" color="error" timeout="4000" top right>
      {{ errorMessage }}
    </v-snackbar>

    <!-- HEADER -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="0" class="pa-6 rounded-xl hero-card">
          <div class="d-flex align-center justify-space-between flex-wrap">
            <div>
              <div class="text-h5 font-weight-bold">
                AI Business Intelligence
              </div>

              <div class="grey--text mt-1">
                Strategic insights for
                <strong>{{ insight.domain }}</strong>
              </div>
            </div>

            <v-chip color="primary" outlined class="mt-2">
              {{ insight.industry }}
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- SCORE DASHBOARD -->
    <v-row class="mt-4">
      <v-col cols="12" md="4">
        <v-card
          elevation="0"
          class="pa-6 rounded-xl score-card blue lighten-5"
          to="/dashboard/opportunity-analysis"
          router
        >
          <div class="text-overline primary--text">AI Opportunity</div>

          <div class="text-h4 font-weight-bold">{{ aiOpportunityScore }}%</div>

          <v-progress-linear
            :value="aiOpportunityScore"
            height="6"
            rounded
            color="primary"
            class="mt-2"
          />

          <div class="grey--text text-caption mt-2">
            Growth potential detected
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card
          elevation="0"
          class="pa-6 rounded-xl score-card green lighten-5"
          to="/dashboard/seo-growth-report"
          router
        >
          <div class="text-overline success--text">SEO Potential</div>

          <div class="text-h4 font-weight-bold">{{ seoScore }}%</div>

          <v-progress-linear
            :value="seoScore"
            height="6"
            rounded
            color="success"
            class="mt-2"
          />

          <div class="grey--text text-caption mt-2">
            Organic traffic opportunity
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card
          elevation="0"
          class="pa-6 rounded-xl score-card purple lighten-5"
          to="/dashboard/chatbot-knowledge-score"
          router
        >
          <div class="text-overline deep-purple--text">Chatbot Knowledge</div>

          <div class="text-h4 font-weight-bold">{{ trainingScore }}%</div>

          <v-progress-linear
            :value="trainingScore"
            height="6"
            rounded
            color="deep-purple"
            class="mt-2"
          />

          <div class="grey--text text-caption mt-2">AI training readiness</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- COMPANY SUMMARY -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="0" class="pa-6 rounded-xl">
          <div class="text-h6 font-weight-bold mb-3">Company Overview</div>

          <div class="grey--text text--darken-2">
            {{ insight.companySummary }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- TARGET AUDIENCE -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="0" class="pa-6 rounded-xl">
          <div class="text-h6 font-weight-bold mb-4">
            Target Audience Segments
          </div>

          <v-chip
            v-for="a in insight.targetAudience"
            :key="a"
            class="ma-1"
            color="primary"
            outlined
          >
            {{ a }}
          </v-chip>
        </v-card>
      </v-col>
    </v-row>

    <!-- COMPETITORS -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="0" class="pa-6 rounded-xl">
          <div class="text-h6 font-weight-bold mb-4">Competitor Landscape</div>

          <v-row>
            <v-col
              v-for="c in insight.competitors"
              :key="c._id"
              cols="12"
              md="3"
            >
              <v-card elevation="0" class="pa-4 competitor-card rounded-lg">
                <div class="font-weight-bold">{{ c.name }}</div>

                <div class="grey--text text-caption">
                  {{ c.domain }}
                </div>

                <v-chip small class="mt-2" color="grey lighten-3">
                  competitor
                </v-chip>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- QUESTIONS + AI IDEAS -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card elevation="0" class="pa-6 rounded-xl">
          <div class="text-h6 font-weight-bold mb-4">Customer Questions</div>

          <v-list dense>
            <v-list-item v-for="(q, i) in insight.customerQuestions" :key="i">
              <v-list-item-icon>
                <v-icon color="primary">mdi-help-circle-outline</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                {{ q }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card elevation="0" class="pa-6 rounded-xl">
          <div class="text-h6 font-weight-bold mb-4">AI Growth Strategies</div>

          <v-list dense>
            <v-list-item v-for="(s, i) in insight.aiSuggestions" :key="i">
              <v-list-item-icon>
                <v-icon color="success">mdi-lightbulb-on-outline</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                {{ s }}
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- SEO OPPORTUNITIES -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="0" class="pa-6 rounded-xl">
          <div class="text-h6 font-weight-bold mb-4">
            SEO Growth Opportunities
          </div>

          <v-row>
            <v-col
              v-for="(seo, i) in insight.seoOpportunities"
              :key="i"
              cols="12"
              md="4"
            >
              <v-card elevation="0" class="pa-4 seo-card">
                <v-icon color="orange" class="mb-2"> mdi-trending-up </v-icon>

                <div class="grey--text text--darken-2">
                  {{ seo }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- REPORT LINKS -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card elevation="0" class="pa-6 rounded-xl">
          <div class="text-h6 font-weight-bold mb-4">
            AI Intelligence Reports
          </div>

          <v-btn
            class="mr-2 mb-2"
            outlined
            color="primary"
            to="/dashboard/opportunity-analysis"
          >
            Opportunity Analysis
          </v-btn>

          <v-btn
            class="mr-2 mb-2"
            outlined
            color="success"
            to="/dashboard/keyword-research"
          >
            Keyword Research
          </v-btn>

          <v-btn
            class="mr-2 mb-2"
            outlined
            color="deep-purple"
            to="/dashboard/competitor-intelligence"
          >
            Competitor Intelligence
          </v-btn>

          <v-btn
            class="mr-2 mb-2"
            outlined
            color="orange"
            to="/dashboard/seo-growth-report"
          >
            SEO Growth Report
          </v-btn>

          <v-btn
            class="mr-2 mb-2"
            outlined
            color="indigo"
            to="/dashboard/chatbot-knowledge-score"
          >
            Chatbot Knowledge
          </v-btn>
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
      insight: {
        domain: "",
        companySummary: "",
        industry: "",
        targetAudience: [],
        competitors: [],
        customerQuestions: [],
        aiSuggestions: [],
        seoOpportunities: [],
      },

      loading: false,
      snackbar: false,
      errorMessage: "",
    };
  },

  computed: {
    aiOpportunityScore() {
      return Math.min(100, this.insight.aiSuggestions.length * 15);
    },

    seoScore() {
      return Math.min(100, this.insight.seoOpportunities.length * 20);
    },

    trainingScore() {
      const total =
        this.insight.customerQuestions.length +
        this.insight.targetAudience.length +
        this.insight.aiSuggestions.length;

      return Math.min(100, total * 10);
    },
  },

  created() {
    this.fetchInsights();
  },

  methods: {
    async fetchInsights() {
      this.loading = true;

      try {
        const res = await apiClient.get("/client-insight");

        if (res.data.success) {
          this.insight = res.data.data;
        }
      } catch (err) {
        this.errorMessage =
          err.response?.data?.message || "Failed to load insights";

        this.snackbar = true;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.hero-card {
  background: linear-gradient(135deg, #f5f7ff, #eef1ff);
}

.score-card {
  cursor: pointer;
  transition: all 0.25s ease;
}

.score-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
}

.competitor-card {
  background: #fafafa;
  transition: 0.2s;
}

.competitor-card:hover {
  background: #f2f2f2;
}

.seo-card {
  background: #fff7ec;
  border-radius: 12px;
}
</style>
