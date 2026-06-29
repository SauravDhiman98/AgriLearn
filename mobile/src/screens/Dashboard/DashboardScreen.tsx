import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { courseApi, examApi, gamificationApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

const getItems = (data: any) => Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : []
const getProgressValue = (course: any) => {
  const raw = course?.progressPercentage ?? course?.progressPercent ?? course?.progress ?? course?.completion ?? 0
  const numeric = Number(raw)
  if (Number.isNaN(numeric)) return 0
  return Math.max(0, Math.min(100, numeric))
}
const getAttemptTitle = (attempt: any) => attempt?.mockTestTitle || attempt?.testName || attempt?.title || attempt?.mockTest?.title || 'Mock Test'
const getAttemptScore = (attempt: any) => attempt?.score ?? attempt?.percentage ?? attempt?.marksObtained ?? 0
const getAttemptDate = (attempt: any) => attempt?.completedAt || attempt?.submittedAt || attempt?.attemptedAt || attempt?.createdAt

export default function DashboardScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const [stats, setStats] = useState({ streak: 0, points: 0, badges: 0 })
  const [courses, setCourses] = useState<any[]>([])
  const [attempts, setAttempts] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadDashboard = async () => {
      if (!isAuthenticated) return
      setLoading(true)
      try {
        const [statsRes, coursesRes, attemptsRes] = await Promise.all([
          gamificationApi.getMyStats(),
          courseApi.getMyCourses(),
          examApi.getRecentAttempts(),
        ])

        const statsData = statsRes.data || {}
        const badges = Array.isArray(statsData.badges)
          ? statsData.badges.length
          : Number(statsData.badgesCount ?? statsData.totalBadges ?? 0)

        if (!mounted) return
        setStats({
          streak: Number(statsData.streak ?? statsData.currentStreak ?? statsData.streakDays ?? 0),
          points: Number(statsData.points ?? statsData.totalPoints ?? statsData.xp ?? 0),
          badges,
        })
        setCourses(getItems(coursesRes.data).slice(0, 3))
        setAttempts(getItems(attemptsRes.data).slice(0, 3))
        setError('')
      } catch (err: any) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Unable to load your dashboard right now')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDashboard()
    return () => { mounted = false }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.guestTitle, { color: colors.text }]}>Please login to view your dashboard</Text>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.helperText, { color: colors.textMuted }]}>Loading dashboard...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.welcomeLabel, { color: colors.textMuted }]}>Welcome back</Text>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>{user?.firstName || 'Learner'}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.statsRow}>
        {[
          { label: 'Streak', value: `🔥 ${stats.streak} days` },
          { label: 'Points', value: `⭐ ${stats.points}` },
          { label: 'Badges', value: `🏅 ${stats.badges}` },
        ].map(item => (
          <View key={item.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Attempts</Text>
        {attempts.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.helperText, { color: colors.textMuted }]}>No recent mock test attempts yet.</Text>
          </View>
        ) : (
          attempts.map((attempt, index) => (
            <View key={String(attempt.id ?? index)} style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.listTitle, { color: colors.text }]}>{getAttemptTitle(attempt)}</Text>
              <Text style={[styles.listMeta, { color: colors.textMuted }]}>Score: {getAttemptScore(attempt)}</Text>
              <Text style={[styles.listMeta, { color: colors.textMuted }]}>
                {getAttemptDate(attempt) ? new Date(getAttemptDate(attempt)).toLocaleDateString() : 'Date unavailable'}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Courses</Text>
        {courses.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.helperText, { color: colors.textMuted }]}>You have not enrolled in any courses yet.</Text>
          </View>
        ) : (
          courses.map((course) => {
            const progress = getProgressValue(course)
            return (
              <View key={String(course.id)} style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.listTitle, { color: colors.text }]}>{course.title}</Text>
                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progress}%` }]} />
                </View>
                <Text style={[styles.listMeta, { color: colors.textMuted }]}>{progress}% complete</Text>
              </View>
            )
          })
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  guestTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  primaryButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  helperText: { fontSize: 14, textAlign: 'center' },
  headerCard: { borderWidth: 1, borderRadius: 18, padding: 18 },
  welcomeLabel: { fontSize: 13, marginBottom: 4 },
  welcomeTitle: { fontSize: 26, fontWeight: '700' },
  error: { color: '#dc2626', fontSize: 13, paddingHorizontal: 4 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 14 },
  statLabel: { fontSize: 12, marginBottom: 6 },
  statValue: { fontSize: 16, fontWeight: '700' },
  section: { gap: 10 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  emptyCard: { borderWidth: 1, borderRadius: 16, padding: 18 },
  listCard: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 8 },
  listTitle: { fontSize: 16, fontWeight: '700' },
  listMeta: { fontSize: 13 },
  progressTrack: { height: 10, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
})
