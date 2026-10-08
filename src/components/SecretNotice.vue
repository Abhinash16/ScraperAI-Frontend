<template>
  <div class="secret-notice text-caption">
    <v-icon x-small color="success" class="mr-1">$shield-check</v-icon>
    <span>
      {{ text }}
      <router-link to="/dashboard/documentation?guide=security">
        How we protect your keys
      </router-link>
    </span>
  </div>
</template>

<script>
import { SECRET_NOTICE } from "@/content/featureGuides";

export default {
  name: "SecretNotice",

  data() {
    return { text: SECRET_NOTICE };
  },
};
</script>

<style scoped>
.secret-notice {
  display: flex;
  align-items: flex-start;
  color: #616161;
}

.secret-notice .v-icon {
  margin-top: 2px;
}
</style>
