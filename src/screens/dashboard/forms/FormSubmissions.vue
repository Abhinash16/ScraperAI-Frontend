<template>
  <v-container fluid class="pa-6">
    <!-- HEADER -->

    <v-row class="align-center">
      <v-col>
        <div class="d-flex align-center">
          <h1 class="text-h5 font-weight-bold mr-3">{{ formName }}</h1>
        </div>
      </v-col>
    </v-row>

    <v-row dense class="mb-4 flex-nowrap overflow-auto">
      <!-- Stage Buttons -->
      <v-col v-for="stage in stages" :key="stage.stageId" cols="auto">
        <v-btn
          class="ma-1"
          rounded
          :color="selectedStage === stage.stageId ? 'primary' : 'grey'"
          :outlined="selectedStage !== stage.stageId"
          @click="selectStage(stage)"
          depressed
        >
          {{ stage.stage }} ({{ stage.total }})
        </v-btn>
      </v-col>

      <!-- ➕ Add Stage Button -->
      <v-col cols="auto">
        <v-btn color="success" rounded class="ma-1" outlined @click="addStage">
          + Add Stage
        </v-btn>
      </v-col>
    </v-row>

    <!-- CARD -->
    <v-card class="rounded-xl elevation-0" outlined>
      <!-- EMPTY STATE -->
      <div
        v-if="!submissions.length && !loading"
        class="text-center py-12 grey--text"
      >
        <v-icon size="48" class="mb-2">mdi-database-off-outline</v-icon>
        <div class="text-subtitle-2">No submissions yet</div>
      </div>

      <!-- TABLE -->
      <v-data-table
        v-else
        :items="submissions"
        :headers="headers"
        :loading="loading"
      >
        <!-- DYNAMIC FIELDS -->
        <template
          v-for="(field, index) in dynamicFields"
          v-slot:[`item.${field.value}`]="{ item }"
        >
          <div :key="index" class="py-1">
            <span class="text-body-2">
              {{ item[field.value] || "-" }}
            </span>
          </div>
        </template>

        <!-- STAGE -->
        <template v-slot:[`item.stage`]="{ item }">
          <v-chip small :color="getStageColor(item.current_stage)" dark>
            {{ item.current_stage?.stage_name || "New" }}
          </v-chip>
        </template>

        <!-- ACTION -->
        <template v-slot:[`item.action`]="{ item }">
          <div class="d-flex align-center">
            <v-btn icon small @click="openCommentDialog(item)">
              <v-icon small>mdi-comment-processing-outline</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- LOADER -->
    <v-overlay :value="loading" opacity="0.05">
      <v-progress-circular indeterminate size="50" />
    </v-overlay>

    <!-- COMMENTS DIALOG -->
    <v-dialog v-model="commentDialog" rounded="xl" max-width="520">
      <v-card rounded="xl" :loading="loading">
        <!-- HEADER -->
        <div class="pa-4 d-flex align-center justify-space-between">
          <div>
            <div class="text-h6 font-weight-bold">Activity</div>
            <div class="text-caption grey--text">
              Update stage & add comments
            </div>
          </div>

          <v-btn icon @click="commentDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider />

        <!-- COMMENTS -->
        <v-card-text
          style="max-height: 260px; overflow-y: auto"
          class="pa-4 grey lighten-5"
        >
          <div v-if="!comments.length" class="text-center grey--text py-8">
            <v-icon large color="grey lighten-2">mdi-message-off</v-icon>
            <div>No activity yet</div>
          </div>

          <v-card
            v-for="c in comments"
            :key="c._id"
            outlined
            class="mb-3"
            rounded="lg"
            elevation="0"
          >
            <v-card-text class="pa-3">
              <div class="text-body-2">{{ c.message }}</div>

              <div class="text-caption grey--text mt-1">
                {{ formatDate(c.createdAt) }}
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-divider />

        <!-- FORM -->
        <div class="pa-4">
          <!-- Stage -->
          <v-select
            v-model="selectedStageId"
            :items="stages"
            item-text="stage"
            item-value="stageId"
            label="Change Stage"
            dense
            outlined
            class="mb-3"
          />

          <!-- Comment -->
          <v-textarea
            v-model="comment"
            label="Add comment (optional)"
            rows="2"
            dense
            outlined
          />

          <!-- ACTION -->
          <div class="d-flex justify-end mt-4">
            <v-btn text rounded @click="commentDialog = false"> Cancel </v-btn>

            <v-btn
              color="primary"
              depressed
              rounded
              class="ml-2"
              :loading="loading"
              @click="submitStageAndComment"
            >
              Save Changes
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      submissions: [],
      loading: false,
      headers: [],
      dynamicFields: [],
      stages: [],
      selectedStage: null, // ✅ NEW
      formName: "",

      changeStageDialog: false,
      selectedItem: null,
      selectedStageId: null,
      comment: "",

      commentDialog: false,
      comments: [],
      newComment: "",
    };
  },

  mounted() {
    this.load();
  },

  methods: {
    mapResponse(data) {
      this.formName = data.formName || "";

      const responseData = data.data || [];
      const responseFields = data.fields || [];

      this.submissions = responseData.map((item) => ({
        _id: item._id,
        app_id: item.app_id, // ✅ FIX
        current_stage: item.current_stage,
        ...item.submitted_data,
      }));

      const fields = responseFields.map((x) => ({
        text: x.label,
        value: x.label,
      }));

      this.dynamicFields = fields;

      this.headers = [
        ...fields,
        { text: "Stage", value: "stage", width: 140 },
        { text: "Action", value: "action", sortable: false, width: 80 },
      ];
    },

    async load() {
      const id = this.$route.params.id;
      this.loading = true;

      try {
        const stagesRes = await apiClient.get(`forms/${id}/stages/stats`);
        this.stages = stagesRes.data.data || [];

        // default = ALL (better UX)
        this.selectedStage = "all";

        const { data } = await apiClient.get(`forms/${id}/submissions`, {
          params: { stageId: "all" },
        });

        this.mapResponse(data);
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async selectStage(stage) {
      this.selectedStage = stage.stageId;

      const id = this.$route.params.id;
      this.loading = true;

      try {
        const { data } = await apiClient.get(`forms/${id}/submissions`, {
          params: {
            stageId: stage.stageId,
          },
        });

        this.mapResponse(data); // ✅ IMPORTANT
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    addStage() {
      const id = this.$route.params.id;
      this.$router.push(`/dashboard/forms/${id}/edit`);
    },

    getStageColor(stage) {
      if (!stage) return "grey";

      const name = stage.stage_name?.toLowerCase();

      if (name?.includes("approved")) return "green";
      if (name?.includes("rejected")) return "red";
      if (name?.includes("pending")) return "orange";

      return "primary";
    },

    viewSubmission(item) {
      console.log("View:", item);
    },

    async openCommentDialog(item) {
      this.selectedItem = item;
      this.selectedStageId = item.current_stage?._id || null;
      this.commentDialog = true;
      this.newComment = "";

      try {
        const { data } = await apiClient.get(`/forms/${item.app_id}/comment`);

        this.comments = data.data || [];
      } catch (err) {
        console.error("Failed to load comments", err);
      }
    },

    async submitStageAndComment() {
      if (!this.selectedItem || !this.selectedStageId) return;

      this.loading = true;

      try {
        // 1️⃣ Update stage + comment together
        await apiClient.put(
          `/forms/submissions/${this.selectedItem._id}/stage`,
          {
            stageId: this.selectedStageId,
            comment: this.comment?.trim() || null,
          },
        );

        // 2️⃣ Reset input
        this.comment = "";

        // 3️⃣ Reload comments (stay in dialog)
        const { data } = await apiClient.get(
          `/forms/${this.selectedItem.app_id}/comment`,
        );
        this.comments = data.data || [];

        // 4️⃣ Refresh table
        this.load();
      } catch (err) {
        console.error("Failed to update stage/comment", err);
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // ✅ AM/PM
      });
    },
  },
};
</script>

<style scoped></style>
