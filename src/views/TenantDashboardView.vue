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
        <h1>Dashboard</h1>
      </header>

      <div class="dashboard-content">
        <!-- Loading -->
        <div v-if="loading" class="loading-container">
          <div class="spinner"></div>
        </div>

        <!-- Dashboard Cards -->
        <div v-else class="dashboard-grid">
          <!-- Company Info -->
          <div class="card company-card">
            <div class="card-header">
              <Building2 class="icon" />
              <h3>{{ dashboard?.company?.name }}</h3>
            </div>
          </div>

          <!-- Summary Cards -->
          <div class="card stat-card">
            <div class="stat-icon" style="background: var(--primary)">
              <FileText />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ dashboard?.summary?.total_invoices || 0 }}</span>
              <span class="stat-label">Total de Faturas</span>
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-icon" style="background: var(--warning)">
              <Clock />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ formatCurrency(dashboard?.summary?.total_pending || 0) }}</span>
              <span class="stat-label">A Receber</span>
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-icon" style="background: var(--success)">
              <CheckCircle />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ formatCurrency(dashboard?.summary?.total_received || 0) }}</span>
              <span class="stat-label">Recebido</span>
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-icon" style="background: var(--danger)">
              <AlertTriangle />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ dashboard?.overdue?.count || 0 }}</span>
              <span class="stat-label">Faturas Vencidas</span>
            </div>
          </div>

          <div class="card stat-card">
            <div class="stat-icon" style="background: var(--info)">
              <Users />
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ dashboard?.summary?.total_users || 0 }}</span>
              <span class="stat-label">Usuários</span>
            </div>
          </div>

          <!-- Recent Invoices -->
          <div class="card recent-card">
            <div class="card-header">
              <h3>Faturas Recentes</h3>
              <router-link :to="`/${companyKey}/invoices`" class="view-all">
                Ver todas
              </router-link>
            </div>
            <div class="recent-list">
              <div 
                v-for="invoice in dashboard?.recent_invoices" 
                :key="invoice.id"
                class="recent-item"
              >
                <div class="recent-info">
                  <span class="recent-desc">{{ invoice.description }}</span>
                  <span class="recent-date">Vence: {{ formatDate(invoice.due_date) }}</span>
                </div>
                <div class="recent-amount" :class="{ paid: invoice.is_paid }">
                  {{ formatCurrency(invoice.amount) }}
                  <span v-if="invoice.is_paid" class="badge badge-success">Pago</span>
                </div>
              </div>
              <div v-if="!dashboard?.recent_invoices?.length" class="empty-state">
                Nenhuma fatura encontrada
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { useTenantStore } from '@/stores/tenant'
import api from '@/services/api'
import { Menu, Building2, FileText, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-vue-next'

const route = useRoute()
const tenantStore = useTenantStore()

const sidebarOpen = ref(false)
const loading = ref(true)
const dashboard = ref<any>(null)

const companyKey = computed(() => route.params.companyKey as string)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

async function loadDashboard() {
  loading.value = true
  try {
    const response = await api.get(`/${companyKey.value}/dashboard`)
    dashboard.value = response.data
  } catch (e) {
    console.error('Failed to load dashboard:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboard()
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
  overflow-y: auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  
  h1 {
    font-size: 1.5rem;
    font-weight: 600;
  }
}

.menu-btn {
  display: none;
  background: none;
  border: none;
  padding: var(--spacing-sm);
  cursor: pointer;
  color: var(--text-primary);
  
  @media (max-width: 768px) {
    display: block;
  }
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.company-card {
  grid-column: 1 / -1;
  
  .card-header {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    
    .icon {
      width: 32px;
      height: 32px;
      color: var(--primary);
    }
    
    h3 {
      font-size: 1.25rem;
      font-weight: 600;
    }
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  
  svg {
    width: 24px;
    height: 24px;
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.recent-card {
  grid-column: 1 / -1;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-md);
    
    h3 {
      font-size: 1rem;
      font-weight: 600;
    }
    
    .view-all {
      color: var(--primary);
      font-size: 0.875rem;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
}

.recent-info {
  display: flex;
  flex-direction: column;
}

.recent-desc {
  font-weight: 500;
}

.recent-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.recent-amount {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 600;
  
  &.paid {
    color: var(--success);
  }
}

.empty-state {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--text-secondary);
}
</style>
