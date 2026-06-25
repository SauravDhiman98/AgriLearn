import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { loginAsync } from '../../store/slices/authSlice'
import { Leaf, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { loading, error, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [localError, setLocalError] = useState('')
  const [success, setSuccess] = useState(false)
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const inputBg = isDark ? '#374151' : '#ffffff'

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  // Sync Redux error to local state so it persists across re-renders
  useEffect(() => {
    if (error) setLocalError(error)
  }, [error])

  const handleChange = (field: string, value: string) => {
    setLocalError('')   // Clear error as user starts correcting
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!form.email.trim()) { setLocalError('Please enter your email.'); return }
    if (!form.password) { setLocalError('Please enter your password.'); return }

    const result = await dispatch(loginAsync(form))
    if (loginAsync.fulfilled.match(result)) {
      setSuccess(true)
      setTimeout(() => navigate('/dashboard'), 500)
    }
    // If rejected, error is set via useEffect above from Redux state
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4" style={{ backgroundColor: bg, minHeight: '100vh', color: text }}>
      <div className="w-full max-w-md">
        <div className="card p-8" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 font-bold text-2xl" style={{ color: '#194552' }}>
              <img src="/logo.png" alt="Tassy Point" style={{ width: '36px', height: '36px', objectFit: 'contain', background: '#194552', borderRadius: '8px' }} />
              TASSY POINT
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2" style={{ color: text }}>Welcome back!</h1>
          <p className="text-gray-500 text-center text-sm mb-6" style={{ color: muted }}>Login to continue your learning journey</p>

          {/* Error banner */}
          {localError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm mb-4">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Login successful! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ color: text }}>Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className="input-field"
                style={{ backgroundColor: inputBg, color: text, border: `1px solid ${border}` }}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ color: text }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className="input-field pr-10"
                  style={{ backgroundColor: inputBg, color: text, border: `1px solid ${border}` }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  style={{ color: muted }}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1">
                <a href="#" className="text-xs text-green-600 hover:text-green-700">Forgot password?</a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary w-full py-2.5 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging in...
                </>
              ) : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6" style={{ color: muted }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 font-medium hover:text-green-700">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
