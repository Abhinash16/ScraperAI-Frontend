<template>
  <div>
    <!-- Full Screen Loader -->
    <v-overlay :value="loading" opacity="0.3">
      <v-progress-circular indeterminate size="70" width="6" color="primary" />
    </v-overlay>

    <!--  Error Snackbar -->
    <v-snackbar v-model="snackbar" color="error" timeout="4000" top right>
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>

    <!--  Stats Cards -->
    <v-row>
      <!-- Active Chats -->
      <v-col cols="12" md="4">
        <v-skeleton-loader v-if="loading" type="card" class="rounded-xl" />
        <v-card v-else elevation="0" class="rounded-xl pa-4 blue lighten-5">
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline mb-4 primary--text font-weight-bold">
                Currently Live
              </div>
              <v-list-item-title class="text-h3 mb-1 font-weight-black">
                {{ activeChats }}
              </v-list-item-title>
              <v-list-item-subtitle class="font-weight-medium">
                Active Chats
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-avatar size="60" color="white" rounded="lg">
              <v-icon color="primary" size="32"> mdi-chat-processing </v-icon>
            </v-avatar>
          </v-list-item>
        </v-card>
      </v-col>

      <!-- Completed Chats -->
      <v-col cols="12" md="4">
        <v-skeleton-loader v-if="loading" type="card" class="rounded-xl" />
        <v-card v-else elevation="0" class="rounded-xl pa-4 green lighten-5">
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline mb-4 success--text font-weight-bold">
                Resolved
              </div>
              <v-list-item-title class="text-h3 mb-1 font-weight-black">
                {{ completedChats }}
              </v-list-item-title>
              <v-list-item-subtitle class="font-weight-medium">
                Completed
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-avatar size="60" color="white" rounded="lg">
              <v-icon color="success" size="32"> mdi-check-circle </v-icon>
            </v-avatar>
          </v-list-item>
        </v-card>
      </v-col>

      <!-- Disconnected Chats -->
      <v-col cols="12" md="4">
        <v-skeleton-loader v-if="loading" type="card" class="rounded-xl" />
        <v-card v-else elevation="0" class="rounded-xl pa-4 red lighten-5">
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline mb-4 error--text font-weight-bold">
                Dropped
              </div>
              <v-list-item-title class="text-h3 mb-1 font-weight-black">
                {{ disconnectedChats }}
              </v-list-item-title>
              <v-list-item-subtitle class="font-weight-medium">
                Disconnected
              </v-list-item-subtitle>
            </v-list-item-content>

            <v-avatar size="60" color="white" rounded="lg">
              <v-icon color="error" size="32"> mdi-chat-alert </v-icon>
            </v-avatar>
          </v-list-item>
        </v-card>
      </v-col>
    </v-row>

    <!-- Placeholder Chart -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card
          outlined
          class="rounded-xl grey lighten-5"
          style="border-style: dashed !important"
        >
          <v-card-text class="text-center py-12">
            <v-icon large color="grey lighten-1"> mdi-chart-areaspline </v-icon>
            <div class="grey--text text--darken-1 mt-2">
              Historical trends will appear here
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      activeChats: 0,
      completedChats: 0,
      disconnectedChats: 0,
      loading: false,
      snackbar: false,
      errorMessage: "",
    };
  },

  created() {
    this.fetchChatAnalytics();
  },

  methods: {
    async fetchChatAnalytics() {
      this.loading = true;
      try {
        const response = await apiClient.get("/chats/analytics");

        const {
          activeChats = 0,
          completedChats = 0,
          disconnectedChats = 0,
        } = response.data;

        this.activeChats = activeChats;
        this.completedChats = completedChats;
        this.disconnectedChats = disconnectedChats;
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Failed to load chat analytics";
        this.snackbar = true;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
