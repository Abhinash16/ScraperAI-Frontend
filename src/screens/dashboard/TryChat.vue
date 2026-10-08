<template>
  <div>
    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">
          Try it
        </h1>
        <div class="text-body-2 grey--text text--darken-1">
          Chat with your bot exactly as a customer would. Nothing here reaches
          real customers.
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
        Sandbox
      </v-chip>
    </div>

    <ThingsToKnow feature="sandbox" />

    <!-- ================= RESTORING ================= -->
    <v-card v-if="restoring" outlined rounded="lg" class="pa-4">
      <v-skeleton-loader type="list-item-avatar, image" />
    </v-card>

    <!-- ================= START ================= -->
    <v-row v-else-if="!session">
      <v-col cols="12" md="8">
        <v-card outlined rounded="lg">
          <div class="px-5 py-4">
            <div
              class="text-subtitle-1 font-weight-bold grey--text text--darken-4"
            >
              Start a test chat
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              Pick how the customer reaches you, then start chatting.
            </div>
          </div>
          <v-divider />

          <v-form ref="startForm" class="pa-5" @submit.prevent="start">
            <!-- 1. Channel -->
            <div class="d-flex align-center mb-3">
              <v-avatar size="22" color="green" class="mr-2">
                <span class="white--text text-caption font-weight-bold">1</span>
              </v-avatar>
              <span
                class="text-body-2 font-weight-bold grey--text text--darken-4"
                >Choose a channel</span
              >
            </div>
            <v-item-group v-model="platform" mandatory class="mb-6">
              <v-row dense>
                <v-col v-for="p in platforms" :key="p.id" cols="12" sm="6">
                  <v-item v-slot="{ active, toggle }" :value="p.id">
                    <v-card
                      :outlined="!active"
                      :color="active ? 'green lighten-5' : undefined"
                      :elevation="0"
                      rounded="lg"
                      class="d-flex align-center pa-4 fill-height"
                      :aria-pressed="String(active)"
                      @click="toggle"
                    >
                      <v-avatar
                        size="40"
                        :color="active ? 'white' : 'grey lighten-4'"
                        class="mr-3 flex-shrink-0"
                      >
                        <v-icon
                          size="20"
                          :color="active ? 'green darken-1' : 'grey'"
                          >{{ p.icon }}</v-icon
                        >
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div
                          class="text-body-2 font-weight-bold"
                          :class="
                            active
                              ? 'green--text text--darken-2'
                              : 'grey--text text--darken-4'
                          "
                        >
                          {{ p.name }}
                        </div>
                        <div class="text-caption grey--text text--darken-1">
                          {{ p.description }}
                        </div>
                      </div>
                      <v-icon
                        size="20"
                        :color="active ? 'green darken-1' : 'grey lighten-2'"
                      >
                        {{ active ? "$circle-check" : "$circle" }}
                      </v-icon>
                    </v-card>
                  </v-item>
                </v-col>
              </v-row>
            </v-item-group>

            <!-- 2. Knowledge (only during a setup) -->
            <template v-if="setupRunning">
              <div class="d-flex align-center mb-3">
                <v-avatar size="22" color="green" class="mr-2">
                  <span class="white--text text-caption font-weight-bold"
                    >2</span
                  >
                </v-avatar>
                <span
                  class="text-body-2 font-weight-bold grey--text text--darken-4"
                  >Which knowledge?</span
                >
              </div>
              <v-item-group v-model="knowledgeMode" mandatory class="mb-6">
                <v-row dense>
                  <v-col
                    v-for="k in KNOWLEDGE_OPTIONS"
                    :key="k.value"
                    cols="12"
                    sm="6"
                  >
                    <v-item v-slot="{ active, toggle }" :value="k.value">
                      <v-card
                        :outlined="!active"
                        :color="active ? 'green lighten-5' : undefined"
                        :elevation="0"
                        rounded="lg"
                        class="d-flex align-start pa-4 fill-height"
                        :aria-pressed="String(active)"
                        @click="toggle"
                      >
                        <v-icon
                          size="20"
                          :color="active ? 'green darken-1' : 'grey lighten-2'"
                          class="mr-3 flex-shrink-0"
                        >
                          {{ active ? "$circle-check" : "$circle" }}
                        </v-icon>
                        <div>
                          <div
                            class="text-body-2 font-weight-bold"
                            :class="
                              active
                                ? 'green--text text--darken-2'
                                : 'grey--text text--darken-4'
                            "
                          >
                            {{ k.title }}
                          </div>
                          <div class="text-caption grey--text text--darken-1">
                            {{ k.text }}
                          </div>
                        </div>
                      </v-card>
                    </v-item>
                  </v-col>
                </v-row>
              </v-item-group>
            </template>

            <!-- 3. Customer -->
            <div class="d-flex align-center mb-3">
              <v-avatar size="22" color="green" class="mr-2">
                <span class="white--text text-caption font-weight-bold">{{
                  setupRunning ? 3 : 2
                }}</span>
              </v-avatar>
              <span
                class="text-body-2 font-weight-bold grey--text text--darken-4"
              >
                Test as a known customer
                <span class="font-weight-regular grey--text">(optional)</span>
              </span>
            </div>
            <v-row dense>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model.trim="phone"
                  label="Customer phone"
                  placeholder="919876543210"
                  prepend-inner-icon="$phone"
                  hint="The bot looks up this customer's real bookings and dues through your customer API."
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
          <div class="d-flex align-center flex-wrap px-5 py-3">
            <span class="text-caption grey--text text--darken-1 mr-4 my-1">
              Answers are real. No alerts, webhooks or messages go out.
            </span>
            <v-spacer />
            <v-btn
              color="success"
              depressed
              large
              class="font-weight-bold my-1"
              :loading="starting"
              @click="start"
            >
              <v-icon left size="18">$play</v-icon>
              Start chat
            </v-btn>
          </div>
        </v-card>
      </v-col>

      <!-- What you can test -->
      <v-col cols="12" md="4">
        <v-card outlined rounded="lg">
          <div class="px-5 py-4">
            <div
              class="text-subtitle-2 font-weight-bold grey--text text--darken-4"
            >
              What you can test
            </div>
          </div>
          <v-divider />
          <template v-for="(tip, i) in TIPS">
            <v-divider v-if="i > 0" :key="`d-${tip.title}`" />
            <div :key="tip.title" class="d-flex align-start px-5 py-3">
              <v-avatar
                size="32"
                color="green lighten-5"
                class="rounded-lg mr-3 flex-shrink-0"
                tile
              >
                <v-icon size="16" color="green darken-1">{{ tip.icon }}</v-icon>
              </v-avatar>
              <div>
                <div
                  class="text-body-2 font-weight-bold grey--text text--darken-4"
                >
                  {{ tip.title }}
                </div>
                <div class="text-caption grey--text text--darken-1">
                  {{ tip.text }}
                </div>
              </div>
            </div>
          </template>
        </v-card>
      </v-col>
    </v-row>

    <!-- ================= CHAT ================= -->
    <v-row v-else>
      <v-col cols="12" :lg="wide ? 7 : 12">
        <v-card outlined rounded="lg" class="overflow-hidden">
          <!-- Header -->
          <v-sheet
            :color="look.header"
            :dark="isWhatsapp"
            class="d-flex flex-wrap align-center px-4 py-3"
          >
            <v-avatar size="40" :color="look.avatar" class="mr-3 flex-shrink-0">
              <v-icon size="20" :color="isWhatsapp ? 'white' : 'primary'">
                {{ isWhatsapp ? "$whatsapp" : "$bot" }}
              </v-icon>
            </v-avatar>
            <div class="flex-grow-1 overflow-hidden mr-2">
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
                    session.phone
                      ? `Customer +${session.phone}`
                      : "Anonymous visitor"
                  }}
                  ·
                  {{
                    session.knowledgeMode === "staging"
                      ? "new setup (staging)"
                      : "live knowledge"
                  }}
                </template>
              </div>
            </div>

            <div class="d-flex align-center my-1">
              <v-tooltip bottom max-width="260">
                <template #activator="{ on, attrs }">
                  <div
                    class="d-flex align-center mr-3"
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-switch
                      v-model="bypassCache"
                      dense
                      inset
                      hide-details
                      color="success"
                      class="mt-0 pt-0"
                    />
                    <span
                      class="text-caption"
                      :class="
                        isWhatsapp ? 'white--text' : 'grey--text text--darken-1'
                      "
                    >
                      Fresh answers
                    </span>
                  </div>
                </template>
                Skip saved answers, so every reply is worked out again (bypass
                cache).
              </v-tooltip>
              <v-btn
                small
                :outlined="!isWhatsapp"
                :text="isWhatsapp"
                :color="isWhatsapp ? 'white' : 'grey darken-2'"
                :loading="resetting"
                @click="reset"
              >
                <v-icon left size="14">$rotate-ccw</v-icon>
                End chat
              </v-btn>
            </div>
          </v-sheet>
          <v-divider v-if="!isWhatsapp" />

          <!-- Messages -->
          <v-sheet
            ref="chatWindow"
            :color="look.window"
            height="58vh"
            min-height="340"
            class="overflow-y-auto pa-4"
          >
            <div
              v-if="!messages.length"
              class="d-flex flex-column align-center justify-center text-center fill-height"
            >
              <v-avatar color="white" size="64" class="mb-3">
                <v-icon size="28" :color="isWhatsapp ? 'green' : 'primary'"
                  >$messages-square</v-icon
                >
              </v-avatar>
              <div
                class="text-subtitle-2 font-weight-bold grey--text text--darken-3 mb-1"
              >
                Say something as the customer
              </div>
              <div class="text-caption grey--text text--darken-1">
                Type below, or tap a suggestion to get started.
              </div>
            </div>

            <div
              v-for="(m, index) in messages"
              :key="index"
              class="d-flex align-end mb-3"
              :class="m.sender === 'user' ? 'justify-end' : 'justify-start'"
            >
              <v-avatar
                v-if="m.sender !== 'user'"
                size="28"
                :color="look.avatar"
                class="mr-2 mb-1 flex-shrink-0"
              >
                <v-icon size="14" :color="isWhatsapp ? 'white' : 'primary'"
                  >$bot</v-icon
                >
              </v-avatar>

              <v-sheet
                color="transparent"
                max-width="78%"
                class="d-flex flex-column"
                :class="m.sender === 'user' ? 'align-end' : 'align-start'"
              >
                <v-sheet
                  :color="bubbleColor(m, index)"
                  :outlined="
                    m.sender !== 'user' && !isWhatsapp && !isPicked(index)
                  "
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
                    :class="m.sender === 'user' ? look.userTime : 'grey--text'"
                  >
                    {{ m.at | moment("h:mm a") }}
                  </div>
                </v-sheet>

                <div
                  v-if="m.sender === 'bot' && (m.source || m.trace)"
                  class="d-flex flex-wrap align-center text-caption grey--text text--darken-1 mt-1"
                >
                  <v-chip
                    v-if="m.source"
                    x-small
                    label
                    :color="sourceInfo(m.source).color"
                    :outlined="m.source !== 'ai_error'"
                    :dark="m.source === 'ai_error'"
                    class="font-weight-bold mr-2"
                  >
                    {{ sourceInfo(m.source).label }}
                  </v-chip>
                  <span
                    v-if="m.latencyMs !== undefined"
                    class="d-inline-flex align-center mr-2"
                  >
                    <v-icon size="12" class="mr-1">$clock</v-icon>
                    {{ formatLatency(m.latencyMs) }}
                  </span>
                  <v-btn
                    v-if="wide && m.trace"
                    x-small
                    depressed
                    :color="isPicked(index) ? 'success' : 'green lighten-5'"
                    :class="
                      isPicked(index)
                        ? 'white--text'
                        : 'green--text text--darken-2'
                    "
                    class="px-2"
                    @click="selectedTrace = index"
                  >
                    <v-icon left size="12">{{
                      isPicked(index) ? "$check" : "$route"
                    }}</v-icon>
                    Why this answer
                  </v-btn>
                </div>

                <AnswerTrace
                  v-if="!wide && m.sender === 'bot' && m.trace"
                  :trace="m.trace"
                  class="mt-1"
                />

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

            <div v-if="sending" class="d-flex align-end justify-start mb-3">
              <v-avatar
                size="28"
                :color="look.avatar"
                class="mr-2 mb-1 flex-shrink-0"
              >
                <v-icon size="14" :color="isWhatsapp ? 'white' : 'primary'"
                  >$bot</v-icon
                >
              </v-avatar>
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
              <v-btn small depressed color="warning" @click="startOver"
                >Start a new chat</v-btn
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

          <!-- Suggestions + input -->
          <v-divider v-if="!isWhatsapp" />
          <v-sheet :color="look.input" class="px-3 pt-3 pb-3">
            <div
              v-if="!expired"
              class="d-flex align-center overflow-x-auto mb-2"
            >
              <span
                class="text-caption grey--text text--darken-1 text-no-wrap mr-2"
                >Try:</span
              >
              <v-chip
                v-for="s in suggestions"
                :key="s"
                small
                outlined
                color="grey darken-2"
                class="white mr-2 flex-shrink-0"
                :disabled="sending"
                @click="send(s)"
              >
                {{ s }}
              </v-chip>
            </div>
            <v-form class="d-flex align-center" @submit.prevent="send()">
              <v-text-field
                ref="input"
                v-model="newMessage"
                placeholder="Type a message as the customer and press Enter"
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
                <v-icon
                  size="16"
                  color="white"
                  :left="$vuetify.breakpoint.smAndUp"
                  >$send</v-icon
                >
                <span class="hidden-xs-only">Send</span>
              </v-btn>
            </v-form>
          </v-sheet>
        </v-card>
      </v-col>

      <!-- WHY THIS ANSWER (large screens) -->
      <v-col v-if="wide" cols="12" lg="5">
        <v-card outlined rounded="lg" class="overflow-hidden">
          <div class="d-flex align-center px-4 py-3">
            <v-avatar
              size="32"
              color="green lighten-5"
              tile
              class="rounded-lg mr-3 flex-shrink-0"
            >
              <v-icon size="16" color="green darken-1">$route</v-icon>
            </v-avatar>
            <div class="flex-grow-1 overflow-hidden">
              <div
                class="text-body-2 font-weight-bold grey--text text--darken-4"
              >
                Why this answer
              </div>
              <div class="text-caption grey--text text--darken-1 text-truncate">
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
              depressed
              color="green lighten-5"
              class="green--text text--darken-2 ml-2"
              @click="selectedTrace = null"
            >
              Show latest
            </v-btn>
          </div>
          <v-divider />
          <v-sheet
            height="calc(58vh + 205px)"
            min-height="545"
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
              class="d-flex flex-column align-center justify-center text-center fill-height px-6"
            >
              <v-avatar color="green lighten-5" size="64" class="mb-3">
                <v-icon size="28" color="green darken-1">$route</v-icon>
              </v-avatar>
              <div
                class="text-subtitle-2 font-weight-bold grey--text text--darken-3 mb-1"
              >
                No reply to explain yet
              </div>
              <div class="text-caption grey--text text--darken-1">
                Send a message. The knowledge, searches and lookups behind each
                reply show up here.
              </div>
            </div>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>
  </div>
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

// Knowledge choice during a setup
const KNOWLEDGE_OPTIONS = [
  {
    value: "live",
    title: "Live knowledge",
    text: "What customers get today.",
  },
  {
    value: "staging",
    title: "New setup (staging)",
    text: "The knowledge your setup is building, which customers can't see yet.",
  },
];

// Start screen: what the sandbox is good for
const TIPS = [
  {
    icon: "$folder-open",
    title: "Answers from your knowledge",
    text: "Ask what customers ask and check the bot quotes the right page, FAQ or note.",
  },
  {
    icon: "$tag",
    title: "Prices and stock",
    text: "Product questions use your product API, the same as live chats.",
  },
  {
    icon: "$user-search",
    title: "A real customer's details",
    text: "Add a phone number to test bookings and dues from your customer API.",
  },
  {
    icon: "$route",
    title: "Why each answer",
    text: "Open any reply to see the knowledge, searches and lookups behind it.",
  },
];

export default {
  name: "TryChat",

  components: { ThingsToKnow, AnswerTrace },

  data() {
    return {
      KNOWLEDGE_OPTIONS,
      TIPS,
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

    // The reply shown in the side panel
    isPicked(index) {
      return this.wide && this.traceIndex === index;
    },

    bubbleColor(m, index) {
      if (m.sender === "user") return this.look.userBubble;
      return this.isPicked(index) ? "green lighten-5" : "white";
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
