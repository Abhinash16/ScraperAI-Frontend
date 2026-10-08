<template>
  <div>
    <!-- Progress of the last extraction -->
    <v-alert
      v-if="showStatus"
      :type="statusType"
      outlined
      rounded="lg"
      class="text-body-2"
      :dismissible="extraction.status !== 'running'"
      @input="dismissedAt = extraction.finishedAt || extraction.startedAt"
    >
      <template v-if="extraction.status === 'running'">
        <div class="font-weight-bold mb-1">
          Reading your website for FAQs{{ fromName ? ` (${fromName})` : "" }}…
        </div>
        <div class="mb-2">
          {{ extraction.pagesRead || 0 }} of {{ extraction.pagesTotal || "?" }} pages read ·
          {{ extraction.created || 0 }} suggested so far. You can leave this page; it
          keeps going.
        </div>
        <v-progress-linear
          :value="percent"
          :indeterminate="!extraction.pagesTotal"
          color="primary"
          rounded
          height="6"
        />
      </template>
      <template v-else-if="extraction.status === 'done'">
        Finished: {{ extraction.created || 0 }} suggested FAQ{{ extraction.created === 1 ? "" : "s" }}
        from {{ extraction.pagesRead || 0 }} pages<template v-if="extraction.skipped">
          ({{ extraction.skipped }} skipped as duplicates)</template>. Review them under
        Draft: approve the good ones and reject the rest.
      </template>
      <template v-else>
        Extraction stopped: {{ extraction.error || "something went wrong." }}
      </template>
    </v-alert>

    <!-- Start -->
    <v-dialog :value="value" max-width="480" @input="$emit('input', $event)">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Suggest FAQs from your website</v-card-title>
        <v-card-text>
          <div class="text-body-2 grey--text text--darken-1 mb-4">
            The AI reads the imported pages of a website source and suggests
            questions and answers. Suggestions are saved as drafts: nothing
            reaches customers until you approve it.
          </div>
          <v-progress-linear v-if="loadingSources" indeterminate color="primary" />
          <v-select
            v-else
            v-model="fromSourceId"
            :items="websiteSources"
            item-text="name"
            item-value="_id"
            label="Website source"
            :no-data-text="'No website sources yet. Import your website in Knowledge first.'"
            outlined
            dense
            hide-details
          >
            <template #item="{ item }">
              {{ item.name }}
              <span class="grey--text ml-2 text-caption">
                {{ (item.stats && item.stats.itemCount) || 0 }} pages
              </span>
            </template>
          </v-select>
          <v-alert v-if="error" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
            {{ error }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="starting" @click="$emit('input', false)">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            depressed
            rounded
            class="text-none"
            :disabled="!fromSourceId"
            :loading="starting"
            @click="start"
          >
            Start
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import { KNOWLEDGE_API, apiError } from "@/utils/knowledge";

const POLL_MS = 3000;

// v-model opens the start dialog. Polls the FAQ source while an extraction
// runs, emitting "update" with the fresh source and "finished" at the end.
export default {
  name: "FaqExtractPanel",

  props: {
    value: { type: Boolean, default: false },
    source: { type: Object, required: true },
  },

  data: () => ({
    websiteSources: [],
    loadingSources: false,
    fromSourceId: null,
    starting: false,
    error: "",
    pollTimer: null,
    dismissedAt: null,
  }),

  computed: {
    extraction() {
      return this.source.extraction || { status: "idle" };
    },
    showStatus() {
      const { status, finishedAt, startedAt } = this.extraction;
      if (status === "running") return true;
      if (!["done", "failed"].includes(status)) return false;
      return this.dismissedAt !== (finishedAt || startedAt);
    },
    statusType() {
      return { running: "info", done: "success", failed: "error" }[this.extraction.status];
    },
    percent() {
      const { pagesRead = 0, pagesTotal = 0 } = this.extraction;
      return pagesTotal ? Math.round((pagesRead / pagesTotal) * 100) : 0;
    },
    fromName() {
      const id = this.extraction.fromSource;
      return this.websiteSources.find((s) => s._id === id)?.name || "";
    },
  },

  watch: {
    value(open) {
      if (!open) return;
      this.error = "";
      this.loadWebsiteSources();
    },
    "extraction.status": {
      immediate: true,
      handler(status) {
        clearTimeout(this.pollTimer);
        if (status === "running") {
          this.pollTimer = setTimeout(this.poll, POLL_MS);
          if (!this.websiteSources.length) this.loadWebsiteSources();
        }
      },
    },
  },

  beforeDestroy() {
    clearTimeout(this.pollTimer);
  },

  methods: {
    async loadWebsiteSources() {
      this.loadingSources = true;
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources`);
        this.websiteSources = (data.data || []).filter((s) => s.type === "website");
        if (!this.fromSourceId && this.websiteSources.length === 1) {
          this.fromSourceId = this.websiteSources[0]._id;
        }
      } catch (err) {
        this.error = apiError(err, "Failed to load your website sources");
      } finally {
        this.loadingSources = false;
      }
    },

    async start() {
      this.starting = true;
      this.error = "";
      try {
        const { data } = await apiClient.post(
          `${KNOWLEDGE_API}/sources/${this.source._id}/extract-faqs`,
          { fromSourceId: this.fromSourceId },
        );
        this.$emit("input", false);
        this.$emit("update", data.data);
      } catch (err) {
        this.error = apiError(err, "Couldn't start");
      } finally {
        this.starting = false;
      }
    },

    async poll() {
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources/${this.source._id}`);
        const created = this.extraction.created;
        this.$emit("update", data.data);
        const next = data.data.extraction || {};
        if (next.status !== "running") {
          this.$emit("finished");
        } else {
          // New suggestions arrive while it runs
          if (next.created !== created) this.$emit("progress");
          clearTimeout(this.pollTimer);
          this.pollTimer = setTimeout(this.poll, POLL_MS);
        }
      } catch {
        this.pollTimer = setTimeout(this.poll, POLL_MS * 2);
      }
    },
  },
};
</script>
