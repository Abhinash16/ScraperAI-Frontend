import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import router from "./router";
import VueMoment from "vue-moment";
import { initializeAuth } from "./utils/initAuth";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
initializeAuth();

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
