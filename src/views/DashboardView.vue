<template>
  <div class="app-layout">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
    
    <main class="main-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Visão geral das suas faturas</p>
        </div>
      </div>

      <div class="stats-grid" v-if="stats">
        <div class="stat-card">
          <div class="stat-icon total">
            <FileText :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">Total de Faturas</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon paid">
            <CheckCircle :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.paid }}</div>
            <div class="stat-label">Pagas</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">
            <Clock :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.pending }}</div>
            <div class="stat-label">Pendentes</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon overdue">
            <AlertTriangle :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.overdue }}</div>
            <div class="stat-label">Vencidas</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon upcoming">
            <CalendarDays :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.upcoming }}</div>
            <div class="stat-label">Próx. 7 dias</div>
          </div>
        </div>

        <div class="stat-card large">
          <div class="stat-icon amount">
            <DollarSign :size="24" />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatCurrency(stats.pending_amount) }}</div>
            <div class="stat-label">Valor Pendente</div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <router-link to="/calendar" class="action-card">
          <Calendar :size="32" />
          <span>Ver Calendário</span>
        </router-link>
        <router-link to="/invoices" class="action-card">
          <FileText :size="32" />
          <span>Ver Faturas</span>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { dashboardService } from '@/services/dashboard'
import type { DashboardStats } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  CalendarDays,
  DollarSign,
  Calendar
} from 'lucide-vue-next'

const sidebarOpen = ref(false)
const stats = ref<DashboardStats | null>(null)

onMounted(async () => {
  try {
    stats.value = await dashboardService.getStats()
  } catch (e) {
    console.error('Erro ao carregar stats:', e)
  }
})
</script>

<style lang="scss" scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  &.large {
    grid-column: span 2;
    
    @media (max-width: 640px) {
      grid-column: span 1;
    }
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.total { background: rgba(99, 102, 241, 0.2); color: var(--primary); }
  &.paid { background: rgba(16, 185, 129, 0.2); color: var(--secondary); }
  &.pending { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
  &.overdue { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
  &.upcoming { background: rgba(99, 102, 241, 0.2); color: var(--primary); }
  &.amount { background: rgba(16, 185, 129, 0.2); color: var(--secondary); }
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
}

.action-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }
  
  span {
    font-weight: 500;
  }
}
</style>
