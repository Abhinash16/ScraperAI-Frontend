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
                  {{ item.icon || "$layout-grid" }}
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

              <v-icon color="grey lighten-1">$chevron-right</v-icon>
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
              icon: "$message-square-text",
              description: "Real-time AI assistance",
            },
            {
              name: "Sandbox",
              link: "/dashboard/sandbox",
              icon: "$flask-conical",
              description: "Test your bot as a customer",
            },
            // {
            //   name: "WhatsApp Bot",
            //   link: "/dashboard/whatsapp-bot",
            //   icon: "$whatsapp",
            //   description: "Automated messaging",
            // },
            {
              name: "Call Analysis",
              link: "/dashboard/call-batches",
              icon: "$phone",
              description: "Speech-to-text insights",
            },
          ],
        },
        "AI Configuration": {
          color: "orange",
          items: [
            {
              name: "Page URL List",
              link: "/dashboard/page-list",
              icon: "$list",
              description: "Sitemap management",
            },
            {
              name: "Scraped Pages",
              link: "/dashboard/scraped-pages",
              icon: "$file-text",
              description: "Indexed data",
            },
            {
              name: "Knowledge Gap",
              link: "/dashboard/knowledge-gap/",
              icon: "$lightbulb",
              description: "Missing information",
            },
            {
              name: "Content Chunks",
              link: "/dashboard/content-chunks",
              icon: "$files",
              description: "Vector data segments",
            },
          ],
        },
        // Settings: {
        //   color: "blue-grey",
        //   items: [
        //     {
        //       name: "Integration",
        //       link: "/dashboard/integration",
        //       icon: "$puzzle",
        //       description: "API and Webhooks",
        //     },
        //     {
        //       name: "Security",
        //       link: "/dashboard/security",
        //       icon: "$shield-check",
        //       description: "Access and Auth",
        //     },
        //   ],
        // },
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
