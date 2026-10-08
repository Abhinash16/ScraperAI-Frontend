<template>
  <v-dialog :value="value" max-width="420" @input="$emit('input', $event)">
    <v-card rounded="lg">
      <div class="d-flex align-center pa-5">
        <v-avatar size="44" tile color="primary lighten-5" class="rounded-lg mr-4 flex-shrink-0">
          <v-icon size="22" color="primary">$rotate-ccw-key</v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold grey--text text--darken-4">{{ title }}</div>
      </div>
      <v-divider />

      <v-card-text class="pa-5">
        <v-text-field
          v-model="password"
          label="New Password"
          type="password"
          outlined
          dense
          hide-details="auto"
        />
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <v-btn text @click="$emit('input', false)">Cancel</v-btn>
        <v-btn color="primary" depressed @click="submit">Update</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";

export default {
  props: {
    value: Boolean, // for v-model
    userId: String,
    title: {
      type: String,
      default: "Reset Password",
    },
  },

  data() {
    return {
      password: "",
      loading: false,
    };
  },

  watch: {
    value(val) {
      if (val) this.password = "";
    },
  },

  methods: {
    async submit() {
      try {
        this.loading = true;

        await apiClient.put(`/users/${this.userId}/password`, {
          password: this.password,
        });

        this.$emit("success");
        this.$emit("input", false);
      } catch (err) {
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
