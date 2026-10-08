<template>
  <div>
    <div class="text-body-2 grey--text text--darken-1 mb-4">
      Your API doesn't have to match our format. For each of our fields, enter
      where it is inside one of your products, as a dot path like
      <code>pricing.monthly</code>. Leave everything empty if your API already
      uses our format.
      <span v-if="suggestions.length">
        Paths from your API's first product are offered as suggestions.
      </span>
      <span v-else>Run "Try it" below to get suggestions from your API.</span>
    </div>

    <div class="sub-title">Product</div>
    <v-row dense>
      <v-col v-for="f in BASIC" :key="f.key" cols="12" sm="6" md="4">
        <v-combobox
          :value="value[f.key]"
          :items="suggestions"
          :label="f.label"
          :placeholder="f.key"
          persistent-placeholder
          outlined
          dense
          clearable
          hide-details
          class="mb-2"
          @change="update(f.key, $event)"
        />
      </v-col>
    </v-row>

    <div class="sub-title mt-4">Price</div>
    <div class="text-caption grey--text text--darken-1 mb-2">
      Either a path to a ready-made prices list in our format, or one amount
      with its label.
    </div>
    <v-row dense>
      <v-col cols="12" sm="6" md="4">
        <v-combobox
          :value="value.prices"
          :items="suggestions"
          label="Prices list (our format)"
          outlined
          dense
          clearable
          hide-details
          class="mb-2"
          @change="update('prices', $event)"
        />
      </v-col>
    </v-row>
    <v-row dense>
      <v-col cols="12" sm="6" md="4">
        <v-combobox
          :value="value.price"
          :items="suggestions"
          label="Amount"
          placeholder="pricing.monthly"
          persistent-placeholder
          outlined
          dense
          clearable
          hide-details
          class="mb-2"
          @change="update('price', $event)"
        />
      </v-col>
      <v-col cols="6" sm="3" md="2">
        <v-text-field
          :value="value.priceLabel"
          label="Label"
          placeholder="Monthly"
          persistent-placeholder
          outlined
          dense
          hide-details
          class="mb-2"
          @input="update('priceLabel', $event)"
        />
      </v-col>
      <v-col cols="6" sm="3" md="2">
        <v-text-field
          :value="value.priceUnit"
          label="Per"
          placeholder="month"
          persistent-placeholder
          outlined
          dense
          hide-details
          class="mb-2"
          @input="update('priceUnit', $event)"
        />
      </v-col>
      <v-col cols="6" sm="6" md="2">
        <v-combobox
          :value="value.currency"
          :items="suggestions"
          label="Currency path"
          outlined
          dense
          clearable
          hide-details
          class="mb-2"
          @change="update('currency', $event)"
        />
      </v-col>
      <v-col cols="6" sm="6" md="2">
        <v-text-field
          :value="value.currencyCode"
          label="Or fixed currency"
          placeholder="INR"
          persistent-placeholder
          outlined
          dense
          hide-details
          class="mb-2"
          @input="update('currencyCode', $event)"
        />
      </v-col>
    </v-row>

    <div class="sub-title mt-4">Stock</div>
    <v-row dense>
      <v-col cols="12" sm="6" md="4">
        <v-combobox
          :value="value.availability"
          :items="suggestions"
          label="Stock value"
          placeholder="stock.state"
          persistent-placeholder
          outlined
          dense
          clearable
          hide-details
          class="mb-2"
          @change="update('availability', $event)"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-combobox
          :value="value.locations"
          :items="suggestions"
          label="Locations"
          outlined
          dense
          clearable
          hide-details
          class="mb-2"
          @change="update('locations', $event)"
        />
      </v-col>
    </v-row>
    <div class="text-caption grey--text text--darken-1 mb-2">
      Understood without mapping: in_stock, limited, out_of_stock, on_request,
      true/false, and numbers (0 = out of stock). Map any other value below.
      <strong>A value we don't understand makes no stock claim</strong>, so the
      bot won't say the product is in stock.
    </div>
    <v-row v-for="row in value.availabilityValues" :key="row.id" dense class="align-start">
      <v-col cols="5">
        <v-text-field
          :value="row.theirs"
          label="Your value"
          placeholder="Waitlist"
          outlined
          dense
          hide-details
          class="mb-2"
          @input="updateRow('availabilityValues', row, { theirs: $event })"
        />
      </v-col>
      <v-col cols="5">
        <v-select
          :value="row.ours"
          :items="STOCK_STATUSES"
          label="Means"
          outlined
          dense
          hide-details
          class="mb-2"
          @change="updateRow('availabilityValues', row, { ours: $event })"
        />
      </v-col>
      <v-col cols="2" class="d-flex align-center pt-2">
        <v-btn icon small title="Remove" @click="removeRow('availabilityValues', row)">
          <v-icon small color="error">$trash-2</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-btn small text rounded color="primary" class="mb-2" @click="addRow('availabilityValues', { theirs: '', ours: '' })">
      <v-icon small class="mr-1">$plus</v-icon> Map a stock value
    </v-btn>

    <div class="sub-title mt-4">Attributes</div>
    <div class="text-caption grey--text text--darken-1 mb-2">
      Shown as features. Name one <code>fuel</code> so customers can ask for
      "electric" or "petrol".
    </div>
    <v-row v-for="row in value.attributes" :key="row.id" dense class="align-start">
      <v-col cols="5">
        <v-text-field
          :value="row.ours"
          label="Name"
          placeholder="fuel"
          outlined
          dense
          hide-details
          class="mb-2"
          @input="updateRow('attributes', row, { ours: $event })"
        />
      </v-col>
      <v-col cols="5">
        <v-combobox
          :value="row.path"
          :items="suggestions"
          label="Path"
          placeholder="specs.fuel_type"
          persistent-placeholder
          outlined
          dense
          hide-details
          class="mb-2"
          @change="updateRow('attributes', row, { path: $event })"
        />
      </v-col>
      <v-col cols="2" class="d-flex align-center pt-2">
        <v-btn icon small title="Remove" @click="removeRow('attributes', row)">
          <v-icon small color="error">$trash-2</v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-btn
      small
      text
      rounded
      color="primary"
      :disabled="value.attributes.length >= 20"
      @click="addRow('attributes', { ours: '', path: '' })"
    >
      <v-icon small class="mr-1">$plus</v-icon> Add attribute
    </v-btn>
  </div>
</template>

<script>
import { newRow, STOCK_STATUSES } from "@/utils/integrationApi";

const BASIC = [
  { key: "sku", label: "ID (sku)" },
  { key: "name", label: "Name" },
  { key: "url", label: "Product page URL" },
  { key: "category", label: "Category" },
  { key: "aliases", label: "Other names (aliases)" },
];

// v-model: the mapping form from fieldMapToForm()
export default {
  name: "FieldMapEditor",

  props: {
    value: { type: Object, required: true },
    suggestions: { type: Array, default: () => [] },
  },

  data: () => ({ BASIC, STOCK_STATUSES }),

  methods: {
    update(key, val) {
      this.$emit("input", { ...this.value, [key]: val || "" });
    },
    addRow(list, fields) {
      this.update(list, [...this.value[list], newRow(fields)]);
    },
    updateRow(list, row, patch) {
      this.update(
        list,
        this.value[list].map((r) => (r.id === row.id ? { ...r, ...patch } : r)),
      );
    },
    removeRow(list, row) {
      this.update(list, this.value[list].filter((r) => r.id !== row.id));
    },
  },
};
</script>

<style scoped>
.sub-title {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 8px;
}
</style>
