<template>
  <v-navigation-drawer
    :value="!!itemId"
    app
    right
    temporary
    stateless
    width="600"
    class="item-drawer"
  >
    <div v-if="itemId" class="pa-6">
      <div class="d-flex align-center mb-4">
        <div class="text-h6 font-weight-bold mr-2">
          {{ item ? item.title || "Untitled" : "Loading…" }}
        </div>
        <v-spacer />
        <v-btn icon aria-label="Close" @click="requestClose">
          <v-icon>$x</v-icon>
        </v-btn>
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" />
      <v-alert v-else-if="loadError" type="error" outlined rounded="lg">
        {{ loadError }}
        <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
      </v-alert>

      <template v-else-if="item">
        <!-- Status line -->
        <div class="d-flex align-center flex-wrap mb-4">
          <v-chip small :color="status.color" text-color="white" class="mr-2 mb-1">
            {{ status.label }}
          </v-chip>
          <v-chip v-if="work" small outlined :color="work.color" class="mr-2 mb-1">
            <v-icon v-if="work.busy" x-small left class="icon-spin">$loader-circle</v-icon>
            {{ work.label }}
          </v-chip>
          <v-chip v-if="item.locked" small outlined class="mr-2 mb-1">
            <v-icon x-small left>$lock</v-icon> Edited by hand
          </v-chip>
          <span class="text-caption grey--text mb-1">
            v{{ item.version }} · {{ item.chunkCount || 0 }} chunks · updated
            {{ formatDate(item.updatedAt) }}
          </span>
        </div>

        <v-alert
          v-if="work && work.error"
          :type="work.retrying ? 'info' : 'error'"
          dense
          outlined
          rounded="lg"
          class="text-body-2"
        >
          {{ work.error }}
          <div v-if="fix" class="mt-2">
            <v-btn
              v-if="fix === 'delete' && canDelete"
              small
              depressed
              rounded
              color="error"
              class="text-none"
              @click="confirming = 'delete'"
            >
              Delete {{ item.type === "page" ? "page" : "item" }}
            </v-btn>
            <v-btn
              v-else-if="fix === 'note' && canWrite"
              small
              depressed
              rounded
              color="primary"
              class="text-none"
              @click="$emit('add-note', item.title || (item.data && item.data.url) || '')"
            >
              Add as note instead
            </v-btn>
            <v-btn
              v-else-if="fix === 'retry' && (item.type === 'page' ? canWrite : canPublish)"
              small
              depressed
              rounded
              color="primary"
              class="text-none"
              :loading="busy === 'reimport' || busy === 'publish'"
              @click="item.type === 'page' ? confirmReimport() : act('publish')"
            >
              Retry
            </v-btn>
            <v-btn
              v-else-if="fix === 'ai-settings'"
              small
              depressed
              rounded
              color="primary"
              class="text-none"
              to="/dashboard/integration?section=ai-provider"
            >
              Open AI settings
            </v-btn>
          </div>
        </v-alert>

        <div v-if="item.data && item.data.url" class="text-body-2 mb-4">
          <a :href="item.data.url" target="_blank" rel="noopener noreferrer">
            {{ item.data.url }}
            <v-icon x-small color="primary">$external-link</v-icon>
          </a>
        </div>

        <v-tabs v-model="tab" color="primary" class="drawer-tabs mb-4" height="40">
          <v-tab tab-value="content" class="text-none">Content</v-tab>
          <v-tab tab-value="chunks" class="text-none">What the bot searches</v-tab>
        </v-tabs>

        <!-- CONTENT -->
        <div v-show="tab === 'content'">
          <v-text-field
            v-model="form.title"
            label="Title"
            outlined
            dense
            counter="300"
            :readonly="!canWrite"
          />
          <v-textarea
            v-model="form.body"
            label="Text"
            outlined
            rows="14"
            auto-grow
            :readonly="!canWrite"
            class="body-field"
          />

          <div v-if="canWrite" class="text-caption grey--text mb-3">
            <template v-if="item.status === 'published'">
              Saving updates the live answer once it has been re-indexed.
            </template>
            <template v-else>
              Saved changes stay in draft. Publish to let the bot use them.
            </template>
            <template v-if="item.type === 'page'">
              Editing a page marks it as edited by hand.
            </template>
          </div>

          <div class="d-flex flex-wrap align-center">
            <v-btn
              v-if="canWrite"
              depressed
              rounded
              class="text-none mr-2 mb-2"
              :disabled="!dirty"
              :loading="busy === 'save'"
              @click="save"
            >
              Save
            </v-btn>
            <v-btn
              v-if="canPublish && item.status !== 'published'"
              color="primary"
              depressed
              rounded
              class="text-none font-weight-bold mr-2 mb-2"
              :disabled="dirty"
              :loading="busy === 'publish'"
              @click="act('publish')"
            >
              <v-icon small class="mr-1">$send</v-icon> Publish
            </v-btn>
            <v-spacer />
            <v-menu offset-y left>
              <template #activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" aria-label="More actions" class="mb-2" v-on="on">
                  <v-icon>$ellipsis-vertical</v-icon>
                </v-btn>
              </template>
              <v-list dense>
                <v-list-item
                  v-if="canPublish && item.status === 'published'"
                  @click="act('unpublish')"
                >
                  <v-list-item-icon><v-icon small>$eye-off</v-icon></v-list-item-icon>
                  <v-list-item-title>Unpublish</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-if="canPublish && item.status !== 'archived'"
                  @click="act('archive')"
                >
                  <v-list-item-icon><v-icon small>$archive</v-icon></v-list-item-icon>
                  <v-list-item-title>Archive</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="canWrite && item.type === 'page'" @click="confirmReimport">
                  <v-list-item-icon><v-icon small>$rotate-ccw</v-icon></v-list-item-icon>
                  <v-list-item-title>Re-import from website</v-list-item-title>
                </v-list-item>
                <v-list-item v-if="canDelete" @click="confirming = 'delete'">
                  <v-list-item-icon><v-icon small color="error">$trash-2</v-icon></v-list-item-icon>
                  <v-list-item-title class="error--text">Delete</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>

          <v-alert
            v-if="actionError"
            type="error"
            dense
            outlined
            rounded="lg"
            class="mt-2 mb-0 text-body-2"
          >
            {{ actionError }}
          </v-alert>
        </div>

        <!-- CHUNKS -->
        <div v-show="tab === 'chunks'">
          <div class="text-body-2 grey--text text--darken-1 mb-3">
            The bot searches these pieces of the text when it answers. They're
            rebuilt every time the item is published or edited while published.
          </div>
          <v-progress-linear v-if="chunksLoading" indeterminate color="primary" />
          <div v-else-if="!chunks.length" class="text-body-2 grey--text">
            No chunks yet. They appear once the item is published and indexed.
          </div>
          <v-card
            v-for="(chunk, i) in chunks"
            :key="chunk._id"
            outlined
            rounded="lg"
            class="pa-3 mb-2 text-body-2 chunk"
          >
            <div class="text-caption grey--text mb-1">Chunk {{ i + 1 }}</div>
            {{ chunk.content }}
          </v-card>
        </div>
      </template>
    </div>

    <!-- Confirmations -->
    <v-dialog :value="!!confirming" max-width="440" @input="confirming = null">
      <v-card v-if="confirming" rounded="xl">
        <v-card-title class="text-h6">{{ confirmCopy.title }}</v-card-title>
        <v-card-text class="text-body-2">{{ confirmCopy.text }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" @click="confirming = null">Cancel</v-btn>
          <v-btn
            :color="confirming === 'discard' ? 'primary' : 'error'"
            depressed
            rounded
            class="text-none"
            :loading="!!busy"
            @click="confirmAction"
          >
            {{ confirmCopy.button }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-navigation-drawer>
</template>

<script>
import apiClient from "@/service/axios";
import {
  ITEM_STATUS,
  KNOWLEDGE_API,
  apiError,
  can,
  fixFor,
  formatDate,
  isBusy,
  workState,
} from "@/utils/knowledge";

const POLL_MS = 3000;

const CONFIRM = {
  delete: {
    title: "Delete this item?",
    text: "The bot stops using it right away. This can't be undone.",
    button: "Delete",
  },
  reimport: {
    title: "Re-import and lose your edits?",
    text: "This page was edited by hand. Re-importing replaces your edits with the current text from the website.",
    button: "Re-import",
  },
  discard: {
    title: "Discard unsaved changes?",
    text: "Your edits to this item haven't been saved.",
    button: "Discard",
  },
};

// Opens when `itemId` is set. Emits "close", "changed" (the list should
// reload) and "add-note" with a title, when a page should become a note.
export default {
  name: "ItemEditorDrawer",

  props: {
    itemId: { type: String, default: null },
    permissions: { type: Array, default: () => [] },
  },

  data() {
    return {
      item: null,
      form: { title: "", body: "" },
      loading: false,
      loadError: "",
      tab: "content",
      busy: null,
      actionError: "",
      confirming: null,
      chunks: [],
      chunksLoading: false,
      chunksFor: null,
      pollTimer: null,
    };
  },

  computed: {
    canWrite() {
      return can(this.permissions, "knowledge:write");
    },
    canPublish() {
      return can(this.permissions, "knowledge:publish");
    },
    canDelete() {
      return can(this.permissions, "knowledge:delete");
    },
    status() {
      return ITEM_STATUS[this.item?.status] || ITEM_STATUS.draft;
    },
    work() {
      return this.item ? workState(this.item) : null;
    },
    fix() {
      return fixFor(this.work);
    },
    dirty() {
      return (
        !!this.item &&
        (this.form.title !== (this.item.title || "") || this.form.body !== (this.item.body || ""))
      );
    },
    confirmCopy() {
      return CONFIRM[this.confirming] || {};
    },
  },

  watch: {
    itemId: {
      immediate: true,
      handler(id) {
        this.stopPolling();
        this.item = null;
        this.tab = "content";
        this.chunks = [];
        this.chunksFor = null;
        this.actionError = "";
        if (id) this.load();
      },
    },
    tab(tab) {
      if (tab === "chunks") this.loadChunks();
    },
  },

  beforeDestroy() {
    this.stopPolling();
  },

  methods: {
    formatDate,

    apply(item, { keepForm = false } = {}) {
      this.item = item;
      if (!keepForm) this.form = { title: item.title || "", body: item.body || "" };
      this.stopPolling();
      if (isBusy(item)) this.pollTimer = setTimeout(this.poll, POLL_MS);
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/items/${this.itemId}`);
        this.apply(data.data);
      } catch (err) {
        this.loadError = apiError(err, "Failed to load the item");
      } finally {
        this.loading = false;
      }
    },

    // Background import/indexing: refresh status without touching edits.
    async poll() {
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/items/${this.itemId}`);
        const wasBusy = isBusy(this.item);
        this.apply(data.data, { keepForm: this.dirty });
        if (wasBusy && !isBusy(data.data)) {
          this.$emit("changed");
          this.chunksFor = null;
          if (this.tab === "chunks") this.loadChunks();
        }
      } catch {
        this.pollTimer = setTimeout(this.poll, POLL_MS * 2);
      }
    },

    stopPolling() {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    },

    async loadChunks() {
      if (this.chunksFor === this.itemId) return;
      this.chunksLoading = true;
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/items/${this.itemId}/chunks`);
        this.chunks = data.data || [];
        this.chunksFor = this.itemId;
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to load chunks"));
      } finally {
        this.chunksLoading = false;
      }
    },

    async save() {
      this.busy = "save";
      this.actionError = "";
      try {
        const { data } = await apiClient.patch(`${KNOWLEDGE_API}/items/${this.itemId}`, {
          title: this.form.title.trim(),
          body: this.form.body,
        });
        this.apply(data.data);
        this.chunksFor = null;
        this.$emit("changed");
        this.$toast.success("Saved");
      } catch (err) {
        this.actionError = apiError(err, "Failed to save");
      } finally {
        this.busy = null;
      }
    },

    async act(action) {
      this.busy = action;
      this.actionError = "";
      try {
        await apiClient.post(`${KNOWLEDGE_API}/items/${this.itemId}/${action}`);
        await this.load();
        this.chunksFor = null;
        this.$emit("changed");
        this.$toast.success(
          {
            publish: "Publishing. The bot can use it once indexing finishes.",
            unpublish: "Unpublished. The bot no longer uses it.",
            archive: "Archived. The bot no longer uses it.",
            reimport: "Re-import queued",
          }[action]
        );
      } catch (err) {
        this.actionError = apiError(err, `Failed to ${action}`);
      } finally {
        this.busy = null;
      }
    },

    confirmReimport() {
      if (this.item.locked || this.dirty) this.confirming = "reimport";
      else this.act("reimport");
    },

    async confirmAction() {
      const what = this.confirming;
      if (what === "discard") {
        this.confirming = null;
        this.form = { title: this.item.title || "", body: this.item.body || "" };
        this.$emit("close");
        return;
      }
      if (what === "reimport") {
        this.confirming = null;
        await this.act("reimport");
        return;
      }
      this.busy = "delete";
      try {
        await apiClient.delete(`${KNOWLEDGE_API}/items/${this.itemId}`);
        this.confirming = null;
        this.$emit("changed");
        this.$emit("close");
        this.$toast.success("Deleted");
      } catch (err) {
        this.confirming = null;
        this.actionError = apiError(err, "Failed to delete");
      } finally {
        this.busy = null;
      }
    },

    requestClose() {
      if (this.dirty) this.confirming = "discard";
      else this.$emit("close");
    },
  },
};
</script>

<style scoped>
.drawer-tabs {
  border-bottom: 1px solid #e0e0e0;
}
.body-field >>> textarea {
  font-size: 14px;
  line-height: 1.5;
}
.chunk {
  white-space: pre-wrap;
}
</style>
