import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useTheme } from '../../context/ThemeContext'

export default function MockTestScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>🧪</Text>
      <Text style={[styles.title, { color: colors.text }]}>Mock Test feature coming soon - available on web</Text>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 28, marginBottom: 24 },
  button: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
})
