import api from './api'
import type { Token, User } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<Token> {
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    
    const response = await api.post<Token>('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    return response.data
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me')
    return response.data
  },

  logout(): void {
    localStorage.removeItem('token')
  }
}
