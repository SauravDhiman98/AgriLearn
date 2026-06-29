const axios = require('axios')

function normalizeSpringPayload(payload = {}) {
  return {
    totalUsers: Number(payload.totalUsers ?? payload.total_users ?? payload.userCount ?? 0),
    newToday: Number(payload.newToday ?? payload.new_today ?? payload.todayNewUsers ?? 0),
    activeToday: Number(payload.activeToday ?? payload.active_today ?? payload.todayActiveUsers ?? 0),
  }
}

async function fetchSpringAnalytics() {
  const baseUrl = process.env.SPRING_BOOT_URL || 'http://localhost:8080/api/v1'
  const token = process.env.SPRING_BOOT_ADMIN_TOKEN

  try {
    const response = await axios.get(`${baseUrl}/admin/analytics`, {
      timeout: 10000,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })

    return normalizeSpringPayload(response.data)
  } catch (error) {
    console.warn('Unable to fetch Spring Boot analytics snapshot:', error.message)
    return null
  }
}

module.exports = { fetchSpringAnalytics }
