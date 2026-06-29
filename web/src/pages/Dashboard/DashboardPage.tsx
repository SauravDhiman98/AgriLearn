import { useSelector } from 'react-redux'
import { useQuery } from 'react-query'
import { RootState } from '../../store'
import { courseApi, examApi, gamificationApi } from '../../api/services'
import { Link } from 'react-router-dom'
import { BookOpen, TrendingUp, Award, Flame, Target, ArrowRight } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const formatTime = (seconds?: number) => seconds ? `${Math.floor(seconds / 60)}m ${seconds % 60}s` : '—'

export default function DashboardPage() {
  const { user } = useSelector((s: RootState) => s.auth)
  const { isDark } = useTheme()
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'

  const { data: myCourses = [] } = useQuery(['myCourses', user?.id], courseApi.getMyCourses, { select: res => res.data, enabled: !!user?.id })
  const { data: stats } = useQuery(['my-stats', user?.id], gamificationApi.getMyStats, { select: res => res.data, enabled: !!user?.id })
  const { data: attempts = [] } = useQuery(['recent-attempts', user?.id], examApi.getRecentAttempts, { select: res => res.data, enabled: !!user?.id })

  const statCards = [
    { icon: BookOpen, label: 'Enrolled Courses', value: myCourses.length, accent: '#16a34a' },
    { icon: TrendingUp, label: 'In Progress', value: myCourses.filter((c: any) => !c.completed).length, accent: '#2563eb' },
    { icon: Award, label: 'Completed', value: myCourses.filter((c: any) => c.completed).length, accent: '#ca8a04' },
    { icon: Target, label: 'Recent Attempts', value: attempts.length, accent: '#7c3aed' },
  ]

  const quickActions = [
    { to: '/exams', label: 'Practice', desc: 'Start chapter practice sessions', color: '#16a34a' },
    { to: '/exams', label: 'Take Mock Test', desc: 'Attempt full-length mocks', color: '#2563eb' },
    { to: '/exams', label: 'Browse Exams', desc: 'Explore all exam categories', color: '#ea580c' },
    { to: '/forum', label: 'Forum', desc: 'Ask doubts and learn from peers', color: '#7c3aed' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ backgroundColor: bg, minHeight: '100vh', color: text }}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: text }}>Welcome back, {user?.firstName}! 👋</h1>
        <p style={{ color: muted }}>Track your learning streak, recent mock tests, and course progress in one place.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map(({ icon: Icon, label, value, accent }) => (
            <div key={label} className="rounded-2xl p-5" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}><Icon style={{ width: '20px', height: '20px', color: accent }} /></div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: text }}>{value}</div>
              <div style={{ fontSize: '13px', color: muted }}>{label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'linear-gradient(135deg, #194552, #2563eb)', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Flame style={{ width: '22px', height: '22px' }} /></div>
            <div><div style={{ fontSize: '13px', opacity: 0.85 }}>Learning Streak</div><div style={{ fontSize: '28px', fontWeight: 800 }}>{stats?.streakCount ?? 0} days</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px' }}><div style={{ fontSize: '12px', opacity: 0.8 }}>Total Points</div><div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>{stats?.totalPoints ?? 0}</div></div>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '14px', padding: '14px' }}><div style={{ fontSize: '12px', opacity: 0.8 }}>Badges Earned</div><div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px' }}>{stats?.badges?.length ?? 0}</div></div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '18px' }}>
            {(stats?.badges || []).slice(0, 3).map((badge: any) => <span key={badge.badgeType} style={{ backgroundColor: 'rgba(255,255,255,0.16)', borderRadius: '999px', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>🏅 {badge.badgeType.replace(/_/g, ' ')}</span>)}
            {!stats?.badges?.length && <span style={{ fontSize: '12px', opacity: 0.85 }}>Take tests regularly to unlock badges.</span>}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}><div><h2 style={{ fontSize: '18px', fontWeight: 700, color: text }}>Mock Test History</h2><p style={{ fontSize: '13px', color: muted }}>Your latest attempts and score snapshots.</p></div><Link to="/exams" style={{ color: '#16a34a', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>Explore more →</Link></div>
          {attempts.length > 0 ? <div style={{ display: 'grid', gap: '12px' }}>{attempts.map((attempt: any) => <Link key={attempt.id} to={`/mock-tests/${attempt.testId}/result/${attempt.id}`} style={{ textDecoration: 'none' }}><div style={{ border: `1px solid ${border}`, borderRadius: '14px', padding: '16px 18px', backgroundColor: isDark ? '#111827' : '#f8fafc', display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'center' }}><div><div style={{ fontSize: '15px', fontWeight: 700, color: text }}>{attempt.testTitle}</div><div style={{ fontSize: '12px', color: muted, marginTop: '4px' }}>{formatDate(attempt.completedAt)} · {formatTime(attempt.timeTakenSeconds)}</div></div><div style={{ textAlign: 'right' }}><div style={{ fontSize: '18px', fontWeight: 800, color: '#2563eb' }}>{attempt.netScore?.toFixed?.(2) ?? attempt.netScore}</div><div style={{ fontSize: '12px', color: muted }}>Score · {attempt.score}/{attempt.totalQuestions}</div></div></div></Link>)}</div> : <div style={{ textAlign: 'center', padding: '36px 20px', color: muted, border: `1px dashed ${border}`, borderRadius: '14px' }}>No mock test attempts yet. Start practicing to build your streak.</div>}
        </div>
        <div className="rounded-2xl p-6" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: text, marginBottom: '6px' }}>Quick Actions</h2><p style={{ fontSize: '13px', color: muted, marginBottom: '18px' }}>Jump straight into the next learning task.</p>
          <div style={{ display: 'grid', gap: '12px' }}>{quickActions.map(action => <Link key={action.label} to={action.to} style={{ textDecoration: 'none' }}><div style={{ border: `1px solid ${border}`, borderRadius: '14px', padding: '16px', backgroundColor: isDark ? '#111827' : '#ffffff' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}><div><div style={{ color: text, fontWeight: 700 }}>{action.label}</div><div style={{ color: muted, fontSize: '12px', marginTop: '4px' }}>{action.desc}</div></div><div style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: `${action.color}22`, color: action.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowRight style={{ width: '18px', height: '18px' }} /></div></div></div></Link>)}</div>
        </div>
      </div>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold" style={{ color: text }}>My Courses</h2><Link to="/courses" className="text-sm" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: 700 }}>Browse more →</Link></div>
        {myCourses.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{myCourses.map((course: any) => <div key={course.id} className="card p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}><div className="flex gap-3"><div className="w-20 h-14 bg-green-100 rounded-lg flex-shrink-0 overflow-hidden">{course.thumbnailUrl ? <img src={course.thumbnailUrl} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-6 h-6 text-green-400" /></div>}</div><div className="flex-1 min-w-0"><h3 className="font-medium text-sm line-clamp-2" style={{ color: text }}>{course.title}</h3><div className="mt-1.5"><div className="flex items-center justify-between text-xs mb-1" style={{ color: muted }}><span>Progress</span><span>{course.progressPercent || 0}%</span></div><div className="w-full bg-gray-200 rounded-full h-1.5"><div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${course.progressPercent || 0}%` }} /></div></div></div></div><Link to={`/courses/${course.id}/learn`} className="btn-primary w-full text-center text-sm mt-3 py-1.5">{(course.progressPercent || 0) > 0 ? 'Continue' : 'Start Learning'}</Link></div>)}</div> : <div className="text-center py-12 rounded-xl border border-dashed border-gray-300" style={{ backgroundColor: cardBg, borderColor: border }}><BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" /><p className="mb-3" style={{ color: muted }}>You haven't enrolled in any courses yet</p><Link to="/courses" className="btn-primary text-sm">Explore Courses</Link></div>}
      </div>
    </div>
  )
}
