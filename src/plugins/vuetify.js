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
    themes: {
      light: {
        primary: "#6c6ef6",
      },
    },
  },
});
