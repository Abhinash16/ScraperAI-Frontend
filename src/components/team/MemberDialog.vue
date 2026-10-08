<template>
  <v-dialog :value="value" max-width="560" scrollable @input="close">
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center pb-2">
        <div>
          <div class="text-h6 font-weight-bold">{{ title }}</div>
          <div v-if="member && mode !== 'create'" class="text-caption grey--text text--darken-1">
            {{ member.name }} · {{ member.email }}
          </div>
        </div>
        <v-spacer />
        <v-btn icon :disabled="saving" @click="close"><v-icon>$x</v-icon></v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-form ref="form" @submit.prevent="save">
          <template v-if="mode !== 'role'">
            <v-text-field
              v-model.trim="form.name"
              label="Full name"
              outlined
              dense
              :error-messages="errors.name"
              @input="errors.name = ''"
            />
          </template>

          <template v-if="mode === 'create'">
            <v-text-field
              v-model.trim="form.email"
              label="Email"
              type="email"
              outlined
              dense
              autocomplete="off"
              :error-messages="errors.email"
              @input="errors.email = ''"
            />
            <PasswordField
              v-model="form.password"
              class="mb-4"
              :error-messages="errors.password"
              @input="errors.password = ''"
            />
          </template>

          <template v-if="showRolePicker">
            <div class="picker-title">Role</div>
            <div v-if="roleLocked" class="text-caption grey--text text--darken-1 mb-2">
              You can't change your own role.
            </div>
            <div v-if="!roles.length" class="empty-roles text-center">
              <v-icon color="grey lighten-1" class="mb-1">$shield-off</v-icon>
              <div class="text-body-2 font-weight-medium">No roles available</div>
              <div class="text-caption grey--text text--darken-1">
                A member needs a role.
                <template v-if="canManageRoles">
                  <a href="#" @click.prevent="$emit('open-roles')">Create a role</a>
                  first.
                </template>
                <template v-else>Ask an admin to create one.</template>
              </div>
            </div>
            <v-item-group v-else v-model="form.roleId" class="role-picker">
              <v-tooltip
                v-for="role in roles"
                :key="role._id"
                top
                :disabled="role.assignable !== false"
              >
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <v-item
                      v-slot="{ active, toggle }"
                      :value="role._id"
                      :disabled="roleLocked || role.assignable === false"
                    >
                      <div
                        :class="[
                          'role-option',
                          {
                            active,
                            disabled: roleLocked || role.assignable === false,
                          },
                        ]"
                        @click="!(roleLocked || role.assignable === false) && !active && toggle()"
                      >
                        <v-icon small :color="active ? 'primary' : 'grey lighten-1'" class="mr-3">
                          {{ active ? "$circle-dot" : "$circle" }}
                        </v-icon>
                        <RoleChip :role="role" x-small class="mr-2" />
                        <span class="text-caption grey--text text--darken-1">
                          {{ summary(role) }}
                        </span>
                      </div>
                    </v-item>
                  </div>
                </template>
                You can only assign roles with permissions you have
              </v-tooltip>
            </v-item-group>
            <div v-if="errors.role" class="error--text text-caption mt-1">
              {{ errors.role }}
            </div>
          </template>

          <v-alert
            v-if="errors.general"
            type="error"
            text
            dense
            rounded="lg"
            class="text-body-2 mt-4 mb-0"
          >
            {{ errors.general }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn text rounded :disabled="saving" @click="close">Cancel</v-btn>
        <v-btn
          color="primary"
          depressed
          rounded
          :loading="saving"
          :disabled="!canSubmit"
          @click="save"
        >
          {{ mode === "create" ? "Add member" : "Save" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import PasswordField from "@/components/team/PasswordField.vue";
import RoleChip from "@/components/team/RoleChip.vue";
import { apiError, permissionSummary } from "@/utils/team";

const emptyErrors = () => ({ name: "", email: "", password: "", role: "", general: "" });

// Add a member (mode "create"), edit name/role ("edit") or change role ("role").
// Emits "saved" with the returned user.
export default {
  name: "MemberDialog",

  components: { PasswordField, RoleChip },

  props: {
    value: { type: Boolean, default: false },
    mode: { type: String, default: "create" },
    member: { type: Object, default: null },
    roles: { type: Array, default: () => [] },
    isSelf: { type: Boolean, default: false },
    canManageRoles: { type: Boolean, default: false },
  },

  data() {
    return {
      form: { name: "", email: "", password: "", roleId: null },
      errors: emptyErrors(),
      saving: false,
    };
  },

  computed: {
    title() {
      return { create: "Add member", edit: "Edit member", role: "Change role" }[this.mode];
    },

    showRolePicker() {
      return this.mode === "create" || this.mode === "role" || (this.mode === "edit" && !this.isSelf);
    },

    roleLocked() {
      return this.mode !== "create" && this.isSelf;
    },

    canSubmit() {
      if (this.mode === "create") {
        return this.form.name && this.form.email && this.form.password.length >= 8 && this.form.roleId;
      }
      if (this.mode === "role") return !!this.form.roleId;
      return !!this.form.name;
    },
  },

  watch: {
    value: {
      immediate: true,
      handler(open) {
        if (!open) return;
        this.errors = emptyErrors();
        this.form = {
          name: this.member?.name || "",
          email: this.member?.email || "",
          password: "",
          roleId: this.member?.roleId?._id || null,
        };
        this.$nextTick(() => this.$refs.form?.resetValidation());
      },
    },
  },

  methods: {
    summary(role) {
      return permissionSummary(role);
    },

    close() {
      if (!this.saving) this.$emit("input", false);
    },

    // Route a 400 message to the field it's about.
    applyError(message) {
      const m = message.toLowerCase();
      if (m.includes("email") && !m.includes("password")) this.errors.email = message;
      else if (m.includes("password")) this.errors.password = message;
      else if (m.includes("role")) this.errors.role = message;
      else if (m.includes("name")) this.errors.name = message;
      else this.errors.general = message;
    },

    async save() {
      if (!this.canSubmit || !this.$refs.form.validate()) return;
      this.errors = emptyErrors();
      this.saving = true;
      try {
        let res;
        if (this.mode === "create") {
          res = await apiClient.post("/users", { ...this.form });
        } else {
          const body = {};
          if (this.mode === "edit") body.name = this.form.name;
          if (this.showRolePicker && !this.roleLocked && this.form.roleId !== this.member.roleId?._id) {
            body.roleId = this.form.roleId;
          }
          res = await apiClient.put(`/users/${this.member._id}`, body);
        }
        this.$emit("saved", res.data.data);
        this.$emit("input", false);
      } catch (err) {
        this.applyError(apiError(err, "Something went wrong. Please try again."));
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.picker-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
  margin-bottom: 8px;
}

.empty-roles {
  border: 1px dashed #d6dbe8;
  border-radius: 12px;
  padding: 16px;
}

.role-picker {
  border: 1px solid #e4e8f2;
  border-radius: 12px;
  overflow: hidden;
}

.role-option {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.role-picker > div + div .role-option {
  border-top: 1px solid #e4e8f2;
}

.role-option:hover {
  background: #f6f8fd;
}

.role-option.active {
  background: #eff2fb;
}

.role-option.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
