<template>
  <div>
    <ThingsToKnow feature="actions" />

    <!-- HEADER -->
    <div class="d-flex flex-wrap align-center mb-4">
      <div class="mr-4 mb-2">
        <h1 class="text-h6 font-weight-bold grey--text text--darken-4">Actions</h1>
        <div class="text-body-2 grey--text text--darken-1">
          Let the bot send customers a payment link, by calling your own API.
        </div>
      </div>
      <v-spacer />
      <v-menu offset-y left>
        <template #activator="{ on, attrs }">
          <v-btn color="primary" depressed class="font-weight-bold mb-2" v-bind="attrs" v-on="on">
            <v-icon left size="16">$plus</v-icon>
            New action
          </v-btn>
        </template>
        <v-list dense max-width="360">
          <v-list-item v-for="(p, id) in PRESETS" :key="id" :to="`/dashboard/actions/new?preset=${id}`">
            <v-list-item-icon class="mr-3"><v-icon size="18">{{ p.icon }}</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ p.title }}</v-list-item-title>
              <v-list-item-subtitle class="text-wrap">{{ p.blurb }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-divider />
          <v-list-item to="/dashboard/actions/new">
            <v-list-item-icon class="mr-3"><v-icon size="18">$file-text</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Start from scratch</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <v-alert v-else-if="error" type="error" text rounded="lg">{{ error }}</v-alert>

    <!-- EMPTY -->
    <v-card v-else-if="!actions.length" outlined rounded="lg" class="pa-6">
      <div class="d-flex align-center mb-3">
        <v-avatar color="primary lighten-5" size="44" class="mr-3">
          <v-icon color="primary">$credit-card</v-icon>
        </v-avatar>
        <div class="text-subtitle-1 font-weight-bold">Payment links from the bot</div>
      </div>
      <div class="text-body-2 grey--text text--darken-2 mb-2">
        A customer says "I want to extend my booking by a week". The bot gets the price from your
        API, asks "That's ₹2,400. Shall I send the payment link?", and on a yes sends the link your
        API makes, on WhatsApp, the website chat or a phone call.
      </div>
      <div class="text-body-2 grey--text text--darken-2 mb-4">
        Prices and links always come from your API; the bot never makes them up. You need an API
        that can give a price (optional) and create a payment link.
      </div>
      <div class="d-flex flex-wrap">
        <v-btn
          v-for="(p, id) in PRESETS"
          :key="id"
          outlined
          color="primary"
          class="mr-2 mb-2"
          :to="`/dashboard/actions/new?preset=${id}`"
        >
          <v-icon left size="16">{{ p.icon }}</v-icon>
          {{ p.title }}
        </v-btn>
        <v-btn text color="primary" class="mb-2" to="/dashboard/actions/new">Start from scratch</v-btn>
      </div>
    </v-card>

    <!-- LIST -->
    <v-card v-else outlined rounded="lg">
      <v-simple-table>
        <thead>
          <tr>
            <th>Action</th>
            <th>On</th>
            <th>Channels</th>
            <th v-if="canSeeRuns">Last run</th>
            <th />
          </tr>
        </thead>
        <tbody>
          <tr v-for="a in actions" :key="a.id" class="action-row" @click="open(a)">
            <td class="py-2">
              <div class="font-weight-medium">{{ a.name }}</div>
              <code class="text-caption">{{ a.key }}</code>
            </td>
            <td @click.stop>
              <v-switch
                :input-value="a.enabled"
                inset
                dense
                hide-details
                color="success"
                class="mt-0"
                :loading="toggling === a.id"
                :disabled="toggling === a.id"
                @change="toggle(a, $event)"
              />
            </td>
            <td>
              <div class="d-flex flex-wrap">
                <v-chip
                  v-for="c in a.channels"
                  :key="c"
                  x-small
                  label
                  class="mr-1 my-1"
                  :title="deliveryLabel(a, c)"
                >
                  <v-icon left size="12" :color="channelInfo(c).color">{{ channelInfo(c).icon }}</v-icon>
                  {{ channelInfo(c).label }} · {{ deliveryShort(a, c) }}
                </v-chip>
              </div>
            </td>
            <td v-if="canSeeRuns">
              <template v-if="lastRuns[a.key]">
                <v-chip x-small label :color="runStatus(lastRuns[a.key].status).color" text-color="white">
                  {{ runStatus(lastRuns[a.key].status).label }}
                </v-chip>
                <div class="text-caption grey--text">{{ formatDate(lastRuns[a.key].createdAt) }}</div>
              </template>
              <span v-else class="text-caption grey--text">Not used yet</span>
            </td>
            <td class="text-right">
              <v-icon size="18">$chevron-right</v-icon>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
import ThingsToKnow from "@/components/ThingsToKnow.vue";
import { apiError, can, formatDate, loadMyPermissions } from "@/utils/knowledge";
import {
  DELIVERY,
  PRESETS,
  channelInfo,
  listActions,
  listRuns,
  runStatus,
  updateAction,
} from "@/utils/actions";

export default {
  name: "ActionsPage",

  components: { ThingsToKnow },

  data: () => ({
    PRESETS,
    actions: [],
    lastRuns: {},
    loading: true,
    error: "",
    toggling: null,
    perms: [],
  }),

  computed: {
    canSeeRuns() {
      return can(this.perms, "chat:read");
    },
  },

  async created() {
    this.perms = await loadMyPermissions().catch(() => []);
    await this.load();
    if (this.canSeeRuns) this.loadLastRuns();
  },

  methods: {
    channelInfo,
    runStatus,
    formatDate,

    async load() {
      this.loading = true;
      try {
        this.actions = await listActions();
      } catch (err) {
        this.error = apiError(err, "Couldn't load your actions.");
      } finally {
        this.loading = false;
      }
    },

    // Newest run per action, from the latest runs (good enough for a hint)
    async loadLastRuns() {
      if (!this.actions.length) return;
      try {
        const { runs } = await listRuns({ limit: 200 });
        const last = {};
        runs.forEach((r) => {
          if (!last[r.actionKey]) last[r.actionKey] = r;
        });
        this.lastRuns = last;
      } catch {
        // The column just stays empty
      }
    },

    delivery(a, c) {
      return c === "voice" ? "client_sends" : a.delivery?.[c] || "in_chat";
    },
    deliveryShort(a, c) {
      return DELIVERY[this.delivery(a, c)].short;
    },
    deliveryLabel(a, c) {
      return DELIVERY[this.delivery(a, c)].label;
    },

    open(a) {
      this.$router.push(`/dashboard/actions/${a.id}`);
    },

    async toggle(a, enabled) {
      this.toggling = a.id;
      try {
        const updated = await updateAction(a.id, { enabled });
        this.actions = this.actions.map((x) => (x.id === a.id ? updated : x));
        this.$toast.success(enabled ? `“${a.name}” is on` : `“${a.name}” is off`);
      } catch (err) {
        this.$toast.error(apiError(err, "Couldn't change it."));
        // Re-render the switch with the stored value
        this.actions = [...this.actions];
      } finally {
        this.toggling = null;
      }
    },
  },
};
</script>

<style scoped>
.action-row {
  cursor: pointer;
}
</style>
