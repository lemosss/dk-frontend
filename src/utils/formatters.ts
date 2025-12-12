export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

export function formatDate(date: string): string {
  // Adiciona T12:00:00 para evitar problemas de fuso horário
  const dateStr = date.length === 10 ? date + 'T12:00:00' : date
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function formatDateLong(date: string): string {
  const dateStr = date.length === 10 ? date + 'T12:00:00' : date
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
}
