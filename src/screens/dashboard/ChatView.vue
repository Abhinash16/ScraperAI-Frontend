<template>
  <v-container>
    <v-card>
      <v-card-title>Chat Room: {{ chatId }}</v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <div class="chat-messages mb-10" ref="chatMessages">
          <div
            v-for="message in messages"
            :key="message._id"
            :class="['chat-message', message.sender]"
          >
            {{ message.message }}
          </div>
        </div>
        <div class="chat-input">
          <v-text-field
            @keyup.enter="sendMessage"
            v-model="newMessage"
            label="Type your message..."
            outlined
            hide-details
            dense
            class="mr-4"
          ></v-text-field>
          <v-btn small fab @click="sendMessage" color="primary">
            <v-icon>mdi-send</v-icon>
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { io } from "socket.io-client";
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      chatId: this.$route.params.chatId,
      messages: [],
      newMessage: "",
      socket: null,
      apiKey: "",
      status: "",
    };
  },
  created() {
    this.connectSocket();
  },
  methods: {
    async connectSocket() {
      const { data } = await apiClient.get("/clients/currentUser");
      this.apiKey = data.apiKey;
      this.socket = io("http://localhost:3000");

      this.socket.on("connect", () => {
        this.socket.emit("joinRoom", {
          apiKey: this.apiKey,
          chatId: this.chatId,
          sender: "client",
        });
      });

      this.socket.on("message", (message) => {
        this.messages.push(message);
        this.scrollToBottom();
      });

      this.socket.on("previousMessages", (messages) => {
        this.messages = messages;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      });
    },

    sendMessage() {
      if (this.newMessage.trim() === "") return;
      const message = {
        apiKey: this.apiKey,
        chatId: this.chatId,
        sender: "client", // Change this to "user" if the message is from the user
        message: this.newMessage,
      };
      this.socket.emit("sendMessage", message);
      this.newMessage = "";
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    scrollToBottom() {
      const chatMessages = this.$refs.chatMessages;
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>

<style scoped>
.chat-messages {
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow: auto;
}

.chat-message {
  max-width: 70%;
  display: inline-block;
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  background-color: #f1f1f1; /* Adjust background color as needed */
  word-wrap: break-word;
}
.chat-message.client {
  align-self: flex-end; /* Adjust alignment for the receiver */
  background-color: #450dee; /* Different background for receiver */
  color: white;
}
.chat-message.user {
  align-self: flex-start; /* Adjust alignment for the sender */
  background-color: #fafafa; /* Different background for sender */
}
.chat-input {
  display: flex;
}
</style>
