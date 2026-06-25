import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { logApi } from '../../api/services'
import {
  Activity, Download, Trash2, RefreshCw, ChevronDown,
  Search, ToggleLeft, ToggleRight, Settings, AlertCircle,
  Info, Bug, AlertTriangle, ChevronLeft
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

// ── Types ──────────────────────────────────────────────────────────────────
interface LogEntry {
  id: number
  timestamp: string
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE'
  thread: string
  logger: string
  loggerShort: string
  message: string
  hasException: boolean
  exception?: string
}

interface LogStats {
  totalBuffered: number
  errors: number
  warnings: number
  infos: number
  debugs: number
}

// ── Level styling ──────────────────────────────────────────────────────────
const LEVEL_STYLES: Record<string, string> = {
  ERROR: 'text-red-400 font-bold',
  WARN:  'text-yellow-400 font-semibold',
  INFO:  'text-green-400',
  DEBUG: 'text-blue-400',
  TRACE: 'text-gray-500',
}

const LEVEL_BG: Record<string, string> = {
  ERROR: 'bg-red-900/20 border-l-2 border-red-500',
  WARN:  'bg-yellow-900/20 border-l-2 border-yellow-500',
  INFO:  '',
  DEBUG: '',
  TRACE: '',
}

const LEVEL_ICONS: Record<string, React.ReactNode> = {
  ERROR: <AlertCircle className="w-3 h-3 text-red-400" />,
  WARN:  <AlertTriangle className="w-3 h-3 text-yellow-400" />,
  INFO:  <Info className="w-3 h-3 text-green-400" />,
  DEBUG: <Bug className="w-3 h-3 text-blue-400" />,
  TRACE: <Bug className="w-3 h-3 text-gray-500" />,
}

const LEVELS = ['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG', 'TRACE']

// ── Log Viewer Page ────────────────────────────────────────────────────────
export default function LogViewerPage() {
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [stats, setStats]   = useState<LogStats | null>(null)
  const [levels, setLevels] = useState<Record<string, string>>({})
  const [selectedLevel, setSelectedLevel] = useState('ALL')
  const [keyword, setKeyword] = useState('')
  const [isLive, setIsLive]   = useState(true)
  const [loading, setLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [lastId, setLastId] = useState(0)
  const [page] = useState(0)
  const PAGE_SIZE = 300
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const inputBg = isDark ? '#374151' : '#ffffff'

  const terminalRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<number | null>(null)
  const isLiveRef = useRef(isLive)
  isLiveRef.current = isLive

  // Fetch initial logs + stats
  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const [logsRes, statsRes] = await Promise.all([
        logApi.getLogs({ level: selectedLevel, keyword: keyword || undefined, page, size: PAGE_SIZE }),
        logApi.getStats(),
      ])
      const newEntries: LogEntry[] = logsRes.data.entries ?? []
      setEntries(newEntries)
      setStats(statsRes.data)
      if (newEntries.length > 0) {
        setLastId(Math.max(...newEntries.map(e => e.id)))
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedLevel, keyword, page])

  // Polling: fetch new entries since lastId
  const pollLogs = useCallback(async () => {
    if (!isLiveRef.current) return
    try {
      const res = await logApi.getLogsSince(lastId, {
        level: selectedLevel,
        keyword: keyword || undefined,
      })
      const newEntries: LogEntry[] = res.data ?? []
      if (newEntries.length > 0) {
        setEntries(prev => {
          const combined = [...newEntries, ...prev].slice(0, PAGE_SIZE)
          return combined
        })
        setLastId(newEntries[newEntries.length - 1]?.id ?? lastId)
        // Auto-scroll to top (most recent)
        terminalRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      // silently fail polling
    }
  }, [lastId, selectedLevel, keyword])

  // Fetch log levels for settings panel
  const fetchLevels = useCallback(async () => {
    try {
      const res = await logApi.getLevels()
      setLevels(res.data)
    } catch (err) {
      console.error('Failed to fetch log levels:', err)
    }
  }, [])

  // Initial load
  useEffect(() => {
    fetchLogs()
    fetchLevels()
  }, [fetchLogs, fetchLevels])

  // Live polling setup
  useEffect(() => {
    if (isLive) {
      intervalRef.current = window.setInterval(pollLogs, 2000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isLive, pollLogs])

  const handleClear = async () => {
    if (!confirm('Clear all buffered logs?')) return
    await logApi.clearLogs()
    setEntries([])
    setLastId(0)
  }

  const handleDownload = () => {
    const url = logApi.getDownloadUrl(selectedLevel, keyword)
    const a = document.createElement('a')
    a.href = url
    a.download = `tassypoint-logs-${Date.now()}.log`
    a.click()
  }

  const handleSetLevel = async (loggerName: string, level: string) => {
    await logApi.setLevel(loggerName, level)
    fetchLevels()
  }

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 font-mono text-xs overflow-hidden" style={{ backgroundColor: bg, color: text }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700 shrink-0" style={{ backgroundColor: cardBg, borderColor: border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} title="Back to Admin"
            className="p-1.5 rounded hover:bg-gray-700 transition"
            style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer' }}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <Activity className="w-5 h-5 text-green-400" />
          <span className="text-sm font-bold text-white tracking-wide" style={{ color: text }}>Tassy Point Log Viewer</span>
          {loading && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
        </div>

        {/* Stats chips */}
        {stats && (
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400" style={{ backgroundColor: inputBg, color: muted }}>
              {stats.totalBuffered} buffered
            </span>
            <span className="px-2 py-0.5 rounded bg-red-900/50 text-red-400">{stats.errors} errors</span>
            <span className="px-2 py-0.5 rounded bg-yellow-900/50 text-yellow-400">{stats.warnings} warns</span>
            <span className="px-2 py-0.5 rounded bg-green-900/50 text-green-400">{stats.infos} info</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border transition ${
              isLive ? 'bg-green-900/40 border-green-600 text-green-400' : 'bg-gray-800 border-gray-600 text-gray-400'
            }`}
            style={!isLive ? { backgroundColor: inputBg, borderColor: border, color: muted } : undefined}>
            {isLive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            {isLive ? 'LIVE' : 'PAUSED'}
          </button>

          <button onClick={fetchLogs} title="Refresh"
            className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 transition"
            style={{ backgroundColor: inputBg, borderColor: border, color: text }}>
            <RefreshCw className="w-4 h-4" />
          </button>

          <button onClick={handleDownload} title="Download logs"
            className="p-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 transition"
            style={{ backgroundColor: inputBg, borderColor: border, color: text }}>
            <Download className="w-4 h-4" />
          </button>

          <button onClick={handleClear} title="Clear buffer"
            className="p-1.5 rounded bg-red-900/40 hover:bg-red-900/60 text-red-400 border border-red-700 transition">
            <Trash2 className="w-4 h-4" />
          </button>

          <button onClick={() => { setShowSettings(!showSettings); if (!showSettings) fetchLevels() }}
            className={`p-1.5 rounded border transition ${
              showSettings ? 'bg-blue-900/40 border-blue-600 text-blue-400' : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`} title="Log level settings"
            style={!showSettings ? { backgroundColor: inputBg, borderColor: border, color: text } : undefined}>
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Filter bar ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 border-b border-gray-700 shrink-0" style={{ backgroundColor: cardBg, borderColor: border }}>
        {/* Level filter buttons */}
        <div className="flex gap-1">
          {LEVELS.map(lvl => (
            <button key={lvl}
              onClick={() => { setSelectedLevel(lvl); setLastId(0) }}
              className={`px-2 py-0.5 rounded text-xs font-medium border transition ${
                selectedLevel === lvl
                  ? lvl === 'ERROR' ? 'bg-red-700 border-red-500 text-white'
                  : lvl === 'WARN'  ? 'bg-yellow-700 border-yellow-500 text-white'
                  : lvl === 'DEBUG' ? 'bg-blue-700 border-blue-500 text-white'
                  : lvl === 'TRACE' ? 'bg-gray-700 border-gray-500 text-white'
                  : 'bg-green-700 border-green-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700'
              }`}
              style={selectedLevel !== lvl ? { backgroundColor: inputBg, borderColor: border, color: muted } : undefined}>
              {lvl}
            </button>
          ))}
        </div>

        {/* Keyword search */}
        <div className="flex-1 flex items-center gap-2 bg-gray-800 border border-gray-600 rounded px-2 py-0.5" style={{ backgroundColor: inputBg, borderColor: border }}>
          <Search className="w-3 h-3 text-gray-500 shrink-0" style={{ color: muted }} />
          <input
            type="text"
            placeholder="Search logs... (logger, message)"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { fetchLogs(); setLastId(0) } }}
            className="flex-1 bg-transparent text-gray-200 placeholder-gray-600 outline-none text-xs"
            style={{ color: text }}
          />
          {keyword && (
            <button onClick={() => { setKeyword(''); setLastId(0) }}
              className="text-gray-500 hover:text-gray-300 text-xs" style={{ color: muted }}>✕</button>
          )}
        </div>
        <span className="text-gray-600 text-xs shrink-0" style={{ color: muted }}>{entries.length} shown</span>
      </div>

      {/* ── Settings panel (log levels) ─────────────────────────────────── */}
      {showSettings && (
        <div className="bg-gray-900 border-b border-gray-700 px-4 py-3 shrink-0" style={{ backgroundColor: cardBg, borderColor: border }}>
          <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: muted }}>
            Dynamic Log Levels
          </p>
          <div className="flex flex-wrap gap-3">
            {Object.entries(levels).map(([logger, level]) => (
              <div key={logger} className="flex items-center gap-2 bg-gray-800 rounded px-2 py-1 border border-gray-700" style={{ backgroundColor: inputBg, borderColor: border }}>
                <span className="text-gray-400 text-xs max-w-[200px] truncate" title={logger} style={{ color: muted }}>{logger}</span>
                <select
                  value={level}
                  onChange={e => handleSetLevel(logger, e.target.value)}
                  className="bg-gray-700 text-gray-200 text-xs rounded border border-gray-600 px-1 py-0.5 outline-none cursor-pointer"
                  style={{ backgroundColor: cardBg, color: text, borderColor: border }}>
                  {['TRACE','DEBUG','INFO','WARN','ERROR','OFF'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Terminal output ─────────────────────────────────────────────── */}
      <div ref={terminalRef}
        className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5 bg-gray-950"
        style={{ backgroundColor: bg }}>
        {entries.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600" style={{ color: muted }}>
            <Activity className="w-10 h-10 mb-3 opacity-30" />
            <p>No log entries in buffer.</p>
            <p className="mt-1 text-xs">Start the backend or adjust the level filter.</p>
          </div>
        )}

        {entries.map(entry => (
          <div key={entry.id}
            className={`rounded px-2 py-0.5 hover:bg-gray-800/50 cursor-pointer select-text ${LEVEL_BG[entry.level] ?? ''}`}
            style={{ backgroundColor: entry.level === 'INFO' || entry.level === 'DEBUG' || entry.level === 'TRACE' ? 'transparent' : undefined }}
            onClick={() => entry.hasException && toggleExpand(entry.id)}>
            <div className="flex items-start gap-2 leading-5">
              <span className="shrink-0 text-gray-600 w-[170px]" style={{ color: muted }}>{entry.timestamp}</span>
              <span className="shrink-0 w-3">{LEVEL_ICONS[entry.level]}</span>
              <span className={`shrink-0 w-[46px] ${LEVEL_STYLES[entry.level] ?? ''}`}>
                {entry.level}
              </span>
              <span className="text-gray-500 w-[200px] shrink-0 truncate" title={entry.logger} style={{ color: muted }}>
                {entry.loggerShort}
              </span>
              <span className="text-gray-500 shrink-0" style={{ color: muted }}>:</span>
              <span className={`flex-1 break-all ${entry.level === 'ERROR' ? 'text-red-300' : entry.level === 'WARN' ? 'text-yellow-200' : 'text-gray-200'}`}>
                {entry.message}
              </span>
              {entry.hasException && (
                <ChevronDown className={`w-3 h-3 text-gray-500 shrink-0 transition-transform ${expandedIds.has(entry.id) ? 'rotate-180' : ''}`} />
              )}
            </div>
            {entry.hasException && expandedIds.has(entry.id) && (
              <pre className="mt-1 ml-[calc(170px+24px+46px+200px+8px)] text-red-400 text-[10px] whitespace-pre-wrap break-all bg-red-950/30 rounded p-2">
                {entry.exception}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-1 bg-gray-900 border-t border-gray-700 text-gray-600 text-xs shrink-0" style={{ backgroundColor: cardBg, borderColor: border, color: muted }}>
        <span style={{ color: muted }}>Tassy Point Backend Log Viewer · Admin Only</span>
        <span className={isLive ? 'text-green-500' : 'text-gray-500'} style={!isLive ? { color: muted } : undefined}>
          {isLive ? '● LIVE (polling every 2s)' : '○ Paused'}
        </span>
      </div>
    </div>
  )
}
