import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { logout } from '../../store/slices/authSlice'
import { ShoppingCart, Menu, X, Globe, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
]

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth)
  const cartCount = useSelector((s: RootState) => s.cart.items.length)
  const { toggleTheme, isDark } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openProfile = () => {
    if (profileCloseTimer.current) clearTimeout(profileCloseTimer.current)
    setProfileOpen(true)
  }
  const closeProfileDelayed = () => {
    profileCloseTimer.current = setTimeout(() => setProfileOpen(false), 300)
  }

  const navLinks = [
    { to: '/exams', label: 'Exams' },
    { to: '/live-classes', label: t('nav.liveClasses') },
    { to: '/forum', label: t('nav.forum') },
    { to: '/marketplace', label: t('nav.marketplace') },
  ]

  return (
    <nav style={{
      backgroundColor: isDark ? '#1f2937' : '#ffffff',
      borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      position: 'sticky', top: 0, zIndex: 50,
      transition: 'background-color 0.2s ease',
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl" style={{ color: '#194552' }}>
            <img src="/logo.png" alt="Tassy Point" className="w-10 h-10 object-contain" style={{ background: '#194552', borderRadius: '8px' }} />
            <span style={{ color: isDark ? '#f9fafb' : '#194552' }}>TASSY POINT</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                style={{ color: isDark ? '#d1d5db' : '#4b5563', fontWeight: 500 }}
                className="hover:text-green-600 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="relative hidden md:block">
              <button onClick={() => setLangOpen(!langOpen)}
                style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                className="flex items-center gap-1 hover:text-gray-900">
                <Globe className="w-4 h-4" />
                <span className="text-sm uppercase">{i18n.language.slice(0, 2)}</span>
              </button>
              {langOpen && (
                <div style={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                }} className="absolute right-0 mt-2 w-36 rounded-lg shadow-lg py-1 z-50">
                  {LANGUAGES.map(lang => (
                    <button key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false) }}
                      style={{ color: isDark ? '#d1d5db' : '#374151' }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '5px 10px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                backgroundColor: isDark ? '#374151' : '#f3f4f6',
                color: isDark ? '#f9fafb' : '#374151',
                transition: 'all 0.2s ease',
              }}>
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Light' : 'Dark'}
            </button>

            {/* Cart */}
            <Link to="/marketplace" style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="relative hover:text-gray-900">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/dashboard" className="hidden md:block btn-outline text-sm py-1.5">
                  {t('nav.dashboard')}
                </Link>
                <div className="relative"
                  onMouseEnter={openProfile}
                  onMouseLeave={closeProfileDelayed}>
                  <button className="flex items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                      {user?.firstName?.[0]}
                    </div>
                  </button>
                  {profileOpen && (
                    <div
                      onMouseEnter={openProfile}
                      onMouseLeave={closeProfileDelayed}
                      style={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      }}
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-50">
                      <Link to="/profile" style={{ color: isDark ? '#d1d5db' : '#374151' }} className="block px-4 py-2 text-sm hover:bg-gray-100">{t('nav.profile')}</Link>
                      {user?.role === 'ADMIN' && (
                        <>
                          <Link to="/admin" style={{ color: isDark ? '#d1d5db' : '#374151' }} className="block px-4 py-2 text-sm hover:bg-gray-100">Admin Dashboard</Link>
                          <Link to="/admin/logs" style={{ color: isDark ? '#d1d5db' : '#374151' }} className="block px-4 py-2 text-sm hover:bg-gray-100">Log Viewer</Link>
                        </>
                      )}
                      <hr style={{ borderColor: isDark ? '#374151' : '#f3f4f6' }} className="my-1" />
                      <button onClick={() => { dispatch(logout()); navigate('/') }}
                        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" style={{ color: isDark ? '#d1d5db' : '#4b5563' }} className="font-medium text-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button style={{ color: isDark ? '#9ca3af' : '#6b7280' }} className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{ borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` }} className="md:hidden py-4 space-y-2">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                style={{ color: isDark ? '#d1d5db' : '#374151' }}
                className="block py-2 font-medium">
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggleTheme}
              style={{ color: isDark ? '#d1d5db' : '#374151' }}
              className="flex items-center gap-2 py-2 font-medium w-full">
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            {!isAuthenticated && (
              <div className="pt-2 flex gap-2">
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-outline flex-1 text-center text-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary flex-1 text-center text-sm">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
