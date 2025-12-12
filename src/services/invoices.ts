import api from './api'
import type { 
  InvoiceWithCompany, 
  InvoiceCreate, 
  InvoiceUpdate, 
  Invoice,
  CalendarData 
} from '@/types'

export const invoiceService = {
  async getAll(params?: {
    company_id?: number
    month?: number
    year?: number
    is_paid?: boolean
  }): Promise<InvoiceWithCompany[]> {
    const response = await api.get<InvoiceWithCompany[]>('/invoices', { params })
    return response.data
  },

  async getById(id: number): Promise<Invoice> {
    const response = await api.get<Invoice>(`/invoices/${id}`)
    return response.data
  },

  async getCalendar(month: number, year: number, company_id?: number): Promise<CalendarData> {
    const response = await api.get<CalendarData>('/invoices/calendar', {
      params: { month, year, company_id }
    })
    return response.data
  },

  async getByDate(date: string, company_id?: number): Promise<InvoiceWithCompany[]> {
    const response = await api.get<InvoiceWithCompany[]>('/invoices/by-date', {
      params: { date, company_id }
    })
    return response.data
  },

  async create(data: InvoiceCreate): Promise<Invoice> {
    const response = await api.post<Invoice>('/invoices', data)
    return response.data
  },

  async update(id: number, data: InvoiceUpdate): Promise<Invoice> {
    const response = await api.put<Invoice>(`/invoices/${id}`, data)
    return response.data
  },

  async togglePaid(id: number): Promise<Invoice> {
    const response = await api.patch<Invoice>(`/invoices/${id}/toggle-paid`)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/invoices/${id}`)
  },

  async uploadFile(id: number, file: File): Promise<{ file_url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/invoices/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deleteFile(id: number): Promise<void> {
    await api.delete(`/invoices/${id}/file`)
  }
}
