<template>
  <v-app id="inspire">
    <v-app-bar app flat>
      <v-container class="py-0 fill-height">
        <v-avatar class="mr-10" color="grey darken-1" size="32">
          <v-img src="../assets/images/scraper-logo.webp"></v-img>
        </v-avatar>

        <v-spacer></v-spacer>
        <v-btn rounded v-for="(link, index) in links" :key="index" text>
          {{ link }}
        </v-btn>

        <v-btn to="/dashboard/try-chat" color="primary" text rounded depressed>
          <v-icon small class="mr-1">mdi-message-outline</v-icon> Try Chat
        </v-btn>
      </v-container>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row>
          <v-col cols="2" class="hidden-md-and-down">
            <v-sheet rounded="lg">
              <v-list rounded color="transparent">
                <v-list-item
                  exact
                  :to="n.link"
                  v-for="(n, index) in sideNavs"
                  :key="index"
                  link
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ n.name }} </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-col>

          <v-col>
            <v-sheet min-height="70vh" rounded="lg">
              <router-view></router-view>
            </v-sheet>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    links: ["Dashboard", "Integration"],
    sideNavs: [
      {
        name: "Dashboard",
        link: "/dashboard/",
      },
      {
        name: "Your Profile",
        link: "/dashboard/profile",
      },
      {
        name: "Chats",
        link: "/dashboard/chat",
      },
      {
        name: "Page List",
        link: "/dashboard/page-list",
      },
      {
        name: "Scraped Pages",
        link: "/dashboard/scraped-pages",
      },
      {
        name: "Integration",
        link: "/dashboard/integration",
      },
    ],
  }),
};
</script>
