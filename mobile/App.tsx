import 'react-native-url-polyfill/auto'
import { useEffect } from 'react'
import { Provider } from 'react-redux'
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { View, Text } from 'react-native'
import './src/i18n'
import RootNavigator from './src/navigation/RootNavigator'
import { store } from './src/store'
import { logout } from './src/store/slices/authSlice'
import { configureApiClient } from './src/services/api'
import React from 'react'
import { ThemeProvider, useTheme } from './src/context/ThemeContext'

// Wire up API client with store — done here to break circular dependency
configureApiClient(
  () => store.getState().auth.accessToken,
  () => store.dispatch(logout())
)

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: string}> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error?.message || String(error) }
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{flex:1, justifyContent:'center', alignItems:'center', padding:20, backgroundColor:'#f9fafb'}}>
          <Text style={{fontSize:18, fontWeight:'bold', color:'#dc2626', marginBottom:12}}>Something went wrong</Text>
          <Text style={{color:'#374151', textAlign:'center'}}>{this.state.error}</Text>
        </View>
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
