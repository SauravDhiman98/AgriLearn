import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import client from '../api/client'
import { ChartCard } from '../components/ChartCard'
import { EmptyState } from '../components/EmptyState'
import type { DailyStat, UserSnapshot } from '../types'
import { chartColors, formatDateLabel, formatNumber } from '../utils/format'

export default function UserAnalyticsPage() {
  const [snapshots, setSnapshots] = useState<UserSnapshot[]>([])
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])

  useEffect(() => {
    Promise.all([
      client.get<UserSnapshot[]>('/api/analytics/users'),
      client.get<DailyStat[]>('/api/analytics/daily?days=30'),
    ]).then(([snapshotResponse, dailyResponse]) => {
      setSnapshots(snapshotResponse.data)
      setDailyStats(dailyResponse.data)
    })
  }, [])

  const growthData = useMemo(
    () =>
      snapshots.map((snapshot) => ({
        ...snapshot,
        label: formatDateLabel(snapshot.snapshotDate),
      })),
    [snapshots]
  )

  const userMixData = useMemo(
    () =>
      dailyStats.map((stat) => ({
        ...stat,
        label: formatDateLabel(stat.date),
      })),
    [dailyStats]
  )

  return (
    <div className="space-y-8">
      <ChartCard title="Growth Chart" description="Total users captured from Spring Boot snapshot history.">
        {growthData.length ? (
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColors[0]} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={chartColors[0]} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 16 }} />
                <Area type="monotone" dataKey="totalUsers" stroke={chartColors[0]} fill="url(#growthFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No user snapshots" subtitle="Daily Spring Boot snapshots will populate this chart." />
        )}
      </ChartCard>

      <ChartCard title="New vs Returning Users" description="Stacked daily user mix for the last 30 days.">
        {userMixData.length ? (
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userMixData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 16 }} />
                <Legend />
                <Bar dataKey="newUsers" stackId="users" fill={chartColors[0]} radius={[6, 6, 0, 0]} />
                <Bar dataKey="returningUsers" stackId="users" fill={chartColors[1]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <ChartCard title="Daily New Users" description="New user counts inferred from first tracked visits.">
        {userMixData.length ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userMixData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 16 }} />
                <Bar dataKey="newUsers" fill={chartColors[2]} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <ChartCard title="User Snapshot Table" description="Daily snapshot values fetched from the Spring Boot backend.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3">Date</th>
                <th className="pb-3">Total Users</th>
                <th className="pb-3">New Today</th>
                <th className="pb-3">Active Today</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {snapshots.length ? (
                snapshots.map((snapshot) => (
                  <tr key={snapshot.id}>
                    <td className="py-3 font-medium text-app-text">{snapshot.snapshotDate}</td>
                    <td className="py-3 text-app-text">{formatNumber(snapshot.totalUsers)}</td>
                    <td className="py-3 text-app-text">{formatNumber(snapshot.newToday)}</td>
                    <td className="py-3 text-app-text">{formatNumber(snapshot.activeToday)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-6" colSpan={4}>
                    <EmptyState title="No user history" subtitle="No Spring Boot user snapshots have been stored yet." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  )
}
