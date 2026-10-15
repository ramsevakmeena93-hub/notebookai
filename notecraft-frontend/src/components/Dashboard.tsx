import { useState } from 'react'
import { Plus, BookOpen, Clock, Zap, Search, Trash2, ChevronRight, FileText } from 'lucide-react'
import { Subject, Chapter, Note } from '../types'
import { nanoid } from '../utils'
import toast from 'react-hot-toast'
import clsx from 'clsx'

interface Props {
  subjects: Subject[]
  chapters: Chapter[]
  notes: Note[]
  activeSubjectId: string | null
  onOpenNote: (id: string) => void
  onEditNote: (id: string) => void
  onNewNote: (subjectId?: string) => void
  onCapture: () => void
  onAddSubject: (s: Subject) => void
  onDeleteSubject: (id: string) => void
  onAddChapter: (c: Chapter) => void
  onSearchClick: () => void
}

const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#84cc16']
const ICONS  = ['📚','🗄️','🌳','💻','⚙️','🧠','🔬','📐','🌍','✏️','🎯','🏆']

export default function Dashboard({
  subjects, chapters, notes, activeSubjectId,
  onOpenNote, onEditNote, onNewNote, onCapture,
  onAddSubject, onDeleteSubject, onAddChapter, onSearchClick
}: Props) {
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [newSubName, setNewSubName] = useState('')
  const [newSubDesc, setNewSubDesc] = useState('')
  const [newSubColor, setNewSubColor] = useState(COLORS[0])
  const [newSubIcon, setNewSubIcon] = useState(ICONS[0])

  const filteredNotes = activeSubjectId
    ? notes.filter(n => n.subjectId === activeSubjectId)
    : notes

  const recentNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 6)

  const activeSubject = subjects.find(s => s.id === activeSubjectId)
  const subjectChapters = activeSubjectId ? chapters.filter(c => c.subjectId === activeSubjectId) : []

  const handleAddSubject = () => {
    if (!newSubName.trim()) return toast.error('Subject name required')
    onAddSubject({
      id: nanoid(),
      name: newSubName.trim(),
      description: newSubDesc.trim(),
      color: newSubColor,
      icon: newSubIcon,
      noteCount: 0,
      createdAt: new Date().toISOString(),
    })
    setNewSubName(''); setNewSubDesc('')
    setShowAddSubject(false)
    toast.success('Subject created!')
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {activeSubject ? `${activeSubject.icon} ${activeSubject.name}` : '📚 Your Workspace'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {activeSubject ? activeSubject.description : 'Capture knowledge. Create notes. Master every subject.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSearchClick}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-sm text-slate-600 shadow-sm"
          >
            <Search size={16} /> Search notes...
          </button>
          <button
            onClick={onCapture}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm shadow-sm"
          >
            <Zap size={16} /> Quick Capture
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Subjects', value: subjects.length, icon: BookOpen, color: 'blue' },
          { label: 'Notes', value: notes.length, icon: FileText, color: 'green' },
          { label: 'Chapters', value: chapters.length, icon: Clock, color: 'amber' },
          { label: 'This Week', value: notes.filter(n => {
            const d = new Date(n.createdAt); const now = new Date()
            return now.getTime() - d.getTime() < 7*24*60*60*1000
          }).length, icon: Zap, color: 'purple' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center mb-2`}>
              <Icon size={20} className={`text-${color}-600`} />
            </div>
            <div className="text-2xl font-bold text-slate-800">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects panel */}
        <div className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700">Your Subjects</h2>
            <button
              onClick={() => setShowAddSubject(true)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {showAddSubject && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-3 shadow-sm">
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Subject name (e.g. DBMS)"
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                autoFocus
              />
              <input
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Short description"
                value={newSubDesc}
                onChange={e => setNewSubDesc(e.target.value)}
              />
              <div className="flex gap-1 mb-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={clsx('w-6 h-6 rounded-full border-2', newSubColor === c ? 'border-slate-800' : 'border-transparent')}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewSubColor(c)}
                  />
                ))}
              </div>
              <div className="flex gap-1 mb-3 flex-wrap">
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    className={clsx('w-7 h-7 rounded text-sm', newSubIcon === ic ? 'bg-blue-100' : 'hover:bg-slate-100')}
                    onClick={() => setNewSubIcon(ic)}
                  >{ic}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSubject}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-1.5 text-sm hover:bg-blue-700"
                >Create</button>
                <button
                  onClick={() => setShowAddSubject(false)}
                  className="flex-1 border border-slate-200 rounded-lg py-1.5 text-sm hover:bg-slate-50"
                >Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {subjects.map(sub => {
              const subNotes = notes.filter(n => n.subjectId === sub.id)
              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 hover:border-slate-300 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => onNewNote(sub.id)}
                    >
                      <span
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: sub.color + '22' }}
                      >{sub.icon}</span>
                      <div>
                        <div className="font-medium text-slate-800 text-sm">{sub.name}</div>
                        <div className="text-xs text-slate-400">{subNotes.length} notes</div>
                      </div>
                    </div>
                    <button
                      onClick={() => { if (confirm(`Delete subject "${sub.name}"?`)) onDeleteSubject(sub.id) }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-slate-400 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Chapters for active subject */}
          {activeSubject && subjectChapters.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-slate-700 mb-2 text-sm">Chapters</h3>
              <div className="space-y-1">
                {subjectChapters.map(ch => (
                  <div key={ch.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100 text-sm">
                    <span className="text-slate-700">{ch.title}</span>
                    <span className="text-xs text-slate-400">{ch.noteCount} notes</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent notes */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700">
              {activeSubject ? `${activeSubject.name} Notes` : 'Recent Notes'}
            </h2>
            <button
              onClick={() => onNewNote(activeSubjectId || undefined)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus size={14} /> New Note
            </button>
          </div>

          {recentNotes.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="text-4xl mb-3">📝</div>
              <div className="text-slate-500 font-medium">No notes yet</div>
              <div className="text-slate-400 text-sm mt-1 mb-4">Start by capturing something you just learned</div>
              <button
                onClick={onCapture}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >Capture Now</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentNotes.map(note => {
                const subject = subjects.find(s => s.id === note.subjectId)
                const chapter = chapters.find(c => c.id === note.chapterId)
                const preview = note.blocks.find(b => b.type === 'definition' || b.type === 'explanation')?.content || ''
                return (
                  <div
                    key={note.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => onOpenNote(note.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        {subject && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ backgroundColor: subject.color + '22', color: subject.color }}
                          >{subject.name}</span>
                        )}
                        {chapter && (
                          <span className="text-xs text-slate-400 ml-2">{chapter.title}</span>
                        )}
                      </div>
                      <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 mt-0.5 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-slate-800 text-sm mb-1.5">{note.title}</h3>
                    {preview && (
                      <p className="text-xs text-slate-500 line-clamp-2">{preview}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {note.tags.map(tag => (
                        <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">#{tag}</span>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); onOpenNote(note.id) }}
                        className="text-xs text-blue-600 hover:underline"
                      >View</button>
                      <button
                        onClick={e => { e.stopPropagation(); onEditNote(note.id) }}
                        className="text-xs text-slate-500 hover:underline"
                      >Edit</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
