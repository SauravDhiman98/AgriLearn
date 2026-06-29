import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { forumApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

interface ForumComment {
  id: number
  content: string
  authorName?: string
  createdAt?: string
  accepted?: boolean
}

interface ForumPost {
  id: number
  title: string
  content: string
  tags?: string[] | string
  upvotes?: number
  authorName?: string
  createdAt?: string
  comments?: ForumComment[]
  author?: { firstName?: string; lastName?: string }
}

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString() : 'Recently'

export default function ForumPostScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { colors } = useTheme()
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const postId = Number(route.params?.postId)

  const [post, setPost] = useState<ForumPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentText, setCommentText] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [upvoting, setUpvoting] = useState(false)

  const loadPost = useCallback(async () => {
    setLoading(true)
    try {
      await wait(500)
      const response = await forumApi.getPost(postId)
      setPost(response.data as ForumPost)
      setError('')
    } catch (err: unknown) {
      const message = err as { response?: { data?: { message?: string } }; message?: string }
      setError(message.response?.data?.message || message.message || 'Unable to load the discussion right now.')
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (postId) void loadPost()
    else {
      setError('Post not found')
      setLoading(false)
    }
  }, [loadPost, postId])

  const authorName = useMemo(() => post?.authorName || [post?.author?.firstName, post?.author?.lastName].filter(Boolean).join(' ') || 'Community member', [post?.author?.firstName, post?.author?.lastName, post?.authorName])
  const tags = useMemo(() => Array.isArray(post?.tags) ? post.tags : typeof post?.tags === 'string' ? post.tags.split(',').map((item) => item.trim()).filter(Boolean) : [] as string[], [post?.tags])

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      Alert.alert('Login required', 'Please login to upvote this post.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Login', onPress: () => navigation.navigate('Login') }])
      return
    }
    try {
      setUpvoting(true)
      await forumApi.upvotePost(postId)
      await loadPost()
    } catch (err: unknown) {
      const message = err as { response?: { data?: { message?: string } }; message?: string }
      Alert.alert('Unable to upvote', message.response?.data?.message || message.message || 'Please try again later.')
    } finally {
      setUpvoting(false)
    }
  }

  const handleAddComment = async () => {
    const text = commentText.trim()
    if (!text) return
    if (!isAuthenticated) {
      Alert.alert('Login required', 'Please login to reply.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Login', onPress: () => navigation.navigate('Login') }])
      return
    }
    try {
      setSubmittingComment(true)
      await forumApi.addComment(postId, text)
      setCommentText('')
      await loadPost()
      Alert.alert('Reply added', 'Your comment has been posted.')
    } catch (err: unknown) {
      const message = err as { response?: { data?: { message?: string } }; message?: string }
      Alert.alert('Unable to reply', message.response?.data?.message || message.message || 'Please try again later.')
    } finally {
      setSubmittingComment(false)
    }
  }

  if (loading) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /><Text style={[styles.helperText, { color: colors.textMuted }]}>Loading post...</Text></View>
  }

  if (error || !post) {
    return <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}><Text style={styles.error}>{error || 'Post not found.'}</Text></View>
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.title, { color: colors.text }]}>{post.title}</Text><Text style={[styles.meta, { color: colors.textMuted }]}>By {authorName} • {formatDate(post.createdAt)}</Text><Text style={[styles.contentText, { color: colors.text }]}>{post.content}</Text><View style={styles.tagsRow}>{tags.map((tag) => <View key={tag} style={[styles.tagChip, { backgroundColor: colors.primaryLight }]}><Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text></View>)}</View><TouchableOpacity style={[styles.upvoteButton, { backgroundColor: colors.primary }]} onPress={handleUpvote} disabled={upvoting}><Text style={styles.upvoteButtonText}>{upvoting ? 'Updating...' : `⬆ Upvote (${post.upvotes ?? 0})`}</Text></TouchableOpacity></View>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{post.comments?.length ?? 0} Replies</Text>
      {(post.comments ?? []).map((comment) => <View key={comment.id} style={[styles.commentCard, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.commentHeader}><Text style={[styles.commentAuthor, { color: colors.text }]}>{comment.authorName || 'Community member'}</Text>{comment.accepted ? <View style={[styles.acceptedBadge, { backgroundColor: colors.primaryLight }]}><Text style={[styles.acceptedText, { color: colors.primary }]}>Accepted</Text></View> : null}</View><Text style={[styles.commentDate, { color: colors.textMuted }]}>{formatDate(comment.createdAt)}</Text><Text style={[styles.commentContent, { color: colors.text }]}>{comment.content}</Text></View>)}
      <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={[styles.formTitle, { color: colors.text }]}>Add a reply</Text>{!isAuthenticated ? <TouchableOpacity style={[styles.loginPrompt, { backgroundColor: colors.primaryLight }]} onPress={() => navigation.navigate('Login')}><Text style={[styles.loginPromptText, { color: colors.primary }]}>Login to add a comment</Text></TouchableOpacity> : null}<TextInput value={commentText} onChangeText={setCommentText} placeholder="Write your comment" placeholderTextColor={colors.textMuted} multiline style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} /><TouchableOpacity style={[styles.submitButton, { backgroundColor: colors.primary }]} onPress={handleAddComment} disabled={submittingComment || !commentText.trim()}><Text style={styles.submitButtonText}>{submittingComment ? 'Posting...' : 'Submit Reply'}</Text></TouchableOpacity></View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  card: { borderWidth: 1, borderRadius: 18, padding: 18 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  meta: { fontSize: 13, marginBottom: 14 },
  contentText: { fontSize: 15, lineHeight: 23, marginBottom: 14 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagChip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { fontSize: 12, fontWeight: '700' },
  upvoteButton: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 },
  upvoteButtonText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  commentCard: { borderWidth: 1, borderRadius: 16, padding: 16 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  commentAuthor: { flex: 1, fontSize: 15, fontWeight: '700' },
  acceptedBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  acceptedText: { fontSize: 11, fontWeight: '700' },
  commentDate: { fontSize: 12, marginTop: 4, marginBottom: 10 },
  commentContent: { fontSize: 14, lineHeight: 21 },
  formCard: { borderWidth: 1, borderRadius: 18, padding: 18 },
  formTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  loginPrompt: { borderRadius: 12, padding: 12, marginBottom: 12 },
  loginPromptText: { fontSize: 13, fontWeight: '700' },
  input: { borderWidth: 1, borderRadius: 14, minHeight: 110, padding: 14, textAlignVertical: 'top', marginBottom: 12 },
  submitButton: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  submitButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  helperText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  error: { color: '#dc2626', fontSize: 14, textAlign: 'center' },
})
