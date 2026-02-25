<template>
  <div>
    <v-row justify="center">
      <v-col cols="12">
        <v-card class="rounded-xl" outlined elevation="0">
          <!-- HEADER -->
          <v-toolbar flat>
            <v-avatar color="#cde6ff" size="44" rounded="xl">
              <v-icon color="primary">mdi-account-circle</v-icon>
            </v-avatar>

            <div class="ml-3">
              <div class="font-weight-bold">Chat Room: {{ chatId }}</div>
              <div class="text-caption green--text">● Online</div>
            </div>

            <v-spacer></v-spacer>

            <v-btn icon>
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </v-toolbar>

          <v-divider></v-divider>

          <!-- MESSAGES AREA -->
          <v-card-text
            style="height: 380px; overflow-y: auto; background-color: #eff2fb"
            ref="chatMessages"
          >
            <!-- Empty State -->
            <div
              v-if="messages.length === 0"
              class="text-center grey--text mt-10"
            >
              <v-icon large color="grey lighten-1"> mdi-chat-outline </v-icon>
              <div class="mt-2">No messages yet. Start the conversation!</div>
            </div>

            <!-- Messages -->
            <v-row
              v-for="message in messages"
              :key="message._id"
              no-gutters
              class="mb-3"
              :justify="message.sender === 'client' ? 'end' : 'start'"
            >
              <v-col cols="auto" style="max-width: 75%">
                <v-card
                  :color="message.sender === 'client' ? 'primary' : 'white'"
                  :dark="message.sender === 'client'"
                  class="pa-3 rounded-xl"
                  elevation="1"
                >
                  <div class="text-body-2">
                    {{ message.message }}
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <!-- INPUT AREA -->
          <v-card-actions class="pa-4">
            <v-text-field
              v-model="newMessage"
              @keyup.enter="sendMessage"
              placeholder="Type your message..."
              outlined
              dense
              hide-details
              rounded
              class="flex-grow-1"
            ></v-text-field>

            <v-btn
              color="primary"
              class="ml-3 px-4"
              large
              @click="sendMessage"
              :disabled="!newMessage.trim()"
              depressed
              rounded
            >
              <v-icon left>mdi-send</v-icon>
              Send
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { io } from "socket.io-client";
import apiClient from "@/service/axios";

export default {
  props: {
    chatId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // chatId: this.$route.params.chatId,
      messages: [],
      newMessage: "",
      socket: null,
      apiKey: "",
    };
  },

  created() {
    this.connectSocket();
  },

  watch: {
    chatId(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.resetChat();
        this.connectSocket();
      }
    },

    messages() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
  },

  // watch: {
  //   messages() {
  //     this.$nextTick(() => {
  //       this.scrollToBottom();
  //     });
  //   },
  // },

  methods: {
    async connectSocket() {
      if (!this.chatId) return;

      try {
        const response = await apiClient.get("/clients/currentUser");
        this.apiKey = response.data.data.apiKey;

        if (!this.apiKey) return;

        if (this.socket) {
          this.socket.disconnect();
        }

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
        });

        this.socket.on("previousMessages", (messages) => {
          this.messages = messages;
        });
      } catch (error) {
        console.error("Socket connection error:", error);
      }
    },

    sendMessage() {
      if (!this.newMessage.trim()) return;

      const message = {
        apiKey: this.apiKey,
        chatId: this.chatId,
        sender: "client",
        message: this.newMessage,
      };

      this.socket.emit("sendMessage", message);
      this.newMessage = "";
    },

    resetChat() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      this.messages = [];
    },

    scrollToBottom() {
      const el = this.$refs.chatMessages;
      if (!el) return;

      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    },
  },

  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>
