<template>
  <div class="issues-page">
    <v-btn text rounded small class="text-none mb-4 px-2" to="/dashboard/knowledge">
      <v-icon small class="mr-1">$arrow-left</v-icon> Knowledge
    </v-btn>

    <!-- Header -->
    <div class="d-flex align-center flex-wrap mb-6">
      <v-avatar size="48" rounded="xl" color="#ffe4e6" class="mr-4">
        <v-icon color="black">$shield-alert</v-icon>
      </v-avatar>
      <div class="mr-4">
        <div class="text-h5 font-weight-bold">Knowledge issues</div>
        <div class="text-body-2 grey--text text--darken-1">
          Problems found when knowledge was published: contradictions,
          duplicates, and private details.
        </div>
      </div>
      <v-spacer />
      <div v-if="summary" class="d-flex my-1">
        <v-chip small :color="summary.blocker ? 'error' : 'grey'" text-color="white" class="mr-2">
          {{ summary.blocker }} blocker{{ summary.blocker === 1 ? "" : "s" }}
        </v-chip>
        <v-chip small :color="summary.warning ? 'amber darken-3' : 'grey'" text-color="white">
          {{ summary.warning }} warning{{ summary.warning === 1 ? "" : "s" }}
        </v-chip>
      </div>
    </div>

    <ThingsToKnow feature="knowledge-checks" />

    <v-card outlined rounded="xl" class="pa-6">
      <div class="d-flex align-center flex-wrap mb-4">
        <v-btn-toggle v-model="statusFilter" mandatory rounded dense color="primary" class="mr-4 my-1">
          <v-btn v-for="f in STATUS_FILTERS" :key="f.value" :value="f.value" small class="text-none">
            {{ f.label }}
          </v-btn>
        </v-btn-toggle>
        <v-select
          v-model="severityFilter"
          :items="SEVERITY_ITEMS"
          placeholder="Any severity"
          outlined
          dense
          hide-details
          clearable
          class="filter-field mr-2 my-1"
        />
        <v-select
          v-model="typeFilter"
          :items="TYPE_ITEMS"
          placeholder="Any type"
          outlined
          dense
          hide-details
          clearable
          class="filter-field my-1"
        />
      </div>

      <v-data-table
        :headers="headers"
        :items="issues"
        :options.sync="options"
        :server-items-length="total"
        :loading="loading"
        :footer-props="{ itemsPerPageOptions: [20, 50, 100] }"
        item-key="_id"
        class="issues-table"
        @click:row="(issue) => (openIssueId = issue._id)"
      >
        <template #[`item.severity`]="{ item }">
          <v-chip x-small :color="severityOf(item).color" text-color="white">
            {{ severityOf(item).label }}
          </v-chip>
        </template>
        <template #[`item.type`]="{ item }">
          <span class="text-no-wrap">{{ typeLabel(item) }}</span>
        </template>
        <template #[`item.explanation`]="{ item }">
          <div class="py-2">
            <div class="explanation">{{ item.explanation }}</div>
            <div class="text-caption grey--text mt-1">
              {{ itemTitles(item) }}
            </div>
          </div>
        </template>
        <template #[`item.status`]="{ item }">
          <v-chip x-small outlined :color="statusOf(item).color">{{ statusOf(item).label }}</v-chip>
          <v-chip v-if="item.heldItem && item.status === 'open'" x-small outlined color="orange darken-2" class="ml-1">
            Item held
          </v-chip>
        </template>
        <template #[`item.createdAt`]="{ item }">
          <span class="text-no-wrap">{{ formatDate(item.createdAt) }}</span>
        </template>
        <template #no-data>
          <div class="py-6 text-body-2 grey--text">
            {{ statusFilter === "open" ? "No open issues. Everything published passed its checks." : "No issues match." }}
          </div>
        </template>
      </v-data-table>
    </v-card>

    <IssueDetailDialog
      :issue-id="openIssueId"
      :permissions="perms"
      @close="openIssueId = null"
      @changed="refresh"
      @edit-item="editItem"
    />

    <ItemEditorDrawer
      :item-id="editItemId"
      :permissions="perms"
      @close="closeItem"
      @changed="refresh"
      @open-issue="showIssue"
    />
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import IssueDetailDialog from "@/components/knowledge/IssueDetailDialog.vue";
import ItemEditorDrawer from "@/components/knowledge/ItemEditorDrawer.vue";
import {
  ISSUE_STATUS,
  ISSUE_TYPES,
  KNOWLEDGE_API,
  SEVERITY,
  apiError,
  formatDate,
  loadIssueSummary,
  loadMyPermissions,
} from "@/utils/knowledge";

const STATUS_FILTERS = [
  { value: "open", label: "Open" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
  { value: "", label: "All" },
];

const SEVERITY_ITEMS = Object.entries(SEVERITY).map(([value, s]) => ({ value, text: s.label }));
const TYPE_ITEMS = Object.entries(ISSUE_TYPES).map(([value, text]) => ({ value, text }));

export default {
  name: "KnowledgeIssues",

  components: { IssueDetailDialog, ItemEditorDrawer, ThingsToKnow },

  data() {
    return {
      STATUS_FILTERS,
      SEVERITY_ITEMS,
      TYPE_ITEMS,
      perms: [],
      summary: null,

      issues: [],
      total: 0,
      loading: false,
      options: { page: 1, itemsPerPage: 20 },
      statusFilter: "open",
      severityFilter: null,
      typeFilter: null,

      openIssueId: this.$route.query.issue || null,
      editItemId: null,
      // Issue to reopen after editing one of its items
      returnToIssueId: null,

      headers: [
        { text: "Severity", value: "severity", sortable: false },
        { text: "Type", value: "type", sortable: false },
        { text: "Problem", value: "explanation", sortable: false },
        { text: "Status", value: "status", sortable: false },
        { text: "Found", value: "createdAt", sortable: false },
      ],
    };
  },

  watch: {
    options: {
      handler() {
        this.loadIssues();
      },
      deep: true,
    },
    statusFilter() {
      this.resetPage();
    },
    severityFilter() {
      this.resetPage();
    },
    typeFilter() {
      this.resetPage();
    },
    openIssueId(id) {
      // Keep the open issue in the URL so it can be linked to
      const query = id ? { issue: id } : {};
      if ((this.$route.query.issue || null) !== (id || null)) {
        this.$router.replace({ query }).catch(() => {});
      }
    },
  },

  created() {
    loadMyPermissions()
      .then((p) => (this.perms = p))
      .catch(() => {});
    this.loadSummary();
  },

  methods: {
    formatDate,
    severityOf: (issue) => SEVERITY[issue.severity] || SEVERITY.warning,
    statusOf: (issue) => ISSUE_STATUS[issue.status] || ISSUE_STATUS.open,
    typeLabel: (issue) => ISSUE_TYPES[issue.type] || issue.type,

    itemTitles(issue) {
      return (issue.items || [])
        .map((i) => (i ? i.title || i.data?.question || i.data?.url || "Untitled" : "Deleted item"))
        .join("  vs  ");
    },

    resetPage() {
      if (this.options.page !== 1) this.options = { ...this.options, page: 1 };
      else this.loadIssues();
    },

    async loadIssues() {
      this.loading = true;
      const { page, itemsPerPage } = this.options;
      try {
        const { data } = await apiClient.get(`${KNOWLEDGE_API}/issues`, {
          params: {
            // An empty status asks the server for every status
            status: this.statusFilter,
            severity: this.severityFilter || undefined,
            type: this.typeFilter || undefined,
            limit: itemsPerPage,
            offset: (page - 1) * itemsPerPage,
          },
        });
        this.issues = data.data.issues || [];
        this.total = data.data.total || 0;
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to load issues"));
      } finally {
        this.loading = false;
      }
    },

    async loadSummary() {
      this.summary = await loadIssueSummary();
    },

    refresh() {
      this.loadIssues();
      this.loadSummary();
    },

    editItem(id) {
      this.returnToIssueId = this.openIssueId;
      this.openIssueId = null;
      this.editItemId = id;
    },

    showIssue(id) {
      this.editItemId = null;
      this.returnToIssueId = null;
      this.openIssueId = id;
    },

    closeItem() {
      this.editItemId = null;
      if (this.returnToIssueId) {
        this.openIssueId = this.returnToIssueId;
        this.returnToIssueId = null;
      }
    },
  },
};
</script>

<style scoped>
.filter-field {
  max-width: 200px;
}
.issues-table >>> tbody tr {
  cursor: pointer;
}
.explanation {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
