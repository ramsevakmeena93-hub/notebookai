import { useState, useMemo } from 'react'
import { ArrowLeft, Search, X } from 'lucide-react'
import { Note, Subject, Chapter } from '../types'
import clsx from 'clsx'

interface Props {
  notes: Note[]
  subjects: Subject[]
  chapters: Chapter[]
  onOpenNote: (id: string) => void
  onBack: () => void
}

export default function SearchView({ notes, subjects, chapters, onOpenNote, onBack }: Props) {
  const [query, setQuery] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q && filterSubject === 'all') return notes.slice(0, 10)

    return notes.filter(note => {
      const matchSubject = filterSubject === 'all' || note.subjectId === filterSubject
      if (!q) return matchSubject

      const searchIn = [
        note.title,
        ...note.blocks.map(b => b.content),
        ...note.tags,
        note.sourceText || '',
      ].join(' ').toLowerCase()

      return matchSubject && searchIn.includes(q)
    })
  }, [query, filterSubject, notes])

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return text.slice(0, 100)
    const start = Math.max(0, idx - 30)
    const end = Math.min(text.length, idx + q.length + 60)
    const snippet = (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '')
    return snippet
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">🔍 Search Notes</h1>

        {/* Search bar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2">
              <Search size={16} className="text-slate-400" />
              <input
                className="flex-1 text-sm outline-none placeholder:text-slate-400"
                placeholder="Search notes, formulas, definitions, topics..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-700">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterSubject('all')}
              className={clsx('px-3 py-1 rounded-full text-xs font-medium', filterSubject === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
            >All</button>
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => setFilterSubject(s.id)}
                className={clsx('px-3 py-1 rounded-full text-xs font-medium', filterSubject === s.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
              >{s.icon} {s.name}</button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {results.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-3">🔍</div>
              <div className="font-medium">No notes found for "{query}"</div>
              <div className="text-sm mt-1">Try a different keyword or subject filter</div>
            </div>
          ) : (
            results.map(note => {
              const subject = subjects.find(s => s.id === note.subjectId)
              const chapter = chapters.find(c => c.id === note.chapterId)
              const matchBlock = query
                ? note.blocks.find(b => b.content.toLowerCase().includes(query.toLowerCase()))
                : note.blocks[0]

              return (
                <div
                  key={note.id}
                  onClick={() => onOpenNote(note.id)}
                  className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {subject && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: subject.color + '22', color: subject.color }}>
                            {subject.icon} {subject.name}
                          </span>
                        )}
                        {chapter && <span className="text-xs text-slate-400">{chapter.title}</span>}
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">{note.title}</h3>
                      {matchBlock && (
                        <p className="text-sm text-slate-500 line-clamp-2">
                          <span className="text-xs text-slate-400 uppercase mr-1">{matchBlock.type}:</span>
                          {highlight(matchBlock.content, query)}
                        </p>
                      )}
                      <div className="flex gap-1 mt-2">
                        {note.tags.map(t => (
                          <span key={t} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 ml-4 shrink-0">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {results.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-4">
            {results.length} note{results.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>
    </div>
  )
}
