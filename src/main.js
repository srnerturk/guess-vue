import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import { io } from "socket.io-client"
import VueSweetalert2 from "vue-sweetalert2"
import VueSocketIO from "vue-socket.io"
import "sweetalert2/dist/sweetalert2.min.css"
import "@/assets/css/reset.scss"
import "@/assets/css/style.scss"
Vue.config.productionTip = false

Vue.use(new VueSocketIO({
  debug: true,
  connection: io("http://localhost:9090")
}))

Vue.use(VueSweetalert2)
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app")
