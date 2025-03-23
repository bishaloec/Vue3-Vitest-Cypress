import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'

import Dashboard from '../views/Dashboard.vue'
import { useAuthStore } from '../stores/auth.ts'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: Login },
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true } // 認証が必要なルート
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ナビゲーションガード
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
export default router