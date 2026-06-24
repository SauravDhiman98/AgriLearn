import { useState } from 'react'
import { useQuery } from 'react-query'
import { forumApi } from '../../api/services'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { Link, useNavigate } from 'react-router-dom'
import { MessageSquare, ThumbsUp, Tag, Plus, Search } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useTheme } from '../../context/ThemeContext'
dayjs.extend(relativeTime)

export default function ForumPage() {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [page, setPage] = useState(0)
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const inputBg = isDark ? '#374151' : '#ffffff'

  const { data, isLoading } = useQuery(
    ['forumPosts', search, activeTag, page],
    () => forumApi.listPosts({ keyword: search, tag: activeTag, page, size: 20 }),
    { select: res => res.data }
  )

  const POPULAR_TAGS = ['wheat', 'rice', 'pest', 'fertilizer', 'irrigation', 'organic', 'soil', 'market']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" style={{ backgroundColor: bg, minHeight: '100vh', color: text }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ color: text }}>💬 Community Forum</h1>
          <p className="text-gray-500 text-sm" style={{ color: muted }}>Ask questions, share knowledge with 1 lakh+ farmers</p>
        </div>
        <button
          onClick={() => isAuthenticated ? navigate('/forum/new') : navigate('/login')}
          className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ask Question
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" style={{ color: muted }} />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search questions..." className="input-field pl-10" style={{ backgroundColor: inputBg, color: text, border: `1px solid ${border}` }} />
      </div>

      {/* Popular tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {POPULAR_TAGS.map(tag => (
          <button key={tag}
            onClick={() => setActiveTag(activeTag === tag ? '' : tag)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              activeTag === tag ? 'bg-green-600 text-white border-green-600' : 'border-gray-200 text-gray-600 hover:border-green-400'
            }`}>
            <Tag className="w-3 h-3" /> {tag}
          </button>
        ))}
      </div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : data?.content?.length > 0 ? (
        <div className="space-y-3">
          {data.content.map((post: any) => (
            <Link key={post.id} to={`/forum/${post.id}`}
              className="card p-5 flex gap-4 hover:shadow-md transition-shadow" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
              <div className="flex flex-col items-center gap-1 text-xs text-gray-500 flex-shrink-0 w-12 text-center" style={{ color: muted }}>
                <ThumbsUp className="w-4 h-4" />
                <span>{post.upvotes}</span>
                <MessageSquare className="w-4 h-4 mt-2" />
                <span>{post.comments?.length || 0}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2">
                  <h3 className="font-medium text-gray-900 flex-1" style={{ color: text }}>{post.title}</h3>
                  {post.solved && <span className="badge badge-green flex-shrink-0">Solved</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2" style={{ color: muted }}>{post.content}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {post.tags?.map((tag: string) => (
                    <span key={tag} className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                  <span className="text-xs text-gray-400 ml-auto" style={{ color: muted }}>
                    {post.author?.firstName} · {dayjs(post.createdAt).fromNow()}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500" style={{ color: muted }}>
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-300" />
          <p>No posts yet. Be the first to ask!</p>
        </div>
      )}
    </div>
  )
}
