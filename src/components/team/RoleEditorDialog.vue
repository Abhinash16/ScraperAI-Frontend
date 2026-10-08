<template>
  <v-dialog :value="value" max-width="720" scrollable @input="close">
    <v-card rounded="lg">
      <div class="d-flex align-center pa-5">
        <v-avatar size="44" tile color="primary lighten-5" class="rounded-lg mr-4 flex-shrink-0">
          <v-icon size="22" color="primary">$shield-user</v-icon>
        </v-avatar>
        <div class="flex-grow-1 text-h6 font-weight-bold grey--text text--darken-4">{{ title }}</div>
        <v-btn icon aria-label="Close" :disabled="saving" @click="close"><v-icon>$x</v-icon></v-btn>
      </div>
      <v-divider />

      <v-card-text class="pa-5">
        <v-text-field
          v-model.trim="name"
          label="Role name"
          placeholder="e.g. Support agent"
          prepend-inner-icon="$tag"
          outlined
          dense
          :error-messages="nameError"
          @input="nameError = ''"
        />

        <!-- Full access (owners only) -->
        <v-sheet v-if="iAmOwner" color="amber lighten-5" rounded="lg" class="d-flex align-center px-4 py-3 mb-4">
          <v-icon size="20" color="amber darken-2" class="mr-3">$crown</v-icon>
          <div class="flex-grow-1 mr-4">
            <div class="text-body-2 font-weight-bold grey--text text--darken-4">
              {{ catalog.fullAccess ? catalog.fullAccess.label : "Full access" }}
            </div>
            <div class="text-caption grey--text text--darken-2">
              Every permission, including ones added later. Same level as the owner.
            </div>
          </div>
          <v-switch v-model="fullAccess" color="amber darken-2" inset hide-details class="mt-0 pt-0" />
        </v-sheet>

        <div class="d-flex align-center mb-2">
          <span class="text-caption font-weight-bold text-uppercase grey--text">Permissions</span>
          <v-spacer />
          <v-chip
            x-small
            label
            :color="fullAccess ? 'amber lighten-5' : 'green lighten-5'"
            :text-color="fullAccess ? 'amber darken-4' : 'green darken-2'"
            class="font-weight-bold"
          >
            {{ fullAccess ? "Full access" : `${selected.length} of ${allKeys.length} selected` }}
          </v-chip>
        </div>

        <v-sheet v-for="group in catalog.groups" :key="group.key" outlined rounded="lg" class="mb-3">
          <div class="d-flex align-center px-4 py-2">
            <span class="text-body-2 font-weight-bold grey--text text--darken-4">{{ group.label }}</span>
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
          <v-divider />
          <v-row dense class="px-4 py-2">
            <v-col v-for="perm in group.permissions" :key="perm.key" cols="12" sm="6">
              <v-tooltip top :disabled="canGrant(perm.key)">
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on">
                    <v-checkbox
                      v-model="selected"
                      :value="perm.key"
                      :disabled="fullAccess || !canGrant(perm.key)"
                      color="success"
                      dense
                      hide-details
                      class="mt-0 pt-0"
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
        </v-sheet>

        <v-alert v-if="generalError" type="error" text dense rounded="lg" class="text-body-2 mt-4 mb-0">
          {{ generalError }}
        </v-alert>
      </v-card-text>

      <v-divider />
      <v-card-actions class="px-5 py-3">
        <v-spacer />
        <v-btn text :disabled="saving" @click="close">Cancel</v-btn>
        <v-btn
          color="primary"
          depressed
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
