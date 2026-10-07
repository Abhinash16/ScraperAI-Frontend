<template>
  <div>
    <div class="text-body-2 grey--text text--darken-1 mb-4">
      We look for your sitemap (or follow the links on your home page) and
      group the pages by section. Untick sections you don't want the bot to
      learn from, like a blog with many similar posts. Nothing is imported
      until you click Import.
    </div>

    <!-- Website sources already in this setup -->
    <div v-if="websiteSources.length" class="mb-5">
      <div class="text-subtitle-2 font-weight-bold mb-2">Imported</div>
      <v-card
        v-for="s in websiteSources"
        :key="s._id"
        outlined
        rounded="lg"
        class="pa-3 mb-2 d-flex align-center"
        :to="`/dashboard/knowledge/${s._id}`"
      >
        <v-icon class="mr-3" color="indigo">$globe</v-icon>
        <div class="flex-grow-1">
          <div class="font-weight-medium">{{ s.name }}</div>
          <div class="text-caption grey--text">
            {{ stat(s, "itemCount") }} pages · {{ stat(s, "publishedCount") }} published ·
            {{ stat(s, "chunkCount") }} chunks
          </div>
        </div>
        <v-icon small color="grey">$chevron-right</v-icon>
      </v-card>
    </div>

    <v-form class="d-flex align-start" @submit.prevent="discover">
      <v-text-field
        v-model.trim="url"
        label="Website address"
        placeholder="https://example.com"
        outlined
        dense
        hide-details="auto"
        class="mr-2"
      />
      <v-btn type="submit" depressed rounded height="40" class="text-none" :loading="discovering" :disabled="!url">
        <v-icon small class="mr-1">$search</v-icon> Find pages
      </v-btn>
    </v-form>

    <v-alert v-if="error" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
      {{ error }}
    </v-alert>

    <template v-if="found">
      <div class="d-flex align-center flex-wrap mt-5 mb-2">
        <div class="text-body-2">
          Found <strong>{{ found.total }}</strong> pages
          {{ found.method === "sitemap" ? "in your sitemap" : "linked from your home page" }}<template v-if="found.truncated">
            (showing the first {{ found.urls.length }})</template>.
          <strong>{{ chosenUrls.length }}</strong> selected.
        </div>
        <v-spacer />
        <v-btn x-small text rounded class="text-none" @click="setAll(true)">Select all</v-btn>
        <v-btn x-small text rounded class="text-none" @click="setAll(false)">Select none</v-btn>
      </div>

      <div class="sections">
        <div v-for="sec in found.sections" :key="sec.section" class="section">
          <div class="d-flex align-center">
            <v-checkbox
              v-model="chosenSections"
              :value="sec.section"
              hide-details
              dense
              class="mt-0 pt-0"
              :label="`${sec.section} — ${sec.count} page${sec.count === 1 ? '' : 's'}`"
            />
            <v-spacer />
            <button type="button" class="text-caption primary--text" @click="toggleOpen(sec.section)">
              {{ openSections.includes(sec.section) ? "Hide pages" : "Show pages" }}
            </button>
          </div>
          <v-expand-transition>
            <div v-if="openSections.includes(sec.section)" class="urls">
              <div v-for="u in urlsBySection[sec.section] || []" :key="u" class="text-caption text-truncate">
                {{ u }}
              </div>
            </div>
          </v-expand-transition>
        </div>
      </div>

      <div class="d-flex justify-end mt-4">
        <v-btn
          color="primary"
          depressed
          rounded
          class="text-none font-weight-bold"
          :disabled="!chosenUrls.length"
          :loading="importing"
          @click="importPages"
        >
          Import {{ chosenUrls.length }} page{{ chosenUrls.length === 1 ? "" : "s" }}
        </v-btn>
      </div>
    </template>

    <v-alert v-if="invalid.length" type="info" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
      {{ invalid.length }} entr{{ invalid.length === 1 ? "y was" : "ies were" }} skipped because
      {{ invalid.length === 1 ? "it isn't a web address" : "they aren't web addresses" }}:
      {{ invalid.join(", ") }}
    </v-alert>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import { apiError } from "@/utils/knowledge";
import { SETUP_API } from "@/utils/setup";

const POLL_MS = 4000;

// Same grouping as the server: the first path segment
const sectionOf = (u) => {
  try {
    return new URL(u).pathname.split("/").filter(Boolean)[0] || "(home)";
  } catch {
    return "(home)";
  }
};

// Emits "changed" after an import, and while imported pages are processed.
export default {
  name: "WebsiteStep",

  props: {
    state: { type: Object, required: true },
  },

  data() {
    return {
      url: this.state.setup?.websiteUrl || "",
      discovering: false,
      importing: false,
      error: "",
      found: null,
      chosenSections: [],
      openSections: [],
      invalid: [],
      pollTimer: null,
      pollsLeft: 30,
    };
  },

  computed: {
    websiteSources() {
      return (this.state.staging || []).filter((s) => s.type === "website");
    },
    urlsBySection() {
      const groups = {};
      (this.found?.urls || []).forEach((u) => {
        const key = sectionOf(u);
        (groups[key] = groups[key] || []).push(u);
      });
      return groups;
    },
    chosenUrls() {
      return this.chosenSections.flatMap((s) => this.urlsBySection[s] || []);
    },
  },

  watch: {
    // Keep stats fresh while pages are being imported
    websiteSources: {
      immediate: true,
      handler(list) {
        clearTimeout(this.pollTimer);
        // Failed pages never publish, so give up after a while
        const pending = list.some((s) => (s.stats?.itemCount || 0) > (s.stats?.publishedCount || 0));
        if (pending && this.pollsLeft > 0) {
          this.pollsLeft -= 1;
          this.pollTimer = setTimeout(() => this.$emit("changed"), POLL_MS);
        }
      },
    },
  },

  beforeDestroy() {
    clearTimeout(this.pollTimer);
  },

  methods: {
    stat: (s, key) => s.stats?.[key] ?? 0,

    async discover() {
      this.discovering = true;
      this.error = "";
      this.found = null;
      this.invalid = [];
      try {
        const { data } = await apiClient.post(`${SETUP_API}/discover`, { url: this.url });
        this.found = data.data;
        this.chosenSections = (this.found.sections || []).map((s) => s.section);
        this.openSections = [];
      } catch (err) {
        this.error = apiError(err, "Couldn't read that website");
      } finally {
        this.discovering = false;
      }
    },

    setAll(on) {
      this.chosenSections = on ? this.found.sections.map((s) => s.section) : [];
    },

    toggleOpen(section) {
      this.openSections = this.openSections.includes(section)
        ? this.openSections.filter((s) => s !== section)
        : [...this.openSections, section];
    },

    async importPages() {
      this.importing = true;
      this.error = "";
      try {
        const { data } = await apiClient.post(`${SETUP_API}/website`, {
          url: this.url,
          urls: this.chosenUrls,
        });
        const { queued = 0, skipped = 0, invalid = [] } = data.data || {};
        this.invalid = invalid;
        this.$toast.success(
          `${queued} page${queued === 1 ? "" : "s"} queued for import` +
            (skipped ? `, ${skipped} already imported` : ""),
        );
        this.found = null;
        this.pollsLeft = 150;
        this.$emit("changed");
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
.sections {
  border: 1px solid #e4e8f2;
  border-radius: 12px;
  padding: 6px 12px;
  max-height: 420px;
  overflow-y: auto;
}
.section {
  padding: 6px 0;
  border-bottom: 1px solid #f1f5f9;
}
.section:last-child {
  border-bottom: none;
}
.urls {
  padding: 4px 0 4px 32px;
  color: #64748b;
}
</style>
