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

/* Tabs everywhere: a segmented control. Grey rounded track, the selected
   tab is a raised white pill, no underline. */
.v-application .v-tabs:not(.v-tabs--vertical) > .v-tabs-bar {
  width: fit-content;
  max-width: 100%;
  height: auto !important;
  padding: 4px;
  border-radius: 10px;
  background-color: #f1f3f7 !important;
}
.v-application .v-tabs:not(.v-tabs--vertical) .v-tabs-slider-wrapper {
  display: none;
}
.v-application .v-tabs:not(.v-tabs--vertical) .v-tab {
  height: 36px;
  min-width: 0;
  margin-right: 2px;
  padding: 0 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #5f6473 !important;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
}
.v-application .v-tabs:not(.v-tabs--vertical) .v-tab:last-child {
  margin-right: 0;
}
.v-application .v-tabs:not(.v-tabs--vertical) .v-tab::before {
  border-radius: 8px;
}
.v-application .v-tabs:not(.v-tabs--vertical) .v-tab .v-icon {
  color: inherit !important;
}
.v-application .v-tabs:not(.v-tabs--vertical) .v-tab--active {
  background-color: #fff;
  color: var(--v-primary-base) !important;
  /* Drawn inside the pill: the tab bar clips anything outside it */
  box-shadow: inset 0 0 0 1px #e3e6ee;
}
.v-application .v-tabs:not(.v-tabs--vertical) .v-tab--disabled {
  opacity: 0.5;
}
</style>
