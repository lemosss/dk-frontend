import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ==========================================
    // ROTAS GLOBAIS (Super Admin)
    // ==========================================
    {
      path: '/login',
      name: 'global-login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true, global: true }
    },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/admin',
      redirect: '/admin/dashboard'
    },
    {
      path: '/admin/dashboard',
      name: 'admin-dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true, superAdminOnly: true }
    },
    {
      path: '/admin/companies',
      name: 'admin-companies',
      component: () => import('@/views/CompaniesView.vue'),
      meta: { requiresAuth: true, superAdminOnly: true }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: () => import('@/views/UsersView.vue'),
      meta: { requiresAuth: true, superAdminOnly: true }
    },
    {
      path: '/admin/invoices',
      name: 'admin-invoices',
      component: () => import('@/views/InvoicesView.vue'),
      meta: { requiresAuth: true, superAdminOnly: true }
    },
    {
      path: '/admin/calendar',
      name: 'admin-calendar',
      component: () => import('@/views/CalendarView.vue'),
      meta: { requiresAuth: true, superAdminOnly: true }
    },

    // ==========================================
    // ROTAS DE TENANT (Empresa específica)
    // ==========================================
    {
      path: '/:companyKey/login',
      name: 'tenant-login',
      component: () => import('@/views/TenantLoginView.vue'),
      meta: { guest: true, tenant: true }
    },
    {
      path: '/:companyKey',
      redirect: to => `/${to.params.companyKey}/dashboard`
    },
    {
      path: '/:companyKey/dashboard',
      name: 'tenant-dashboard',
      component: () => import('@/views/TenantDashboardView.vue'),
      meta: { requiresAuth: true, tenant: true }
    },
    {
      path: '/:companyKey/invoices',
      name: 'tenant-invoices',
      component: () => import('@/views/TenantInvoicesView.vue'),
      meta: { requiresAuth: true, tenant: true }
    },
    {
      path: '/:companyKey/users',
      name: 'tenant-users',
      component: () => import('@/views/TenantUsersView.vue'),
      meta: { requiresAuth: true, tenant: true, adminOnly: true }
    },
    {
      path: '/:companyKey/calendar',
      name: 'tenant-calendar',
      component: () => import('@/views/TenantCalendarView.vue'),
      meta: { requiresAuth: true, tenant: true }
    },
    {
      path: '/:companyKey/profile',
      name: 'tenant-profile',
      component: () => import('@/views/TenantProfileView.vue'),
      meta: { requiresAuth: true, tenant: true, adminOnly: true }
    },

    // ==========================================
    // ROTAS LEGACY (redireciona para admin)
    // ==========================================
    {
      path: '/dashboard',
      redirect: '/admin/dashboard'
    },
    {
      path: '/companies',
      redirect: '/admin/companies'
    },
    {
      path: '/users',
      redirect: '/admin/users'
    },
    {
      path: '/invoices',
      redirect: '/admin/invoices'
    },
    {
      path: '/calendar',
      redirect: '/admin/calendar'
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()
  
  // Se é uma rota de tenant, carrega info da empresa
  if (to.meta.tenant && to.params.companyKey) {
    const companyKey = to.params.companyKey as string
    const loaded = await tenantStore.loadTenant(companyKey)
    
    if (!loaded && to.name !== 'tenant-login') {
      // Empresa não encontrada, redireciona para login global
      next('/login')
      return
    }
  }

  // Wait for auth check if we have a token but no user
  if (authStore.token && !authStore.user) {
    const isValid = await authStore.checkAuth()
    if (!isValid && to.meta.requiresAuth) {
      // Redireciona para login apropriado
      if (to.meta.tenant && to.params.companyKey) {
        next(`/${to.params.companyKey}/login`)
      } else {
        next('/login')
      }
      return
    }
  }

  // Verifica autenticação
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    if (to.meta.tenant && to.params.companyKey) {
      next(`/${to.params.companyKey}/login`)
    } else {
      next('/login')
    }
  } 
  // Se está logado e tenta acessar página de guest
  else if (to.meta.guest && authStore.isAuthenticated) {
    if (authStore.companyKey) {
      next(`/${authStore.companyKey}/dashboard`)
    } else {
      next('/admin/dashboard')
    }
  }
  // Verifica se precisa ser admin (da empresa)
  else if (to.meta.adminOnly && !authStore.isAdmin) {
    if (to.meta.tenant && to.params.companyKey) {
      next(`/${to.params.companyKey}/dashboard`)
    } else {
      next('/admin/dashboard')
    }
  }
  // Verifica se precisa ser super admin
  else if (to.meta.superAdminOnly && !authStore.isSuperAdmin) {
    // Se não é super admin mas tem empresa, vai pro tenant
    if (authStore.companyKey) {
      next(`/${authStore.companyKey}/dashboard`)
    } else {
      next('/login')
    }
  }
  else {
    next()
  }
})

export default router
