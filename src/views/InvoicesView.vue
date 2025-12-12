<template>
  <div class="app-layout">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
    
    <main class="main-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Faturas</h1>
          <p class="page-subtitle">Gerencie todas as suas faturas</p>
        </div>
        <button class="btn btn-primary" @click="openCreateModal" v-if="authStore.isAdmin">
          <Plus :size="18" />
          Nova Fatura
        </button>
      </div>

      <!-- Filters -->
      <div class="card" style="padding: var(--spacing-md); margin-bottom: var(--spacing-lg);">
        <div class="flex gap-md" style="flex-wrap: wrap;">
          <select class="filter-select" v-model="filters.company" @change="loadInvoices" v-if="authStore.isAdmin">
            <option :value="null">Todas as empresas</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
          <select class="filter-select" v-model="filters.status" @change="loadInvoices">
            <option :value="null">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagas</option>
          </select>
          <select class="filter-select" v-model="filters.month" @change="loadInvoices">
            <option :value="null">Todos os meses</option>
            <option v-for="(name, index) in months" :key="index" :value="index + 1">
              {{ name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Invoices Table -->
      <div class="card" style="padding: 0;">
        <div v-if="loading" class="empty-state">
          <div class="spinner"></div>
        </div>

        <div v-else-if="invoices.length === 0" class="empty-state">
          <Inbox class="empty-state-icon" />
          <div class="empty-state-title">Nenhuma fatura encontrada</div>
          <p>Tente ajustar os filtros ou crie uma nova fatura</p>
        </div>

        <div v-else class="table-container" style="border: none;">
          <table class="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Empresa</th>
                <th>Vencimento</th>
                <th>Valor</th>
                <th>Status</th>
                <th style="width: 120px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="invoice in invoices" :key="invoice.id">
                <td>
                  <div style="font-weight: 500;">{{ invoice.description }}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);" v-if="invoice.notes">
                    {{ invoice.notes }}
                  </div>
                </td>
                <td>{{ invoice.company_name }}</td>
                <td>{{ formatDate(invoice.due_date) }}</td>
                <td style="font-weight: 600;">{{ formatCurrency(invoice.amount) }}</td>
                <td>
                  <span class="badge" :class="getStatusClass(invoice)">
                    {{ getStatusText(invoice) }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-xs">
                    <a
                      v-if="invoice.file_url"
                      :href="invoice.file_url"
                      target="_blank"
                      class="btn btn-icon btn-ghost"
                      title="Ver Boleto (PDF)"
                      style="color: var(--primary);"
                    >
                      <FileText :size="16" />
                    </a>
                    <button
                      class="btn btn-icon btn-ghost"
                      title="Editar"
                      @click="openEditModal(invoice)"
                      v-if="authStore.isAdmin"
                    >
                      <Pencil :size="16" />
                    </button>
                    <button
                      class="btn btn-icon btn-ghost"
                      :title="invoice.is_paid ? 'Marcar como não paga' : 'Marcar como paga'"
                      @click="togglePaid(invoice)"
                    >
                      <XCircle v-if="invoice.is_paid" :size="16" />
                      <CheckCircle v-else :size="16" />
                    </button>
                    <button
                      class="btn btn-icon btn-ghost"
                      title="Excluir"
                      @click="confirmDelete(invoice)"
                      v-if="authStore.isAdmin"
                    >
                      <Trash2 :size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Create/Edit Modal -->
    <div class="modal-overlay" :class="{ active: showModal }" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingInvoice ? 'Editar Fatura' : 'Nova Fatura' }}</h3>
          <button class="btn btn-icon btn-ghost" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveInvoice">
            <div class="form-group">
              <label class="form-label">Empresa *</label>
              <select class="form-select" v-model="form.company_id" required>
                <option :value="null" disabled>Selecione uma empresa</option>
                <option v-for="company in companies" :key="company.id" :value="company.id">
                  {{ company.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Descrição *</label>
              <input
                type="text"
                class="form-input"
                v-model="form.description"
                required
                placeholder="Ex: Fatura de serviços"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Valor *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                class="form-input"
                v-model="form.amount"
                required
                placeholder="0.00"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Vencimento *</label>
              <input type="date" class="form-input" v-model="form.due_date" required />
            </div>

            <div class="form-group">
              <label class="form-label">Observações (opcional)</label>
              <textarea
                class="form-textarea"
                v-model="form.notes"
                placeholder="Anotações sobre a fatura"
              ></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" @click="saveInvoice" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span v-else>{{ editingInvoice ? 'Salvar' : 'Criar' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" :class="{ active: showDeleteModal }" @click.self="showDeleteModal = false">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">Confirmar exclusão</h3>
          <button class="btn btn-icon btn-ghost" @click="showDeleteModal = false">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <p>Tem certeza que deseja excluir esta fatura?</p>
          <p class="text-muted" style="margin-top: 8px;">{{ deletingInvoice?.description }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn btn-danger" @click="deleteInvoice" :disabled="deleting">
            <span v-if="deleting" class="spinner"></span>
            <span v-else>Excluir</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Toggle Paid Confirmation Modal -->
    <div class="modal-overlay" :class="{ active: showPaidModal }" @click.self="showPaidModal = false">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">{{ togglingInvoice?.is_paid ? 'Desmarcar pagamento' : 'Confirmar pagamento' }}</h3>
          <button class="btn btn-icon btn-ghost" @click="showPaidModal = false">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <p v-if="togglingInvoice?.is_paid">Deseja marcar esta fatura como <strong>não paga</strong>?</p>
          <p v-else>Deseja marcar esta fatura como <strong>paga</strong>?</p>
          <p class="text-muted" style="margin-top: 8px;">{{ togglingInvoice?.description }}</p>
          <p class="text-muted">{{ togglingInvoice ? formatCurrency(togglingInvoice.amount) : '' }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showPaidModal = false">Cancelar</button>
          <button class="btn btn-primary" @click="confirmTogglePaid" :disabled="toggling">
            <span v-if="toggling" class="spinner"></span>
            <span v-else>{{ togglingInvoice?.is_paid ? 'Desmarcar' : 'Confirmar' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { invoiceService } from '@/services/invoices'
import { companyService } from '@/services/companies'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useToastStore } from '@/stores/toast'
import type { Company, InvoiceWithCompany, InvoiceCreate, InvoiceUpdate } from '@/types'
import {
  Plus,
  Inbox,
  FileText,
  Pencil,
  CheckCircle,
  XCircle,
  Trash2,
  X
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToastStore()
const sidebarOpen = ref(false)
const companies = ref<Company[]>([])
const invoices = ref<InvoiceWithCompany[]>([])
const loading = ref(true)

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const filters = reactive({
  company: null as number | null,
  status: null as string | null,
  month: null as number | null
})

const showModal = ref(false)
const showDeleteModal = ref(false)
const showPaidModal = ref(false)
const editingInvoice = ref<InvoiceWithCompany | null>(null)
const deletingInvoice = ref<InvoiceWithCompany | null>(null)
const togglingInvoice = ref<InvoiceWithCompany | null>(null)
const saving = ref(false)
const deleting = ref(false)
const toggling = ref(false)

const form = reactive({
  company_id: null as number | null,
  description: '',
  amount: '',
  due_date: '',
  notes: ''
})

function getStatusClass(invoice: InvoiceWithCompany): string {
  if (invoice.is_paid) return 'badge-success'
  const dueDate = new Date(invoice.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (dueDate < today) return 'badge-danger'
  return 'badge-warning'
}

function getStatusText(invoice: InvoiceWithCompany): string {
  if (invoice.is_paid) return 'Paga'
  const dueDate = new Date(invoice.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (dueDate < today) return 'Vencida'
  return 'Pendente'
}

async function loadInvoices() {
  loading.value = true
  try {
    const params: any = {}
    if (filters.company) params.company_id = filters.company
    if (filters.status === 'paid') params.is_paid = true
    else if (filters.status === 'pending') params.is_paid = false
    if (filters.month) {
      params.month = filters.month
      params.year = new Date().getFullYear()
    }
    invoices.value = await invoiceService.getAll(params)
  } catch (e) {
    console.error('Erro ao carregar faturas:', e)
  } finally {
    loading.value = false
  }
}

async function loadCompanies() {
  try {
    companies.value = await companyService.getAll()
  } catch (e) {
    console.error('Erro ao carregar empresas:', e)
  }
}

function openCreateModal() {
  editingInvoice.value = null
  form.company_id = null
  form.description = ''
  form.amount = ''
  form.due_date = ''
  form.notes = ''
  showModal.value = true
}

function openEditModal(invoice: InvoiceWithCompany) {
  editingInvoice.value = invoice
  form.company_id = invoice.company_id
  form.description = invoice.description
  form.amount = String(invoice.amount)
  form.due_date = invoice.due_date
  form.notes = invoice.notes || ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingInvoice.value = null
}

async function saveInvoice() {
  if (!form.company_id || !form.description || !form.amount || !form.due_date) return

  saving.value = true
  try {
    if (editingInvoice.value) {
      const data: InvoiceUpdate = {
        description: form.description,
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        notes: form.notes || undefined
      }
      await invoiceService.update(editingInvoice.value.id, data)
      toast.success('Fatura atualizada com sucesso!')
    } else {
      const data: InvoiceCreate = {
        company_id: form.company_id,
        description: form.description,
        amount: parseFloat(form.amount),
        due_date: form.due_date,
        notes: form.notes || undefined
      }
      await invoiceService.create(data)
      toast.success('Fatura criada com sucesso!')
    }
    closeModal()
    await loadInvoices()
  } catch (e) {
    console.error('Erro ao salvar fatura:', e)
    toast.error('Erro ao salvar fatura')
  } finally {
    saving.value = false
  }
}

async function togglePaid(invoice: InvoiceWithCompany) {
  togglingInvoice.value = invoice
  showPaidModal.value = true
}

async function confirmTogglePaid() {
  if (!togglingInvoice.value) return
  
  const wasPaid = togglingInvoice.value.is_paid
  toggling.value = true
  try {
    await invoiceService.togglePaid(togglingInvoice.value.id)
    showPaidModal.value = false
    togglingInvoice.value = null
    await loadInvoices()
    toast.success(wasPaid ? 'Fatura marcada como não paga' : 'Fatura marcada como paga!')
  } catch (e) {
    console.error('Erro ao atualizar fatura:', e)
    toast.error('Erro ao atualizar fatura')
  } finally {
    toggling.value = false
  }
}

function confirmDelete(invoice: InvoiceWithCompany) {
  deletingInvoice.value = invoice
  showDeleteModal.value = true
}

async function deleteInvoice() {
  if (!deletingInvoice.value) return

  deleting.value = true
  try {
    await invoiceService.delete(deletingInvoice.value.id)
    showDeleteModal.value = false
    deletingInvoice.value = null
    await loadInvoices()
    toast.success('Fatura excluída com sucesso!')
  } catch (e) {
    console.error('Erro ao excluir fatura:', e)
    toast.error('Erro ao excluir fatura')
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await loadCompanies()
  await loadInvoices()
})
</script>
