<template>
  <div>
    <v-card outlined rounded="xl">
      <div class="d-flex justify-space-between align-center pa-4">
        <div>
          <div class="text-h6 font-weight-bold">Database AI Projects</div>
          <div class="text-body-2 grey--text">
            {{ projects.length }} projects created
          </div>
        </div>

        <v-btn color="primary" rounded depressed @click="openCreateDialog">
          <v-icon left>mdi-database-plus</v-icon>
          New Project
        </v-btn>
      </div>

      <v-divider />

      <!-- LOADER -->
      <v-overlay :value="loading" opacity="0.25">
        <v-progress-circular
          indeterminate
          size="70"
          width="6"
          color="primary"
        />
      </v-overlay>

      <!-- EMPTY STATE -->
      <v-row v-if="!loading && !projects.length">
        <v-col cols="12">
          <v-card outlined rounded="xl" class="pa-10 text-center ma-4">
            <v-icon size="50" color="grey lighten-1">mdi-database-off</v-icon>

            <div class="text-h6 font-weight-medium mt-3">No Projects Yet</div>

            <div class="grey--text text-caption mb-4">
              Create your first AI database project to begin
            </div>

            <v-btn color="primary" rounded depressed @click="openCreateDialog">
              Create Project
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- PROJECT LIST -->
      <v-row v-if="!loading && projects.length">
        <v-col cols="12" md="6" lg="4" v-for="p in projects" :key="p._id">
          <v-card outlined rounded="xl" class="pa-6 project-card ma-4">
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="text-h6 font-weight-medium">
                  {{ p.name }}
                </div>

                <div class="grey--text text-caption mt-1">
                  {{ p.dbType }} • {{ p.dbVersion }}
                </div>

                <!-- <div class="mt-3">
                  <v-chip small outlined color="primary">
                    Tables: {{ p.tableCount || 0 }}
                  </v-chip>
                </div> -->
              </div>

              <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn icon v-bind="attrs" v-on="on">
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>

                <v-list dense>
                  <v-list-item @click="openConfig(p)">
                    <v-list-item-icon>
                      <v-icon small>mdi-cog</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content> Config </v-list-item-content>
                  </v-list-item>

                  <v-list-item @click="openChat(p)">
                    <v-list-item-icon>
                      <v-icon small>mdi-robot</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content> AI Chat </v-list-item-content>
                  </v-list-item>

                  <v-list-item @click="editProject(p)">
                    <v-list-item-icon>
                      <v-icon small>mdi-pencil</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content> Edit </v-list-item-content>
                  </v-list-item>

                  <v-list-item @click="deleteProject(p)">
                    <v-list-item-icon>
                      <v-icon small color="red">mdi-delete</v-icon>
                    </v-list-item-icon>

                    <v-list-item-content class="red--text">
                      Delete
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <v-divider class="my-4" />

            <div class="d-flex justify-space-between">
              <v-btn small rounded text color="primary" @click="openConfig(p)">
                Configure
              </v-btn>

              <v-btn small rounded text color="primary" @click="openChat(p)">
                Open AI Chat
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- CREATE / EDIT PROJECT -->
    <v-dialog
      v-model="dialog"
      max-width="520"
      rounded="xl"
      persistent
      overlay-opacity="0.8"
      overlay-color="#2c3e50"
    >
      <v-card rounded="xl">
        <!-- Header -->
        <div class="pa-6 pb-0 d-flex align-center">
          <v-avatar color="#eff2fb" rounded="xl" size="48" class="mr-4">
            <v-icon color="black">
              {{ editMode ? "mdi-pencil" : "mdi-database-plus" }}
            </v-icon>
          </v-avatar>

          <div>
            <div class="text-h6 font-weight-bold black--text">
              {{ editMode ? "Edit Project" : "Create New Project" }}
            </div>

            <div class="text-caption grey--text">
              Configure your AI database connection
            </div>
          </div>

          <v-spacer></v-spacer>

          <v-btn icon @click="dialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-divider class="mt-4" />

        <!-- Form -->
        <v-card-text class="pa-6">
          <v-text-field
            v-model="form.name"
            label="Project Name"
            outlined
            dense
            placeholder="Example: Ecommerce Database"
            class="mb-4"
          />

          <v-select
            v-model="form.dbType"
            :items="['mysql']"
            label="Database Type"
            outlined
            dense
            class="mb-4"
          />

          <v-text-field
            v-model="form.dbVersion"
            label="Database Version"
            outlined
            dense
            placeholder="Example: 8.0"
          />
        </v-card-text>

        <!-- Actions -->
        <div class="px-6 pb-6 d-flex justify-end">
          <v-btn text rounded class="mr-2" @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn
            color="primary"
            rounded
            depressed
            :disabled="!form.name"
            @click="saveProject"
          >
            Save Project
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
      projects: [],
      loading: false,

      dialog: false,
      editMode: false,

      form: {
        _id: null,
        name: "",
        dbType: "mysql",
        dbVersion: "8.0",
      },
    };
  },

  mounted() {
    this.loadProjects();
  },

  methods: {
    async loadProjects() {
      this.loading = true;

      try {
        const res = await apiClient.get("/database-ai/projects");

        this.projects = res.data.projects;
      } catch (err) {
        console.error("Projects load error", err);
      }

      this.loading = false;
    },

    openCreateDialog() {
      this.editMode = false;

      this.form = {
        name: "",
        dbType: "mysql",
        dbVersion: "8.0",
      };

      this.dialog = true;
    },

    editProject(p) {
      this.editMode = true;

      this.form = { ...p };

      this.dialog = true;
    },

    async saveProject() {
      try {
        if (this.editMode) {
          await apiClient.put(
            `/database-ai/project/${this.form._id}`,
            this.form,
          );
        } else {
          await apiClient.post("/database-ai/project", this.form);
        }

        this.dialog = false;

        this.loadProjects();
      } catch (err) {
        console.error("Save project error", err);
      }
    },

    async deleteProject(p) {
      if (!confirm("Delete this project?")) return;

      try {
        await apiClient.delete(`/database-ai/project/${p._id}`);

        this.loadProjects();
      } catch (err) {
        console.error("Delete project error", err);
      }
    },

    openConfig(p) {
      this.$router.push(`/dashboard/database-ai/project/${p._id}/config`);
    },

    openChat(p) {
      this.$router.push(`/dashboard/database-ai/project/${p._id}/chat`);
    },
  },
};
</script>

<style scoped>
.project-card {
  transition: all 0.25s ease;
}

.project-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.06);
}
</style>
