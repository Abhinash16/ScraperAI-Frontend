<template>
  <v-container>
    <h2>Scraped Pages</h2>

    <v-simple-table>
      <thead>
        <tr>
          <th>Title</th>
          <th>Url</th>
          <th>scrapedAt</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="page in scrapedPages" :key="page.url">
          <td>{{ page.title }}</td>
          <td>{{ page.url }}</td>
          <td>{{ page.scrapedAt }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      scrapedPages: [],
    };
  },
  methods: {
    async fetchScrapedPages() {
      try {
        const response = await apiClient.get("content/scraped-pages");
        this.scrapedPages = response.data.pages;
      } catch (error) {
        console.error("Error fetching scraped pages:", error);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleString();
    },
  },
  mounted() {
    this.fetchScrapedPages();
  },
};
</script>
