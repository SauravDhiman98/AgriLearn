import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

type Flags = Record<string, boolean>

const FeatureFlagContext = createContext<Flags>({})

// Default flags — used until API responds (prevents flash)
const DEFAULTS: Flags = {
  PRICING: false,
  MARKETPLACE: true,
  LIVE_CLASSES: true,
  COMMUNITY: true,
  PRACTICE_MODE: true,
  SEARCH: true,
  GAMIFICATION: true,
}

export function FeatureFlagProvider({ children }: { children: ReactNode }) {
  const [flags, setFlags] = useState<Flags>(DEFAULTS)

  useEffect(() => {
    axios.get(`${API_BASE}/config/features`)
      .then(r => setFlags({ ...DEFAULTS, ...r.data }))
      .catch(() => setFlags(DEFAULTS)) // fall back to defaults silently
  }, [])

  return (
    <FeatureFlagContext.Provider value={flags}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export function useFeatureFlags() {
  return useContext(FeatureFlagContext)
}

export function useFlag(key: string): boolean {
  const flags = useContext(FeatureFlagContext)
  return flags[key] ?? true // default to true if flag not found
}
