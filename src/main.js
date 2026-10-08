import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import VueMoment from "vue-moment";
import { initializeAuth } from "./utils/initAuth";
import { applyTheme } from "./utils/theme";
import "./styles/dark.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
initializeAuth();
// Before the first paint, so dark mode doesn't flash light
applyTheme(vuetify.framework.theme, window.location.pathname);

Vue.config.productionTip = false;
Vue.use(VueMoment);

new Vue({
  vuetify,
  router,
  render: (h) => h(App),
}).$mount("#app");

Vue.use(Toast, {
  position: "top-right",
  timeout: 3000,
});
