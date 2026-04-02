<template>
  <v-app id="scraper-ai-app">
    <v-navigation-drawer
      v-model="drawer"
      app
      clipped
      border="right"
      width="260"
      class="elevation-0"
    >
      <v-list nav dense class="mt-4">
        <!-- <v-subheader
          class="text-uppercase font-weight-bold tracking-wider text-caption"
        >
          Menu
        </v-subheader> -->

        <v-list-item-group color="primary">
          <v-list-item
            v-for="item in menuItems"
            :key="item.title"
            :to="item.path"
            exact
            active-class="primary--text v-list-item--active"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title class="font-weight-medium">
                {{ item.title }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      clipped-left
      flat
      color="white"
      class="border-bottom"
      height="70"
    >
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

        <!-- <v-btn
          to="/dashboard/try-chat"
          color="primary"
          depressed
          rounded
          class="text-capitalize font-weight-bold ml-4"
        >
          <v-icon small class="mr-1">mdi-sparkles</v-icon>
          Try Chat
        </v-btn> -->

        <v-avatar
          @click="$router.push('/dashboard/profile')"
          size="36"
          class="ml-4 grey lighten-3"
        >
          <v-icon color="black">mdi-account</v-icon>
        </v-avatar>

        <v-app-bar-nav-icon
          @click="drawer = !drawer"
          class="hidden-lg-and-up"
        />
      </v-container>
    </v-app-bar>

    <div>
      <router-view />
    </div>
  </v-app>
</template>

<script>
export default {
  name: "FormsDashboardLayout",
  data() {
    return {
      drawer: true,
      menuItems: [
        {
          title: "Home",
          icon: "mdi-view-dashboard-outline",
          path: "/dashboard/forms",
        },
      ],
      links: [{ name: "Form Settings", path: "/dashboard/forms-settings" }],
    };
  },
  methods: {
    handleLogout() {
      // Implement your logout logic here
      console.log("User logged out");
    },
  },
};
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}
.cursor-pointer {
  cursor: pointer;
}
.hover-opacity:hover {
  opacity: 0.8;
}
.tracking-tighter {
  letter-spacing: -0.5px !important;
}
.tracking-wider {
  letter-spacing: 1px !important;
}
</style>
