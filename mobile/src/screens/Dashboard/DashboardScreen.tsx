import { useCallback, useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { useTheme } from '../../context/ThemeContext'
import { courseApi, examApi, gamificationApi } from '../../services/api'
import { RootState } from '../../store'

const getList = (data: any) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  return []
}

const wait = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs))

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

const getProgressValue = (course: any) => {
  const raw = course?.progressPercentage ?? course?.progress ?? course?.completionPercent ?? 0
  const normalized = Number(raw)
  if (Number.isNaN(normalized)) return 0
  return Math.max(0, Math.min(100, normalized))
}

export default function DashboardScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [myCourses, setMyCourses] = useState<any[]>([])
  const [recentAttempts, setRecentAttempts] = useState<any[]>([])
  const [errorMessages, setErrorMessages] = useState<string[]>([])

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      if (!isAuthenticated) {
        setStats(null)
        setMyCourses([])
        setRecentAttempts([])
        setErrorMessages([])
        setLoading(false)
        return
      }

      setLoading(true)
      setErrorMessages([])

      await wait(500)
      if (!active) return

      const nextErrors: string[] = []

      try {
        const statsResponse = await withTimeout(gamificationApi.getMyStats())
        if (active) setStats(statsResponse.data)
      } catch (err: any) {
        if (active) {
          setStats(null)
          nextErrors.push(err?.response?.data?.message || err?.message || 'Unable to load your stats.')
        }
      }

      try {
        const coursesResponse = await withTimeout(courseApi.getMyCourses())
        if (active) setMyCourses(getList(coursesResponse.data).slice(0, 3))
      } catch (err: any) {
        if (active) {
          setMyCourses([])
          nextErrors.push(err?.response?.data?.message || err?.message || 'Unable to load your courses.')
        }
      }

      try {
        const attemptsResponse = await withTimeout(examApi.getRecentAttempts())
        if (active) setRecentAttempts(getList(attemptsResponse.data).slice(0, 3))
      } catch (err: any) {
        if (active) {
          setRecentAttempts([])
          nextErrors.push(err?.response?.data?.message || err?.message || 'Unable to load recent attempts.')
        }
      }

      if (active) {
        setErrorMessages(nextErrors)
        setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [isAuthenticated])

  const handleLoginPress = useCallback(() => {
    navigation.navigate('Login')
  }, [navigation])

  const streak = useMemo(() => Number(stats?.currentStreak ?? stats?.streak ?? 0), [stats])
  const points = useMemo(() => Number(stats?.points ?? stats?.totalPoints ?? 0), [stats])
  const badges = useMemo(() => Number(stats?.badges ?? stats?.badgeCount ?? stats?.totalBadges ?? 0), [stats])

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <Text style={styles.emptyEmoji}>🔐</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Login to view your dashboard</Text>
        <Text style={[styles.helperText, { color: colors.textMuted }]}>
          Track streaks, mock test attempts, and course progress after signing in.
        </Text>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleLoginPress}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading your dashboard...</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.welcomeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>Hello, {user?.firstName || 'Learner'} 👋</Text>
        <Text style={[styles.helperText, { color: colors.textMuted, textAlign: 'left', marginTop: 6 }]}>
          Your exam prep snapshot for today.
        </Text>
      </View>

      {errorMessages.length > 0 ? (
        <View style={[styles.warningCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.warningTitle}>Some sections could not be refreshed</Text>
          {errorMessages.map((message, index) => (
            <Text key={`${message}-${index}`} style={[styles.warningText, { color: colors.textMuted }]}>
              • {message}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your progress</Text>
      </View>

      <View style={styles.statsRow}>
        {[
          { key: 'streak', emoji: '🔥', label: 'Streak', value: streak },
          { key: 'points', emoji: '⭐', label: 'Points', value: points },
          { key: 'badges', emoji: '🏅', label: 'Badges', value: badges },
        ].map((item) => (
          <View key={item.key} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>{item.emoji}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent attempts</Text>
      </View>

      {recentAttempts.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.emptyEmoji}>📝</Text>
          <Text style={[styles.emptyText, { color: colors.text }]}>No recent attempts yet.</Text>
        </View>
      ) : (
        recentAttempts.map((attempt) => (
          <View key={String(attempt.id ?? attempt.testId ?? attempt.createdAt)} style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
              {attempt?.testTitle || attempt?.title || attempt?.examName || 'Mock test'}
            </Text>
            <Text style={[styles.listMeta, { color: colors.textMuted }]}>
              Score: {attempt?.score ?? attempt?.percentage ?? 0}
              {attempt?.completedAt ? ` • ${new Date(attempt.completedAt).toLocaleDateString()}` : ''}
            </Text>
          </View>
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My courses</Text>
      </View>

      {myCourses.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={[styles.emptyText, { color: colors.text }]}>You haven't enrolled in any course yet.</Text>
        </View>
      ) : (
        myCourses.map((course) => {
          const progress = getProgressValue(course)

          return (
            <View key={String(course.id)} style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>
                {course?.title || 'Course'}
              </Text>
              <Text style={[styles.listMeta, { color: colors.textMuted }]}>
                Progress: {progress}%
              </Text>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
              </View>
            </View>
          )
        })
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  welcomeCard: { borderWidth: 1, borderRadius: 20, padding: 18, marginBottom: 16 },
  welcomeTitle: { fontSize: 22, fontWeight: '700' },
  sectionHeader: { marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  helperText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statEmoji: { fontSize: 26, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 13, marginTop: 4 },
  listCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 12 },
  listTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  listMeta: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 12 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center' },
  primaryButton: { marginTop: 18, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  warningCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 16 },
  warningTitle: { color: '#b45309', fontSize: 15, fontWeight: '700', marginBottom: 6 },
  warningText: { fontSize: 13, lineHeight: 18, marginTop: 2 },
})
