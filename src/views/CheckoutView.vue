<template>
  <div class="checkout-page">
    <div class="checkout-container">
      <div class="checkout-header">
        <router-link to="/" class="back-link">
          <ArrowLeft :size="20" />
          Voltar
        </router-link>
        <h1 class="checkout-title">Finalizar Assinatura</h1>
      </div>

      <div class="checkout-content" v-if="selectedPlan">
        <!-- Resumo do Plano -->
        <div class="checkout-summary">
          <h2>Resumo do Pedido</h2>
          <div class="plan-summary">
            <div class="plan-info">
              <h3>{{ selectedPlan.display_name }}</h3>
              <p class="plan-description">
                {{ selectedPlan.max_clients === -1
                  ? 'Clientes ilimitados'
                  : `Até ${selectedPlan.max_clients} clientes`
                }}
              </p>
            </div>
            <div class="plan-price">
              <span class="currency">R$</span>
              <span class="amount">{{ selectedPlan.price }}</span>
              <span class="period">/mês</span>
            </div>
          </div>

          <ul class="features-list">
            <li v-for="feature in selectedPlan.features" :key="feature">
              <Check :size="16" class="check-icon" />
              {{ feature }}
            </li>
          </ul>

          <div class="total">
            <span>Total mensal</span>
            <span class="total-amount">R$ {{ selectedPlan.price }}</span>
          </div>
        </div>

        <!-- Formulário de Pagamento (Fake) -->
        <div class="checkout-form">
          <h2>Dados de Pagamento</h2>
          <p class="form-notice">
            <Lock :size="16" />
            Ambiente seguro. Seus dados estão protegidos.
          </p>

          <form @submit.prevent="handleCheckout">
            <div class="form-group">
              <label class="form-label">Nome no cartão</label>
              <input
                type="text"
                class="form-input"
                v-model="cardName"
                placeholder="Como está no cartão"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">Número do cartão</label>
              <input
                type="text"
                class="form-input"
                v-model="cardNumber"
                placeholder="0000 0000 0000 0000"
                maxlength="19"
                @input="formatCardNumber"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Validade</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="cardExpiry"
                  placeholder="MM/AA"
                  maxlength="5"
                  @input="formatExpiry"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label">CVV</label>
                <input
                  type="text"
                  class="form-input"
                  v-model="cardCvv"
                  placeholder="123"
                  maxlength="4"
                  required
                />
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <span v-else>
                <CreditCard :size="20" />
                Assinar por R$ {{ selectedPlan.price }}/mês
              </span>
            </button>
          </form>

          <p class="disclaimer">
            Este é um ambiente de demonstração. Nenhum pagamento real será processado.
          </p>
        </div>
      </div>

      <!-- Loading state -->
      <div v-else-if="loading" class="loading-state">
        <div class="spinner large"></div>
        <p>Carregando...</p>
      </div>

      <!-- Sucesso -->
      <div v-if="success" class="success-overlay">
        <div class="success-content">
          <div class="success-icon">
            <CheckCircle :size="64" />
          </div>
          <h2>Assinatura Confirmada!</h2>
          <p>Seu plano foi atualizado com sucesso.</p>
          <router-link
            :to="authStore.companyKey
              ? `/${authStore.companyKey}/dashboard`
              : '/register'"
            class="btn btn-primary"
          >
            {{ authStore.companyKey ? 'Ir para o Dashboard' : 'Criar minha conta' }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowLeft,
  Check,
  Lock,
  CreditCard,
  CheckCircle
} from 'lucide-vue-next'
import { planService } from '@/services/plans'
import { useAuthStore } from '@/stores/auth'
import type { Plan } from '@/types'

const route = useRoute()
const authStore = useAuthStore()

const selectedPlan = ref<Plan | null>(null)
const loading = ref(false)
const success = ref(false)

const cardName = ref('')
const cardNumber = ref('')
const cardExpiry = ref('')
const cardCvv = ref('')

onMounted(async () => {
  loading.value = true
  try {
    const plans = await planService.getAll()
    const planId = route.params.planId as string

    if (planId) {
      selectedPlan.value = plans.find(p => p.id === parseInt(planId)) || null
    }

    // Se não encontrou, seleciona o profissional como default
    if (!selectedPlan.value) {
      selectedPlan.value = plans.find(p => p.name === 'profissional') || plans[1]
    }
  } catch (e) {
    console.error('Failed to load plans:', e)
  } finally {
    loading.value = false
  }
})

function formatCardNumber() {
  let value = cardNumber.value.replace(/\D/g, '')
  if (value.length > 16) value = value.slice(0, 16)
  cardNumber.value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry() {
  let value = cardExpiry.value.replace(/\D/g, '')
  if (value.length > 4) value = value.slice(0, 4)
  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  cardExpiry.value = value
}

async function handleCheckout() {
  loading.value = true

  // Simula processamento
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Mostra sucesso (fake)
  success.value = true
  loading.value = false
}
</script>

<style lang="scss" scoped>
.checkout-page {
  min-height: 100vh;
  padding: var(--spacing-xl);
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.checkout-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
}

.checkout-header {
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

.checkout-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-xl);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.checkout-summary,
.checkout-form {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-lg);
  }
}

.plan-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-md);
}

.plan-info {
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .plan-description {
    color: var(--text-secondary);
    font-size: 0.875rem;
  }
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 2px;

  .currency {
    font-size: 1rem;
    color: var(--text-secondary);
  }

  .amount {
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary);
  }

  .period {
    font-size: 0.875rem;
    color: var(--text-muted);
  }
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-lg) 0;

  li {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--text-secondary);
    padding: var(--spacing-xs) 0;

    .check-icon {
      color: var(--secondary);
    }
  }
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  font-weight: 600;

  .total-amount {
    font-size: 1.5rem;
    color: var(--primary);
  }
}

.form-notice {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-sm);
  background: rgba(16, 185, 129, 0.1);
  border-radius: var(--radius-md);

  svg {
    color: var(--secondary);
  }
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

.btn-block {
  width: 100%;
  padding: var(--spacing-md);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.disclaimer {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: var(--spacing-md);
  padding: var(--spacing-sm);
  background: rgba(245, 158, 11, 0.1);
  border-radius: var(--radius-md);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-xxl);

  p {
    color: var(--text-secondary);
    margin-top: var(--spacing-md);
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

  &.large {
    width: 40px;
    height: 40px;
    border-width: 3px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.success-content {
  text-align: center;
  padding: var(--spacing-xxl);

  .success-icon {
    color: var(--secondary);
    margin-bottom: var(--spacing-lg);
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
  }

  p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xl);
  }
}
</style>
