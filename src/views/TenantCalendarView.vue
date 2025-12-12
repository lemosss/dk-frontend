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
      <div class="page-header">
        <button class="menu-btn" @click="sidebarOpen = true">
          <Menu />
        </button>
        <div>
          <h1 class="page-title">Calendário de Faturas</h1>
          <p class="page-subtitle">Visualize e gerencie suas faturas por data</p>
        </div>
      </div>

      <div class="calendar-layout">
        <!-- Calendar -->
        <div class="calendar-container">
          <div class="calendar-header">
            <div class="calendar-nav">
              <button class="calendar-nav-btn" @click="prevMonth">
                <ChevronLeft :size="20" />
              </button>
              <div class="calendar-month-year">{{ monthYearLabel }}</div>
              <button class="calendar-nav-btn" @click="nextMonth">
                <ChevronRight :size="20" />
              </button>
            </div>
            <button class="btn btn-secondary btn-sm" @click="goToToday">Hoje</button>
          </div>

          <div class="calendar-grid">
            <div class="calendar-weekdays">
              <div class="calendar-weekday" v-for="day in weekDays" :key="day">{{ day }}</div>
            </div>

            <div class="calendar-days">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="getDayClass(day)"
                @click="selectDay(day)"
              >
                <template v-if="day.day">
                  <span class="day-number">{{ day.day }}</span>
                  <div class="day-info" v-if="day.info">
                    <span class="day-count pending" v-if="day.info.pending">
                      {{ day.info.pending }} pend.
                    </span>
                    <span class="day-count paid" v-if="day.info.paid">
                      {{ day.info.paid }} pago
                    </span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar with invoices -->
        <div class="calendar-sidebar">
          <div class="sidebar-header">
            <div class="sidebar-title">
              {{ selectedDate ? 'Faturas do dia' : 'Selecione um dia' }}
            </div>
            <div class="sidebar-date" v-if="selectedDate">
              {{ formatDateLong(selectedDate) }}
            </div>
          </div>

          <div v-if="!selectedDate" class="empty-state">
            <MousePointerClick class="empty-state-icon" />
            <div class="empty-state-title">Clique em um dia</div>
            <p>Selecione um dia no calendário para ver as faturas</p>
          </div>

          <div v-else-if="dayInvoices.length === 0" class="empty-state">
            <Inbox class="empty-state-icon" />
            <div class="empty-state-title">Nenhuma fatura</div>
            <p>Não há faturas para este dia</p>
          </div>

          <div v-else class="invoice-list">
            <div
              v-for="invoice in dayInvoices"
              :key="invoice.id"
              class="invoice-item"
            >
              <div class="invoice-status" :class="getInvoiceStatusClass(invoice)"></div>
              <div class="invoice-details">
                <div class="invoice-description">{{ invoice.description }}</div>
              </div>
              <div class="invoice-amount">{{ formatCurrency(invoice.amount) }}</div>
              <div class="invoice-actions">
                <a
                  v-if="invoice.file_url"
                  :href="invoice.file_url"
                  target="_blank"
                  class="btn btn-icon btn-ghost"
                  title="Ver Boleto (PDF)"
                >
                  <FileText :size="18" />
                </a>
                <button
                  class="btn btn-icon btn-ghost"
                  :title="invoice.is_paid ? 'Marcar como não paga' : 'Marcar como paga'"
                  @click="togglePaid(invoice)"
                >
                  <XCircle v-if="invoice.is_paid" :size="18" />
                  <CheckCircle v-else :size="18" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { useTenantStore } from '@/stores/tenant'
import { useToastStore } from '@/stores/toast'
import { tenantInvoiceService } from '@/services/invoices'
import { formatCurrency, formatDateLong } from '@/utils/formatters'
import type { Invoice, CalendarDay } from '@/types'
import {
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  Inbox,
  FileText,
  CheckCircle,
  XCircle,
  X,
  Menu
} from 'lucide-vue-next'

const route = useRoute()
const tenantStore = useTenantStore()
const toast = useToastStore()

const sidebarOpen = ref(false)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const calendarData = ref<Record<number, CalendarDay>>({})
const selectedDate = ref<string | null>(null)
const dayInvoices = ref<Invoice[]>([])
const showPaidModal = ref(false)
const togglingInvoice = ref<Invoice | null>(null)
const toggling = ref(false)

const companyKey = computed(() => route.params.companyKey as string)

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const monthYearLabel = computed(() => {
  return `${months[currentMonth.value]} ${currentYear.value}`
})

interface CalendarDayItem {
  day: number | null
  date?: string
  info?: CalendarDay
  isToday?: boolean
  empty?: boolean
}

const calendarDays = computed<CalendarDayItem[]>(() => {
  const days: CalendarDayItem[] = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const startPadding = firstDay.getDay()

  // Padding for previous month
  for (let i = 0; i < startPadding; i++) {
    days.push({ day: null, empty: true })
  }

  // Days of current month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({
      day,
      date: dateStr,
      info: calendarData.value[day] || undefined,
      isToday: isToday(day)
    })
  }

  return days
})

function isToday(day: number): boolean {
  const today = new Date()
  return (
    day === today.getDate() &&
    currentMonth.value === today.getMonth() &&
    currentYear.value === today.getFullYear()
  )
}

function getDayClass(day: CalendarDayItem): string[] {
  const classes: string[] = []
  if (day.empty) classes.push('empty')
  if (day.isToday) classes.push('today')
  if (day.info) {
    classes.push('has-invoices')
    if (day.info.pending > 0) {
      const dateObj = new Date(day.date!)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (dateObj < today) {
        classes.push('has-overdue')
      } else {
        classes.push('has-pending')
      }
    } else if (day.info.paid > 0) {
      classes.push('all-paid')
    }
  }
  if (day.date === selectedDate.value) classes.push('selected')
  return classes
}

function getInvoiceStatusClass(invoice: Invoice): string {
  if (invoice.is_paid) return 'paid'
  const dueDate = new Date(invoice.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (dueDate < today) return 'overdue'
  return 'pending'
}

function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
  loadCalendar()
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
  loadCalendar()
}

function goToToday() {
  const today = new Date()
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
  loadCalendar()
}

async function selectDay(day: CalendarDayItem) {
  if (!day.day) return
  selectedDate.value = day.date!
  await loadDayInvoices()
}

async function loadCalendar() {
  try {
    const data = await tenantInvoiceService.getCalendar(
      companyKey.value,
      currentMonth.value + 1,
      currentYear.value
    )
    calendarData.value = data.days || {}
    
    // Reload day invoices if a date is selected
    if (selectedDate.value) {
      await loadDayInvoices()
    }
  } catch (e) {
    console.error('Erro ao carregar calendário:', e)
    toast.error('Erro ao carregar calendário')
  }
}

async function loadDayInvoices() {
  if (!selectedDate.value) return
  try {
    dayInvoices.value = await tenantInvoiceService.getByDate(
      companyKey.value,
      selectedDate.value
    )
  } catch (e) {
    console.error('Erro ao carregar faturas:', e)
  }
}

async function togglePaid(invoice: Invoice) {
  togglingInvoice.value = invoice
  showPaidModal.value = true
}

async function confirmTogglePaid() {
  if (!togglingInvoice.value) return
  
  const wasPaid = togglingInvoice.value.is_paid
  toggling.value = true
  try {
    await tenantInvoiceService.togglePaid(companyKey.value, togglingInvoice.value.id)
    showPaidModal.value = false
    togglingInvoice.value = null
    await loadCalendar()
    await loadDayInvoices()
    toast.success(wasPaid ? 'Fatura marcada como não paga' : 'Fatura marcada como paga!')
  } catch (e) {
    console.error('Erro ao atualizar fatura:', e)
    toast.error('Erro ao atualizar fatura')
  } finally {
    toggling.value = false
  }
}

onMounted(async () => {
  await loadCalendar()
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
  align-items: flex-start;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.page-title {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-xs);
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-sm);
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    display: block;
  }
}

// Calendar Component Styles
.calendar-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: var(--spacing-lg);
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.calendar-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.calendar-nav-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }
}

.calendar-month-year {
  min-width: 180px;
  text-align: center;
  font-weight: 600;
  font-size: 1rem;
}

.calendar-grid {
  padding: var(--spacing-md);
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: var(--spacing-sm);
}

.calendar-weekday {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  padding: var(--spacing-sm);
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid transparent;
  min-height: 70px;
  
  &:hover:not(.empty) {
    background: var(--bg-tertiary);
    border-color: var(--primary);
    transform: scale(1.02);
  }
  
  &.empty {
    background: transparent;
    cursor: default;
  }
  
  &.today {
    background: rgba(99, 102, 241, 0.1);
    border-color: var(--primary);
    
    .day-number {
      background: var(--primary);
      color: white;
    }
  }
  
  &.selected {
    background: rgba(99, 102, 241, 0.2);
    border: 2px solid var(--primary);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
    
    .day-number {
      background: var(--primary);
      color: white;
      font-weight: 700;
    }
  }
  
  &.has-invoices {
    background: var(--bg-tertiary);
  }
  
  &.has-pending {
    border-left: 3px solid var(--warning);
  }
  
  &.has-overdue {
    border-left: 3px solid var(--danger);
  }
  
  &.all-paid {
    border-left: 3px solid var(--secondary);
  }
}

.day-number {
  font-size: 0.875rem;
  font-weight: 500;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  margin-bottom: 4px;
}

.day-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.day-count {
  font-size: 0.625rem;
  padding: 2px 6px;
  border-radius: var(--radius-full);
  font-weight: 600;
  
  &.pending {
    background: rgba(245, 158, 11, 0.2);
    color: var(--warning);
  }
  
  &.paid {
    background: rgba(16, 185, 129, 0.2);
    color: var(--secondary);
  }
}

// Calendar sidebar
.calendar-sidebar {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.sidebar-header {
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
}

.sidebar-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.invoice-list {
  max-height: 500px;
  overflow-y: auto;
}

.invoice-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  transition: background var(--transition-fast);
  
  &:hover {
    background: var(--bg-tertiary);
  }
  
  &:last-child {
    border-bottom: none;
  }
}

.invoice-status {
  width: 10px;
  height: 10px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  
  &.paid {
    background: var(--secondary);
  }
  
  &.pending {
    background: var(--warning);
  }
  
  &.overdue {
    background: var(--danger);
  }
}

.invoice-details {
  flex: 1;
  min-width: 0;
}

.invoice-description {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.invoice-company {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.invoice-amount {
  font-size: 0.875rem;
  font-weight: 600;
  text-align: right;
}

.invoice-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.text-muted {
  color: var(--text-secondary);
  font-size: 0.875rem;
}
</style>
