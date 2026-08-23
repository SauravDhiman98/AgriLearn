import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    // Retry up to 3 times with delay — handles Railway cold-start 502s
    let lastErr: unknown
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await login(form.username, form.password)
        navigate('/dashboard', { replace: true })
        return
      } catch (err) {
        lastErr = err
        const axiosError = err as AxiosError
        const status = axiosError.response?.status
        // Only retry on network errors or 502/503/504 (server not ready)
        if (status && status < 500) break
        if (attempt < 3) {
          setError(`Server is starting up, retrying... (${attempt}/3)`)
          await new Promise(r => setTimeout(r, 3000 * attempt))
        }
      }
    }

    const axiosError = lastErr as AxiosError<{ message?: string }>
    setError(axiosError.response?.data?.message || 'Unable to login. Please try again.')
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app px-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-white p-8 shadow-card">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-accent">Tassy Point Admin</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to view platform analytics.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              value={form.username}
              onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="admin"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="••••••••"
              required
            />
          </div>

          {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (error.includes('retrying') ? error : 'Signing in...') : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
