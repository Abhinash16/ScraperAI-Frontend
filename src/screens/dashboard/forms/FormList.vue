<template>
  <div>
    <!-- HEADER -->
    <v-row class="align-center mb-4">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Forms</h1>
        <p class="text-subtitle-2 grey--text mb-0">
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

    <!-- LOADING -->
    <v-row v-if="loading" justify="center" class="py-10">
      <v-progress-circular indeterminate size="40" />
    </v-row>

    <!-- EMPTY STATE -->
    <div v-else-if="!forms.length" class="text-center py-10 grey--text">
      <v-icon size="40" class="mb-2">mdi-file-document-outline</v-icon>
      <div>No forms created yet</div>
    </div>

    <!-- CARDS -->
    <v-row v-else dense>
      <v-col v-for="form in forms" :key="form._id" cols="12">
        <v-card
          class="pa-4 form-card"
          outlined
          rounded="xl"
          elevation="0"
          @click="viewSubmissions(form._id)"
        >
          <!-- Top -->
          <div class="d-flex justify-space-between align-center">
            <!-- LEFT -->
            <div>
              <div class="text-subtitle-1 font-weight-bold">
                {{ form.name }}
              </div>
              <div class="text-caption grey--text">
                {{ formatDate(form.createdAt) }}
              </div>

              <div class="mt-1">
                <v-chip small outlined color="primary" class="text-caption">
                  {{ form.totalLeads || 0 }} Leads
                </v-chip>
              </div>
            </div>

            <!-- RIGHT ACTIONS -->
            <div class="d-flex">
              <!-- EDIT -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn icon small v-on="on" @click.stop="editForm(form._id)">
                    <v-icon small>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Edit</span>
              </v-tooltip>

              <!-- SHARE -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn icon small v-on="on" @click.stop="copyLink(form._id)">
                    <v-icon small>mdi-link-variant</v-icon>
                  </v-btn>
                </template>
                <span>Share Link</span>
              </v-tooltip>

              <!-- DELETE -->
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-btn icon small v-on="on" @click.stop="confirmDelete(form)">
                    <v-icon small color="red">mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>Delete</span>
              </v-tooltip>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- PAGINATION -->
    <v-row v-if="pagination.totalPages > 1" class="mt-8" justify="center">
      <v-pagination
        v-model="pagination.page"
        :length="pagination.totalPages"
        circle
        color="primary"
        @input="fetchForms"
      />
    </v-row>

    <!-- DELETE CONFIRM -->
    <v-dialog
      v-model="deleteDialog"
      max-width="350"
      rounded="xl"
      overlay-color="#2c3e50"
      overlay-opacity="0.8"
    >
      <v-card class="text-center" rounded="xl">
        <v-card-text>
          <!-- Icon -->
          <v-avatar color="error lighten-5" size="70" class="my-4">
            <v-icon color="error" size="40"> mdi-delete-outline </v-icon>
          </v-avatar>

          <!-- Title -->
          <div class="text-h6 font-weight-bold black--text mb-2">
            Delete Form?
          </div>

          <!-- Description -->
          <p class="text-body-2 grey--text text--darken-1">
            This action will permanently delete the form and all its data. This
            cannot be undone.
          </p>
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="justify-center pb-4">
          <v-btn
            @click="deleteDialog = false"
            text
            rounded
            large
            class="px-6 mr-2 text-none"
          >
            Cancel
          </v-btn>

          <v-btn
            @click="deleteForm(false)"
            color="error"
            depressed
            rounded
            large
          >
            Yes, Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteWarningDialog" max-width="400">
      <v-card rounded="xl" class="text-center pa-4">
        <v-card-text>
          <v-avatar color="red lighten-5" size="70" class="mb-4">
            <v-icon color="red" size="40">mdi-alert</v-icon>
          </v-avatar>

          <div class="text-h6 font-weight-bold mb-2">Warning!</div>

          <p class="grey--text">
            <strong>{{ leadCount }}</strong> leads in this form will be deleted.
            <br />
            This action is irreversible.
          </p>
        </v-card-text>

        <v-card-actions class="justify-center">
          <v-btn text @click="deleteWarningDialog = false"> Cancel </v-btn>

          <v-btn color="error" depressed @click="deleteForm(true)">
            Delete Anyway
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
      forms: [],
      loading: false,

      deleteDialog: false,
      selectedForm: null,

      pagination: {
        page: 1,
        limit: 9, // Multiple of 3 looks best for grids
        total: 0,
        totalPages: 0,
      },
      deleteWarningDialog: false,
      leadCount: 0,
    };
  },

  mounted() {
    this.fetchForms();
  },

  methods: {
    async fetchForms() {
      this.loading = true;
      try {
        const { data } = await apiClient.get("/forms/outreach/forms", {
          params: {
            page: this.pagination.page,
            limit: this.pagination.limit,
          },
        });

        this.forms = data.data || [];
        this.pagination = data.pagination || this.pagination;
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

    copyLink(id) {
      navigator.clipboard.writeText(`${window.location.origin}/form/${id}`);
    },

    confirmDelete(form) {
      this.selectedForm = form;

      // ✅ If leads exist → show warning directly
      if (form.totalLeads > 0) {
        this.leadCount = form.totalLeads;
        this.deleteWarningDialog = true;
      } else {
        this.deleteDialog = true;
      }
    },

    async deleteForm(force = false) {
      try {
        const { data } = await apiClient.delete(
          `/forms/${this.selectedForm._id}`,
          {
            params: { forceDelete: force },
          },
        );

        // 🔥 If backend says confirmation needed
        if (data.requireConfirmation) {
          this.leadCount = data.totalLeads;
          this.deleteDialog = false;
          this.deleteWarningDialog = true;
          return;
        }

        // ✅ success
        this.deleteDialog = false;
        this.deleteWarningDialog = false;
        this.fetchForms();
        this.$toast.success("Form deleted successfully");
      } catch (err) {
        console.error(err);
        this.$toast.error("Error deleting form");
      }
    },
  },
};
</script>
