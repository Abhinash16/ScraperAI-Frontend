<template>
  <div>
    <div class="d-flex align-center flex-wrap mb-4">
      <div class="text-body-2 grey--text text--darken-1 mr-4 mb-2">
        A role is a set of permissions. Each member has one role.
      </div>
      <v-spacer />
      <v-btn
        color="primary"
        rounded
        depressed
        class="mb-2"
        :disabled="!catalog"
        @click="openEditor()"
      >
        <v-icon left>$plus</v-icon> New role
      </v-btn>
    </div>

    <v-alert v-if="loadError" type="error" outlined rounded="xl">
      {{ loadError }}
      <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
    </v-alert>

    <v-row v-else-if="loading && !roles.length">
      <v-col v-for="i in 4" :key="i" cols="12" sm="6" lg="4">
        <v-skeleton-loader type="card-heading, list-item-two-line" class="rounded-xl" />
      </v-col>
    </v-row>

    <template v-else>
      <v-row>
        <v-col v-for="role in sortedRoles" :key="role._id" cols="12" sm="6" lg="4">
          <v-card outlined rounded="xl" class="role-card pa-5 d-flex flex-column">
            <div class="d-flex align-start">
              <v-avatar size="40" :color="`${color(role)} lighten-5`" class="mr-3">
                <v-icon :color="color(role)">
                  {{ owner(role) ? "$crown" : "$shield-user" }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1" style="min-width: 0">
                <div class="d-flex align-center flex-wrap">
                  <span class="font-weight-bold text-truncate mr-2">{{ role.name }}</span>
                  <v-chip v-if="role.isDefault" x-small outlined color="grey darken-1">
                    <v-icon x-small left>$lock</v-icon> Default
                  </v-chip>
                </div>
                <div class="text-caption grey--text text--darken-1">
                  {{ role.userCount || 0 }} member{{ role.userCount === 1 ? "" : "s" }}
                  · {{ summary(role) }}
                </div>
              </div>
            </div>

            <div class="group-chips mt-3">
              <v-chip
                v-for="g in groupsFor(role)"
                :key="g"
                x-small
                class="mr-1 mb-1"
              >
                {{ g }}
              </v-chip>
            </div>

            <v-spacer />
            <v-divider class="my-3" />

            <div class="d-flex align-center">
              <v-btn
                small
                text
                rounded
                color="primary"
                :disabled="!role.editable"
                :title="role.editable ? '' : lockedReason(role)"
                @click="openEditor(role)"
              >
                <v-icon small class="mr-1">$pencil</v-icon> Edit
              </v-btn>
              <v-btn
                small
                text
                rounded
                :disabled="role.assignable === false"
                :title="role.assignable === false ? 'You can only copy roles with permissions you have' : ''"
                @click="openEditor(null, role)"
              >
                <v-icon small class="mr-1">$copy</v-icon> Duplicate
              </v-btn>
              <v-spacer />
              <v-tooltip top :disabled="!deleteBlocked(role)">
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">
                    <v-btn
                      icon
                      small
                      :disabled="!!deleteBlocked(role)"
                      title="Delete role"
                      @click="confirmDelete(role)"
                    >
                      <v-icon small color="error">$trash-2</v-icon>
                    </v-btn>
                  </span>
                </template>
                {{ deleteBlocked(role) }}
              </v-tooltip>
            </div>
          </v-card>
        </v-col>

        <!-- Empty state for custom roles -->
        <v-col v-if="!customRoles.length" cols="12" sm="6" lg="4">
          <div class="empty-card text-center pa-6" @click="catalog && openEditor()">
            <v-icon large color="grey lighten-1" class="mb-2">$shield-plus</v-icon>
            <div class="font-weight-medium">No custom roles yet</div>
            <div class="text-caption grey--text text--darken-1">
              Create one to fine-tune what each member can do.
            </div>
          </div>
        </v-col>
      </v-row>
    </template>

    <RoleEditorDialog
      v-if="catalog"
      v-model="editor.open"
      :role="editor.role"
      :copy-from="editor.copyFrom"
      :catalog="catalog"
      :my-permissions="me.permissions || []"
      @saved="onSaved"
    />

    <ConfirmDialog
      v-model="deleteDialog.open"
      title="Delete role?"
      confirm-label="Delete role"
      icon="$trash-2"
      :loading="deleteDialog.loading"
      @confirm="remove"
    >
      The <strong>{{ deleteDialog.role && deleteDialog.role.name }}</strong> role
      will be deleted. This can't be undone.
    </ConfirmDialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import RoleEditorDialog from "@/components/team/RoleEditorDialog.vue";
import ConfirmDialog from "@/components/team/ConfirmDialog.vue";
import { FULL_ACCESS, apiError, isOwnerRole, permissionSummary, roleColor } from "@/utils/team";

export default {
  name: "RolesTab",

  components: { RoleEditorDialog, ConfirmDialog },

  props: {
    me: { type: Object, required: true },
  },

  data() {
    return {
      roles: [],
      catalog: null,
      loading: false,
      loadError: "",
      editor: { open: false, role: null, copyFrom: null },
      deleteDialog: { open: false, role: null, loading: false },
    };
  },

  computed: {
    // Default roles first (owner on top), then custom roles by name.
    sortedRoles() {
      return [...this.roles].sort((a, b) => {
        if (isOwnerRole(a) !== isOwnerRole(b)) return isOwnerRole(a) ? -1 : 1;
        if (!!a.isDefault !== !!b.isDefault) return a.isDefault ? -1 : 1;
        return String(a.name).localeCompare(String(b.name));
      });
    },

    customRoles() {
      return this.roles.filter((r) => !r.isDefault);
    },

    // permission key -> group label
    groupOf() {
      const map = {};
      (this.catalog?.groups || []).forEach((g) => {
        g.permissions.forEach((p) => {
          map[p.key] = g.label;
        });
      });
      return map;
    },
  },

  mounted() {
    this.load();
  },

  methods: {
    owner(role) {
      return isOwnerRole(role);
    },

    color(role) {
      return roleColor(role).split(" ")[0];
    },

    // Count only permissions the catalog still lists
    summary(role) {
      const permissions = (role.permissions || []).filter(
        (p) => p === FULL_ACCESS || this.groupOf[p],
      );
      return permissionSummary({ ...role, permissions });
    },

    groupsFor(role) {
      if (isOwnerRole(role)) return ["Everything"];
      const groups = new Set((role.permissions || []).map((p) => this.groupOf[p]).filter(Boolean));
      return [...groups];
    },

    lockedReason(role) {
      if (role.isDefault && isOwnerRole(role)) return "The owner role can't be changed";
      return "This role has permissions you don't have";
    },

    deleteBlocked(role) {
      if (role.userCount > 0) {
        return `Move its ${role.userCount} member${role.userCount === 1 ? "" : "s"} to another role first`;
      }
      if (role.isDefault && isOwnerRole(role)) return "The owner role can't be deleted";
      if (!role.deletable) return "You can't delete this role";
      return "";
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const [roles, catalog] = await Promise.all([
          apiClient.get("/roles"),
          apiClient.get("/roles/permissions"),
        ]);
        this.roles = roles.data.data || [];
        this.catalog = catalog.data.data || { groups: [] };
      } catch (err) {
        this.loadError = apiError(err, "Failed to load roles");
      } finally {
        this.loading = false;
      }
    },

    openEditor(role = null, copyFrom = null) {
      this.editor = { open: true, role, copyFrom };
    },

    onSaved(saved) {
      const i = this.roles.findIndex((r) => r._id === saved._id);
      if (i === -1) {
        this.roles.push({ userCount: 0, editable: true, deletable: true, assignable: true, ...saved });
        this.$toast.success(`Role "${saved.name}" created`);
      } else {
        this.$set(this.roles, i, { ...this.roles[i], ...saved });
        this.$toast.success("Role saved");
      }
      // Refresh server-computed flags (editable/deletable/assignable, counts).
      this.refreshQuietly();
    },

    async refreshQuietly() {
      try {
        const { data } = await apiClient.get("/roles");
        this.roles = data.data || this.roles;
      } catch {
        // keep the optimistic list
      }
    },

    confirmDelete(role) {
      this.deleteDialog = { open: true, role, loading: false };
    },

    async remove() {
      const role = this.deleteDialog.role;
      this.deleteDialog.loading = true;
      try {
        await apiClient.delete(`/roles/${role._id}`);
        this.roles = this.roles.filter((r) => r._id !== role._id);
        this.deleteDialog.open = false;
        this.$toast.success("Role deleted");
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to delete role"));
      } finally {
        this.deleteDialog.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.role-card {
  height: 100%;
}

.empty-card {
  height: 100%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #cfd6e6;
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.15s;
}

.empty-card:hover {
  background: #f6f8fd;
}
</style>
