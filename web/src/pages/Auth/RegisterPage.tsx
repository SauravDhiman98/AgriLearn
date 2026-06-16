import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { registerAsync } from '../../store/slices/authSlice'
import { Leaf, AlertCircle } from 'lucide-react'

const ROLES = [
  { value: 'STUDENT', label: '🎓 Student', desc: 'I\'m studying agriculture' },
  { value: 'FARMER', label: '🌾 Farmer', desc: 'I\'m an active farmer' },
  { value: 'INSTRUCTOR', label: '👨‍🏫 Instructor', desc: 'I want to teach' },
]

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'mr', label: 'मराठी' },
  { value: 'pa', label: 'ਪੰਜਾਬੀ' },
  { value: 'gu', label: 'ગુજરાતી' },
  { value: 'ta', label: 'தமிழ்' },
  { value: 'te', label: 'తెలుగు' },
]

export default function RegisterPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated } = useSelector((s: RootState) => s.auth)
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    role: 'STUDENT', preferredLanguage: 'en',
  })
  const [localError, setLocalError] = useState('')

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true })
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (error) setLocalError(error)
  }, [error])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    if (form.password.length < 8) {
      setLocalError('Password must be at least 8 characters.')
      return
    }
    const result = await dispatch(registerAsync(form))
    if (registerAsync.fulfilled.match(result)) navigate('/dashboard')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="card p-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-green-700 font-bold text-2xl">
              <Leaf className="w-7 h-7" />
              AgriLearn
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Create your account</h1>
          <p className="text-gray-500 text-center text-sm mb-6">Start learning agriculture for free</p>

          {localError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-4">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{localError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">I am a...</label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(r => (
                  <button type="button" key={r.value}
                    onClick={() => setForm(f => ({ ...f, role: r.value }))}
                    className={`border-2 rounded-lg p-3 text-center text-xs transition-all ${
                      form.role === r.value
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="text-lg mb-1">{r.label.split(' ')[0]}</div>
                    <div className="font-medium">{r.label.split(' ')[1]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input required value={form.firstName}
                  onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                  className="input-field" placeholder="Ramesh" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input required value={form.lastName}
                  onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                  className="input-field" placeholder="Kumar" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field" placeholder="ramesh@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required minLength={8} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field" placeholder="Minimum 8 characters" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Language</label>
              <select value={form.preferredLanguage}
                onChange={e => setForm(f => ({ ...f, preferredLanguage: e.target.value }))}
                className="input-field">
                {LANGUAGES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By registering, you agree to our{' '}
              <a href="#" className="text-green-600">Terms of Service</a> and{' '}
              <a href="#" className="text-green-600">Privacy Policy</a>
            </p>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-green-600 font-medium hover:text-green-700">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
