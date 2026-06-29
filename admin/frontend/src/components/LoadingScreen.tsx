export function LoadingScreen({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4 text-app-text">
      <div className="rounded-2xl border border-border bg-card px-8 py-10 text-center shadow-card">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent" />
        <p className="text-sm text-muted">{label}</p>
      </div>
    </div>
  )
}
