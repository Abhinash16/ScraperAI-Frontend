<template>
  <v-card outlined rounded="lg" class="pa-4">
    <div class="d-flex align-center mb-1">
      <v-icon size="18" color="primary" class="mr-2">$flask-conical</v-icon>
      <span class="text-subtitle-1 font-weight-bold grey--text text--darken-4">Try it</span>
    </div>
    <div class="text-body-2 grey--text text--darken-1 mb-3">
      Calls your API with sample values, like the bot would. Checking the price creates nothing.
    </div>

    <v-alert v-if="unsaved" type="warning" text dense rounded="lg" class="text-body-2">
      You have unsaved changes. Tests use the saved version.
    </v-alert>

    <!-- INPUTS -->
    <v-row dense>
      <v-col v-for="i in action.inputs" :key="i.name" cols="12" sm="6">
        <v-select
          v-if="i.enum && i.enum.length"
          v-model="inputs[i.name]"
          :items="i.enum"
          :label="i.name"
          :hint="i.description"
          outlined
          dense
          clearable
        />
        <v-text-field
          v-else
          v-model="inputs[i.name]"
          :label="i.name + (i.required === false ? ' (optional)' : '')"
          :type="i.type === 'integer' ? 'number' : i.type === 'date' ? 'date' : 'text'"
          :min="i.min"
          :max="i.max"
          :hint="i.description"
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-text-field
          v-model="phone"
          label="Customer's phone"
          placeholder="919876543210"
          hint="With country code. Your API checks the booking belongs to it."
          outlined
          dense
        />
      </v-col>
      <v-col cols="12" sm="6">
        <v-select v-model="channel" :items="channelItems" label="As if on" outlined dense>
          <template #selection="{ item }">
            <v-icon size="16" :color="item.color" class="mr-2">{{ item.icon }}</v-icon>{{ item.text }}
          </template>
        </v-select>
      </v-col>
    </v-row>

    <div class="d-flex flex-wrap">
      <v-btn color="primary" depressed class="mr-2 mb-2" :loading="busy === 'check'" :disabled="!!busy" @click="run(false)">
        <v-icon left size="16">{{ action.quote ? "$tag" : "$play" }}</v-icon>
        {{ action.quote ? "Check price" : "Show the reply" }}
      </v-btn>
      <v-btn outlined color="error" class="mb-2" :loading="busy === 'create'" :disabled="!!busy" @click="confirmOpen = true">
        <v-icon left size="16">$credit-card</v-icon>
        Create a real link
      </v-btn>
    </div>

    <v-alert v-if="formError" type="error" text dense rounded="lg" class="mt-2">{{ formError }}</v-alert>

    <!-- RESULT -->
    <template v-if="result">
      <v-divider class="my-4" />

      <v-alert
        v-if="result.error"
        :type="result.error.kind === 'refused' ? 'warning' : 'error'"
        text
        rounded="lg"
        class="text-body-2"
      >
        <div class="font-weight-bold">
          {{ result.error.kind === "refused" ? "Your API said no" : "Couldn't reach your API" }}
        </div>
        {{ result.error.message }}
        <div v-if="result.error.kind === 'refused'" class="text-caption mt-1">
          The bot passes this reason on to the customer.
        </div>
      </v-alert>

      <div v-if="result.quote && Object.keys(result.quote).length" class="mb-4">
        <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">Price check gave</div>
        <ResultValues :values="result.quote" />
      </div>

      <div v-if="result.confirmReply && !result.error" class="mb-4">
        <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">The bot would say</div>
        <div class="bubble">{{ result.confirmReply }}</div>
      </div>

      <template v-if="result.link">
        <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">Link created</div>
        <ResultValues :values="result.link" class="mb-2" />
        <v-alert v-if="result.linkAllowed === false" type="error" text dense rounded="lg" class="text-body-2">
          This link isn't on one of your allowed link domains, so the bot wouldn't send it.
        </v-alert>
        <v-alert v-else-if="result.delivery === 'client_sends'" type="info" text dense rounded="lg" class="text-body-2">
          Your system was asked to send the link to {{ phone }}.
        </v-alert>
        <div v-if="result.sentReply" class="mb-4">
          <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">Then the bot says</div>
          <div class="bubble">{{ result.sentReply }}</div>
        </div>
        <div v-if="result.runId" class="text-caption grey--text mb-3">
          Logged under What the bot did ·
          <router-link :to="`/dashboard/actions/runs?actionKey=${action.key}`">see runs</router-link>
        </div>
      </template>

      <div class="text-caption font-weight-bold text-uppercase grey--text mb-1">Requests</div>
      <ActionSteps :steps="result.steps" />
    </template>

    <ConfirmDialog
      v-model="confirmOpen"
      title="Create a real payment link?"
      confirm-label="Create link"
      icon="$credit-card"
      :loading="busy === 'create'"
      @confirm="run(true)"
    >
      This calls your API for real{{ action.quote ? ", after a price check" : "" }} and makes a real
      payment link for the values you entered. It is logged under What the bot did.
      <div v-if="willClientSend" class="mt-2 font-weight-bold error--text">
        On {{ channelLabel }}, your system really sends the link to {{ phone || "this phone" }}.
      </div>
    </ConfirmDialog>
  </v-card>
</template>

<script>
import ConfirmDialog from "@/components/team/ConfirmDialog.vue";
import ActionSteps from "@/components/actions/ActionSteps.vue";
import { apiError } from "@/utils/knowledge";
import { CHANNELS, formatAmount, testAction } from "@/utils/actions";

// Small key/value list; amounts get ₹ and links are clickable
const ResultValues = {
  name: "ResultValues",
  functional: true,
  props: { values: { type: Object, required: true } },
  render(h, { props, data }) {
    const show = (k, v) => {
      if (v && typeof v === "object") return JSON.stringify(v);
      if (k === "amount") return formatAmount(v);
      return String(v);
    };
    return h(
      "table",
      { ...data, class: ["result-values", data.staticClass, data.class] },
      Object.entries(props.values).map(([k, v]) =>
        h("tr", [
          h("td", { class: "grey--text pr-3 text-no-wrap" }, k),
          h(
            "td",
            { class: "font-weight-medium text-break" },
            k === "url" && typeof v === "string"
              ? [h("a", { attrs: { href: v, target: "_blank", rel: "noopener" } }, v)]
              : show(k, v),
          ),
        ]),
      ),
    );
  },
};

export default {
  name: "ActionTestPanel",

  components: { ActionSteps, ConfirmDialog, ResultValues },

  props: {
    action: { type: Object, required: true },
    unsaved: { type: Boolean, default: false },
  },

  data: () => ({
    inputs: {},
    phone: "",
    channel: "whatsapp",
    busy: "",
    result: null,
    formError: "",
    confirmOpen: false,
  }),

  computed: {
    channelItems() {
      return CHANNELS.filter((c) => (this.action.channels || []).includes(c.value)).map((c) => ({
        ...c,
        text: c.label,
      }));
    },
    channelLabel() {
      return CHANNELS.find((c) => c.value === this.channel)?.label || this.channel;
    },
    willClientSend() {
      return this.channel === "voice" || this.action.delivery?.[this.channel] === "client_sends";
    },
  },

  watch: {
    action: {
      immediate: true,
      handler(a) {
        const next = {};
        (a.inputs || []).forEach((i) => {
          next[i.name] = this.inputs[i.name] ?? (i.type === "integer" && i.min != null ? String(i.min) : "");
        });
        this.inputs = next;
        if (!(a.channels || []).includes(this.channel)) this.channel = (a.channels || [])[0] || "whatsapp";
      },
    },
  },

  methods: {
    payload(createLink) {
      const inputs = {};
      for (const i of this.action.inputs || []) {
        const raw = this.inputs[i.name];
        if (raw === "" || raw == null) {
          if (i.required !== false) return { error: `Enter ${i.name}.` };
          continue;
        }
        inputs[i.name] = i.type === "integer" ? Number(raw) : raw;
      }
      const digits = this.phone.replace(/[^\d]/g, "");
      if (digits.length < 10 || digits.length > 15) {
        return { error: "Enter the customer's phone with country code, e.g. 919876543210." };
      }
      return { body: { inputs, phone: digits, channel: this.channel, createLink } };
    },

    async run(createLink) {
      this.formError = "";
      const { body, error } = this.payload(createLink);
      if (error) {
        this.formError = error;
        this.confirmOpen = false;
        return;
      }
      this.busy = createLink ? "create" : "check";
      try {
        this.result = await testAction(this.action.id, body);
      } catch (err) {
        this.formError = apiError(err, "The test didn't run.");
      } finally {
        this.busy = "";
        this.confirmOpen = false;
      }
    },
  },
};
</script>

<style scoped>
.bubble {
  background: #e7f6ec;
  border-radius: 12px 12px 12px 4px;
  padding: 10px 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 0.875rem;
}
.result-values td {
  vertical-align: top;
  font-size: 0.875rem;
  padding: 2px 0;
}
</style>
