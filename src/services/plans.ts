import api from './api'
import type { Plan } from '@/types'

export const planService = {
  async getAll(): Promise<Plan[]> {
    const response = await api.get<Plan[]>('/api/v1/plans')
    return response.data
  },

  async getById(id: number): Promise<Plan> {
    const response = await api.get<Plan>(`/api/v1/plans/${id}`)
    return response.data
  }
}
