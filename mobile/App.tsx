import 'react-native-url-polyfill/auto'
import React from 'react'
import { Provider } from 'react-redux'
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { View, Text, ScrollView } from 'react-native'
import './src/i18n'
import RootNavigator from './src/navigation/RootNavigator'
import { store } from './src/store'
import { logout } from './src/store/slices/authSlice'
import { configureApiClient } from './src/services/api'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'

configureApiClient(
  () => store.getState().auth.accessToken,
  () => store.dispatch(logout())
)

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string; stack: string }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: '', stack: '' }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || String(error), stack: error?.stack || '' }
  }
  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#dc2626', marginBottom: 12 }}>
            App Error:
          </Text>
          <Text style={{ color: '#111', fontSize: 13, marginBottom: 16 }}>
            {this.state.error}
          </Text>
          <Text style={{ color: '#6b7280', fontSize: 11 }}>
            {this.state.stack}
          </Text>
        </ScrollView>
      )
    }
    return this.props.children
  }
}

function ThemedApp() {
  const { isDark } = useTheme()
  return (
    <SafeAreaProvider>
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  )
}
