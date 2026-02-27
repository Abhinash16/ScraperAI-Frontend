<template>
  <div>
    <!-- Full Screen Loader -->
    <v-overlay :value="loading" opacity="0.3">
      <v-progress-circular indeterminate size="70" width="6" color="primary" />
    </v-overlay>

    <!-- Empty State -->
    <v-card outlined rounded="xl">
      <!-- Pages Table -->
      <div>
        <div class="d-flex justify-space-between align-center pa-4 flex-wrap">
          <!-- Left Content -->
          <div>
            <div class="text-h6 font-weight-bold">Crawled Pages Library</div>
            <div class="text-body-2 grey--text">
              {{ pages.length }} pages currently indexed for SupportBot.
            </div>
          </div>

          <div>
            <v-btn
              class="mt-2 mt-md-0 mr-2"
              color="primary"
              outlined
              depressed
              rounded
              @click="ScrapAllDialog = true"
            >
              Scrape All Pages</v-btn
            >

            <!-- Upload Button -->
            <v-btn
              class="mt-2 mt-md-0"
              color="primary"
              depressed
              rounded
              @click="uploadUrlDialog = true"
            >
              Upload
            </v-btn>
          </div>
        </div>

        <v-divider></v-divider>

        <div
          v-if="!loading && pages.length === 0"
          class="my-5"
          outlined
          rounded="xl"
        >
          <v-container class="pa-4 py-15 text-center">
            <div class="my-4">
              You have not added any pages, start by uploading a sitemap or a
              URL
            </div>
          </v-container>
        </div>

        <!-- Pages Table -->
        <v-simple-table v-else>
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
              <td>
                <a :href="page.url" target="_blank">{{ page.url }}</a>
              </td>
              <td>
                <v-chip
                  small
                  :color="
                    page.status === 'done'
                      ? 'success'
                      : page.status === 'error'
                      ? 'error'
                      : page.status === 'pending' || page.status === 'ongoing'
                      ? 'warning'
                      : 'grey'
                  "
                  outlined
                >
                  {{ page.status }}
                </v-chip>
              </td>
              <td>
                <!-- Action state -->
                <div v-if="['pending', 'error'].includes(page.status)">
                  <v-btn
                    small
                    rounded
                    depressed
                    color="primary"
                    @click="scrapePage(page.url)"
                  >
                    {{ page.status === "error" ? "Retry" : "Scrape Now" }}
                  </v-btn>
                </div>

                <!-- Completed state -->
                <div v-else-if="page.status === 'done'">
                  {{ formatDate(page.createdAt) }}
                </div>

                <!-- Ongoing -->
                <div v-else class="text-caption grey--text">
                  Scraping in progress…
                </div>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </div>
    </v-card>

    <!-- Scrape Loading Dialog -->
    <v-dialog
      v-model="scrapeLoading"
      persistent
      max-width="320"
      rounded="xl"
      overlay-opacity="0.7"
    >
      <v-card rounded="xl" class="pa-8 text-center" color="white">
        <div class="d-flex justify-center mb-6">
          <div style="position: relative">
            <v-progress-circular
              :size="100"
              :width="2"
              color="black"
              indeterminate
              style="position: absolute; top: -10px; left: -10px; opacity: 0.3"
            ></v-progress-circular>

            <v-progress-circular
              :size="80"
              :width="6"
              color="primary"
              indeterminate
            >
              <v-avatar color="primary darken-4" size="80">
                <v-icon size="40" color="white" class="mdi-spin">
                  mdi-auto-fix
                </v-icon>
              </v-avatar>
            </v-progress-circular>
          </div>
        </div>

        <div class="text-h6 font-weight-bold black--text mb-1">
          Scraping Content
        </div>

        <div class="text-body-2 grey--text text--darken-1 mb-6">
          Please wait while our AI analyzes your URLs and extracts data.
        </div>

        <div class="text-caption primary--text mt-2 font-weight-medium">
          This usually takes a few seconds...
        </div>
      </v-card>
    </v-dialog>

    <!-- Upload URL / Sitemap Dialog -->
    <v-dialog
      v-model="uploadUrlDialog"
      max-width="600"
      rounded="xl"
      persistent
      overlay-color="#2c3e50"
      overlay-opacity="0.8"
    >
      <v-card rounded="xl" :loading="loading" class="overflow-hidden">
        <div class="pa-6 pb-0 d-flex align-center">
          <v-avatar color="#eff2fb" rounded="xl" size="48" class="mr-4">
            <v-icon color="black">mdi-web-sync</v-icon>
          </v-avatar>
          <div>
            <div class="text-h6 font-weight-bold black--text">
              Add Data Source
            </div>
            <div class="text-caption grey--text text--darken-1">
              Train your chatbot by syncing website content
            </div>
          </div>
          <v-spacer></v-spacer>
          <v-btn icon @click="uploadUrlDialog = false" :disabled="loading">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-tabs
          v-model="currentTab"
          color="primary"
          class="px-4"
          active-class="font-weight-bold"
        >
          <v-tab class="text-none">
            <v-icon small class="mr-2">mdi-sitemap-outline</v-icon> Sitemap
          </v-tab>
          <v-tab class="text-none">
            <v-icon small class="mr-2">mdi-link-variant</v-icon> Individual URL
          </v-tab>
          <v-tab disabled class="text-none">
            <v-icon small class="mr-2">mdi-code-json</v-icon> JSON
          </v-tab>
          <v-tab disabled class="text-none">
            <v-icon small class="mr-2">mdi-code-json</v-icon> CSV
          </v-tab>
        </v-tabs>

        <v-divider></v-divider>

        <v-card-text class="pa-6">
          <v-tabs-items v-model="currentTab" class="transparent">
            <v-tab-item>
              <div class="text-body-2 black--text mb-4">
                Enter your website's <strong>sitemap.xml</strong> URL. We will
                automatically discover and list all associated pages for you.
              </div>
              <v-text-field
                v-model="sitemapUrl"
                outlined
                placeholder="https://example.com/sitemap.xml"
              ></v-text-field>
              <v-btn
                block
                depressed
                color="primary"
                rounded
                x-large
                class="mt-2 text-none"
                :disabled="loading"
                @click="submitSitemap"
              >
                Import from Sitemap
              </v-btn>
            </v-tab-item>

            <v-tab-item>
              <div class="text-body-2 black--text mb-4">
                Enter a specific page URL to add it to your training list. You
                can trigger the scrape process in the next step.
              </div>
              <v-text-field
                v-model="url"
                outlined
                placeholder="https://example.com/about-us"
              ></v-text-field>
              <v-btn
                block
                depressed
                color="primary"
                rounded
                x-large
                class="mt-2 text-none"
                :disabled="loading"
                @click="submitUrl"
              >
                Add Single URL
              </v-btn>
            </v-tab-item>
          </v-tabs-items>
        </v-card-text>

        <div class="px-6 pb-6 text-center">
          <span class="text-caption grey--text">
            <v-icon x-small color="grey">mdi-lock-outline</v-icon>
            Only public URLs can be crawled. Ensure your robots.txt allows
            access.
          </span>
        </div>
      </v-card>
    </v-dialog>
    <v-dialog v-model="ScrapAllDialog" max-width="520" persistent>
      <v-card rounded="xl">
        <!-- Header -->
        <v-card-title class="d-flex align-center">
          <v-avatar color="primary" size="36" class="mr-3">
            <v-icon dark>mdi-web-sync</v-icon>
          </v-avatar>
          <span class="text-h6 font-weight-medium">Scrape all pages</span>
        </v-card-title>

        <!-- Content -->
        <v-card-text class="pt-2 text-body-2">
          This action will scrape all the pages in your list. Depending on the
          number of pages, this may take some time.
        </v-card-text>

        <!-- Actions -->
        <v-card-actions class="px-6 pb-4">
          <v-spacer />

          <v-btn
            outlined
            rounded
            color="grey darken-1"
            @click="ScrapAllDialog = false"
          >
            Cancel
          </v-btn>

          <v-btn color="primary" rounded depressed @click="scrapAllPages()">
            Scrape All
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!--  Error Snackbar -->
    <v-snackbar v-model="snackbar" color="error" timeout="4000" top right>
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      loading: false,
      scrapeLoading: false,
      uploadUrlDialog: false,
      ScrapAllDialog: false,
      pages: [],
      sitemapUrl: "",
      currentTab: "sitemap",
      url: "",
      snackbar: false,
      errorMessage: "",
    };
  },
  mounted() {
    this.fetchPages();
  },
  methods: {
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString();
    },

    async scrapePage(url) {
      const pageIndex = this.pages.findIndex((p) => p.url === url);
      if (pageIndex === -1) return;

      // Optimistic update
      this.$set(this.pages[pageIndex], "status", "ongoing");

      try {
        await apiClient.post("content/scrape", { url });
        await this.fetchPages();
      } catch (error) {
        // Roll back UI state
        this.$set(this.pages[pageIndex], "status", "error");

        this.errorMessage =
          error?.response?.data?.message ||
          "Failed to scrape the page. Please try again.";

        this.snackbar = true;
      }
    },

    async scrapAllPages() {
      this.loading = true;
      if (this.pages.length === 0) {
        this.errorMessage = "No pages to scrape.";
        this.snackbar = true;
        this.loading = false;
        this.ScrapAllDialog = false;
        return;
      }
      try {
        await apiClient.post("/content/scrape-all");
        await this.fetchPages();
        this.ScrapAllDialog = false;
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          "Failed to scrape all pages. Please try again.";
        this.snackbar = true;
        this.ScrapAllDialog = false;
      } finally {
        this.loading = false;
      }
    },

    async fetchPages() {
      this.uploadUrlDialog = false;
      this.loading = true;
      try {
        const { data } = await apiClient.get("content/pages");
        this.pages = data.data || [];
      } catch (error) {
        console.error("Error fetching pages:", error);
      } finally {
        this.loading = false;
      }
    },

    async submitSitemap() {
      this.scrapeLoading = true;
      if (!this.sitemapUrl) {
        this.errorMessage = "Please enter a valid sitemap URL.";
        this.snackbar = true;
      }
      try {
        await apiClient.post("content/sitemap", {
          sitemapUrl: this.sitemapUrl,
        });
        await this.fetchPages();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          "Failed to submit sitemap. Please try again.";
        this.snackbar = true;
      } finally {
        this.scrapeLoading = false;
      }
    },

    async submitUrl() {
      this.scrapeLoading = true;
      if (!this.url) {
        this.errorMessage = "Please enter a valid URL.";
        this.snackbar = true;
      }
      try {
        await apiClient.post("content/scrape/url", { url: this.url });
        await this.fetchPages();
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          "Failed to submit URL. Please try again.";
        this.snackbar = true;
      } finally {
        this.scrapeLoading = false;
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
