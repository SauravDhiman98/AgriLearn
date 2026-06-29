export interface AdminUser {
  id: number
  username: string
  created_at?: string
  createdAt?: string
}

export interface OverviewBucket {
  visits: number
  uniqueVisitors: number
  newUsers: number
  returningUsers: number
  apiCalls: number
  errors: number
  avgResponseTimeMs?: number
}

export interface OverviewResponse {
  today: OverviewBucket
  yesterday: OverviewBucket
  last7Days: OverviewBucket
  last30Days: OverviewBucket
  allTime: {
    totalUsers: number
    totalVisits: number
    totalApiCalls: number
  }
}

export interface DailyStat {
  date: string
  totalVisits: number
  uniqueVisitors: number
  newUsers: number
  returningUsers: number
  totalApiCalls: number
  avgResponseTimeMs: number
  errorCount: number
  platformWeb: number
  platformMobile: number
}

export interface ApiLog {
  id: number
  method: string
  endpoint: string
  statusCode: number
  responseTimeMs: number
  userId: number | null
  ipAddress: string | null
  platform: string
  createdAt: string
}

export interface VisitLog {
  id: number
  sessionId: string
  userId: number | null
  path: string
  platform: string
  ipAddress: string | null
  userAgent: string | null
  referrer: string | null
  durationSeconds: number
  createdAt: string
}

export interface PagedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TopEndpoint {
  endpoint: string
  totalCalls: number
  avgResponseTimeMs: number
  errorCount: number
  successRate: number
}

export interface TopPage {
  path: string
  visitCount: number
  uniqueVisitors: number
  avgDuration: number
}

export interface PlatformBreakdownResponse {
  daily: Array<{
    date: string
    visitWeb: number
    visitMobile: number
    apiWeb: number
    apiMobile: number
  }>
  totals: {
    visits: { web: number; mobile: number }
    apiCalls: { web: number; mobile: number }
  }
}

export interface HourlyPoint {
  hour: number
  visits: number
  apiCalls: number
}

export interface UserSnapshot {
  id: number
  snapshotDate: string
  totalUsers: number
  newToday: number
  activeToday: number
  createdAt: string
}
