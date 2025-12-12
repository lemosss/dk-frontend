<template>
  <div class="tenant-layout">
    <Sidebar 
      :is-open="sidebarOpen" 
      @close="sidebarOpen = false"
      :company-name="tenantStore.tenantName"
      :company-logo="tenantStore.tenantLogo"
      :is-tenant="true"
    />
    
    <main class="main-content">
      <header class="page-header">
        <button class="menu-btn" @click="sidebarOpen = true">
          <Menu />
        </button>
        <h1>Faturas</h1>
        <button v-if="authStore.isAdmin" class="btn btn-primary" @click="openCreateModal">
          <Plus :size="18" />
          Nova Fatura
        </button>
      </header>

      <!-- Filters -->
      <div class="filters">
        <select v-model="filterPaid" class="form-select">
          <option value="">Todas</option>
          <option value="false">Pendentes</option>
          <option value="true">Pagas</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <!-- Invoices List -->
      <div v-else class="invoices-list">
        <div v-if="filteredInvoices.length === 0" class="empty-state">
          <FileText :size="48" />
          <p>Nenhuma fatura encontrada</p>
        </div>

        <div 
          v-for="invoice in filteredInvoices" 
          :key="invoice.id"
          class="invoice-card"
          :class="{ paid: invoice.is_paid, overdue: isOverdue(invoice) }"
        >
          <div class="invoice-info">
            <h3>{{ invoice.description }}</h3>
            <p class="invoice-date">
              Vence: {{ formatDate(invoice.due_date) }}
              <span v-if="isOverdue(invoice)" class="overdue-badge">Vencida</span>
            </p>
          </div>
          <div class="invoice-amount">
            {{ formatCurrency(invoice.amount) }}
          </div>
          <div class="invoice-status">
            <span :class="'badge ' + getStatusBadgeClass(invoice)">
              {{ getStatusText(invoice) }}
            </span>
          </div>
          <div class="invoice-actions">
            <button 
              class="btn btn-ghost btn-icon" 
              @click="togglePaid(invoice)" 
              :title="invoice.is_paid ? 'Marcar pendente' : 'Marcar pago'"
            >
              <XCircle v-if="invoice.is_paid" :size="18" />
              <CheckCircle v-else :size="18" />
            </button>
            <button 
              v-if="authStore.isAdmin"
              class="btn btn-ghost btn-icon" 
              @click="openEditModal(invoice)"
              title="Editar"
            >
              <Pencil :size="18" />
            </button>
            <button 
              v-if="authStore.isAdmin"
              class="btn btn-ghost btn-icon text-danger" 
              @click="confirmDelete(invoice)"
              title="Excluir"
            >
              <Trash2 :size="18" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Create/Edit Modal - usando classe active como no calendário -->
    <div class="modal-overlay" :class="{ active: showModal }" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingInvoice ? 'Editar Fatura' : 'Nova Fatura' }}</h3>
          <button class="btn btn-icon btn-ghost" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        <form @submit.prevent="saveInvoice" class="modal-body">
          <div class="form-group">
            <label class="form-label">Descrição *</label>
            <input type="text" class="form-input" v-model="form.description" required />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Valor *</label>
              <input type="number" step="0.01" class="form-input" v-model="form.amount" required />
            </div>
            <div class="form-group">
              <label class="form-label">Vencimento *</label>
              <input type="date" class="form-input" v-model="form.due_date" required />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Observações</label>
            <textarea class="form-input" v-model="form.notes" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_paid" />
              <span>Pago</span>
            </label>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="saveInvoice" :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" :class="{ active: showDeleteModal }" @click.self="showDeleteModal = false">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3 class="modal-title">Confirmar Exclusão</h3>
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
            {{ deleting ? 'Excluindo...' : 'Excluir' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { useTenantStore } from '@/stores/tenant'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { tenantInvoiceService } from '@/services/invoices'
import type { Invoice } from '@/types'
import { Menu, Plus, FileText, CheckCircle, XCircle, Pencil, Trash2, X } from 'lucide-vue-next'

const route = useRoute()
const tenantStore = useTenantStore()
const authStore = useAuthStore()
const toast = useToastStore()

const sidebarOpen = ref(false)
const loading = ref(true)
const invoices = ref<Invoice[]>([])
const filterPaid = ref('')

const showModal = ref(false)
const editingInvoice = ref<Invoice | null>(null)
const saving = ref(false)

const showDeleteModal = ref(false)
const deletingInvoice = ref<Invoice | null>(null)
const deleting = ref(false)

const form = reactive({
  description: '',
  amount: 0,
  due_date: '',
  notes: '',
  is_paid: false
})

const companyKey = computed(() => route.params.companyKey as string)

const filteredInvoices = computed(() => {
  if (!filterPaid.value) return invoices.value
  const isPaid = filterPaid.value === 'true'
  return invoices.value.filter(inv => inv.is_paid === isPaid)
})

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR')
}

function isOverdue(invoice: Invoice): boolean {
  if (invoice.is_paid) return false
  return new Date(invoice.due_date) < new Date()
}

function getStatusBadgeClass(invoice: Invoice): string {
  if (invoice.is_paid) return 'badge-success'
  if (isOverdue(invoice)) return 'badge-danger'
  return 'badge-warning'
}

function getStatusText(invoice: Invoice): string {
  if (invoice.is_paid) return 'Pago'
  if (isOverdue(invoice)) return 'Vencida'
  return 'Pendente'
}

async function loadInvoices() {
  loading.value = true
  try {
    invoices.value = await tenantInvoiceService.getAll(companyKey.value)
  } catch (e) {
    console.error('Failed to load invoices:', e)
    toast.error('Erro ao carregar faturas')
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingInvoice.value = null
  form.description = ''
  form.amount = 0
  form.due_date = new Date().toISOString().split('T')[0]
  form.notes = ''
  form.is_paid = false
  showModal.value = true
}

function openEditModal(invoice: Invoice) {
  console.log('openEditModal called with:', invoice)
  editingInvoice.value = invoice
  form.description = invoice.description
  form.amount = invoice.amount
  form.due_date = invoice.due_date
  form.notes = invoice.notes || ''
  form.is_paid = invoice.is_paid
  showModal.value = true
  console.log('showModal:', showModal.value)
}

function closeModal() {
  showModal.value = false
  editingInvoice.value = null
}

async function saveInvoice() {
  saving.value = true
  try {
    if (editingInvoice.value) {
      await tenantInvoiceService.update(companyKey.value, editingInvoice.value.id, {
        description: form.description,
        amount: form.amount,
        due_date: form.due_date,
        notes: form.notes || undefined,
        is_paid: form.is_paid
      })
      toast.success('Fatura atualizada com sucesso!')
    } else {
      await tenantInvoiceService.create(companyKey.value, {
        description: form.description,
        amount: form.amount,
        due_date: form.due_date,
        notes: form.notes || undefined,
        is_paid: form.is_paid
      })
      toast.success('Fatura criada com sucesso!')
    }
    closeModal()
    await loadInvoices()
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Erro ao salvar fatura')
  } finally {
    saving.value = false
  }
}

async function togglePaid(invoice: Invoice) {
  try {
    await tenantInvoiceService.togglePaid(companyKey.value, invoice.id)
    toast.success(invoice.is_paid ? 'Fatura marcada como pendente' : 'Fatura marcada como paga')
    await loadInvoices()
  } catch (e) {
    toast.error('Erro ao atualizar status')
  }
}

function confirmDelete(invoice: Invoice) {
  console.log('confirmDelete called with:', invoice)
  deletingInvoice.value = invoice
  showDeleteModal.value = true
  console.log('showDeleteModal:', showDeleteModal.value)
}

async function deleteInvoice() {
  if (!deletingInvoice.value) return
  deleting.value = true
  try {
    await tenantInvoiceService.delete(companyKey.value, deletingInvoice.value.id)
    toast.success('Fatura excluída com sucesso!')
    showDeleteModal.value = false
    await loadInvoices()
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Erro ao excluir fatura')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  console.log('TenantInvoicesView mounted')
  console.log('User:', authStore.user)
  console.log('isAdmin:', authStore.isAdmin)
  loadInvoices()
})
</script>

<style lang="scss" scoped>
.tenant-layout {
  display: flex;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: var(--spacing-lg);
  margin-left: 260px;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  
  h1 {
    flex: 1;
    font-size: 1.5rem;
  }
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
}

.filters {
  margin-bottom: var(--spacing-lg);
}

.form-select {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--spacing-xl);
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
  
  svg {
    margin-bottom: var(--spacing-md);
    opacity: 0.5;
  }
}

.invoices-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.invoice-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  
  &.paid {
    opacity: 0.7;
  }
  
  &.overdue {
    border-left: 3px solid var(--danger);
  }
}

.invoice-info {
  flex: 1;
  
  h3 {
    font-size: 1rem;
    margin-bottom: var(--spacing-xs);
  }
}

.invoice-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.overdue-badge {
  color: var(--danger);
  font-weight: 600;
  margin-left: var(--spacing-sm);
}

.invoice-amount {
  font-size: 1.125rem;
  font-weight: 600;
  white-space: nowrap;
}

.invoice-status {
  text-align: center;
}

.invoice-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.text-danger {
  color: var(--danger);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.text-muted {
  color: var(--text-secondary);
  font-size: 0.875rem;
}
</style>
