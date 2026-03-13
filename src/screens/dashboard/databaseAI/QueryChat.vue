<template>
  <v-container fluid class="chat-container">
    <!-- HEADER -->
    <v-row>
      <v-col cols="12">
        <div class="text-h5 font-weight-bold">AI Database Assistant</div>
        <div class="grey--text">Ask questions about your database schema</div>
      </v-col>
    </v-row>

    <!-- CHAT AREA -->
    <div ref="chatArea" class="chat-area mt-4">
      <v-card
        v-for="c in chats"
        :key="c._id"
        class="chat-card pa-4 mb-3"
        elevation="0"
      >
        <!-- USER MESSAGE -->
        <div class="mb-2">
          <v-avatar size="28" class="mr-2 blue lighten-4">
            <v-icon small>mdi-account</v-icon>
          </v-avatar>

          <span class="font-weight-medium">
            {{ c.question }}
          </span>

          <v-btn icon small color="red" @click="deleteChat(c._id)">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </div>

        <!-- AI RESPONSE -->
        <div class="ml-8">
          <!-- PROCESSING -->
          <div v-if="c.status === 'processing'" class="d-flex align-center">
            <v-progress-circular
              indeterminate
              size="18"
              width="2"
              class="mr-2"
            />

            <span class="grey--text"> AI is generating SQL... </span>
          </div>

          <!-- SQL RESPONSE -->
          <div v-if="c.generatedQuery">
            <div class="text-caption grey--text mb-1">Generated SQL</div>

            <pre class="sql-box">{{ c.generatedQuery }}</pre>

            <v-btn
              small
              color="success"
              class="mt-2"
              @click="openRunDialog(c.generatedQuery)"
            >
              Run Query
            </v-btn>
          </div>
        </div>
      </v-card>
    </div>

    <!-- INPUT BAR -->
    <v-card class="chat-input pa-3" elevation="2">
      <v-row align="center">
        <v-col cols="10">
          <v-text-field
            v-model="question"
            label="Ask database..."
            dense
            outlined
            hide-details
            @keyup.enter="ask"
          />
        </v-col>

        <v-col cols="2">
          <v-btn color="primary" block :loading="sending" @click="ask">
            Ask
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-dialog v-model="runDialog" max-width="800">
      <v-card>
        <v-card-title>Run SQL Query</v-card-title>

        <query-runner v-if="currentQuery" :query="currentQuery" />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import QueryRunner from "@/components/QueryRunner.vue";
import apiClient from "@/service/axios";

export default {
  data() {
    return {
      question: "",
      chats: [],
      sending: false,

      pollingIntervals: {},
      runDialog: false,
      runningQuery: false,
      currentQuery: "",

      db: {
        host: "localhost",
        database: "",
        username: "",
        password: "",
      },
    };
  },

  mounted() {
    this.loadChats();
  },

  components: {
    QueryRunner,
  },
  methods: {
    openRunDialog(query) {
      this.currentQuery = query;
      this.runDialog = true;
    },

    getHeaders(rows) {
      if (!rows || !rows.length) return [];

      return Object.keys(rows[0]).map((k) => ({
        text: k,
        value: k,
      }));
    },

    async runQuery() {
      this.runningQuery = true;

      try {
        const res = await apiClient.post("/database-ai/run-query", {
          ...this.db,
          query: this.currentQuery,
        });

        const rows = res.data.rows || [];

        const lastChat = this.chats[this.chats.length - 1];

        if (lastChat) {
          this.$set(lastChat, "results", rows);
        }

        this.runDialog = false;
      } catch (err) {
        console.error("Run query error", err);
        alert(err.response?.data?.message || "Query failed");
      }

      this.runningQuery = false;
    },
    async deleteChat(chatId) {
      if (!confirm("Delete this chat?")) return;

      try {
        await apiClient.delete(`/database-ai/query/${chatId}`);

        this.loadChats();
      } catch (err) {
        console.error("Delete chat error", err);
      }
    },

    async clearChats() {
      if (!confirm("Clear entire chat history?")) return;

      try {
        await apiClient.delete(
          `/database-ai/query/history/${this.$route.params.id}`,
        );

        this.chats = [];
      } catch (err) {
        console.error("Clear chats error", err);
      }
    },
    scrollBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatArea;

        if (el) el.scrollTop = el.scrollHeight;
      });
    },

    async loadChats() {
      try {
        const res = await apiClient.get(
          `/database-ai/query/history/${this.$route.params.id}`,
        );

        this.chats = res.data.chats;

        this.scrollBottom();
      } catch (err) {
        console.error("Chat load error", err);
      }
    },

    async ask() {
      if (!this.question.trim()) return;

      this.sending = true;

      try {
        const res = await apiClient.post("/database-ai/query", {
          projectId: this.$route.params.id,
          question: this.question,
        });

        const chatId = res.data.chatId;

        this.question = "";

        await this.loadChats();

        this.poll(chatId);
      } catch (err) {
        console.error("Ask error", err);
      }

      this.sending = false;
    },

    poll(chatId) {
      const interval = setInterval(async () => {
        try {
          const res = await apiClient.get(`/database-ai/query/${chatId}`);

          if (res.data.status === "completed") {
            clearInterval(interval);

            this.loadChats();
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 2000);

      this.pollingIntervals[chatId] = interval;
    },
  },
};
</script>

<style scoped>
/* chat messages */

.chat-area {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;
}

.chat-card {
  border-radius: 12px;
  background: #fafafa;
}

/* sql block */

.sql-box {
  background: #0f172a;
  color: #e2e8f0;
  padding: 14px;
  border-radius: 8px;
  font-size: 13px;
  overflow-x: auto;
}

/* input */

.chat-input {
  position: sticky;
  bottom: 0;
  border-radius: 12px;
}
</style>
