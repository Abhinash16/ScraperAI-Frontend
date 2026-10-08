<template>
  <div>
    <div class="d-flex align-center mb-3">
      <v-icon size="16" color="grey darken-1" class="mr-2">$lock</v-icon>
      <span class="text-caption font-weight-bold text-uppercase grey--text">Sign-in</span>
    </div>
    <v-row dense>
      <v-col cols="12" sm="6">
        <v-select
          :value="value.type"
          :items="AUTH_TYPES"
          label="How we sign in to your API"
          outlined
          dense
          @change="update('type', $event)"
        />
      </v-col>

      <v-col v-if="value.type === 'bearer'" cols="12" sm="6">
        <v-text-field
          :value="value.token"
          label="Token"
          type="password"
          autocomplete="new-password"
          :hint="savedHint(value.token)"
          persistent-hint
          outlined
          dense
          @input="update('token', $event)"
        />
      </v-col>

      <template v-if="value.type === 'basic'">
        <v-col cols="12" sm="6">
          <v-text-field
            :value="value.username"
            label="Username"
            autocomplete="off"
            outlined
            dense
            @input="update('username', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" offset-sm="6">
          <v-text-field
            :value="value.password"
            label="Password"
            type="password"
            autocomplete="new-password"
            :hint="savedHint(value.password)"
            persistent-hint
            outlined
            dense
            @input="update('password', $event)"
          />
        </v-col>
      </template>

      <template v-if="value.type === 'query_key'">
        <v-col cols="12" sm="6">
          <v-text-field
            :value="value.param"
            label="Parameter name"
            placeholder="api_key"
            outlined
            dense
            @input="update('param', $event)"
          />
        </v-col>
        <v-col cols="12" sm="6" offset-sm="6">
          <v-text-field
            :value="value.key"
            label="API key"
            type="password"
            autocomplete="new-password"
            :hint="savedHint(value.key) || `Sent as ?${value.param || 'api_key'}=…`"
            persistent-hint
            outlined
            dense
            @input="update('key', $event)"
          />
        </v-col>
      </template>
    </v-row>
    <SecretNotice v-if="value.type !== 'headers'" class="mb-2" />
  </div>
</template>

<script>
import SecretNotice from "@/components/SecretNotice.vue";
import { AUTH_TYPES, isMasked } from "@/utils/integrationApi";

// v-model: the auth form from authToForm()
export default {
  name: "ApiAuthEditor",

  components: { SecretNotice },

  props: {
    value: { type: Object, required: true },
  },

  data: () => ({ AUTH_TYPES }),

  methods: {
    update(key, val) {
      this.$emit("input", { ...this.value, [key]: val });
    },

    savedHint(v) {
      return isMasked(v) ? "Saved. Type a new one to replace it." : "";
    },
  },
};
</script>
