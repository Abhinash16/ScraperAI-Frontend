<template>
  <div>
    <!-- URL -->
    <v-row dense>
      <v-col cols="4" sm="2">
        <v-select
          :value="value.method"
          :items="['POST', 'GET']"
          label="Method"
          outlined
          dense
          @change="set('method', $event)"
        />
      </v-col>
      <v-col cols="8" sm="10">
        <v-text-field
          :value="value.url"
          label="Your API's URL"
          :placeholder="urlPlaceholder"
          hint="Must start with https://"
          persistent-hint
          outlined
          dense
          @input="set('url', $event)"
        >
          <template #append>
            <PlaceholderMenu
              v-if="placeholders.length"
              :placeholders="placeholders"
              @pick="set('url', insert(value.url, $event))"
            />
          </template>
        </v-text-field>
      </v-col>
    </v-row>

    <!-- PARAMETERS -->
    <div class="mt-4">
      <div class="d-flex align-center mb-2">
        <div>
          <div class="d-flex align-center">
            <v-icon size="16" color="grey darken-1" class="mr-2">$braces</v-icon>
            <span class="text-caption font-weight-bold text-uppercase grey--text">What we send</span>
          </div>
          <div v-if="stepName === 'options'" class="text-caption grey--text text--darken-1">
            Fixed values only ({{ value.method === "GET" ? "sent as query parameters" : "sent as JSON" }}), no
            placeholders: the list is fetched before any conversation, so there's no customer or
            collected value to fill in.
          </div>
          <div v-else class="text-caption grey--text text--darken-1">
            {{ value.method === "GET" ? "Sent in the URL" : "Sent as JSON" }}. To fill in what the bot
            collected, type a placeholder like <code v-pre>{{bookingId}}</code> or pick one with the
            <v-icon size="12">$braces</v-icon> button in the field. A value that is exactly one placeholder
            keeps its type, so numbers stay numbers.
          </div>
        </div>
        <v-spacer />
        <v-btn small outlined color="primary" class="ml-2" @click="addRow('params', { name: '', value: '' })">
          <v-icon left size="14">$plus</v-icon>
          Add
        </v-btn>
      </div>
      <v-row v-for="row in value.params" :key="row.id" dense class="align-start">
        <v-col cols="12" sm="4">
          <v-text-field
            :value="row.name"
            label="Name"
            placeholder="bookingId"
            outlined
            dense
            hide-details
            @input="updateRow('params', row, { name: $event })"
          />
        </v-col>
        <v-col cols="10" sm="7">
          <v-text-field
            :value="row.value"
            label="Value"
:placeholder="stepName === 'options' ? 'service' : '{{bookingId}}'"
            outlined
            dense
            hide-details
            @input="updateRow('params', row, { value: $event })"
          >
            <template #append>
              <PlaceholderMenu
                v-if="placeholders.length"
                :placeholders="placeholders"
                @pick="updateRow('params', row, { value: insert(row.value, $event) })"
              />
            </template>
          </v-text-field>
        </v-col>
        <v-col cols="2" sm="1" class="d-flex align-center pt-2">
          <v-btn icon small title="Remove" @click="removeRow('params', row)">
            <v-icon small color="error">$trash-2</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- RESULTS -->
    <div v-if="stepName !== 'options'" class="mt-5">
      <div class="d-flex align-center mb-2">
        <div>
          <div class="d-flex align-center">
            <v-icon size="16" color="grey darken-1" class="mr-2">$file-json</v-icon>
            <span class="text-caption font-weight-bold text-uppercase grey--text">What we read back</span>
          </div>
          <div class="text-caption grey--text text--darken-1">
            Give each value a name and say where it is in your API's response, as a dot path
            (<code>data.totalAmount</code>).
            <template v-if="stepName === 'create' && actionType === 'request'">
              <b>id</b> (required) is the new request's ID, e.g. <code>sr_id</code>; the bot gives it to the
              customer. Add others, like <b>stage</b>, to use them in the message.
            </template>
            <template v-else-if="stepName === 'create'">
              <b>url</b> is the payment link; <b>amount</b> is shown in the message.
            </template>
            <template v-else>
              <b>amount</b> is the price the bot tells the customer.
            </template>
          </div>
        </div>
        <v-spacer />
        <v-btn small outlined color="primary" class="ml-2" @click="addRow('outputs', { name: '', path: '' })">
          <v-icon left size="14">$plus</v-icon>
          Add
        </v-btn>
      </div>
      <v-row v-for="row in value.outputs" :key="row.id" dense class="align-start">
        <v-col cols="12" sm="4">
          <v-text-field
            :value="row.name"
            label="Name"
            placeholder="amount"
            outlined
            dense
            hide-details
            @input="updateRow('outputs', row, { name: $event })"
          />
        </v-col>
        <v-col cols="10" sm="7">
          <v-text-field
            :value="row.path"
            label="Where it is in the response"
            :placeholder="pathPlaceholder(row)"
            outlined
            dense
            hide-details
            @input="updateRow('outputs', row, { path: $event })"
          />
        </v-col>
        <v-col cols="2" sm="1" class="d-flex align-center pt-2">
          <v-btn icon small title="Remove" @click="removeRow('outputs', row)">
            <v-icon small color="error">$trash-2</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </div>

    <!-- SIGN-IN + HEADERS + ADVANCED -->
    <v-expansion-panels flat class="mt-5 step-advanced">
      <v-expansion-panel>
        <v-expansion-panel-header class="px-0">
          <span class="text-body-2 font-weight-medium">
            <v-icon size="16" class="mr-2">$lock</v-icon>
            Sign-in, headers and errors
            <span class="grey--text ml-1">· {{ authSummary }}</span>
          </span>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <ApiAuthEditor :value="value.auth" @input="set('auth', $event)" />
          <HeadersEditor class="mt-4" :value="value.headers" @input="set('headers', $event)" />

          <template v-if="stepName !== 'options'">
          <div class="d-flex align-center mt-5 mb-1">
            <v-icon size="16" color="grey darken-1" class="mr-2">$circle-alert</v-icon>
            <span class="text-caption font-weight-bold text-uppercase grey--text">When your API says no</span>
          </div>
          <v-checkbox
            :input-value="value.refuseOn4xx"
            label="Show the API's 4xx error message to the customer"
            dense
            hide-details
            class="mt-0 mb-1"
            @change="set('refuseOn4xx', !!$event)"
          />
          <div class="text-caption grey--text text--darken-1 mb-3">
            <template v-if="value.refuseOn4xx">
              An HTTP 4xx with a message counts as a refusal, and the bot shows the message to the
              customer word for word, so write it for customers.
            </template>
            <template v-else>
              An HTTP 4xx counts as a failure: the customer gets the standard "couldn't do it right now"
              reply, never your API's message.
            </template>
            If your API answers 200 with a success flag instead (like <code>"status": 0</code>), tell us
            where the flag and the reason are; that reason is always shown to the customer.
          </div>
          </template>
          <v-row dense>
            <v-col v-if="stepName !== 'options'" cols="12" sm="4">
              <v-text-field
                :value="value.okPath"
                label="Success flag"
                placeholder="status"
                outlined
                dense
                @input="set('okPath', $event)"
              />
            </v-col>
            <v-col v-if="stepName !== 'options'" cols="12" sm="4">
              <v-text-field
                :value="value.errorPath"
                label="Reason it said no"
                placeholder="message"
                outlined
                dense
                @input="set('errorPath', $event)"
              />
            </v-col>
            <v-col cols="12" sm="4">
              <v-text-field
                :value="value.timeout / 1000"
                label="Time limit"
                type="number"
                min="1"
                max="30"
                suffix="seconds"
                hint="How long to wait for your API. Payment-link calls may need 20 s."
                persistent-hint
                outlined
                dense
                @input="set('timeout', Math.round(Number($event) * 1000))"
              />
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import ApiAuthEditor from "@/components/integrations/ApiAuthEditor.vue";
import HeadersEditor from "@/components/integrations/HeadersEditor.vue";
import PlaceholderMenu from "@/components/actions/PlaceholderMenu.vue";
import { AUTH_TYPES, newRow } from "@/utils/integrationApi";

// v-model: one step form from actionToForm() (quote or create)
export default {
  name: "ActionStepEditor",

  components: { ApiAuthEditor, HeadersEditor, PlaceholderMenu },

  props: {
    value: { type: Object, required: true },
    stepName: { type: String, required: true }, // quote | create | options (an input's choices)
    actionType: { type: String, default: "payment_link" }, // payment_link | request
    placeholders: { type: Array, default: () => [] },
  },

  computed: {
    urlPlaceholder() {
      if (this.stepName === "options") return "https://api.yoursite.com/bot/service-request-types";
      return this.stepName === "quote"
        ? "https://api.yoursite.com/bot/extension-quote"
        : this.actionType === "request"
        ? "https://api.yoursite.com/bot/service-request"
        : "https://api.yoursite.com/bot/payment-link";
    },
    authSummary() {
      const t = AUTH_TYPES.find((a) => a.value === this.value.auth.type);
      const headers = this.value.headers.length;
      return [
        this.value.auth.type === "headers" ? "No sign-in" : t?.text,
        headers ? `${headers} header${headers === 1 ? "" : "s"}` : "",
      ]
        .filter(Boolean)
        .join(", ");
    },
  },

  methods: {
    pathPlaceholder(row) {
      if (this.stepName === "create" && row.name === "url") return "data.paymentLink";
      if (this.stepName === "create" && row.name === "id") return "sr_id";
      if (this.stepName === "create" && this.actionType === "request") return "data.stage";
      return "data.totalAmount";
    },
    set(key, val) {
      this.$emit("input", { ...this.value, [key]: val });
    },
    addRow(list, fields) {
      this.set(list, [...this.value[list], newRow(fields)]);
    },
    updateRow(list, row, patch) {
      this.set(
        list,
        this.value[list].map((r) => (r.id === row.id ? { ...r, ...patch } : r)),
      );
    },
    removeRow(list, row) {
      this.set(
        list,
        this.value[list].filter((r) => r.id !== row.id),
      );
    },
    insert(current, placeholder) {
      return current ? `${current}${placeholder}` : placeholder;
    },
  },
};
</script>

<style scoped>
.step-advanced >>> .v-expansion-panel-content__wrap {
  padding: 0 0 8px;
}
</style>
