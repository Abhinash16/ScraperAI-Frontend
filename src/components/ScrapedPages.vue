<template>
  <v-container fluid>
   

    <!-- Table -->
    <v-card v-if="scrapedPages.length" outlined class="rounded-xl">
      <v-data-table
        :headers="headers"
        :items="scrapedPages"
        item-key="url"
        dense
        class="elevation-0"
        mobile-breakpoint="960"
      >
        <!-- Title -->
        <template slot="item.title" slot-scope="props">
          <div class="font-weight-medium">
            {{ props.item.title || 'Untitled Page' }}
          </div>
        </template>

        <!-- URL -->
        <template slot="item.url" slot-scope="props">
          <v-tooltip bottom>
            <template slot="activator" slot-scope="{ on, attrs }">
              <span
                class="primary--text text-body-2"
                v-bind="attrs"
                v-on="on"
              >
                {{ truncateUrl(props.item.url) }}
              </span>
            </template>
            <span>{{ props.item.url }}</span>
          </v-tooltip>
        </template>

        <!-- Scraped At -->
        <template slot="item.scrapedAt" slot-scope="props">
          <span class="text-body-2 grey--text">
            {{ formatDate(props.item.scrapedAt) }}
          </span>
        </template>

        <!-- No Data -->
        <template slot="no-data">
          <v-row justify="center" class="py-12">
            <v-col cols="12" class="text-center">
              <v-icon size="48" color="grey lighten-1">
                mdi-file-search-outline
              </v-icon>
              <div class="text-body-2 grey--text mt-2">
                No pages have been scraped yet
              </div>
            </v-col>
          </v-row>
        </template>
      </v-data-table>
    </v-card>

    <!-- Empty State -->
    <v-card
      v-else
      outlined
      class="rounded-xl pa-12 text-center"
    >
      <v-icon size="56" color="grey lighten-1">
        mdi-database-off-outline
      </v-icon>
      <div class="text-body-2 grey--text mt-3">
        No pages have been scraped yet
      </div>
    </v-card>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      scrapedPages: [],
      headers: [
        { text: "Title", value: "title" },
        { text: "URL", value: "url" },
        { text: "Scraped At", value: "scrapedAt" },
      ],
    };
  },

  methods: {
    async fetchScrapedPages() {
      try {
        const response = await apiClient.get("content/scraped-pages");
        this.scrapedPages = response.data.data || [];
      } catch (error) {
        console.error("Error fetching scraped pages:", error);
      }
    },

    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleString();
    },

    truncateUrl(url) {
      if (!url) return "-";
      return url.length > 45 ? url.slice(0, 45) + "…" : url;
    },
  },

  mounted() {
    this.fetchScrapedPages();
  },
};
</script>