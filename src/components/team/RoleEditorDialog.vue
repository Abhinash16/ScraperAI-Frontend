<template>
  <v-dialog :value="value" max-width="720" scrollable @input="close">
    <v-card rounded="xl">
      <v-card-title class="d-flex align-center pb-2">
        <div class="text-h6 font-weight-bold">{{ title }}</div>
        <v-spacer />
        <v-btn icon :disabled="saving" @click="close"><v-icon>$x</v-icon></v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        <v-text-field
          v-model.trim="name"
          label="Role name"
          placeholder="e.g. Support agent"
          outlined
          dense
          :error-messages="nameError"
          @input="nameError = ''"
        />

        <!-- Full access (owners only) -->
        <div v-if="iAmOwner" class="full-access d-flex align-center mb-4">
          <div class="flex-grow-1 mr-4">
            <div class="font-weight-medium d-flex align-center">
              <v-icon small color="amber darken-2" class="mr-1">$crown</v-icon>
              {{ catalog.fullAccess ? catalog.fullAccess.label : "Full access" }}
            </div>
            <div class="text-caption grey--text text--darken-1">
              Every permission, including ones added later. Same level as the owner.
            </div>
          </div>
          <v-switch v-model="fullAccess" color="amber darken-2" inset hide-details class="mt-0 pt-0" />
        </div>

        <div class="d-flex align-center mb-2">
          <div class="section-title">Permissions</div>
          <v-spacer />
          <span class="text-caption grey--text text--darken-1">
            {{ fullAccess ? "Full access" : `${selected.length} of ${allKeys.length} selected` }}
          </span>
        </div>

        <div :class="['groups', { dimmed: fullAccess }]">
          <div v-for="group in catalog.groups" :key="group.key" class="group">
            <div class="group-header d-flex align-center">
              <div class="font-weight-bold">{{ group.label }}</div>
              <span class="text-caption grey--text ml-2">
                {{ groupCount(group) }}/{{ group.permissions.length }}
              </span>
              <v-spacer />
              <v-btn
                x-small
                text
                color="primary"
                :disabled="fullAccess || !grantable(group).length"
                @click="toggleGroup(group)"
              >
                {{ groupAllSelected(group) ? "Clear" : "Select all" }}
              </v-btn>
            </div>
            <v-row dense class="px-3 pb-2">
              <v-col v-for="perm in group.permissions" :key="perm.key" cols="12" sm="6">
                <v-tooltip top :disabled="canGrant(perm.key)">
                  <template v-slot:activator="{ on, attrs }">
                    <div v-bind="attrs" v-on="on">
                      <v-checkbox
                        v-model="selected"
                        :value="perm.key"
                        :disabled="fullAccess || !canGrant(perm.key)"
                        dense
                        hide-details
                        class="mt-0 pt-0 perm-checkbox"
                      >
                        <template v-slot:label>
                          <span class="text-body-2">{{ perm.label }}</span>
                        </template>
                      </v-checkbox>
                    </div>
                  </template>
                  You don't have this permission, so you can't grant it
                </v-tooltip>
              </v-col>
            </v-row>
          </div>
        </div>

        <v-alert
          v-if="generalError"
          type="error"
          text
          dense
          rounded="lg"
          class="text-body-2 mt-4 mb-0"
        >
          {{ generalError }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="px-6 pb-5">
        <v-spacer />
        <v-btn text rounded :disabled="saving" @click="close">Cancel</v-btn>
        <v-btn
          color="primary"
          depressed
          rounded
          :loading="saving"
          :disabled="!name || (!fullAccess && !selected.length)"
          @click="save"
        >
          {{ role ? "Save role" : "Create role" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import apiClient from "@/service/axios";
import { apiError, FULL_ACCESS } from "@/utils/team";

// Create (role = null, optional `copyFrom`) or edit a role.
// `catalog` is GET /roles/permissions data. Emits "saved" with the role.
export default {
  name: "RoleEditorDialog",

  props: {
    value: { type: Boolean, default: false },
    role: { type: Object, default: null },
    copyFrom: { type: Object, default: null },
    catalog: { type: Object, required: true },
    myPermissions: { type: Array, default: () => [] },
  },

  data() {
    return {
      name: "",
      selected: [],
      fullAccess: false,
      nameError: "",
      generalError: "",
      saving: false,
    };
  },

  computed: {
    title() {
      if (this.role) return "Edit role";
      return this.copyFrom ? "Duplicate role" : "New role";
    },

    iAmOwner() {
      return this.myPermissions.includes(FULL_ACCESS);
    },

    allKeys() {
      return (this.catalog.groups || []).flatMap((g) => g.permissions.map((p) => p.key));
    },
  },

  watch: {
    value: {
      immediate: true,
      handler(open) {
        if (!open) return;
        const source = this.role || this.copyFrom;
        const perms = source?.permissions || [];
        this.name = this.role ? this.role.name : this.copyFrom ? `${this.copyFrom.name} copy` : "";
        this.fullAccess = perms.includes(FULL_ACCESS);
        // Ignore keys the catalog no longer lists (retired permissions)
        this.selected = perms.filter((p) => this.allKeys.includes(p));
        this.nameError = "";
        this.generalError = "";
      },
    },
  },

  methods: {
    canGrant(key) {
      return this.iAmOwner || this.myPermissions.includes(key);
    },

    grantable(group) {
      return group.permissions.filter((p) => this.canGrant(p.key)).map((p) => p.key);
    },

    groupCount(group) {
      return group.permissions.filter((p) => this.selected.includes(p.key)).length;
    },

    groupAllSelected(group) {
      const keys = this.grantable(group);
      return keys.length > 0 && keys.every((k) => this.selected.includes(k));
    },

    toggleGroup(group) {
      const keys = this.grantable(group);
      this.selected = this.groupAllSelected(group)
        ? this.selected.filter((k) => !keys.includes(k))
        : [...new Set([...this.selected, ...keys])];
    },

    close() {
      if (!this.saving) this.$emit("input", false);
    },

    async save() {
      this.nameError = "";
      this.generalError = "";
      this.saving = true;
      const body = {
        name: this.name,
        permissions: this.fullAccess ? [FULL_ACCESS] : this.selected,
      };
      try {
        const { data } = this.role
          ? await apiClient.put(`/roles/${this.role._id}`, body)
          : await apiClient.post("/roles", body);
        this.$emit("saved", data.data);
        this.$emit("input", false);
      } catch (err) {
        const message = apiError(err, "Failed to save role");
        if (/name/i.test(message) || /already exists/i.test(message)) this.nameError = message;
        else this.generalError = message;
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.section-title {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #757575;
}

.full-access {
  background: #fff8e1;
  border-radius: 12px;
  padding: 12px 16px;
}

.groups.dimmed {
  opacity: 0.5;
}

.group {
  border: 1px solid #e4e8f2;
  border-radius: 12px;
  margin-bottom: 10px;
}

.group-header {
  padding: 10px 12px 6px 14px;
}

.perm-checkbox ::v-deep .v-label {
  margin-bottom: 0;
}
</style>
