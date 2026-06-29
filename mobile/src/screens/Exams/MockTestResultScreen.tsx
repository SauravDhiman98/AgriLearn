import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { examApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

interface ResultQuestion {
  id: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption?: 'A' | 'B' | 'C' | 'D'
  explanation?: string
}

interface TestWithAnswers {
  id: number
  title: string
  questions?: ResultQuestion[]
}

interface AttemptResult {
  id: number
  correctAnswers?: number
  wrongAnswers?: number
  unattempted?: number
  netScore?: number
  percentage?: number
  timeTakenSeconds?: number
  totalQuestions?: number
  userAnswers?: Record<string, string>
}

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

const getItems = <T,>(data: unknown): T[] => Array.isArray(data)
  ? data as T[]
  : Array.isArray((data as { content?: unknown[] } | null | undefined)?.content)
    ? ((data as { content?: T[] }).content ?? [])
    : []

const formatDuration = (seconds?: number) => {
  const total = seconds ?? 0
  const minutes = Math.floor(total / 60)
  const remaining = total % 60
  return `${minutes}m ${remaining}s`
}

export default function MockTestResultScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { colors } = useTheme()
  const testId = Number(route.params?.testId)
  const attemptId = Number(route.params?.attemptId)

  const [test, setTest] = useState<TestWithAnswers | null>(null)
  const [attempt, setAttempt] = useState<AttemptResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'skipped'>('all')
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  useEffect(() => {
    let active = true

    const loadData = async () => {
      setLoading(true)
      try {
        await wait(500)
        const [testResponse, attemptsResponse] = await Promise.all([examApi.getTest(testId, true), examApi.getAttempts(testId)])
        if (!active) return
        const attempts = getItems<AttemptResult>(attemptsResponse.data)
        const selectedAttempt = attempts.find((entry) => entry.id === attemptId) || attempts[0] || null
        setTest(testResponse.data as TestWithAnswers)
        setAttempt(selectedAttempt)
        setError(selectedAttempt ? '' : 'Result not found for this attempt.')
      } catch (err: unknown) {
        if (!active) return
        const message = err as { response?: { data?: { message?: string } }; message?: string }
        setError(message.response?.data?.message || message.message || 'Unable to load results right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (testId) void loadData()
    else {
      setError('Result not found')
      setLoading(false)
    }

    return () => { active = false }
  }, [attemptId, testId])

  const percentage = attempt?.percentage ?? 0
  const tone = percentage >= 70 ? '#16a34a' : percentage >= 40 ? '#eab308' : '#dc2626'
  const encouragement = percentage >= 70 ? 'Excellent!' : percentage >= 40 ? 'Good Effort!' : 'Keep Practicing!'

  const filteredQuestions = useMemo(() => {
    const questions = test?.questions ?? []
    const userAnswers = attempt?.userAnswers ?? {}
    return questions.filter((question) => {
      const answer = userAnswers[String(question.id)]
      const isCorrect = answer && answer === question.correctOption
      const isSkipped = !answer
      if (filter === 'correct') return Boolean(isCorrect)
      if (filter === 'wrong') return Boolean(answer) && !isCorrect
      if (filter === 'skipped') return isSkipped
      return true
    })
  }, [attempt?.userAnswers, filter, test?.questions])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading results...</Text>
      </View>
    )
  }

  if (error || !attempt) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <Text style={styles.error}>{error || 'Unable to find result.'}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.scoreCircle, { borderColor: tone }]}><Text style={[styles.scoreValue, { color: tone }]}>{Math.round(percentage)}%</Text></View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>{encouragement}</Text>
        <Text style={[styles.heroSubTitle, { color: colors.textMuted }]}>{test?.title || 'Mock Test Result'}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.statLabel, { color: '#16a34a' }]}>Correct</Text><Text style={[styles.statValue, { color: colors.text }]}>{attempt.correctAnswers ?? 0}</Text></View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.statLabel, { color: '#dc2626' }]}>Wrong</Text><Text style={[styles.statValue, { color: colors.text }]}>{attempt.wrongAnswers ?? 0}</Text></View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.statLabel, { color: colors.textMuted }]}>Skipped</Text><Text style={[styles.statValue, { color: colors.text }]}>{attempt.unattempted ?? 0}</Text></View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.statLabel, { color: '#2563eb' }]}>Time</Text><Text style={[styles.statValue, { color: colors.text }]}>{formatDuration(attempt.timeTakenSeconds)}</Text></View>
      </View>

      <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Tabs')}>
        <Text style={styles.backButtonText}>Back to Exams</Text>
      </TouchableOpacity>

      <View style={[styles.filterBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(['all', 'correct', 'wrong', 'skipped'] as const).map((item) => {
          const selected = filter === item
          return <TouchableOpacity key={item} style={[styles.filterButton, { backgroundColor: selected ? colors.primary : 'transparent' }]} onPress={() => setFilter(item)}><Text style={[styles.filterButtonText, { color: selected ? '#ffffff' : colors.textMuted }]}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text></TouchableOpacity>
        })}
      </View>

      {filteredQuestions.map((question, index) => {
        const userAnswer = attempt.userAnswers?.[String(question.id)]
        const isCorrect = userAnswer && userAnswer === question.correctOption
        const isSkipped = !userAnswer
        const icon = isSkipped ? '⭕' : isCorrect ? '✅' : '❌'
        const isOpen = expanded[question.id]
        const optionEntries: Array<{ key: 'A' | 'B' | 'C' | 'D'; value: string }> = [
          { key: 'A', value: question.optionA },
          { key: 'B', value: question.optionB },
          { key: 'C', value: question.optionC },
          { key: 'D', value: question.optionD },
        ]

        return (
          <TouchableOpacity key={question.id} style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setExpanded((previous) => ({ ...previous, [question.id]: !previous[question.id] }))}>
            <Text style={[styles.questionTitle, { color: colors.text }]}>{icon} Q{index + 1}. {question.question}</Text>
            <Text style={[styles.answerSummary, { color: colors.textMuted }]}>Your answer: {userAnswer || 'Skipped'}</Text>
            {isOpen ? (
              <View style={styles.reviewBlock}>
                {optionEntries.map((option) => {
                  const isCorrectOption = question.correctOption === option.key
                  const isChosen = userAnswer === option.key
                  return <View key={option.key} style={[styles.optionReview, { borderColor: isCorrectOption ? '#16a34a' : isChosen ? '#dc2626' : colors.border, backgroundColor: isCorrectOption ? '#dcfce7' : isChosen ? '#fee2e2' : colors.background }]}><Text style={[styles.optionReviewText, { color: colors.text }]}>{option.key}. {option.value}</Text></View>
                })}
                {question.explanation ? <Text style={[styles.explanation, { color: colors.textMuted }]}>Explanation: {question.explanation}</Text> : null}
              </View>
            ) : null}
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  heroCard: { borderWidth: 1, borderRadius: 18, padding: 20, alignItems: 'center' },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  scoreValue: { fontSize: 28, fontWeight: '700' },
  heroTitle: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  heroSubTitle: { fontSize: 14 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '48%', borderWidth: 1, borderRadius: 16, padding: 16 },
  statLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: '700' },
  backButton: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  backButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  filterBar: { borderWidth: 1, borderRadius: 14, padding: 4, flexDirection: 'row', flexWrap: 'wrap' },
  filterButton: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, margin: 2 },
  filterButtonText: { fontSize: 13, fontWeight: '700' },
  questionCard: { borderWidth: 1, borderRadius: 16, padding: 16 },
  questionTitle: { fontSize: 15, fontWeight: '700', lineHeight: 22, marginBottom: 8 },
  answerSummary: { fontSize: 13 },
  reviewBlock: { marginTop: 12, gap: 8 },
  optionReview: { borderWidth: 1, borderRadius: 12, padding: 12 },
  optionReviewText: { fontSize: 13, lineHeight: 18 },
  explanation: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
})
