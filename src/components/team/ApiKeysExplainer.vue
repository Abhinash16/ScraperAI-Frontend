<template>
  <v-card outlined rounded="lg" class="mb-4">
    <div class="d-flex align-center px-5 py-4" :class="{ 'pointer': !open }" @click="!open && toggle()">
      <v-avatar size="32" tile color="primary lighten-5" class="rounded-lg mr-3 flex-shrink-0">
        <v-icon size="16" color="primary">$circle-help</v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <div class="text-subtitle-2 font-weight-bold grey--text text--darken-4">How API keys work</div>
        <div v-if="!open" class="text-caption grey--text text--darken-1">
          What they are, which kind to pick, and when you need one.
        </div>
      </div>
      <v-btn small text color="primary" class="px-2" @click.stop="toggle">
        {{ open ? "Hide" : "Show" }}
        <v-icon right size="14">{{ open ? "$chevron-up" : "$chevron-down" }}</v-icon>
      </v-btn>
    </div>

    <v-expand-transition>
      <div v-show="open">
        <v-divider />
        <div class="pa-5">
          <p class="text-body-2 grey--text text--darken-3 mb-2">
            An API key is like a password that lets software talk to your chatbot. Your developers use it
            to add chat to your <strong>own website, mobile app or server</strong> with our SDKs, so the chat looks and
            works the way you want.
          </p>
          <p class="text-body-2 grey--text text--darken-3 mb-4">
            <strong>Just using the chat widget script on your website?</strong> Then you don't need to create
            anything here: the widget already has its own key, shown below.
          </p>

          <v-row dense>
            <v-col v-for="kind in KINDS" :key="kind.title" cols="12" md="4">
              <v-sheet outlined rounded="lg" class="pa-4 fill-height">
                <div class="d-flex align-center mb-2">
                  <v-avatar size="28" tile :color="kind.bg" class="rounded-lg mr-2 flex-shrink-0">
                    <v-icon size="14" :color="kind.fg">{{ kind.icon }}</v-icon>
                  </v-avatar>
                  <span class="text-body-2 font-weight-bold grey--text text--darken-4">{{ kind.title }}</span>
                </div>
                <div class="text-caption grey--text text--darken-1 mb-2">{{ kind.text }}</div>
                <div class="text-caption grey--text text--darken-2">
                  <v-icon size="12" class="mr-1" color="grey darken-1">{{ kind.tipIcon }}</v-icon>
                  {{ kind.tip }}
                </div>
              </v-sheet>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script>
const STORAGE_KEY = "api-keys-explainer-hidden";

const KINDS = [
  {
    title: "Publishable key: for websites and apps",
    icon: "$globe",
    bg: "primary lighten-5",
    fg: "primary",
    text: "Goes inside your website or mobile app so your visitors can chat. People can see it, and that's fine: you choose which websites and apps may use it.",
    tipIcon: "$key-round",
    tip: "Starts with pk_",
  },
  {
    title: "Secret key: for your server",
    icon: "$server",
    bg: "red lighten-5",
    fg: "red darken-1",
    text: "Lets your own server talk to us directly. Keep it private, like a password: never put it in a website or app. You'll see it only once.",
    tipIcon: "$key-round",
    tip: "Starts with sk_",
  },
  {
    title: "Live or test",
    icon: "$flask-conical",
    bg: "amber lighten-4",
    fg: "amber darken-4",
    text: "Live keys are for real customers. Test keys are for trying things out: the bot answers normally, but no webhooks are sent and test chats stay out of your reports.",
    tipIcon: "$inbox",
    tip: "Test chats show a Test tag in the inbox",
  },
];

// Plain-language intro to the API keys tab. Starts open (and always when there
// are no keys); hiding it is remembered in this browser.
export default {
  name: "ApiKeysExplainer",

  props: {
    // Start open even if hidden before, e.g. when there are no keys yet
    forceOpen: { type: Boolean, default: false },
  },

  data() {
    let hidden = false;
    try {
      hidden = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch (err) {
      hidden = false;
    }
    return { KINDS, open: this.forceOpen || !hidden };
  },

  methods: {
    toggle() {
      this.open = !this.open;
      try {
        window.localStorage.setItem(STORAGE_KEY, this.open ? "0" : "1");
      } catch (err) {
        // Not remembered; fine
      }
    },
  },
};
</script>

<style scoped>
.pointer {
  cursor: pointer;
}
</style>
