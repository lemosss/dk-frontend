import api from './api'
import type { Company, CompanyCreate, CompanyUpdate } from '@/types'

export const companyService = {
  async getAll(): Promise<Company[]> {
    const response = await api.get<Company[]>('/api/v1/companies')
    return response.data
  },

  async getById(id: number): Promise<Company> {
    const response = await api.get<Company>(`/api/v1/companies/${id}`)
    return response.data
  },

  async create(data: CompanyCreate): Promise<Company> {
    const response = await api.post<Company>('/api/v1/companies', data)
    return response.data
  },

  async update(id: number, data: CompanyUpdate): Promise<Company> {
    const response = await api.put<Company>(`/api/v1/companies/${id}`, data)
    return response.data
  },

  async uploadLogo(id: number, file: File): Promise<Company> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<Company>(`/api/v1/companies/${id}/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/v1/companies/${id}`)
  }
}
