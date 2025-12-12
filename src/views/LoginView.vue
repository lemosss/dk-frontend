<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="login-title">DK Invoice Calendar</h1>
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

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Entrar</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true

  try {
    await authStore.login(email.value, password.value)
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
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
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
</style>
