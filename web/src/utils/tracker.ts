// Sends analytics events to the Spring Boot backend (same server as the main app)
const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1')
  .replace(/\/$/, '') // strip trailing slash

const SESSION_KEY = 'tassy_session_id'
const SESSION_START_KEY = 'tassy_session_start'

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    sessionStorage.setItem(SESSION_KEY, id)
    sessionStorage.setItem(SESSION_START_KEY, String(Date.now()))
  }
  return id
}

function getUserId(): number | undefined {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null')
    return user?.id ?? undefined
  } catch {
    return undefined
  }
}

async function post(path: string, body: object): Promise<void> {
  try {
    await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    })
  } catch {
    // Silently fail — never break the main app for analytics
  }
}

export function trackPageView(path: string): void {
  const sessionId = getOrCreateSessionId()
  const userId = getUserId()
  post('/track/visit', {
    sessionId,
    userId,
    path,
    platform: 'web',
    referrer: document.referrer || '',
    userAgent: navigator.userAgent,
  })
}

export function trackApiCall(
  method: string,
  endpoint: string,
  statusCode: number,
  responseTimeMs: number
): void {
  const userId = getUserId()
  post('/track/api-call', {
    method,
    endpoint,
    statusCode,
    responseTimeMs,
    userId,
    platform: 'web',
  })
}

export function trackSessionEnd(): void {
  const sessionId = sessionStorage.getItem(SESSION_KEY)
  const startStr = sessionStorage.getItem(SESSION_START_KEY)
  if (!sessionId || !startStr) return

  const durationSeconds = Math.floor((Date.now() - Number(startStr)) / 1000)

  if (navigator.sendBeacon) {
    const blob = new Blob(
      [JSON.stringify({ sessionId, durationSeconds })],
      { type: 'application/json' }
    )
    navigator.sendBeacon(`${API_BASE}/track/visit-end`, blob)
  } else {
    post('/track/visit-end', { sessionId, durationSeconds })
  }
}
