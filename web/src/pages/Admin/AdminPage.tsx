import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users, BookOpen, BarChart2, PlayCircle, Film, CheckCircle2,
  Upload, Clock, Globe, ChevronDown, ChevronRight, Loader2,
  ClipboardList, RefreshCw, Eye,
} from 'lucide-react'
import apiClient from '../../api/axios'
import AdminExamContent from './AdminExamContent'
import { useTheme } from '../../context/ThemeContext'

// ── Types ─────────────────────────────────────────────────────────────────
interface Stats { totalUsers: number; totalCourses: number; publishedCourses: number; totalEnrollments: number }

interface LessonSummary {
  id: number; title: string; type: string
  durationMinutes: number; freePreview: boolean
  hasVideo: boolean; videoUrl?: string
}
interface ChapterResponse { id: number; title: string; orderIndex: number; lessons: LessonSummary[] }
interface CourseItem {
  id: number; title: string; status: string; category: string; language: string
  enrollmentCount: number; lessonCount: number; thumbnailUrl?: string
  chapters?: ChapterResponse[]
}
interface CoursePage { content: CourseItem[]; totalElements: number; totalPages: number }

// ── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, cardBg, border, text, muted }: {
  icon: React.ElementType; label: string; value: number | string; color: string
  cardBg: string; border: string; text: string; muted: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4" style={{ backgroundColor: cardBg, borderColor: border }}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500" style={{ color: muted }}>{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5" style={{ color: text }}>{value ?? '—'}</p>
      </div>
    </div>
  )
}

// ── Admin Page ─────────────────────────────────────────────────────────────
export default function AdminPage() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [tab, setTab] = useState<'overview' | 'courses' | 'exams'>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [courses, setCourses] = useState<CoursePage | null>(null)
  const [page, setPage] = useState(0)
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [coursesError, setCoursesError] = useState<string | null>(null)
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null)
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({})
  const [courseDetails, setCourseDetails] = useState<Record<number, CourseItem>>({})
  const [loadingDetail, setLoadingDetail] = useState<number | null>(null)
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'

  const loadStats = useCallback(() => {
    setLoadingStats(true)
    setStatsError(null)
    apiClient.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch((err) => {
        const msg = err?.response?.data?.message ?? `Error ${err?.response?.status ?? 'Network error'}`
        setStatsError(msg)
        console.error('Stats load failed:', err)
      })
      .finally(() => setLoadingStats(false))
  }, [])

  const loadCourses = useCallback((p = 0) => {
    setLoadingCourses(true)
    setCoursesError(null)
    apiClient.get(`/admin/courses?page=${p}&size=15`)
      .then(r => setCourses(r.data))
      .catch((err) => {
        const status = err?.response?.status
        const msg = status === 403
          ? 'Access denied. Make sure you are logged in as ADMIN.'
          : status === 401
            ? 'Session expired. Please log in again.'
            : err?.response?.data?.message ?? 'Could not load courses. Is the backend running?'
        setCoursesError(msg)
        console.error('Courses load failed:', err)
      })
      .finally(() => setLoadingCourses(false))
  }, [])

  useEffect(() => { loadStats() }, [loadStats])
  useEffect(() => { if (tab === 'courses') loadCourses(page) }, [tab, page, loadCourses])

  const toggleCourse = async (courseId: number) => {
    if (expandedCourse === courseId) { setExpandedCourse(null); return }
    setExpandedCourse(courseId)
    if (!courseDetails[courseId]) {
      setLoadingDetail(courseId)
      try {
        const r = await apiClient.get(`/courses/${courseId}`)
        setCourseDetails(prev => ({ ...prev, [courseId]: r.data }))
      } catch (e) { console.error(e) }
      finally { setLoadingDetail(null) }
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PUBLISHED: 'bg-green-100 text-green-700',
      DRAFT: 'bg-yellow-100 text-yellow-700',
      ARCHIVED: 'bg-gray-100 text-gray-600',
    }
    return map[status] ?? 'bg-gray-100 text-gray-600'
  }

  const totalLessons = (course: CourseItem) =>
    courseDetails[course.id]?.chapters?.flatMap(c => c.lessons) ?? []

  const videoCoverage = (course: CourseItem) => {
    const lessons = totalLessons(course).filter(l => l.type === 'VIDEO')
    if (!lessons.length) return null
    const done = lessons.filter(l => l.hasVideo).length
    return { done, total: lessons.length, pct: Math.round((done / lessons.length) * 100) }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ backgroundColor: bg, minHeight: '100vh', color: text }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ color: text }}>Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ color: muted }}>Manage courses, videos, and platform content</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50"
            style={{ backgroundColor: cardBg, borderColor: border, color: text }}
          >
            <BarChart2 className="w-4 h-4" /> Analytics
          </button>
          <button
            onClick={() => navigate('/admin/logs')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm hover:bg-gray-50"
            style={{ backgroundColor: cardBg, borderColor: border, color: text }}
          >
            <ClipboardList className="w-4 h-4" /> Log Viewer
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6" style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}>
        {(['overview', 'exams', 'courses'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
              ${tab === t ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            style={tab === t ? { backgroundColor: cardBg, color: text } : { color: muted }}
          >
            {t === 'overview' ? 'Overview' : t === 'exams' ? '📚 Exam Content' : 'Course & Video Management'}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────── */}
      {tab === 'overview' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800" style={{ color: text }}>Platform Stats</h2>
            <button onClick={loadStats} disabled={loadingStats} className="text-gray-400 hover:text-gray-600" style={{ color: muted }}>
              <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {statsError && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <span>⚠ {statsError}</span>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Users}     label="Total Users"       value={stats?.totalUsers ?? '—'}       color="bg-blue-500" cardBg={cardBg} border={border} text={text} muted={muted} />
            <StatCard icon={BookOpen}  label="Total Courses"     value={stats?.totalCourses ?? '—'}     color="bg-purple-500" cardBg={cardBg} border={border} text={text} muted={muted} />
            <StatCard icon={Globe}     label="Published Courses" value={stats?.publishedCourses ?? '—'} color="bg-green-500" cardBg={cardBg} border={border} text={text} muted={muted} />
            <StatCard icon={BarChart2} label="Total Enrollments" value={stats?.totalEnrollments ?? '—'} color="bg-orange-500" cardBg={cardBg} border={border} text={text} muted={muted} />
          </div>

          {/* Quick actions */}
          <h2 className="text-lg font-semibold text-gray-800 mt-8 mb-4" style={{ color: text }}>Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionCard
              icon={Film}
              title="Upload Course Videos"
              desc="Select a course and upload videos lesson-by-lesson"
              cta="Manage Videos"
              onClick={() => setTab('courses')}
              color="bg-green-50 border-green-200"
              iconColor="bg-green-100 text-green-700"
              text={text}
              muted={muted}
              cardBg={cardBg}
              border={border}
            />
            <ActionCard
              icon={BookOpen}
              title="Manage Courses"
              desc="View all courses including drafts and unpublished"
              cta="View Courses"
              onClick={() => setTab('courses')}
              color="bg-blue-50 border-blue-200"
              iconColor="bg-blue-100 text-blue-700"
              text={text}
              muted={muted}
              cardBg={cardBg}
              border={border}
            />
            <ActionCard
              icon={ClipboardList}
              title="View System Logs"
              desc="Live backend logs with filtering and stats"
              cta="Open Logs"
              onClick={() => navigate('/admin/logs')}
              color="bg-gray-50 border-gray-200"
              iconColor="bg-gray-100 text-gray-700"
              text={text}
              muted={muted}
              cardBg={cardBg}
              border={border}
            />
          </div>
        </div>
      )}

      {/* ── EXAM CONTENT TAB ─────────────────────────────────────────── */}
      {tab === 'exams' && <AdminExamContent />}

      {/* ── COURSES TAB ──────────────────────────────────────────── */}
      {tab === 'courses' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800" style={{ color: text }}>
              All Courses
              {courses && <span className="ml-2 text-sm text-gray-400 font-normal" style={{ color: muted }}>({courses.totalElements} total)</span>}
            </h2>
            <button onClick={() => loadCourses(page)} disabled={loadingCourses} className="text-gray-400 hover:text-gray-600" style={{ color: muted }}>
              <RefreshCw className={`w-4 h-4 ${loadingCourses ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingCourses && !courses && (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-gray-400 animate-spin" style={{ color: muted }} /></div>
          )}

          {coursesError && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="text-4xl">⚠️</div>
              <p className="text-red-600 font-medium">{coursesError}</p>
              <p className="text-sm text-gray-400" style={{ color: muted }}>Make sure the backend is running and you are logged in as ADMIN.</p>
              <button
                onClick={() => loadCourses(page)}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-500"
              >
                Retry
              </button>
            </div>
          )}

          {!loadingCourses && !coursesError && courses?.content.length === 0 && (
            <div className="text-center py-16 text-gray-400" style={{ color: muted }}>
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No courses found in the database.</p>
              <p className="text-sm mt-1">Run the Flyway seed migrations (V4) to populate course data.</p>
            </div>
          )}

          <div className="space-y-3">
            {courses?.content.map(course => {
              const detail = courseDetails[course.id]
              const coverage = expandedCourse === course.id ? videoCoverage(course) : null
              const chapters = detail?.chapters ?? []

              return (
                <div key={course.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ backgroundColor: cardBg, borderColor: border }}>
                  {/* Course header row */}
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    style={{ color: text }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-green-700" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900 truncate" style={{ color: text }}>{course.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(course.status)}`}>
                          {course.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400" style={{ color: muted }}>
                        <span>{course.category?.replace(/_/g, ' ')}</span>
                        <span>·</span>
                        <span>{course.language}</span>
                        <span>·</span>
                        <span>{course.enrollmentCount} enrolled</span>
                        <span>·</span>
                        <span>{course.lessonCount} lessons</span>
                      </div>
                    </div>

                    {/* Video progress (shown once expanded + loaded) */}
                    {coverage && (
                      <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 shrink-0" style={{ color: muted }}>
                        <Film className="w-3.5 h-3.5" />
                        <span>{coverage.done}/{coverage.total} videos</span>
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full">
                          <div className="h-1.5 bg-green-500 rounded-full" style={{ width: `${coverage.pct}%` }} />
                        </div>
                      </div>
                    )}

                    <span className="text-gray-400 shrink-0" style={{ color: muted }}>
                      {loadingDetail === course.id
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : expandedCourse === course.id
                          ? <ChevronDown className="w-4 h-4" />
                          : <ChevronRight className="w-4 h-4" />}
                    </span>
                  </button>

                  {/* Expanded: chapters + lessons */}
                  {expandedCourse === course.id && detail && (
                    <div className="border-t border-gray-100 bg-gray-50" style={{ borderColor: border, backgroundColor: isDark ? '#111827' : '#f9fafb' }}>
                      {/* Course-level actions */}
                      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-white" style={{ borderColor: border, backgroundColor: cardBg }}>
                        <a
                          href={`/courses/${course.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-3.5 h-3.5" /> View course page
                        </a>
                      </div>

                      {chapters.length === 0 && (
                        <p className="px-6 py-4 text-sm text-gray-400" style={{ color: muted }}>No chapters found for this course.</p>
                      )}

                      {chapters.map(chapter => (
                        <div key={chapter.id}>
                          {/* Chapter header */}
                          <button
                            onClick={() => setExpandedChapters(prev => ({ ...prev, [chapter.id]: !prev[chapter.id] }))}
                            className="w-full flex items-center gap-2 px-5 py-2.5 text-left bg-gray-100/70 hover:bg-gray-100 transition-colors"
                            style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
                          >
                            {expandedChapters[chapter.id]
                              ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                              : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide" style={{ color: muted }}>
                              {chapter.title}
                            </span>
                            <span className="text-xs text-gray-400" style={{ color: muted }}>
                              ({chapter.lessons?.length ?? 0} lessons)
                            </span>
                          </button>

                          {/* Lessons */}
                          {(expandedChapters[chapter.id] ?? true) && (
                            <div className="divide-y divide-gray-100" style={{ borderColor: border }}>
                              {(chapter.lessons ?? []).map(lesson => (
                                <div key={lesson.id} className="flex items-center gap-3 px-6 py-3 bg-white" style={{ backgroundColor: cardBg, borderColor: border }}>
                                  {/* Status icon */}
                                  <div className="shrink-0">
                                    {lesson.type === 'VIDEO'
                                      ? lesson.hasVideo
                                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        : <PlayCircle className="w-4 h-4 text-gray-300" />
                                      : <BookOpen className="w-4 h-4 text-blue-400" />}
                                  </div>

                                  {/* Lesson info */}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-800 truncate" style={{ color: text }}>{lesson.title}</p>
                                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400" style={{ color: muted }}>
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium
                                        ${lesson.type === 'VIDEO' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {lesson.type}
                                      </span>
                                      {lesson.durationMinutes > 0 && (
                                        <span><Clock className="w-3 h-3 inline mr-0.5" />{lesson.durationMinutes} min</span>
                                      )}
                                      {lesson.freePreview && (
                                        <span className="text-green-600 font-medium">Free Preview</span>
                                      )}
                                      {lesson.type === 'VIDEO' && (
                                        <span className={lesson.hasVideo ? 'text-green-600 font-medium' : 'text-red-400'}>
                                          {lesson.hasVideo ? '✓ Video uploaded' : '⚠ No video yet'}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Upload button (only for VIDEO type) */}
                                  {lesson.type === 'VIDEO' && (
                                    <button
                                      onClick={() => navigate(`/instructor/courses/${course.id}/lessons/${lesson.id}/upload-video`)}
                                      className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                        ${lesson.hasVideo
                                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          : 'bg-green-600 text-white hover:bg-green-500'}`}
                                    >
                                      <Upload className="w-3.5 h-3.5" />
                                      {lesson.hasVideo ? 'Replace Video' : 'Upload Video'}
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {courses && courses.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: courses.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => { setPage(i); loadCourses(i) }}
                  className={`w-8 h-8 rounded-lg text-sm font-medium
                    ${page === i ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  style={page === i ? undefined : { backgroundColor: cardBg, borderColor: border, color: muted }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Action card helper ────────────────────────────────────────────────────
function ActionCard({ icon: Icon, title, desc, cta, onClick, color, iconColor, text, muted, cardBg, border }: {
  icon: React.ElementType; title: string; desc: string; cta: string
  onClick: () => void; color: string; iconColor: string
  text: string; muted: string; cardBg: string; border: string
}) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${color}`} style={{ backgroundColor: cardBg, borderColor: border }}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900" style={{ color: text }}>{title}</h3>
        <p className="text-sm text-gray-500 mt-0.5" style={{ color: muted }}>{desc}</p>
      </div>
      <button
        onClick={onClick}
        className="mt-auto text-sm font-medium text-gray-700 hover:text-gray-900 flex items-center gap-1"
        style={{ color: text }}
      >
        {cta} <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
