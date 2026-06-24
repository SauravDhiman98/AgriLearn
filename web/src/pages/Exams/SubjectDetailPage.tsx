import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { examApi } from '../../api/services'
import { useTheme } from '../../context/ThemeContext'
import { ChevronRight, ChevronLeft, FileText, Video, Brain } from 'lucide-react'

export default function SubjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isDark } = useTheme()

  const { data: subject, isLoading } = useQuery(['subject', id], () => examApi.getSubject(Number(id)), {
    select: res => res.data,
  })

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const headerBg = isDark ? '#0f2a33' : '#194552'

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: headerBg, padding: '28px 16px', color: '#fff' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <Link to={subject ? `/exams/${subject.examId}` : '/exams'}
            style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
            <ChevronLeft style={{ width: '16px', height: '16px' }} /> {subject?.examName || 'Back'}
          </Link>
          <h1 style={{ fontSize: '26px', fontWeight: 'bold' }}>{subject?.name}</h1>
          {subject?.description && <p style={{ color: '#9ca3af', marginTop: '6px' }}>{subject.description}</p>}
        </div>
      </div>

      {/* Chapters */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: text, marginBottom: '20px' }}>
          📚 Chapters ({subject?.chapters?.length || 0})
        </h2>

        {isLoading && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {[...Array(6)].map((_, i) => <div key={i} style={{ height: '90px', backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${border}` }} />)}
          </div>
        )}

        <div style={{ display: 'grid', gap: '12px' }}>
          {subject?.chapters?.map((chapter: any, idx: number) => (
            <Link key={chapter.id} to={`/exam-chapters/${chapter.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: cardBg, borderRadius: '14px', padding: '18px 20px',
                border: `1px solid ${border}`, display: 'flex', alignItems: 'center', gap: '16px',
                transition: 'all 0.2s ease',
              }}>
                {/* Chapter number */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: isDark ? '#374151' : '#f0fdf4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold', color: '#16a34a', fontSize: '15px', flexShrink: 0,
                }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', color: text, marginBottom: '6px' }}>{chapter.title}</h3>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    {chapter.notesCount > 0 && (
                      <span style={{ fontSize: '12px', color: muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText style={{ width: '12px', height: '12px' }} /> {chapter.notesCount} Notes
                      </span>
                    )}
                    {chapter.videosCount > 0 && (
                      <span style={{ fontSize: '12px', color: muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Video style={{ width: '12px', height: '12px' }} /> {chapter.videosCount} Videos
                      </span>
                    )}
                    {chapter.testsCount > 0 && (
                      <span style={{ fontSize: '12px', color: muted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Brain style={{ width: '12px', height: '12px' }} /> {chapter.testsCount} Tests
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight style={{ width: '18px', height: '18px', color: muted }} />
              </div>
            </Link>
          ))}
        </div>

        {!isLoading && subject?.chapters?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No chapters yet for this subject.</div>
        )}
      </div>
    </div>
  )
}
