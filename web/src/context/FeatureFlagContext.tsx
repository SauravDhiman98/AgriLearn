import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import apiClient from '../api/axios'

type Flags = Record<string, boolean>

const FeatureFlagContext = createContext<Flags>({})

// Default flags — all ON; DB overrides specific ones (e.g. PRICING=false until live)
const DEFAULTS: Flags = {
  PRICING: true,
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
    apiClient.get('/config/features')
      .then(r => setFlags({ ...DEFAULTS, ...r.data }))
      .catch(() => setFlags(DEFAULTS))
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
  return flags[key] ?? true
}
