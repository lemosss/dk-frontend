import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface TenantInfo {
  name: string
  company_key: string
  logo_url: string | null
  primary_color: string | null
}

export const useTenantStore = defineStore('tenant', () => {
  const tenant = ref<TenantInfo | null>(null)
  const companyKey = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const hasTenant = computed(() => !!tenant.value)
  const tenantName = computed(() => tenant.value?.name || 'DK Invoice')
  const tenantLogo = computed(() => tenant.value?.logo_url ? `http://127.0.0.1:8000${tenant.value.logo_url}` : null)
  const tenantColor = computed(() => tenant.value?.primary_color || '#3B82F6')

  async function loadTenant(key: string): Promise<boolean> {
    if (companyKey.value === key && tenant.value) {
      return true
    }

    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/${key}/info`)
      tenant.value = response.data
      companyKey.value = key
      
      // Apply primary color to CSS variable
      if (tenant.value?.primary_color) {
        document.documentElement.style.setProperty('--primary', tenant.value.primary_color)
      }
      
      return true
    } catch (e: any) {
      console.error('Failed to load tenant:', e)
      error.value = e.response?.data?.detail || 'Empresa não encontrada'
      tenant.value = null
      companyKey.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  function clearTenant() {
    tenant.value = null
    companyKey.value = null
    error.value = null
    // Reset primary color
    document.documentElement.style.setProperty('--primary', '#3B82F6')
  }

  function setCompanyKey(key: string) {
    companyKey.value = key
  }

  function setTenant(name: string, logoUrl: string | null, primaryColor?: string | null) {
    if (tenant.value) {
      tenant.value.name = name
      tenant.value.logo_url = logoUrl
      if (primaryColor) {
        tenant.value.primary_color = primaryColor
        document.documentElement.style.setProperty('--primary', primaryColor)
      }
    }
  }

  return {
    tenant,
    companyKey,
    loading,
    error,
    hasTenant,
    tenantName,
    tenantLogo,
    tenantColor,
    loadTenant,
    clearTenant,
    setCompanyKey,
    setTenant
  }
})
