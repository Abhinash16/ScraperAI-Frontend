<template>
  <v-container>
    <div class="text-right">
      <v-btn @click="uploadUrlDialog = true" color="primary" depressed rounded
        >Upload</v-btn
      >
    </div>
    <v-overlay :value="loading"> </v-overlay>
    <div>
      <v-card v-if="!loading && pages.length == 0" class="my-5">
        <v-container class="pa-4 py-15 text-center">
          <div class="my-4">
            You have not added any pages, start by uploading a sitemap or a url
          </div>
        </v-container>
      </v-card>
      <v-simple-table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Url</th>
            <th>Status</th>
            <th>Scraped At</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="page in pages" :key="page.url">
            <td>{{ page.title }}</td>
            <td>{{ page.url }}</td>
            <td
              :class="page.status === 'done' ? 'success--text' : 'error--text'"
            >
              {{ page.status }}
            </td>
            <td>
              <v-btn
                small
                depressed
                v-if="page.status === 'pending'"
                @click="scrapePage(page.url)"
                :disabled="page.status === 'done' || page.status === 'ongoing'"
              >
                Scrape Now
              </v-btn>
              <v-btn
                small
                depressed
                v-if="page.status === 'error'"
                @click="scrapePage(page.url)"
                :disabled="page.status === 'done' || page.status === 'ongoing'"
              >
                Retry
              </v-btn>
              <div v-else>
                {{ page.scrapedAt | moment("lll") }}
              </div>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </div>

    <v-dialog persistent max-width="300" v-model="loading">
      <v-card>
        <div class="pa-3 text-center">
          <v-progress-circular
            width="1"
            size="15"
            indeterminate
          ></v-progress-circular>
          scraping...
        </div>
      </v-card>
    </v-dialog>
    <v-dialog
      max-width="700"
      :loading="loading"
      :disabled="loading"
      v-model="uploadUrlDialog"
    >
      <v-card :loading="loading">
        <v-container>
          <v-tabs v-model="currentTab">
            <v-tab tab-value="sitemap">Sitemap</v-tab>
            <v-tab tab-value="url">Url</v-tab>
            <v-tab disabled tab-value="json">json</v-tab>
            <v-tab disabled tab-value="csv">csv</v-tab>
          </v-tabs>
          <div class="my-4">
            <div v-if="currentTab == 'sitemap'">
              <div class="my-4">
                Please enter the sitemap URL of your website so we can retrieve
                all associated URLs. If you prefer to enter specific URLs
                individually, please navigate to the 'URL' tab.
              </div>
              <v-text-field
                outlined
                v-model="sitemapUrl"
                placeholder="eg: https://book.on-track.in/sitemap.xml"
              />
              <v-btn depressed color="primary" @click="submitSitemap"
                >Submit</v-btn
              >
            </div>
            <div v-if="currentTab == 'url'">
              <div class="my-4">
                Please enter your website's URL to add it to your page list. You
                can later decide if you want to scrape the data from this URL to
                train your chatbot.
              </div>
              <v-text-field
                outlined
                v-model="url"
                placeholder="eg: https://book.on-track.in/about"
              />
              <v-btn depressed color="primary" @click="submitUrl">Submit</v-btn>
            </div>
          </div>
        </v-container>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      loading: false,
      uploadUrlDialog: false,
      pages: [],
      sitemapUrl: "",
      currentTab: "sitemap",
      url: "",
    };
  },
  mounted() {
    this.fetchPages();
  },
  methods: {
    async scrapePage(url) {
      this.loading = true;
      try {
        await apiClient.post("content/scrape", { url });
        this.fetchPages();
        this.loading = false;
      } catch (error) {
        this.loading = false;
        console.error("Error scraping page:", error);
        alert("Failed to scrape the page. Please try again.");
      }
    },
    async fetchPages() {
      this.uploadUrlDialog = false;
      try {
        const response = await apiClient.get("content/pages");
        this.pages = response.data.pages;
      } catch (error) {
        console.error("Error fetching pages:", error);
      }
    },
    async submitSitemap() {
      if (!this.sitemapUrl) {
        alert("Please enter a valid sitemap URL.");
        return;
      }
      try {
        await apiClient.post("content/sitemap", {
          sitemapUrl: this.sitemapUrl,
        });
        this.fetchPages();
      } catch (error) {
        console.error("Error submitting sitemap:", error);
        alert("Failed to submit sitemap. Please try again.");
      }
    },
    async submitUrl() {
      if (!this.url) {
        alert("Please enter a valid sitemap URL.");
        return;
      }
      try {
        await apiClient.post("content/scrape/url", {
          url: this.url,
        });
        this.fetchPages();
      } catch (error) {
        console.error("Error submitting sitemap:", error);
        alert("Failed to submit sitemap. Please try again.");
      }
    },
  },
};
</script>

<style scoped>
table {
  font-family: Arial, Helvetica, sans-serif;
  border-collapse: collapse;
  width: 100%;
}
</style>
