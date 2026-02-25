<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12">
        <v-row align="center" class="mb-4">
          <v-col cols="12" md="6">
            <div class="text-h5 font-weight-bold">
              <v-icon left color="primary">mdi-chat-processing</v-icon>
              Chat Conversations
            </div>
            <div class="grey--text">Manage and monitor user conversations</div>
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search chat ID..."
              outlined
              dense
              hide-details
            />
          </v-col>
        </v-row>

        <v-chip color="primary" text-color="white" small class="mb-4">
          {{ filteredChats.length }} Chats Found
        </v-chip>

        <v-divider class="mb-6"></v-divider>

        <v-row>
          <v-col cols="12" md="4">
            <v-card
              elevation="0"
              class="rounded-xl"
              style="max-height: 70vh; overflow-y: auto"
            >
              <div v-if="!loading">
                <div
                  v-for="chat in filteredChats"
                  :key="chat.chatId"
                  @click="viewChat(chat.chatId)"
                >
                  <v-card
                    class="mb-3 rounded-lg transition-swing"
                    :color="
                      selectedChatId === chat.chatId
                        ? 'blue lighten-5'
                        : 'white'
                    "
                    :elevation="selectedChatId === chat.chatId ? 2 : 0"
                    outlined
                    hover
                  >
                    <v-row align="center" class="pa-4" no-gutters>
                      <v-col cols="auto" class="mr-3">
                        <v-avatar
                          :color="
                            selectedChatId === chat.chatId
                              ? 'primary'
                              : 'grey lighten-3'
                          "
                          size="45"
                        >
                          <v-icon :dark="selectedChatId === chat.chatId"
                            >mdi-account-circle</v-icon
                          >
                        </v-avatar>
                      </v-col>

                      <v-col>
                        <div class="font-weight-bold text-truncate">
                          {{ chat.chatId }}
                        </div>
                        <div class="grey--text text-caption">
                          Status:
                          <span
                            :class="getStatusColor(chat.userStatus) + '--text'"
                          >
                            {{ chat.userStatus }}
                          </span>
                        </div>
                      </v-col>

                      <v-col cols="auto">
                        <v-icon small color="grey">mdi-chevron-right</v-icon>
                      </v-col>
                    </v-row>
                  </v-card>
                </div>

                <div
                  v-if="filteredChats.length === 0"
                  class="text-center py-10"
                >
                  <v-icon large color="grey lighten-1">mdi-chat-remove</v-icon>
                  <div class="grey--text mt-2">No conversations found</div>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="8">
            <!-- <chat-view
              v-if="selectedChatId"
              :chat-id="selectedChatId"
              :key="selectedChatId"
            />
            <v-card
              v-else
              class="rounded-xl d-flex align-center justify-center grey lighten-4"
              height="500"
              flat
            >
              <div class="text-center grey--text">
                <v-icon size="64" color="grey lighten-2"
                  >mdi-message-text-outline</v-icon
                >
                <div class="text-h6">Select a chat to start messaging</div>
              </div>
            </v-card> -->
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-overlay :value="loading" opacity="0.3">
      <v-progress-circular indeterminate size="64" color="primary" />
    </v-overlay>

    <v-snackbar v-model="snackbar" color="error" top right>
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";
// import ChatView from "@/components/ChatView.vue";

export default {
  // components: { ChatView },
  data: () => ({
    chats: [],
    loading: false,
    search: "",
    snackbar: false,
    errorMessage: "",
    selectedChatId: null,
  }),
  computed: {
    filteredChats() {
      return this.chats.filter((chat) =>
        chat.chatId.toLowerCase().includes(this.search.toLowerCase()),
      );
    },
  },

  created() {
    this.fetchChats();
  },

  methods: {
    async fetchChats() {
      this.loading = true;
      try {
        const { data } = await apiClient.get("/chats");
        this.chats = data.data || [];
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error fetching chats.";
        this.snackbar = true;
      } finally {
        this.loading = false;
      }
    },

    viewChat(chatId) {
      this.$router.push("/dashboard/chat/" + chatId);
      // this.selectedChatId = chatId;
    },

    getStatusColor(status) {
      const colors = {
        active: "success",
        completed: "primary",
        disconnected: "error",
      };
      return colors[status] || "grey";
    },
  },
};
</script>
