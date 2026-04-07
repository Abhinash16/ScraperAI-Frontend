<template>
  <v-app id="inspire" style="background-color: #eff2fb">
    <!-- TOP BAR -->
    <v-app-bar app flat color="white" light elevate-on-scroll>
      <v-container class="py-0 fill-height" fluid>
        <v-avatar
          @click="$router.push('/dashboard')"
          size="40"
          color="primary"
          tile
          class="mr-2 rounded-lg"
        >
          <v-img src="../assets/13.png"></v-img>
        </v-avatar>

        <h3
          @click="$router.push('/dashboard')"
          class="font-weight-black secondary--text"
        >
          scraperAI
        </h3>

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
        <v-avatar
          @click="$router.push('/dashboard/profile')"
          size="36"
          class="ml-4 grey lighten-3"
        >
          <v-icon color="black">mdi-account</v-icon>
        </v-avatar>
      </v-container>
    </v-app-bar>

    <!-- MAIN -->
    <v-container fluid>
      <!-- ================= UNAUTHORIZED MESSAGE ================= -->
      <v-card min-height="85vh" flat class="rounded-xl pa-8">
        <router-view></router-view>
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
    mobileDrawer: false,
    logoutDialog: false,
    openSections: { 0: true },

    links: [
      { name: "Dashboard", path: "/dashboard" },
      // { name: "Documentation", path: "/dashboard/documentation" },
      // { name: "API Reference", path: "/api" },
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
          {
            name: "Chat Analytics",
            link: "/dashboard/chat-analytics",
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
        section: "Business Insights",
        items: [
          {
            name: "SEO Growth Report",
            link: "/dashboard/seo-growth-report",
            icon: "mdi-chart-line",
          },
          {
            name: "Chatbot Knowledge Score",
            link: "/dashboard/chatbot-knowledge-score",
            icon: "mdi-robot-outline",
          },
          {
            name: "Keyword Research",
            link: "/dashboard/keyword-research",
            icon: "mdi-magnify",
          },
          {
            name: "Competitor Intelligence",
            link: "/dashboard/competitor-intelligence",
            icon: "mdi-account-search",
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
          {
            name: "Integration",
            link: "/dashboard/integration",
            icon: "mdi-puzzle-outline",
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
          {
            name: "Forms",
            link: "/dashboard/forms",
            icon: "mdi-list-box-outline",
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
