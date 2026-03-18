<template>
  <div>
    <v-chip color="primary" text-color="white" small class="mb-2">
      {{ chats.length }}/{{ total }} Chats Loaded
    </v-chip>

    <div class="d-flex align-center flex-wrap mb-2">
      <!-- Status Filter -->
      <v-card outlined rounded="xl" class="px-2 pa-1 mr-2 d-flex flex-column">
        <div class="text-caption grey--text">Status</div>

        <v-chip-group
          v-model="selectedTicketStatus"
          active-class="primary--text"
          @change="fetchChats(false)"
          row
        >
          <v-chip small outlined value="">All</v-chip>
          <v-chip small outlined color="orange" value="open">Open</v-chip>
          <v-chip small outlined color="green" value="resolved">
            Resolved
          </v-chip>
        </v-chip-group>
      </v-card>

      <!-- Platform Filter -->
      <v-card outlined rounded="xl" class="px-2 pa-1 mr-2 d-flex flex-column">
        <div class="text-caption grey--text">Platform</div>

        <v-chip-group
          v-model="selectedPlatform"
          active-class="primary--text"
          @change="fetchChats(false)"
          row
        >
          <v-chip small outlined value="">All</v-chip>

          <v-chip small outlined color="green" value="whatsapp">
            <v-icon x-small left>mdi-whatsapp</v-icon>
            WhatsApp
          </v-chip>

          <v-chip small outlined color="blue" value="webchat">
            <v-icon x-small left>mdi-web</v-icon>
            Other
          </v-chip>
        </v-chip-group>
      </v-card>
    </div>

    <v-row>
      <!-- Chat List -->
      <v-col cols="12" md="5" class="mt-0">
        <v-card
          ref="chatScroll"
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
                    <div style="position: relative; display: inline-block">
                      <!-- Main Avatar -->
                      <v-avatar
                        size="44"
                        rounded="xl"
                        :color="
                          selectedChatId === chat.chatId
                            ? '#cde6ff'
                            : 'grey lighten-3'
                        "
                      >
                        <v-icon color="black">mdi-account-circle</v-icon>
                      </v-avatar>

                      <!-- Platform Badge -->
                      <v-avatar
                        size="16"
                        :color="chat.platform === 'whatsapp' ? 'green' : 'blue'"
                        style="
                          position: absolute;
                          bottom: -2px;
                          right: -2px;
                          border: 2px solid white;
                        "
                      >
                        <v-icon size="10" color="white">
                          {{
                            chat.platform === "whatsapp"
                              ? "mdi-whatsapp"
                              : "mdi-web"
                          }}
                        </v-icon>
                      </v-avatar>
                    </div>
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
          <div v-if="loadingMore" class="text-center py-2">
            <v-progress-circular indeterminate size="20" color="primary" />
          </div>
          <div
            v-if="!hasMore && chats.length"
            class="text-center grey--text py-2"
          >
            No more chats
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
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true,
    selectedPlatform: "",
    loadingMore: false,
  }),

  created() {
    this.fetchChats();
  },

  mounted() {
    this.$nextTick(() => {
      const container = this.$refs.chatScroll?.$el; // ✅ FIX

      if (container) {
        container.addEventListener("scroll", this.handleScroll);
      }
    });
  },

  beforeDestroy() {
    const container = this.$refs.chatScroll?.$el; // ✅ FIX

    if (container) {
      container.removeEventListener("scroll", this.handleScroll);
    }
  },

  methods: {
    async fetchChats(loadMore = false) {
      if (this.loading || this.loadingMore) return;

      if (!loadMore) {
        this.page = 1;
        this.chats = [];
        this.hasMore = true;
      }

      loadMore ? (this.loadingMore = true) : (this.loading = true);

      try {
        let url = `/chats?page=${this.page}&limit=${this.limit}`;

        if (this.selectedTicketStatus) {
          url += `&ticketStatus=${this.selectedTicketStatus}`;
        }

        // ✅ platform filter
        if (this.selectedPlatform) {
          url += `&platform=${this.selectedPlatform}`;
        }

        const { data } = await apiClient.get(url);

        const newChats = data.data || [];
        const total = data.pagination?.total || 0;

        const existingIds = new Set(this.chats.map((c) => c.chatId));
        const filteredNewChats = newChats.filter(
          (c) => !existingIds.has(c.chatId),
        );

        this.chats = loadMore
          ? [...this.chats, ...filteredNewChats]
          : filteredNewChats;

        this.total = total;
        this.hasMore = this.chats.length < total;

        if (newChats.length) {
          this.page++;
        }
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message || "Error fetching chats.";
        this.snackbar = true;
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },

    loadMoreChats() {
      if (!this.hasMore || this.loadingMore) return;
      this.fetchChats(true);
    },

    handleScroll() {
      const container = this.$refs.chatScroll?.$el; // ✅ FIX

      if (!container || this.loading || this.loadingMore || !this.hasMore)
        return;

      const threshold = 100;

      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - threshold
      ) {
        this.fetchChats(true);
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
