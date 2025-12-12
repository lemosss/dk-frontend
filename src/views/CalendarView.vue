<template>
  <div class="app-layout">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
    
    <main class="main-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Calendário de Faturas</h1>
          <p class="page-subtitle">Visualize e gerencie suas faturas por data</p>
        </div>
        <div class="flex gap-sm" v-if="authStore.isAdmin">
          <select class="filter-select" v-model="selectedCompany" @change="loadCalendar">
            <option :value="null">Todas as empresas</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
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
                <div class="invoice-company">{{ invoice.company_name }}</div>
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
import Sidebar from '@/components/Sidebar.vue'
import { useAuthStore } from '@/stores/auth'
import { invoiceService } from '@/services/invoices'
import { companyService } from '@/services/companies'
import { formatCurrency, formatDateLong } from '@/utils/formatters'
import { useToastStore } from '@/stores/toast'
import type { Company, InvoiceWithCompany, CalendarDay } from '@/types'
import '@/assets/styles/calendar.scss'
import {
  ChevronLeft,
  ChevronRight,
  MousePointerClick,
  Inbox,
  FileText,
  CheckCircle,
  XCircle,
  X
} from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToastStore()
const sidebarOpen = ref(false)
const companies = ref<Company[]>([])
const selectedCompany = ref<number | null>(null)
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())
const calendarData = ref<Record<number, CalendarDay>>({})
const selectedDate = ref<string | null>(null)
const dayInvoices = ref<InvoiceWithCompany[]>([])
const showPaidModal = ref(false)
const togglingInvoice = ref<InvoiceWithCompany | null>(null)
const toggling = ref(false)

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

function getInvoiceStatusClass(invoice: InvoiceWithCompany): string {
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
    const data = await invoiceService.getCalendar(
      currentMonth.value + 1,
      currentYear.value,
      selectedCompany.value || undefined
    )
    calendarData.value = data.days || {}
    
    // Reload day invoices if a date is selected
    if (selectedDate.value) {
      await loadDayInvoices()
    }
  } catch (e) {
    console.error('Erro ao carregar calendário:', e)
  }
}

async function loadDayInvoices() {
  if (!selectedDate.value) return
  try {
    dayInvoices.value = await invoiceService.getByDate(
      selectedDate.value,
      selectedCompany.value || undefined
    )
  } catch (e) {
    console.error('Erro ao carregar faturas:', e)
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

async function loadCompanies() {
  try {
    companies.value = await companyService.getAll()
  } catch (e) {
    console.error('Erro ao carregar empresas:', e)
  }
}

onMounted(async () => {
  await loadCompanies()
  await loadCalendar()
})
</script>
