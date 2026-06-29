import { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { useTheme } from '../../context/ThemeContext'
import { RootState } from '../../store'

const examCategories = [
  { key: 'ibps-afo', label: 'IBPS AFO', emoji: '🌾' },
  { key: 'upcatet', label: 'UPCATET', emoji: '🎓' },
  { key: 'fci', label: 'FCI', emoji: '🏭' },
  { key: 'nabard', label: 'NABARD', emoji: '🏦' },
]

const quickActions = [
  { key: 'mock-tests', label: 'Mock Tests', emoji: '📝' },
  { key: 'courses', label: 'Courses', emoji: '📚' },
  { key: 'community', label: 'Community', emoji: '💬' },
]

export default function HomeScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const goToExams = useCallback(() => {
    navigation.navigate('Exams')
  }, [navigation])

  const goToCourses = useCallback(() => {
    navigation.navigate('Courses')
  }, [navigation])

  const goToForum = useCallback(() => {
    navigation.navigate('Forum')
  }, [navigation])

  const handleQuickActionPress = useCallback((key: string) => {
    if (key === 'courses') {
      goToCourses()
      return
    }

    if (key === 'community') {
      goToForum()
      return
    }

    goToExams()
  }, [goToCourses, goToExams, goToForum])

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        {isAuthenticated && user?.firstName ? (
          <Text style={styles.welcomeText}>Welcome back, {user.firstName}</Text>
        ) : null}
        <Text style={styles.bannerTitle}>Prepare for Agricultural Exams</Text>
        <Text style={styles.bannerSubtitle}>IBPS AFO • UPCATET • FCI • NABARD</Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular exam categories</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textMuted }]}>Jump straight into your target exam.</Text>
      </View>

      <View style={styles.grid}>
        {examCategories.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={goToExams}
            activeOpacity={0.85}>
            <Text style={styles.categoryEmoji}>{item.emoji}</Text>
            <Text style={[styles.categoryLabel, { color: colors.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick actions</Text>
      </View>

      <View style={styles.quickActionRow}>
        {quickActions.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleQuickActionPress(item.key)}
            activeOpacity={0.85}>
            <Text style={styles.quickActionEmoji}>{item.emoji}</Text>
            <Text style={[styles.quickActionLabel, { color: colors.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  banner: { borderRadius: 24, padding: 20, marginBottom: 24 },
  welcomeText: { color: '#dcfce7', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  bannerTitle: { color: '#ffffff', fontSize: 28, fontWeight: '700', lineHeight: 34 },
  bannerSubtitle: { color: '#dcfce7', fontSize: 14, marginTop: 10, lineHeight: 20 },
  sectionHeader: { marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  sectionSubtitle: { fontSize: 13, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
  categoryCard: {
    width: '48%',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryEmoji: { fontSize: 28, marginBottom: 10 },
  categoryLabel: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  quickActionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickActionEmoji: { fontSize: 24, marginBottom: 8 },
  quickActionLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
})
