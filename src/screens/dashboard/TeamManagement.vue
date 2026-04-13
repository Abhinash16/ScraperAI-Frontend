<template>
  <v-card
    class="pa-6 my-6"
    rounded="xl"
    outlined
    color="#eff2fb"
    max-width="1000"
  >
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div class="d-flex align-center">
        <v-avatar rounded="xl" color="#cde6ff" size="50" class="mr-4">
          <v-icon color="black">mdi-account-multiple</v-icon>
        </v-avatar>
        <div>
          <h3 class="black--text">Team Management</h3>
          <div class="text-caption black--text">
            Manage your team members and roles
          </div>
        </div>
      </div>

      <v-btn color="primary" depressed rounded @click="openAddUser">
        + Add User
      </v-btn>
    </div>

    <!-- TABLE -->
    <v-data-table :headers="headers" :items="users">
      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template v-slot:item.role="{ item }">
        <v-chip small :color="getRoleColor(item.roleId?.name)" outlined>
          {{ item.roleId?.name }}
        </v-chip>
      </template>

      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template v-slot:item.status="{ item }">
        <span :class="item.status === 1 ? 'green--text' : 'red--text'">
          {{ item.status === 1 ? "Active" : "Disabled" }}
        </span>
      </template>

      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template v-slot:item.actions="{ item }">
        <v-btn
          icon
          small
          @click="editUser(item)"
          :disabled="item.roleId?.name === 'owner'"
        >
          <v-icon small>mdi-pencil</v-icon>
        </v-btn>

        <v-btn
          icon
          small
          color="red"
          @click="openDelete(item._id)"
          :disabled="item.roleId?.name === 'owner'"
        >
          <v-icon small>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- ADD USER -->
    <v-dialog v-model="addDialog" max-width="500" persistent>
      <v-card rounded="xl" :loading="loading">
        <v-card-title class="d-flex align-center">
          <v-avatar color="#eff2fb" size="45" class="mr-3">
            <v-icon>mdi-account-plus</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">Add User</div>
            <div class="text-caption grey--text">Create a new team member</div>
          </div>

          <v-spacer></v-spacer>
          <v-btn icon @click="addDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Name" outlined dense />
          <v-text-field v-model="form.email" label="Email" outlined dense />
          <v-text-field
            v-model="form.password"
            label="Password"
            type="password"
            outlined
            dense
          />

          <v-select
            v-model="form.roleId"
            :items="roles"
            item-text="name"
            item-value="_id"
            label="Role"
            outlined
            dense
          />
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-btn
            block
            large
            color="primary"
            @click="createUser"
            depressed
            rounded
          >
            Create User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- EDIT USER -->
    <v-dialog v-model="editDialog" max-width="500" persistent>
      <v-card rounded="xl" :loading="loading">
        <v-card-title class="d-flex align-center">
          <v-avatar color="#eff2fb" size="45" class="mr-3">
            <v-icon>mdi-account-edit</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">Edit User</div>
            <div class="text-caption grey--text">Update user details</div>
          </div>

          <v-spacer></v-spacer>
          <v-btn icon @click="editDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pt-4">
          <v-text-field v-model="editForm.name" label="Name" outlined dense />

          <v-select
            v-model="editForm.roleId"
            :items="roles"
            item-text="name"
            item-value="_id"
            label="Role"
            outlined
            dense
          />

          <v-select
            v-model="editForm.status"
            :items="[
              { text: 'Active', value: 1 },
              { text: 'Disabled', value: 0 },
            ]"
            label="Status"
            outlined
            dense
          />
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-btn
            block
            large
            color="primary"
            @click="updateUser"
            depressed
            rounded
          >
            Update User
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE CONFIRM -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card rounded="xl" class="text-center pa-4">
        <v-card-text>
          <v-avatar color="red lighten-5" size="60" class="mb-3">
            <v-icon color="red">mdi-delete-outline</v-icon>
          </v-avatar>

          <div class="text-h6 font-weight-bold mb-2">Delete User?</div>

          <div class="text-body-2 grey--text">
            Are you sure you want to delete this user?
          </div>
        </v-card-text>

        <v-card-actions class="justify-center pb-4">
          <v-btn text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="red" depressed rounded @click="confirmDelete">
            Yes, Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- SNACKBAR -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3000"
      top
      right
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-card>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      users: [],
      roles: [],
      loading: false,

      addDialog: false,
      editDialog: false,
      deleteDialog: false,
      deleteId: null,

      snackbar: {
        show: false,
        message: "",
        color: "success",
      },

      form: {
        name: "",
        email: "",
        password: "",
        roleId: "",
      },

      editForm: {
        userId: "",
        name: "",
        roleId: "",
        status: 1,
      },

      headers: [
        { text: "Name", value: "name" },
        { text: "Email", value: "email" },
        { text: "Role", value: "role" },
        { text: "Status", value: "status" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },

  mounted() {
    this.fetchUsers();
  },

  methods: {
    async fetchUsers() {
      const { data } = await apiClient.get("/users");
      this.users = data.data;
    },

    async fetchRoles() {
      const { data } = await apiClient.get("/users/roles");
      this.roles = data.data;
    },

    openAddUser() {
      this.addDialog = true;
      this.fetchRoles();
    },

    async createUser() {
      try {
        this.loading = true;
        await apiClient.post("/users", this.form);
        this.showSnackbar("User created successfully", "success");
        this.addDialog = false;
        this.fetchUsers();
      } catch {
        this.showSnackbar("Failed to create user", "error");
      } finally {
        this.loading = false;
      }
    },

    openDelete(id) {
      this.deleteId = id;
      this.deleteDialog = true;
    },

    async confirmDelete() {
      try {
        this.loading = true;
        await apiClient.delete(`/users/${this.deleteId}`);
        this.showSnackbar("User deleted successfully", "success");
        this.fetchUsers();
      } catch {
        this.showSnackbar("Failed to delete user", "error");
      } finally {
        this.loading = false;
        this.deleteDialog = false;
      }
    },

    editUser(user) {
      this.editForm = {
        userId: user._id,
        name: user.name,
        roleId: user.roleId?._id,
        status: user.status,
      };
      this.fetchRoles();
      this.editDialog = true;
    },

    async updateUser() {
      try {
        this.loading = true;
        await apiClient.put(`/users/${this.editForm.userId}`, {
          name: this.editForm.name,
          roleId: this.editForm.roleId,
          status: this.editForm.status,
        });

        this.showSnackbar("User updated successfully", "success");
        this.editDialog = false;
        this.fetchUsers();
      } catch {
        this.showSnackbar("Failed to update user", "error");
      } finally {
        this.loading = false;
      }
    },

    showSnackbar(message, color) {
      this.snackbar = {
        show: true,
        message,
        color,
      };
    },

    getRoleColor(role) {
      switch (role) {
        case "owner":
          return "purple";
        case "admin":
          return "indigo";
        case "agent":
          return "blue";
        default:
          return "grey";
      }
    },
  },
};
</script>
