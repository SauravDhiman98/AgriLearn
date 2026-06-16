import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { registerAsync } from '../../store/slices/authSlice'

const ROLES = [
  { value: 'STUDENT', label: '🎓 Student' },
  { value: 'FARMER', label: '🌾 Farmer' },
  { value: 'INSTRUCTOR', label: '👨‍🏫 Instructor' },
]

export default function RegisterScreen() {
  const dispatch = useDispatch<AppDispatch>()
  const navigation = useNavigation<any>()
  const { loading, error } = useSelector((s: RootState) => s.auth)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'STUDENT', preferredLanguage: 'en',
  })

  const handleRegister = async () => {
    if (!form.firstName || !form.email || !form.password) {
      Alert.alert('Error', 'Please fill all required fields'); return
    }
    const result = await dispatch(registerAsync(form))
    if (registerAsync.fulfilled.match(result)) {
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] })
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Create Account</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.label}>I am a...</Text>
        <View style={styles.roleRow}>
          {ROLES.map(r => (
            <TouchableOpacity key={r.value}
              onPress={() => setForm(f => ({ ...f, role: r.value }))}
              style={[styles.roleBtn, form.role === r.value && styles.roleBtnActive]}>
              <Text style={form.role === r.value ? styles.roleLabelActive : styles.roleLabel}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput style={styles.input} placeholder="Ramesh" value={form.firstName}
              onChangeText={v => setForm(f => ({ ...f, firstName: v }))} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} placeholder="Kumar" value={form.lastName}
              onChangeText={v => setForm(f => ({ ...f, lastName: v }))} />
          </View>
        </View>

        <Text style={styles.label}>Email *</Text>
        <TextInput style={styles.input} placeholder="ramesh@example.com" keyboardType="email-address"
          autoCapitalize="none" value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))} />

        <Text style={styles.label}>Password *</Text>
        <TextInput style={styles.input} placeholder="Minimum 8 characters"
          secureTextEntry value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))} />

        <TouchableOpacity onPress={handleRegister}
          style={[styles.btn, loading && styles.btnDisabled]} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Creating...' : 'Create Free Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
          <Text style={styles.linkText}>Already have an account? <Text style={styles.linkBold}>Login</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  inner: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
  error: { backgroundColor: '#fee2e2', color: '#dc2626', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, backgroundColor: '#fff', marginBottom: 14 },
  row: { flexDirection: 'row' },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  roleBtn: { flex: 1, borderWidth: 1.5, borderColor: '#d1d5db', borderRadius: 10, padding: 10, alignItems: 'center' },
  roleBtnActive: { borderColor: '#16a34a', backgroundColor: '#f0fdf4' },
  roleLabel: { fontSize: 12, color: '#374151' },
  roleLabelActive: { fontSize: 12, color: '#15803d', fontWeight: '600' },
  btn: { backgroundColor: '#16a34a', paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#6b7280', fontSize: 14 },
  linkBold: { color: '#16a34a', fontWeight: '600' },
})
