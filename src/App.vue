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
@import url("https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap");
* {
  font-family: "PT Sans", sans-serif;
}
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
</style>
