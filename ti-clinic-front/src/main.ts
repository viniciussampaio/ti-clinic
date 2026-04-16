import Vue from "vue";
import Quasar from "quasar";
import "@quasar/extras/material-icons/material-icons.css";
import "quasar/dist/quasar.min.css";
import App from "./App.vue";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;
Vue.use(Quasar, {});

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
