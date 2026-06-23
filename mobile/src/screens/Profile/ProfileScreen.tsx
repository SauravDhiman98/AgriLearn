import { View, Text, TouchableOpacity, Switch } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { logout } from '../../store/slices/authSlice'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../context/ThemeContext'

export default function ProfileScreen() {
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const dispatch = useDispatch<AppDispatch>()
  const navigation = useNavigation<any>()
  const { colors, isDark, toggleTheme } = useTheme()

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
      {isAuthenticated ? (
        <>
          <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4, color: colors.text }}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={{ color: colors.textMuted, marginBottom: 4 }}>{user?.email}</Text>
          <Text style={{ color: colors.textMuted, marginBottom: 24 }}>Role: {user?.role}</Text>

          {/* Theme toggle */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: colors.card, borderRadius: 12, padding: 16,
            borderWidth: 1, borderColor: colors.border, marginBottom: 16,
          }}>
            <View>
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
                {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#d1d5db', true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity
            onPress={() => dispatch(logout())}
            style={{ backgroundColor: '#dc2626', padding: 14, borderRadius: 10, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Logout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={{ alignItems: 'center', paddingTop: 40 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: colors.text }}>
            Please login to continue
          </Text>

          {/* Theme toggle for guest */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: colors.card, borderRadius: 12, padding: 16,
            borderWidth: 1, borderColor: colors.border, marginBottom: 24, width: '100%',
          }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
              {isDark ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#d1d5db', true: colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={{ backgroundColor: colors.primary, padding: 14, borderRadius: 10, paddingHorizontal: 40 }}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Login</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
