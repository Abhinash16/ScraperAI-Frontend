<template>
  <v-dialog :value="!!issueId" max-width="1040" scrollable @input="close">
    <v-card v-if="issueId" rounded="xl">
      <v-card-title class="d-flex align-center flex-wrap">
        <template v-if="issue">
          <v-chip small :color="severity.color" text-color="white" class="mr-2">
            {{ severity.label }}
          </v-chip>
          <span class="text-h6 mr-2">{{ typeLabel }}</span>
          <v-chip small outlined :color="status.color">{{ status.label }}</v-chip>
        </template>
        <span v-else class="text-h6">Issue</span>
        <v-spacer />
        <v-btn icon aria-label="Close" @click="close">
          <v-icon>$x</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-progress-linear v-if="loading" indeterminate color="primary" />
        <v-alert v-else-if="loadError" type="error" outlined rounded="lg">
          {{ loadError }}
          <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
        </v-alert>

        <template v-else-if="issue">
          <v-alert
            :type="issue.severity === 'blocker' ? 'error' : 'warning'"
            outlined
            rounded="lg"
            class="text-body-2"
          >
            {{ issue.explanation }}
          </v-alert>

          <div v-if="issue.status !== 'open'" class="text-body-2 grey--text text--darken-1 mb-4">
            {{ status.label }} {{ formatDate(issue.resolvedAt) }}<template v-if="issue.resolution">:
              "{{ issue.resolution }}"</template>
          </div>

          <!-- Side-by-side items -->
          <v-row>
            <v-col
              v-for="(item, i) in items"
              :key="item ? item._id : `missing-${i}`"
              cols="12"
              :md="items.length > 1 ? 6 : 12"
            >
              <v-card outlined rounded="lg" class="pa-4 fill-height d-flex flex-column">
                <div class="text-overline grey--text">
                  {{ items.length > 1 ? (i === 0 ? "New item" : "Existing item") : "Item" }}
                </div>
                <template v-if="item">
                  <div class="text-subtitle-1 font-weight-bold mb-1">{{ item.title || "Untitled" }}</div>
                  <div class="d-flex align-center flex-wrap mb-3">
                    <span class="text-caption grey--text mr-2">
                      {{ sourceName(item) }} · {{ item.type }}
                    </span>
                    <v-chip x-small :color="itemStatus(item).color" text-color="white" class="mr-1">
                      {{ itemStatus(item).label }}
                    </v-chip>
                    <v-chip v-if="isHeld(item)" x-small outlined color="orange darken-2">
                      <v-icon x-small left>$eye-off</v-icon> Hidden by this issue
                    </v-chip>
                  </div>
                  <!-- eslint-disable-next-line vue/no-v-html -->
                  <div class="item-body text-body-2 flex-grow-1" v-html="highlighted(item)"></div>
                  <div class="d-flex flex-wrap mt-3">
                    <v-btn
                      v-if="can(permissions, 'knowledge:write')"
                      small
                      text
                      rounded
                      color="primary"
                      class="text-none"
                      @click="$emit('edit-item', item._id)"
                    >
                      <v-icon small class="mr-1">$pencil</v-icon> Edit
                    </v-btn>
                    <v-btn
                      v-if="can(permissions, 'knowledge:publish') && item.status !== 'archived'"
                      small
                      text
                      rounded
                      class="text-none"
                      :loading="busy === `archive-${item._id}`"
                      @click="archive(item)"
                    >
                      <v-icon small class="mr-1">$archive</v-icon> Archive
                    </v-btn>
                  </div>
                </template>
                <div v-else class="text-body-2 grey--text">This item has been deleted.</div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Resolve / dismiss -->
          <template v-if="issue.status === 'open' && can(permissions, 'knowledge:publish')">
            <v-expand-transition>
              <div v-if="closing" class="mt-4">
                <v-textarea
                  v-model="closeText"
                  :label="closing === 'dismiss' ? 'Why isn\'t this a problem?' : 'Note (optional)'"
                  :hint="
                    closing === 'dismiss'
                      ? 'Required. A dismissed issue only comes back if the text changes.'
                      : 'For example, what you changed.'
                  "
                  persistent-hint
                  outlined
                  rows="2"
                  auto-grow
                  autofocus
                />
              </div>
            </v-expand-transition>
            <v-alert v-if="actionError" type="error" dense outlined rounded="lg" class="mt-3 mb-0 text-body-2">
              {{ actionError }}
            </v-alert>
          </template>
        </template>
      </v-card-text>

      <v-card-actions v-if="issue && issue.status === 'open' && can(permissions, 'knowledge:publish')" class="px-6 pb-4">
        <div class="text-caption grey--text">
          <template v-if="issue.heldItem">Resolving or dismissing shows the hidden item again.</template>
        </div>
        <v-spacer />
        <template v-if="!closing">
          <v-btn text rounded class="text-none" @click="startClose('dismiss')">Dismiss</v-btn>
          <v-btn color="primary" depressed rounded class="text-none" @click="startClose('resolve')">
            <v-icon small class="mr-1">$check</v-icon> Resolve
          </v-btn>
        </template>
        <template v-else>
          <v-btn text rounded class="text-none" :disabled="!!busy" @click="closing = null">Cancel</v-btn>
          <v-btn
            :color="closing === 'dismiss' ? 'grey darken-2' : 'primary'"
            depressed
            rounded
            class="text-none white--text"
            :disabled="closing === 'dismiss' && closeText.trim().length < DISMISS_REASON_MIN"
            :loading="busy === closing"
            @click="finishClose"
          >
            {{ closing === "dismiss" ? "Dismiss issue" : "Mark resolved" }}
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import {
  DISMISS_REASON_MIN,
  ISSUE_STATUS,
  ISSUE_TYPES,
  ITEM_STATUS,
  KNOWLEDGE_API,
  SEVERITY,
  apiError,
  can,
  formatDate,
} from "@/utils/knowledge";

const escapeHtml = (text) =>
  String(text || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const idOf = (ref) => (ref && typeof ref === "object" ? ref._id : ref);

// Opens when `issueId` is set. Emits "close", "changed" and "edit-item" (id).
export default {
  name: "IssueDetailDialog",

  props: {
    issueId: { type: String, default: null },
    permissions: { type: Array, default: () => [] },
  },

  data: () => ({
    DISMISS_REASON_MIN,
    issue: null,
    loading: false,
    loadError: "",
    busy: null,
    actionError: "",
    closing: null,
    closeText: "",
  }),

  computed: {
    items() {
      const list = this.issue?.items || [];
      return list.length ? list : [null];
    },
    severity() {
      return SEVERITY[this.issue?.severity] || SEVERITY.warning;
    },
    status() {
      return ISSUE_STATUS[this.issue?.status] || ISSUE_STATUS.open;
    },
    typeLabel() {
      return ISSUE_TYPES[this.issue?.type] || this.issue?.type;
    },
  },

  watch: {
    issueId: {
      immediate: true,
      handler(id) {
        this.issue = null;
        this.closing = null;
        this.closeText = "";
        this.actionError = "";
        if (id) this.load();
      },
    },
  },

  methods: {
    can,
    formatDate,
    itemStatus: (item) => ITEM_STATUS[item.status] || ITEM_STATUS.draft,

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/issues/${this.issueId}`);
        this.issue = data.data;
      } catch (err) {
        this.loadError = apiError(err, "Failed to load the issue");
      } finally {
        this.loading = false;
      }
    },

    close() {
      this.$emit("close");
    },

    sourceName(item) {
      const id = idOf(item.source);
      return (this.issue.sources || []).find((s) => s && s._id === id)?.name || "Unknown source";
    },

    isHeld(item) {
      return idOf(this.issue.heldItem) === item._id;
    },

    // The item's text with this issue's evidence quotes marked
    highlighted(item) {
      const quotes = (this.issue.evidence || [])
        .filter((e) => idOf(e.item) === item._id && e.quote)
        .map((e) => e.quote.trim())
        .filter(Boolean);
      let html = escapeHtml(item.body || item.data?.answer || "");
      quotes.forEach((q) => {
        const pattern = new RegExp(escapeRegExp(escapeHtml(q)), "gi");
        html = html.replace(pattern, (m) => `<mark>${m}</mark>`);
      });
      // Quotes that aren't in the text verbatim are listed underneath
      const missing = quotes.filter((q) => !html.toLowerCase().includes(`<mark>${escapeHtml(q).toLowerCase()}`));
      if (missing.length) {
        html += `<div class="evidence-extra">${missing
          .map((q) => `<mark>${escapeHtml(q)}</mark>`)
          .join("<br>")}</div>`;
      }
      return html;
    },

    async archive(item) {
      this.busy = `archive-${item._id}`;
      this.actionError = "";
      try {
        await apiClient.post(`${KNOWLEDGE_API}/items/${item._id}/archive`);
        this.$toast.success("Archived. Its issues are closed.");
        this.$emit("changed");
        await this.load();
      } catch (err) {
        this.actionError = apiError(err, "Failed to archive");
      } finally {
        this.busy = null;
      }
    },

    startClose(kind) {
      this.closing = kind;
      this.closeText = "";
      this.actionError = "";
    },

    async finishClose() {
      const kind = this.closing;
      this.busy = kind;
      this.actionError = "";
      try {
        const body = kind === "dismiss" ? { reason: this.closeText.trim() } : { note: this.closeText.trim() || undefined };
        const { data } = await apiClient.post(`${KNOWLEDGE_API}/issues/${this.issueId}/${kind}`, body);
        if (data.data) this.issue = data.data;
        else await this.load();
        this.closing = null;
        this.$toast.success(kind === "dismiss" ? "Issue dismissed" : "Issue resolved");
        this.$emit("changed");
      } catch (err) {
        this.actionError = apiError(err, kind === "dismiss" ? "Failed to dismiss" : "Failed to resolve");
      } finally {
        this.busy = null;
      }
    },
  },
};
</script>

<style scoped>
.item-body {
  white-space: pre-wrap;
  max-height: 360px;
  overflow-y: auto;
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px 12px;
}
.item-body >>> mark {
  background: #fde68a;
  padding: 0 2px;
  border-radius: 3px;
}
.item-body >>> .evidence-extra {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #cbd5e1;
}
</style>
