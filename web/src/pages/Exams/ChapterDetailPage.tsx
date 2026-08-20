import { useState, useEffect, useRef } from 'react'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { examApi } from '../../api/services'
import { useTheme } from '../../context/ThemeContext'
import { RootState } from '../../store'
import { ChevronLeft, FileText, Video, Brain, Play } from 'lucide-react'

type Tab = 'notes' | 'videos' | 'tests'
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://agrilearn-production-6f2e.up.railway.app/api/v1'
const API_ORIGIN = API_BASE.replace(/\/api\/v\d+\/?$/, '')
function resolveUrl(url: string | null | undefined): string | null { if (!url) return null; if (url.startsWith('http://') || url.startsWith('https://')) return url; return API_ORIGIN + url }
function extractYoutubeId(url: string | null | undefined): string | null { if (!url) return null; const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/); return match ? match[1] : null }

/** Renders a watermarked PDF served by the backend, with a canvas overlay fallback */
function PdfViewer({ noteId, title, userLabel }: { noteId: number; title: string; userLabel: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { isDark } = useTheme()
  const muted = isDark ? '#9ca3af' : '#6b7280'

  // Fetch from the server-side watermark endpoint (JWT auto-attached by axios interceptor)
  useEffect(() => {
    let objectUrl: string | null = null
    setLoading(true); setError(null); setBlobUrl(null)
    const token = localStorage.getItem('accessToken')
    const url = token ? `${API_BASE}/notes/${noteId}/view?token=${encodeURIComponent(token)}` : `${API_BASE}/notes/${noteId}/view`
    fetch(url
    )
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.blob() })
      .then(blob => { objectUrl = URL.createObjectURL(blob); setBlobUrl(objectUrl) })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [noteId])

  // Canvas overlay — repeating diagonal user label as secondary deterrent
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !blobUrl) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width  = canvas.offsetWidth  || 800
    canvas.height = canvas.offsetHeight || 600
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.globalAlpha = 0.07
    ctx.fillStyle = '#1f2937'
    ctx.font = 'bold 15px sans-serif'
    ctx.rotate(-Math.PI / 6)
    const step = 200
    for (let y = -canvas.height; y < canvas.height * 2; y += step) {
      for (let x = -canvas.width; x < canvas.width * 2; x += step) {
        ctx.fillText(userLabel, x, y)
      }
    }
    ctx.restore()
  }, [blobUrl, userLabel])

  if (loading) return <div style={{ padding: '60px', textAlign: 'center', color: muted }}>Loading PDF...</div>
  if (error)   return <div style={{ padding: '40px', textAlign: 'center', color: muted }}>Could not load PDF: {error}</div>
  return (
    <div style={{ position: 'relative', userSelect: 'none' }} onContextMenu={e => e.preventDefault()}>
      <iframe
        src={`${blobUrl}#toolbar=0&navpanes=0&scrollbar=1`}
        title={title}
        style={{ width: '100%', height: '80vh', border: 'none', display: 'block' }}
      />
      {/* Canvas overlay — secondary client-side watermark */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 5, pointerEvents: 'none' }} />
    </div>
  )
}

export default function ChapterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isDark } = useTheme()
  const { user } = useSelector((s: RootState) => s.auth)
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [selectedNote, setSelectedNote] = useState<any>(null)
  const { data: chapter, isLoading } = useQuery(['chapter', id], () => examApi.getChapter(Number(id)), { select: res => res.data })
  const userLabel = [user?.firstName, user?.lastName].filter(Boolean).join(' ') + (user?.email ? `  •  ${user.email}` : '')
  useEffect(() => { setSelectedNote(null) }, [id])
  useEffect(() => { if (chapter?.notes?.length > 0) setSelectedNote((prev: any) => prev ?? chapter.notes[0]) }, [chapter])

  // Block Ctrl+S (save), Ctrl+P (print), Ctrl+U (view source) on notes tab
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeTab !== 'notes') return
      if (e.ctrlKey && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeTab])
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const headerBg = isDark ? '#0f2a33' : '#194552'
  const tabActiveBg = isDark ? '#374151' : '#e0f2fe'
  const tabActiveColor = isDark ? '#93c5fd' : '#0369a1'
  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [{ key: 'notes', label: 'Notes', icon: FileText, count: chapter?.notes?.length || 0 }, { key: 'videos', label: 'Videos', icon: Video, count: chapter?.videos?.length || 0 }, { key: 'tests', label: 'MCQ Tests', icon: Brain, count: chapter?.tests?.length || 0 }]
  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>
      <div style={{ backgroundColor: headerBg, padding: '24px 16px', color: '#fff' }}><div style={{ maxWidth: '1100px', margin: '0 auto' }}><Link to={chapter ? `/subjects/${chapter.subjectId}` : '/exams'} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}><ChevronLeft style={{ width: '16px', height: '16px' }} /> {chapter?.subjectName || 'Back'}</Link><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}><div><h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>{chapter?.title || '...'}</h1>{chapter?.examName && <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>{chapter.examName} › {chapter.subjectName}</p>}</div>{chapter?.tests?.length > 0 && <Link to={`/practice/${chapter.id}`} style={{ backgroundColor: '#16a34a', color: '#fff', textDecoration: 'none', borderRadius: '12px', padding: '10px 16px', fontWeight: '700', fontSize: '14px' }}>Practice</Link>}</div></div></div>
      <div style={{ borderBottom: `1px solid ${border}`, backgroundColor: cardBg }}><div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '4px', padding: '0 16px' }}>{tabs.map(tab => <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '14px 20px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: activeTab === tab.key ? tabActiveBg : 'transparent', color: activeTab === tab.key ? tabActiveColor : muted, borderBottom: activeTab === tab.key ? '2px solid #0369a1' : '2px solid transparent' }}><tab.icon style={{ width: '15px', height: '15px' }} />{tab.label}{tab.count > 0 && <span style={{ backgroundColor: isDark ? '#4b5563' : '#e5e7eb', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>{tab.count}</span>}</button>)}</div></div>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        {isLoading ? <div style={{ display: 'grid', gap: '12px' }}>{[...Array(4)].map((_, i) => <div key={i} style={{ height: '80px', backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${border}` }} />)}</div> : <div onContextMenu={e => e.preventDefault()} style={{ userSelect: 'none' }}>{activeTab === 'notes' && <div style={{ display: 'grid', gridTemplateColumns: chapter?.notes?.length > 1 ? '260px 1fr' : '1fr', gap: '20px' }}>{chapter?.notes?.length > 1 && <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{chapter.notes.map((note: any) => <button key={note.id} onClick={() => setSelectedNote(note)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${border}`, backgroundColor: selectedNote?.id === note.id ? (isDark ? '#1d4ed8' : '#dbeafe') : cardBg, color: text, cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><span>{note.fileType === 'pdf' ? '📄' : note.fileType ? '📝' : '📃'}</span>{note.title}</button>)}</div>}{(selectedNote || chapter?.notes?.[0]) ? (() => { const activeNote = selectedNote || chapter.notes[0]; const resolvedUrl = resolveUrl(activeNote.fileUrl); return <div style={{ backgroundColor: cardBg, borderRadius: '14px', border: `1px solid ${border}`, overflow: 'hidden' }}><div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}><h2 style={{ fontSize: '17px', fontWeight: '700', color: text, margin: 0 }}>{activeNote.title}</h2></div>{resolvedUrl ? <PdfViewer noteId={activeNote.id} title={activeNote.title} userLabel={userLabel} /> : <div style={{ padding: '24px', color: text, lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{activeNote.content}</div>}</div> })() : <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No notes available for this chapter.</div>}</div>}{activeTab === 'videos' && <div style={{ display: 'grid', gap: '16px' }}>{chapter?.videos?.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No video lectures yet.</div>}{chapter?.videos?.map((video: any) => { const ytId = video.youtubeId || extractYoutubeId(video.youtubeUrl); return <div key={video.id} style={{ backgroundColor: cardBg, borderRadius: '14px', border: `1px solid ${border}`, overflow: 'hidden' }}>{ytId ? <><div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}><iframe src={`https://www.youtube.com/embed/${ytId}`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} /></div><div style={{ padding: '12px 16px' }}><h3 style={{ fontSize: '14px', fontWeight: '600', color: text }}>{video.title}</h3></div></> : <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: isDark ? '#374151' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play style={{ width: '20px', height: '20px', color: '#dc2626' }} /></div><h3 style={{ fontSize: '15px', fontWeight: '600', color: text }}>{video.title}</h3></div>}</div> })}</div>}{activeTab === 'tests' && <div style={{ display: 'grid', gap: '12px' }}>{chapter?.tests?.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No MCQ tests yet.</div>}{chapter?.tests?.map((test: any) => <div key={test.id} style={{ backgroundColor: cardBg, borderRadius: '14px', border: `1px solid ${border}`, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}><div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: isDark ? '#374151' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🧠</div><div style={{ flex: 1 }}><h3 style={{ fontSize: '15px', fontWeight: '600', color: text, marginBottom: '4px' }}>{test.title}</h3><p style={{ fontSize: '13px', color: muted }}>{test.questionCount || test.totalQuestions} Questions · {test.timeLimitMinutes || test.durationMinutes || 15} min</p></div><div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}><Link to={`/practice/${chapter.id}`} style={{ backgroundColor: '#16a34a', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Practice</Link><Link to={`/mcq-tests/${test.id}`} style={{ backgroundColor: '#194552', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Start Test</Link></div></div>)}</div>}</div>}
      </div>
    </div>
  )
}
