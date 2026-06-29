import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { examApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

interface TestQuestion {
  id: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  orderIndex?: number
}

interface MockTestDetail {
  id: number
  title: string
  timeLimitMinutes?: number
  totalQuestions?: number
  questions?: TestQuestion[]
}

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
}

export default function MockTestScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { colors } = useTheme()
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const testId = Number(route.params?.testId)

  const [test, setTest] = useState<MockTestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTime = useRef(Date.now())
  const answersRef = useRef<Record<number, string>>({})
  const submittingRef = useRef(false)

  const questions = useMemo(() => test?.questions ?? [], [test])
  const totalQuestions = test?.totalQuestions ?? questions.length
  const currentQuestion = questions[currentIdx]

  useEffect(() => {
    if (!isAuthenticated) {
      Alert.alert('Login required', 'Please login to take this mock test.', [{ text: 'OK', onPress: () => navigation.navigate('Login') }])
    }
  }, [isAuthenticated, navigation])

  const submitTest = useCallback(async (forced = false) => {
    if (!testId || submittingRef.current) return

    const executeSubmit = async () => {
      try {
        setSubmitting(true)
        submittingRef.current = true
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
        const elapsed = Math.max(0, Math.floor((Date.now() - startTime.current) / 1000))
        const response = await examApi.submitAttempt(testId, answersRef.current, elapsed)
        const resultData = response.data as { id?: number; attemptId?: number; data?: { id?: number } }
        const attemptId = Number(resultData.attemptId ?? resultData.id ?? resultData.data?.id ?? 0)
        navigation.replace('MockTestResult', { testId, attemptId })
      } catch (err: unknown) {
        const message = err as { response?: { data?: { message?: string } }; message?: string }
        Alert.alert('Submission failed', message.response?.data?.message || message.message || 'Unable to submit test right now.')
        setSubmitting(false)
        submittingRef.current = false
      }
    }

    if (forced) {
      await executeSubmit()
      return
    }

    Alert.alert('Submit test?', 'Once submitted, your answers will be locked.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', onPress: () => { void executeSubmit() } },
    ])
  }, [navigation, testId])

  useEffect(() => {
    let active = true

    const loadTest = async () => {
      setLoading(true)
      try {
        await wait(500)
        const response = await examApi.getTest(testId)
        if (!active) return
        const payload = response.data as MockTestDetail
        setTest(payload)
        setTimeLeft((payload.timeLimitMinutes ?? 0) * 60)
        startTime.current = Date.now()
        setError('')
      } catch (err: unknown) {
        if (!active) return
        const message = err as { response?: { data?: { message?: string } }; message?: string }
        setError(message.response?.data?.message || message.message || 'Unable to load test right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (isAuthenticated && testId) void loadTest()
    else if (!testId) {
      setError('Test not found')
      setLoading(false)
    } else setLoading(false)

    return () => { active = false }
  }, [isAuthenticated, testId])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    if (!test || timeLeft <= 0 || intervalRef.current) return

    intervalRef.current = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          void submitTest(true)
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [submitTest, test, timeLeft])

  const handleAnswerSelect = (option: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQuestion) return
    setAnswers((previous) => ({ ...previous, [currentQuestion.id]: option }))
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Redirecting to login...</Text>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading test...</Text>
      </View>
    )
  }

  if (error || !currentQuestion) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <Text style={styles.error}>{error || 'No questions available for this test.'}</Text>
      </View>
    )
  }

  const selectedOption = answers[currentQuestion.id]
  const options: Array<{ key: 'A' | 'B' | 'C' | 'D'; value: string }> = [
    { key: 'A', value: currentQuestion.optionA },
    { key: 'B', value: currentQuestion.optionB },
    { key: 'C', value: currentQuestion.optionC },
    { key: 'D', value: currentQuestion.optionD },
  ]

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerTextWrap}>
          <Text style={[styles.testTitle, { color: colors.text }]} numberOfLines={1}>{test?.title || 'Mock Test'}</Text>
          <Text style={[styles.timerText, { color: timeLeft < 60 ? '#dc2626' : colors.primary }]}>{formatTime(timeLeft)}</Text>
        </View>
        <TouchableOpacity style={[styles.submitButton, { backgroundColor: submitting ? colors.border : colors.primary }]} onPress={() => { void submitTest(false) }} disabled={submitting}>
          <Text style={styles.submitButtonText}>{submitting ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.questionMeta, { color: colors.primary }]}>{`Q${currentIdx + 1} of ${totalQuestions}`}</Text>
        <Text style={[styles.questionText, { color: colors.text }]}>{currentQuestion.question}</Text>
        {options.map((option) => {
          const selected = selectedOption === option.key
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.optionButton, { backgroundColor: selected ? colors.primaryLight : colors.card, borderColor: selected ? colors.primary : colors.border }]}
              onPress={() => handleAnswerSelect(option.key)}>
              <Text style={[styles.optionLabel, { color: selected ? colors.primary : colors.text }]}>{option.key}.</Text>
              <Text style={[styles.optionText, { color: colors.text }]}>{option.value}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: currentIdx === 0 ? colors.border : colors.primary }]} disabled={currentIdx === 0} onPress={() => setCurrentIdx((previous) => Math.max(0, previous - 1))}>
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>
        <Text style={[styles.progressText, { color: colors.textMuted }]}>{currentIdx + 1} / {totalQuestions}</Text>
        <TouchableOpacity style={[styles.navButton, { backgroundColor: currentIdx === totalQuestions - 1 ? colors.border : colors.primary }]} disabled={currentIdx === totalQuestions - 1} onPress={() => setCurrentIdx((previous) => Math.min(totalQuestions - 1, previous + 1))}>
          <Text style={styles.navButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 16 },
  header: { borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  headerTextWrap: { flex: 1 },
  testTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  timerText: { fontSize: 22, fontWeight: '700' },
  submitButton: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  submitButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  questionCard: { flex: 1, borderWidth: 1, borderRadius: 18, padding: 16 },
  questionMeta: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  questionText: { fontSize: 18, fontWeight: '600', lineHeight: 26, marginBottom: 18 },
  optionButton: { borderWidth: 1, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, marginBottom: 12 },
  optionLabel: { fontSize: 15, fontWeight: '700' },
  optionText: { flex: 1, fontSize: 14, lineHeight: 21 },
  bottomNav: { borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  navButton: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, minWidth: 92, alignItems: 'center' },
  navButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  progressText: { fontSize: 14, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
})
