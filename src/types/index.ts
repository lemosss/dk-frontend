// User types
export enum RoleEnum {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: number
  email: string
  name: string | null
  role: RoleEnum
  company_id: number | null
  is_active: boolean
  created_at: string
}

export interface UserCreate {
  email: string
  password: string
  name?: string
  role?: RoleEnum
  company_id?: number
}

export interface UserUpdate {
  name?: string
  email?: string
  role?: RoleEnum
  company_id?: number
  is_active?: boolean
}

// Company types
export interface Company {
  id: number
  company_key: string
  name: string
  cnpj: string
  email: string | null
  phone: string | null
  address: string | null
  logo_url: string | null
  primary_color: string | null
  is_active: boolean
  created_at: string
}

export interface CompanyCreate {
  name: string
  company_key: string
  cnpj: string
  email?: string
  phone?: string
  address?: string
  primary_color?: string
}

export interface CompanyUpdate {
  name?: string
  cnpj?: string
  email?: string
  phone?: string
  address?: string
  logo_url?: string
  primary_color?: string
  is_active?: boolean
}

// Invoice types
export interface Invoice {
  id: number
  company_id: number
  description: string
  amount: number
  due_date: string
  file_url: string | null
  is_paid: boolean
  paid_at: string | null
  notes: string | null
  created_by: number
  created_at: string
}

export interface InvoiceWithCompany extends Invoice {
  company_name: string
}

export interface InvoiceCreate {
  company_id: number
  description: string
  amount: number
  due_date: string
  file_url?: string
  notes?: string
}

export interface InvoiceUpdate {
  description?: string
  amount?: number
  due_date?: string
  file_url?: string
  notes?: string
  is_paid?: boolean
}

// Calendar types
export interface CalendarDay {
  total: number
  paid: number
  pending: number
  amount: number
}

export interface CalendarData {
  month: number
  year: number
  days: Record<number, CalendarDay>
}

// Auth types
export interface Token {
  access_token: string
  token_type: string
  company_key?: string | null  // Para redirecionar usuário para sua empresa
  redirect_to_admin?: boolean  // Para redirecionar superadmin para admin
}

// Dashboard stats
export interface DashboardStats {
  total: number
  paid: number
  pending: number
  overdue: number
  upcoming: number
  pending_amount: number
}
