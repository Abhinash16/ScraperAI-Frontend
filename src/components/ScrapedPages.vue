<template>
  <div>
    <!-- LOADER -->
    <v-overlay :value="loading" opacity="0.2">
      <v-progress-circular indeterminate size="60" color="primary" />
    </v-overlay>

    <v-card outlined rounded="xl">
      <!-- HEADER -->
      <div class="d-flex justify-space-between align-center pa-4 flex-wrap">
        <div>
          <div class="text-h6 font-weight-bold">Scraped Pages Library</div>

          <div class="text-body-2 grey--text">
            {{ total }} pages successfully scraped
          </div>
        </div>

        <v-btn color="primary" rounded depressed @click="fetchScrapedPages">
          Refresh
        </v-btn>
      </div>

      <v-divider />

      <!-- SEARCH -->
      <div class="pa-4">
        <v-text-field
          v-model="search"
          label="Search pages..."
          outlined
          dense
          clearable
          prepend-inner-icon="mdi-magnify"
          hide-details
        />
      </div>

      <v-divider />

      <!-- TABLE -->
      <v-data-table
        :headers="headers"
        :items="scrapedPages"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        class="elevation-0"
      >
        <!-- Title -->
        <template v-slot:[`item.title`]="{ item }">
          <div class="font-weight-medium">
            {{ item.title || "Untitled Page" }}
          </div>
        </template>

        <!-- URL -->
        <template v-slot:[`item.url`]="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <span
                class="primary--text text-body-2 text-truncate d-inline-block"
                style="max-width: 300px"
                v-bind="attrs"
                v-on="on"
              >
                {{ truncateUrl(item.url) }}
              </span>
            </template>
            <span>{{ item.url }}</span>
          </v-tooltip>
        </template>

        <!-- Scraped At -->
        <template v-slot:[`item.scrapedAt`]="{ item }">
          <span class="text-caption">
            {{ formatDate(item.scrapedAt) }}
          </span>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon small @click="openPage(item.url)">
            <v-icon small color="primary">mdi-open-in-new</v-icon>
          </v-btn>
        </template>

        <!-- Empty -->
        <template v-slot:no-data>
          <div class="pa-10 text-center grey--text">
            <v-icon large color="grey lighten-1">
              mdi-file-search-outline
            </v-icon>

            <div class="mt-3">No pages have been scraped yet</div>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      loading: false,
      scrapedPages: [],
      search: "",
      total: 0,

      headers: [
        { text: "Title", value: "title" },
        { text: "URL", value: "url" },
        { text: "Scraped At", value: "scrapedAt" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },

  methods: {
    async fetchScrapedPages() {
      this.loading = true;

      try {
        const res = await apiClient.get("content/scraped-pages");

        this.scrapedPages = res.data.data || [];
        this.total = this.scrapedPages.length;
      } catch (error) {
        console.error("Error fetching scraped pages:", error);
      }

      this.loading = false;
    },

    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleString();
    },

    truncateUrl(url) {
      if (!url) return "-";
      return url.length > 50 ? url.slice(0, 50) + "..." : url;
    },

    openPage(url) {
      window.open(url, "_blank");
    },
  },

  mounted() {
    this.fetchScrapedPages();
  },
};
</script>
