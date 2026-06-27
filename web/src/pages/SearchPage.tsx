import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { searchApi } from '../api/services'
import { useTheme } from '../context/ThemeContext'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const initialQuery = searchParams.get('q') || ''
  const [query, setQuery] = useState(initialQuery)
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  useEffect(() => { setQuery(initialQuery) }, [initialQuery])
  const { data, isLoading } = useQuery(['global-search', initialQuery], () => searchApi.search(initialQuery), { enabled: initialQuery.trim().length > 0, select: res => res.data })
  const handleSearch = () => {
    const trimmed = query.trim()
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search')
  }
  const sections = [
    { key: 'exams', title: 'Exams', link: (item: any) => `/exams/${item.id}` },
    { key: 'subjects', title: 'Subjects', link: (item: any) => `/subjects/${item.id}` },
    { key: 'chapters', title: 'Chapters', link: (item: any) => `/exam-chapters/${item.id}` },
  ] as const
  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}><h1 style={{ fontSize: '28px', fontWeight: 800, color: text, marginBottom: '8px' }}>Search</h1><p style={{ color: muted }}>Find exams, subjects, chapters, and note-backed topics from one place.</p></div>
        <div style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '18px', padding: '14px', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '26px' }}><Search style={{ width: '18px', height: '18px', color: muted, flexShrink: 0 }} /><input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search exams, subjects, chapters..." style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', color: text, fontSize: '15px' }} /><button onClick={handleSearch} style={{ backgroundColor: '#194552', color: '#fff', border: 'none', borderRadius: '12px', padding: '10px 18px', fontWeight: 700, cursor: 'pointer' }}>Search</button></div>
        {!initialQuery && <div style={{ textAlign: 'center', padding: '64px 20px', color: muted, backgroundColor: cardBg, border: `1px dashed ${border}`, borderRadius: '18px' }}>Start typing to search across exams, subjects, and chapters.</div>}
        {initialQuery && <div style={{ display: 'grid', gap: '24px' }}>{sections.map(section => { const items = data?.[section.key] || []; return <div key={section.key} style={{ backgroundColor: cardBg, border: `1px solid ${border}`, borderRadius: '18px', padding: '20px' }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}><h2 style={{ fontSize: '18px', fontWeight: 700, color: text }}>{section.title}</h2><span style={{ color: muted, fontSize: '13px' }}>{items.length} results</span></div>{isLoading ? <div style={{ color: muted }}>Searching…</div> : items.length > 0 ? <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>{items.map((item: any) => <Link key={`${section.key}-${item.id}`} to={section.link(item)} style={{ textDecoration: 'none' }}><div style={{ border: `1px solid ${border}`, borderRadius: '14px', padding: '16px', backgroundColor: isDark ? '#111827' : '#ffffff', height: '100%' }}><div style={{ fontSize: '16px', fontWeight: 700, color: text, marginBottom: '6px' }}>{item.name || item.title}</div><div style={{ fontSize: '13px', color: muted, lineHeight: 1.5 }}>{item.description || item.examName || item.subjectName || 'Open details'}</div>{item.examName && <div style={{ fontSize: '12px', color: '#16a34a', marginTop: '10px' }}>Exam: {item.examName}</div>}{item.subjectName && <div style={{ fontSize: '12px', color: '#2563eb', marginTop: '6px' }}>Subject: {item.subjectName}</div>}{item.matchedNoteTitle && <div style={{ fontSize: '12px', color: '#f59e0b', marginTop: '6px' }}>Matched note: {item.matchedNoteTitle}</div>}</div></Link>)}</div> : <div style={{ color: muted, padding: '12px 0' }}>No {section.title.toLowerCase()} found for “{initialQuery}”.</div>}</div> })}</div>}
      </div>
    </div>
  )
}
