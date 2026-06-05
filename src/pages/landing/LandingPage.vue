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
          class="text-capitalize font-weight-bold d-none d-md-inline-flex"
          @click="scrollToSection('features')"
          >Features</v-btn
        >
        <v-btn
          text
          class="text-capitalize font-weight-bold d-none d-md-inline-flex mr-2"
          @click="scrollToSection('services')"
          >Services</v-btn
        >
        <v-btn
          text
          class="text-capitalize font-weight-bold d-none d-md-inline-flex mr-2"
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
    <v-sheet class="hero-section d-flex align-center">
      <!-- Background Blur Effects -->
      <div class="hero-blur blur-one"></div>
      <div class="hero-blur blur-two"></div>

      <v-container class="text-center position-relative hero-content">
        <!-- Top Badge -->
        <v-chip color="primary" outlined class="mb-6">
          <v-icon>mdi-creation-outline</v-icon>
          <span class="ml-2 #EAEAFD--text">Customer Support, Reimagined</span>
        </v-chip>

        <!-- Main Heading -->
        <h1 class="hero-title mb-6">
          AI-Powered <br />
          <span :key="rotatingWord" class="gradient-text rotating-text">
            {{ rotatingWord }}
          </span>
          <br />
          <span
            style="font-style: italic; letter-spacing: -0.5px; opacity: 0.9"
          >
            for Every Business</span
          >
        </h1>

        <!-- Subtitle -->
        <p class="hero-subtitle mb-10 mx-auto">
          Integrate intelligent AI support into your application in minutes.
          Handle customer inquiries 24/7 with ease, precision, and context-aware
          responses that truly understand your users.
        </p>

        <!-- CTA Buttons -->
        <div class="hero-btn-group">
          <v-btn
            x-large
            rounded
            depressed
            class="hero-btn-primary px-10"
            @click="redirectToSignup"
          >
            Get Started Free
          </v-btn>

          <v-btn
            x-large
            rounded
            outlined
            class="hero-btn-secondary px-10 ml-md-4 mt-4 mt-md-0"
          >
            See in Action
          </v-btn>
        </div>

        <!-- Bottom Small Trust Text -->
        <div class="hero-trust mt-10">
          Trusted by startups, enterprises & modern SaaS platforms
        </div>
      </v-container>
    </v-sheet>
    <div class="marquee-section">
      <div class="marquee-track">
        <div class="marquee-item">E-Commerce <span></span></div>
        <div class="marquee-item">Job Boards <span></span></div>
        <div class="marquee-item">Real Estate <span></span></div>
        <div class="marquee-item">Social Media <span></span></div>
        <div class="marquee-item">News Sites <span></span></div>
        <div class="marquee-item">Company Databases <span></span></div>
        <div class="marquee-item">Product Listings <span></span></div>
        <div class="marquee-item">YCombinator <span></span></div>
        <div class="marquee-item">Amazon <span></span></div>
        <div class="marquee-item">LinkedIn <span></span></div>
        <!-- REPEAT -->
        <div class="marquee-item">E-Commerce <span></span></div>
        <div class="marquee-item">Job Boards <span></span></div>
        <div class="marquee-item">Real Estate <span></span></div>
        <div class="marquee-item">Social Media <span></span></div>
        <div class="marquee-item">News Sites <span></span></div>
        <div class="marquee-item">Company Databases <span></span></div>
        <div class="marquee-item">Product Listings <span></span></div>
        <div class="marquee-item">YCombinator <span></span></div>
        <div class="marquee-item">Amazon <span></span></div>
        <div class="marquee-item">LinkedIn <span></span></div>
      </div>
    </div>

    <div>
      <v-container class="py-10" id="features">
        <!-- Heading -->
        <div class="text-center mb-14">
          <h2 class="feature-heading mb-4">
            Built for <span class="gradient-text">Scale</span>
          </h2>

          <p class="feature-subheading mx-auto">
            Automate your customer experience with enterprise-grade tools
            crafted for high-growth engineering teams and modern digital
            businesses.
          </p>
        </div>

        <!-- Cards -->
        <v-row>
          <v-col
            v-for="(feature, i) in features"
            :key="i"
            cols="12"
            sm="6"
            lg="6"
          >
            <v-card class="feature-card pa-8 d-flex flex-column" flat>
              <!-- Icon -->
              <div class="feature-icon-wrap mb-6">
                <v-avatar
                  size="74"
                  class="feature-icon-box"
                  :style="{ background: feature.color + '12' }"
                >
                  <v-icon :color="feature.color" size="34">
                    {{ feature.icon }}
                  </v-icon>
                </v-avatar>
              </div>

              <!-- Title -->
              <h3 class="feature-card-title mb-4">
                {{ feature.title }}
              </h3>

              <!-- Desc -->
              <p class="feature-card-desc mb-6">
                {{ feature.desc }}
              </p>

              <v-spacer></v-spacer>

              <!-- Tags -->
              <div class="d-flex flex-wrap mt-auto">
                <v-chip
                  v-for="tag in feature.tags"
                  :key="tag"
                  small
                  class="feature-tag mr-2 mb-2"
                  :style="{
                    background: feature.color + '10',
                    color: feature.color,
                  }"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-sheet class="ai-learn-section overflow-hidden">
        <div class="ai-bg-glow glow-left"></div>
        <div class="ai-bg-glow glow-right"></div>

        <v-container class="position-relative">
          <v-row align="center">
            <!-- LEFT CONTENT -->
            <v-col cols="12" md="5">
              <v-chip color="primary" outlined class="mb-6">
                <v-icon>mdi-head-cog</v-icon>
                <span class="ml-2 #EAEAFD--text">Adaptive Intelligence</span>
              </v-chip>

              <h2 class="ai-section-title white--text mb-6">
                AI that actually <span class="gradient-text">learns.</span>
              </h2>

              <p class="ai-section-desc mb-8">
                Most bots require static FAQs and repetitive manual setup. We
                scrape your docs, blogs, knowledge centers, and sitemaps to
                build a dynamic AI knowledge engine that continuously evolves as
                your business grows.
              </p>

              <div
                v-for="item in [
                  'Automated RAG Pipeline',
                  'Zero Manual Training',
                  'Custom Tone of Voice',
                  'Continuous Knowledge Sync',
                ]"
                :key="item"
                class="ai-bullet-item white--text"
              >
                <v-icon color="primary" class="mr-3">mdi-check-decagram</v-icon>
                <span>{{ item }}</span>
              </div>
            </v-col>

            <!-- RIGHT LIVE CHAT DEMO -->
            <v-col cols="12" md="7">
              <v-card class="live-demo-card pa-6">
                <!-- window top -->
                <div class="d-flex align-center mb-8">
                  <div class="chat-dot red mr-2"></div>
                  <div class="chat-dot yellow mr-2"></div>
                  <div class="chat-dot green"></div>

                  <v-spacer></v-spacer>

                  <span class="live-preview-label">LIVE AI PREVIEW</span>
                </div>

                <!-- simulated messages -->
                <div class="chat-thread">
                  <div class="chat-bubble user-msg mb-4">
                    How do I setup the REST API?
                  </div>

                  <div class="chat-bubble ai-msg mb-6">
                    Wrap your endpoint with our Bearer authentication token and
                    call the
                    <span class="highlight-link">/v1/auth</span> endpoint from
                    the docs.
                  </div>

                  <div class="chat-bubble user-msg mb-4">
                    Can I track API usage and analytics?
                  </div>

                  <div class="chat-bubble ai-msg mb-4">
                    Yes — monitor requests, response latency, failed calls, user
                    trends and token usage in your real-time analytics
                    dashboard.
                  </div>

                  <div class="typing-indicator mt-6">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <v-container class="py-10" id="services">
        <!-- heading -->
        <div class="text-center py-10">
          <h2 class="services-heading mb-4">
            Integrated <span class="gradient-text">Intelligence</span> Services
          </h2>

          <p class="services-subheading mx-auto">
            Explore specialized AI and BI solutions engineered to automate,
            optimize, and scale modern enterprise operations.
          </p>
        </div>

        <!-- service cards -->
        <v-row dense>
          <v-col
            v-for="(service, i) in services"
            :key="i"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card
              class="service-tile pa-7 d-flex flex-column text-center"
              flat
            >
              <v-avatar
                size="72"
                class="mx-auto mb-5 service-icon-box"
                :style="{ background: service.color + '12' }"
              >
                <v-icon :color="service.color" size="34">
                  {{ service.icon }}
                </v-icon>
              </v-avatar>

              <h3 class="service-title mb-3">
                {{ service.title }}
              </h3>

              <p class="service-desc">
                {{ service.desc }}
              </p>

              <div class="service-line mt-5"></div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <v-sheet class="analytics-section overflow-hidden">
        <div class="analytics-glow analytics-left"></div>
        <div class="analytics-glow analytics-right"></div>

        <v-container class="position-relative">
          <v-row align="center">
            <!-- LEFT CONTENT -->
            <v-col cols="12" md="5">
              <v-chip color="primary" outlined class="mb-6">
                <v-icon>mdi-chart-bar</v-icon>
                <span class="ml-2 #EAEAFD--text">Adaptive Intelligence</span>
              </v-chip>
              <h2 class="analytics-title white--text mb-6">
                Analytics that <span class="gradient-text">drive growth.</span>
              </h2>

              <p class="analytics-desc mb-8">
                Don’t just automate conversations — understand customer intent,
                resolution patterns, and knowledge gaps with a real-time
                analytics engine designed to improve documentation and
                conversions.
              </p>

              <div
                v-for="item in [
                  'Real-time Sentiment Analysis',
                  'Automated Intent Tagging',
                  'Resolution Rate Tracking',
                  'Knowledge Gap Discovery',
                ]"
                :key="item"
                class="analytics-bullet white--text"
              >
                <v-icon color="primary" class="mr-3">mdi-chart-line</v-icon>
                <span>{{ item }}</span>
              </div>
            </v-col>

            <!-- RIGHT DASHBOARD -->
            <v-col cols="12" md="7">
              <v-card class="analytics-dashboard pa-6">
                <!-- top bar -->
                <div class="d-flex align-center mb-7">
                  <div class="chat-dot red mr-2"></div>
                  <div class="chat-dot yellow mr-2"></div>
                  <div class="chat-dot green"></div>
                  <v-spacer></v-spacer>
                  <v-chip x-small color="success" class="font-weight-bold">
                    AI ANALYTICS LIVE
                  </v-chip>
                </div>

                <!-- KPI cards -->
                <v-row dense class="mb-4">
                  <v-col cols="12" sm="6">
                    <div class="kpi-box">
                      <div class="kpi-label white--text muted-text">
                        USER SATISFACTION
                      </div>
                      <div class="kpi-value white--text">98.2%</div>
                      <v-progress-linear
                        value="98"
                        rounded
                        height="6"
                        color="success"
                        class="mt-3"
                      />
                    </div>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <div class="kpi-box">
                      <div class="kpi-label white--text muted-text">
                        AVG RESPONSE TIME
                      </div>
                      <div class="kpi-value white--text">1.2s</div>
                      <v-progress-linear
                        value="32"
                        rounded
                        height="6"
                        color="primary"
                        class="mt-3"
                      />
                    </div>
                  </v-col>
                </v-row>

                <!-- trending topics -->
                <div class="topic-box mb-5">
                  <div class="topic-title white--text mb-4">
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
                    class="d-flex align-center white--text mb-3"
                  >
                    <v-icon :color="topic.color" small class="mr-3"
                      >mdi-circle-medium</v-icon
                    >
                    <span class="text-body-2">{{ topic.name }}</span>
                    <v-spacer></v-spacer>
                    <span class="topic-count">{{ topic.count }}</span>
                  </div>
                </div>

                <!-- chart -->
                <div class="bars-wrap mt-6">
                  <div
                    v-for="n in 12"
                    :key="n"
                    class="analytic-bar"
                    :style="{ height: barHeights[n - 1] + '%' }"
                  ></div>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <!-- Roadmap Section -->
      <v-sheet class="roadmap-section overflow-hidden">
        <div class="roadmap-glow roadmap-left"></div>
        <div class="roadmap-glow roadmap-right"></div>

        <v-container class="position-relative">
          <!-- heading -->
          <v-row justify="center" class="mb-12">
            <v-col cols="12" md="8" class="text-center">
              <h2 class="roadmap-heading mb-4">
                Coming Soon: <span class="gradient-text">AI Copilot</span> &
                Analytics
              </h2>

              <p class="roadmap-subheading">
                We’re rapidly expanding ScraperAI with next-generation
                intelligence capabilities built to supercharge automation, agent
                productivity, and customer satisfaction.
              </p>
            </v-col>
          </v-row>

          <!-- roadmap cards -->
          <v-row justify="center">
            <v-col cols="12" md="10">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-card class="roadmap-card pa-8 h-100" flat>
                    <v-avatar
                      size="76"
                      class="roadmap-icon-box mb-6"
                      color="#EEF2FF"
                    >
                      <v-icon color="primary" size="36"
                        >mdi-robot-excited</v-icon
                      >
                    </v-avatar>

                    <div class="coming-label mb-3">Q2 Launch Module</div>

                    <h3 class="roadmap-card-title mb-4">AI Copilot</h3>

                    <p class="roadmap-card-desc">
                      Empower your human support team with real-time response
                      suggestions, knowledge prompts, auto-drafted replies, and
                      AI-assisted ticket resolution — all with human oversight.
                    </p>

                    <div class="launch-line mt-6"></div>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-card class="roadmap-card pa-8 h-100" flat>
                    <v-avatar
                      size="76"
                      class="roadmap-icon-box mb-6"
                      color="#ECFDF3"
                    >
                      <v-icon color="green" size="36"
                        >mdi-chart-areaspline</v-icon
                      >
                    </v-avatar>

                    <div class="coming-label mb-3">Q3 Intelligence Engine</div>

                    <h3 class="roadmap-card-title mb-4">Data Analytics</h3>

                    <p class="roadmap-card-desc">
                      Unlock deep behavioral insights into customer journeys,
                      recurring issues, sentiment trends, conversion
                      bottlenecks, and support performance metrics in one
                      analytics layer.
                    </p>

                    <div class="launch-line mt-6"></div>
                  </v-card>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <v-sheet class="pricing-section overflow-hidden" id="prices">
        <div class="pricing-glow pricing-left"></div>
        <div class="pricing-glow pricing-right"></div>

        <v-container class="position-relative">
          <!-- heading -->
          <div class="text-center mb-14">
            <h2 class="pricing-heading white--text mb-4">
              Simple, transparent <span class="gradient-text">pricing</span>
            </h2>

            <p class="pricing-subheading">
              Flexible plans designed for startups, developers, and
              enterprise-grade support ecosystems across the Indian tech market.
            </p>
          </div>

          <!-- pricing cards -->
          <v-row align="stretch" justify="center">
            <!-- STARTER -->
            <v-col cols="12" md="4">
              <v-card class="price-card dark-card pa-8 text-center h-100" flat>
                <div class="plan-label mb-2">BASIC TRIAL (FREE)</div>
                <div class="plan-price white--text mb-1">
                  <span class="rupee">₹</span>0
                </div>
                <div class="plan-caption white--text mb-6">
                  Free forever for developers
                </div>

                <v-divider class="price-divider mb-6"></v-divider>

                <div
                  class="price-feature white--text"
                  v-for="feat in [
                    'AI Chat (300 messages/mo)',
                    'Assistance on Cost',
                    'Community Support',
                  ]"
                  :key="feat"
                >
                  <v-icon small color="success" class="mr-2">mdi-check</v-icon>
                  {{ feat }}
                </div>

                <v-btn
                  block
                  x-large
                  rounded
                  outlined
                  color="primary"
                  class="price-btn-outline mt-8"
                >
                  Get Started
                </v-btn>
              </v-card>
            </v-col>

            <!-- PRO -->
            <v-col cols="12" md="4">
              <v-card
                class="price-card featured-card pa-10 text-center h-100"
                flat
              >
                <v-chip small color="white" class="featured-chip mb-4">
                  MOST POPULAR
                </v-chip>

                <div class="plan-label white--text mb-2">PRO</div>
                <div class="plan-price white--text mb-1">
                  <span class="rupee">₹</span>15,000
                </div>
                <div class="plan-caption white--text mb-6">
                  Per month, billed yearly
                </div>

                <v-divider class="price-divider-light mb-6"></v-divider>

                <div
                  class="price-feature white--text"
                  v-for="feat in [
                    'Blog Automation',
                    'AI Chat (WhatsApp, Chatbot)',
                    'Form Automation (Funnels Management)',
                    'Call Analysis',
                  ]"
                  :key="feat"
                >
                  <v-icon small color="white" class="mr-2">mdi-check</v-icon>
                  {{ feat }}
                </div>

                <v-btn
                  block
                  x-large
                  rounded
                  color="white"
                  class="price-btn-featured mt-8"
                >
                  Start 14-Day Trial
                </v-btn>
              </v-card>
            </v-col>

            <!-- ENTERPRISE -->
            <v-col cols="12" md="4">
              <v-card class="price-card dark-card pa-8 text-center h-100" flat>
                <div class="plan-label mb-2">ENTERPRISE</div>
                <div class="plan-price white--text mb-1">Custom</div>
                <div class="plan-caption white--text mb-6">
                  For high-scale organizations
                </div>

                <v-divider class="price-divider mb-6"></v-divider>

                <div
                  class="price-feature white--text"
                  v-for="feat in [
                    'Deploy on your servers',
                    'Serverless',
                    'No Limit',
                    '24/7 Phone Support',
                  ]"
                  :key="feat"
                >
                  <v-icon small color="success" class="mr-2">mdi-check</v-icon>
                  {{ feat }}
                </div>

                <v-btn
                  block
                  x-large
                  rounded
                  outlined
                  color="primary"
                  class="price-btn-outline mt-8"
                >
                  Contact Sales
                </v-btn>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-sheet>

      <v-container class="final-cta-section">
        <v-card class="final-cta-card pa-12 pa-md-16 text-center" flat>
          <v-chip color="primary" outlined class="mb-6">
            <v-icon>mdi-lightning-bolt</v-icon>
            <span class="ml-2 #EAEAFD--text">Start in Minutes</span>
          </v-chip>

          <h2 class="final-cta-heading white--text mb-5">
            Ready to automate your <span class="gradient-text">support?</span>
          </h2>

          <p class="final-cta-subheading mb-8 mx-auto">
            Join 1,000+ modern businesses using scraperAI to reduce response
            times, improve customer satisfaction, and scale support without
            scaling headcount.
          </p>

          <div class="d-flex justify-center flex-wrap cta-btn-wrap">
            <v-btn
              x-large
              rounded
              depressed
              class="cta-main-btn px-10"
              @click="redirectToSignup"
            >
              Get Started Now
            </v-btn>

            <v-btn
              x-large
              rounded
              outlined
              class="cta-second-btn px-10 ml-md-4 mt-4 mt-md-0"
            >
              Book Demo
            </v-btn>
          </div>

          <div class="cta-trust mt-8">
            No credit card required • Setup under 10 minutes • Cancel anytime
          </div>
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
    barHeights: [35, 55, 42, 68, 58, 80, 62, 74, 88, 70, 92, 84],
  }),
  mounted() {
    this.isLoggedIn = !!localStorage.getItem("user-token");
    setInterval(() => {
      this.wordIndex = (this.wordIndex + 1) % this.words.length;
      this.rotatingWord = this.words[this.wordIndex];
    }, 3000);
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
/* MARQUEE */
.marquee-section {
  padding: 40px 0;
  overflow: hidden;
  border-top: 1px solid #f9eefa;
  border-bottom: 1px solid #f9eefa;
  background: #f1f2ff;
}
.marquee-track {
  display: flex;
  gap: 0;
  animation: marquee 20s linear infinite;
  width: max-content;
}
.marquee-track:hover {
  animation-play-state: paused;
}
@keyframes marquee {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}
.marquee-item {
  white-space: nowrap;
  padding: 0 48px;
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: black;
  display: flex;
  align-items: center;
  gap: 20px;
}
.marquee-item span {
  width: 4px;
  height: 4px;
  background: #7572f7;
  border-radius: 50%;
  display: inline-block;
}
/* Gradient Rotating Word */
.gradient-text {
  background: linear-gradient(90deg, #7374f7, #f466c7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}

.rotating-text {
  display: inline-block;
  /* Combine both animations here */
  animation: flipDown 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards,
    glowText 2s ease-in-out infinite alternate;
  transform-origin: center center;
  backface-visibility: hidden;
}

@keyframes flipDown {
  0% {
    opacity: 0;
    transform: rotateX(-90deg) translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: rotateX(0deg) translateY(0);
  }
}

@keyframes glowText {
  from {
    filter: drop-shadow(0 0 4px rgba(115, 116, 247, 0.25));
  }
  to {
    filter: drop-shadow(0 0 12px rgba(244, 102, 199, 0.35));
  }
}

.hero-section {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8faff 0%, #ffffff 50%, #f4f7ff 100%);
}

/* Blur circles */
.hero-blur {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  opacity: 0.45;
  z-index: 1;
}

.blur-one {
  width: 350px;
  height: 350px;
  background: #7374f7;
  top: 10%;
  left: -100px;
  animation: floatSlow 8s ease-in-out infinite alternate;
}

.blur-two {
  width: 300px;
  height: 300px;
  background: #f466c7;
  bottom: 5%;
  right: -80px;
  animation: floatSlow 10s ease-in-out infinite alternate;
}

.hero-content {
  z-index: 2;
  position: relative;
}

/* Heading */
.hero-title {
  font-size: 72px;
  line-height: 1.15;
  font-weight: 900;
  color: #111827;
  letter-spacing: -2px;
}

/* Subtitle */
.hero-subtitle {
  max-width: 760px;
  font-size: 21px;
  line-height: 1.8;
  color: #6b7280;
  font-weight: 400;
}

/* Buttons */
.hero-btn-group {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
}

.hero-btn-primary {
  background: linear-gradient(90deg, #7374f7, #8b5cf6) !important;
  color: white !important;
  font-weight: 700;
  text-transform: none;
  height: 58px !important;
  font-size: 16px;
  box-shadow: 0 14px 30px rgba(115, 116, 247, 0.25);
  transition: all 0.35s ease;
}

.hero-btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 18px 35px rgba(115, 116, 247, 0.35);
}

.hero-btn-secondary {
  border: 1.5px solid rgba(115, 116, 247, 0.2) !important;
  color: #5b5cf0 !important;
  font-weight: 700;
  text-transform: none;
  height: 58px !important;
  font-size: 16px;
  background: white;
  transition: all 0.35s ease;
}

.hero-btn-secondary:hover {
  transform: translateY(-4px);
  background: rgba(115, 116, 247, 0.04);
}

.rupee {
  font-family: "Roboto Mono", monospace;
}

/* trust line */
.hero-trust {
  font-size: 14px;
  color: #9ca3af;
  font-weight: 500;
  letter-spacing: 0.3px;
}

/* animations */
@keyframes glowText {
  from {
    filter: drop-shadow(0 0 4px rgba(115, 116, 247, 0.25));
  }
  to {
    filter: drop-shadow(0 0 12px rgba(244, 102, 199, 0.35));
  }
}

@keyframes floatSlow {
  from {
    transform: translateY(0px) translateX(0px);
  }
  to {
    transform: translateY(30px) translateX(20px);
  }
}

/* Mobile */
@media (max-width: 960px) {
  .hero-title {
    font-size: 46px;
  }

  .hero-subtitle {
    font-size: 17px;
    padding: 0 12px;
  }
}

@media (max-width: 600px) {
  .hero-title {
    font-size: 34px;
    line-height: 1.3;
  }

  .hero-btn-group {
    flex-direction: column;
    align-items: center;
  }

  .hero-btn-primary,
  .hero-btn-secondary {
    width: 100%;
    max-width: 280px;
  }
}

/* heading */
.feature-heading {
  font-size: 56px;
  font-weight: 900;
  color: #111827;
  letter-spacing: -1.5px;
}

.feature-subheading {
  max-width: 760px;
  font-size: 20px;
  line-height: 1.8;
  color: #6b7280;
}

/* card */
.feature-card {
  height: 100%;
  border-radius: 28px !important;
  background: linear-gradient(145deg, #ffffff, #fafbff);
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 10px 35px rgba(15, 23, 42, 0.04);
  transition: all 0.35s ease;
  overflow: hidden;
  position: relative;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 18px 50px rgba(115, 116, 247, 0.08);
}

/* subtle top line */
.feature-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 30px;
  width: 80px;
  height: 3px;
  border-radius: 10px;
  background: linear-gradient(90deg, #7374f7, #f466c7);
}

/* icon */
.feature-icon-box {
  border-radius: 20px !important;
}

/* title */
.feature-card-title {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
  line-height: 1.3;
}

/* desc */
.feature-card-desc {
  color: #6b7280;
  font-size: 17px;
  line-height: 1.8;
}

/* tags */
.feature-tag {
  font-weight: 700;
  border-radius: 20px !important;
  padding: 0 10px;
  font-size: 12px;
}

/* mobile */
@media (max-width: 960px) {
  .feature-heading {
    font-size: 38px;
  }

  .feature-subheading {
    font-size: 16px;
  }

  .feature-card-title {
    font-size: 22px;
  }
}

.ai-learn-section {
  padding: 110px 0;
  background: linear-gradient(135deg, #0f172a 0%, #111827 50%, #1e1b4b 100%);
  position: relative;
  color: white;
}

/* background glow */
.ai-bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(130px);
  opacity: 0.18;
}

.glow-left {
  width: 300px;
  height: 300px;
  background: #7374f7;
  top: 10%;
  left: -80px;
}

.glow-right {
  width: 280px;
  height: 280px;
  background: #f466c7;
  bottom: 5%;
  right: -60px;
}

/* chip */
.dark-chip {
  background: rgba(255, 255, 255, 0.08) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  font-weight: 700;
}

/* heading */
.ai-section-title {
  font-size: 54px;
  line-height: 1.15;
  font-weight: 900;
}

.ai-section-desc {
  font-size: 18px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.72);
}

/* bullet */
.ai-bullet-item {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  font-size: 16px;
  font-weight: 600;
}

/* live card */
.live-demo-card {
  border-radius: 28px !important;
  background: rgba(255, 255, 255, 0.04) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

/* top dots */
.chat-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}
.red {
  background: #ef4444;
}
.yellow {
  background: #f59e0b;
}
.green {
  background: #10b981;
}

.live-preview-label {
  font-size: 12px;
  letter-spacing: 1px;
  opacity: 0.5;
  font-weight: 700;
}

/* chat bubbles */
.chat-bubble {
  max-width: 82%;
  padding: 16px 20px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.7;
}

.user-msg {
  margin-left: auto;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.92);
}

.ai-msg {
  background: linear-gradient(90deg, #7374f7, #8b5cf6);
  color: white;
}

.highlight-link {
  font-weight: 800;
}

/* typing */
.typing-indicator span {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
  animation: blinkTyping 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}
.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blinkTyping {
  0%,
  100% {
    opacity: 0.2;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

/* mobile */
@media (max-width: 960px) {
  .ai-section-title {
    font-size: 36px;
  }

  .ai-section-desc {
    font-size: 16px;
  }

  .chat-bubble {
    max-width: 100%;
  }
}

.services-section {
  padding-top: 110px;
  padding-bottom: 110px;
}

.services-heading {
  font-size: 54px;
  font-weight: 900;
  color: #111827;
  letter-spacing: -1.5px;
}

.services-subheading {
  max-width: 760px;
  font-size: 19px;
  line-height: 1.8;
  color: #6b7280;
}

/* service tile */
.service-tile {
  height: 100%;
  border-radius: 26px !important;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.03);
  transition: all 0.35s ease;
  position: relative;
  overflow: hidden;
}

.service-tile:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 40px rgba(115, 116, 247, 0.08);
}

/* hover glow */
.service-tile::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    145deg,
    rgba(115, 116, 247, 0.02),
    rgba(244, 102, 199, 0.015)
  );
  opacity: 0;
  transition: 0.35s;
}

.service-tile:hover::before {
  opacity: 1;
}

/* icon */
.service-icon-box {
  border-radius: 22px !important;
}

/* title */
.service-title {
  font-size: 24px;
  font-weight: 800;
  color: #111827;
  line-height: 1.3;
}

/* desc */
.service-desc {
  font-size: 15px;
  line-height: 1.8;
  color: #6b7280;
}

/* small bottom line */
.service-line {
  width: 45px;
  height: 3px;
  border-radius: 20px;
  margin-left: auto;
  margin-right: auto;
  background: linear-gradient(90deg, #7374f7, #f466c7);
  opacity: 0.7;
}

/* mobile */
@media (max-width: 960px) {
  .services-heading {
    font-size: 38px;
  }

  .services-subheading {
    font-size: 16px;
  }

  .service-title {
    font-size: 21px;
  }
}

.analytics-section {
  padding: 110px 0;
  margin-top: 70px;
  background: linear-gradient(135deg, #111827 0%, #0f172a 50%, #172554 100%);
  color: white;
  position: relative;
}

.analytics-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(130px);
  opacity: 0.15;
}

.analytics-left {
  width: 300px;
  height: 300px;
  background: #7374f7;
  left: -80px;
  top: 20%;
}

.analytics-right {
  width: 260px;
  height: 260px;
  background: #f466c7;
  right: -60px;
  bottom: 10%;
}

/* title */
.analytics-title {
  font-size: 54px;
  font-weight: 900;
  line-height: 1.15;
}

.analytics-desc {
  font-size: 18px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.72);
}

.analytics-bullet {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  font-weight: 600;
}

/* dashboard */
.analytics-dashboard {
  border-radius: 28px !important;
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

/* kpi */
.kpi-box {
  background: rgba(255, 255, 255, 0.04);
  padding: 18px;
  border-radius: 18px;
}

.kpi-label {
  font-size: 11px;
  opacity: 0.6;
  letter-spacing: 1px;
}

.kpi-value {
  font-size: 34px;
  font-weight: 800;
}

/* topics */
.topic-box {
  background: rgba(255, 255, 255, 0.03);
  padding: 18px;
  border-radius: 18px;
}

.topic-title {
  font-weight: 700;
}

.topic-count {
  opacity: 0.55;
  font-size: 12px;
}

/* bars */
.bars-wrap {
  height: 80px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.analytic-bar {
  width: 6%;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(180deg, #7374f7, rgba(255, 255, 255, 0.08));
  animation: pulseBars 3s ease-in-out infinite alternate;
}

@keyframes pulseBars {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 1;
  }
}

@media (max-width: 960px) {
  .analytics-title {
    font-size: 36px;
  }

  .analytics-desc {
    font-size: 16px;
  }
}

.roadmap-section {
  padding: 110px 0;
  margin-top: 70px;
  background: linear-gradient(180deg, #f8faff 0%, #ffffff 100%);
  position: relative;
}

/* ambient glow */
.roadmap-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(130px);
  opacity: 0.12;
}

.roadmap-left {
  width: 280px;
  height: 280px;
  background: #7374f7;
  left: -90px;
  top: 20%;
}

.roadmap-right {
  width: 260px;
  height: 260px;
  background: #f466c7;
  right: -70px;
  bottom: 10%;
}

/* heading */
.roadmap-heading {
  font-size: 52px;
  font-weight: 900;
  color: #111827;
  line-height: 1.2;
  letter-spacing: -1.5px;
}

.roadmap-subheading {
  font-size: 19px;
  line-height: 1.8;
  color: #6b7280;
}

/* card */
.roadmap-card {
  border-radius: 28px !important;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.04);
  transition: all 0.35s ease;
}

.roadmap-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 50px rgba(115, 116, 247, 0.08);
}

.roadmap-icon-box {
  border-radius: 22px !important;
}

.coming-label {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #7374f7;
  text-transform: uppercase;
}

.roadmap-card-title {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
}

.roadmap-card-desc {
  font-size: 16px;
  line-height: 1.9;
  color: #6b7280;
}

/* bottom accent */
.launch-line {
  width: 55px;
  height: 3px;
  border-radius: 30px;
  background: linear-gradient(90deg, #7374f7, #f466c7);
}

/* mobile */
@media (max-width: 960px) {
  .roadmap-heading {
    font-size: 34px;
  }

  .roadmap-subheading {
    font-size: 16px;
  }
}

.pricing-section {
  padding: 110px 0;
  margin-top: 70px;
  background: linear-gradient(135deg, #0f172a 0%, #111827 50%, #1e1b4b 100%);
  color: white;
  position: relative;
}

.pricing-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(130px);
  opacity: 0.14;
}

.pricing-left {
  width: 300px;
  height: 300px;
  background: #7374f7;
  top: 15%;
  left: -80px;
}

.pricing-right {
  width: 280px;
  height: 280px;
  background: #f466c7;
  bottom: 10%;
  right: -70px;
}

.pricing-heading {
  font-size: 54px;
  font-weight: 900;
  line-height: 1.2;
}

.pricing-subheading {
  max-width: 760px;
  margin: auto;
  font-size: 18px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.72);
}

/* cards */
.price-card {
  border-radius: 30px !important;
  transition: all 0.35s ease;
}

.price-card:hover {
  transform: translateY(-10px);
}

.dark-card {
  background: rgba(255, 255, 255, 0.04) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px);
}

.featured-card {
  background: linear-gradient(180deg, #7374f7, #6d4df5);
  box-shadow: 0 25px 60px rgba(115, 116, 247, 0.3);
  transform: scale(1.04);
  z-index: 2;
}

.featured-chip {
  color: #7374f7 !important;
  font-weight: 800;
}

.plan-label {
  font-size: 12px;
  letter-spacing: 1px;
  font-weight: 800;
  color: #818cf8;
}

.plan-price {
  font-size: 48px;
  font-weight: 900;
}

.plan-caption {
  font-size: 14px;
  opacity: 0.65;
}

.price-divider {
  background: rgba(255, 255, 255, 0.08);
}

.price-divider-light {
  background: rgba(255, 255, 255, 0.2);
}

.price-feature {
  margin-bottom: 16px;
  font-size: 15px;
  text-align: left;
}

.price-btn-outline {
  text-transform: none !important;
  font-weight: 700;
}

.price-btn-featured {
  color: #7374f7 !important;
  font-weight: 800;
  text-transform: none !important;
}

/* mobile */
@media (max-width: 960px) {
  .pricing-heading {
    font-size: 36px;
  }

  .pricing-subheading {
    font-size: 16px;
  }

  .featured-card {
    transform: scale(1);
  }
}

.final-cta-section {
  padding-top: 110px;
  padding-bottom: 110px;
}

.final-cta-card {
  border-radius: 34px !important;
  background: linear-gradient(135deg, #111827 0%, #1e1b4b 50%, #7374f7 100%);
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 70px rgba(115, 116, 247, 0.18);
}

/* glow overlay */
.final-cta-card::before {
  content: "";
  position: absolute;
  width: 320px;
  height: 320px;
  background: rgba(244, 102, 199, 0.18);
  border-radius: 50%;
  filter: blur(120px);
  top: -80px;
  right: -60px;
}

.final-cta-card::after {
  content: "";
  position: absolute;
  width: 280px;
  height: 280px;
  background: rgba(115, 116, 247, 0.18);
  border-radius: 50%;
  filter: blur(120px);
  bottom: -80px;
  left: -50px;
}

.cta-chip {
  background: rgba(255, 255, 255, 0.08) !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 700;
  backdrop-filter: blur(10px);
}

.final-cta-heading {
  font-size: 56px;
  font-weight: 900;
  line-height: 1.2;
  position: relative;
  z-index: 2;
}

.final-cta-subheading {
  max-width: 760px;
  font-size: 19px;
  line-height: 1.9;
  color: rgba(255, 255, 255, 0.78);
  position: relative;
  z-index: 2;
}

.cta-btn-wrap {
  position: relative;
  z-index: 2;
}

.cta-main-btn {
  background: white !important;
  color: #7374f7 !important;
  font-weight: 800;
  text-transform: none;
  height: 56px !important;
}

.cta-second-btn {
  border: 1.5px solid rgba(255, 255, 255, 0.2) !important;
  color: white !important;
  font-weight: 700;
  text-transform: none;
  height: 56px !important;
}

.cta-trust {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 2;
}

/* mobile */
@media (max-width: 960px) {
  .final-cta-heading {
    font-size: 34px;
  }

  .final-cta-subheading {
    font-size: 16px;
  }

  .cta-btn-wrap {
    flex-direction: column;
    align-items: center;
  }

  .cta-main-btn,
  .cta-second-btn {
    width: 100%;
    max-width: 280px;
  }
}

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
