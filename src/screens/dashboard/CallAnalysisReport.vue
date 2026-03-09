<template>
  <v-container max-width="1100">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Call Analysis Report</h1>
      </v-col>
    </v-row>

    <!-- Loading -->
    <v-row v-if="loading">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate size="50"></v-progress-circular>
        <p class="mt-3">Analyzing call...</p>
      </v-col>
    </v-row>

    <template v-if="report && !loading">
      <!-- Agent Info -->
      <v-row>
        <v-col cols="12">
          <v-card class="pa-4">
            <v-row>
              <v-col cols="12" md="4">
                <div class="text-caption">Agent</div>
                <div class="text-h6">{{ report.agentName }}</div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="text-caption">Agent Email</div>
                <div class="text-h6">{{ report.agentEmail }}</div>
              </v-col>

              <v-col cols="12" md="4">
                <div class="text-caption">Call Status</div>
                <v-chip color="green" v-if="report.status === 'completed'">
                  Completed
                </v-chip>
                <v-chip color="orange" v-else>
                  {{ report.status }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Audio Player -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="pa-4">
            <h3 class="mb-2">Call Recording</h3>

            <audio
              ref="audio"
              :src="report.recordingUrl"
              controls
              style="width: 100%"
            ></audio>
          </v-card>
        </v-col>
      </v-row>

      <!-- Summary -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card class="pa-4">
            <h3>Call Summary</h3>
            <p class="mt-2">
              {{ report.summary }}
            </p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Stats -->
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card class="pa-4 text-center">
            <div class="text-caption">Sentiment</div>

            <v-chip size="large" :color="sentimentColor(report.sentiment)">
              {{ report.sentiment }}
            </v-chip>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 text-center">
            <div class="text-caption">Quality Score</div>

            <div class="text-h3 mt-2">{{ report.qualityScore }}/100</div>
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
              <v-card>
                <v-card-title>
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
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card class="pa-4">
            <h3>Transcript</h3>

            <v-divider class="my-3"></v-divider>

            <p style="white-space: pre-line">
              {{ report.transcript }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  name: "CallAnalysisReport",

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
      if (sentiment === "positive") return "green";
      if (sentiment === "negative") return "red";
      return "orange";
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

<style scoped>
h1 {
  font-weight: 600;
}

p {
  line-height: 1.6;
}
</style>
