import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { authApi } from '../../api/services'

export default function ResetPasswordPage() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const inputBg = isDark ? '#374151' : '#ffffff'

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new one.')
    }
  }, [token])

  useEffect(() => {
    if (done) {
      const timer = setTimeout(() => navigate('/login'), 3000)
      return () => clearTimeout(timer)
    }
  }, [done, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Invalid or expired reset link.'
      setError(typeof msg === 'string' ? msg : 'Invalid or expired reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ backgroundColor: bg, color: text }}>
      <div className="w-full max-w-md">
        <div className="rounded-xl shadow-sm p-8" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>

          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2 font-bold text-2xl" style={{ color: '#194552' }}>
              <img src="/logo.png" alt="Tassy Point" style={{ width: '36px', height: '36px', objectFit: 'contain', background: '#194552', borderRadius: '8px' }} />
              TASSY POINT
            </div>
          </div>

          {done ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: text }}>Password Reset!</h2>
              <p className="text-sm mb-6" style={{ color: muted }}>
                Your password has been updated successfully. Redirecting to login in 3 seconds...
              </p>
              <Link
                to="/login"
                className="inline-block w-full text-center py-2.5 rounded-lg font-semibold text-white"
                style={{ background: '#1a7a3c' }}
              >
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-1" style={{ color: text }}>Set New Password</h1>
              <p className="text-sm text-center mb-6" style={{ color: muted }}>
                Choose a strong new password for your account.
              </p>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                  {!token && (
                    <Link to="/forgot-password" className="ml-1 underline font-medium">Request new link</Link>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: text }}>New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: muted }} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      required
                      disabled={!token}
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      style={{ backgroundColor: inputBg, borderColor: border, color: text }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: muted }}
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: text }}>Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: muted }} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      disabled={!token}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      style={{ backgroundColor: inputBg, borderColor: border, color: text }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full py-2.5 rounded-lg font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ background: '#1a7a3c' }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-sm mt-4" style={{ color: muted }}>
                <Link to="/forgot-password" className="text-green-600 font-medium hover:underline">Request a new reset link</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
