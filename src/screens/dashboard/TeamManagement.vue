<template>
  <div class="team-page">
    <!-- Header -->
    <div class="d-flex align-center mb-6">
      <v-avatar size="48" rounded="xl" color="#cde6ff" class="mr-4">
        <v-icon color="black">mdi-account-group-outline</v-icon>
      </v-avatar>
      <div>
        <div class="text-h5 font-weight-bold">Team</div>
        <div class="text-body-2 grey--text text--darken-1">
          Invite people, decide what they can do, and keep access tidy.
        </div>
      </div>
    </div>

    <v-card v-if="!me" outlined rounded="xl" class="pa-6">
      <v-progress-linear v-if="!meError" indeterminate color="primary" />
      <v-alert v-else type="error" outlined rounded="lg" class="mb-0">
        {{ meError }}
        <v-btn small text color="error" class="ml-2" @click="loadMe">Retry</v-btn>
      </v-alert>
    </v-card>

    <template v-else>
      <v-tabs
        :value="tab"
        color="primary"
        class="team-tabs mb-6"
        @change="setTab"
      >
        <v-tab v-if="canManageUsers" tab-value="members" class="text-none">
          <v-icon small class="mr-2">mdi-account-multiple-outline</v-icon> Members
        </v-tab>
        <v-tab v-if="canManageRoles" tab-value="roles" class="text-none">
          <v-icon small class="mr-2">mdi-shield-account-outline</v-icon> Roles
        </v-tab>
      </v-tabs>

      <MembersTab
        v-if="tab === 'members'"
        :me="me"
        :can-manage-roles="canManageRoles"
        @open-roles="setTab('roles')"
      />
      <RolesTab v-else-if="tab === 'roles'" :me="me" />
      <v-alert v-else type="warning" outlined rounded="xl">
        You need the <code>user:manage</code> or <code>role:manage</code>
        permission to manage your team.
      </v-alert>
    </template>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import MembersTab from "@/components/team/MembersTab.vue";
import RolesTab from "@/components/team/RolesTab.vue";
import { apiError, FULL_ACCESS } from "@/utils/team";

export default {
  name: "TeamManagement",

  components: { MembersTab, RolesTab },

  data() {
    return { me: null, meError: "" };
  },

  computed: {
    canManageUsers() {
      return this.hasPermission("user:manage");
    },

    canManageRoles() {
      return this.hasPermission("role:manage");
    },

    // The requested tab if allowed, otherwise the first tab this user can see.
    tab() {
      const allowed = [
        this.canManageUsers && "members",
        this.canManageRoles && "roles",
      ].filter(Boolean);
      return allowed.includes(this.$route.query.tab) ? this.$route.query.tab : allowed[0];
    },
  },

  mounted() {
    this.loadMe();
  },

  methods: {
    hasPermission(perm) {
      const perms = this.me?.permissions || [];
      return perms.includes(FULL_ACCESS) || perms.includes(perm);
    },

    async loadMe() {
      this.meError = "";
      try {
        const { data } = await apiClient.get("/clients/currentUser");
        const user = data.data.user || {};
        this.me = {
          _id: user._id,
          permissions: data.data.role?.permissions || user.roleId?.permissions || [],
        };
      } catch (err) {
        this.meError = apiError(err, "Failed to load your account");
      }
    },

    setTab(tab) {
      if (tab === this.tab) return;
      this.$router.replace({ query: { tab } }).catch(() => {});
    },
  },
};
</script>

<style scoped>
.team-tabs {
  border-bottom: 1px solid #e0e0e0;
}
</style>
