<template>
  <div class="landing">
    <!-- ================= TOP BAR ================= -->
    <v-app-bar
      app
      flat
      elevate-on-scroll
      color="rgba(255,255,255,0.86)"
      :height="$vuetify.breakpoint.xsOnly ? 60 : 68"
      class="landing-bar"
    >
      <!-- No extra container padding on phones: the bar already has its own -->
      <v-container class="d-flex align-center py-0 px-0 px-sm-3">
        <router-link
          to="/"
          class="d-flex align-center text-decoration-none"
          aria-label="scraperAI home"
        >
          <AppLogo :size="$vuetify.breakpoint.xsOnly ? 32 : 36" class="mr-2 mr-sm-3" />
          <span class="text-h6 font-weight-black secondary--text"
            >scraperAI</span
          >
        </router-link>

        <v-spacer />

        <div class="hidden-sm-and-down">
          <v-btn
            v-for="l in NAV"
            :key="l.id"
            text
            color="grey darken-3"
            class="font-weight-bold"
            @click="scrollTo(l.id)"
          >
            {{ l.label }}
          </v-btn>
        </div>

        <v-btn
          v-if="!isLoggedIn"
          text
          color="grey darken-3"
          class="font-weight-bold ml-2 hidden-xs-only"
          to="/login"
        >
          Sign in
        </v-btn>
        <v-btn
          depressed
          color="primary"
          class="font-weight-bold ml-2"
          :small="$vuetify.breakpoint.xsOnly"
          @click="primaryAction"
        >
          <v-icon v-if="isLoggedIn" left size="16">$layout-dashboard</v-icon>
          {{
            isLoggedIn
              ? "Dashboard"
              : $vuetify.breakpoint.xsOnly
              ? "Try free"
              : "Try for free"
          }}
        </v-btn>

        <v-menu offset-y left nudge-bottom="8">
          <template #activator="{ on, attrs }">
            <v-btn
              icon
              class="ml-1 hidden-md-and-up"
              aria-label="Menu"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>$menu</v-icon>
            </v-btn>
          </template>
          <v-card width="220" outlined rounded="lg">
            <v-list dense nav class="py-2">
              <v-list-item v-for="l in NAV" :key="l.id" @click="scrollTo(l.id)">
                <v-list-item-title class="font-weight-bold">{{
                  l.label
                }}</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="!isLoggedIn" to="/login">
                <v-list-item-title class="font-weight-bold"
                  >Sign in</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-container>
    </v-app-bar>

    <!-- ================= HERO ================= -->
    <section class="hero">
      <div class="blob blob--one" aria-hidden="true" />
      <div class="blob blob--two" aria-hidden="true" />
      <v-container class="hero__inner">
        <v-row align="center">
          <v-col cols="12" md="7">
            <div v-reveal>
              <v-chip
                label
                color="white"
                class="hero__badge font-weight-bold mb-6"
              >
                <v-icon left size="14" color="primary">$sparkles</v-icon>
                AI customer support for WhatsApp and the web
              </v-chip>
            </div>
            <h1 v-reveal="80" class="hero__title font-weight-black mb-5">
              Answer every customer instantly, from
              <span class="text-gradient">your own knowledge</span>.
            </h1>
            <p
              v-reveal="160"
              class="text-body-1 text-sm-h6 font-weight-regular grey--text text--darken-1 mb-8"
            >
              scraperAI learns from your website, FAQs and documents, replies on
              your website and WhatsApp around the clock, checks live prices and
              bookings, and hands the chat to your team when it should.
            </p>
            <!-- One line on every screen: halves on phones, natural width on larger -->
            <div v-reveal="240" class="d-flex">
              <v-btn
                :x-large="!compactCta"
                :large="compactCta"
                depressed
                color="primary"
                class="cta-btn font-weight-bold flex-grow-1 flex-sm-grow-0 mr-3"
                @click="primaryAction"
              >
                {{ isLoggedIn ? "Go to dashboard" : "Try for free" }}
                <v-icon v-if="!compactCta" right size="18">$arrow-right</v-icon>
              </v-btn>
              <v-btn
                :x-large="!compactCta"
                :large="compactCta"
                outlined
                color="primary"
                class="font-weight-bold flex-grow-1 flex-sm-grow-0"
                @click="scrollTo('how')"
              >
                See how it works
              </v-btn>
            </div>
            <div v-reveal="320" class="d-flex flex-wrap mt-3">
              <span
                v-for="p in HERO_POINTS"
                :key="p"
                class="d-inline-flex align-center text-body-2 grey--text text--darken-2 mr-5 my-1"
              >
                <v-icon size="16" color="success" class="mr-2"
                  >$circle-check</v-icon
                >
                {{ p }}
              </span>
            </div>
          </v-col>

          <!-- Animated example chat -->
          <v-col cols="12" md="5">
            <div v-reveal="200" class="chat-shell mx-auto">
              <v-card
                rounded="lg"
                elevation="0"
                outlined
                class="overflow-hidden"
              >
                <v-sheet
                  color="#075e54"
                  dark
                  class="d-flex align-center px-4 py-3"
                >
                  <v-avatar size="38" color="#128c7e" class="mr-3">
                    <v-icon size="18" color="white">$whatsapp</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="text-body-2 font-weight-bold">
                      Ontrack Rentals
                    </div>
                    <div class="text-caption green--text text--lighten-4">
                      {{ botTyping ? "typing…" : "online" }}
                    </div>
                  </div>
                  <v-chip
                    x-small
                    label
                    color="rgba(255,255,255,0.16)"
                    class="font-weight-bold"
                  >
                    <v-icon left size="10">$bot</v-icon>
                    AI
                  </v-chip>
                </v-sheet>

                <v-sheet ref="chatBody" color="#efeae2" class="chat-body pa-4">
                  <transition-group name="msg" tag="div">
                    <div
                      v-for="m in shownMessages"
                      :key="m.id"
                      class="d-flex mb-3"
                      :class="
                        m.from === 'customer' ? 'justify-end' : 'justify-start'
                      "
                    >
                      <div
                        class="bubble"
                        :class="
                          m.from === 'customer' ? 'bubble--me' : 'bubble--bot'
                        "
                      >
                        <div class="text-body-2 grey--text text--darken-4">
                          {{ m.text }}
                        </div>
                        <div v-if="m.sources" class="d-flex flex-wrap mt-2">
                          <span
                            v-for="s in m.sources"
                            :key="s"
                            class="source-chip mr-1 mt-1"
                          >
                            <v-icon size="10" color="primary" class="mr-1"
                              >$route</v-icon
                            >{{ s }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </transition-group>
                  <div v-if="botTyping" class="d-flex justify-start mb-3">
                    <div class="bubble bubble--bot typing" aria-label="typing">
                      <span /><span /><span />
                    </div>
                  </div>
                </v-sheet>
              </v-card>
              <div class="text-center text-caption grey--text mt-3">
                Example conversation
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ================= TOPIC MARQUEE ================= -->
    <section class="py-8 marquee-wrap">
      <div
        class="text-center text-caption font-weight-bold text-uppercase grey--text mb-4"
      >
        Customers ask. Your bot answers.
      </div>
      <div class="marquee" aria-hidden="true">
        <div class="marquee__track">
          <span v-for="(t, i) in MARQUEE_DOUBLE" :key="i" class="marquee__item">
            <v-icon size="16" color="primary" class="mr-2">{{ t.icon }}</v-icon
            >{{ t.label }}
          </span>
        </div>
      </div>
    </section>

    <!-- ================= HIGHLIGHTS ================= -->
    <v-container id="features" class="py-12 py-md-16">
      <div v-reveal class="text-center mb-12">
        <div class="eyebrow mb-2">Why scraperAI</div>
        <h2 class="section-title mb-3">
          Accurate answers your customers can trust
        </h2>
        <div class="text-body-1 grey--text text--darken-1">
          Control what the bot knows, see why it answers, and step in when it
          matters.
        </div>
      </div>

      <v-row>
        <v-col v-for="(h, i) in HIGHLIGHTS" :key="h.title" cols="12" md="4">
          <v-card
            v-reveal="i * 100"
            outlined
            rounded="xl"
            class="lift pa-6 fill-height"
          >
            <v-avatar
              size="48"
              tile
              :color="`${h.tone} lighten-5`"
              class="rounded-lg mb-5"
            >
              <v-icon size="24" :color="h.tone">{{ h.icon }}</v-icon>
            </v-avatar>
            <div
              class="text-h6 font-weight-bold grey--text text--darken-4 mb-2"
            >
              {{ h.title }}
            </div>
            <div class="text-body-2 grey--text text--darken-1 mb-5">
              {{ h.text }}
            </div>
            <v-sheet color="#F7F7FE" rounded="lg" class="pa-3">
              <div
                v-for="line in h.demo"
                :key="line"
                class="d-flex align-center text-caption grey--text text--darken-3 py-1"
              >
                <v-icon size="14" color="success" class="mr-2">$check</v-icon>
                {{ line }}
              </div>
            </v-sheet>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-6">
        <v-col
          v-for="(f, i) in FEATURES"
          :key="f.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card
            v-reveal="(i % 4) * 80"
            outlined
            rounded="lg"
            class="lift pa-5 fill-height"
          >
            <v-icon size="22" :color="f.tone" class="mb-3">{{ f.icon }}</v-icon>
            <div
              class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mb-1"
            >
              {{ f.title }}
            </div>
            <div class="text-body-2 grey--text text--darken-1">
              {{ f.text }}
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- ================= HOW IT WORKS ================= -->
    <section id="how" class="soft-band py-12 py-md-16">
      <v-container>
        <div v-reveal class="text-center mb-12">
          <div class="eyebrow mb-2">How it works</div>
          <h2 class="section-title mb-3">Live in four steps, without code</h2>
          <div class="text-body-1 grey--text text--darken-1">
            Everything is staged and tested before a single customer sees it.
          </div>
        </div>
        <v-row>
          <v-col v-for="(s, i) in STEPS" :key="s.title" cols="12" sm="6" md="3">
            <v-card
              v-reveal="i * 120"
              outlined
              rounded="xl"
              class="lift pa-6 fill-height"
            >
              <div class="step-number mb-4">0{{ i + 1 }}</div>
              <v-icon size="22" color="primary" class="mb-3">{{
                s.icon
              }}</v-icon>
              <div
                class="text-subtitle-1 font-weight-bold grey--text text--darken-4 mb-2"
              >
                {{ s.title }}
              </div>
              <div class="text-body-2 grey--text text--darken-1">
                {{ s.text }}
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ================= TRANSPARENCY ================= -->
    <v-container class="py-12 py-md-16">
      <v-row align="center">
        <v-col cols="12" md="5">
          <div v-reveal>
            <div class="eyebrow mb-2">Transparency</div>
            <h2 class="section-title mb-4">
              See exactly why the bot said what it said
            </h2>
            <div class="text-body-1 grey--text text--darken-1 mb-6">
              Every reply has a "Why this answer" view: the FAQs and pages it
              used, the products it looked up, how long it took and what it
              cost. When something's wrong, fix the source in one click.
            </div>
            <div
              v-for="p in WHY_POINTS"
              :key="p"
              class="d-flex align-center text-body-1 grey--text text--darken-3 mb-3"
            >
              <v-icon size="18" color="success" class="mr-3"
                >$circle-check</v-icon
              >
              {{ p }}
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="7">
          <v-card v-reveal="120" outlined rounded="xl" class="lift">
            <div class="d-flex align-center px-5 py-4">
              <v-avatar
                size="34"
                tile
                color="primary lighten-5"
                class="rounded-lg mr-3"
              >
                <v-icon size="16" color="primary">$route</v-icon>
              </v-avatar>
              <div class="flex-grow-1 overflow-hidden">
                <div
                  class="text-body-2 font-weight-bold grey--text text--darken-4"
                >
                  Why this answer
                </div>
                <div
                  class="text-caption grey--text text--darken-1 text-truncate"
                >
                  "Is Activa EV available in Koramangala?"
                </div>
              </div>
              <v-chip
                x-small
                label
                color="green lighten-5"
                text-color="green darken-2"
                class="font-weight-bold"
              >
                Answered
              </v-chip>
            </div>
            <v-divider />
            <v-row no-gutters class="px-3 py-3">
              <v-col
                v-for="t in TRACE_STATS"
                :key="t.label"
                cols="6"
                sm="3"
                class="px-2 py-1"
              >
                <div class="text-caption grey--text">{{ t.label }}</div>
                <div
                  class="text-body-2 font-weight-bold grey--text text--darken-4"
                >
                  {{ t.value }}
                </div>
              </v-col>
            </v-row>
            <v-divider />
            <div class="pa-5">
              <div
                class="text-caption font-weight-bold text-uppercase grey--text mb-2"
              >
                Used in the answer
              </div>
              <v-sheet outlined rounded="lg">
                <template v-for="(b, i) in TRACE_SOURCES">
                  <v-divider v-if="i > 0" :key="`d-${i}`" />
                  <div :key="i" class="d-flex align-center flex-wrap px-4 py-2">
                    <v-chip
                      x-small
                      label
                      color="primary lighten-5"
                      text-color="primary"
                      class="font-weight-bold mr-3"
                    >
                      {{ b.kind }}
                    </v-chip>
                    <span class="text-body-2 grey--text text--darken-3 mr-2">{{
                      b.title
                    }}</span>
                    <v-spacer />
                    <v-icon size="14" color="success">$check</v-icon>
                  </div>
                </template>
              </v-sheet>
              <div class="text-center text-caption grey--text mt-3">
                Example
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- ================= PRICING ================= -->
    <section id="pricing" class="soft-band py-12 py-md-16">
      <v-container>
        <div v-reveal class="text-center mb-12">
          <div class="eyebrow mb-2">Pricing</div>
          <h2 class="section-title mb-3">Simple, transparent pricing</h2>
          <div class="text-body-1 grey--text text--darken-1">
            Flexible plans designed for growing businesses.
          </div>
        </div>
        <v-row justify="center" align="stretch">
          <v-col
            v-for="(plan, i) in PLANS"
            :key="plan.name"
            cols="12"
            sm="8"
            md="4"
          >
            <v-card
              v-reveal="i * 120"
              :outlined="!plan.featured"
              :color="plan.featured ? 'primary' : undefined"
              :dark="plan.featured"
              rounded="xl"
              :elevation="plan.featured ? 12 : 0"
              class="lift d-flex flex-column pa-7 fill-height"
            >
              <div class="d-flex align-center mb-4">
                <span
                  class="text-overline font-weight-bold"
                  :class="plan.featured ? 'white--text' : 'primary--text'"
                >
                  {{ plan.name }}
                </span>
                <v-spacer />
                <v-chip
                  v-if="plan.featured"
                  x-small
                  label
                  color="white"
                  class="primary--text font-weight-bold"
                >
                  Recommended
                </v-chip>
              </div>
              <div
                class="text-h3 font-weight-black mb-1"
                :class="plan.featured ? '' : 'grey--text text--darken-4'"
              >
                {{ plan.price }}
              </div>
              <div
                class="text-body-2 mb-6"
                :class="
                  plan.featured ? 'white--text' : 'grey--text text--darken-1'
                "
              >
                {{ plan.period }}
              </div>
              <div
                v-for="feat in plan.features"
                :key="feat"
                class="d-flex align-center text-body-2 mb-3"
              >
                <v-icon
                  size="16"
                  :color="plan.featured ? 'white' : 'success'"
                  class="mr-3"
                  >$circle-check</v-icon
                >
                <span
                  :class="
                    plan.featured ? 'white--text' : 'grey--text text--darken-3'
                  "
                  >{{ feat }}</span
                >
              </div>
              <v-spacer />
              <v-btn
                block
                x-large
                depressed
                :outlined="!plan.featured"
                :color="plan.featured ? 'white' : 'primary'"
                class="font-weight-bold mt-5"
                :class="plan.featured ? 'primary--text' : ''"
                to="/signup"
              >
                {{ plan.cta }}
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ================= SECURITY ================= -->
    <v-container class="py-12 py-md-16">
      <div v-reveal class="text-center mb-12">
        <div class="eyebrow mb-2">Safe by design</div>
        <h2 class="section-title mb-3">
          Built so nothing goes live by accident
        </h2>
        <div class="text-body-1 grey--text text--darken-1">
          Guardrails at every step, from your knowledge to your API keys.
        </div>
      </div>
      <v-row>
        <v-col v-for="(t, i) in TRUST" :key="t.title" cols="12" sm="6" md="4">
          <div v-reveal="(i % 3) * 100" class="d-flex align-start">
            <v-avatar
              size="42"
              tile
              color="green lighten-5"
              class="rounded-lg mr-4 flex-shrink-0"
            >
              <v-icon size="20" color="green darken-1">{{ t.icon }}</v-icon>
            </v-avatar>
            <div>
              <div
                class="text-subtitle-1 font-weight-bold grey--text text--darken-4 mb-1"
              >
                {{ t.title }}
              </div>
              <div class="text-body-2 grey--text text--darken-1">
                {{ t.text }}
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- ================= FAQ ================= -->
    <section id="faq" class="soft-band py-12 py-md-16">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" md="9" lg="8">
            <div v-reveal class="text-center mb-10">
              <div class="eyebrow mb-2">FAQ</div>
              <h2 class="section-title">Questions, answered</h2>
            </div>
            <v-expansion-panels v-reveal="100" flat>
              <v-expansion-panel
                v-for="q in FAQS"
                :key="q.q"
                class="faq-panel mb-3"
              >
                <v-expansion-panel-header
                  class="text-body-1 font-weight-bold grey--text text--darken-4 py-5"
                >
                  {{ q.q }}
                </v-expansion-panel-header>
                <v-expansion-panel-content
                  class="text-body-2 grey--text text--darken-2"
                >
                  {{ q.a }}
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- ================= FINAL CTA ================= -->
    <v-container class="py-12 py-md-16">
      <div v-reveal class="final-cta pa-8 pa-md-14 text-center white--text">
        <h2 class="text-h5 text-sm-h3 font-weight-black mb-4">
          Create your AI assistant today
        </h2>
        <div class="text-body-1 text-sm-h6 font-weight-regular mb-8 cta-sub">
          Import your website, test the answers in the sandbox, and go live when
          you're happy.
        </div>
        <div class="d-flex justify-center">
          <v-btn
            :x-large="!compactCta"
            :large="compactCta"
            depressed
            color="white"
            class="primary--text font-weight-bold flex-grow-1 flex-sm-grow-0 mr-3"
            @click="primaryAction"
          >
            {{ isLoggedIn ? "Go to dashboard" : "Try for free" }}
            <v-icon v-if="!compactCta" right size="18">$arrow-right</v-icon>
          </v-btn>
          <v-btn
            :x-large="!compactCta"
            :large="compactCta"
            outlined
            color="white"
            class="font-weight-bold flex-grow-1 flex-sm-grow-0"
            to="/signup"
          >
            Talk to us
          </v-btn>
        </div>
      </div>
    </v-container>

    <!-- ================= FOOTER ================= -->
    <v-divider />
    <v-container class="py-8">
      <v-row align="center">
        <v-col cols="12" md="5" class="d-flex align-center">
          <AppLogo size="32" class="mr-3" />
          <div>
            <div class="text-body-2 font-weight-black secondary--text">
              scraperAI
            </div>
            <div class="text-caption grey--text">
              AI customer support for WhatsApp and the web.
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="7" class="d-flex flex-wrap justify-md-end">
          <v-btn
            v-for="l in NAV"
            :key="l.id"
            text
            small
            color="grey darken-2"
            @click="scrollTo(l.id)"
          >
            {{ l.label }}
          </v-btn>
          <v-btn text small color="grey darken-2" to="/login">Sign in</v-btn>
          <v-btn text small color="grey darken-2" to="/signup"
            >Create account</v-btn
          >
        </v-col>
      </v-row>
      <div class="text-caption grey--text text-center text-md-left mt-4">
        &copy; {{ year }} scraperAI. All rights reserved.
      </div>
    </v-container>
  </div>
</template>

<script>
import AppLogo from "@/components/AppLogo.vue";
const NAV = [
  { id: "features", label: "Features" },
  { id: "how", label: "How it works" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQ" },
];

const HERO_POINTS = [
  "No code to install",
  "Replies in your customer's language",
  "Hands off to your team",
];

// Illustrative conversation built from real product behaviour; plays in a loop
const DEMO_CHAT = [
  {
    id: 1,
    from: "customer",
    text: "Hi, is Activa EV available in Koramangala this week?",
  },
  {
    id: 2,
    from: "bot",
    text: "Yes! Honda Activa EV is available at our Koramangala hub. Monthly rent is ₹5,599 for the first month, then ₹5,699. Shall I share the booking link?",
    sources: ["Product API", "FAQ: Our hubs"],
  },
  { id: 3, from: "customer", text: "Mera refund kab aayega?" },
  {
    id: 4,
    from: "bot",
    text: "Main aapko hamari team se connect kar raha hoon, woh jaldi aapse baat karenge.",
    sources: ["Handed to your team"],
  },
  { id: 5, from: "customer", text: "Is the Indiranagar hub open on Sunday?" },
  {
    id: 6,
    from: "bot",
    text: "This Sunday Indiranagar is closed for maintenance. Koramangala is open 9 am to 8 pm, and you can pick up from there.",
    sources: ["Notice: Indiranagar closed", "Business hours"],
  },
  { id: 7, from: "customer", text: "When does my current rental end?" },
  {
    id: 8,
    from: "bot",
    text: "Your rental L25J0126064 (EV) ends in 19 days, on 27 Oct. Would you like to extend it?",
    sources: ["Customer API: your bookings"],
  },
  { id: 9, from: "customer", text: "Any offer for a 3-month rental?" },
  {
    id: 10,
    from: "bot",
    text: "Yes, book 3 months or more and get ₹500 off the first month. The offer runs till 31 Oct.",
    sources: ["Notice: Festive offer"],
  },
];

const MARQUEE = [
  { icon: "$tag", label: "Prices" },
  { icon: "$layers", label: "Availability" },
  { icon: "$calendar", label: "Bookings" },
  { icon: "$rotate-ccw", label: "Refunds" },
  { icon: "$clock", label: "Opening hours" },
  { icon: "$sparkles", label: "Offers" },
  { icon: "$file-text", label: "Policies" },
  { icon: "$map-pin", label: "Locations" },
  { icon: "$user-search", label: "My dues" },
  { icon: "$message-circle-question-mark", label: "How it works" },
];

const HIGHLIGHTS = [
  {
    icon: "$folder-open",
    tone: "indigo",
    title: "Learns your business, no coding",
    text: "Import website pages, FAQ sheets, notes and PDF or Word documents. You decide what's published.",
    demo: ["Website import", "FAQ CSV upload", "PDF and Word documents"],
  },
  {
    icon: "$shield-check",
    tone: "green",
    title: "Checked before it goes live",
    text: "Contradictions, duplicates and private details are caught on publish, and old offers expire on their date.",
    demo: ["Contradiction checks", "Private data blocked", "Valid-until dates"],
  },
  {
    icon: "$tag",
    tone: "teal",
    title: "Live prices, never made up",
    text: "Connect your product and customer APIs and the bot quotes real prices, stock and bookings.",
    demo: [
      "Live product lookup",
      "Customer bookings and dues",
      "Field mapping, no dev work",
    ],
  },
];

const FEATURES = [
  {
    icon: "$headset",
    tone: "deep-orange",
    title: "Hands off to your team",
    text: "Keywords, a confidence threshold and reply limits send chats to a person.",
  },
  {
    icon: "$route",
    tone: "purple",
    title: "Why this answer",
    text: "Every reply shows the knowledge, lookups, time and cost behind it.",
  },
  {
    icon: "$activity",
    tone: "red",
    title: "Bot health and alerts",
    text: "Errors, speed and AI cost per day, with emails when something breaks.",
  },
  {
    icon: "$flask-conical",
    tone: "blue",
    title: "Test before customers see",
    text: "A sandbox and answer-quality test runs, compared against a baseline.",
  },
  {
    icon: "$message-circle-question-mark",
    tone: "amber",
    title: "Learns from gaps",
    text: "Questions it couldn't answer become FAQs once you answer them.",
  },
  {
    icon: "$calendar",
    tone: "teal",
    title: "Notices",
    text: "Closures, special hours and offers the bot mentions until they end.",
  },
  {
    icon: "$users",
    tone: "blue-grey",
    title: "Team and roles",
    text: "Invite your team and decide exactly what each person can do.",
  },
  {
    icon: "$globe",
    tone: "indigo",
    title: "Many languages",
    text: "Replies in the customer's language, including Hindi and Hinglish.",
  },
];

const STEPS = [
  {
    icon: "$globe",
    title: "Connect your content",
    text: "Import your website and add FAQs, notes or documents.",
  },
  {
    icon: "$user-cog",
    title: "Shape the bot",
    text: "Set its name, tone, business facts, rules and when to escalate.",
  },
  {
    icon: "$flask-conical",
    title: "Test it safely",
    text: "Chat in the sandbox and run answer-quality tests. Customers see nothing yet.",
  },
  {
    icon: "$rocket",
    title: "Go live",
    text: "Add the widget to your site or connect WhatsApp, then switch over in one step.",
  },
];

const WHY_POINTS = [
  "FAQs, notes and pages used for each reply",
  "Product and customer lookups it made",
  "Answer time, tokens and AI cost",
];

const TRACE_STATS = [
  { label: "Intent", value: "Availability" },
  { label: "Answer time", value: "2.1 s" },
  { label: "Product lookup", value: "In-stock list" },
  { label: "Channel", value: "WhatsApp" },
];

const TRACE_SOURCES = [
  { kind: "FAQ", title: "Which hubs do you have?" },
  { kind: "Product", title: "Honda Activa EV · in stock · ₹5,599/month" },
  { kind: "Page", title: "Rent Honda Activa EV in Bangalore" },
];

const PLANS = [
  {
    name: "Starter",
    price: "₹0",
    period: "Free forever for developers",
    features: ["1,000 messages/mo", "1 Data Source", "Community Support"],
    cta: "Get Started",
  },
  {
    name: "Pro",
    price: "₹6,999",
    period: "Per month, billed yearly",
    features: [
      "Unlimited messages",
      "Priority RAG Pipeline",
      "GST Invoicing",
      "Custom Branding",
    ],
    cta: "Start 14-Day Trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "For high-scale organizations",
    features: [
      "On-premise Deployment",
      "Dedicated Account Manager",
      "SLA Guarantee",
      "24/7 Phone Support",
    ],
    cta: "Contact Sales",
  },
];

const TRUST = [
  {
    icon: "$flask-conical",
    title: "Staged go-live",
    text: "New knowledge is tested in a sandbox and switched over in one step.",
  },
  {
    icon: "$shield-check",
    title: "Checks on publish",
    text: "Contradictions, duplicates and private details are flagged before customers see them.",
  },
  {
    icon: "$lock",
    title: "Encrypted keys",
    text: "API keys and tokens are stored encrypted and never shown again.",
  },
  {
    icon: "$network",
    title: "IP allowlist",
    text: "Restrict API access to the IP addresses you trust.",
  },
  {
    icon: "$shield-user",
    title: "Roles and permissions",
    text: "Give each team member only the access they need.",
  },
  {
    icon: "$globe-lock",
    title: "Locked widget",
    text: "The chat widget only works on the domains you allow.",
  },
];

const FAQS = [
  {
    q: "Do I need a developer to set it up?",
    a: "No. Import your website from the dashboard, then add one script tag to your site for the chat widget, or connect your WhatsApp Business number. Connecting a product or customer API is optional.",
  },
  {
    q: "Where does the bot get its answers?",
    a: "Only from the knowledge you publish (website pages, FAQs, notes and documents), your Bot Profile's business facts, and your product and customer APIs if you connect them. If it can't answer, the question is saved so you can answer it once and the bot learns it.",
  },
  {
    q: "Will it make up prices?",
    a: "You choose where prices come from. With a product API connected, the bot can quote only live product data, so it never invents a price.",
  },
  {
    q: "Can customers talk to a person?",
    a: "Yes. Chats are handed to your team on escalation keywords, when the bot isn't confident enough, or after a set number of AI replies. Your team gets alert emails and can take over from the inbox.",
  },
  {
    q: "Which languages does it support?",
    a: "The bot can reply in the customer's language, including Hindi and Hinglish, and you can list the languages you want it to use.",
  },
  {
    q: "How is my data protected?",
    a: "API keys and tokens are encrypted and never shown again after you save them. You can restrict API access to your own IP addresses and limit what each team member can do with roles.",
  },
];

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// v-reveal: fade content up when it scrolls into view. Optional delay in ms.
const reveal = {
  inserted(el, binding) {
    el.classList.add("reveal");
    if (binding.value) el.style.transitionDelay = `${binding.value}ms`;
    if (reducedMotion() || !("IntersectionObserver" in window)) {
      el.classList.add("reveal--in");
      return;
    }
    el._revealObserver = new IntersectionObserver(
      (entries, observer) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("reveal--in");
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    el._revealObserver.observe(el);
  },
  unbind(el) {
    if (el._revealObserver) el._revealObserver.disconnect();
  },
};

export default {
  name: "LandingPage",

  components: { AppLogo },

  directives: { reveal },

  data: () => ({
    isLoggedIn: false,
    year: new Date().getFullYear(),
    shownCount: 0,
    botTyping: false,
    chatTimer: null,
    NAV,
    HERO_POINTS,
    MARQUEE_DOUBLE: [...MARQUEE, ...MARQUEE],
    HIGHLIGHTS,
    FEATURES,
    STEPS,
    WHY_POINTS,
    TRACE_STATS,
    TRACE_SOURCES,
    PLANS,
    TRUST,
    FAQS,
  }),

  watch: {
    // Keep the newest message (or the typing dots) in view
    shownCount: "scrollChat",
    botTyping: "scrollChat",
  },

  computed: {
    // Phones: smaller buttons so a pair fits on one line
    compactCta() {
      return this.$vuetify.breakpoint.xsOnly;
    },

    shownMessages() {
      return DEMO_CHAT.slice(0, this.shownCount);
    },
  },

  mounted() {
    this.isLoggedIn = !!localStorage.getItem("user-token");
    if (reducedMotion()) {
      this.shownCount = DEMO_CHAT.length;
    } else {
      this.playChat();
    }
  },

  beforeDestroy() {
    clearTimeout(this.chatTimer);
  },

  methods: {
    primaryAction() {
      this.$router.push(this.isLoggedIn ? "/dashboard" : "/signup");
    },

    // Plays the example chat one message at a time, with a typing pause
    // before each bot reply, then starts over.
    playChat() {
      const next = DEMO_CHAT[this.shownCount];
      if (!next) {
        this.chatTimer = setTimeout(() => {
          this.shownCount = 0;
          this.playChat();
        }, 4500);
        return;
      }
      if (next.from === "bot") {
        this.botTyping = true;
        this.chatTimer = setTimeout(() => {
          this.botTyping = false;
          this.shownCount += 1;
          this.chatTimer = setTimeout(this.playChat, 1400);
        }, 1300);
      } else {
        this.chatTimer = setTimeout(
          () => {
            this.shownCount += 1;
            this.playChat();
          },
          this.shownCount === 0 ? 500 : 900,
        );
      }
    },

    scrollChat() {
      this.$nextTick(() => {
        const ref = this.$refs.chatBody;
        const el = ref && (ref.$el || ref);
        if (!el) return;
        // Back to the top when the demo restarts
        const top = this.shownCount === 0 ? 0 : el.scrollHeight;
        el.scrollTo({ top, behavior: reducedMotion() ? "auto" : "smooth" });
      });
    },

    // Smooth scroll, leaving room for the fixed top bar
    scrollTo(id) {
      const el = document.getElementById(id);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: "smooth" });
    },
  },
};
</script>

<style scoped>
/* ---------- Top bar ---------- */
.landing-bar {
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid rgba(17, 24, 39, 0.06) !important;
}

/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  padding: 24px 0 48px;
  background: radial-gradient(
      1200px 500px at 15% -10%,
      #eef0fe 0%,
      rgba(238, 240, 254, 0) 60%
    ),
    radial-gradient(
      900px 500px at 100% 20%,
      #f3e8ff 0%,
      rgba(243, 232, 255, 0) 55%
    ),
    #ffffff;
}

@media (min-width: 960px) {
  .hero {
    padding: 64px 0 88px;
  }
}

.hero__inner {
  position: relative;
  z-index: 1;
}

.hero__badge {
  border: 1px solid rgba(108, 110, 246, 0.2) !important;
  color: #3f3fbf !important;
  border-radius: 6px !important;
}

.hero__title {
  font-size: clamp(2rem, 4.6vw, 3.4rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: #1f2330;
}

.text-gradient {
  background: linear-gradient(90deg, #6c6ef6 0%, #a855f7 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.45;
  animation: float 14s ease-in-out infinite;
  pointer-events: none;
}

.blob--one {
  width: 380px;
  height: 380px;
  background: #c7c8fb;
  top: -120px;
  right: 8%;
}

.blob--two {
  width: 300px;
  height: 300px;
  background: #e9d5ff;
  bottom: -120px;
  left: 4%;
  animation-delay: -6s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(24px, -18px) scale(1.06);
  }
}

.cta-btn {
  box-shadow: 0 10px 24px rgba(108, 110, 246, 0.35) !important;
}

/* ---------- Example chat ---------- */
.chat-shell {
  max-width: 460px;
}

/* Fixed size so the card never grows or shifts the page while the demo
   plays. Messages start at the top; new ones scroll into view. */
.chat-body {
  height: 360px;
  overflow: hidden;
}

@media (max-width: 599px) {
  .chat-body {
    height: 320px;
  }
}

.bubble {
  max-width: 84%;
  padding: 8px 12px;
  border-radius: 10px;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
}

.bubble--me {
  background: #d9fdd3;
  border-top-right-radius: 2px;
}

.bubble--bot {
  background: #fff;
  border-top-left-radius: 2px;
}

.source-chip {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  color: #3f3fbf;
  background: #eef0fe;
  border-radius: 6px;
  padding: 2px 6px;
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

.msg-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.msg-leave-active {
  transition: opacity 0.4s ease;
}

.msg-leave-to {
  opacity: 0;
}

.msg-enter {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* ---------- Marquee ---------- */
.marquee-wrap {
  border-top: 1px solid rgba(17, 24, 39, 0.06);
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
}

.marquee {
  overflow: hidden;
  mask-image: linear-gradient(
    90deg,
    transparent,
    #000 10%,
    #000 90%,
    transparent
  );
  -webkit-mask-image: linear-gradient(
    90deg,
    transparent,
    #000 10%,
    #000 90%,
    transparent
  );
}

.marquee__track {
  display: flex;
  width: max-content;
  animation: marquee 32s linear infinite;
}

.marquee:hover .marquee__track {
  animation-play-state: paused;
}

.marquee__item {
  display: inline-flex;
  align-items: center;
  margin: 0 10px;
  padding: 10px 18px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  color: #3d4152;
  background: #fff;
  white-space: nowrap;
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

/* ---------- Sections ---------- */
.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6c6ef6;
}

.section-title {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #1f2330;
}

.soft-band {
  background: #f7f7fe;
}

.step-number {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(90deg, #6c6ef6, #a855f7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.lift {
  transition: transform 0.25s ease, box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(17, 24, 39, 0.08) !important;
}

.faq-panel {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px !important;
}

.faq-panel::before {
  box-shadow: none !important;
}

/* ---------- Final CTA ---------- */
.final-cta {
  border-radius: 24px;
  background: linear-gradient(120deg, #4f46e5 0%, #6c6ef6 45%, #a855f7 100%);
  background-size: 200% 200%;
  animation: shimmer 10s ease infinite;
  box-shadow: 0 24px 48px rgba(108, 110, 246, 0.3);
}

.cta-sub {
  opacity: 0.9;
}

@keyframes shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* ---------- Reveal on scroll ---------- */
.reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal--in {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .blob,
  .marquee__track,
  .final-cta,
  .typing span {
    animation: none !important;
  }

  .reveal,
  .lift {
    transition: none !important;
    transform: none !important;
  }

  .reveal {
    opacity: 1 !important;
  }
}
</style>
