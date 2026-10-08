<template>
  <div>
    <v-btn text small color="grey darken-2" class="mb-3 px-2" @click="goBack">
      <v-icon left size="16">$arrow-left</v-icon>
      {{ report && report.batchId ? "Back to batch" : "Back" }}
    </v-btn>

    <!-- LOADING -->
    <v-row v-if="loading">
      <v-col cols="12" md="8">
        <v-card outlined rounded="lg" class="pa-4 mb-4">
          <v-skeleton-loader type="list-item-avatar-two-line, image" />
        </v-card>
        <v-card outlined rounded="lg" class="pa-4">
          <v-skeleton-loader type="paragraph, paragraph" />
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined rounded="lg" class="pa-4">
          <v-skeleton-loader
            type="list-item-avatar-three-line, list-item, list-item"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- NOT FOUND -->
    <v-card
      v-else-if="!report"
      outlined
      rounded="lg"
      class="d-flex flex-column align-center text-center px-6 py-12"
    >
      <v-avatar color="grey lighten-4" size="64" class="mb-4">
        <v-icon size="28" color="grey">$file-search</v-icon>
      </v-avatar>
      <div
        class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1"
      >
        Couldn't load this call report
      </div>
      <div class="text-body-2 grey--text text--darken-1">
        It may still be processing, or the link is wrong.
      </div>
    </v-card>

    <template v-else>
      <!-- HEADER -->
      <div class="d-flex flex-wrap align-center mb-4">
        <v-avatar
          size="44"
          color="primary lighten-5"
          class="mr-3 mb-2 flex-shrink-0"
        >
          <span class="primary--text text-subtitle-1 font-weight-bold">{{
            initial
          }}</span>
        </v-avatar>
        <div class="mr-4 mb-2 overflow-hidden">
          <h1
            class="text-h6 font-weight-bold grey--text text--darken-4 text-break"
          >
            {{ report.agentName || "Call report" }}
          </h1>
          <div class="text-body-2 grey--text text--darken-1">
            AI review of this call: what went well, what to fix.
          </div>
        </div>
        <v-spacer />
        <v-chip
          small
          label
          :color="statusColor(report.status)"
          text-color="white"
          class="font-weight-bold text-capitalize mb-2"
        >
          {{ report.status }}
        </v-chip>
      </div>

      <v-row>
        <!-- LEFT -->
        <v-col cols="12" md="8">
          <!-- Recording -->
          <v-card outlined rounded="lg" class="mb-4">
            <div class="d-flex align-center px-5 py-4">
              <v-avatar
                size="32"
                tile
                color="blue lighten-5"
                class="rounded-lg mr-3"
              >
                <v-icon size="16" color="blue">$headphones</v-icon>
              </v-avatar>
              <span
                class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
                >Recording</span
              >
            </div>
            <v-divider />
            <div class="d-flex pa-4">
              <audio
                ref="audio"
                :src="report.recordingUrl"
                controls
                class="flex-grow-1"
              ></audio>
            </div>
          </v-card>

          <!-- Summary -->
          <v-card outlined rounded="lg" class="mb-4">
            <div class="d-flex align-center px-5 py-4">
              <v-avatar
                size="32"
                tile
                color="primary lighten-5"
                class="rounded-lg mr-3"
              >
                <v-icon size="16" color="primary">$file-text</v-icon>
              </v-avatar>
              <span
                class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
                >Summary</span
              >
            </div>
            <v-divider />
            <div
              class="px-5 py-4 text-body-2 grey--text text--darken-3 text-break"
            >
              {{ report.summary || "No summary available." }}
            </div>
          </v-card>

          <!-- Issues -->
          <v-card outlined rounded="lg" class="mb-4">
            <div class="d-flex align-center px-5 py-4">
              <v-avatar
                size="32"
                tile
                color="red lighten-5"
                class="rounded-lg mr-3"
              >
                <v-icon size="16" color="error">$circle-alert</v-icon>
              </v-avatar>
              <span
                class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
                >Detected issues</span
              >
              <v-chip
                v-if="issues.length"
                x-small
                label
                color="red lighten-5"
                text-color="error"
                class="font-weight-bold ml-2"
              >
                {{ issues.length }}
              </v-chip>
            </div>
            <v-divider />

            <div v-if="!issues.length" class="d-flex align-center px-5 py-5">
              <v-avatar size="36" color="green lighten-5" class="mr-3">
                <v-icon size="18" color="success">$circle-check</v-icon>
              </v-avatar>
              <span
                class="text-body-2 font-weight-bold grey--text text--darken-3"
              >
                No issues detected in this call.
              </span>
            </div>

            <v-timeline v-else dense align-top class="pr-4">
              <v-timeline-item
                v-for="(issue, i) in issues"
                :key="issue._id || i"
                color="error"
                small
              >
                <v-sheet outlined rounded="lg" class="pa-4">
                  <div class="d-flex flex-wrap align-center mb-2">
                    <span
                      class="text-body-2 font-weight-bold grey--text text--darken-4 text-capitalize text-break mr-2"
                    >
                      {{ issue.issue }}
                    </span>
                    <v-chip
                      v-if="issue.timestamp"
                      x-small
                      label
                      color="grey lighten-4"
                      class="font-weight-bold"
                    >
                      <v-icon left size="10">$clock</v-icon>
                      {{ issue.timestamp }}
                    </v-chip>
                  </div>
                  <div
                    class="text-body-2 grey--text text--darken-2 text-break mb-3"
                  >
                    {{ issue.explanation }}
                  </div>
                  <v-sheet
                    v-if="issue.suggestion"
                    color="green lighten-5"
                    rounded="lg"
                    class="pa-3 mb-3"
                  >
                    <div
                      class="text-caption font-weight-bold green--text text--darken-2 mb-1"
                    >
                      Suggestion
                    </div>
                    <div
                      class="text-body-2 grey--text text--darken-3 text-break"
                    >
                      {{ issue.suggestion }}
                    </div>
                  </v-sheet>
                  <v-btn
                    v-if="issue.seconds != null"
                    small
                    outlined
                    color="primary"
                    @click="jumpTo(issue.seconds)"
                  >
                    <v-icon left size="14">$play</v-icon>
                    Play from {{ issue.timestamp || `${issue.seconds}s` }}
                  </v-btn>
                </v-sheet>
              </v-timeline-item>
            </v-timeline>
          </v-card>

          <!-- Transcript -->
          <v-card outlined rounded="lg">
            <div class="d-flex align-center px-5 py-4">
              <v-avatar
                size="32"
                tile
                color="grey lighten-4"
                class="rounded-lg mr-3"
              >
                <v-icon size="16" color="grey darken-2"
                  >$message-square-text</v-icon
                >
              </v-avatar>
              <span
                class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
                >Transcript</span
              >
            </div>
            <v-divider />
            <v-sheet
              color="grey lighten-5"
              max-height="480"
              class="overflow-y-auto px-5 py-4 rounded-b-lg"
            >
              <div
                class="text-body-2 grey--text text--darken-3 text-pre-wrap text-break"
              >
                {{ report.transcript || "No transcript available." }}
              </div>
            </v-sheet>
          </v-card>
        </v-col>

        <!-- RIGHT -->
        <v-col cols="12" md="4">
          <!-- Score -->
          <v-card
            outlined
            rounded="lg"
            class="d-flex flex-column align-center text-center pa-5 mb-4"
          >
            <div
              class="text-caption font-weight-bold text-uppercase grey--text mb-3"
            >
              Quality score
            </div>
            <v-progress-circular
              :value="report.qualityScore || 0"
              :color="scoreColor"
              size="120"
              width="10"
              class="mb-3"
            >
              <div>
                <div
                  class="text-h4 font-weight-bold"
                  :class="`${scoreColor}--text`"
                >
                  {{ report.qualityScore != null ? report.qualityScore : "—" }}
                </div>
                <div class="text-caption grey--text">out of 100</div>
              </div>
            </v-progress-circular>
            <v-chip
              small
              label
              :color="`${sentimentColor(report.sentiment)} lighten-5`"
              :text-color="sentimentColor(report.sentiment)"
              class="font-weight-bold text-capitalize"
            >
              <v-icon left size="14">{{ sentimentIcon }}</v-icon>
              {{ report.sentiment || "Unknown" }} sentiment
            </v-chip>
          </v-card>

          <!-- Details -->
          <v-card outlined rounded="lg">
            <div
              class="px-5 py-4 text-subtitle-2 font-weight-bold grey--text text--darken-4"
            >
              Call details
            </div>
            <v-divider />
            <template v-for="(d, i) in details">
              <v-divider v-if="i > 0" :key="`d-${d.label}`" />
              <div :key="d.label" class="d-flex align-start px-5 py-3">
                <v-icon
                  size="16"
                  color="grey"
                  class="mr-3 mt-1 flex-shrink-0"
                  >{{ d.icon }}</v-icon
                >
                <div class="overflow-hidden">
                  <div class="text-caption grey--text">{{ d.label }}</div>
                  <div class="text-body-2 grey--text text--darken-4 text-break">
                    {{ d.value }}
                  </div>
                </div>
              </div>
            </template>
          </v-card>
        </v-col>
      </v-row>
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
      const { data } = await apiClient.get(`/call-analysis/report/${id}`);
      this.report = data?.data;
    } catch (err) {
      console.error(err);
    }

    this.loading = false;
  },

  computed: {
    issues() {
      return Array.isArray(this.report?.issues) ? this.report.issues : [];
    },
    initial() {
      return (
        (this.report?.agentName || "?").trim().charAt(0).toUpperCase() || "?"
      );
    },
    scoreColor() {
      const s = this.report?.qualityScore;
      if (s == null) return "grey";
      return s >= 70 ? "success" : "error";
    },
    sentimentIcon() {
      const s = this.report?.sentiment;
      if (s === "positive") return "$thumbs-up";
      if (s === "negative") return "$circle-alert";
      return "$minus";
    },
    details() {
      const r = this.report || {};
      return [
        {
          label: "Agent email",
          value: r.agentEmail || "—",
          icon: "$message-square",
        },
        {
          label: "Language",
          value: r.language || "Not detected",
          icon: "$globe",
        },
        { label: "Batch ID", value: r.batchId || "—", icon: "$folder" },
        { label: "Call ID", value: r._id || "—", icon: "$tag" },
      ];
    },
  },

  methods: {
    goBack() {
      if (this.report?.batchId)
        this.$router.push(`/batch-analysis/${this.report.batchId}`);
      else this.$router.back();
    },

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
      audio.scrollIntoView({ behavior: "smooth", block: "center" });
    },
  },
};
</script>
