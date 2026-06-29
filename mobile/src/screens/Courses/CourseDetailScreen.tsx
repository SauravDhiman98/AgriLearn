import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { courseApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

interface LessonItem {
  id: number
  title: string
  description?: string
  durationMinutes?: number
  videoUrl?: string
  youtubeId?: string
}

interface ChapterItem {
  id: number
  title: string
  lessons?: LessonItem[]
}

interface CourseDetail {
  id: number
  title: string
  description?: string
  category?: string
  level?: string
  rating?: number
  enrollmentCount?: number
  instructorName?: string
  chapters?: ChapterItem[]
  enrolled?: boolean
  isEnrolled?: boolean
}

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

export default function CourseDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { colors } = useTheme()
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const courseId = Number(route.params?.courseId)

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [expandedChapterIds, setExpandedChapterIds] = useState<Record<number, boolean>>({})

  useEffect(() => {
    let active = true

    const loadCourse = async () => {
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
        setError(message.response?.data?.message || message.message || 'Unable to load course right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (courseId) void loadCourse()
    else {
      setError('Course not found')
      setLoading(false)
    }

    return () => { active = false }
  }, [courseId])

  const totalDuration = useMemo(() => (
    (course?.chapters ?? []).reduce((sum, chapter) => sum + (chapter.lessons ?? []).reduce((lessonSum, lesson) => lessonSum + (lesson.durationMinutes ?? 0), 0), 0)
  ), [course?.chapters])

  const isEnrolled = Boolean(course?.isEnrolled ?? course?.enrolled)

  const handleEnroll = async () => {
    if (!course) return
    if (!isAuthenticated) {
      Alert.alert('Login required', 'Please login to enroll in this course.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login') },
      ])
      return
    }

    try {
      setEnrolling(true)
      await courseApi.enroll(course.id)
      setCourse((previous) => previous ? { ...previous, enrolled: true, isEnrolled: true } : previous)
      Alert.alert('Enrolled', 'You have been enrolled successfully.')
    } catch (err: unknown) {
      const message = err as { response?: { data?: { message?: string } }; message?: string }
      Alert.alert('Unable to enroll', message.response?.data?.message || message.message || 'Please try again later.')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading course...</Text>
      </View>
    )
  }

  if (error || !course) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <Text style={styles.error}>{error || 'Course not found.'}</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>{course.title}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{course.description || 'Course details coming soon.'}</Text>
        <View style={styles.badgeRow}>
          {course.category ? <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}><Text style={[styles.badgeText, { color: colors.primary }]}>{course.category}</Text></View> : null}
          {course.level ? <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}><Text style={[styles.badgeText, { color: colors.primary }]}>{course.level}</Text></View> : null}
        </View>
        <View style={styles.statsRow}>
          <Text style={[styles.statText, { color: colors.text }]}>★ {(course.rating ?? 0).toFixed(1)}</Text>
          <Text style={[styles.statText, { color: colors.text }]}>{course.enrollmentCount ?? 0} students</Text>
          <Text style={[styles.statText, { color: colors.text }]}>{totalDuration} mins</Text>
        </View>
        <Text style={[styles.instructor, { color: colors.textMuted }]}>Instructor: {course.instructorName || 'Tassy Point Team'}</Text>
        {!isEnrolled ? <TouchableOpacity style={[styles.enrollButton, { backgroundColor: colors.primary }]} onPress={handleEnroll} disabled={enrolling}><Text style={styles.enrollButtonText}>{enrolling ? 'Enrolling...' : 'Enroll Now'}</Text></TouchableOpacity> : <View style={[styles.enrolledPill, { backgroundColor: colors.primaryLight }]}><Text style={[styles.enrolledText, { color: colors.primary }]}>You are enrolled</Text></View>}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Chapters</Text>
      {(course.chapters ?? []).map((chapter) => {
        const expanded = expandedChapterIds[chapter.id]
        return (
          <View key={chapter.id} style={[styles.chapterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.chapterHeader} onPress={() => setExpandedChapterIds((previous) => ({ ...previous, [chapter.id]: !previous[chapter.id] }))}>
              <Text style={[styles.chapterTitle, { color: colors.text }]}>{chapter.title}</Text>
              <Text style={[styles.chapterToggle, { color: colors.primary }]}>{expanded ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
            {expanded ? <View style={styles.lessonList}>{(chapter.lessons ?? []).map((lesson) => <TouchableOpacity key={lesson.id} style={[styles.lessonItem, { borderColor: colors.border }]} onPress={() => navigation.navigate('Lesson', { courseId: course.id, lessonId: lesson.id })}><View style={styles.lessonTextWrap}><Text style={[styles.lessonTitle, { color: colors.text }]}>{lesson.title}</Text><Text style={[styles.lessonMeta, { color: colors.textMuted }]}>{lesson.durationMinutes ?? 0} min</Text></View><Text style={[styles.lessonPlay, { color: colors.primary }]}>▶</Text></TouchableOpacity>)}</View> : null}
          </View>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  heroCard: { borderWidth: 1, borderRadius: 18, padding: 18 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 21, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  badge: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  statText: { fontSize: 13, fontWeight: '600' },
  instructor: { fontSize: 14, marginBottom: 16 },
  enrollButton: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  enrollButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  enrolledPill: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  enrolledText: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  chapterCard: { borderWidth: 1, borderRadius: 16, padding: 16 },
  chapterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  chapterTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
  chapterToggle: { fontSize: 13, fontWeight: '700' },
  lessonList: { marginTop: 12, gap: 10 },
  lessonItem: { borderWidth: 1, borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  lessonTextWrap: { flex: 1, marginRight: 12 },
  lessonTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  lessonMeta: { fontSize: 12 },
  lessonPlay: { fontSize: 20, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
})
