import { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { courseApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

const getCourses = (data: any) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  return []
}

export default function CoursesScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const [courses, setCourses] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    courseApi.list()
      .then(res => {
        setCourses(getCourses(res.data))
        setError('')
      })
      .catch(err => setError(err?.response?.data?.message || 'Unable to load courses right now'))
      .finally(() => setLoading(false))
  }, [])

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return courses
    return courses.filter(course => {
      const title = String(course?.title || '').toLowerCase()
      const description = String(course?.description || '').toLowerCase()
      return title.includes(query) || description.includes(query)
    })
  }, [courses, search])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading courses...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Study Material</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search courses"
          placeholderTextColor={colors.textMuted}
          style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={filteredCourses.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.navigate('CourseDetail', { courseId: item.id })}>
            <View style={[styles.thumbnail, { backgroundColor: colors.primaryLight }]}>
              <Text style={styles.thumbnailText}>📚</Text>
            </View>
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
                <View style={[styles.badge, { backgroundColor: item.free ? colors.primaryLight : '#fef3c7' }]}>
                  <Text style={[styles.badgeText, { color: item.free ? colors.primary : '#b45309' }]}>
                    {item.free ? 'Free' : `₹${item.price?.toLocaleString?.() ?? item.price}`}
                  </Text>
                </View>
              </View>
              <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
                {item.description || 'Exam-focused learning content for agri aspirants.'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>📘</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No courses found</Text>
            <Text style={[styles.helperText, { color: colors.textMuted }]}>
              {search ? 'Try a different keyword.' : 'Courses will appear here once available.'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  searchInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  error: { color: '#dc2626', paddingHorizontal: 16, paddingBottom: 8, fontSize: 13 },
  listContent: { padding: 16, paddingTop: 8, gap: 12 },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  thumbnail: { height: 120, alignItems: 'center', justifyContent: 'center' },
  thumbnailText: { fontSize: 38 },
  cardBody: { padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 8 },
  courseTitle: { flex: 1, fontSize: 16, fontWeight: '700', lineHeight: 22 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  description: { fontSize: 13, lineHeight: 18 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 42, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  helperText: { fontSize: 14, marginTop: 10, textAlign: 'center' },
})
