<template>
  <v-container fluid>
    <!-- PRODUCTS -->
    <div class="text-subtitle-1 my-4 font-weight-medium">Products</div>
    <v-row>
      <v-col v-for="item in products" :key="item.name" cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4" outlined @click="navigate(item.link)">
          <v-icon large class="mb-3">{{ item.icon }}</v-icon>
          <div class="text-subtitle-1 font-weight-medium">{{ item.name }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- BUSINESS INSIGHTS -->
    <div class="text-subtitle-1 my-4 font-weight-medium">Business Insights (BETA)</div>
    <v-row>
      <v-col v-for="item in insights" :key="item.name" cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4" outlined @click="navigate(item.link)">
          <v-icon class="mb-2">{{ item.icon }}</v-icon>
          <div class="text-subtitle-1 font-weight-medium">{{ item.name }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- AI CONFIGS -->
    <div class="text-subtitle-1 my-4 font-weight-medium">AI Configuration</div>
    <v-row>
      <v-col v-for="item in aiConfigs" :key="item.name" cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4" outlined @click="navigate(item.link)">
          <v-icon class="mb-2">{{ item.icon }}</v-icon>
          <div class="text-subtitle-1 font-weight-medium">{{ item.name }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- SETTINGS -->
    <div class="text-subtitle-1 my-4 font-weight-medium">Settings</div>
    <v-row>
      <v-col v-for="item in settings" :key="item.name" cols="12" sm="6" md="4" lg="3">
        <v-card class="pa-4" outlined @click="navigate(item.link)">
          <v-icon class="mb-2">{{ item.icon }}</v-icon>
          <div class="text-subtitle-1 font-weight-medium">{{ item.name }}</div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'DashboardHome',

  data() {
    return {
      products: [
        { name: 'Chat', link: '/dashboard/chat', icon: 'mdi-message-text-outline' },
        { name: 'Blogs', link: '/dashboard/blogs', icon: 'mdi-newspaper-variant-outline' },
        { name: 'Forms', link: '/dashboard/forms', icon: 'mdi-list-box-outline' },
        { name: 'DB Query Generator', link: '/dashboard/database-ai/projects', icon: 'mdi-database-search-outline' },
        { name: 'WhatsApp Bot', link: '/dashboard/whatsapp-bot', icon: 'mdi-whatsapp' },
        { name: 'Call Analysis', link: '/dashboard/call-batches', icon: 'mdi-phone-outline' },
      ],

      insights: [
        { name: 'SEO Growth Report', link: '/dashboard/seo-growth-report', icon: 'mdi-chart-line' },
        { name: 'Chatbot Knowledge Score', link: '/dashboard/chatbot-knowledge-score', icon: 'mdi-robot-outline' },
        { name: 'Keyword Research', link: '/dashboard/keyword-research', icon: 'mdi-magnify' },
        { name: 'Competitor Intelligence', link: '/dashboard/competitor-intelligence', icon: 'mdi-account-search' },
      ],

      aiConfigs: [
        { name: 'Page URL List', link: '/dashboard/page-list', icon: 'mdi-format-list-bulleted' },
        { name: 'Scraped Pages', link: '/dashboard/scraped-pages', icon: 'mdi-file-document-outline' },
        { name: 'Knowledge Gap', link: '/dashboard/knowledge-gap/', icon: 'mdi-lightbulb-on-outline' },
        { name: 'Content Chunks', link: '/dashboard/content-chunks', icon: 'mdi-text-box-multiple-outline' },
      ],

      settings: [
        { name: 'Integration', link: '/dashboard/integration', icon: 'mdi-puzzle-outline' },
        { name: 'Security', link: '/dashboard/security', icon: 'mdi-shield-lock-outline' },
      ],
    }
  },

  methods: {
    navigate(link) {
      console.log('Navigating to:', link)
      this.$router.push(link)
    },
  },
}
</script>

<style scoped>

</style>