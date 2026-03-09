<template>
  <div>
    <v-overlay :value="loading">
      <v-progress-circular indeterminate size="70" />
    </v-overlay>

    <v-card outlined rounded="xl">
      <div class="d-flex justify-space-between align-center pa-4">
        <div>
          <div class="text-h6 font-weight-bold">Call Analysis Batches</div>
          <div class="text-body-2 grey--text">
            {{ batches.length }} batches processed
          </div>
        </div>

        <v-btn color="primary" rounded depressed @click="uploadDialog = true">
          Upload Batch
        </v-btn>
      </div>

      <v-divider />

      <!-- Batch Table -->

      <v-simple-table>
        <thead>
          <tr>
            <th>Batch Name</th>
            <th>Total Calls</th>
            <th>Average Quality Score</th>
            <th>Status</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="batch in batches" :key="batch._id">
            <td>{{ batch.batchName }}</td>

            <td>{{ batch.totalCalls }}</td>
            <td>
              <span
                :class="
                  batch.averageQualityScore >= 4 ? 'green--text' : 'red--text'
                "
              >
                {{ Math.round(batch.averageQualityScore * 100) / 100 || "-" }}
              </span>
            </td>

            <td>
              <v-chip small outlined color="primary">
                {{ batch.status }}
              </v-chip>
            </td>

            <td>{{ formatDate(batch.createdAt) }}</td>

            <td>
              <v-btn
                small
                rounded
                depressed
                color="primary"
                @click="openBatch(batch._id)"
              >
                View Calls
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>

    <!-- CALLS DIALOG -->

    <v-dialog v-model="batchDialog" max-width="1000">
      <v-card rounded="xl">
        <v-card-title>
          Calls in Batch
          <v-spacer />
          <v-btn icon @click="batchDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-container>
          <v-expansion-panels>
            <v-expansion-panel>
              <v-expansion-panel-header>
                <h1
                  :class="
                    batchInfo.averageQualityScore >= 4
                      ? 'green--text'
                      : 'red--text'
                  "
                >
                  {{
                    Math.round(batchInfo.averageQualityScore * 100) / 100 || "-"
                  }}
                </h1>
                {{ batchInfo.batchSummary }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-card
                  outlined
                  class="my-2"
                  v-for="(insights, index) in batchInfo.batchInsights"
                  :key="index"
                >
                  <v-container>
                    <div>{{ insights.issue }}</div>
                    <div>
                      <strong>Frequency:</strong> {{ insights.frequency }}
                    </div>
                    <div>
                      <strong>Suggestion:</strong> {{ insights.suggestion }}
                    </div>
                  </v-container>
                </v-card>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-container>
        <v-divider />

        <v-simple-table>
          <thead>
            <tr>
              <th>Agent</th>
              <th>Recording</th>
              <th>Status</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="call in calls" :key="call._id">
              <td>{{ call.agentName }}</td>

              <td>
                <a :href="call.recordingUrl" target="_blank"> Open Audio </a>
              </td>

              <td>
                <v-chip small :color="statusColor(call.status)" outlined>
                  {{ call.status }}
                </v-chip>
              </td>

              <td>
                {{ call.qualityScore || "-" }}
              </td>

              <td>
                <v-btn
                  v-if="call.status === 'failed'"
                  small
                  color="primary"
                  rounded
                  depressed
                  @click="retryCall(call._id)"
                >
                  Retry
                </v-btn>

                <v-btn
                  v-if="call.status === 'completed'"
                  small
                  outlined
                  rounded
                  @click="viewReport(call)"
                >
                  View Report
                </v-btn>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card>
    </v-dialog>

    <!-- Upload Batch -->

    <v-dialog v-model="uploadDialog" max-width="600">
      <v-card rounded="xl">
        <v-card-title> Upload Call Batch </v-card-title>

        <v-card-text>
          <v-text-field label="Batch Name" v-model="batchName" outlined />

          <v-textarea
            label="Paste Calls JSON"
            v-model="callsJson"
            outlined
            rows="6"
          />

          <div class="text-caption grey--text">
            Format: [ { "agent_name":"Rahul", "recording_url":"https://...",
            "email":"rahul@company.com" } ]
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn text @click="uploadDialog = false"> Cancel </v-btn>

          <v-btn color="primary" rounded depressed @click="uploadBatch">
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      loading: false,

      batches: [],
      calls: [],
      batchInfo: [],

      batchDialog: false,
      uploadDialog: false,

      batchName: "",
      callsJson: "",
    };
  },

  mounted() {
    this.fetchBatches();
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString();
    },

    statusColor(status) {
      if (status === "completed") return "success";
      if (status === "failed") return "error";
      if (status === "processing") return "warning";

      return "grey";
    },

    async fetchBatches() {
      this.loading = true;

      const { data } = await apiClient.get("/call-analysis/batches");

      this.batches = data;

      this.loading = false;
    },

    async openBatch(batchId) {
      const { data } = await apiClient.get(`/call-analysis/batch/${batchId}`);

      this.batchInfo = data.batch;
      this.calls = data.calls;

      this.batchDialog = true;
    },

    async retryCall(callId) {
      await apiClient.post(`/call-analysis/retry/${callId}`);

      this.openBatch(this.calls[0].batchId);
    },

    viewReport(call) {
      this.$router.push(`/call-analysis/report/${call._id}`);
    },

    async uploadBatch() {
      try {
        const calls = JSON.parse(this.callsJson);

        await apiClient.post("/call-analysis/batch-upload", {
          batchName: this.batchName,
          calls,
        });

        this.uploadDialog = false;

        this.fetchBatches();
      } catch (e) {
        alert("Invalid JSON");
      }
    },
  },
};
</script>
