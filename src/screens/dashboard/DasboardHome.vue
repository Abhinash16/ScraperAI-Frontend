<template>
  <div>
    <div v-for="(section, title) in dashboardData" :key="title" class="mb-12">
      <div class="d-flex align-center mb-6">
        <h2 class="text-h5 font-weight-bold grey--text text--darken-3">
          {{ title.replace("(BETA)", "") }}
        </h2>
        <v-chip
          v-if="title.includes('BETA')"
          small
          label
          color="green"
          class="ml-3 font-weight-bold"
          outlined
        >
          BETA
        </v-chip>
      </div>

      <v-row>
        <v-col
          v-for="item in section.items"
          :key="item.name"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            outlined
            class="pa-6 rounded-lg transition-swing hover-card"
            @click="navigate(item.link)"
          >
            <div class="d-flex align-center">
              <v-avatar
                :color="section.color + ' lighten-5'"
                size="48"
                class="rounded-lg mr-4"
              >
                <v-icon :color="section.color" size="28">
                  {{ item.icon || "mdi-view-grid-plus-outline" }}
                </v-icon>
              </v-avatar>

              <div style="flex: 1">
                <div
                  class="text-body-1 font-weight-bold grey--text text--darken-4 mb-1"
                >
                  {{ item.name }}
                </div>
                <div
                  class="text-caption grey--text text--darken-1 font-weight-medium"
                >
                  {{ item.description || "Manage and configure settings" }}
                </div>
              </div>

              <v-icon color="grey lighten-1">mdi-chevron-right</v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="mt-10 grey lighten-3"></v-divider>
    </div>
  </div>
</template>

<script>
export default {
  name: "DashboardHome",

  data() {
    return {
      dashboardData: {
        Products: {
          color: "indigo",
          items: [
            {
              name: "Chat",
              link: "/dashboard/chat",
              icon: "mdi-message-text-outline",
              description: "Real-time AI assistance",
            },
            {
              name: "Blogs",
              link: "/dashboard/blogs",
              icon: "mdi-newspaper-variant-outline",
              description: "Content management",
            },
            {
              name: "Forms",
              link: "/dashboard/forms",
              icon: "mdi-list-box-outline",
              description: "Builder and responses",
            },
            {
              name: "DB Query Generator",
              link: "/dashboard/database-ai/projects",
              icon: "mdi-database-search-outline",
              description: "Natural language SQL",
            },
            // {
            //   name: "WhatsApp Bot",
            //   link: "/dashboard/whatsapp-bot",
            //   icon: "mdi-whatsapp",
            //   description: "Automated messaging",
            // },
            {
              name: "Call Analysis",
              link: "/dashboard/call-batches",
              icon: "mdi-phone-outline",
              description: "Speech-to-text insights",
            },
          ],
        },
        "Business Insights (BETA)": {
          color: "teal",
          items: [
            {
              name: "SEO Growth Report",
              link: "/dashboard/seo-growth-report",
              icon: "mdi-chart-line",
              description: "Organic traffic tracking",
            },
            // {
            //   name: "Chatbot Knowledge Score",
            //   link: "/dashboard/chatbot-knowledge-score",
            //   icon: "mdi-robot-outline",
            //   description: "Accuracy assessment",
            // },
            {
              name: "Keyword Research",
              link: "/dashboard/keyword-research",
              icon: "mdi-magnify",
              description: "SEO optimization",
            },
            {
              name: "Competitor Intelligence",
              link: "/dashboard/competitor-intelligence",
              icon: "mdi-account-search",
              description: "Market analysis",
            },
          ],
        },
        "AI Configuration": {
          color: "orange",
          items: [
            {
              name: "Page URL List",
              link: "/dashboard/page-list",
              icon: "mdi-format-list-bulleted",
              description: "Sitemap management",
            },
            {
              name: "Scraped Pages",
              link: "/dashboard/scraped-pages",
              icon: "mdi-file-document-outline",
              description: "Indexed data",
            },
            {
              name: "Knowledge Gap",
              link: "/dashboard/knowledge-gap/",
              icon: "mdi-lightbulb-on-outline",
              description: "Missing information",
            },
            {
              name: "Content Chunks",
              link: "/dashboard/content-chunks",
              icon: "mdi-text-box-multiple-outline",
              description: "Vector data segments",
            },
          ],
        },
        Settings: {
          color: "blue-grey",
          items: [
            {
              name: "Integration",
              link: "/dashboard/integration",
              icon: "mdi-puzzle-outline",
              description: "API and Webhooks",
            },
            {
              name: "Security",
              link: "/dashboard/security",
              icon: "mdi-shield-lock-outline",
              description: "Access and Auth",
            },
          ],
        },
      },
    };
  },

  methods: {
    navigate(link) {
      this.$router.push(link).catch(() => {});
    },
  },
};
</script>

<style scoped>
.hover-card:hover {
  transform: translateY(-5px);
  background-color: #ffffff !important;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(0, 0, 0, 0.05) !important;
}
</style>
