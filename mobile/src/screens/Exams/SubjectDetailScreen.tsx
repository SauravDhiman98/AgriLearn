import { useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { examApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

interface ChapterSummary {
  id: number
  title: string
  notesCount?: number
  videosCount?: number
  testsCount?: number
}

interface SubjectDetail {
  id: number
  name: string
  examName?: string
  description?: string
  chapters?: ChapterSummary[]
}

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

export default function SubjectDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { colors } = useTheme()
  const subjectId = Number(route.params?.subjectId)

  const [subject, setSubject] = useState<SubjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadSubject = async () => {
      setLoading(true)
      try {
        await wait(500)
        const response = await examApi.getSubject(subjectId)
        if (!active) return
        setSubject(response.data as SubjectDetail)
        setError('')
      } catch (err: unknown) {
        if (!active) return
        const message = err as { response?: { data?: { message?: string } }; message?: string }
        setError(message.response?.data?.message || message.message || 'Unable to load subject details right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (subjectId) loadSubject()
    else {
      setError('Subject not found')
      setLoading(false)
    }

    return () => { active = false }
  }, [subjectId])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading subject...</Text>
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
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{subject?.name || 'Subject'}</Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>{subject?.examName || 'Exam Preparation'}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}> 
          {subject?.description || 'Browse chapters, notes, videos and practice tests for this subject.'}
        </Text>
      </View>

      {(subject?.chapters ?? []).map((chapter, index) => (
        <TouchableOpacity
          key={chapter.id}
          style={[styles.chapterCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate('ChapterDetail', { chapterId: chapter.id })}>
          <View style={[styles.chapterNumber, { backgroundColor: colors.primaryLight }]}> 
            <Text style={[styles.chapterNumberText, { color: colors.primary }]}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
          <View style={styles.chapterBody}>
            <Text style={[styles.chapterTitle, { color: colors.text }]}>{chapter.title}</Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>Notes {chapter.notesCount ?? 0}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>Videos {chapter.videosCount ?? 0}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>Tests {chapter.testsCount ?? 0}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {subject?.chapters?.length ? null : (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.emptyEmoji}>📖</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No chapters yet</Text>
          <Text style={[styles.helperText, { color: colors.textMuted }]}>Chapter content will appear here soon.</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 14 },
  headerCard: { borderWidth: 1, borderRadius: 18, padding: 18 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 20 },
  chapterCard: { borderWidth: 1, borderRadius: 16, padding: 16, flexDirection: 'row', gap: 14 },
  chapterNumber: { width: 54, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  chapterNumberText: { fontSize: 18, fontWeight: '700' },
  chapterBody: { flex: 1 },
  chapterTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
})
