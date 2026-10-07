<template>
  <v-dialog :value="value" max-width="460" @input="close">
    <v-card rounded="xl" class="pa-2">
      <v-card-title class="text-h6 font-weight-bold">
        {{ done ? "Password reset" : "Reset password" }}
      </v-card-title>

      <v-card-text>
        <template v-if="!done">
          <div class="text-body-2 mb-4">
            Set a new password for <strong>{{ member && member.name }}</strong>.
            They'll use it the next time they sign in.
          </div>
          <PasswordField
            v-model="password"
            label="New password"
            :error-messages="error"
            @input="error = ''"
          />
        </template>

        <template v-else>
          <div class="text-body-2 mb-3">
            Share this password with <strong>{{ member && member.name }}</strong>
            securely. It won't be shown again.
          </div>
          <div class="secret-box">
            <code class="secret">{{ password }}</code>
            <v-btn x-small depressed rounded color="primary" @click="copy">
              <v-icon x-small class="mr-1">$copy</v-icon> Copy
            </v-btn>
          </div>
        </template>
      </v-card-text>

      <v-card-actions class="px-4 pb-4">
        <v-spacer />
        <template v-if="!done">
          <v-btn text rounded :disabled="saving" @click="close">Cancel</v-btn>
          <v-btn
            color="warning"
            depressed
            rounded
            :loading="saving"
            :disabled="password.length < 8"
            @click="submit"
          >
            Reset password
          </v-btn>
        </template>
        <v-btn v-else color="primary" depressed rounded @click="close">Done</v-btn>
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

<style scoped>
.secret-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #0f172a;
  border-radius: 12px;
  padding: 10px 12px 10px 16px;
}

.secret {
  background: transparent !important;
  color: #e2e8f0 !important;
  padding: 0 !important;
  box-shadow: none !important;
  font-size: 15px;
  letter-spacing: 0.04em;
  word-break: break-all;
  margin-right: 8px;
}
</style>
