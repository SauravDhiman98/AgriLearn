import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { courseApi } from '../../api/services'
import { RootState, AppDispatch } from '../../store'
import { Star, Clock, Users, BookOpen, Play, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-toastify'

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0)
  const [enrolling, setEnrolling] = useState(false)

  const { data: course, isLoading } = useQuery(
    ['course', id],
    () => courseApi.getById(Number(id)),
    { select: res => res.data }
  )

  const handleEnroll = async () => {
    if (!isAuthenticated) { toast.info('Please login to enroll'); return }
    setEnrolling(true)
    try {
      await courseApi.enroll(Number(id))
      toast.success('Enrolled successfully! 🎉')
    } catch {
      toast.error('Enrollment failed')
    } finally { setEnrolling(false) }
  }

  if (isLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
    </div>
  )

  if (!course) return <div className="text-center py-20 text-gray-500">Course not found</div>

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Course header */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex gap-2 mb-3">
              <span className="badge badge-green">{course.category?.replace(/_/g, ' ')}</span>
              <span className="badge badge-blue">{course.level}</span>
              <span className="text-xs text-gray-400">{course.language}</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
            <p className="text-gray-300 mb-4">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                {course.rating?.toFixed(1)} ({course.totalRatings?.toLocaleString()} ratings)
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" /> {course.enrollmentCount?.toLocaleString()} students
              </span>
              {course.durationMinutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {course.chapterCount} chapters
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Instructor: {course.instructor?.firstName} {course.instructor?.lastName}
            </p>
          </div>

          {/* Enrollment card */}
          <div>
            <div className="bg-white text-gray-900 rounded-xl p-6 shadow-lg sticky top-20">
              {course.thumbnailUrl && (
                <img src={course.thumbnailUrl} alt={course.title}
                  className="w-full aspect-video object-cover rounded-lg mb-4" />
              )}
              <div className="text-center mb-4">
                {course.free ? (
                  <span className="text-3xl font-bold text-green-600">Free</span>
                ) : (
                  <span className="text-3xl font-bold">₹{course.price?.toLocaleString()}</span>
                )}
              </div>
              <button onClick={handleEnroll} disabled={enrolling}
                className="btn-primary w-full py-3 text-base">
                {enrolling ? 'Enrolling...' : (course.free ? 'Enroll for Free' : 'Buy Now')}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">30-day money-back guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
        <div className="bg-white rounded-xl border divide-y">
          {course.chapters?.map((chapter: any, idx: number) => (
            <div key={chapter.id}>
              <button
                onClick={() => setExpandedChapter(expandedChapter === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                <div>
                  <span className="font-medium text-gray-900">{chapter.title}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    {chapter.lessons?.length} lessons
                  </span>
                </div>
                {expandedChapter === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {expandedChapter === idx && (
                <div className="divide-y bg-gray-50">
                  {chapter.lessons?.map((lesson: any) => (
                    <div key={lesson.id} className="flex items-center gap-3 px-6 py-3">
                      {lesson.freePreview ? (
                        <Play className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-700">{lesson.title}</span>
                      {lesson.durationMinutes && (
                        <span className="ml-auto text-xs text-gray-400">{lesson.durationMinutes}m</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
