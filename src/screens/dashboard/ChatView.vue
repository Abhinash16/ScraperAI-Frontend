<template>
  <div>
    <v-row justify="center">
      <v-col cols="12">
        <v-card class="rounded-xl" outlined elevation="0">
          <!-- HEADER -->
          <v-toolbar flat>
            <v-avatar color="#cde6ff" size="44" rounded="xl">
              <v-icon color="black">mdi-account-circle</v-icon>
            </v-avatar>

            <div class="ml-3">
              <div class="d-flex">
                <div class="font-weight-bold">Chat Room: {{ chatId }}</div>
                <v-chip
                  v-if="!loading"
                  small
                  class="ml-2 text-capitalize text-caption"
                  :color="ticketStatus === 'open' ? 'orange' : 'green'"
                  text-color="white"
                >
                  {{ ticketStatus }}
                </v-chip>
              </div>
              <div class="text-caption d-flex align-center">
                <span class="green--text">● Online</span>

                <v-divider vertical class="mx-2"></v-divider>

                <v-icon size="16" class="mr-1" color="primary"
                  >mdi-robot</v-icon
                >

                <span class="mr-2">
                  {{ aiEnabledLocal ? "AI Active" : "AI Disabled" }}
                </span>

                <v-switch
                  v-model="aiEnabledLocal"
                  dense
                  hide-details
                  :loading="aiUpdating"
                  :disabled="aiUpdating"
                  @change="toggleAI"
                ></v-switch>

                <div class="green-text" v-if="showTypingIndicator">
                  typing...
                </div>
              </div>
            </div>

            <v-spacer></v-spacer>

            <!-- Status Update Menu -->
            <v-menu offset-y :disabled="statusUpdating">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on">
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>

              <v-list dense>
                <v-list-item
                  @click="updateTicketStatus('open')"
                  :disabled="statusUpdating"
                >
                  <v-list-item-title> Reopen Ticket </v-list-item-title>
                </v-list-item>

                <v-list-item
                  @click="updateTicketStatus('resolved')"
                  :disabled="statusUpdating"
                >
                  <v-list-item-title class="d-flex align-center">
                    <v-progress-circular
                      v-if="statusUpdating"
                      indeterminate
                      size="16"
                      width="2"
                      class="mr-2"
                    />
                    Mark as Resolved
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-toolbar>

          <v-divider></v-divider>

          <!-- MESSAGES AREA -->
          <v-card-text
            style="height: 380px; overflow-y: auto; background-color: #eff2fb"
            ref="chatMessages"
          >
            <!-- Loader -->
            <div
              v-if="loading"
              class="d-flex justify-center align-center"
              style="height: 100%"
            >
              <v-progress-circular indeterminate color="primary" size="40" />
            </div>

            <!-- Empty State -->
            <div
              v-else-if="messages.length === 0"
              class="text-center grey--text mt-10"
            >
              <v-icon large color="grey lighten-1"> mdi-chat-outline </v-icon>
              <div class="mt-2">No messages yet. Start the conversation!</div>
            </div>

            <!-- Messages -->
            <v-row
              v-for="message in messages"
              :key="message._id || message.timestamp"
              no-gutters
              class="mb-3"
              :justify="message.sender === 'user' ? 'start' : 'end'"
            >
              <v-col cols="auto" style="max-width: 75%">
                <v-card
                  :color="message.sender === 'user' ? 'white' : 'primary'"
                  :dark="message.sender === 'client'"
                  class="pa-3 rounded-xl"
                  elevation="0"
                >
                  <div>
                    <!-- TEXT MESSAGE -->
                    <div
                      v-if="message.type === 'text'"
                      :class="[
                        'text-body-2',
                        message.sender === 'user' ? '' : 'white--text',
                      ]"
                    >
                      {{ message.text }}
                    </div>

                    <!-- IMAGE MESSAGE -->
                    <div v-else-if="message.type === 'image'">
                      <v-img
                        :src="message.mediaUrl"
                        max-width="220"
                        class="rounded-lg"
                        contain
                        @click="openMedia(message.mediaUrl, 'image')"
                        style="cursor: pointer"
                      />

                      <!-- optional caption -->
                      <div v-if="message.caption" class="text-caption mt-1">
                        {{ message.caption }}
                      </div>
                    </div>

                    <!-- VIDEO MESSAGE -->
                    <div
                      v-else-if="message.type === 'video'"
                      class="position-relative"
                    >
                      <video
                        :src="message.mediaUrl"
                        controls
                        playsinline
                        style="
                          max-width: 220px;
                          border-radius: 12px;
                          cursor: pointer;
                        "
                        @click="openMedia(message.mediaUrl, 'video')"
                      ></video>
                    </div>
                    <!-- LOCATION MESSAGE -->
                    <div
                      v-else-if="message.type === 'location'"
                      class="location-card"
                    >
                      <!-- MAP PREVIEW -->
                      <v-img
                        :src="getMapPreview(message.location)"
                        max-width="220"
                        height="140"
                        class="rounded-lg"
                        @click="openMap(message.location)"
                      >
                        <template v-slot:error>
                          <div
                            class="d-flex align-center justify-center grey lighten-2"
                            style="height: 100%"
                          >
                            <v-icon>mdi-map-marker</v-icon>
                          </div>
                        </template>
                      </v-img>

                      <!-- OPEN IN MAP -->
                      <div
                        class="d-flex justify-space-between align-center mt-1"
                      >
                        <span class="caption grey--text"> Location </span>

                        <v-btn
                          x-small
                          text
                          color="primary"
                          @click.stop="openMap(message.location)"
                        >
                          Open
                        </v-btn>
                      </div>
                    </div>

                    <div
                      v-else-if="message.type === 'audio'"
                      class="d-flex align-center"
                    >
                      <v-icon small class="mr-2 primary--text">
                        mdi-microphone
                      </v-icon>

                      <audio controls>
                        <source :src="message.mediaUrl" type="audio/ogg" />
                        Your browser does not support audio
                      </audio>
                    </div>

                    <!-- FALLBACK -->
                    <div v-else class="text-caption grey--text">
                      Unsupported message type
                    </div>
                  </div>
                </v-card>
                <div class="d-flex justify-end">
                  <span class="caption grey--text mr-2">
                    {{ formatTime(message.timestamp) }}
                  </span>
                </div>
              </v-col>
            </v-row>

            <v-row v-if="showTypingIndicator" no-gutters class="mb-3">
              <v-col cols="auto">
                <v-card class="pa-3 rounded-xl">
                  <div class="typing muted-text">typing....</div>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <!-- INPUT AREA -->
          <v-card-actions class="pa-4">
            <v-text-field
              v-model="newMessage"
              :disabled="ticketStatus === 'resolved'"
              @keyup.enter="sendMessage"
              @input="handleTyping"
              placeholder="Type your message..."
              outlined
              dense
              hide-details
              rounded
              class="flex-grow-1"
            />

            <v-btn
              color="primary"
              class="ml-3 px-4"
              large
              depressed
              rounded
              @click="sendMessage"
              :disabled="!newMessage.trim() || ticketStatus === 'resolved'"
            >
              <v-icon left>mdi-send</v-icon>
              Send
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog
      v-model="previewDialog"
      max-width="700"
      :fullscreen="$vuetify.breakpoint.xs"
    >
      <v-card class="rounded-xl d-flex flex-column">
        <!-- HEADER -->
        <div class="pa-4 d-flex align-center">
          <div class="text-subtitle-1 font-weight-bold">
            {{ previewType === "image" ? "Image View" : "Video View" }}
          </div>

          <v-spacer />

          <v-btn icon @click="previewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <!-- CONTENT -->
        <div class="flex-grow-1 d-flex justify-center align-center px-4 pb-2">
          <!-- IMAGE -->
          <v-img
            v-if="previewType === 'image'"
            :src="previewUrl"
            contain
            max-height="75vh"
            class="rounded-lg"
          />

          <!-- VIDEO -->
          <video
            v-else-if="previewType === 'video'"
            :src="previewUrl"
            controls
            style="max-width: 100%; max-height: 75vh; border-radius: 12px"
          ></video>
        </div>

        <!-- ACTION -->
        <div class="d-flex justify-end px-4 pb-4">
          <v-btn
            color="primary"
            small
            rounded
            depressed
            @click="downloadMedia(previewUrl)"
          >
            <v-icon left small>mdi-download</v-icon>
            Download
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- ERROR SNACKBAR -->
    <v-snackbar v-model="snackbar" color="error" top right>
      {{ errorMessage }}

      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
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
    aiEnabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      messages: [],
      newMessage: "",
      socket: null,
      apiKey: "",

      ticketStatus: "",

      chatMongoId: null,

      aiEnabledLocal: false,
      aiUpdating: false,

      loading: false,
      statusUpdating: false,

      snackbar: false,
      errorMessage: "",
      showTypingIndicator: false,
      isTyping: false,
      typingTimeout: null,
      notificationSound: null,

      previewDialog: false,
      previewUrl: "",
      previewType: "", // "image" | "video"
    };
  },

  created() {
    this.notificationSound = new Audio("/message.wav");
    this.initializeChat();
  },

  watch: {
    chatId(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.initializeChat();
      }
    },

    messages() {
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    aiEnabled: {
      immediate: true,
      handler(val) {
        this.aiEnabledLocal = val;
      },
    },
  },

  methods: {
    handleTyping() {
      if (!this.socket) return;

      if (!this.isTyping) {
        this.isTyping = true;

        this.socket.emit("typing");
      }

      clearTimeout(this.typingTimeout);

      this.typingTimeout = setTimeout(() => {
        this.isTyping = false;

        this.socket.emit("stopTyping");
      }, 1200);
    },
    async initializeChat() {
      this.resetChat();
      this.loading = true;

      try {
        await this.fetchChatInfo();
        await this.connectSocket();
      } catch (error) {
        this.showError("Failed to initialize chat");
      } finally {
        this.loading = false;
      }
    },

    async connectSocket() {
      try {
        const response = await apiClient.get("/clients/currentUser");
        this.apiKey = response.data?.data?.apiKey;

        if (!this.apiKey) {
          throw new Error("API key missing");
        }

        if (this.socket) {
          this.socket.disconnect();
        }

        this.socket = io("https://ai-api.on-track.in", {
          transports: ["websocket"],
        });

        this.socket.on("connect", () => {
          this.socket.emit("joinRoom", {
            apiKey: this.apiKey,
            chatId: this.chatId,
            sender: "client",
          });
        });

        this.socket.on("previousMessages", (messages) => {
          this.messages = messages || [];
        });

        this.socket.on("message", (message) => {
          this.showTypingIndicator = false;
          if (message) {
            // play sound only if user message
            if (message.sender === "user" && this.notificationSound) {
              this.notificationSound.currentTime = 0;
              this.notificationSound.play().catch(() => {});
            }
            // if (message.sender === "user" && document.hidden) {
            //   this.notificationSound.currentTime = 0;
            //   this.notificationSound.play().catch(() => {});
            // }
            this.messages.push(message);
          }
        });

        this.socket.on("connect_error", () => {
          this.showError("Socket connection failed");
        });

        this.socket.on("typing", (data) => {
          if (data.sender === "user") {
            this.showTypingIndicator = true;
          }
        });

        this.socket.on("stopTyping", (data) => {
          if (data.sender === "user") {
            this.showTypingIndicator = false;
          }
        });
      } catch (error) {
        this.showError("Unable to connect chat socket");
      }
    },

    async fetchChatInfo() {
      try {
        const { data } = await apiClient.get(`/chats?chatId=${this.chatId}`);

        if (!data?.data?.length) {
          throw new Error("Chat not found");
        }

        const chat = data.data[0];

        this.ticketStatus = chat.ticketStatus || "open";
        this.aiEnabledLocal = chat.aiEnabled || false;

        // important
        this.chatMongoId = chat._id;
      } catch (error) {
        this.showError("Failed to load chat info");
      }
    },

    async updateTicketStatus(status) {
      if (this.statusUpdating) return;

      this.statusUpdating = true;

      try {
        await apiClient.patch(`/chats/${this.chatId}/ticket-status`, {
          ticketStatus: status,
        });

        this.ticketStatus = status;

        this.$emit("statusUpdated", {
          chatId: this.chatId,
          ticketStatus: status,
        });
      } catch (error) {
        this.showError("Failed to update ticket status");
      } finally {
        this.statusUpdating = false;
      }
    },

    async toggleAI() {
      if (this.aiUpdating || !this.chatMongoId) return;

      this.aiUpdating = true;

      try {
        const { data } = await apiClient.patch(
          `/chats/${this.chatMongoId}/ai`,
          { aiEnabled: this.aiEnabledLocal },
        );

        this.aiEnabledLocal = data.data.aiEnabled;
      } catch (error) {
        this.showError("Failed to update AI status");

        // rollback switch
        this.aiEnabledLocal = !this.aiEnabledLocal;
      } finally {
        this.aiUpdating = false;
      }
    },

    sendMessage() {
      if (!this.newMessage.trim()) return;
      if (!this.socket) return;

      this.socket.emit("stopTyping");
      this.isTyping = false;

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

    openMedia(url, type) {
      this.previewUrl = url;
      this.previewType = type;
      this.previewDialog = true;
    },
    downloadMedia(url) {
      const link = document.createElement("a");
      link.href = url;
      link.download = "media";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    formatTime(timestamp) {
      if (!timestamp) return "";

      const date = new Date(timestamp);

      return date.toLocaleString([], {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    getMapPreview(location) {
      if (!location) return "";

      const { latitude, longitude } = location;

      return `https://static-maps.yandex.ru/1.x/?ll=${longitude},${latitude}&size=450,250&z=15&l=map&pt=${longitude},${latitude},pm2rdm`;
    },
    openMap(location) {
      const { latitude, longitude } = location;

      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;

      window.open(url, "_blank");
    },

    pauseAllAudio() {
      const audios = document.querySelectorAll("audio");
      audios.forEach((a) => a.pause());
    },

    showError(message) {
      this.errorMessage = message;
      this.snackbar = true;
      console.error(message);
    },
  },

  beforeDestroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
  },
};
</script>
