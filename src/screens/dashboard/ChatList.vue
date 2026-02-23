<template>
  <v-container>
    <v-card>
      <v-card-title> Chat List </v-card-title>
      <v-card-text>
        <v-list>
          <v-list-item
            v-for="chat in chats"
            :key="chat.chatId"
            @click="viewChat(chat.chatId)"
          >
            <v-list-item-content>
              <v-list-item-title>{{ chat.chatId }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ chat.userStatus }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      chats: [],
    };
  },
  created() {
    this.fetchChats();
  },
  methods: {
    async fetchChats() {
      try {
        const response = await apiClient.get("/chats");
        this.chats = response.data;
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    },
    viewChat(chatId) {
      this.$router.push({ path: "/dashboard/chat/" + chatId }); // Assuming you have a route for chat detail
    },
  },
};
</script>

<style scoped>
/* Add any custom styles here */
</style>
