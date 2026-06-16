import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { logout } from '../../store/slices/authSlice'
import { ShoppingCart, Menu, X, Leaf, Globe } from 'lucide-react'

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
    { to: '/courses', label: t('nav.courses') },
    { to: '/live-classes', label: t('nav.liveClasses') },
    { to: '/forum', label: t('nav.forum') },
    { to: '/marketplace', label: t('nav.marketplace') },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-green-700">
            <Leaf className="w-6 h-6 text-green-600" />
            AgriLearn
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to}
                className="text-gray-600 hover:text-green-700 font-medium transition-colors">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="relative hidden md:block">
              <button onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
                <Globe className="w-4 h-4" />
                <span className="text-sm uppercase">{i18n.language.slice(0, 2)}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border rounded-lg shadow-lg py-1 z-50">
                  {LANGUAGES.map(lang => (
                    <button key={lang.code}
                      onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false) }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/marketplace" className="relative text-gray-500 hover:text-gray-700">
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
                      className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-1 z-50">
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">{t('nav.profile')}</Link>
                      {user?.role === 'ADMIN' && (
                        <>
                          <Link to="/admin" className="block px-4 py-2 text-sm hover:bg-gray-50">Admin Dashboard</Link>
                          <Link to="/admin/logs" className="block px-4 py-2 text-sm hover:bg-gray-50">Log Viewer</Link>
                        </>
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button onClick={() => { dispatch(logout()); navigate('/') }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn-primary text-sm py-1.5">
                  {t('nav.register')}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t space-y-2">
            {navLinks.map(link => (
              <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
                className="block py-2 text-gray-700 font-medium">
                {link.label}
              </Link>
            ))}
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
