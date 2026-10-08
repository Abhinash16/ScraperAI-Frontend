<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
          Unanswered questions
        </h1>
        <div class="text-body-2 grey--text text--darken-1">
          Questions the bot couldn't answer. Answer once and it learns it as an
          FAQ.
        </div>
      </div>
      <v-spacer />
      <v-btn
        outlined
        small
        color="primary"
        class="mb-2"
        :loading="loading"
        @click="loadGaps"
      >
        <v-icon left size="16">$refresh-cw</v-icon>
        Refresh
      </v-btn>
    </div>

    <ThingsToKnow feature="knowledge-gap" />

    <!-- FILTERS -->
    <v-card outlined rounded="lg" class="px-3 py-2 mb-4">
      <v-row dense align="center">
        <v-col cols="12" md="auto" class="overflow-x-auto">
          <v-btn-toggle
            v-model="status"
            mandatory
            dense
            color="primary"
            @change="applyFilters"
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
        <v-col cols="12" md="5" lg="4">
          <v-text-field
            v-model="search"
            placeholder="Search questions, press Enter"
            prepend-inner-icon="$search"
            outlined
            dense
            clearable
            hide-details
            @keyup.enter="applyFilters"
            @click:clear="clearSearch"
          />
        </v-col>
      </v-row>
    </v-card>

    <div class="d-flex align-center mb-2 px-1">
      <span class="text-caption font-weight-bold text-uppercase grey--text">
        {{ total }} question{{ total === 1 ? "" : "s" }}
      </span>
      <v-spacer />
      <v-btn
        v-if="filtersActive"
        x-small
        text
        color="grey darken-1"
        @click="resetFilters"
      >
        <v-icon left size="12">$x</v-icon>
        Reset filters
      </v-btn>
    </div>

    <!-- LIST -->
    <v-data-iterator
      :items="rows"
      :loading="loading"
      :options.sync="options"
      :server-items-length="total"
      :items-per-page="limit"
      :footer-props="{ itemsPerPageOptions: [10, 20, 50] }"
      item-key="_id"
    >
      <template #loading>
        <v-card v-for="n in 4" :key="n" outlined rounded="lg" class="pa-2 mb-3">
          <v-skeleton-loader type="list-item-avatar-two-line" />
        </v-card>
      </template>

      <template #no-data>
        <v-card
          outlined
          rounded="lg"
          class="d-flex flex-column align-center text-center px-6 py-12 mb-3"
        >
          <v-avatar
            :color="filtersActive ? 'grey lighten-4' : 'green lighten-5'"
            size="64"
            class="mb-4"
          >
            <v-icon size="28" :color="filtersActive ? 'grey' : 'success'">
              {{ filtersActive ? "$search" : "$circle-check" }}
            </v-icon>
          </v-avatar>
          <div
            class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1"
          >
            {{
              filtersActive ? "No questions match" : "No unanswered questions"
            }}
          </div>
          <div class="text-body-2 grey--text text--darken-1 mb-4">
            <template v-if="filtersActive"
              >Try a different status or search.</template
            >
            <template v-else>
              When the bot can't answer something, it shows up here for you to
              answer once.
            </template>
          </div>
          <v-btn
            v-if="filtersActive"
            small
            outlined
            color="primary"
            @click="resetFilters"
          >
            Reset filters
          </v-btn>
        </v-card>
      </template>

      <template #default="{ items }">
        <v-card
          v-for="item in items"
          :key="item._id"
          outlined
          rounded="lg"
          class="d-flex flex-wrap align-center pa-4 mb-3"
          @click="openGap(item)"
        >
          <div class="d-flex align-start flex-grow-1 mr-4 overflow-hidden">
            <v-avatar
              size="40"
              tile
              class="rounded-lg mr-4 flex-shrink-0"
              :color="`${statusTone(item.status).color} lighten-5`"
            >
              <v-icon :color="statusTone(item.status).color" size="20">
                {{ statusTone(item.status).icon }}
              </v-icon>
            </v-avatar>

            <div class="overflow-hidden">
              <div
                class="text-body-2 font-weight-bold grey--text text--darken-4 text-break mb-1"
              >
                {{ item.question }}
              </div>
              <div
                class="d-flex flex-wrap align-center text-caption grey--text text--darken-1"
              >
                <v-chip
                  x-small
                  label
                  :color="statusTone(item.status).chip"
                  text-color="white"
                  class="font-weight-bold text-capitalize mr-3"
                >
                  {{ item.status }}
                </v-chip>
                <span v-if="item.phone" class="d-inline-flex align-center mr-3">
                  <v-icon size="12" class="mr-1">$phone</v-icon>
                  {{ item.phone }}
                </span>
                <span class="d-inline-flex align-center">
                  <v-icon size="12" class="mr-1">$clock</v-icon>
                  {{ formatDate(item.createdAt) }}
                </span>
              </div>
            </div>
          </div>

          <div class="d-flex align-center ml-auto mt-3 mt-sm-0" @click.stop>
            <v-btn
              small
              text
              color="grey darken-1"
              class="mr-2"
              :disabled="item.status === 'deferred'"
              @click="openDeferDialog(item)"
            >
              Defer
            </v-btn>
            <v-btn small depressed color="primary" @click="openGap(item)">
              {{ item.status === "pending" ? "Answer" : "View" }}
              <v-icon right size="14">$arrow-right</v-icon>
            </v-btn>
          </div>
        </v-card>
      </template>

      <template #[`footer.page-text`]>
        <span class="text-caption grey--text"
          >{{ pageStart }} - {{ pageEnd }} of {{ total }}</span
        >
      </template>
    </v-data-iterator>

    <!-- DEFER -->
    <v-dialog v-model="deferDialog" max-width="420" persistent>
      <v-card rounded="lg">
        <v-card-text class="pt-6 text-center">
          <v-avatar color="amber lighten-5" size="56" class="mb-4">
            <v-icon color="amber darken-3" size="26">$clock</v-icon>
          </v-avatar>
          <div class="text-h6 font-weight-bold grey--text text--darken-4 mb-2">
            Defer this question?
          </div>
          <div
            v-if="selectedGap"
            class="text-body-2 grey--text text--darken-3 font-italic mb-2 text-break"
          >
            "{{ selectedGap.question }}"
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            It's marked as <strong>Deferred</strong> and leaves the pending
            list.
          </div>
        </v-card-text>
        <v-card-actions class="justify-center pb-5">
          <v-btn text :disabled="deferLoading" @click="deferDialog = false"
            >Cancel</v-btn
          >
          <v-btn
            color="amber darken-3"
            depressed
            class="white--text"
            :loading="deferLoading"
            @click="confirmDefer"
          >
            Yes, defer
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
        <v-btn text v-bind="attrs" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import apiClient from "@/service/axios";

// "" asks the server for every status (the param is left out)
const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "answered", label: "Answered" },
  { value: "deferred", label: "Deferred" },
];

const STATUS_TONE = {
  pending: {
    color: "amber",
    chip: "amber darken-3",
    icon: "$message-circle-question-mark",
  },
  answered: { color: "green", chip: "success", icon: "$circle-check" },
  deferred: { color: "grey", chip: "grey", icon: "$clock" },
};

export default {
  components: { ThingsToKnow },

  name: "KnowledgeGapList",

  data() {
    return {
      loading: false,

      rows: [],
      total: 0,

      limit: 10,
      offset: 0,

      STATUS_FILTERS,
      search: "",
      status: "",

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
    };
  },

  mounted() {
    this.loadGaps();
  },
  computed: {
    filtersActive() {
      return !!(this.status || this.search);
    },
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
        const res = await apiClient.get(`/knowledge/gaps`, {
          params: {
            limit: this.limit,
            offset: this.offset,
            search: this.search,
            status: this.status || undefined,
          },
        });

        const { rows, total, hasMore } = res.data.data;
        this.rows = rows;
        this.total = total;
        this.hasMore = hasMore;
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
        await apiClient.post(`/knowledge/gaps/${this.selectedGap._id}/defer`);

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
      this.status = "";
      this.applyFilters();
    },

    // Back to the first page; the options watcher reloads when the page changes
    applyFilters() {
      if (this.options.page && this.options.page !== 1) {
        this.options = { ...this.options, page: 1 };
        return;
      }
      this.offset = 0;
      this.loadGaps();
    },

    clearSearch() {
      this.search = "";
      this.applyFilters();
    },

    statusTone(status) {
      return STATUS_TONE[status] || STATUS_TONE.deferred;
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
