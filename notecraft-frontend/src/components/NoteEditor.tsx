import { useState } from 'react'
import { ArrowLeft, Plus, Trash2, Save, Eye } from 'lucide-react'
import { Note, NoteBlock, Subject, Chapter } from '../types'
import { nanoid } from '../utils'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface Props {
  note?: Note
  subjects: Subject[]
  chapters: Chapter[]
  defaultSubjectId?: string
  onSave: (note: Note) => void
  onCancel: () => void
  onAddChapter: (c: Chapter) => void
}

const BLOCK_TYPES: { value: NoteBlock['type']; label: string; emoji: string }[] = [
  { value: 'heading',     label: 'Heading',     emoji: '🔤' },
  { value: 'definition',  label: 'Definition',  emoji: '📖' },
  { value: 'explanation', label: 'Explanation', emoji: '💬' },
  { value: 'formula',     label: 'Formula',     emoji: '∑' },
  { value: 'example',     label: 'Example',     emoji: '✏️' },
  { value: 'keypoint',    label: 'Key Point',   emoji: '★' },
  { value: 'margin',      label: 'Margin Tip',  emoji: '📌' },
  { value: 'code',        label: 'Code',        emoji: '💻' },
  { value: 'question',    label: 'Question',    emoji: '❓' },
]

const INK_COLORS = [
  { label: 'Navy', value: '#1e3a5f' },
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Blue', value: '#2980b9' },
  { label: 'Red', value: '#c0392b' },
  { label: 'Green', value: '#27ae60' },
  { label: 'Purple', value: '#8e44ad' },
]

export default function NoteEditor({
  note, subjects, chapters, defaultSubjectId,
  onSave, onCancel, onAddChapter
}: Props) {
  const [title, setTitle] = useState(note?.title || '')
  const [subjectId, setSubjectId] = useState(note?.subjectId || defaultSubjectId || (subjects[0]?.id ?? ''))
  const [chapterId, setChapterId] = useState(note?.chapterId || '')
  const [tags, setTags] = useState(note?.tags.join(', ') || '')
  const [blocks, setBlocks] = useState<NoteBlock[]>(note?.blocks || [
    { id: nanoid(), type: 'heading', content: '' },
    { id: nanoid(), type: 'definition', content: '', label: 'Definition' },
  ])
  const [paperStyle, setPaperStyle] = useState<Note['paperStyle']>(note?.paperStyle || 'ruled')
  const [handwritingStyle, setHandwritingStyle] = useState<Note['handwritingStyle']>(note?.handwritingStyle || 'kalam')
  const [inkColor, setInkColor] = useState(note?.inkColor || '#1e3a5f')
  const [sourceText, setSourceText] = useState(note?.sourceText || '')
  const [newChapterName, setNewChapterName] = useState('')
  const [showNewChapter, setShowNewChapter] = useState(false)

  const availableChapters = chapters.filter(c => c.subjectId === subjectId)

  const addBlock = (type: NoteBlock['type']) => {
    setBlocks(prev => [...prev, { id: nanoid(), type, content: '', label: type === 'example' ? 'Example' : type === 'definition' ? 'Definition' : undefined }])
  }

  const updateBlock = (id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b))
  }

  const updateBlockLabel = (id: string, label: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, label } : b))
  }

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  const moveBlock = (id: string, dir: 'up' | 'down') => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id)
      if (idx === -1) return prev
      const next = [...prev]
      const target = dir === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  const handleAddChapter = () => {
    if (!newChapterName.trim()) return
    const c: Chapter = { id: nanoid(), subjectId, title: newChapterName.trim(), noteCount: 0, createdAt: new Date().toISOString() }
    onAddChapter(c)
    setChapterId(c.id)
    setNewChapterName('')
    setShowNewChapter(false)
    toast.success('Chapter created!')
  }

  const handleSave = () => {
    if (!title.trim()) return toast.error('Note title required')
    if (!subjectId) return toast.error('Select a subject')
    const saved: Note = {
      id: note?.id || nanoid(),
      title: title.trim(),
      subjectId,
      chapterId,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      blocks: blocks.filter(b => b.content.trim()),
      images: note?.images || [],
      sourceText,
      paperStyle,
      handwritingStyle,
      inkColor,
      createdAt: note?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    onSave(saved)
    toast.success('Note saved!')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top toolbar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <button onClick={onCancel} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <input
          className="flex-1 mx-8 text-xl font-bold text-slate-800 bg-transparent border-none outline-none placeholder:text-slate-300 text-center"
          placeholder="Note title..."
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          <Save size={15} /> Save
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6 flex gap-6">
        {/* Settings panel */}
        <div className="w-56 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-4 sticky top-20">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Subject</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={subjectId}
                onChange={e => { setSubjectId(e.target.value); setChapterId('') }}
              >
                <option value="">-- Select --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Chapter</label>
              <select
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                value={chapterId}
                onChange={e => setChapterId(e.target.value)}
              >
                <option value="">-- Select --</option>
                {availableChapters.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              {!showNewChapter ? (
                <button
                  onClick={() => setShowNewChapter(true)}
                  className="text-xs text-blue-600 mt-1 hover:underline"
                >+ New chapter</button>
              ) : (
                <div className="mt-2 flex gap-1">
                  <input
                    className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none"
                    placeholder="Chapter name"
                    value={newChapterName}
                    onChange={e => setNewChapterName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddChapter()}
                  />
                  <button onClick={handleAddChapter} className="text-xs bg-blue-600 text-white px-2 rounded">+</button>
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Tags</label>
              <input
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="GATE, exam, important"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Paper Style</label>
              <div className="grid grid-cols-2 gap-1">
                {(['ruled','dotted','graph','plain'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setPaperStyle(s)}
                    className={clsx('text-xs py-1.5 rounded border capitalize', paperStyle === s ? 'bg-blue-100 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50')}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Handwriting</label>
              <div className="flex gap-1">
                {(['kalam','caveat'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setHandwritingStyle(s)}
                    className={clsx('flex-1 text-xs py-1.5 rounded border capitalize', handwritingStyle === s ? 'bg-blue-100 border-blue-400 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50')}
                  >{s}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">Ink Color</label>
              <div className="flex gap-1.5 flex-wrap">
                {INK_COLORS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setInkColor(c.value)}
                    title={c.label}
                    className={clsx('w-6 h-6 rounded-full border-2', inkColor === c.value ? 'border-slate-700 scale-110' : 'border-transparent')}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main editor */}
        <div className="flex-1">
          {/* Source text */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              📋 Source Text (paste ChatGPT answer, lecture notes, etc.)
            </label>
            <textarea
              className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              rows={4}
              placeholder="Paste your ChatGPT conversation, lecture notes, or any source material here. This is preserved for reference."
              value={sourceText}
              onChange={e => setSourceText(e.target.value)}
            />
          </div>

          {/* Blocks */}
          <div className="space-y-3 mb-4">
            {blocks.map((block, idx) => (
              <BlockEditor
                key={block.id}
                block={block}
                index={idx}
                total={blocks.length}
                onUpdate={updateBlock}
                onUpdateLabel={updateBlockLabel}
                onRemove={removeBlock}
                onMove={moveBlock}
              />
            ))}
          </div>

          {/* Add block buttons */}
          <div className="bg-white rounded-xl border border-dashed border-slate-300 p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Add Block</p>
            <div className="flex flex-wrap gap-2">
              {BLOCK_TYPES.map(bt => (
                <button
                  key={bt.value}
                  onClick={() => addBlock(bt.value)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 transition-colors"
                >
                  <span>{bt.emoji}</span> {bt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlockEditor({
  block, index, total, onUpdate, onUpdateLabel, onRemove, onMove
}: {
  block: NoteBlock; index: number; total: number
  onUpdate: (id: string, c: string) => void
  onUpdateLabel: (id: string, l: string) => void
  onRemove: (id: string) => void
  onMove: (id: string, dir: 'up' | 'down') => void
}) {
  const bt = BLOCK_TYPES.find(t => t.value === block.type)

  const BG: Record<string, string> = {
    heading: 'bg-blue-50 border-blue-200',
    definition: 'bg-blue-50 border-blue-200',
    formula: 'bg-amber-50 border-amber-200',
    example: 'bg-green-50 border-green-200',
    keypoint: 'bg-red-50 border-red-200',
    margin: 'bg-yellow-50 border-yellow-200',
    code: 'bg-slate-900 border-slate-700',
    question: 'bg-purple-50 border-purple-200',
    explanation: 'bg-white border-slate-200',
  }

  const isCode = block.type === 'code'

  return (
    <div className={clsx('rounded-xl border p-4 group', BG[block.type] || 'bg-white border-slate-200')}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-base">{bt?.emoji}</span>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{bt?.label}</span>
          {(block.type === 'definition' || block.type === 'example') && (
            <input
              className="text-xs border border-slate-200 rounded px-1.5 py-0.5 bg-white focus:outline-none w-28"
              placeholder="Label..."
              value={block.label || ''}
              onChange={e => onUpdateLabel(block.id, e.target.value)}
            />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button disabled={index === 0} onClick={() => onMove(block.id, 'up')} className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 text-xs">↑</button>
          <button disabled={index === total - 1} onClick={() => onMove(block.id, 'down')} className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 text-xs">↓</button>
          <button onClick={() => onRemove(block.id)} className="p-1 hover:bg-white rounded text-slate-400 hover:text-red-600">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <textarea
        className={clsx(
          'w-full rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none',
          isCode ? 'bg-slate-800 text-green-400 font-mono border border-slate-600' : 'bg-white/70 border border-slate-200'
        )}
        rows={block.type === 'heading' ? 1 : block.type === 'formula' || block.type === 'code' ? 3 : 4}
        placeholder={
          block.type === 'heading' ? 'Chapter or section heading...'
          : block.type === 'formula' ? 'Mathematical formula or equation...'
          : block.type === 'code' ? 'Code snippet...'
          : block.type === 'keypoint' ? 'Important point to remember...'
          : block.type === 'margin' ? 'Exam tip, shortcut, or memory trick...'
          : block.type === 'question' ? 'Practice question...'
          : 'Write here...'
        }
        value={block.content}
        onChange={e => onUpdate(block.id, e.target.value)}
      />
    </div>
  )
}
