import { Link } from 'react-router-dom'
import { Mail, Phone, Twitter, Facebook, Youtube, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-xl mb-3">
              <img src="/logo.png" alt="Tassy Point" className="w-8 h-8 object-contain rounded" style={{ background: '#194552' }} />
              TASSY POINT
            </div>
            <p className="text-sm text-gray-400">
              Empowering students with quality education and resources to crack competitive exams.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Youtube className="w-5 h-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Learn */}
          <div>
            <h4 className="text-white font-semibold mb-3">Learn</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
              <li><Link to="/live-classes" className="hover:text-white">Video Lectures</Link></li>
              <li><Link to="/courses?category=UPSC" className="hover:text-white">UPSC</Link></li>
              <li><Link to="/courses?category=SSC" className="hover:text-white">SSC</Link></li>
              <li><Link to="/courses?category=IBPS" className="hover:text-white">IBPS / Bank</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-white font-semibold mb-3">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/forum" className="hover:text-white">Forum</Link></li>
              <li><Link to="/marketplace" className="hover:text-white">Marketplace</Link></li>
              <li><Link to="/register" className="hover:text-white">Become an Instructor</Link></li>
              <li><a href="#" className="hover:text-white">Success Stories</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> support@tassypoint.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> +91 98765 43210
              </li>
            </ul>
            <div className="mt-4">
              <p className="text-xs text-gray-500">Available in</p>
              <p className="text-sm">English · हिंदी · मराठी · ਪੰਜਾਬੀ · ગુજરાતી</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between text-xs text-gray-500">
          <p>© 2024 Tassy Point. All rights reserved.</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <a href="#" className="hover:text-white">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
