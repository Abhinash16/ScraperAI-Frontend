<template>
  <div>
    <v-alert v-if="loadError" type="error" text rounded="lg" class="text-body-2">
      <div class="d-flex align-center flex-wrap">
        <span class="mr-4">{{ loadError }}</span>
        <v-spacer />
        <v-btn small outlined color="error" @click="load">
          <v-icon left size="14">$refresh-cw</v-icon>
          Retry
        </v-btn>
      </div>
    </v-alert>

    <template v-else>
      <!-- ============ LEGACY WIDGET KEY ============ -->
      <v-card v-if="legacyKey && legacyKey.key" outlined rounded="lg" class="mb-4">
        <div class="d-flex align-center flex-wrap px-5 py-4">
          <v-avatar size="32" tile color="primary lighten-5" class="rounded-lg mr-3 flex-shrink-0">
            <v-icon size="16" color="primary">$code</v-icon>
          </v-avatar>
          <div class="flex-grow-1 overflow-hidden mr-3">
            <div class="d-flex align-center">
              <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4 mr-2">
                Widget snippet key (live)
              </span>
              <ApiKeyModeChip mode="live" />
            </div>
            <div class="d-flex align-center">
              <code class="key-text text-caption text-truncate mr-1">{{ legacyKey.key }}</code>
              <v-btn icon x-small aria-label="Copy widget key" @click="copy(legacyKey.key)">
                <v-icon size="14">$copy</v-icon>
              </v-btn>
            </div>
            <div class="text-caption grey--text text--darken-1">
              The key in your website's script tag.
              {{
                legacyKey.allowedOrigins.length
                  ? `Allowed on ${legacyKey.allowedOrigins.join(", ")}.`
                  : "Works on any website."
              }}
            </div>
          </div>
          <v-btn small text color="primary" class="px-2" :to="WIDGET_ROUTE">
            Widget settings
            <v-icon right size="14">$arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card>

      <!-- ============ KEYS ============ -->
      <v-card outlined rounded="lg" class="overflow-hidden">
        <div class="d-flex align-center flex-wrap px-5 py-3">
          <span class="text-subtitle-2 font-weight-bold grey--text text--darken-4">API keys</span>
          <v-chip v-if="keys.length" x-small label class="font-weight-bold ml-2">
            {{ activeCount }} active
          </v-chip>
          <v-spacer />
          <span v-if="atLimit" class="text-caption grey--text text--darken-1 mr-3">
            At most {{ MAX_ACTIVE_KEYS }} active keys; revoke one first.
          </span>
          <v-btn color="primary" depressed small :disabled="atLimit" @click="openDialog(null)">
            <v-icon left size="16">$plus</v-icon>
            Create key
          </v-btn>
        </div>
        <v-divider />

        <v-skeleton-loader v-if="loading && !loaded" type="table-row@3" class="pa-4" />

        <div v-else-if="!keys.length" class="d-flex flex-column align-center text-center px-6 py-12">
          <v-avatar color="grey lighten-4" size="64" class="mb-4">
            <v-icon size="28" color="grey">$key-round</v-icon>
          </v-avatar>
          <div class="text-subtitle-1 font-weight-bold grey--text text--darken-3 mb-1">No API keys yet</div>
          <div class="text-body-2 grey--text text--darken-1 mb-4" style="max-width: 440px">
            API keys let your own website or app use chat through our SDKs. Create a publishable key for your
            site or app, or a secret key for your servers.
          </div>
          <v-btn small depressed color="primary" @click="openDialog(null)">
            <v-icon left size="14">$plus</v-icon>
            Create key
          </v-btn>
        </div>

        <v-data-table
          v-else
          :headers="headers"
          :items="sortedKeys"
          item-key="id"
          :item-class="(k) => (k.revokedAt ? 'revoked' : '')"
          disable-sort
          hide-default-footer
          :items-per-page="-1"
          mobile-breakpoint="900"
        >
          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.name="{ item }">
            <span class="text-body-2 font-weight-bold grey--text text--darken-4">
              {{ item.name || "Untitled key" }}
            </span>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.kind="{ item }">
            <span class="d-inline-flex align-center text-body-2 text-no-wrap">
              <v-icon size="14" class="mr-1" color="grey darken-1">
                {{ item.kind === "secret" ? "$lock" : "$globe" }}
              </v-icon>
              {{ item.kind === "secret" ? "Secret" : "Publishable" }}
            </span>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.mode="{ item }">
            <ApiKeyModeChip :mode="item.mode" />
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.key="{ item }">
            <div v-if="item.key" class="d-flex align-center">
              <code class="key-text text-caption text-truncate" :title="item.key">{{ item.key }}</code>
              <v-btn
                v-if="!item.revokedAt"
                icon
                x-small
                class="ml-1"
                aria-label="Copy key"
                @click="copy(item.key)"
              >
                <v-icon size="14">$copy</v-icon>
              </v-btn>
            </div>
            <code v-else class="key-text text-caption">{{ item.maskedKey }}</code>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.allowed="{ item }">
            <span v-if="item.kind === 'secret'" class="text-caption grey--text">Servers only</span>
            <span
              v-else-if="!item.allowedOrigins.length && !item.allowedApps.length"
              class="text-caption amber--text text--darken-4 font-weight-bold"
              :title="OPEN_KEY_HINT"
            >
              Any website or app
            </span>
            <div v-else class="d-flex flex-wrap py-1" :title="allowedList(item).join(', ')">
              <v-chip
                v-for="entry in allowedList(item).slice(0, 2)"
                :key="entry"
                x-small
                label
                class="mr-1 my-1"
              >
                {{ entry }}
              </v-chip>
              <v-chip v-if="allowedList(item).length > 2" x-small label class="my-1">
                +{{ allowedList(item).length - 2 }}
              </v-chip>
            </div>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.lastUsedAt="{ item }">
            <span
              class="text-caption grey--text text--darken-1 text-no-wrap"
              :title="item.lastUsedAt ? exactTime(item.lastUsedAt) : ''"
            >
              {{ item.lastUsedAt ? $moment(item.lastUsedAt).fromNow() : "Never" }}
            </span>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.status="{ item }">
            <v-chip
              x-small
              label
              :color="item.revokedAt ? 'grey lighten-4' : 'green lighten-5'"
              :text-color="item.revokedAt ? 'grey darken-1' : 'green darken-2'"
              :title="item.revokedAt ? `Revoked ${exactTime(item.revokedAt)}` : ''"
              class="font-weight-bold"
            >
              <v-icon left size="8">$circle</v-icon>
              {{ item.revokedAt ? "Revoked" : "Active" }}
            </v-chip>
          </template>

          <!-- eslint-disable-next-line vue/valid-v-slot -->
          <template v-slot:item.actions="{ item }">
            <v-menu v-if="!item.revokedAt" offset-y left nudge-bottom="4">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon small v-bind="attrs" aria-label="Key actions" v-on="on">
                  <v-icon size="18">$ellipsis-vertical</v-icon>
                </v-btn>
              </template>
              <v-card outlined rounded="lg">
                <v-list dense nav class="py-1">
                  <v-list-item @click="openDialog(item)">
                    <v-icon size="16" class="mr-3 flex-grow-0" color="grey darken-2">$pencil</v-icon>
                    <v-list-item-title>Edit</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="askRevoke(item)">
                    <v-icon size="16" class="mr-3 flex-grow-0" color="error">$ban</v-icon>
                    <v-list-item-title class="error--text">Revoke</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-menu>
          </template>
        </v-data-table>
      </v-card>
    </template>

    <ApiKeyDialog v-model="dialog.open" :api-key="dialog.key" @saved="onSaved" />

    <SecretKeyDialog :secret="newSecret" @close="newSecret = ''" />

    <ConfirmDialog
      v-model="revoke.open"
      title="Revoke this key?"
      confirm-label="Revoke key"
      icon="$ban"
      :loading="revoke.loading"
      @confirm="runRevoke"
    >
      <strong v-if="revoke.key" class="grey--text text--darken-3">{{ revoke.key.name || "Untitled key" }}.</strong>
      Apps and websites using this key stop chatting immediately. This can't be undone.
    </ConfirmDialog>
  </div>
</template>

<script>
import apiClient from "@/service/axios";
import ApiKeyDialog from "@/components/team/ApiKeyDialog.vue";
import SecretKeyDialog from "@/components/team/SecretKeyDialog.vue";
import ConfirmDialog from "@/components/team/ConfirmDialog.vue";
import ApiKeyModeChip from "@/components/team/ApiKeyModeChip.vue";
import { apiError } from "@/utils/team";
import { API_KEYS_ENDPOINT, MAX_ACTIVE_KEYS, OPEN_KEY_HINT } from "@/utils/apiKeys";

const WIDGET_ROUTE = { path: "/dashboard/integration", query: { section: "widget" } };

const HEADERS = [
  { text: "Name", value: "name" },
  { text: "Type", value: "kind" },
  { text: "Mode", value: "mode" },
  { text: "Key", value: "key", width: 260 },
  { text: "Allowed websites / apps", value: "allowed" },
  { text: "Last used", value: "lastUsedAt" },
  { text: "Status", value: "status" },
  { text: "", value: "actions", align: "end", width: 48 },
];

// Chat API keys (/api/clients/api-keys, settings:manage).
export default {
  name: "ApiKeysTab",

  components: { ApiKeyDialog, SecretKeyDialog, ConfirmDialog, ApiKeyModeChip },

  data() {
    return {
      WIDGET_ROUTE,
      MAX_ACTIVE_KEYS,
      OPEN_KEY_HINT,
      headers: HEADERS,

      keys: [],
      legacyKey: null,
      loading: false,
      loaded: false,
      loadError: "",

      dialog: { open: false, key: null },
      newSecret: "",
      revoke: { open: false, key: null, loading: false },
    };
  },

  computed: {
    // Active keys first, revoked at the bottom; newest first within each
    sortedKeys() {
      return [...this.keys].sort(
        (a, b) => !!a.revokedAt - !!b.revokedAt || new Date(b.createdAt) - new Date(a.createdAt)
      );
    },

    activeCount() {
      return this.keys.filter((k) => !k.revokedAt).length;
    },

    atLimit() {
      return this.activeCount >= MAX_ACTIVE_KEYS;
    },
  },

  mounted() {
    this.load();
  },

  methods: {
    async load() {
      this.loading = true;
      this.loadError = "";
      try {
        const { data } = await apiClient.get(API_KEYS_ENDPOINT);
        this.keys = data.data.keys || [];
        this.legacyKey = data.data.legacyKey
          ? { allowedOrigins: [], ...data.data.legacyKey }
          : null;
        this.loaded = true;
      } catch (err) {
        this.loadError = apiError(err, "Failed to load API keys");
      } finally {
        this.loading = false;
      }
    },

    allowedList(key) {
      return [...key.allowedOrigins, ...key.allowedApps];
    },

    exactTime(date) {
      return this.$moment(date).format("D MMM YYYY, h:mm a");
    },

    async copy(text) {
      try {
        await navigator.clipboard.writeText(text);
        this.$toast.success("Key copied");
      } catch (err) {
        this.$toast.error("Couldn't copy the key");
      }
    },

    openDialog(key) {
      this.dialog = { open: true, key };
    },

    onSaved(saved) {
      const { secret, ...key } = saved;
      const i = this.keys.findIndex((k) => k.id === key.id);
      if (i >= 0) {
        this.keys.splice(i, 1, key);
        this.$toast.success("Key saved");
      } else {
        this.keys.unshift(key);
        if (secret) this.newSecret = secret;
        else this.$toast.success("Key created");
      }
    },

    askRevoke(key) {
      this.revoke = { open: true, key, loading: false };
    },

    async runRevoke() {
      const { key } = this.revoke;
      this.revoke.loading = true;
      try {
        const { data } = await apiClient.delete(`${API_KEYS_ENDPOINT}/${key.id}`);
        const i = this.keys.findIndex((k) => k.id === key.id);
        if (i >= 0) this.keys.splice(i, 1, data.data);
        this.revoke.open = false;
        this.$toast.success("Key revoked");
      } catch (err) {
        this.$toast.error(apiError(err, "Failed to revoke the key"));
      } finally {
        this.revoke.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.key-text {
  background: transparent;
  padding: 0;
  max-width: 220px;
  display: inline-block;
  vertical-align: middle;
}
.v-data-table >>> tr.revoked td {
  opacity: 0.55;
}
</style>
