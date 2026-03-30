<template>
  <v-container class="pa-6">
    <!-- HEADER -->
    <v-row class="mb-6 align-center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Submissions</h1>
        <p class="text-subtitle-2 grey--text">
          Track and manage form responses
        </p>
      </v-col>

      <v-col cols="auto">
        <v-chip color="primary" outlined>
          {{ submissions.length }} Responses
        </v-chip>
      </v-col>
    </v-row>

    <!-- TABLE CARD -->
    <v-card outlined rounded="xl">
      <div class="pa-4">
        <div class="text-h6 font-weight-bold">All Submissions</div>
        <div class="text-caption grey--text">
          Update stages and review responses
        </div>
      </div>

      <v-divider />

      <!-- EMPTY -->
      <div
        v-if="!submissions.length && !loading"
        class="text-center py-10 grey--text"
      >
        No submissions yet
      </div>

      <!-- TABLE -->
      <v-data-table
        v-else
        :items="submissions"
        :headers="headers"
        :loading="loading"
        class="elevation-0"
      >
        <!-- SUBMISSION DATA -->
        <template v-slot:[`item.submitted_data`]="{ item }">
          <div class="d-flex flex-column">
            <div
              v-for="(value, key) in item.submitted_data"
              :key="key"
              class="text-caption mb-1"
            >
              <strong>{{ key }}:</strong> {{ value }}
            </div>
          </div>
        </template>

        <!-- STAGE -->
        <template v-slot:[`item.stage`]="{ item }">
          <v-select
            :items="stages"
            v-model="item.current_stage._id"
            dense
            outlined
            hide-details
            class="stage-select"
            @change="updateStage(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- LOADER -->
    <v-overlay :value="loading" opacity="0.1">
      <v-progress-circular indeterminate size="50" />
    </v-overlay>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      submissions: [],
      stages: [],
      loading: false,

      headers: [
        { text: "Submission Data", value: "submitted_data" },
        { text: "Stage", value: "stage", width: "200px" },
      ],
    };
  },

  mounted() {
    this.load();
  },

  methods: {
    async load() {
      const id = this.$route.params.id;

      this.loading = true;

      try {
        const res = await apiClient.get(`/forms/${id}/submissions`);
        this.submissions = res.data.data || [];

        const form = await apiClient.get(`/forms/${id}`);
        this.stages = form.data.data.stages.map((s) => ({
          text: s.stage_name,
          value: s._id,
        }));
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async updateStage(item) {
      try {
        await apiClient.put(`/forms/submissions/${item._id}/stage`, {
          stageId: item.current_stage._id,
        });
      } catch (err) {
        console.error("Stage update failed", err);
      }
    },
  },
};
</script>

<style scoped>
.stage-select {
  max-width: 180px;
}
</style>
