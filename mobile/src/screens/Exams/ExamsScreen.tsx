import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator, FlatList, RefreshControl, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { examApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

// ─── helpers ─────────────────────────────────────────────────────────────────
const getExamList = (data: any): any[] => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.content)) return data.content
  return []
}

const withTimeout = <T,>(p: Promise<T>, ms = 8000) =>
  Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error('Timed out')), ms))])

const EXAM_META: Record<string, { color: string; iconName: any; tag: string }> = {
  'ibps':    { color: '#16a34a', iconName: 'leaf',           tag: 'Agriculture' },
  'nabard':  { color: '#2563eb', iconName: 'business',       tag: 'Banking' },
  'fci':     { color: '#ea580c', iconName: 'cube',           tag: 'Food Corp' },
  'upcatet': { color: '#9333ea', iconName: 'school',         tag: 'University' },
  'iari':    { color: '#0891b2', iconName: 'flask',          tag: 'Research' },
  'rrb':     { color: '#be123c', iconName: 'train',          tag: 'Railway' },
  'default': { color: '#16a34a', iconName: 'book',           tag: 'Exam' },
}

function getExamMeta(name: string) {
  const n = (name || '').toLowerCase()
  if (n.includes('ibps'))    return EXAM_META.ibps
  if (n.includes('nabard'))  return EXAM_META.nabard
  if (n.includes('fci'))     return EXAM_META.fci
  if (n.includes('upcatet')) return EXAM_META.upcatet
  if (n.includes('iari'))    return EXAM_META.iari
  if (n.includes('rrb'))     return EXAM_META.rrb
  return EXAM_META.default
}

const FILTER_TABS = ['All', 'IBPS', 'NABARD', 'FCI', 'UPCATET', 'RRB']

// ─── sub-components ──────────────────────────────────────────────────────────
function ExamCard({ item, onPress, isDark }: { item: any; onPress: () => void; isDark: boolean }) {
  const meta = getExamMeta(item.name)
  const bg = isDark ? '#1e293b' : '#fff'

  return (
    <TouchableOpacity style={[styles.examCard, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.85}>
      {/* colour accent strip */}
      <View style={[styles.cardStrip, { backgroundColor: meta.color }]} />

      <View style={styles.cardContent}>
        {/* icon + tag */}
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconBox, { backgroundColor: meta.color + '18' }]}>
            <Ionicons name={meta.iconName} size={22} color={meta.color} />
          </View>
          <View style={[styles.cardTag, { backgroundColor: meta.color + '18' }]}>
            <Text style={[styles.cardTagText, { color: meta.color }]}>{meta.tag}</Text>
          </View>
        </View>

        <Text style={[styles.cardTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]} numberOfLines={2}>
          {item.name || 'Exam'}
        </Text>
        <Text style={[styles.cardDesc, { color: isDark ? '#94a3b8' : '#64748b' }]} numberOfLines={2}>
          {item.description || 'Practice with subject-wise tests and full mock exams.'}
        </Text>

        {/* stats row */}
        <View style={styles.cardStats}>
          <View style={styles.cardStatItem}>
            <Ionicons name="documents-outline" size={13} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.cardStatText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {item.subjectCount ?? item.subjects?.length ?? '—'} Subjects
            </Text>
          </View>
          <View style={styles.cardStatItem}>
            <Ionicons name="clipboard-outline" size={13} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.cardStatText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {item.mockTestCount ?? item.mockTests?.length ?? '—'} Tests
            </Text>
          </View>
          <View style={styles.cardStatItem}>
            <Ionicons name="time-outline" size={13} color={isDark ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.cardStatText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Free</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={[styles.cardCta, { backgroundColor: meta.color }]} onPress={onPress}>
          <Text style={styles.cardCtaText}>Start Preparing</Text>
          <Ionicons name="arrow-forward" size={14} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  )
}

// ─── main screen ─────────────────────────────────────────────────────────────
export default function ExamsScreen() {
  const navigation = useNavigation<any>()
  const { isDark } = useTheme()
  const [exams, setExams]         = useState<any[]>([])
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]         = useState('')
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState('All')

  const load = useCallback(async () => {
    try {
      const res = await withTimeout(examApi.list())
      setExams(getExamList(res.data))
      setError('')
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Unable to load exams.')
      setExams([])
    }
  }, [])

  useEffect(() => { load().finally(() => setLoading(false)) }, [load])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }, [load])

  const filtered = useMemo(() => {
    let list = exams
    if (activeTab !== 'All') {
      list = list.filter(e => (e.name || '').toLowerCase().includes(activeTab.toLowerCase()))
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(e =>
        (e.name || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [exams, activeTab, search])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
        <ActivityIndicator size="large" color="#16a34a" />
        <Text style={[styles.loadingText, { color: isDark ? '#94a3b8' : '#64748b' }]}>Loading exams...</Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>

      {/* ── top banner ── */}
      <LinearGradient colors={['#166534','#16a34a']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topBanner}>
        <View>
          <Text style={styles.bannerTitle}>Agricultural Exams 🌾</Text>
          <Text style={styles.bannerSub}>IBPS AFO · NABARD · FCI · UPCATET & more</Text>
        </View>
        <View style={styles.bannerBadge}>
          <Text style={styles.bannerBadgeNum}>{exams.length}</Text>
          <Text style={styles.bannerBadgeLabel}>Exams</Text>
        </View>
      </LinearGradient>

      {/* ── search bar ── */}
      <View style={[styles.searchBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Ionicons name="search-outline" size={18} color={isDark ? '#94a3b8' : '#94a3b8'} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#f1f5f9' : '#0f172a' }]}
          placeholder="Search exams..."
          placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── filter tabs ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {FILTER_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── error ── */}
      {error ? (
        <View style={[styles.errorBox, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Ionicons name="warning-outline" size={18} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* ── exam list ── */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <ExamCard item={item} isDark={isDark} onPress={() => navigation.navigate('ExamDetail', { examId: item.id })} />
        )}
        contentContainerStyle={filtered.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16a34a" />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={isDark ? '#334155' : '#cbd5e1'} />
            <Text style={[styles.emptyTitle, { color: isDark ? '#f1f5f9' : '#0f172a' }]}>
              {search ? 'No results found' : 'No exams available'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
              {search ? `Try a different search term` : 'Check back soon for new exam categories'}
            </Text>
          </View>
        }
      />
    </View>
  )
}

// ─── styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },

  // top banner
  topBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingTop: 14, paddingBottom: 18 },
  bannerTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  bannerSub: { color: '#bbf7d0', fontSize: 12, marginTop: 3 },
  bannerBadge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 16 },
  bannerBadgeNum: { color: '#fff', fontSize: 22, fontWeight: '800' },
  bannerBadgeLabel: { color: '#bbf7d0', fontSize: 11 },

  // search
  searchBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginTop: -10, marginBottom: 10, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 8, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },

  // tabs
  tabsRow: { paddingHorizontal: 14, paddingBottom: 10, gap: 8 },
  tab: { borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0', paddingVertical: 6, paddingHorizontal: 16 },
  tabActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#fff' },

  // error
  errorBox: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, borderRadius: 12, padding: 12, gap: 8, marginBottom: 8 },
  errorText: { color: '#ef4444', fontSize: 13, flex: 1 },

  // list
  listContent: { padding: 14, gap: 14, paddingBottom: 32 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  emptySubtitle: { fontSize: 13, marginTop: 6, textAlign: 'center' },

  // exam card
  examCard: { borderRadius: 18, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 10, elevation: 3 },
  cardStrip: { width: 5 },
  cardContent: { flex: 1, padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  cardIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTag: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  cardTagText: { fontSize: 11, fontWeight: '700' },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  cardStats: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  cardStatItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardStatText: { fontSize: 12 },
  cardCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 10, gap: 6 },
  cardCtaText: { color: '#fff', fontSize: 13, fontWeight: '700' },
})

