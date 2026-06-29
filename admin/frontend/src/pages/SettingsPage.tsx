import { useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import client from '../api/client'
import type { AdminUser } from '../types'
import { formatDateTime } from '../utils/format'

interface SettingsResponse {
  currentAdmin: AdminUser
  admins: AdminUser[]
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [adminForm, setAdminForm] = useState({ username: '', password: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function loadSettings() {
    client.get<SettingsResponse>('/api/settings').then((response) => setSettings(response.data))
  }

  useEffect(() => {
    loadSettings()
  }, [])

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New password and confirmation must match.')
      return
    }

    try {
      const response = await client.put<{ message: string }>('/api/settings/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      setMessage(response.data.message)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || 'Unable to update password.')
    }
  }

  async function handleAdminSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      await client.post('/api/settings/admin', adminForm)
      setMessage('New admin user created successfully.')
      setAdminForm({ username: '', password: '' })
      loadSettings()
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>
      setError(axiosError.response?.data?.message || 'Unable to create admin user.')
    }
  }

  return (
    <div className="space-y-8">
      {message ? <p className="rounded-xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-app-text">Change Password</h2>
          <div className="mt-5 space-y-4">
            <input
              type="password"
              placeholder="Current password"
              value={passwordForm.currentPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
              className="w-full rounded-xl border border-border bg-app px-4 py-3 text-sm outline-none focus:border-accent"
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
              className="w-full rounded-xl border border-border bg-app px-4 py-3 text-sm outline-none focus:border-accent"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordForm.confirmPassword}
              onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              className="w-full rounded-xl border border-border bg-app px-4 py-3 text-sm outline-none focus:border-accent"
              required
            />
          </div>
          <button type="submit" className="mt-5 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white">
            Update Password
          </button>
        </form>

        <form onSubmit={handleAdminSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-xl font-semibold text-app-text">Create New Admin</h2>
          <div className="mt-5 space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={adminForm.username}
              onChange={(event) => setAdminForm((current) => ({ ...current, username: event.target.value }))}
              className="w-full rounded-xl border border-border bg-app px-4 py-3 text-sm outline-none focus:border-accent"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={adminForm.password}
              onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-xl border border-border bg-app px-4 py-3 text-sm outline-none focus:border-accent"
              required
            />
          </div>
          <button type="submit" className="mt-5 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white">
            Create Admin
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-xl font-semibold text-app-text">Admin Users</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3">Username</th>
                <th className="pb-3">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {settings?.admins.length ? (
                settings.admins.map((admin) => (
                  <tr key={admin.id}>
                    <td className="py-3 font-medium text-app-text">{admin.username}</td>
                    <td className="py-3 text-app-text">{formatDateTime(admin.created_at || admin.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-3 text-app-text" colSpan={2}>
                    No admin users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
