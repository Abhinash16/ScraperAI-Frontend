<template>
  <v-container>
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="auto">
        <v-btn icon text color="primary" @click="$router.back()">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
      </v-col>

      <v-col>
        <h1 class="text-h5 font-weight-bold mb-1">Knowledge Gap</h1>
        <p class="text-subtitle-2 grey--text mb-0">
          Improve AI response by filling missing knowledge
        </p>
      </v-col>
    </v-row>

    <!-- Main Card -->
    <v-card outlined rounded="xl" color="grey lighten-4" class="pa-6">
      <v-skeleton-loader v-if="loading" type="article" />

      <div v-else>
        <!-- Question Section -->
        <v-card outlined rounded="xl" class="pa-4 mb-6">
          <v-row>
            <!-- CHIP (comes first on mobile) -->
            <v-col
              cols="12"
              md="2"
              class="d-flex justify-md-end align-start order-1 order-md-2"
            >
              <v-chip
                small
                outlined
                :color="
                  gap.status === 'pending'
                    ? 'warning'
                    : gap.status === 'answered'
                    ? 'success'
                    : gap.status === 'deferred'
                    ? 'grey'
                    : 'grey'
                "
              >
                {{ gap.status }}
              </v-chip>
            </v-col>

            <!-- CONTENT -->
            <v-col cols="12" md="10" class="order-2 order-md-1">
              <div class="text-caption grey--text mb-1">Question</div>

              <div class="text-body-1 font-weight-medium">
                {{ gap.question }}
              </div>

              <div class="mt-4">
                <span class="text-caption grey--text">Customer Phone</span>

                <div class="font-weight-medium">
                  {{ gap.phone }}
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card>

        <!-- Conversation -->
        <div class="mb-6">
          <div class="text-subtitle-1 font-weight-bold mb-4">
            <v-icon small class="mr-2">mdi-message-text-outline</v-icon>
            Conversation Context
          </div>

          <!-- Conversation Context -->
          <div>
            <v-row
              v-for="msg in gap.chat_context"
              :key="msg._id"
              no-gutters
              class="mb-3"
              :justify="msg.role === 'user' ? 'start' : 'end'"
            >
              <v-col cols="auto" style="max-width: 75%">
                <!-- Sender Label with Icon -->
                <div class="d-flex align-center mb-1">
                  <v-icon x-small color="grey" class="mr-1">
                    {{ msg.role === "user" ? "mdi-account" : "mdi-robot" }}
                  </v-icon>

                  <span class="text-caption grey--text">
                    {{ msg.role === "user" ? "Customer" : "AI" }}
                  </span>
                </div>
                <!-- Message Bubble -->
                <v-card
                  class="pa-3 rounded-xl"
                  elevation="0"
                  :color="msg.role === 'user' ? 'grey ' : 'primary'"
                  :dark="msg.role !== 'user'"
                >
                  <!-- Message Text -->
                  <div
                    :class="[
                      'text-body-2',
                      msg.role === 'user' ? '' : 'white--text',
                    ]"
                  >
                    {{ msg.message }}
                  </div>
                </v-card>

                <!-- Timestamp (optional safe fallback) -->
                <div class="d-flex justify-end">
                  <!-- <span class="caption grey--text mt-1">
          {{ formatTime(msg.createdAt || msg.timestamp) }}
        </span> -->
                </div>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Answer Section -->
        <v-card outlined rounded="xl" class="pa-5">
          <div class="d-flex align-center justify-space-between mb-4">
            <div class="text-subtitle-1 font-weight-bold">
              <v-icon small class="mr-2">mdi-lightbulb-outline</v-icon>
              Provide Correct Answer
            </div>

            <v-chip
              v-if="gap.status === 'answered'"
              small
              color="success"
              text-color="white"
              class="rounded-xl"
            >
              <v-icon small left>mdi-check-circle</v-icon>
              Answered
            </v-chip>
          </div>

          <v-textarea
            v-model="answer"
            :disabled="gap.status === 'answered'"
            outlined
            rows="4"
            placeholder="Write the correct answer that the AI should learn..."
          />

          <v-checkbox
            v-model="notify_user"
            label="Notify customer with this answer"
            class="mt-2"
            :disabled="gap.status === 'answered'"
          />

          <div class="d-flex justify-end">
            <v-btn
              color="primary"
              rounded
              :loading="saving"
              :disabled="gap.status === 'answered'"
              @click="submitAnswer"
            >
              Save Answer
            </v-btn>
          </div>
        </v-card>
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
      loading: false,
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
      this.loading = true;
      try {
        const res = await apiClient.get(`/content/knowledge-gap/${id}`);
        this.gap = res.data.data;
        this.answer = this.gap.answer || "";
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
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

        this.$toast?.success?.("Answer saved successfully") ||
          alert("Knowledge gap answered successfully");

        this.loadQuestion();
      } catch (err) {
        console.error(err);
        alert("Failed to save answer");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
