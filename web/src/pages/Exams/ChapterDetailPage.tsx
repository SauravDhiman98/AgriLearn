import { useState, useEffect, useRef } from 'react'
import { useQuery } from 'react-query'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { examApi } from '../../api/services'
import { useTheme } from '../../context/ThemeContext'
import { RootState } from '../../store'
import { ChevronLeft, FileText, Video, Brain, Play, Maximize2 } from 'lucide-react'

type Tab = 'notes' | 'videos' | 'tests'
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://agrilearn-production-6f2e.up.railway.app/api/v1'
const API_ORIGIN = API_BASE.replace(/\/api\/v\d+\/?$/, '')
function resolveUrl(url: string | null | undefined): string | null { if (!url) return null; if (url.startsWith('http://') || url.startsWith('https://')) return url; return API_ORIGIN + url }
function extractYoutubeId(url: string | null | undefined): string | null { if (!url) return null; const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/); return match ? match[1] : null }

/** Build a self-contained PDF.js HTML page with watermark + fullscreen */
function buildPdfHtml(base64: string, watermark: string): string {
  const escaped = watermark.replace(/'/g, "\\'").replace(/\n/g, ' ')
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"/>
<title>PDF Viewer</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"><\/script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{background:#1a1a1a;height:100%;overflow:hidden;font-family:sans-serif;user-select:none}
  #toolbar{display:flex;align-items:center;gap:8px;padding:6px 10px;background:#2d2d2d;border-bottom:1px solid #444;flex-shrink:0;flex-wrap:wrap;min-height:44px}
  #toolbar button{background:#444;border:none;color:#fff;border-radius:6px;padding:5px 10px;cursor:pointer;font-size:13px;min-height:32px}
  #toolbar button:hover{background:#555}
  #toolbar button:disabled{opacity:0.4;cursor:default}
  #page-info{color:#ccc;font-size:13px;white-space:nowrap}
  #zoom-info{color:#aaa;font-size:12px}
  #canvas-container{flex:1;overflow:auto;display:flex;flex-direction:column;align-items:center;padding:12px 8px;gap:12px}
  canvas{box-shadow:0 2px 12px rgba(0,0,0,0.5);display:block;max-width:100%;border-radius:2px}
  #wrap{display:flex;flex-direction:column;height:100vh}
  #loading{color:#aaa;padding:40px;text-align:center;font-size:14px}
</style>
</head>
<body>
<div id="wrap">
  <div id="toolbar">
    <button id="btn-prev">&#9664; Prev</button>
    <button id="btn-next">Next &#9654;</button>
    <span id="page-info">Loading...</span>
    <button id="btn-zoom-out">&#8722; Zoom</button>
    <button id="btn-zoom-in">&#43; Zoom</button>
    <span id="zoom-info"></span>
    <button id="btn-fs" style="margin-left:auto">&#x26F6; Fullscreen</button>
  </div>
  <div id="canvas-container"><div id="loading">Loading PDF...</div></div>
</div>
<script>
(function(){
  pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  var watermark='${escaped}';
  var pdfDoc=null,curPage=1,numPages=0,scale=1.5,rendering=false;
  var container=document.getElementById('canvas-container');
  var info=document.getElementById('page-info');
  var zoomInfo=document.getElementById('zoom-info');

  var b64='${base64}';
  var bin=atob(b64),len=bin.length,bytes=new Uint8Array(len);
  for(var i=0;i<len;i++) bytes[i]=bin.charCodeAt(i);

  pdfjsLib.getDocument({data:bytes}).promise.then(function(pdf){
    pdfDoc=pdf; numPages=pdf.numPages;
    renderAllPages();
  }).catch(function(e){
    container.innerHTML='<div style="color:#f87171;padding:20px">Failed to load PDF: '+e.message+'</div>';
  });

  function updateInfo(){ info.textContent='Page '+curPage+' / '+numPages; zoomInfo.textContent=Math.round(scale*100)+'%'; }

  function renderAllPages(){
    container.innerHTML='';
    updateInfo();
    var promises=[];
    for(var p=1;p<=numPages;p++) promises.push(renderPage(p));
    Promise.all(promises).then(function(){ scrollToPage(curPage); });
  }

  function renderPage(pageNum){
    return pdfDoc.getPage(pageNum).then(function(page){
      var viewport=page.getViewport({scale:scale});
      var canvas=document.createElement('canvas');
      canvas.id='page-'+pageNum;
      canvas.width=viewport.width; canvas.height=viewport.height;
      var ctx=canvas.getContext('2d');
      container.appendChild(canvas);
      return page.render({canvasContext:ctx,viewport:viewport}).promise.then(function(){
        drawWatermark(ctx,canvas.width,canvas.height);
      });
    });
  }

  function drawWatermark(ctx,w,h){
    ctx.save();
    ctx.globalAlpha=0.08;
    ctx.fillStyle='#1f2937';
    ctx.font='bold 18px sans-serif';
    ctx.translate(w/2,h/2);
    ctx.rotate(-Math.PI/6);
    var step=220;
    for(var y=-h;y<h*2;y+=step) for(var x=-w;x<w*2;x+=step) ctx.fillText(watermark,x,y);
    ctx.restore();
  }

  function scrollToPage(p){
    var el=document.getElementById('page-'+p);
    if(el) el.scrollIntoView({behavior:'smooth',block:'start'});
  }

  document.getElementById('btn-prev').addEventListener('click',function(){
    if(curPage>1){curPage--;updateInfo();scrollToPage(curPage);}
  });
  document.getElementById('btn-next').addEventListener('click',function(){
    if(curPage<numPages){curPage++;updateInfo();scrollToPage(curPage);}
  });
  document.getElementById('btn-zoom-in').addEventListener('click',function(){
    if(scale<3){scale=Math.round((scale+0.25)*100)/100;renderAllPages();}
  });
  document.getElementById('btn-zoom-out').addEventListener('click',function(){
    if(scale>0.5){scale=Math.round((scale-0.25)*100)/100;renderAllPages();}
  });

  // Detect page in view via scroll
  container.addEventListener('scroll',function(){
    var canvases=container.querySelectorAll('canvas');
    var mid=container.scrollTop+container.clientHeight/2;
    var top=container.scrollTop;
    canvases.forEach(function(c,i){
      if(c.offsetTop<=top+50) curPage=i+1;
    });
    updateInfo();
  });

  // Fullscreen
  document.getElementById('btn-fs').addEventListener('click',function(){
    if(!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });
  document.addEventListener('fullscreenchange',function(){
    document.getElementById('btn-fs').textContent=document.fullscreenElement?'Exit FS':'&#x26F6; Fullscreen';
  });

  // Prevent context menu / selection
  document.addEventListener('contextmenu',function(e){e.preventDefault();});
  document.addEventListener('keydown',function(e){
    if(e.ctrlKey&&['s','p','u'].indexOf(e.key.toLowerCase())>-1){e.preventDefault();}
  });
})();
<\/script>
</body>
</html>`
}

/** Renders a watermarked PDF using PDF.js in a srcdoc iframe — works on all mobile browsers */
function PdfViewer({ noteId, title, userLabel }: { noteId: number; title: string; userLabel: string }) {
  const [htmlSrc, setHtmlSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isDark } = useTheme()
  const muted = isDark ? '#9ca3af' : '#6b7280'

  useEffect(() => {
    setLoading(true); setError(null); setHtmlSrc(null)
    const token = localStorage.getItem('accessToken')
    const url = token
      ? `${API_BASE}/notes/${noteId}/view?token=${encodeURIComponent(token)}`
      : `${API_BASE}/notes/${noteId}/view`

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.arrayBuffer() })
      .then(buf => {
        // Convert ArrayBuffer → base64
        const bytes = new Uint8Array(buf)
        let binary = ''
        const chunk = 8192
        for (let i = 0; i < bytes.length; i += chunk) {
          binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
        }
        const base64 = btoa(binary)
        setHtmlSrc(buildPdfHtml(base64, userLabel))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [noteId, userLabel])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  if (loading) return (
    <div style={{ padding: '60px', textAlign: 'center', color: muted }}>
      <div style={{ fontSize: '14px', marginBottom: '8px' }}>📄 Loading PDF...</div>
      <div style={{ fontSize: '12px', color: muted }}>This may take a moment</div>
    </div>
  )
  if (error) return (
    <div style={{ padding: '40px', textAlign: 'center', color: muted }}>
      Could not load PDF: {error}
    </div>
  )

  return (
    <div ref={containerRef} style={{ position: 'relative', userSelect: 'none', background: '#1a1a1a' }} onContextMenu={e => e.preventDefault()}>
      {/* External fullscreen button (for browsers that block iframe fullscreen) */}
      <button
        onClick={toggleFullscreen}
        title="Fullscreen"
        style={{
          position: 'absolute', top: '52px', right: '8px', zIndex: 20,
          background: 'rgba(45,45,45,0.9)', border: '1px solid #555',
          color: '#fff', borderRadius: '6px', padding: '4px 8px',
          cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px',
        }}
      >
        <Maximize2 style={{ width: '13px', height: '13px' }} /> Fullscreen
      </button>
      <iframe
        srcDoc={htmlSrc ?? ''}
        title={title}
        className="pdf-viewer-frame"
        sandbox="allow-scripts allow-same-origin"
        style={{ width: '100%', height: '85vh', border: 'none', display: 'block' }}
      />
    </div>
  )
}

export default function ChapterDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isDark } = useTheme()
  const { user } = useSelector((s: RootState) => s.auth)
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [selectedNote, setSelectedNote] = useState<any>(null)
  const { data: chapter, isLoading } = useQuery(['chapter', id], () => examApi.getChapter(Number(id)), { select: res => res.data })
  const userLabel = [user?.firstName, user?.lastName].filter(Boolean).join(' ') + (user?.email ? `  •  ${user.email}` : '')
  useEffect(() => { setSelectedNote(null) }, [id])
  useEffect(() => { if (chapter?.notes?.length > 0) setSelectedNote((prev: any) => prev ?? chapter.notes[0]) }, [chapter])

  // Block Ctrl+S (save), Ctrl+P (print), Ctrl+U (view source) on notes tab
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeTab !== 'notes') return
      if (e.ctrlKey && ['s', 'p', 'u'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activeTab])
  const bg = isDark ? '#111827' : '#f9fafb'
  const cardBg = isDark ? '#1f2937' : '#ffffff'
  const border = isDark ? '#374151' : '#e5e7eb'
  const text = isDark ? '#f9fafb' : '#111827'
  const muted = isDark ? '#9ca3af' : '#6b7280'
  const headerBg = isDark ? '#0f2a33' : '#194552'
  const tabActiveBg = isDark ? '#374151' : '#e0f2fe'
  const tabActiveColor = isDark ? '#93c5fd' : '#0369a1'
  const tabs: { key: Tab; label: string; icon: any; count: number }[] = [{ key: 'notes', label: 'Notes', icon: FileText, count: chapter?.notes?.length || 0 }, { key: 'videos', label: 'Videos', icon: Video, count: chapter?.videos?.length || 0 }, { key: 'tests', label: 'MCQ Tests', icon: Brain, count: chapter?.tests?.length || 0 }]
  return (
    <div style={{ backgroundColor: bg, minHeight: '100vh' }}>
      <div style={{ backgroundColor: headerBg, padding: '24px 16px', color: '#fff' }}><div style={{ maxWidth: '1100px', margin: '0 auto' }}><Link to={chapter ? `/subjects/${chapter.subjectId}` : '/exams'} style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}><ChevronLeft style={{ width: '16px', height: '16px' }} /> {chapter?.subjectName || 'Back'}</Link><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}><div><h1 style={{ fontSize: '22px', fontWeight: 'bold' }}>{chapter?.title || '...'}</h1>{chapter?.examName && <p style={{ color: '#9ca3af', fontSize: '13px', marginTop: '4px' }}>{chapter.examName} › {chapter.subjectName}</p>}</div>{chapter?.tests?.length > 0 && <Link to={`/practice/${chapter.id}`} style={{ backgroundColor: '#16a34a', color: '#fff', textDecoration: 'none', borderRadius: '12px', padding: '10px 16px', fontWeight: '700', fontSize: '14px' }}>Practice</Link>}</div></div></div>
      <div style={{ borderBottom: `1px solid ${border}`, backgroundColor: cardBg }}><div className="chapter-tabs" style={{ maxWidth: '1100px', margin: '0 auto', gap: '4px', padding: '0 16px' }}>{tabs.map(tab => <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '14px 20px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: activeTab === tab.key ? tabActiveBg : 'transparent', color: activeTab === tab.key ? tabActiveColor : muted, borderBottom: activeTab === tab.key ? '2px solid #0369a1' : '2px solid transparent' }}><tab.icon style={{ width: '15px', height: '15px' }} />{tab.label}{tab.count > 0 && <span style={{ backgroundColor: isDark ? '#4b5563' : '#e5e7eb', borderRadius: '10px', padding: '1px 7px', fontSize: '11px' }}>{tab.count}</span>}</button>)}</div></div>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 16px' }}>
        {isLoading ? <div style={{ display: 'grid', gap: '12px' }}>{[...Array(4)].map((_, i) => <div key={i} style={{ height: '80px', backgroundColor: cardBg, borderRadius: '12px', border: `1px solid ${border}` }} />)}</div> : <div onContextMenu={e => e.preventDefault()} style={{ userSelect: 'none' }}>{activeTab === 'notes' && <div className={`notes-layout ${chapter?.notes?.length > 1 ? 'has-sidebar' : ''}`}>{chapter?.notes?.length > 1 && <div className="notes-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>{chapter.notes.map((note: any) => <button key={note.id} onClick={() => setSelectedNote(note)} style={{ textAlign: 'left', padding: '12px 14px', borderRadius: '10px', border: `1px solid ${border}`, backgroundColor: selectedNote?.id === note.id ? (isDark ? '#1d4ed8' : '#dbeafe') : cardBg, color: text, cursor: 'pointer', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}><span>{note.fileType === 'pdf' ? '📄' : note.fileType ? '📝' : '📃'}</span>{note.title}</button>)}</div>}{(selectedNote || chapter?.notes?.[0]) ? (() => { const activeNote = selectedNote || chapter.notes[0]; const resolvedUrl = resolveUrl(activeNote.fileUrl); return <div style={{ backgroundColor: cardBg, borderRadius: '14px', border: `1px solid ${border}`, overflow: 'hidden' }}><div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}><h2 style={{ fontSize: '17px', fontWeight: '700', color: text, margin: 0 }}>{activeNote.title}</h2></div>{resolvedUrl ? <PdfViewer noteId={activeNote.id} title={activeNote.title} userLabel={userLabel} /> : <div style={{ padding: '24px', color: text, lineHeight: '1.8', fontSize: '15px', whiteSpace: 'pre-wrap' }}>{activeNote.content}</div>}</div> })() : <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No notes available for this chapter.</div>}</div>}{activeTab === 'videos' && <div style={{ display: 'grid', gap: '16px' }}>{chapter?.videos?.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No video lectures yet.</div>}{chapter?.videos?.map((video: any) => { const ytId = video.youtubeId || extractYoutubeId(video.youtubeUrl); return <div key={video.id} style={{ backgroundColor: cardBg, borderRadius: '14px', border: `1px solid ${border}`, overflow: 'hidden' }}>{ytId ? <><div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}><iframe src={`https://www.youtube.com/embed/${ytId}`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} /></div><div style={{ padding: '12px 16px' }}><h3 style={{ fontSize: '14px', fontWeight: '600', color: text }}>{video.title}</h3></div></> : <div style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: isDark ? '#374151' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play style={{ width: '20px', height: '20px', color: '#dc2626' }} /></div><h3 style={{ fontSize: '15px', fontWeight: '600', color: text }}>{video.title}</h3></div>}</div> })}</div>}{activeTab === 'tests' && <div style={{ display: 'grid', gap: '12px' }}>{chapter?.tests?.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: muted }}>No MCQ tests yet.</div>}{chapter?.tests?.map((test: any) => <div key={test.id} style={{ backgroundColor: cardBg, borderRadius: '14px', border: `1px solid ${border}`, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}><div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: isDark ? '#374151' : '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>🧠</div><div style={{ flex: 1 }}><h3 style={{ fontSize: '15px', fontWeight: '600', color: text, marginBottom: '4px' }}>{test.title}</h3><p style={{ fontSize: '13px', color: muted }}>{test.questionCount || test.totalQuestions} Questions · {test.timeLimitMinutes || test.durationMinutes || 15} min</p></div><div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}><Link to={`/practice/${chapter.id}`} style={{ backgroundColor: '#16a34a', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Practice</Link><Link to={`/mcq-tests/${test.id}`} style={{ backgroundColor: '#194552', color: '#fff', padding: '9px 18px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Start Test</Link></div></div>)}</div>}</div>}
      </div>
    </div>
  )
}
