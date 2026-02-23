<template>
  <div>
    <!-- Adding the extension slot for tabs -->
    <v-navigation-drawer app clipped flat v-if="!$route.meta.hideTab">
      <v-list dense nav>
        <v-list-item
          :to="item.link"
          v-for="item in items"
          :key="item.name"
          link
        >
          <!-- <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon> -->

          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <router-view></router-view>
    </v-main>
  </div>
</template>

<script>
import { setAuthToken } from "@/service/axios";

export default {
  components: {},
  data() {
    return {
      pages: [],
      tab: 0, // Initialize the tab value
      items: [
        {
          name: "Submit Sitemap",
          link: "sitemap",
        },
        {
          name: "Page List",
          link: "page-list",
        },
        {
          name: "Scraped Pages",
          link: "scraped-pages",
        },
      ], // Tabs titles
    };
  },
  methods: {
    logout() {
      // Clear the token from local storage
      localStorage.removeItem("user-token");

      // Reset the Axios instance authorization header
      setAuthToken(null);

      // Redirect to the login page
      this.$router.push("/login"); // Adjust the route as needed

      alert("Logout successful!");
    },
  },
  mounted() {},
};
</script>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
}

button {
  margin-left: 10px;
}
</style>
