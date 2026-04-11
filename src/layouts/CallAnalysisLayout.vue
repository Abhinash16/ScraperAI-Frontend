<template>
  <v-app id="inspire" class="grey lighten-4">
    <!-- ✅ SIDEBAR -->
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="isDesktop && mini"
      :expand-on-hover="isDesktop"
      :permanent="isDesktop"
      :temporary="!isDesktop"
      app
      floating
      color="white"
      class="elevation-2"
      width="260"
    >
      <!-- LOGO -->
      <v-list-item class="px-2 pt-1" to="/dashboard" link>
        <v-list-item-avatar color="primary" class="rounded-lg">
          <v-img src="../assets/13.png"></v-img>
        </v-list-item-avatar>
        <v-list-item-title
          class="text-h6 font-weight-black secondary--text ml-2"
        >
          scraperAI
        </v-list-item-title>
      </v-list-item>

      <!-- NAV ITEMS -->
      <v-list nav dense>
        <template v-for="(group, gIndex) in sideNavs">
          <v-subheader
            v-if="!mini || !isDesktop"
            :key="`sub-${gIndex}`"
            class="text-uppercase text-caption font-weight-bold"
          >
            {{ group.section }}
          </v-subheader>

          <v-list-item
            v-for="(item, iIndex) in group.items"
            :key="`${gIndex}-${iIndex}`"
            :to="item.link"
            router
            active-class="primary--text blue lighten-5 my-1"
            class="rounded-lg mb-2"
            @click="handleItemClick"
            exact
          >
            <v-list-item-icon>
              <v-icon size="22">{{ item.icon }}</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title class="font-weight-bold">
                {{ item.name }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- ✅ TOP BAR -->
    <v-app-bar
      app
      flat
      height="64"
      color="rgba(255,255,255,0.85)"
      style="backdrop-filter: blur(10px)"
      class="px-2"
    >
      <!-- Mobile menu -->
      <v-app-bar-nav-icon v-if="!isDesktop" @click="drawer = !drawer" />

      <v-toolbar-title class="grey--text text--darken-4 font-weight-bold">
        {{ currentRouteName }}
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <!-- Right side -->

      <v-menu v-model="menu" offset-y left>
        <template v-slot:activator="{ on, attrs }">
          <v-avatar
            v-bind="attrs"
            v-on="on"
            size="36"
            color="primary"
            class="ml-4 grey lighten-3"
          >
            <v-icon color="black">mdi-account</v-icon>
          </v-avatar>
        </template>

        <v-card width="240">
          <!-- Menu Options -->
          <v-list dense>
            <!-- Profile -->
            <v-list-item @click="goToProfile()">
              <v-list-item-icon>
                <v-icon>mdi-account-circle</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="font-weight-bold">
                Profile
              </v-list-item-title>
            </v-list-item>

            <!-- Integration -->
            <v-list-item @click="goToIntegration()">
              <v-list-item-icon>
                <v-icon>mdi-puzzle-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="font-weight-bold">
                Integration
              </v-list-item-title>
            </v-list-item>

            <!-- Security -->
            <v-list-item @click="goToSecurity()">
              <v-list-item-icon>
                <v-icon>mdi-shield-lock-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-title class="font-weight-bold">
                Security
              </v-list-item-title>
            </v-list-item>
          </v-list>
          <v-divider></v-divider>

          <!-- Logout -->
          <v-card-actions>
            <v-btn
              text
              color="red"
              block
              @click="logoutDialog = true"
              class="font-weight-bold"
            >
              Logout
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>
    </v-app-bar>

    <!-- ✅ MAIN CONTENT -->

    <v-container fluid class="pa-4">
      <v-card rounded="xl" elevation="0" class="pa-6" style="min-height: 80vh">
        <router-view />
      </v-card>
    </v-container>

    <!-- LOGOUT DIALOG -->
    <v-dialog v-model="logoutDialog" max-width="360">
      <v-card rounded="xl" class="text-center">
        <v-card-text class="pt-6">
          <v-avatar color="error lighten-5" size="64" class="mb-4">
            <v-icon color="error" size="36"> mdi-alert-octagon-outline </v-icon>
          </v-avatar>

          <div class="text-h6 font-weight-bold mb-2">Confirm Logout</div>

          <div class="text-body-2 grey--text">
            Are you sure you want to log out?
          </div>
        </v-card-text>

        <div class="justify-center pb-6">
          <v-btn text rounded @click="logoutDialog = false" class="mr-2">
            Cancel
          </v-btn>

          <v-btn rounded depressed color="error" @click="confirmLogout">
            Yes, Logout
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
import { setAuthToken } from "@/service/axios";

export default {
  data: () => ({
    drawer: false,
    mini: true,
    isDesktop: false,
    menu: false,
    logoutDialog: false,
    sideNavs: [
      {
        section: "Main",
        items: [
          {
            name: "Home",
            link: "/dashboard/call-batches",
            icon: "mdi-view-dashboard-outline",
          },
        ],
      },
    ],
  }),

  computed: {
    currentRouteName() {
      const allItems = this.sideNavs.flatMap((g) => g.items);
      const found = allItems.find((n) => n.link === this.$route.path);
      return found ? found.name : "Dashboard";
    },
  },

  created() {
    // ✅ Fix initial state BEFORE render (no flicker)
    this.isDesktop = this.$vuetify.breakpoint.lgAndUp;
    this.drawer = this.isDesktop;
  },

  mounted() {
    // ✅ Handle screen resize properly
    this.$watch(
      () => this.$vuetify.breakpoint.lgAndUp,
      (val) => {
        this.isDesktop = val;
        this.drawer = val; // open desktop, close mobile
      },
    );
  },

  methods: {
    handleItemClick() {
      if (!this.isDesktop) {
        this.drawer = false;
      }
    },

    goToProfile() {
      if (this.$route.path !== "/dashboard/profile") {
        this.$router.push("/dashboard/profile");
      }
    },

    goToIntegration() {
      if (this.$route.path !== "/dashboard/integration") {
        this.$router.push("/dashboard/integration");
      }
    },

    goToSecurity() {
      if (this.$route.path !== "/dashboard/security") {
        this.$router.push("/dashboard/security");
      }
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
.cursor-pointer {
  cursor: pointer;
}
</style>
