<template>
  <div>
    <!-- Tabs -->
    <v-card outlined rounded="lg" class="mb-6">
      <v-tabs v-model="currentTab" color="primary">
        <v-tab value="profile-security">Profile Security</v-tab>
        <v-tab value="ip-allowlist">IP Allowlist</v-tab>
      </v-tabs>
    </v-card>

    <!-- ================= PROFILE SECURITY ================= -->
    <v-card
      v-if="currentTab === 0"
      class="pa-6"
      outlined
      rounded="xl"
      color="#eff2fb"
      max-width="900"
    >
      <div class="d-flex align-center mb-4">
        <v-avatar rounded="xl" color="#cde6ff" size="48" class="mr-4">
          <v-icon color="black">mdi-shield-lock-outline</v-icon>
        </v-avatar>
        <div>
          <div class="font-weight-bold">Profile Security</div>
          <div class="text-caption">
            Authentication and account-level security controls.
          </div>
        </div>
      </div>

      <v-card outlined rounded="xl" class="pa-4 mb-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="font-weight-medium">
              Multi-factor authentication (MFA)
            </div>
            <div class="text-caption">
              Add an extra layer of protection to your account.
            </div>
          </div>
          <v-btn outlined small color="primary"> Enable </v-btn>
        </div>
      </v-card>

      <v-card outlined rounded="xl" class="pa-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <div class="font-weight-medium">Log out of all sessions</div>
            <div class="text-caption">Immediately end all active sessions.</div>
          </div>
          <v-btn outlined small color="error"> Logout All </v-btn>
        </div>
      </v-card>
    </v-card>

    <!-- ================= IP ALLOWLIST ================= -->
    <v-card
      v-if="currentTab === 1"
      class="pa-6"
      outlined
      rounded="xl"
      color="#eff2fb"
      max-width="900"
    >
      <!-- Header -->
      <div class="d-flex align-center mb-6">
        <v-avatar rounded="xl" color="#cde6ff" size="48" class="mr-4">
          <v-icon color="black">mdi-ip-network-outline</v-icon>
        </v-avatar>
        <div>
          <div class="font-weight-bold">Configure IP Allowlist</div>
          <div class="text-caption">
            Restrict API access to trusted IP addresses or CIDR ranges.
          </div>
        </div>
      </div>

      <!-- Description -->
      <v-alert outlined rounded="xl" color="info" class="mb-6 text-body-2">
        IP allowlisting restricts API access to only the IP addresses or ranges
        you specify. This applies only to API key requests. Changes may take up
        to <strong>15 minutes</strong> to take effect. You can add up to
        <strong>50 IP addresses or CIDR ranges</strong>.
      </v-alert>

      <!-- Enable Switch -->
      <!-- <v-card outlined rounded="xl" class="pa-4 mb-6">
        <v-switch v-model="allowlistEnabled" inset color="primary" hide-details>
          <template v-slot:label>
            <span class="font-weight-medium"> Activate IP Allowlist </span>
          </template>
        </v-switch>

        <div class="text-caption mt-2 grey--text">
          If enabled, all public traffic will be blocked unless explicitly
          allowed.
        </div>
      </v-card> -->

     

      <!-- Add IP -->
      <v-card outlined rounded="xl" class="pa-4 mb-6">
        <div class="font-weight-medium mb-2">Add IP address or CIDR range</div>

        <div class="d-flex align-center">
          <v-text-field
            v-model="newIp"
            placeholder="8.8.8.8 or 192.168.1.0/24"
            outlined
            dense
            hide-details="auto"
            class="mr-3"
            :rules="[
              (v) => !!v || 'IP address is required',
              (v) => isValidIpOrCidr(v) || 'Enter a valid IP or CIDR range',
            ]"
          />
          <v-btn
            color="primary"
            depressed
            :disabled="!isValidIpOrCidr(newIp)"
            @click="addIp"
          >
            Add
          </v-btn>
        </div>
      </v-card>
       <!-- Empty State -->
      <v-card
        v-if="allowlist.length === 0"
        outlined
        rounded="xl"
        class="pa-6 text-center mb-6"
      >
        <v-icon size="42" color="grey lighten-1" class="mb-2">
          mdi-block-helper
        </v-icon>
        <div class="font-weight-medium mb-1">No IP Addresses Configured</div>
        <div class="text-caption grey--text">
          No IP allowlist has been created yet.
        </div>
      </v-card>

      <!-- IP LIST -->
      <v-card v-if="allowlist.length" outlined rounded="xl" class="pa-4">
        <div
          v-for="ip in allowlist"
          :key="ip._id"
          class="d-flex justify-space-between align-center mb-3"
        >
          <div>
            <code>{{ ip.ipAddress }}</code>
            <div class="text-caption grey--text">
              {{ ip.label }}
            </div>
          </div>

          <v-btn icon small color="error" @click="removeIp(ip._id)">
            <v-icon small>mdi-delete</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-card>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar"
      timeout="3000"
      top
      right
      :color="isError ? 'error' : 'success'"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
export default {
  data() {
    return {
      currentTab: 0,

      allowlistEnabled: false,
      allowlist: [],
      newIp: "",
      newLabel: "OFFICE IP",

      snackbar: false,
      snackbarMessage: "",
      isError: false,
    };
  },

  mounted() {
    this.fetchAllowlist();
  },

  methods: {
    async fetchAllowlist() {
      try {
        const res = await apiClient.get("/clientIp");
        this.allowlist = res.data.data || [];
      } catch (err) {
        this.isError = true;
        this.showSnackbar("Failed to load IP allowlist");
      }
    },

    async addIp() {
      if (!this.newIp) return;

      // if (this.allowlist.length >= 50) {
      //   this.showSnackbar("Maximum of 50 IPs allowed");
      //   return;
      // }
      if (!this.isValidIpOrCidr(this.newIp)) {
        this.isError = true;
        this.snackbarMessage = "Invalid IP address or CIDR range";
        this.snackbar = true;
        return;
      }

      try {
        const res = await apiClient.post("/clientIp", {
          ipAddress: this.newIp.trim(),
          label: this.newLabel,
        });

        this.allowlist.push(res.data.data);
        this.newIp = "";
        this.isError = false;
        this.showSnackbar("IP added to allowlist");
      } catch (err) {
        this.isError = true;
        this.showSnackbar("Failed to add IP");
      }
    },

    async removeIp(id) {
      try {
        await apiClient.delete(`/clientIp/${id}`);
        this.allowlist = this.allowlist.filter((ip) => ip._id !== id);
        this.isError = false;
        this.showSnackbar("IP removed");
      } catch (err) {
        this.isError = true;
        this.showSnackbar("Failed to delete IP");
      }
    },

    showSnackbar(message) {
      this.snackbarMessage = message;
      this.snackbar = true;
    },

    isValidIpOrCidr(value) {
      if (!value) return false;

      // IPv4: 0.0.0.0 – 255.255.255.255
      const ipv4 =
        /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;

      // CIDR: 192.168.1.0/24
      const cidr =
        /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}\/([0-9]|[12]\d|3[0-2])$/;

      return ipv4.test(value) || cidr.test(value);
    },
  },
};
</script>
