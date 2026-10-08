<template>
  <div>
    <div class="d-flex align-center mb-3">
      <div>
        <div class="headers-title">Headers</div>
        <div class="text-caption grey--text text--darken-1">
          Sent with every request. Saved values stay hidden.
        </div>
      </div>
      <v-spacer />
      <v-btn small text rounded color="primary" @click="addRow">
        <v-icon small class="mr-1">$plus</v-icon> Add header
      </v-btn>
    </div>

    <SecretNotice class="mb-3" />

    <div v-if="!value.length" class="empty-headers text-body-2 mb-2">
      No headers yet. Add one for API keys or auth tokens.
    </div>

    <v-row v-for="row in value" :key="row.id" dense class="align-start">
      <v-col cols="12" sm="5">
        <v-text-field
          :value="row.key"
          label="Name"
          placeholder="Authorization"
          outlined
          dense
          hide-details
          :readonly="row.stored"
          @input="update(row, { key: $event })"
        />
      </v-col>
      <v-col cols="10" sm="6">
        <v-text-field
          v-if="row.stored"
          value="••••••••"
          label="Value (saved)"
          outlined
          dense
          hide-details
          readonly
          prepend-inner-icon="$lock"
        />
        <v-text-field
          v-else
          :value="row.value"
          label="Value"
          outlined
          dense
          hide-details
          autocomplete="off"
          @input="update(row, { value: $event })"
        />
      </v-col>
      <v-col cols="2" sm="1" class="d-flex align-center pt-2">
        <v-btn
          v-if="row.stored"
          icon
          small
          title="Replace value"
          @click="update(row, { stored: false, value: '' })"
        >
          <v-icon small>$pencil</v-icon>
        </v-btn>
        <v-btn icon small title="Remove header" @click="removeRow(row)">
          <v-icon small color="error">$trash-2</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { newHeaderRow } from "@/utils/apiHeaders";
import SecretNotice from "@/components/SecretNotice.vue";

// v-model is an array of rows from rowsFromHeaders()/newHeaderRow().
export default {
  name: "HeadersEditor",

  components: { SecretNotice },

  props: {
    value: { type: Array, required: true },
  },

  methods: {
    addRow() {
      this.$emit("input", [...this.value, newHeaderRow()]);
    },

    removeRow(row) {
      this.$emit(
        "input",
        this.value.filter((r) => r.id !== row.id),
      );
    },

    update(row, patch) {
      this.$emit(
        "input",
        this.value.map((r) => (r.id === row.id ? { ...r, ...patch } : r)),
      );
    },
  },
};
</script>

<style scoped>
.headers-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
}

.empty-headers {
  border: 1px dashed #d6dbe8;
  border-radius: 12px;
  padding: 14px 16px;
  color: #9e9e9e;
}
</style>
