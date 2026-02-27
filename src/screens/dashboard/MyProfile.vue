<template>
  <div>
    <!-- Tabs Card -->
    <v-card outlined rounded="lg" class="mb-6">
      <v-tabs v-model="currentTab" color="primary" grow>
        <v-tab value="profile">Profile</v-tab>
        <v-tab value="security">Security</v-tab>
        <v-tab value="api-keys">
          API Keys
          <v-chip class="ml-2" x-small outlined color="warning">
            Legacy
          </v-chip>
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- ================= PROFILE ================= -->
    <v-card
      v-if="currentTab === 0"
      class="pa-6 my-6"
      rounded="xl"
      outlined
      color="#eff2fb"
      max-width="800"
    >
      <div class="d-flex align-center mb-6">
        <v-avatar rounded="xl" color="#cde6ff" size="50" class="mr-4">
          <v-icon color="black">mdi-account</v-icon>
        </v-avatar>
        <div>
          <h3 class="black--text">Account details</h3>
          <div class="text-caption black--text">
            Update your personal information associated with this account.
          </div>
        </div>
      </div>

      <v-form>
        <v-row>
          <v-col cols="12">
            <v-text-field v-model="name" label="Full name" outlined dense />
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="company"
              label="Company"
              outlined
              dense
              readonly
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="email"
              label="Email address"
              outlined
              dense
              disabled
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="phone"
              label="Phone number"
              outlined
              dense
              disabled
            />
          </v-col>
        </v-row>

        <div class="d-flex justify-end mt-4">
          <v-btn color="primary" depressed rounded>
            Save changes
          </v-btn>
        </div>
      </v-form>
    </v-card>

    <!-- ================= SECURITY ================= -->
    <v-card
      v-if="currentTab === 1"
      class="pa-6 my-6"
      rounded="xl"
      outlined
      color="#eff2fb"
      max-width="800"
    >
      <div class="d-flex align-center mb-6">
        <v-avatar rounded="xl" color="#cde6ff" size="50" class="mr-4">
          <v-icon color="black">mdi-shield-lock-outline</v-icon>
        </v-avatar>
        <div>
          <h3 class="black--text">Security</h3>
          <div class="text-caption black--text">
            Manage authentication and active sessions.
          </div>
        </div>
      </div>

      <v-card outlined rounded="xl" class="pa-4 mb-6">
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="font-weight-medium">
              Multi-factor authentication (MFA)
            </div>
            <div class="text-caption">
              Add an extra layer of security to your account.
            </div>
          </div>
          <v-btn outlined color="primary" small>
            Enable
          </v-btn>
        </div>
      </v-card>

      <v-card outlined rounded="xl" class="pa-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="font-weight-medium">
              Log out of all devices
            </div>
            <div class="text-caption">
              End all active sessions across devices.
            </div>
          </div>
          <v-btn outlined color="error" small @click="logout">
            Log out all
          </v-btn>
        </div>
      </v-card>
    </v-card>

    <!-- ================= API KEYS ================= -->
    <v-card
      v-if="currentTab === 2"
      class="pa-6 my-6"
      rounded="xl"
      outlined
      color="#eff2fb"
      max-width="800"
    >
      <div class="d-flex align-center mb-6">
        <v-avatar rounded="xl" color="#cde6ff" size="50" class="mr-4">
          <v-icon color="black">mdi-key-variant</v-icon>
        </v-avatar>
        <div>
          <h3 class="black--text">API Keys</h3>
          <div class="text-caption black--text">
            Manage your secret keys used to access ScraperAI APIs.
          </div>
        </div>
      </div>

      <v-alert
        border="left"
        colored-border
        color="warning"
        elevation="0"
        rounded="xl"
        class="mb-6 white black--text text-body-2"
      >
        Your API key will be disabled if billing lapses. Service resumes
        automatically once payment succeeds.
      </v-alert>

      <v-card outlined color="grey darken-4" class="pa-4 mb-4" rounded="xl">
        <div class="d-flex justify-space-between align-center mb-2">
          <span class="text-caption grey--text text--lighten-1">
            SECRET KEY
          </span>
          <v-btn x-small color="primary" depressed rounded @click="copyApiKey">
            <v-icon x-small class="mr-1">mdi-content-copy</v-icon>
            Copy
          </v-btn>
        </div>

        <code
          class="white--text d-block font-weight-light"
          style="font-family: monospace"
        >
          {{ maskedApiKey }}
        </code>
      </v-card>

      <div class="text-caption grey--text text--darken-2">
        Never expose your API key in client-side code or public repositories.
      </div>
    </v-card>

    <!-- Loader -->
    <v-overlay :value="loading" opacity="0.25">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" timeout="3000" top right color="success">
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import { setAuthToken } from "@/service/axios";
export default {
  data() {
    return {
      currentTab: "0",
      currentUser: null,

      name: "",
      email: "",
      phone: "",
      company: "",

      loading: false,
      snackbar: false,
      snackbarMessage: "",
    };
  },

  computed: {
    maskedApiKey() {
      if (!this.currentUser?.apiKey) return "—";
      const key = this.currentUser.apiKey;
      return `${key.slice(0, 6)}••••••••${key.slice(-4)}`;
    },
  },

  mounted() {
    this.currentTab = this.$route.query.tab || "profile";
    this.fetchCurrentUser();
  },

  methods: {
    async fetchCurrentUser() {
      this.loading = true;
      try {
        const { data } = await apiClient.get("/clients/currentUser");
        const user = data.data;

        this.currentUser = user;
        this.name = user.name || "";
        this.email = user.email || "";
        this.phone = user.phone || "";
        this.company = user.company || "";
      } catch (error) {
        this.snackbarMessage =
          error.response?.data?.message || "Failed to load user data";
        this.snackbar = true;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      localStorage.removeItem("user-token");
      setAuthToken(null);
      this.$router.push("/login");
    },

    async copyApiKey() {
      await navigator.clipboard.writeText(this.currentUser.apiKey);
      this.snackbarMessage = "API key copied to clipboard";
      this.snackbar = true;
    },
  },
};

</script>