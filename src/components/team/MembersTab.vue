<template>
  <div>
    <!-- TOOLBAR -->
    <v-card outlined rounded="lg" class="px-3 py-2 mb-4">
      <v-row dense align="center">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="search"
            placeholder="Search name or email"
            prepend-inner-icon="$search"
            outlined
            dense
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-select v-model="roleFilter" :items="roleFilterItems" outlined dense hide-details />
        </v-col>
        <v-col cols="6" sm="3" md="2">
          <v-select v-model="statusFilter" :items="statusFilterItems" outlined dense hide-details />
        </v-col>
        <v-spacer />
        <v-col cols="12" md="auto" class="text-right">
          <v-btn color="primary" depressed @click="openDialog('create')">
            <v-icon left size="16">$user-plus</v-icon>
            Add member
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-alert v-if="loadError" type="error" text rounded="lg" class="text-body-2">
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ loadError }}</span>
        <v-spacer />
        <v-btn small outlined color="error" @click="load">
          <v-icon left size="14">$refresh-cw</v-icon>
          Retry
        </v-btn>
      </div>
    </v-alert>

    <v-card v-else outlined rounded="lg" class="overflow-hidden">
      <div class="d-flex align-center px-5 py-3">
        <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4">Members</span>
        <v-chip v-if="users.length" x-small label class="font-weight-bold ml-2">
          {{ filteredUsers.length }}<template v-if="filteredUsers.length !== users.length">
            of {{ users.length }}</template
          >
        </v-chip>
      </div>
      <v-divider />

      <v-skeleton-loader v-if="loading && !users.length" type="table-row@4" class="pa-4" />

      <div v-else-if="!filteredUsers.length" class="d-flex flex-column align-center text-center px-6 py-12">
        <v-avatar color="grey lighten-4" size="64" class="mb-4">
          <v-icon size="28" color="grey">$user-search</v-icon>
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1">
          {{ users.length ? "No members match your filters" : "No members yet" }}
        </div>
        <div class="text-body-2 grey--text text--darken-1 mb-4">
          {{ users.length ? "Try a different search or filter." : "Add your first team member." }}
        </div>
        <v-btn v-if="users.length" small outlined color="primary" @click="clearFilters">Clear filters</v-btn>
        <v-btn v-else small depressed color="primary" @click="openDialog('create')">
          <v-icon left size="14">$user-plus</v-icon>
          Add member
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
      >
        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="36" :color="avatarColor(item)" class="mr-3 flex-shrink-0">
              <span class="white--text text-caption font-weight-bold">{{ initials(item) }}</span>
            </v-avatar>
            <div class="overflow-hidden">
              <div class="d-flex align-center">
                <span class="text-body-2 font-weight-bold grey--text text--darken-4 text-truncate">
                  {{ item.name || "—" }}
                </span>
                <v-chip
                  v-if="isSelf(item)"
                  x-small
                  label
                  color="green lighten-5"
                  text-color="green darken-2"
                  class="font-weight-bold ml-2"
                >
                  You
                </v-chip>
              </div>
              <div class="text-caption grey--text text--darken-1 text-truncate">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.role="{ item }">
          <RoleChip :role="item.roleId" />
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.status="{ item }">
          <v-chip
            x-small
            label
            :color="item.status === 1 ? 'green lighten-5' : 'grey lighten-4'"
            :text-color="item.status === 1 ? 'green darken-2' : 'grey darken-1'"
            class="font-weight-bold"
          >
            <v-icon left size="8">$circle</v-icon>
            {{ item.status === 1 ? "Active" : "Inactive" }}
          </v-chip>
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.createdAt="{ item }">
          <span class="text-caption grey--text text--darken-1 text-no-wrap">
            {{ item.createdAt ? $moment(item.createdAt).format("D MMM YYYY") : "—" }}
          </span>
        </template>

        <!-- eslint-disable-next-line vue/valid-v-slot -->
        <template v-slot:item.actions="{ item }">
          <v-menu offset-y left nudge-bottom="4">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                small
                v-bind="attrs"
                :disabled="!actionsFor(item).length"
                :title="actionsFor(item).length ? 'Actions' : 'You can\'t manage this member'"
                aria-label="Member actions"
                v-on="on"
              >
                <v-icon size="18">$ellipsis-vertical</v-icon>
              </v-btn>
            </template>
            <v-card outlined rounded="lg">
              <v-list dense nav class="py-1">
                <v-list-item
                  v-for="action in actionsFor(item)"
                  :key="action.id"
                  @click="runAction(action.id, item)"
                >
                  <v-icon size="16" class="mr-3 flex-grow-0" :color="action.color || 'grey darken-2'">
                    {{ action.icon }}
                  </v-icon>
                  <v-list-item-title :class="action.color ? `${action.color}--text` : ''">
                    {{ action.label }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
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
      if (manage || this.isSelf(u)) actions.push({ id: "edit", label: "Edit", icon: "$pencil" });
      if (manage) actions.push({ id: "role", label: "Change role", icon: "$shield-user" });
      if (manage) {
        actions.push(
          u.status === 1
            ? { id: "deactivate", label: "Deactivate", icon: "$user-x" }
            : { id: "activate", label: "Activate", icon: "$user-check" },
        );
      }
      if (this.hasPermission("user:reset-password") && !this.isSelf(u) && withinLevel(u.roleId?.permissions, this.myPermissions)) {
        actions.push({ id: "reset", label: "Reset password", icon: "$rotate-ccw-key" });
      }
      if (manage) actions.push({ id: "remove", label: "Remove", icon: "$trash-2", color: "error" });
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
          icon: "$user-x",
          run: () => this.setStatus(u, 0),
        });
      } else if (id === "remove") {
        this.openConfirm({
          title: "Remove member?",
          text: `${u.name || u.email} will lose access immediately. This can't be undone.`,
          label: "Remove",
          color: "error",
          icon: "$trash-2",
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
