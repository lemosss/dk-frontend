import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let toastId = 0

  function show(message: string, type: Toast['type'] = 'success') {
    const id = toastId++
    toasts.value.push({ id, message, type })

    setTimeout(() => {
      remove(id)
    }, 4000)
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(message: string) {
    show(message, 'success')
  }

  function error(message: string) {
    show(message, 'error')
  }

  function warning(message: string) {
    show(message, 'warning')
  }

  function info(message: string) {
    show(message, 'info')
  }

  return {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info
  }
})
