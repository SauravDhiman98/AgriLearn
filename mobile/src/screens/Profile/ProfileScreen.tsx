import { useCallback, useMemo } from 'react'
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '../../context/ThemeContext'
import { RootState } from '../../store'
import { logout } from '../../store/slices/authSlice'

const settingsItems = ['Edit Profile', 'My Courses', 'Notifications']

export default function ProfileScreen() {
  const navigation = useNavigation<any>()
  const dispatch = useDispatch()
  const { colors, isDark, toggleTheme } = useTheme()
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const initials = useMemo(() => {
    const first = user?.firstName?.[0] || ''
    const last = user?.lastName?.[0] || ''
    return `${first}${last}`.toUpperCase() || 'TP'
  }, [user?.firstName, user?.lastName])

  const handleLoginPress = useCallback(() => {
    navigation.navigate('Login')
  }, [navigation])

  const handleRegisterPress = useCallback(() => {
    navigation.navigate('Register')
  }, [navigation])

  const handleToggleTheme = useCallback(async () => {
    try {
      await toggleTheme()
    } catch {
      Alert.alert('Theme update failed', 'Please try toggling dark mode again.')
    }
  }, [toggleTheme])

  const handleLogout = useCallback(() => {
    dispatch(logout())
  }, [dispatch])

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background, padding: 24 }]}>
        <Text style={styles.emptyEmoji}>👤</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Login to manage your profile</Text>
        <Text style={[styles.helperText, { color: colors.textMuted }]}>
          Access your courses, notifications, and saved preferences after signing in.
        </Text>

        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={handleLoginPress}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={handleRegisterPress}>
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Register</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{`${user.firstName} ${user.lastName}`.trim()}</Text>
        <Text style={[styles.meta, { color: colors.textMuted }]}>{user.email}</Text>
        <Text style={[styles.roleBadge, { backgroundColor: colors.primaryLight, color: colors.primary }]}>
          {user.role || 'Student'}
        </Text>
      </View>

      <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {settingsItems.map((item) => (
          <View key={item} style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.settingText, { color: colors.text }]}>{item}</Text>
            <Text style={[styles.settingArrow, { color: colors.textMuted }]}>›</Text>
          </View>
        ))}

        <View style={styles.switchRow}>
          <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={handleToggleTheme}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#ffffff"
          />
        </View>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.primary }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  profileCard: { borderWidth: 1, borderRadius: 24, padding: 24, alignItems: 'center', marginBottom: 18 },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  avatarText: { fontSize: 28, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  meta: { fontSize: 14, marginTop: 6, textAlign: 'center' },
  roleBadge: { marginTop: 14, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, fontSize: 13, fontWeight: '700' },
  settingsCard: { borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  settingRow: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  switchRow: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingText: { fontSize: 15, fontWeight: '600' },
  settingArrow: { fontSize: 24, lineHeight: 24 },
  logoutButton: { marginTop: 22, borderRadius: 14, alignItems: 'center', paddingVertical: 14 },
  logoutText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  emptyEmoji: { fontSize: 42, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  helperText: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  primaryButton: { marginTop: 18, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14 },
  primaryButtonText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderWidth: 1,
    minWidth: 140,
    alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 15, fontWeight: '700' },
})
