<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Knowledge score</h1>
        <div class="text-body-2 grey--text text--darken-1">
          How ready your bot is to answer questions about your business.
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
        <v-col v-for="n in 3" :key="n" cols="12" md="4">
          <v-card outlined rounded="lg" class="pa-3">
            <v-skeleton-loader type="list-item-avatar-two-line" />
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
        <v-icon size="28" color="grey">$chart-pie</v-icon>
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1">
        Couldn't load your knowledge score
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
            :value="report.trainingScore"
            :color="statusColor"
            size="112"
            width="10"
            class="mr-6 mb-2 flex-shrink-0"
          >
            <span class="text-h5 font-weight-bold grey--text text--darken-4">
              {{ report.trainingScore }}%
            </span>
          </v-progress-circular>
          <div class="flex-grow-1 mb-2">
            <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">
              AI knowledge training score
            </div>
            <div class="d-flex flex-wrap align-center mb-1">
              <span class="text-h6 font-weight-bold grey--text text--darken-4 mr-3">
                {{ scoreLabel }}
              </span>
              <v-chip
                small
                label
                :color="`${statusColor} lighten-5`"
                :text-color="statusColor"
                class="font-weight-bold text-capitalize"
              >
                {{ report.status }}
              </v-chip>
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              How well your chatbot understands your business, based on the knowledge it has.
            </div>
          </div>
        </div>
      </v-card>

      <!-- Metrics -->
      <v-row dense class="mb-3">
        <v-col cols="12" md="4">
          <v-card outlined rounded="lg" class="d-flex align-center pa-4 fill-height">
            <v-avatar size="44" tile color="blue lighten-5" class="rounded-lg mr-3 flex-shrink-0">
              <v-icon size="22" color="blue">$file-text</v-icon>
            </v-avatar>
            <div>
              <div class="text-h5 font-weight-bold grey--text text--darken-4">
                {{ report.pagesScraped }}
              </div>
              <div class="text-caption grey--text text--darken-1">Pages collected</div>
            </div>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card outlined rounded="lg" class="pa-4 fill-height">
            <div class="d-flex align-center">
              <v-avatar size="44" tile color="green lighten-5" class="rounded-lg mr-3 flex-shrink-0">
                <v-icon size="22" color="green">$database</v-icon>
              </v-avatar>
              <div>
                <div class="text-h5 font-weight-bold grey--text text--darken-4">
                  {{ formatTokens(report.knowledgeTokens) }}
                </div>
                <div class="text-caption grey--text text--darken-1">Knowledge tokens</div>
              </div>
            </div>
            <v-progress-linear
              :value="tokenCoverage"
              height="6"
              rounded
              color="success"
              background-color="grey lighten-3"
              class="mt-3"
              aria-label="Knowledge volume captured"
            />
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card outlined rounded="lg" class="d-flex align-center pa-4 fill-height">
            <v-avatar
              size="44"
              tile
              :color="`${statusColor} lighten-5`"
              class="rounded-lg mr-3 flex-shrink-0"
            >
              <v-icon size="22" :color="statusColor">$activity</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold text-capitalize grey--text text--darken-4">
                {{ report.status }}
              </div>
              <div class="text-caption grey--text text--darken-1">Training status</div>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- How to improve -->
      <v-card outlined rounded="lg">
        <div class="d-flex align-center px-5 py-4">
          <v-icon size="18" color="amber darken-2" class="mr-2">$lightbulb</v-icon>
          <span class="text-subtitle-1 font-weight-bold grey--text text--darken-4">
            How to improve your score
          </span>
        </div>
        <v-divider />
        <div class="px-5 pt-4 text-body-2 grey--text text--darken-2">
          Your chatbot has <strong>{{ report.knowledgeTokens }}</strong> knowledge tokens from
          <strong>{{ report.pagesScraped }}</strong> pages. Structured knowledge like FAQs, product
          pages and service explanations helps it answer customers accurately.
        </div>
        <v-row dense class="pa-4">
          <v-col v-for="tip in TIPS" :key="tip.title" cols="12" md="4">
            <v-card outlined rounded="lg" class="d-flex align-start pa-4 fill-height" :to="tip.to">
              <v-avatar size="36" tile color="green lighten-5" class="rounded-lg mr-3 flex-shrink-0">
                <v-icon size="18" color="green darken-1">{{ tip.icon }}</v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <div class="text-body-2 font-weight-bold grey--text text--darken-4">
                  {{ tip.title }}
                </div>
                <div class="text-caption grey--text text--darken-1">{{ tip.text }}</div>
              </div>
              <v-icon size="16" color="grey lighten-1" class="ml-2 mt-1">$chevron-right</v-icon>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </template>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

// Where to go to add more knowledge
const TIPS = [
  {
    icon: "$message-circle-question-mark",
    title: "Add FAQs",
    text: "Exact answers to the questions customers ask most.",
    to: "/dashboard/knowledge",
  },
  {
    icon: "$globe",
    title: "Import more pages",
    text: "Product, pricing and service pages from your website.",
    to: "/dashboard/knowledge",
  },
  {
    icon: "$lightbulb",
    title: "Answer unanswered questions",
    text: "Each answer becomes an FAQ the bot can use.",
    to: "/dashboard/knowledge-gap",
  },
];

export default {
  data() {
    return {
      TIPS,
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

    scoreLabel() {
      if (!this.report) return "";
      if (this.report.trainingScore > 80) return "Well trained";
      if (this.report.trainingScore > 50) return "Getting there";
      return "Needs more knowledge";
    },
  },

  mounted() {
    this.load();
  },

  methods: {
    async load() {
      this.loading = true;

      try {
        const res = await apiClient.get("/dashboard/chatbot-knowledge-score");

        this.report = res.data.data;
      } catch (err) {
        console.error("Knowledge score error", err);
      }

      this.loading = false;
    },

    formatTokens(tokens) {
      if (!tokens) return 0;

      if (tokens > 1000) {
        return (tokens / 1000).toFixed(1) + "K";
      }

      return tokens;
    },
  },
};
</script>
