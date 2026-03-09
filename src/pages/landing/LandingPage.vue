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
        <v-btn text class="text-capitalize font-weight-bold">Features</v-btn>
        <v-btn text class="text-capitalize font-weight-bold mr-2"
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
              AI-Powered <span class="primary--text">Chatbot</span> for Every
              Business
            </h1>
            <p
              class="text-h6 grey--text text--darken-1 font-weight-regular mb-10 mx-auto"
              style="max-width: 600px; line-height: 1.6"
            >
              Integrate intelligent AI support into your application in minutes.
              Handle customer inquiries 24/7 with ease, precision, and
              context-aware responses.
            </p>
            <div class="d-flex justify-center flex-wrap gap-4">
              <v-btn
                x-large
                rounded
                color="primary"
                class="px-10 py-6 elevation-8 mr-4 text-capitalize font-weight-bold"
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
      <v-container class="py-16">
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
              flat
              class="pa-8 h-100 feature-card border rounded-xl transition-swing elevation-1"
            >
              <v-avatar :color="feature.color + '15'" size="64" class="mb-6">
                <v-icon :color="feature.color" size="32">{{
                  feature.icon
                }}</v-icon>
              </v-avatar>
              <h3 class="text-h5 font-weight-bold mb-3 secondary--text">
                {{ feature.title }}
              </h3>
              <p class="grey--text text--darken-1 text-body1 mb-6">
                {{ feature.desc }}
              </p>
              <div class="d-flex flex-wrap">
                <v-chip
                  v-for="tag in feature.tags"
                  :key="tag"
                  x-small
                  class="mr-2 mb-2 font-weight-bold grey--text text--darken-2"
                  color="grey lighten-4"
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
                  <v-timeline-item color="primary" small>
                    <v-card
                      color="rgba(255,255,255,0.05)"
                      class="pa-3 rounded-lg"
                    >
                      <span class="text-body-2 white--text"
                        >How do I setup the REST API?</span
                      >
                    </v-card>
                  </v-timeline-item>
                  <v-timeline-item color="success" small>
                    <v-card color="primary" class="pa-3 rounded-lg">
                      <span class="text-body-2 white--text"
                        >Just wrap your endpoint with our Bearer token. Check
                        the
                        <a href="#" class="white--text font-weight-black"
                          >/v1/auth</a
                        >
                        docs I found on your sitemap!</span
                      >
                    </v-card>
                  </v-timeline-item>
                </v-timeline>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <!-- Roadmap Section -->
      <v-sheet color="grey lighten-5" class="py-20 mt-4">
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
                  <v-card flat class="elevation-1 pa-8">
                    <v-avatar size="60" color="primary lighten-5" class="mb-6">
                      <v-icon size="32" color="primary">mdi-copilot</v-icon>
                    </v-avatar>
                    <h3 class="text-h6 font-weight-bold mb-3">AI Copilot</h3>
                    <p class="grey--text text--darken-1 text-body2">
                      Smart assistant for your support team. Real-time
                      suggestions and automated responses with human oversight.
                    </p>
                  </v-card>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-card flat class="elevation-1 pa-8">
                    <v-avatar size="60" color="primary lighten-5" class="mb-6">
                      <v-icon size="32" color="primary">mdi-chart-line</v-icon>
                    </v-avatar>
                    <h3 class="text-h6 font-weight-bold mb-3">
                      Data Analytics
                    </h3>
                    <p class="grey--text text--darken-1 text-body2">
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

      <v-sheet color="secondary" dark class="py-16">
        <v-container>
          <v-row>
            <v-col
              v-for="(service, i) in services"
              :key="i"
              cols="12"
              sm="6"
              md="3"
              class="text-center"
            >
              <v-icon size="48" color="primary lighten-2" class="mb-4">
                {{ service.icon }}
              </v-icon>
              <h4 class="text-uppercase font-weight-bold subtitle-1 mb-2">
                {{ service.title }}
              </h4>
              <v-divider
                color="primary"
                class="mx-auto mb-4"
                style="max-width: 30px"
              ></v-divider>
              <p class="body-2 grey--text text--lighten-1 px-4">
                {{ service.desc }}
              </p>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <v-container class="py-16 text-center">
        <v-card color="primary" dark class="pa-12 rounded-xl elevation-12">
          <h2 class="text-h3 font-weight-bold mb-6">
            Ready to automate your support?
          </h2>
          <p class="text-h6 mb-8 opacity-80">
            Join 1,000+ businesses using scraperAI to save time.
          </p>
          <v-btn
            x-large
            light
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
              max-width="120"
              class="mb-4"
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
        icon: "mdi-keyboard-outline",
        title: "Trendy Design",
        desc: "Sleek, modern interfaces that blend seamlessly with your existing brand identity.",
      },
      {
        icon: "mdi-camera-outline",
        title: "Visual Assets",
        desc: "Automated image processing for products mentioned within the chat flow.",
      },
      {
        icon: "mdi-pencil-outline",
        title: "Brand Making",
        desc: "Customizable tones and styles to ensure the AI speaks your company's language.",
      },
      {
        icon: "mdi-puzzle-outline",
        title: "24/7 Support",
        desc: "Your support never sleeps. Answer queries instantly at any time of day.",
      },
    ],
  }),
  mounted() {
    this.isLoggedIn = !!localStorage.getItem("user-token");
  },
  methods: {
    redirectToSignup() {
      this.$router.push(this.isLoggedIn ? "/dashboard" : "/login");
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
</style>
