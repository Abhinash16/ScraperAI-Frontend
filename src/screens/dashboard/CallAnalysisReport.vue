<template>
  <div>
    <!-- Header -->
    <v-row align="center" class="mb-6">
      <v-col cols="auto">
        <v-btn icon text color="primary" @click="$router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>

      <v-col>
        <h1 class="text-h5 font-weight-bold mb-1">Call Analysis Report</h1>

        <p class="text-subtitle-2 grey--text mb-0">
          AI insights and performance evaluation for this call
        </p>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate size="60" />
        <p class="mt-3 grey--text">Analyzing call...</p>
      </v-col>
    </v-row>

    <template v-if="report && !loading">
      <!-- Agent Info -->
      <v-card outlined rounded="xl" class="mb-6">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <div class="text-caption grey--text">Agent</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ report.agentName }}
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="text-caption grey--text">Agent Email</div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ report.agentEmail }}
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <div class="text-caption grey--text">Call Status</div>

              <v-chip
                class="rounded-xl"
                small
                :color="statusColor(report.status)"
                label
              >
                {{ report.status }}
              </v-chip>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Audio Player -->
      <v-card outlined rounded="xl" class="mb-6">
        <v-card-text>
          <div class="d-flex align-center mb-3">
            <v-icon class="mr-2">mdi-headphones</v-icon>
            <span class="font-weight-bold">Call Recording</span>
          </div>

          <audio
            ref="audio"
            :src="report.recordingUrl"
            controls
            style="width: 100%"
          ></audio>
        </v-card-text>
      </v-card>

      <!-- Summary -->
      <v-card outlined rounded="xl" class="mb-6">
        <v-card-text>
          <div class="font-weight-bold mb-2">Call Summary</div>

          <p class="text-body-2 mb-0">
            {{ report.summary }}
          </p>
        </v-card-text>
      </v-card>

      <!-- Metrics -->
      <v-row class="mb-6">
        <!-- Sentiment -->
        <v-col cols="12" md="6">
          <v-card outlined rounded="xl" class="text-center pa-6">
            <div class="text-caption grey--text mb-2">Sentiment</div>

            <v-chip large :color="sentimentColor(report.sentiment)">
              {{ report.sentiment }}
            </v-chip>
          </v-card>
        </v-col>

        <!-- Score -->
        <v-col cols="12" md="6">
          <v-card outlined rounded="xl" class="text-center pa-6">
            <div class="text-caption grey--text mb-2">Quality Score</div>

            <div
              class="text-h3 font-weight-bold"
              :class="
                report.qualityScore >= 70 ? 'success--text' : 'error--text'
              "
            >
              {{ report.qualityScore }}/100
            </div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Issues -->
      <v-row class="mt-6">
        <v-col cols="12">
          <h2 class="mb-4">Detected Issues</h2>

          <v-alert
            v-if="!report.issues || report.issues.length === 0"
            type="success"
          >
            No issues detected in this call.
          </v-alert>

          <v-timeline v-else side="end">
            <v-timeline-item
              v-for="issue in report.issues"
              :key="issue._id"
              dot-color="red"
              size="small"
            >
              <v-card rounded="xl">
                <v-card-title class="text-capitalize">
                  {{ issue.issue }}
                </v-card-title>

                <v-card-subtitle>
                  Timestamp: {{ issue.timestamp }}
                </v-card-subtitle>

                <v-card-text>
                  <p>
                    <strong>Explanation:</strong>
                    {{ issue.explanation }}
                  </p>

                  <p class="mt-2">
                    <strong>Suggestion:</strong>
                    {{ issue.suggestion }}
                  </p>

                  <v-btn
                    size="small"
                    color="primary"
                    rounded="xl"
                    class="mt-3"
                    @click="jumpTo(issue.seconds)"
                  >
                    Play from {{ issue.timestamp }}
                  </v-btn>
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>

      <!-- Transcript -->
      <v-card outlined rounded="xl">
        <v-card-text>
          <div class="font-weight-bold mb-3">Transcript</div>

          <v-divider class="mb-4" />

          <p class="text-body-2" style="white-space: pre-line">
            {{ report.transcript }}
          </p>
        </v-card-text>
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
      loading: true,
    };
  },

  async mounted() {
    const id = this.$route.params.id;

    try {
      const res = await apiClient.get(`/call-analysis/report/${id}`);
      this.report = res.data;
    } catch (err) {
      console.error(err);
    }

    this.loading = false;
  },

  methods: {
    sentimentColor(sentiment) {
      if (sentiment === "positive") return "success";
      if (sentiment === "negative") return "error";
      return "warning";
    },

    statusColor(status) {
      if (status === "completed") return "success";
      if (status === "failed") return "error";
      return "warning";
    },

    jumpTo(seconds) {
      const audio = this.$refs.audio;
      if (!audio) return;

      audio.currentTime = seconds;
      audio.play();
    },
  },
};
</script>
