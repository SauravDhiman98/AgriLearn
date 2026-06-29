import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { courseApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

const CATEGORIES = [
  { key: 'IBPS_AFO', emoji: '🌾', label: 'IBPS AFO' },
  { key: 'UPCATET', emoji: '🎓', label: 'UPCATET' },
  { key: 'FCI', emoji: '🏭', label: 'FCI' },
  { key: 'NABARD', emoji: '🏦', label: 'NABARD' },
]

const QUICK_ACTIONS = [
  { emoji: '📋', label: 'Mock Tests', screen: 'Exams' },
  { emoji: '📚', label: 'Study Material', screen: 'Courses' },
  { emoji: '💬', label: 'Community', screen: 'Forum' },
  { emoji: '👤', label: 'Profile', screen: 'Profile' },
]

export default function HomeScreen() {
  const navigation = useNavigation<any>()
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const { colors, isDark } = useTheme()
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    courseApi.getFeatured()
      .then(res => setFeaturedCourses(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      {/* Hero Banner */}
      <View style={[styles.hero, { backgroundColor: colors.hero }]}>
        <Text style={[styles.heroTag, { color: colors.primaryLight }]}>Tassy Point</Text>
        <Text style={[styles.heroTitle, { color: colors.heroText }]}>
          {isAuthenticated ? `Welcome back, ${user?.firstName}!` : `India's #1\nAgri Exam Prep`}
        </Text>
        <Text style={[styles.heroSubtitle, { color: isDark ? '#9ca3af' : '#d1fae5' }]}>Mock tests, courses and community support for agri aspirants</Text>
        {!isAuthenticated && (
          <TouchableOpacity style={styles.heroCta} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.heroCtaText}>Get Started Free</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Explore by Exam</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.key}
              onPress={() => navigation.navigate('Exams')}
              style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryLabel, { color: colors.text }]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Courses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⭐ Top Courses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 20 }} />
        ) : featuredCourses.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 32 }}>🎓</Text>
            <Text style={{ color: colors.textMuted, marginTop: 8 }}>No courses available right now</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {featuredCourses.map((course: any) => (
              <TouchableOpacity key={course.id}
                style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}>
                <View style={[styles.courseThumbnail, { backgroundColor: colors.primaryLight }]}>
                  <Text style={{ fontSize: 32 }}>📚</Text>
                </View>
                <View style={styles.courseInfo}>
                  <Text style={[styles.courseTitle, { color: colors.text }]} numberOfLines={2}>{course.title}</Text>
                  <Text style={[styles.courseInstructor, { color: colors.textMuted }]}>{course.instructor?.firstName}</Text>
                  <View style={styles.courseFooter}>
                    <Text style={[styles.courseRating, { color: colors.textMuted }]}>⭐ {course.rating?.toFixed(1)}</Text>
                    <Text style={[styles.coursePrice, { color: colors.primary }]}>
                      {course.free ? 'Free' : `₹${course.price?.toLocaleString()}`}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Quick actions */}
      <View style={[styles.section, { marginBottom: 20 }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity key={action.label}
              style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => navigation.navigate(action.screen)}>
              <Text style={{ fontSize: 24 }}>{action.emoji}</Text>
              <Text style={[styles.quickActionLabel, { color: colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  hero: { padding: 24, paddingTop: 32 },
  heroTag: { fontSize: 14, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  heroTitle: { fontSize: 30, fontWeight: 'bold', lineHeight: 38, marginBottom: 8 },
  heroSubtitle: { fontSize: 14, marginBottom: 20, lineHeight: 20 },
  heroCta: { backgroundColor: '#fbbf24', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignSelf: 'flex-start' },
  heroCtaText: { color: '#1a1a1a', fontWeight: 'bold', fontSize: 15 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  seeAll: { fontSize: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: { width: '47%', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1 },
  categoryEmoji: { fontSize: 28, marginBottom: 6 },
  categoryLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  horizontalScroll: { marginLeft: -4 },
  courseCard: { width: 200, borderRadius: 12, marginRight: 12, borderWidth: 1, overflow: 'hidden' },
  courseThumbnail: { height: 110, alignItems: 'center', justifyContent: 'center' },
  courseInfo: { padding: 12 },
  courseTitle: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  courseInstructor: { fontSize: 11, marginBottom: 6 },
  courseFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  courseRating: { fontSize: 11 },
  coursePrice: { fontSize: 12, fontWeight: 'bold' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionBtn: { width: '47%', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1 },
  quickActionLabel: { fontSize: 12, fontWeight: '500', marginTop: 6 },
})
