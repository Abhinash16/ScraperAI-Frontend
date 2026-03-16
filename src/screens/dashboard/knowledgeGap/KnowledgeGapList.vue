<template>
  <v-container fluid>
    <!-- HEADER -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="text-h5 font-weight-bold">Knowledge Gaps</div>
      </v-col>
    </v-row>

    <!-- FILTERS -->
    <v-card outlined class="pa-4 mb-4 rounded-xl">
      <v-row>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            label="Search Question"
            outlined
            clearable
            @keyup.enter="loadGaps"
          />
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="status"
            :items="statuses"
            label="Status"
            outlined
            clearable
          />
        </v-col>

        <v-col cols="12" md="2">
          <v-select
            v-model="limit"
            :items="[10, 20, 50, 100]"
            label="Limit"
            outlined
          />
        </v-col>

        <v-col cols="12" md="3" class="d-flex align-center">
          <v-btn color="primary" @click="loadGaps"> Apply </v-btn>

          <v-btn class="ml-2" @click="resetFilters"> Reset </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- TABLE -->
    <v-card outlined class="rounded-xl">
      <v-data-table
        :headers="headers"
        :items="rows"
        :items-per-page="limit"
        :loading="loading"
        hide-default-footer
        class="elevation-0"
      >
        <template v-slot:[`item.question`]="{ item }">
          <div class="font-weight-medium">
            {{ item.question }}
          </div>
        </template>

        <template v-slot:[`item.status`]="{ item }">
          <v-chip
            small
            :color="item.status === 'pending' ? 'orange' : 'green'"
            dark
          >
            {{ item.status }}
          </v-chip>
        </template>

        <template v-slot:[`item.createdAt`]="{ item }">
          {{ formatDate(item.createdAt) }}
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-btn small text color="primary" @click="openGap(item)">
            View
          </v-btn>
        </template>
      </v-data-table>

      <!-- PAGINATION -->
      <v-divider></v-divider>

      <v-row class="pa-4">
        <v-col cols="6">
          <div class="grey--text text-caption">
            Showing {{ rows.length }} of {{ total }}
          </div>
        </v-col>

        <v-col cols="6" class="text-right">
          <v-btn small :disabled="offset === 0" @click="prevPage"> Prev </v-btn>

          <v-btn small class="ml-2" :disabled="!hasMore" @click="nextPage">
            Next
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
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
