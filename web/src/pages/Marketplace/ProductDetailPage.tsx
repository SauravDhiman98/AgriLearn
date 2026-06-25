import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

export default function ProductDetailPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const bg = isDark ? '#111827' : '#f9fafb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" style={{ backgroundColor: bg, minHeight: '100vh', color: text }}>
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
        color: muted, cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: '0',
      }}>
        ← Back to Marketplace
      </button>
      <h1 className="text-2xl font-bold" style={{ color: text }}>Product Detail</h1>
    </div>
  )
}
