import { formatNumber, formatPercent } from '../utils/format'

interface StatCardProps {
  title: string
  value: number
  change?: number
  tone?: 'green' | 'blue' | 'amber' | 'pink'
}

const toneClassMap: Record<NonNullable<StatCardProps['tone']>, string> = {
  green: 'from-accent/30 to-accent/5',
  blue: 'from-blue-500/30 to-blue-500/5',
  amber: 'from-amber-500/30 to-amber-500/5',
  pink: 'from-pink-500/30 to-pink-500/5',
}

export function StatCard({ title, value, change = 0, tone = 'green' }: StatCardProps) {
  const changeColor = change >= 0 ? 'text-emerald-400' : 'text-rose-400'

  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br ${toneClassMap[tone]} p-5 shadow-card`}>
      <p className="text-sm text-muted">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-3xl font-bold text-app-text">{formatNumber(value)}</p>
        <div className="text-right">
          <p className={`text-sm font-semibold ${changeColor}`}>{formatPercent(Math.abs(change))}</p>
          <p className="text-xs text-muted">{change >= 0 ? 'vs yesterday ↑' : 'vs yesterday ↓'}</p>
        </div>
      </div>
    </div>
  )
}
