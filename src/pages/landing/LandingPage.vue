<template>
  <div>
    <v-app-bar app flat color="white" light elevate-on-scroll>
      <v-container class="py-0 fill-height">
        <v-avatar size="40" color="primary" tile class="mr-2 mb-0 rounded-lg">
          <v-img
            src="../../assets/13.png"
            max-height="40"
            max-width="40"
          ></v-img>
        </v-avatar>
        <div>
          <h3 class="font-weight-black secondary--text">scraperAI</h3>
          <div class="text-caption grey--text hidden-sm-and-down">
            Modular Intelligence Grid System
          </div>
        </div>
        <v-spacer></v-spacer>
        <v-btn
          text
          class="text-capitalize font-weight-bold"
          @click="scrollToSection('features')"
          >Features</v-btn
        >
        <v-btn
          text
          class="text-capitalize font-weight-bold mr-2"
          @click="scrollToSection('services')"
          >Services</v-btn
        >
        <v-btn
          text
          class="text-capitalize font-weight-bold mr-2"
          @click="scrollToSection('prices')"
          >Pricing</v-btn
        >
        <v-btn
          color="primary"
          rounded
          depressed
          class="px-6 text-capitalize font-weight-bold"
          @click="redirectToSignup"
        >
          {{ isLoggedIn ? "Dashboard" : "Sign In" }}
        </v-btn>
      </v-container>
    </v-app-bar>

    <!-- Hero Section -->
    <v-sheet
      color="grey lighten-5"
      min-height="90vh"
      class="d-flex align-center pt-12 pb-12"
      style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    >
      <v-container>
        <v-row align="center" justify="center">
          <v-col cols="12" md="6" class="text-left">
            <v-chip
              color="primary "
              label
              class="mb-6 px-6 font-weight-bold rounded-xl"
            >
              Customer Support, Reimagined
            </v-chip>
            <h1 class="text-h2 font-weight-black mb-6 secondary--text">
              AI-Powered <br />
              <span class="primary--text rotating-text">{{
                rotatingWord
              }}</span>
              <br />
              for Every Business
            </h1>
            <p
              class="text-h6 grey--text text--darken-1 font-weight-regular mb-10 mx-auto"
              style="max-width: 600px; line-height: 1.6"
            >
              Integrate intelligent AI support into your application in minutes.
              Handle customer inquiries 24/7 with ease, precision, and
              context-aware responses.
            </p>
            <div class="d-flex justify-between flex-wrap gap-4">
              <v-btn
                x-large
                rounded
                depressed
                color="primary"
                class="px-10 py-6 mr-4 text-capitalize font-weight-bold"
                @click="redirectToSignup"
              >
                Get Started Free
              </v-btn>
              <v-btn
                x-large
                rounded
                outlined
                color="primary"
                class="px-12 py-6 font-weight-bold ml-2"
              >
                See in Action
              </v-btn>
            </div>
          </v-col>
          <v-col cols="12" md="6" class="hidden-sm-and-down">
            <v-img
              src="../../assets//images/landing.png"
              max-width="600"
              class="mx-auto"
              style="filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.1))"
            ></v-img>
          </v-col>
        </v-row>
      </v-container>
    </v-sheet>

    <div>
      <v-container class="py-16" id="features">
        <div class="text-center mb-16">
          <h2 class="text-h3 font-weight-black secondary--text mb-4">
            Built for Scale
          </h2>
          <p class="text-h6 grey--text mx-auto" style="max-width: 700px">
            Automate your customer experience with tools designed for
            high-growth engineering teams.
          </p>
        </div>

        <v-row>
          <v-col v-for="(feature, i) in features" :key="i" cols="12" md="6">
            <v-card
              hover
              flat
              outlined
              class="pa-6 h-100 rounded-xl transition-swing d-flex flex-column"
              style="border: 1.5px solid #f0f0f0 !important"
            >
              <v-avatar
                :color="feature.color + '15'"
                size="72"
                class="rounded-lg"
              >
                <v-icon :color="feature.color" size="36">
                  {{ feature.icon }}
                </v-icon>
              </v-avatar>

              <h3 class="text-h5 my-4 font-weight-black secondary--text">
                {{ feature.title }}
              </h3>

              <p
                class="text-body-1 grey--text text--darken-2"
                style="line-height: 1.7"
              >
                {{ feature.desc }}
              </p>

              <v-spacer></v-spacer>

              <div class="d-flex flex-wrap mt-auto">
                <v-chip
                  v-for="tag in feature.tags"
                  :key="tag"
                  small
                  class="mr-2 font-weight-bold"
                  :color="feature.color + '12'"
                  :text-color="feature.color"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-sheet color="secondary" class="py-16 mt-10 overflow-hidden" dark>
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="5">
              <h2 class="text-h3 font-weight-black mb-6">
                AI that actually learns.
              </h2>
              <p class="text-h6 mb-8 opacity-70 font-weight-regular">
                Most bots require manual FAQs. We scrape your technical docs,
                blog posts, and sitemaps to build a dynamic knowledge base that
                updates as you do.
              </p>
              <v-list color="transparent" dense>
                <v-list-item
                  v-for="item in [
                    'Automated RAG Pipeline',
                    'Zero Manual Training',
                    'Custom Tone of Voice',
                  ]"
                  :key="item"
                  class="px-0"
                >
                  <v-list-item-icon class="mr-3">
                    <v-icon color="primary lighten-2">mdi-check-circle</v-icon>
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-bold">{{
                      item
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>
            <v-col cols="12" md="7">
              <v-card
                color="#1e293b"
                class="rounded-xl pa-6 border-chat elevation-20"
              >
                <div class="d-flex align-center mb-6">
                  <div class="chat-dot red mr-2"></div>
                  <div class="chat-dot yellow mr-2"></div>
                  <div class="chat-dot green"></div>
                  <v-spacer></v-spacer>
                  <span class="text-caption font-weight-bold opacity-50"
                    >LIVE PREVIEW</span
                  >
                </div>
                <v-timeline dense align-top>
                  <!-- User -->
                  <v-timeline-item color="primary" small>
                    <v-card
                      color="rgba(255,255,255,0.05)"
                      class="pa-3 rounded-lg"
                    >
                      <span class="text-body-2 white--text">
                        How do I setup the REST API?
                      </span>
                    </v-card>
                  </v-timeline-item>

                  <!-- AI -->
                  <v-timeline-item color="success" small>
                    <v-card color="primary" class="pa-3 rounded-lg">
                      <span class="text-body-2 white--text">
                        Just wrap your endpoint with our Bearer token. Check the
                        <a href="#" class="white--text font-weight-black"
                          >/v1/auth</a
                        >
                        docs.
                      </span>
                    </v-card>
                  </v-timeline-item>

                  <!-- User -->
                  <v-timeline-item color="primary" small>
                    <v-card
                      color="rgba(255,255,255,0.05)"
                      class="pa-3 rounded-lg"
                    >
                      <span class="text-body-2 white--text">
                        Can I track API usage and analytics?
                      </span>
                    </v-card>
                  </v-timeline-item>

                  <!-- AI -->
                  <v-timeline-item color="success" small>
                    <v-card color="primary" class="pa-3 rounded-lg">
                      <span class="text-body-2 white--text">
                        Yes You get real-time insights like requests, latency,
                        and errors in the dashboard.
                      </span>
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <v-container class="py-16" id="services">
        <div class="text-center mb-16">
          <h2 class="text-h3 font-weight-black secondary--text mb-4">
            Integrated Intelligence Services
          </h2>
          <p class="text-h6 grey--text mx-auto" style="max-width: 700px">
            Explore our specialized BI solutions designed for modern
            enterprises.
          </p>
        </div>

        <v-row>
          <v-col v-for="(service, i) in services" :key="i" cols="12" md="3">
            <v-card
              hover
              flat
              outlined
              class="pa-6 h-100 rounded-xl transition-swing d-flex flex-column"
              style="border: 1.5px solid #f0f0f0 !important"
            >
              <v-avatar
                :color="service.color + '15'"
                size="72"
                class="rounded-lg"
              >
                <v-icon :color="service.color" size="36">
                  {{ service.icon }}
                </v-icon>
              </v-avatar>

              <h3 class="text-h5 my-4 font-weight-black secondary--text">
                {{ service.title }}
              </h3>

              <p
                class="text-body-1 grey--text text--darken-2"
                style="line-height: 1.7"
              >
                {{ service.desc }}
              </p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-sheet color="secondary" class="py-16 mt-10 overflow-hidden" dark>
        <v-container>
          <v-row align="center">
            <v-col cols="12" md="5">
              <h2 class="text-h3 font-weight-black mb-6">
                Analytics that drive growth.
              </h2>
              <p class="text-h6 mb-8 opacity-70 font-weight-regular">
                Don't just chat—understand. Our dashboard tracks user intent,
                resolution rates, and knowledge gaps so you can optimize your
                documentation in real-time.
              </p>
              <v-list color="transparent" dense>
                <v-list-item
                  v-for="item in [
                    'Real-time Sentiment Analysis',
                    'Automated Intent Tagging',
                    'Resolution Rate Tracking',
                  ]"
                  :key="item"
                  class="px-0"
                >
                  <v-list-item-icon class="mr-3">
                    <v-icon color="primary lighten-2"
                      >mdi-chart-timeline-variant</v-icon
                    >
                  </v-list-item-icon>
                  <v-list-item-content>
                    <v-list-item-title class="font-weight-bold">{{
                      item
                    }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-col>

            <v-col cols="12" md="7">
              <v-card
                color="#1e293b"
                class="rounded-xl pa-6 border-chat elevation-20"
              >
                <div class="d-flex align-center mb-6">
                  <div class="chat-dot red mr-2"></div>
                  <div class="chat-dot yellow mr-2"></div>
                  <div class="chat-dot green"></div>
                  <v-spacer></v-spacer>
                  <v-chip x-small color="success" class="font-weight-black"
                    >AI ANALYTICS LIVE</v-chip
                  >
                </div>

                <v-row>
                  <v-col cols="12" sm="6">
                    <div
                      class="pa-4 rounded-lg mb-4"
                      style="background: rgba(255, 255, 255, 0.05)"
                    >
                      <div class="text-caption grey--text text--lighten-1 mb-1">
                        USER SATISFACTION
                      </div>
                      <div class="text-h4 font-weight-black">98.2%</div>
                      <v-progress-linear
                        color="success"
                        value="98"
                        class="mt-2"
                        rounded
                        height="6"
                      ></v-progress-linear>
                    </div>
                  </v-col>
                  <v-col cols="12" sm="6">
                    <div
                      class="pa-4 rounded-lg mb-4"
                      style="background: rgba(255, 255, 255, 0.05)"
                    >
                      <div class="text-caption grey--text text--lighten-1 mb-1">
                        AVG. RESPONSE TIME
                      </div>
                      <div class="text-h4 font-weight-black">1.2s</div>
                      <v-progress-linear
                        color="primary"
                        value="30"
                        class="mt-2"
                        rounded
                        height="6"
                      ></v-progress-linear>
                    </div>
                  </v-col>
                </v-row>

                <v-card
                  color="rgba(255,255,255,0.03)"
                  class="pa-4 rounded-lg border-1"
                >
                  <div class="text-subtitle-2 mb-4 font-weight-bold">
                    Top Trending Topics
                  </div>

                  <div
                    v-for="(topic, i) in [
                      {
                        name: 'API Authentication',
                        count: '450 hits',
                        color: 'blue',
                      },
                      {
                        name: 'Pricing Plans',
                        count: '312 hits',
                        color: 'purple',
                      },
                      {
                        name: 'React Integration',
                        count: '289 hits',
                        color: 'cyan',
                      },
                    ]"
                    :key="i"
                    class="d-flex align-center mb-3"
                  >
                    <v-icon :color="topic.color" small class="mr-3"
                      >mdi-circle-medium</v-icon
                    >
                    <span class="text-body-2">{{ topic.name }}</span>
                    <v-spacer></v-spacer>
                    <span class="text-caption opacity-60">{{
                      topic.count
                    }}</span>
                  </div>
                </v-card>

                <div
                  class="mt-6 d-flex align-end justify-space-between"
                  style="height: 60px"
                >
                  <div
                    v-for="n in 12"
                    :key="n"
                    :style="{
                      height: Math.floor(Math.random() * 100) + '%',
                      width: '6%',
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '4px 4px 0 0',
                    }"
                  ></div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <!-- Roadmap Section -->
      <v-sheet color="grey lighten-5" class="py-16 mt-10 overflow-hidden">
        <v-container>
          <v-row justify="center" class="mb-12">
            <v-col cols="12" class="text-center">
              <h2 class="text-h3 font-weight-black mb-4">
                Coming Soon: AI Copilot & Analytics
              </h2>
              <p class="text-h6 grey--text">
                We're expanding ScraperAI with powerful new capabilities to
                supercharge your support
              </p>
            </v-col>
          </v-row>

          <v-row justify="center">
            <v-col cols="12" md="8">
              <v-row class="mb-8">
                <v-col cols="12" sm="6">
                  <v-card
                    hover
                    flat
                    outlined
                    class="pa-6 h-100 rounded-xl transition-swing d-flex flex-column"
                  >
                    <v-avatar color="#EEF4FC" size="72" class="rounded-lg">
                      <v-icon color="primary" size="36">mdi-chat</v-icon>
                    </v-avatar>

                    <h3 class="text-h5 my-4 font-weight-black secondary--text">
                      AI Copilot
                    </h3>

                    <p
                      class="text-body-1 grey--text text--darken-2"
                      style="line-height: 1.7"
                    >
                      Smart assistant for your support team. Real-time
                      suggestions and automated responses with human oversight.
                    </p>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-card
                    hover
                    flat
                    outlined
                    class="pa-6 h-100 rounded-xl transition-swing d-flex flex-column"
                  >
                    <v-avatar color="#F1F7F0" size="72" class="rounded-lg">
                      <v-icon color="green" size="36">mdi-chart-line</v-icon>
                    </v-avatar>

                    <h3 class="text-h5 my-4 font-weight-black secondary--text">
                      Data Analytics
                    </h3>

                    <p
                      class="text-body-1 grey--text text--darken-2"
                      style="line-height: 1.7"
                    >
                      Deep insights into customer behavior, satisfaction trends,
                      and support performance metrics.
                    </p>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <v-sheet
        color="secondary"
        dark
        class="py-16 mt-10 overflow-hidden"
        id="prices"
      >
        <v-container>
          <div class="text-center mb-16">
            <h2 class="text-h3 font-weight-black mb-4">
              Simple, transparent pricing
            </h2>
            <p class="text-h6 opacity-70 font-weight-regular">
              Flexible plans designed for the Indian tech ecosystem.
            </p>
          </div>

          <v-row align="center" justify="center">
            <v-col cols="12" md="4">
              <v-card
                color="#1e293b"
                class="rounded-xl pa-8 border-pricing elevation-10 text-center"
              >
                <div class="text-overline font-weight-bold mb-2 primary--text">
                  STARTER
                </div>
                <div class="text-h3 font-weight-black mb-1">₹0</div>
                <div class="text-caption opacity-60 mb-6">
                  Free forever for developers
                </div>

                <v-divider class="mb-6 opacity-20"></v-divider>

                <v-list color="transparent" dense class="text-left mb-8">
                  <v-list-item
                    v-for="feat in [
                      '1,000 messages/mo',
                      '1 Data Source',
                      'Community Support',
                    ]"
                    :key="feat"
                    class="px-0"
                  >
                    <v-icon color="success" class="mr-3" small
                      >mdi-check</v-icon
                    >
                    <span class="text-body-2">{{ feat }}</span>
                  </v-list-item>
                </v-list>

                <v-btn
                  block
                  x-large
                  rounded
                  depressed
                  outlined
                  color="primary"
                  class="font-weight-bold"
                >
                  Get Started
                </v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card
                color="primary"
                class="rounded-xl pa-10 elevation-24 text-center transform-scale-105"
                style="z-index: 2"
              >
                <v-chip
                  small
                  color="white"
                  class="primary--text font-weight-black mb-4"
                  >BEST VALUE</v-chip
                >
                <div class="text-overline font-weight-bold mb-2 white--text">
                  PRO
                </div>
                <div class="text-h3 font-weight-black mb-1 white--text">
                  ₹6,999
                </div>
                <div class="text-caption white--text opacity-80 mb-6">
                  Per month, billed yearly
                </div>

                <v-divider
                  class="mb-6"
                  style="background: rgba(255, 255, 255, 0.2)"
                ></v-divider>

                <v-list color="transparent" dense class="text-left mb-8">
                  <v-list-item
                    v-for="feat in [
                      'Unlimited messages',
                      'Priority RAG Pipeline',
                      'GST Invoicing',
                      'Custom Branding',
                    ]"
                    :key="feat"
                    class="px-0"
                  >
                    <v-icon color="white" class="mr-3" small>mdi-check</v-icon>
                    <span class="text-body-2 white--text">{{ feat }}</span>
                  </v-list-item>
                </v-list>

                <v-btn
                  block
                  x-large
                  rounded
                  depressed
                  color="white"
                  class="primary--text font-weight-black"
                >
                  Start 14-Day Trial
                </v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" md="4">
              <v-card
                color="#1e293b"
                class="rounded-xl pa-8 border-pricing elevation-10 text-center"
              >
                <div class="text-overline font-weight-bold mb-2 primary--text">
                  ENTERPRISE
                </div>
                <div class="text-h3 font-weight-black mb-1">Custom</div>
                <div class="text-caption opacity-60 mb-6">
                  For high-scale organizations
                </div>

                <v-divider class="mb-6 opacity-20"></v-divider>

                <v-list color="transparent" dense class="text-left mb-8">
                  <v-list-item
                    v-for="feat in [
                      'On-premise Deployment',
                      'Dedicated Account Manager',
                      'SLA Guarantee',
                      '24/7 Phone Support',
                    ]"
                    :key="feat"
                    class="px-0"
                  >
                    <v-icon color="success" class="mr-3" small
                      >mdi-check</v-icon
                    >
                    <span class="text-body-2">{{ feat }}</span>
                  </v-list-item>
                </v-list>

                <v-btn
                  block
                  x-large
                  outlined
                  rounded
                  depressed
                  color="primary"
                  class="font-weight-bold"
                >
                  Contact Sales
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <v-container class="py-16 text-center">
        <v-card color="primary" dark class="pa-12 rounded-xl elevation-0">
          <h2 class="text-h3 font-weight-bold mb-6">
            Ready to automate your support?
          </h2>
          <p class="text-h6 mb-8 opacity-80">
            Join 1,000+ businesses using scraperAI to save time.
          </p>
          <v-btn
            x-large
            light
            depressed
            rounded
            class="px-12 font-weight-bold"
            @click="redirectToSignup"
          >
            Get Started Now
          </v-btn>
        </v-card>
      </v-container>
    </div>

    <v-footer padless color="dark" class="pt-12">
      <v-container>
        <v-row>
          <v-col cols="12" md="4" class="mb-6">
            <v-img
              src="../../assets/13.png"
              max-width="42"
              class="mb-4 rounded-lg"
            ></v-img>
            <p class="grey--text pr-md-12">
              Transforming how businesses interact with their customers through
              autonomous AI scraping and chat technology.
            </p>
            <div class="mt-4">
              <v-btn
                v-for="icon in icons"
                :key="icon"
                icon
                color="grey darken-1"
                class="mr-2"
              >
                <v-icon size="20px">{{ icon }}</v-icon>
              </v-btn>
            </div>
          </v-col>
          <v-col cols="6" md="2" class="mb-6">
            <div class="font-weight-bold mb-4">Product</div>
            <div
              v-for="link in [
                'Features',
                'Integrations',
                'Pricing',
                'Changelog',
              ]"
              :key="link"
              class="mb-2"
            >
              <a
                href="#"
                class="text-decoration-none grey--text text--darken-1"
                >{{ link }}</a
              >
            </div>
          </v-col>
          <v-col cols="6" md="2" class="mb-6">
            <div class="font-weight-bold mb-4">Company</div>
            <div
              v-for="link in ['About Us', 'Contact', 'Privacy Policy', 'Terms']"
              :key="link"
              class="mb-2"
            >
              <a
                href="#"
                class="text-decoration-none grey--text text--darken-1"
                >{{ link }}</a
              >
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="font-weight-bold mb-4">Stay Updated</div>
            <v-text-field
              label="Email Address"
              solo
              flat
              background-color="secondary lighten-4"
              append-icon="mdi-send"
              rounded
            ></v-text-field>
          </v-col>
        </v-row>
        <v-divider class="my-8"></v-divider>
        <div class="text-center grey--text body-2 pb-8">
          &copy; {{ new Date().getFullYear() }} scraperAI. All rights reserved.
        </div>
      </v-container>
    </v-footer>
  </div>
</template>

<script>
export default {
  name: "LandingPage",
  data: () => ({
    isLoggedIn: false,
    rotatingWord: "Chatbot",
    words: ["Chatbot", "Call Analysis", "Analytics", "Copilot"],
    wordIndex: 0,
    icons: ["mdi-facebook", "mdi-twitter", "mdi-linkedin", "mdi-instagram"],
    mainFeatures: [
      {
        icon: "mdi-code-tags",
        title: "Script Deployment",
        text: "Deploy a powerful AI chatbot by simply adding a single line of script to your site's header.",
      },
      {
        icon: "mdi-robot",
        title: "Powered by ChatGPT",
        text: "Built on the latest LLMs ensuring your users get human-like, intelligent, and accurate responses.",
      },
      {
        icon: "mdi-web",
        title: "Sitemap Intelligent",
        text: "Automatically crawls your sitemap to learn about your products, services, and documentation.",
      },
    ],
    features: [
      {
        icon: "mdi-chat-outline",
        title: "AI Chatbot",
        desc: "Intelligent chatbot that handles common queries, escalates complex issues, and learns from every interaction",
        color: "#1976D2",
        tags: ["Context Aware", "Multi-language", "24/7 Support"],
      },
      {
        icon: "mdi-api",
        title: "REST API",
        desc: "Simple, well-documented API to embed chat functionality into any web or mobile application",
        color: "#43A047",
        tags: ["Easy Integration", "Webhooks", "Real-time"],
      },
      {
        icon: "mdi-database-outline",
        title: "Knowledge Base Integration",
        desc: "Automatically ingest your documentation and FAQs to power smarter, more accurate responses",
        color: "#FB8C00",
        tags: ["Auto-Learning", "RAG", "Semantic Search"],
      },
      {
        icon: "mdi-shield-check-outline",
        title: "Enterprise Security",
        desc: "Bank-grade encryption, compliance with GDPR and SOC 2, and granular access controls",
        color: "#8E24AA",
        tags: ["GDPR Ready", "SOC 2", "Data Privacy"],
      },
    ],

    services: [
      {
        icon: "mdi-chart-box",
        color: "#43A047",
        title: "Data Visualization",
        desc: "Beautiful, interactive dashboards that tell a story with your data.",
      },
      {
        icon: "mdi-robot",

        color: "#1976D2",
        title: "Chat Assistant",
        desc: "Ask questions in plain English and get instant visual answers.",
      },
      {
        icon: "mdi-phone",
        color: "#FB8C00",
        title: "Call Analysis",
        desc: "Extract business intelligence from customer conversations.",
      },
      {
        icon: "mdi-puzzle-outline",
        color: "#8E24AA",
        title: "Embedded Analytics",
        desc: "White‑label dashboards you can embed directly into your product.",
      },
    ],
  }),
  mounted() {
    this.isLoggedIn = !!localStorage.getItem("user-token");
    setInterval(() => {
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      this.rotatingWord = this.words[this.wordIndex];
    }, 2000); // change every 2 seconds
  },
  methods: {
    redirectToSignup() {
      this.$router.push(this.isLoggedIn ? "/dashboard" : "/login");
    },

    scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    },
  },
};
</script>
<style>
.chat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.red {
  background: #ff5f56;
}
.yellow {
  background: #ffbd2e;
}
.green {
  background: #27c93f;
}
.rotating-text {
  display: inline-block;
  animation: fadeSlide 0.6s ease;
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
