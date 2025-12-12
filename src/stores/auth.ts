import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types'
import { authService } from '@/services/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => 
    user.value?.role === 'admin' || user.value?.role === 'superadmin'
  )
  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const response = await authService.login(email, password)
      const accessToken = response.access_token
      token.value = accessToken
      localStorage.setItem('token', accessToken)
      console.log('Token saved:', accessToken.substring(0, 20) + '...')
      await fetchUser()
      router.push('/dashboard')
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
      // Don't logout here, let the caller handle it
      throw error
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  async function checkAuth(): Promise<boolean> {
    if (token.value && !user.value) {
      try {
        await fetchUser()
        return true
      } catch (error) {
        console.error('Auth check failed:', error)
        // Token is invalid, clear it
        user.value = null
        token.value = null
        localStorage.removeItem('token')
        return false
      }
    }
    return !!token.value
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    login,
    fetchUser,
    logout,
    checkAuth
  }
})
