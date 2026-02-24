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

    <div>
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
                color="primary"
                label
                small
                class="mb-4 font-weight-bold px-4"
              >
                NEW: GPT-4 INTEGRATION
              </v-chip>
              <h1
                class="text-h2 font-weight-black mb-4 secondary--text line-height-1"
              >
                Welcome to <span class="primary--text">scraperAI</span>
              </h1>
              <p
                class="text-h6 grey--text text--darken-1 font-weight-regular mb-8"
              >
                Harness the power of AI to transform your sitemap into an
                intelligent chatbot in minutes. Simple script. Powerful results.
              </p>
              <div class="d-flex align-center">
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
                  class="px-8 text-capitalize font-weight-bold"
                >
                  View Demo
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

      <v-container class="py-16">
        <v-row justify="center" class="mb-12">
          <v-col cols="12" md="8" class="text-center">
            <h2 class="text-h4 font-weight-bold mb-4">Why Choose scraperAI?</h2>
            <v-divider
              class="mx-auto mb-6 primary"
              style="max-width: 60px; border-width: 2px"
            ></v-divider>
          </v-col>
        </v-row>

        <v-row>
          <v-col v-for="(feature, i) in mainFeatures" :key="i" cols="12" md="4">
            <v-card
              hover
              class="pa-6 rounded-xl transition-swing"
              min-height="250"
              outlined
            >
              <v-avatar color="primary lighten-5" size="64" class="mb-6">
                <v-icon color="primary" size="32">{{ feature.icon }}</v-icon>
              </v-avatar>
              <h3 class="text-h6 font-weight-bold mb-3">{{ feature.title }}</h3>
              <p class="grey--text text--darken-1 mb-0">{{ feature.text }}</p>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

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
              src="../../assets/images/scraper-logo.webp"
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
