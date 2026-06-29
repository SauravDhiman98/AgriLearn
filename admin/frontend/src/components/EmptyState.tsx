export function EmptyState({ title = 'No data', subtitle = 'Data will appear here once tracking starts.' }) {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-border bg-app/30 px-6 text-center">
      <div>
        <p className="text-lg font-semibold text-app-text">{title}</p>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>
    </div>
  )
}
