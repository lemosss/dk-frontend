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
        <h1>Perfil da Empresa</h1>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
      </div>

      <!-- Profile Content - Two Columns -->
      <div v-else class="profile-grid">
        <!-- Left Column - Company Info Form -->
        <div class="card">
          <div class="card-header">
            <Building2 :size="20" />
            <h3>Informações da Empresa</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="saveProfile">
              <!-- Logo Section -->
              <div class="logo-section">
                <div class="logo-preview" :class="{ uploading: uploadingLogo }">
                  <img v-if="profile?.logo_url" :src="getLogoUrl(profile.logo_url)" alt="Logo" />
                  <div v-else class="logo-placeholder">
                    <Building2 :size="48" />
                  </div>
                  <div v-if="uploadingLogo" class="logo-overlay">
                    <div class="spinner small"></div>
                  </div>
                </div>
                <div class="logo-actions">
                  <label class="btn btn-secondary" :class="{ disabled: uploadingLogo }">
                    <Upload :size="18" />
                    {{ uploadingLogo ? 'Enviando...' : 'Alterar Logo' }}
                    <input type="file" accept="image/*" @change="uploadLogo" hidden :disabled="uploadingLogo" />
                  </label>
                  <p class="hint">PNG, JPG ou WEBP. Máx. 2MB</p>
                </div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nome da Empresa *</label>
                  <input type="text" class="form-input" v-model="form.name" required />
                </div>

                <div class="form-group">
                  <label class="form-label">CNPJ</label>
                  <input type="text" class="form-input disabled" :value="profile?.cnpj" disabled />
                  <small class="form-hint">O CNPJ não pode ser alterado</small>
                </div>

                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-input" v-model="form.email" placeholder="contato@empresa.com" />
                </div>

                <div class="form-group">
                  <label class="form-label">Telefone</label>
                  <input type="text" class="form-input" v-model="form.phone" placeholder="(11) 3000-0000" />
                </div>

                <div class="form-group full-width">
                  <label class="form-label">Endereço</label>
                  <input type="text" class="form-input" v-model="form.address" placeholder="Endereço completo" />
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  <Save :size="18" v-if="!saving" />
                  <span v-if="saving" class="spinner small"></span>
                  {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Right Column - System Info & Customization -->
        <div class="right-column">
          <!-- System Info Card -->
          <div class="card info-card">
            <div class="card-header">
              <Info :size="20" />
              <h3>Informações do Sistema</h3>
            </div>
            <div class="card-body">
              <div class="info-item">
                <span class="info-label">Identificador</span>
                <span class="info-value badge badge-secondary">{{ profile?.company_key }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="badge" :class="profile?.is_active ? 'badge-success' : 'badge-danger'">
                  {{ profile?.is_active ? 'Ativa' : 'Inativa' }}
                </span>
              </div>
              <div class="info-item link-item">
                <span class="info-label">Link de Acesso</span>
                <div class="link-box">
                  <code>{{ locationOrigin }}/{{ profile?.company_key }}/login</code>
                  <button type="button" class="btn btn-icon btn-ghost" @click="copyLink" title="Copiar link">
                    <Copy :size="16" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Customization Card -->
          <div class="card">
            <div class="card-header">
              <Palette :size="20" />
              <h3>Personalização</h3>
            </div>
            <div class="card-body">
              <div class="form-group">
                <label class="form-label">Cor Principal</label>
                <div class="color-input-group">
                  <input type="color" v-model="form.primary_color" class="color-picker" />
                  <input type="text" class="form-input" v-model="form.primary_color" placeholder="#3B82F6" maxlength="7" />
                </div>
              </div>
              
              <div class="color-preview-section">
                <span class="form-label">Preview</span>
                <div class="color-preview-box" :style="{ backgroundColor: form.primary_color }">
                  <span>Botão Exemplo</span>
                </div>
                <div class="color-preview-text" :style="{ color: form.primary_color }">
                  Texto com a cor principal
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import { useTenantStore } from '@/stores/tenant'
import { useToastStore } from '@/stores/toast'
import api from '@/services/api'
import { Menu, Building2, Upload, Save, Info, Palette, Copy } from 'lucide-vue-next'

interface CompanyProfile {
  id: number
  company_key: string
  name: string
  cnpj: string
  email: string | null
  phone: string | null
  address: string | null
  logo_url: string | null
  primary_color: string | null
  is_active: boolean
}

const route = useRoute()
const tenantStore = useTenantStore()
const toast = useToastStore()

const sidebarOpen = ref(false)
const loading = ref(true)
const saving = ref(false)
const uploadingLogo = ref(false)
const profile = ref<CompanyProfile | null>(null)
const locationOrigin = window.location.origin

const form = reactive({
  name: '',
  email: '',
  phone: '',
  address: '',
  primary_color: '#3B82F6'
})

const companyKey = route.params.companyKey as string

function getLogoUrl(url: string): string {
  if (url.startsWith('http')) return url
  return `http://127.0.0.1:8000${url}`
}

function copyLink() {
  const link = `${locationOrigin}/${profile.value?.company_key}/login`
  navigator.clipboard.writeText(link)
  toast.success('Link copiado!')
}

async function loadProfile() {
  loading.value = true
  try {
    const response = await api.get(`/${companyKey}/profile`)
    profile.value = response.data
    
    // Preencher formulário
    form.name = profile.value?.name || ''
    form.email = profile.value?.email || ''
    form.phone = profile.value?.phone || ''
    form.address = profile.value?.address || ''
    form.primary_color = profile.value?.primary_color || '#3B82F6'
  } catch (e) {
    console.error('Erro ao carregar perfil:', e)
    toast.error('Erro ao carregar perfil da empresa')
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  saving.value = true
  try {
    const response = await api.put(`/${companyKey}/profile`, {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      primary_color: form.primary_color || null
    })
    profile.value = response.data
    
    // Atualizar o store do tenant
    tenantStore.setTenant(
      profile.value!.name, 
      profile.value!.logo_url, 
      profile.value!.primary_color
    )
    
    toast.success('Perfil atualizado com sucesso!')
  } catch (e: any) {
    console.error('Erro ao salvar perfil:', e)
    toast.error(e.response?.data?.detail || 'Erro ao salvar perfil')
  } finally {
    saving.value = false
  }
}

async function uploadLogo(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  
  // Validar tamanho (2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Arquivo muito grande. Máximo 2MB.')
    return
  }
  
  uploadingLogo.value = true
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const response = await api.post(`/${companyKey}/profile/logo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    profile.value = response.data
    
    // Atualizar o store do tenant
    tenantStore.setTenant(
      profile.value!.name, 
      profile.value!.logo_url, 
      profile.value!.primary_color
    )
    
    toast.success('Logo atualizado com sucesso!')
  } catch (e: any) {
    console.error('Erro ao fazer upload:', e)
    toast.error(e.response?.data?.detail || 'Erro ao fazer upload do logo')
  } finally {
    uploadingLogo.value = false
  }
  
  // Limpar input
  input.value = ''
}

onMounted(loadProfile)
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

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  
  &.small {
    width: 16px;
    height: 16px;
    border-width: 2px;
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-lg);
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

.right-column {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  height: fit-content;
}

.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0;
  }
  
  svg {
    color: var(--primary);
  }
}

.card-body {
  padding: var(--spacing-lg);
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 1px solid var(--border-color);
}

.logo-preview {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-lg);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &.uploading {
    opacity: 0.7;
  }
}

.logo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  
  .spinner {
    border-top-color: white;
  }
}

.logo-placeholder {
  color: var(--text-secondary);
}

.logo-actions {
  .hint {
    margin-top: var(--spacing-sm);
    font-size: 0.75rem;
    color: var(--text-secondary);
  }
  
  .btn.disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.full-width {
  grid-column: 1 / -1;
}

.form-hint {
  display: block;
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.form-input.disabled {
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: not-allowed;
}

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

.form-actions {
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  
  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
  }
}

// Info Card Styles
.info-card {
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 0;
    border-bottom: 1px solid var(--border-color);
    
    &:last-child {
      border-bottom: none;
    }
    
    &.link-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-sm);
    }
  }
  
  .info-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
  
  .info-value {
    font-weight: 500;
  }
  
  .link-box {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
    
    code {
      flex: 1;
      font-size: 0.75rem;
      font-family: monospace;
      word-break: break-all;
    }
    
    .btn-icon {
      flex-shrink: 0;
    }
  }
}

// Color Preview
.color-preview-section {
  margin-top: var(--spacing-lg);
  
  .form-label {
    display: block;
    margin-bottom: var(--spacing-sm);
  }
}

.color-preview-box {
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  color: white;
  text-align: center;
  font-weight: 600;
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  margin-bottom: var(--spacing-sm);
}

.color-preview-text {
  font-weight: 600;
  font-size: 0.875rem;
  text-align: center;
  padding: var(--spacing-sm);
}

// Badge styles
.badge-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
</style>