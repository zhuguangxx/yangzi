import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'AdminLogin',
    component: () => import('../views/admin/Login.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/admin/Dashboard.vue')
  },
  {
    path: '/customers',
    name: 'CustomerList',
    component: () => import('../views/admin/CustomerList.vue')
  },
  {
    path: '/customers/:phone',
    name: 'CustomerDetail',
    component: () => import('../views/admin/CustomerDetail.vue')
  },
  {
    path: '/images',
    name: 'ImageManage',
    component: () => import('../views/admin/ImageManage.vue')
  }
];

const router = createRouter({
  history: createWebHistory('/admin'),
  routes
});

export default router;
