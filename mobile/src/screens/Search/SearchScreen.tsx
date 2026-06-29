import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { searchApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

interface SearchResultItem {
  id: number
  type: 'course' | 'exam' | 'chapter'
  title: string
  description?: string
}

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

const getItems = <T,>(data: unknown): T[] => Array.isArray(data)
  ? data as T[]
  : Array.isArray((data as { content?: unknown[] } | null | undefined)?.content)
    ? ((data as { content?: T[] }).content ?? [])
    : []

export default function SearchScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setLoading(false)
      setError('')
      setSearched(false)
      return
    }

    let active = true
    const timer = setTimeout(() => {
      const run = async () => {
        setLoading(true)
        try {
          await wait(500)
          const response = await searchApi.search(trimmed)
          if (!active) return
          setResults(getItems<SearchResultItem>(response.data))
          setError('')
          setSearched(true)
        } catch (err: unknown) {
          if (!active) return
          const message = err as { response?: { data?: { message?: string } }; message?: string }
          setError(message.response?.data?.message || message.message || 'Unable to search right now.')
          setResults([])
          setSearched(true)
        } finally {
          if (active) setLoading(false)
        }
      }
      void run()
    }, 350)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query])

  const handleOpenResult = (item: SearchResultItem) => {
    if (item.type === 'course') {
      navigation.navigate('CourseDetail', { courseId: item.id })
      return
    }
    if (item.type === 'exam') {
      navigation.navigate('ExamDetail', { examId: item.id })
      return
    }
    navigation.navigate('ChapterDetail', { chapterId: item.id })
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={styles.searchIcon}>🔎</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search courses, exams, chapters"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { color: colors.text }]}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.helperText, { color: colors.textMuted }]}>Searching...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => `${item.type}-${item.id}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={results.length === 0 ? styles.emptyList : styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.resultCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => handleOpenResult(item)}>
              <View style={[styles.typeBadge, { backgroundColor: colors.primaryLight }]}><Text style={[styles.typeBadgeText, { color: colors.primary }]}>{item.type}</Text></View>
              <Text style={[styles.resultTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.resultDescription, { color: colors.textMuted }]} numberOfLines={2}>{item.description || 'Open to view full details.'}</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyEmoji}>🔍</Text><Text style={[styles.emptyTitle, { color: colors.text }]}>{error ? 'Search unavailable' : searched ? 'No results found' : 'Start searching'}</Text><Text style={[styles.helperText, { color: colors.textMuted }]}>{error || (searched ? 'Try a different keyword.' : 'Results will appear here as you type.')}</Text></View>}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  searchBar: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center' },
  searchIcon: { fontSize: 18, marginRight: 8 },
  input: { flex: 1, fontSize: 15 },
  listContent: { paddingTop: 16, gap: 12 },
  emptyList: { flexGrow: 1, justifyContent: 'center', paddingTop: 16 },
  resultCard: { borderWidth: 1, borderRadius: 16, padding: 16 },
  typeBadge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 },
  typeBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  resultTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  resultDescription: { fontSize: 13, lineHeight: 18 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
})
