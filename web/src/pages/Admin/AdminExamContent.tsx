import { useState, useEffect } from 'react'
import { ChevronRight, Plus, Loader2, Trash2, Video, FileText, Brain, RefreshCw, Upload } from 'lucide-react'
import { examApi } from '../../api/services'
import apiClient from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'

interface Exam { id: number; name: string; icon: string; description: string }
interface Subject { id: number; name: string; description: string; icon: string; chapterCount: number }
interface Chapter { id: number; title: string; notesCount: number; videosCount: number; testsCount: number }
interface Note { id: number; title: string; content: string }
interface VideoItem { id: number; title: string; youtubeUrl: string }

function Modal({
  title, onClose, children, cardBg, border, text, muted,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  cardBg: string
  border: string
  text: string
  muted: string
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: cardBg, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px', maxHeight: '80vh', overflowY: 'auto', border: `1px solid ${border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: text }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: muted }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children, muted }: { label: string; children: React.ReactNode; muted: string }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: muted, marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  )
}

export default function AdminExamContent() {
  const { isDark } = useTheme()
  const [exams, setExams] = useState<Exam[]>([])
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [showAddChapter, setShowAddChapter] = useState(false)
  const [showAddNote, setShowAddNote] = useState(false)
  const [showAddVideo, setShowAddVideo] = useState(false)
  const [showGenMcq, setShowGenMcq] = useState(false)
  const [genMcqNote, setGenMcqNote] = useState<Note | null>(null)
  const [showCsvMcq, setShowCsvMcq] = useState(false)
  const [showDocUpload, setShowDocUpload] = useState(false)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [showAddExam, setShowAddExam] = useState(false)
  const [examForm, setExamForm] = useState({ name: '', description: '', icon: '', slug: '' })
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvTestTitle, setCsvTestTitle] = useState('')
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '', icon: '📝' })
  const [chapterForm, setChapterForm] = useState({ title: '', description: '' })
  const [noteForm, setNoteForm] = useState({ title: '', content: '' })
  const [videoForm, setVideoForm] = useState({ title: '', youtubeUrl: '' })
  const [mcqCount, setMcqCount] = useState(10)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const inputBg = isDark ? '#374151' : '#ffffff'

  useEffect(() => {
    examApi.getAll().then(r => setExams(r.data)).catch(console.error)
  }, [])

  const loadSubjects = (exam: Exam) => {
    setSelectedExam(exam); setSelectedSubject(null); setChapters([]); setSelectedChapter(null); setNotes([]); setVideos([])
    setLoading(true)
    examApi.getById(exam.id).then(r => setSubjects(r.data.subjects || [])).finally(() => setLoading(false))
  }

  const loadChapters = (subject: Subject) => {
    setSelectedSubject(subject); setSelectedChapter(null); setNotes([]); setVideos([])
    setLoading(true)
    examApi.getSubject(subject.id).then(r => setChapters(r.data.chapters || [])).finally(() => setLoading(false))
  }

  const loadChapterContent = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setLoading(true)
    examApi.getChapter(chapter.id).then(r => {
      setNotes(r.data.notes || [])
      setVideos(r.data.videos || [])
    }).finally(() => setLoading(false))
  }

  const flash = (type: 'ok' | 'err', text: string) => {
    setMsg({ type, text })
    setTimeout(() => setMsg(null), 3000)
  }

  const handleAddSubject = async () => {
    if (!selectedExam) return
    setSaving(true)
    try {
      await examApi.createSubject(selectedExam.id, subjectForm)
      flash('ok', 'Subject added!')
      setShowAddSubject(false)
      setSubjectForm({ name: '', description: '', icon: '📝' })
      loadSubjects(selectedExam)
    } catch { flash('err', 'Failed to add subject') } finally { setSaving(false) }
  }

  const handleAddChapter = async () => {
    if (!selectedSubject) return
    setSaving(true)
    try {
      await examApi.createChapter(selectedSubject.id, chapterForm)
      flash('ok', 'Chapter added!')
      setShowAddChapter(false)
      setChapterForm({ title: '', description: '' })
      loadChapters(selectedSubject)
    } catch { flash('err', 'Failed to add chapter') } finally { setSaving(false) }
  }

  const handleAddNote = async () => {
    if (!selectedChapter) return
    setSaving(true)
    try {
      await examApi.createNotes(selectedChapter.id, noteForm)
      flash('ok', 'Notes added!')
      setShowAddNote(false)
      setNoteForm({ title: '', content: '' })
      loadChapterContent(selectedChapter)
    } catch { flash('err', 'Failed to add notes') } finally { setSaving(false) }
  }

  const handleAddVideo = async () => {
    if (!selectedChapter) return
    setSaving(true)
    try {
      await examApi.createVideo(selectedChapter.id, videoForm)
      flash('ok', 'Video link added!')
      setShowAddVideo(false)
      setVideoForm({ title: '', youtubeUrl: '' })
      loadChapterContent(selectedChapter)
    } catch { flash('err', 'Failed to add video') } finally { setSaving(false) }
  }

  const handleGenerateMcq = async () => {
    if (!genMcqNote || !selectedChapter) return
    setSaving(true)
    try {
      await examApi.generateMcq(genMcqNote.id, selectedChapter.id, mcqCount)
      flash('ok', `MCQ test generated with ${mcqCount} questions!`)
      setShowGenMcq(false)
      loadChapterContent(selectedChapter)
    } catch { flash('err', 'Failed to generate MCQ — check AI API key') } finally { setSaving(false) }
  }

  const handleCsvMcqUpload = async () => {
    if (!csvFile || !selectedChapter) return
    setSaving(true)
    try {
      const form = new FormData()
      form.append('file', csvFile)
      if (csvTestTitle) form.append('testTitle', csvTestTitle)
      await apiClient.post(`/admin/chapters/${selectedChapter.id}/mcq/upload-csv`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      flash('ok', 'MCQ questions imported from CSV!')
      setShowCsvMcq(false); setCsvFile(null); setCsvTestTitle('')
      loadChapterContent(selectedChapter)
    } catch (e: any) { flash('err', e?.response?.data?.message || 'CSV upload failed') } finally { setSaving(false) }
  }

  const handleAddExam = async () => {
    if (!examForm.name.trim()) return
    setSaving(true)
    try {
      const slug = examForm.slug.trim() || examForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      await apiClient.post('/admin/exams', { ...examForm, slug })
      flash('ok', 'Exam created!')
      setShowAddExam(false)
      setExamForm({ name: '', description: '', icon: '', slug: '' })
      examApi.getAll().then(r => setExams(r.data)).catch(console.error)
    } catch (e: any) { flash('err', e?.response?.data?.message || 'Failed to create exam') } finally { setSaving(false) }
  }

  const handleDocExamInfoUpload = async () => {
    if (!docFile || !selectedExam) return
    setSaving(true)
    try {
      const form = new FormData()
      form.append('file', docFile)
      await apiClient.post(`/admin/exams/${selectedExam.id}/sections/upload-doc`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      flash('ok', 'Document uploaded! Exam info updated.')
      setShowDocUpload(false); setDocFile(null)
    } catch (e: any) { flash('err', e?.response?.data?.message || 'Upload failed') } finally { setSaving(false) }
  }

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Delete this note?')) return
    await examApi.deleteNotes(noteId)
    loadChapterContent(selectedChapter!)
  }

  const handleDeleteVideo = async (videoId: number) => {
    if (!confirm('Delete this video?')) return
    await examApi.deleteVideo(videoId)
    loadChapterContent(selectedChapter!)
  }

  // Section management state
  const [adminTab, setAdminTab] = useState<'content' | 'sections'>('content')
  const [sections, setSections] = useState<any[]>([])
  const [showAddSection, setShowAddSection] = useState(false)
  const [editSection, setEditSection] = useState<any | null>(null)
  const [sectionForm, setSectionForm] = useState({
    title: '', description: '', sectionType: 'OVERVIEW',
    tableHeaders: '', tableRows: '',
  })
  // Dynamic table builder
  const [tableHeaders, setTableHeaders] = useState<string[]>(['Particulars', 'Details'])
  const [tableRows, setTableRows] = useState<string[][]>([['', '']])

  // File upload state for notes
  const [noteUploadType, setNoteUploadType] = useState<'text' | 'file'>('file')
  const [noteFile, setNoteFile] = useState<File | null>(null)
  const [noteFileTitle, setNoteFileTitle] = useState('')

  const loadSections = (exam: Exam) => {
    examApi.getSections(exam.id).then(r => setSections(r.data || [])).catch(console.error)
  }

  const handleAddSection = async () => {
    if (!selectedExam) return
    setSaving(true)
    try {
      const data = {
        ...sectionForm,
        tableHeaders: tableHeaders.filter(h => h.trim()) ? JSON.stringify(tableHeaders.filter(h => h.trim())) : null,
        tableRows: tableRows.length ? JSON.stringify(tableRows.filter(r => r.some(c => c.trim()))) : null,
      }
      if (editSection) {
        await examApi.updateSection(editSection.id, data)
        flash('ok', 'Section updated!')
      } else {
        await examApi.createSection(selectedExam.id, data)
        flash('ok', 'Section added!')
      }
      setShowAddSection(false); setEditSection(null)
      setSectionForm({ title: '', description: '', sectionType: 'OVERVIEW', tableHeaders: '', tableRows: '' })
      setTableHeaders(['Particulars', 'Details']); setTableRows([['', '']])
      loadSections(selectedExam)
    } catch { flash('err', 'Failed to save section') } finally { setSaving(false) }
  }

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Delete this section?')) return
    await examApi.deleteSection(sectionId)
    loadSections(selectedExam!)
  }

  const openEditSection = (section: any) => {
    setEditSection(section)
    setSectionForm({ title: section.title, description: section.description || '', sectionType: section.sectionType, tableHeaders: '', tableRows: '' })
    try { setTableHeaders(JSON.parse(section.tableHeaders || '["Particulars","Details"]')) } catch { setTableHeaders(['Particulars', 'Details']) }
    try { setTableRows(JSON.parse(section.tableRows || '[["",""]]')) } catch { setTableRows([['', '']]) }
    setShowAddSection(true)
  }

  const handleUploadNotesFile = async () => {
    if (!selectedChapter || !noteFile || !noteFileTitle.trim()) return
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('file', noteFile)
      fd.append('title', noteFileTitle)
      await examApi.uploadNotesFile(selectedChapter.id, fd)
      flash('ok', 'Notes file uploaded!')
      setShowAddNote(false); setNoteFile(null); setNoteFileTitle('')
      loadChapterContent(selectedChapter)
    } catch { flash('err', 'Failed to upload file') } finally { setSaving(false) }
  }

  // load sections when exam is selected
  const loadSubjectsAndSections = (exam: Exam) => {
    loadSubjects(exam)
    loadSections(exam)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: `1px solid ${border}`,
    fontSize: '14px',
    color: text,
    boxSizing: 'border-box',
    backgroundColor: inputBg,
  }

  const btnPrimary: React.CSSProperties = {
    backgroundColor: '#194552',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '9px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  }

  const btnSm: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '7px',
    border: `1px solid ${border}`,
    backgroundColor: inputBg,
    cursor: 'pointer',
    fontSize: '13px',
    color: text,
  }

  const colStyle: React.CSSProperties = {
    flex: 1,
    minWidth: '200px',
    backgroundColor: cardBg,
    borderRadius: '14px',
    border: `1px solid ${border}`,
    overflow: 'hidden',
  }

  const colHeader: React.CSSProperties = {
    padding: '14px 16px',
    borderBottom: `1px solid ${border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: isDark ? '#374151' : '#f9fafb',
  }

  const itemRow: React.CSSProperties = {
    padding: '11px 16px',
    borderBottom: `1px solid ${border}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: text,
  }

  return (
    <div style={{ backgroundColor: bg, color: text }}>
      {msg && (
        <div style={{
          position: 'fixed', top: '80px', right: '20px', zIndex: 999,
          padding: '12px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
          backgroundColor: msg.type === 'ok' ? '#dcfce7' : '#fee2e2',
          color: msg.type === 'ok' ? '#166534' : '#991b1b',
          border: `1px solid ${msg.type === 'ok' ? '#86efac' : '#fca5a5'}`,
        }}>
          {msg.type === 'ok' ? '✓ ' : '✗ '}{msg.text}
        </div>
      )}

      <p style={{ color: muted, fontSize: '14px', marginBottom: '16px' }}>
        Select an exam → manage subjects/chapters/notes/videos OR add exam info sections (overview, dates, eligibility etc.)
      </p>

      {/* Admin sub-tabs */}
      {selectedExam && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {([['content', '📚 Subjects & Content'], ['sections', '📋 Exam Info Sections']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setAdminTab(key)} style={{
              padding: '8px 18px', borderRadius: '8px', border: `1px solid ${border}`, cursor: 'pointer',
              fontWeight: '600', fontSize: '13px',
              backgroundColor: adminTab === key ? '#194552' : inputBg,
              color: adminTab === key ? '#fff' : text,
            }}>{label}</button>
          ))}
        </div>
      )}


      {(!selectedExam || adminTab === 'content') && (
      <>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={colStyle}>
          <div style={colHeader}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: text }}>📚 Exams</span>
            <button style={btnSm} onClick={() => { setExamForm({ name: '', description: '', icon: '', slug: '' }); setShowAddExam(true) }}>
              <Plus style={{ width: '13px', height: '13px' }} /> Add
            </button>
          </div>
          {exams.map(exam => (
            <div
              key={exam.id}
              onClick={() => loadSubjectsAndSections(exam)}
              style={{ ...itemRow, backgroundColor: selectedExam?.id === exam.id ? (isDark ? '#374151' : '#e0f2fe') : 'transparent' }}
            >
              <img src={exam.icon} alt={exam.name} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              <span style={{ flex: 1, fontWeight: selectedExam?.id === exam.id ? '600' : '400' }}>{exam.name}</span>
              {selectedExam?.id === exam.id && <ChevronRight style={{ width: '14px', height: '14px', color: '#0369a1' }} />}
            </div>
          ))}
        </div>

        {selectedExam && (
          <div style={colStyle}>
            <div style={colHeader}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: text }}>📖 Subjects</span>
              <button style={btnSm} onClick={() => setShowAddSubject(true)}>
                <Plus style={{ width: '13px', height: '13px' }} /> Add
              </button>
            </div>
            {loading && !selectedSubject && (
              <div style={{ padding: '20px', textAlign: 'center' }}><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', margin: '0 auto', color: muted }} /></div>
            )}
            {subjects.map(sub => (
              <div
                key={sub.id}
                onClick={() => loadChapters(sub)}
                style={{ ...itemRow, backgroundColor: selectedSubject?.id === sub.id ? (isDark ? '#374151' : '#e0f2fe') : 'transparent' }}
              >
                <span>{sub.icon || '📝'}</span>
                <span style={{ flex: 1, fontWeight: selectedSubject?.id === sub.id ? '600' : '400' }}>{sub.name}</span>
                {selectedSubject?.id === sub.id && <ChevronRight style={{ width: '14px', height: '14px', color: '#0369a1' }} />}
              </div>
            ))}
            {!loading && subjects.length === 0 && <p style={{ padding: '16px', fontSize: '13px', color: muted }}>No subjects yet. Add one!</p>}
          </div>
        )}

        {selectedSubject && (
          <div style={colStyle}>
            <div style={colHeader}>
              <span style={{ fontWeight: '700', fontSize: '14px', color: text }}>📑 Chapters</span>
              <button style={btnSm} onClick={() => setShowAddChapter(true)}>
                <Plus style={{ width: '13px', height: '13px' }} /> Add
              </button>
            </div>
            {loading && !selectedChapter && (
              <div style={{ padding: '20px', textAlign: 'center' }}><Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite', margin: '0 auto', color: muted }} /></div>
            )}
            {chapters.map((ch, idx) => (
              <div
                key={ch.id}
                onClick={() => loadChapterContent(ch)}
                style={{ ...itemRow, backgroundColor: selectedChapter?.id === ch.id ? (isDark ? '#374151' : '#e0f2fe') : 'transparent' }}
              >
                <span style={{ fontWeight: '700', fontSize: '12px', color: '#16a34a', minWidth: '22px' }}>{String(idx + 1).padStart(2, '0')}</span>
                <span style={{ flex: 1, fontWeight: selectedChapter?.id === ch.id ? '600' : '400' }}>{ch.title}</span>
                {selectedChapter?.id === ch.id && <ChevronRight style={{ width: '14px', height: '14px', color: '#0369a1' }} />}
              </div>
            ))}
            {!loading && chapters.length === 0 && <p style={{ padding: '16px', fontSize: '13px', color: muted }}>No chapters yet. Add one!</p>}
          </div>
        )}
      </div>

      {selectedChapter && (
        <div style={{ marginTop: '20px', backgroundColor: cardBg, borderRadius: '14px', border: `1px solid ${border}` }}>
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, backgroundColor: isDark ? '#374151' : '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: '700', fontSize: '15px', color: text }}>
              ✏️ {selectedChapter.title}
            </span>
            <button style={{ ...btnSm, color: muted }} onClick={() => loadChapterContent(selectedChapter)}>
              <RefreshCw style={{ width: '13px', height: '13px' }} /> Refresh
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', borderBottom: `1px solid ${border}` }}>
            <div style={{ padding: '16px 20px', borderRight: `1px solid ${border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '14px', color: text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileText style={{ width: '15px', height: '15px', color: '#0369a1' }} /> Notes ({notes.length})
                </span>
                <button style={btnSm} onClick={() => setShowAddNote(true)}>
                  <Plus style={{ width: '13px', height: '13px' }} /> Add
                </button>
              </div>
              {notes.map(note => (
                <div key={note.id} style={{ padding: '10px 12px', backgroundColor: isDark ? '#374151' : '#f0f9ff', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '10px', border: `1px solid ${border}` }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '13px', color: text, marginBottom: '2px' }}>{note.title}</p>
                    <p style={{ fontSize: '12px', color: muted, lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {note.content?.substring(0, 100)}...
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button title="Generate MCQ from this note" onClick={() => { setGenMcqNote(note); setShowGenMcq(true) }}
                      style={{ padding: '5px', border: `1px solid ${border}`, borderRadius: '6px', backgroundColor: cardBg, cursor: 'pointer', color: '#7c3aed' }}>
                      <Brain style={{ width: '13px', height: '13px' }} />
                    </button>
                    <button onClick={() => handleDeleteNote(note.id)}
                      style={{ padding: '5px', border: '1px solid #fca5a5', borderRadius: '6px', backgroundColor: cardBg, cursor: 'pointer', color: '#dc2626' }}>
                      <Trash2 style={{ width: '13px', height: '13px' }} />
                    </button>
                  </div>
                </div>
              ))}
              {notes.length === 0 && <p style={{ fontSize: '13px', color: muted }}>No notes yet.</p>}
            </div>

            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '14px', color: text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Video style={{ width: '15px', height: '15px', color: '#dc2626' }} /> Videos ({videos.length})
                </span>
                <button style={btnSm} onClick={() => setShowAddVideo(true)}>
                  <Plus style={{ width: '13px', height: '13px' }} /> Add Link
                </button>
              </div>

              {videos.map(vid => (
                <div key={vid.id} style={{ padding: '10px 12px', backgroundColor: isDark ? '#374151' : '#fff7f7', borderRadius: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${border}` }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: '600', fontSize: '13px', color: text, marginBottom: '2px' }}>{vid.title}</p>
                    <a href={vid.youtubeUrl} target="_blank" rel="noreferrer"
                      style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}
                      onClick={e => e.stopPropagation()}>
                      {vid.youtubeUrl.substring(0, 45)}...
                    </a>
                  </div>
                  <button onClick={() => handleDeleteVideo(vid.id)}
                    style={{ padding: '5px', border: '1px solid #fca5a5', borderRadius: '6px', backgroundColor: cardBg, cursor: 'pointer', color: '#dc2626' }}>
                    <Trash2 style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              ))}
              {videos.length === 0 && <p style={{ fontSize: '13px', color: muted }}>No videos yet.</p>}
            </div>
          </div>
          {/* CSV MCQ Upload bar */}
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${border}`, backgroundColor: isDark ? '#1a2e3a' : '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: muted }}>📄 Bulk import MCQ questions from CSV</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ ...btnSm, backgroundColor: '#0369a1', color: '#fff', border: 'none' }}
                onClick={() => { const a = document.createElement('a'); a.href = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'}/admin/mcq/template`; a.download = 'mcq_template.csv'; a.click() }}>
                ⬇ Download Template
              </button>
              <button style={{ ...btnSm, backgroundColor: '#7c3aed', color: '#fff', border: 'none' }}
                onClick={() => { setCsvFile(null); setCsvTestTitle(''); setShowCsvMcq(true) }}>
                <Upload style={{ width: '13px', height: '13px' }} /> Upload MCQ CSV
              </button>
            </div>
          </div>
        </div>
      )}
      </> )} {/* end adminTab content */}

      {/* === Exam Info Sections Panel === */}
      {selectedExam && adminTab === 'sections' && (
        <div style={{ backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${border}`, overflow: 'hidden' }}>
          <div style={{ ...colHeader, padding: '16px 20px' }}>
            <span style={{ fontWeight: '700', fontSize: '15px', color: text }}>📋 Exam Info Sections — {selectedExam.name}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ ...btnSm, backgroundColor: '#7c3aed', color: '#fff', border: 'none' }}
                onClick={() => { setDocFile(null); setShowDocUpload(true) }}>
                <Upload style={{ width: '13px', height: '13px' }} /> Upload Doc
              </button>
              <button style={btnSm} onClick={() => { setEditSection(null); setSectionForm({ title: '', description: '', sectionType: 'OVERVIEW', tableHeaders: '', tableRows: '' }); setTableHeaders(['Particulars', 'Details']); setTableRows([['', '']]); setShowAddSection(true) }}>
                <Plus style={{ width: '13px', height: '13px' }} /> Add Section
              </button>
            </div>
          </div>
          <p style={{ padding: '0 20px 12px', fontSize: '13px', color: muted }}>
            Sections appear on the exam detail page — Overview, Important Dates, Eligibility, Syllabus, etc.
          </p>
          {sections.length === 0 && <p style={{ padding: '16px 20px', color: muted, fontSize: '14px' }}>No sections yet. Click "Add Section" to get started.</p>}
          {sections.map((sec: any) => (
            <div key={sec.id} style={{ borderTop: `1px solid ${border}`, padding: '14px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: text }}>{sec.title}</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: isDark ? '#374151' : '#f1f5f9', color: muted }}>{sec.sectionType}</span>
                </div>
                {sec.description && <p style={{ fontSize: '13px', color: muted, marginBottom: '4px' }}>{sec.description.substring(0, 100)}{sec.description.length > 100 ? '...' : ''}</p>}
                {sec.tableHeaders && <p style={{ fontSize: '12px', color: muted }}>📊 Table with {(() => { try { return JSON.parse(sec.tableHeaders).length } catch { return '?' } })()} columns</p>}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => openEditSection(sec)} style={{ padding: '6px 12px', border: `1px solid ${border}`, borderRadius: '7px', backgroundColor: inputBg, cursor: 'pointer', fontSize: '12px', color: text }}>✏️ Edit</button>
                <button onClick={() => handleDeleteSection(sec.id)} style={{ padding: '6px 10px', border: '1px solid #fca5a5', borderRadius: '7px', backgroundColor: cardBg, cursor: 'pointer', color: '#dc2626' }}>
                  <Trash2 style={{ width: '13px', height: '13px' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* === Add / Edit Section Modal === */}
      {showAddSection && (
        <Modal title={editSection ? `Edit Section: ${editSection.title}` : `Add Section to ${selectedExam?.name}`} onClose={() => { setShowAddSection(false); setEditSection(null) }} cardBg={cardBg} border={border} text={text} muted={muted}>
          <Field label="Title *" muted={muted}>
            <input style={inputStyle} value={sectionForm.title} onChange={e => setSectionForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Overview, Important Dates, Eligibility..." />
          </Field>
          <Field label="Section Type" muted={muted}>
            <select style={inputStyle} value={sectionForm.sectionType} onChange={e => setSectionForm(p => ({ ...p, sectionType: e.target.value }))}>
              {['OVERVIEW', 'DATES', 'ELIGIBILITY', 'SYLLABUS', 'APPLICATION', 'RESERVATIONS', 'CUSTOM'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Description / Intro text" muted={muted}>
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={sectionForm.description} onChange={e => setSectionForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional paragraph text shown above the table..." />
          </Field>

          {/* Dynamic table builder */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: muted }}>Table (optional)</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={{ ...btnSm, fontSize: '12px' }} onClick={() => setTableHeaders(h => [...h, ''])}>+ Column</button>
                <button style={{ ...btnSm, fontSize: '12px' }} onClick={() => setTableRows(r => [...r, tableHeaders.map(() => '')])}>+ Row</button>
              </div>
            </div>
            {/* Header row */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
              {tableHeaders.map((h, i) => (
                <div key={i} style={{ display: 'flex', flex: 1, gap: '4px', alignItems: 'center' }}>
                  <input style={{ ...inputStyle, fontWeight: '600', fontSize: '12px' }} value={h} onChange={e => setTableHeaders(hs => hs.map((v, j) => j === i ? e.target.value : v))} placeholder={`Header ${i + 1}`} />
                  {tableHeaders.length > 1 && (
                    <button onClick={() => { setTableHeaders(hs => hs.filter((_, j) => j !== i)); setTableRows(rs => rs.map(r => r.filter((_, j) => j !== i))) }}
                      style={{ padding: '4px 6px', border: '1px solid #fca5a5', borderRadius: '5px', cursor: 'pointer', backgroundColor: cardBg, color: '#dc2626', fontSize: '12px' }}>✕</button>
                  )}
                </div>
              ))}
            </div>
            {/* Data rows */}
            {tableRows.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', gap: '6px', marginBottom: '4px', alignItems: 'center' }}>
                {tableHeaders.map((_, ci) => (
                  <input key={ci} style={{ ...inputStyle, flex: 1, fontSize: '12px' }}
                    value={row[ci] || ''}
                    onChange={e => setTableRows(rs => rs.map((r, rj) => rj === ri ? r.map((c, cj) => cj === ci ? e.target.value : c) : r))}
                    placeholder={`Row ${ri + 1}, Col ${ci + 1}`} />
                ))}
                <button onClick={() => setTableRows(rs => rs.filter((_, j) => j !== ri))}
                  style={{ padding: '4px 8px', border: '1px solid #fca5a5', borderRadius: '5px', cursor: 'pointer', backgroundColor: cardBg, color: '#dc2626', fontSize: '12px' }}>✕</button>
              </div>
            ))}
          </div>

          <button style={btnPrimary} onClick={handleAddSection} disabled={!sectionForm.title || saving}>
            {saving ? 'Saving...' : editSection ? '💾 Update Section' : '+ Add Section'}
          </button>
        </Modal>
      )}
      {showAddSubject && (
        <Modal title={`Add Subject to ${selectedExam?.name}`} onClose={() => setShowAddSubject(false)} cardBg={cardBg} border={border} text={text} muted={muted}>
          <Field label="Subject Name *" muted={muted}>
            <input style={inputStyle} value={subjectForm.name} onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. History, Geography, Polity" />
          </Field>
          <Field label="Description" muted={muted}>
            <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={subjectForm.description} onChange={e => setSubjectForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description..." />
          </Field>
          <Field label="Icon (emoji)" muted={muted}>
            <input style={{ ...inputStyle, width: '80px' }} value={subjectForm.icon} onChange={e => setSubjectForm(p => ({ ...p, icon: e.target.value }))} />
          </Field>
          <button style={btnPrimary} onClick={handleAddSubject} disabled={!subjectForm.name || saving}>
            {saving ? 'Saving...' : '+ Add Subject'}
          </button>
        </Modal>
      )}

      {showAddChapter && (
        <Modal title={`Add Chapter to ${selectedSubject?.name}`} onClose={() => setShowAddChapter(false)} cardBg={cardBg} border={border} text={text} muted={muted}>
          <Field label="Chapter Title *" muted={muted}>
            <input style={inputStyle} value={chapterForm.title} onChange={e => setChapterForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. The Mughal Empire, Chapter 3..." />
          </Field>
          <Field label="Description" muted={muted}>
            <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={chapterForm.description} onChange={e => setChapterForm(p => ({ ...p, description: e.target.value }))} placeholder="Optional description..." />
          </Field>
          <button style={btnPrimary} onClick={handleAddChapter} disabled={!chapterForm.title || saving}>
            {saving ? 'Saving...' : '+ Add Chapter'}
          </button>
        </Modal>
      )}

      {showAddNote && (
        <Modal title={`Add Notes to "${selectedChapter?.title}"`} onClose={() => setShowAddNote(false)} cardBg={cardBg} border={border} text={text} muted={muted}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {(['file', 'text'] as const).map(t => (
              <button key={t} onClick={() => setNoteUploadType(t)} style={{
                padding: '7px 16px', borderRadius: '8px', border: `1px solid ${border}`,
                cursor: 'pointer', fontWeight: '600', fontSize: '13px',
                backgroundColor: noteUploadType === t ? '#194552' : inputBg,
                color: noteUploadType === t ? '#fff' : text,
              }}>{t === 'file' ? '📎 Upload PDF' : '📝 Plain Text'}</button>
            ))}
          </div>
          {noteUploadType === 'file' ? (
            <>
              <Field label="Title *" muted={muted}>
                <input style={inputStyle} value={noteFileTitle} onChange={e => setNoteFileTitle(e.target.value)} placeholder="e.g. Chapter 1 Notes PDF" />
              </Field>
              <Field label="File (PDF) *" muted={muted}>
                <input type="file" accept=".pdf,application/pdf" style={{ ...inputStyle, padding: '7px' }}
                  onChange={e => setNoteFile(e.target.files?.[0] || null)} />
              </Field>
              {noteFile && <p style={{ fontSize: '12px', color: muted, marginBottom: '10px' }}>Selected: {noteFile.name} ({(noteFile.size / 1024).toFixed(0)} KB)</p>}
              <button style={btnPrimary} onClick={handleUploadNotesFile} disabled={!noteFileTitle || !noteFile || saving}>
                {saving ? 'Uploading...' : '⬆ Upload Notes'}
              </button>
            </>
          ) : (
            <>
              <Field label="Notes Title *" muted={muted}>
                <input style={inputStyle} value={noteForm.title} onChange={e => setNoteForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Key Points, Overview..." />
              </Field>
              <Field label="Content *" muted={muted}>
                <textarea style={{ ...inputStyle, minHeight: '180px', resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
                  value={noteForm.content} onChange={e => setNoteForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Paste or type your notes here. These notes will be used to auto-generate MCQ tests via AI." />
              </Field>
              <p style={{ fontSize: '12px', color: muted, marginBottom: '14px' }}>💡 After adding notes, click the 🧠 button to auto-generate MCQ questions using AI.</p>
              <button style={btnPrimary} onClick={handleAddNote} disabled={!noteForm.title || !noteForm.content || saving}>
                {saving ? 'Saving...' : '+ Add Notes'}
              </button>
            </>
          )}
        </Modal>
      )}

      {showAddVideo && (
        <Modal title={`Add Video to "${selectedChapter?.title}"`} onClose={() => setShowAddVideo(false)} cardBg={cardBg} border={border} text={text} muted={muted}>
          <Field label="Video Title *" muted={muted}>
            <input style={inputStyle} value={videoForm.title} onChange={e => setVideoForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Introduction to Mughal Empire" />
          </Field>
          <Field label="YouTube URL *" muted={muted}>
            <input style={inputStyle} value={videoForm.youtubeUrl} onChange={e => setVideoForm(p => ({ ...p, youtubeUrl: e.target.value }))} placeholder="https://www.youtube.com/watch?v=..." />
          </Field>
          <p style={{ fontSize: '12px', color: muted, marginBottom: '14px' }}>✅ Supports youtube.com/watch?v=... and youtu.be/... formats.</p>
          <button style={btnPrimary} onClick={handleAddVideo} disabled={!videoForm.title || !videoForm.youtubeUrl || saving}>
            {saving ? 'Saving...' : '+ Add Video Link'}
          </button>
        </Modal>
      )}

      {showGenMcq && genMcqNote && (
        <Modal title="Generate MCQ Test with AI" onClose={() => setShowGenMcq(false)} cardBg={cardBg} border={border} text={text} muted={muted}>
          <div style={{ backgroundColor: isDark ? '#374151' : '#f0fdf4', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: isDark ? '#bbf7d0' : '#166534', border: `1px solid ${border}` }}>
            🧠 AI will read the notes "<strong>{genMcqNote.title}</strong>" and auto-generate MCQ questions for this chapter.
          </div>
          <Field label="Number of Questions" muted={muted}>
            <input type="number" style={{ ...inputStyle, width: '120px' }} min={5} max={50} value={mcqCount} onChange={e => setMcqCount(Number(e.target.value))} />
          </Field>
          <p style={{ fontSize: '12px', color: muted, marginBottom: '14px' }}>Recommended: 10–20 questions. Requires GEMINI_API_KEY set in backend environment.</p>
          <button style={{ ...btnPrimary, backgroundColor: '#7c3aed' }} onClick={handleGenerateMcq} disabled={saving}>
            {saving ? 'Generating...' : '🧠 Generate MCQ Test'}
          </button>
        </Modal>
      )}

      {/* CSV MCQ Upload Modal */}
      {showCsvMcq && selectedChapter && (
        <Modal title="Upload MCQ from CSV" onClose={() => { setShowCsvMcq(false); setCsvFile(null) }} cardBg={cardBg} border={border} text={text} muted={muted}>
          <div style={{ backgroundColor: isDark ? '#374151' : '#eff6ff', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: isDark ? '#bfdbfe' : '#1e40af', border: `1px solid ${border}` }}>
            📄 Upload a CSV with columns: <strong>question, optionA, optionB, optionC, optionD, correctOption, explanation</strong>
          </div>
          <Field label="Test Title (optional)" muted={muted}>
            <input style={inputStyle} value={csvTestTitle} onChange={e => setCsvTestTitle(e.target.value)} placeholder={`MCQ: ${selectedChapter.title}`} />
          </Field>
          <Field label="CSV File" muted={muted}>
            <input type="file" accept=".csv" onChange={e => setCsvFile(e.target.files?.[0] || null)}
              style={{ ...inputStyle, padding: '8px' }} />
          </Field>
          <button style={{ ...btnPrimary, backgroundColor: '#7c3aed' }} onClick={handleCsvMcqUpload} disabled={!csvFile || saving}>
            {saving ? 'Uploading...' : '📤 Import MCQ Questions'}
          </button>
        </Modal>
      )}

      {/* CSV Exam Info Upload Modal */}
      {showDocUpload && selectedExam && (
        <Modal title={`Upload Exam Info Doc — ${selectedExam.name}`} onClose={() => { setShowDocUpload(false); setDocFile(null) }} cardBg={cardBg} border={border} text={text} muted={muted}>
          <div style={{ backgroundColor: isDark ? '#374151' : '#f0fdf4', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: isDark ? '#bbf7d0' : '#166534', border: `1px solid ${isDark ? '#4b5563' : '#bbf7d0'}` }}>
            📄 Upload a <strong>PDF, DOCX or TXT</strong> file. The content will be extracted and displayed exactly as-is on the Exam Info page.
          </div>
          <Field label="Document File" muted={muted}>
            <input type="file" accept=".pdf,.docx,.txt"
              onChange={e => setDocFile(e.target.files?.[0] || null)}
              style={{ ...inputStyle, padding: '8px' }} />
          </Field>
          {docFile && <p style={{ fontSize: '12px', color: muted, marginBottom: '12px' }}>Selected: {docFile.name} ({(docFile.size / 1024).toFixed(1)} KB)</p>}
          <button style={{ ...btnPrimary, backgroundColor: '#7c3aed' }} onClick={handleDocExamInfoUpload} disabled={!docFile || saving}>
            {saving ? <><Loader2 style={{ width: '14px', height: '14px', display: 'inline', marginRight: '6px' }} />Uploading...</> : '📤 Upload Document'}
          </button>
        </Modal>
      )}

      {/* === Add Exam Modal === */}
      {showAddExam && (
        <Modal title="Add New Exam" onClose={() => setShowAddExam(false)} cardBg={cardBg} border={border} text={text} muted={muted}>
          <Field label="Exam Name *" muted={muted}>
            <input style={inputStyle} value={examForm.name} onChange={e => setExamForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. IBPS AFO 2026" />
          </Field>
          <Field label="Description" muted={muted}>
            <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={examForm.description} onChange={e => setExamForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the exam..." />
          </Field>
          <Field label="Icon URL (optional)" muted={muted}>
            <input style={inputStyle} value={examForm.icon} onChange={e => setExamForm(p => ({ ...p, icon: e.target.value }))} placeholder="https://... or leave blank" />
          </Field>
          <Field label="Slug (optional — auto-generated if blank)" muted={muted}>
            <input style={inputStyle} value={examForm.slug} onChange={e => setExamForm(p => ({ ...p, slug: e.target.value }))} placeholder="e.g. ibps-afo-2026" />
          </Field>
          <button style={btnPrimary} onClick={handleAddExam} disabled={!examForm.name.trim() || saving}>
            {saving ? 'Creating...' : '✅ Create Exam'}
          </button>
        </Modal>
      )}
    </div>
  )
}
