<template>
  <v-app class="app-shell">
    <!-- SIDEBAR -->
    <v-navigation-drawer
      v-model="drawer"
      app
      :permanent="isDesktop"
      :temporary="!isDesktop"
      :mini-variant="mini"
      :clipped="isDesktop"
      mini-variant-width="76"
      width="256"
      color="white"
      class="app-nav"
    >


      <nav aria-label="Main" class="pt-3">
        <div v-for="(group, gi) in groups" :key="group.id" class="app-nav__group">
          <template v-if="group.title">
            <v-divider v-if="mini && gi > 0" class="mx-3 my-2" />
            <div v-else-if="!mini" class="app-nav__heading">{{ group.title }}</div>
          </template>
          <nav-link
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            :active="activeId === item.id"
            :count="badgeFor(item)"
            :mini="mini"
            @navigate="go"
          />
        </div>

        <div v-if="perms === null" class="px-4 pt-2" aria-hidden="true">
          <v-skeleton-loader
            v-for="n in 5"
            :key="n"
            :type="mini ? 'avatar' : 'text'"
            class="mb-4"
          />
        </div>
      </nav>

      <template #append>
        <div class="app-nav__footer">
          <nav-link
            v-for="item in footer"
            :key="item.id"
            :item="item"
            :active="activeId === item.id"
            :mini="mini"
            @navigate="go"
          />
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Collapse / expand (desktop) -->
    <v-tooltip v-if="isDesktop" right open-delay="300">
      <template #activator="{ on, attrs }">
        <v-btn
          fab
          x-small
          depressed
          color="white"
          :class="['app-nav__toggle', mini ? 'app-nav__toggle--mini' : '']"
          :aria-label="mini ? 'Expand sidebar' : 'Collapse sidebar'"
          :aria-expanded="String(!mini)"
          v-bind="attrs"
          v-on="on"
          @click="toggleMini"
        >
          <v-icon size="16" color="primary">{{ mini ? "$chevron-right" : "$chevron-left" }}</v-icon>
        </v-btn>
      </template>
      <span>{{ mini ? "Expand sidebar" : "Collapse sidebar" }}</span>
    </v-tooltip>

    <!-- TOP BAR -->
    <v-app-bar app clipped-left flat color="white" height="64" class="app-bar">
      <v-app-bar-nav-icon v-if="!isDesktop" aria-label="Open menu" class="mr-1" @click="drawer = !drawer" />

      <router-link to="/dashboard" class="d-flex align-center text-decoration-none mr-4" aria-label="scraperAI home">
        <v-avatar size="34" color="primary" tile class="rounded-lg mr-3 flex-shrink-0">
          <v-img src="@/assets/13.png" alt="" />
        </v-avatar>
        <div class="hidden-xs-only min-w-0">
          <div class="text-subtitle-1 font-weight-black secondary--text lh-tight">scraperAI</div>
          <div v-if="companyName" class="text-caption grey--text text--darken-1 text-truncate lh-tight">
            {{ companyName }}
          </div>
        </div>
      </router-link>

      <div v-if="$vuetify.breakpoint.mdAndUp" class="flex-grow-1 ml-4 app-bar__search">
        <GlobalSearch :items="searchItems" @navigate="go" />
      </div>
      <v-spacer />

      <GlobalSearch v-if="!$vuetify.breakpoint.mdAndUp" compact :items="searchItems" @navigate="go" />

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
      <v-sheet color="grey lighten-4" rounded="lg" class="d-flex align-center px-4 py-2 mb-3">
        <v-breadcrumbs :items="crumbs" class="pa-0 text-body-2">
          <template #divider>
            <span class="grey--text">/</span>
          </template>
        </v-breadcrumbs>
      </v-sheet>
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
import GlobalSearch from "@/components/layout/GlobalSearch.vue";
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

const COLLAPSED_KEY = "sidebar-collapsed";

// Per-viewer convenience; storage may be blocked or empty
function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export default {
  name: "AppShell",

  components: { GlobalSearch, NavLink },

  data: () => ({
    drawer: false,
    // Desktop only: icons-only sidebar, remembered per browser
    collapsed: readCollapsed(),
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

    // Phones and tablets always get the full slide-in menu
    mini() {
      return this.isDesktop && this.collapsed;
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

    // Section / tab trail for the breadcrumb strip
    crumbs() {
      if (!this.section) return [{ text: "Dashboard", disabled: true }];
      const tab = this.tabs[this.activeTab];
      const list = [{ text: this.section.name, to: this.section.to, exact: true, disabled: !tab }];
      if (tab && tab.name !== this.section.name) list.push({ text: tab.name, disabled: true });
      else list[0].disabled = true;
      return list;
    },

    // Every page this user can open, for the global search
    searchItems() {
      const entries = [
        ...this.groups.flatMap((g) => g.items.map((item) => ({ item, group: g.title || "General" }))),
        ...this.footer.map((item) => ({ item, group: "General" })),
      ];
      return entries.flatMap(({ item, group }) =>
        item.tabs.map((tab) => {
          const single = item.tabs.length === 1 || tab.name === item.name;
          return {
            key: `${item.id}:${tab.name}`,
            text: single ? item.name : tab.name,
            caption: single ? item.description || "" : `${item.name} › ${tab.name}`,
            section: item.name,
            group,
            icon: item.icon,
            to: tab.to,
            search: `${item.name} ${tab.name} ${item.description || ""} ${group}`.toLowerCase(),
          };
        }),
      );
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

    toggleMini() {
      this.collapsed = !this.collapsed;
      try {
        localStorage.setItem(COLLAPSED_KEY, this.collapsed ? "1" : "0");
      } catch {
        // storage unavailable: the choice lasts until reload
      }
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

/* Round toggle on the sidebar's right edge (outside the drawer, so it isn't clipped) */
.app-nav__toggle {
  position: fixed !important;
  top: 82px;
  left: 242px;
  z-index: 8;
  border: 1px solid #e6e8f0 !important;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.08) !important;
  transition: left 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-nav__toggle--mini {
  left: 62px;
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

.app-bar__search {
  max-width: 560px;
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
