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
      <v-list-item class="px-2 pt-1">
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

      <v-avatar size="36" color="grey lighten-3" class="ml-2">
        <v-icon color="black">mdi-account-outline</v-icon>
      </v-avatar>
    </v-app-bar>

    <!-- ✅ MAIN CONTENT -->

    <v-container fluid class="pa-4">
      <v-card rounded="xl" elevation="0" class="pa-6" style="min-height: 80vh">
        <router-view />
      </v-card>
    </v-container>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: false,
    mini: true,
    isDesktop: false,
    sideNavs: [
      {
        section: "Main",
        items: [
          {
            name: "Home",
            link: "/dashboard/chat",
            icon: "mdi-view-dashboard-outline",
          },
          {
            name: "Chat Insights",
            link: "/dashboard/chat/insights",
            icon: "mdi-chart-line",
          },
          {
            name: "Chatbot Knowledge Score",
            link: "/dashboard/chat/chatbot-knowledge-score",
            icon: "mdi-robot-outline",
          },

          {
            name: "Whatsapp Bot",
            link: "/dashboard/chat/whatsapp-bot",
            icon: "mdi-whatsapp",
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
  },
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
