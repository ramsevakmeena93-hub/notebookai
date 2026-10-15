import { useRef } from 'react'
import { ArrowLeft, Edit3, Printer, Tag } from 'lucide-react'
import { Note, Subject, Chapter, NoteBlock } from '../types'
import clsx from 'clsx'

interface Props {
  note: Note
  subjects: Subject[]
  chapters: Chapter[]
  onBack: () => void
  onEdit: () => void
}

const PAPER_BG: Record<string, string> = {
  ruled: 'bg-ruled',
  dotted: 'bg-dotted',
  graph: 'bg-graph',
  plain: 'bg-plain',
}

const FONT: Record<string, string> = {
  kalam: 'font-hand',
  caveat: 'font-handclean',
}

function BlockRenderer({ block, inkColor, font }: { block: NoteBlock; inkColor: string; font: string }) {
  const base = clsx(font, 'leading-8')

  switch (block.type) {
    case 'heading':
      return (
        <h2 className={clsx(base, 'text-3xl font-bold mb-4 mt-2 border-b-2 pb-1')}
          style={{ color: inkColor, borderColor: inkColor + '55' }}>
          {block.content}
        </h2>
      )
    case 'definition':
      return (
        <div className="mb-4 pl-4 border-l-4 border-blue-400 bg-blue-50/60 rounded-r-lg py-2 pr-3">
          {block.label && <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{block.label}</div>}
          <p className={clsx(base, 'text-base')} style={{ color: inkColor }}>{block.content}</p>
        </div>
      )
    case 'formula':
      return (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 font-mono text-center">
          <pre className="font-hand text-lg whitespace-pre-wrap" style={{ color: '#7c3aed' }}>{block.content}</pre>
        </div>
      )
    case 'example':
      return (
        <div className="mb-4 border-2 border-dashed border-green-300 rounded-lg p-3 bg-green-50/50">
          {block.label && <div className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1">✏️ {block.label}</div>}
          <pre className={clsx(base, 'text-sm whitespace-pre-wrap')} style={{ color: '#166534' }}>{block.content}</pre>
        </div>
      )
    case 'keypoint':
      return (
        <div className="mb-3 flex items-start gap-2">
          <span className="text-red-500 text-lg mt-0.5">★</span>
          <p className={clsx(base, 'text-base font-semibold')} style={{ color: '#c0392b' }}>{block.content}</p>
        </div>
      )
    case 'margin':
      return (
        <div className="mb-3 ml-auto mr-0 bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2 max-w-xs text-sm"
          style={{ fontFamily: 'Caveat, cursive', color: '#78350f' }}>
          📌 {block.content}
        </div>
      )
    case 'code':
      return (
        <div className="mb-4 bg-slate-900 rounded-lg p-3 overflow-auto">
          <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">{block.content}</pre>
        </div>
      )
    case 'question':
      return (
        <div className="mb-3 flex items-start gap-2 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <span className="text-purple-500 font-bold">Q.</span>
          <p className={clsx(base, 'text-base text-purple-800')}>{block.content}</p>
        </div>
      )
    default:
      return (
        <p className={clsx(base, 'text-base mb-3')} style={{ color: inkColor }}>{block.content}</p>
      )
  }
}

export default function NotebookView({ note, subjects, chapters, onBack, onEdit }: Props) {
  const printRef = useRef<HTMLDivElement>(null)
  const subject = subjects.find(s => s.id === note.subjectId)
  const chapter = chapters.find(c => c.id === note.chapterId)

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 no-print">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {subject && (
              <span className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: subject.color + '22', color: subject.color }}>
                {subject.icon} {subject.name}
              </span>
            )}
            {chapter && <span className="text-slate-400">• {chapter.title}</span>}
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 text-slate-600"
          >
            <Printer size={15} /> Export PDF
          </button>
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Edit3 size={15} /> Edit
          </button>
        </div>
      </div>

      {/* Notebook page */}
      <div
        ref={printRef}
        className={clsx(
          'mx-auto max-w-2xl rounded-xl shadow-xl overflow-hidden print-page',
          PAPER_BG[note.paperStyle] || 'bg-ruled'
        )}
        style={{ minHeight: '297mm' }}
      >
        {/* Notebook top binding */}
        <div className="h-6 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 flex items-center justify-around px-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="w-6 h-4 bg-slate-400 rounded-b-full opacity-60" />
          ))}
        </div>

        <div className="flex">
          {/* Margin line */}
          <div className="w-14 shrink-0 border-r-2 border-red-300 bg-red-50/20" />

          {/* Content area */}
          <div className="flex-1 p-8 relative">
            {/* Title */}
            <div className={clsx(FONT[note.handwritingStyle] || 'font-hand', 'mb-6')}>
              <h1 className="text-4xl font-bold mb-1" style={{ color: note.inkColor }}>
                {note.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span>{new Date(note.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                {note.tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    <Tag size={10} />#{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Blocks */}
            <div className="space-y-1">
              {note.blocks.map(block => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  inkColor={note.inkColor}
                  font={FONT[note.handwritingStyle] || 'font-hand'}
                />
              ))}
            </div>

            {/* Screenshots */}
            {note.images && note.images.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-2">
                    📸 Screenshots ({note.images.length})
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="space-y-4">
                  {note.images.map((img, idx) => (
                    <div key={img.id} className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                      <img
                        src={img.dataUrl}
                        alt={img.caption || `Screenshot ${idx + 1}`}
                        className="w-full object-contain max-h-96 bg-slate-50"
                      />
                      {img.caption && (
                        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 text-center"
                          style={{ fontFamily: 'Caveat, cursive', fontSize: '14px' }}>
                          Fig {idx + 1}: {img.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="mt-12 border-t border-slate-200 pt-4 flex justify-between text-xs text-slate-400"
              style={{ fontFamily: 'Caveat, cursive' }}>
              <span>NoteCraft AI</span>
              <span>{subject?.name} • {chapter?.title}</span>
              <span>Page 1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
