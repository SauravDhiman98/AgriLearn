import { useEffect, useState } from 'react'
import client from '../api/client'
import { ChartCard } from '../components/ChartCard'
import { EmptyState } from '../components/EmptyState'
import type { PagedResponse, TopPage, VisitLog } from '../types'
import { formatDateTime, formatNumber, truncate } from '../utils/format'

export default function VisitsPage() {
  const [topPages, setTopPages] = useState<TopPage[]>([])
  const [visits, setVisits] = useState<PagedResponse<VisitLog> | null>(null)
  const [filters, setFilters] = useState({ platform: '', date: '', page: 1 })

  useEffect(() => {
    client.get<TopPage[]>('/api/analytics/top-pages?days=7').then((response) => setTopPages(response.data))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams({ page: String(filters.page), limit: '10' })
    if (filters.platform) params.set('platform', filters.platform)
    if (filters.date) params.set('date', filters.date)

    client.get<PagedResponse<VisitLog>>(`/api/analytics/visits?${params.toString()}`).then((response) => setVisits(response.data))
  }, [filters])

  return (
    <div className="space-y-8">
      <ChartCard title="Top Pages" description="Highest traffic pages over the last 7 days.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3">Path</th>
                <th className="pb-3">Visit Count</th>
                <th className="pb-3">Unique Visitors</th>
                <th className="pb-3">Avg Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {topPages.length ? (
                topPages.map((page) => (
                  <tr key={page.path}>
                    <td className="py-3 font-medium text-app-text">{page.path}</td>
                    <td className="py-3 text-app-text">{formatNumber(page.visitCount)}</td>
                    <td className="py-3 text-app-text">{formatNumber(page.uniqueVisitors)}</td>
                    <td className="py-3 text-app-text">{formatNumber(Math.round(page.avgDuration))} sec</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-6" colSpan={4}>
                    <EmptyState title="No page analytics" subtitle="Tracked page visits will appear here." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

      <ChartCard title="Recent Visits" description="Latest tracked visits from web and mobile clients.">
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <select
            value={filters.platform}
            onChange={(event) => setFilters((current) => ({ ...current, platform: event.target.value, page: 1 }))}
            className="rounded-xl border border-border bg-app px-4 py-3 text-sm outline-none focus:border-accent"
          >
            <option value="">All Platforms</option>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value, page: 1 }))}
            className="rounded-xl border border-border bg-app px-4 py-3 text-sm outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() => setFilters({ platform: '', date: '', page: 1 })}
            className="rounded-xl border border-border px-4 py-3 text-sm font-medium text-app-text transition hover:border-accent hover:text-accent"
          >
            Clear Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-muted">
              <tr>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Path</th>
                <th className="pb-3">Platform</th>
                <th className="pb-3">Session ID</th>
                <th className="pb-3">User ID</th>
                <th className="pb-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visits?.data.length ? (
                visits.data.map((visit) => (
                  <tr key={visit.id}>
                    <td className="py-3 text-app-text">{formatDateTime(visit.createdAt)}</td>
                    <td className="py-3 font-medium text-app-text">{visit.path}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold capitalize text-accent">{visit.platform}</span>
                    </td>
                    <td className="py-3 text-app-text" title={visit.sessionId}>
                      {truncate(visit.sessionId, 14)}
                    </td>
                    <td className="py-3 text-app-text">{visit.userId ?? '—'}</td>
                    <td className="py-3 text-app-text">{formatNumber(visit.durationSeconds || 0)} sec</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-6" colSpan={6}>
                    <EmptyState title="No recent visits" subtitle="Visits will appear once the tracker is wired into the main app." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {visits ? (
          <div className="mt-5 flex items-center justify-between text-sm text-muted">
            <p>
              Page {visits.pagination.page} of {visits.pagination.totalPages}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={visits.pagination.page <= 1}
                onClick={() => setFilters((current) => ({ ...current, page: current.page - 1 }))}
                className="rounded-xl border border-border px-4 py-2 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={visits.pagination.page >= visits.pagination.totalPages}
                onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}
                className="rounded-xl border border-border px-4 py-2 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </ChartCard>
    </div>
  )
}
