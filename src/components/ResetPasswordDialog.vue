<template>
  <v-dialog :value="value" max-width="400" @input="$emit('input', $event)">
    <v-card rounded="xl">
      <v-card-title class="text-h6 font-weight-bold">
        {{ title }}
      </v-card-title>

      <v-card-text>
        <v-text-field
          v-model="password"
          label="New Password"
          type="password"
          outlined
          dense
        />
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="$emit('input', false)">Cancel</v-btn>
        <v-btn color="primary" @click="submit">Update</v-btn>
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
