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
    <div class="my-5 px-4">
      <div v-if="currentTab == 'profile'">
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
      </div>
      <div v-if="currentTab == 'security'">
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
      </div>
      <div v-if="currentTab == 'api-keys'">
        <v-alert outlined type="info">
          Your secret key will be disabled until the payment is made or the
          billing cycle lapses. Once we receive the payment, the key will be
          reactivated and function normally.
        </v-alert>
        <div>
          Do not share your API key with others, or expose it in the browser or
          other client-side code. In order to protect the security of your
          account, scraper.ai may also automatically disable any API key that
          has leaked publicly.
        </div>

        <div class="my-5">
          SECRET KEY - <code>{{ currentUser.apiKey }}</code>
        </div>
      </div>
    </div>
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
      try {
        const { data } = await apiClient.get("/clients/currentUser");
        this.currentUser = data;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.company = data.company;
      } catch {
        console.log("something is wrong");
      }
    },
  },
};
</script>

<style></style>
