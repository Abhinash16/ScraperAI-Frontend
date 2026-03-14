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

          <v-tabs v-model="tab" class="mb-4">
            <v-tab>JSON Upload</v-tab>
            <v-tab disabled>CSV Upload</v-tab>
            <v-tab>Manual Entry</v-tab>
          </v-tabs>

          <v-tabs-items v-model="tab">
            <!-- JSON Upload -->
            <v-tab-item>
              <v-card flat>
                <v-textarea
                  label="Paste Calls JSON"
                  v-model="callsJson"
                  outlined
                  rows="6"
                  placeholder='[ { "agent_name":"Rahul", "recording_url":"https://...", "email":"rahul@company.com" } ]'
                />
              </v-card>
              <div class="text-caption grey--text mt-2">
                <v-icon x-small color="grey">mdi-information-outline</v-icon>
                Upload multiple call records at once using valid JSON format.
              </div>
              <div class="text-caption grey--text">
                Format: [ { "agent_name":"Rahul", "recording_url":"https://...",
                "email":"rahul@company.com" } ]
              </div>
            </v-tab-item>

            <!-- CSV Upload -->
            <v-tab-item>
              <v-card flat>
                <v-file-input
                  v-model="csvFile"
                  outlined
                  dense
                  accept=".csv"
                  label="Upload CSV File"
                  prepend-icon="mdi-file-delimited"
                  show-size
                />
              </v-card>
            </v-tab-item>

            <!-- Manual Entry -->
            <v-tab-item>
              <v-card flat>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="manualForm.agent_name"
                      label="Agent Name"
                      outlined
                      dense
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="manualForm.recording_url"
                      label="Recording URL"
                      outlined
                      dense
                    />
                  </v-col>

                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="manualForm.email"
                      label="Agent Email"
                      outlined
                      dense
                    />
                  </v-col>
                </v-row>

                <div class="text-right">
                  <v-btn
                    small
                    color="primary"
                    :disabled="
                      !this.manualForm.agent_name ||
                      !this.manualForm.recording_url ||
                      !this.manualForm.email
                    "
                    depressed
                    @click="addManualCall"
                  >
                    Add Call
                  </v-btn>
                </div>

                <v-simple-table v-if="manualCalls.length" class="mt-4">
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Recording</th>
                      <th>Email</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="(call, i) in manualCalls" :key="i">
                      <td>{{ call.agent_name }}</td>
                      <td class="text-truncate">{{ call.recording_url }}</td>
                      <td>{{ call.email }}</td>
                      <td>
                        <v-btn icon small @click="removeManualCall(i)">
                          <v-icon small>mdi-delete</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-simple-table>
              </v-card>
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>

        <!-- Actions -->
        <div class="px-6 pb-6 d-flex justify-end">
          <v-btn
            text
            rounded
            large
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
            :disabled="loading || !batchName"
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

      tab: 0,

      csvFile: null,

      manualForm: {
        agent_name: "",
        recording_url: "",
        email: "",
      },

      manualCalls: [],

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

    async retryCall(callId) {
      await apiClient.post(`/call-analysis/retry/${callId}`);

      this.openBatch(this.calls[0].batchId);
    },

    viewReport(call) {
      this.$router.push(`/call-analysis/report/${call._id}`);
    },
    addManualCall() {
      if (
        !this.manualForm.agent_name ||
        !this.manualForm.recording_url ||
        !this.manualForm.email
      ) {
        this.$toast.error("Please fill all fields");
        return;
      }

      this.manualCalls.push({
        agent_name: this.manualForm.agent_name,
        recording_url: this.manualForm.recording_url,
        email: this.manualForm.email,
      });

      this.manualForm = {
        agent_name: "",
        recording_url: "",
        email: "",
      };
    },

    removeManualCall(index) {
      this.manualCalls.splice(index, 1);
    },

    // async uploadBatch() {
    //   try {
    //     const calls = JSON.parse(this.callsJson);

    //     await apiClient.post("/call-analysis/batch-upload", {
    //       batchName: this.batchName,
    //       calls,
    //     });

    //     this.uploadDialog = false;

    //     this.fetchBatches();
    //   } catch (e) {
    //     alert("Invalid JSON");
    //   }
    // },

    async uploadBatch() {
      try {
        let calls = [];

        if (this.tab === 0) {
          if (!this.jsonFile) throw new Error("Upload JSON file");

          calls = JSON.parse(this.callsJson);
        } else if (this.tab === 1) {
          if (!this.csvFile) throw new Error("Upload CSV file");

          const text = await this.csvFile.text();

          const rows = text.split("\n");

          calls = rows.slice(1).map((row) => {
            const [agent_name, recording_url, email] = row.split(",");

            return {
              agent_name,
              recording_url,
              email,
            };
          });
        } else {
          if (!this.manualCalls.length)
            throw new Error("Add at least one call");

          calls = this.manualCalls;
        }

        this.loading = true;

        await apiClient.post("/call-analysis/batch-upload", {
          batchName: this.batchName,
          calls,
        });

        this.uploadDialog = false;
        this.fetchBatches();
      } catch (err) {
        alert(err.message);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
