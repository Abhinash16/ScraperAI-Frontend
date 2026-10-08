<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
          Calls
        </h1>
        <div class="text-body-2 grey--text text--darken-1">
          Upload batches of call recordings and see how each agent's calls
          scored.
        </div>
      </div>
      <v-spacer />
      <v-btn
        depressed
        color="primary"
        class="font-weight-bold mb-2"
        @click="uploadDialog = true"
      >
        <v-icon left size="16">$upload</v-icon>
        Upload batch
      </v-btn>
    </div>

    <ThingsToKnow feature="call-analysis" />

    <!-- SUMMARY -->
    <v-row dense class="mb-3">
      <v-col v-for="t in summary" :key="t.label" cols="6" md="3">
        <v-card
          outlined
          rounded="lg"
          class="d-flex align-center pa-4 fill-height"
        >
          <v-avatar
            size="44"
            tile
            :color="`${t.tone} lighten-5`"
            class="rounded-lg mr-3 flex-shrink-0"
          >
            <v-icon size="22" :color="t.tone">{{ t.icon }}</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold grey--text text--darken-4">
              {{ t.value }}
            </div>
            <div class="text-caption grey--text text--darken-1">
              {{ t.label }}
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- SEARCH -->
    <v-card outlined rounded="lg" class="px-3 py-2 mb-4">
      <v-row dense align="center">
        <v-col cols="12" sm="7" md="5">
          <v-text-field
            v-model="search"
            placeholder="Search batches"
            outlined
            dense
            clearable
            hide-details
          />
        </v-col>
        <v-spacer />
        <v-col
          cols="12"
          sm="auto"
          class="text-caption grey--text text--darken-1"
        >
          {{ batches.length }} batch{{ batches.length === 1 ? "" : "es" }}
        </v-col>
      </v-row>
    </v-card>

    <!-- BATCHES -->
    <v-data-iterator
      :items="batches"
      :search="search"
      :loading="loading && !batches.length"
      :items-per-page="10"
      :footer-props="{ itemsPerPageOptions: [10, 20, 50] }"
      item-key="_id"
    >
      <template #loading>
        <v-card v-for="n in 3" :key="n" outlined rounded="lg" class="pa-2 mb-3">
          <v-skeleton-loader type="list-item-avatar-two-line" />
        </v-card>
      </template>

      <template #no-data>
        <v-card
          outlined
          rounded="lg"
          class="d-flex flex-column align-center text-center px-6 py-12 mb-3"
        >
          <v-avatar color="primary lighten-5" size="64" class="mb-4">
            <v-icon size="28" color="primary">$phone-call</v-icon>
          </v-avatar>
          <div
            class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1"
          >
            No batches yet
          </div>
          <div class="text-body-2 grey--text text--darken-1 mb-4">
            Upload a batch of call recordings and each call gets transcribed and
            scored.
          </div>
          <v-btn depressed color="primary" @click="uploadDialog = true">
            <v-icon left size="16">$upload</v-icon>
            Upload batch
          </v-btn>
        </v-card>
      </template>

      <template #no-results>
        <v-card
          outlined
          rounded="lg"
          class="text-center text-body-2 grey--text py-10 mb-3"
        >
          No batches match "{{ search }}".
        </v-card>
      </template>

      <template #default="{ items }">
        <v-card
          v-for="item in items"
          :key="item._id"
          outlined
          rounded="lg"
          class="d-flex flex-wrap align-center pa-4 mb-3"
          @click="openBatch(item)"
        >
          <div class="d-flex align-center flex-grow-1 mr-4 overflow-hidden">
            <v-avatar
              size="44"
              tile
              color="primary lighten-5"
              class="rounded-lg mr-4 flex-shrink-0"
            >
              <v-icon size="22" color="primary">$phone-call</v-icon>
            </v-avatar>
            <div class="overflow-hidden">
              <div class="d-flex flex-wrap align-center">
                <span
                  class="text-body-2 font-weight-bold grey--text text--darken-4 text-break mr-2"
                >
                  {{ item.batchName }}
                </span>
                <v-chip
                  x-small
                  label
                  :color="statusColor(item.status)"
                  text-color="white"
                  class="font-weight-bold text-capitalize"
                >
                  {{ item.status }}
                </v-chip>
              </div>
              <div
                class="d-flex flex-wrap align-center text-caption grey--text text--darken-1 mt-1"
              >
                <span class="d-inline-flex align-center mr-4">
                  <v-icon size="12" class="mr-1">$phone</v-icon>
                  {{ item.totalCalls || 0 }} call{{
                    item.totalCalls === 1 ? "" : "s"
                  }}
                </span>
                <span class="d-inline-flex align-center">
                  <v-icon size="12" class="mr-1">$clock</v-icon>
                  {{ formatDate(item.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <div class="d-flex align-center ml-auto mt-3 mt-sm-0">
            <div class="text-right mr-4">
              <div
                class="text-h6 font-weight-bold"
                :class="scoreText(item.averageQualityScore)"
              >
                {{ formatScore(item.averageQualityScore) }}
              </div>
              <div class="text-caption grey--text">Avg score</div>
            </div>
            <v-btn
              small
              depressed
              color="primary"
              @click.stop="openBatch(item)"
            >
              View calls
              <v-icon right size="14">$arrow-right</v-icon>
            </v-btn>
          </div>
        </v-card>
      </template>
    </v-data-iterator>

    <!-- UPLOAD BATCH -->
    <v-dialog v-model="uploadDialog" max-width="640" persistent scrollable>
      <v-card rounded="lg">
        <div class="d-flex align-center pa-5">
          <v-avatar
            color="primary lighten-5"
            size="44"
            tile
            class="rounded-lg mr-4 flex-shrink-0"
          >
            <v-icon color="primary" size="22">$phone-call</v-icon>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-h6 font-weight-bold grey--text text--darken-4">
              Upload call batch
            </div>
            <div class="text-caption grey--text text--darken-1">
              Add several call recordings at once, as JSON or one by one.
            </div>
          </div>
          <v-btn
            icon
            aria-label="Close"
            :disabled="loading"
            @click="uploadDialog = false"
          >
            <v-icon>$x</v-icon>
          </v-btn>
        </div>
        <v-divider />

        <v-card-text class="pa-5">
          <v-text-field
            v-model="batchName"
            label="Batch name"
            placeholder="Example: Sales Calls - July"
            outlined
            dense
          />

          <v-tabs
            v-model="tab"
            color="primary"
            background-color="transparent"
            height="40"
            slider-size="3"
          >
            <v-tab class="text-body-2 font-weight-bold">
              <v-icon size="14" class="mr-2">$braces</v-icon>
              JSON
            </v-tab>
            <v-tab disabled class="text-body-2 font-weight-bold">
              <v-icon size="14" class="mr-2">$file-spreadsheet</v-icon>
              CSV (soon)
            </v-tab>
            <v-tab class="text-body-2 font-weight-bold">
              <v-icon size="14" class="mr-2">$pencil</v-icon>
              One by one
            </v-tab>
          </v-tabs>
          <v-divider class="mb-4" />

          <v-tabs-items v-model="tab">
            <!-- JSON -->
            <v-tab-item>
              <v-textarea
                v-model="callsJson"
                label="Calls as JSON"
                outlined
                rows="6"
                placeholder='[ { "agent_name":"Rahul", "recording_url":"https://...", "email":"rahul@company.com" } ]'
              />
              <v-sheet
                color="grey lighten-5"
                rounded="lg"
                class="d-flex align-start pa-3"
              >
                <v-icon size="14" color="grey darken-1" class="mr-2 mt-1"
                  >$info</v-icon
                >
                <div class="text-caption grey--text text--darken-2">
                  A list of calls, each with <strong>agent_name</strong>,
                  <strong>recording_url</strong> and <strong>email</strong>.
                  Example:
                  <div class="text-break mt-1">
                    [ { "agent_name":"Rahul", "recording_url":"https://...",
                    "email":"rahul@company.com" } ]
                  </div>
                </div>
              </v-sheet>
            </v-tab-item>

            <!-- CSV -->
            <v-tab-item>
              <v-file-input
                v-model="csvFile"
                outlined
                dense
                accept=".csv"
                label="Upload CSV File"
                prepend-icon=""
                show-size
              />
            </v-tab-item>

            <!-- One by one -->
            <v-tab-item>
              <v-row dense>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="manualForm.agent_name"
                    label="Agent name"
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
                    label="Agent email"
                    outlined
                    dense
                  />
                </v-col>
              </v-row>
              <div class="text-right">
                <v-btn
                  small
                  outlined
                  color="primary"
                  :disabled="!manualReady"
                  @click="addManualCall"
                >
                  <v-icon left size="14">$plus</v-icon>
                  Add call
                </v-btn>
              </div>

              <v-sheet
                v-if="manualCalls.length"
                outlined
                rounded="lg"
                class="mt-4"
              >
                <div
                  class="text-caption font-weight-bold text-uppercase grey--text px-4 pt-3 pb-2"
                >
                  {{ manualCalls.length }} call{{
                    manualCalls.length === 1 ? "" : "s"
                  }}
                  added
                </div>
                <template v-for="(call, i) in manualCalls">
                  <v-divider :key="`d-${i}`" />
                  <div :key="i" class="d-flex align-center px-4 py-2">
                    <div class="flex-grow-1 overflow-hidden mr-2">
                      <div
                        class="text-body-2 font-weight-bold grey--text text--darken-4"
                      >
                        {{ call.agent_name }}
                      </div>
                      <div
                        class="text-caption grey--text text--darken-1 text-truncate"
                      >
                        {{ call.email }} · {{ call.recording_url }}
                      </div>
                    </div>
                    <v-btn
                      icon
                      small
                      color="error"
                      aria-label="Remove call"
                      @click="removeManualCall(i)"
                    >
                      <v-icon size="16">$trash-2</v-icon>
                    </v-btn>
                  </div>
                </template>
              </v-sheet>
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>

        <v-divider />
        <v-card-actions class="px-6 py-3">
          <v-spacer />
          <v-btn text :disabled="loading" @click="uploadDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="primary"
            depressed
            :disabled="loading || !batchName"
            :loading="loading"
            @click="uploadBatch"
          >
            <v-icon left size="16">$upload</v-icon>
            Upload batch
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import apiClient from "@/service/axios";

export default {
  components: { ThingsToKnow },

  data() {
    return {
      search: "",
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

  computed: {
    manualReady() {
      const f = this.manualForm;
      return !!(f.agent_name && f.recording_url && f.email);
    },
    // Totals across the loaded batches
    summary() {
      const list = this.batches || [];
      const calls = list.reduce((n, b) => n + (b.totalCalls || 0), 0);
      const scored = list.filter(
        (b) => typeof b.averageQualityScore === "number"
      );
      const avg = scored.length
        ? scored.reduce((n, b) => n + b.averageQualityScore, 0) / scored.length
        : null;
      const processing = list.filter((b) => b.status === "processing").length;
      return [
        {
          label: "Batches",
          value: list.length,
          icon: "$folder",
          tone: "indigo",
        },
        { label: "Calls", value: calls, icon: "$phone", tone: "blue" },
        {
          label: "Average score",
          value: this.formatScore(avg),
          icon: "$star",
          tone: "amber",
        },
        {
          label: "Processing",
          value: processing,
          icon: "$loader-circle",
          tone: "orange",
        },
      ];
    },
  },

  methods: {
    formatDate(date) {
      return new Date(date).toLocaleString();
    },

    openBatch(item) {
      this.$router.push(`/batch-analysis/${item._id}`);
    },

    formatScore(score) {
      return typeof score === "number" && score
        ? Math.round(score * 100) / 100
        : "—";
    },

    scoreText(score) {
      if (typeof score !== "number" || !score) return "grey--text";
      return score >= 4 ? "success--text" : "error--text";
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

      this.batches = data?.data;

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
