import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator, Dimensions, RefreshControl,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../context/ThemeContext'
import { courseApi, examApi, gamificationApi } from '../../services/api'
import { RootState } from '../../store'

const { width: SW } = Dimensions.get('window')

// ─── helpers ─────────────────────────────────────────────────────────────────
const getList = (d: any): any[] => Array.isArray(d) ? d : Array.isArray(d?.content) ? d.content : []
const safe  = <T,>(p: Promise<T>) => p.catch(() => null)

function ProgressRing({ pct, size = 80, color = '#16a34a', isDark }: { pct: number; size?: number; color?: string; isDark: boolean }) {
  const r = (size - 10) / 2
  const circum = 2 * Math.PI * r
  const filled = (Math.min(100, Math.max(0, pct)) / 100) * circum
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* background ring */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 8, borderColor: isDark ? '#1e293b' : '#e2e8f0' }} />
      {/* progress arc — approximate with rotate trick */}
      <View style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 8, borderColor: 'transparent', borderTopColor: color, transform: [{ rotate: `${(pct / 100) * 360 - 90}deg` }] }} />
      <Text style={{ fontSize: 15, fontWeight: '800', color }}>{pct}%</Text>
    </View>
  )
}

// ─── score badge ─────────────────────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const pct = Math.round(score)
  const { bg, color } = pct >= 75 ? { bg: '#dcfce7', color: '#16a34a' }
    : pct >= 50 ? { bg: '#fef9c3', color: '#ca8a04' }
    : { bg: '#fee2e2', color: '#dc2626' }
  return (
    <View style={{ backgroundColor: bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color, fontSize: 13, fontWeight: '800' }}>{pct}%</Text>
    </View>
  )
}

// ─── stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon, iconBg, iconColor, label, value, isDark }: {
  icon: any; iconBg: string; iconColor: string; label: string; value: string | number; isDark: boolean
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
      <View style={[styles.statIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Text style={[styles.statValue, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>{label}</Text>
    </View>
  )
}

// ─── main ─────────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const navigation  = useNavigation<any>()
  const { isDark }  = useTheme()
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth)

  const [loading, setLoading]           = useState(false)
  const [refreshing, setRefreshing]     = useState(false)
  const [stats, setStats]               = useState<any>(null)
  const [myCourses, setMyCourses]       = useState<any[]>([])
  const [recentAttempts, setRecentAttempts] = useState<any[]>([])

  const bg = isDark ? '#0f172a' : '#f8fafc'

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    const [statsRes, coursesRes, attemptsRes] = await Promise.all([
      safe(gamificationApi.getMyStats()),
      safe(courseApi.getMyCourses()),
      safe(examApi.getRecentAttempts()),
    ])
    if (statsRes)    setStats(statsRes.data)
    if (coursesRes)  setMyCourses(getList(coursesRes.data).slice(0, 5))
    if (attemptsRes) setRecentAttempts(getList(attemptsRes.data).slice(0, 5))
  }, [isAuthenticated])

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))
  }, [load])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const streak = useMemo(() => Number(stats?.currentStreak ?? stats?.streak ?? 0), [stats])
  const points = useMemo(() => Number(stats?.points ?? stats?.totalPoints ?? 0), [stats])
  const badges = useMemo(() => Number(stats?.badges ?? stats?.badgeCount ?? 0), [stats])
  const testsCompleted = useMemo(() => recentAttempts.length, [recentAttempts])

  const avgScore = useMemo(() => {
    if (!recentAttempts.length) return 0
    const sum = recentAttempts.reduce((acc, a) => acc + Number(a?.score ?? a?.percentage ?? 0), 0)
    return Math.round(sum / recentAttempts.length)
  }, [recentAttempts])

  // ── not authenticated ──
  if (!isAuthenticated) {
    return (
      <LinearGradient colors={['#166534', '#16a34a', '#4ade80']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.guestScreen}>
        <View style={styles.guestIconBox}>
          <Ionicons name="lock-closed" size={40} color="#16a34a" />
        </View>
        <Text style={styles.guestTitle}>Your Dashboard</Text>
        <Text style={styles.guestSub}>Login to track your streaks, scores,{'\n'}course progress and more.</Text>
        <TouchableOpacity style={styles.guestBtn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.guestBtnText}>Login to Continue →</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.guestLink}>New here? Register for free</Text>
        </TouchableOpacity>
      </LinearGradient>
    )
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={{ color: isDark ? '#94a3b8' : '#64748b', marginTop: 12 }}>Loading dashboard...</Text>
      </View>
    )
  }

  const hour  = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}>

      {/* ── hero banner ── */}
      <LinearGradient colors={['#166534','#16a34a','#22c55e']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroGreet}>{greet} 👋</Text>
          <Text style={styles.heroName}>{user?.firstName || 'Learner'}</Text>
          <Text style={styles.heroSub}>Keep going — you're doing great!</Text>
        </View>
        <View style={styles.heroRingArea}>
          <ProgressRing pct={avgScore} color="#fff" isDark={isDark} />
          <Text style={styles.heroRingLabel}>Avg Score</Text>
        </View>
      </LinearGradient>

      {/* ── 4 stat cards ── */}
      <View style={styles.statsGrid}>
        <StatCard icon="flame"         iconBg="#fee2e2" iconColor="#ef4444" label="Streak"       value={`${streak} 🔥`} isDark={isDark} />
        <StatCard icon="star"          iconBg="#fef9c3" iconColor="#f59e0b" label="Points"       value={points}          isDark={isDark} />
        <StatCard icon="medal"         iconBg="#ede9fe" iconColor="#9333ea" label="Badges"       value={badges}          isDark={isDark} />
        <StatCard icon="clipboard"     iconBg="#dbeafe" iconColor="#2563eb" label="Tests Done"   value={testsCompleted}  isDark={isDark} />
      </View>

      {/* ── quick actions ── */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>Quick Actions</Text>
      <View style={styles.qaRow}>
        {[
          { label: 'Take a Test',    icon: 'document-text', color: '#16a34a', bg: '#dcfce7', onPress: () => navigation.navigate('Exams') },
          { label: 'My Courses',     icon: 'book',          color: '#2563eb', bg: '#dbeafe', onPress: () => navigation.navigate('Courses') },
          { label: 'Community',      icon: 'chatbubbles',   color: '#9333ea', bg: '#ede9fe', onPress: () => navigation.navigate('Forum') },
          { label: 'Profile',        icon: 'person-circle', color: '#ea580c', bg: '#ffedd5', onPress: () => navigation.navigate('Profile') },
        ].map(a => (
          <TouchableOpacity key={a.label} style={[styles.qaCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]} onPress={a.onPress} activeOpacity={0.82}>
            <View style={[styles.qaIconBox, { backgroundColor: a.bg }]}>
              <Ionicons name={a.icon as any} size={22} color={a.color} />
            </View>
            <Text style={[styles.qaLabel, { color: isDark ? '#f1f5f9' : '#0f172a' }]} numberOfLines={1}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── recent attempts ── */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>Recent Attempts</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Exams')}>
          <Text style={styles.seeAll}>View all</Text>
        </TouchableOpacity>
      </View>

      {recentAttempts.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Ionicons name="clipboard-outline" size={36} color={isDark ? '#334155' : '#cbd5e1'} />
          <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>No attempts yet — take a mock test!</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Exams')}>
            <Text style={styles.emptyBtnText}>Browse Exams</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recentAttempts.map((a, i) => (
          <View key={i} style={[styles.attemptCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <View style={[styles.attemptIconBox, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="clipboard" size={18} color="#2563eb" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.attemptTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]} numberOfLines={1}>
                {a?.testTitle || a?.title || a?.examName || 'Mock Test'}
              </Text>
              <Text style={[styles.attemptMeta, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                {a?.completedAt ? new Date(a.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Completed'}
                {a?.timeTakenSeconds ? ` · ${Math.floor(a.timeTakenSeconds / 60)}m` : ''}
              </Text>
            </View>
            <ScoreBadge score={Number(a?.score ?? a?.percentage ?? 0)} />
          </View>
        ))
      )}

      {/* ── enrolled courses ── */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>My Courses</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
          <Text style={styles.seeAll}>View all</Text>
        </TouchableOpacity>
      </View>

      {myCourses.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Ionicons name="book-outline" size={36} color={isDark ? '#334155' : '#cbd5e1'} />
          <Text style={[styles.emptyText, { color: isDark ? '#94a3b8' : '#64748b' }]}>No enrolled courses yet</Text>
          <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: '#dcfce7' }]} onPress={() => navigation.navigate('Courses')}>
            <Text style={[styles.emptyBtnText, { color: '#16a34a' }]}>Browse Courses</Text>
          </TouchableOpacity>
        </View>
      ) : (
        myCourses.map((course, i) => {
          const pct = Math.max(0, Math.min(100, Number(course?.progressPercentage ?? course?.progress ?? 0)))
          const thumbColors = ['#dcfce7','#dbeafe','#fef9c3','#ede9fe','#ffedd5']
          const iconColors  = ['#16a34a','#2563eb','#ca8a04','#9333ea','#ea580c']
          return (
            <TouchableOpacity
              key={i}
              style={[styles.courseCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
              onPress={() => navigation.navigate('Courses')}
              activeOpacity={0.85}>
              <View style={[styles.courseThumb, { backgroundColor: thumbColors[i % 5] }]}>
                <Ionicons name="book" size={24} color={iconColors[i % 5]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.courseTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]} numberOfLines={1}>
                  {course?.title || 'Course'}
                </Text>
                <View style={styles.progressRow}>
                  <View style={[styles.progressTrack, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
                    <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: iconColors[i % 5] }]} />
                  </View>
                  <Text style={[styles.progressPct, { color: iconColors[i % 5] }]}>{pct}%</Text>
                </View>
                <Text style={[styles.courseMeta, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                  {pct === 100 ? '✅ Completed' : pct > 0 ? 'In progress' : 'Not started'}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })
      )}

      {/* ── motivational footer ── */}
      <LinearGradient colors={['#1e3a8a','#2563eb']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.motivationCard}>
        <Ionicons name="trophy" size={28} color="#fbbf24" style={{ marginBottom: 8 }} />
        <Text style={styles.motivationTitle}>Keep the momentum! 💪</Text>
        <Text style={styles.motivationSub}>
          {streak > 0 ? `${streak}-day streak! Don't break it!` : 'Start your streak — study every day!'}
        </Text>
        <TouchableOpacity style={styles.motivationBtn} onPress={() => navigation.navigate('Exams')}>
          <Text style={styles.motivationBtnText}>Practice Now →</Text>
        </TouchableOpacity>
      </LinearGradient>

    </ScrollView>
  )
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // guest
  guestScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  guestIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  guestTitle: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 10 },
  guestSub: { color: '#bbf7d0', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  guestBtn: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 12, paddingHorizontal: 32, marginBottom: 14 },
  guestBtnText: { color: '#16a34a', fontSize: 15, fontWeight: '800' },
  guestLink: { color: '#bbf7d0', fontSize: 13, textDecorationLine: 'underline' },

  // hero
  heroBanner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 22 },
  heroGreet: { color: '#bbf7d0', fontSize: 13, fontWeight: '600' },
  heroName: { color: '#fff', fontSize: 24, fontWeight: '800', marginVertical: 2 },
  heroSub: { color: '#dcfce7', fontSize: 13 },
  heroRingArea: { alignItems: 'center' },
  heroRingLabel: { color: '#dcfce7', fontSize: 11, marginTop: 4 },

  // stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, paddingTop: 16, paddingBottom: 4 },
  statCard: { width: (SW - 44) / 2, borderRadius: 16, padding: 14, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },

  // section headers
  sectionTitle: { fontSize: 17, fontWeight: '800', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginTop: 20, marginBottom: 10 },
  seeAll: { color: '#16a34a', fontSize: 13, fontWeight: '600' },

  // quick actions
  qaRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 10 },
  qaCard: { flex: 1, borderRadius: 16, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  qaIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  qaLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // attempts
  attemptCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginBottom: 10, borderRadius: 16, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  attemptIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  attemptTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  attemptMeta: { fontSize: 12 },

  // courses
  courseCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginBottom: 10, borderRadius: 16, padding: 12, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  courseThumb: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  courseTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 6, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressPct: { fontSize: 12, fontWeight: '700', width: 32 },
  courseMeta: { fontSize: 11, marginTop: 2 },

  // empty state
  emptyCard: { marginHorizontal: 14, borderRadius: 16, padding: 24, alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  emptyBtn: { backgroundColor: '#dbeafe', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 18 },
  emptyBtnText: { color: '#2563eb', fontSize: 13, fontWeight: '700' },

  // motivation footer
  motivationCard: { marginHorizontal: 14, marginTop: 20, borderRadius: 20, padding: 22, alignItems: 'center' },
  motivationTitle: { color: '#fff', fontSize: 18, fontWeight: '800', marginBottom: 4 },
  motivationSub: { color: '#bfdbfe', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  motivationBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingVertical: 10, paddingHorizontal: 28 },
  motivationBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
})