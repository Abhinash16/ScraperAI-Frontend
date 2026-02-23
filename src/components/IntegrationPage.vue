<template>
  <v-container fluid>
    <!-- Navigation Drawer -->
    <v-navigation-drawer app permanent>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <!-- Application Title and Subtitle -->
            <v-list-item-title class="text-h6">Application</v-list-item-title>
            <v-list-item-subtitle>subtext</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <!-- Additional Navigation Items -->
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Menu Item 1</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>Menu Item 2</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content Area -->
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <!-- Card for Content -->
            <v-card>
              <v-card-title>How does it work?</v-card-title>
              <v-card-text>Update your ChatGPT API key</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-container>
</template>

<script>
export default {};
</script>

<style scoped>
/* Custom styles specific to this component */
</style>
