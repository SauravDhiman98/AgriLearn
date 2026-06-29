import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle, Leaf } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { authApi } from '../../api/services'

export default function ForgotPasswordPage() {
  const { isDark } = useTheme()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const inputBg = isDark ? '#374151' : '#ffffff'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch {
      setError('Something went wrong. Please try again.')
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

          {sent ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: text }}>Check your inbox</h2>
              <p className="text-sm mb-6" style={{ color: muted }}>
                If <strong>{email}</strong> is registered with Tassy Point, you'll receive a password reset link shortly. Check your spam folder if you don't see it.
              </p>
              <Link
                to="/login"
                className="inline-block w-full text-center py-2.5 rounded-lg font-semibold text-white"
                style={{ background: '#1a7a3c' }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-center mb-1" style={{ color: text }}>Forgot Password?</h1>
              <p className="text-sm text-center mb-6" style={{ color: muted }}>
                Enter your registered email and we'll send you a reset link.
              </p>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: text }}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: muted }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      style={{ backgroundColor: inputBg, borderColor: border, color: text }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ background: '#1a7a3c' }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <p className="text-center text-sm mt-4" style={{ color: muted }}>
                Remember your password?{' '}
                <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
