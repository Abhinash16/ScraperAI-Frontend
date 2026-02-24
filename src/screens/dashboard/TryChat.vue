<template>
  <div>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="5">
        <v-card class="rounded-xl" outlined elevation="0">
          <!-- HEADER -->
          <v-toolbar color="primary" dark flat>
            <v-avatar size="36" color="white" class="mr-3">
              <v-icon color="primary">mdi-headset</v-icon>
            </v-avatar>

            <div>
              <div class="font-weight-bold">Customer Support</div>
              <div class="text-caption">We usually reply instantly</div>
            </div>

            <v-spacer></v-spacer>

            <v-chip small color="green" text-color="white"> Online </v-chip>
          </v-toolbar>

          <!-- CHAT WINDOW -->
          <v-card-text
            ref="chatWindow"
            style="height: 400px; overflow-y: auto"
            class="grey lighten-5 pa-6"
          >
            <!-- Messages -->
            <v-row
              v-for="(message, index) in messages"
              :key="index"
              :justify="message.isUser ? 'end' : 'start'"
              class="mb-3"
              no-gutters
            >
              <v-col cols="auto" style="max-width: 80%">
                <v-card
                  :color="message.isUser ? 'primary' : 'white'"
                  :dark="message.isUser"
                  class="pa-3 rounded-xl"
                  elevation="1"
                >
                  <div v-html="message.text" class="text-body-2"></div>
                </v-card>
              </v-col>
            </v-row>

            <!-- Typing Indicator -->
            <v-row v-if="loading" justify="start" no-gutters>
              <v-col cols="auto">
                <v-card color="white" class="pa-3 rounded-xl" elevation="1">
                  <v-progress-circular
                    indeterminate
                    size="20"
                    width="2"
                    color="primary"
                  ></v-progress-circular>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <!-- INPUT AREA -->
          <v-card-actions class="pa-4">
            <v-text-field
              v-model="userMessage"
              placeholder="Type your message..."
              outlined
              dense
              rounded
              hide-details
              @keyup.enter="sendMessage"
              :disabled="loading"
              class="flex-grow-1"
            ></v-text-field>

            <v-btn
              color="primary"
              class="ml-3 px-5"
              rounded
              large
              depressed
              @click="sendMessage"
              :loading="loading"
              :disabled="!userMessage.trim() || loading"
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
          { query: messageToSend },
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

<style scoped></style>
