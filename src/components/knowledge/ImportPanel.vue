<template>
  <v-card outlined rounded="lg" class="pa-6 mb-4">
    <div class="d-flex align-center mb-1">
      <v-icon small class="mr-2">$upload</v-icon>
      <div class="text-subtitle-1 font-weight-bold">Import pages</div>
    </div>
    <div class="text-body-2 grey--text text--darken-1 mb-4">
      Each page is read once when you import it. Nothing refreshes on its own:
      to pick up changes on your site, re-import the page. URLs already in this
      source are skipped.
    </div>

    <v-tabs v-model="mode" color="primary" class="import-tabs mb-4" height="40">
      <v-tab tab-value="urls" class="text-none">URLs</v-tab>
      <v-tab tab-value="sitemap" class="text-none">Sitemap</v-tab>
      <v-tab tab-value="file" class="text-none">CSV or JSON file</v-tab>
    </v-tabs>

    <v-textarea
      v-if="mode === 'urls'"
      v-model="urlText"
      label="Page URLs, one per line"
      placeholder="https://example.com/pricing"
      :hint="`${urlCount} URL${urlCount === 1 ? '' : 's'} (up to ${MAX_URLS} at a time)`"
      persistent-hint
      outlined
      rows="4"
      auto-grow
    />

    <v-text-field
      v-else-if="mode === 'sitemap'"
      v-model.trim="sitemapUrl"
      label="Sitemap URL"
      placeholder="https://example.com/sitemap.xml"
      hint="Use a sitemap that lists pages, not a sitemap index."
      persistent-hint
      outlined
      dense
    />

    <v-file-input
      v-else
      v-model="file"
      label="CSV of URLs, or a JSON list of URLs"
      accept=".csv,.json,text/csv,application/json"
      prepend-icon=""
      prepend-inner-icon="$file-up"
      hint='JSON can be ["https://…"] or [{ "url": "https://…" }].'
      persistent-hint
      outlined
      dense
      show-size
    />

    <v-alert
      v-if="invalid.length"
      type="info"
      dense
      outlined
      rounded="lg"
      dismissible
      class="mt-4 mb-0 text-body-2"
      @input="invalid = []"
    >
      {{ invalid.length }} entr{{ invalid.length === 1 ? "y was" : "ies were" }}
      skipped because {{ invalid.length === 1 ? "it isn't a web address" : "they aren't web addresses" }}:
      <span class="invalid-list">{{ invalid.join(", ") }}</span>
    </v-alert>

    <v-alert
      v-if="error"
      type="error"
      dense
      outlined
      rounded="lg"
      class="mt-4 mb-0 text-body-2"
    >
      {{ error }}
    </v-alert>

    <div class="d-flex justify-end mt-4">
      <v-btn
        color="primary"
        depressed
        rounded
        class="text-none font-weight-bold"
        :disabled="!ready"
        :loading="importing"
        @click="run"
      >
        Import
      </v-btn>
    </div>
  </v-card>
</template>

<script>
import apiClient from "@/service/axios";
import { KNOWLEDGE_API, apiError } from "@/utils/knowledge";

const MAX_URLS = 500;

const parseUrls = (text) =>
  text
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter(Boolean);

// Emits "imported" with the server's { queued, skipped }.
export default {
  name: "ImportPanel",

  props: {
    sourceId: { type: String, required: true },
  },

  data() {
    return {
      MAX_URLS,
      mode: "urls",
      urlText: "",
      sitemapUrl: "",
      file: null,
      importing: false,
      error: "",
      // Entries the server rejected as not being web addresses (up to 20)
      invalid: [],
    };
  },

  computed: {
    urlCount() {
      return parseUrls(this.urlText).length;
    },

    ready() {
      if (this.mode === "urls") return this.urlCount > 0 && this.urlCount <= MAX_URLS;
      if (this.mode === "sitemap") return !!this.sitemapUrl;
      return !!this.file;
    },
  },

  watch: {
    mode() {
      this.error = "";
    },
  },

  methods: {
    async run() {
      this.importing = true;
      this.error = "";
      this.invalid = [];
      const base = `${KNOWLEDGE_API}/sources/${this.sourceId}/import`;
      try {
        let res;
        if (this.mode === "urls") {
          res = await apiClient.post(base, { urls: parseUrls(this.urlText) });
          this.urlText = "";
        } else if (this.mode === "sitemap") {
          res = await apiClient.post(`${base}/sitemap`, { sitemapUrl: this.sitemapUrl });
          this.sitemapUrl = "";
        } else {
          const form = new FormData();
          form.append("file", this.file);
          res = await apiClient.post(`${base}/file`, form);
          this.file = null;
        }
        const { queued = 0, skipped = 0, invalid = [] } = res.data.data || {};
        this.invalid = invalid;
        this.$toast.success(
          `${queued} page${queued === 1 ? "" : "s"} queued for import` +
            (skipped ? `, ${skipped} already in this source` : "")
        );
        this.$emit("imported", { queued, skipped });
      } catch (err) {
        this.error = apiError(err, "Import failed");
      } finally {
        this.importing = false;
      }
    },
  },
};
</script>

<style scoped>
.import-tabs {
  border-bottom: 1px solid #e0e0e0;
}
.invalid-list {
  word-break: break-all;
}
</style>
