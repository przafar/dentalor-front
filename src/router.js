import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './pages/Dashboard.vue';
import Login from './pages/login/Index.vue';
import MainLayout from './layouts/MainLayout.vue';
import EmptyLayout from './layouts/EmptyLayout.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true }, 
    children: [
      {
        path: '', 
        name: 'Dashboard',
        component: Dashboard,
      },
    ],
  },
  {
    path: '/login',
    component: EmptyLayout, 
    meta: { requiresGuest: true },
    children: [
      {
        path: '', 
        name: 'Login',
        component: Login,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token'); 

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;