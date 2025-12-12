<template>
  <div class="app-layout">
    <Sidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />
    
    <main class="main-content">
      <div class="page-header">
        <div>
          <h1 class="page-title">Empresas</h1>
          <p class="page-subtitle">Gerencie as empresas cadastradas</p>
        </div>
        <button class="btn btn-primary" @click="openCreateModal">
          <Plus :size="18" />
          Nova Empresa
        </button>
      </div>

      <!-- Companies Table -->
      <div class="card" style="padding: 0;">
        <div v-if="loading" class="empty-state">
          <div class="spinner"></div>
        </div>

        <div v-else-if="companies.length === 0" class="empty-state">
          <Building2 class="empty-state-icon" />
          <div class="empty-state-title">Nenhuma empresa cadastrada</div>
          <p>Clique em "Nova Empresa" para começar</p>
        </div>

        <div v-else class="table-container" style="border: none;">
          <table class="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Status</th>
                <th style="width: 100px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="company in companies" :key="company.id">
                <td style="font-weight: 500;">{{ company.name }}</td>
                <td>{{ company.cnpj }}</td>
                <td>{{ company.email || '-' }}</td>
                <td>{{ company.phone || '-' }}</td>
                <td>
                  <span class="badge" :class="company.is_active ? 'badge-success' : 'badge-danger'">
                    {{ company.is_active ? 'Ativa' : 'Inativa' }}
                  </span>
                </td>
                <td>
                  <div class="flex gap-xs">
                    <button class="btn btn-icon btn-ghost" title="Editar" @click="openEditModal(company)">
                      <Pencil :size="16" />
                    </button>
                    <button class="btn btn-icon btn-ghost" title="Excluir" @click="confirmDelete(company)" v-if="authStore.isSuperAdmin">
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
          <h3 class="modal-title">{{ editingCompany ? 'Editar Empresa' : 'Nova Empresa' }}</h3>
          <button class="btn btn-icon btn-ghost" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveCompany">
            <div class="form-group">
              <label class="form-label">Nome *</label>
              <input type="text" class="form-input" v-model="form.name" required placeholder="Nome da empresa" />
            </div>

            <div class="form-group">
              <label class="form-label">Identificador (URL) *</label>
              <input 
                type="text" 
                class="form-input" 
                v-model="form.company_key" 
                required 
                placeholder="minha-empresa"
                pattern="[a-z0-9-]+"
                :disabled="!!editingCompany"
              />
              <small class="form-hint">Usado na URL de acesso. Ex: /minha-empresa/login</small>
            </div>

            <div class="form-group">
              <label class="form-label">CNPJ *</label>
              <input type="text" class="form-input" v-model="form.cnpj" required placeholder="00.000.000/0001-00" />
            </div>

            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" v-model="form.email" placeholder="contato@empresa.com" />
            </div>

            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input type="text" class="form-input" v-model="form.phone" placeholder="(11) 3000-0000" />
            </div>

            <div class="form-group">
              <label class="form-label">Endereço</label>
              <input type="text" class="form-input" v-model="form.address" placeholder="Endereço completo" />
            </div>

            <div class="form-group">
              <label class="form-label">Cor Principal</label>
              <div class="color-input-group">
                <input type="color" v-model="form.primary_color" class="color-picker" />
                <input type="text" class="form-input" v-model="form.primary_color" placeholder="#3B82F6" maxlength="7" />
              </div>
            </div>

            <div class="form-group" v-if="editingCompany">
              <label class="form-label">
                <input type="checkbox" v-model="form.is_active" style="margin-right: 8px;" />
                Empresa ativa
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" @click="saveCompany" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            <span v-else>{{ editingCompany ? 'Salvar' : 'Criar' }}</span>
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
          <p>Tem certeza que deseja excluir esta empresa?</p>
          <p class="text-muted" style="margin-top: 8px;">{{ deletingCompany?.name }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancelar</button>
          <button class="btn btn-danger" @click="deleteCompany" :disabled="deleting">
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
import { useAuthStore } from '@/stores/auth'
import { companyService } from '@/services/companies'
import { useToastStore } from '@/stores/toast'
import type { Company, CompanyCreate, CompanyUpdate } from '@/types'
import { Plus, Building2, Pencil, Trash2, X } from 'lucide-vue-next'

const authStore = useAuthStore()
const toast = useToastStore()
const sidebarOpen = ref(false)
const companies = ref<Company[]>([])
const loading = ref(true)

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingCompany = ref<Company | null>(null)
const deletingCompany = ref<Company | null>(null)
const saving = ref(false)
const deleting = ref(false)

const form = reactive({
  name: '',
  company_key: '',
  cnpj: '',
  email: '',
  phone: '',
  address: '',
  primary_color: '#3B82F6',
  is_active: true
})

async function loadCompanies() {
  loading.value = true
  try {
    companies.value = await companyService.getAll()
  } catch (e) {
    console.error('Erro ao carregar empresas:', e)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingCompany.value = null
  form.name = ''
  form.company_key = ''
  form.cnpj = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  form.primary_color = '#3B82F6'
  form.is_active = true
  showModal.value = true
}

function openEditModal(company: Company) {
  editingCompany.value = company
  form.name = company.name
  form.company_key = company.company_key
  form.cnpj = company.cnpj
  form.email = company.email || ''
  form.phone = company.phone || ''
  form.address = company.address || ''
  form.primary_color = company.primary_color || '#3B82F6'
  form.is_active = company.is_active
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCompany.value = null
}

async function saveCompany() {
  if (!form.name || !form.cnpj || !form.company_key) return

  saving.value = true
  try {
    if (editingCompany.value) {
      const data: CompanyUpdate = {
        name: form.name,
        cnpj: form.cnpj,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        primary_color: form.primary_color || undefined,
        is_active: form.is_active
      }
      await companyService.update(editingCompany.value.id, data)
      toast.success('Empresa atualizada com sucesso!')
    } else {
      const data: CompanyCreate = {
        name: form.name,
        company_key: form.company_key,
        cnpj: form.cnpj,
        email: form.email || undefined,
        phone: form.phone || undefined,
        address: form.address || undefined,
        primary_color: form.primary_color || undefined
      }
      await companyService.create(data)
      toast.success('Empresa criada com sucesso!')
    }
    closeModal()
    await loadCompanies()
  } catch (e: any) {
    const message = e.response?.data?.detail || 'Erro ao salvar empresa'
    toast.error(message)
    console.error('Erro ao salvar empresa:', e)
  } finally {
    saving.value = false
  }
}

function confirmDelete(company: Company) {
  deletingCompany.value = company
  showDeleteModal.value = true
}

async function deleteCompany() {
  if (!deletingCompany.value) return

  deleting.value = true
  try {
    await companyService.delete(deletingCompany.value.id)
    showDeleteModal.value = false
    deletingCompany.value = null
    toast.success('Empresa excluída com sucesso!')
    await loadCompanies()
  } catch (e: any) {
    const message = e.response?.data?.detail || 'Erro ao excluir empresa'
    toast.error(message)
    console.error('Erro ao excluir empresa:', e)
  } finally {
    deleting.value = false
  }
}

onMounted(loadCompanies)
</script>

<style lang="scss" scoped>
.color-input-group {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
}

.color-picker {
  width: 50px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: var(--radius-sm);
  }
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.text-muted {
  color: var(--text-secondary);
}
</style>
