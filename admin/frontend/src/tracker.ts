const ADMIN_API = 'http://localhost:3001'

interface VisitPayload {
  sessionId: string
  userId?: number
  path: string
  platform?: 'web' | 'mobile'
  referrer?: string
  userAgent?: string
}

interface ApiPayload {
  method: string
  endpoint: string
  statusCode: number
  responseTimeMs: number
  userId?: number
  platform?: 'web' | 'mobile'
}

async function postJson(path: string, body: VisitPayload | ApiPayload | { sessionId: string; durationSeconds: number }) {
  try {
    await fetch(`${ADMIN_API}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      keepalive: true,
    })
  } catch (error) {
    console.warn('Admin tracking request failed:', error)
  }
}

export function createSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function trackVisit(path: string, sessionId: string, userId?: number, platform: 'web' | 'mobile' = 'web') {
  return postJson('/api/track/visit', {
    path,
    sessionId,
    userId,
    platform,
    referrer: document.referrer || '',
    userAgent: navigator.userAgent,
  })
}

export function trackApiCall(
  method: string,
  endpoint: string,
  statusCode: number,
  responseTimeMs: number,
  userId?: number,
  platform: 'web' | 'mobile' = 'web'
) {
  return postJson('/api/track/api-call', {
    method,
    endpoint,
    statusCode,
    responseTimeMs,
    userId,
    platform,
  })
}

export function trackVisitEnd(sessionId: string, durationSeconds: number) {
  if (navigator.sendBeacon) {
    const payload = new Blob([JSON.stringify({ sessionId, durationSeconds })], { type: 'application/json' })
    navigator.sendBeacon(`${ADMIN_API}/api/track/visit-end`, payload)
    return Promise.resolve()
  }

  return postJson('/api/track/visit-end', { sessionId, durationSeconds })
}
