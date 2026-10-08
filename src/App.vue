<template>
  <v-app>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
export default {};
</script>

<style>
/* Spinning icon (replaces mdi-spin) */
.icon-spin {
  animation: icon-spin 1.5s linear infinite;
}
@keyframes icon-spin {
  to {
    transform: rotate(360deg);
  }
}
.v-btn,
.v-tab {
  text-decoration: none !important;
  text-transform: capitalize !important;
  letter-spacing: normal !important;
}

/* One corner radius (8px, Vuetify's rounded-lg) for buttons, toggles and
   inputs everywhere, including those set to `rounded` (pill). Icon and fab
   buttons stay circular. */
.v-application .v-btn:not(.v-btn--icon):not(.v-btn--fab) {
  border-radius: 8px !important;
}
.v-application .v-btn-toggle {
  border-radius: 8px !important;
}
.v-application .v-btn-toggle > .v-btn.v-btn.v-btn {
  border-radius: 0 !important;
}
.v-application .v-btn-toggle > .v-btn.v-btn.v-btn:first-child {
  border-top-left-radius: 8px !important;
  border-bottom-left-radius: 8px !important;
}
.v-application .v-btn-toggle > .v-btn.v-btn.v-btn:last-child {
  border-top-right-radius: 8px !important;
  border-bottom-right-radius: 8px !important;
}
.v-application .v-text-field--outlined fieldset,
.v-application .v-text-field--outlined > .v-input__control > .v-input__slot,
.v-application .v-text-field--rounded > .v-input__control > .v-input__slot,
.v-application .v-text-field--solo > .v-input__control > .v-input__slot {
  border-radius: 8px !important;
}
</style>
