import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { examApi } from '../../api/services'
import { CheckCircle2, XCircle, MinusCircle, Clock, Trophy, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

interface Question {
  id: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
  explanation?: string
  orderIndex: number
}

interface Result {
  id: number
  score: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  unattempted: number
  percentage: number
  netScore: number
  negativeMarking: number
  timeTakenSeconds: number
  questions: Question[]
  userAnswers: Record<string, string>
  examId?: number
  examName?: string
}

export default function MockTestResultPage() {
  const { testId, attemptId } = useParams<{ testId: string; attemptId: string }>()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [result, setResult] = useState<Result | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unattempted'>('all')

  const bg = isDark ? '#0f172a' : '#f8fafc'
  const cardBg = isDark ? '#1e293b' : '#ffffff'
  const border = isDark ? '#334155' : '#e2e8f0'
  const text = isDark ? '#f1f5f9' : '#0f172a'
  const muted = isDark ? '#94a3b8' : '#64748b'

  useEffect(() => {
    // Fetch test with answers (withAnswers=true) and use the attempt from navigation state or re-fetch
    Promise.all([
      examApi.getTest(Number(testId)),
      examApi.getAttempts(Number(testId)),
    ]).then(([testRes, attemptsRes]) => {
      const attempts = attemptsRes.data as any[]
      const attempt = attempts.find((a: any) => a.id === Number(attemptId)) || attempts[0]
      if (!attempt) { navigate('/exams'); return }

      const testDetail = testRes.data
      // Merge: get questions with answers
      examApi.getTest(Number(testId)).then(r2 => {
        // We need questions with correct answers; submit already returned them
        // Re-use attempt data; we need to fetch with answers
        setResult({
          ...attempt,
          questions: testDetail.questions, // without answers initially
          examId: testDetail.examId,
          examName: testDetail.examName,
        })
        setLoading(false)
      })
    }).catch(() => navigate('/exams'))
  }, [testId, attemptId, navigate])

  useEffect(() => {
    // Fetch test with answers to get correctOption
    examApi.getTest(Number(testId) ).then(r => {
      setResult(prev => prev ? { ...prev, questions: r.data.questions } : prev)
    })
  }, [testId])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60), sec = s % 60
    return `${m}m ${sec}s`
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: bg }}>
      <div style={{ textAlign: 'center', color: text }}>
        <Trophy style={{ width: '48px', height: '48px', color: '#f59e0b', margin: '0 auto 16px' }} />
        <p>Loading results...</p>
      </div>
    </div>
  )

  if (!result) return null

  const pct = Math.round(result.percentage)
  const scoreColor = pct >= 70 ? '#16a34a' : pct >= 40 ? '#f59e0b' : '#dc2626'

  const filteredQs = result.questions.filter(q => {
    const userAns = result.userAnswers[String(q.id)]
    if (filter === 'correct') return userAns && userAns.toUpperCase() === q.correctOption?.toUpperCase()
    if (filter === 'wrong') return userAns && userAns.toUpperCase() !== q.correctOption?.toUpperCase()
    if (filter === 'unattempted') return !userAns
    return true
  })

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh', paddingBottom: '40px' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#1e3a5f', color: '#fff', padding: '20px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <button onClick={() => navigate(-2)} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '8px' }}>
            <ArrowLeft style={{ width: '16px', height: '16px' }} /> Back to Exam
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: '800' }}>📊 Test Result</h1>
          {result.examName && <p style={{ color: '#93c5fd', fontSize: '14px', marginTop: '2px' }}>{result.examName}</p>}
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 16px' }}>

        {/* Score card */}
        <div style={{ backgroundColor: cardBg, borderRadius: '20px', border: `1px solid ${border}`, padding: '32px', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', border: `8px solid ${scoreColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', flexDirection: 'column' }}>
            <span style={{ fontSize: '32px', fontWeight: '900', color: scoreColor }}>{pct}%</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: text, marginBottom: '4px' }}>
            {pct >= 70 ? '🎉 Excellent!' : pct >= 40 ? '👍 Good Effort!' : '💪 Keep Practicing!'}
          </h2>
          <p style={{ color: muted, fontSize: '14px' }}>Net Score: <strong style={{ color: text }}>{result.netScore?.toFixed(2) ?? result.correctAnswers}</strong> / {result.totalQuestions}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '24px', maxWidth: '500px', margin: '24px auto 0' }}>
            {[
              { icon: '✅', label: 'Correct', count: result.correctAnswers, color: '#16a34a' },
              { icon: '❌', label: 'Wrong', count: result.wrongAnswers, color: '#dc2626' },
              { icon: '⭕', label: 'Unattempted', count: result.unattempted ?? (result.totalQuestions - result.correctAnswers - result.wrongAnswers), color: '#6b7280' },
              { icon: '⏱️', label: 'Time Taken', count: result.timeTakenSeconds ? formatTime(result.timeTakenSeconds) : '—', color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: '12px', padding: '16px', textAlign: 'center', border: `1px solid ${border}` }}>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{s.icon}</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: s.color }}>{s.count}</div>
                <div style={{ fontSize: '12px', color: muted }}>{s.label}</div>
              </div>
            ))}
          </div>

          {result.negativeMarking > 0 && (
            <p style={{ marginTop: '16px', fontSize: '12px', color: muted }}>
              Marking scheme: +1 correct · −{result.negativeMarking} wrong
            </p>
          )}
        </div>

        {/* Question review */}
        <div style={{ backgroundColor: cardBg, borderRadius: '16px', border: `1px solid ${border}`, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: text }}>Question Review</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['all', 'correct', 'wrong', 'unattempted'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  backgroundColor: filter === f ? '#3b82f6' : (isDark ? '#374151' : '#f1f5f9'),
                  color: filter === f ? '#fff' : muted,
                }}>
                  {f === 'all' ? `All (${result.totalQuestions})` : f === 'correct' ? `✅ Correct (${result.correctAnswers})` : f === 'wrong' ? `❌ Wrong (${result.wrongAnswers})` : `⭕ Skipped (${result.unattempted ?? 0})`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredQs.map((q, idx) => {
              const userAns = result.userAnswers[String(q.id)]
              const correct = q.correctOption?.toUpperCase()
              const isCorrect = userAns && userAns.toUpperCase() === correct
              const isWrong = userAns && userAns.toUpperCase() !== correct
              const isOpen = expanded[q.id]

              const OPTIONS = [
                { key: 'A', value: q.optionA },
                { key: 'B', value: q.optionB },
                { key: 'C', value: q.optionC },
                { key: 'D', value: q.optionD },
              ]

              return (
                <div key={q.id} style={{ border: `1px solid ${isCorrect ? '#16a34a' : isWrong ? '#dc2626' : border}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div
                    onClick={() => setExpanded(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', cursor: 'pointer', backgroundColor: isCorrect ? (isDark ? '#052e16' : '#f0fdf4') : isWrong ? (isDark ? '#1f0a0a' : '#fef2f2') : (isDark ? '#1e293b' : '#f8fafc') }}
                  >
                    <span style={{ flexShrink: 0, marginTop: '2px' }}>
                      {isCorrect ? <CheckCircle2 style={{ width: '20px', color: '#16a34a' }} /> : isWrong ? <XCircle style={{ width: '20px', color: '#dc2626' }} /> : <MinusCircle style={{ width: '20px', color: '#6b7280' }} />}
                    </span>
                    <p style={{ flex: 1, fontSize: '14px', color: text, lineHeight: '1.5', margin: 0 }}>
                      <strong style={{ color: muted }}>Q{result.questions.indexOf(q) + 1}. </strong>{q.question}
                    </p>
                    {isOpen ? <ChevronUp style={{ width: '18px', color: muted, flexShrink: 0 }} /> : <ChevronDown style={{ width: '18px', color: muted, flexShrink: 0 }} />}
                  </div>

                  {isOpen && (
                    <div style={{ padding: '14px 16px', borderTop: `1px solid ${border}`, backgroundColor: cardBg }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                        {OPTIONS.map(opt => {
                          const isUserChoice = userAns?.toUpperCase() === opt.key
                          const isCorrectOpt = correct === opt.key
                          return (
                            <div key={opt.key} style={{
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '8px',
                              backgroundColor: isCorrectOpt ? (isDark ? '#052e16' : '#f0fdf4') : isUserChoice ? (isDark ? '#1f0a0a' : '#fef2f2') : 'transparent',
                              border: `1px solid ${isCorrectOpt ? '#16a34a' : isUserChoice ? '#dc2626' : border}`,
                            }}>
                              <span style={{
                                width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                fontWeight: '700', fontSize: '12px',
                                backgroundColor: isCorrectOpt ? '#16a34a' : isUserChoice ? '#dc2626' : (isDark ? '#374151' : '#e2e8f0'),
                                color: '#fff',
                              }}>{opt.key}</span>
                              <span style={{ fontSize: '13px', color: text }}>{opt.value}</span>
                              {isCorrectOpt && <span style={{ marginLeft: 'auto', color: '#16a34a', fontSize: '12px', fontWeight: '600' }}>✓ Correct</span>}
                              {isUserChoice && !isCorrectOpt && <span style={{ marginLeft: 'auto', color: '#dc2626', fontSize: '12px', fontWeight: '600' }}>✗ Your answer</span>}
                            </div>
                          )
                        })}
                      </div>
                      {q.explanation && (
                        <div style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderRadius: '8px', padding: '12px', border: `1px solid ${border}` }}>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>💡 Explanation: </span>
                          <span style={{ fontSize: '13px', color: muted }}>{q.explanation}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link to={`/exams/${result.examId || ''}`} style={{ display: 'inline-block', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '12px', padding: '12px 32px', textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}>
            ← Back to Exam
          </Link>
        </div>
      </div>
    </div>
  )
}
