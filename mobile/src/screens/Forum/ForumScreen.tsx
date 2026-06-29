import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../context/ThemeContext'
import { forumApi } from '../../services/api'

const getPosts = (data: any) => {
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

export default function ForumScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const loadPosts = async () => {
      setLoading(true)
      try {
        const response = await withTimeout(forumApi.listPosts())
        if (!active) return
        setPosts(getPosts(response.data))
        setError('')
      } catch (err: any) {
        if (!active) return
        setError(err?.response?.data?.message || err?.message || 'Unable to load forum posts right now.')
        setPosts([])
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPosts()

    return () => {
      active = false
    }
  }, [])

  const contentContainerStyle = useMemo(
    () => (posts.length === 0 ? styles.emptyList : styles.listContent),
    [posts.length]
  )

  const handleNewPost = useCallback(() => {
    Alert.alert('New Post', 'Login to post')
  }, [])

  const handleOpenPost = useCallback((postId: number) => {
    navigation.navigate('ForumPost', { postId })
  }, [navigation])

  const renderItem = useCallback(({ item }: { item: any }) => {
    const authorName = [item?.author?.firstName, item?.author?.lastName].filter(Boolean).join(' ') || 'Community member'

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => handleOpenPost(item.id)}
        activeOpacity={0.88}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {item?.title || 'Forum discussion'}
        </Text>
        <Text style={[styles.author, { color: colors.textMuted }]} numberOfLines={1}>
          by {authorName}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>⬆️ {item?.upvotes ?? 0}</Text>
          <Text style={[styles.metaText, { color: colors.textMuted }]}>💬 {item?.commentCount ?? item?.replyCount ?? 0}</Text>
        </View>
      </TouchableOpacity>
    )
  }, [colors.border, colors.card, colors.text, colors.textMuted, handleOpenPost])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading community posts...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Farmers' community</Text>
        <TouchableOpacity style={[styles.newPostButton, { backgroundColor: colors.primary }]} onPress={handleNewPost}>
          <Text style={styles.newPostText}>New Post</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={[styles.messageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.errorTitle}>Couldn't load forum posts</Text>
          <Text style={[styles.errorText, { color: colors.textMuted }]}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={posts}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !error ? (
            <View style={styles.center}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No posts yet</Text>
              <Text style={[styles.helperText, { color: colors.textMuted }]}>
                Community discussions will show up here soon.
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '700' },
  newPostButton: { borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  newPostText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  listContent: { padding: 16, paddingTop: 8, gap: 12 },
  emptyList: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: { borderWidth: 1, borderRadius: 18, padding: 16 },
  title: { fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 8 },
  author: { fontSize: 13, marginBottom: 12 },
  metaRow: { flexDirection: 'row', gap: 16 },
  metaText: { fontSize: 13, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 10 },
  emptyEmoji: { fontSize: 42, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  messageCard: { borderWidth: 1, borderRadius: 16, marginHorizontal: 16, marginBottom: 8, padding: 14 },
  errorTitle: { color: '#dc2626', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  errorText: { fontSize: 13, lineHeight: 18 },
})
