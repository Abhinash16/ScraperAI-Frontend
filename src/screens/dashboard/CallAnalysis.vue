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
                @click="$router.push(`/batch-analysis/${batch._id}`)"
              >
                View Calls
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>

    <!-- Upload Batch -->

    <v-dialog
      v-model="uploadDialog"
      max-width="600"
      rounded="xl"
      persistent
      overlay-color="#2c3e50"
      overlay-opacity="0.8"
    >
      <v-card rounded="xl" :loading="loading" class="overflow-hidden">
        <!-- Header -->
        <div class="pa-6 pb-0 d-flex align-center">
          <v-avatar color="#eff2fb" rounded="xl" size="48" class="mr-4">
            <v-icon color="black">mdi-phone-plus</v-icon>
          </v-avatar>

          <div>
            <div class="text-h6 font-weight-bold black--text">
              Upload Call Batch
            </div>

            <div class="text-caption grey--text text--darken-1">
              Import multiple call recordings using JSON format
            </div>
          </div>

          <v-spacer></v-spacer>

          <v-btn icon @click="uploadDialog = false" :disabled="loading">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider class="mt-4"></v-divider>

        <!-- Form -->
        <v-card-text class="pa-6">
          <v-text-field
            label="Batch Name"
            v-model="batchName"
            outlined
            dense
            placeholder="Example: Sales Calls - July"
            class="mb-4"
          />

          <v-textarea
            label="Paste Calls JSON"
            v-model="callsJson"
            outlined
            rows="6"
            placeholder='[ { "agent_name":"Rahul", "recording_url":"https://...", "email":"rahul@company.com" } ]'
          />

          <div class="text-caption grey--text mt-2">
            <v-icon x-small color="grey">mdi-information-outline</v-icon>
            Upload multiple call records at once using valid JSON format.
          </div>
          <div class="text-caption grey--text">
            Format: [ { "agent_name":"Rahul", "recording_url":"https://...",
            "email":"rahul@company.com" } ]
          </div>
        </v-card-text>

        <!-- Actions -->
        <div class="px-6 pb-6 d-flex justify-end">
          <v-btn
            text
            class="mr-2 text-none"
            @click="uploadDialog = false"
            :disabled="loading"
          >
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            rounded
            depressed
            large
            class="text-none"
            :loading="loading"
            @click="uploadBatch"
          >
            Upload Batch
          </v-btn>
        </div>
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
      callHeaders: [
        { text: "Agent", value: "agentName" },
        { text: "Recording", value: "recordingUrl" },
        { text: "Status", value: "status" },
        { text: "Score", value: "qualityScore" },
        { text: "Action", value: "actions", sortable: false },
      ],
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
