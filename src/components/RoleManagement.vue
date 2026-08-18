<template>
  <div>
    <!-- DIALOG -->
    <v-dialog v-model="dialog" max-width="800" persistent>
      <v-card rounded="xl" :loading="loading">
        <!-- HEADER -->
        <v-card-title class="d-flex align-center">
          <v-avatar color="#eff2fb" size="45" class="mr-3">
            <v-icon>mdi-shield-account</v-icon>
          </v-avatar>

          <div>
            <div class="text-h6 font-weight-bold">Role Management</div>
            <div class="text-caption grey--text">
              Manage roles & permissions
            </div>
          </div>

          <v-spacer />

          <v-btn icon @click="close">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <!-- FORM -->
        <div class="pa-4">
          <v-text-field v-model="form.name" label="Role Name" outlined dense />

          <v-select
            v-model="form.permissions"
            :items="allPermissions"
            label="Permissions"
            multiple
            chips
            outlined
            clearable
          />

          <v-btn color="primary" depressed rounded @click="handleSubmit">
            {{ editId ? "Update Role" : "Create Role" }}
          </v-btn>
        </div>

        <v-divider />

        <!-- TABLE -->
        <v-data-table :headers="headers" :items="roles" dense>
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.permissions="{ item }">
            <v-chip small v-for="p in item.permissions" :key="p" class="ma-1">
              {{ p }}
            </v-chip>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.actions="{ item }">
            <v-btn icon small @click="onEdit(item)">
              <v-icon small>mdi-pencil</v-icon>
            </v-btn>

            <v-btn
              icon
              small
              color="red"
              @click="onDelete(item)"
              :disabled="item.isDefault"
            >
              <v-icon small>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" top right>
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  name: "RoleManagement",

  props: {
    value: Boolean, // v-model from parent
  },

  data() {
    return {
      dialog: false,
      loading: false,

      roles: [],

      editId: null,

      form: {
        name: "",
        permissions: [],
      },

      allPermissions: [
        "chat:read",
        "chat:reply",
        "analytics:view",
        "user:manage",
        "user:reset-password",
        "role:manage",
        "call:read",
        "call:reply",
        "form:read",
        "form:manage",
        "comment:read",
        "comment:write",
        "db:read",
        "db:manage",
        "schema:read",
        "schema:manage",
        "query:read",
        "query:write",
        "content:read",
        "content:scrape",
        "knowledge:read",
        "knowledge:write",
        "ip:read",
        "ip:manage",
        "settings:manage",
        "insight:read",
        "insight:manage",
      ],

      headers: [
        { text: "Role Name", value: "name" },
        { text: "Permissions", value: "permissions" },
        { text: "Actions", value: "actions", sortable: false },
      ],

      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },

  watch: {
    value(val) {
      this.dialog = val;
      if (val) this.fetchRoles();
    },

    dialog(val) {
      this.$emit("input", val);

      // 🔥 RESET WHEN CLOSED
      if (!val) {
        this.resetForm();
      }
    },
  },

  methods: {
    close() {
      this.dialog = false;
      this.resetForm();
    },

    async fetchRoles() {
      try {
        this.loading = true;
        const { data } = await apiClient.get("/roles");
        this.roles = data.data;
      } catch {
        this.showSnackbar("Failed to load roles", "error");
      } finally {
        this.loading = false;
      }
    },

    async handleSubmit() {
      if (!this.form.name) {
        return this.showSnackbar("Role name required", "error");
      }

      this.editId ? this.updateRole() : this.createRole();
    },

    async createRole() {
      try {
        this.loading = true;

        await apiClient.post("/roles", this.form);

        this.showSnackbar("Role created", "success");
        this.resetForm();
        this.fetchRoles();
      } catch (err) {
        this.showSnackbar(
          err?.response?.data?.message || "Create failed",
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    async updateRole() {
      try {
        this.loading = true;

        await apiClient.put(`/roles/${this.editId}`, this.form);

        this.showSnackbar("Role updated", "success");
        this.resetForm();
        this.fetchRoles();
      } catch {
        this.showSnackbar("Update failed", "error");
      } finally {
        this.loading = false;
      }
    },

    async onDelete(role) {
      try {
        this.loading = true;

        await apiClient.delete(`/roles/${role._id}`);

        this.showSnackbar("Role deleted", "success");
        this.fetchRoles();
      } catch (err) {
        this.showSnackbar(
          err?.response?.data?.message || "Delete failed",
          "error",
        );
      } finally {
        this.loading = false;
      }
    },

    onEdit(role) {
      this.editId = role._id;

      this.form = {
        name: role.name,
        permissions: [...role.permissions], // ✅ FIX
      };
    },

    resetForm() {
      this.form = {
        name: "",
        permissions: [],
      };

      this.editId = null;
    },

    showSnackbar(message, color) {
      this.snackbar = { show: true, message, color };
    },
  },
};
</script>
