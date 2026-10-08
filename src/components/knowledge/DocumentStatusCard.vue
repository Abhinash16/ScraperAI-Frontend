<template>
  <v-card outlined rounded="xl" class="pa-6 mb-6">
    <div class="d-flex align-start flex-wrap">
      <div class="flex-grow-1 mr-4 mb-2">
        <div class="text-subtitle-1 font-weight-bold">
          {{ doc.fileName || "Document" }}
          <span v-if="doc.kind" class="text-caption grey--text ml-1">{{ kindLabel }}</span>
        </div>

        <div v-if="processing" class="text-body-2">
          <v-icon small color="primary" class="icon-spin mr-1">$loader-circle</v-icon>
          Reading your document…
          <span v-if="liveStays" class="grey--text text--darken-1">
            Version {{ doc.liveVersion }} stays live until the new one is ready.
          </span>
        </div>
        <div v-else-if="doc.status === 'ready'" class="text-body-2 grey--text text--darken-1">
          {{ doc.sections || 0 }} section{{ doc.sections === 1 ? "" : "s" }} ·
          version {{ doc.latestVersion }} · processed {{ formatDate(doc.processedAt) }}
        </div>
      </div>
      <v-btn
        v-if="canWrite"
        rounded
        depressed
        class="text-none"
        :disabled="processing"
        :title="processing ? 'Wait until the current file has been read' : ''"
        @click="uploadOpen = true"
      >
        <v-icon small class="mr-1">$upload</v-icon> Upload new version
      </v-btn>
    </div>

    <v-alert v-if="doc.status === 'failed'" type="error" text rounded="lg" class="text-body-2 mt-2 mb-0">
      {{ doc.error || "We couldn't read this document." }}
      <template v-if="doc.liveVersion"> Version {{ doc.liveVersion }} is still live.</template>
    </v-alert>

    <!-- Versions -->
    <div v-if="versions.length" class="mt-4">
      <v-btn small text rounded class="text-none px-2" @click="showVersions = !showVersions">
        <v-icon small class="mr-1">{{ showVersions ? "$chevron-up" : "$chevron-down" }}</v-icon>
        Versions ({{ versions.length }})
      </v-btn>
      <v-expand-transition>
        <v-simple-table v-if="showVersions" dense class="mt-2">
          <thead>
            <tr>
              <th>Version</th>
              <th>File</th>
              <th>Status</th>
              <th>Sections</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in versions" :key="v._id">
              <td>
                v{{ v.version }}
                <v-chip v-if="v.version === doc.liveVersion" x-small color="success" class="ml-1">Live</v-chip>
              </td>
              <td class="text-truncate file-cell" :title="v.fileName">{{ v.fileName }}</td>
              <td>
                <v-chip x-small outlined :color="statusOf(v).color" :title="v.error || ''">
                  {{ statusOf(v).label }}
                </v-chip>
              </td>
              <td>{{ v.sections != null ? v.sections : "—" }}</td>
              <td class="text-no-wrap">{{ formatDate(v.createdAt) }}</td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-expand-transition>
    </div>

    <DocumentUploadDialog
      v-model="uploadOpen"
      :source-id="source._id"
      :can-publish="canPublish"
      @uploaded="onUploaded"
    />
  </v-card>
</template>

<script>
import apiClient from "@/service/axios";
import DocumentUploadDialog from "@/components/knowledge/DocumentUploadDialog.vue";
import {
  DOCUMENT_KINDS,
  DOCUMENT_STATUS,
  KNOWLEDGE_API,
  formatDate,
} from "@/utils/knowledge";

const POLL_MS = 4000;

// Status, versions and "Upload new version" for a document source.
// Emits "changed" when a file finishes processing (the sections changed).
export default {
  name: "DocumentStatusCard",

  components: { DocumentUploadDialog },

  props: {
    source: { type: Object, required: true },
    canWrite: { type: Boolean, default: false },
    canPublish: { type: Boolean, default: false },
  },

  data() {
    return {
      doc: { ...(this.source.document || {}) },
      versions: [],
      showVersions: false,
      uploadOpen: false,
      pollTimer: null,
    };
  },

  computed: {
    processing() {
      return this.doc.status === "processing";
    },
    liveStays() {
      return this.doc.liveVersion && this.doc.liveVersion !== this.doc.latestVersion;
    },
    kindLabel() {
      return DOCUMENT_KINDS[this.doc.kind] || this.doc.kind;
    },
  },

  watch: {
    "source._id": {
      immediate: true,
      handler() {
        this.doc = { ...(this.source.document || {}) };
        this.load();
      },
    },
  },

  beforeDestroy() {
    clearTimeout(this.pollTimer);
  },

  methods: {
    formatDate,
    statusOf: (v) => DOCUMENT_STATUS[v.status] || { label: v.status, color: "grey" },

    async load() {
      clearTimeout(this.pollTimer);
      const was = this.doc.status;
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources/${this.source._id}/document`);
        this.doc = data.data?.document || {};
        this.versions = data.data?.versions || [];
        if (was === "processing" && this.doc.status !== "processing") this.$emit("changed");
      } catch {
        // Keep what we have; try again on the next poll
      }
      if (this.doc.status === "processing") this.pollTimer = setTimeout(this.load, POLL_MS);
    },

    onUploaded(source) {
      this.doc = { ...(source.document || {}), status: "processing" };
      this.$toast.success("Uploaded. Reading your document…");
      this.load();
    },
  },
};
</script>

<style scoped>
.file-cell {
  max-width: 220px;
}
</style>
