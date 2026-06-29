import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { examApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

const getExamList = (data: any) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  return []
}

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 8000) => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer)
        reject(new Error('Request timed out. Please try again.'))
      }, timeoutMs)
    }),
  ])
}

const getExamEmoji = (name: string) => {
  const label = name.toLowerCase()
  if (label.includes('ibps')) return '🌾'
  if (label.includes('upcatet')) return '🎓'
  if (label.includes('fci')) return '🏭'
  if (label.includes('nabard')) return '🏦'
  if (label.includes('rrb')) return '🚆'
  if (label.includes('cane')) return '🌱'
  return '📘'
}

export default function ExamsScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadExams = async () => {
      setLoading(true)
      try {
        const response = await withTimeout(examApi.list())
        if (!active) return
        setExams(getExamList(response.data))
        setError('')
      } catch (err: any) {
        if (!active) return
        setError(err?.response?.data?.message || err?.message || 'Unable to load exams right now.')
        setExams([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadExams()

    return () => {
      active = false
    }
  }, [])

  const contentContainerStyle = useMemo(
    () => (exams.length === 0 ? styles.emptyList : styles.listContent),
    [exams.length]
  )

  const handleExamPress = useCallback((examId: number) => {
    navigation.navigate('ExamDetail', { examId })
  }, [navigation])

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleExamPress(item.id)}
      activeOpacity={0.88}>
      <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
        <Text style={styles.iconText}>{getExamEmoji(String(item?.name || ''))}</Text>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.examTitle, { color: colors.text }]} numberOfLines={1}>
          {item?.name || 'Exam'}
        </Text>
        <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
          {item?.description || 'Exam-specific practice sets and mock tests.'}
        </Text>

        <View style={[styles.button, { backgroundColor: colors.primary }]}>
          <Text style={styles.buttonText}>View Tests →</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [colors.border, colors.card, colors.primary, colors.primaryLight, colors.text, colors.textMuted, handleExamPress])

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
      {error ? (
        <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.errorTitle}>Couldn't load exams</Text>
          <Text style={[styles.errorText, { color: colors.textMuted }]}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={exams}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        ListEmptyComponent={
          !error ? (
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No exams available</Text>
              <Text style={[styles.helperText, { color: colors.textMuted }]}>
                Fresh exam categories will appear here soon.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 16, gap: 12 },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16, flexDirection: 'row' },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconText: { fontSize: 30 },
  cardBody: { flex: 1 },
  examTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  description: { fontSize: 13, lineHeight: 19, marginBottom: 14 },
  button: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  buttonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 10 },
  messageCard: { borderWidth: 1, borderRadius: 16, margin: 16, marginBottom: 0, padding: 14 },
  errorTitle: { color: '#dc2626', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  errorText: { fontSize: 13, lineHeight: 18 },
  emptyEmoji: { fontSize: 42, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
})
