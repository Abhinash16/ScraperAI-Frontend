<template>
  <div class="landing">
    <a href="#main" class="skip-link">Skip to content</a>

    <!-- ================= TOP BAR ================= -->
    <v-app-bar
      app
      flat
      elevate-on-scroll
      color="rgba(255,255,255,0.88)"
      :height="$vuetify.breakpoint.xsOnly ? 60 : 68"
      class="landing-bar"
    >
      <!-- No extra container padding on phones: the bar already has its own -->
      <v-container class="d-flex align-center py-0 px-0 px-sm-3">
        <router-link to="/" class="d-flex align-center text-decoration-none" aria-label="scraperAI home">
          <AppLogo variant="wordmark" :size="$vuetify.breakpoint.xsOnly ? 30 : 36" />
        </router-link>

        <v-spacer />

        <nav class="hidden-md-and-down" aria-label="Page sections">
          <v-btn
            v-for="l in NAV"
            :key="l.id"
            text
            color="#3d4152"
            class="font-weight-bold nav-btn"
            @click="scrollTo(l.id)"
          >
            {{ l.label }}
          </v-btn>
        </nav>

        <v-btn
          v-if="isLoggedIn"
          text
          color="#3d4152"
          class="font-weight-bold ml-2 hidden-xs-only"
          to="/dashboard"
        >
          <v-icon left size="16">$layout-dashboard</v-icon>
          Dashboard
        </v-btn>
        <v-btn v-else text color="#3d4152" class="font-weight-bold ml-2 hidden-xs-only" to="/login">
          Sign in
        </v-btn>
        <v-btn
          depressed
          dark
          :href="MAILTO"
          class="brand-btn font-weight-bold ml-2"
          :small="$vuetify.breakpoint.xsOnly"
        >
          <v-icon left size="16">$mail</v-icon>
          Talk to us
        </v-btn>

        <v-menu offset-y left nudge-bottom="8">
          <template #activator="{ on, attrs }">
            <v-btn icon class="ml-1 hidden-lg-and-up" aria-label="Menu" v-bind="attrs" v-on="on">
              <v-icon>$menu</v-icon>
            </v-btn>
          </template>
          <v-card width="240" outlined rounded="lg">
            <v-list dense nav class="py-2">
              <v-list-item v-for="l in NAV" :key="l.id" @click="scrollTo(l.id)">
                <v-list-item-title class="font-weight-bold">{{ l.label }}</v-list-item-title>
              </v-list-item>
              <v-divider class="my-1" />
              <v-list-item :to="isLoggedIn ? '/dashboard' : '/login'">
                <v-list-item-title class="font-weight-bold">
                  {{ isLoggedIn ? "Dashboard" : "Sign in" }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-card>
        </v-menu>
      </v-container>
    </v-app-bar>

    <main id="main">
      <!-- ================= HERO ================= -->
      <section class="hero">
        <div class="blob blob--one" aria-hidden="true" />
        <div class="blob blob--two" aria-hidden="true" />
        <v-container class="hero__inner">
          <v-row align="center">
            <v-col cols="12" md="7">
              <div v-reveal>
                <span class="hero__badge mb-6">
                  <v-icon left size="14" :color="BRAND.blue">$sparkles</v-icon>
                  AI agent for WhatsApp and your website · phone calls coming soon
                </span>
              </div>
              <h1 v-reveal="80" class="hero__title mb-5">
                An AI agent that answers, sells and
                <span class="text-gradient">gets things done</span>
                for your customers.
              </h1>
              <p v-reveal="160" class="hero__lead mb-8">
                scraperAI answers from your own knowledge, knows each customer's bookings and dues,
                sends payment links, books, and raises service requests in your system, always after
                the customer says yes. Your team steps in whenever it's needed.
              </p>
              <div v-reveal="240" class="d-flex flex-wrap">
                <v-btn
                  :x-large="!compactCta"
                  :large="compactCta"
                  depressed
                  dark
                  :href="MAILTO"
                  class="brand-btn cta-btn font-weight-bold mr-3 mb-3"
                >
                  <v-icon left size="18">$mail</v-icon>
                  Talk to us
                </v-btn>
                <v-btn
                  :x-large="!compactCta"
                  :large="compactCta"
                  outlined
                  :color="BRAND.blue"
                  class="font-weight-bold mb-3"
                  @click="scrollTo('examples')"
                >
                  See real conversations
                </v-btn>
              </div>
              <ul v-reveal="320" class="hero__points mt-1">
                <li v-for="p in HERO_POINTS" :key="p">
                  <v-icon size="16" color="#16a34a" class="mr-2">$circle-check</v-icon>
                  {{ p }}
                </li>
              </ul>
            </v-col>

            <!-- Animated example chat -->
            <v-col cols="12" md="5">
              <div v-reveal="200" class="chat-shell mx-auto">
                <ChatCard
                  :messages="shownMessages"
                  :typing="botTyping"
                  title="Booking on WhatsApp"
                  fixed
                  @body="chatBody = $event"
                />
                <div class="text-center text-caption grey--text text--darken-1 mt-3">
                  Example from the sandbox: the bike isn't free at one hub, so the bot offers another.
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= CHANNELS ================= -->
      <section id="channels" class="py-12 py-md-16">
        <v-container>
          <SectionHead
            eyebrow="Where it works"
            title="One agent on every channel your customers use"
            text="The same agent, with the same knowledge and rules, answers wherever your customers write to you."
          />
          <v-row>
            <v-col v-for="(c, i) in CHANNELS" :key="c.title" cols="12" md="4">
              <v-card v-reveal="i * 100" outlined rounded="xl" class="lift pa-6 fill-height">
                <div class="d-flex align-center mb-4">
                  <div class="icon-tile"><v-icon size="22" :color="BRAND.blue">{{ c.icon }}</v-icon></div>
                  <v-spacer />
                  <span v-if="c.soon" class="soon-chip">Coming soon</span>
                  <span v-else class="live-chip">Live</span>
                </div>
                <h3 class="card-title mb-2">{{ c.title }}</h3>
                <p class="card-text mb-0">{{ c.text }}</p>
              </v-card>
            </v-col>
          </v-row>
          <v-card v-reveal outlined rounded="xl" class="media-band pa-5 pa-md-6 mt-6">
            <v-row align="center">
              <v-col cols="12" md="4">
                <h3 class="card-title mb-1">Photos, voice notes and location pins on WhatsApp</h3>
                <p class="card-text mb-0">
                  The bot reads what customers send, not only text, and answers it.
                </p>
              </v-col>
              <v-col v-for="m in MEDIA" :key="m.title" cols="12" sm="4" md="">
                <div class="d-flex align-start">
                  <v-icon size="20" :color="BRAND.violet" class="mr-3 mt-1">{{ m.icon }}</v-icon>
                  <div>
                    <div class="font-weight-bold ink--text">{{ m.title }}</div>
                    <div class="text-body-2 muted--text">{{ m.text }}</div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-container>
      </section>

      <!-- ================= KNOWLEDGE + CUSTOMER ================= -->
      <section id="knows" class="soft-band py-12 py-md-16">
        <v-container>
          <SectionHead
            eyebrow="What it knows"
            title="Your business, and each customer"
            text="The bot answers only from what you give it. It never guesses a price, a date or a policy."
          />
          <v-row>
            <v-col v-for="(k, i) in KNOWS" :key="k.title" cols="12" md="6">
              <v-card v-reveal="i * 120" outlined rounded="xl" class="pa-6 fill-height">
                <div class="d-flex align-center mb-4">
                  <div class="icon-tile mr-3"><v-icon size="22" :color="BRAND.blue">{{ k.icon }}</v-icon></div>
                  <h3 class="card-title">{{ k.title }}</h3>
                </div>
                <p class="card-text mb-4">{{ k.text }}</p>
                <ul class="check-list">
                  <li v-for="p in k.points" :key="p">
                    <v-icon size="16" color="#16a34a" class="mr-2">$check</v-icon>{{ p }}
                  </li>
                </ul>
                <div class="example-line mt-5">
                  <span class="example-line__label">Example</span>
                  {{ k.example }}
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= ACTIONS ================= -->
      <section id="actions" class="py-12 py-md-16">
        <v-container>
          <SectionHead
            eyebrow="Actions"
            title="It doesn't just answer. It does the job."
            text="The bot carries out tasks in your own system: payment links, bookings and service requests, always after the customer says yes. Actions run on WhatsApp, and on your website for signed-in customers."
          />
          <v-row>
            <v-col v-for="(a, i) in ACTIONS" :key="a.title" cols="12" sm="6" lg="3">
              <v-card v-reveal="(i % 4) * 90" outlined rounded="xl" class="lift pa-6 fill-height d-flex flex-column">
                <div class="icon-tile mb-4"><v-icon size="22" :color="BRAND.blue">{{ a.icon }}</v-icon></div>
                <h3 class="card-title mb-2">{{ a.title }}</h3>
                <p class="card-text mb-4">{{ a.text }}</p>
                <ol class="flow mt-auto">
                  <li v-for="s in a.flow" :key="s">{{ s }}</li>
                </ol>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col v-for="(g, i) in GUARANTEES" :key="g.title" cols="12" md="4">
              <div v-reveal="i * 100" class="guarantee d-flex align-start pa-5 fill-height">
                <v-icon size="22" color="#16a34a" class="mr-3 mt-1">{{ g.icon }}</v-icon>
                <div>
                  <div class="font-weight-bold ink--text mb-1">{{ g.title }}</div>
                  <div class="text-body-2 muted--text">{{ g.text }}</div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= AGENTS ================= -->
      <section id="agents" class="soft-band py-12 py-md-16">
        <v-container>
          <SectionHead
            eyebrow="Two agents"
            title="A sales agent and a service agent, in one bot"
            text="Switch on the jobs you need. Each one follows your rules and reports what it achieved."
          />
          <v-row>
            <!-- Sales -->
            <v-col cols="12" md="6">
              <v-card v-reveal outlined rounded="xl" class="pa-6 fill-height">
                <div class="d-flex align-center mb-4">
                  <div class="icon-tile icon-tile--warm mr-3"><v-icon size="22" color="#ea580c">$handshake</v-icon></div>
                  <div>
                    <h3 class="card-title">Sales Agent</h3>
                    <div class="text-body-2 muted--text">Helps interested customers choose and book</div>
                  </div>
                </div>
                <ul class="check-list mb-5">
                  <li v-for="p in SALES_POINTS" :key="p">
                    <v-icon size="16" color="#16a34a" class="mr-2">$check</v-icon>{{ p }}
                  </li>
                </ul>
                <div class="text-caption font-weight-bold text-uppercase muted--text mb-2">
                  Every chat is scored as a lead
                </div>
                <ol class="stages" aria-label="Lead stages, in order">
                  <li v-for="(s, i) in STAGES" :key="s.label" :style="{ '--stage': i }">
                    <span class="stages__name">{{ s.label }}</span>
                    <span class="stages__help">{{ s.help }}</span>
                  </li>
                </ol>
              </v-card>
            </v-col>
            <!-- Service -->
            <v-col cols="12" md="6">
              <v-card v-reveal="120" outlined rounded="xl" class="pa-6 fill-height">
                <div class="d-flex align-center mb-4">
                  <div class="icon-tile mr-3"><v-icon size="22" :color="BRAND.blue">$headset</v-icon></div>
                  <div>
                    <h3 class="card-title">SR Agent</h3>
                    <div class="text-body-2 muted--text">Handles service questions and service requests (SRs)</div>
                  </div>
                </div>
                <ul class="check-list mb-5">
                  <li v-for="p in SERVICE_POINTS" :key="p">
                    <v-icon size="16" color="#16a34a" class="mr-2">$check</v-icon>{{ p }}
                  </li>
                </ul>
                <div class="text-caption font-weight-bold text-uppercase muted--text mb-2">What it can do with an SR</div>
                <div class="d-flex flex-wrap">
                  <span v-for="s in SR_VERBS" :key="s" class="pill mr-2 mb-2">{{ s }}</span>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= EXAMPLES ================= -->
      <section id="examples" class="py-12 py-md-16">
        <v-container>
          <SectionHead
            eyebrow="Real examples"
            title="See how a conversation goes"
            text="Built from conversations in our sandbox. Names, numbers and links are examples."
          />
          <div v-reveal class="d-flex justify-center mb-6">
            <div class="example-tabs" role="tablist" aria-label="Example conversations">
              <button
                v-for="(e, i) in EXAMPLES"
                :id="`example-tab-${i}`"
                :key="e.id"
                type="button"
                role="tab"
                :aria-selected="String(example === i)"
                :aria-controls="`example-panel-${i}`"
                :tabindex="example === i ? 0 : -1"
                class="example-tabs__tab"
                :class="{ 'example-tabs__tab--on': example === i }"
                @click="example = i"
                @keydown.right.prevent="moveExample(1)"
                @keydown.left.prevent="moveExample(-1)"
              >
                <v-icon size="16" class="mr-2" :color="example === i ? 'white' : BRAND.blue">{{ e.icon }}</v-icon>
                {{ e.label }}
              </button>
            </div>
          </div>
          <v-row
            :id="`example-panel-${example}`"
            justify="center"
            align="center"
            role="tabpanel"
            :aria-labelledby="`example-tab-${example}`"
          >
            <v-col cols="12" md="6" lg="5">
              <ChatCard :messages="EXAMPLES[example].messages" :title="EXAMPLES[example].title" />
            </v-col>
            <v-col cols="12" md="5" lg="4">
              <h3 class="card-title mb-3">What happened</h3>
              <ol class="steps-list">
                <li v-for="s in EXAMPLES[example].notes" :key="s">{{ s }}</li>
              </ol>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= REPORTS ================= -->
      <section id="reports" class="soft-band py-12 py-md-16">
        <v-container>
          <SectionHead
            eyebrow="Reports"
            title="See what the bot achieved, and why it said what it said"
            text="Results for each agent, a reason behind every reply, and daily checks on your knowledge."
          />
          <v-row>
            <v-col cols="12" lg="7">
              <v-card v-reveal outlined rounded="xl" class="pa-5 fill-height">
                <div class="d-flex align-center mb-4">
                  <div class="icon-tile icon-tile--warm mr-3"><v-icon size="20" color="#ea580c">$handshake</v-icon></div>
                  <div class="flex-grow-1">
                    <div class="font-weight-bold ink--text">Sales Agent · last 30 days</div>
                    <div class="text-caption muted--text">Example report</div>
                  </div>
                </div>
                <v-row dense>
                  <v-col v-for="k in REPORT_SALES" :key="k.label" cols="6" sm="4">
                    <div class="kpi">
                      <div class="kpi__label">{{ k.label }}</div>
                      <div class="kpi__value">{{ k.value }}</div>
                    </div>
                  </v-col>
                </v-row>
                <div class="d-flex align-center mt-6 mb-4">
                  <div class="icon-tile mr-3"><v-icon size="20" :color="BRAND.blue">$headset</v-icon></div>
                  <div class="flex-grow-1">
                    <div class="font-weight-bold ink--text">SR Agent · last 30 days</div>
                    <div class="text-caption muted--text">Example report</div>
                  </div>
                </div>
                <v-row dense>
                  <v-col v-for="k in REPORT_SERVICE" :key="k.label" cols="6" sm="4">
                    <div class="kpi">
                      <div class="kpi__label">{{ k.label }}</div>
                      <div class="kpi__value">{{ k.value }}</div>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
            <v-col cols="12" lg="5">
              <v-card v-for="(r, i) in REPORT_MORE" :key="r.title" v-reveal="(i + 1) * 100" outlined rounded="xl" class="pa-5 mb-4">
                <div class="d-flex align-start">
                  <div class="icon-tile mr-3 flex-shrink-0"><v-icon size="20" :color="BRAND.blue">{{ r.icon }}</v-icon></div>
                  <div>
                    <h3 class="card-title mb-1">{{ r.title }}</h3>
                    <p class="card-text mb-0">{{ r.text }}</p>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= HANDOVER ================= -->
      <section class="py-12 py-md-16">
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="5">
              <div v-reveal>
                <div class="eyebrow mb-2">Your team stays in control</div>
                <h2 class="section-title mb-4">Hands over to a person when it should</h2>
                <p class="section-text mb-0">
                  The bot knows its limits. When a chat needs a person, it hands over, tells your team, and
                  your team replies from the same inbox.
                </p>
              </div>
            </v-col>
            <v-col cols="12" md="7">
              <v-row dense>
                <v-col v-for="(h, i) in HANDOVER" :key="h.title" cols="12" sm="6">
                  <div v-reveal="i * 80" class="handover pa-4 fill-height">
                    <v-icon size="20" :color="BRAND.violet" class="mb-2">{{ h.icon }}</v-icon>
                    <div class="font-weight-bold ink--text mb-1">{{ h.title }}</div>
                    <div class="text-body-2 muted--text">{{ h.text }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= HOW IT WORKS ================= -->
      <section id="how" class="soft-band py-12 py-md-16">
        <v-container>
          <SectionHead
            eyebrow="How it works"
            title="From first chat to full agent, step by step"
            text="Start with answers, then add customer data and actions when you're ready. Everything is tested in a sandbox before customers see it."
          />
          <ol class="how">
            <li v-for="(s, i) in STEPS" :key="s.title" v-reveal="i * 90" class="how__step">
              <div class="how__num" aria-hidden="true">{{ i + 1 }}</div>
              <v-icon size="22" :color="BRAND.blue" class="mb-2">{{ s.icon }}</v-icon>
              <h3 class="card-title mb-1">{{ s.title }}</h3>
              <p class="card-text mb-0">{{ s.text }}</p>
            </li>
          </ol>
        </v-container>
      </section>

      <!-- ================= SECURITY ================= -->
      <section class="py-12 py-md-16">
        <v-container>
          <SectionHead
            eyebrow="Safe by design"
            title="Built so nothing goes wrong by accident"
            text="Guardrails at every step, from your knowledge to your API keys."
          />
          <v-row>
            <v-col v-for="(t, i) in TRUST" :key="t.title" cols="12" sm="6" md="4">
              <div v-reveal="(i % 3) * 100" class="d-flex align-start">
                <div class="icon-tile icon-tile--green mr-4 flex-shrink-0">
                  <v-icon size="20" color="#16a34a">{{ t.icon }}</v-icon>
                </div>
                <div>
                  <h3 class="card-title mb-1">{{ t.title }}</h3>
                  <p class="card-text mb-0">{{ t.text }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= FAQ ================= -->
      <section id="faq" class="soft-band py-12 py-md-16">
        <v-container>
          <v-row justify="center">
            <v-col cols="12" md="9" lg="8">
              <SectionHead eyebrow="FAQ" title="Questions, answered" />
              <v-expansion-panels v-reveal="100" flat>
                <v-expansion-panel v-for="q in FAQS" :key="q.q" class="faq-panel mb-3">
                  <v-expansion-panel-header class="text-body-1 font-weight-bold ink--text py-5">
                    {{ q.q }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content class="text-body-2 muted--text">
                    {{ q.a }}
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-container>
      </section>

      <!-- ================= CONTACT ================= -->
      <section id="contact" class="py-12 py-md-16">
        <v-container>
          <div v-reveal class="final-cta pa-8 pa-md-14 text-center white--text">
            <h2 class="text-h5 text-sm-h3 font-weight-black mb-4">Talk to us</h2>
            <p class="text-body-1 text-sm-h6 font-weight-regular mb-2 cta-sub">
              Pricing depends on your channels and volume. Tell us about your business and we'll set it
              up with you.
            </p>
            <p class="text-body-1 mb-8 cta-sub">
              Write to us at
              <a :href="MAILTO" class="cta-mail">{{ CONTACT_EMAIL }}</a>
            </p>
            <v-btn
              :x-large="!compactCta"
              :large="compactCta"
              depressed
              color="white"
              :href="MAILTO"
              class="font-weight-bold brand-text"
            >
              <v-icon left size="18" :color="BRAND.blue">$mail</v-icon>
              Email {{ CONTACT_EMAIL }}
            </v-btn>
          </div>
        </v-container>
      </section>
    </main>

    <!-- ================= FOOTER ================= -->
    <v-divider />
    <footer>
      <v-container class="py-8">
        <v-row align="center">
          <v-col cols="12" md="5">
            <AppLogo variant="wordmark" size="32" class="mb-1" />
            <div class="text-caption muted--text">
              AI agent for WhatsApp and your website. Phone calls coming soon.
            </div>
            <a :href="MAILTO" class="footer-mail d-inline-flex align-center mt-2">
              <v-icon size="14" :color="BRAND.blue" class="mr-1">$mail</v-icon>{{ CONTACT_EMAIL }}
            </a>
          </v-col>
          <v-col cols="12" md="7" class="d-flex flex-wrap justify-md-end">
            <v-btn v-for="l in NAV" :key="l.id" text small color="#4b5163" @click="scrollTo(l.id)">
              {{ l.label }}
            </v-btn>
            <v-btn text small color="#4b5163" :to="isLoggedIn ? '/dashboard' : '/login'">
              {{ isLoggedIn ? "Dashboard" : "Sign in" }}
            </v-btn>
          </v-col>
        </v-row>
        <div class="text-caption muted--text text-center text-md-left mt-4">
          &copy; {{ year }} scraperAI. All rights reserved.
        </div>
      </v-container>
    </footer>
  </div>
</template>

<script>
import AppLogo from "@/components/AppLogo.vue";

// Colours from the logo (public/brand): sky → royal blue → violet, navy ink
const BRAND = {
  sky: "#2188FA",
  blue: "#1E38F4",
  violet: "#5D24EB",
  ink: "#0B1230",
};

const CONTACT_EMAIL = "info@on-track.in";
const MAILTO = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("scraperAI for my business")}`;

const NAV = [
  { id: "channels", label: "What it does" },
  { id: "actions", label: "Actions" },
  { id: "agents", label: "Sales & service" },
  { id: "examples", label: "Examples" },
  { id: "reports", label: "Reports" },
  { id: "how", label: "How it works" },
  { id: "contact", label: "Contact" },
];

const HERO_POINTS = [
  "Live on WhatsApp and your website",
  "Prices, links and IDs only from your system",
  "Can reply in your customer's language",
];

// The sandbox booking flow; plays in a loop in the hero
const HERO_CHAT = [
  { id: 1, from: "customer", text: "I want to rent CT 100" },
  {
    id: 2,
    from: "bot",
    text: "Sure! CT 100 is available for monthly rental. Which hub would you like to pick it up from?",
    sources: ["Product API"],
  },
  { id: 3, from: "customer", text: "Koramangala" },
  {
    id: 4,
    from: "bot",
    text: "CT 100 isn't free at Koramangala right now, but Malleshwaram has one. Shall I book it there?",
    sources: ["Stock by hub"],
  },
  { id: 5, from: "customer", text: "Ok, Malleshwaram" },
  {
    id: 6,
    from: "bot",
    text: "₹3,499 to pay now for one month at Malleshwaram. Shall I send the payment link?",
    sources: ["Price from your system"],
  },
  { id: 7, from: "customer", text: "Yes" },
  {
    id: 8,
    from: "bot",
    text: "Here's your payment link: rzp.io/… Your booking is confirmed as soon as it's paid.",
    sources: ["Action: Book a vehicle"],
  },
];

const CHANNELS = [
  {
    icon: "$whatsapp",
    title: "WhatsApp",
    text: "Answers on your WhatsApp Business number around the clock, and can reply in the customer's language, including Hindi and Hinglish. All actions work here.",
  },
  {
    icon: "$message-circle",
    title: "Website chat",
    text: "A chat widget on your site. Customers who verify their phone and sign in with your login can ask about their account and use actions.",
  },
  {
    icon: "$phone-call",
    title: "Phone calls",
    soon: true,
    text: "Inbound calls in English, Hindi and Kannada, with the same knowledge and rules. Actions on calls follow when calls launch.",
  },
];

const MEDIA = [
  { icon: "$map-pin", title: "Location pin", text: "A pin gets the nearest of the locations you list." },
  { icon: "$mic", title: "Voice note", text: "Understood and answered like a typed message." },
  { icon: "$image", title: "Photo", text: "A photo of a damaged part can become a service request." },
];

const KNOWS = [
  {
    icon: "$folder-open",
    title: "Your business",
    text: "Import your website, upload documents and FAQs, and add notices for closures and offers. Connect your product API for live prices and stock.",
    points: [
      "Website pages, PDF and Word documents, FAQs and notes",
      "Notices: closures, special hours and offers, until they end",
      "Live prices and stock from your product API",
      "Checked on publish for contradictions, duplicates and private data",
    ],
    example: "\"Is Indiranagar open on Sunday?\" → \"It's closed this Sunday for maintenance. Koramangala is open 9 am to 8 pm.\"",
  },
  {
    icon: "$user-search",
    title: "Each customer",
    text: "Connect your customer API and the bot sees the customer's own account, so they don't have to explain who they are.",
    points: [
      "Bookings, dues and payments",
      "Open service requests and their stage",
      "Picks up where the customer left off (their last conversation in the past 30 days)",
      "Only for verified customers: their WhatsApp number, or a verified sign-in on your site",
    ],
    example: "\"When does my rental end?\" → \"Your rental ends on 27 Dec. Would you like to extend it?\"",
  },
];

const ACTIONS = [
  {
    icon: "$calendar-clock",
    title: "Extend a rental",
    text: "For customers who want to keep their vehicle longer.",
    flow: ["Checks the booking", "Quotes the price", "Customer says yes", "Sends the payment link"],
  },
  {
    icon: "$credit-card",
    title: "Pay for a booking",
    text: "For a booking that's waiting for payment.",
    flow: ["Finds the unpaid booking", "Shows the amount", "Customer says yes", "Sends the payment link"],
  },
  {
    icon: "$shopping-bag",
    title: "Book a vehicle or new order",
    text: "For new customers ready to buy.",
    flow: ["Asks for the model and hub", "Checks the hub has it", "Quotes, then asks", "Sends the link on a yes"],
  },
  {
    icon: "$wrench",
    title: "Service requests",
    text: "For problems your team has to fix.",
    flow: ["Looks for an open SR first", "Raises, chases or adds details", "Cancels or reopens, within your rules", "Gives the reference number"],
  },
];

const GUARANTEES = [
  {
    icon: "$shield-check",
    title: "Nothing happens without a yes",
    text: "The bot repeats what it's about to do and waits for the customer's clear yes. A no, or anything else, does nothing.",
  },
  {
    icon: "$receipt",
    title: "Amounts, links and IDs come from you",
    text: "Prices, payment links and request numbers come only from your own system. The AI never makes them up.",
  },
  {
    icon: "$user-check",
    title: "Only the customer's own account",
    text: "Your system checks that each booking belongs to the customer's phone, and refuses it otherwise.",
  },
];

const SALES_POINTS = [
  "Asks for one missing detail at a time, like the model or pickup hub",
  "Offers the payment link as soon as it has what it needs",
  "Suggests only the options you approve, never invented offers or fake urgency",
  "Stops selling after a no",
  "Follows up on WhatsApp when a customer who was close to buying goes quiet: up to 3 short messages, written for them, inside WhatsApp's 24-hour window and only in the hours you set",
  "Alerts your team by email or webhook when a lead turns hot",
];

const STAGES = [
  { label: "Browsing", help: "Looking around" },
  { label: "Interested", help: "Asked about a product or price" },
  { label: "Ready to book", help: "Gave the details a booking needs" },
  { label: "Checkout", help: "Payment link offered or sent" },
  { label: "Paid", help: "Your system reported the payment" },
];

const SERVICE_POINTS = [
  "Answers service questions from your knowledge first",
  "Finds the customer's open SR before raising a new one, so there are no duplicates",
  "Raises the SR in your system and gives the customer its reference number",
  "Chases, adds details, cancels or reopens within your own rules, like cancelling only before work starts",
  "Hands the chat to your team when a person is needed",
];

const SR_VERBS = ["Raise", "Chase", "Add details", "Cancel", "Reopen"];

const EXAMPLES = [
  {
    id: "booking",
    label: "Booking",
    icon: "$shopping-bag",
    title: "Booking on WhatsApp",
    messages: HERO_CHAT,
    notes: [
      "The customer named a bike. The bot checked it in your product data.",
      "It asked for one missing detail: the pickup hub.",
      "That hub had none free, so it offered the nearest hub that does.",
      "Your system gave the price. The bot asked before sending anything.",
      "On the customer's yes, your system made the link and the bot sent it. The lead moved to Checkout.",
    ],
  },
  {
    id: "service",
    label: "Service request",
    icon: "$wrench",
    title: "Service request on WhatsApp",
    messages: [
      { id: 1, from: "customer", text: "The brakes on my scooter are making a noise" },
      {
        id: 2,
        from: "bot",
        text: "Sorry about that! I can see an open request for this already, SR-0001 from 12 Nov, waiting for a technician. Shall I chase it, or add this detail to it?",
        sources: ["Customer API: open requests"],
      },
      { id: 3, from: "customer", text: "Chase it please, it's getting worse" },
      {
        id: 4,
        from: "bot",
        text: "I'll chase SR-0001 and add \"getting worse\" to it. Shall I go ahead? Please reply yes or no.",
      },
      { id: 5, from: "customer", text: "Yes" },
      {
        id: 6,
        from: "bot",
        text: "Done. SR-0001 has been chased and the note added. You'll get an update here.",
        sources: ["Action: Chase a request"],
      },
    ],
    notes: [
      "The bot looked up the customer's open requests before doing anything.",
      "It found the matching SR, so it didn't raise a duplicate.",
      "It said exactly what it would do and waited for a yes.",
      "Your system updated the SR. Your team sees it as usual.",
    ],
  },
  {
    id: "media",
    label: "Pins and voice notes",
    icon: "$map-pin",
    title: "Location pin and voice note",
    messages: [
      { id: 1, from: "customer", text: "📍 Location pin" },
      {
        id: 2,
        from: "bot",
        text: "Your nearest hub is Indiranagar, about 2 km away. It's open 9 am to 8 pm today.",
        sources: ["Location pin", "Your hubs"],
      },
      { id: 3, from: "customer", text: "🎤 Voice note (0:09): \"Can I extend my rental by a month?\"" },
      {
        id: 4,
        from: "bot",
        text: "Your rental ends on 27 Dec. One more month costs ₹3,499. Shall I send the payment link?",
        sources: ["Customer API", "Price from your system"],
      },
    ],
    notes: [
      "The customer sent a location pin. The bot worked out the nearest hub.",
      "Then they sent a voice note. The bot understood it like a typed message.",
      "It found their booking and got the price from your system.",
      "It asked before sending the payment link.",
    ],
  },
];

const REPORT_SALES = [
  { label: "Leads", value: "412" },
  { label: "Hot leads", value: "96" },
  { label: "Payment links sent", value: "71" },
  { label: "Paid with the bot", value: "38" },
  { label: "Revenue with the bot", value: "₹1.4 L" },
  { label: "Leads that paid", value: "9.2%" },
];

const REPORT_SERVICE = [
  { label: "Service chats", value: "1,280" },
  { label: "Solved by the bot", value: "74%" },
  { label: "SRs raised", value: "143" },
];

const REPORT_MORE = [
  {
    icon: "$route",
    title: "Why this answer",
    text: "Every reply shows what the bot used: the FAQs and pages, the product and customer lookups, the lead it recorded, the time it took and what it cost.",
  },
  {
    icon: "$shield-check",
    title: "Knowledge health checks",
    text: "Expired or contradicting knowledge is held back automatically. Daily and weekly checks flag expired offers and pages that left your site, with a weekly email of what to fix first.",
  },
  {
    icon: "$flask-conical",
    title: "Answer-quality tests",
    text: "Test questions with the facts the answer must contain, graded on every run and compared with your baseline run.",
  },
  {
    icon: "$message-circle-question-mark",
    title: "Questions it couldn't answer",
    text: "Saved for you. Answer one once and the bot knows it from then on.",
  },
];

const HANDOVER = [
  {
    icon: "$headset",
    title: "On request",
    text: "\"Talk to a person\", or any escalation keyword you set, like refund or complaint.",
  },
  {
    icon: "$circle-help",
    title: "When it isn't sure",
    text: "Below your confidence level, it hands over instead of guessing.",
  },
  {
    icon: "$mail",
    title: "Your team hears about it",
    text: "By webhook to your system, or by alert email if that fails.",
  },
  {
    icon: "$repeat",
    title: "After a set number of replies",
    text: "A per-chat limit on AI replies, so long chats reach a person.",
  },
];

const STEPS = [
  {
    icon: "$messages-square",
    title: "Connect your channels",
    text: "WhatsApp Business and the website widget. Phone calls are coming soon.",
  },
  {
    icon: "$folder-open",
    title: "Add your knowledge",
    text: "Import your website, documents and FAQs, and set the bot's tone and rules.",
  },
  {
    icon: "$plug",
    title: "Connect your APIs",
    text: "Your product and customer systems, for live prices, stock, bookings and dues.",
  },
  {
    icon: "$zap",
    title: "Switch on actions",
    text: "Payment links, bookings and service requests. Test each one in the sandbox first.",
  },
  {
    icon: "$chart-column",
    title: "Watch the reports",
    text: "Leads, follow-ups, payments, SRs and the chats the bot finished on its own.",
  },
];

const TRUST = [
  {
    icon: "$flask-conical",
    title: "Test before it's live",
    text: "A sandbox for answers and actions. It never creates real links or requests.",
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
    q: "How much does it cost?",
    a: `Pricing depends on your channels and volume. Write to us at ${CONTACT_EMAIL} and we'll suggest what fits.`,
  },
  {
    q: "Where does the bot get its answers?",
    a: "Only from what you give it: your website pages, documents, FAQs, notes and notices, your business facts, and your product and customer systems if you connect them. If it can't answer, the question is saved so you can answer it once.",
  },
  {
    q: "Can the bot make up a price or a payment link?",
    a: "No. Prices, payment links and request numbers come only from your own system. The bot asks the customer before every action, and nothing happens without a clear yes.",
  },
  {
    q: "Will the sales agent pressure my customers?",
    a: "No. It suggests only the options you approve, never invents offers or urgency, and stops after a no. Follow-ups are off until you switch them on: at most 3 per conversation, never after a no, a complaint or a reply from your team, and a customer who replies STOP isn't followed up again.",
  },
  {
    q: "Do I need a developer?",
    a: "Not to get started: importing your knowledge, setting up the bot's profile and connecting WhatsApp or the website widget are done from the dashboard. Connecting your product and customer systems and setting up actions needs your developer (or us), because it uses your systems' APIs.",
  },
  {
    q: "Can customers talk to a person?",
    a: "Yes. Chats go to your team on request, on keywords you set, or when the bot isn't sure. Your team gets alerts and replies from the inbox.",
  },
  {
    q: "Which languages does it support?",
    a: "In chat, it follows your language setting: you choose its languages, and you can let it reply in whatever language the customer writes in, including Hindi and Hinglish. Phone calls (coming soon) will be in English, Hindi and Kannada.",
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

// Section heading: eyebrow, title and an optional line of text
const SectionHead = {
  directives: { reveal },
  props: { eyebrow: String, title: String, text: String },
  render(h) {
    return h("div", { class: "section-head text-center mb-10", directives: [{ name: "reveal" }] }, [
      h("div", { class: "eyebrow mb-2" }, this.eyebrow),
      h("h2", { class: "section-title mb-3" }, this.title),
      this.text ? h("p", { class: "section-text mx-auto mb-0" }, this.text) : null,
    ]);
  },
};

// A WhatsApp-style chat. `fixed` keeps a fixed height (for the animated hero).
const ChatCard = {
  props: {
    messages: { type: Array, default: () => [] },
    typing: Boolean,
    title: String,
    fixed: Boolean,
  },
  mounted() {
    this.$emit("body", this.$refs.body);
  },
  render(h) {
    const bubble = (m) =>
      h("div", { key: m.id, class: ["d-flex mb-3", m.from === "customer" ? "justify-end" : "justify-start"] }, [
        h("div", { class: ["bubble", m.from === "customer" ? "bubble--me" : "bubble--bot"] }, [
          h("span", { class: "sr-only" }, m.from === "customer" ? "Customer: " : "Bot: "),
          h("div", { class: "bubble__text" }, m.text),
          m.sources
            ? h(
                "div",
                { class: "d-flex flex-wrap mt-2" },
                m.sources.map((s) => h("span", { key: s, class: "source-chip mr-1 mt-1" }, s)),
              )
            : null,
        ]),
      ]);
    return h("div", { class: "chat-card" }, [
      h("div", { class: "chat-card__head" }, [
        h("div", { class: "chat-card__avatar", attrs: { "aria-hidden": "true" } }, "AI"),
        h("div", { class: "flex-grow-1" }, [
          h("div", { class: "chat-card__title" }, this.title),
          h("div", { class: "chat-card__status" }, this.typing ? "typing…" : "online"),
        ]),
      ]),
      h(
        "div",
        {
          ref: "body",
          class: ["chat-card__body", { "chat-card__body--fixed": this.fixed }],
          attrs: { role: "log", "aria-label": this.title },
        },
        [
          h("transition-group", { props: { name: "msg", tag: "div" } }, this.messages.map(bubble)),
          this.typing
            ? h("div", { class: "d-flex justify-start mb-3" }, [
                h("div", { class: "bubble bubble--bot typing", attrs: { "aria-label": "typing" } }, [
                  h("span"),
                  h("span"),
                  h("span"),
                ]),
              ])
            : null,
        ],
      ),
    ]);
  },
};

export default {
  name: "LandingPage",

  components: { AppLogo, SectionHead, ChatCard },

  directives: { reveal },

  data: () => ({
    isLoggedIn: false,
    year: new Date().getFullYear(),
    shownCount: 0,
    botTyping: false,
    chatTimer: null,
    chatBody: null,
    example: 0,
    BRAND,
    CONTACT_EMAIL,
    MAILTO,
    NAV,
    HERO_POINTS,
    CHANNELS,
    MEDIA,
    KNOWS,
    ACTIONS,
    GUARANTEES,
    SALES_POINTS,
    STAGES,
    SERVICE_POINTS,
    SR_VERBS,
    EXAMPLES,
    REPORT_SALES,
    REPORT_SERVICE,
    REPORT_MORE,
    HANDOVER,
    STEPS,
    TRUST,
    FAQS,
  }),

  computed: {
    // Phones: smaller buttons so a pair fits on one line
    compactCta() {
      return this.$vuetify.breakpoint.xsOnly;
    },
    shownMessages() {
      return HERO_CHAT.slice(0, this.shownCount);
    },
  },

  watch: {
    // Keep the newest message (or the typing dots) in view
    shownCount: "scrollChat",
    botTyping: "scrollChat",
  },

  mounted() {
    this.isLoggedIn = !!localStorage.getItem("user-token");
    if (reducedMotion()) {
      this.shownCount = HERO_CHAT.length;
    } else {
      this.playChat();
    }
  },

  beforeDestroy() {
    clearTimeout(this.chatTimer);
  },

  methods: {
    moveExample(step) {
      const n = EXAMPLES.length;
      this.example = (this.example + step + n) % n;
      this.$nextTick(() => document.getElementById(`example-tab-${this.example}`)?.focus());
    },

    // Plays the hero chat one message at a time, with a typing pause before
    // each bot reply, then starts over.
    playChat() {
      const next = HERO_CHAT[this.shownCount];
      if (!next) {
        this.chatTimer = setTimeout(() => {
          this.shownCount = 0;
          this.playChat();
        }, 5000);
        return;
      }
      if (next.from === "bot") {
        this.botTyping = true;
        this.chatTimer = setTimeout(() => {
          this.botTyping = false;
          this.shownCount += 1;
          this.chatTimer = setTimeout(this.playChat, 1600);
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
        const el = this.chatBody;
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
      window.scrollTo({ top, behavior: reducedMotion() ? "auto" : "smooth" });
    },
  },
};
</script>

<style scoped>
/* Logo colours: sky #2188FA → royal #1E38F4 → violet #5D24EB, ink #0B1230 */
.landing {
  --sky: #2188fa;
  --blue: #1e38f4;
  --violet: #5d24eb;
  --ink: #0b1230;
  --muted: #4b5163;
  --tint: #f4f6ff;
  --line: rgba(11, 18, 48, 0.08);
  --brand-gradient: linear-gradient(100deg, var(--sky) 0%, var(--blue) 50%, var(--violet) 100%);
  color: var(--ink);
}

.ink--text {
  color: var(--ink) !important;
}

.muted--text {
  color: var(--muted) !important;
}

.skip-link {
  position: absolute;
  left: -9999px;
  top: 8px;
  z-index: 100;
  padding: 8px 12px;
  background: #fff;
  color: var(--blue);
  border-radius: 8px;
}

.skip-link:focus {
  left: 8px;
}

.sr-only,
.landing >>> .sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---------- Top bar ---------- */
.landing-bar {
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--line) !important;
}

.nav-btn {
  letter-spacing: 0;
  text-transform: none;
}

/* App.vue capitalises button labels; keep the landing page's text as written
   (e.g. the lowercase email address) */
.landing >>> .v-btn {
  text-transform: none !important;
  letter-spacing: 0;
}

.brand-btn {
  background: var(--brand-gradient) !important;
  color: #fff !important;
}

.brand-text {
  color: var(--blue) !important;
}

/* ---------- Hero ---------- */
.hero {
  position: relative;
  overflow: hidden;
  padding: 24px 0 48px;
  background: radial-gradient(1200px 520px at 10% -10%, #e6f1ff 0%, rgba(230, 241, 255, 0) 60%),
    radial-gradient(900px 520px at 100% 20%, #efe7ff 0%, rgba(239, 231, 255, 0) 55%), #ffffff;
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
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 700;
  color: var(--blue);
  background: #fff;
  border: 1px solid rgba(30, 56, 244, 0.18);
  border-radius: 8px;
}

.hero__title {
  font-size: clamp(2rem, 4.6vw, 3.4rem);
  font-weight: 900;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--ink);
}

.hero__lead {
  font-size: clamp(1rem, 1.6vw, 1.2rem);
  line-height: 1.6;
  color: var(--muted);
  max-width: 640px;
}

.hero__points {
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
}

.hero__points li {
  display: inline-flex;
  align-items: center;
  margin: 4px 20px 4px 0;
  font-size: 14px;
  color: #3d4152;
}

.text-gradient {
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.4;
  animation: float 14s ease-in-out infinite;
  pointer-events: none;
}

.blob--one {
  width: 380px;
  height: 380px;
  background: #b9d6ff;
  top: -120px;
  right: 8%;
}

.blob--two {
  width: 300px;
  height: 300px;
  background: #d9c8ff;
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
  box-shadow: 0 10px 24px rgba(30, 56, 244, 0.3) !important;
}

/* ---------- Chat card ---------- */
.chat-shell {
  max-width: 460px;
}

.landing >>> .chat-card {
  border: 1px solid var(--line);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 20px 40px rgba(11, 18, 48, 0.08);
}

.landing >>> .chat-card__head {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #075e54;
  color: #fff;
}

.landing >>> .chat-card__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  background: var(--brand-gradient);
}

.landing >>> .chat-card__title {
  font-size: 14px;
  font-weight: 700;
}

.landing >>> .chat-card__status {
  font-size: 12px;
  color: #c8f2e0;
}

.landing >>> .chat-card__body {
  padding: 16px;
  background: #efeae2;
}

/* Fixed size so the hero never grows or shifts while the demo plays */
.landing >>> .chat-card__body--fixed {
  height: 380px;
  overflow: hidden;
}

@media (max-width: 599px) {
  .landing >>> .chat-card__body--fixed {
    height: 340px;
  }
}

.landing >>> .bubble {
  max-width: 84%;
  padding: 8px 12px;
  border-radius: 10px;
  box-shadow: 0 1px 0.5px rgba(11, 20, 26, 0.13);
}

.landing >>> .bubble__text {
  font-size: 14px;
  line-height: 1.45;
  color: #111b21;
}

.landing >>> .bubble--me {
  background: #d9fdd3;
  border-top-right-radius: 2px;
}

.landing >>> .bubble--bot {
  background: #fff;
  border-top-left-radius: 2px;
}

.landing >>> .source-chip {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--blue);
  background: #eaf0ff;
  border-radius: 6px;
  padding: 2px 6px;
}

.landing >>> .typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 14px;
}

.landing >>> .typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #9e9e9e;
  animation: blink 1.2s infinite ease-in-out;
}

.landing >>> .typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.landing >>> .typing span:nth-child(3) {
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

.landing >>> .msg-enter-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.landing >>> .msg-leave-active {
  transition: opacity 0.4s ease;
}

.landing >>> .msg-leave-to {
  opacity: 0;
}

.landing >>> .msg-enter {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* ---------- Sections ---------- */
.landing >>> .eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--blue);
}

.landing >>> .section-title {
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.landing >>> .section-text {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--muted);
  max-width: 720px;
}

.soft-band {
  background: var(--tint);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.3;
  color: var(--ink);
}

.card-text {
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--muted);
}

.icon-tile {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f1ff, #efe7ff);
  flex-shrink: 0;
}

.icon-tile--warm {
  background: #fff1e6;
}

.icon-tile--green {
  background: #e8f8ee;
}

.check-list {
  list-style: none;
  padding: 0;
}

.check-list li {
  display: flex;
  align-items: flex-start;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #2b3040;
  margin-bottom: 8px;
}

.check-list li .v-icon {
  margin-top: 3px;
}

.example-line {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #2b3040;
  background: var(--tint);
  border-left: 3px solid var(--blue);
  border-radius: 8px;
  padding: 10px 12px;
}

.example-line__label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--blue);
  margin-bottom: 2px;
}

.media-band {
  background: linear-gradient(120deg, #f4f8ff, #f7f2ff);
}

/* Action flow: numbered steps */
.flow {
  list-style: none;
  padding: 0;
  counter-reset: flow;
}

.flow li {
  counter-increment: flow;
  position: relative;
  padding-left: 28px;
  font-size: 0.9rem;
  line-height: 1.4;
  color: #2b3040;
  margin-bottom: 8px;
}

.flow li::before {
  content: counter(flow);
  position: absolute;
  left: 0;
  top: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
  background: var(--brand-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
}

.guarantee {
  border-radius: 16px;
  background: #f2fbf5;
  border: 1px solid #d4f0de;
}

/* Lead stages */
.stages {
  list-style: none;
  padding: 0;
}

.stages li {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  padding: 8px 12px;
  margin-bottom: 6px;
  border-radius: 10px;
  background: linear-gradient(90deg, rgba(33, 136, 250, 0.1), rgba(93, 36, 235, 0.14));
  width: calc(100% - var(--stage) * 6%);
}

.stages__name {
  font-weight: 800;
  color: var(--ink);
  margin-right: 8px;
}

.stages__help {
  font-size: 0.85rem;
  color: var(--muted);
}

.soon-chip,
.live-chip {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 6px;
}

.soon-chip {
  color: #7a4b00;
  background: #fff4d6;
}

.live-chip {
  color: #15803d;
  background: #e8f8ee;
}

.pill {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--blue);
  background: #eaf0ff;
}

/* Example tabs */
.example-tabs {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  padding: 4px;
  border-radius: 12px;
  background: var(--tint);
  border: 1px solid var(--line);
}

.example-tabs__tab {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  margin: 2px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
}

.example-tabs__tab--on {
  color: #fff;
  background: var(--brand-gradient);
}

.example-tabs__tab:focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
}

.steps-list {
  padding-left: 20px;
}

.steps-list li {
  font-size: 0.95rem;
  line-height: 1.5;
  color: #2b3040;
  margin-bottom: 10px;
}

/* Reports */
.kpi {
  padding: 12px;
  border-radius: 12px;
  background: var(--tint);
  height: 100%;
}

.kpi__label {
  font-size: 12px;
  color: var(--muted);
}

.kpi__value {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--ink);
}

.handover {
  border-radius: 14px;
  border: 1px solid var(--line);
  background: #fff;
}

/* How it works */
.how {
  list-style: none;
  padding: 0;
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
}

@media (min-width: 600px) {
  .how {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1264px) {
  .how {
    grid-template-columns: repeat(5, 1fr);
  }
}

.how__step {
  position: relative;
  padding: 20px;
  border-radius: 16px;
  background: #fff;
  border: 1px solid var(--line);
}

.how__num {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #fff;
  background: var(--brand-gradient);
}

.lift {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 32px rgba(11, 18, 48, 0.08) !important;
}

.faq-panel {
  border: 1px solid var(--line);
  border-radius: 12px !important;
}

.faq-panel::before {
  box-shadow: none !important;
}

/* ---------- Contact ---------- */
.final-cta {
  border-radius: 24px;
  background: linear-gradient(120deg, var(--sky) 0%, var(--blue) 45%, var(--violet) 100%);
  background-size: 200% 200%;
  animation: shimmer 10s ease infinite;
  box-shadow: 0 24px 48px rgba(30, 56, 244, 0.28);
}

.cta-sub {
  opacity: 0.95;
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.cta-mail {
  color: #fff;
  font-weight: 800;
  text-decoration: underline;
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

.footer-mail {
  font-size: 14px;
  font-weight: 700;
  color: var(--blue);
  text-decoration: none;
}

.footer-mail:hover {
  text-decoration: underline;
}

/* ---------- Reveal on scroll ---------- */
.landing >>> .reveal {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.landing >>> .reveal--in {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .blob,
  .final-cta,
  .landing >>> .typing span {
    animation: none !important;
  }

  .landing >>> .reveal,
  .lift {
    transition: none !important;
    transform: none !important;
  }

  .landing >>> .reveal {
    opacity: 1 !important;
  }
}
</style>
