import { useState, useEffect, useRef } from 'react'
import { X, Zap, Brain, CheckCircle2, ChevronDown, ChevronUp, Link, Clipboard, Trash2, AlertCircle, Image, Plus } from 'lucide-react'
import { Note, Subject, Chapter, NoteBlock, NoteImage } from '../types'
import { nanoid, processTextToBlocks, suggestTitle, suggestSubject } from '../utils'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface Props {
  subjects: Subject[]
  chapters: Chapter[]
  onClose: () => void
  onSaveNote: (n: Note) => void
  onAddChapter: (c: Chapter) => void
}

type InputMode = 'paste' | 'link' | 'screenshot'

const BLOCK_EMOJI: Record<string, string> = {
  heading: '🔤', definition: '📖', explanation: '💬',
  formula: '∑', example: '✏️', keypoint: '★',
  margin: '📌', code: '💻', question: '❓',
}
const BLOCK_TAG_COLOR: Record<string, string> = {
  heading:     'bg-blue-100 text-blue-700 border-blue-200',
  definition:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  explanation: 'bg-slate-100 text-slate-600 border-slate-200',
  formula:     'bg-amber-100 text-amber-700 border-amber-200',
  example:     'bg-green-100 text-green-700 border-green-200',
  keypoint:    'bg-red-100 text-red-700 border-red-200',
  code:        'bg-slate-800 text-green-400 border-slate-700',
  question:    'bg-purple-100 text-purple-700 border-purple-200',
}

const CORS_PROXY = 'https://api.allorigins.win/get?url='

async function fetchChatGPTLink(url: string): Promise<string> {
  const proxyUrl = CORS_PROXY + encodeURIComponent(url)
  const res = await fetch(proxyUrl)
  if (!res.ok) throw new Error('Could not fetch the link')
  const data = await res.json()
  const html: string = data.contents
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const selectors = ['article', 'main', '.markdown', 'p']
  let extracted = ''
  for (const sel of selectors) {
    const els = doc.querySelectorAll(sel)
    if (els.length > 0) {
      extracted = Array.from(els).map(el => (el as HTMLElement).innerText || el.textContent || '').join('\n\n').trim()
      if (extracted.length > 100) break
    }
  }
  if (extracted.length < 100) extracted = (doc.body?.textContent || '').replace(/\s+/g, ' ').trim()
  return extracted
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function CaptureModal({ subjects, chapters, onClose, onSaveNote }: Props) {
  const [mode, setMode] = useState<InputMode>('paste')

  // Paste mode
  const [pasteText, setPasteText] = useState('')

  // Link mode
  const [linkUrl, setLinkUrl] = useState('')
  const [fetchedText, setFetchedText] = useState('')
  const [fetching, setFetching] = useState(false)
  const [fetchError, setFetchError] = useState('')

  // Screenshot mode
  const [images, setImages] = useState<NoteImage[]>([])
  const [dragging, setDragging] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Meta
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const [chapterId, setChapterId] = useState('')
  const [tags, setTags] = useState('')
  const [autoSubject, setAutoSubject] = useState('')

  // Analysis
  const [analysing, setAnalysing] = useState(false)
  const [blocks, setBlocks] = useState<NoteBlock[] | null>(null)
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set())

  const availableChapters = chapters.filter(c => c.subjectId === subjectId)
  const sourceText = mode === 'paste' ? pasteText : fetchedText
  const sourceReady = sourceText.trim().length > 10

  // Auto-detect subject
  useEffect(() => {
    if (sourceText.length < 60) return
    const detected = suggestSubject(sourceText)
    if (detected) {
      setAutoSubject(detected)
      const match = subjects.find(s => s.name.toLowerCase().includes(detected.toLowerCase()))
      if (match) setSubjectId(match.id)
    }
  }, [pasteText, fetchedText, mode])

  // ── Screenshot handlers ─────────────────────────────────────────────────────
  const addImageFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return toast.error('Only image files allowed')
    if (images.length + arr.length > 10) return toast.error('Max 10 screenshots per note')
    const tooBig = arr.filter(f => f.size > 5 * 1024 * 1024)
    if (tooBig.length) return toast.error('Each image must be under 5 MB')

    const newImgs: NoteImage[] = []
    for (const file of arr) {
      const dataUrl = await fileToDataUrl(file)
      newImgs.push({
        id: nanoid(),
        dataUrl,
        caption: file.name.replace(/\.[^.]+$/, ''),
        createdAt: new Date().toISOString(),
      })
    }
    setImages(prev => [...prev, ...newImgs])
    toast.success(`${newImgs.length} screenshot${newImgs.length > 1 ? 's' : ''} added`)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addImageFiles(e.target.files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files.length) addImageFiles(e.dataTransfer.files)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items).filter(it => it.type.startsWith('image/'))
    if (items.length) {
      const files = items.map(it => it.getAsFile()).filter(Boolean) as File[]
      addImageFiles(files)
    }
  }

  const removeImage = (id: string) => setImages(prev => prev.filter(img => img.id !== id))
  const updateCaption = (id: string, caption: string) =>
    setImages(prev => prev.map(img => img.id === id ? { ...img, caption } : img))

  // ── Link fetch ──────────────────────────────────────────────────────────────
  const handleFetchLink = async () => {
    if (!linkUrl.trim()) return toast.error('Paste a ChatGPT share link')
    if (!linkUrl.includes('chatgpt.com') && !linkUrl.includes('chat.openai.com'))
      return toast.error('Only chatgpt.com share links are supported')
    setFetching(true); setFetchError(''); setFetchedText(''); setBlocks(null)
    try {
      const text = await fetchChatGPTLink(linkUrl)
      if (text.length < 50) throw new Error('Could not extract content. Try copy-paste instead.')
      setFetchedText(text)
      toast.success('Fetched! Click Analyse now.')
    } catch (err: any) {
      setFetchError(err.message || 'Failed to fetch')
      toast.error(err.message || 'Failed to fetch')
    } finally { setFetching(false) }
  }

  // ── Analyse ─────────────────────────────────────────────────────────────────
  const handleAnalyse = () => {
    if (!sourceReady) return toast.error('No text to analyse')
    setAnalysing(true)
    setTimeout(() => {
      const result = processTextToBlocks(sourceText)
      setBlocks(result)
      if (!title.trim()) { const t = suggestTitle(result); if (t) setTitle(t) }
      setAnalysing(false)
      const counts: Record<string, number> = {}
      result.forEach(b => { counts[b.type] = (counts[b.type] || 0) + 1 })
      toast.success(`${result.length} blocks: ${Object.entries(counts).map(([k,v]) => `${v} ${k}`).join(' · ')}`)
    }, 350)
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!title.trim()) return toast.error('Add a note title')
    if (!subjectId) return toast.error('Select a subject')
    // Allow save with only screenshots (no text blocks required)
    if ((!blocks || blocks.length === 0) && images.length === 0)
      return toast.error('Add screenshots or analyse text first')

    const note: Note = {
      id: nanoid(),
      title: title.trim(),
      subjectId,
      chapterId,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      blocks: blocks || [],
      images,
      sourceText,
      paperStyle: 'ruled',
      handwritingStyle: 'kalam',
      inkColor: '#1e3a5f',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSaveNote(note)
    toast.success('Note saved! 📚')
  }

  const removeBlock = (id: string) => setBlocks(b => b ? b.filter(x => x.id !== id) : b)
  const toggleExpand = (id: string) => setExpandedBlocks(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s
  })

  const blockCounts = blocks?.reduce<Record<string,number>>((a,b) => { a[b.type]=(a[b.type]||0)+1; return a }, {}) || {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden">

        {/* ── Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-none">Smart Capture</h2>
              <p className="text-blue-200 text-xs mt-0.5">Paste text · ChatGPT link · Screenshots → Structured notes</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {/* ── Mode tabs */}
        <div className="flex border-b border-slate-200 shrink-0 bg-slate-50">
          {([
            { id: 'paste' as InputMode,      icon: Clipboard, label: 'Paste Text' },
            { id: 'link' as InputMode,       icon: Link,      label: 'ChatGPT Link' },
            { id: 'screenshot' as InputMode, icon: Image,     label: 'Screenshots' },
          ]).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => { setMode(id); setBlocks(null) }}
              className={clsx(
                'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors',
                mode === id ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'
              )}
            >
              <Icon size={14} /> {label}
              {id === 'screenshot' && images.length > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {images.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" onPaste={mode === 'screenshot' ? handlePaste : undefined}>

          {/* ── PASTE mode */}
          {mode === 'paste' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                📋 Paste ChatGPT Answer / Lecture Notes / Textbook Content
              </label>
              <textarea
                className="w-full border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-slate-50 leading-relaxed"
                rows={9}
                placeholder={`Paste anything here — ChatGPT answer, textbook, lecture notes...\n\nHandles:\n• Plain paragraphs and bullet points\n• LaTeX like \\rightarrow or \\frac{a}{b}\n• ## Markdown headings and **bold headings**\n• Definitions, examples, key points, code blocks`}
                value={pasteText}
                onChange={e => { setPasteText(e.target.value); setBlocks(null) }}
              />
              {autoSubject && pasteText.length > 60 && (
                <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                  <Zap size={11} /> Detected: <strong>{autoSubject}</strong> — auto-selected
                </p>
              )}
            </div>
          )}

          {/* ── LINK mode */}
          {mode === 'link' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                  🔗 ChatGPT Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="https://chatgpt.com/share/..."
                    value={linkUrl}
                    onChange={e => { setLinkUrl(e.target.value); setFetchError(''); setBlocks(null) }}
                    onKeyDown={e => e.key === 'Enter' && handleFetchLink()}
                  />
                  <button
                    onClick={handleFetchLink}
                    disabled={fetching || !linkUrl.trim()}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium flex items-center gap-2 whitespace-nowrap"
                  >
                    {fetching ? <span className="animate-spin text-base">⚙️</span> : <Link size={15} />}
                    {fetching ? 'Fetching...' : 'Fetch'}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1">In ChatGPT: Share button → Copy Link → paste above</p>
                {fetchError && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                    <AlertCircle size={15} className="mt-0.5 shrink-0" />
                    <div>
                      <strong>Failed:</strong> {fetchError}
                      <br /><span className="text-xs text-red-500">Switch to Paste Text tab and copy the text manually.</span>
                    </div>
                  </div>
                )}
              </div>
              {fetchedText && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Fetched Content — Review & Edit
                  </label>
                  <textarea
                    className="w-full border border-slate-200 rounded-xl p-3.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-slate-50"
                    rows={8}
                    value={fetchedText}
                    onChange={e => { setFetchedText(e.target.value); setBlocks(null) }}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── SCREENSHOT mode */}
          {mode === 'screenshot' && (
            <div className="space-y-4">
              {/* Drop zone */}
              <div
                ref={dropRef}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',
                  dragging ? 'border-blue-500 bg-blue-50 scale-[1.01]' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileInput}
                />
                <div className="text-5xl mb-3">🖼️</div>
                <div className="text-sm font-semibold text-slate-600 mb-1">
                  Drop screenshots here or click to browse
                </div>
                <div className="text-xs text-slate-400">
                  PNG, JPG, WEBP · Max 5 MB each · Up to 10 images
                </div>
                <div className="mt-3 text-xs text-blue-500 font-medium">
                  💡 You can also Ctrl+V to paste a screenshot directly
                </div>
              </div>

              {/* Image grid */}
              {images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {images.length} Screenshot{images.length > 1 ? 's' : ''} attached
                    </p>
                    <button
                      onClick={() => { if (confirm('Remove all screenshots?')) setImages([]) }}
                      className="text-xs text-red-500 hover:underline"
                    >Remove all</button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img, idx) => (
                      <div key={img.id} className="group relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                        {/* Image */}
                        <div className="relative">
                          <img
                            src={img.dataUrl}
                            alt={img.caption}
                            className="w-full object-cover max-h-48 rounded-t-xl"
                          />
                          {/* Overlay buttons */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-t-xl flex items-start justify-between p-2 opacity-0 group-hover:opacity-100">
                            <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">#{idx + 1}</span>
                            <button
                              onClick={() => removeImage(img.id)}
                              className="bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                        {/* Caption input */}
                        <div className="p-2">
                          <input
                            className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                            placeholder="Add caption..."
                            value={img.caption}
                            onChange={e => updateCaption(img.id, e.target.value)}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Add more button */}
                    {images.length < 10 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors min-h-32"
                      >
                        <Plus size={24} />
                        <span className="text-xs font-medium">Add more</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tip */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                <strong>Tip:</strong> Screenshots are stored with your note and shown in the notebook view.
                You can also add text blocks along with screenshots — switch to Paste Text tab.
              </div>
            </div>
          )}

          {/* ── Meta always visible */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Note Title</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder={mode === 'screenshot' ? 'e.g. DBMS ER Diagram Notes' : 'Auto-filled after Analyse...'}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={subjectId}
                onChange={e => { setSubjectId(e.target.value); setChapterId('') }}
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Chapter</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={chapterId}
                onChange={e => setChapterId(e.target.value)}
              >
                <option value="">— None —</option>
                {availableChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Tags</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="GATE, exam, important (comma separated)"
              value={tags}
              onChange={e => setTags(e.target.value)}
            />
          </div>

          {/* ── Analyse button (only for text modes) */}
          {mode !== 'screenshot' && (
            <button
              onClick={handleAnalyse}
              disabled={analysing || !sourceReady}
              className={clsx(
                'w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm',
                analysing ? 'bg-blue-400 cursor-wait'
                : blocks ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-40 hover:shadow-md'
              )}
            >
              {analysing ? <><span className="animate-spin">⚙️</span> Analysing...</>
                : blocks ? <><CheckCircle2 size={16} /> Re-Analyse</>
                : <><Brain size={16} /> Analyse & Convert to Structured Notes</>}
            </button>
          )}

          {/* ── Block preview */}
          {blocks && blocks.length > 0 && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-400" /> {blocks.length} blocks extracted
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(blockCounts).map(([type, count]) => (
                    <span key={type} className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                      {BLOCK_EMOJI[type]} {count} {type}
                    </span>
                  ))}
                </div>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {blocks.map(block => {
                  const isExpanded = expandedBlocks.has(block.id)
                  const isLong = block.content.length > 120
                  const display = isLong && !isExpanded ? block.content.slice(0, 120) + '…' : block.content
                  return (
                    <div key={block.id} className={clsx('group flex items-start gap-3 px-4 py-3', block.type === 'code' ? 'bg-slate-900' : 'bg-white hover:bg-slate-50')}>
                      <span className="text-lg shrink-0 mt-0.5">{BLOCK_EMOJI[block.type]}</span>
                      <div className="flex-1 min-w-0">
                        <span className={clsx('text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border inline-block mb-1', BLOCK_TAG_COLOR[block.type])}>
                          {block.type}{block.label ? ` · ${block.label}` : ''}
                        </span>
                        <p className={clsx('text-sm whitespace-pre-line leading-relaxed', block.type === 'code' ? 'text-green-400 font-mono' : 'text-slate-700')}>
                          {display}
                        </p>
                        {isLong && (
                          <button onClick={() => toggleExpand(block.id)} className="text-xs text-blue-500 hover:underline mt-1 flex items-center gap-0.5">
                            {isExpanded ? <><ChevronUp size={11}/>Show less</> : <><ChevronDown size={11}/>Show more</>}
                          </button>
                        )}
                      </div>
                      <button onClick={() => removeBlock(block.id)} className="shrink-0 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Footer */}
        <div className="px-5 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400">
            {images.length > 0 && <span className="text-blue-600 font-medium">{images.length} screenshot{images.length>1?'s':''} · </span>}
            {blocks ? `${blocks.length} text blocks ready` : mode === 'screenshot' ? 'Add screenshots and a title' : 'Paste content then Analyse'}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || (!blocks?.length && !images.length)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold shadow-sm"
            >
              Save to Notebook 📚
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
