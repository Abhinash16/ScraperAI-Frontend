<template>
  <div class="chat-conversations">
    <v-progress-linear v-if="loading" indeterminate color="primary" />
    <div v-else-if="!conversations.length" class="text-body-2 grey--text pa-3">
      No conversations yet.
    </div>
    <v-list v-else dense class="py-0">
      <v-list-item
        v-for="c in conversations"
        :key="c._id"
        class="conv-row"
        @click="$emit('select', c._id)"
      >
        <v-list-item-content>
          <v-list-item-title class="text-body-2 font-weight-medium">
            {{ formatStart(c.startedAt) }}
            <span class="text-caption grey--text ml-1">{{ formatDuration(c) }}</span>
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption">
            {{ stat(c, "userMessages") }} from the customer · {{ stat(c, "botMessages") }} bot
            <template v-if="stat(c, 'agentMessages')"> · {{ stat(c, "agentMessages") }} team</template>
          </v-list-item-subtitle>
          <div v-if="c.summary" class="text-caption summary mt-1">{{ c.summary }}</div>
          <div v-if="c.topics && c.topics.length" class="mt-1">
            <v-chip v-for="t in c.topics" :key="t" x-small class="mr-1">{{ t }}</v-chip>
          </div>
        </v-list-item-content>
        <v-list-item-action class="my-0">
          <v-chip v-if="statusOf(c)" x-small :color="statusOf(c).color" text-color="white">
            {{ statusOf(c).label }}
          </v-chip>
          <v-chip v-else-if="outcomeOf(c)" x-small outlined :color="outcomeOf(c).color">
            {{ outcomeOf(c).label }}
          </v-chip>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </div>
</template>

<script>
import {
  OPEN_STATUS,
  OUTCOMES,
  formatDuration,
  formatStart,
  isOpen,
} from "@/utils/conversations";

// A chat's conversations, newest first. Emits "select" with a conversation id.
export default {
  name: "ChatConversations",

  props: {
    conversations: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },

  methods: {
    formatStart,
    formatDuration,
    stat: (c, key) => c.stats?.[key] || 0,
    statusOf: (c) => (isOpen(c) ? OPEN_STATUS[c.status] || OPEN_STATUS.open : null),
    outcomeOf: (c) => OUTCOMES[c.outcome] || null,
  },
};
</script>

<style scoped>
.chat-conversations {
  max-height: 280px;
  overflow-y: auto;
}
.conv-row {
  border-bottom: 1px solid #eef1f7;
}
.summary {
  color: #374151;
  white-space: normal;
}
</style>
