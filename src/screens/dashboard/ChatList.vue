<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
          Conversations
        </h1>
        <div class="text-body-2 grey--text text--darken-1">
          <template v-if="total">
            Showing {{ chats.length }} of {{ total }} conversations
          </template>
          <template v-else
            >Chats from your website widget and WhatsApp</template
          >
        </div>
      </div>
      <v-spacer />
      <v-btn
        outlined
        rounded
        small
        color="primary"
        class="mb-2"
        :loading="loading"
        @click="fetchChats(false)"
      >
        <v-icon left size="16">$refresh-cw</v-icon>
        Refresh
      </v-btn>
    </div>

    <ThingsToKnow feature="chats" />

    <!-- FILTERS -->
    <v-card outlined rounded="lg" class="pa-3 mb-4">
      <div class="d-flex flex-wrap align-center">
        <div class="d-flex align-center mr-6 my-1">
          <span
            class="text-caption font-weight-bold text-uppercase grey--text mr-3"
          >
            Status
          </span>
          <v-btn-toggle
            v-model="selectedTicketStatus"
            mandatory
            dense
            rounded
            color="primary"
            @change="fetchChats(false)"
          >
            <v-btn small value="">All</v-btn>
            <v-btn small value="open">
              <v-icon left size="14" color="orange">$circle-dot</v-icon>
              Open
            </v-btn>
            <v-btn small value="resolved">
              <v-icon left size="14" color="success">$circle-check</v-icon>
              Resolved
            </v-btn>
          </v-btn-toggle>
        </div>

        <div class="d-flex align-center my-1">
          <span
            class="text-caption font-weight-bold text-uppercase grey--text mr-3"
          >
            Channel
          </span>
          <v-btn-toggle
            v-model="selectedPlatform"
            mandatory
            dense
            rounded
            color="primary"
            @change="fetchChats(false)"
          >
            <v-btn small value="">All</v-btn>
            <v-btn small value="whatsapp">
              <v-icon left size="14" color="green">$whatsapp</v-icon>
              WhatsApp
            </v-btn>
            <v-btn small value="webchat">
              <v-icon left size="14" color="blue">$globe</v-icon>
              Website
            </v-btn>
          </v-btn-toggle>
        </div>

        <v-spacer />

        <v-btn
          v-if="filtersActive"
          text
          small
          rounded
          color="error"
          class="my-1"
          @click="clearFilters"
        >
          <v-icon left size="14">$x</v-icon>
          Clear filters
        </v-btn>
      </div>
    </v-card>

    <v-row>
      <!-- CHAT LIST -->
      <v-col cols="12" md="5" lg="4">
        <v-card
          ref="chatScroll"
          outlined
          rounded="lg"
          class="overflow-y-auto"
          max-height="525"
        >
          <v-subheader class="text-caption font-weight-bold text-uppercase">
            {{ listTitle }}
          </v-subheader>
          <v-divider />

          <!-- Loading -->
          <div v-if="loading" class="pa-2">
            <v-skeleton-loader
              v-for="n in 6"
              :key="n"
              type="list-item-avatar-two-line"
            />
          </div>

          <!-- Empty -->
          <div
            v-else-if="chats.length === 0"
            class="d-flex flex-column align-center text-center px-6 py-12"
          >
            <v-avatar color="grey lighten-4" size="64" class="mb-4">
              <v-icon size="28" color="grey">$message-circle-x</v-icon>
            </v-avatar>
            <div
              class="text-subtitle-1 font-weight-bold grey--text text--darken-3"
            >
              No conversations found
            </div>
            <div class="text-body-2 grey--text text--darken-1 mb-4">
              <template v-if="filtersActive">
                Nothing matches these filters. Try a different status or
                channel.
              </template>
              <template v-else>
                When customers message your bot, their chats show up here.
              </template>
            </div>
            <v-btn
              v-if="filtersActive"
              outlined
              rounded
              small
              color="primary"
              @click="clearFilters"
            >
              Clear filters
            </v-btn>
          </div>

          <!-- List -->
          <v-list v-else two-line nav class="py-1">
            <v-list-item
              v-for="chat in chats"
              :key="chat.chatId"
              :input-value="selectedChatId === chat.chatId"
              color="green darken-2"
              class="rounded-lg mb-1"
              :class="{ 'green lighten-5': selectedChatId === chat.chatId }"
              @click="viewChat(chat)"
            >
              <v-list-item-avatar class="overflow-visible">
                <v-badge
                  bottom
                  right
                  overlap
                  bordered
                  :color="platformInfo(chat.platform).color"
                  offset-x="14"
                  offset-y="14"
                >
                  <template #badge>
                    <v-icon size="9" color="white">
                      {{ platformInfo(chat.platform).icon }}
                    </v-icon>
                  </template>
                  <v-avatar
                    size="40"
                    :color="
                      selectedChatId === chat.chatId
                        ? 'green lighten-4'
                        : 'grey lighten-3'
                    "
                  >
                    <v-icon
                      size="20"
                      :color="
                        selectedChatId === chat.chatId
                          ? 'green darken-2'
                          : 'grey darken-2'
                      "
                    >
                      $circle-user
                    </v-icon>
                  </v-avatar>
                </v-badge>
              </v-list-item-avatar>

              <v-list-item-content>
                <v-list-item-title
                  class="font-weight-bold grey--text text--darken-4"
                >
                  {{ chat.chatId }}
                </v-list-item-title>
                <v-list-item-subtitle class="d-flex align-center">
                  <v-icon
                    size="8"
                    :color="getStatusColor(chat.status)"
                    class="mr-1"
                  >
                    $circle
                  </v-icon>
                  <span class="text-capitalize mr-2">{{
                    chat.status || "unknown"
                  }}</span>
                  <span class="grey--text">·</span>
                  <v-icon
                    size="12"
                    class="mx-1"
                    :color="chat.aiEnabled ? 'primary' : 'grey'"
                  >
                    $bot
                  </v-icon>
                  <span>{{ chat.aiEnabled ? "AI on" : "AI off" }}</span>
                </v-list-item-subtitle>
              </v-list-item-content>

              <v-list-item-action class="align-end">
                <v-list-item-action-text
                  v-if="lastActivity(chat)"
                  :title="exactTime(lastActivity(chat))"
                >
                  {{ relativeTime(lastActivity(chat)) }}
                </v-list-item-action-text>
                <v-chip
                  v-if="chat.ticketStatus"
                  x-small
                  label
                  class="text-capitalize font-weight-bold mt-1"
                  :color="
                    chat.ticketStatus === 'resolved' ? 'success' : 'orange'
                  "
                  text-color="white"
                >
                  {{ chat.ticketStatus }}
                </v-chip>
                <v-icon v-else size="16" color="grey lighten-1"
                  >$chevron-right</v-icon
                >
              </v-list-item-action>
            </v-list-item>
          </v-list>

          <!-- Paging -->
          <div v-if="loadingMore" class="d-flex justify-center py-3">
            <v-progress-circular
              indeterminate
              size="20"
              width="2"
              color="primary"
            />
          </div>
          <div
            v-else-if="!loading && !hasMore && chats.length"
            class="text-center text-caption grey--text py-3"
          >
            You've reached the end of the list
          </div>
        </v-card>
      </v-col>

      <!-- CHAT VIEW (desktop) -->
      <v-col cols="12" md="7" lg="8" class="hidden-sm-and-down">
        <chat-view
          v-if="selectedChatId"
          :chatId="selectedChatId"
          :key="selectedChatId"
          :aiEnabled="aiEnabled"
          @statusUpdated="fetchChats"
        />
        <v-card
          v-else
          outlined
          rounded="lg"
          min-height="320"
          class="d-flex flex-column align-center justify-center text-center pa-8 fill-height"
        >
          <v-avatar color="primary lighten-5" size="72" class="mb-4">
            <v-icon size="32" color="primary">$messages-square</v-icon>
          </v-avatar>
          <div
            class="text-subtitle-1 font-weight-bold grey--text text--darken-3"
          >
            Select a conversation
          </div>
          <div class="text-body-2 grey--text text--darken-1">
            Pick a chat on the left to read the messages, reply or switch the AI
            off.
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- CHAT VIEW (mobile) -->
    <v-bottom-sheet v-model="chatViewBottomSheet" scrollable>
      <v-card rounded="t-lg">
        <div class="d-flex align-center pl-4 pr-2 py-2">
          <span class="text-subtitle-2 font-weight-bold text-truncate">
            {{ selectedChatId }}
          </span>
          <v-spacer />
          <v-btn icon aria-label="Close" @click="chatViewBottomSheet = false">
            <v-icon>$x</v-icon>
          </v-btn>
        </div>
        <v-divider />
        <v-card-text class="pa-2">
          <chat-view
            v-if="selectedChatId"
            :chatId="selectedChatId"
            :key="'mobile-' + selectedChatId"
            :aiEnabled="aiEnabled"
            @statusUpdated="fetchChats"
          />
        </v-card-text>
      </v-card>
    </v-bottom-sheet>

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
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import apiClient from "@/service/axios";
import ChatView from "../../screens/dashboard/ChatView.vue";

export default {
  components: {
    ThingsToKnow,
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

  computed: {
    filtersActive() {
      return !!(this.selectedTicketStatus || this.selectedPlatform);
    },

    listTitle() {
      const status =
        { open: "Open", resolved: "Resolved" }[this.selectedTicketStatus] ||
        "All";
      const channel =
        { whatsapp: " · WhatsApp", webchat: " · Website" }[
          this.selectedPlatform
        ] || "";
      return `${status} conversations${channel}`;
    },
  },

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

    platformInfo(platform) {
      return platform === "whatsapp"
        ? { icon: "$whatsapp", color: "green" }
        : { icon: "$globe", color: "blue" };
    },

    clearFilters() {
      this.selectedTicketStatus = "";
      this.selectedPlatform = "";
      this.fetchChats(false);
    },

    lastActivity(chat) {
      return chat.updatedAt || chat.lastMessageAt || chat.createdAt || null;
    },

    relativeTime(value) {
      const diff = Date.now() - new Date(value).getTime();
      if (Number.isNaN(diff)) return "";
      const min = Math.floor(diff / 60000);
      if (min < 1) return "Just now";
      if (min < 60) return `${min}m ago`;
      const hrs = Math.floor(min / 60);
      if (hrs < 24) return `${hrs}h ago`;
      const days = Math.floor(hrs / 24);
      if (days < 7) return `${days}d ago`;
      return new Date(value).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      });
    },

    exactTime(value) {
      return (
        new Date(value).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
          dateStyle: "medium",
          timeStyle: "short",
        }) + " IST"
      );
    },
  },
};
</script>
