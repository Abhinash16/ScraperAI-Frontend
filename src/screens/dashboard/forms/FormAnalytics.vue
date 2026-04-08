<template>
  <div>
    <!-- LOADER -->
    <v-overlay :value="loading" absolute opacity="0.7">
      <div class="d-flex flex-column align-center">
        <v-progress-circular indeterminate size="64" color="primary" />
        <v-subheader class="mt-3">Loading analytics...</v-subheader>
      </div>
    </v-overlay>

    <!-- HEADER -->
    <v-row class="mb-6 align-center">
      <!-- Back Button -->
      <v-col cols="auto">
        <v-btn icon text color="primary" @click="$router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>

      <!-- Title + Subtitle -->
      <v-col>
        <div>
          <h1 class="text-h5 font-weight-bold mb-1">Form Analytics</h1>

          <p class="text-subtitle-2 grey--text mb-0">
            Track submissions, conversions & engagement
          </p>
        </div>
      </v-col>

      <!-- Action Button -->
      <v-col cols="auto">
        <v-btn icon color="primary" @click="fetchAll">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-col>
    </v-row>

    <!-- FILTERS -->
    <v-card class="mt-4 mb-6" outlined rounded="xl">
      <v-card-text>
        <v-row>
          <v-col cols="12" md="3">
            <v-text-field
              v-model="startDate"
              type="date"
              label="Start Date"
              outlined
              dense
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-text-field
              v-model="endDate"
              type="date"
              label="End Date"
              outlined
              dense
            />
          </v-col>

          <v-col cols="12" md="3">
            <v-select
              v-model="selectedStage"
              :items="stages"
              item-text="stage"
              item-value="stageId"
              label="Stage"
              outlined
              dense
              clearable
            />
          </v-col>

          <v-col cols="12" md="3" class="d-flex">
            <v-btn color="primary" block @click="applyFilters">
              <v-icon left>mdi-filter</v-icon>
              Apply
            </v-btn>
          </v-col>
        </v-row>

        <!-- QUICK FILTERS -->
        <div class="d-flex flex-wrap gap-2">
          <v-btn
            v-for="r in quickRanges"
            :key="r.value"
            small
            :outlined="activeRange !== r.value"
            :color="activeRange === r.value ? 'primary' : 'grey'"
            @click="setRange(r.value)"
          >
            {{ r.label }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- KPI -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="overline">Submissions</div>
            <div class="text-h4 font-weight-bold">
              {{ stats.totalSubmissions || 0 }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card success lighten-4">
          <v-card-text>
            <div class="overline">Completed</div>
            <div class="text-h4 font-weight-bold">
              {{ stats.completed || 0 }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card error lighten-4">
          <v-card-text>
            <div class="overline">Drop Off</div>
            <div class="text-h4 font-weight-bold">
              {{ stats.dropOff || 0 }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card info lighten-4">
          <v-card-text>
            <div class="overline">Conversion</div>
            <div class="text-h4 font-weight-bold">
              {{ stats.conversionRate || 0 }}%
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- CHARTS -->
    <v-row>
      <!-- LINE -->
      <v-col cols="12" lg="8">
        <v-card outlined rounded="xl">
          <v-card-title>Submission Trend</v-card-title>
          <v-card-text>
            <apexchart
              v-if="lineSeries.length"
              type="line"
              height="320"
              :options="lineOptions"
              :series="lineSeries"
            />
            <v-skeleton-loader v-else type="image" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- PIE -->
      <v-col cols="12" lg="4">
        <v-card outlined rounded="xl">
          <v-card-title>Stage Distribution</v-card-title>
          <v-card-text>
            <apexchart
              v-if="pieSeries.length"
              type="pie"
              height="320"
              :options="pieOptions"
              :series="pieSeries"
            />
            <v-skeleton-loader v-else type="image" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- BAR -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card outlined rounded="xl">
          <v-card-title>Comments Trend</v-card-title>
          <v-card-text>
            <apexchart
              v-if="barSeries.length"
              type="bar"
              height="320"
              :options="barOptions"
              :series="barSeries"
            />
            <v-skeleton-loader v-else type="image" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    ```
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import VueApexCharts from "vue-apexcharts";

export default {
  components: { apexchart: VueApexCharts },

  data() {
    return {
      loading: false,
      error: null,

      startDate: "",
      endDate: "",
      selectedStage: null,
      activeRange: null,

      quickRanges: [
        { label: "7D", value: 7 },
        { label: "30D", value: 30 },
      ],

      stages: [],
      stats: {},

      lineSeries: [],
      pieSeries: [],
      barSeries: [],

      lineOptions: {
        chart: { type: "line", toolbar: { show: true } },
        stroke: { curve: "smooth", width: 3 },
        xaxis: { type: "datetime" },
        tooltip: { x: { format: "dd MMM yyyy" } },
      },

      pieOptions: {
        labels: [],
        legend: { position: "bottom" },
      },

      barOptions: {
        chart: { type: "bar" },
        xaxis: { type: "datetime" },
      },
    };
  },

  created() {
    this.setRange(30);
  },

  methods: {
    getFormId() {
      return this.$route.params.id;
    },

    getParams() {
      return {
        params: {
          startDate: this.startDate || undefined,
          endDate: this.endDate || undefined,
          stageId: this.selectedStage || undefined,
        },
      };
    },

    async fetchAll() {
      this.loading = true;
      this.error = null;

      try {
        await Promise.all([
          this.fetchStats(),
          this.fetchTrend(),
          this.fetchStages(),
          this.fetchComments(),
        ]);
      } catch (err) {
        console.error("Analytics Error:", err);
        this.error = "Failed to load analytics";
      } finally {
        this.loading = false;
      }
    },

    /* ================= KPI ================= */
    async fetchStats() {
      try {
        const res = await apiClient.get(
          `/formanalytics/analysis/${this.getFormId()}`,
          this.getParams(),
        );

        this.stats = res?.data || {};
      } catch (err) {
        console.error("Stats Error:", err);
        this.stats = {};
      }
    },

    /* ================= LINE CHART ================= */
    async fetchTrend() {
      try {
        const res = await apiClient.get(
          `/formanalytics/trend/${this.getFormId()}`,
          this.getParams(),
        );

        const data = res?.data?.data || [];

        this.lineSeries = [
          {
            name: "Submissions",
            data: data.map((i) => ({
              x: new Date(i.date).getTime(), // ✅ dynamic date from API
              y: i.count,
            })),
          },
        ];

        // 🔥 dynamic x-axis based on API
        this.lineOptions = {
          ...this.lineOptions,
          xaxis: {
            type: "datetime",
          },
        };
      } catch (err) {
        console.error("Trend Error:", err);
        this.lineSeries = [];
      }
    },

    /* ================= PIE ================= */
    async fetchStages() {
      try {
        const res = await apiClient.get(
          `/formanalytics/funnel/${this.getFormId()}`,
          this.getParams(),
        );

        const data = res?.data?.data || [];

        // ✅ filter zero values (optional UX improvement)
        const filtered = data.filter((i) => i.count > 0);

        this.pieOptions = {
          ...this.pieOptions,
          labels: filtered.map((i) => i.stageName),
        };

        this.pieSeries = filtered.map((i) => i.count);
      } catch (err) {
        console.error("Stage Error:", err);
        this.pieSeries = [];
      }
    },

    /* ================= BAR ================= */
    async fetchComments() {
      try {
        const res = await apiClient.get(
          `/formanalytics/comments-trend/${this.getFormId()}`,
          this.getParams(),
        );

        let data = res?.data?.data || [];

        // ✅ sort by date (important if backend order changes)
        data = data.sort((a, b) => new Date(a.date) - new Date(b.date));

        // ✅ map to apex format
        const seriesData = data.map((i) => ({
          x: new Date(i.date).getTime(), // dynamic date from API
          y: i.count,
        }));

        this.barSeries = [
          {
            name: "Comments",
            data: seriesData,
          },
        ];

        // ✅ dynamic x-axis (important)
        this.barOptions = {
          ...this.barOptions,
          xaxis: {
            type: "datetime",
          },
        };
      } catch (err) {
        console.error("Comments Error:", err);
        this.barSeries = [];
      }
    },

    /* ================= FILTER ================= */
    applyFilters() {
      this.activeRange = null;
      this.fetchAll();
    },

    setRange(days) {
      this.activeRange = days;

      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - days);

      this.startDate = start.toISOString().split("T")[0];
      this.endDate = end.toISOString().split("T")[0];

      this.fetchAll();
    },
  },
};
</script>

<style scoped>
.stat-card {
  border-radius: 12px;
  transition: 0.3s;
  border-left: 4px solid #1976d2;
}

.stat-card.success {
  border-left-color: #4caf50;
}

.stat-card.error {
  border-left-color: #f44336;
}

.stat-card.info {
  border-left-color: #2196f3;
}

.gap-2 {
  gap: 8px;
}
</style>
