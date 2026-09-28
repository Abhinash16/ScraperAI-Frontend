<template>
  <div>
    <!-- Toolbar -->
    <div class="d-flex align-center flex-wrap toolbar mb-4">
      <v-text-field
        v-model="search"
        placeholder="Search name or email"
        prepend-inner-icon="mdi-magnify"
        outlined
        dense
        hide-details
        clearable
        class="toolbar-search mr-3 mb-2"
      />
      <v-select
        v-model="roleFilter"
        :items="roleFilterItems"
        outlined
        dense
        hide-details
        class="toolbar-filter mr-3 mb-2"
      />
      <v-select
        v-model="statusFilter"
        :items="statusFilterItems"
        outlined
        dense
        hide-details
        class="toolbar-filter mr-3 mb-2"
      />
      <v-spacer />
      <v-btn color="primary" rounded depressed class="mb-2" @click="openDialog('create')">
        <v-icon left>mdi-account-plus-outline</v-icon> Add member
      </v-btn>
    </div>

    <v-alert v-if="loadError" type="error" outlined rounded="xl">
      {{ loadError }}
      <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
    </v-alert>

    <v-card v-else outlined rounded="xl">
      <v-skeleton-loader v-if="loading && !users.length" type="table-row@4" class="pa-4" />

      <div v-else-if="!filteredUsers.length" class="empty-state text-center pa-10">
        <v-icon large color="grey lighten-1" class="mb-2">mdi-account-search-outline</v-icon>
        <div class="text-body-1 font-weight-medium">
          {{ users.length ? "No members match your filters" : "No members yet" }}
        </div>
        <div class="text-body-2 grey--text text--darken-1 mb-4">
          {{ users.length ? "Try a different search or filter." : "Add your first team member." }}
        </div>
        <v-btn v-if="users.length" text rounded color="primary" @click="clearFilters">
          Clear filters
        </v-btn>
      </div>

      <v-data-table
        v-else
        :headers="headers"
        :items="filteredUsers"
        item-key="_id"
        :items-per-page="25"
        :footer-props="{ 'items-per-page-options': [10, 25, 50, -1] }"
        :hide-default-footer="filteredUsers.length <= 25"
        mobile-breakpoint="700"
        class="members-table"
      >
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="36" :color="avatarColor(item)" class="mr-3 flex-shrink-0">
              <span class="white--text text-caption font-weight-bold">
                {{ initials(item) }}
              </span>
            </v-avatar>
            <div style="min-width: 0">
              <div class="font-weight-medium d-flex align-center">
                <span class="text-truncate">{{ item.name || "—" }}</span>
                <v-chip v-if="isSelf(item)" x-small color="primary" class="ml-2">You</v-chip>
              </div>
              <div class="text-caption grey--text text--darken-1 text-truncate">
                {{ item.email }}
              </div>
            </div>
          </div>
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.role="{ item }">
          <RoleChip :role="item.roleId" />
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.status="{ item }">
          <span :class="['status-pill', item.status === 1 ? 'active' : 'inactive']">
            <span class="dot" />
            {{ item.status === 1 ? "Active" : "Inactive" }}
          </span>
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.createdAt="{ item }">
          <span class="text-body-2 grey--text text--darken-2">
            {{ item.createdAt ? $moment(item.createdAt).format("D MMM YYYY") : "—" }}
          </span>
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <v-menu offset-y left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                v-bind="attrs"
                :disabled="!actionsFor(item).length"
                :title="actionsFor(item).length ? 'Actions' : 'You can\'t manage this member'"
                v-on="on"
              >
                <v-icon>mdi-dots-horizontal</v-icon>
              </v-btn>
            </template>
            <v-list dense class="py-1">
              <v-list-item
                v-for="action in actionsFor(item)"
                :key="action.id"
                @click="runAction(action.id, item)"
              >
                <v-list-item-icon class="mr-3">
                  <v-icon small :color="action.color">{{ action.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-title :class="action.color ? `${action.color}--text` : ''">
                  {{ action.label }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>

    <MemberDialog
      v-model="dialog.open"
      :mode="dialog.mode"
      :member="dialog.member"
      :roles="roles"
      :is-self="dialog.member ? isSelf(dialog.member) : false"
      :can-manage-roles="canManageRoles"
      @saved="onSaved"
      @open-roles="dialog.open = false; $emit('open-roles')"
    />

    <ResetMemberPasswordDialog v-model="resetDialog.open" :member="resetDialog.member" />

    <ConfirmDialog
      v-model="confirm.open"
      :title="confirm.title"
      :confirm-label="confirm.label"
      :color="confirm.color"
      :icon="confirm.icon"
      :loading="confirm.loading"
      @confirm="runConfirm"
    >
      {{ confirm.text }}
    </ConfirmDialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import RoleChip from "@/components/team/RoleChip.vue";
import MemberDialog from "@/components/team/MemberDialog.vue";
import ResetMemberPasswordDialog from "@/components/team/ResetMemberPasswordDialog.vue";
import ConfirmDialog from "@/components/team/ConfirmDialog.vue";
import { apiError, initialsOf, roleColor, withinLevel, FULL_ACCESS } from "@/utils/team";

export default {
  name: "MembersTab",

  components: { RoleChip, MemberDialog, ResetMemberPasswordDialog, ConfirmDialog },

  props: {
    // { _id, permissions } of the signed-in user
    me: { type: Object, required: true },
    canManageRoles: { type: Boolean, default: false },
  },

  data() {
    return {
      users: [],
      roles: [],
      loading: false,
      loadError: "",

      search: "",
      roleFilter: "all",
      statusFilter: "all",

      headers: [
        { text: "Member", value: "name" },
        { text: "Role", value: "role", sortable: false },
        { text: "Status", value: "status" },
        { text: "Added", value: "createdAt" },
        { text: "", value: "actions", sortable: false, align: "end", width: 56 },
      ],

      dialog: { open: false, mode: "create", member: null },
      resetDialog: { open: false, member: null },
      confirm: { open: false, title: "", text: "", label: "", color: "error", icon: "", loading: false, run: null },
    };
  },

  computed: {
    myPermissions() {
      return this.me.permissions || [];
    },

    roleFilterItems() {
      return [
        { text: "All roles", value: "all" },
        ...this.roles.map((r) => ({ text: r.name, value: r._id })),
        { text: "No role", value: "none" },
      ];
    },

    statusFilterItems() {
      return [
        { text: "Any status", value: "all" },
        { text: "Active", value: 1 },
        { text: "Inactive", value: 0 },
      ];
    },

    filteredUsers() {
      const q = (this.search || "").trim().toLowerCase();
      return this.users.filter((u) => {
        if (q && !`${u.name || ""} ${u.email || ""}`.toLowerCase().includes(q)) return false;
        if (this.roleFilter === "none" && u.roleId) return false;
        if (this.roleFilter !== "all" && this.roleFilter !== "none" && u.roleId?._id !== this.roleFilter) {
          return false;
        }
        if (this.statusFilter !== "all" && u.status !== this.statusFilter) return false;
        return true;
      });
    },
  },

  mounted() {
    this.load();
  },

  methods: {
    initials(u) {
      return initialsOf(u.name, u.email);
    },

    avatarColor(u) {
      return u.status === 1 ? roleColor(u.roleId) : "grey";
    },

    isSelf(u) {
      return u._id === this.me._id;
    },

    hasPermission(p) {
      return this.myPermissions.includes(FULL_ACCESS) || this.myPermissions.includes(p);
    },

    // Mirrors the server: others only, and only at or below your level.
    canManage(u) {
      return !this.isSelf(u) && withinLevel(u.roleId?.permissions, this.myPermissions);
    },

    actionsFor(u) {
      const manage = this.canManage(u);
      const actions = [];
      if (manage || this.isSelf(u)) actions.push({ id: "edit", label: "Edit", icon: "mdi-pencil-outline" });
      if (manage) actions.push({ id: "role", label: "Change role", icon: "mdi-shield-account-outline" });
      if (manage) {
        actions.push(
          u.status === 1
            ? { id: "deactivate", label: "Deactivate", icon: "mdi-account-cancel-outline" }
            : { id: "activate", label: "Activate", icon: "mdi-account-check-outline" },
        );
      }
      if (this.hasPermission("user:reset-password") && !this.isSelf(u) && withinLevel(u.roleId?.permissions, this.myPermissions)) {
        actions.push({ id: "reset", label: "Reset password", icon: "mdi-lock-reset" });
      }
      if (manage) actions.push({ id: "remove", label: "Remove", icon: "mdi-delete-outline", color: "error" });
      return actions;
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const [users, roles] = await Promise.all([
          apiClient.get("/users"),
          apiClient.get("/users/roles"),
        ]);
        this.users = users.data.data || [];
        this.roles = roles.data.data || [];
      } catch (err) {
        this.loadError = apiError(err, "Failed to load team members");
      } finally {
        this.loading = false;
      }
    },

    clearFilters() {
      this.search = "";
      this.roleFilter = "all";
      this.statusFilter = "all";
    },

    openDialog(mode, member = null) {
      this.dialog = { open: true, mode, member };
    },

    onSaved(saved) {
      // roleId may come back unpopulated (just the id)
      const user =
        typeof saved.roleId === "string"
          ? { ...saved, roleId: this.roles.find((r) => r._id === saved.roleId) || null }
          : saved;
      const i = this.users.findIndex((u) => u._id === user._id);
      if (i === -1) {
        this.users.unshift(user);
        this.$toast.success(`${user.name || user.email} added`);
      } else {
        this.$set(this.users, i, { ...this.users[i], ...user });
        this.$toast.success("Member updated");
      }
    },

    runAction(id, u) {
      if (id === "edit") this.openDialog("edit", u);
      else if (id === "role") this.openDialog("role", u);
      else if (id === "activate") this.setStatus(u, 1);
      else if (id === "reset") this.resetDialog = { open: true, member: u };
      else if (id === "deactivate") {
        this.openConfirm({
          title: "Deactivate member?",
          text: `${u.name || u.email} won't be able to sign in until you activate them again.`,
          label: "Deactivate",
          color: "warning",
          icon: "mdi-account-cancel-outline",
          run: () => this.setStatus(u, 0),
        });
      } else if (id === "remove") {
        this.openConfirm({
          title: "Remove member?",
          text: `${u.name || u.email} will lose access immediately. This can't be undone.`,
          label: "Remove",
          color: "error",
          icon: "mdi-delete-outline",
          run: () => this.remove(u),
        });
      }
    },

    openConfirm(options) {
      this.confirm = { ...options, open: true, loading: false };
    },

    async runConfirm() {
      this.confirm.loading = true;
      try {
        await this.confirm.run();
        this.confirm.open = false;
      } finally {
        this.confirm.loading = false;
      }
    },

    async setStatus(u, status) {
      try {
        const { data } = await apiClient.put(`/users/${u._id}`, { status });
        const i = this.users.findIndex((x) => x._id === u._id);
        if (i !== -1) this.$set(this.users, i, { ...this.users[i], ...(data.data || { status }) });
        this.$toast.success(status === 1 ? "Member activated" : "Member deactivated");
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to update status"));
      }
    },

    async remove(u) {
      try {
        await apiClient.delete(`/users/${u._id}`);
        this.users = this.users.filter((x) => x._id !== u._id);
        this.$toast.success("Member removed");
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to remove member"));
      }
    },
  },
};
</script>

<style scoped>
.toolbar-search {
  flex: 1 1 240px;
  max-width: 320px;
}

.toolbar-filter {
  flex: 0 1 170px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
}

.status-pill .dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
}

.status-pill.active {
  background: #e7f6ec;
  color: #1e7e34;
}

.status-pill.active .dot {
  background: #28a745;
}

.status-pill.inactive {
  background: #f1f3f5;
  color: #6c757d;
}

.status-pill.inactive .dot {
  background: #adb5bd;
}

.members-table ::v-deep th {
  font-size: 12px !important;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

@media (max-width: 600px) {
  .toolbar-search,
  .toolbar-filter {
    flex: 1 1 100%;
    max-width: none;
    margin-right: 0 !important;
  }
}
</style>
