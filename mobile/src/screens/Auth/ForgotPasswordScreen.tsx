import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { authApi } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<any>()
  const { colors } = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address')
      setSuccess('')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')
      await authApi.forgotPassword(email.trim())
      setSuccess('Check your email for the reset link')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to send reset link right now')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Forgot Password</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Enter your email to receive a reset link.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
          <Text style={[styles.linkText, { color: '#194552' }]}>Back to login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 40 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 18 },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  link: { marginTop: 18, alignItems: 'center' },
  linkText: { fontSize: 14, fontWeight: '600' },
  error: { color: '#dc2626', marginBottom: 12, fontSize: 13 },
  success: { color: '#16a34a', marginBottom: 12, fontSize: 13, fontWeight: '600' },
})
