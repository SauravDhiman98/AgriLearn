import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { examApi } from '../../api/services'
import { useTheme } from '../../context/ThemeContext'
import { BookOpen, ChevronRight } from 'lucide-react'

export default function ExamsPage() {
  const { isDark } = useTheme()
  const { data: exams, isLoading } = useQuery('exams', examApi.getAll, {
    select: res => res.data,
  })

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: bg, padding: '32px 16px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 'bold', color: text, marginBottom: '8px' }}>
            📚 Choose Your Exam
          </h1>
          <p style={{ color: muted, fontSize: '16px' }}>
            Select your target exam to access curated subjects, chapters, notes, video lectures and practice tests
          </p>
        </div>

        {isLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${border}`, height: '140px', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {exams?.map((exam: any) => (
              <Link key={exam.id} to={`/exams/${exam.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: cardBg,
                  borderRadius: '16px',
                  padding: '24px',
                  border: `1px solid ${border}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                }}>
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '14px',
                    backgroundColor: isDark ? '#374151' : '#f0fdf4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '28px', flexShrink: 0, overflow: 'hidden',
                  }}>
                    {exam.icon?.startsWith('/')
                      ? <img src={exam.icon} alt={exam.name} style={{ width: '52px', height: '52px', objectFit: 'contain', borderRadius: '10px' }} />
                      : exam.icon
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: text, marginBottom: '4px' }}>
                      {exam.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: muted, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {exam.description}
                    </p>
                    {exam.subjectCount > 0 && (
                      <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginTop: '6px', display: 'inline-block' }}>
                        <BookOpen style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
                        {exam.subjectCount} Subjects
                      </span>
                    )}
                  </div>
                  <ChevronRight style={{ width: '20px', height: '20px', color: muted, flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (!exams || exams.length === 0) && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
            <p style={{ color: muted, fontSize: '16px' }}>No exams available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
