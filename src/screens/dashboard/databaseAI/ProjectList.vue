<template>
  <div>
    <!-- HEADER -->
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div>
          <div class="text-h5 font-weight-bold">Database AI Projects</div>
          <div class="grey--text">Manage your AI query databases</div>
        </div>

        <v-btn color="primary" @click="openCreateDialog">
          <v-icon left>mdi-database-plus</v-icon>
          New Project
        </v-btn>
      </v-col>
    </v-row>

    <!-- LOADING -->
    <v-row v-if="loading" class="mt-4">
      <v-col cols="12">
        <v-card elevation="0" class="pa-6 rounded-xl">
          <v-skeleton-loader
            type="card, list-item, list-item"
          ></v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>

    <!-- PROJECT LIST -->
    <v-row v-if="!loading" class="mt-4">
      <v-col cols="12" md="6" v-for="p in projects" :key="p._id">
        <v-card outlined class="pa-6 rounded-xl project-card" elevation="0">
          <div class="d-flex justify-space-between align-center">
            <div>
              <div class="text-h6 font-weight-medium">
                {{ p.name }}
              </div>

              <div class="grey--text text-caption mt-1">
                {{ p.dbType }} • {{ p.dbVersion }}
              </div>

              <div class="mt-2 text-caption">
                Tables: {{ p.tableCount || 0 }}
              </div>
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
                  <v-list-item-content>Config</v-list-item-content>
                </v-list-item>

                <v-list-item @click="openChat(p)">
                  <v-list-item-icon>
                    <v-icon small>mdi-robot</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>AI Chat</v-list-item-content>
                </v-list-item>

                <v-list-item @click="editProject(p)">
                  <v-list-item-icon>
                    <v-icon small>mdi-pencil</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>Edit</v-list-item-content>
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
        </v-card>
      </v-col>
    </v-row>

    <!-- CREATE / EDIT DIALOG -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card class="pa-6 rounded-xl">
        <div class="text-h6 font-weight-bold mb-4">
          {{ editMode ? "Edit Project" : "Create Project" }}
        </div>

        <v-text-field v-model="form.name" label="Project Name" />

        <v-select
          v-model="form.dbType"
          :items="['mysql']"
          label="Database Type"
        />

        <v-text-field v-model="form.dbVersion" label="Database Version" />

        <div class="d-flex justify-end mt-4">
          <v-btn text @click="dialog = false"> Cancel </v-btn>

          <v-btn color="primary" @click="saveProject"> Save </v-btn>
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
