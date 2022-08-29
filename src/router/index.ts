import { createWebHistory, createRouter, NavigationGuard } from "vue-router";
import { useCookies } from "vue3-cookies";
import { useAuthStore } from "../store/auth.store.js";
import { users } from './user.js'
const { cookies } = useCookies();

// const authStore = useAuthStore()

const routes: any = [{
    path: "/:catchAll(.*)",
    redirect: '/login'
  }, {
    path: "/login",
    name: "login",
    component: () => import('../views/auth/Login.vue'),
    beforeEnter: (to: string, from: string, next: any) => {
      if (!cookies.get('expense_app_token')) {
        next()
      } else {
        next('/dashboard')
      }
    }
  }, {
    path: "/dashboard",
    name: "dashboard",
    component: () => import('../views/dashboard/Index.vue'),
  }, {
    path: "/register",
    name: "register",
    component: () => import('../views/auth/Register.vue'),
  }, {
    path: "/income",
    name: "income",
    component: () => import('../views/income/Index.vue'),
  }, {
    path: "/expenses",
    name: "expenses",
    component: () => import('../views/expenses/Index.vue'),
  }, {
    path: "/expenses_category",
    name: "expenses_category",
    component: () => import('../views/expense_category/Index.vue'),
  }, {
    path: "/reminders",
    name: "reminder",
    component: () => import('../views/reminders/Index.vue'),
  },
  users
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach((to, from, next) => {
  if (cookies.get('expense_app_token')) next()
  else {
    if (from.fullPath !== '/' || to.fullPath === '/login') next()
    else next({ path: '/login', replace: true, query: to.query });

  }
})

export default router;