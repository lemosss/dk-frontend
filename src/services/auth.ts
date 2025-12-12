import api from './api'
import type { Token, User } from '@/types'

export const authService = {
  /**
   * Login para uma empresa específica (tenant)
   */
  async loginTenant(companyKey: string, email: string, password: string): Promise<Token> {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    
    const response = await api.post<Token>(`/${companyKey}/auth/login`, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return response.data
  },

  /**
   * Login global (para super admin)
   */
  async login(email: string, password: string): Promise<Token> {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    
    const response = await api.post<Token>('/api/v1/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/api/v1/auth/me')
    return response.data
  },

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('companyKey')
  }
}
