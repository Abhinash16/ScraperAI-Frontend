<template>
  <v-card outlined rounded="lg" class="pa-6">
    <div class="d-flex align-center mb-1">
      <div class="text-subtitle-1 font-weight-bold mr-2">IP allowlist</div>
      <v-chip v-if="!loading" x-small outlined :color="allowlist.length ? 'success' : 'grey'">
        {{ allowlist.length ? `${allowlist.length} allowed` : "Not set" }}
      </v-chip>
    </div>
    <div class="text-body-2 grey--text text--darken-1 mb-4">
      Restrict API-key requests to the IP addresses or CIDR ranges you list.
      Dashboard logins aren't affected. Changes can take up to 15 minutes to
      apply, and you can add up to 50 entries.
    </div>

    <!-- Add -->
    <v-form
      v-if="canManage"
      ref="form"
      class="add-row"
      @submit.prevent="addIp"
    >
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
            color="primary"
            rounded
            depressed
            height="40"
            type="submit"
            :loading="adding"
            :disabled="!isValidIpOrCidr(newIp) || allowlist.length >= 50"
          >
            Add
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <!-- List -->
    <v-progress-linear v-if="loading" indeterminate color="primary" class="mt-2" />

    <v-alert v-else-if="loadError" type="error" text dense rounded="lg" class="text-body-2 mb-0">
      {{ loadError }}
      <v-btn small text color="error" class="ml-2" @click="load">Retry</v-btn>
    </v-alert>

    <div v-else-if="!allowlist.length" class="empty-state text-center">
      <v-icon color="grey lighten-1" class="mb-1">$network</v-icon>
      <div class="text-body-2 grey--text text--darken-1">
        No IP addresses yet. API keys work from any IP.
      </div>
    </div>

    <div v-else class="ip-list">
      <div v-for="ip in allowlist" :key="ip._id" class="ip-row d-flex align-center">
        <v-icon small class="mr-3" color="grey darken-1">
          {{ ip.ipAddress.includes("/") ? "$network" : "$monitor" }}
        </v-icon>
        <div class="flex-grow-1" style="min-width: 0">
          <code class="ip-code">{{ ip.ipAddress }}</code>
          <div v-if="ip.label" class="text-caption grey--text text--darken-1">
            {{ ip.label }}
          </div>
        </div>
        <v-btn
          v-if="canManage"
          icon
          small
          title="Remove"
          :loading="removingId === ip._id"
          @click="removeIp(ip)"
        >
          <v-icon small color="error">$trash-2</v-icon>
        </v-btn>
      </div>
    </div>

    <div v-if="!canManage && !loading" class="text-caption grey--text mt-3">
      You can view this list. Ask an admin to change it.
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

<style scoped>
.empty-state {
  border: 1px dashed #d6dbe8;
  border-radius: 12px;
  padding: 20px 16px;
}

.ip-list {
  border: 1px solid #e4e8f2;
  border-radius: 12px;
}

.ip-row {
  padding: 10px 12px 10px 16px;
}

.ip-row + .ip-row {
  border-top: 1px solid #e4e8f2;
}

.ip-code {
  background: transparent !important;
  padding: 0 !important;
  font-size: 14px;
  box-shadow: none !important;
}
</style>
