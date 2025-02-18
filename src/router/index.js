import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard.vue';
import Service from '../pages/service/Index.vue';
import Patient from '../pages/patient/Index.vue';
import PatientShow from '../pages/patient/Show.vue';
import Appointment from '../pages/appointment/Index.vue';
import AppointmentShow from '../pages/appointment/Show.vue';

import Login from '../pages/login/Index.vue';
import MainLayout from '../layouts/MainLayout.vue';
import EmptyLayout from '../layouts/EmptyLayout.vue';

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
        meta: { name: 'Dashboard' },
      },
      {
        path: '/service', 
        name: 'service',
        component: Service,
        meta: { name: 'service' },
      },
      {
        path: '/patient', 
        name: 'patient',
        component: Patient,
        meta: { name: 'patient' },
      },
      {
        path: '/patient/:id',
        name: 'patient-show',
        component: PatientShow,
        meta: { name: 'patient' },
      },
      {
        path: '/appointments',
        name: 'appointments',
        component: Appointment,
        meta: { name: 'appointments' },
      },
      {
        path: '/appointments/:id',
        name: 'appointments-show',
        component: AppointmentShow,
        meta: { name: 'appointments' },
      }
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
    next({ name: 'service' });
  } else {
    next();
  }
});

export default router;