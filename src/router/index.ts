import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true }
    },
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/views/CalendarView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: () => import('@/views/InvoicesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/companies',
      name: 'companies',
      component: () => import('@/views/CompaniesView.vue'),
      meta: { requiresAuth: true, adminOnly: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('@/views/UsersView.vue'),
      meta: { requiresAuth: true, superAdminOnly: true }
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth check if we have a token but no user
  if (authStore.token && !authStore.user) {
    const isValid = await authStore.checkAuth()
    if (!isValid && to.meta.requiresAuth) {
      next('/login')
      return
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/dashboard')
  } else if (to.meta.adminOnly && !authStore.isAdmin) {
    next('/dashboard')
  } else if (to.meta.superAdminOnly && !authStore.isSuperAdmin) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
