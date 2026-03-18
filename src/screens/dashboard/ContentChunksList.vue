<template>
  <div>
    <!-- LOADER -->
    <v-overlay :value="loading" opacity="0.1">
      <v-progress-circular indeterminate size="60" color="primary" />
    </v-overlay>

    <v-card outlined rounded="xl">
      <!-- HEADER -->
      <div class="d-flex justify-space-between align-center pa-4 flex-wrap">
        <div>
          <div class="text-h6 font-weight-bold">Context Chunks</div>
          <div class="text-body-2 grey--text">{{ total }} records</div>
        </div>
        <v-btn
          color="primary"
          depressed
          rounded
          class="text-capitalize font-weight-bold"
          @click="openManualDialog"
        >
          <v-icon left small>mdi-plus</v-icon>
          Add Content Manual
        </v-btn>
      </div>

      <v-divider />

      <!-- FILTERS -->
      <div class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Search content..."
              outlined
              dense
              clearable
              hide-details
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="type"
              :items="types"
              label="Filter by type"
              item-text="label"
              item-value="value"
              outlined
              dense
              clearable
              hide-details
            />
          </v-col>
        </v-row>
      </div>

      <v-divider />

      <!-- TABLE -->
      <v-data-table
        :headers="headers"
        :items="chunks"
        :loading="loading"
        :items-per-page="limit"
        hide-default-footer
        class="elevation-0"
      >
        <template v-slot:item="{ item }">
          <tr>
            <td class="font-weight-medium">
              {{ item.title || "Untitled" }}
            </td>

            <td class="text-caption grey--text">
              {{ truncateUrl(item.url) }}
            </td>

            <td>
              <v-chip small outlined color="primary">
                {{ item.type }}
              </v-chip>
            </td>

            <td style="max-width: 400px" class="text-truncate">
              {{ truncateContent(item.content) }}
            </td>

            <td class="text-caption">
              {{ item.content?.length || 0 }}
            </td>

            <td class="text-caption">
              {{ formatDate(item.createdAt) }}
            </td>

            <td>
              <v-btn icon small @click="viewChunk(item)">
                <v-icon small color="primary">mdi-eye</v-icon>
              </v-btn>

              <v-btn icon small @click="deleteChunk(item._id)">
                <v-icon small color="red">mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>

        <template v-slot:no-data>
          <div class="pa-10 text-center grey--text">No data found</div>
        </template>
      </v-data-table>

      <v-divider />

      <!-- PAGINATION -->
      <div class="d-flex justify-space-between align-center pa-4">
        <div class="text-caption grey--text">
          Page {{ page }} of {{ totalPages }} • {{ total }} total
        </div>

        <div>
          <v-btn small text :disabled="page === 1" @click="prevPage">
            Prev
          </v-btn>

          <v-btn
            small
            text
            class="ml-2"
            :disabled="page === totalPages"
            @click="nextPage"
          >
            Next
          </v-btn>
        </div>
      </div>
    </v-card>

    <!-- VIEW DIALOG -->
    <v-dialog v-model="viewDialog" max-width="700">
      <v-card>
        <v-card-title class="d-flex align-center">
          Chunk Content
          <v-spacer />
          <v-btn icon @click="viewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <div class="mb-2 text-caption grey--text">
            {{ selectedChunk.type }}
          </div>

          <pre class="chunk-box"
            >{{ selectedChunk.content }}
          </pre>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- ADD MANUAL CONTENT DIALOG -->
    <v-dialog v-model="manualDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          Add Manual Content
          <v-spacer />
          <v-btn icon @click="manualDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider />

        <v-card-text>
          <v-text-field
            v-model="manualForm.title"
            label="Title"
            outlined
            dense
            class="mb-3"
          />

          <v-textarea
            v-model="manualForm.content"
            label="Content"
            outlined
            rows="6"
          />
        </v-card-text>

        <v-divider />

        <v-card-actions>
          <v-spacer />
          <v-btn text @click="manualDialog = false">Cancel</v-btn>
          <v-btn
            color="primary"
            @click="submitManualContent"
            :loading="manualLoading"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import debounce from "lodash/debounce";

export default {
  data() {
    return {
      loading: false,
      chunks: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      manualDialog: false,
      manualLoading: false,
      manualForm: {
        title: "",
        content: "",
      },

      search: "",
      type: null,
      types: [
        { label: "All Types", value: "" },
        { label: "FAQ", value: "faq" },
        { label: "Blog", value: "blog" },
        { label: "Docs", value: "docs" },
        { label: "Page", value: "page" },
        { label: "Manual", value: "manual" },
      ],

      viewDialog: false,
      selectedChunk: {},

      debouncedSearch: null,

      headers: [
        { text: "Title", value: "title" },
        { text: "URL", value: "url" },
        { text: "Type", value: "type" },
        { text: "Content", value: "content" },
        { text: "Size", value: "size" },
        { text: "Created", value: "createdAt" },
        { text: "Actions", value: "actions", sortable: false },
      ],
    };
  },

  watch: {
    search() {
      this.debouncedSearch();
    },

    type() {
      this.page = 1;
      this.fetchData();
    },

    page() {
      this.fetchData();
    },
  },

  mounted() {
    this.debouncedSearch = debounce(() => {
      this.page = 1;
      this.fetchData();
    }, 400);

    this.fetchData();
  },

  methods: {
    async fetchData() {
      this.loading = true;
      try {
        let res;

        if (this.search) {
          res = await apiClient.post("/chunks/search", {
            searchText: this.search,
            type: this.type,
            page: this.page,
            limit: this.limit,
          });
        } else {
          res = await apiClient.get("/chunks", {
            params: {
              page: this.page,
              limit: this.limit,
              type: this.type,
            },
          });
        }

        this.chunks = res.data.data || [];
        this.total = res.data.pagination.total || 0;
        this.totalPages = res.data.pagination.totalPages || 1;
      } catch (err) {
        console.error(err);
      }
      this.loading = false;
    },

    deleteChunk(id) {
      if (!confirm("Delete this chunk?")) return;
      apiClient.delete(`/chunks/${id}`).then(() => this.fetchData());
    },

    openManualDialog() {
      this.manualDialog = true;
      this.manualForm = { title: "", content: "" };
    },

    async submitManualContent() {
      if (!this.manualForm.title || !this.manualForm.content) {
        alert("Title and Content are required");
        return;
      }

      this.manualLoading = true;

      try {
        await apiClient.post("/content/scrape/manual", {
          title: this.manualForm.title,
          content: this.manualForm.content,
        });

        this.manualDialog = false;
        this.fetchData(); // refresh table
      } catch (err) {
        console.error(err);
        alert("Failed to add content");
      }

      this.manualLoading = false;
    },

    viewChunk(chunk) {
      this.selectedChunk = chunk;
      this.viewDialog = true;
    },

    nextPage() {
      if (this.page < this.totalPages) this.page++;
    },

    prevPage() {
      if (this.page > 1) this.page--;
    },

    truncateContent(text) {
      if (!text) return "";
      return text.length > 120 ? text.slice(0, 120) + "..." : text;
    },

    truncateUrl(url) {
      if (!url) return "-";
      return url.length > 50 ? url.slice(0, 50) + "..." : url;
    },

    formatDate(date) {
      return new Date(date).toLocaleString();
    },
  },
};
</script>

<style scoped>
.chunk-box {
  background: #f6f8fa;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  max-height: 400px;
  overflow: auto;
}
</style>
