<template>
  <div>
    <v-card
      class="pa-4 my-6"
      rounded="xl"
      outlined
      color="#eff2fb"
      max-width="800"
    >
      <!-- HEADER -->
      <div class="d-flex align-center mb-6">
        <v-avatar
          height="50"
          width="50"
          rounded="xl"
          color="#d1fae5"
          class="d-flex align-center justify-center mr-4"
        >
          <v-icon color="green">mdi-whatsapp</v-icon>
        </v-avatar>

        <div class="flex-grow-1">
          <div class="d-flex align-center">
            <h3 class="black--text mr-2">Connect WhatsApp</h3>

            <v-chip
              v-if="autoWhatsappEnabled == true"
              small
              color="success"
              outlined
            >
              Enabled
            </v-chip>
            <v-chip v-else small color="error" outlined> Disabled </v-chip>
          </div>

          <div class="text-caption black--text">
            Connect your WhatsApp bot using Tellephant API key. Messages will be
            automated through this integration.
          </div>
        </div>
      </div>

      <!-- INPUT CARD -->
      <v-card outlined color="white" class="pa-4 mb-4" rounded="xl">
        <v-text-field
          v-model="tellephantApiKey"
          label="Tellephant API Key"
          hide-details="auto"
          outlined
          dense
          clearable
          :error="apiKeyError"
          :error-messages="apiKeyError ? 'API Key is required' : ''"
        />
      </v-card>

      <!-- TOGGLE CARD -->
      <v-card outlined color="white" class="pa-2 px-4" rounded="xl">
        <v-switch
          v-model="autoWhatsappEnabled"
          @change="handleToggle"
          color="green"
          inset
          hide-details
          class="mt-0"
        >
          <template v-slot:label>
            <span class="text-body-2 black--text">
              Automated WhatsApp responses without human intervention.
            </span>
          </template>
        </v-switch>
      </v-card>

      <div class="d-flex justify-end mt-3">
        <v-btn
          color="primary"
          depressed
          rounded
          :loading="loading"
          @click="saveSettings"
        >
          Save Changes
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  name: "WhatsappBot",

  data() {
    return {
      tellephantApiKey: "",
      autoWhatsappEnabled: false,
      loading: false,
      apiKeyError: false,
    };
  },

  mounted() {
    this.currentLoggedInUserInfo();
  },

  methods: {
    async currentLoggedInUserInfo() {
      try {
        const { data } = await apiClient.get("/clients/currentUser");

        const user = data.data;

        this.tellephantApiKey = user.tellephantApiKey || "";
        this.autoWhatsappEnabled = user.autoWhatsappEnabled || false;
      } catch (err) {
        console.error(err);
      }
    },

    async handleToggle() {
      if (!this.tellephantApiKey) {
        this.apiKeyError = true;
        this.autoWhatsappEnabled = !this.autoWhatsappEnabled;

        this.$toast.error("Please enter API Key first");
        return;
      }

      this.apiKeyError = false;
      await this.saveSettings();
    },

    async saveSettings() {
      if (!this.tellephantApiKey) {
        this.apiKeyError = true;
        return;
      }

      this.loading = true;

      try {
        await apiClient.put("/clients/whatsapp-settings", {
          tellephantApiKey: this.tellephantApiKey,
          autoWhatsappEnabled: this.autoWhatsappEnabled,
        });

        this.$toast.success("Settings updated successfully ✅");
      } catch (err) {
        console.error(err);

        this.$toast.error(err.response?.data?.error || "Failed to update ❌");
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
