<template>
  <v-app>
    <!-- Header Section with Background Image -->
    <v-card flat dark class="header" height="100vh">
      <v-container fill-height>
        <div style="max-width: 600px" class="mx-auto">
          <v-img
            src="../../assets/images/scraper-logo.webp"
            alt="Scraper.ai Logo"
            contain
            height="100"
          ></v-img>
          <div class="text-h5 my-4">
            WE LOVE MAKING THINGS SIMPLE AND AMAZING
          </div>
          <div class="text-h3 my-4">WELCOME TO SCRAPER.AI</div>
          <div>
            With Scraper.ai, creating an intelligent chatbot has never been
            easier. Our solution allows you to implement a powerful AI chatbot
            with just a simple script. By analyzing your sitemap, Scraper.ai
            configures your chatbot to understand and respond based on your
            website’s content. Whether you're looking to enhance customer
            engagement, provide instant support, or streamline your business
            processes, our tool ensures your chatbot is ready in minutes.
            Harness the power of AI and take your business interactions to the
            next level with Scraper.ai.
          </div>
          <v-btn
            large
            class="my-5"
            color="primary"
            depressed
            @click="redirectToSignup"
          >
            Get Started
          </v-btn>
        </div>
      </v-container>
    </v-card>

    <!-- Features Section -->
    <v-container style="padding: 96px 0">
      <div class="text-h4 mb-6">Why Choose Scraper.ai?</div>
      <v-row>
        <v-col cols="12" md="4">
          <v-card flat>
            <v-card-title>
              <div>
                <strong>Implement a chatbot with a script</strong>
              </div>
            </v-card-title>
            <v-card-text>
              With Scraper.ai, you can deploy a powerful AI chatbot by simply
              adding a script to your site.
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card flat>
            <v-card-title>
              <div><strong>Powered by ChatGPT</strong></div>
            </v-card-title>
            <v-card-text>
              Our solution is powered by advanced ChatGPT AI, ensuring
              intelligent and responsive interactions.
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card flat>
            <v-card-title>
              <div>
                <strong>Conversations tailored to your website content</strong>
              </div>
            </v-card-title>
            <v-card-text>
              By analyzing your sitemap, our tool configures the chatbot to
              provide responses tailored to your content.
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- New Section -->
    <v-card dark class="rounded-0" id="features" style="padding: 96px 0">
      <div class="v-responsive mx-auto" style="max-width: 1350px">
        <div class="v-responsive__content">
          <v-container fluid>
            <v-row>
              <!-- First Feature -->
              <v-col sm="4" md="3" cols="12">
                <v-container pa-0>
                  <v-row no-gutters justify-center>
                    <v-col cols="12" class="text-center mb-4">
                      <v-icon size="56" color="primary"
                        >mdi-keyboard-outline</v-icon
                      >
                    </v-col>
                    <v-col cols="12">
                      <h3
                        class="text-subtitle-1 font-weight-bold mb-1 text-center text-uppercase"
                      >
                        Trendy Design
                      </h3>
                      <v-divider
                        class="mx-auto mb-6"
                        style="max-width: 28px"
                      ></v-divider>
                      <p class="grey--text text-darken-1 text-center mb-6">
                        Efficiently unleash media information without
                        cross-media value. Quickly maximize value timely
                        deliverables schemas.
                      </p>
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
              <!-- Second Feature -->
              <v-col sm="4" md="3" cols="12">
                <v-container pa-0>
                  <v-row no-gutters justify-center>
                    <v-col cols="12" class="text-center mb-4">
                      <v-icon size="56" color="primary"
                        >mdi-camera-outline</v-icon
                      >
                    </v-col>
                    <v-col cols="12">
                      <h3
                        class="text-subtitle-1 font-weight-bold mb-1 text-center text-uppercase"
                      >
                        Photography
                      </h3>
                      <v-divider
                        class="mx-auto mb-6"
                        style="max-width: 28px"
                      ></v-divider>
                      <p class="grey--text text-darken-1 text-center mb-6">
                        Efficiently unleash media information without
                        cross-media value. Quickly maximize value timely
                        deliverables schemas.
                      </p>
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
              <!-- Third Feature -->
              <v-col sm="4" md="3" cols="12">
                <v-container pa-0>
                  <v-row no-gutters justify-center>
                    <v-col cols="12" class="text-center mb-4">
                      <v-icon size="56" color="primary"
                        >mdi-pencil-outline</v-icon
                      >
                    </v-col>
                    <v-col cols="12">
                      <h3
                        class="text-subtitle-1 font-weight-bold mb-1 text-center text-uppercase"
                      >
                        Brand Making
                      </h3>
                      <v-divider
                        class="mx-auto mb-6"
                        style="max-width: 28px"
                      ></v-divider>
                      <p class="grey--text text-darken-1 text-center mb-6">
                        Efficiently unleash media information without
                        cross-media value. Quickly maximize value timely
                        deliverables schemas.
                      </p>
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
              <!-- Fourth Feature -->
              <v-col sm="4" md="3" cols="12">
                <v-container pa-0>
                  <v-row no-gutters justify-center>
                    <v-col cols="12" class="text-center mb-4">
                      <v-icon size="56" color="primary"
                        >mdi-puzzle-outline</v-icon
                      >
                    </v-col>
                    <v-col cols="12">
                      <h3
                        class="text-subtitle-1 font-weight-bold mb-1 text-center text-uppercase"
                      >
                        24/7 Support
                      </h3>
                      <v-divider
                        class="mx-auto mb-6"
                        style="max-width: 28px"
                      ></v-divider>
                      <p class="grey--text text-darken-1 text-center mb-6">
                        Efficiently unleash media information without
                        cross-media value. Quickly maximize value timely
                        deliverables schemas.
                      </p>
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </div>
    </v-card>

    <!-- Footer Section -->
    <v-footer dark padless>
      <v-card color="indigo" flat width="100%" class="rounded-0 text-center">
        <v-card-text>
          <v-btn
            v-for="icon in icons"
            :key="icon"
            class="mx-4 white--text"
            icon
          >
            <v-icon size="24px">{{ icon }}</v-icon>
          </v-btn>
        </v-card-text>
        <v-card-text class="white--text pt-0">
          Phasellus feugiat arcu sapien, et iaculis ipsum elementum sit amet.
          Mauris cursus commodo interdum.
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text class="white--text">
          {{ new Date().getFullYear() }} — <strong>Scraper.ai</strong>
        </v-card-text>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: "LandingPage",
  data: () => ({
    isLoggedIn: false,
    icons: ["mdi-facebook", "mdi-twitter", "mdi-linkedin", "mdi-instagram"],
  }),
  mounted() {
    const token = localStorage.getItem("user-token");
    if (token) {
      this.isLoggedIn = true;
    }
  },
  methods: {
    redirectToSignup() {
      this.$router.push(this.isLoggedIn ? "/dashboard" : "/login");
    },
  },
};
</script>

<style scoped>
/* .header {
  background-image: url("../../assets/images/background.png");
  background-size: cover;
  background-position: center;
  border-radius: 0;
} */
</style>
