import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useTheme } from '../../context/ThemeContext'
import { RootState } from '../../store'
import { examApi, courseApi } from '../../services/api'

const { width: SCREEN_W } = Dimensions.get('window')

// ─── data ────────────────────────────────────────────────────────────────────
const PRACTICE_CARDS = [
  { key: 'mock',    label: 'Mock Tests',    sub: '50+ Exams',   badge: 'Latest',    badgeColor: '#3b82f6', icon: 'document-text' as const,  iconBg: '#dbeafe' },
  { key: 'free',    label: 'Free Tests',    sub: '10k+ Tests',  badge: 'Topic Wise', badgeColor: '#16a34a', icon: 'list'          as const,  iconBg: '#dcfce7' },
  { key: 'live',    label: 'Live Tests',    sub: 'Upcoming: 2', badge: 'Weekly',    badgeColor: '#ef4444', icon: 'radio'         as const,  iconBg: '#fee2e2' },
]

const QUICK_ACTIONS = [
  { key: 'practice',  label: 'Practice',     icon: 'flash'           as const, bg: '#fff7ed', color: '#ea580c', badge: null },
  { key: 'challenge', label: 'Challenge',    icon: 'trophy'          as const, bg: '#f0fdf4', color: '#16a34a', badge: '10 Mins' },
  { key: 'quiz',      label: 'Daily Quiz',   icon: 'help-circle'     as const, bg: '#eff6ff', color: '#2563eb', badge: 'Daily' },
  { key: 'papers',    label: 'Prev Papers',  icon: 'newspaper'       as const, bg: '#fdf4ff', color: '#9333ea', badge: null },
  { key: 'bookmarks', label: 'Bookmarks',    icon: 'bookmark'        as const, bg: '#fff1f2', color: '#e11d48', badge: null },
]

const EXAM_CHIPS = [
  { key: 'ibps',    label: 'IBPS AFO',  color: '#16a34a' },
  { key: 'nabard',  label: 'NABARD',    color: '#2563eb' },
  { key: 'fci',     label: 'FCI',       color: '#ea580c' },
  { key: 'upcatet', label: 'UPCATET',   color: '#9333ea' },
  { key: 'iari',    label: 'IARI',      color: '#0891b2' },
  { key: 'afo',     label: 'AFO State', color: '#65a30d' },
]

// ─── sub-components ───────────────────────────────────────────────────────────
function PracticeCard({ item, onPress }: { item: typeof PRACTICE_CARDS[0]; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.practiceCard} onPress={onPress} activeOpacity={0.82}>
      <View style={styles.practiceCardTop}>
        <View style={[styles.practiceIconBox, { backgroundColor: item.iconBg }]}>
          <Ionicons name={item.icon} size={22} color={item.badgeColor} />
        </View>
        <View style={[styles.practiceBadge, { backgroundColor: item.badgeColor }]}>
          <Text style={styles.practiceBadgeText}>{item.badge}</Text>
        </View>
      </View>
      <Text style={styles.practiceCardLabel}>{item.label}</Text>
      <Text style={styles.practiceCardSub}>{item.sub}</Text>
      <View style={styles.practiceArrowBox}>
        <Ionicons name="arrow-forward" size={14} color="#fff" />
      </View>
    </TouchableOpacity>
  )
}

function QuickActionBtn({ item, onPress }: { item: typeof QUICK_ACTIONS[0]; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.qaBtn} onPress={onPress} activeOpacity={0.8}>
      {item.badge && (
        <View style={[styles.qaBadge, { backgroundColor: item.color }]}>
          <Text style={styles.qaBadgeText}>{item.badge}</Text>
        </View>
      )}
      <View style={[styles.qaIconCircle, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={styles.qaLabel} numberOfLines={1}>{item.label}</Text>
    </TouchableOpacity>
  )
}

function ExamChip({ item, onPress }: { item: typeof EXAM_CHIPS[0]; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.examChip, { borderColor: item.color + '44', backgroundColor: item.color + '11' }]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text style={[styles.examChipText, { color: item.color }]}>{item.label}</Text>
    </TouchableOpacity>
  )
}

// ─── main screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation<any>()
  const { colors, isDark } = useTheme()
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({ streak: 0, totalPoints: 0, examCount: 0 })

  useEffect(() => {
    loadStats()
  }, [isAuthenticated])

  const loadStats = async () => {
    try {
      const [examRes] = await Promise.allSettled([examApi.list()])
      const examCount = examRes.status === 'fulfilled' ? examRes.value.data?.length ?? 0 : 0
      setStats(prev => ({
        ...prev,
        streak: user?.streakCount ?? 0,
        totalPoints: user?.totalPoints ?? 0,
        examCount,
      }))
    } catch { /* ignore */ }
  }

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }, [])

  const handlePracticeCard = (key: string) => {
    if (key === 'mock' || key === 'live' || key === 'free') navigation.navigate('Exams')
  }

  const handleQuickAction = (key: string) => {
    switch (key) {
      case 'practice':   navigation.navigate('Exams'); break
      case 'challenge':  navigation.navigate('Exams'); break
      case 'quiz':       navigation.navigate('Exams'); break
      case 'papers':     navigation.navigate('Exams'); break
      case 'bookmarks':  Alert.alert('Bookmarks', 'Coming soon!'); break
    }
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const firstName = user?.firstName || 'Learner'

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person" size={22} color="#16a34a" />
          </TouchableOpacity>
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.greetingText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {greeting()} 👋
            </Text>
            <Text style={[styles.nameText, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
              {firstName}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
            onPress={() => navigation.navigate('Forum')}>
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
            <Ionicons name="notifications-outline" size={20} color={isDark ? '#94a3b8' : '#64748b'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Streak / Points Bar ── */}
      {isAuthenticated && (
        <View style={[styles.statsRow, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={18} color="#ef4444" />
            <Text style={[styles.statValue, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>{stats.streak}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="star" size={18} color="#f59e0b" />
            <Text style={[styles.statValue, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>{stats.totalPoints}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Points</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="book" size={18} color="#16a34a" />
            <Text style={[styles.statValue, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>{stats.examCount}</Text>
            <Text style={[styles.statLabel, { color: isDark ? '#94a3b8' : '#64748b' }]}>Exams</Text>
          </View>
        </View>
      )}

      {/* ── Welcome Banner ── */}
      <LinearGradient
        colors={['#166534', '#16a34a', '#22c55e']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.welcomeBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerWelcome}>Welcome to Tassy Point 🌾</Text>
          <Text style={styles.bannerTagline}>
            Attempt exam-level mock tests{'\n'}to boost your preparation
          </Text>
          <TouchableOpacity
            style={styles.bannerBtn}
            onPress={() => navigation.navigate('Exams')}>
            <Text style={styles.bannerBtnText}>Start Preparing →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bannerIconArea}>
          <View style={styles.bannerBigIcon}>
            <Ionicons name="trophy" size={40} color="#16a34a" />
          </View>
          <Text style={[styles.bannerIconLabel, { color: '#dcfce7' }]}>Tassy Point</Text>
        </View>
      </LinearGradient>

      {/* ── Practice Section ── */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>Practice</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.practiceRow}>
        {PRACTICE_CARDS.map(item => (
          <PracticeCard key={item.key} item={item} onPress={() => handlePracticeCard(item.key)} />
        ))}
      </ScrollView>

      {/* ── Toppers' Guidance Banner ── */}
      <LinearGradient
        colors={['#1e3a8a', '#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.guidanceBanner}>
        <View style={[styles.guidanceIconBox]}>
          <Ionicons name="calendar" size={22} color="#3b82f6" />
        </View>
        <View style={{ flex: 1, marginTop: 10 }}>
          <Text style={styles.guidanceTitle}>Toppers' Guidance</Text>
          <Text style={styles.guidanceSub}>Curated daily practice to boost your score</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Courses')}>
            <Text style={styles.exploreBtnText}>Explore →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.guidanceArtArea}>
          <Ionicons name="documents" size={50} color="rgba(255,255,255,0.25)" />
          <Ionicons name="stats-chart" size={36} color="rgba(255,255,255,0.18)" style={{ marginTop: -18, marginLeft: 12 }} />
        </View>
      </LinearGradient>

      {/* ── Quick Actions ── */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>Quick Actions</Text>
      <View style={[styles.qaRow, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        {QUICK_ACTIONS.map(item => (
          <QuickActionBtn key={item.key} item={item} onPress={() => handleQuickAction(item.key)} />
        ))}
      </View>

      {/* ── Exam Categories ── */}
      <Text style={[styles.sectionTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>Browse by Exam</Text>
      <View style={styles.chipsWrap}>
        {EXAM_CHIPS.map(item => (
          <ExamChip key={item.key} item={item} onPress={() => navigation.navigate('Exams')} />
        ))}
      </View>

      {/* ── AI Personalized Test Banner ── */}
      <LinearGradient
        colors={['#4c1d95', '#7c3aed', '#8b5cf6']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.aiBanner}>
        <View style={[styles.aiStarBox]}>
          <Ionicons name="sparkles" size={18} color="#7c3aed" />
        </View>
        <View style={{ flex: 1, marginTop: 10 }}>
          <Text style={styles.aiTitle}>AI Personalized Test</Text>
          <Text style={styles.aiSub}>
            Based on your performance{'\n'}& weak topics
          </Text>
          <TouchableOpacity style={styles.aiBtn} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.aiBtnText}>Start AI Test →</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.aiArtArea}>
          <View style={styles.aiNodeOuter}>
            <View style={styles.aiNodeInner}>
              <Ionicons name="hardware-chip" size={20} color="#7c3aed" />
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* ── Featured Courses ── */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 0 }]}>
          Featured Courses
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 4 }}>
        {['IBPS AFO Complete', 'NABARD Prep', 'FCI Watchman', 'UPCATET Agri'].map((name, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.courseCard, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
            onPress={() => navigation.navigate('Courses')}
            activeOpacity={0.85}>
            <View style={[styles.courseThumb, { backgroundColor: ['#dcfce7','#dbeafe','#fef9c3','#fce7f3'][i % 4] }]}>
              <Ionicons name="book" size={28} color={['#16a34a','#2563eb','#ca8a04','#db2777'][i % 4]} />
            </View>
            <Text style={[styles.courseName, { color: isDark ? '#f1f5f9' : '#0f172a' }]} numberOfLines={2}>{name}</Text>
            <Text style={[styles.courseMeta, { color: isDark ? '#94a3b8' : '#64748b' }]}>Free • 20+ lessons</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

    </ScrollView>
  )
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },

  // header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  greetingText: { fontSize: 12 },
  nameText: { fontSize: 17, fontWeight: '700' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },

  // stats
  statsRow: { marginHorizontal: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, height: 30, backgroundColor: '#e2e8f0' },

  // welcome banner
  welcomeBanner: { marginHorizontal: 16, borderRadius: 20, padding: 20, flexDirection: 'row', marginBottom: 22, overflow: 'hidden' },
  bannerWelcome: { color: '#dcfce7', fontSize: 13, fontWeight: '600', marginBottom: 4 },
  bannerTagline: { color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 14 },
  bannerBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 16, alignSelf: 'flex-start' },
  bannerBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  bannerIconArea: { alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  bannerBigIcon: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center' },
  bannerIconLabel: { fontSize: 11, fontWeight: '700', marginTop: 6 },

  // section
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, paddingHorizontal: 16 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  seeAll: { color: '#16a34a', fontSize: 13, fontWeight: '600' },

  // practice cards
  practiceRow: { paddingLeft: 16, paddingRight: 8, marginBottom: 22 },
  practiceCard: { width: 140, backgroundColor: '#fff', borderRadius: 18, padding: 14, marginRight: 12, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  practiceCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  practiceIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  practiceBadge: { borderRadius: 8, paddingHorizontal: 6, paddingVertical: 3 },
  practiceBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  practiceCardLabel: { fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 2 },
  practiceCardSub: { fontSize: 11, color: '#64748b', marginBottom: 10 },
  practiceArrowBox: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end' },

  // toppers guidance banner
  guidanceBanner: { marginHorizontal: 16, borderRadius: 20, padding: 20, marginBottom: 22, overflow: 'hidden', minHeight: 150 },
  guidanceIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
  guidanceTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  guidanceSub: { color: '#bfdbfe', fontSize: 13, marginBottom: 14 },
  exploreBtn: { borderWidth: 1.5, borderColor: '#fff', borderRadius: 20, paddingVertical: 7, paddingHorizontal: 18, alignSelf: 'flex-start' },
  exploreBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  guidanceArtArea: { position: 'absolute', right: 16, bottom: 16, flexDirection: 'row', alignItems: 'flex-end' },

  // quick actions
  qaRow: { marginHorizontal: 16, borderRadius: 20, flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 8, marginBottom: 22, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  qaBtn: { flex: 1, alignItems: 'center', position: 'relative', paddingTop: 8 },
  qaBadge: { position: 'absolute', top: 0, right: 4, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2, zIndex: 2 },
  qaBadgeText: { color: '#fff', fontSize: 8, fontWeight: '700' },
  qaIconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  qaLabel: { fontSize: 10, fontWeight: '600', color: '#374151', textAlign: 'center' },

  // exam chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, marginBottom: 22, gap: 8 },
  examChip: { borderRadius: 20, borderWidth: 1, paddingVertical: 7, paddingHorizontal: 14 },
  examChipText: { fontSize: 13, fontWeight: '700' },

  // AI banner
  aiBanner: { marginHorizontal: 16, borderRadius: 20, padding: 20, marginBottom: 22, overflow: 'hidden', minHeight: 160 },
  aiStarBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' },
  aiTitle: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  aiSub: { color: '#ddd6fe', fontSize: 13, lineHeight: 19, marginBottom: 14 },
  aiBtn: { backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 20, alignSelf: 'flex-start' },
  aiBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  aiArtArea: { position: 'absolute', right: 16, top: '50%', transform: [{ translateY: -30 }] },
  aiNodeOuter: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  aiNodeInner: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#ede9fe', alignItems: 'center', justifyContent: 'center' },

  // course cards
  courseCard: { width: 150, borderRadius: 16, marginLeft: 16, marginBottom: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, overflow: 'hidden' },
  courseThumb: { height: 80, alignItems: 'center', justifyContent: 'center' },
  courseName: { fontSize: 13, fontWeight: '700', padding: 10, paddingBottom: 2 },
  courseMeta: { fontSize: 11, paddingHorizontal: 10, paddingBottom: 10 },
})

