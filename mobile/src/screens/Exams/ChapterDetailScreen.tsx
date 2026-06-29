import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { WebView } from 'react-native-webview'
import { RootState } from '../../store'
import { examApi, API_ORIGIN } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

interface NoteItem {
  id: number
  title: string
  fileUrl?: string
  fileType?: string
  content?: string
}

interface VideoItem {
  id: number
  title: string
  youtubeId?: string
  youtubeUrl?: string
}

interface TestItem {
  id: number
  title: string
  questionCount?: number
  timeLimitMinutes?: number
}

interface ChapterDetail {
  id: number
  title: string
  subjectName?: string
  examName?: string
  notes?: NoteItem[]
  videos?: VideoItem[]
  tests?: TestItem[]
}

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

const extractYoutubeId = (url?: string) => {
  if (!url) return ''
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  return match?.[1] || ''
}

export default function ChapterDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { colors } = useTheme()
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const chapterId = Number(route.params?.chapterId)

  const [chapter, setChapter] = useState<ChapterDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'notes' | 'videos' | 'tests'>('notes')

  useEffect(() => {
    let active = true

    const loadChapter = async () => {
      setLoading(true)
      try {
        await wait(500)
        const response = await examApi.getChapter(chapterId)
        if (!active) return
        setChapter(response.data as ChapterDetail)
        setError('')
      } catch (err: unknown) {
        if (!active) return
        const message = err as { response?: { data?: { message?: string } }; message?: string }
        setError(message.response?.data?.message || message.message || 'Unable to load chapter right now.')
      } finally {
        if (active) setLoading(false)
      }
    }

    if (chapterId) loadChapter()
    else {
      setError('Chapter not found')
      setLoading(false)
    }

    return () => { active = false }
  }, [chapterId])

  const tabs = useMemo(() => ['notes', 'videos', 'tests'] as const, [])

  const resolveUrl = (url?: string): string | null => {
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return API_ORIGIN + url
  }

  const handleOpenNote = async (note: NoteItem) => {
    const url = resolveUrl(note.fileUrl)
    if (url) {
      try {
        await Linking.openURL(url)
      } catch {
        Alert.alert('Error', 'Could not open this file.')
      }
    } else if (note.content) {
      Alert.alert(note.title, note.content)
    } else {
      Alert.alert('Unavailable', 'No content available for this note.')
    }
  }

  const handleStartTest = (testId: number) => {
    if (!isAuthenticated) {
      Alert.alert('Login required', 'Please login to start this test.', [
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
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading chapter...</Text>
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
        <Text style={[styles.title, { color: colors.text }]}>{chapter?.title || 'Chapter'}</Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>
          {[chapter?.subjectName, chapter?.examName].filter(Boolean).join(' • ') || 'Exam Content'}
        </Text>
      </View>

      <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {tabs.map((tab) => {
          const selected = activeTab === tab
          return (
            <TouchableOpacity key={tab} style={[styles.tabButton, { backgroundColor: selected ? colors.primary : 'transparent' }]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, { color: selected ? '#ffffff' : colors.textMuted }]}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {activeTab === 'notes' ? (
        (chapter?.notes ?? []).length ? (
          (chapter?.notes ?? []).map((note) => (
            <TouchableOpacity key={note.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => handleOpenNote(note)}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{note.title}</Text>
              {note.fileUrl ? <Text style={[styles.linkText, { color: colors.primary }]}>📄 Open {note.fileType?.toUpperCase() || 'File'} ↗</Text> : null}
              {!note.fileUrl && note.content ? <Text style={[styles.bodyText, { color: colors.textMuted }]} numberOfLines={3}>{note.content}</Text> : null}
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notes yet</Text>
          </View>
        )
      ) : activeTab === 'videos' ? (
        (chapter?.videos ?? []).length ? (
          (chapter?.videos ?? []).map((video) => {
            const ytId = video.youtubeId || extractYoutubeId(video.youtubeUrl)
            const ytHtml = `<html><body style="margin:0;padding:0;background:#000"><iframe width="100%" height="100%" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen></iframe></body></html>`
            return (
              <View key={video.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{video.title}</Text>
                {ytId ? <WebView source={{ html: ytHtml }} style={styles.videoFrame} /> : <View style={[styles.videoFallback, { backgroundColor: colors.primaryLight }]}><Text style={[styles.bodyText, { color: colors.textMuted }]}>Video link unavailable for embedding.</Text></View>}
              </View>
            )
          })
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>🎥</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No videos yet</Text>
          </View>
        )
      ) : (
        (chapter?.tests ?? []).length ? (
          (chapter?.tests ?? []).map((test) => (
            <View key={test.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{test.title}</Text>
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>Questions: {test.questionCount ?? 0}</Text>
              <Text style={[styles.bodyText, { color: colors.textMuted }]}>Time: {test.timeLimitMinutes ?? 0} minutes</Text>
              <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => handleStartTest(test.id)}>
                <Text style={styles.actionButtonText}>Start Test</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>🧪</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No tests yet</Text>
          </View>
        )
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  headerCard: { borderWidth: 1, borderRadius: 18, padding: 18 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 14, fontWeight: '700' },
  tabBar: { borderWidth: 1, borderRadius: 14, padding: 4, flexDirection: 'row' },
  tabButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '700' },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  bodyText: { fontSize: 13, lineHeight: 18 },
  linkText: { fontSize: 13, fontWeight: '700' },
  videoFrame: { height: 200, borderRadius: 12, overflow: 'hidden' },
  videoFallback: { borderRadius: 12, padding: 18, minHeight: 80, justifyContent: 'center' },
  actionButton: { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
  actionButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 24, alignItems: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
})
