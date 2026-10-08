<template>
  <v-row justify="center" no-gutters>
    <v-col cols="12" :lg="session ? 12 : 10" :xl="session ? 11 : 8">
      <!-- HEADER -->
      <div class="d-flex flex-wrap align-center mb-4">
        <div class="mr-4 mb-2">
          <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
            Try it
          </h1>
          <div class="text-body-2 grey--text text--darken-1">
            Chat with your bot exactly as a customer would.
          </div>
        </div>
        <v-spacer />
        <v-chip
          small
          label
          color="amber lighten-5"
          text-color="amber darken-4"
          class="font-weight-bold mb-2"
        >
          <v-icon left size="14">$flask-conical</v-icon>
          Sandbox: nothing reaches customers
        </v-chip>
      </div>

      <ThingsToKnow feature="sandbox" />

      <!-- ================= RESTORING ================= -->
      <v-card v-if="restoring" outlined rounded="lg" class="pa-4">
        <v-skeleton-loader type="list-item-avatar, image" />
      </v-card>

      <!-- ================= START ================= -->
      <v-card v-else-if="!session" outlined rounded="lg">
        <div class="d-flex align-center pa-5">
          <v-avatar
            color="primary lighten-5"
            size="40"
            tile
            class="rounded-lg mr-4 flex-shrink-0"
          >
            <v-icon color="primary" size="20">$flask-conical</v-icon>
          </v-avatar>
          <div>
            <div
              class="text-subtitle-1 font-weight-bold grey--text text--darken-4"
            >
              Start a test chat
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              Real answers, but nothing is sent to customers and no alerts are
              triggered.
            </div>
          </div>
        </div>
        <v-divider />

        <v-form ref="startForm" class="pa-5" @submit.prevent="start">
          <div
            class="text-caption font-weight-bold text-uppercase grey--text mb-2"
          >
            Platform
          </div>
          <v-item-group v-model="platform" mandatory class="mb-6">
            <v-row dense>
              <v-col v-for="p in platforms" :key="p.id" cols="12" sm="6">
                <v-item v-slot="{ active, toggle }" :value="p.id">
                  <v-card
                    :outlined="!active"
                    :color="active ? 'primary lighten-5' : undefined"
                    :elevation="0"
                    rounded="lg"
                    class="d-flex align-center pa-4 fill-height"
                    :aria-pressed="String(active)"
                    @click="toggle"
                  >
                    <v-avatar
                      size="36"
                      :color="active ? 'white' : 'grey lighten-4'"
                      class="mr-3 flex-shrink-0"
                    >
                      <v-icon size="18" :color="active ? p.color : 'grey'">{{
                        p.icon
                      }}</v-icon>
                    </v-avatar>
                    <div class="flex-grow-1">
                      <div
                        class="text-body-2 font-weight-bold"
                        :class="
                          active ? 'primary--text' : 'grey--text text--darken-4'
                        "
                      >
                        {{ p.name }}
                      </div>
                      <div class="text-caption grey--text text--darken-1">
                        {{ p.description }}
                      </div>
                    </div>
                    <v-icon v-if="active" size="18" color="primary"
                      >$circle-check</v-icon
                    >
                  </v-card>
                </v-item>
              </v-col>
            </v-row>
          </v-item-group>

          <template v-if="setupRunning">
            <div
              class="text-caption font-weight-bold text-uppercase grey--text mb-2"
            >
              Knowledge
            </div>
            <v-btn-toggle
              v-model="knowledgeMode"
              mandatory
              dense
              color="primary"
              class="mb-2"
            >
              <v-btn small value="live">Live knowledge</v-btn>
              <v-btn small value="staging">New setup (staging)</v-btn>
            </v-btn-toggle>
            <div class="text-caption grey--text text--darken-1 mb-6">
              {{ knowledgeHint }}
            </div>
          </template>

          <div
            class="text-caption font-weight-bold text-uppercase grey--text mb-2"
          >
            Customer phone (optional)
          </div>
          <v-row dense>
            <v-col cols="12" md="8">
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
            </v-col>
          </v-row>

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
        </v-form>

        <v-divider />
        <div class="d-flex justify-end px-5 py-3">
          <v-btn
            color="primary"
            depressed
            class="font-weight-bold"
            :loading="starting"
            @click="start"
          >
            <v-icon left size="16">$play</v-icon>
            Start chat
          </v-btn>
        </div>
      </v-card>

      <!-- ================= CHAT ================= -->
      <v-row v-else>
        <v-col cols="12" :lg="wide ? 7 : 12">
          <v-card outlined rounded="lg" class="overflow-hidden">
            <!-- Header -->
            <v-sheet
              :color="look.header"
              :dark="isWhatsapp"
              class="d-flex align-center px-4 py-3"
            >
              <v-avatar
                size="40"
                :color="look.avatar"
                class="mr-3 flex-shrink-0"
              >
                <v-icon size="20" :color="isWhatsapp ? 'white' : 'primary'">
                  {{ isWhatsapp ? "$whatsapp" : "$bot" }}
                </v-icon>
              </v-avatar>
              <div class="flex-grow-1 overflow-hidden">
                <div class="text-body-2 font-weight-bold">
                  {{ isWhatsapp ? "WhatsApp bot" : "Website assistant" }}
                </div>
                <div
                  class="text-caption text-truncate"
                  :class="
                    isWhatsapp ? 'green--text text--lighten-4' : 'grey--text'
                  "
                >
                  <template v-if="sending">typing…</template>
                  <template v-else>
                    {{
                      session.phone ? `+${session.phone}` : "Anonymous visitor"
                    }}
                    <template v-if="session.knowledgeMode === 'staging'">
                      · new setup (staging)</template
                    >
                  </template>
                </div>
              </div>

              <v-switch
                v-model="bypassCache"
                dense
                inset
                hide-details
                color="primary"
                class="mt-0 pt-0 mr-2"
              >
                <template v-slot:label>
                  <span
                    class="text-caption"
                    :class="
                      isWhatsapp ? 'white--text' : 'grey--text text--darken-1'
                    "
                  >
                    Bypass cache
                  </span>
                </template>
              </v-switch>

              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    v-bind="attrs"
                    :loading="resetting"
                    aria-label="Reset session"
                    v-on="on"
                    @click="reset"
                  >
                    <v-icon size="18">$rotate-ccw</v-icon>
                  </v-btn>
                </template>
                Reset session
              </v-tooltip>
            </v-sheet>
            <v-divider v-if="!isWhatsapp" />

            <!-- Messages -->
            <v-sheet
              ref="chatWindow"
              :color="look.window"
              height="62vh"
              min-height="340"
              class="overflow-y-auto pa-4"
            >
              <div
                v-if="!messages.length"
                class="d-flex flex-column align-center justify-center text-center fill-height"
              >
                <v-avatar color="white" size="56" class="mb-3">
                  <v-icon size="24" :color="isWhatsapp ? 'green' : 'primary'"
                    >$messages-square</v-icon
                  >
                </v-avatar>
                <div
                  class="text-body-2 font-weight-bold grey--text text--darken-3 mb-1"
                >
                  Send a message as the customer
                </div>
                <div class="text-caption grey--text text--darken-1 mb-4">
                  Or try one of these:
                </div>
                <div class="d-flex flex-wrap justify-center">
                  <v-chip
                    v-for="s in suggestions"
                    :key="s"
                    small
                    outlined
                    color="grey darken-2"
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
                class="d-flex mb-3"
                :class="m.sender === 'user' ? 'justify-end' : 'justify-start'"
              >
                <v-sheet
                  color="transparent"
                  max-width="80%"
                  class="d-flex flex-column"
                  :class="m.sender === 'user' ? 'align-end' : 'align-start'"
                >
                  <v-sheet
                    :color="m.sender === 'user' ? look.userBubble : 'white'"
                    :outlined="m.sender !== 'user' && !isWhatsapp"
                    :elevation="isWhatsapp ? 1 : 0"
                    rounded="lg"
                    class="px-3 py-2"
                  >
                    <div
                      class="text-body-2 text-pre-wrap text-break"
                      :class="
                        m.sender === 'user'
                          ? look.userText
                          : 'grey--text text--darken-4'
                      "
                    >
                      {{ m.text }}
                    </div>
                    <div
                      v-if="m.at"
                      class="text-caption text-right mt-1"
                      :class="
                        m.sender === 'user' ? look.userTime : 'grey--text'
                      "
                    >
                      {{ m.at | moment("h:mm a") }}
                    </div>
                  </v-sheet>

                  <div
                    v-if="m.sender === 'bot' && m.source"
                    class="d-flex align-center text-caption grey--text text--darken-1 mt-1"
                  >
                    <v-chip
                      x-small
                      label
                      :color="sourceInfo(m.source).color"
                      :outlined="m.source !== 'ai_error'"
                      :dark="m.source === 'ai_error'"
                      class="font-weight-bold"
                    >
                      {{ sourceInfo(m.source).label }}
                    </v-chip>
                    <span
                      v-if="m.latencyMs !== undefined"
                      class="d-inline-flex align-center ml-2"
                    >
                      <v-icon size="12" class="mr-1">$clock</v-icon>
                      {{ formatLatency(m.latencyMs) }}
                    </span>
                  </div>

                  <template v-if="m.sender === 'bot' && m.trace">
                    <!-- Large screens: the trace opens in the side panel -->
                    <v-btn
                      v-if="wide"
                      x-small
                      :text="traceIndex !== index"
                      :depressed="traceIndex === index"
                      :color="
                        traceIndex === index ? 'primary lighten-5' : 'primary'
                      "
                      :class="traceIndex === index ? 'primary--text' : ''"
                      class="px-2 mt-1"
                      @click="selectedTrace = index"
                    >
                      <v-icon left size="12">$route</v-icon>
                      Why this answer
                    </v-btn>
                    <AnswerTrace v-else :trace="m.trace" class="mt-1" />
                  </template>

                  <div
                    v-if="m.failed"
                    class="d-flex align-center text-caption error--text mt-1"
                  >
                    <v-icon size="12" color="error" class="mr-1"
                      >$circle-alert</v-icon
                    >
                    Not answered
                  </div>
                </v-sheet>
              </div>

              <div v-if="sending" class="d-flex justify-start mb-3">
                <v-sheet
                  color="white"
                  :outlined="!isWhatsapp"
                  :elevation="isWhatsapp ? 1 : 0"
                  rounded="lg"
                  class="d-flex align-center px-3 py-2"
                >
                  <v-progress-circular
                    indeterminate
                    size="14"
                    width="2"
                    color="grey"
                    class="mr-2"
                  />
                  <span class="text-caption grey--text text--darken-1"
                    >Typing…</span
                  >
                </v-sheet>
              </div>
            </v-sheet>

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
                <v-spacer />
                <v-btn small outlined color="warning" @click="startOver"
                  >Start a new session</v-btn
                >
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
            <v-divider v-if="!isWhatsapp" />
            <v-sheet :color="look.input">
              <v-form class="d-flex align-center pa-3" @submit.prevent="send()">
                <v-text-field
                  ref="input"
                  v-model="newMessage"
                  placeholder="Type a message"
                  outlined
                  dense
                  hide-details
                  background-color="white"
                  autocomplete="off"
                  :disabled="sending || expired"
                  class="mr-2"
                />
                <v-btn
                  depressed
                  type="submit"
                  :color="look.send"
                  class="white--text"
                  :disabled="sending || expired || !newMessage.trim()"
                  aria-label="Send"
                >
                  <v-icon size="16" color="white">$send</v-icon>
                </v-btn>
              </v-form>
            </v-sheet>
          </v-card>
        </v-col>

        <!-- WHY THIS ANSWER (large screens) -->
        <v-col v-if="wide" cols="12" lg="5">
          <v-card outlined rounded="lg" class="overflow-hidden">
            <div class="d-flex align-center px-4 py-3">
              <v-icon size="18" color="primary" class="mr-2">$route</v-icon>
              <div class="flex-grow-1 overflow-hidden">
                <div
                  class="text-body-2 font-weight-bold grey--text text--darken-4"
                >
                  Why this answer
                </div>
                <div
                  class="text-caption grey--text text--darken-1 text-truncate"
                >
                  <template v-if="traceMessage">
                    {{ traceIsLatest ? "Latest reply" : "Selected reply" }}: "{{
                      traceMessage.text
                    }}"
                  </template>
                  <template v-else>How the bot built its reply</template>
                </div>
              </div>
              <v-btn
                v-if="traceMessage && !traceIsLatest"
                x-small
                text
                color="primary"
                class="ml-2"
                @click="selectedTrace = null"
              >
                Latest
              </v-btn>
            </div>
            <v-divider />
            <v-sheet
              height="calc(62vh + 129px)"
              min-height="469"
              class="overflow-y-auto pa-4"
            >
              <AnswerTrace
                v-if="traceMessage"
                :key="traceIndex"
                :trace="traceMessage.trace"
                embedded
              />
              <div
                v-else
                class="d-flex flex-column align-center justify-center text-center fill-height"
              >
                <v-avatar color="primary lighten-5" size="56" class="mb-3">
                  <v-icon size="24" color="primary">$route</v-icon>
                </v-avatar>
                <div
                  class="text-body-2 font-weight-bold grey--text text--darken-3 mb-1"
                >
                  No reply to explain yet
                </div>
                <div class="text-caption grey--text text--darken-1">
                  Send a message. The knowledge, searches and lookups behind
                  each reply show here.
                </div>
              </div>
            </v-sheet>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { isSetupRunning, loadSetup } from "@/utils/setup";
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
      // Index of the reply picked for the side panel; null follows the latest
      selectedTrace: null,
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
      setupRunning: false,
      // The Setup page links here with ?knowledge=staging
      knowledgeMode:
        this.$route.query.knowledge === "staging" ? "staging" : "live",
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

  watch: {
    // A new reply moves the side panel back to the latest
    "messages.length"() {
      this.selectedTrace = null;
    },
  },

  computed: {
    // Room for the side panel
    wide() {
      return this.$vuetify.breakpoint.lgAndUp;
    },
    latestTraceIndex() {
      for (let i = this.messages.length - 1; i >= 0; i--) {
        if (this.messages[i].sender === "bot" && this.messages[i].trace)
          return i;
      }
      return -1;
    },
    // The bot reply shown in the side panel: the one picked, else the latest
    traceIndex() {
      const picked = this.messages[this.selectedTrace];
      return picked && picked.trace
        ? this.selectedTrace
        : this.latestTraceIndex;
    },
    traceMessage() {
      return this.messages[this.traceIndex] || null;
    },
    traceIsLatest() {
      return this.traceIndex === this.latestTraceIndex;
    },
    // Colours for the WhatsApp and website chat looks
    look() {
      return this.isWhatsapp
        ? {
            header: "#075e54",
            avatar: "#128c7e",
            window: "#efeae2",
            userBubble: "#d9fdd3",
            userText: "grey--text text--darken-4",
            userTime: "grey--text",
            input: "#f0f2f5",
            send: "#00a884",
          }
        : {
            header: "white",
            avatar: "primary lighten-5",
            window: "#f6f8fd",
            userBubble: "primary",
            userText: "white--text",
            userTime: "primary--text text--lighten-4",
            input: "white",
            send: "primary",
          };
    },
    knowledgeHint() {
      return this.knowledgeMode === "staging"
        ? "Answers use the knowledge your setup is building, which customers can't see yet."
        : "Answers use the knowledge customers get today.";
    },
    isWhatsapp() {
      return this.session?.platform === "whatsapp";
    },

    suggestions() {
      const base = [
        "Hi",
        "What products do you offer?",
        "Price of your best seller?",
      ];
      return this.session?.phone
        ? [...base, "Show my bookings", "How much do I owe?"]
        : base;
    },
  },

  mounted() {
    this.restore();
    loadSetup().then((state) => (this.setupRunning = isSetupRunning(state)));
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
        this.session = {
          ...session,
          sessionId: session?.sessionId || sessionId,
        };
        this.messages = messages || [];
        this.scrollToBottom();
      } catch (err) {
        storeSessionId(null);
        if (err.response?.status !== 404) {
          this.startError = this.errorMessage(
            err,
            "Couldn't restore your sandbox session."
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
          knowledgeMode: this.setupRunning ? this.knowledgeMode : undefined,
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
          this.bypassCache
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
            "Rate limit reached. Wait a moment and try again."
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
        const el = this.$refs.chatWindow?.$el;
        if (el) el.scrollTop = el.scrollHeight;
      });
    },
  },
};
</script>
