import { useEffect, useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { courseApi } from '../../services/api'
import { COLORS, FONTS } from '../../utils/theme'

export default function HomeScreen() {
  const navigation = useNavigation<any>()
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    courseApi.getFeatured()
      .then(res => setFeaturedCourses(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const CATEGORIES = [
    { key: 'CROP_SCIENCE', emoji: '🌾', label: 'Crop Science' },
    { key: 'ORGANIC_FARMING', emoji: '🌿', label: 'Organic Farming' },
    { key: 'ANIMAL_HUSBANDRY', emoji: '🐄', label: 'Animal Husbandry' },
    { key: 'AGRIBUSINESS', emoji: '📊', label: 'Agribusiness' },
  ]

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Banner */}
      <View style={styles.hero}>
        <Text style={styles.heroTag}>🌱 India's #1 Agri Platform</Text>
        <Text style={styles.heroTitle}>
          {isAuthenticated ? `Welcome back, ${user?.firstName}!` : 'Learn Agriculture.\nGrow Better.'}
        </Text>
        <Text style={styles.heroSubtitle}>Expert courses, live classes & farmer community</Text>
        {!isAuthenticated && (
          <TouchableOpacity style={styles.heroCta} onPress={() => navigation.navigate('Register')}>
            <Text style={styles.heroCtaText}>Get Started Free</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.key}
              onPress={() => navigation.navigate('Courses', { category: cat.key })}
              style={styles.categoryCard}>
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Courses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>⭐ Top Courses</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Courses')}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 20 }} />
        ) : featuredCourses.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Text style={{ fontSize: 32 }}>🌱</Text>
            <Text style={{ color: '#6b7280', marginTop: 8 }}>No courses available right now</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {featuredCourses.map((course: any) => (
              <TouchableOpacity key={course.id} style={styles.courseCard}
                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}>
                <View style={styles.courseThumbnail}>
                  <Text style={{ fontSize: 32 }}>📚</Text>
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>
                  <Text style={styles.courseInstructor}>{course.instructor?.firstName}</Text>
                  <View style={styles.courseFooter}>
                    <Text style={styles.courseRating}>⭐ {course.rating?.toFixed(1)}</Text>
                    <Text style={styles.coursePrice}>
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
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {[
            { emoji: '🎥', label: 'Live Classes', screen: 'Forum' },
            { emoji: '💬', label: 'Community', screen: 'Forum' },
            { emoji: '🛒', label: 'Marketplace', screen: 'Marketplace' },
            { emoji: '📜', label: 'My Certificates', screen: 'Profile' },
          ].map(action => (
            <TouchableOpacity key={action.label} style={styles.quickActionBtn}
              onPress={() => navigation.navigate(action.screen)}>
              <Text style={{ fontSize: 24 }}>{action.emoji}</Text>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  hero: { backgroundColor: '#15803d', padding: 24, paddingTop: 32 },
  heroTag: { color: '#bbf7d0', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', lineHeight: 34, marginBottom: 8 },
  heroSubtitle: { color: '#d1fae5', fontSize: 14, marginBottom: 20 },
  heroCta: { backgroundColor: '#fbbf24', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignSelf: 'flex-start' },
  heroCtaText: { color: '#1a1a1a', fontWeight: 'bold', fontSize: 15 },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 12 },
  seeAll: { color: '#16a34a', fontSize: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  categoryCard: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  categoryEmoji: { fontSize: 28, marginBottom: 6 },
  categoryLabel: { fontSize: 12, fontWeight: '600', color: '#374151', textAlign: 'center' },
  horizontalScroll: { marginLeft: -4 },
  courseCard: { width: 200, backgroundColor: '#fff', borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  courseThumbnail: { height: 110, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  courseInfo: { padding: 12 },
  courseTitle: { fontSize: 13, fontWeight: '600', color: '#111827', marginBottom: 4 },
  courseInstructor: { fontSize: 11, color: '#6b7280', marginBottom: 6 },
  courseFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  courseRating: { fontSize: 11, color: '#6b7280' },
  coursePrice: { fontSize: 12, fontWeight: 'bold', color: '#16a34a' },
  quickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickActionBtn: { width: '47%', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e5e7eb' },
  quickActionLabel: { fontSize: 12, color: '#374151', fontWeight: '500', marginTop: 6 },
})
