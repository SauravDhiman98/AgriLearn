import { useState, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { userApi, courseApi } from '../../api/services'
import {
  User, Mail, Phone, MapPin, BookOpen, Lock, Camera,
  CheckCircle, AlertCircle, Edit2, Save, X, Globe,
  Award, Clock, TrendingUp, Calendar, ChevronLeft
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

// ── Types ─────────────────────────────────────────────────────────────────
interface ProfileData {
  id: number
  email: string
  firstName: string
  lastName: string
  phone?: string
  bio?: string
  state?: string
  preferredLanguage?: string
  avatarUrl?: string
  role: string
  createdAt: string
}

interface Enrollment {
  id: number
  courseId: number
  courseTitle: string
  progressPercent: number
  completed: boolean
  enrolledAt: string
}

const INDIA_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu',
  'Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Delhi','Jammu & Kashmir','Ladakh',
]

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
]

// ── Helper ─────────────────────────────────────────────────────────────────
function Alert({ type, msg, onClose }: { type: 'success' | 'error'; msg: string; onClose: () => void }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium mb-4 ${
      type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user: authUser } = useSelector((s: RootState) => s.auth)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const [profile, setProfile]           = useState<ProfileData | null>(null)
  const [enrollments, setEnrollments]   = useState<Enrollment[]>([])
  const [loading, setLoading]           = useState(true)
  const [activeTab, setActiveTab]       = useState<'profile' | 'password' | 'learning'>('profile')

  // edit state
  const [editing, setEditing]           = useState(false)
  const [form, setForm]                 = useState<Partial<ProfileData>>({})
  const [saving, setSaving]             = useState(false)
  const [alert, setAlert]               = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // password state
  const [pwForm, setPwForm]             = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwSaving, setPwSaving]         = useState(false)
  const [pwAlert, setPwAlert]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [showPw, setShowPw]             = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const inputBg = isDark ? '#374151' : '#ffffff'
  const inputStyle = { backgroundColor: inputBg, color: text, border: `1px solid ${border}` }

  // ── Fetch data ─────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      userApi.getMe(),
      courseApi.getMyEnrollments(),
    ]).then(([meRes, enrollRes]) => {
      setProfile(meRes.data)
      setForm(meRes.data)
      setEnrollments(enrollRes.data ?? [])
    }).catch(() => {
      setAlert({ type: 'error', msg: 'Failed to load profile. Please refresh.' })
    }).finally(() => setLoading(false))
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setSaving(true)
    setAlert(null)
    try {
      const res = await userApi.updateProfile({
        firstName: form.firstName ?? '',
        lastName: form.lastName ?? '',
        phone: form.phone ?? '',
        bio: form.bio ?? '',
        state: form.state ?? '',
        preferredLanguage: form.preferredLanguage ?? '',
      })
      setProfile(res.data)
      setEditing(false)
      setAlert({ type: 'success', msg: 'Profile updated successfully!' })
    } catch (err: any) {
      setAlert({ type: 'error', msg: err?.response?.data?.message ?? 'Update failed.' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPwAlert(null)
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwAlert({ type: 'error', msg: 'New passwords do not match.' }); return
    }
    if (pwForm.newPassword.length < 8) {
      setPwAlert({ type: 'error', msg: 'Password must be at least 8 characters.' }); return
    }
    setPwSaving(true)
    try {
      await userApi.changePassword(pwForm.currentPassword, pwForm.newPassword)
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPwAlert({ type: 'success', msg: 'Password changed successfully!' })
    } catch (err: any) {
      setPwAlert({ type: 'error', msg: err?.response?.data?.message ?? 'Password change failed.' })
    } finally {
      setPwSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const res = await userApi.uploadAvatar?.(file)
      if (res?.data) setProfile(res.data)
      setAlert({ type: 'success', msg: 'Avatar updated!' })
    } catch {
      setAlert({ type: 'error', msg: 'Avatar upload failed.' })
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse" style={{ backgroundColor: bg, minHeight: '100vh' }}>
        <div className="h-32 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded" />)}
        </div>
      </div>
    )
  }

  const initials = `${profile?.firstName?.[0] ?? ''}${profile?.lastName?.[0] ?? ''}`.toUpperCase()
  const memberSince = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : ''
  const completedCourses = enrollments.filter(e => e.completed).length
  const avgProgress = enrollments.length
    ? Math.round(enrollments.reduce((s, e) => s + e.progressPercent, 0) / enrollments.length)
    : 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" style={{ backgroundColor: bg, minHeight: '100vh', color: text }}>

      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{
        display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
        color: muted, cursor: 'pointer', fontSize: '14px', marginBottom: '16px', padding: '0',
      }}>
        <ChevronLeft style={{ width: '16px', height: '16px' }} /> Back
      </button>

      {/* ── Hero card ─────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-r from-green-700 to-green-500 rounded-2xl p-6 mb-6 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200')", backgroundSize: 'cover' }} />
        <div className="relative flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-green-200 flex items-center justify-center">
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-green-700">{initials}</span>
              }
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </button>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold">{profile?.firstName} {profile?.lastName}</h1>
            <p className="text-green-100 text-sm mt-0.5">{profile?.email}</p>
            <span className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold ${
              profile?.role === 'ADMIN' ? 'bg-red-500' :
              profile?.role === 'INSTRUCTOR' ? 'bg-blue-500' : 'bg-green-900/60'
            }`}>
              {profile?.role}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center sm:ml-auto">
            <div>
              <p className="text-2xl font-bold">{enrollments.length}</p>
              <p className="text-xs text-green-100">Courses</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{completedCourses}</p>
              <p className="text-xs text-green-100">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{avgProgress}%</p>
              <p className="text-xs text-green-100">Avg Progress</p>
            </div>
          </div>
        </div>
        <p className="relative mt-3 text-xs text-green-200 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Member since {memberSince}
        </p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200 mb-6 gap-1" style={{ borderColor: border }}>
        {(['profile', 'password', 'learning'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize rounded-t transition ${
              activeTab === tab
                ? 'border-b-2 border-green-600 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={{ color: activeTab === tab ? undefined : muted }}>
            {tab === 'learning' ? 'My Learning' : tab === 'password' ? 'Security' : 'Profile'}
          </button>
        ))}
      </div>

      {/* ── TAB: Profile ────────────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm" style={{ backgroundColor: cardBg, borderColor: border }}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100" style={{ borderColor: border }}>
            <h2 className="font-semibold text-gray-800 flex items-center gap-2" style={{ color: text }}>
              <User className="w-4 h-4 text-green-600" /> Personal Information
            </h2>
            {!editing
              ? <button onClick={() => { setEditing(true); setAlert(null) }}
                  className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 font-medium">
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              : <div className="flex gap-2">
                  <button onClick={() => { setEditing(false); setForm(profile ?? {}) }}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded border border-gray-200"
                    style={{ color: muted, borderColor: border }}>
                    <X className="w-4 h-4" /> Cancel
                  </button>
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded font-medium disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
                  </button>
                </div>
            }
          </div>

          <div className="p-6">
            {alert && <Alert type={alert.type} msg={alert.msg} onClose={() => setAlert(null)} />}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* First Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1" style={{ color: muted }}>First Name</label>
                {editing
                  ? <input value={form.firstName ?? ''} onChange={e => setForm(f => ({...f, firstName: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" style={inputStyle} />
                : <p className="text-sm text-gray-800 py-2" style={{ color: text }}>{profile?.firstName}</p>
                }
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1" style={{ color: muted }}>Last Name</label>
                {editing
                  ? <input value={form.lastName ?? ''} onChange={e => setForm(f => ({...f, lastName: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" style={inputStyle} />
                : <p className="text-sm text-gray-800 py-2" style={{ color: text }}>{profile?.lastName}</p>
                }
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1" style={{ color: muted }}>
                  <Mail className="w-3 h-3" /> Email
                </label>
                <p className="text-sm text-gray-500 py-2" style={{ color: muted }}>{profile?.email}
                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">verified</span>
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1" style={{ color: muted }}>
                  <Phone className="w-3 h-3" /> Phone
                </label>
                {editing
                  ? <input value={form.phone ?? ''} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                      placeholder="+91 9800000000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" style={inputStyle} />
                : <p className="text-sm text-gray-800 py-2" style={{ color: text }}>{profile?.phone || <span className="text-gray-400 italic" style={{ color: muted }}>Not set</span>}</p>
                }
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1" style={{ color: muted }}>
                  <MapPin className="w-3 h-3" /> State
                </label>
                {editing
                  ? <select value={form.state ?? ''} onChange={e => setForm(f => ({...f, state: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                    style={inputStyle}>
                    <option value="">Select state</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                : <p className="text-sm text-gray-800 py-2" style={{ color: text }}>{profile?.state || <span className="text-gray-400 italic" style={{ color: muted }}>Not set</span>}</p>
                }
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1" style={{ color: muted }}>
                  <Globe className="w-3 h-3" /> Preferred Language
                </label>
                {editing
                  ? <select value={form.preferredLanguage ?? 'en'} onChange={e => setForm(f => ({...f, preferredLanguage: e.target.value}))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                    style={inputStyle}>
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                  </select>
                : <p className="text-sm text-gray-800 py-2" style={{ color: text }}>
                    {LANGUAGES.find(l => l.code === profile?.preferredLanguage)?.label ?? profile?.preferredLanguage ?? 'English'}
                  </p>
                }
              </div>

              {/* Bio (full width) */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1" style={{ color: muted }}>Bio / About Me</label>
                {editing
                  ? <textarea value={form.bio ?? ''} onChange={e => setForm(f => ({...f, bio: e.target.value}))}
                      rows={3} placeholder="Tell us about yourself and your farming background..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none" style={inputStyle} />
                : <p className="text-sm text-gray-800 py-2 leading-relaxed" style={{ color: text }}>
                    {profile?.bio || <span className="text-gray-400 italic" style={{ color: muted }}>No bio added yet.</span>}
                    </p>
                }
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Security / Password ─────────────────────────────────────── */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm" style={{ backgroundColor: cardBg, borderColor: border }}>
          <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100" style={{ borderColor: border }}>
            <Lock className="w-4 h-4 text-green-600" />
            <h2 className="font-semibold text-gray-800" style={{ color: text }}>Change Password</h2>
          </div>

          <div className="p-6 max-w-md">
            {pwAlert && <Alert type={pwAlert.type} msg={pwAlert.msg} onClose={() => setPwAlert(null)} />}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1" style={{ color: muted }}>Current Password</label>
                <input type={showPw ? 'text' : 'password'} value={pwForm.currentPassword}
                  onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={inputStyle}
                  placeholder="Enter current password" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1" style={{ color: muted }}>New Password</label>
                <input type={showPw ? 'text' : 'password'} value={pwForm.newPassword}
                  onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={inputStyle}
                  placeholder="Minimum 8 characters" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1" style={{ color: muted }}>Confirm New Password</label>
                <input type={showPw ? 'text' : 'password'} value={pwForm.confirmPassword}
                  onChange={e => setPwForm(f => ({...f, confirmPassword: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={inputStyle}
                  placeholder="Repeat new password" />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none" style={{ color: muted }}>
                <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} className="rounded" />
                Show passwords
              </label>

              {/* Password strength indicator */}
              {pwForm.newPassword && (
                <div>
                  <div className="flex gap-1 mt-1">
                    {[1,2,3,4].map(i => {
                      const len = pwForm.newPassword.length
                      const hasUpper = /[A-Z]/.test(pwForm.newPassword)
                      const hasNum = /\d/.test(pwForm.newPassword)
                      const hasSpecial = /[^A-Za-z0-9]/.test(pwForm.newPassword)
                      const strength = (len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNum ? 1 : 0) + (hasSpecial ? 1 : 0)
                      return <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                        i <= strength
                          ? strength <= 1 ? 'bg-red-400' : strength <= 2 ? 'bg-yellow-400' : strength <= 3 ? 'bg-blue-400' : 'bg-green-500'
                          : 'bg-gray-200'
                      }`} />
                    })}
                  </div>
                  <p className="text-xs text-gray-400 mt-1" style={{ color: muted }}>
                    Use uppercase, numbers & special chars for a strong password
                  </p>
                </div>
              )}

              <button onClick={handleChangePassword} disabled={pwSaving || !pwForm.currentPassword || !pwForm.newPassword}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium text-sm transition disabled:opacity-50 disabled:cursor-not-allowed">
                {pwSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: My Learning ─────────────────────────────────────────────── */}
      {activeTab === 'learning' && (
        <div className="space-y-4">
          {enrollments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center" style={{ backgroundColor: cardBg, borderColor: border }}>
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium" style={{ color: muted }}>No courses enrolled yet</p>
              <p className="text-gray-400 text-sm mt-1" style={{ color: muted }}>Browse our courses and start learning today!</p>
              <a href="/courses" className="inline-block mt-4 px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition">
                Browse Courses
              </a>
            </div>
          ) : (
            enrollments.map(enr => (
            <div key={enr.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ backgroundColor: cardBg, borderColor: border }}>
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>

                {/* Course info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate" style={{ color: text }}>{enr.courseTitle}</h3>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1" style={{ color: muted }}>
                    <Clock className="w-3 h-3" />
                    Enrolled {new Date(enr.enrolledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  {/* Progress bar */}
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          enr.completed ? 'bg-green-500' : enr.progressPercent > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${enr.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 shrink-0 w-9 text-right" style={{ color: muted }}>{enr.progressPercent}%</span>
                  </div>
                </div>

                {/* Badge / CTA */}
                <div className="shrink-0">
                  {enr.completed
                    ? <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
                        <Award className="w-3 h-3" /> Completed
                      </span>
                    : <a href={`/courses/${enr.courseId}`}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition">
                        <TrendingUp className="w-3 h-3" /> Continue
                      </a>
                  }
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
