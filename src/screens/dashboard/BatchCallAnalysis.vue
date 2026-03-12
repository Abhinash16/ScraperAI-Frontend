<template>
  <div>
    <!-- Header Section -->
    <v-row class="mb-6">
      <v-col cols="auto">
        <v-btn icon text color="primary" @click="$router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>
      <v-col>
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">Batch Call Analysis</h1>
          <p class="text-subtitle-2 grey--text mb-0">
            Insights and performance metrics from processed calls
          </p>
          <p>{{ batchInfo.batchName }}</p>
        </div>
      </v-col>
    </v-row>

    <!-- Batch Summary Card -->
    <v-card outlined rounded="xl" class="mb-8 overflow-hidden">
      <v-card-text class="pa-0">
        <v-expansion-panels flat>
          <v-expansion-panel>
            <v-expansion-panel-header class="pa-6">
              <div class="d-flex align-center w-100">
                <!-- Quality Score Badge -->
                <div class="d-flex flex-column align-center mr-6">
                  <v-avatar
                    :color="
                      batchInfo.averageQualityScore >= 4 ? 'success' : 'error'
                    "
                    size="80"
                    class="elevation-2"
                  >
                    <span class="text-h5 font-weight-bold white--text">
                      {{
                        Math.round(batchInfo.averageQualityScore * 100) / 100 ||
                        "-"
                      }}
                    </span>
                  </v-avatar>
                  <span class="text-caption grey--text mt-2"
                    >Quality Score</span
                  >
                </div>

                <!-- Summary Content -->
                <div class="flex-grow-1">
                  <h3 class="text-h6 font-weight-medium mb-2">
                    {{ batchInfo.batchSummary }}
                  </h3>
                  <div class="d-flex gap-4 flex-wrap">
                    <div>
                      <span class="text-caption grey--text">Total Calls</span>
                      <p class="text-subtitle-1 font-weight-bold">
                        {{ calls.length }}
                      </p>
                    </div>
                    <div>
                      <span class="text-caption grey--text">Success Rate</span>
                      <p class="text-subtitle-1 font-weight-bold success--text">
                        {{ successRate }}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-divider class="mb-6" />

              <div class="mb-2">
                <h4 class="text-subtitle-1 font-weight-bold mb-4">
                  <v-icon small class="mr-2">mdi-lightbulb-outline</v-icon>
                  Key Insights & Recommendations
                </h4>
              </div>

              <v-row>
                <v-col
                  cols="12"
                  md="6"
                  v-for="(insight, index) in batchInfo.batchInsights"
                  :key="index"
                >
                  <v-card outlined rounded="xl" class="h-100">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-center mb-3">
                        <v-icon small color="primary" class="mr-2">
                          mdi-alert-circle-outline
                        </v-icon>
                        <span class="font-weight-bold text-body-2">
                          {{ insight.issue }}
                        </span>
                      </div>

                      <v-chip
                        small
                        outlined
                        label
                        color="grey"
                        class="mb-4 rounded-xl"
                      >
                        <v-icon small left>mdi-repeat</v-icon>
                        {{ insight.frequency }} occurrences
                      </v-chip>

                      <div
                        class="text-caption grey--text mb-2 font-weight-bold"
                      >
                        Suggested Action
                      </div>

                      <p class="text-body-2 mb-0">
                        {{ insight.suggestion }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>

    <!-- Calls Table Section -->
    <div>
      <h3 class="text-h6 font-weight-bold mb-4">Call Details</h3>

      <v-card outlined rounded="xl" class="overflow-hidden">
        <v-data-table
          :headers="callHeaders"
          :items="calls"
          :loading="loading"
          loading-text="Loading calls..."
          no-data-text="No calls available"
          mobile-breakpoint="600"
          class="elevation-0"
        >
          <!-- Agent Name -->
          <template v-slot:[`item.agentName`]="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="32" color="primary" class="mr-3">
                <span class="white--text text-caption font-weight-bold">
                  {{ item.agentName.charAt(0) }}
                </span>
              </v-avatar>
              <span class="font-weight-medium">{{ item.agentName }}</span>
            </div>
          </template>

          <!-- Recording -->
          <template v-slot:[`item.recordingUrl`]="{ item }">
            <v-btn
              small
              color="primary"
              text
              :href="item.recordingUrl"
              target="_blank"
              @click.stop
            >
              <v-icon left small>mdi-headphones</v-icon>
              Open
            </v-btn>
          </template>

          <!-- Status -->
          <template v-slot:[`item.status`]="{ item }">
            <v-chip
              small
              :color="statusColor(item.status)"
              class="rounded-xl"
              :text-color="statusTextColor(item.status)"
              label
            >
              <v-icon left small>{{ statusIcon(item.status) }}</v-icon>
              {{ item.status | capitalize }}
            </v-chip>
          </template>

          <!-- Quality Score -->
          <template v-slot:[`item.qualityScore`]="{ item }">
            <div class="">
              <!-- <v-progress-linear
                :value="(item.qualityScore / 100) * 100"
                :color="item.qualityScore >= 4 ? 'success' : 'error'"
                height="4"
                class="mr-2"
                style="width: 60px"
              /> -->
              <span
                :class="
                  item.qualityScore >= 4 ? 'success--text' : 'error--text'
                "
                class="font-weight-bold text-body-2"
              >
                {{ item.qualityScore || "-" }}
              </span>
            </div>
          </template>

          <!-- Actions -->
          <template v-slot:[`item.actions`]="{ item }">
            <div class="gap-2">
              <v-btn
                v-if="item.status === 'failed'"
                small
                color="primary"
                outlined
                rounded
                :loading="retryingId === item._id"
                @click="retryCall(item._id)"
              >
                <v-icon small left>mdi-refresh</v-icon>
                Retry
              </v-btn>

              <v-btn
                v-if="item.status === 'completed'"
                small
                color="primary"
                outlined
                rounded
                @click="viewReport(item)"
              >
                <v-icon small left>mdi-file-document-outline</v-icon>
                Report
              </v-btn>

              <v-menu offset-y v-if="item.status === 'processing'">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn small icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="viewReport(item)">
                    <v-list-item-icon>
                      <v-icon>mdi-file-document-outline</v-icon>
                    </v-list-item-icon>
                    <v-list-item-title>View Details</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  filters: {
    capitalize(value) {
      if (!value) return "";
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },

  data() {
    return {
      calls: [],
      batchInfo: {
        averageQualityScore: 0,
        batchSummary: "",
        batchInsights: [],
      },
      loading: false,
      retryingId: null,

      callHeaders: [
        { text: "Agent", value: "agentName", align: "start" },
        {
          text: "Recording",
          value: "recordingUrl",
          align: "start",
          sortable: false,
        },
        { text: "Status", value: "status", align: "center" },
        { text: "Quality Score", value: "qualityScore", align: "center" },
        { text: "Action", value: "actions", align: "center", sortable: false },
      ],
    };
  },

  computed: {
    successRate() {
      if (this.calls.length === 0) return 0;
      const completed = this.calls.filter(
        (call) => call.status === "completed",
      ).length;
      return Math.round((completed / this.calls.length) * 100);
    },
  },

  mounted() {
    this.fetchBatch();
  },

  methods: {
    statusColor(status) {
      const colorMap = {
        completed: "success",
        failed: "error",
        processing: "warning",
      };
      return colorMap[status] || "grey";
    },

    statusTextColor(status) {
      const textColorMap = {
        completed: "white",
        failed: "white",
        processing: "white",
      };
      return textColorMap[status] || "black";
    },

    statusIcon(status) {
      const iconMap = {
        completed: "mdi-check-circle",
        failed: "mdi-alert-circle",
        processing: "mdi-clock-outline",
      };
      return iconMap[status] || "mdi-help-circle";
    },

    async fetchBatch() {
      try {
        this.loading = true;
        const batchId = this.$route.params.id;

        const { data } = await apiClient.get(`/call-analysis/batch/${batchId}`);

        this.batchInfo = data.batch || {
          averageQualityScore: 0,
          batchSummary: "",
          batchInsights: [],
        };
        this.calls = data.calls || [];
      } catch (error) {
        console.error("Failed to fetch batch:", error);
      } finally {
        this.loading = false;
      }
    },

    async retryCall(callId) {
      try {
        this.retryingId = callId;
        await apiClient.post(`/call-analysis/retry/${callId}`);
        await this.fetchBatch();
      } catch (error) {
        console.error("Failed to retry call:", error);
      } finally {
        this.retryingId = null;
      }
    },

    viewReport(call) {
      this.$router.push(`/call-analysis/report/${call._id}`);
    },
  },
};
</script>
