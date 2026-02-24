<template>
  <div>
    <v-row justify="center">
      <v-col cols="12">
        <!-- HEADER -->

        <v-row align="center">
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

        <!-- CHAT LIST CARD -->
        <v-card elevation="0" class="rounded-xl">
          <div>
            <v-chip color="primary" text-color="white" small>
              {{ filteredChats.length }} Chats
            </v-chip>
            <v-spacer></v-spacer>
          </div>

          <v-divider class="my-4"></v-divider>

          <!-- Chat List -->
          <div v-if="!loading">
            <div
              v-for="chat in filteredChats"
              :key="chat.chatId"
              @click="viewChat(chat.chatId)"
            >
              <v-card class="mb-3 rounded-lg" elevation="0" outlined hover>
                <v-row align="center" class="pa-4">
                  <!-- Avatar -->
                  <v-col cols="auto">
                    <v-avatar color="primary lighten-4" size="45">
                      <v-icon color="primary"> mdi-account-circle </v-icon>
                    </v-avatar>
                  </v-col>

                  <!-- Chat Info -->
                  <v-col>
                    <div class="font-weight-bold text-subtitle-1">
                      {{ chat.chatId }}
                    </div>

                    <div class="grey--text text--darken-1 text-caption">
                      Status:
                      <v-chip
                        x-small
                        class="ml-2"
                        :color="getStatusColor(chat.userStatus)"
                        text-color="white"
                      >
                        {{ chat.userStatus }}
                      </v-chip>
                    </div>
                  </v-col>

                  <!-- Arrow -->
                  <v-col cols="auto">
                    <v-icon color="grey"> mdi-chevron-right </v-icon>
                  </v-col>
                </v-row>
              </v-card>
            </div>

            <!-- Empty State -->
            <div v-if="filteredChats.length === 0">
              <div class="text-center py-10">
                <v-icon large color="grey lighten-1"> mdi-chat-remove </v-icon>
                <div class="grey--text mt-2">No chats found</div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Full Screen Loader -->
    <v-overlay :value="loading" opacity="0.3">
      <v-progress-circular indeterminate size="70" width="6" color="primary" />
    </v-overlay>

    <!--  Error Snackbar -->
    <v-snackbar v-model="snackbar" color="error" timeout="4000" top right>
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      chats: [],
      loading: false,
      search: "",
      snackbar: false,
      errorMessage: "",
    };
  },

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
    },

    getStatusColor(status) {
      if (status === "active") return "success";
      if (status === "completed") return "primary";
      if (status === "disconnected") return "error";
      return "grey";
    },
  },
};
</script>
