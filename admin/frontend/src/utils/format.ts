export const chartColors = ['#16a34a', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IN').format(value || 0)
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatDateTime(value?: string): string {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleString()
}

export function formatDateLabel(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

export function truncate(value: string, max = 18): string {
  if (value.length <= max) {
    return value
  }

  return `${value.slice(0, max)}…`
}

export function calculateChange(current: number, previous: number): number {
  if (!previous) {
    return current > 0 ? 100 : 0
  }

  return ((current - previous) / previous) * 100
}
