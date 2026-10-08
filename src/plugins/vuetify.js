import Vue from "vue";
import Vuetify from "vuetify/lib/framework";
import { iconValues } from "./icons";

Vue.use(Vuetify);

export default new Vuetify({
  icons: {
    values: iconValues,
  },
  theme: {
    dark: false,
    // Defines --v-primary-base, --v-error-base etc. for component styles
    options: { customProperties: true },
    themes: {
      light: {
        primary: "#6c6ef6",
      },
      // A lighter primary so text and outlines stay readable on dark surfaces
      dark: {
        primary: "#8b8df8",
        // Brand name and other "secondary" text: dark grey in light mode
        secondary: "#ececf1",
      },
    },
  },
});
