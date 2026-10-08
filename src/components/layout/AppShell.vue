<template>
  <v-app class="app-shell">
    <!-- SIDEBAR -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :permanent="isDesktop"
      :temporary="!isDesktop"
      width="256"
      color="white"
      class="app-nav"
    >
      <router-link to="/dashboard" class="app-nav__brand">
        <v-avatar size="36" color="primary" tile class="rounded-lg mr-3">
          <v-img src="@/assets/13.png" alt="" />
        </v-avatar>
        <div class="min-w-0">
          <div
            class="text-subtitle-1 font-weight-black secondary--text lh-tight"
          >
            scraperAI
          </div>
          <div
            v-if="companyName"
            class="text-caption grey--text text--darken-1 text-truncate lh-tight"
          >
            {{ companyName }}
          </div>
        </div>
      </router-link>

      <nav aria-label="Main">
        <div v-for="group in groups" :key="group.id" class="app-nav__group">
          <div v-if="group.title" class="app-nav__heading">
            {{ group.title }}
          </div>
          <nav-link
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            :active="activeId === item.id"
            :count="badgeFor(item)"
            @navigate="go"
          />
        </div>

        <div v-if="perms === null" class="px-4 pt-2" aria-hidden="true">
          <v-skeleton-loader v-for="n in 5" :key="n" type="text" class="mb-4" />
        </div>
      </nav>

      <template #append>
        <div class="app-nav__footer">
          <nav-link
            v-for="item in footer"
            :key="item.id"
            :item="item"
            :active="activeId === item.id"
            @navigate="go"
          />
        </div>
      </template>
    </v-navigation-drawer>

    <!-- TOP BAR -->
    <v-app-bar app flat color="white" height="64" class="app-bar">
      <v-app-bar-nav-icon
        v-if="!isDesktop"
        aria-label="Open menu"
        @click="drawer = !drawer"
      />

      <div class="min-w-0 ml-1">
        <div
          class="text-subtitle-1 font-weight-bold grey--text text--darken-4 text-truncate"
        >
          {{ section ? section.name : "Dashboard" }}
        </div>
        <div
          v-if="section && section.description && $vuetify.breakpoint.smAndUp"
          class="text-caption grey--text text--darken-1 text-truncate lh-tight"
        >
          {{ section.description }}
        </div>
      </div>

      <v-spacer />

      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            icon
            v-bind="attrs"
            to="/dashboard/documentation"
            aria-label="Open the guide"
            v-on="on"
          >
            <v-icon size="20">$circle-help</v-icon>
          </v-btn>
        </template>
        <span>Guide</span>
      </v-tooltip>

      <v-menu
        v-model="menu"
        offset-y
        left
        nudge-bottom="8"
        content-class="app-menu"
      >
        <template #activator="{ on, attrs }">
          <v-btn
            icon
            class="ml-1"
            aria-label="Account menu"
            v-bind="attrs"
            v-on="on"
          >
            <v-avatar size="34" color="primary lighten-5">
              <span
                v-if="initials"
                class="primary--text text-caption font-weight-bold"
                >{{ initials }}</span
              >
              <v-icon v-else size="18" color="primary">$user</v-icon>
            </v-avatar>
          </v-btn>
        </template>

        <v-card width="260" flat>
          <div v-if="user" class="px-4 pt-4 pb-3">
            <div class="text-body-2 font-weight-bold text-truncate">
              {{ user.name || "Your account" }}
            </div>
            <div class="text-caption grey--text text--darken-1 text-truncate">
              {{ user.email }}
            </div>
          </div>
          <v-divider v-if="user" />
          <v-list dense nav class="py-2">
            <v-list-item to="/dashboard/profile" exact>
              <v-icon size="18" class="mr-3 flex-grow-0">$circle-user</v-icon>
              <v-list-item-title>Account</v-list-item-title>
            </v-list-item>
            <v-list-item to="/dashboard/documentation">
              <v-icon size="18" class="mr-3 flex-grow-0">$book-open</v-icon>
              <v-list-item-title>Guide</v-list-item-title>
            </v-list-item>
          </v-list>
          <v-divider />
          <v-list dense nav class="py-2">
            <v-list-item @click="logoutDialog = true">
              <v-icon size="18" color="error" class="mr-3 flex-grow-0"
                >$log-out</v-icon
              >
              <v-list-item-title class="error--text">Log out</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- MAIN -->
    <div class="app-content">
      <div v-if="tabs.length > 1" class="app-tabs">
        <v-tabs
          :value="activeTab"
          show-arrows
          background-color="transparent"
          slider-size="3"
          height="44"
        >
          <v-tab
            v-for="tab in tabs"
            :key="tab.name"
            class="text-body-2 font-weight-bold"
            @click="go(tab.to)"
          >
            {{ tab.name }}
          </v-tab>
        </v-tabs>
      </div>

      <v-card flat rounded="lg" class="app-card pa-4 pa-sm-6 pa-md-8">
        <slot />
      </v-card>
    </div>

    <!-- LOGOUT -->
    <v-dialog v-model="logoutDialog" max-width="380">
      <v-card rounded="lg" class="text-center pa-2">
        <v-card-text class="pt-6">
          <v-avatar color="error lighten-5" size="56" class="mb-4">
            <v-icon color="error" size="28">$log-out</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-1">
            Log out?
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            You'll need to sign in again to use the dashboard.
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-5">
          <v-btn text rounded class="mr-2" @click="logoutDialog = false"
            >Cancel</v-btn
          >
          <v-btn rounded depressed color="error" @click="confirmLogout"
            >Log out</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import NavLink from "@/components/layout/NavLink.vue";
import apiClient, { setAuthToken } from "@/service/axios";
import { initialsOf } from "@/utils/team";
import {
  NAV_FOOTER,
  activeItem,
  loadAttentionCounts,
  visibleGroups,
  visibleItem,
} from "@/utils/navigation";

export default {
  name: "AppShell",

  components: { NavLink },

  data: () => ({
    drawer: false,
    menu: false,
    logoutDialog: false,
    // Null until loaded; restricted items stay hidden until then
    perms: null,
    user: null,
    companyName: "",
    badges: {},
  }),

  computed: {
    isDesktop() {
      return this.$vuetify.breakpoint.lgAndUp;
    },

    groups() {
      return visibleGroups(this.perms);
    },

    footer() {
      return NAV_FOOTER.map((i) => visibleItem(i, this.perms)).filter(Boolean);
    },

    section() {
      return activeItem(this.$route, this.perms);
    },

    activeId() {
      return this.section?.id || null;
    },

    tabs() {
      return this.section?.tabs || [];
    },

    activeTab() {
      const i = this.tabs.findIndex((t) => t.match(this.$route));
      return i === -1 ? null : i;
    },

    initials() {
      return this.user ? initialsOf(this.user.name, this.user.email) : "";
    },
  },

  watch: {
    isDesktop: {
      immediate: true,
      handler(val) {
        this.drawer = val;
      },
    },

    $route() {
      if (!this.isDesktop) this.drawer = false;
      this.loadBadges();
    },
  },

  created() {
    this.loadUser();
  },

  methods: {
    async loadUser() {
      try {
        const { data } = await apiClient.get("/clients/currentUser");
        const account = data.data || {};
        this.user = account.user || null;
        this.companyName = account.company_name || "";
        this.perms = account.user?.roleId?.permissions || [];
      } catch {
        this.perms = [];
      }
      this.loadBadges();
    },

    async loadBadges() {
      if (!this.perms) return;
      const counts = await loadAttentionCounts(this.perms);
      this.badges = counts || {};
    },

    badgeFor(item) {
      return (item.badge && this.badges[item.badge]) || 0;
    },

    go(to) {
      this.$router.push(to).catch(() => {});
      if (!this.isDesktop) this.drawer = false;
    },

    confirmLogout() {
      this.logoutDialog = false;
      localStorage.removeItem("user-token");
      setAuthToken(null);
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.app-shell {
  background-color: #eff2fb !important;
}

.min-w-0 {
  min-width: 0;
}

.lh-tight {
  line-height: 1.25;
}

/* Sidebar */
.app-nav {
  border-right: 1px solid #e6e8f0 !important;
}

.app-nav__brand {
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 16px;
  text-decoration: none;
  border-bottom: 1px solid #f0f1f6;
  margin-bottom: 8px;
}

.app-nav__group {
  padding: 4px 10px;
}

.app-nav__heading {
  padding: 12px 10px 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #8a8fa3;
}

.app-nav__footer {
  padding: 8px 10px 12px;
  border-top: 1px solid #f0f1f6;
}

/* Top bar */
.app-bar {
  border-bottom: 1px solid #e6e8f0 !important;
}

/* Content */
.app-content {
  padding: 16px;
}

.app-tabs {
  margin-bottom: 12px;
  border-bottom: 1px solid #e1e4ee;
}

.app-tabs ::v-deep .v-tab {
  min-width: 0;
  padding: 0 14px;
}

.app-card {
  min-height: calc(100vh - 64px - 32px);
}

@media (min-width: 960px) {
  .app-content {
    padding: 24px;
  }
}
</style>

<style>
/* Kept from the old DashboardLayout: screens rely on it for active list rows */
.v-list-item--active::before {
  opacity: 0 !important;
}

.app-menu {
  border-radius: 12px !important;
  border: 1px solid #e6e8f0;
  box-shadow: 0 12px 32px rgba(17, 24, 39, 0.08) !important;
}
</style>
