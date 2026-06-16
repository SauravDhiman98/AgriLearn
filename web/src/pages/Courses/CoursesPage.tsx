import { useState } from 'react'
import { useQuery } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'
import { courseApi } from '../../api/services'
import { setFilters } from '../../store/slices/courseSlice'
import { RootState, AppDispatch } from '../../store'
import CourseCard from '../../components/course/CourseCard'
import { Search, SlidersHorizontal } from 'lucide-react'

const CATEGORIES = [
  'CROP_SCIENCE', 'SOIL_HEALTH', 'ORGANIC_FARMING', 'IRRIGATION',
  'PEST_MANAGEMENT', 'HORTICULTURE', 'ANIMAL_HUSBANDRY', 'AGRIBUSINESS',
  'FARM_TECHNOLOGY', 'FOOD_PROCESSING', 'DAIRY_FARMING', 'AQUACULTURE',
]

const LANGUAGES = ['ENGLISH', 'HINDI', 'MARATHI', 'PUNJABI', 'GUJARATI', 'KANNADA', 'TAMIL', 'TELUGU']
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

export default function CoursesPage() {
  const dispatch = useDispatch<AppDispatch>()
  const filters = useSelector((s: RootState) => s.courses.filters)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery(
    ['courses', filters, page],
    () => courseApi.list({ ...filters, keyword: search, page, size: 12 }),
    { select: res => res.data, keepPreviousData: true }
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🌾 Agriculture Courses</h1>

      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setPage(0)}
            placeholder="Search courses, topics..."
            className="input-field pl-10"
          />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="btn-outline flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white border rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input-field"
              value={filters.category || ''}
              onChange={e => dispatch(setFilters({ category: e.target.value || null }))}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
            <select className="input-field"
              value={filters.language || ''}
              onChange={e => dispatch(setFilters({ language: e.target.value || null }))}>
              <option value="">All Languages</option>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
            <select className="input-field"
              value={filters.level || ''}
              onChange={e => dispatch(setFilters({ level: e.target.value || null }))}>
              <option value="">All Levels</option>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Course grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-video bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : data?.content?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.content.map((course: any) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
          {/* Pagination */}
          <div className="flex justify-center gap-2 mt-8">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-outline disabled:opacity-40">
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">
              Page {page + 1} of {data.totalPages}
            </span>
            <button disabled={data.last} onClick={() => setPage(p => p + 1)} className="btn-outline disabled:opacity-40">
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🌱</div>
          <p className="text-lg font-medium">No courses found</p>
          <p className="text-sm">Try adjusting your filters or search term</p>
        </div>
      )}
    </div>
  )
}
