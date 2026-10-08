<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
          Conversations
        </h1>
        <div class="text-body-2 grey--text text--darken-1">
          How many chats your bot handled, how they ended, and where they came
          from.
        </div>
      </div>
      <v-spacer />
      <v-chip
        small
        label
        color="green lighten-5"
        text-color="green darken-2"
        class="font-weight-bold mb-2"
      >
        <v-icon left size="14">{{ platformIcon }}</v-icon>
        {{ platformLabel }}
      </v-chip>
    </div>

    <ThingsToKnow feature="analytics" />

    <!-- FILTERS -->
    <v-card outlined rounded="lg" class="mb-4">
      <div class="d-flex flex-wrap align-center px-4 pt-3 pb-2">
        <span
          class="text-caption font-weight-bold text-uppercase grey--text mr-3 my-1"
          >Range</span
        >
        <v-btn
          v-for="r in quickRanges"
          :key="r.label"
          small
          depressed
          :outlined="activeRange !== r.value"
          :color="activeRange === r.value ? 'success' : 'grey darken-1'"
          class="mr-2 my-1"
          @click="setRange(r.value)"
        >
          {{ r.label }}
        </v-btn>
        <v-chip
          v-if="activeRange === null"
          small
          label
          color="green lighten-5"
          text-color="green darken-2"
          class="font-weight-bold my-1"
        >
          Custom dates
        </v-chip>
      </div>
      <v-divider />
      <v-row dense align="center" class="px-4 py-3">
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="selectedPlatform"
            :items="platformItems"
            label="Channel"
            prepend-inner-icon="$messages-square"
            placeholder="All channels"
            outlined
            dense
            clearable
            hide-details
          />
        </v-col>
        <v-col cols="6" sm="6" md="3">
          <v-text-field
            v-model="startDate"
            label="From"
            type="date"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="6" sm="6" md="3">
          <v-text-field
            v-model="endDate"
            label="To"
            type="date"
            outlined
            dense
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-btn
            block
            depressed
            color="primary"
            class="font-weight-bold"
            :loading="loading"
            @click="applyFilters"
          >
            <v-icon left size="16">$funnel</v-icon>
            Apply
          </v-btn>
        </v-col>
      </v-row>
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="success"
        height="3"
      />
    </v-card>

    <!-- KPI TILES -->
    <v-row dense class="mb-3">
      <v-col v-for="t in kpis" :key="t.label" cols="6" md="3">
        <v-card
          outlined
          rounded="lg"
          class="d-flex align-center pa-4 fill-height"
        >
          <v-avatar
            size="44"
            tile
            :color="`${t.tone} lighten-5`"
            class="rounded-lg mr-3 flex-shrink-0"
          >
            <v-icon size="22" :color="t.tone">{{ t.icon }}</v-icon>
          </v-avatar>
          <div>
            <div class="text-h5 font-weight-bold grey--text text--darken-4">
              {{ t.value }}
            </div>
            <div class="text-caption grey--text text--darken-1">
              {{ t.label }}
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- CHARTS -->
    <v-row dense class="mb-3">
      <v-col cols="12" lg="8">
        <v-card outlined rounded="lg" class="fill-height">
          <div class="d-flex align-center px-4 py-3">
            <v-avatar
              size="32"
              tile
              color="blue lighten-5"
              class="rounded-lg mr-3"
            >
              <v-icon size="16" color="blue">$chart-line</v-icon>
            </v-avatar>
            <span
              class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
              >Active chats trend</span
            >
          </div>
          <v-divider />
          <div class="pa-3">
            <apexchart
              v-if="lineSeries.length > 0"
              type="line"
              height="320"
              :options="lineOptions"
              :series="lineSeries"
            />
            <v-skeleton-loader v-else type="image" />
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card outlined rounded="lg" class="fill-height">
          <div class="d-flex align-center px-4 py-3">
            <v-avatar
              size="32"
              tile
              color="green lighten-5"
              class="rounded-lg mr-3"
            >
              <v-icon size="16" color="green">$chart-pie</v-icon>
            </v-avatar>
            <span
              class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
              >By channel</span
            >
          </div>
          <v-divider />
          <div class="pa-3">
            <apexchart
              v-if="pieSeries.length > 0"
              type="pie"
              height="320"
              :options="pieOptions"
              :series="pieSeries"
            />
            <v-skeleton-loader v-else type="image" />
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined rounded="lg">
      <div class="d-flex align-center px-4 py-3">
        <v-avatar
          size="32"
          tile
          color="indigo lighten-5"
          class="rounded-lg mr-3"
        >
          <v-icon size="16" color="indigo">$messages-square</v-icon>
        </v-avatar>
        <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
          >Messages per day</span
        >
      </div>
      <v-divider />
      <div class="pa-3">
        <apexchart
          v-if="msgSeries.length > 0"
          type="bar"
          height="320"
          :options="msgOptions"
          :series="msgSeries"
        />
        <v-skeleton-loader v-else type="image" />
      </div>
    </v-card>
  </div>
</template>

<script>
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import apiClient from "@/service/axios";
import VueApexCharts from "vue-apexcharts";

const CHANNEL_NAMES = { whatsapp: "WhatsApp", webchat: "Website" };

export default {
  components: { ThingsToKnow, apexchart: VueApexCharts },

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

  computed: {
    // Display names for the channel filter; values stay as the API expects
    platformItems() {
      return this.platforms.map((value) => ({
        value,
        text: CHANNEL_NAMES[value] || value,
      }));
    },
    platformLabel() {
      return this.selectedPlatform
        ? CHANNEL_NAMES[this.selectedPlatform] || this.selectedPlatform
        : "All channels";
    },
    platformIcon() {
      if (this.selectedPlatform === "whatsapp") return "$whatsapp";
      return this.selectedPlatform ? "$globe" : "$messages-square";
    },
    kpis() {
      const s = this.stats;
      const active = s.activeChats || 0;
      const completed = s.completedChats || 0;
      const disconnected = s.disconnectedChats || 0;
      return [
        {
          label: "Total chats",
          value: active + completed + disconnected,
          icon: "$messages-square",
          tone: "indigo",
        },
        {
          label: "Active",
          value: active,
          icon: "$message-circle",
          tone: "blue",
        },
        {
          label: "Completed",
          value: completed,
          icon: "$circle-check",
          tone: "green",
        },
        {
          label: "Disconnected",
          value: disconnected,
          icon: "$unlink",
          tone: "red",
        },
      ];
    },
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
          this.getParams()
        );
        const d = res.data.data || [];

        this.lineSeries = [
          {
            name: "Active Chats",
            data: d.map((i) => ({
              x: new Date(i.date).getTime(), // important
              y: i.count,
            })),
          },
        ];

        this.lineOptions = {
          ...this.lineOptions,
          xaxis: {
            type: "datetime",
          },
        };
      } catch (error) {
        console.error("Trend error:", error);
      }
    },

    async fetchPlatform() {
      try {
        const res = await apiClient.get(
          "/analytics/platform",
          this.getParams()
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
          this.getParams()
        );
        const d = res.data.data || [];

        this.msgSeries = [
          {
            name: "Messages",
            data: d.map((i) => ({
              x: new Date(i.date).getTime(),
              y: i.count,
            })),
          },
        ];

        this.msgOptions = {
          ...this.msgOptions,
          xaxis: {
            type: "datetime",
          },
        };
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
