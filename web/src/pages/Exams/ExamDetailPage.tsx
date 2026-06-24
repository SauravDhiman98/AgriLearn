import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { examApi } from '../../api/services'
import { useTheme } from '../../context/ThemeContext'
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react'

export default function ExamDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isDark } = useTheme()
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
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 16px' }}>

        {/* Table of Contents */}
        {sections.length > 0 && (
          <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${border}`, marginBottom: '28px', overflow: 'hidden' }}>
            <button onClick={() => setTocOpen(p => !p)} style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer',
              backgroundColor: tableHeaderBg,
            }}>
              <span style={{ fontWeight: '700', fontSize: '15px', color: text }}>Table of Contents</span>
              {tocOpen ? <ChevronUp style={{ width: '18px', height: '18px', color: muted }} /> : <ChevronDown style={{ width: '18px', height: '18px', color: muted }} />}
            </button>
            {tocOpen && (
              <div style={{ padding: '8px 0' }}>
                {sections.map((section: any) => (
                  <a key={section.id} href={`#section-${section.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 20px', color: '#0369a1', textDecoration: 'none', fontSize: '14px' }}>
                    <ChevronRight style={{ width: '14px', height: '14px' }} />
                    {section.title}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Exam Info Sections */}
        {sections.map((section: any) => {
          const headers = parseJson(section.tableHeaders)
          const rows = parseJson(section.tableRows)
          return (
            <div key={section.id} id={`section-${section.id}`} style={{ marginBottom: '28px' }}>
              {/* Section title */}
              <div style={{ backgroundColor: sectionHeaderBg, borderLeft: '4px solid #194552', padding: '12px 18px', marginBottom: '14px', borderRadius: '0 8px 8px 0' }}>
                <h2 style={{ fontSize: '17px', fontWeight: '700', color: text, margin: 0 }}>{section.title}</h2>
              </div>

              {/* Description paragraph */}
              {section.description && (
                <p style={{ color: text, lineHeight: '1.8', fontSize: '15px', marginBottom: '16px' }}>
                  {section.description}
                </p>
              )}

              {/* Table */}
              {headers && rows && (
                <div style={{ overflowX: 'auto', borderRadius: '10px', border: `1px solid ${tableBorder}` }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: tableHeaderBg }}>
                        {headers.map((h: string, i: number) => (
                          <th key={i} style={{ padding: '12px 16px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: text, borderBottom: `2px solid ${tableBorder}`, borderRight: i < headers.length - 1 ? `1px solid ${tableBorder}` : 'none' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row: string[], ri: number) => (
                        <tr key={ri} style={{ borderBottom: ri < rows.length - 1 ? `1px solid ${tableBorder}` : 'none' }}>
                          {row.map((cell: string, ci: number) => (
                            <td key={ci} style={{
                              padding: '11px 16px', textAlign: 'center', fontSize: '14px',
                              color: ci === 0 ? '#0369a1' : text,
                              borderRight: ci < row.length - 1 ? `1px solid ${tableBorder}` : 'none',
                              backgroundColor: ri % 2 === 0 ? 'transparent' : (isDark ? '#1a2533' : '#fafafa'),
                            }}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )
        })}

        {/* Subjects section */}
        <div style={{ marginTop: sections.length > 0 ? '40px' : '0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: text, marginBottom: '20px', paddingTop: sections.length > 0 ? '20px' : '0', borderTop: sections.length > 0 ? `2px solid ${border}` : 'none' }}>
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
      </div>
    </div>
  )
}
