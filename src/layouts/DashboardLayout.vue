<template>
  <v-app id="inspire" style="background-color: #eff2fb">
    <v-app-bar app flat color="white" light elevate-on-scroll>
      <v-container class="py-0 fill-height" fluid>
        <v-avatar size="40" color="primary" tile class="mr-2 mb-0 rounded-lg">
          <v-img src="../assets/13.png" max-height="40" max-width="40"></v-img>
        </v-avatar>
        <h3 class="font-weight-black secondary--text">scraperAI</h3>

        <v-spacer></v-spacer>

        <div class="hidden-sm-and-down">
          <v-btn
            v-for="(link, index) in links"
            :key="index"
            text
            class="text-capitalize font-weight-bold grey--text text--darken-2 px-6"
          >
            {{ link }}
          </v-btn>
        </div>

        <v-btn
          to="/dashboard/try-chat"
          color="primary"
          depressed
          rounded
          class="text-capitalize font-weight-bold ml-4"
        >
          <v-icon small class="mr-1">mdi-sparkles</v-icon> Try Chat
        </v-btn>

        <v-avatar size="36" class="ml-4 grey lighten-3">
          <v-icon color="primary">mdi-account</v-icon>
        </v-avatar>
      </v-container>
    </v-app-bar>

    <v-container fluid>
      <v-row>
        <v-col cols="12" md="3" lg="2" class="hidden-sm-and-down">
          <v-sheet color="transparent" class="sticky-sidebar">
            <v-list flat rounded color="transparent" class="pa-0">
              <v-subheader
                class="text-uppercase font-weight-black grey--text text--darken-1 mb-2"
                style="font-size: 10px; letter-spacing: 1px"
              >
                Main Menu
              </v-subheader>

              <v-list-item-group color="primary">
                <v-list-item
                  v-for="(n, index) in sideNavs"
                  :key="index"
                  :to="n.link"
                  exact
                  active-class="primary--text font-weight-bold white "
                  class="mb-2"
                >
                  <v-list-item-icon class="mr-4">
                    <v-icon small>{{ n.icon }}</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title class="body-2">{{
                      n.name
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>

              <v-divider class="my-6 mx-4"></v-divider>

              <v-list-item link class="rounded-lg grey--text">
                <v-list-item-icon class="mr-4"
                  ><v-icon small>mdi-logout</v-icon></v-list-item-icon
                >
                <v-list-item-content
                  ><v-list-item-title class="body-2"
                    >Logout</v-list-item-title
                  ></v-list-item-content
                >
              </v-list-item>
            </v-list>
          </v-sheet>
        </v-col>

        <v-col cols="12" md="9" lg="10">
          <v-card
            min-height="85vh"
            flat
            class="rounded-xl pa-8"
            style="border: 1px solid rgba(0, 0, 0, 0.05) !important"
          >
            <div class="d-flex align-center mb-8">
              <div>
                <h2 class="text-h5 font-weight-black secondary--text">
                  {{ currentRouteName }}
                </h2>
              </div>
            </div>

            <router-view></router-view>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-bottom-navigation
      app
      grow
      color="primary"
      class="hidden-md-and-up"
      v-model="activeNav"
    >
      <v-btn
        v-for="(n, index) in sideNavs.slice(0, 4)"
        :key="index"
        :to="n.link"
      >
        <span>{{ n.name }}</span>
        <v-icon>{{ n.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    activeNav: 0,
    links: ["Overview", "Documentation", "API Reference"],
    sideNavs: [
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
      {
        name: "Chats",
        link: "/dashboard/chat",
        icon: "mdi-message-text-outline",
      },
      {
        name: "Page List",
        link: "/dashboard/page-list",
        icon: "mdi-format-list-bulleted",
      },
      {
        name: "Scraped Pages",
        link: "/dashboard/scraped-pages",
        icon: "mdi-database-search-outline",
      },
      {
        name: "Integration",
        link: "/dashboard/integration",
        icon: "mdi-puzzle-outline",
      },
    ],
  }),
  computed: {
    currentRouteName() {
      // Logic to find current page name based on route
      const current = this.sideNavs.find((n) => n.link === this.$route.path);
      return current ? current.name : "";
    },
  },
};
</script>

<style>
/* Modern Sticky Sidebar hack without custom CSS classes if possible, 
   but this helps maintain the "Dashboard" feel */
.sticky-sidebar {
  position: sticky;
  top: 88px;
}
/* Removing standard Vuetify list item active background for a cleaner "Pill" look */
.v-list-item--active::before {
  opacity: 0 !important;
}
</style>
