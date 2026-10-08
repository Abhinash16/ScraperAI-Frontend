<template>
  <div class="source-page">
    <v-btn text rounded small class="text-none mb-4 px-2" to="/dashboard/knowledge">
      <v-icon small class="mr-1">$arrow-left</v-icon> Knowledge
    </v-btn>

    <v-card v-if="!source" outlined rounded="xl" class="pa-6">
      <v-progress-linear v-if="!loadError" indeterminate color="primary" />
      <v-alert v-else type="error" outlined rounded="lg" class="mb-0">
        {{ loadError }}
        <v-btn small text color="error" class="ml-2" @click="loadSource">Retry</v-btn>
      </v-alert>
    </v-card>

    <template v-else>
      <!-- Header -->
      <div class="d-flex align-center flex-wrap mb-6">
        <v-avatar size="48" rounded="xl" :color="`${type.color} lighten-5`" class="mr-4">
          <v-icon :color="type.color">{{ type.icon }}</v-icon>
        </v-avatar>
        <div class="mr-4 min-w-0">
          <div class="d-flex align-center">
            <div class="text-h5 font-weight-bold text-truncate">{{ source.name }}</div>
            <v-chip v-if="paused" small outlined color="warning" class="ml-3">Paused</v-chip>
            <v-chip v-if="source.stage === 'staging'" small color="deep-orange" text-color="white" class="ml-3">
              Staging
            </v-chip>
            <v-chip v-if="source.retiring" small outlined class="ml-3">Being replaced</v-chip>
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            {{ type.label }} · {{ stat("itemCount") }} items ·
            {{ stat("publishedCount") }} published · {{ stat("chunkCount") }} chunks
          </div>
        </div>
        <v-spacer />
        <v-btn
          v-if="can(perms, 'knowledge:publish')"
          text
          rounded
          class="text-none my-1"
          :loading="sourceBusy === 'pause'"
          @click="togglePause"
        >
          <v-icon small class="mr-1">{{ paused ? "$play" : "$pause" }}</v-icon>
          {{ paused ? "Resume" : "Pause" }}
        </v-btn>
        <v-btn
          v-if="can(perms, 'knowledge:write')"
          text
          rounded
          class="text-none my-1"
          @click="openSettings"
        >
          <v-icon small class="mr-1">$pencil</v-icon> Settings
        </v-btn>
        <v-btn
          v-if="can(perms, 'knowledge:delete')"
          text
          rounded
          color="error"
          class="text-none my-1"
          @click="confirmDelete = true"
        >
          <v-icon small class="mr-1">$trash-2</v-icon> Delete
        </v-btn>
      </div>

      <v-alert
        v-if="source.stage === 'staging'"
        border="left"
        colored-border
        color="deep-orange"
        elevation="0"
        outlined
        rounded="xl"
        class="text-body-2"
      >
        Part of your new setup: built and tested, but customers can't see it
        until you switch over in
        <router-link to="/dashboard/setup">Setup</router-link>.
      </v-alert>
      <v-alert
        v-else-if="source.retiring"
        border="left"
        colored-border
        color="grey"
        elevation="0"
        outlined
        rounded="xl"
        class="text-body-2"
      >
        Still answering customers, but your new setup replaces it: switching
        over deletes this source.
      </v-alert>

      <v-alert
        v-if="paused"
        border="left"
        colored-border
        color="warning"
        elevation="0"
        outlined
        rounded="xl"
        class="text-body-2"
      >
        This source is paused, so the bot doesn't use any of it. Nothing has
        been deleted. Resume it to make it live again.
      </v-alert>

      <ThingsToKnow v-if="faqSource" feature="faqs" />

      <ImportPanel
        v-if="source.type === 'website' && can(perms, 'knowledge:write')"
        :source-id="source._id"
        @imported="onImported"
      />

      <DocumentStatusCard
        v-if="source.type === 'document'"
        :source="source"
        :can-write="can(perms, 'knowledge:write')"
        :can-publish="can(perms, 'knowledge:publish')"
        @changed="refresh()"
      />

      <FaqExtractPanel
        v-if="source.type === 'faq'"
        v-model="extractOpen"
        :source="source"
        @update="(s) => (source = { ...source, ...s })"
        @progress="loadItems({ quiet: true })"
        @finished="refresh()"
      />

      <!-- Items -->
      <v-card outlined rounded="xl" class="pa-6">
        <div class="d-flex align-center flex-wrap mb-4">
          <v-btn-toggle
            v-model="statusFilter"
            mandatory
            rounded
            dense
            color="primary"
            class="mr-4 my-1"
          >
            <v-btn v-for="f in FILTERS" :key="f.value" :value="f.value" small class="text-none">
              {{ f.label }}
            </v-btn>
          </v-btn-toggle>
          <v-text-field
            v-model="search"
            :placeholder="faqSource ? 'Search questions and answers' : 'Search titles'"
            prepend-inner-icon="$search"
            outlined
            dense
            hide-details
            clearable
            class="search-field mr-2 my-1"
          />
          <v-select
            v-if="faqSource && knownCategories.length"
            v-model="categoryFilter"
            :items="knownCategories"
            placeholder="All categories"
            prepend-inner-icon="$tag"
            outlined
            dense
            hide-details
            clearable
            class="category-field my-1"
          />
          <v-spacer />
          <template v-if="can(perms, 'knowledge:write')">
            <template v-if="source.type === 'faq'">
              <v-btn text rounded class="text-none my-1" @click="extractOpen = true">
                <v-icon small class="mr-1">$wand-sparkles</v-icon> Suggest from website
              </v-btn>
              <v-btn text rounded class="text-none my-1" @click="faqImportOpen = true">
                <v-icon small class="mr-1">$file-spreadsheet</v-icon> Import CSV
              </v-btn>
            </template>
            <v-btn
              v-if="faqSource"
              color="primary"
              depressed
              rounded
              class="text-none ml-2 my-1"
              @click="faqOpen = true"
            >
              <v-icon small class="mr-1">$plus</v-icon> Add FAQ
            </v-btn>
            <v-btn
              v-else-if="source.type !== 'website'"
              color="primary"
              depressed
              rounded
              class="text-none my-1"
              @click="openNote()"
            >
              <v-icon small class="mr-1">$plus</v-icon> Add note
            </v-btn>
          </template>
        </div>

        <!-- Bulk actions -->
        <div v-if="selected.length" class="bulk-bar d-flex align-center flex-wrap px-4 py-2 mb-3">
          <span class="text-body-2 font-weight-bold mr-4">{{ selected.length }} selected</span>
          <template v-if="can(perms, 'knowledge:publish')">
            <v-btn small text rounded class="text-none" :loading="bulkBusy === 'publish'" @click="bulk('publish')">
              {{ allSuggested ? "Approve" : "Publish" }}
            </v-btn>
            <v-btn
              v-if="!allSuggested"
              small
              text
              rounded
              class="text-none"
              :loading="bulkBusy === 'unpublish'"
              @click="bulk('unpublish')"
            >
              Unpublish
            </v-btn>
            <v-btn
              v-if="!allSuggested"
              small
              text
              rounded
              class="text-none"
              :loading="bulkBusy === 'archive'"
              @click="bulk('archive')"
            >
              Archive
            </v-btn>
          </template>
          <v-btn
            v-if="can(perms, 'knowledge:delete')"
            small
            text
            rounded
            color="error"
            class="text-none"
            @click="confirmBulkDelete = true"
          >
            {{ allSuggested ? "Reject" : "Delete" }}
          </v-btn>
          <v-spacer />
          <v-btn small text rounded class="text-none" @click="selected = []">Clear</v-btn>
        </div>

        <v-data-table
          v-model="selected"
          :headers="headers"
          :items="displayItems"
          :options.sync="options"
          :server-items-length="total"
          :loading="itemsLoading"
          :show-select="canBulk"
          :footer-props="{ itemsPerPageOptions: [20, 50, 100] }"
          item-key="_id"
          class="items-table"
          @click:row="(item) => (openItemId = item._id)"
        >
          <template #[`item.title`]="{ item }">
            <div class="py-2">
              <div class="font-weight-medium">
                <v-icon v-if="item.locked" x-small class="mr-1" title="Edited by hand">$lock</v-icon>
                {{ item.title || "Untitled" }}
              </div>
              <div v-if="item.data && item.data.url" class="text-caption grey--text text-truncate url">
                {{ item.data.url }}
              </div>
              <div
                v-else-if="item.type === 'faq' && item.data && item.data.alternates && item.data.alternates.length"
                class="text-caption grey--text"
              >
                +{{ item.data.alternates.length }} other way{{ item.data.alternates.length === 1 ? "" : "s" }} to ask
              </div>
            </div>
          </template>
          <template #[`item.category`]="{ item }">
            <v-chip v-if="item.data && item.data.category" x-small outlined>
              {{ item.data.category }}
            </v-chip>
          </template>
          <template #[`item.status`]="{ item }">
            <v-chip v-if="isSuggested(item)" x-small outlined color="deep-purple">
              <v-icon x-small left>$sparkles</v-icon> Suggested
            </v-chip>
            <v-chip v-else x-small :color="statusOf(item).color" text-color="white">
              {{ statusOf(item).label }}
            </v-chip>
            <v-chip
              v-if="healthOf(item)"
              x-small
              outlined
              :color="healthOf(item).color"
              class="ml-1"
              :title="item.openIssueCount ? `${item.openIssueCount} open issue(s)` : ''"
            >
              <v-icon x-small left>{{ healthOf(item).icon }}</v-icon>
              {{ healthOf(item).label }}
            </v-chip>
            <v-chip
              v-if="validityOf(item)"
              x-small
              outlined
              :color="validityOf(item).color"
              class="ml-1"
              :title="validityOf(item).expired ? 'Hidden from the bot: its valid-until date has passed' : ''"
            >
              <v-icon x-small left>$calendar</v-icon>
              {{ validityOf(item).label }}
            </v-chip>
            <v-tooltip v-if="workOf(item)" bottom :disabled="!workOf(item).error">
              <template #activator="{ on, attrs }">
                <v-chip
                  x-small
                  outlined
                  :color="workOf(item).color"
                  class="ml-1"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon v-if="workOf(item).busy" x-small left class="icon-spin">$loader-circle</v-icon>
                  {{ workOf(item).label }}
                </v-chip>
              </template>
              {{ workOf(item).error }}
            </v-tooltip>
          </template>
          <template #[`item.chunkCount`]="{ item }">{{ item.chunkCount || 0 }}</template>
          <template #[`item.review`]="{ item }">
            <div v-if="isSuggested(item)" class="text-no-wrap" @click.stop>
              <v-btn
                v-if="can(perms, 'knowledge:publish')"
                x-small
                depressed
                rounded
                color="primary"
                class="text-none mr-1"
                :loading="rowBusy === item._id + 'publish'"
                @click="review(item, 'publish')"
              >
                Approve
              </v-btn>
              <v-btn
                v-if="can(perms, 'knowledge:delete')"
                x-small
                text
                rounded
                color="error"
                class="text-none"
                :loading="rowBusy === item._id + 'delete'"
                @click="review(item, 'delete')"
              >
                Reject
              </v-btn>
            </div>
          </template>
          <template #[`item.updatedAt`]="{ item }">
            <span class="text-no-wrap">{{ formatDate(item.updatedAt) }}</span>
          </template>
          <template #no-data>
            <div class="py-6 text-body-2 grey--text">
              {{
                search || statusFilter || categoryFilter
                  ? "No items match."
                  : source.type === "website"
                  ? "No pages yet. Import some above."
                  : source.type === "document"
                  ? "No sections yet. They appear once the document has been read."
                  : faqSource
                  ? "No FAQs yet."
                  : "No notes yet."
              }}
            </div>
          </template>
        </v-data-table>
      </v-card>
    </template>

    <ItemEditorDrawer
      :item-id="openItemId"
      :permissions="perms"
      :categories="knownCategories"
      @close="openItemId = null"
      @changed="refresh"
      @add-note="addAsNote"
      @open-issue="(id) => $router.push({ path: '/dashboard/knowledge/issues', query: { issue: id } })"
    />

    <template v-if="source && faqSource">
      <FaqDialog
        v-model="faqOpen"
        :source-id="source._id"
        :categories="knownCategories"
        :can-publish="can(perms, 'knowledge:publish')"
        @saved="refresh"
      />
      <FaqImportDialog
        v-model="faqImportOpen"
        :source-id="source._id"
        :can-publish="can(perms, 'knowledge:publish')"
        @imported="refresh"
      />
    </template>

    <!-- Add note -->
    <v-dialog v-model="noteOpen" max-width="600">
      <v-card rounded="xl">
        <v-card-title class="text-h6">Add note</v-card-title>
        <v-card-text>
          <v-text-field v-model="note.title" label="Title" outlined dense counter="300" />
          <v-textarea
            v-model="note.body"
            label="Text"
            hint="Write it the way you'd want the bot to answer. At least 10 characters."
            persistent-hint
            outlined
            rows="8"
            auto-grow
          />
          <v-checkbox
            v-if="can(perms, 'knowledge:publish')"
            v-model="note.publish"
            hide-details
            label="Publish now, so the bot can use it"
          />
          <v-checkbox
            v-if="note.failedItemId && can(perms, 'knowledge:delete')"
            v-model="note.deleteFailed"
            hide-details
            label="Also delete the page that failed"
          />
          <v-alert v-if="noteError" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
            {{ noteError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="noteSaving" @click="noteOpen = false">Cancel</v-btn>
          <v-btn
            color="primary"
            depressed
            rounded
            class="text-none"
            :disabled="note.body.trim().length < 10"
            :loading="noteSaving"
            @click="saveNote"
          >
            Add note
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Source settings -->
    <v-dialog v-model="settingsOpen" max-width="480">
      <v-card v-if="source" rounded="xl">
        <v-card-title class="text-h6">Source settings</v-card-title>
        <v-card-text>
          <v-text-field v-model="settings.name" label="Name" outlined dense counter="100" />
          <template v-if="source.type === 'website'">
            <v-text-field
              v-model="settings.rootUrl"
              label="Website address"
              placeholder="https://example.com"
              outlined
              dense
            />
            <v-switch
              v-model="settings.autoPublish"
              inset
              hide-details
              class="mt-0"
              label="Publish pages as soon as they're imported"
            />
          </template>
          <v-alert v-if="settingsError" type="error" dense outlined rounded="lg" class="mt-4 mb-0 text-body-2">
            {{ settingsError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="sourceBusy === 'settings'" @click="settingsOpen = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            depressed
            rounded
            class="text-none"
            :disabled="!settings.name.trim()"
            :loading="sourceBusy === 'settings'"
            @click="saveSettings"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete source -->
    <v-dialog v-model="confirmDelete" max-width="460">
      <v-card v-if="source" rounded="xl">
        <v-card-title class="text-h6">Delete "{{ source.name }}"?</v-card-title>
        <v-card-text class="text-body-2">
          <template v-if="source.type === 'document'">
            Deletes the document and its {{ stat("itemCount") }} sections from
            the bot immediately. This can't be undone.
          </template>
          <template v-else>
            This permanently deletes the source and all {{ stat("itemCount") }}
            of its items. The bot stops using them right away, and this can't be
            undone.
          </template>
          To hide it from the bot for now, pause it instead.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="sourceBusy === 'delete'" @click="confirmDelete = false">
            Cancel
          </v-btn>
          <v-btn color="error" depressed rounded class="text-none" :loading="sourceBusy === 'delete'" @click="deleteSource">
            Delete source
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Bulk delete -->
    <v-dialog v-model="confirmBulkDelete" max-width="440">
      <v-card rounded="xl">
        <v-card-title class="text-h6">
          {{ allSuggested ? `Reject ${selected.length} suggestions?` : `Delete ${selected.length} items?` }}
        </v-card-title>
        <v-card-text class="text-body-2">
          {{
            allSuggested
              ? "The suggested FAQs are deleted. The bot never used them."
              : "The bot stops using them right away. This can't be undone."
          }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text rounded class="text-none" :disabled="bulkBusy === 'delete'" @click="confirmBulkDelete = false">
            Cancel
          </v-btn>
          <v-btn color="error" depressed rounded class="text-none" :loading="bulkBusy === 'delete'" @click="bulk('delete')">
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import FaqDialog from "@/components/knowledge/FaqDialog.vue";
import FaqExtractPanel from "@/components/knowledge/FaqExtractPanel.vue";
import FaqImportDialog from "@/components/knowledge/FaqImportDialog.vue";
import ImportPanel from "@/components/knowledge/ImportPanel.vue";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import ItemEditorDrawer from "@/components/knowledge/ItemEditorDrawer.vue";
import DocumentStatusCard from "@/components/knowledge/DocumentStatusCard.vue";
import {
  ITEM_STATUS,
  KNOWLEDGE_API,
  apiError,
  can,
  formatDate,
  healthOf,
  isBusy,
  isFaqSource,
  isSuggested,
  loadMyPermissions,
  sourceType,
  validityOf,
  workState,
} from "@/utils/knowledge";

const POLL_MS = 3000;

const FILTERS = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "needs_review", label: "Needs review" },
  { value: "archived", label: "Archived" },
];

const BULK_DONE = {
  publish: "published",
  unpublish: "unpublished",
  archive: "archived",
  delete: "deleted",
};

const emptyNote = () => ({
  title: "",
  body: "",
  publish: true,
  failedItemId: null,
  deleteFailed: false,
});

export default {
  name: "KnowledgeSource",

  components: {
    FaqDialog,
    FaqExtractPanel,
    FaqImportDialog,
    ImportPanel,
    ItemEditorDrawer,
    ThingsToKnow,
    DocumentStatusCard,
  },

  data() {
    return {
      FILTERS,
      perms: [],

      source: null,
      loadError: "",
      sourceBusy: null,

      items: [],
      total: 0,
      itemsLoading: false,
      options: { page: 1, itemsPerPage: 20 },
      statusFilter: "",
      categoryFilter: null,
      knownCategories: [],
      search: "",
      searchTimer: null,
      pollTimer: null,

      selected: [],
      bulkBusy: null,
      confirmBulkDelete: false,

      openItemId: null,
      rowBusy: null,

      faqOpen: false,
      faqImportOpen: false,
      extractOpen: false,

      noteOpen: false,
      note: emptyNote(),
      noteSaving: false,
      noteError: "",

      settingsOpen: false,
      settings: { name: "", rootUrl: "", autoPublish: true },
      settingsError: "",

      confirmDelete: false,
    };
  },

  computed: {
    sourceId() {
      return this.$route.params.sourceId;
    },
    type() {
      return sourceType(this.source?.type);
    },
    paused() {
      return this.source?.status === "paused";
    },
    faqSource() {
      return isFaqSource(this.source);
    },
    allSuggested() {
      return this.selected.length > 0 && this.selected.every(isSuggested);
    },
    // Document sections in document order (within the page)
    displayItems() {
      if (this.source?.type !== "document") return this.items;
      const order = (i) => (typeof i.data?.order === "number" ? i.data.order : Infinity);
      return [...this.items].sort((a, b) => order(a) - order(b));
    },
    canBulk() {
      return can(this.perms, "knowledge:publish") || can(this.perms, "knowledge:delete");
    },
    headers() {
      if (this.faqSource) {
        return [
          { text: "Question", value: "title", sortable: false },
          { text: "Category", value: "category", sortable: false },
          { text: "Status", value: "status", sortable: false },
          { text: "", value: "review", sortable: false, align: "end" },
          { text: "Updated", value: "updatedAt", sortable: false },
        ];
      }
      return [
        { text: this.source?.type === "document" ? "Section" : "Title", value: "title", sortable: false },
        { text: "Status", value: "status", sortable: false },
        { text: "Chunks", value: "chunkCount", sortable: false, align: "end" },
        { text: "Updated", value: "updatedAt", sortable: false },
      ];
    },
  },

  watch: {
    options: {
      handler() {
        this.loadItems();
      },
      deep: true,
    },
    statusFilter() {
      this.resetPage();
    },
    categoryFilter() {
      this.resetPage();
    },
    search() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(this.resetPage, 350);
    },
    // The same component is reused when moving to another source
    sourceId(id, old) {
      if (!id || id === old) return;
      this.source = null;
      this.items = [];
      this.total = 0;
      this.openItemId = null;
      this.statusFilter = "";
      this.categoryFilter = null;
      this.knownCategories = [];
      this.search = "";
      this.loadSource();
      this.resetPage();
    },
  },

  created() {
    this.loadSource();
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => {});
  },

  beforeDestroy() {
    clearTimeout(this.pollTimer);
    clearTimeout(this.searchTimer);
  },

  methods: {
    can,
    formatDate,
    isSuggested,
    healthOf,
    validityOf,
    statusOf: (item) => ITEM_STATUS[item.status] || ITEM_STATUS.draft,
    workOf: (item) => workState(item),

    stat(key) {
      return this.source?.stats?.[key] ?? 0;
    },

    async loadSource() {
      this.loadError = "";
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources/${this.sourceId}`);
        this.source = data.data;
        // Arrived from "Add as note instead" on a failed page
        const { note, failed } = this.$route.query;
        if (note !== undefined) {
          this.$router.replace({ query: {} }).catch(() => {});
          if (this.source.type !== "website") this.openNote(String(note), failed || null);
        }
      } catch (err) {
        this.loadError = apiError(err, "Failed to load this source");
      }
    },

    resetPage() {
      this.selected = [];
      if (this.options.page !== 1) this.options = { ...this.options, page: 1 };
      else this.loadItems();
    },

    async loadItems({ quiet = false } = {}) {
      clearTimeout(this.pollTimer);
      if (!quiet) this.itemsLoading = true;
      const { page, itemsPerPage } = this.options;
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources/${this.sourceId}/items`, {
          params: {
            status: this.statusFilter || undefined,
            search: this.search || undefined,
            category: this.categoryFilter || undefined,
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage,
          },
        });
        this.items = data.data.items || [];

        this.total = data.data.total || 0;
        // Categories seen so far feed the filter and the FAQ editors
        const seen = new Set(this.knownCategories);
        this.items.forEach((i) => i.data?.category && seen.add(i.data.category));
        this.knownCategories = [...seen].sort((a, b) => a.localeCompare(b));
        // Keep selections that are still on the page, with fresh data
        const ids = new Set(this.selected.map((s) => s._id));
        this.selected = this.items.filter((i) => ids.has(i._id));
      } catch (err) {
        if (!quiet) this.$toast.error(apiError(err, "Failed to load items"));
      } finally {
        this.itemsLoading = false;
      }
      // Imports and indexing finish in the background
      if (this.items.some(isBusy)) {
        this.pollTimer = setTimeout(() => this.refresh({ quiet: true }), POLL_MS);
      }
    },

    refresh({ quiet = false } = {}) {
      this.loadItems({ quiet });
      this.loadSource();
    },

    onImported() {
      if (this.statusFilter) this.statusFilter = "";
      else this.refresh();
    },

    async togglePause() {
      const pause = !this.paused;
      this.sourceBusy = "pause";
      try {
        await apiClient.post(`${KNOWLEDGE_API}/sources/${this.sourceId}/${pause ? "pause" : "resume"}`);
        this.source.status = pause ? "paused" : "active";
        this.$toast.success(pause ? "Paused. The bot no longer uses this source." : "Resumed");
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to update the source"));
      } finally {
        this.sourceBusy = null;
      }
    },

    openSettings() {
      this.settings = {
        name: this.source.name,
        rootUrl: this.source.config?.rootUrl || "",
        autoPublish: this.source.config?.autoPublish !== false,
      };
      this.settingsError = "";
      this.settingsOpen = true;
    },

    async saveSettings() {
      this.sourceBusy = "settings";
      this.settingsError = "";
      const body = { name: this.settings.name.trim() };
      if (this.source.type === "website") {
        body.config = { rootUrl: this.settings.rootUrl.trim(), autoPublish: this.settings.autoPublish };
      }
      try {
        const { data } = await apiClient.patch(`${KNOWLEDGE_API}/sources/${this.sourceId}`, body);
        this.source = { ...this.source, ...data.data };
        this.settingsOpen = false;
        this.$toast.success("Saved");
      } catch (err) {
        this.settingsError = apiError(err, "Failed to save");
      } finally {
        this.sourceBusy = null;
      }
    },

    async deleteSource() {
      this.sourceBusy = "delete";
      try {
        const { data } = await apiClient.delete(`${KNOWLEDGE_API}/sources/${this.sourceId}`);
        this.$toast.success(`Deleted "${this.source.name}" and ${data.data?.items ?? 0} items`);
        this.$router.push("/dashboard/knowledge");
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to delete the source"));
        this.sourceBusy = null;
      }
    },

    // failedItemId: the page this note replaces ("Add as note instead")
    openNote(title = "", failedItemId = null) {
      this.note = { ...emptyNote(), title, failedItemId, deleteFailed: !!failedItemId };
      this.note.publish = can(this.perms, "knowledge:publish");
      this.noteError = "";
      this.noteOpen = true;
    },

    // A page that can't be imported (blocked, too little text...) becomes a
    // note in a manual source, created if the client has none yet.
    async addAsNote({ title, failedItemId }) {
      this.openItemId = null;
      if (this.source.type === "manual") {
        this.openNote(title, failedItemId);
        return;
      }
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/sources`);
        let target = (data.data || []).find((s) => s.type === "manual");
        if (!target) {
          const created = await apiClient.post(`${KNOWLEDGE_API}/sources`, {
            type: "manual",
            name: "Notes",
          });
          target = created.data.data;
        }
        this.$router.push({
          path: `/dashboard/knowledge/${target._id}`,
          query: { note: title, failed: failedItemId },
        });
      } catch (err) {
        this.$toast.error(apiError(err, "Couldn't open a notes source"));
      }
    },

    async saveNote() {
      this.noteSaving = true;
      this.noteError = "";
      try {
        await apiClient.post(`${KNOWLEDGE_API}/sources/${this.sourceId}/items`, {
          title: this.note.title.trim() || undefined,
          body: this.note.body.trim(),
          publish: this.note.publish,
        });
        this.noteOpen = false;
        this.$toast.success(this.note.publish ? "Note added and publishing" : "Note added as a draft");
        // Only once the note is saved; if this fails the page simply stays
        if (this.note.failedItemId && this.note.deleteFailed && can(this.perms, "knowledge:delete")) {
          try {
            await apiClient.delete(`${KNOWLEDGE_API}/items/${this.note.failedItemId}`);
            this.$toast.success("Deleted the page that failed");
          } catch (err) {
            this.$toast.error(apiError(err, "The note was added, but the failed page couldn't be deleted"));
          }
        }
        this.refresh();
      } catch (err) {
        this.noteError = apiError(err, "Failed to add the note");
      } finally {
        this.noteSaving = false;
      }
    },

    // Approve (publish) or reject (delete) one suggested FAQ from the table
    async review(item, action) {
      this.rowBusy = item._id + action;
      try {
        if (action === "delete") await apiClient.delete(`${KNOWLEDGE_API}/items/${item._id}`);
        else await apiClient.post(`${KNOWLEDGE_API}/items/${item._id}/publish`);
        this.$toast.success(action === "delete" ? "Suggestion rejected" : "Approved");
        this.refresh({ quiet: true });
      } catch (err) {
        this.$toast.error(apiError(err, action === "delete" ? "Failed to reject" : "Failed to approve"));
      } finally {
        this.rowBusy = null;
      }
    },

    async bulk(action) {
      this.bulkBusy = action;
      try {
        const { data } = await apiClient.post(`${KNOWLEDGE_API}/items/bulk`, {
          ids: this.selected.map((i) => i._id),
          action,
        });
        const { done = 0, failed = [] } = data.data || {};
        if (failed.length) {
          this.$toast.warning(
            `${done} ${BULK_DONE[action]}, ${failed.length} failed: ${failed[0].error}`
          );
        } else {
          this.$toast.success(`${done} item${done === 1 ? "" : "s"} ${BULK_DONE[action]}`);
        }
        this.confirmBulkDelete = false;
        this.selected = [];
        this.refresh();
      } catch (err) {
        this.$toast.error(apiError(err, "Bulk action failed"));
      } finally {
        this.bulkBusy = null;
      }
    },
  },
};
</script>

<style scoped>
.search-field {
  max-width: 280px;
}
.category-field {
  max-width: 220px;
}
.bulk-bar {
  background: #eef0ff;
  border-radius: 12px;
}
.items-table >>> tbody tr {
  cursor: pointer;
}
.url {
  max-width: 420px;
}
.min-w-0 {
  min-width: 0;
}
</style>
