import api from './api'
import type { User, UserCreate, UserUpdate } from '@/types'

export const userService = {
  async getAll(): Promise<User[]> {
    const response = await api.get<User[]>('/users')
    return response.data
  },

  async getById(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`)
    return response.data
  },

  async create(data: UserCreate): Promise<User> {
    const response = await api.post<User>('/users', data)
    return response.data
  },

  async update(id: number, data: UserUpdate): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, data)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`)
  }
}
