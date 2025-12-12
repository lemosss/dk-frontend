import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authService } from '@/services/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const companyKey = ref<string | null>(localStorage.getItem('companyKey'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => 
    user.value?.role === 'admin' || user.value?.role === 'superadmin'
  )
  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')

  /**
   * Login para uma empresa específica (tenant)
   */
  async function loginTenant(tenantKey: string, email: string, password: string) {
    loading.value = true
    try {
      const response = await authService.loginTenant(tenantKey, email, password)
      const accessToken = response.access_token
      
      // Se for superadmin, redireciona para admin
      if (response.redirect_to_admin) {
        token.value = accessToken
        companyKey.value = null
        localStorage.setItem('token', accessToken)
        localStorage.removeItem('companyKey')
        console.log('SuperAdmin detected, redirecting to admin panel')
        await fetchUser()
        router.push('/admin/dashboard')
        return
      }
      
      token.value = accessToken
      companyKey.value = tenantKey
      localStorage.setItem('token', accessToken)
      localStorage.setItem('companyKey', tenantKey)
      console.log('Token saved for tenant:', tenantKey)
      await fetchUser()
      router.push(`/${tenantKey}/dashboard`)
    } finally {
      loading.value = false
    }
  }

  /**
   * Login global (para super admin - redireciona para admin panel)
   * Se usuário pertencer a uma empresa, redireciona para a empresa
   */
  async function login(email: string, password: string) {
    loading.value = true
    try {
      const response = await authService.login(email, password)
      const accessToken = response.access_token
      const userCompanyKey = response.company_key
      
      token.value = accessToken
      localStorage.setItem('token', accessToken)
      
      // Se usuário pertence a uma empresa, salva e redireciona
      if (userCompanyKey) {
        companyKey.value = userCompanyKey
        localStorage.setItem('companyKey', userCompanyKey)
        console.log('Token saved, redirecting to tenant:', userCompanyKey)
        await fetchUser()
        router.push(`/${userCompanyKey}/dashboard`)
      } else {
        // Super admin - vai para painel admin
        companyKey.value = null
        localStorage.removeItem('companyKey')
        console.log('Token saved (global login - super admin)')
        await fetchUser()
        router.push('/admin/dashboard')
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      user.value = await authService.getCurrentUser()
    } catch (error) {
      console.error('Failed to fetch user:', error)
      throw error
    }
  }

  function logout() {
    const savedCompanyKey = companyKey.value
    user.value = null
    token.value = null
    companyKey.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('companyKey')

    // Redireciona para login da empresa ou login global
    if (savedCompanyKey) {
      router.push(`/${savedCompanyKey}/login`)
    } else {
      router.push('/admin/login')
    }
  }

  async function checkAuth(): Promise<boolean> {
    if (token.value && !user.value) {
      try {
        await fetchUser()
        return true
      } catch (error) {
        console.error('Auth check failed:', error)
        user.value = null
        token.value = null
        companyKey.value = null
        localStorage.removeItem('token')
        localStorage.removeItem('companyKey')
        return false
      }
    }
    return !!token.value
  }

  return {
    user,
    token,
    companyKey,
    loading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    login,
    loginTenant,
    fetchUser,
    logout,
    checkAuth
  }
})
