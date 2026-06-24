import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { courseApi } from '../../api/services'
import CourseCard from '../../components/course/CourseCard'
import { Users, BookOpen, Video, MessageSquare, ShoppingBag, Star } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const CATEGORIES = [
  { key: 'UPCATET', logo: '/icons/UPCATET.jpg', emoji: null, label: 'UPCATET' },
  { key: 'UPSSSC-AGTA', logo: '/icons/UPSSSC.avif', emoji: null, label: 'UPSSSC AGTA' },
  { key: 'UP CANE SUPERVISOR', logo: '/icons/UPSSSC.avif', emoji: null, label: 'UP Cane Supervisor' },
  { key: 'IBPS AFO', logo: '/icons/ibps.png', emoji: null, label: 'IBPS AFO' },
  { key: 'RRB SO(AGRICULTURE OFFICER)', logo: '/icons/ibps.png', emoji: null, label: 'RRB SO (Agri Officer)' },
  { key: 'NABARD GRADE A', logo: '/icons/NABARD.avif', emoji: null, label: 'NABARD Grade A' },
]

const STATS = [
  { icon: Users, value: '100%', label: 'Free Content' },
  { icon: BookOpen, value: '15+', label: 'Exams Covered' },
  { icon: Video, value: 'Free', label: 'Notes & Lectures' },
]

export default function HomePage() {
  const { t } = useTranslation()
  const { isDark } = useTheme()
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth)
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'

  const { data: featuredData } = useQuery('featuredCourses', courseApi.getFeatured, {
    select: (res) => res.data,
  })

  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh', color: text }}>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #194552 0%, #1d6b7a 50%, #155060 100%)' }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎯</span>
              <span className="text-yellow-300 font-medium text-sm">India's Free Online Education Center</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              TASSY POINT
            </h1>
            <p className="text-lg text-green-100 mb-6 max-w-xl">
              A free online education center — Notes, Tests, Video Lectures & Job Alerts for all competitive exams.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard"
                  className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors text-center">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/register"
                  className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-300 transition-colors text-center">
                  Start Learning Free 🚀
                </Link>
              )}
              <Link to="/exams"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-teal-700 transition-colors text-center">
                Explore Exams
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b" style={{ backgroundColor: cardBg, borderColor: border }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <div className="flex justify-center mb-2">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900" style={{ color: text }}>{value}</div>
                <div className="text-sm text-gray-500" style={{ color: muted }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 bg-gray-50" style={{ backgroundColor: bg }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center" style={{ color: text }}>Explore by Exam</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat.key} to={`/exams`}
                className="bg-white rounded-xl p-5 text-center hover:shadow-md hover:border-green-300 border border-transparent transition-all cursor-pointer"
                style={{ backgroundColor: cardBg, borderColor: border }}>
                <div className="flex justify-center items-center mb-2" style={{ height: '48px' }}>
                  {cat.logo
                    ? <img src={cat.logo} alt={cat.label} style={{ height: '44px', width: 'auto', maxWidth: '80px', objectFit: 'contain', borderRadius: '6px' }} />
                    : <span className="text-3xl">{cat.emoji}</span>
                  }
                </div>
                <div className="font-medium text-gray-700 text-sm" style={{ color: text }}>{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-14 bg-white" style={{ backgroundColor: bg }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900" style={{ color: text }}>⭐ Top Courses</h2>
            <Link to="/courses" className="text-green-600 hover:text-green-700 font-medium text-sm">
              View all →
            </Link>
          </div>
          {featuredData?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredData.map((course: any) => (
                <CourseCard key={course.id} {...course} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-14 bg-green-50" style={{ backgroundColor: bg }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12" style={{ color: text }}>Everything you need to crack exam</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Video, title: 'Free Video Lectures', desc: 'Watch high-quality video lectures on YouTube — completely free, no subscription needed.' },
              { icon: BookOpen, title: 'Free Notes & PDFs', desc: 'Access chapter-wise notes, PDFs and study material for all competitive exams at zero cost.' },
              { icon: MessageSquare, title: 'MCQ Practice Tests', desc: 'AI-generated chapter-wise MCQ tests to test your knowledge and track your progress.' },
              { icon: Star, title: 'Job Alerts', desc: 'Get the latest government job alerts, exam notifications and application deadlines.' },
              { icon: ShoppingBag, title: 'Exam Solutions', desc: 'Previous year paper solutions and answer keys for UPSC, SSC, NEET, JEE and more.' },
              { icon: Users, title: '15+ Exams Covered', desc: 'ICAR, SSC, UP Police, CTET, UPTET, Delhi Police, UPCATET, NEET, JEE, Haryana Police, Patwari, CGL, CHSL, UPSC, CLAT.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2" style={{ color: text }}>{title}</h3>
                <p className="text-sm text-gray-500" style={{ color: muted }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — only shown to guests */}
      {!isAuthenticated && (
        <section className="py-16 bg-yellow-400">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Learning Today — It's 100% Free!</h2>
            <p className="text-gray-700 mb-8">Join thousands of students preparing for UPSC, SSC, NEET, JEE, UP Police & more on Tassy Point</p>
            <Link to="/register"
              className="bg-gray-900 text-white px-10 py-3 rounded-lg font-bold text-lg hover:bg-gray-800 transition-colors">
              Create Free Account 🎯
            </Link>
          </div>
        </section>
      )}

      {/* Logged-in CTA — continue learning */}
      {isAuthenticated && (
        <section style={{ background: '#194552' }} className="py-16">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Welcome back, {user?.firstName}! 👋
            </h2>
            <p className="text-green-100 mb-8">Pick up where you left off or explore new courses</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dashboard"
                className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-bold hover:bg-yellow-300 transition-colors">
                My Dashboard
              </Link>
              <Link to="/courses"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors">
                Browse More Courses
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
