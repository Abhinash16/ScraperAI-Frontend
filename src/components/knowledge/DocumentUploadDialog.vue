<template>
  <v-dialog :value="value" max-width="520" @input="$emit('input', $event)">
    <v-card rounded="lg">
      <v-card-title class="text-h6">
        {{ sourceId ? "Upload new version" : "Upload document" }}
      </v-card-title>
      <v-card-text>
        <div class="text-body-2 grey--text text--darken-1 mb-4">
          A PDF, Word (.docx) or text file (.txt, .md), up to
          {{ DOCUMENT_MAX_MB }} MB. Each section becomes an item you can review
          and edit. Scanned PDFs (pictures of pages) aren't supported yet. We
          keep only the text, not the file.
        </div>

        <v-alert
          v-if="sourceId"
          type="warning"
          text
          dense
          rounded="lg"
          class="text-body-2"
        >
          The new file's sections replace the current ones once it's ready.
          Sections you edited will be replaced by the new file's sections. The
          current version keeps working until then.
        </v-alert>

        <v-file-input
          v-model="file"
          :accept="DOCUMENT_ACCEPT"
          label="File"
          prepend-icon=""
          prepend-inner-icon="$file-up"
          outlined
          dense
          show-size
          :error-messages="fileError"
          @change="fileError = ''"
        />
        <v-text-field
          v-if="!sourceId"
          v-model="name"
          label="Name (optional)"
          :placeholder="defaultName || 'Defaults to the file name'"
          persistent-placeholder
          outlined
          dense
          counter="100"
        />
        <v-checkbox
          v-if="!sourceId && canPublish"
          v-model="publish"
          hide-details
          class="mt-0"
          label="Publish sections straight away"
        />
        <div v-if="!sourceId && !canPublish" class="text-caption grey--text">
          Sections are saved as drafts for someone with publish access to review.
        </div>

        <v-alert v-if="error" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
          {{ error }}
        </v-alert>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text rounded class="text-none" :disabled="uploading" @click="$emit('input', false)">
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          depressed
          rounded
          class="text-none"
          :disabled="!file"
          :loading="uploading"
          @click="upload"
        >
          Upload
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_MAX_MB,
  KNOWLEDGE_API,
  apiError,
} from "@/utils/knowledge";

const EXTENSIONS = DOCUMENT_ACCEPT.split(",");

// Uploads a new document (no sourceId) or a new version of one.
// Emits "input" (open state) and "uploaded" with the source.
export default {
  name: "DocumentUploadDialog",

  props: {
    value: { type: Boolean, default: false },
    sourceId: { type: String, default: null },
    canPublish: { type: Boolean, default: false },
  },

  data: () => ({
    DOCUMENT_ACCEPT,
    DOCUMENT_MAX_MB,
    file: null,
    name: "",
    publish: true,
    uploading: false,
    error: "",
    fileError: "",
  }),

  computed: {
    defaultName() {
      return this.file ? this.file.name.replace(/\.[^.]+$/, "") : "";
    },
  },

  watch: {
    value(open) {
      if (!open) return;
      this.file = null;
      this.name = "";
      this.publish = this.canPublish;
      this.error = "";
      this.fileError = "";
    },
  },

  methods: {
    async upload() {
      const f = this.file;
      if (!EXTENSIONS.some((ext) => f.name.toLowerCase().endsWith(ext))) {
        this.fileError = "Upload a PDF, a Word document (.docx) or a text file (.txt, .md).";
        return;
      }
      if (f.size > DOCUMENT_MAX_MB * 1024 * 1024) {
        this.fileError = `The file is too big. Upload files up to ${DOCUMENT_MAX_MB} MB.`;
        return;
      }

      const body = new FormData();
      body.append("file", f);
      if (!this.sourceId && this.name.trim()) body.append("name", this.name.trim());
      // A new version keeps the previous version's choice
      const params = this.sourceId ? {} : { publish: this.canPublish && this.publish };

      this.uploading = true;
      this.error = "";
      try {
        const url = this.sourceId
          ? `${KNOWLEDGE_API}/sources/${this.sourceId}/document`
          : `${KNOWLEDGE_API}/documents`;
        const { data } = await apiClient.post(url, body, { params });
        this.$emit("uploaded", data.data);
        this.$emit("input", false);
      } catch (err) {
        this.error = apiError(err, "Upload failed");
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>
