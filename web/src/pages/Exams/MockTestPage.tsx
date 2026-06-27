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

type QStatus = 'not-visited' | 'answered' | 'marked' | 'answered-marked' | 'visited'

const STATUS: Record<QStatus, { bg: string; border: string; text: string }> = {
  'not-visited': { bg: '#ffffff', border: '#d1d5db', text: '#374151' },
  'visited':     { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },
  'answered':    { bg: '#22c55e', border: '#16a34a', text: '#ffffff' },
  'marked':      { bg: '#f97316', border: '#ea580c', text: '#ffffff' },
  'answered-marked': { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },
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
  const [panelOpen, setPanelOpen] = useState(true)
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

  const goTo = (idx: number) => {
    if (!test) return
    const curQ = test.questions[currentIdx]
    if (status[curQ.id] === 'not-visited') {
      setStatus(prev => ({ ...prev, [curQ.id]: 'visited' }))
    }
    setCurrentIdx(idx)
  }

  const selectOption = (qId: number, opt: string) => {
    setAnswers(prev => ({ ...prev, [qId]: opt }))
    setStatus(prev => {
      const cur = prev[qId]
      return { ...prev, [qId]: cur === 'marked' || cur === 'answered-marked' ? 'answered-marked' : 'answered' }
    })
  }

  const clearAnswer = (qId: number) => {
    setAnswers(prev => { const n = { ...prev }; delete n[qId]; return n })
    setStatus(prev => ({ ...prev, [qId]: 'visited' }))
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ textAlign: 'center', color: '#374151' }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
        <p style={{ fontSize: '16px', fontWeight: '600' }}>Loading test...</p>
      </div>
    </div>
  )

  if (!test) return null

  if (test.questions.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px 48px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb', maxWidth: '420px' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '8px' }}>No Questions Yet</h2>
        <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
          This mock test (<strong>{test.title}</strong>) doesn't have any questions yet. Please ask the admin to upload a question CSV.
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{ padding: '10px 28px', borderRadius: '10px', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
        >← Go Back</button>
      </div>
    </div>
  )

  const q = test.questions[currentIdx]
  const answered = Object.values(status).filter(s => s === 'answered' || s === 'answered-marked').length
  const markedCount = Object.values(status).filter(s => s === 'marked' || s === 'answered-marked').length
  const timerColor = timeLeft < 300 ? '#dc2626' : timeLeft < 600 ? '#d97706' : '#16a34a'
  const timerBg = timeLeft < 300 ? '#fef2f2' : timeLeft < 600 ? '#fffbeb' : '#f0fdf4'
  const positiveMark = test.negativeMarking > 0 ? 1 : 1
  const pctDone = test.questions.length > 0 ? Math.round(((currentIdx + 1) / test.questions.length) * 100) : 0

  const OPTIONS = [
    { key: 'A', value: q.optionA },
    { key: 'B', value: q.optionB },
    { key: 'C', value: q.optionC },
    { key: 'D', value: q.optionD },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f3f4f6', fontFamily: 'system-ui, -apple-system, sans-serif', overflow: 'hidden' }}>

      {/* ─── TOP HEADER ─────────────────────────────────────────── */}
      <header style={{ backgroundColor: '#1a1a2e', color: '#fff', padding: '0 20px', height: '52px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
        {/* Title */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
            {test.title}
            <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '10px' }}>— {test.totalQuestions} Questions</span>
          </span>
        </div>

        {/* Q counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#2d2d4e', borderRadius: '8px', padding: '5px 12px', fontSize: '13px', whiteSpace: 'nowrap' }}>
          <span style={{ color: '#94a3b8' }}>Q</span>
          <span style={{ fontWeight: '700' }}>{currentIdx + 1}</span>
          <span style={{ color: '#64748b' }}>/ {test.questions.length}</span>
        </div>

        {/* Timer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: timerBg, borderRadius: '8px', padding: '5px 14px', border: `1px solid ${timerColor}20` }}>
          <span style={{ color: timerColor, fontSize: '16px' }}>⏱</span>
          <span style={{ fontSize: '15px', fontWeight: '800', color: timerColor, letterSpacing: '1px', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</span>
        </div>

        {/* Marks scheme */}
        {test.negativeMarking > 0 && (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', backgroundColor: '#2d2d4e', borderRadius: '8px', padding: '5px 12px', fontSize: '13px' }}>
            <span style={{ color: '#22c55e', fontWeight: '700' }}>+{positiveMark}</span>
            <span style={{ color: '#64748b' }}>|</span>
            <span style={{ color: '#f87171', fontWeight: '700' }}>−{test.negativeMarking}</span>
          </div>
        )}

        {/* Review / Hide Panel / Exit */}
        <button
          onClick={() => toggleMark(q.id)}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: status[q.id]?.includes('marked') ? '#f97316' : '#2d2d4e', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}
        >
          ★ {status[q.id]?.includes('marked') ? 'Marked' : 'Review'}
        </button>
        <button onClick={() => setPanelOpen(o => !o)} style={{ backgroundColor: '#2d2d4e', color: '#d1d5db', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}>
          {panelOpen ? 'Hide Panel' : 'Show Panel'}
        </button>
        <button onClick={() => { if (confirm('Exit test? Your progress will be lost.')) navigate(-1) }} style={{ backgroundColor: '#374151', color: '#d1d5db', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px' }}>
          Exit
        </button>
      </header>

      {/* ─── DOT PROGRESS BAR ───────────────────────────────────── */}
      <div style={{ height: '6px', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
        <div style={{ height: '100%', backgroundColor: '#22c55e', width: `${pctDone}%`, transition: 'width 0.3s ease', borderRadius: '0 4px 4px 0' }} />
      </div>

      {/* ─── MAIN BODY ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Question Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>

          {/* Question label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', fontWeight: '800', color: '#16a34a', letterSpacing: '0.05em' }}>
              QUESTION {currentIdx + 1}
            </span>
            <button
              onClick={() => toggleMark(q.id)}
              title="Flag for review"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: status[q.id]?.includes('marked') ? '#f97316' : '#9ca3af' }}
            >🚩</button>
          </div>

          {/* Question card */}
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '22px 24px', marginBottom: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
            <p style={{ fontSize: '16px', lineHeight: '1.75', color: '#111827', margin: 0 }}>{q.question}</p>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {OPTIONS.map(opt => {
              const selected = answers[q.id] === opt.key
              return (
                <button
                  key={opt.key}
                  onClick={() => selectOption(q.id, opt.key)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '14px 18px',
                    borderRadius: '10px', textAlign: 'left', cursor: 'pointer', width: '100%',
                    backgroundColor: selected ? '#f0fdf4' : '#ffffff',
                    border: selected ? '2px solid #22c55e' : '2px solid #e5e7eb',
                    boxShadow: selected ? '0 0 0 3px rgba(34,197,94,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '13px',
                    backgroundColor: selected ? '#22c55e' : '#f3f4f6',
                    color: selected ? '#ffffff' : '#374151',
                    border: selected ? '2px solid #16a34a' : '2px solid #d1d5db',
                  }}>{opt.key}</span>
                  <span style={{ fontSize: '15px', lineHeight: '1.6', color: '#1f2937', paddingTop: '4px' }}>{opt.value}</span>
                </button>
              )
            })}
          </div>

          {/* Bottom action row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', paddingBottom: '20px' }}>
            <button
              onClick={() => goTo(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 20px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: '#fff', color: '#374151', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentIdx === 0 ? 0.4 : 1, fontWeight: '600', fontSize: '14px' }}
            >← Prev</button>

            {answers[q.id] && (
              <button onClick={() => clearAnswer(q.id)} style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '13px' }}>
                Clear
              </button>
            )}

            <div style={{ flex: 1 }} />

            <button
              onClick={() => goTo(Math.min(test.questions.length - 1, currentIdx + 1))}
              disabled={currentIdx === test.questions.length - 1}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 24px', borderRadius: '8px', backgroundColor: '#1a1a2e', color: '#fff', border: 'none', cursor: currentIdx === test.questions.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIdx === test.questions.length - 1 ? 0.4 : 1, fontWeight: '700', fontSize: '14px' }}
            >Next →</button>
          </div>
        </div>

        {/* ─── RIGHT PANEL ─────────────────────────────────────── */}
        {panelOpen && (
          <div style={{ width: '260px', backgroundColor: '#ffffff', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>

            {/* Submit button */}
            <div style={{ padding: '16px' }}>
              <button
                onClick={() => setShowSubmit(true)}
                style={{ width: '100%', backgroundColor: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: '800', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                Submit Assessment →
              </button>
            </div>

            {/* Stats */}
            <div style={{ padding: '0 16px 12px', display: 'flex', gap: '12px', fontSize: '13px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
                {answered} Answered
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f97316', display: 'inline-block' }} />
                {markedCount} Marked
              </span>
            </div>

            <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 16px 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>ALL QUESTIONS</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>({test.questions.length})</span>
              </div>

              {/* Question grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                {test.questions.map((question, idx) => {
                  const s = status[question.id] || 'not-visited'
                  const st = STATUS[s]
                  const isCurrent = idx === currentIdx
                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentIdx(idx)}
                      style={{
                        width: '100%', aspectRatio: '1', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                        backgroundColor: st.bg,
                        color: st.text,
                        border: isCurrent ? '2px solid #1a1a2e' : `1px solid ${st.border}`,
                        cursor: 'pointer',
                        outline: isCurrent ? '2px solid #1a1a2e' : 'none',
                        outlineOffset: '1px',
                        boxShadow: isCurrent ? '0 0 0 2px rgba(26,26,46,0.3)' : 'none',
                      }}
                    >{idx + 1}</button>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div style={{ padding: '16px', marginTop: 'auto', borderTop: '1px solid #f3f4f6' }}>
              {[
                { label: 'Answered', color: '#22c55e' },
                { label: 'Marked for Review', color: '#f97316' },
                { label: 'Current', color: '#1a1a2e', outline: true },
                { label: 'Visited', color: '#ef4444' },
                { label: 'Not Visited', color: '#d1d5db', textColor: '#374151' },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '12px', color: '#4b5563' }}>
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0,
                    backgroundColor: l.color,
                    border: l.outline ? '2px solid #1a1a2e' : 'none',
                  }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── SUBMIT MODAL ───────────────────────────────────────── */}
      {showSubmit && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111827', marginBottom: '6px' }}>Submit Assessment?</h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Once submitted, you cannot change your answers.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
              {[
                { label: 'Answered', count: answered, color: '#16a34a', bg: '#f0fdf4' },
                { label: 'Not Answered', count: test.questions.length - answered, color: '#dc2626', bg: '#fef2f2' },
                { label: 'Marked', count: markedCount, color: '#d97706', bg: '#fffbeb' },
                { label: 'Time Left', count: formatTime(timeLeft), color: '#2563eb', bg: '#eff6ff' },
              ].map(s => (
                <div key={s.label} style={{ backgroundColor: s.bg, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSubmit(false)} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '2px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}>
                Continue Test
              </button>
              <button onClick={submitTest} disabled={submitting} style={{ flex: 1, padding: '12px', borderRadius: '10px', backgroundColor: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                {submitting ? 'Submitting...' : '✓ Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}