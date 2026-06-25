import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { examApi } from '../../api/services'
import { useTheme } from '../../context/ThemeContext'
import { Clock, AlertCircle, CheckCircle, XCircle, ChevronLeft } from 'lucide-react'

type Phase = 'info' | 'quiz' | 'result'

export default function McqTestPage() {
  const { id } = useParams<{ id: string }>()
  const { isDark } = useTheme()
  const navigate = useNavigate()

  const [phase, setPhase] = useState<Phase>('info')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [result, setResult] = useState<any>(null)

  const { data: test, isLoading } = useQuery(['mcq-test', id], () => examApi.getTest(Number(id)), {
    select: res => res.data,
    onSuccess: (data: any) => setTimeLeft(data.durationMinutes * 60),
  })

  // Countdown timer
  useEffect(() => {
    if (phase !== 'quiz' || timeLeft <= 0) return
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(t); handleSubmit(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [phase, timeLeft])

  const submitMutation = useMutation(
    (payload: any) => examApi.submitAttempt(Number(id), payload.answers),
    { onSuccess: res => { setResult(res.data); setPhase('result') } }
  )

  const handleSubmit = () => {
    submitMutation.mutate({ answers })
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'

  if (isLoading) {
    return <div style={{ backgroundColor: bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: text }}>Loading test...</div>
  }

  const questions = test?.questions || []

  // Info Phase
  if (phase === 'info') {
    return (
      <div style={{ backgroundColor: bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ backgroundColor: cardBg, borderRadius: '20px', padding: '40px', maxWidth: '500px', width: '100%', border: `1px solid ${border}`, textAlign: 'center' }}>
          <button onClick={() => navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
            color: muted, cursor: 'pointer', fontSize: '14px', marginBottom: '20px', padding: '0',
          }}>
            <ChevronLeft style={{ width: '16px', height: '16px' }} /> Back
          </button>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🧠</div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', color: text, marginBottom: '8px' }}>{test?.title}</h1>
          <p style={{ color: muted, marginBottom: '28px', fontSize: '14px' }}>{test?.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '32px' }}>
            {[
              { label: 'Questions', value: test?.questionCount || questions.length },
              { label: 'Duration', value: `${test?.durationMinutes} min` },
              { label: 'Difficulty', value: test?.difficulty },
            ].map(item => (
              <div key={item.label} style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', borderRadius: '12px', padding: '14px 10px' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: text }}>{item.value}</div>
                <div style={{ fontSize: '12px', color: muted, marginTop: '4px' }}>{item.label}</div>
              </div>
            ))}
          </div>
          <div style={{ backgroundColor: isDark ? '#374151' : '#fffbeb', borderRadius: '12px', padding: '14px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '8px', color: '#b45309', fontSize: '13px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '1px' }} />
              <span>Once started, the timer cannot be paused. Submit before time runs out.</span>
            </div>
          </div>
          <button onClick={() => setPhase('quiz')} style={{
            width: '100%', padding: '14px', backgroundColor: '#194552', color: '#fff',
            border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
          }}>
            Start Test →
          </button>
        </div>
      </div>
    )
  }

  // Result Phase
  if (phase === 'result') {
    const score = result?.score || 0
    const total = result?.totalMarks || questions.length
    const pct = Math.round((score / total) * 100)
    const passed = pct >= (test?.passingScore || 40)

    return (
      <div style={{ backgroundColor: bg, minHeight: '100vh', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: cardBg, borderRadius: '20px', padding: '40px', maxWidth: '600px', width: '100%', border: `1px solid ${border}`, textAlign: 'center' }}>
          <button onClick={() => navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
            color: muted, cursor: 'pointer', fontSize: '14px', marginBottom: '20px', padding: '0',
          }}>
            <ChevronLeft style={{ width: '16px', height: '16px' }} /> Back to Chapter
          </button>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: text, marginBottom: '6px' }}>
            {passed ? 'Test Passed!' : 'Better Luck Next Time'}
          </h1>
          <p style={{ color: muted, marginBottom: '28px' }}>{test?.title}</p>

          <div style={{ width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 28px', border: `8px solid ${passed ? '#16a34a' : '#dc2626'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span style={{ fontSize: '28px', fontWeight: '800', color: passed ? '#16a34a' : '#dc2626' }}>{pct}%</span>
            <span style={{ fontSize: '11px', color: muted }}>Score</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '28px' }}>
            {[
              { label: 'Score', value: `${score}/${total}`, icon: <CheckCircle style={{ width: '18px', height: '18px', color: '#16a34a' }} /> },
              { label: 'Correct', value: result?.correctAnswers, icon: <CheckCircle style={{ width: '18px', height: '18px', color: '#16a34a' }} /> },
              { label: 'Wrong', value: result?.wrongAnswers, icon: <XCircle style={{ width: '18px', height: '18px', color: '#dc2626' }} /> },
            ].map(item => (
              <div key={item.label} style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6', borderRadius: '12px', padding: '14px 10px' }}>
                <div style={{ marginBottom: '4px' }}>{item.icon}</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: text }}>{item.value}</div>
                <div style={{ fontSize: '12px', color: muted }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* Question review */}
          {result?.reviewData && (
            <div style={{ textAlign: 'left', marginBottom: '28px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: text, marginBottom: '12px' }}>Review</h3>
              {result.reviewData.map((q: any, i: number) => (
                <div key={i} style={{ backgroundColor: isDark ? '#374151' : '#f9fafb', borderRadius: '10px', padding: '12px', marginBottom: '8px', borderLeft: `4px solid ${q.correct ? '#16a34a' : '#dc2626'}` }}>
                  <p style={{ fontSize: '13px', color: text, fontWeight: '600', marginBottom: '4px' }}>Q{i + 1}. {q.question}</p>
                  <p style={{ fontSize: '12px', color: q.correct ? '#16a34a' : '#dc2626' }}>Your answer: {q.selectedAnswer || '(Not answered)'}</p>
                  {!q.correct && <p style={{ fontSize: '12px', color: '#16a34a' }}>Correct: {q.correctAnswer}</p>}
                  {q.explanation && <p style={{ fontSize: '12px', color: muted, marginTop: '4px', fontStyle: 'italic' }}>💡 {q.explanation}</p>}
                </div>
              ))}
            </div>
          )}

          <button onClick={() => navigate(-1)} style={{
            width: '100%', padding: '14px', backgroundColor: '#194552', color: '#fff',
            border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
          }}>
            ← Back to Chapter
          </button>
        </div>
      </div>
    )
  }

  // Quiz Phase
  const q = questions[current]
  const progress = ((current + 1) / questions.length) * 100

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh', padding: '16px' }}>
      {/* Header bar */}
      <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <span style={{ color: muted, fontSize: '14px', fontWeight: '600' }}>Q {current + 1} / {questions.length}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: timeLeft < 60 ? '#dc2626' : text, fontWeight: '700', fontSize: '18px' }}>
          <Clock style={{ width: '18px', height: '18px' }} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ maxWidth: '700px', margin: '0 auto 20px', height: '6px', backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: '4px' }}>
        <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#194552', borderRadius: '4px', transition: 'width 0.3s ease' }} />
      </div>

      {/* Question */}
      <div style={{ maxWidth: '700px', margin: '0 auto', backgroundColor: cardBg, borderRadius: '16px', padding: '28px', border: `1px solid ${border}` }}>
        <p style={{ fontSize: '17px', fontWeight: '600', color: text, marginBottom: '24px', lineHeight: '1.6' }}>
          {q?.questionText}
        </p>

        <div style={{ display: 'grid', gap: '10px' }}>
          {q?.options?.map((opt: string, i: number) => {
            const optKey = String.fromCharCode(65 + i) // A, B, C, D
            const selected = answers[q.id] === optKey
            return (
              <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: optKey }))} style={{
                textAlign: 'left', padding: '14px 18px', borderRadius: '12px', border: `2px solid ${selected ? '#194552' : border}`,
                backgroundColor: selected ? (isDark ? '#1e3a4a' : '#e0f2fe') : (isDark ? '#374151' : '#f9fafb'),
                color: selected ? (isDark ? '#93c5fd' : '#0c4a6e') : text,
                cursor: 'pointer', fontSize: '15px', transition: 'all 0.15s ease',
                fontWeight: selected ? '600' : '400',
              }}>
                <span style={{ fontWeight: '700', marginRight: '10px' }}>{optKey}.</span>{opt}
              </button>
            )
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', gap: '12px' }}>
          <button onClick={() => setCurrent(p => p - 1)} disabled={current === 0} style={{
            padding: '11px 22px', borderRadius: '10px', border: `1px solid ${border}`,
            backgroundColor: 'transparent', color: current === 0 ? muted : text, cursor: current === 0 ? 'not-allowed' : 'pointer', fontSize: '14px',
          }}>
            ← Previous
          </button>

          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(p => p + 1)} style={{
              padding: '11px 22px', borderRadius: '10px', backgroundColor: '#194552',
              color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
            }}>
              Next →
            </button>
          ) : (
            <button onClick={handleSubmit} style={{
              padding: '11px 28px', borderRadius: '10px', backgroundColor: '#16a34a',
              color: '#fff', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
            }}>
              Submit Test ✓
            </button>
          )}
        </div>

        {/* Answered count */}
        <p style={{ textAlign: 'center', color: muted, fontSize: '12px', marginTop: '16px' }}>
          {Object.keys(answers).length} of {questions.length} answered
        </p>
      </div>
    </div>
  )
}
