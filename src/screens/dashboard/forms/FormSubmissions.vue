<template>
  <div>
    <!-- HEADER -->

    <v-row class="mb-6 align-center">
      <!-- Back Button -->
      <v-col cols="auto">
        <v-btn icon text color="primary" @click="$router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>

      <!-- Title + Subtitle -->
      <v-col>
        <div class="d-flex align-center">
          <h1 class="text-h5 font-weight-bold mb-1">
            {{ formName || "Untitled Form" }}
          </h1>
        </div>

        <p class="text-subtitle-2 grey--text mb-0">
          Manage submissions, track stages, and analyze responses
        </p>
      </v-col>
      <!-- ➕ Edit  Button -->
      <v-col cols="auto" class="justify-end">
        <v-btn color="success" rounded class="ma-1" outlined @click="EditForm">
          Edit Form
        </v-btn>
      </v-col>
    </v-row>

    <v-row dense align="center" class="mb-2">
      <!-- Stage Buttons (Left side, scrollable) -->
      <v-col class="d-flex flex-nowrap overflow-auto">
        <v-btn
          v-for="stage in stages"
          :key="stage.stageId"
          class="mr-2"
          rounded
          small
          :color="
            selectedStage === stage.stageId ? 'primary' : 'grey lighten-2'
          "
          :outlined="selectedStage !== stage.stageId"
          @click="selectStage(stage)"
          depressed
        >
          {{ stage.stage }} ({{ stage.total }})
        </v-btn>
      </v-col>

      <!-- Filters (Right side) -->
      <v-col cols="auto" class="d-flex align-center">
        <!-- From Date -->
        <v-menu v-model="fromMenu" :close-on-content-click="false" offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="startDate"
              label="From"
              readonly
              dense
              outlined
              class="mr-2"
              style="max-width: 140px"
              v-bind="attrs"
              v-on="on"
              hide-details="auto"
            />
          </template>
          <v-date-picker
            v-model="startDate"
            @input="fromMenu = false"
            :max="today"
          />
        </v-menu>

        <!-- To Date -->
        <v-menu v-model="toMenu" :close-on-content-click="false" offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="endDate"
              label="To"
              readonly
              dense
              outlined
              class="mr-2"
              style="max-width: 140px"
              v-bind="attrs"
              v-on="on"
              hide-details="auto"
            />
          </template>
          <v-date-picker
            v-model="endDate"
            @input="toMenu = false"
            :min="startDate"
          />
        </v-menu>

        <!-- Apply -->
        <v-btn rounded color="primary" dressed @click="applyDateFilter">
          Apply
        </v-btn>
      </v-col>
    </v-row>

    <!-- TABLE SECTION -->
    <v-card outlined rounded="xl">
      <div class="pa-4 d-flex justify-space-between align-center">
        <div>
          <div class="text-h6 font-weight-bold">Submissions</div>
          <div class="text-caption grey--text">
            {{ submissions.length }} records found
          </div>
        </div>
      </div>

      <v-divider />

      <!-- EMPTY -->
      <div
        v-if="!submissions.length && !loading"
        class="text-center py-12 grey--text"
      >
        <v-icon size="50">mdi-database-off-outline</v-icon>
        <div class="mt-2">No submissions yet</div>
      </div>

      <!-- TABLE -->
      <v-data-table
        v-else
        :items="submissions"
        :headers="headers"
        :loading="loading"
        :page.sync="page"
        :items-per-page="limit"
        :server-items-length="totalItems"
        @update:page="load"
        @update:items-per-page="onLimitChange"
        height="600"
        fixed-header
        class="elevation-0"
        :footer-props="{
          itemsPerPageOptions: [10, 20, 50, 100],
        }"
      >
        <!-- DYNAMIC FIELDS -->
        <template
          v-for="(field, index) in dynamicFields"
          v-slot:[`item.${field.value}`]="{ item }"
        >
          <div :key="index" class="py-1">
            <!-- LINK TYPE -->
            <template v-if="field.type === 'link' && item[field.value]">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <a
                    :href="
                      item[field.value].startsWith('http')
                        ? item[field.value]
                        : 'https://' + item[field.value]
                    "
                    target="_blank"
                    v-bind="attrs"
                    v-on="on"
                    style="
                      max-width: 180px;
                      display: inline-block;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                      color: #1976d2;
                    "
                  >
                    {{ item[field.value] }}
                  </a>
                </template>
                <span>{{ item[field.value] }}</span>
              </v-tooltip>
            </template>

            <!-- NORMAL TEXT -->
            <template v-else>
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span
                    v-bind="attrs"
                    v-on="on"
                    style="
                      max-width: 180px;
                      display: inline-block;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      white-space: nowrap;
                    "
                  >
                    {{ item[field.value] || "-" }}
                  </span>
                </template>
                <span>{{ item[field.value] || "-" }}</span>
              </v-tooltip>
            </template>
          </div>
        </template>

        <!-- STAGE -->
        <template v-slot:[`item.stage`]="{ item }">
          <v-chip small :color="getStageColor(item.current_stage)" dark>
            {{ item.current_stage?.stage_name || "New" }}
          </v-chip>
        </template>

        <!-- CREATED AT -->
        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="text-caption">
            {{ formatDate(item.createdAt) }}
          </span>
        </template>

        <!-- ACTION -->
        <template v-slot:[`item.action`]="{ item }">
          <div class="d-flex justify-center">
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
              <div class="d-flex align-start">
                <v-avatar size="24" class="mr-2" color="primary">
                  <span class="white--text text-caption">
                    {{ c.userId?.name?.charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>

                <div class="flex-grow-1">
                  <div class="d-flex justify-space-between">
                    <div class="font-weight-medium">
                      {{ c.userId?.name || "User" }}
                    </div>
                    <div class="text-caption grey--text">
                      {{ formatDate(c.createdAt) }}
                    </div>
                  </div>

                  <div class="text-body-2 mt-1">
                    {{ c.message }}
                  </div>
                </div>
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
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    const today = new Date().toISOString().substr(0, 10);
    return {
      today,
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

      startDate: today,
      endDate: today,
      fromMenu: false,
      toMenu: false,
      page: 1,
      limit: 10,
      totalPages: 1,
      totalItems: 0,
    };
  },

  mounted() {
    this.load();
  },

  methods: {
    mapResponse(data) {
      this.formName = data.formName || "";
      this.totalPages = data.pagination?.totalPages || 1;
      this.totalItems = data.pagination?.total || 0;
      const responseData = data.data || [];
      const responseFields = data.fields || [];

      // ✅ FIX: normalize keys (case issue)
      this.submissions = responseData.map((item) => {
        const normalizedData = {};

        Object.keys(item.submitted_data || {}).forEach((key) => {
          normalizedData[key.toLowerCase()] = item.submitted_data[key];
        });

        return {
          _id: item._id,
          app_id: item.app_id,
          current_stage: item.current_stage,
          createdAt: item.createdAt, // ✅ IMPORTANT for date filter
          ...normalizedData,
        };
      });

      // ✅ FIX: match lowercase keys
      const fields = responseFields.map((x) => ({
        text: x.label,
        value: x.key.toLowerCase(),
      }));

      this.dynamicFields = fields;

      this.headers = [
        ...fields,
        { text: "Stage", value: "stage", width: 140 },
        { text: "Created At", value: "createdAt" },
        { text: "Action", value: "action", sortable: false, width: 80 },
      ];
    },

    async load() {
      const id = this.$route.params.id;
      this.loading = true;

      try {
        const stagesRes = await apiClient.get(`forms/${id}/stages/stats`);
        this.stages = stagesRes.data.data || [];

        if (this.stages.length > 1) {
          this.selectedStage = this.stages[1].stageId;
        } else if (this.stages.length) {
          this.selectedStage = this.stages[0].stageId; // fallback
        }

        const { data } = await apiClient.get(`forms/${id}/submissions`, {
          params: {
            page: this.page,
            limit: this.limit,
            stageId: this.selectedStage || "all",
            startDate: this.startDate,
            endDate: this.endDate,
          },
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
      this.page = 1;
      const id = this.$route.params.id;
      this.loading = true;

      try {
        const { data } = await apiClient.get(`forms/${id}/submissions`, {
          params: {
            stageId: stage.stageId,
            startDate: this.startDate,
            endDate: this.endDate,
          },
        });

        this.mapResponse(data); // ✅ IMPORTANT
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    EditForm() {
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
        this.$toast.success("Stage and comment updated successfully");
      } catch (err) {
        console.error("Failed to update stage/comment", err);
        this.$toast.error("Failed to update stage/comment");
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
    applyDateFilter() {
      this.page = 1;
      this.load(); // reload with filters
    },
    onLimitChange(val) {
      this.limit = val;
      this.page = 1;
      this.load();
    },
  },
};
</script>

<style scoped></style>
