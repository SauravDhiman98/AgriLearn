import { useQuery } from 'react-query'
import { liveClassApi } from '../../api/services'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { Video, Calendar, Clock, Users, Lock } from 'lucide-react'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

export default function LiveClassesPage() {
  const { isAuthenticated } = useSelector((s: RootState) => s.auth)
  const { data: classes, isLoading } = useQuery(
    'liveClasses',
    liveClassApi.listUpcoming,
    { select: res => res.data }
  )

  const handleRegister = async (id: number) => {
    if (!isAuthenticated) { toast.info('Please login to register'); return }
    try {
      await liveClassApi.register(id)
      toast.success('Registered for live class! 🎉')
    } catch { toast.error('Registration failed') }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">🎥 Live Classes</h1>
      <p className="text-gray-500 mb-8">Live sessions by agriculture experts</p>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card p-5 animate-pulse h-24" />)}
        </div>
      ) : classes?.length > 0 ? (
        <div className="space-y-4">
          {classes.map((cls: any) => (
            <div key={cls.id} className="card p-5 flex gap-5">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Video className="w-7 h-7 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{cls.title}</h3>
                  {cls.premiumOnly && <span className="badge badge-yellow flex items-center gap-1"><Lock className="w-3 h-3" /> Premium</span>}
                  <span className={`badge ${cls.status === 'LIVE' ? 'bg-red-100 text-red-700' : 'badge-blue'}`}>
                    {cls.status === 'LIVE' ? '🔴 LIVE' : cls.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {dayjs(cls.scheduledAt).format('DD MMM YYYY, hh:mm A')}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {cls.durationMinutes} min</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls.registeredCount} registered</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                {cls.status === 'LIVE'
                  ? <a href={cls.meetingUrl} target="_blank" rel="noreferrer" className="btn-primary text-sm py-1.5 px-4">Join Now</a>
                  : <button onClick={() => handleRegister(cls.id)} className="btn-outline text-sm py-1.5 px-4">Register</button>
                }
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No upcoming live classes. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
