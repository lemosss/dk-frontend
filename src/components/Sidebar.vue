<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <div class="sidebar-header">
      <!-- Logo da empresa ou padrão -->
      <div class="logo-container">
        <img 
          v-if="companyLogo" 
          :src="companyLogo" 
          :alt="companyName"
          class="company-logo-img"
        />
        <h1 class="logo">{{ companyName || 'DK Invoice' }}</h1>
      </div>
      <button class="sidebar-close" @click="$emit('close')">
        <X :size="20" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link 
        v-for="item in menuItems" 
        :key="item.to"
        :to="item.to" 
        class="nav-item"
        :class="{ active: isActive(item.to) }"
      >
        <component :is="item.icon" :size="20" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-info" v-if="user">
        <div class="user-avatar">
          {{ user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase() }}
        </div>
        <div class="user-details">
          <div class="user-name">{{ user.name || user.email }}</div>
          <div class="user-role">{{ roleLabel }}</div>
        </div>
      </div>
      <button class="btn btn-ghost btn-icon" @click="handleLogout" title="Sair">
        <LogOut :size="20" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Building2, 
  Users, 
  LogOut,
  X,
  Settings
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  companyName?: string
  companyLogo?: string | null
  isTenant?: boolean
}>()

defineEmits<{
  close: []
}>()

const route = useRoute()
const authStore = useAuthStore()

const user = computed(() => authStore.user)

const companyKey = computed(() => {
  if (props.isTenant) {
    return route.params.companyKey as string || authStore.companyKey
  }
  return null
})

const roleLabel = computed(() => {
  const roles: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Administrador',
    user: 'Usuário'
  }
  return roles[user.value?.role || 'user']
})

const menuItems = computed(() => {
  // Rotas para tenant (empresa específica)
  if (props.isTenant && companyKey.value) {
    const items = [
      { to: `/${companyKey.value}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
      { to: `/${companyKey.value}/calendar`, label: 'Calendário', icon: Calendar },
      { to: `/${companyKey.value}/invoices`, label: 'Faturas', icon: FileText },
    ]

    // Admin da empresa pode ver usuários e perfil
    if (authStore.isAdmin) {
      items.push({ to: `/${companyKey.value}/users`, label: 'Usuários', icon: Users })
      items.push({ to: `/${companyKey.value}/profile`, label: 'Perfil da Empresa', icon: Settings })
    }

    return items
  }

  // Rotas globais (super admin)
  const items = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/calendar', label: 'Calendário', icon: Calendar },
    { to: '/admin/invoices', label: 'Faturas', icon: FileText },
    { to: '/admin/companies', label: 'Empresas', icon: Building2 },
    { to: '/admin/users', label: 'Usuários', icon: Users },
  ]

  return items
})

function isActive(path: string): boolean {
  return route.path === path
}

function handleLogout() {
  authStore.logout()
}
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 260px;
  background: var(--bg-card);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  z-index: 100;
  
  @media (max-width: 768px) {
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
    
    &.open {
      transform: translateX(0);
    }
  }
}

.sidebar-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.company-logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.logo {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-close {
  display: none;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: block;
  }
}

.sidebar-nav {
  flex: 1;
  padding: var(--spacing-md);
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: 12px var(--spacing-md);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-fast);
  margin-bottom: var(--spacing-xs);
  
  &:hover {
    background: var(--bg-tertiary);
    color: var(--text-primary);
  }
  
  &.active {
    background: var(--primary);
    color: white;
  }
}

.sidebar-footer {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.user-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  min-width: 0;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.user-details {
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
