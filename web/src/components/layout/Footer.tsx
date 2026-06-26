import { Link } from 'react-router-dom'
import { Mail, Phone, Twitter, Facebook, Youtube, Instagram } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const Whatsapp = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const Telegram = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0 12 12 0 0011.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

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
              <a href="https://twitter.com/itssachinsoam?s=09" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: text }}><Twitter className="w-5 h-5" /></a>
              <a href="https://www.facebook.com/profile.php?id=100063815269029&mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: text }}><Facebook className="w-5 h-5" /></a>
              <a href="https://www.youtube.com/channel/UCxynFyuaNlJdoh3kXsYAwKw" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: text }}><Youtube className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/tassy.point?utm_source=qr&igsh=c3Bobm9hZXpxeXM1" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: text }}><Instagram className="w-5 h-5" /></a>
              <a href="https://whatsapp.com/channel/0029Vb88oN6H5JM2S3gYXq0X" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: text }}><Whatsapp className="w-5 h-5" /></a>
              <a href="https://t.me/tassypoint" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" style={{ color: text }}><Telegram className="w-5 h-5" /></a>
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

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-3" style={{ color: heading }}>Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-white" style={{ color: text }}>About Us</Link></li>
              <li><Link to="/exams" className="hover:text-white" style={{ color: text }}>Exams</Link></li>
              <li><Link to="/exam-info" className="hover:text-white" style={{ color: text }}>Exam Info</Link></li>
              <li><Link to="/forum" className="hover:text-white" style={{ color: text }}>Community</Link></li>
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
            <Link to="/about" className="hover:text-white" style={{ color: muted }}>About Us</Link>
            <Link to="/privacy-policy" className="hover:text-white" style={{ color: muted }}>Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white" style={{ color: muted }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
