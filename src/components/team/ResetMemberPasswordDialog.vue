<template>
  <v-dialog :value="value" max-width="460" @input="close">
    <v-card rounded="lg">
      <div class="d-flex align-center pa-5">
        <v-avatar
          size="44"
          tile
          :color="done ? 'green lighten-5' : 'amber lighten-5'"
          class="rounded-lg mr-4 flex-shrink-0"
        >
          <v-icon size="22" :color="done ? 'green darken-1' : 'amber darken-2'">
            {{ done ? "$circle-check" : "$rotate-ccw-key" }}
          </v-icon>
        </v-avatar>
        <div class="text-h6 font-weight-bold grey--text text--darken-4">
          {{ done ? "Password reset" : "Reset password" }}
        </div>
      </div>
      <v-divider />

      <v-card-text class="pa-5">
        <template v-if="!done">
          <div class="text-body-2 grey--text text--darken-2 mb-4">
            Set a new password for <strong>{{ member && member.name }}</strong>. They'll use it the
            next time they sign in.
          </div>
          <PasswordField v-model="password" label="New password" :error-messages="error" @input="error = ''" />
        </template>

        <template v-else>
          <div class="text-body-2 grey--text text--darken-2 mb-3">
            Share this password with <strong>{{ member && member.name }}</strong> securely. It won't be
            shown again.
          </div>
          <v-sheet color="grey darken-4" dark rounded="lg" class="d-flex align-center pa-3">
            <span class="flex-grow-1 text-subtitle-1 text-break grey--text text--lighten-3 mr-2">
              {{ password }}
            </span>
            <v-btn x-small depressed color="success" @click="copy">
              <v-icon left size="12">$copy</v-icon>
              Copy
            </v-btn>
          </v-sheet>
        </template>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <template v-if="!done">
          <v-btn text :disabled="saving" @click="close">Cancel</v-btn>
          <v-btn color="warning" depressed :loading="saving" :disabled="password.length < 8" @click="submit">
            Reset password
          </v-btn>
        </template>
        <v-btn v-else color="primary" depressed @click="close">Done</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import PasswordField from "@/components/team/PasswordField.vue";
import { apiError, generatePassword } from "@/utils/team";

export default {
  name: "ResetMemberPasswordDialog",

  components: { PasswordField },

  props: {
    value: { type: Boolean, default: false },
    member: { type: Object, default: null },
  },

  data: () => ({ password: "", error: "", saving: false, done: false }),

  watch: {
    value(open) {
      if (open) {
        this.password = generatePassword();
        this.error = "";
        this.done = false;
      } else {
        this.password = ""; // don't keep it around after closing
      }
    },
  },

  methods: {
    close() {
      if (!this.saving) this.$emit("input", false);
    },

    async submit() {
      this.saving = true;
      try {
        await apiClient.put(`/users/${this.member._id}/password`, {
          password: this.password,
        });
        this.done = true;
      } catch (err) {
        this.error = apiError(err, "Failed to reset password");
      } finally {
        this.saving = false;
      }
    },

    async copy() {
      try {
        await navigator.clipboard.writeText(this.password);
        this.$toast.success("Password copied");
      } catch {
        this.$toast.error("Couldn't copy to clipboard");
      }
    },
  },
};
</script>
