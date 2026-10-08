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
          <v-chip v-if="health" small outlined :color="health.color" class="mr-2 mb-1">
            <v-icon x-small left>{{ health.icon }}</v-icon> {{ health.label }}
          </v-chip>
          <v-chip v-if="suggested" small outlined color="deep-purple" class="mr-2 mb-1">
            <v-icon x-small left>$sparkles</v-icon> Suggested
          </v-chip>
          <v-chip v-if="item.locked" small outlined class="mr-2 mb-1">
            <v-icon x-small left>$lock</v-icon> Edited by hand
          </v-chip>
          <v-chip v-if="validity" small outlined :color="validity.color" class="mr-2 mb-1">
            <v-icon x-small left>$calendar</v-icon> {{ validity.label }}
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
              @click="
                $emit('add-note', {
                  title: item.title || (item.data && item.data.url) || '',
                  failedItemId: item._id,
                })
              "
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
          </div>
        </v-alert>

        <!-- Checks -->
        <v-alert
          v-if="item.status === 'needs_review'"
          type="error"
          dense
          outlined
          rounded="lg"
          class="text-body-2"
        >
          This item isn't live: a check found a problem, listed below. Fix the
          text and publish again to re-check it<template v-if="canPublish">, or
          publish it anyway with a reason</template>.
        </v-alert>
        <v-alert
          v-else-if="item.healthStatus === 'held'"
          type="warning"
          dense
          outlined
          rounded="lg"
          class="text-body-2"
        >
          Published, but hidden from the bot: a more trusted item says
          something different. Resolve the issue below to show it again.
        </v-alert>

        <v-alert
          v-if="validity && validity.expired"
          type="warning"
          dense
          outlined
          rounded="lg"
          class="text-body-2"
        >
          Hidden from the bot: its valid-until date has passed. Set a later
          date or clear it to show it again.
        </v-alert>

        <div v-if="issues.length" class="mb-4">
          <div class="text-subtitle-2 font-weight-bold mb-2">
            Open issues ({{ issues.length }})
          </div>
          <v-card
            v-for="issue in issues"
            :key="issue._id"
            outlined
            rounded="lg"
            class="pa-3 mb-2 d-flex align-start"
          >
            <v-chip x-small :color="severityOf(issue).color" text-color="white" class="mr-2 mt-1 flex-shrink-0">
              {{ severityOf(issue).label }}
            </v-chip>
            <div class="text-body-2 flex-grow-1">
              <div class="font-weight-medium">{{ issueType(issue) }}</div>
              {{ issue.explanation }}
            </div>
            <v-btn small text rounded color="primary" class="text-none ml-2" @click="$emit('open-issue', issue._id)">
              View
            </v-btn>
          </v-card>
        </div>

        <div v-if="item.reviewOverride" class="text-caption grey--text text--darken-1 mb-4">
          Published anyway {{ formatDate(item.reviewOverride.at) }}:
          "{{ item.reviewOverride.reason }}"
        </div>

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
          <v-alert
            v-if="suggested"
            border="left"
            colored-border
            color="deep-purple"
            elevation="0"
            outlined
            rounded="lg"
            class="text-body-2"
          >
            The AI suggested this FAQ from your website. Check the answer, edit
            it if needed, then approve it. Reject it if it's wrong.
          </v-alert>

          <FaqFields
            v-if="isFaq"
            v-model="faq"
            :categories="categories"
            :readonly="!canWrite"
            class="mb-4"
          />
          <template v-else>
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
          </template>

          <v-text-field
            v-if="expirable"
            v-model="form.validUntil"
            type="date"
            label="Valid until (optional)"
            hint="After this date the bot stops using it."
            persistent-hint
            outlined
            dense
            clearable
            :readonly="!canWrite"
            class="valid-field mb-4"
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
              <template v-if="suggested">
                <v-icon small class="mr-1">$check</v-icon> Approve
              </template>
              <template v-else-if="item.status === 'needs_review'">
                <v-icon small class="mr-1">$refresh-cw</v-icon> Check again
              </template>
              <template v-else>
                <v-icon small class="mr-1">$send</v-icon> Publish
              </template>
            </v-btn>
            <v-btn
              v-if="item.status === 'needs_review' && canPublish"
              text
              rounded
              class="text-none mr-2 mb-2"
              :disabled="dirty"
              @click="openOverride"
            >
              Publish anyway
            </v-btn>
            <v-btn
              v-if="suggested && canDelete"
              text
              rounded
              color="error"
              class="text-none mr-2 mb-2"
              @click="confirming = 'reject'"
            >
              Reject
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

    <!-- Publish anyway -->
    <v-dialog v-model="overrideOpen" max-width="480">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Publish anyway?</v-card-title>
        <v-card-text>
          <div class="text-body-2 mb-4">
            The bot will use this item even though a check flagged it. Say why
            it's fine; your reason is saved with the item.
          </div>
          <v-textarea
            v-model="overrideReason"
            label="Reason"
            outlined
            rows="2"
            auto-grow
            autofocus
            :hint="`At least ${OVERRIDE_REASON_MIN} characters.`"
            persistent-hint
          />
          <v-alert v-if="overrideError" type="error" dense outlined rounded="lg" class="mt-3 mb-0 text-body-2">
            {{ overrideError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="busy === 'override'" @click="overrideOpen = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            depressed
            rounded
            class="text-none"
            :disabled="overrideReason.trim().length < OVERRIDE_REASON_MIN"
            :loading="busy === 'override'"
            @click="publishAnyway"
          >
            Publish anyway
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmations -->
    <v-dialog :value="!!confirming" max-width="440" @input="confirming = null">
      <v-card v-if="confirming" rounded="lg">
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
import FaqFields from "@/components/knowledge/FaqFields.vue";
import {
  ITEM_STATUS,
  KNOWLEDGE_API,
  apiError,
  can,
  fixFor,
  formatDate,
  ISSUE_TYPES,
  OVERRIDE_REASON_MIN,
  SEVERITY,
  canExpire,
  dayOf,
  healthOf,
  isBusy,
  isSuggested,
  validityOf,
  workState,
} from "@/utils/knowledge";

const faqOf = (item) => ({
  question: item.data?.question || item.title || "",
  answer: item.data?.answer || "",
  alternates: [...(item.data?.alternates || [])],
  category: item.data?.category || "",
});

const sameFaq = (a, b) =>
  a.question === b.question &&
  a.answer === b.answer &&
  a.category === b.category &&
  a.alternates.join("\n") === b.alternates.join("\n");

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
  reject: {
    title: "Reject this suggestion?",
    text: "The suggested FAQ is deleted. The bot never used it.",
    button: "Reject",
  },
  discard: {
    title: "Discard unsaved changes?",
    text: "Your edits to this item haven't been saved.",
    button: "Discard",
  },
};

// Opens when `itemId` is set. Emits "close", "changed" (the list should
// reload), "add-note" with { title, failedItemId } when a page that can't be
// imported should become a note, and "open-issue" with an issue id.
export default {
  name: "ItemEditorDrawer",

  components: { FaqFields },

  props: {
    itemId: { type: String, default: null },
    permissions: { type: Array, default: () => [] },
    // Known FAQ categories, offered when editing a FAQ
    categories: { type: Array, default: () => [] },
  },

  data() {
    return {
      item: null,
      form: { title: "", body: "", validUntil: "" },
      faq: { question: "", answer: "", alternates: [], category: "" },
      issues: [],
      OVERRIDE_REASON_MIN,
      overrideOpen: false,
      overrideReason: "",
      overrideError: "",
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
    isFaq() {
      return this.item?.type === "faq";
    },
    suggested() {
      return !!this.item && isSuggested(this.item);
    },
    health() {
      return healthOf(this.item);
    },
    expirable() {
      return canExpire(this.item);
    },
    validity() {
      return validityOf(this.item);
    },
    contentDirty() {
      if (!this.item) return false;
      if (this.isFaq) return !sameFaq(this.faq, faqOf(this.item));
      return this.form.title !== (this.item.title || "") || this.form.body !== (this.item.body || "");
    },
    dateDirty() {
      return this.expirable && (this.form.validUntil || "") !== dayOf(this.item.validUntil);
    },
    dirty() {
      return this.contentDirty || this.dateDirty;
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
        this.issues = [];
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
    severityOf: (issue) => SEVERITY[issue.severity] || SEVERITY.warning,
    issueType: (issue) => ISSUE_TYPES[issue.type] || issue.type,

    // Open issues mentioning this item (checks run on publish)
    async loadIssues() {
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/issues`, {
          params: { itemId: this.itemId, status: "open", limit: 20 },
        });
        this.issues = data.data.issues || [];
      } catch {
        this.issues = [];
      }
    },

    openOverride() {
      this.overrideReason = "";
      this.overrideError = "";
      this.overrideOpen = true;
    },

    async publishAnyway() {
      this.busy = "override";
      this.overrideError = "";
      try {
        await apiClient.post(`${KNOWLEDGE_API}/items/${this.itemId}/publish`, {
          override: true,
          reason: this.overrideReason.trim(),
        });
        this.overrideOpen = false;
        await this.load();
        this.chunksFor = null;
        this.$emit("changed");
        this.$toast.success("Published anyway. The bot can use it once indexing finishes.");
      } catch (err) {
        this.overrideError = apiError(err, "Failed to publish");
      } finally {
        this.busy = null;
      }
    },

    apply(item, { keepForm = false } = {}) {
      this.item = item;
      if (!keepForm) {
        this.form = { title: item.title || "", body: item.body || "", validUntil: dayOf(item.validUntil) };
        this.faq = faqOf(item);
      }
      this.stopPolling();
      if (isBusy(item)) this.pollTimer = setTimeout(this.poll, POLL_MS);
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/items/${this.itemId}`);
        this.apply(data.data);
        this.loadIssues();
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
          // The checks finished along with indexing
          this.loadIssues();
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
        // FAQs are edited field by field; their body is built by the server
        // Only what changed: re-sending the text would mark a page as edited
        const changes = !this.contentDirty
          ? {}
          : this.isFaq
          ? {
              question: this.faq.question.trim(),
              answer: this.faq.answer.trim(),
              alternates: this.faq.alternates,
              category: this.faq.category,
            }
          : { title: this.form.title.trim(), body: this.form.body };
        if (this.dateDirty) changes.validUntil = this.form.validUntil || null;
        const { data } = await apiClient.patch(`${KNOWLEDGE_API}/items/${this.itemId}`, changes);
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
      const wasSuggested = this.suggested;
      this.busy = action;
      this.actionError = "";
      try {
        await apiClient.post(`${KNOWLEDGE_API}/items/${this.itemId}/${action}`);
        await this.load();
        this.chunksFor = null;
        this.$emit("changed");
        this.$toast.success(
          {
            publish: wasSuggested
              ? "Approved. The bot can use it once indexing finishes."
              : "Publishing. The bot can use it once indexing finishes.",
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
        this.faq = faqOf(this.item);
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
        this.$toast.success(what === "reject" ? "Suggestion rejected" : "Deleted");
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
.valid-field {
  max-width: 280px;
}
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
