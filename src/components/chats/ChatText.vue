<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="chat-text" v-html="html"></div>
</template>

<script>
// One chat message's text, with WhatsApp-style formatting and links.
import { formatChatText } from "@/utils/chatFormat";

export default {
  name: "ChatText",
  props: {
    text: { type: String, default: "" },
  },
  computed: {
    html() {
      return formatChatText(this.text);
    },
  },
};
</script>

<style>
.chat-text {
  overflow-wrap: anywhere;
}
.chat-text a {
  color: inherit;
  text-decoration: underline;
}
.chat-text ul,
.chat-text ol {
  margin: 2px 0;
  padding-left: 20px;
}
.chat-text blockquote {
  margin: 2px 0;
  padding-left: 8px;
  border-left: 3px solid currentColor;
  opacity: 0.8;
}
.chat-text code,
.chat-text pre {
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.92em;
  background: rgba(127, 127, 127, 0.15);
  border-radius: 4px;
}
.chat-text code {
  padding: 0 4px;
}
.chat-text pre {
  margin: 4px 0;
  padding: 6px 8px;
  white-space: pre-wrap;
}
</style>
