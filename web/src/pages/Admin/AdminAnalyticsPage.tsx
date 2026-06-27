import { useQuery } from 'react-query'
import { BarChart2, Users, UserPlus, FileText, Trophy, Brain } from 'lucide-react'
import { adminApi } from '../../api/services'
import { useTheme } from '../../context/ThemeContext'

const statMeta = [
  { key: 'totalUsers', label: 'Total Users', icon: Users, color: '#2563eb', suffix: '' },
  { key: 'newUsersThisWeek', label: 'New This Week', icon: UserPlus, color: '#16a34a', suffix: '' },
  { key: 'totalAttempts', label: 'Total Attempts', icon: FileText, color: '#7c3aed', suffix: '' },
  { key: 'avgScore', label: 'Avg Score', icon: Trophy, color: '#ea580c', suffix: '%' },
  { key: 'totalExams', label: 'Total Exams', icon: BarChart2, color: '#0891b2', suffix: '' },
  { key: 'totalMockTests', label: 'Mock Tests', icon: Brain, color: '#dc2626', suffix: '' },
] as const

export default function AdminAnalyticsPage() {
  const { isDark } = useTheme()
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'

  const { data, isLoading } = useQuery('admin-analytics', adminApi.getAnalytics, {
    select: res => res.data,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ backgroundColor: bg, minHeight: '100vh', color: text }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: text }}>Admin Analytics</h1>
        <p className="text-sm" style={{ color: muted }}>Real-time platform growth and mock test performance insights.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {statMeta.map(({ key, label, icon: Icon, color, suffix }) => (
          <div key={key} className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Icon style={{ width: '22px', height: '22px', color }} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: text }}>{isLoading ? '…' : `${data?.[key] ?? 0}${suffix ?? ''}`}</div>
            <div style={{ fontSize: '13px', color: muted, marginTop: '6px' }}>{label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
        <div style={{ padding: '20px 24px', borderBottom: `1px solid ${border}` }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: text }}>Top Mock Tests</h2>
          <p style={{ fontSize: '13px', color: muted, marginTop: '4px' }}>Most attempted mock tests across the platform.</p>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: isDark ? '#111827' : '#f8fafc' }}>
                {['Rank', 'Title', 'Attempts'].map(label => (
                  <th key={label} style={{ textAlign: 'left', padding: '14px 18px', fontSize: '12px', color: muted, borderBottom: `1px solid ${border}` }}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.topTests || []).length > 0 ? data.topTests.map((item: any, index: number) => (
                <tr key={item.id}>
                  <td style={{ padding: '16px 18px', borderBottom: `1px solid ${border}`, color: text, fontWeight: 700 }}>#{index + 1}</td>
                  <td style={{ padding: '16px 18px', borderBottom: `1px solid ${border}`, color: text }}>{item.title}</td>
                  <td style={{ padding: '16px 18px', borderBottom: `1px solid ${border}`, color: muted }}>{item.attempts}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} style={{ padding: '28px 18px', textAlign: 'center', color: muted }}>{isLoading ? 'Loading analytics…' : 'No mock test attempts available yet.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
