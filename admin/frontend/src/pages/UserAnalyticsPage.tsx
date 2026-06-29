import { useEffect, useState } from 'react'
import {
  Area, AreaChart, Bar, BarChart,
  CartesianGrid, Cell, PieChart, Pie,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import client from '../api/client'
import { ChartCard } from '../components/ChartCard'
import { EmptyState } from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { chartColors, formatDateLabel } from '../utils/format'

interface UserDetail {
  summary: {
    total: number; new_today: number; new_last_7: number
    new_last_30: number; verified: number; unverified: number
  }
  daily: { date: string; new_users: number }[]
  roles: { role: string; count: number }[]
  recentSignups: { id: number; firstName: string; lastName: string; email: string; role: string; enabled: boolean; createdAt: string }[]
}

export default function UserAnalyticsPage() {
  const [data, setData] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get<UserDetail>('/api/analytics/users-detail?days=30')
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-muted text-center py-20">Loading user analytics...</div>
  if (!data) return <EmptyState title="Failed to load" subtitle="Could not fetch user data." />

  const { summary, daily, roles, recentSignups } = data

  const dailyChartData = daily.map(d => ({ ...d, label: formatDateLabel(d.date) }))

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Users" value={summary.total} tone="green" />
        <StatCard title="New Today" value={summary.new_today} tone="blue" />
        <StatCard title="Last 7 Days" value={summary.new_last_7} tone="amber" />
        <StatCard title="Last 30 Days" value={summary.new_last_30} tone="pink" />
        <StatCard title="Verified" value={summary.verified} tone="green" />
        <StatCard title="Unverified" value={summary.unverified} tone="amber" />
      </div>

      {/* Daily registrations chart */}
      <ChartCard title="Daily New Registrations" description="New users registered each day (last 30 days)">
        {dailyChartData.length ? (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="regFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 12 }} />
                <Area type="monotone" dataKey="new_users" name="New Users" stroke={chartColors[0]} fill="url(#regFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : <EmptyState title="No registrations yet" subtitle="User registrations will appear here." />}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role distribution */}
        <ChartCard title="Users by Role" description="Breakdown of user roles">
          {roles.length ? (
            <div className="h-[240px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roles} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={90} label={({ role, percent }) => `${role} ${(percent * 100).toFixed(0)}%`}>
                    {roles.map((_, i) => <Cell key={i} fill={chartColors[i % chartColors.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState />}
        </ChartCard>

        {/* Bar chart */}
        <ChartCard title="Registration Trend" description="New users per day">
          {dailyChartData.length ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                  <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#94a3b8" allowDecimals={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 12 }} />
                  <Bar dataKey="new_users" name="New Users" fill={chartColors[1]} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState />}
        </ChartCard>
      </div>

      {/* Recent signups table */}
      <ChartCard title="Recent Signups" description="Last 20 registered users">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3 pr-4">Name</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Role</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentSignups.length ? recentSignups.map(u => (
                <tr key={u.id}>
                  <td className="py-3 pr-4 font-medium text-app-text">{u.firstName} {u.lastName}</td>
                  <td className="py-3 pr-4 text-muted">{u.email}</td>
                  <td className="py-3 pr-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-900/40 text-green-400">{u.role}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.enabled ? 'bg-green-900/40 text-green-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                      {u.enabled ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} className="py-6"><EmptyState title="No users yet" /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
