import { useTheme } from '../../context/ThemeContext'

export default function ProductDetailPage() {
  const { isDark } = useTheme()
  const bg = isDark ? '#111827' : '#f9fafb'
  const text = isDark ? '#f9fafb' : '#111827'

  return <div className="max-w-5xl mx-auto px-4 py-8" style={{ backgroundColor: bg, minHeight: '100vh', color: text }}><h1 className="text-2xl font-bold" style={{ color: text }}>Product Detail</h1></div>
}
