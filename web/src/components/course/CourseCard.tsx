import { Link } from 'react-router-dom'
import { Star, Clock, Users, BookOpen } from 'lucide-react'

interface CourseCardProps {
  id: number
  title: string
  thumbnailUrl?: string
  instructor: { firstName: string; lastName: string }
  category: string
  level: string
  rating: number
  totalRatings: number
  enrollmentCount: number
  durationMinutes?: number
  free: boolean
  price?: number
  language: string
}

export default function CourseCard({
  id, title, thumbnailUrl, instructor, category, level,
  rating, totalRatings, enrollmentCount, durationMinutes,
  free, price, language,
}: CourseCardProps) {
  return (
    <Link to={`/courses/${id}`} className="card hover:shadow-md transition-shadow group">
      {/* Thumbnail */}
      <div className="aspect-video bg-green-50 relative overflow-hidden">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-green-300" />
          </div>
        )}
        <span className="absolute top-2 left-2 badge badge-green">{category.replace(/_/g, ' ')}</span>
        {!free && (
          <span className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded">
            PREMIUM
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {instructor.firstName} {instructor.lastName}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <span className="text-yellow-500 font-bold text-sm">{rating.toFixed(1)}</span>
          <div className="flex">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-400">({totalRatings.toLocaleString()})</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{enrollmentCount.toLocaleString()}</span>
          {durationMinutes && (
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m</span>
          )}
          <span className="badge-blue badge">{level}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          {free ? (
            <span className="text-green-600 font-bold">Free</span>
          ) : (
            <span className="font-bold text-gray-900">₹{price?.toLocaleString()}</span>
          )}
          <span className="text-xs text-gray-400 uppercase">{language}</span>
        </div>
      </div>
    </Link>
  )
}
