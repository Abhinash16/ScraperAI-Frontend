<template>
  <div class="sandbox mx-auto">
    <v-alert
      type="warning"
      text
      dense
      rounded="lg"
      icon="$flask-conical"
      class="text-body-2 mb-4"
    >
      Sandbox: real answers, but nothing is sent to customers and no alerts
      are triggered.
    </v-alert>

    <ThingsToKnow feature="sandbox" />

    <!-- ================= RESTORING ================= -->
    <v-card v-if="restoring" outlined rounded="xl" class="pa-8 text-center">
      <v-progress-circular indeterminate color="primary" />
    </v-card>

    <!-- ================= START ================= -->
    <v-card v-else-if="!session" outlined rounded="xl" class="pa-6 pa-sm-8">
      <div class="d-flex align-center mb-6">
        <v-avatar size="48" rounded="xl" color="#cde6ff" class="mr-4">
          <v-icon color="black">$flask-conical</v-icon>
        </v-avatar>
        <div>
          <div class="text-h6 font-weight-bold">Sandbox</div>
          <div class="text-body-2 grey--text text--darken-1">
            Test your chatbot exactly as a customer would experience it.
          </div>
        </div>
      </div>

      <v-form ref="startForm" @submit.prevent="start">
        <div class="field-title">Platform</div>
        <v-item-group v-model="platform" mandatory class="d-flex mb-6">
          <v-item
            v-for="p in platforms"
            :key="p.id"
            v-slot="{ active, toggle }"
            :value="p.id"
          >
            <v-card
              outlined
              rounded="xl"
              :class="['platform-option pa-4 mr-3', { active }]"
              @click="toggle"
            >
              <div class="d-flex align-center">
                <v-icon :color="active ? p.color : 'grey'" class="mr-3">
                  {{ p.icon }}
                </v-icon>
                <div>
                  <div class="font-weight-bold">{{ p.name }}</div>
                  <div class="text-caption grey--text text--darken-1">
                    {{ p.description }}
                  </div>
                </div>
              </div>
            </v-card>
          </v-item>
        </v-item-group>

        <div class="field-title">Customer phone (optional)</div>
        <v-text-field
          v-model.trim="phone"
          placeholder="919876543210"
          prepend-inner-icon="$phone"
          hint="With a phone number, the bot looks up that customer's real bookings and dues through your customer API."
          persistent-hint
          outlined
          dense
          clearable
          autocomplete="off"
          :rules="[phoneRule]"
        />

        <v-alert
          v-if="startError"
          type="error"
          text
          dense
          rounded="lg"
          class="text-body-2 mt-4 mb-0"
        >
          {{ startError }}
        </v-alert>

        <div class="d-flex justify-end mt-6">
          <v-btn
            color="primary"
            rounded
            depressed
            large
            type="submit"
            :loading="starting"
          >
            <v-icon left>$play</v-icon>
            Start
          </v-btn>
        </div>
      </v-form>
    </v-card>

    <!-- ================= CHAT ================= -->
    <v-card
      v-else
      outlined
      rounded="xl"
      :class="['chat-card', `platform-${session.platform}`]"
    >
      <!-- Header -->
      <div class="chat-header d-flex align-center px-4 py-3">
        <v-avatar size="40" class="mr-3 header-avatar">
          <v-icon :color="isWhatsapp ? 'white' : 'primary'">
            {{ isWhatsapp ? "$whatsapp" : "$bot" }}
          </v-icon>
        </v-avatar>
        <div class="flex-grow-1" style="min-width: 0">
          <div class="font-weight-bold">
            {{ isWhatsapp ? "WhatsApp bot" : "Website assistant" }}
          </div>
          <div class="header-sub text-caption text-truncate">
            <template v-if="sending">typing…</template>
            <template v-else>
              {{ session.phone ? `+${session.phone}` : "Anonymous visitor" }}
            </template>
          </div>
        </div>

        <v-switch
          v-model="bypassCache"
          dense
          inset
          hide-details
          class="mt-0 pt-0 mr-2 header-switch"
          :dark="isWhatsapp"
        >
          <template v-slot:label>
            <span class="text-caption header-sub">Bypass cache</span>
          </template>
        </v-switch>

        <v-btn
          icon
          :dark="isWhatsapp"
          title="Reset session"
          :loading="resetting"
          @click="reset"
        >
          <v-icon>$rotate-ccw</v-icon>
        </v-btn>
      </div>

      <!-- Messages -->
      <div ref="chatWindow" class="chat-window pa-4">
        <div
          v-if="!messages.length"
          class="empty-chat text-center"
        >
          <div class="text-body-2 mb-4 grey--text text--darken-1">
            Send a message as the customer.
          </div>
          <div class="d-flex flex-wrap justify-center">
            <v-chip
              v-for="s in suggestions"
              :key="s"
              small
              outlined
              class="ma-1 white"
              :disabled="sending || expired"
              @click="send(s)"
            >
              {{ s }}
            </v-chip>
          </div>
        </div>

        <div
          v-for="(m, index) in messages"
          :key="index"
          :class="[
            'd-flex mb-3',
            m.sender === 'user' ? 'justify-end' : 'justify-start',
          ]"
        >
          <div :class="['msg', m.sender === 'user' ? 'msg-user' : 'msg-bot']">
            <div :class="['bubble', m.sender === 'user' ? 'bubble-user' : 'bubble-bot']">
              <div class="bubble-text">{{ m.text }}</div>
              <div v-if="m.at" class="bubble-time">
                {{ m.at | moment("h:mm a") }}
              </div>
            </div>

            <div v-if="m.sender === 'bot' && m.source" class="msg-meta">
              <v-chip
                x-small
                label
                :color="sourceInfo(m.source).color"
                :outlined="m.source !== 'ai_error'"
                :dark="m.source === 'ai_error'"
              >
                {{ sourceInfo(m.source).label }}
              </v-chip>
              <span v-if="m.latencyMs !== undefined" class="ml-2">
                {{ formatLatency(m.latencyMs) }}
              </span>
            </div>

            <AnswerTrace
              v-if="m.sender === 'bot' && m.trace"
              :trace="m.trace"
              class="mt-1"
            />

            <div v-if="m.failed" class="msg-meta error--text">
              <v-icon x-small color="error" class="mr-1">
                $circle-alert
              </v-icon>
              Not answered
            </div>
          </div>
        </div>

        <div v-if="sending" class="d-flex justify-start mb-3">
          <div class="bubble bubble-bot typing">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <!-- Errors -->
      <v-alert
        v-if="expired"
        type="warning"
        text
        dense
        tile
        class="text-body-2 ma-0"
      >
        <div class="d-flex align-center flex-wrap">
          <span class="mr-2">This sandbox session has expired.</span>
          <v-btn small text color="warning" @click="startOver">
            Start a new session
          </v-btn>
        </div>
      </v-alert>
      <v-alert
        v-else-if="sendError"
        type="error"
        text
        dense
        tile
        dismissible
        class="text-body-2 ma-0"
        @input="sendError = ''"
      >
        {{ sendError }}
      </v-alert>

      <!-- Input -->
      <v-form class="chat-input d-flex align-center pa-3" @submit.prevent="send()">
        <v-text-field
          ref="input"
          v-model="newMessage"
          placeholder="Type a message"
          solo
          flat
          dense
          rounded
          hide-details
          autocomplete="off"
          :disabled="sending || expired"
          class="mr-2"
        />
        <v-btn
          fab
          small
          depressed
          type="submit"
          :color="isWhatsapp ? '#00a884' : 'primary'"
          :disabled="sending || expired || !newMessage.trim()"
        >
          <v-icon small color="white">$send</v-icon>
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import AnswerTrace from "@/components/sandbox/AnswerTrace.vue";
import {
  createSandboxSession,
  getSandboxSession,
  sendSandboxMessage,
  deleteSandboxSession,
  getStoredSessionId,
  storeSessionId,
} from "@/service/sandboxChat";

const SOURCES = {
  greeting: { label: "Greeting", color: "blue-grey" },
  quick_reply: { label: "Quick reply", color: "teal" },
  small_talk: { label: "Small talk", color: "blue-grey" },
  cache: { label: "Cache", color: "orange darken-2" },
  ai: { label: "AI", color: "primary" },
  ai_error: { label: "AI error", color: "error" },
};

export default {
  name: "TryChat",

  components: { ThingsToKnow, AnswerTrace },

  data() {
    return {
      platforms: [
        {
          id: "whatsapp",
          name: "WhatsApp",
          icon: "$whatsapp",
          color: "#25d366",
          description: "Test the WhatsApp bot",
        },
        {
          id: "web",
          name: "Website",
          icon: "$globe",
          color: "primary",
          description: "Test the website widget",
        },
      ],
      platform: "whatsapp",
      phone: "",
      starting: false,
      startError: "",
      restoring: false,

      session: null,
      messages: [],
      newMessage: "",
      bypassCache: false,
      sending: false,
      sendError: "",
      expired: false,
      resetting: false,
    };
  },

  computed: {
    isWhatsapp() {
      return this.session?.platform === "whatsapp";
    },

    suggestions() {
      const base = ["Hi", "What products do you offer?", "Price of your best seller?"];
      return this.session?.phone
        ? [...base, "Show my bookings", "How much do I owe?"]
        : base;
    },
  },

  mounted() {
    this.restore();
  },

  methods: {
    normalizePhone(v) {
      return (v || "").replace(/[\s()+-]/g, "");
    },

    phoneRule(v) {
      if (!v) return true;
      return (
        /^\d{10,15}$/.test(this.normalizePhone(v)) ||
        "10–15 digits including country code, e.g. 919876543210"
      );
    },

    sourceInfo(source) {
      return SOURCES[source] || { label: source, color: "grey" };
    },

    formatLatency(ms) {
      return ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`;
    },

    errorMessage(err, fallback) {
      return err.response?.data?.message || fallback;
    },

    async restore() {
      const sessionId = getStoredSessionId();
      if (!sessionId) return;

      this.restoring = true;
      try {
        const { session, messages } = await getSandboxSession(sessionId);
        this.session = { ...session, sessionId: session?.sessionId || sessionId };
        this.messages = messages || [];
        this.scrollToBottom();
      } catch (err) {
        storeSessionId(null);
        if (err.response?.status !== 404) {
          this.startError = this.errorMessage(
            err,
            "Couldn't restore your sandbox session.",
          );
        }
      } finally {
        this.restoring = false;
      }
    },

    async start() {
      this.startError = "";
      if (!this.$refs.startForm.validate()) return;

      this.starting = true;
      try {
        const session = await createSandboxSession({
          platform: this.platform,
          phone: this.normalizePhone(this.phone),
        });
        storeSessionId(session.sessionId);
        this.session = session;
        this.messages = [];
        this.expired = false;
        this.sendError = "";
      } catch (err) {
        this.startError =
          err.response?.status === 403
            ? "You need the settings:manage permission to use the sandbox."
            : this.errorMessage(err, "Couldn't start the sandbox session.");
      } finally {
        this.starting = false;
      }
    },

    async send(text = this.newMessage) {
      const message = (text || "").trim();
      if (!message || this.sending || this.expired) return;

      const userMessage = { sender: "user", text: message, at: new Date() };
      this.messages.push(userMessage);
      this.newMessage = "";
      this.sendError = "";
      this.sending = true;
      this.scrollToBottom();

      try {
        const { reply, source, latencyMs, trace } = await sendSandboxMessage(
          this.session.sessionId,
          message,
          this.bypassCache,
        );
        this.messages.push({
          sender: "bot",
          text: reply,
          at: new Date(),
          source,
          latencyMs,
          trace: source === "ai" ? trace : null,
        });
      } catch (err) {
        this.$set(userMessage, "failed", true);
        const status = err.response?.status;
        if (status === 404) {
          this.expired = true;
        } else if (status === 429) {
          this.sendError = this.errorMessage(
            err,
            "Rate limit reached. Wait a moment and try again.",
          );
        } else if (status === 504) {
          this.sendError =
            "The worker isn't responding. Make sure the worker process is running, then try again.";
        } else {
          this.sendError = this.errorMessage(err, "Failed to send message.");
        }
      } finally {
        this.sending = false;
        this.scrollToBottom();
        this.$nextTick(() => this.$refs.input?.focus());
      }
    },

    async reset() {
      this.resetting = true;
      try {
        await deleteSandboxSession(this.session.sessionId);
      } catch (err) {
        if (err.response?.status !== 404) {
          this.$toast.error(this.errorMessage(err, "Failed to reset session"));
          return;
        }
      } finally {
        this.resetting = false;
      }
      this.startOver();
    },

    startOver() {
      storeSessionId(null);
      this.session = null;
      this.messages = [];
      this.expired = false;
      this.sendError = "";
      this.newMessage = "";
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatWindow;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
  },
};
</script>

<style scoped>
.sandbox {
  max-width: 820px;
}

.field-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
  margin-bottom: 10px;
}

.platform-option {
  flex: 1 1 0;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.platform-option.active {
  border-color: var(--v-primary-base) !important;
  background: #f6f8fd;
}

/* ---------- Chat shell ---------- */
.chat-card {
  overflow: hidden;
}

.chat-window {
  height: 62vh;
  min-height: 340px;
  overflow-y: auto;
}

.empty-chat {
  padding-top: 14vh;
}

.msg {
  max-width: 80%;
  display: flex;
  flex-direction: column;
}

.msg-user {
  align-items: flex-end;
}

.msg-bot {
  align-items: flex-start;
}

.msg-meta {
  font-size: 11px;
  color: #757575;
  margin-top: 4px;
  display: flex;
  align-items: center;
}

.bubble {
  padding: 8px 12px;
  border-radius: 16px;
  max-width: 100%;
}

.bubble-text {
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble-time {
  font-size: 11px;
  opacity: 0.6;
  text-align: right;
  margin-top: 2px;
}

.typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 14px;
}

.typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9e9e9e;
  animation: blink 1.2s infinite ease-in-out;
}

.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.3;
  }
  40% {
    opacity: 1;
  }
}

/* ---------- WhatsApp look ---------- */
.platform-whatsapp .chat-header {
  background: #075e54;
  color: #fff;
}

.platform-whatsapp .header-avatar {
  background: #128c7e;
}

.platform-whatsapp .header-sub {
  color: rgba(255, 255, 255, 0.8);
}

.platform-whatsapp .chat-window {
  background: #efeae2;
}

.platform-whatsapp .bubble {
  border-radius: 8px;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
}

.platform-whatsapp .bubble-user {
  background: #d9fdd3;
  color: #111b21;
  border-top-right-radius: 0;
}

.platform-whatsapp .bubble-bot {
  background: #fff;
  color: #111b21;
  border-top-left-radius: 0;
}

.platform-whatsapp .chat-input {
  background: #f0f2f5;
}

/* ---------- Website widget look ---------- */
.platform-web .chat-header {
  background: #fff;
  border-bottom: 1px solid #e4e8f2;
}

.platform-web .header-avatar {
  background: #eff2fb;
}

.platform-web .header-sub {
  color: #757575;
}

.platform-web .chat-window {
  background: #f6f8fd;
}

.platform-web .bubble-user {
  background: var(--v-primary-base);
  color: #fff;
  border-bottom-right-radius: 4px;
}

.platform-web .bubble-bot {
  background: #fff;
  border: 1px solid #e4e8f2;
  border-bottom-left-radius: 4px;
}

.platform-web .chat-input {
  background: #fff;
  border-top: 1px solid #e4e8f2;
}

.platform-web .chat-input ::v-deep .v-input__slot {
  background: #f6f8fd !important;
}
</style>
