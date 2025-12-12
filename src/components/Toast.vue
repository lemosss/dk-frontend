<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="toast"
          :class="`toast-${toast.type}`"
          @click="toastStore.remove(toast.id)"
        >
          <component :is="getIcon(toast.type)" :size="18" />
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '@/stores/toast'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-vue-next'

const toastStore = useToastStore()

function getIcon(type: string) {
  switch (type) {
    case 'success': return CheckCircle
    case 'error': return XCircle
    case 'warning': return AlertTriangle
    default: return Info
  }
}
</script>

<style lang="scss" scoped>
.toast-container {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 280px;
  max-width: 400px;
  
  &-success {
    background: var(--secondary);
    color: white;
  }
  
  &-error {
    background: var(--danger);
    color: white;
  }
  
  &-warning {
    background: var(--warning);
    color: #1a1a1a;
  }
  
  &-info {
    background: var(--primary);
    color: white;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
