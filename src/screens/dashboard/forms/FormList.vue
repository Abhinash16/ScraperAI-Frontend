<template>
  <v-container class="pa-6">
    <!-- HEADER -->
    <v-row class="mb-6 align-center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Forms</h1>
        <p class="text-subtitle-2 grey--text">
          Manage and track all your forms
        </p>
      </v-col>

      <v-col cols="auto">
        <v-btn
          color="primary"
          rounded
          depressed
          @click="$router.push('/dashboard/forms/create')"
        >
          + Create Form
        </v-btn>
      </v-col>
    </v-row>

    <!-- STATS -->
    <v-card outlined rounded="xl" class="pa-4 mb-6">
      <div class="d-flex justify-space-between align-center">
        <div>
          <div class="text-h6 font-weight-bold">Total Forms</div>
          <div class="text-caption grey--text">
            Overview of your created forms
          </div>
        </div>

        <div class="text-h4 font-weight-bold primary--text">
          {{ forms.length }}
        </div>
      </div>
    </v-card>

    <!-- TABLE -->
    <v-card outlined rounded="xl">
      <div class="pa-4">
        <div class="text-h6 font-weight-bold">Form List</div>
        <div class="text-caption grey--text">
          View, edit, and manage your forms
        </div>
      </div>

      <v-divider />

      <!-- EMPTY STATE -->
      <div
        v-if="!forms.length && !loading"
        class="text-center py-10 grey--text"
      >
        No forms created yet
      </div>

      <!-- TABLE -->
      <v-data-table
        v-else
        :headers="headers"
        :items="forms"
        :loading="loading"
        class="elevation-0"
      >
        <!-- NAME -->
        <template v-slot:[`item.name`]="{ item }">
          <div class="font-weight-medium">
            {{ item.name }}
          </div>
        </template>

        <!-- DATE -->
        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="grey--text">
            {{ formatDate(item.createdAt) }}
          </span>
        </template>

        <!-- ACTIONS -->
        <template v-slot:[`item.actions`]="{ item }">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn icon small v-on="on" @click="editForm(item._id)">
                <v-icon small>mdi-pencil</v-icon>
              </v-btn>
            </template>
            <span>Edit</span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn icon small v-on="on" @click="viewSubmissions(item._id)">
                <v-icon small color="primary">mdi-eye</v-icon>
              </v-btn>
            </template>
            <span>View Submissions</span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn icon small v-on="on" @click="confirmDelete(item)">
                <v-icon small color="red">mdi-delete</v-icon>
              </v-btn>
            </template>
            <span>Delete</span>
          </v-tooltip>
        </template>
      </v-data-table>
    </v-card>

    <!-- DELETE CONFIRM -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl">
        <div class="pa-4">
          <div class="text-h6 font-weight-bold">Delete Form</div>
          <div class="text-caption grey--text">
            Are you sure you want to delete this form?
          </div>
        </div>

        <v-divider />

        <div class="pa-4 d-flex justify-end">
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>

          <v-btn color="red" @click="deleteForm"> Delete </v-btn>
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
      forms: [],
      loading: false,

      deleteDialog: false,
      selectedForm: null,

      headers: [
        { text: "Form Name", value: "name" },
        { text: "Created", value: "createdAt" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },

  mounted() {
    this.fetchForms();
  },

  methods: {
    async fetchForms() {
      this.loading = true;
      try {
        const { data } = await apiClient.get("/forms/outreach/forms");
        this.forms = data.data || [];
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },

    editForm(id) {
      this.$router.push(`/dashboard/forms/${id}/edit`);
    },

    viewSubmissions(id) {
      this.$router.push(`/dashboard/forms/${id}/submissions`);
    },

    confirmDelete(form) {
      this.selectedForm = form;
      this.deleteDialog = true;
    },

    async deleteForm() {
      try {
        await apiClient.delete(`/forms/${this.selectedForm._id}`);
        this.deleteDialog = false;
        this.fetchForms();
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>
