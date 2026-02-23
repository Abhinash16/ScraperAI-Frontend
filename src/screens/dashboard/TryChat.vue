<template>
  <v-container>
    <v-card outlined max-width="500" class="mx-auto">
      <v-toolbar color="primary" dark flat>
        <v-toolbar-title>Customer Support Chat</v-toolbar-title>
      </v-toolbar>

      <v-card-text class="chat-window" ref="chatWindow">
        <div v-for="(message, index) in messages" :key="index">
          <div
            class="my-4 message"
            :class="{
              'message-user': message.isUser,
              'message-bot': !message.isUser,
            }"
          >
            <div
              class="my-2 message-bubble"
              :class="{
                'user-message': message.isUser,
                'bot-message': !message.isUser,
              }"
            >
              <div v-html="message.text"></div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-text-field
          class="my-auto mr-2"
          v-model="userMessage"
          label="Type your message..."
          outlined
          dense
          @keyup.enter="sendMessage"
          :disabled="loading"
          hide-details="auto"
        ></v-text-field>
        <v-btn
          depressed
          color="primary"
          class="my-auto"
          @click="sendMessage"
          :loading="loading"
          :disabled="loading"
        >
          Send
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      messages: [
        {
          text: "Hello welcome to ontrack! How can I help you today?",
          isUser: false,
        },
      ],
      userMessage: "",
      loading: false,
    };
  },
  mounted() {
    // setTimeout(() => {
    //   this.scrollToBottom();
    // }, 2000);
  },
  methods: {
    async sendMessage() {
      if (!this.userMessage) return;

      // Add the user's message to the chat
      this.messages.push({ text: this.userMessage, isUser: true });
      const messageToSend = this.userMessage;
      this.userMessage = "";
      this.scrollToBottom();

      // Start loading
      this.loading = true;

      try {
        // Send the user's message to the server endpoint
        const response = await apiClient.post(
          "/query/api", // Update with your server's URL
          { query: messageToSend }
        );

        // Add the response from ChatGPT to the chat
        this.messages.push({
          text: response.data.response, // Adjusted to match your server's response structure
          isUser: false,
        });
        this.scrollToBottom();
      } catch (error) {
        console.error("Error sending message:", error);
        this.messages.push({
          text: "Sorry, something went wrong. Please try again later.",
          isUser: false,
        });
      } finally {
        // End loading
        this.loading = false;
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatWindow = this.$refs.chatWindow;
        if (chatWindow) {
          chatWindow.scrollTop = chatWindow.scrollHeight;
        }
      });
    },
  },
};
</script>

<style scoped>
.message {
  max-width: 85%;
  padding: 10px;
  border-radius: 10px;
}
.message-user {
  background-color: rgb(74, 14, 255);
  margin-left: auto;
  color: white;
}

.message-bot {
  background-color: #bbbbbb;
  color: black;
}
.chat-window {
  max-height: 50vh;
  min-height: 50vh;
  overflow: scroll;
}
</style>
