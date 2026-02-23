<template>
  <v-container>
    <v-card max-height="80vh" style="overflow: scroll">
      <v-card-title> Chat ({{ chatId }}) </v-card-title>
      <v-container>
        <div v-for="chat in chats" :key="chat.chatId">
          <div class="message" :class="'message-' + chat.sentBy">
            {{ chat.message }}
            <div v-if="chat.sentBy == 'ChatGpt'">
              <v-icon small>mdi-robot</v-icon>
            </div>
          </div>
        </div>
      </v-container>
    </v-card>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      chatResponse: [],
      chats: [],
      chatId: "",
    };
  },
  created() {
    this.chatId = this.$route.params.chatId;
    this.fetchChats();
  },
  methods: {
    async fetchChats() {
      try {
        const response = await apiClient.get("/chat/" + this.chatId);
        this.chatResponse = response.data;
        this.chats = this.chatResponse.chatDetails
          ? this.chatResponse.chatDetails
          : [];
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
.message {
  max-width: 70%;
  padding: 15px;
  border-radius: 10px;
  margin: 10px 0px;
}
.message-User {
  margin-left: 0;
  background: rgb(247, 221, 221);
}
.message-ChatGpt {
  margin-left: auto;
  background: rgb(205, 223, 255);
}
/* Add any custom styles here */
</style>
