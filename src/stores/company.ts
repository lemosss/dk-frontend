import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Company } from '@/types'
import { companyService } from '@/services/companies'

export const useCompanyStore = defineStore('company', () => {
  const companies = ref<Company[]>([])
  const loading = ref(false)

  async function fetchCompanies() {
    loading.value = true
    try {
      companies.value = await companyService.getAll()
    } finally {
      loading.value = false
    }
  }

  return {
    companies,
    loading,
    fetchCompanies
  }
})
