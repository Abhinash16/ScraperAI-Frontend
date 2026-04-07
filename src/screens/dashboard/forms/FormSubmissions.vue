<template>
  <div>
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
        <v-btn color="success" class="ma-1" outlined @click="addStage">
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

            <v-btn icon small @click="openChangeStatusDialog(item)">
              <v-icon small>mdi-dots-horizontal</v-icon>
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- LOADER -->
    <v-overlay :value="loading" opacity="0.05">
      <v-progress-circular indeterminate size="50" />
    </v-overlay>

    <!-- CHANGE STAGE DIALOG -->
    <v-dialog v-model="changeStageDialog" max-width="500">
      <v-card rounded="xl">
        <div class="pa-4">
          <div class="text-h6 font-weight-bold">Change Stage</div>
        </div>

        <v-divider class="mb-5" />

        <v-card-text>
          <!-- Stage Select -->
          <v-select
            v-model="selectedStageId"
            :items="stages"
            item-text="stage"
            item-value="stageId"
            label="Select Stage"
            dense
            outlined
            hide-details="auto"
          />

          <!-- Comment -->
          <v-textarea
            v-model="comment"
            label="Add Comment"
            rows="3"
            outlined
            dense
            class="mt-4"
            hide-details="auto"
          />
        </v-card-text>

        <div class="pa-4 d-flex justify-end">
          <v-btn rounded class="mr-2" text @click="changeStageDialog = false"
            >Cancel</v-btn
          >

          <v-btn depressed rounded color="primary" @click="submitStageChange">
            Save
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- COMMENTS DIALOG -->
    <v-dialog v-model="commentDialog" max-width="500">
      <v-card rounded="xl" :loading="loading">
        <div class="pa-4">
          <div class="text-h6 font-weight-bold">Comments</div>
        </div>

        <v-divider />

        <!-- COMMENTS LIST -->
        <v-card-text
          style="max-height: 300px; overflow-y: auto"
          class="pa-4 grey lighten-5"
        >
          <div
            v-if="comments.length === 0"
            class="text-center grey--text pa-10"
          >
            <v-icon color="grey lighten-2" large>mdi-message-off</v-icon>
            <p>No comments yet</p>
          </div>

          <v-card
            v-for="c in comments"
            :key="c._id"
            flat
            outlined
            class="mb-3 rounded-lg"
          >
            <v-card-text class="pa-3">
              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2 black--text">
                  {{ c.message }}
                </span>
                <span class="caption grey--text">{{
                  formatDate(c.createdAt)
                }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>

        <v-divider />

        <!-- ADD COMMENT -->
        <div class="pa-4">
          <v-textarea
            v-model="newComment"
            label="Write a comment"
            dense
            outlined
            rows="2"
            hide-details="auto"
          />

          <div class="d-flex justify-end mt-4">
            <v-btn
              depressed
              rounded
              class="ml-2"
              text
              @click="commentDialog = false"
              >Close</v-btn
            >
            <v-btn depressed rounded color="primary" @click="addComment">
              Send
            </v-btn>
          </div>
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

    openChangeStatusDialog(item) {
      this.selectedItem = item;
      this.selectedStageId = item.current_stage?._id || null;
      this.comment = "";
      this.changeStageDialog = true;
    },

    async submitStageChange() {
      if (!this.selectedItem || !this.selectedStageId) return;

      try {
        await apiClient.put(
          `/forms/submissions/${this.selectedItem._id}/stage`,
          {
            stageId: this.selectedStageId,
            comment: this.comment, // 👈 send comment
          },
        );

        this.changeStageDialog = false;

        this.load();
      } catch (err) {
        console.error("Stage update failed", err);
      }
    },

    async openCommentDialog(item) {
      this.selectedItem = item;
      this.commentDialog = true;
      this.newComment = "";

      try {
        const { data } = await apiClient.get(`/forms/${item.app_id}/comment`);

        this.comments = data.data || [];
      } catch (err) {
        console.error("Failed to load comments", err);
      }
    },

    async addComment() {
      this.loading = true;
      if (!this.newComment.trim()) return;

      try {
        await apiClient.post(`/forms/comment`, {
          app_id: this.selectedItem.app_id,
          message: this.newComment,
        });

        this.newComment = "";

        // reload comments
        this.openCommentDialog(this.selectedItem);
      } catch (err) {
        console.error("Failed to add comment", err);
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
