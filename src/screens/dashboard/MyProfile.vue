<template>
  <div>
    <v-tabs v-model="currentTab">
      <v-tab tab-value="profile">My Profile</v-tab>
      <v-tab tab-value="security">Security</v-tab>
      <v-tab tab-value="api-keys"
        >User API Keys
        <v-chip class="ml-2" small color="warning">Legacy</v-chip></v-tab
      >
    </v-tabs>
    <div class="">
      <div v-if="currentTab == 'profile'">
        <v-card class="pa-4 my-4" outlined rounded="xl" max-width="600">
          <div class="my-4">
            <div><strong>Name </strong></div>
            <div>The name associated with this account</div>
            <v-text-field
              hide-details="auto"
              dense
              v-model="name"
              outlined
              style="max-width: 600px"
            ></v-text-field>
          </div>
          <div class="my-4">
            <div><strong>Company </strong></div>
            <div>The company associated with this account</div>
            <v-text-field
              hide-details="auto"
              dense
              v-model="company"
              outlined
              readonly
              style="max-width: 600px"
            ></v-text-field>
          </div>
          <div class="my-4">
            <div><strong>Email </strong></div>
            <div>The email associated with this account</div>
            <v-text-field
              hide-details="auto"
              dense
              v-model="email"
              outlined
              readonly
              disabled
              style="max-width: 600px"
            ></v-text-field>
          </div>
          <div class="my-4">
            <div><strong>Phone </strong></div>
            <div>The phone associated with this account</div>
            <v-text-field
              hide-details="auto"
              dense
              v-model="phone"
              outlined
              readonly
              disabled
              style="max-width: 600px"
            ></v-text-field>
          </div>
          <v-btn class="my-4" depressed color="primary">Save</v-btn>
        </v-card>
      </div>

      <div v-if="currentTab == 'security'">
        <v-card class="pa-4 my-4" outlined rounded="xl">
          <div class="my-4">
            <div><strong>Multi-factor authentication (MFA) </strong></div>
            <div>
              Require an extra security challenge when logging in. If you are
              unable to pass this challenge, you will have the option to recover
              your account via email.
            </div>
            <v-btn depressed class="my-2">Enable 2FA</v-btn>
          </div>
          <div class="my-4">
            <div><strong>Log out of all devices </strong></div>
            <div>
              Log out of all active sessions across all devices, including your
              current session.
            </div>
            <v-btn depressed class="my-2">Log out all</v-btn>
          </div>
        </v-card>
      </div>

      <div v-if="currentTab == 'api-keys'">
        <v-card class="pa-4 my-4" outlined rounded="xl">
          <v-alert outlined type="info" rounded="xl">
            Your secret key will be disabled until the payment is made or the
            billing cycle lapses. Once we receive the payment, the key will be
            reactivated and function normally.
          </v-alert>
          <div>
            Do not share your API key with others, or expose it in the browser
            or other client-side code. In order to protect the security of your
            account, scraperAI may also automatically disable any API key that
            has leaked publicly.
          </div>

          <div class="my-5">
            SECRET KEY - <code>{{ currentUser.apiKey }}</code>
          </div>
        </v-card>
      </div>
    </div>

    <!-- Full Screen Loader -->
    <v-overlay :value="loading" opacity="0.3">
      <v-progress-circular indeterminate size="70" width="6" color="primary" />
    </v-overlay>

    <!--  Error Snackbar -->
    <v-snackbar v-model="snackbar" color="error" timeout="4000" top right>
      {{ errorMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn text v-bind="attrs" @click="snackbar = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
export default {
  props: {},
  data() {
    return {
      currentTab: "profile",
      currentUser: "",
      name: "",
      email: "",
      phone: "",
      company: "",
      loading: false,
      snackbar: false,
      errorMessage: "",
    };
  },
  watch: {
    currentTab() {
      //   this.$router.push({
      //     query: {
      //       tab: this.currentTab,
      //     },
      //   });
    },
  },
  mounted() {
    this.currentUserInfo();
    this.currentTab = this.$route.query.tab || "profile";
  },
  methods: {
    async currentUserInfo() {
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
        this.errorMessage =
          error.response?.data?.message || "something is wrong";
        this.snackbar = true;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style></style>
