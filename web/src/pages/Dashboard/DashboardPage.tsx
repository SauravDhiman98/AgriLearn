import { useSelector } from 'react-redux'
import { useQuery } from 'react-query'
import { RootState } from '../../store'
import { courseApi, userApi } from '../../api/services'
import { Link } from 'react-router-dom'
import { BookOpen, TrendingUp, Award, Clock } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useSelector((s: RootState) => s.auth)

  const { data: myCourses } = useQuery('myCourses', courseApi.getMyCourses, {
    select: res => res.data
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-gray-500">Continue your agriculture learning journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: BookOpen, label: 'Enrolled Courses', value: myCourses?.length || 0, color: 'green' },
          { icon: TrendingUp, label: 'In Progress', value: myCourses?.filter((c: any) => !c.completed).length || 0, color: 'blue' },
          { icon: Award, label: 'Completed', value: myCourses?.filter((c: any) => c.completed).length || 0, color: 'yellow' },
          { icon: Clock, label: 'Hours Learned', value: '12h', color: 'purple' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 text-${color}-600`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* My courses */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
          <Link to="/courses" className="text-sm text-green-600 hover:text-green-700">Browse more →</Link>
        </div>
        {myCourses?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCourses.map((course: any) => (
              <div key={course.id} className="card p-4">
                <div className="flex gap-3">
                  <div className="w-20 h-14 bg-green-100 rounded-lg flex-shrink-0 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img src={course.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-green-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{course.title}</h3>
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{course.progressPercent || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${course.progressPercent || 0}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
                <Link to={`/courses/${course.id}/learn`}
                  className="btn-primary w-full text-center text-sm mt-3 py-1.5">
                  {(course.progressPercent || 0) > 0 ? 'Continue' : 'Start Learning'}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">You haven't enrolled in any courses yet</p>
            <Link to="/courses" className="btn-primary text-sm">Explore Courses</Link>
          </div>
        )}
      </div>
    </div>
  )
}
