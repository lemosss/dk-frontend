<template>
  <div class="login-page" :style="{ '--tenant-color': tenantStore.tenantColor }">
    <div class="login-container">
      <!-- Loading state -->
      <div v-if="tenantStore.loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="tenantStore.error" class="error-state">
        <h2>Empresa não encontrada</h2>
        <p>{{ tenantStore.error }}</p>
        <router-link to="/login" class="btn btn-primary">
          Ir para login global
        </router-link>
      </div>

      <!-- Login form -->
      <template v-else>
        <div class="login-header">
          <!-- Logo da empresa -->
          <img 
            v-if="tenantStore.tenantLogo" 
            :src="tenantStore.tenantLogo" 
            :alt="tenantStore.tenantName"
            class="company-logo"
          />
          <div v-else class="company-logo-placeholder" :style="{ background: tenantStore.tenantColor }">
            {{ tenantStore.tenantName.charAt(0) }}
          </div>
          
          <h1 class="login-title">{{ tenantStore.tenantName }}</h1>
          <p class="login-subtitle">Faça login para continuar</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              type="email"
              class="form-input"
              v-model="email"
              placeholder="seu@email.com"
              required
              autofocus
            />
          </div>

          <div class="form-group">
            <label class="form-label">Senha</label>
            <input
              type="password"
              class="form-input"
              v-model="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="btn btn-tenant btn-block" 
            :disabled="loading"
            :style="{ background: tenantStore.tenantColor }"
          >
            <span v-if="loading" class="spinner"></span>
            <span v-else>Entrar</span>
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'

const route = useRoute()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

onMounted(async () => {
  const companyKey = route.params.companyKey as string
  if (companyKey) {
    await tenantStore.loadTenant(companyKey)
  }
})

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    const companyKey = route.params.companyKey as string
    await authStore.loginTenant(companyKey, email.value, password.value)
  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Erro ao fazer login'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: var(--spacing-xl);
  background: var(--bg-card);
  border-radius: var(--radius-xl);
  
  .spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto var(--spacing-md);
  }
  
  h2 {
    margin-bottom: var(--spacing-sm);
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-lg);
  }
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.company-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius-lg);
}

.company-logo-placeholder {
  width: 100px;
  height: 100px;
  margin: 0 auto var(--spacing-md);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: white;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.login-subtitle {
  color: var(--text-secondary);
}

.login-form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
}

.btn-tenant {
  color: white;
  border: none;
  
  &:hover {
    opacity: 0.9;
  }
}

.btn-block {
  width: 100%;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-md);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
