import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { examApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

const getItems = (data: any) => Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []

export default function ExamDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { colors } = useTheme()
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const examId = route.params?.examId

  const [exam, setExam] = useState<any>(null)
  const [mockTests, setMockTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadExam = async () => {
      try {
        const [examRes, mockTestsRes] = await Promise.all([
          examApi.getById(examId),
          examApi.getMockTests(examId),
        ])
        if (!mounted) return
        setExam(examRes.data)
        setMockTests(getItems(mockTestsRes.data))
        setError('')
      } catch (err: any) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Unable to load exam details right now')
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
        <Text style={[styles.metaText, { color: colors.primary }]}>Subjects: {exam?.subjects?.length ?? exam?.subjectCount ?? 0}</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mock Tests</Text>
      </View>

      {mockTests.length === 0 ? (
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
  sectionHeader: { marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  testCard: { borderWidth: 1, borderRadius: 16, padding: 16, marginTop: 12 },
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
