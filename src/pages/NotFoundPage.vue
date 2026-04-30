<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <!-- Sad Face Icon/Emoji -->
        <v-icon size="120" color="grey lighten-2" class="mb-4">
          mdi-emoticon-sad-outline
        </v-icon>

        <!-- Error Code -->
        <h1 class="display-4 font-weight-black primary--text mb-6">404</h1>

        <!-- Message -->
        <p class="text-h6 font-weight-light mb-8 grey--text text--darken-3">
          The page you are attempting to reach is currently not available. This
          may be because the page does not exist or has been moved.
        </p>

        <!-- Action Button -->
        <v-btn
          color="primary"
          x-large
          depressed
          @click="$router.go(-1)"
          class="text-none px-10 py-6 font-weight-bold"
          rounded
        >
          Go Back
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "NotFoundPage",
};
</script>

<style scoped>
/* Adjusting the font-size slightly for that massive "404" look if display-4 isn't enough */
.display-4 {
  font-size: 8rem !important;
  line-height: 1;
}
</style>
