import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  PlayCircle, CheckCircle2, Lock, ChevronLeft, ChevronRight,
  BookOpen, Clock, Menu, X, Loader2, AlertCircle, ArrowLeft,
} from 'lucide-react'
import { courseApi, videoApi } from '../../api/services'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'

interface Lesson {
  id: number
  title: string
  type: string
  durationMinutes: number
  orderIndex: number
  freePreview: boolean
  completed?: boolean
  videoUrl?: string
  content?: string
}

interface Chapter {
  id: number
  title: string
  orderIndex: number
  lessons: Lesson[]
}

interface CourseDetail {
  id: number
  title: string
  chapters: Chapter[]
}

export default function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()
  const { user } = useSelector((s: RootState) => s.auth)

  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [marking, setMarking] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Flat list of all lessons for prev/next navigation
  const allLessons: Lesson[] = course?.chapters.flatMap(c => c.lessons) ?? []
  const currentIndex = allLessons.findIndex(l => l.id === Number(lessonId))
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  // Load course structure
  useEffect(() => {
    if (!courseId) return
    courseApi.getById(Number(courseId))
      .then(r => setCourse(r.data))
      .catch(console.error)
  }, [courseId])

  // Load current lesson + video URL
  useEffect(() => {
    if (!course || !lessonId) return
    const lesson = allLessons.find(l => l.id === Number(lessonId)) ?? null
    setCurrentLesson(lesson)
    setVideoUrl(null)
    setVideoError(null)

    if (lesson?.type === 'VIDEO') {
      setVideoLoading(true)
      videoApi.getStreamUrl(lesson.id)
        .then(r => setVideoUrl(r.data.url))
        .catch(err => {
          setVideoError(err?.response?.data?.message ?? 'Could not load video. Please check enrollment.')
        })
        .finally(() => setVideoLoading(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, lessonId])

  const markComplete = useCallback(async () => {
    if (!courseId || !lessonId || !currentLesson) return
    setMarking(true)
    try {
      await courseApi.completeLesson(Number(courseId), Number(lessonId))
      setCurrentLesson(prev => prev ? { ...prev, completed: true } : prev)
      setCourse(prev => {
        if (!prev) return prev
        return {
          ...prev,
          chapters: prev.chapters.map(ch => ({
            ...ch,
            lessons: ch.lessons.map(l => l.id === Number(lessonId) ? { ...l, completed: true } : l),
          })),
        }
      })
    } catch (e) { console.error(e) }
    finally { setMarking(false) }
  }, [courseId, lessonId, currentLesson])

  // Auto-advance: mark complete + go to next when video ends
  const handleVideoEnded = () => {
    if (!currentLesson?.completed) markComplete()
    if (nextLesson) navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)
  }

  if (!course) return (
    <div className="flex items-center justify-center h-screen bg-gray-950">
      <Loader2 className="w-10 h-10 text-green-500 animate-spin" />
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className={`transition-all duration-300 bg-gray-900 border-r border-gray-800 flex flex-col
          ${sidebarOpen ? 'w-80 min-w-[20rem]' : 'w-0 overflow-hidden'}`}
      >
        {/* Course title */}
        <div className="p-4 border-b border-gray-800">
          <Link to={`/courses/${courseId}`} className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm mb-2">
            <ArrowLeft className="w-4 h-4" /> Back to Course
          </Link>
          <h2 className="font-bold text-sm text-white leading-tight line-clamp-2">{course.title}</h2>
          <p className="text-xs text-gray-400 mt-1">
            {allLessons.filter(l => l.completed).length}/{allLessons.length} lessons
          </p>
          {/* Progress bar */}
          <div className="mt-2 h-1.5 bg-gray-700 rounded-full">
            <div
              className="h-1.5 bg-green-500 rounded-full transition-all"
              style={{ width: `${allLessons.length ? (allLessons.filter(l => l.completed).length / allLessons.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Chapter / Lesson list */}
        <div className="flex-1 overflow-y-auto">
          {course.chapters.map(chapter => (
            <div key={chapter.id}>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 bg-gray-800/50 sticky top-0">
                {chapter.title}
              </div>
              {chapter.lessons.map(lesson => {
                const active = lesson.id === Number(lessonId)
                const locked = !lesson.freePreview && !user
                return (
                  <button
                    key={lesson.id}
                    disabled={locked}
                    onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors
                      ${active ? 'bg-green-900/40 border-r-2 border-green-500' : 'hover:bg-gray-800/50'}
                      ${locked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {lesson.completed
                        ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                        : locked
                          ? <Lock className="w-4 h-4 text-gray-500" />
                          : <PlayCircle className={`w-4 h-4 ${active ? 'text-green-400' : 'text-gray-500'}`} />
                      }
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={`text-xs leading-tight ${active ? 'text-white font-medium' : 'text-gray-300'}`}>
                        {lesson.title}
                      </span>
                      {lesson.durationMinutes > 0 && (
                        <span className="block text-[10px] text-gray-500 mt-0.5">
                          <Clock className="w-3 h-3 inline mr-1" />{lesson.durationMinutes} min
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
            title="Toggle sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-sm text-white truncate">{currentLesson?.title ?? 'Loading…'}</h1>
            <p className="text-xs text-gray-400 truncate">{course.title}</p>
          </div>
          {currentLesson && !currentLesson.completed && (
            <button
              onClick={markComplete}
              disabled={marking}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
            >
              {marking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Mark Complete
            </button>
          )}
          {currentLesson?.completed && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-green-900/40 text-green-400 rounded-lg text-xs font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </span>
          )}
        </header>

        {/* Video / content area */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson?.type === 'VIDEO' && (
            <div className="bg-black flex items-center justify-center" style={{ aspectRatio: '16/9', maxHeight: '60vh' }}>
              {videoLoading && (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <Loader2 className="w-10 h-10 animate-spin" />
                  <span className="text-sm">Loading video…</span>
                </div>
              )}
              {videoError && (
                <div className="flex flex-col items-center gap-3 text-red-400 px-8 text-center">
                  <AlertCircle className="w-10 h-10" />
                  <span className="text-sm">{videoError}</span>
                </div>
              )}
              {videoUrl && !videoError && (
                <video
                  ref={videoRef}
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onEnded={handleVideoEnded}
                />
              )}
            </div>
          )}

          {currentLesson?.type === 'TEXT' && (
            <div className="max-w-3xl mx-auto px-6 py-8">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm">Reading lesson</span>
              </div>
              <div
                className="prose prose-invert prose-green max-w-none"
                dangerouslySetInnerHTML={{ __html: currentLesson.content ?? '<p>No content available.</p>' }}
              />
            </div>
          )}

          {/* Lesson description and navigation */}
          <div className="max-w-3xl mx-auto px-6 py-6">
            {currentLesson && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">{currentLesson.title}</h2>
                {currentLesson.durationMinutes > 0 && (
                  <span className="text-sm text-gray-400">
                    <Clock className="w-4 h-4 inline mr-1" />{currentLesson.durationMinutes} minutes
                  </span>
                )}
              </div>
            )}

            {/* Prev / Next */}
            <div className="flex justify-between gap-4 mt-6 pt-6 border-t border-gray-800">
              {prevLesson ? (
                <button
                  onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson.id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <div className="text-left">
                    <div className="text-[10px] text-gray-400">Previous</div>
                    <div className="font-medium truncate max-w-[180px]">{prevLesson.title}</div>
                  </div>
                </button>
              ) : <div />}

              {nextLesson && (
                <button
                  onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 text-sm transition-colors ml-auto"
                >
                  <div className="text-right">
                    <div className="text-[10px] text-green-200">Next</div>
                    <div className="font-medium truncate max-w-[180px]">{nextLesson.title}</div>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

