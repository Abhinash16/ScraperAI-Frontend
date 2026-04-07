<template>
  <div>
    <v-card class="pa-4" rounded="xl" outlined color="#eff2fb" max-width="800">
      <!-- HEADER -->
      <div class="d-flex align-center mb-6">
        <v-avatar
          height="50"
          width="50"
          rounded="xl"
          color="#e0e7ff"
          class="d-flex align-center justify-center mr-4"
        >
          <v-icon color="black">mdi-github</v-icon>
        </v-avatar>

        <div class="flex-grow-1">
          <div class="d-flex align-center">
            <h3 class="black--text mr-2">Connect GitHub</h3>

            <v-chip v-if="isConnected" small color="success" outlined>
              Connected
            </v-chip>
            <v-chip v-else small color="error" outlined> Not Connected </v-chip>
          </div>

          <div class="text-caption black--text">
            Connect your GitHub repository to auto-push blogs or content.
          </div>
        </div>
      </div>

      <!-- INPUTS -->
      <v-card outlined color="white" class="pa-4 mb-4" rounded="xl">
        <div>
          <v-text-field
            v-model="repoUrl"
            label="Repository URL"
            outlined
            dense
          />

          <v-text-field
            v-model="branch"
            label="Branch"
            outlined
            dense
            class="mt-2"
          />

          <v-text-field
            v-model="basePath"
            label="Base Path"
            outlined
            dense
            class="mt-2"
          />

          <v-text-field
            v-model="accessToken"
            label="GitHub Access Token"
            outlined
            dense
            class="mt-2"
            hide-details="auto"
            :type="showToken ? 'text' : 'password'"
            :append-icon="showToken ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="showToken = !showToken"
          />
        </div>
      </v-card>

      <!-- ACTION -->
      <div class="d-flex justify-space-between align-center mt-3">
        <!-- LINK -->
        <router-link
          to="/dashboard/blogs/help-guide"
          class="text-decoration-none primary--text font-weight-medium"
        >
          Help Guide
        </router-link>

        <!-- BUTTON -->
        <v-btn
          color="primary"
          depressed
          rounded
          :loading="loading"
          @click="connectGithub"
        >
          Save & Connect
        </v-btn>
      </div>
    </v-card>

    <!-- 🔥 SNACKBAR -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      top
      right
    >
      {{ snackbar.message }}

      <template v-slot:action>
        <v-btn text @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  name: "GithubConnect",

  data() {
    return {
      repoUrl: "",
      branch: "",
      basePath: "",
      accessToken: "",
      isConnected: false,
      loading: false,
      showToken: false,

      // ✅ Snackbar state
      snackbar: {
        show: false,
        message: "",
        color: "success",
      },
    };
  },

  mounted() {
    this.currentLoggedInUserInfo();
  },

  methods: {
    showSnackbar(message, color = "success") {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },

    async currentLoggedInUserInfo() {
      try {
        const { data } = await apiClient.get("/clients/currentUser");

        const repo = data.data.repoConfig || {};

        this.repoUrl = repo.repoUrl || "";
        this.branch = repo.branch || "";
        this.basePath = repo.basePath || "";
        this.accessToken = repo.accessToken || "";
        this.isConnected = repo.isConnected || false;
      } catch (err) {
        console.error(err);
      }
    },

    async connectGithub() {
      if (!this.repoUrl || !this.accessToken) {
        this.showSnackbar("Repo URL & Access Token are required ❌", "error");
        return;
      }

      this.loading = true;

      try {
        await apiClient.post("/git/connect", {
          repoUrl: this.repoUrl,
          accessToken: this.accessToken,
          branch: this.branch,
          basePath: this.basePath,
        });

        this.isConnected = true;

        this.showSnackbar("GitHub connected successfully ✅", "success");
      } catch (err) {
        const message =
          err.response?.data?.details ||
          err.response?.data?.error ||
          "Connection failed ❌";

        this.showSnackbar(message, "error");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.text-grey {
  color: #6b7280;
}
</style>
