<template>
  <v-card outlined rounded="lg">
    <div class="d-flex align-center px-5 py-4">
      <v-avatar size="40" tile color="indigo lighten-5" class="rounded-lg mr-3 flex-shrink-0">
        <v-icon size="20" color="indigo">$network</v-icon>
      </v-avatar>
      <div class="flex-grow-1">
        <div class="d-flex align-center">
          <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mr-2">IP allowlist</span>
          <v-chip
            v-if="!loading"
            x-small
            label
            :color="allowlist.length ? 'green lighten-5' : 'grey lighten-4'"
            :text-color="allowlist.length ? 'green darken-2' : 'grey darken-1'"
            class="font-weight-bold"
          >
            {{ allowlist.length ? `${allowlist.length} allowed` : "Not set" }}
          </v-chip>
        </div>
        <div class="text-caption grey--text text--darken-1">
          Restrict API-key requests to the IP addresses or CIDR ranges you list. Dashboard logins
          aren't affected. Changes can take up to 15 minutes to apply, and you can add up to 50
          entries.
        </div>
      </div>
    </div>
    <v-divider />

    <div class="pa-5">
      <!-- Add -->
      <v-form v-if="canManage" ref="form" @submit.prevent="addIp">
        <v-row dense>
          <v-col cols="12" sm="5">
            <v-text-field
              v-model.trim="newIp"
              label="IP address or CIDR range"
              placeholder="8.8.8.8 or 192.168.1.0/24"
              outlined
              dense
              autocomplete="off"
              :rules="[ipRule]"
            />
          </v-col>
          <v-col cols="12" sm="5">
            <v-text-field
              v-model.trim="newLabel"
              label="Label (optional)"
              placeholder="Office"
              outlined
              dense
              maxlength="50"
            />
          </v-col>
          <v-col cols="12" sm="2">
            <v-btn
              block
              color="success"
              depressed
              height="40"
              type="submit"
              :loading="adding"
              :disabled="!isValidIpOrCidr(newIp) || allowlist.length >= 50"
            >
              <v-icon left size="16">$plus</v-icon>
              Add
            </v-btn>
          </v-col>
        </v-row>
      </v-form>

      <!-- List -->
      <v-skeleton-loader v-if="loading" type="list-item, list-item" />

      <v-alert v-else-if="loadError" type="error" text dense rounded="lg" class="text-body-2 mb-0">
        <div class="d-flex align-center flex-wrap">
          <span class="mr-4">{{ loadError }}</span>
          <v-spacer />
          <v-btn small outlined color="error" @click="load">Retry</v-btn>
        </div>
      </v-alert>

      <v-sheet
        v-else-if="!allowlist.length"
        color="grey lighten-5"
        rounded="lg"
        class="d-flex flex-column align-center text-center pa-5"
      >
        <v-icon color="grey" class="mb-1">$network</v-icon>
        <div class="text-body-2 grey--text text--darken-1">No IP addresses yet. API keys work from any IP.</div>
      </v-sheet>

      <v-sheet v-else outlined rounded="lg">
        <template v-for="(ip, i) in allowlist">
          <v-divider v-if="i > 0" :key="`d-${ip._id}`" />
          <div :key="ip._id" class="d-flex align-center px-4 py-2">
            <v-icon size="18" class="mr-3" color="grey darken-1">
              {{ ip.ipAddress.includes("/") ? "$network" : "$monitor" }}
            </v-icon>
            <div class="flex-grow-1 overflow-hidden">
              <div class="text-body-2 font-weight-bold grey--text text--darken-4 text-break">
                {{ ip.ipAddress }}
              </div>
              <div v-if="ip.label" class="text-caption grey--text text--darken-1">{{ ip.label }}</div>
            </div>
            <v-btn
              v-if="canManage"
              icon
              small
              color="error"
              aria-label="Remove"
              :loading="removingId === ip._id"
              @click="removeIp(ip)"
            >
              <v-icon size="16">$trash-2</v-icon>
            </v-btn>
          </div>
        </template>
      </v-sheet>

      <div v-if="!canManage && !loading" class="text-caption grey--text mt-3">
        You can view this list. Ask an admin to change it.
      </div>
    </div>
  </v-card>
</template>

<script>
import apiClient from "@/service/axios";

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
const CIDR =
  /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}\/([0-9]|[12]\d|3[0-2])$/;

// Client IP allowlist (/api/clientIp). Viewing needs ip:read, changes ip:manage.
export default {
  name: "IpAllowlist",

  props: {
    canManage: { type: Boolean, default: false },
  },

  data() {
    return {
      allowlist: [],
      loading: false,
      loadError: "",
      newIp: "",
      newLabel: "",
      adding: false,
      removingId: null,
    };
  },

  mounted() {
    this.load();
  },

  methods: {
    isValidIpOrCidr(value) {
      return !!value && (IPV4.test(value) || CIDR.test(value));
    },

    ipRule(v) {
      return !v || this.isValidIpOrCidr(v) || "Enter a valid IPv4 address or CIDR range";
    },

    errorMessage(err, fallback) {
      return err.response?.data?.message || fallback;
    },

    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get("/clientIp");
        this.allowlist = data.data || [];
      } catch (err) {
        this.loadError = this.errorMessage(err, "Failed to load the IP allowlist");
      } finally {
        this.loading = false;
      }
    },

    async addIp() {
      if (!this.isValidIpOrCidr(this.newIp)) return;
      this.adding = true;
      try {
        const { data } = await apiClient.post("/clientIp", {
          ipAddress: this.newIp,
          label: this.newLabel || undefined,
        });
        this.allowlist.push(data.data);
        this.newIp = "";
        this.newLabel = "";
        this.$refs.form.resetValidation();
        this.$toast.success("IP added to the allowlist");
      } catch (err) {
        this.$toast.error(this.errorMessage(err, "Failed to add IP"));
      } finally {
        this.adding = false;
      }
    },

    async removeIp(ip) {
      this.removingId = ip._id;
      try {
        await apiClient.delete(`/clientIp/${ip._id}`);
        this.allowlist = this.allowlist.filter((i) => i._id !== ip._id);
        this.$toast.success("IP removed");
      } catch (err) {
        this.$toast.error(this.errorMessage(err, "Failed to remove IP"));
      } finally {
        this.removingId = null;
      }
    },
  },
};
</script>
