<template>
  <v-container class="pa-6">
    <!-- HEADER -->
    <v-row class="mb-6 align-center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Form Builder</h1>
        <p class="text-subtitle-2 grey--text">
          Create dynamic forms like Google Forms
        </p>
      </v-col>

      <v-col cols="auto">
        <v-btn
          color="primary"
          rounded
          depressed
          @click="saveForm"
          :loading="loading"
        >
          Save Form
        </v-btn>
      </v-col>
    </v-row>

    <!-- FORM NAME -->
    <v-card outlined rounded="xl" class="pa-4 mb-6">
      <v-text-field
        v-model="form.name"
        label="Form Name"
        outlined
        dense
        :rules="[(v) => !!v || 'Form name is required']"
      />
    </v-card>

    <!-- FIELDS -->
    <v-card outlined rounded="xl" class="pa-4 mb-6">
      <div class="d-flex justify-space-between align-center mb-3">
        <div>
          <div class="text-h6 font-weight-bold">Fields</div>
          <div class="text-caption grey--text">
            {{ form.fields.length }} fields added
          </div>
        </div>

        <v-btn color="primary" small rounded @click="openFieldDialog()">
          + Add Field
        </v-btn>
      </div>

      <v-divider class="mb-4" />

      <!-- EMPTY -->
      <div v-if="!form.fields.length" class="text-center grey--text py-6">
        No fields added yet
      </div>

      <!-- FIELD LIST -->
      <v-card
        v-for="(field, i) in form.fields"
        :key="i"
        class="mb-3 pa-4"
        outlined
        rounded="lg"
      >
        <div class="d-flex justify-space-between">
          <div>
            <div class="font-weight-medium">
              {{ field.label || "Untitled Field" }}
            </div>
            <div class="text-caption grey--text">
              {{ field.type }} • {{ field.required ? "Required" : "Optional" }}
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

    <!-- STAGES -->
    <v-card outlined rounded="xl" class="pa-4 mb-6">
      <div class="d-flex justify-space-between align-center mb-3">
        <div>
          <div class="text-h6 font-weight-bold">Stages</div>
          <div class="text-caption grey--text">
            {{ form.stages.length }} stages
          </div>
        </div>

        <v-btn small color="primary" rounded @click="addStage">
          + Add Stage
        </v-btn>
      </div>

      <v-divider class="mb-4" />

      <v-text-field
        v-for="(stage, i) in form.stages"
        :key="i"
        v-model="stage.stage_name"
        :label="'Stage ' + (i + 1)"
        outlined
        dense
        class="mb-2"
      />
    </v-card>

    <!-- FIELD DIALOG -->
    <v-dialog v-model="fieldDialog" max-width="500">
      <v-card rounded="xl">
        <div class="pa-4">
          <div class="text-h6 font-weight-bold">
            {{ editIndex !== null ? "Edit Field" : "Add Field" }}
          </div>
        </div>

        <v-divider />

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
            label="Field Type"
            outlined
            dense
          />

          <v-switch v-model="fieldForm.required" label="Required" />

          <v-combobox
            v-if="isOptionField"
            v-model="fieldForm.options"
            multiple
            chips
            label="Options"
          />
        </v-card-text>

        <div class="pa-4 d-flex justify-end">
          <v-btn text @click="fieldDialog = false">Cancel</v-btn>

          <v-btn color="primary" @click="saveField"> Save </v-btn>
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
      loading: false,

      form: {
        name: "",
        fields: [],
        stages: [],
      },

      fieldTypes: ["text", "number", "select", "radio", "checkbox"],

      fieldDialog: false,
      fieldForm: {},
      editIndex: null,
    };
  },

  computed: {
    isOptionField() {
      return ["select", "radio", "checkbox"].includes(this.fieldForm.type);
    },
  },

  mounted() {
    if (this.$route.params.id) {
      this.loadForm();
    }
  },

  methods: {
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
      if (!this.fieldForm.label) return alert("Label required");

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

    addStage() {
      this.form.stages.push({ stage_name: "" });
    },

    async loadForm() {
      const { data } = await apiClient.get(`/forms/${this.$route.params.id}`);
      this.form = data.data;
    },

    async saveForm() {
      try {
        if (!this.form.name) return alert("Form name required");

        this.loading = true;

        const payload = {
          name: this.form.name,
          fields: this.form.fields.map((f) => ({
            label: f.label,
            type: f.type,
            required: f.required,
            options: f.options || [],
          })),
          stages: this.form.stages.map((s, i) => ({
            stage_name: s.stage_name,
            order: i + 1,
          })),
        };

        if (this.$route.params.id) {
          await apiClient.put(`/forms/${this.$route.params.id}/edit`, payload);
        } else {
          await apiClient.post("/forms/create", payload);
        }

        this.$router.push("/dashboard/forms");
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
