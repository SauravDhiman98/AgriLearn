import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { loginAsync } from '../../store/slices/authSlice'

export default function LoginScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const navigation = useNavigation<any>()
  const { loading, error } = useSelector((s: RootState) => s.auth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Please fill all fields'); return }
    const result = await dispatch(loginAsync({ email, password }))
    if (loginAsync.fulfilled.match(result)) {
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] })
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.logo}>🌿 AgriLearn</Text>
        <Text style={styles.title}>Welcome back!</Text>
        <Text style={styles.subtitle}>Login to continue learning</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} placeholder="you@example.com"
          keyboardType="email-address" autoCapitalize="none"
          value={email} onChangeText={setEmail} />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="••••••••"
          secureTextEntry value={password} onChangeText={setPassword} />

        <TouchableOpacity onPress={handleLogin} style={[styles.btn, loading && styles.btnDisabled]} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
          <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Sign up free</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  inner: { padding: 24, paddingTop: 40 },
  logo: { fontSize: 22, fontWeight: 'bold', color: '#15803d', marginBottom: 24, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: '#fff', marginBottom: 16 },
  btn: { backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 24, alignItems: 'center' },
  linkText: { color: '#6b7280', fontSize: 14 },
  linkBold: { color: '#16a34a', fontWeight: '600' },
})
