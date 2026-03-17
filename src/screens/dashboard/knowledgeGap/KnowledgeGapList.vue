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

          <!-- Limit -->
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="limit"
              :items="[10, 20, 50, 100]"
              label="Limit"
              outlined
              dense
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

      <!-- EMPTY STATE -->
      <div v-if="!loading && rows.length === 0" class="pa-10 text-center">
        <v-icon large color="grey lighten-1"> mdi-brain </v-icon>

        <div class="grey--text mt-3">No knowledge gaps found.</div>
      </div>

      <!-- TABLE -->
      <v-simple-table v-else>
        <thead>
          <tr>
            <th>Question</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in rows" :key="item._id">
            <td class="font-weight-medium">
              {{ item.question }}
            </td>

            <td>
              {{ item.phone }}
            </td>

            <td>
              <v-chip
                small
                outlined
                :color="item.status === 'pending' ? 'warning' : 'success'"
              >
                {{ item.status }}
              </v-chip>
            </td>

            <td>
              {{ formatDate(item.createdAt) }}
            </td>

            <td>
              <v-btn
                small
                rounded
                depressed
                color="primary"
                @click="openGap(item)"
              >
                View
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>

      <v-divider></v-divider>

      <!-- PAGINATION -->
      <v-row class="pa-4">
        <v-col cols="6">
          <div class="grey--text text-caption">
            Showing {{ rows.length }} of {{ total }}
          </div>
        </v-col>

        <v-col cols="6" class="text-right">
          <v-btn
            small
            rounded
            depressed
            :disabled="offset === 0"
            @click="prevPage"
          >
            Prev
          </v-btn>

          <v-btn
            small
            rounded
            depressed
            class="ml-2"
            :disabled="!hasMore"
            @click="nextPage"
          >
            Next
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
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

      statuses: [
        { text: "Pending", value: "pending" },
        { text: "Answered", value: "answered" },
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

    nextPage() {
      this.offset += this.limit;
      this.loadGaps();
    },

    prevPage() {
      this.offset -= this.limit;
      if (this.offset < 0) this.offset = 0;
      this.loadGaps();
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
