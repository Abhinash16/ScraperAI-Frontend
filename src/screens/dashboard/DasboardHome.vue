<template>
  <v-container>
    <v-card>
      <v-card-title>Chat Analytics</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>Active Chats</v-card-title>
              <v-card-text>{{ activeChats }}</v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>Completed Chats</v-card-title>
              <v-card-text>{{ completedChats }}</v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card>
              <v-card-title>Disconnected Chats</v-card-title>
              <v-card-text>{{ disconnectedChats }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      activeChats: 0,
      completedChats: 0,
      disconnectedChats: 0,
    };
  },
  created() {
    this.fetchChatAnalytics();
  },
  methods: {
    // async getCurrentUserInfo() {
    //   try {
    //     const { data } = await apiClient.get("/clients/currentUser");
    //     this.getCurrentUser = data;
    //   } catch {
    //     console.log("something is wrong");
    //   }
    // },
    async fetchChatAnalytics() {
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
        console.error("Error fetching chat analytics:", error);
      }
    },
  },
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
