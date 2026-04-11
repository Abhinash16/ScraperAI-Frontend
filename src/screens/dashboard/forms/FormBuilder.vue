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

      <!-- Title + Description -->
      <v-col>
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">Form Builder</h1>

          <p class="text-subtitle-2 grey--text mb-0">
            Create dynamic forms, manage fields, and define stages
          </p>
        </div>
      </v-col>

      <!-- Save Button -->
      <v-col cols="auto">
        <v-btn
          color="primary"
          rounded
          depressed
          @click="saveForm"
          :loading="loading"
          :disabled="!isFormValid"
        >
          <v-icon left small>mdi-content-save</v-icon>
          Save Form
        </v-btn>
      </v-col>
    </v-row>

    <!-- FORM NAME -->
    <v-card outlined rounded="lg" class="pa-4 mb-6">
      <v-text-field
        v-model="form.name"
        label="Form Name"
        outlined
        dense
        hide-details=""
        :rules="[(v) => !!v || 'Form name is required']"
      />
    </v-card>

    <!-- TABS HEADER -->
    <v-card outlined rounded="lg" class="mb-4">
      <v-tabs v-model="tab" color="primary">
        <v-tab>Fields</v-tab>
        <v-tab>Stages</v-tab>
        <v-tab v-if="form.fields.length > 1">Share</v-tab>
      </v-tabs>
    </v-card>

    <!-- ================= FIELDS TAB ================= -->
    <v-card
      v-if="tab === 0"
      outlined
      rounded="xl"
      class="pa-5 mb-6"
      color="#f8f9fd"
    >
      <!-- HEADER -->
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <div class="text-h6 font-weight-bold">Fields</div>
          <div class="text-caption grey--text">
            {{ form.fields.length }} fields added
          </div>
        </div>

        <v-btn color="primary" small rounded depressed @click="openFieldDialog">
          + Add Field
        </v-btn>
      </div>

      <v-divider class="mb-4" />

      <!-- EMPTY -->
      <div v-if="!form.fields.length" class="text-center grey--text py-6">
        No fields added yet
      </div>

      <!-- LIST -->
      <v-card
        v-for="(field, i) in form.fields"
        :key="i"
        class="mb-3 pa-4"
        outlined
        rounded="lg"
        elevation="0"
      >
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="font-weight-medium">
              {{ field.label || "Untitled Field" }}
            </div>

            <div class="text-caption grey--text">
              {{ field.type }} •
              <span :class="field.required ? 'red--text' : ''">
                {{ field.required ? "Required" : "Optional" }}
              </span>
            </div>
          </div>

          <div>
            <v-btn icon small @click="editField(i)">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>

            <v-btn icon small @click="removeField(i)">
              <v-icon small color="red">mdi-delete</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-card>

    <!-- ================= STAGES TAB ================= -->
    <v-card
      v-if="tab === 1"
      outlined
      rounded="xl"
      class="pa-5 mb-6"
      color="#f8f9fd"
    >
      <!-- HEADER -->
      <div class="d-flex justify-space-between align-center mb-4">
        <div>
          <div class="text-h6 font-weight-bold">Stages</div>
          <div class="text-caption grey--text">
            {{ form.stages.length }} stages
          </div>
        </div>

        <v-btn color="primary" small rounded depressed @click="addStage">
          + Add Stage
        </v-btn>
      </div>

      <v-divider class="mb-4" />

      <!-- EMPTY -->
      <div v-if="!form.stages.length" class="text-center grey--text py-6">
        No stages added yet
      </div>

      <!-- LIST -->
      <v-card
        v-for="(stage, i) in form.stages"
        :key="i"
        class="mb-3 pa-3"
        outlined
        rounded="lg"
        elevation="0"
      >
        <v-row align="center" no-gutters>
          <v-col>
            <v-text-field
              v-model="stage.stage_name"
              :label="'Stage ' + (i + 1)"
              outlined
              dense
              :error="!stage.stage_name"
              :error-messages="!stage.stage_name ? 'Stage name required' : ''"
              hide-details
            />
          </v-col>

          <v-col cols="auto" class="ml-2">
            <v-btn
              icon
              color="error"
              :disabled="stage.isDefault || stage.stage_name === 'New'"
              @click="removeStage(i)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-card>

    <v-card
      v-if="tab === 2"
      outlined
      rounded="xl"
      class="pa-0 mb-6"
      color="#f8f9fd"
      height="600"
    >
      <v-container>
        <h1>Share Link</h1>
        <div>
          Your form is now published and ready to be shared with the world! Copy
          this link to share your form on social media, messaging apps or via
          email.
        </div>

        <div>
          {{ `${baseURL}/forms/f/${$route.params.id}` }}

          <v-btn @click="copyLink($route.params.id)">Copy</v-btn>
        </div>

        <!-- show preview of form here using iframe  -->
        <!-- 👇 Iframe preview -->

        <iframe
          :src="`${baseURL}/forms/f/${$route.params.id}`"
          width="100%"
          height="100%"
          style="border: none; border-radius: 12px"
        ></iframe>

        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <div class="text-h6 font-weight-bold">API</div>
            <div class="text-caption grey--text">
              You can set a webhook URL to send form responses directly to your
              server:
            </div>

            <div>
              API:
              <strong>{{
                `${baseURL}/forms/${$route.params.id}/submit`
              }}</strong>
            </div>
          </div>

          <v-switch v-model="integration.enabled" label="Enable" inset />
        </div>
      </v-container>
    </v-card>

    <!-- FIELD DIALOG -->
    <v-dialog v-model="fieldDialog" max-width="500">
      <v-card rounded="xl">
        <div class="pa-4">
          <div class="text-h6 font-weight-bold">
            {{ editIndex !== null ? "Edit Field" : "Add Field" }}
          </div>
        </div>

        <v-divider class="mb-5" />

        <v-card-text>
          <v-text-field
            v-model="fieldForm.label"
            label="Label"
            outlined
            dense
          />

          <v-select
            v-model="fieldForm.type"
            :items="fieldTypes"
            item-text="text"
            item-value="value"
            label="Field Type"
            outlined
            dense
          />

          <v-switch v-model="fieldForm.required" label="Required" />

          <!-- OPTIONS -->
          <v-combobox
            v-if="isOptionField"
            v-model="fieldForm.options"
            multiple
            chips
            label="Options"
          />

          <!-- LINK TEXT -->
          <v-text-field
            v-if="fieldForm.type === 'link'"
            v-model="fieldForm.link_text"
            label="Link Text"
          />
        </v-card-text>

        <div class="pa-4 d-flex justify-end">
          <v-btn rounded class="mr-2" text @click="fieldDialog = false"
            >Cancel</v-btn
          >

          <v-btn depressed rounded color="primary" @click="saveField">
            Save
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="stageDeleteDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold">
          Move Leads Before Deleting
        </v-card-title>

        <v-card-text>
          <p>
            All leads with stage
            <strong>{{ stageToDelete?.stage_name }}</strong>
            will be moved to:
          </p>

          <v-select
            v-model="moveToStageId"
            :items="filteredStages"
            item-text="stage_name"
            item-value="_id"
            label="Select Stage"
            outlined
            dense
          />
        </v-card-text>

        <v-card-actions class="justify-end">
          <v-btn text @click="stageDeleteDialog = false">Cancel</v-btn>

          <v-btn color="error" @click="confirmStageDelete">
            Delete & Move
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
      baseURL: process.env.VUE_APP_API_BASE_URL,
      loading: false,
      tab: 0,

      form: {
        name: "",
        fields: [],
        stages: [
          { stage_name: "New", isDefault: true }, // ✅ default stage
        ],
      },

      fieldTypes: [
        "text",
        "number",
        "select",
        "radio",
        "checkbox",
        "textarea",
        "link",
      ],

      fieldDialog: false,
      fieldForm: {},
      editIndex: null,

      // ✅ Stage delete handling
      stageDeleteDialog: false,
      stageToDelete: null,
      moveToStageId: null,
      deletedStageMapping: [],

      integration: {
        enabled: false,
        url: "",
        method: "POST",
        headers: [],
      },
    };
  },

  computed: {
    isOptionField() {
      return ["select", "radio", "checkbox"].includes(this.fieldForm.type);
    },

    isEditMode() {
      return !!this.$route.params.id;
    },

    filteredStages() {
      if (!this.stageToDelete) return [];

      return this.form.stages.filter((s) => s._id !== this.stageToDelete._id);
    },
    isFormValid() {
      // ✅ Form name check
      if (!this.form.name || !this.form.name.trim()) return false;

      // ✅ Stage validation (no empty names)
      const hasEmptyStage = this.form.stages.some(
        (s) => !s.stage_name || !s.stage_name.trim(),
      );

      if (hasEmptyStage) return false;

      return true;
    },
  },

  mounted() {
    if (this.isEditMode) {
      this.loadForm();
    } else {
      this.deletedStageMapping = []; // clean state
    }
  },

  methods: {
    copyLink(id) {
      let baseUrl = process.env.VUE_APP_API_BASE_URL;
      navigator.clipboard.writeText(`${baseUrl}/forms/f/${id}`);
    },
    // ================= FIELD =================
    openFieldDialog() {
      this.fieldForm = {
        label: "",
        type: "text",
        required: false,
        options: [],
      };
      this.editIndex = null;
      this.fieldDialog = true;
    },

    editField(i) {
      this.fieldForm = { ...this.form.fields[i] };
      this.editIndex = i;
      this.fieldDialog = true;
    },

    saveField() {
      if (!this.fieldForm.label) {
        this.$toast.error("Label required");
        return;
      }

      if (this.editIndex !== null) {
        this.form.fields.splice(this.editIndex, 1, this.fieldForm);
      } else {
        this.form.fields.push(this.fieldForm);
      }

      this.fieldDialog = false;
    },

    removeField(i) {
      this.form.fields.splice(i, 1);
    },

    // ================= STAGES =================
    addStage() {
      this.form.stages.push({
        stage_name: "",
        isDefault: false,
      });
    },

    removeStage(index) {
      const stage = this.form.stages[index];

      if (stage.isDefault || stage.stage_name === "New") {
        this.$toast.error("Default stage cannot be deleted");
        return;
      }

      if (!stage._id) {
        this.form.stages.splice(index, 1);
        return;
      }

      this.stageToDelete = {
        ...stage,
        index,
      };

      // ✅ SET DEFAULT SELECTED STAGE
      const availableStages = this.form.stages.filter(
        (s) => s._id !== stage._id,
      );

      if (availableStages.length) {
        this.moveToStageId = availableStages[0]._id; // 👈 first stage selected
      }

      this.stageDeleteDialog = true;
    },

    confirmStageDelete() {
      if (!this.moveToStageId) {
        this.$toast.error("Please select a stage");
        return;
      }

      // store mapping
      this.deletedStageMapping.push({
        fromStageId: this.stageToDelete._id,
        toStageId: this.moveToStageId,
      });

      // remove from UI
      this.form.stages.splice(this.stageToDelete.index, 1);

      this.stageDeleteDialog = false;
      this.moveToStageId = null;
    },

    // ================= LOAD =================
    async loadForm() {
      try {
        const { data } = await apiClient.get(`/forms/${this.$route.params.id}`);

        this.form = data.data;

        // ✅ Ensure default stage exists
        if (!this.form.stages || !this.form.stages.length) {
          this.form.stages = [{ stage_name: "New", isDefault: true }];
        }
      } catch (err) {
        console.error(err);
        this.$toast.error("Failed to load form");
      }
    },

    // ================= SAVE =================
    async saveForm() {
      if (!this.isFormValid) {
        this.$toast.error("Please fill all required fields");
        return;
      }
      try {
        if (!this.form.name) {
          this.$toast.error("Form name required");
          return;
        }

        this.loading = true;

        const payload = {
          name: this.form.name,

          fields: this.form.fields.map((f) => ({
            label: f.label,
            type: f.type,
            required: f.required,
            options: f.options || [],
            link_text: f.link_text || "",
          })),

          stages: this.form.stages.map((s, i) => ({
            _id: s._id, // ✅ IMPORTANT for update
            stage_name: s.stage_name,
            order: i + 1,
          })),

          deletedStageMapping: this.deletedStageMapping,
          integration: this.integration,
        };

        if (this.isEditMode) {
          await apiClient.put(`/forms/${this.$route.params.id}/edit`, payload);
        } else {
          await apiClient.post("/forms/create", payload);
        }

        this.$toast.success("Form saved successfully");
      } catch (err) {
        const message = err?.response?.data?.message || "Error saving form";

        this.$toast.error(message);
      } finally {
        this.loading = false;
      }
    },
    addHeader() {
      this.integration.headers.push({ key: "", value: "" });
    },

    removeHeader(i) {
      this.integration.headers.splice(i, 1);
    },
  },
};
</script>
