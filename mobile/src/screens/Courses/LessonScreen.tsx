import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { WebView } from 'react-native-webview'
import { courseApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

interface LessonItem {
  id: number
  title: string
  description?: string
  durationMinutes?: number
  videoUrl?: string
  youtubeId?: string
  youtubeUrl?: string
}

interface ChapterItem {
  id: number
  title: string
  lessons?: LessonItem[]
}

interface CourseDetail {
  id: number
  title: string
  chapters?: ChapterItem[]
}

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

const extractYoutubeId = (url?: string) => {
  if (!url) return ''
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return match?.[1] || ''
}

export default function LessonScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { colors } = useTheme()
  const courseId = Number(route.params?.courseId)
  const lessonId = Number(route.params?.lessonId)

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    let active = true
    const loadLesson = async () => {
      setLoading(true)
      try {
        await wait(500)
        const response = await courseApi.getById(courseId)
        if (!active) return
        setCourse(response.data as CourseDetail)
        setError('')
      } catch (err: unknown) {
        if (!active) return
        const message = err as { response?: { data?: { message?: string } }; message?: string }
        setError(message.response?.data?.message || message.message || 'Unable to load lesson right now.')
      } finally {
        if (active) setLoading(false)
      }
    }
    if (courseId && lessonId) void loadLesson()
    else {
      setError('Lesson not found')
      setLoading(false)
    }
    return () => { active = false }
  }, [courseId, lessonId])

  const lesson = useMemo(() => (course?.chapters ?? []).flatMap((chapter) => chapter.lessons ?? []).find((entry) => entry.id === lessonId) ?? null, [course?.chapters, lessonId])

  const handleComplete = async () => {
    try {
      setCompleting(true)
      await courseApi.completeLesson(courseId, lessonId)
      Alert.alert('Completed', 'Lesson marked as complete.')
    } catch (err: unknown) {
      const message = err as { response?: { data?: { message?: string } }; message?: string }
      Alert.alert('Unable to update progress', message.response?.data?.message || message.message || 'Please try again later.')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /><Text style={[styles.helperText, { color: colors.textMuted }]}>Loading lesson...</Text></View>
  }

  if (error || !lesson) {
    return <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}><Text style={styles.error}>{error || 'Lesson not found.'}</Text></View>
  }

  const ytId = lesson.youtubeId || extractYoutubeId(lesson.youtubeUrl) || extractYoutubeId(lesson.videoUrl)
  const ytHtml = `<html><body style="margin:0;padding:0;background:#000"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen></iframe></body></html>`

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {ytId ? <WebView source={{ html: ytHtml }} style={styles.videoFrame} /> : null}
      {!ytId && lesson.videoUrl ? <View style={[styles.videoFallback, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.videoFallbackText, { color: colors.text }]}>Video available</Text><Text style={[styles.helperText, { color: colors.textMuted }]}>Open this lesson on web for the native player experience.</Text></View> : null}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.title, { color: colors.text }]}>{lesson.title}</Text><Text style={[styles.meta, { color: colors.primary }]}>{lesson.durationMinutes ?? 0} min lesson</Text><Text style={[styles.description, { color: colors.textMuted }]}>{lesson.description || 'Lesson content details will appear here.'}</Text></View>
      <TouchableOpacity style={[styles.completeButton, { backgroundColor: colors.primary }]} onPress={handleComplete} disabled={completing}><Text style={styles.completeButtonText}>{completing ? 'Saving...' : 'Mark as Complete'}</Text></TouchableOpacity>
      <TouchableOpacity style={[styles.backButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => navigation.goBack()}><Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text></TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  videoFrame: { height: 220, borderRadius: 16, overflow: 'hidden' },
  videoFallback: { borderWidth: 1, borderRadius: 16, padding: 18 },
  videoFallbackText: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  card: { borderWidth: 1, borderRadius: 18, padding: 18 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  meta: { fontSize: 13, fontWeight: '700', marginBottom: 12 },
  description: { fontSize: 14, lineHeight: 21 },
  completeButton: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  completeButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  backButton: { borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  backButtonText: { fontSize: 14, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
})
