<template>
  <div>
    <!-- FULL SCREEN LOADER -->
    <v-overlay :value="loading" opacity="0.25">
      <v-progress-circular indeterminate size="70" width="6" color="primary" />
    </v-overlay>

    <v-card outlined rounded="xl">
      <!-- HEADER -->
      <div class="d-flex justify-space-between align-center pa-4 flex-wrap">
        <div>
          <div class="text-h6 font-weight-bold">Knowledge Gaps</div>

          <div class="text-body-2 grey--text">
            {{ total }} unanswered questions detected by AI.
          </div>
        </div>

        <div>
          <v-btn
            color="primary"
            outlined
            rounded
            depressed
            class="mt-2 mt-md-0"
            @click="loadGaps"
          >
            Refresh
          </v-btn>
        </div>
      </div>

      <v-divider></v-divider>

      <!-- FILTERS -->
      <div class="pa-4">
        <v-row dense align="center">
          <!-- Search -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="search"
              label="Search Question"
              outlined
              dense
              clearable
              hide-details
              @keyup.enter="loadGaps"
            />
          </v-col>

          <!-- Status -->
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="status"
              :items="statuses"
              label="Status"
              outlined
              dense
              clearable
              hide-details
            />
          </v-col>

          <!-- Buttons -->
          <v-col cols="12" sm="6" md="4">
            <div class="d-flex flex-wrap gap-2">
              <v-btn color="primary" rounded depressed @click="loadGaps">
                Apply
              </v-btn>

              <v-btn text rounded @click="resetFilters"> Reset </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>

      <v-divider></v-divider>

      <!-- TABLE -->
      <v-data-table
        :headers="headers"
        :items="rows"
        :loading="loading"
        :options.sync="options"
        :server-items-length="total"
        :items-per-page="limit"
        class="elevation-0"
      >
        <!-- Question -->
        <template v-slot:[`item.question`]="{ item }">
          <span class="font-weight-medium">
            {{ item.question }}
          </span>
        </template>

        <!-- Phone -->
        <template v-slot:[`item.phone`]="{ item }">
          {{ item.phone || "-" }}
        </template>

        <!-- Status -->
        <template v-slot:[`item.status`]="{ item }">
          <v-chip
            small
            outlined
            :color="
              item.status === 'pending'
                ? 'warning'
                : item.status === 'answered'
                ? 'success'
                : item.status === 'deferred'
                ? 'grey'
                : 'grey'
            "
          >
            {{ item.status }}
          </v-chip>
        </template>

        <!-- Created -->
        <template v-slot:[`item.createdAt`]="{ item }">
          <span class="text-caption">
            {{ formatDate(item.createdAt) }}
          </span>
        </template>

        <!-- Actions -->
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex align-center">
            <!-- Defer -->
            <v-btn
              small
              rounded
              outlined
              color="warning"
              class="mr-2"
              :disabled="item.status === 'deferred'"
              @click="openDeferDialog(item)"
            >
              Defer
            </v-btn>

            <!-- View -->
            <v-btn
              small
              rounded
              depressed
              color="primary"
              @click="openGap(item)"
            >
              View
            </v-btn>
          </div>
        </template>

        <!-- Empty -->
        <template v-slot:no-data>
          <!-- EMPTY STATE -->
          <div v-if="!loading && rows.length === 0" class="pa-10 text-center">
            <v-icon large color="grey lighten-1"> mdi-brain </v-icon>

            <div class="grey--text mt-3">No knowledge gaps found.</div>
          </div>
        </template>

        <!-- Custom Footer Text -->
        <template v-slot:[`footer.page-text`]>
          <div class="text-caption grey--text">
            {{ pageStart }} - {{ pageEnd }} of {{ total }}
          </div>
        </template>
      </v-data-table>
    </v-card>
    <v-dialog v-model="deferDialog" max-width="420" persistent>
      <v-card rounded="xl">
        <v-card-title class="d-flex align-center">
          <v-icon color="warning" class="mr-2">mdi-alert-outline</v-icon>
          Confirm Action
        </v-card-title>

        <v-card-text class="text-body-2">
          Are you sure you want to mark this knowledge gap as
          <strong>Deferred</strong>?
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn text @click="deferDialog = false">Cancel</v-btn>

          <v-btn
            color="warning"
            depressed
            rounded
            :loading="deferLoading"
            @click="confirmDefer"
          >
            Yes, Defer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="2000"
      top
      right
    >
      {{ snackbar.text }}

      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  name: "KnowledgeGapList",

  data() {
    return {
      loading: false,

      rows: [],
      total: 0,

      limit: 10,
      offset: 0,

      search: "",
      status: null,

      hasMore: false,

      options: {},
      deferDialog: false,
      deferLoading: false,
      selectedGap: null,

      snackbar: {
        show: false,
        text: "",
        color: "success",
      },

      statuses: [
        { text: "Pending", value: "pending" },
        { text: "Answered", value: "answered" },
        { text: "Deferred", value: "deferred" },
      ],

      headers: [
        { text: "Question", value: "question" },
        { text: "Phone", value: "phone" },
        { text: "Status", value: "status" },
        { text: "Created", value: "createdAt" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },

  mounted() {
    this.loadGaps();
  },
  computed: {
    pageStart() {
      return this.total === 0 ? 0 : this.offset + 1;
    },
    pageEnd() {
      return Math.min(this.offset + this.rows.length, this.total);
    },
  },
  watch: {
    options: {
      handler(val) {
        if (!val.page || !val.itemsPerPage) return; // ✅ prevent early trigger

        this.limit = val.itemsPerPage;
        this.offset = (val.page - 1) * this.limit;

        this.loadGaps();
      },
      deep: true,
    },
  },

  methods: {
    async loadGaps() {
      this.loading = true;

      try {
        const res = await apiClient.get(`/content/knowledge-gap`, {
          params: {
            limit: this.limit,
            offset: this.offset,
            search: this.search,
            status: this.status,
          },
        });

        this.rows = res.data.data;
        this.total = res.data.pagination.total;
        this.hasMore = res.data.pagination.hasMore;
      } catch (err) {
        console.error(err);
      }

      this.loading = false;
    },

    openDeferDialog(item) {
      this.selectedGap = item;
      this.deferDialog = true;
    },

    async confirmDefer() {
      if (!this.selectedGap) return;

      this.deferLoading = true;

      try {
        await apiClient.put(
          `/content/knowledge-gap/${this.selectedGap._id}/defer`,
        );

        // ✅ Update UI instantly
        this.selectedGap.status = "deferred";

        // ✅ Success Snackbar
        this.snackbar = {
          show: true,
          text: "Knowledge gap marked as deferred",
          color: "success",
        };

        this.deferDialog = false;
      } catch (err) {
        console.error(err);

        // ❌ Error Snackbar
        this.snackbar = {
          show: true,
          text: "Failed to defer knowledge gap",
          color: "error",
        };
      } finally {
        this.deferLoading = false;
      }
    },

    resetFilters() {
      this.search = "";
      this.status = null;
      this.offset = 0;
      this.loadGaps();
    },

    openGap(item) {
      this.$router.push(`/dashboard/knowledge-gap/${item._id}`);
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString();
    },
  },
};
</script>
