<template>
  <v-dialog :value="value" max-width="560" scrollable @input="close">
    <v-card rounded="lg">
      <div class="d-flex align-center pa-5">
        <v-avatar size="44" tile color="primary lighten-5" class="rounded-lg mr-4 flex-shrink-0">
          <v-icon size="22" color="primary">{{ mode === "create" ? "$user-plus" : "$user-cog" }}</v-icon>
        </v-avatar>
        <div class="flex-grow-1 overflow-hidden">
          <div class="text-h6 font-weight-bold grey--text text--darken-4">{{ title }}</div>
          <div v-if="member && mode !== 'create'" class="text-caption grey--text text--darken-1 text-truncate">
            {{ member.name }} · {{ member.email }}
          </div>
        </div>
        <v-btn icon aria-label="Close" :disabled="saving" @click="close"><v-icon>$x</v-icon></v-btn>
      </div>
      <v-divider />

      <v-card-text class="pa-5">
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
            <div class="text-caption font-weight-bold text-uppercase grey--text mb-2">Role</div>
            <div v-if="roleLocked" class="text-caption grey--text text--darken-1 mb-2">
              You can't change your own role.
            </div>
            <v-sheet
              v-if="!roles.length"
              color="grey lighten-5"
              rounded="lg"
              class="d-flex flex-column align-center text-center pa-4"
            >
              <v-icon color="grey" class="mb-1">$shield-off</v-icon>
              <div class="text-body-2 font-weight-bold grey--text text--darken-3">No roles available</div>
              <div class="text-caption grey--text text--darken-1">
                A member needs a role.
                <template v-if="canManageRoles">
                  <a href="#" @click.prevent="$emit('open-roles')">Create a role</a>
                  first.
                </template>
                <template v-else>Ask an admin to create one.</template>
              </div>
            </v-sheet>
            <v-sheet v-else outlined rounded="lg" class="overflow-hidden">
              <v-item-group v-model="form.roleId">
                <template v-for="(role, i) in roles">
                  <v-divider v-if="i > 0" :key="`d-${role._id}`" />
                  <v-tooltip :key="role._id" top :disabled="role.assignable !== false">
                    <template v-slot:activator="{ on, attrs }">
                      <div v-bind="attrs" v-on="on">
                        <v-item
                          v-slot="{ active, toggle }"
                          :value="role._id"
                          :disabled="roleLocked || role.assignable === false"
                        >
                          <v-card
                            flat
                            tile
                            :color="active ? 'green lighten-5' : 'white'"
                            :disabled="roleLocked || role.assignable === false"
                            class="d-flex align-center px-4 py-3"
                            @click="!active && toggle()"
                          >
                            <v-icon size="18" :color="active ? 'green darken-1' : 'grey lighten-1'" class="mr-3">
                              {{ active ? "$circle-check" : "$circle" }}
                            </v-icon>
                            <RoleChip :role="role" x-small class="mr-2" />
                            <span class="text-caption grey--text text--darken-1">{{ summary(role) }}</span>
                          </v-card>
                        </v-item>
                      </div>
                    </template>
                    You can only assign roles with permissions you have
                  </v-tooltip>
                </template>
              </v-item-group>
            </v-sheet>
            <div v-if="errors.role" class="error--text text-caption mt-1">{{ errors.role }}</div>
          </template>

          <v-alert v-if="errors.general" type="error" text dense rounded="lg" class="text-body-2 mt-4 mb-0">
            {{ errors.general }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <v-btn text :disabled="saving" @click="close">Cancel</v-btn>
        <v-btn color="primary" depressed :loading="saving" :disabled="!canSubmit" @click="save">
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
