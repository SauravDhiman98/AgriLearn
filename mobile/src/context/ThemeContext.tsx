import React, { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'

// AsyncStorage with graceful fallback if not installed yet
let AsyncStorage: { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<void> }
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default
} catch {
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
  }
}

export type Theme = 'light' | 'dark'

export interface ThemeColors {
  background: string
  backgroundSecondary: string
  card: string
  text: string
  textMuted: string
  border: string
  primary: string
  primaryDark: string
  primaryLight: string
  hero: string
  heroText: string
  tabBar: string
  tabBarBorder: string
  header: string
  inputBg: string
}

export const lightColors: ThemeColors = {
  background: '#f9fafb',
  backgroundSecondary: '#ffffff',
  card: '#ffffff',
  text: '#111827',
  textMuted: '#6b7280',
  border: '#e5e7eb',
  primary: '#16a34a',
  primaryDark: '#15803d',
  primaryLight: '#f0fdf4',
  hero: '#194552',
  heroText: '#ffffff',
  tabBar: '#ffffff',
  tabBarBorder: '#e5e7eb',
  header: '#194552',
  inputBg: '#ffffff',
}

export const darkColors: ThemeColors = {
  background: '#111827',
  backgroundSecondary: '#1f2937',
  card: '#1f2937',
  text: '#f9fafb',
  textMuted: '#9ca3af',
  border: '#374151',
  primary: '#22c55e',
  primaryDark: '#16a34a',
  primaryLight: '#052e16',
  hero: '#0f2a33',
  heroText: '#f9fafb',
  tabBar: '#1f2937',
  tabBarBorder: '#374151',
  header: '#0f2a33',
  inputBg: '#374151',
}

interface ThemeContextType {
  theme: Theme
  colors: ThemeColors
  toggleTheme: () => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  colors: lightColors,
  toggleTheme: () => {},
  isDark: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    AsyncStorage.getItem('app_theme').then(stored => {
      if (stored === 'dark' || stored === 'light') {
        setTheme(stored)
      } else {
        setTheme(systemScheme === 'dark' ? 'dark' : 'light')
      }
    })
  }, [])

  const toggleTheme = async () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    await AsyncStorage.setItem('app_theme', next)
  }

  const colors = theme === 'dark' ? darkColors : lightColors

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
