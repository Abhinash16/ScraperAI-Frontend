<template>
  <v-app id="inspire" style="background-color: #eff2fb">
    <!-- TOP BAR -->
    <v-app-bar app flat color="white" light elevate-on-scroll>
      <v-container class="py-0 fill-height" fluid>
        <v-avatar size="40" color="primary" tile class="mr-2 rounded-lg">
          <v-img src="../assets/13.png"></v-img>
        </v-avatar>

        <h3 class="font-weight-black secondary--text">scraperAI</h3>

        <v-spacer></v-spacer>

        <div class="hidden-sm-and-down">
          <v-btn
            v-for="(link, index) in links"
            :key="index"
            text
            rounded
            :to="link.path"
            class="text-capitalize font-weight-bold grey--text text--darken-2 px-6"
          >
            {{ link.name }}
          </v-btn>
        </div>

        <v-btn
          to="/dashboard/try-chat"
          color="primary"
          depressed
          rounded
          class="text-capitalize font-weight-bold ml-4"
        >
          <v-icon small class="mr-1">mdi-sparkles</v-icon>
          Try Chat
        </v-btn>

        <v-avatar
          @click="$router.push('/dashboard/profile')"
          size="36"
          class="ml-4 grey lighten-3"
        >
          <v-icon color="black">mdi-account</v-icon>
        </v-avatar>

        <v-btn icon class="hidden-md-and-up" @click="mobileDrawer = true">
          <v-icon>mdi-menu</v-icon>
        </v-btn>
      </v-container>
    </v-app-bar>

    <!-- MOBILE DRAWER -->
    <v-navigation-drawer v-model="mobileDrawer" app temporary right>
      <v-list dense nav>
        <div v-for="(group, gIndex) in sideNavs" :key="gIndex">
          <!-- Clickable Section -->
          <v-subheader
            class="d-flex align-center justify-space-between text-uppercase font-weight-black grey--text text--darken-1 mt-4 mb-2"
            style="font-size: 10px; letter-spacing: 1px; cursor: pointer"
            @click="toggleSection(gIndex)"
          >
            {{ group.section }}

            <v-icon small>
              {{ openSections[gIndex] ? "mdi-chevron-up" : "mdi-chevron-down" }}
            </v-icon>
          </v-subheader>

          <!-- Expandable Items -->
          <v-expand-transition>
            <div v-show="openSections[gIndex]">
              <v-list-item-group color="primary">
                <v-list-item
                  v-for="(item, index) in group.items"
                  :key="index"
                  :to="item.link"
                  exact
                  active-class="primary--text font-weight-bold white"
                  class="mb-2 rounded-lg"
                >
                  <v-list-item-icon class="mr-4">
                    <v-icon small>{{ item.icon }}</v-icon>
                  </v-list-item-icon>

                  <v-list-item-content>
                    <v-list-item-title class="body-2">
                      {{ item.name }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </div>
          </v-expand-transition>
        </div>

        <v-divider class="my-4"></v-divider>

        <v-list-item @click="logoutDialog = true">
          <v-list-item-icon>
            <v-icon color="error">mdi-logout</v-icon>
          </v-list-item-icon>
          <v-list-item-title class="error--text"> Logout </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- MAIN -->
    <v-container fluid>
      <!-- ================= UNAUTHORIZED MESSAGE ================= -->
      <v-row>
        <!-- SIDEBAR -->
        <v-col cols="12" md="3" lg="2" class="hidden-sm-and-down">
          <v-sheet color="transparent" class="sticky-sidebar">
            <v-list flat rounded color="transparent">
              <div v-for="(group, gIndex) in sideNavs" :key="gIndex">
                <!-- Clickable Section -->
                <v-subheader
                  class="d-flex align-center justify-space-between text-uppercase font-weight-black grey--text text--darken-1 mt-4 mb-2"
                  style="font-size: 10px; letter-spacing: 1px; cursor: pointer"
                  @click="toggleSection(gIndex)"
                >
                  {{ group.section }}

                  <v-icon small>
                    {{
                      openSections[gIndex]
                        ? "mdi-chevron-up"
                        : "mdi-chevron-down"
                    }}
                  </v-icon>
                </v-subheader>

                <!-- Expandable Items -->
                <v-expand-transition>
                  <div v-show="openSections[gIndex]">
                    <v-list-item-group color="primary">
                      <v-list-item
                        v-for="(item, index) in group.items"
                        :key="index"
                        :to="item.link"
                        exact
                        active-class="primary--text font-weight-bold white"
                        class="mb-2 rounded-lg"
                      >
                        <v-list-item-icon class="mr-4">
                          <v-icon small>{{ item.icon }}</v-icon>
                        </v-list-item-icon>

                        <v-list-item-content>
                          <v-list-item-title class="body-2">
                            {{ item.name }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </div>
                </v-expand-transition>
              </div>

              <v-divider class="my-6 mx-4"></v-divider>

              <v-list-item @click="logoutDialog = true">
                <v-list-item-icon class="mr-4">
                  <v-icon small>mdi-logout</v-icon>
                </v-list-item-icon>
                <v-list-item-title class="body-2"> Logout </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-sheet>
        </v-col>

        <!-- CONTENT -->
        <v-col cols="12" md="9" lg="10">
          <v-card min-height="85vh" flat class="rounded-xl pa-8">
            <div class="d-flex align-center mb-8">
              <h2 class="text-h5 font-weight-black secondary--text">
                {{ currentRouteName }}
              </h2>
            </div>

            <router-view></router-view>
          </v-card>
        </v-col>
      </v-row>
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
    mobileDrawer: false,
    logoutDialog: false,
    openSections: { 0: true },

    links: [
      { name: "Overview", path: "/" },
      { name: "Documentation", path: "/docs" },
      { name: "API Reference", path: "/api" },
    ],

    sideNavs: [
      {
        section: "Main Menu",
        items: [
          {
            name: "Dashboard",
            link: "/dashboard/",
            icon: "mdi-view-dashboard-outline",
          },
          {
            name: "Your Profile",
            link: "/dashboard/profile",
            icon: "mdi-account-outline",
          },
        ],
      },
      {
        section: "Analysis",
        items: [
          {
            name: "Call Analysis",
            link: "/dashboard/call-batches",
            icon: "mdi-phone-outline",
          },
          {
            name: "Knowledge Gap",
            link: "/dashboard/knowledge-gap/",
            icon: "mdi-lightbulb-on-outline",
          },
          {
            name: "Opportunity Analysis",
            link: "/dashboard/opportunity-analysis",
            icon: "mdi-chart-line",
          },
        ],
      },
      {
        section: "Services",
        items: [
          {
            name: "Chats",
            link: "/dashboard/chat",
            icon: "mdi-message-text-outline",
          },
          {
            name: "DB Query Generator",
            link: "/dashboard/database-ai/projects",
            icon: "mdi-database-search-outline",
          },
          {
            name: "WhatsApp Bot",
            link: "/dashboard/whatsapp-bot",
            icon: "mdi-whatsapp",
          },
        ],
      },
      {
        section: "Data",
        items: [
          {
            name: "Page List",
            link: "/dashboard/page-list",
            icon: "mdi-format-list-bulleted",
          },
          {
            name: "Scraped Pages",
            link: "/dashboard/scraped-pages",
            icon: "mdi-file-document-outline",
          },
          {
            name: "Content Chunks",
            link: "/dashboard/content-chunks",
            icon: "mdi-text-box-multiple-outline",
          },
        ],
      },
      {
        section: "Settings",
        items: [
          {
            name: "Integration",
            link: "/dashboard/integration",
            icon: "mdi-puzzle-outline",
          },
          {
            name: "Security",
            link: "/dashboard/security",
            icon: "mdi-shield-lock-outline",
          },
        ],
      },
      {
        section: "Other",
        items: [
          {
            name: "Blogs",
            link: "/dashboard/blogs",
            icon: "mdi-newspaper-variant-outline",
          },
        ],
      },
    ],
  }),

  computed: {
    currentRouteName() {
      for (const group of this.sideNavs) {
        const found = group.items.find((n) => n.link === this.$route.path);
        if (found) return found.name;
      }
      return "";
    },
  },

  methods: {
    confirmLogout() {
      this.logoutDialog = false;
      localStorage.removeItem("user-token");
      setAuthToken(null);
      this.$router.push("/login");
    },

    toggleSection(index) {
      this.$set(this.openSections, index, !this.openSections[index]);
    },
  },
};
</script>

<style>
.sticky-sidebar {
  position: sticky;
  top: 88px;
}
.v-list-item--active::before {
  opacity: 0 !important;
}
</style>
