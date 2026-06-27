import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { examApi } from '../../api/services'
import { useTheme } from '../../context/ThemeContext'
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'

type ExamTab = 'subjects' | 'info'

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState<ExamTab>('subjects')
  const [tocOpen, setTocOpen] = useState(true)

  const { data: exam, isLoading } = useQuery(['exam', id], () => examApi.getById(Number(id)), {
    select: res => res.data,
  })
  const { data: sections = [] } = useQuery(['exam-sections', id], () => examApi.getSections(Number(id)), {
    select: res => res.data,
    enabled: !!id,
  })

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const headerBg = isDark ? '#0f2a33' : '#194552'
  const tableBorder = isDark ? '#374151' : '#d1d5db'
  const tableHeaderBg = isDark ? '#1f2937' : '#f3f4f6'
  const sectionHeaderBg = isDark ? '#1a2e3a' : '#e8f4f8'

  const parseJson = (str: string | null) => {
    if (!str) return null
    try { return JSON.parse(str) } catch { return null }
  }

  if (isLoading) {
    return (
      <div style={{ backgroundColor: bg, minHeight: '100vh', padding: '32px 16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ height: '120px', backgroundColor: cardBg, borderRadius: '16px', marginBottom: '20px', border: `1px solid ${border}` }} />)}
        </div>
      </div>
    )
  }

  const TABS: { key: ExamTab; label: string }[] = [
    { key: 'subjects', label: '📖 Subjects' }
  ]

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ backgroundColor: headerBg, padding: '28px 16px', color: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link to="/exams" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}>
            <ChevronLeft style={{ width: '16px', height: '16px' }} /> All Exams
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {exam?.icon?.startsWith('/')
                ? <img src={exam.icon} alt={exam.name} style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '10px', backgroundColor: '#fff' }} />
                : <span style={{ fontSize: '48px' }}>{exam?.icon}</span>
              }
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px' }}>{exam?.name}</h1>
              <p style={{ color: '#9ca3af', fontSize: '15px' }}>{exam?.description}</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '20px' }}>
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: '9px 20px', borderRadius: '8px 8px 0 0', border: 'none', cursor: 'pointer',
                fontWeight: '600', fontSize: '14px', transition: 'all 0.15s',
                backgroundColor: activeTab === tab.key ? bg : 'transparent',
                color: activeTab === tab.key ? (isDark ? '#f9fafb' : '#194552') : 'rgba(255,255,255,0.75)',
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 16px' }}>

        {/* ── Subjects Tab ── */}
        {activeTab === 'subjects' && (
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: text, marginBottom: '20px' }}>
              📖 Subjects ({exam?.subjects?.length || 0})
            </h2>
            {exam?.subjects?.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: muted }}>
                No subjects added yet for this exam.
              </div>
            )}
            <div style={{ display: 'grid', gap: '12px' }}>
              {exam?.subjects?.map((subject: any) => (
                <Link key={subject.id} to={`/subjects/${subject.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    backgroundColor: cardBg, borderRadius: '14px', padding: '20px',
                    border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '16px',
                  }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '12px',
                      backgroundColor: isDark ? '#374151' : '#f0fdf4',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '22px', flexShrink: 0,
                    }}>
                      {subject.icon || '📝'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', color: text, marginBottom: '4px' }}>{subject.name}</h3>
                      {subject.description && <p style={{ fontSize: '13px', color: muted }}>{subject.description}</p>}
                      {subject.chapterCount > 0 && (
                        <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                          {subject.chapterCount} Chapters
                        </span>
                      )}
                    </div>
                    <ChevronRight style={{ width: '20px', height: '20px', color: muted }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

