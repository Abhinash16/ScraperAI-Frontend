<template>
  <v-container>
    <v-card class="pa-6 rounded-xl" elevation="0" outlined>
      <div class="text-h5 font-weight-bold mb-4">Knowledge Gap</div>

      <v-divider class="mb-4"></v-divider>

      <v-skeleton-loader v-if="loading" type="article"></v-skeleton-loader>

      <div v-else>
        <div class="mb-4">
          <div class="text-subtitle-2 grey--text">Question</div>
          <div class="text-body-1 font-weight-medium">
            {{ gap.question }}
          </div>
        </div>

        <div class="mb-4">
          <div class="text-subtitle-2 grey--text">Customer Phone</div>
          <div>{{ gap.phone }}</div>
        </div>

        <v-divider class="my-4"></v-divider>

        <div class="text-subtitle-1 font-weight-bold mb-3">
          Conversation Context
        </div>

        <v-card
          v-for="msg in gap.chat_context"
          :key="msg._id"
          class="pa-3 mb-2"
          outlined
        >
          <div class="text-caption grey--text">
            {{ msg.role === "user" ? "Customer" : "AI" }}
          </div>

          <div>{{ msg.message }}</div>
        </v-card>

        <v-divider class="my-6"></v-divider>

        <div class="text-subtitle-1 font-weight-bold mb-3">Answer</div>

        <v-chip v-if="gap.status == 'answered'" class="my-2" color="green"
          >Already Answered</v-chip
        >
        <v-textarea
          :disabled="gap.status == 'answered'"
          v-model="answer"
          outlined
          rows="4"
          placeholder="Write the correct answer that the AI should learn..."
        />

        <v-checkbox
          v-model="notify_user"
          label="Notify customer with this answer"
        />

        <v-btn
          color="primary"
          class="mt-4"
          :loading="saving"
          @click="submitAnswer"
        >
          Save Answer
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  name: "KnowledgeGapView",

  data() {
    return {
      gap: {},
      loading: true,
      saving: false,
      answer: "",
      notify_user: false,
    };
  },

  async mounted() {
    this.loadQuestion();
  },

  methods: {
    async loadQuestion() {
      const id = this.$route.params.id;
      try {
        const res = await apiClient.get(`/content/knowledge-gap/${id}`);

        this.gap = res.data.data;
        this.answer = this.gap.answer;
      } catch (err) {
        console.error(err);
      }

      this.loading = false;
    },

    async submitAnswer() {
      if (!this.answer.trim()) {
        return alert("Answer cannot be empty");
      }

      this.saving = true;

      try {
        await apiClient.post(`/content/knowledge-gap/${this.gap._id}/answer`, {
          answer: this.answer,
          notify_user: this.notify_user,
        });

        alert("Knowledge gap answered successfully");

        this.loadQuestion();
      } catch (err) {
        console.error(err);
        alert("Failed to save answer");
      }

      this.saving = false;
    },
  },
};
</script>
