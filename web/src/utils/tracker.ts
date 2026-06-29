// Sends analytics events to the Tassy Point admin backend (Railway)
const ADMIN_API = import.meta.env.VITE_ADMIN_API_URL || 'https://tassy-admin-backend.up.railway.app'

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
    await fetch(`${ADMIN_API}${path}`, {
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
  post('/api/track/visit', {
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
  post('/api/track/api-call', {
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
    navigator.sendBeacon(`${ADMIN_API}/api/track/visit-end`, blob)
  } else {
    post('/api/track/visit-end', { sessionId, durationSeconds })
  }
}
