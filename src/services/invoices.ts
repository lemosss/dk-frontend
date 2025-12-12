import api from './api'
import type { 
  InvoiceWithCompany, 
  InvoiceCreate, 
  InvoiceUpdate, 
  Invoice,
  CalendarData 
} from '@/types'

// Função helper para obter o companyKey do localStorage ou da store
function getCompanyKey(): string | null {
  return localStorage.getItem('companyKey')
}

// Funções que usam rotas de tenant (/{company_key}/...)
export const tenantInvoiceService = {
  async getAll(companyKey: string): Promise<InvoiceWithCompany[]> {
    const response = await api.get<InvoiceWithCompany[]>(`/${companyKey}/invoices`)
    return response.data
  },

  async getById(companyKey: string, id: number): Promise<Invoice> {
    const response = await api.get<Invoice>(`/${companyKey}/invoices/${id}`)
    return response.data
  },

  async create(companyKey: string, data: InvoiceCreate): Promise<Invoice> {
    const response = await api.post<Invoice>(`/${companyKey}/invoices`, data)
    return response.data
  },

  async update(companyKey: string, id: number, data: InvoiceUpdate): Promise<Invoice> {
    const response = await api.put<Invoice>(`/${companyKey}/invoices/${id}`, data)
    return response.data
  },

  async delete(companyKey: string, id: number): Promise<void> {
    await api.delete(`/${companyKey}/invoices/${id}`)
  },

  async getCalendar(companyKey: string, month: number, year: number): Promise<CalendarData> {
    const response = await api.get<CalendarData>(`/${companyKey}/invoices/calendar`, {
      params: { month, year }
    })
    return response.data
  },

  async getByDate(companyKey: string, date: string): Promise<Invoice[]> {
    const response = await api.get<Invoice[]>(`/${companyKey}/invoices/by-date`, {
      params: { date }
    })
    return response.data
  },

  async togglePaid(companyKey: string, id: number): Promise<Invoice> {
    const response = await api.patch<Invoice>(`/${companyKey}/invoices/${id}/toggle-paid`)
    return response.data
  }
}

// Funções que usam rotas globais (/api/v1/...) - para super admin
export const invoiceService = {
  async getAll(params?: {
    company_id?: number
    month?: number
    year?: number
    is_paid?: boolean
  }): Promise<InvoiceWithCompany[]> {
    const response = await api.get<InvoiceWithCompany[]>('/api/v1/invoices', { params })
    return response.data
  },

  async getById(id: number): Promise<Invoice> {
    const response = await api.get<Invoice>(`/api/v1/invoices/${id}`)
    return response.data
  },

  async getCalendar(month: number, year: number, company_id?: number): Promise<CalendarData> {
    const response = await api.get<CalendarData>('/api/v1/invoices/calendar', {
      params: { month, year, company_id }
    })
    return response.data
  },

  async getByDate(date: string, company_id?: number): Promise<InvoiceWithCompany[]> {
    const response = await api.get<InvoiceWithCompany[]>('/api/v1/invoices/by-date', {
      params: { date, company_id }
    })
    return response.data
  },

  async create(data: InvoiceCreate): Promise<Invoice> {
    const response = await api.post<Invoice>('/api/v1/invoices', data)
    return response.data
  },

  async update(id: number, data: InvoiceUpdate): Promise<Invoice> {
    const response = await api.put<Invoice>(`/api/v1/invoices/${id}`, data)
    return response.data
  },

  async togglePaid(id: number): Promise<Invoice> {
    const response = await api.patch<Invoice>(`/api/v1/invoices/${id}/toggle-paid`)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/api/v1/invoices/${id}`)
  },

  async uploadFile(id: number, file: File): Promise<{ file_url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`/api/v1/invoices/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deleteFile(id: number): Promise<void> {
    await api.delete(`/api/v1/invoices/${id}/file`)
  }
}
