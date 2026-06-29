import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import client from '../api/client'
import { ChartCard } from '../components/ChartCard'
import { EmptyState } from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import type { DailyStat, HourlyPoint, OverviewResponse, PlatformBreakdownResponse } from '../types'
import { calculateChange, chartColors, formatDateLabel, formatNumber, formatPercent } from '../utils/format'

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewResponse | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [platforms, setPlatforms] = useState<PlatformBreakdownResponse | null>(null)
  const [hourly, setHourly] = useState<HourlyPoint[]>([])

  useEffect(() => {
    Promise.all([
      client.get<OverviewResponse>('/api/analytics/overview'),
      client.get<DailyStat[]>('/api/analytics/daily?days=30'),
      client.get<PlatformBreakdownResponse>('/api/analytics/platforms?days=30'),
      client.get<HourlyPoint[]>('/api/analytics/hourly?date=today'),
    ]).then(([overviewResponse, dailyResponse, platformResponse, hourlyResponse]) => {
      setOverview(overviewResponse.data)
      setDailyStats(dailyResponse.data)
      setPlatforms(platformResponse.data)
      setHourly(hourlyResponse.data)
    })
  }, [])

  const chartData = useMemo(
    () =>
      dailyStats.map((item) => ({
        ...item,
        label: formatDateLabel(item.date),
      })),
    [dailyStats]
  )

  const visitPlatformData = useMemo(
    () => [
      { name: 'Web', value: platforms?.totals.visits.web || 0 },
      { name: 'Mobile', value: platforms?.totals.visits.mobile || 0 },
    ],
    [platforms]
  )

  const apiPlatformData = useMemo(
    () => [
      { name: 'Web', value: platforms?.totals.apiCalls.web || 0 },
      { name: 'Mobile', value: platforms?.totals.apiCalls.mobile || 0 },
    ],
    [platforms]
  )

  const quickStats = useMemo(() => {
    if (!overview) {
      return null
    }

    const errorRate = overview.last7Days.apiCalls ? (overview.last7Days.errors / overview.last7Days.apiCalls) * 100 : 0
    return {
      totalUsers: overview.allTime.totalUsers,
      returningUsers: overview.last7Days.returningUsers,
      errorRate,
      avgResponseTimeMs: overview.last7Days.avgResponseTimeMs || 0,
    }
  }, [overview])

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
        <StatCard
          title="Today's Visits"
          value={overview?.today.visits || 0}
          change={calculateChange(overview?.today.visits || 0, overview?.yesterday.visits || 0)}
          tone="green"
        />
        <StatCard
          title="Unique Visitors"
          value={overview?.today.uniqueVisitors || 0}
          change={calculateChange(overview?.today.uniqueVisitors || 0, overview?.yesterday.uniqueVisitors || 0)}
          tone="blue"
        />
        <StatCard
          title="New Users"
          value={overview?.today.newUsers || 0}
          change={calculateChange(overview?.today.newUsers || 0, overview?.yesterday.newUsers || 0)}
          tone="amber"
        />
        <StatCard
          title="API Calls"
          value={overview?.today.apiCalls || 0}
          change={calculateChange(overview?.today.apiCalls || 0, overview?.yesterday.apiCalls || 0)}
          tone="pink"
        />
      </section>

      <ChartCard title="Last 30 Days Activity" description="Visits and API calls trend for Tassy Point.">
        {chartData.length ? (
          <div className="h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 16 }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend />
                <Line type="monotone" dataKey="totalVisits" name="Visits" stroke={chartColors[0]} strokeWidth={3} />
                <Line type="monotone" dataKey="totalApiCalls" name="API Calls" stroke={chartColors[1]} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <section className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Visit Platform Split" description="Web vs mobile visit share over the selected period.">
          {visitPlatformData.some((item) => item.value > 0) ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={visitPlatformData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} label>
                    {visitPlatformData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatNumber(value)}
                    contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 16 }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState />
          )}
        </ChartCard>

        <ChartCard title="API Platform Split" description="Web vs mobile API volume for the last 30 days.">
          {apiPlatformData.some((item) => item.value > 0) ? (
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={apiPlatformData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} label>
                    {apiPlatformData.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index + 2]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatNumber(value)}
                    contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 16 }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState />
          )}
        </ChartCard>
      </section>

      <ChartCard title="Hourly Activity" description="Visits by hour for today (0-23).">
        {hourly.some((item) => item.visits > 0 || item.apiCalls > 0) ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourly}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 16 }} />
                <Legend />
                <Bar dataKey="visits" fill={chartColors[0]} radius={[8, 8, 0, 0]} />
                <Bar dataKey="apiCalls" fill={chartColors[1]} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
        )}
      </ChartCard>

      <section className="grid gap-5 xl:grid-cols-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm text-muted">Last 7 Days Total Users</p>
          <p className="mt-3 text-3xl font-bold text-app-text">{formatNumber(quickStats?.totalUsers || 0)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm text-muted">Returning Users</p>
          <p className="mt-3 text-3xl font-bold text-app-text">{formatNumber(quickStats?.returningUsers || 0)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm text-muted">Error Rate</p>
          <p className="mt-3 text-3xl font-bold text-app-text">{formatPercent(quickStats?.errorRate || 0)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <p className="text-sm text-muted">Avg Response Time</p>
          <p className="mt-3 text-3xl font-bold text-app-text">{formatNumber(Math.round(quickStats?.avgResponseTimeMs || 0))} ms</p>
        </div>
      </section>
    </div>
  )
}
