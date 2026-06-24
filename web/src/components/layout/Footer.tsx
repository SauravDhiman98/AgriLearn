import { Link } from 'react-router-dom'
import { Mail, Phone, Twitter, Facebook, Youtube, Instagram } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Footer() {
  const { isDark } = useTheme()
  const bg = isDark ? '#111827' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const heading = isDark ? '#ffffff' : '#111827'

  return (
    <footer className="bg-gray-900 text-gray-300" style={{ backgroundColor: bg, color: text }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3" style={{ color: heading }}>
              <img src="/logo.png" alt="Tassy Point" className="w-8 h-8 object-contain rounded" style={{ background: '#194552' }} />
              TASSY POINT
            </div>
            <p className="text-sm text-gray-400" style={{ color: muted }}>
              Empowering students with quality education and resources to crack competitive exams.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://twitter.com/itssachinsoam?s=09" className="hover:text-white transition-colors" style={{ color: text }}><Twitter className="w-5 h-5" /></a>
              <a href="https://m.facebook.com/TASSY-POINT-113129070398027" className="hover:text-white transition-colors" style={{ color: text }}><Facebook className="w-5 h-5" /></a>
              <a href="www.youtube.com/channel/UCxynFyuaNlJdoh3kXsYAwKw" className="hover:text-white transition-colors" style={{ color: text }}><Youtube className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/thakur.sachin.soam" className="hover:text-white transition-colors" style={{ color: text }}><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-white font-semibold mb-3" style={{ color: heading }}>Learn</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="hover:text-white" style={{ color: text }}>Courses</Link></li>
              <li><Link to="/live-classes" className="hover:text-white" style={{ color: text }}>Video Lectures</Link></li>
              <li><Link to="/courses?category=UPSC" className="hover:text-white" style={{ color: text }}>UPSC</Link></li>
              <li><Link to="/courses?category=SSC" className="hover:text-white" style={{ color: text }}>SSC</Link></li>
              <li><Link to="/courses?category=IBPS" className="hover:text-white" style={{ color: text }}>IBPS / Bank</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-semibold mb-3" style={{ color: heading }}>Community</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/forum" className="hover:text-white" style={{ color: text }}>Forum</Link></li>
              <li><Link to="/marketplace" className="hover:text-white" style={{ color: text }}>Marketplace</Link></li>
              <li><Link to="/register" className="hover:text-white" style={{ color: text }}>Become an Instructor</Link></li>
              <li><a href="#" className="hover:text-white" style={{ color: text }}>Success Stories</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3" style={{ color: heading }}>Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2" style={{ color: text }}>
                <Mail className="w-4 h-4" /> support@tassypoint.in
              </li>
              <li className="flex items-center gap-2" style={{ color: text }}>
                <Phone className="w-4 h-4" /> +91 98765 43210
              </li>
            </ul>
            {/* <div className="mt-4">
              <p className="text-xs text-gray-500" style={{ color: muted }}>Available in</p>
              <p className="text-sm" style={{ color: text }}>English · हिंदी · मराठी · ਪੰਜਾਬੀ · ગુજરાતી</p>
            </div> */}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between text-xs text-gray-500" style={{ borderColor: border, color: muted }}>
          <p style={{ color: muted }}>© 2024 Tassy Point. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-white" style={{ color: muted }}>Privacy Policy</a>
            <a href="#" className="hover:text-white" style={{ color: muted }}>Terms of Service</a>
            <a href="#" className="hover:text-white" style={{ color: muted }}>Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
