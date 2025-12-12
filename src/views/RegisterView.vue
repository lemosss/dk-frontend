<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <router-link to="/" class="back-link">
          <ArrowLeft :size="20" />
          Voltar
        </router-link>
        <h1 class="register-title">Crie sua conta</h1>
        <p class="register-subtitle">
          Comece a organizar as faturas dos seus clientes hoje
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Dados Pessoais -->
        <div class="form-section">
          <h3 class="section-title">Seus dados</h3>

          <div class="form-group">
            <label class="form-label">Nome completo</label>
            <input
              type="text"
              class="form-input"
              v-model="form.name"
              placeholder="João da Silva"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email</label>
            <input
              type="email"
              class="form-input"
              v-model="form.email"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Senha</label>
            <input
              type="password"
              class="form-input"
              v-model="form.password"
              placeholder="Mínimo 6 caracteres"
              required
              minlength="6"
            />
          </div>
        </div>

        <!-- Dados da Empresa -->
        <div class="form-section">
          <h3 class="section-title">Dados do escritório</h3>

          <div class="form-group">
            <label class="form-label">Nome do escritório</label>
            <input
              type="text"
              class="form-input"
              v-model="form.company_name"
              placeholder="Contabilidade Silva"
              required
              @input="generateSlug"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Identificador (URL)</label>
            <div class="input-with-prefix">
              <span class="input-prefix">dk.com/</span>
              <input
                type="text"
                class="form-input"
                v-model="form.company_key"
                placeholder="contabilidade-silva"
                required
                pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                @input="sanitizeSlug"
              />
            </div>
            <p class="form-hint">
              Apenas letras minúsculas, números e hífens
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">CNPJ</label>
            <input
              type="text"
              class="form-input"
              v-model="form.cnpj"
              placeholder="00.000.000/0001-00"
              required
              @input="formatCNPJ"
            />
          </div>
        </div>

        <!-- Seleção de Plano -->
        <div class="form-section" v-if="plans.length > 0">
          <h3 class="section-title">Escolha seu plano</h3>

          <div class="plans-grid">
            <div
              v-for="plan in plans"
              :key="plan.id"
              class="plan-card"
              :class="{ selected: selectedPlanId === plan.id }"
              @click="selectedPlanId = plan.id"
            >
              <div class="plan-header">
                <h4 class="plan-name">{{ plan.display_name }}</h4>
                <div class="plan-price">
                  <span class="currency">R$</span>
                  <span class="amount">{{ plan.price }}</span>
                  <span class="period">/mês</span>
                </div>
              </div>
              <ul class="plan-features">
                <li v-for="feature in plan.features" :key="feature">
                  <Check :size="16" />
                  {{ feature }}
                </li>
              </ul>
              <div class="plan-select">
                <div class="radio-indicator"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Criar minha conta</span>
        </button>

        <p class="login-link">
          Já tem uma conta?
          <router-link to="/admin/login">Faça login</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Check } from 'lucide-vue-next'
import { authService } from '@/services/auth'
import { planService } from '@/services/plans'
import { useAuthStore } from '@/stores/auth'
import type { Plan } from '@/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  company_name: '',
  company_key: '',
  cnpj: ''
})

const plans = ref<Plan[]>([])
const selectedPlanId = ref<number | null>(null)
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    plans.value = await planService.getAll()
    // Seleciona o plano da query string ou o primeiro (starter)
    const planFromQuery = route.query.plan as string
    if (planFromQuery) {
      const plan = plans.value.find(p => p.name === planFromQuery)
      if (plan) {
        selectedPlanId.value = plan.id
      }
    }
    if (!selectedPlanId.value && plans.value.length > 0) {
      selectedPlanId.value = plans.value[0].id
    }
  } catch (e) {
    console.error('Failed to load plans:', e)
  }
})

function generateSlug() {
  form.company_key = form.company_name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeSlug() {
  form.company_key = form.company_key
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
}

function formatCNPJ() {
  let value = form.cnpj.replace(/\D/g, '')
  if (value.length > 14) value = value.slice(0, 14)

  if (value.length > 12) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
  } else if (value.length > 8) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+)$/, '$1.$2.$3/$4')
  } else if (value.length > 5) {
    value = value.replace(/^(\d{2})(\d{3})(\d+)$/, '$1.$2.$3')
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d+)$/, '$1.$2')
  }

  form.cnpj = value
}

async function handleRegister() {
  error.value = ''
  loading.value = true

  try {
    const response = await authService.register({
      name: form.name,
      email: form.email,
      password: form.password,
      company_name: form.company_name,
      company_key: form.company_key,
      cnpj: form.cnpj,
      plan_id: selectedPlanId.value || undefined
    })

    // Auto-login após registro
    authStore.token = response.access_token
    authStore.companyKey = response.company_key
    authStore.user = response.user
    localStorage.setItem('token', response.access_token)
    localStorage.setItem('companyKey', response.company_key)

    // Redireciona para o dashboard da empresa
    router.push(`/${response.company_key}/dashboard`)
  } catch (e: any) {
    error.value = e.response?.data?.detail || 'Erro ao criar conta'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.register-container {
  width: 100%;
  max-width: 600px;
}

.register-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--text-secondary);
  text-decoration: none;
  margin-bottom: var(--spacing-md);

  &:hover {
    color: var(--primary);
  }
}

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.register-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.register-form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
}

.form-section {
  margin-bottom: var(--spacing-xl);

  &:last-of-type {
    margin-bottom: var(--spacing-lg);
  }
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.input-with-prefix {
  display: flex;
  align-items: center;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;

  &:focus-within {
    border-color: var(--primary);
  }

  .input-prefix {
    padding: 0 var(--spacing-sm);
    color: var(--text-muted);
    font-size: 0.875rem;
    white-space: nowrap;
    background: var(--bg-secondary);
    height: 100%;
    display: flex;
    align-items: center;
    border-right: 1px solid var(--border-color);
  }

  .form-input {
    border: none;
    background: transparent;

    &:focus {
      box-shadow: none;
    }
  }
}

.form-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: var(--spacing-xs);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--spacing-md);
}

.plan-card {
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &:hover {
    border-color: var(--primary);
  }

  &.selected {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.1);

    .radio-indicator {
      background: var(--primary);
      border-color: var(--primary);

      &::after {
        content: '';
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
      }
    }
  }
}

.plan-header {
  margin-bottom: var(--spacing-sm);
}

.plan-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 2px;

  .currency {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
  }

  .period {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-sm) 0;
  font-size: 0.75rem;

  li {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--text-secondary);
    margin-bottom: 4px;

    svg {
      color: var(--secondary);
      flex-shrink: 0;
    }
  }
}

.plan-select {
  display: flex;
  justify-content: center;
}

.radio-indicator {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-block {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1rem;
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

.login-link {
  text-align: center;
  margin-top: var(--spacing-md);
  color: var(--text-secondary);
  font-size: 0.875rem;

  a {
    color: var(--primary);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 480px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
