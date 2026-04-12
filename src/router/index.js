import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/main',
    name: 'MainPanel',
    component: () => import('../views/MainPanel.vue')
  },
  {
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/Favorites.vue')
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue')
  },
  {
    path: '/demand',
    name: 'Demand',
    component: () => import('../views/Demand.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
