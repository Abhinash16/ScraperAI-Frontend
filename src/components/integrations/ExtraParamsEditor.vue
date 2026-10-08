<template>
  <div>
    <div class="d-flex align-center mb-3">
      <div>
        <div class="d-flex align-center">
          <v-icon size="16" color="grey darken-1" class="mr-2">$braces</v-icon>
          <span class="text-caption font-weight-bold text-uppercase grey--text">Extra parameters</span>
        </div>
        <div class="text-caption grey--text text--darken-1">
          Sent with every call. Values and the URL can use
          <code v-for="p in placeholders" :key="p" class="mr-1">{{ p }}</code>
        </div>
      </div>
      <v-spacer />
      <v-btn small outlined color="primary" :disabled="value.length >= 20" @click="add">
        <v-icon left size="14">$plus</v-icon>
        Add parameter
      </v-btn>
    </div>

    <v-row v-for="row in value" :key="row.id" dense class="align-start">
      <v-col cols="12" sm="5">
        <v-text-field
          :value="row.name"
          label="Name"
          placeholder="store_id"
          outlined
          dense
          hide-details
          @input="update(row, { name: $event })"
        />
      </v-col>
      <v-col cols="10" sm="6">
        <v-text-field
          :value="row.value"
          label="Value"
          :placeholder="placeholders[0]"
          outlined
          dense
          hide-details
          @input="update(row, { value: $event })"
        />
      </v-col>
      <v-col cols="2" sm="1" class="d-flex align-center pt-2">
        <v-btn icon small title="Remove parameter" @click="remove(row)">
          <v-icon small color="error">$trash-2</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { newRow } from "@/utils/integrationApi";

// v-model: rows from pairsToRows()
export default {
  name: "ExtraParamsEditor",

  props: {
    value: { type: Array, required: true },
    placeholders: { type: Array, default: () => [] },
  },

  methods: {
    add() {
      this.$emit("input", [...this.value, newRow({ name: "", value: "" })]);
    },
    update(row, patch) {
      this.$emit("input", this.value.map((r) => (r.id === row.id ? { ...r, ...patch } : r)));
    },
    remove(row) {
      this.$emit("input", this.value.filter((r) => r.id !== row.id));
    },
  },
};
</script>
