import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { examApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

interface SubjectSummary {
  id: number
  name: string
  description?: string
  icon?: string
  chapterCount?: number
}

interface MockTestSummary {
  id: number
  title: string
  questionCount?: number
  totalQuestions?: number
  timeLimitMinutes?: number
}

interface ExamDetail {
  id: number
  name: string
  description?: string
  subjects?: SubjectSummary[]
  subjectCount?: number
}

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

const getItems = <T,>(data: unknown): T[] => Array.isArray(data)
  ? data as T[]
  : Array.isArray((data as { content?: unknown[] } | null | undefined)?.content)
    ? ((data as { content?: T[] }).content ?? [])
    : []

export default function ExamDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { colors } = useTheme()
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const examId = Number(route.params?.examId)

  const [exam, setExam] = useState<ExamDetail | null>(null)
  const [mockTests, setMockTests] = useState<MockTestSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'subjects' | 'mock-tests'>('subjects')

  useEffect(() => {
    let mounted = true

    const loadExam = async () => {
      setLoading(true)
      try {
        await wait(500)
        const [examRes, mockTestsRes] = await Promise.all([
          examApi.getById(examId),
          examApi.getMockTests(examId),
        ])
        if (!mounted) return
        setExam(examRes.data as ExamDetail)
        setMockTests(getItems<MockTestSummary>(mockTestsRes.data))
        setError('')
      } catch (err: unknown) {
        if (!mounted) return
        const message = err as { response?: { data?: { message?: string } }; message?: string }
        setError(message.response?.data?.message || message.message || 'Unable to load exam details right now')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (examId) loadExam()
    else {
      setError('Exam not found')
      setLoading(false)
    }

    return () => { mounted = false }
  }, [examId])

  const handleMockTestPress = (testId: number) => {
    if (!isAuthenticated) {
      Alert.alert('Login required', 'Login to take this test', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') },
      ])
      return
    }

    navigation.navigate('MockTest', { testId })
  }

  const subjects = useMemo(() => exam?.subjects ?? [], [exam])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading exam details...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <Text style={styles.error}>{error}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.examTitle, { color: colors.text }]}>{exam?.name || 'Exam Detail'}</Text>
        <Text style={[styles.examDescription, { color: colors.textMuted }]}>
          {exam?.description || 'Detailed syllabus, sections and mock tests for this exam.'}
        </Text>
        <Text style={[styles.metaText, { color: colors.primary }]}>Subjects: {subjects.length || exam?.subjectCount || 0}</Text>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {(['subjects', 'mock-tests'] as const).map((tab) => {
          const selected = activeTab === tab
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, { backgroundColor: selected ? colors.primary : 'transparent' }]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, { color: selected ? '#ffffff' : colors.textMuted }]}>
                {tab === 'subjects' ? 'Subjects' : 'Mock Tests'}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {activeTab === 'subjects' ? (
        subjects.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>📚</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No subjects available</Text>
            <Text style={[styles.helperText, { color: colors.textMuted }]}>Subjects for this exam will appear here soon.</Text>
          </View>
        ) : (
          subjects.map((subject) => (
            <TouchableOpacity
              key={subject.id}
              style={[styles.subjectCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate('SubjectDetail', { subjectId: subject.id })}>
              <View style={[styles.subjectIconWrap, { backgroundColor: colors.primaryLight }]}> 
                <Text style={styles.subjectIcon}>{subject.icon || '📘'}</Text>
              </View>
              <View style={styles.subjectBody}>
                <Text style={[styles.subjectTitle, { color: colors.text }]}>{subject.name}</Text>
                <Text style={[styles.subjectDescription, { color: colors.textMuted }]} numberOfLines={2}>
                  {subject.description || 'Topic-wise chapters, notes, videos and chapter tests.'}
                </Text>
                <Text style={[styles.subjectMeta, { color: colors.primary }]}>Chapters: {subject.chapterCount ?? 0}</Text>
              </View>
            </TouchableOpacity>
          ))
        )
      ) : mockTests.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No mock tests yet</Text>
          <Text style={[styles.helperText, { color: colors.textMuted }]}>Mock tests for this exam will appear here soon.</Text>
        </View>
      ) : (
        mockTests.map((test) => (
          <TouchableOpacity
            key={test.id}
            style={[styles.testCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleMockTestPress(test.id)}>
            <Text style={[styles.testTitle, { color: colors.text }]}>{test.title}</Text>
            <View style={styles.testMetaRow}>
              <Text style={[styles.testMeta, { color: colors.textMuted }]}>Questions: {test.questionCount ?? test.totalQuestions ?? 0}</Text>
              <Text style={[styles.testMeta, { color: colors.textMuted }]}>Duration: {test.timeLimitMinutes ?? 0} min</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  heroCard: { borderWidth: 1, borderRadius: 18, padding: 18 },
  examTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  examDescription: { fontSize: 14, lineHeight: 21, marginBottom: 12 },
  metaText: { fontSize: 13, fontWeight: '700' },
  tabBar: { borderWidth: 1, borderRadius: 14, padding: 4, flexDirection: 'row' },
  tabButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '700' },
  subjectCard: { borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: 'row', gap: 14 },
  subjectIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  subjectIcon: { fontSize: 28 },
  subjectBody: { flex: 1 },
  subjectTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  subjectDescription: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  subjectMeta: { fontSize: 13, fontWeight: '700' },
  testCard: { borderWidth: 1, borderRadius: 16, padding: 16 },
  testTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  testMetaRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  testMeta: { fontSize: 13 },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
})
