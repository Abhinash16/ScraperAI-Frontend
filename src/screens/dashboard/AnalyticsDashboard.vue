<template>
  <div>
    <!-- LOADER OVERLAY -->
    <v-overlay :value="loading" absolute opacity="0.7">
      <div class="d-flex flex-column align-center">
        <v-progress-circular indeterminate size="64" color="primary" />
        <v-subheader class="mt-4">Loading analytics...</v-subheader>
      </div>
    </v-overlay>

    <!-- HEADER -->
    <v-row>
      <v-col cols="12">
        <v-card elevation="0" class="pa-6 rounded-xl hero-card">
          <div class="d-flex align-center justify-space-between flex-wrap">
            <div>
              <div class="text-h5 font-weight-bold">Chat Analytics</div>

              <div class="grey--text mt-1">
                Insights into conversations & engagement
              </div>
            </div>

            <v-chip outlined color="primary">
              {{ selectedPlatform || "All Platforms" }}
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- FILTERS SECTION -->
    <v-card class="mb-8 mt-4" rounded="xl" outlined>
      <v-card-text>
        <v-row>
          <!-- Platform Select -->
          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="selectedPlatform"
              :items="platforms"
              label="Platform"
              outlined
              dense
              clearable
            />
          </v-col>

          <!-- Start Date -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="startDate"
              label="Start Date"
              type="date"
              outlined
              dense
            />
          </v-col>

          <!-- End Date -->
          <v-col cols="12" sm="6" md="3">
            <v-text-field
              v-model="endDate"
              label="End Date"
              type="date"
              outlined
              dense
            />
          </v-col>

          <!-- Apply Button -->
          <v-col cols="12" sm="6" md="3" class="d-flex">
            <v-btn
              rounded
              block
              color="primary"
              @click="applyFilters"
              class="font-weight-bold"
            >
              <v-icon left>mdi-filter</v-icon>
              Apply
            </v-btn>
          </v-col>
        </v-row>

        <!-- Quick Range Filters -->
        <div class="d-flex gap-2 flex-wrap">
          <v-btn
            rounded
            v-for="days in quickRanges"
            :key="days.label"
            :outlined="activeRange !== days.value"
            :color="activeRange === days.value ? 'primary' : 'grey'"
            small
            @click="setRange(days.value)"
          >
            {{ days.label }}
          </v-btn>
          <!-- <v-btn
            :outlined="activeRange !== 'today'"
            :color="activeRange === 'today' ? 'primary' : 'grey'"
            small
            @click="setToday"
          >
            Today
          </v-btn> -->
        </div>
      </v-card-text>
    </v-card>

    <!-- KPI CARDS -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" lg="4">
        <v-card class="stat-card stat-active" outlined elevation="0">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <p class="overline font-weight-bold mb-1">Active Chats</p>
                <h2 class="display-2 font-weight-bold">
                  {{ stats.activeChats || 0 }}
                </h2>
              </div>
              <v-icon size="48" class="stat-icon-active"
                >mdi-chat-active</v-icon
              >
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="4">
        <v-card class="stat-card stat-completed" outlined elevation="0">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <p class="overline font-weight-bold mb-1">Completed</p>
                <h2 class="display-2 font-weight-bold">
                  {{ stats.completedChats || 0 }}
                </h2>
              </div>
              <v-icon size="48" class="stat-icon-completed"
                >mdi-check-circle</v-icon
              >
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" lg="4">
        <v-card class="stat-card stat-disconnected" outlined elevation="0">
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <p class="overline font-weight-bold mb-1">Disconnected</p>
                <h2 class="display-2 font-weight-bold">
                  {{ stats.disconnectedChats || 0 }}
                </h2>
              </div>
              <v-icon size="48" class="stat-icon-disconnected"
                >mdi-link-off</v-icon
              >
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- CHARTS SECTION -->
    <v-row class="mb-8">
      <!-- Active Chats Trend -->
      <v-col cols="12" lg="8">
        <v-card outlined rounded="xl" elevation="0">
          <v-card-title>
            <v-icon left>mdi-chart-line</v-icon>
            Active Chats Trend
          </v-card-title>
          <v-card-text>
            <apexchart
              v-if="lineSeries.length > 0"
              type="line"
              height="320"
              :options="lineOptions"
              :series="lineSeries"
            />
            <v-skeleton-loader v-else type="image" />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Platform Distribution -->
      <v-col cols="12" lg="4">
        <v-card outlined rounded="xl" elevation="0">
          <v-card-title>
            <v-icon left>mdi-pie-chart</v-icon>
            Platform Distribution
          </v-card-title>
          <v-card-text>
            <apexchart
              v-if="pieSeries.length > 0"
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

    <!-- Messages Per Day -->
    <v-row>
      <v-col cols="12">
        <v-card outlined rounded="xl" elevation="0">
          <v-card-title>
            <v-icon left>mdi-message-multiple</v-icon>
            Messages Per Day
          </v-card-title>
          <v-card-text>
            <apexchart
              v-if="msgSeries.length > 0"
              type="bar"
              height="320"
              :options="msgOptions"
              :series="msgSeries"
            />
            <v-skeleton-loader v-else type="image" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
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
      activeRange: null,

      selectedPlatform: "",
      startDate: "",
      endDate: "",

      platforms: ["whatsapp", "webchat"],
      quickRanges: [
        { label: "Last 7 Days", value: 7 },
        { label: "Last 30 Days", value: 30 },
      ],

      stats: {
        activeChats: 0,
        completedChats: 0,
        disconnectedChats: 0,
      },

      lineSeries: [],
      lineOptions: {
        chart: {
          type: "line",
          toolbar: { show: true },
          sparkline: { enabled: false },
        },
        stroke: {
          curve: "smooth",
          width: 3,
        },
        colors: ["#1976D2"],
        xaxis: {
          categories: [],
          type: "datetime",
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          title: { text: "Active Chats" },
        },
        grid: {
          show: true,
          borderColor: "#E0E0E0",
          strokeDashArray: 3,
        },
        tooltip: {
          theme: "light",
          x: { format: "dd MMM yyyy" },
        },
      },

      pieSeries: [],
      pieOptions: {
        chart: { type: "pie" },
        labels: [],
        colors: ["#1976D2", "#43A047", "#FB8C00"],
        legend: {
          position: "bottom",
          offsetY: 10,
        },
        tooltip: { theme: "light" },
      },

      msgSeries: [],
      msgOptions: {
        chart: {
          type: "bar",
          toolbar: { show: true },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: "60%",
            borderRadius: 4,
          },
        },
        colors: ["#1976D2"],
        xaxis: {
          categories: [],
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          title: { text: "Message Count" },
        },
        grid: {
          show: true,
          borderColor: "#E0E0E0",
          strokeDashArray: 3,
        },
        tooltip: { theme: "light" },
      },
    };
  },

  created() {
    this.setRange(30);
  },

  methods: {
    getParams() {
      return {
        params: {
          platform: this.selectedPlatform,
          startDate: this.startDate,
          endDate: this.endDate,
        },
      };
    },

    async fetchAll() {
      this.loading = true;

      try {
        await Promise.all([
          this.fetchStats(),
          this.fetchTrend(),
          this.fetchPlatform(),
          this.fetchMessages(),
        ]);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      try {
        const res = await apiClient.get("/analytics", this.getParams());
        this.stats = res.data.data || this.stats;
      } catch (error) {
        console.error("Stats error:", error);
      }
    },

    async fetchTrend() {
      try {
        const res = await apiClient.get(
          "/analytics/active-trend",
          this.getParams(),
        );
        const d = res.data.data || [];

        this.lineOptions.xaxis.categories = d.map((i) => i.date);
        this.lineSeries = [
          { name: "Active Chats", data: d.map((i) => i.count) },
        ];
      } catch (error) {
        console.error("Trend error:", error);
      }
    },

    async fetchPlatform() {
      try {
        const res = await apiClient.get(
          "/analytics/platform",
          this.getParams(),
        );
        const d = res.data.data || [];

        this.pieOptions.labels = d.map((i) => i._id);
        this.pieSeries = d.map((i) => i.count);
      } catch (error) {
        console.error("Platform error:", error);
      }
    },

    async fetchMessages() {
      try {
        const res = await apiClient.get(
          "/analytics/messages",
          this.getParams(),
        );
        const d = res.data.data || [];

        this.msgOptions.xaxis.categories = d.map((i) => i.date);
        this.msgSeries = [{ name: "Messages", data: d.map((i) => i.count) }];
      } catch (error) {
        console.error("Messages error:", error);
      }
    },

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

    setToday() {
      this.activeRange = "today";
      const today = new Date().toISOString().split("T")[0];
      this.startDate = today;
      this.endDate = today;

      this.fetchAll();
    },
  },
};
</script>

<style scoped>
.hero-card {
  background: linear-gradient(135deg, #f5f7ff, #eef1ff);
}

.stat-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0 !important;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #bdbdbd !important;
}

.stat-active {
  border-left: 4px solid #1976d2;
}

.stat-active .stat-icon-active {
  color: #1976d2;
  opacity: 0.2;
}

.stat-completed {
  border-left: 4px solid #43a047;
}

.stat-completed .stat-icon-completed {
  color: #43a047;
  opacity: 0.2;
}

.stat-disconnected {
  border-left: 4px solid #e53935;
}

.stat-disconnected .stat-icon-disconnected {
  color: #e53935;
  opacity: 0.2;
}

.gap-2 {
  gap: 8px;
}

::v-deep .apexcharts-toolbar {
  right: 0;
  top: -40px;
}

::v-deep .apexcharts-menu {
  right: 0;
  left: auto;
}
</style>
