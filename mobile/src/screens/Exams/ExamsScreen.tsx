import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { examApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

const getExamEmoji = (name: string) => {
  const normalized = name.toLowerCase()
  if (normalized.includes('ibps')) return '🌾'
  if (normalized.includes('upcatet')) return '🎓'
  if (normalized.includes('fci')) return '🏭'
  if (normalized.includes('nabard')) return '🏦'
  if (normalized.includes('rrb')) return '🚆'
  return '📋'
}

const getItems = (data: any) => Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []

export default function ExamsScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadExams = async () => {
      try {
        const res = await examApi.list()
        const examList = getItems(res.data)
        if (!mounted) return
        setExams(examList)
        setError('')
      } catch (err: any) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Unable to load exams right now')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadExams()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading exams...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Agri Exam Categories</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Choose an exam to explore mock tests and details.</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={exams}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={exams.length === 0 ? styles.emptyList : styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('ExamDetail', { examId: item.id })}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.emoji}>{getExamEmoji(item.name || '')}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.examName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={3}>
                {item.description || 'Exam-focused preparation resources and mock tests.'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No exams available</Text>
            <Text style={[styles.helperText, { color: colors.textMuted }]}>Exam categories will appear here once published.</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  error: { color: '#dc2626', paddingHorizontal: 16, paddingBottom: 8, fontSize: 13 },
  listContent: { padding: 16, paddingTop: 8, gap: 12 },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderRadius: 16, padding: 14, gap: 12 },
  iconWrap: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28 },
  cardBody: { flex: 1 },
  examName: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  mockCount: { fontSize: 13, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 42, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  helperText: { fontSize: 14, marginTop: 10, textAlign: 'center' },
})
