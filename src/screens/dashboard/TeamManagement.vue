<template>
  <div>
    <!-- HEADER -->
    <div class="mb-4">
      <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Team</h1>
      <div class="text-body-2 grey--text text--darken-1">
        Invite people, decide what they can do, and keep access tidy.
      </div>
    </div>

    <ThingsToKnow feature="team" />

    <template v-if="!me">
      <v-alert v-if="meError" type="error" text rounded="lg" class="text-body-2">
        <div class="d-flex align-center flex-wrap">
          <span class="mr-4">{{ meError }}</span>
          <v-spacer />
          <v-btn small outlined color="error" @click="loadMe">
            <v-icon left size="14">$refresh-cw</v-icon>
            Retry
          </v-btn>
        </div>
      </v-alert>
      <v-card v-else outlined rounded="lg" class="pa-4">
        <v-skeleton-loader type="list-item-avatar-two-line, list-item-avatar-two-line, list-item-avatar-two-line" />
      </v-card>
    </template>

    <template v-else>
      <v-tabs
        class="mb-4"
        :value="tab"
        color="primary"
        background-color="transparent"
        height="44"
        slider-size="3"
        @change="setTab"
      >
        <v-tab v-if="canManageUsers" tab-value="members" class="text-body-2 font-weight-bold">
          <v-icon size="16" class="mr-2">$users</v-icon>
          Members
        </v-tab>
        <v-tab v-if="canManageRoles" tab-value="roles" class="text-body-2 font-weight-bold">
          <v-icon size="16" class="mr-2">$shield-user</v-icon>
          Roles
        </v-tab>
      </v-tabs>

      <MembersTab
        v-if="tab === 'members'"
        :me="me"
        :can-manage-roles="canManageRoles"
        @open-roles="setTab('roles')"
      />
      <RolesTab v-else-if="tab === 'roles'" :me="me" />
      <v-alert v-else type="warning" text rounded="lg" class="text-body-2">
        You need the <code>user:manage</code> or <code>role:manage</code> permission to manage your
        team.
      </v-alert>
    </template>
  </div>
</template>

<script>
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import apiClient from "@/service/axios";
import MembersTab from "@/components/team/MembersTab.vue";
import RolesTab from "@/components/team/RolesTab.vue";
import { apiError, FULL_ACCESS } from "@/utils/team";

export default {
  name: "TeamManagement",

  components: { ThingsToKnow, MembersTab, RolesTab },

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
