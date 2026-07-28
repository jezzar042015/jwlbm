import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: "home",
      path: "/",
      component: () => import("../views/HomeView.vue"),
    },
    {
      name: "import",
      path: "/import",
      component: () => import("../views/FileImport.vue"),
    },
    {
      name: "databases",
      path: "/databases",
      component: () => import("../views/DatabasesList.vue"),
    },
    {
      name: "database-notes",
      path: "/notes",
      component: () => import("../views/DatabaseNotes.vue"),
    }
  ],
})

export default router
