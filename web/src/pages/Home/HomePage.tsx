import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { courseApi } from '../../api/services'
import CourseCard from '../../components/course/CourseCard'
import { Sprout, Users, BookOpen, Video, MessageSquare, ShoppingBag, Star } from 'lucide-react'

const CATEGORIES = [
  { key: 'UPSC', emoji: '📚', label: 'UPSC' },
  { key: 'SSC', emoji: '📝', label: 'SSC' },
  { key: 'IBPS', emoji: '🏦', label: 'IBPS / Bank' },
  { key: 'RAILWAY', emoji: '🚂', label: 'Railway' },
  { key: 'STATE_PSC', emoji: '🏛️', label: 'State PSC' },
  { key: 'DEFENSE', emoji: '🪖', label: 'Defence' },
  { key: 'TEACHING', emoji: '🎓', label: 'Teaching' },
  { key: 'OTHER', emoji: '📊', label: 'Other Exams' },
]

const STATS = [
  { icon: Users, value: '1 Lakh+', label: 'Active Learners' },
  { icon: BookOpen, value: '500+', label: 'Expert Courses' },
  { icon: Video, value: '200+', label: 'Video Lectures' },
]

export default function HomePage() {
  const { t } = useTranslation()
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth)

  const { data: featuredData } = useQuery('featuredCourses', courseApi.getFeatured, {
    select: (res) => res.data,
  })

  return (
    <div>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #194552 0%, #1d6b7a 50%, #155060 100%)' }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="w-6 h-6 text-yellow-300" />
              <span className="text-yellow-300 font-medium text-sm">India's #1 Agriculture Learning Platform</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-green-100 mb-8 max-w-xl">
              {t('hero.subtitle')}
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
                  {t('hero.cta')}
                </Link>
              )}
              <Link to="/courses"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors text-center">
                Browse Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <div className="flex justify-center mb-2">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Explore by Exam</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(cat => (
              <Link key={cat.key} to={`/courses?category=${cat.key}`}
                className="bg-white rounded-xl p-5 text-center hover:shadow-md hover:border-green-300 border border-transparent transition-all cursor-pointer">
                <div className="text-3xl mb-2">{cat.emoji}</div>
                <div className="font-medium text-gray-700 text-sm">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">⭐ Top Courses</h2>
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
                <div key={i} className="card animate-pulse">
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
      <section className="py-14 bg-green-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">Everything you need to crack exam</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Video, title: 'Video Lectures', desc: 'Watch high-quality recorded video lectures by top subject experts anytime, anywhere.' },
              { icon: MessageSquare, title: 'Community Forum', desc: 'Connect with 1 lakh+ students. Ask questions, share knowledge, solve doubts together.' },
              { icon: ShoppingBag, title: 'Study Material', desc: 'Access notes, PDFs, practice papers, and mock tests for all competitive exams.' },
              { icon: Star, title: 'Top Educators', desc: 'Courses designed by experienced educators and subject matter experts.' },
              { icon: BookOpen, title: 'Regional Languages', desc: 'Learn in Hindi, Marathi, Punjabi, Gujarati, Tamil and more.' },
              { icon: Users, title: 'Expert Instructors', desc: 'Learn from experienced faculty who have guided thousands of successful candidates.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — only shown to guests */}
      {!isAuthenticated && (
        <section className="py-16 bg-yellow-400">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start learning today for free</h2>
            <p className="text-gray-700 mb-8">Join 1 lakh+ farmers and agri-students already on AgriLearn</p>
            <Link to="/register"
              className="bg-green-700 text-white px-10 py-3 rounded-lg font-bold text-lg hover:bg-green-800 transition-colors">
              Create Free Account
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
