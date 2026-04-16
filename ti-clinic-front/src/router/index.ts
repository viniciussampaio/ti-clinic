import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import store from "@/store";
import HomeView from "../views/HomeView.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/login",
    name: "login",
    component: () =>
      import(/* webpackChunkName: "login" */ "../views/LoginView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: "/pacientes/cadastro",
    name: "patient-register",
    component: () =>
      import(
        /* webpackChunkName: "patient-register" */ "../views/PatientRegisterView.vue"
      ),
    meta: { requiresAuth: true },
  },
  {
    path: "/planos-saude",
    name: "health-plans",
    component: () =>
      import(
        /* webpackChunkName: "health-plans" */ "../views/HealthPlansView.vue"
      ),
    meta: { requiresAuth: true },
  },
  {
    path: "/agendamentos",
    name: "appointments",
    component: () =>
      import(
        /* webpackChunkName: "appointments" */ "../views/AppointmentsView.vue"
      ),
    meta: { requiresAuth: true },
  },
  {
    path: "/especialidades",
    name: "specialties",
    component: () =>
      import(
        /* webpackChunkName: "specialties" */ "../views/SpecialtiesView.vue"
      ),
    meta: { requiresAuth: true },
  },
  {
    path: "/medicos",
    name: "doctors",
    component: () =>
      import(/* webpackChunkName: "doctors" */ "../views/DoctorsView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/procedimentos",
    name: "procedures",
    component: () =>
      import(
        /* webpackChunkName: "procedures" */ "../views/ProceduresView.vue"
      ),
    meta: { requiresAuth: true },
  },
];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, _from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const guestOnly = to.matched.some((record) => record.meta.guestOnly);
  const isAuthenticated = store.getters.isAuthenticated as boolean;

  if (requiresAuth && !isAuthenticated) {
    next({
      name: "login",
      ...(to.path !== "/login" ? { query: { redirect: to.fullPath } } : {}),
    });
    return;
  }

  if (guestOnly && isAuthenticated) {
    next({ name: "home" });
    return;
  }

  next();
});

export default router;
