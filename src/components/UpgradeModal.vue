<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-icon">
            <AlertTriangle :size="32" />
          </div>
          <h3 class="modal-title">Limite de Clientes Atingido</h3>
          <button class="btn-close" @click="close">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <p class="modal-message">
            Você atingiu o limite de clientes do seu plano atual.
            Para adicionar mais clientes, faça upgrade para um plano superior.
          </p>

          <div class="plans-comparison" v-if="upgradeOptions.length > 0">
            <div
              v-for="plan in upgradeOptions"
              :key="plan.id"
              class="plan-option"
              @click="selectPlan(plan)"
            >
              <div class="plan-details">
                <h4>{{ plan.name }}</h4>
                <p>{{ plan.max_clients === -1 ? 'Clientes ilimitados' : `Até ${plan.max_clients} clientes` }}</p>
              </div>
              <div class="plan-price">
                <span class="amount">R$ {{ plan.price }}</span>
                <span class="period">/mês</span>
              </div>
              <ArrowRight :size="20" class="arrow" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="close">
            Cancelar
          </button>
          <router-link
            to="/checkout"
            class="btn btn-primary"
            @click="close"
          >
            Ver Todos os Planos
          </router-link>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { AlertTriangle, X, ArrowRight } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

interface UpgradeOption {
  id: number
  name: string
  price: number
  max_clients: number
}

defineProps<{
  show: boolean
  upgradeOptions: UpgradeOption[]
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()

function close() {
  emit('close')
}

function selectPlan(plan: UpgradeOption) {
  close()
  router.push(`/checkout/${plan.id}`)
}
</script>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-lg);
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
}

.modal-header {
  padding: var(--spacing-xl);
  text-align: center;
  position: relative;

  .btn-close {
    position: absolute;
    top: var(--spacing-md);
    right: var(--spacing-md);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);

    &:hover {
      background: var(--bg-tertiary);
      color: var(--text-primary);
    }
  }
}

.modal-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 50%;
  color: var(--warning);
  margin-bottom: var(--spacing-md);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-body {
  padding: 0 var(--spacing-xl) var(--spacing-xl);
}

.modal-message {
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.plans-comparison {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.plan-option {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.05);

    .arrow {
      transform: translateX(4px);
    }
  }
}

.plan-details {
  flex: 1;

  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  p {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }
}

.plan-price {
  text-align: right;

  .amount {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
  }

  .period {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
}

.arrow {
  color: var(--text-muted);
  transition: transform 0.2s ease;
}

.modal-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-sm);
}
</style>
