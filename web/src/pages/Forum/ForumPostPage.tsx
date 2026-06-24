import { useTheme } from '../../context/ThemeContext'

export default function ForumPostPage() {
  const { isDark } = useTheme()
  const bg = isDark ? '#111827' : '#f9fafb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'

  return <div className="max-w-4xl mx-auto px-4 py-8" style={{ backgroundColor: bg, minHeight: '100vh', color: text }}><h1 className="text-2xl font-bold" style={{ color: text }}>Forum Post</h1><p className="text-gray-500 mt-2" style={{ color: muted }}>Full post with comments, upvoting, and answer acceptance.</p></div>
}
