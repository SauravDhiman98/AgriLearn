import { useState, useRef, useCallback, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  UploadCloud, Film, CheckCircle2, AlertCircle, Trash2,
  ArrowLeft, Loader2, FileVideo,
} from 'lucide-react'
import { videoApi, courseApi } from '../../api/services'

interface LessonInfo {
  id: number
  title: string
  durationMinutes: number
  type: string
  videoUrl?: string
}

const MAX_SIZE_MB = 500
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024

export default function LessonVideoUploadPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState<LessonInfo | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [drag, setDrag] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!courseId) return
    courseApi.getById(Number(courseId)).then(r => {
      const chapters: { lessons: LessonInfo[] }[] = r.data.chapters ?? []
      const found = chapters.flatMap(c => c.lessons).find((l: LessonInfo) => l.id === Number(lessonId))
      if (found) setLesson(found)
    }).catch(console.error)
  }, [courseId, lessonId])

  const validate = (f: File) => {
    if (f.size > MAX_BYTES) return `File is too large (${(f.size / 1024 / 1024).toFixed(1)} MB). Max 500 MB.`
    if (!f.type.startsWith('video/')) return 'Only video files are accepted (MP4, WebM, MOV, AVI).'
    return null
  }

  const pickFile = (f: File) => {
    const err = validate(f)
    if (err) { setErrorMsg(err); setStatus('error'); return }
    setFile(f)
    setErrorMsg('')
    setStatus('idle')
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) pickFile(f)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const upload = async () => {
    if (!file || !lessonId) return
    setStatus('uploading'); setProgress(0)
    try {
      await videoApi.uploadVideo(Number(lessonId), file, pct => setProgress(pct))
      setStatus('success')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setErrorMsg(e?.response?.data?.message ?? 'Upload failed. Please try again.')
      setStatus('error')
    }
  }

  const deleteVideo = async () => {
    if (!lessonId || !window.confirm('Delete the video for this lesson?')) return
    try {
      await videoApi.deleteVideo(Number(lessonId))
      setLesson(prev => prev ? { ...prev, videoUrl: undefined } : prev)
      setFile(null); setStatus('idle')
    } catch { setErrorMsg('Delete failed.'); setStatus('error') }
  }

  const sizeLabel = (bytes: number) =>
    bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-900/50 flex items-center justify-center">
              <Film className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Upload Lesson Video</h1>
              {lesson && <p className="text-sm text-gray-400 mt-0.5">{lesson.title}</p>}
            </div>
          </div>

          {/* Existing video badge */}
          {lesson?.videoUrl && (
            <div className="mt-4 flex items-center justify-between bg-green-900/20 border border-green-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Video already uploaded
              </div>
              <button onClick={deleteVideo} className="text-red-400 hover:text-red-300 flex items-center gap-1 text-xs">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          )}

          {/* Drop zone */}
          {status !== 'success' && (
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`mt-6 border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors
                ${drag ? 'border-green-400 bg-green-900/20' : 'border-gray-700 hover:border-gray-500 bg-gray-800/30'}`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) pickFile(f) }}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <FileVideo className="w-12 h-12 text-green-400" />
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-sm text-gray-400">{sizeLabel(file.size)} · {file.type}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-gray-400">
                  <UploadCloud className="w-12 h-12" />
                  <p className="font-medium">Drop your video here or click to browse</p>
                  <p className="text-sm">MP4, WebM, MOV or AVI · Max {MAX_SIZE_MB} MB</p>
                </div>
              )}
            </div>
          )}

          {/* Progress */}
          {status === 'uploading' && (
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div className="mt-6 flex flex-col items-center gap-3 text-green-400 py-4">
              <CheckCircle2 className="w-14 h-14" />
              <p className="text-lg font-semibold">Upload Complete!</p>
              <p className="text-sm text-gray-400 text-center">
                The video is now available for enrolled students.
              </p>
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="mt-2 px-6 py-2 bg-green-700 hover:bg-green-600 rounded-xl text-sm font-medium"
              >
                Back to Course
              </button>
            </div>
          )}

          {/* Error */}
          {status === 'error' && errorMsg && (
            <div className="mt-4 flex items-start gap-3 bg-red-900/20 border border-red-800 rounded-xl px-4 py-3 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {errorMsg}
            </div>
          )}

          {/* Upload button */}
          {file && status !== 'success' && (
            <button
              onClick={upload}
              disabled={status === 'uploading'}
              className="mt-6 w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-60 rounded-xl font-semibold transition-colors"
            >
              {status === 'uploading'
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Uploading…</>
                : <><UploadCloud className="w-5 h-5" /> Upload Video</>
              }
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
