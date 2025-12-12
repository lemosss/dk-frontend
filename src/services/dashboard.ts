import api from './api'
import type { DashboardStats } from '@/types'

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/api/v1/dashboard/stats')
    return response.data
  }
}
