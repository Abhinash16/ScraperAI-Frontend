<template>
  <v-chip
    v-if="role"
    :small="!xSmall"
    :x-small="xSmall"
    outlined
    :color="color"
    class="font-weight-medium"
  >
    <v-icon v-if="owner" x-small left>mdi-crown</v-icon>
    {{ role.name }}
  </v-chip>
  <v-chip v-else :small="!xSmall" :x-small="xSmall" outlined color="grey">
    No role
  </v-chip>
</template>

<script>
import { isOwnerRole, roleColor } from "@/utils/team";

export default {
  name: "RoleChip",

  props: {
    role: { type: Object, default: null },
    xSmall: { type: Boolean, default: false },
  },

  computed: {
    owner() {
      return isOwnerRole(this.role);
    },
    color() {
      return roleColor(this.role);
    },
  },
};
</script>
