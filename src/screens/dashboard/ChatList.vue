<template>
  <div>
    <v-chip color="primary" text-color="white" small class="mb-2">
      {{ chats.length }} Chats Found
    </v-chip>

    <v-row no-gutters>
      <v-col cols="12">
        <v-chip-group
          v-model="selectedTicketStatus"
          active-class="primary--text"
          column
          @change="fetchChats"
        >
          <v-chip value="" outlined>All</v-chip>
          <v-chip value="open" outlined color="orange">Open</v-chip>
          <v-chip value="resolved" outlined color="green">Resolved</v-chip>
        </v-chip-group>
      </v-col>
    </v-row>
    <v-row>
      <!-- Chat List -->
      <v-col cols="12" md="5">
        <v-card
          elevation="0"
          outlined
          class="rounded-xl px-4"
          style="max-height: 70vh; overflow-y: auto"
        >
          <div v-if="!loading">
            <div
              v-for="chat in chats"
              :key="chat.chatId"
              @click="viewChat(chat)"
            >
              <v-card
                class="my-2 rounded-lg transition-swing"
                :color="selectedChatId === chat.chatId ? '#eff2fb' : 'white'"
                elevation="0"
                hover
              >
                <v-row align="center" class="pa-4" no-gutters>
                  <v-col cols="auto" class="mr-3">
                    <v-avatar
                      :color="
                        selectedChatId === chat.chatId
                          ? '#cde6ff'
                          : 'grey lighten-3'
                      "
                      size="44"
                      rounded="xl"
                    >
                      <v-icon color="black">mdi-account-circle</v-icon>
                    </v-avatar>
                  </v-col>

                  <v-col>
                    <div class="font-weight-bold text-truncate">
                      {{ chat.chatId }}
                    </div>

                    <div class="grey--text text-caption">
                      Status:
                      <span :class="getStatusColor(chat.status) + '--text'">
                        {{ chat.status }}
                      </span>
                    </div>
                  </v-col>

                  <v-col cols="auto">
                    <v-icon small color="grey"> mdi-chevron-right </v-icon>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <div v-if="chats.length === 0" class="text-center py-10">
              <v-icon large color="grey lighten-1"> mdi-chat-remove </v-icon>
              <div class="grey--text mt-2">No conversations found</div>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Right Side (Empty for now) -->
      <v-col cols="12" md="7" class="hidden-sm-and-down">
        <chat-view
          v-if="selectedChatId"
          :chatId="selectedChatId"
          :key="selectedChatId"
          :aiEnabled="aiEnabled"
          @statusUpdated="fetchChats"
        />
        <div v-else class="text-center grey--text mt-10">
          <v-icon large color="grey lighten-1"> mdi-chat-outline </v-icon>
          <div class="mt-2">Select a chat to view the conversation</div>
        </div>
      </v-col>
    </v-row>

    <!-- Mobile Bottom Sheet -->
    <v-bottom-sheet v-model="chatViewBottomSheet" inset class="p-0 m-0">
      <chat-view
        v-if="selectedChatId"
        :chatId="selectedChatId"
        :key="'mobile-' + selectedChatId"
        :aiEnabled="aiEnabled"
        @statusUpdated="fetchChats"
      />
    </v-bottom-sheet>

    <!-- Loader -->
    <v-overlay :value="loading" opacity="0.3">
      <v-progress-circular indeterminate size="64" color="primary" />
    </v-overlay>

    <!-- Error Snackbar -->
    <v-snackbar v-model="snackbar" color="error" top right>
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ChatView from "../../screens/dashboard/ChatView.vue";

export default {
  components: {
    ChatView,
  },
  data: () => ({
    chats: [],
    loading: false,
    snackbar: false,
    errorMessage: "",
    selectedChatId: null,
    chatViewBottomSheet: false,
    aiEnabled: false, // New flag to track if AI is enabled for the selected chat
    selectedTicketStatus: "",
  }),

  created() {
    this.fetchChats();
  },

  methods: {
    async fetchChats() {
      this.loading = true;

      try {
        let url = "/chats";

        if (this.selectedTicketStatus) {
          url += `?ticketStatus=${this.selectedTicketStatus}`;
        }

        const { data } = await apiClient.get(url);

        this.chats = data.data || [];
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error fetching chats.";
        this.snackbar = true;
      } finally {
        this.loading = false;
      }
    },

    viewChat(chat) {
      // this.$router.push("/dashboard/chat/" + chat.chatId);
      this.selectedChatId = chat.chatId;
      this.aiEnabled = chat.aiEnabled; // Set the AI enabled flag

      // If mobile → open bottom sheet
      if (this.$vuetify.breakpoint.smAndDown) {
        this.chatViewBottomSheet = true;
      }
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
