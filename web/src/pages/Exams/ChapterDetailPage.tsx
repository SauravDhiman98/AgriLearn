import { useState } from 'react'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { examApi } from '../../api/services'
import { useTheme } from '../../context/ThemeContext'
import { ChevronLeft, FileText, Video, Brain, ExternalLink, Play } from 'lucide-react'

type Tab = 'notes' | 'videos' | 'tests'

export default function ChapterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [selectedNote, setSelectedNote] = useState<any>(null)

  const { data: chapter, isLoading } = useQuery(['chapter', id], () => examApi.getChapter(Number(id)), {
    select: res => res.data,
    onSuccess: (data: any) => {
      if (data?.notes?.length > 0 && !selectedNote) setSelectedNote(data.notes[0])
    },
  })

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const headerBg = isDark ? '#0f2a33' : '#194552'
  const tabActiveBg = isDark ? '#374151' : '#e0f2fe'
  const tabActiveColor = isDark ? '#93c5fd' : '#0369a1'

  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [
    { key: 'notes', label: 'Notes', icon: FileText, count: chapter?.notes?.length || 0 },
    { key: 'videos', label: 'Videos', icon: Video, count: chapter?.videos?.length || 0 },
    { key: 'tests', label: 'MCQ Tests', icon: Brain, count: chapter?.tests?.length || 0 },
  ]

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: headerBg, padding: '24px 16px', color: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Link to={chapter ? `/subjects/${chapter.subjectId}` : '/exams'}
            style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            <ChevronLeft style={{ width: '16px', height: '16px' }} /> {chapter?.subjectName || 'Back'}
          </Link>
          <h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>{chapter?.title || '...'}</h1>
          {chapter?.examName && (
            <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>
              {chapter.examName} › {chapter.subjectName}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${border}`, backgroundColor: cardBg }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '4px', padding: '0 16px' }}>
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: '14px 20px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
              display: 'flex', alignItems: 'center', gap: '6px',
              backgroundColor: activeTab === tab.key ? tabActiveBg : 'transparent',
              color: activeTab === tab.key ? tabActiveColor : muted,
              borderBottom: activeTab === tab.key ? '2px solid #0369a1' : '2px solid transparent',
            }}>
              <tab.icon style={{ width: '15px', height: '15px' }} />
              {tab.label}
              {tab.count > 0 && (
                <span style={{ backgroundColor: isDark ? '#4b5563' : '#e5e7eb', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        {isLoading ? (
          <div style={{ display: 'grid', gap: '12px' }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: '80px', backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${border}` }} />)}
          </div>
        ) : (
          <>
            {/* Notes Tab */}
            {activeTab === 'notes' && (
              <div style={{ display: 'grid', gridTemplateColumns: chapter?.notes?.length > 1 ? '280px 1fr' : '1fr', gap: '20px' }}>
                {chapter?.notes?.length > 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {chapter.notes.map((note: any) => (
                      <button key={note.id} onClick={() => setSelectedNote(note)} style={{
                        textAlign: 'left', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${border}`,
                        backgroundColor: selectedNote?.id === note.id ? (isDark ? '#1d4ed8' : '#dbeafe') : cardBg,
                        color: text, cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                      }}>
                        {note.title}
                      </button>
                    ))}
                  </div>
                )}
                {selectedNote || chapter?.notes?.[0] ? (
                  <div style={{ backgroundColor: cardBg, borderRadius: '14px', padding: '28px', border: `1px solid ${border}` }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: text, marginBottom: '20px', borderBottom: `1px solid ${border}`, paddingBottom: '12px' }}>
                      {(selectedNote || chapter.notes[0]).title}
                    </h2>
                    <div style={{ color: text, lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-wrap' }}>
                      {(selectedNote || chapter.notes[0]).content}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No notes available for this chapter.</div>
                )}
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div style={{ display: 'grid', gap: '16px' }}>
                {chapter?.videos?.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No video lectures yet.</div>
                )}
                {chapter?.videos?.map((video: any) => (
                  <div key={video.id} style={{ backgroundColor: cardBg, borderRadius: '14px', border: `1px solid ${border}`, overflow: 'hidden' }}>
                    {video.youtubeId ? (
                      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${video.youtubeId}`}
                          title={video.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        />
                      </div>
                    ) : (
                      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: isDark ? '#374151' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Play style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: '600', color: text }}>{video.title}</h3>
                          {video.youtubeUrl && (
                            <a href={video.youtubeUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                              <ExternalLink style={{ width: '12px', height: '12px' }} /> Watch on YouTube
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    {video.title && video.youtubeId && (
                      <div style={{ padding: '12px 16px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: text }}>{video.title}</h3>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* MCQ Tests Tab */}
            {activeTab === 'tests' && (
              <div style={{ display: 'grid', gap: '12px' }}>
                {chapter?.tests?.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No MCQ tests yet.</div>
                )}
                {chapter?.tests?.map((test: any) => (
                  <div key={test.id} style={{ backgroundColor: cardBg, borderRadius: '14px', border: `1px solid ${border}`, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: isDark ? '#374151' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                      🧠
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', color: text, marginBottom: '4px' }}>{test.title}</h3>
                      <p style={{ fontSize: '13px', color: muted }}>
                        {test.questionCount} Questions · {test.durationMinutes} min · Difficulty: {test.difficulty}
                      </p>
                    </div>
                    <Link to={`/mcq-tests/${test.id}`} style={{
                      backgroundColor: '#194552', color: '#fff', padding: '9px 18px', borderRadius: '8px',
                      textDecoration: 'none', fontSize: '13px', fontWeight: '600',
                    }}>
                      Start Test
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
