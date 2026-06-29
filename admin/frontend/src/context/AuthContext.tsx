import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import client from '../api/client'
import type { AdminUser } from '../types'

interface AuthContextValue {
  admin: AdminUser | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_KEY = 'tassy-admin-token'
const USER_KEY = 'tassy-admin-user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? (JSON.parse(stored) as AdminUser) : null
  })
  const [loading, setLoading] = useState<boolean>(Boolean(token))

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    setLoading(true)
    client
      .get<{ admin: AdminUser }>('/api/auth/me')
      .then((response) => {
        setAdmin(response.data.admin)
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.admin))
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setAdmin(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      token,
      loading,
      isAuthenticated: Boolean(token && admin),
      async login(username: string, password: string) {
        const response = await client.post<{ token: string; admin: AdminUser }>('/api/auth/login', {
          username,
          password,
        })

        localStorage.setItem(TOKEN_KEY, response.data.token)
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.admin))
        setToken(response.data.token)
        setAdmin(response.data.admin)
      },
      logout() {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        setToken(null)
        setAdmin(null)
      },
    }),
    [admin, loading, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
