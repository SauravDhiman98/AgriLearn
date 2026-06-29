import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/api-analytics', label: 'API Analytics', icon: '🔌' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/visits', label: 'Visits', icon: '📄' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

const pageTitles: Record<string, string> = {
  '/dashboard': 'Analytics Overview',
  '/api-analytics': 'API Analytics',
  '/users': 'User Analytics',
  '/visits': 'Visit Analytics',
  '/settings': 'Admin Settings',
}

export default function AdminLayout() {
  const { admin, logout } = useAuth()
  const location = useLocation()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const title = useMemo(() => pageTitles[location.pathname] || 'Tassy Point Admin', [location.pathname])

  return (
    <div className="flex min-h-screen bg-app text-app-text">
      <aside className="fixed inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-sidebar px-6 py-8">
        <div>
          <p className="text-2xl font-bold text-accent">Tassy Point</p>
          <p className="mt-1 text-sm text-muted">Admin Dashboard</p>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'text-muted hover:bg-white/5 hover:text-app-text'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-border bg-app/50 p-4">
          <p className="text-xs uppercase tracking-[0.25em] text-muted">Signed in</p>
          <p className="mt-2 text-sm font-semibold text-app-text">{admin?.username}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 w-full rounded-xl border border-border px-4 py-2 text-sm font-medium text-app-text transition hover:border-accent hover:text-accent"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-72 flex-1">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-border bg-app/95 px-8 py-6 backdrop-blur">
          <div>
            <h1 className="text-2xl font-bold text-app-text">{title}</h1>
            <p className="mt-1 text-sm text-muted">{now.toLocaleString()}</p>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            Refresh
          </button>
        </div>

        <div className="min-h-[calc(100vh-97px)] px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
