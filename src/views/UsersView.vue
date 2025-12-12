<template>
  <div class="app-layout">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
    
    <main class="main-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Usuários</h1>
          <p class="page-subtitle">Gerencie os usuários do sistema</p>
        </div>
        <button class="btn btn-primary" @click="openCreateModal">
          <Plus :size="18" />
          Novo Usuário
        </button>
      </div>

      <!-- Users Table -->
      <div class="card" style="padding: 0;">
        <div v-if="loading" class="empty-state">
          <div class="spinner"></div>
        </div>

        <div v-else-if="users.length === 0" class="empty-state">
          <Users class="empty-state-icon" />
          <div class="empty-state-title">Nenhum usuário cadastrado</div>
          <p>Clique em "Novo Usuário" para começar</p>
        </div>

        <div v-else class="table-container" style="border: none;">
          <table class="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Função</th>
                <th>Empresa</th>
                <th>Status</th>
                <th style="width: 100px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td style="font-weight: 500;">{{ user.name || '-' }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="badge" :class="getRoleBadgeClass(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td>{{ getCompanyName(user.company_id) }}</td>
                <td>
                  <span class="badge" :class="user.is_active ? 'badge-success' : 'badge-danger'">
                    {{ user.is_active ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-xs">
                    <button class="btn btn-icon btn-ghost" title="Editar" @click="openEditModal(user)">
                      <Pencil :size="16" />
                    </button>
                    <button class="btn btn-icon btn-ghost" title="Excluir" @click="confirmDelete(user)">
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
          <h3 class="modal-title">{{ editingUser ? 'Editar Usuário' : 'Novo Usuário' }}</h3>
          <button class="btn btn-icon btn-ghost" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input type="email" class="form-input" v-model="form.email" required placeholder="usuario@email.com" />
            </div>

            <div class="form-group" v-if="!editingUser">
              <label class="form-label">Senha *</label>
              <input type="password" class="form-input" v-model="form.password" required placeholder="••••••••" />
            </div>

            <div class="form-group">
              <label class="form-label">Nome</label>
              <input type="text" class="form-input" v-model="form.name" placeholder="Nome do usuário" />
            </div>

            <div class="form-group">
              <label class="form-label">Função *</label>
              <select class="form-select" v-model="form.role" required>
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <div class="form-group" v-if="form.role === 'user'">
              <label class="form-label">Empresa</label>
              <select class="form-select" v-model="form.company_id">
                <option :value="null">Sem empresa</option>
                <option v-for="company in companies" :key="company.id" :value="company.id">
                  {{ company.name }}
                </option>
              </select>
            </div>

            <div class="form-group" v-if="editingUser">
              <label class="form-label">
                <input type="checkbox" v-model="form.is_active" style="margin-right: 8px;" />
                Usuário ativo
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" @click="saveUser" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span v-else>{{ editingUser ? 'Salvar' : 'Criar' }}</span>
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
          <p>Tem certeza que deseja excluir este usuário?</p>
          <p class="text-muted" style="margin-top: 8px;">{{ deletingUser?.email }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn btn-danger" @click="deleteUser" :disabled="deleting">
            <span v-if="deleting" class="spinner"></span>
            <span v-else>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import { userService } from '@/services/users'
import { companyService } from '@/services/companies'
import type { User, UserCreate, UserUpdate, Company, RoleEnum } from '@/types'
import { Plus, Users, Pencil, Trash2, X } from 'lucide-vue-next'

const sidebarOpen = ref(false)
const users = ref<User[]>([])
const companies = ref<Company[]>([])
const loading = ref(true)

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref<User | null>(null)
const deletingUser = ref<User | null>(null)
const saving = ref(false)
const deleting = ref(false)

const form = reactive({
  email: '',
  password: '',
  name: '',
  role: 'user' as string,
  company_id: null as number | null,
  is_active: true
})

function getRoleLabel(role: RoleEnum | string): string {
  const labels: Record<string, string> = {
    superadmin: 'Super Admin',
    admin: 'Administrador',
    user: 'Usuário'
  }
  return labels[role] || role
}

function getRoleBadgeClass(role: RoleEnum | string): string {
  const classes: Record<string, string> = {
    superadmin: 'badge-danger',
    admin: 'badge-warning',
    user: 'badge-success'
  }
  return classes[role] || ''
}

function getCompanyName(companyId: number | null): string {
  if (!companyId) return '-'
  const company = companies.value.find(c => c.id === companyId)
  return company?.name || '-'
}

async function loadUsers() {
  loading.value = true
  try {
    users.value = await userService.getAll()
  } catch (e) {
    console.error('Erro ao carregar usuários:', e)
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
  editingUser.value = null
  form.email = ''
  form.password = ''
  form.name = ''
  form.role = 'user'
  form.company_id = null
  form.is_active = true
  showModal.value = true
}

function openEditModal(user: User) {
  editingUser.value = user
  form.email = user.email
  form.password = ''
  form.name = user.name || ''
  form.role = user.role
  form.company_id = user.company_id
  form.is_active = user.is_active
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
}

async function saveUser() {
  if (!form.email || (!editingUser.value && !form.password)) return

  saving.value = true
  try {
    if (editingUser.value) {
      const data: UserUpdate = {
        email: form.email,
        name: form.name || undefined,
        role: form.role as RoleEnum,
        company_id: form.role === 'user' ? form.company_id : undefined,
        is_active: form.is_active
      }
      await userService.update(editingUser.value.id, data)
    } else {
      const data: UserCreate = {
        email: form.email,
        password: form.password,
        name: form.name || undefined,
        role: form.role as RoleEnum,
        company_id: form.role === 'user' ? form.company_id || undefined : undefined
      }
      await userService.create(data)
    }
    closeModal()
    await loadUsers()
  } catch (e) {
    console.error('Erro ao salvar usuário:', e)
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
    await userService.delete(deletingUser.value.id)
    showDeleteModal.value = false
    deletingUser.value = null
    await loadUsers()
  } catch (e) {
    console.error('Erro ao excluir usuário:', e)
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await loadCompanies()
  await loadUsers()
})
</script>
