import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { examApi } from '../../api/services'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'

interface Question {
  id: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  orderIndex: number
}

interface TestDetail {
  id: number
  title: string
  totalQuestions: number
  timeLimitMinutes: number
  negativeMarking: number
  examId: number
  examName: string
  questions: Question[]
}

type QStatus = 'not-visited' | 'answered' | 'marked' | 'answered-marked' | 'skipped'

const STATUS_COLOR: Record<QStatus, string> = {
  'not-visited': '#6b7280',
  'answered': '#16a34a',
  'marked': '#d97706',
  'answered-marked': '#7c3aed',
  'skipped': '#dc2626',
}

export default function MockTestPage() {
  const { testId } = useParams<{ testId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)

  const [test, setTest] = useState<TestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [status, setStatus] = useState<Record<number, QStatus>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [showSubmit, setShowSubmit] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(true)
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return }
    examApi.getTest(Number(testId))
      .then(r => {
        setTest(r.data)
        setTimeLeft(r.data.timeLimitMinutes * 60)
        const s: Record<number, QStatus> = {}
        r.data.questions.forEach((q: Question) => { s[q.id] = 'not-visited' })
        setStatus(s)
      })
      .catch(() => navigate('/exams'))
      .finally(() => setLoading(false))
  }, [testId, isAuthenticated, navigate])

  // Countdown timer
  useEffect(() => {
    if (!test || timeLeft <= 0) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); handleAutoSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [test])

  const handleAutoSubmit = useCallback(async () => {
    if (!test) return
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    try {
      const res = await examApi.submitAttempt(test.id, answers as Record<number, string>, elapsed)
      navigate(`/mock-tests/${test.id}/result/${res.data.id}`)
    } catch { navigate('/exams') }
  }, [test, answers, navigate])

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  const selectOption = (qId: number, opt: string) => {
    setAnswers(prev => ({ ...prev, [qId]: opt }))
    setStatus(prev => ({
      ...prev,
      [qId]: prev[qId] === 'marked' || prev[qId] === 'answered-marked' ? 'answered-marked' : 'answered',
    }))
  }

  const toggleMark = (qId: number) => {
    setStatus(prev => {
      const cur = prev[qId]
      if (cur === 'answered') return { ...prev, [qId]: 'answered-marked' }
      if (cur === 'answered-marked') return { ...prev, [qId]: 'answered' }
      if (cur === 'marked') return { ...prev, [qId]: 'not-visited' }
      return { ...prev, [qId]: 'marked' }
    })
  }

  const goTo = (idx: number) => {
    if (!test) return
    const curQ = test.questions[currentIdx]
    // Mark current as skipped if not answered and not marked
    if (status[curQ.id] === 'not-visited') {
      setStatus(prev => ({ ...prev, [curQ.id]: 'skipped' }))
    }
    setCurrentIdx(idx)
  }

  const submitTest = async () => {
    if (!test) return
    setSubmitting(true)
    const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000)
    try {
      const res = await examApi.submitAttempt(test.id, answers as Record<number, string>, elapsed)
      navigate(`/mock-tests/${test.id}/result/${res.data.id}`)
    } catch { alert('Failed to submit. Please try again.') }
    finally { setSubmitting(false); setShowSubmit(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#0f172a', color: '#fff' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
        <p>Loading test...</p>
      </div>
    </div>
  )

  if (!test) return null

  const q = test.questions[currentIdx]
  const answered = Object.keys(answers).length
  const marked = Object.values(status).filter(s => s === 'marked' || s === 'answered-marked').length
  const notVisited = Object.values(status).filter(s => s === 'not-visited').length
  const timerColor = timeLeft < 300 ? '#ef4444' : timeLeft < 600 ? '#f59e0b' : '#22c55e'

  const OPTIONS = [
    { key: 'A', value: q.optionA },
    { key: 'B', value: q.optionB },
    { key: 'C', value: q.optionC },
    { key: 'D', value: q.optionD },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0f172a', color: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Header ── */}
      <header style={{ backgroundColor: '#1e3a5f', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: '#93c5fd' }}>{test.examName}</div>
          <div style={{ fontSize: '16px', fontWeight: '700' }}>{test.title}</div>
        </div>
        <div style={{ textAlign: 'center', backgroundColor: '#0f172a', borderRadius: '10px', padding: '8px 20px', minWidth: '100px' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>Time Left</div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: timerColor, letterSpacing: '2px' }}>{formatTime(timeLeft)}</div>
        </div>
        <button
          onClick={() => setShowSubmit(true)}
          style={{ backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
        >
          Submit Test
        </button>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── Question Area ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Question header */}
          <div style={{ backgroundColor: '#1e293b', padding: '12px 24px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ backgroundColor: '#3b82f6', color: '#fff', borderRadius: '6px', padding: '4px 12px', fontSize: '13px', fontWeight: '700' }}>
              Q {currentIdx + 1} / {test.questions.length}
            </span>
            {test.negativeMarking > 0 && (
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                +1 correct · −{test.negativeMarking} wrong
              </span>
            )}
          </div>

          {/* Question text */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>
            <p style={{ fontSize: '17px', lineHeight: '1.7', marginBottom: '28px', color: '#f1f5f9' }}>
              {q.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {OPTIONS.map(opt => {
                const selected = answers[q.id] === opt.key
                return (
                  <button
                    key={opt.key}
                    onClick={() => selectOption(q.id, opt.key)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 18px',
                      borderRadius: '10px', border: selected ? '2px solid #3b82f6' : '2px solid #334155',
                      backgroundColor: selected ? '#1e3a5f' : '#1e293b',
                      cursor: 'pointer', textAlign: 'left', color: '#f1f5f9',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '700', fontSize: '14px',
                      backgroundColor: selected ? '#3b82f6' : '#334155',
                      color: selected ? '#fff' : '#94a3b8',
                    }}>{opt.key}</span>
                    <span style={{ fontSize: '15px', lineHeight: '1.6', paddingTop: '4px' }}>{opt.value}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Navigation bar */}
          <div style={{ backgroundColor: '#1e293b', borderTop: '1px solid #334155', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={() => { if (answers[q.id]) { setAnswers(prev => { const n = { ...prev }; delete n[q.id]; return n }); setStatus(prev => ({ ...prev, [q.id]: 'not-visited' })) } }}
              style={{ backgroundColor: '#374151', color: '#d1d5db', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}
            >Clear</button>
            <button
              onClick={() => toggleMark(q.id)}
              style={{ backgroundColor: status[q.id]?.includes('marked') ? '#d97706' : '#374151', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px' }}
            >{status[q.id]?.includes('marked') ? '🔖 Marked' : '🔖 Mark for Review'}</button>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => goTo(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              style={{ backgroundColor: '#374151', color: '#d1d5db', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentIdx === 0 ? 0.5 : 1, fontSize: '14px' }}
            >← Prev</button>
            <button
              onClick={() => goTo(Math.min(test.questions.length - 1, currentIdx + 1))}
              disabled={currentIdx === test.questions.length - 1}
              style={{ backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: currentIdx === test.questions.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIdx === test.questions.length - 1 ? 0.5 : 1, fontSize: '14px', fontWeight: '600' }}
            >Next →</button>
          </div>
        </div>

        {/* ── Palette Sidebar ── */}
        <div style={{ width: paletteOpen ? '260px' : '40px', backgroundColor: '#1e293b', borderLeft: '1px solid #334155', flexShrink: 0, display: 'flex', flexDirection: 'column', transition: 'width 0.2s' }}>
          <button
            onClick={() => setPaletteOpen(o => !o)}
            style={{ backgroundColor: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '12px', alignSelf: 'flex-end', fontSize: '18px' }}
          >{paletteOpen ? '›' : '‹'}</button>

          {paletteOpen && (
            <>
              {/* Stats */}
              <div style={{ padding: '0 14px 12px', borderBottom: '1px solid #334155' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  {[
                    { label: 'Answered', count: answered, color: '#16a34a' },
                    { label: 'Marked', count: marked, color: '#d97706' },
                    { label: 'Skipped', count: Object.values(status).filter(s => s === 'skipped').length, color: '#dc2626' },
                    { label: 'Not Visited', count: notVisited, color: '#6b7280' },
                  ].map(s => (
                    <div key={s.label} style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: s.color }}>{s.count}</div>
                      <div style={{ color: '#94a3b8' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question grid */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px', fontWeight: '600' }}>QUESTIONS</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {test.questions.map((question, idx) => (
                    <button
                      key={question.id}
                      onClick={() => setCurrentIdx(idx)}
                      style={{
                        width: '38px', height: '38px', borderRadius: '6px', border: idx === currentIdx ? '2px solid #fff' : '2px solid transparent',
                        backgroundColor: STATUS_COLOR[status[question.id] || 'not-visited'],
                        color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                      }}
                    >{idx + 1}</button>
                  ))}
                </div>

                {/* Legend */}
                <div style={{ marginTop: '16px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {Object.entries({ Answered: '#16a34a', Marked: '#d97706', 'Ans+Marked': '#7c3aed', Skipped: '#dc2626', 'Not Visited': '#6b7280' }).map(([label, color]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: color, flexShrink: 0 }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Submit Confirmation Modal ── */}
      {showSubmit && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '100%', border: '1px solid #334155' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Submit Test?</h2>
            <p style={{ color: '#94a3b8', marginBottom: '20px', fontSize: '14px' }}>Once submitted, you cannot change your answers.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'Answered', count: answered, color: '#16a34a' },
                { label: 'Not Answered', count: test.questions.length - answered, color: '#dc2626' },
                { label: 'Marked', count: marked, color: '#d97706' },
                { label: 'Time Left', count: formatTime(timeLeft), color: timerColor },
              ].map(s => (
                <div key={s.label} style={{ backgroundColor: '#0f172a', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.count}</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSubmit(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#374151', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
                Continue Test
              </button>
              <button onClick={submitTest} disabled={submitting} style={{ flex: 1, padding: '12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700' }}>
                {submitting ? 'Submitting...' : '✓ Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
