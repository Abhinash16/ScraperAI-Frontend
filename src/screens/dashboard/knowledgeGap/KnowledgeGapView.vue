<template>
  <div>
    <v-btn text small color="grey darken-2" class="mb-3 px-2" to="/dashboard/knowledge-gap">
      <v-icon left size="16">$arrow-left</v-icon>
      All questions
    </v-btn>

    <!-- LOADING -->
    <v-row v-if="loading && !gap._id">
      <v-col cols="12" md="7">
        <v-card outlined rounded="lg" class="pa-4 mb-4">
          <v-skeleton-loader type="heading, paragraph" />
        </v-card>
        <v-card outlined rounded="lg" class="pa-4">
          <v-skeleton-loader type="list-item-two-line, list-item-two-line, list-item-two-line" />
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card outlined rounded="lg" class="pa-4">
          <v-skeleton-loader type="heading, image, actions" />
        </v-card>
      </v-col>
    </v-row>

    <!-- NOT FOUND / ERROR -->
    <v-card
      v-else-if="!gap._id"
      outlined
      rounded="lg"
      class="d-flex flex-column align-center text-center px-6 py-12"
    >
      <v-avatar color="grey lighten-4" size="64" class="mb-4">
        <v-icon size="28" color="grey">$message-circle-x</v-icon>
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1">
        Couldn't load this question
      </div>
      <div class="text-body-2 grey--text text--darken-1 mb-4">
        It may have been removed, or the connection dropped.
      </div>
      <v-btn small outlined color="primary" @click="loadQuestion">
        <v-icon left size="14">$refresh-cw</v-icon>
        Try again
      </v-btn>
    </v-card>

    <template v-else>
      <!-- HEADER -->
      <div class="d-flex flex-wrap align-center mb-4">
        <div class="mr-4 mb-2">
          <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Unanswered question</h1>
          <div class="text-body-2 grey--text text--darken-1">
            Answer it once and the bot learns it as an FAQ.
          </div>
        </div>
        <v-spacer />
        <v-chip
          small
          label
          :color="tone.chip"
          text-color="white"
          class="font-weight-bold text-capitalize mb-2"
        >
          <v-icon left size="14">{{ tone.icon }}</v-icon>
          {{ gap.status }}
        </v-chip>
      </div>

      <v-row>
        <!-- LEFT: question + conversation -->
        <v-col cols="12" md="7">
          <v-card outlined rounded="lg" class="mb-4">
            <div class="d-flex align-start pa-5">
              <v-avatar
                size="40"
                tile
                class="rounded-lg mr-4 flex-shrink-0"
                :color="`${tone.color} lighten-5`"
              >
                <v-icon :color="tone.color" size="20">$message-circle-question-mark</v-icon>
              </v-avatar>
              <div class="overflow-hidden">
                <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">
                  Customer asked
                </div>
                <div class="text-subtitle-1 font-weight-bold grey--text text--darken-4 text-break">
                  {{ gap.question }}
                </div>
              </div>
            </div>
            <v-divider />
            <div class="d-flex flex-wrap px-5 py-3 text-body-2 grey--text text--darken-2">
              <span class="d-inline-flex align-center mr-6 my-1">
                <v-icon size="16" color="grey" class="mr-2">$phone</v-icon>
                {{ gap.phone || "No phone number" }}
              </span>
              <span v-if="gap.createdAt" class="d-inline-flex align-center my-1">
                <v-icon size="16" color="grey" class="mr-2">$clock</v-icon>
                {{ formatDate(gap.createdAt) }}
              </span>
            </div>
          </v-card>

          <v-card outlined rounded="lg">
            <div class="d-flex align-center px-5 py-4">
              <v-icon size="18" color="grey darken-2" class="mr-2">$messages-square</v-icon>
              <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
                Conversation
              </span>
              <v-spacer />
              <span class="text-caption grey--text">
                {{ messages.length }} message{{ messages.length === 1 ? "" : "s" }}
              </span>
            </div>
            <v-divider />

            <v-sheet color="grey lighten-5" class="px-4 py-4 rounded-b-lg">
              <div v-if="!messages.length" class="text-center text-body-2 grey--text py-6">
                No conversation was saved with this question.
              </div>

              <v-row
                v-for="(msg, i) in messages"
                :key="msg._id || i"
                no-gutters
                class="mb-3"
                :justify="isCustomer(msg) ? 'start' : 'end'"
              >
                <v-col cols="11" sm="9">
                  <div
                    class="d-flex align-center mb-1"
                    :class="isCustomer(msg) ? '' : 'justify-end'"
                  >
                    <v-icon size="12" color="grey" class="mr-1">
                      {{ isCustomer(msg) ? "$user" : "$bot" }}
                    </v-icon>
                    <span class="text-caption grey--text text--darken-1">
                      {{ isCustomer(msg) ? "Customer" : "AI" }}
                    </span>
                  </div>
                  <div class="d-flex" :class="isCustomer(msg) ? '' : 'justify-end'">
                    <v-sheet
                      :color="isCustomer(msg) ? 'white' : 'primary'"
                      :outlined="isCustomer(msg)"
                      rounded="lg"
                      class="px-4 py-3 text-body-2 text-break"
                      :class="isCustomer(msg) ? 'grey--text text--darken-4' : 'white--text'"
                    >
                      {{ msg.message }}
                    </v-sheet>
                  </div>
                </v-col>
              </v-row>
            </v-sheet>
          </v-card>
        </v-col>

        <!-- RIGHT: answer -->
        <v-col cols="12" md="5">
          <v-card outlined rounded="lg">
            <div class="d-flex align-center px-5 py-4">
              <v-icon size="18" color="amber darken-2" class="mr-2">$lightbulb</v-icon>
              <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4">
                {{ answered ? "Your answer" : "Write the correct answer" }}
              </span>
            </div>
            <v-divider />

            <div class="pa-5">
              <v-alert v-if="answered" text dense type="success" rounded="lg" class="text-body-2">
                Saved as an FAQ in "Learned from chats". The bot uses it once indexing finishes.
              </v-alert>
              <div v-else class="text-body-2 grey--text text--darken-1 mb-4">
                Write it the way you'd want the bot to reply. It's saved as an FAQ in
                "Learned from chats".
              </div>

              <v-textarea
                v-model="answer"
                :disabled="answered"
                outlined
                auto-grow
                rows="6"
                hide-details
                placeholder="Write the correct answer that the AI should learn…"
              />

              <v-btn
                v-if="!answered"
                block
                depressed
                color="primary"
                class="font-weight-bold mt-4"
                :loading="saving"
                @click="submitAnswer"
              >
                <v-icon left size="16">$check</v-icon>
                Save answer
              </v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

const STATUS_TONE = {
  pending: { color: "amber", chip: "amber darken-3", icon: "$clock" },
  answered: { color: "green", chip: "success", icon: "$circle-check" },
  deferred: { color: "grey", chip: "grey", icon: "$pause" },
};

export default {
  name: "KnowledgeGapView",

  data() {
    return {
      gap: {},
      loading: false,
      saving: false,
      answer: "",
    };
  },

  computed: {
    tone() {
      return STATUS_TONE[this.gap.status] || STATUS_TONE.deferred;
    },
    answered() {
      return this.gap.status === "answered";
    },
    messages() {
      return this.gap.chat_context || [];
    },
  },

  async mounted() {
    this.loadQuestion();
  },

  methods: {
    isCustomer(msg) {
      return msg.role === "user";
    },

    formatDate(date) {
      return new Date(date).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    },

    async loadQuestion() {
      const id = this.$route.params.id;
      this.loading = true;
      try {
        const res = await apiClient.get(`/knowledge/gaps/${id}`);
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
        this.$toast.error("Answer cannot be empty");
        return;
      }

      this.saving = true;

      try {
        await apiClient.post(`/knowledge/gaps/${this.gap._id}/answer`, {
          answer: this.answer,
        });

        this.$toast.success(
          'Answer saved as an FAQ in "Learned from chats". The bot can use it once indexing finishes.'
        );

        this.loadQuestion();
      } catch (err) {
        this.$toast.error(err.response?.data?.message || "Failed to save answer");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
