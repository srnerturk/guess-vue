import Vue from "vue"
import VueRouter from "vue-router"
import Join from "@/views/Join"

Vue.use(VueRouter)

const routes = [{
  path: "/",
  name: "Join",
  component: Join
},
{
  path: "/create-game-1105",
  name: "Create",
  component: () =>
    import(/* webpackChunkName: "about" */ "@/views/Create.vue")
}
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
})

export default router
