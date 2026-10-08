<template>
  <div>
    <!-- HEADER -->
    <div class="mb-4">
      <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
        Knowledge issues
      </h1>
      <div class="text-body-2 grey--text text--darken-1">
        Problems found when knowledge is published and by the daily and weekly checks:
        contradictions, duplicates, private details, expired or out-of-date items, and pages
        that disappeared.
      </div>
    </div>

    <!-- SUMMARY -->
    <v-row v-if="summary" dense class="mb-3">
      <v-col v-for="tile in tiles" :key="tile.severity" cols="12" sm="4" md="3">
        <v-card
          outlined
          rounded="lg"
          class="pa-4 fill-height"
          @click="showOpen(tile.severity)"
        >
          <div class="d-flex align-center">
            <v-avatar
              :color="`${tile.color} lighten-5`"
              size="36"
              class="rounded-lg mr-3"
            >
              <v-icon :color="tile.color" size="18">{{ tile.icon }}</v-icon>
            </v-avatar>
            <div>
              <div class="text-h6 font-weight-bold grey--text text--darken-4">
                {{ tile.value }}
              </div>
              <div class="text-caption grey--text text--darken-1">
                {{ tile.label }}
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <ThingsToKnow feature="knowledge-checks" />

    <!-- FILTERS -->
    <v-card outlined rounded="lg" class="px-3 py-2 mb-4">
      <v-row dense align="center">
        <v-col cols="12" md="auto">
          <v-btn-toggle
            v-model="statusFilter"
            mandatory
            rounded
            dense
            color="primary"
          >
            <v-btn
              v-for="f in STATUS_FILTERS"
              :key="f.value"
              :value="f.value"
              small
            >
              {{ f.label }}
            </v-btn>
          </v-btn-toggle>
        </v-col>
        <v-spacer />
        <v-col cols="6" md="3">
          <v-select
            v-model="severityFilter"
            :items="SEVERITY_ITEMS"
            placeholder="Any severity"
            prepend-inner-icon="$funnel"
            outlined
            dense
            rounded
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="6" md="3">
          <v-select
            v-model="typeFilter"
            :items="TYPE_ITEMS"
            placeholder="Any type"
            prepend-inner-icon="$tag"
            outlined
            dense
            rounded
            hide-details
            clearable
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- ISSUES -->
    <v-data-iterator
      :items="issues"
      :options.sync="options"
      :server-items-length="total"
      :loading="loading"
      :footer-props="{ itemsPerPageOptions: [20, 50, 100] }"
      item-key="_id"
    >
      <template #loading>
        <v-card v-for="n in 4" :key="n" outlined rounded="lg" class="pa-2 mb-3">
          <v-skeleton-loader type="list-item-avatar-three-line" />
        </v-card>
      </template>

      <template #no-data>
        <v-card
          outlined
          rounded="lg"
          class="d-flex flex-column align-center text-center px-6 py-12 mb-3"
        >
          <v-avatar
            :color="
              statusFilter === 'open' ? 'green lighten-5' : 'grey lighten-4'
            "
            size="64"
            class="mb-4"
          >
            <v-icon
              size="28"
              :color="statusFilter === 'open' ? 'success' : 'grey'"
            >
              {{ statusFilter === "open" ? "$shield-check" : "$search" }}
            </v-icon>
          </v-avatar>
          <div
            class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1"
          >
            {{ statusFilter === "open" ? "No open issues" : "No issues match" }}
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            <template v-if="statusFilter === 'open'">
              Everything published passed its checks.
            </template>
            <template v-else
              >Try a different status, severity or type.</template
            >
          </div>
        </v-card>
      </template>

      <template #default="{ items }">
        <v-card
          v-for="issue in items"
          :key="issue._id"
          outlined
          rounded="lg"
          class="d-flex align-start pa-4 mb-3"
          @click="openIssueId = issue._id"
        >
          <v-avatar
            size="40"
            tile
            class="rounded-lg mr-4 flex-shrink-0"
            :color="`${toneOf(issue).color} lighten-5`"
          >
            <v-icon :color="toneOf(issue).color" size="20">{{
              toneOf(issue).icon
            }}</v-icon>
          </v-avatar>

          <div class="flex-grow-1 overflow-hidden">
            <div class="d-flex flex-wrap align-center mb-1">
              <span
                class="text-body-2 font-weight-bold grey--text text--darken-4 mr-2"
              >
                {{ typeLabel(issue) }}
              </span>
              <v-chip
                x-small
                label
                :color="severityOf(issue).color"
                text-color="white"
                class="font-weight-bold mr-1"
              >
                {{ severityOf(issue).label }}
              </v-chip>
              <v-chip
                x-small
                label
                outlined
                :color="statusOf(issue).color"
                class="font-weight-bold mr-1"
              >
                {{ statusOf(issue).label }}
              </v-chip>
              <v-chip
                v-if="issue.heldItem && issue.status === 'open'"
                x-small
                label
                outlined
                color="orange darken-2"
                class="font-weight-bold"
              >
                Item held
              </v-chip>
            </div>

            <div class="text-body-2 grey--text text--darken-3">
              {{ issue.explanation }}
            </div>

            <div
              v-if="itemTitles(issue)"
              class="d-flex align-center text-caption grey--text text--darken-1 mt-2"
            >
              <v-icon size="14" color="grey" class="mr-1 flex-shrink-0"
                >$git-compare</v-icon
              >
              <span class="text-truncate">{{ itemTitles(issue) }}</span>
            </div>

            <div
              v-if="detectedByNote(issue)"
              class="d-flex align-center text-caption grey--text text--darken-1 mt-1"
            >
              <v-icon size="14" color="grey" class="mr-1 flex-shrink-0">$calendar</v-icon>
              {{ detectedByNote(issue) }}
            </div>
          </div>

          <div class="d-flex flex-column align-end ml-3 flex-shrink-0">
            <span class="text-caption grey--text text--darken-1 text-no-wrap">
              {{ formatDate(issue.createdAt) }}
            </span>
            <v-icon size="18" color="grey lighten-1" class="mt-2"
              >$chevron-right</v-icon
            >
          </div>
        </v-card>
      </template>
    </v-data-iterator>

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
  detectedByNote,
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

// Icon and colour per severity
const ISSUE_TONE = {
  blocker: { color: "red", icon: "$octagon-alert" },
  warning: { color: "amber", icon: "$triangle-alert" },
  info: { color: "blue-grey", icon: "$info" },
};

const SEVERITY_ITEMS = Object.entries(SEVERITY).map(([value, s]) => ({
  value,
  text: s.label,
}));
const TYPE_ITEMS = Object.entries(ISSUE_TYPES).map(([value, text]) => ({
  value,
  text,
}));

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
      // Linked from the health card, e.g. ?severity=blocker
      severityFilter: SEVERITY[this.$route.query.severity] ? this.$route.query.severity : null,
      typeFilter: ISSUE_TYPES[this.$route.query.type] ? this.$route.query.type : null,

      openIssueId: this.$route.query.issue || null,
      editItemId: null,
      // Issue to reopen after editing one of its items
      returnToIssueId: null,
    };
  },

  computed: {
    tiles() {
      const s = this.summary || {};
      return [
        {
          severity: "blocker",
          label: `Open blocker${s.blocker === 1 ? "" : "s"}`,
          value: s.blocker || 0,
          icon: "$octagon-alert",
          color: "red",
        },
        {
          severity: "warning",
          label: `Open warning${s.warning === 1 ? "" : "s"}`,
          value: s.warning || 0,
          icon: "$triangle-alert",
          color: "amber",
        },
        {
          severity: "info",
          label: "Open info",
          value: s.info || 0,
          icon: "$info",
          color: "blue-grey",
        },
      ];
    },
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
    detectedByNote,
    severityOf: (issue) => SEVERITY[issue.severity] || SEVERITY.warning,
    statusOf: (issue) => ISSUE_STATUS[issue.status] || ISSUE_STATUS.open,
    typeLabel: (issue) => ISSUE_TYPES[issue.type] || issue.type,

    toneOf: (issue) => ISSUE_TONE[issue.severity] || ISSUE_TONE.warning,

    // Summary tiles filter the list to that severity's open issues
    showOpen(severity) {
      this.statusFilter = "open";
      this.severityFilter = severity;
    },

    itemTitles(issue) {
      return (issue.items || [])
        .map((i) =>
          i
            ? i.title || i.data?.question || i.data?.url || "Untitled"
            : "Deleted item"
        )
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
