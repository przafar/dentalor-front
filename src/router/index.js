import { createRouter, createWebHistory } from 'vue-router';

import Dashboard from '../pages/Dashboard.vue';
import Service from '../pages/service/Index.vue';
import Patients from '../pages/patients/Index.vue';
import PatientShow from '../pages/patients/Show.vue';
import Appointment from '../pages/appointment/Index.vue';
import AppointmentShow from '../pages/appointment/Show.vue';
import Organizations from '../pages/organizations/Index.vue';
import Practitioners from '../pages/practitioners/Index.vue';
import PractitionerShow from '../pages/practitioners/Show.vue';
import Payments from '../pages/payments/Index.vue';
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
        meta: { name: 'dashboard' },
      },
      {
        path: 'organizations',
        name: 'organizations',
        component: Organizations,
        meta: { name: 'organizations' },
      },
      {
        path: 'practitioners',
        name: 'practitioners',
        component: Practitioners,
        meta: { name: 'practitioners' },
      },
      {
        path: 'practitioner/:id',
        name: 'practitioner-show',
        component: PractitionerShow,
        meta: { name: 'practitioners' },
      },
      {
        path: 'service',
        name: 'service',
        component: Service,
        meta: { name: 'service' },
      },
      {
        path: 'patients',
        name: 'patients',
        component: Patients,
        meta: { name: 'patients' },
      },
      {
        path: 'patient/:id',
        name: 'patient-show',
        component: PatientShow,
        meta: { name: 'patient' },
      },
      {
        path: 'appointments',
        name: 'appointments',
        component: Appointment,
        meta: { name: 'appointments' },
      },
      {
        path: 'appointments/:id',
        name: 'appointments-show',
        component: AppointmentShow,
        meta: { name: 'appointments' },
      },
      {
        path: 'payments',
        name: 'payments',
        component: Payments,
        meta: { name: 'payments' },
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

  if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'Login' });
  } else if (to.matched.some(record => record.meta.requiresGuest) && isAuthenticated) {
    next({ name: 'service' });
  } else {
    next();
  }
});

export default router;