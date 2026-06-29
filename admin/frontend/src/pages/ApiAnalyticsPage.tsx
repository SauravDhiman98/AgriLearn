import { useEffect, useMemo, useState } from 'react'
import { AxiosError } from 'axios'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import client from '../api/client'
import { ChartCard } from '../components/ChartCard'
import { EmptyState } from '../components/EmptyState'
import type { ApiLog, DailyStat, PagedResponse, TopEndpoint } from '../types'
import { chartColors, formatDateLabel, formatDateTime, formatNumber, formatPercent } from '../utils/format'

const statusBadgeMap = {
  success: 'bg-emerald-500/20 text-emerald-300',
  warning: 'bg-amber-500/20 text-amber-300',
  danger: 'bg-rose-500/20 text-rose-300',
}

export default function ApiAnalyticsPage() {
  const [topEndpoints, setTopEndpoints] = useState<TopEndpoint[]>([])
  const [logs, setLogs] = useState<PagedResponse<ApiLog> | null>(null)
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [filters, setFilters] = useState({ date: '', method: '', statusGroup: '', page: 1 })
  const [error, setError] = useState('')

  useEffect(() => {
    client.get<TopEndpoint[]>('/api/analytics/top-endpoints?days=7').then((response) => setTopEndpoints(response.data))
    client.get<DailyStat[]>('/api/analytics/daily?days=30').then((response) => setDailyStats(response.data))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(filters.page),
      limit: '10',
    })

    if (filters.date) params.set('date', filters.date)
    if (filters.method) params.set('method', filters.method)
    if (filters.statusGroup) params.set('statusGroup', filters.statusGroup)

    client
      .get<PagedResponse<ApiLog>>(`/api/analytics/api-logs?${params.toString()}`)
      .then((response) => {
        setLogs(response.data)
        setError('')
      })
      .catch((err) => {
        const axiosError = err as AxiosError<{ message?: string }>
        setError(axiosError.response?.data?.message || 'Unable to load API logs.')
      })
  }, [filters])

  const chartData = useMemo(
    () =>
      dailyStats.map((item) => ({
        label: formatDateLabel(item.date),
        avgResponseTimeMs: Number(item.avgResponseTimeMs.toFixed(2)),
      })),
    [dailyStats]
  )

  return (
    <div className="space-y-8">
      <ChartCard title="Top Endpoints" description="Most called API endpoints over the last 7 days.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3">Endpoint</th>
                <th className="pb-3">Total Calls</th>
                <th className="pb-3">Avg Response</th>
                <th className="pb-3">Errors</th>
                <th className="pb-3">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topEndpoints.length ? (
                topEndpoints.map((endpoint) => (
                  <tr key={endpoint.endpoint}>
                    <td className="py-3 font-medium text-app-text">{endpoint.endpoint}</td>
                    <td className="py-3 text-app-text">{formatNumber(endpoint.totalCalls)}</td>
                    <td className="py-3 text-app-text">{formatNumber(Math.round(endpoint.avgResponseTimeMs))} ms</td>
                    <td className="py-3 text-app-text">{formatNumber(endpoint.errorCount)}</td>
                    <td className="py-3 text-app-text">{formatPercent(endpoint.successRate)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-6" colSpan={5}>
                    <EmptyState title="No endpoint analytics" subtitle="API call tracking has not started yet." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard title="Recent API Logs" description="Inspect incoming traffic with filters and pagination.">
        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <input
            type="date"
            value={filters.date}
            onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value, page: 1 }))}
            className="rounded-xl border border-border bg-app px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <select
            value={filters.method}
            onChange={(event) => setFilters((current) => ({ ...current, method: event.target.value, page: 1 }))}
            className="rounded-xl border border-border bg-app px-4 py-3 text-sm outline-none focus:border-accent"
          >
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select
            value={filters.statusGroup}
            onChange={(event) => setFilters((current) => ({ ...current, statusGroup: event.target.value, page: 1 }))}
            className="rounded-xl border border-border bg-app px-4 py-3 text-sm outline-none focus:border-accent"
          >
            <option value="">All Status Groups</option>
            <option value="2xx">2xx</option>
            <option value="4xx">4xx</option>
            <option value="5xx">5xx</option>
          </select>
          <button
            type="button"
            onClick={() => setFilters({ date: '', method: '', statusGroup: '', page: 1 })}
            className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-app-text transition hover:border-accent hover:text-accent"
          >
            Clear Filters
          </button>
        </div>

        {error ? <p className="mb-4 rounded-xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p> : null}

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Endpoint</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Response Time</th>
                <th className="pb-3">Platform</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs?.data.length ? (
                logs.data.map((log) => {
                  const tone = log.statusCode >= 500 ? 'danger' : log.statusCode >= 400 ? 'warning' : 'success'
                  return (
                    <tr key={log.id}>
                      <td className="py-3 text-app-text">{formatDateTime(log.createdAt)}</td>
                      <td className="py-3">
                        <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">{log.method}</span>
                      </td>
                      <td className="py-3 font-medium text-app-text">{log.endpoint}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeMap[tone]}`}>{log.statusCode}</span>
                      </td>
                      <td className="py-3 text-app-text">{formatNumber(log.responseTimeMs || 0)} ms</td>
                      <td className="py-3 capitalize text-app-text">{log.platform}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td className="py-6" colSpan={6}>
                    <EmptyState title="No API logs" subtitle="Tracked API requests will appear here." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {logs ? (
          <div className="mt-5 flex items-center justify-between text-sm text-muted">
            <p>
              Page {logs.pagination.page} of {logs.pagination.totalPages}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={logs.pagination.page <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
                className="rounded-xl border border-border px-4 py-2 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={logs.pagination.page >= logs.pagination.totalPages}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                className="rounded-xl border border-border px-4 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </ChartCard>

      <ChartCard title="Response Time Trend" description="Average response time per day for the last 30 days.">
        {chartData.length ? (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: '#0f172a', borderColor: '#334155', borderRadius: 16 }} />
                <Line type="monotone" dataKey="avgResponseTimeMs" stroke={chartColors[1]} strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState />
        )}
      </ChartCard>
    </div>
  )
}
