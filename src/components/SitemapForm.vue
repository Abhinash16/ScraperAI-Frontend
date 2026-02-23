<template>
  <v-container>
    <h2>Enter your sitemap URL</h2>

    <v-text-field
      outlined
      v-model="sitemapUrl"
      placeholder="eg: https://book.on-track.in/sitemap.xml"
    />
    <v-btn @click="submitSitemap">Submit</v-btn>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      sitemapUrl: "",
    };
  },
  methods: {
    async submitSitemap() {
      if (!this.sitemapUrl) {
        alert("Please enter a valid sitemap URL.");
        return;
      }
      try {
        await apiClient.post("content/sitemap", {
          sitemapUrl: this.sitemapUrl,
        });
        this.$emit("sitemapSubmitted");
      } catch (error) {
        console.error("Error submitting sitemap:", error);
        alert("Failed to submit sitemap. Please try again.");
      }
    },
  },
};
</script>

<style scoped>
.sitemap-form {
  margin-bottom: 20px;
}
</style>
