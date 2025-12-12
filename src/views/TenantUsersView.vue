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
        <h1>Usuários</h1>
        <button class="btn btn-primary" @click="openCreateModal">
          <Plus :size="18" />
          Novo Usuário
        </button>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <!-- Users List -->
      <div v-else class="users-grid">
        <div v-if="users.length === 0" class="empty-state">
          <Users :size="48" />
          <p>Nenhum usuário encontrado</p>
        </div>

        <div 
          v-for="user in users" 
          :key="user.id"
          class="user-card"
          :class="{ inactive: !user.is_active }"
        >
          <div class="user-avatar">
            {{ user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase() }}
          </div>
          <div class="user-info">
            <h3>{{ user.name || user.email }}</h3>
            <p class="user-email">{{ user.email }}</p>
            <span class="badge" :class="getRoleBadgeClass(user.role)">
              {{ getRoleLabel(user.role) }}
            </span>
          </div>
          <div class="user-status">
            <span class="status-dot" :class="user.is_active ? 'active' : 'inactive'"></span>
            {{ user.is_active ? 'Ativo' : 'Inativo' }}
          </div>
          <div class="user-actions">
            <button class="btn btn-ghost btn-icon" @click="openEditModal(user)">
              <Pencil :size="18" />
            </button>
            <button 
              v-if="user.id !== authStore.user?.id"
              class="btn btn-ghost btn-icon text-danger" 
              @click="confirmDelete(user)"
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
          <h3 class="modal-title">{{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}</h3>
          <button class="btn btn-icon btn-ghost" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        <form @submit.prevent="saveUser" class="modal-body">
          <div class="form-group">
            <label class="form-label">Nome</label>
            <input type="text" class="form-input" v-model="form.name" />
          </div>
          <div class="form-group">
            <label class="form-label">Email *</label>
            <input type="email" class="form-input" v-model="form.email" required :disabled="isEditingSelf" />
          </div>
          <div class="form-group" v-if="!editingUser">
            <label class="form-label">Senha *</label>
            <input type="password" class="form-input" v-model="form.password" required />
          </div>
          <!-- Perfil só aparece se NÃO está editando a si mesmo -->
          <div class="form-group" v-if="!isEditingSelf">
            <label class="form-label">Perfil</label>
            <select class="form-input" v-model="form.role">
              <option value="user">Usuário</option>
            </select>
          </div>
          <!-- Ativo só aparece se está editando E NÃO é a si mesmo -->
          <div class="form-group" v-if="editingUser && !isEditingSelf">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_active" />
              <span>Ativo</span>
            </label>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="saveUser" :disabled="saving">
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
          <p>Tem certeza que deseja excluir este usuário?</p>
          <p class="text-muted" style="margin-top: 8px;">{{ deletingUser?.name || deletingUser?.email }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn btn-danger" @click="deleteUser" :disabled="deleting">
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
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { useToastStore } from '@/stores/toast'
import api from '@/services/api'
import type { User } from '@/types'
import { Menu, Plus, Users, Pencil, Trash2, X } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const tenantStore = useTenantStore()
const toast = useToastStore()

const sidebarOpen = ref(false)
const loading = ref(true)
const users = ref<User[]>([])

const showModal = ref(false)
const editingUser = ref<User | null>(null)
const saving = ref(false)

const showDeleteModal = ref(false)
const deletingUser = ref<User | null>(null)
const deleting = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  role: 'user',
  is_active: true
})

const companyKey = computed(() => route.params.companyKey as string)

// Verifica se está editando o próprio usuário logado
const isEditingSelf = computed(() => {
  return editingUser.value?.id === authStore.user?.id
})

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Administrador',
    user: 'Usuário'
  }
  return labels[role] || role
}

function getRoleBadgeClass(role: string): string {
  const classes: Record<string, string> = {
    superadmin: 'badge-purple',
    admin: 'badge-primary',
    user: 'badge-secondary'
  }
  return classes[role] || 'badge-secondary'
}

async function loadUsers() {
  loading.value = true
  try {
    const response = await api.get(`/${companyKey.value}/users`)
    users.value = response.data
  } catch (e) {
    console.error('Failed to load users:', e)
    toast.error('Erro ao carregar usuários')
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingUser.value = null
  form.name = ''
  form.email = ''
  form.password = ''
  form.role = 'user'
  form.is_active = true
  showModal.value = true
}

function openEditModal(user: User) {
  editingUser.value = user
  form.name = user.name || ''
  form.email = user.email
  form.password = ''
  form.role = user.role
  form.is_active = user.is_active
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
}

async function saveUser() {
  saving.value = true
  try {
    if (editingUser.value) {
      // Se está editando a si mesmo, envia apenas nome
      const updateData: any = {
        name: form.name || undefined
      }
      
      // Se NÃO está editando a si mesmo, pode alterar email, role e is_active
      if (!isEditingSelf.value) {
        updateData.email = form.email
        updateData.role = form.role
        updateData.is_active = form.is_active
      }
      
      await api.put(`/${companyKey.value}/users/${editingUser.value.id}`, updateData)
      toast.success('Usuário atualizado com sucesso!')
      
      // Atualiza store se editou a si mesmo
      if (isEditingSelf.value && form.name) {
        authStore.user = { ...authStore.user!, name: form.name }
      }
    } else {
      await api.post(`/${companyKey.value}/users`, {
        name: form.name || undefined,
        email: form.email,
        password: form.password,
        role: form.role
      })
      toast.success('Usuário criado com sucesso!')
    }
    closeModal()
    await loadUsers()
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Erro ao salvar usuário')
  } finally {
    saving.value = false
  }
}

function confirmDelete(user: User) {
  deletingUser.value = user
  showDeleteModal.value = true
}

async function deleteUser() {
  if (!deletingUser.value) return
  deleting.value = true
  try {
    await api.delete(`/${companyKey.value}/users/${deletingUser.value.id}`)
    toast.success('Usuário excluído com sucesso!')
    showDeleteModal.value = false
    await loadUsers()
  } catch (e: any) {
    toast.error(e.response?.data?.detail || 'Erro ao excluir usuário')
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadUsers()
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

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-md);
}

.user-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  
  &.inactive {
    opacity: 0.6;
  }
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
  
  h3 {
    font-size: 1rem;
    margin-bottom: var(--spacing-xs);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.user-email {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.user-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  
  &.active {
    background: var(--success);
  }
  
  &.inactive {
    background: var(--danger);
  }
}

.user-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.text-danger {
  color: var(--danger);
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
