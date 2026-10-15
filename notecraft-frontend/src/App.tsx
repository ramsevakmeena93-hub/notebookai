import { useState, useCallback, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import NotebookView from './components/NotebookView'
import NoteEditor from './components/NoteEditor'
import CaptureModal from './components/CaptureModal'
import FlashcardsView from './components/FlashcardsView'
import SearchView from './components/SearchView'
import LoadingScreen from './components/LoadingScreen'
import MobileAppPage from './components/MobileAppPage'
import InstallBanner from './components/InstallBanner'
import MobileHeader from './components/MobileHeader'
import MobileBottomNav from './components/MobileBottomNav'
import { Subject, Chapter, Note } from './types'
import { db, openDB } from './db'
import { SEED_SUBJECTS, SEED_CHAPTERS, SEED_NOTES } from './store'

export type View = 'dashboard' | 'notebook' | 'editor' | 'flashcards' | 'search' | 'mobile'

export default function App() {
  const [ready,           setReady]           = useState(false)
  const [subjects,        setSubjects]        = useState<Subject[]>([])
  const [chapters,        setChapters]        = useState<Chapter[]>([])
  const [notes,           setNotes]           = useState<Note[]>([])
  const [view,            setView]            = useState<View>('dashboard')
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null)
  const [activeNoteId,    setActiveNoteId]    = useState<string | null>(null)
  const [showCapture,     setShowCapture]     = useState(false)
  const [sidebarOpen,     setSidebarOpen]     = useState(true)
  // Mobile drawer open state
  const [drawerOpen,      setDrawerOpen]      = useState(false)

  // ── Boot ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function boot() {
      try {
        await openDB()
        await db.migrateFromLocalStorage()
        const [dbSubjects, dbChapters, dbNotes] = await Promise.all([
          db.subjects.getAll(),
          db.chapters.getAll(),
          db.notes.getAll(),
        ])
        if (dbSubjects.length === 0) {
          await db.subjects.saveAll(SEED_SUBJECTS)
          await db.chapters.saveAll(SEED_CHAPTERS)
          await db.notes.saveAll(SEED_NOTES)
          setSubjects(SEED_SUBJECTS)
          setChapters(SEED_CHAPTERS)
          setNotes(SEED_NOTES)
        } else {
          const sorted = [...dbNotes].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          setSubjects(dbSubjects)
          setChapters(dbChapters)
          setNotes(sorted)
        }
      } catch (err) {
        console.error('DB boot error:', err)
      } finally {
        setReady(true)
      }
    }
    boot()
  }, [])

  // ── Persist ──────────────────────────────────────────────────────────────────
  const saveSubject = useCallback(async (s: Subject) => {
    await db.subjects.save(s)
    setSubjects(prev => {
      const exists = prev.find(x => x.id === s.id)
      return exists ? prev.map(x => x.id === s.id ? s : x) : [...prev, s]
    })
  }, [])

  const deleteSubject = useCallback(async (id: string) => {
    const toDeleteChapters = chapters.filter(c => c.subjectId === id)
    const toDeleteNotes    = notes.filter(n => n.subjectId === id)
    await db.subjects.delete(id)
    await Promise.all(toDeleteChapters.map(c => db.chapters.delete(c.id)))
    await Promise.all(toDeleteNotes.map(n => db.notes.delete(n.id)))
    setSubjects(prev => prev.filter(s => s.id !== id))
    setChapters(prev => prev.filter(c => c.subjectId !== id))
    setNotes(prev    => prev.filter(n => n.subjectId !== id))
  }, [chapters, notes])

  const saveChapter = useCallback(async (c: Chapter) => {
    await db.chapters.save(c)
    setChapters(prev => {
      const exists = prev.find(x => x.id === c.id)
      return exists ? prev.map(x => x.id === c.id ? c : x) : [...prev, c]
    })
  }, [])

  const saveNote = useCallback(async (note: Note) => {
    await db.notes.save(note)
    setNotes(prev => {
      const exists = prev.find(n => n.id === note.id)
      return exists ? prev.map(n => n.id === note.id ? note : n) : [note, ...prev]
    })
    const allNotes = await db.notes.getAll()
    const count = allNotes.filter(n => n.subjectId === note.subjectId).length
    setSubjects(prev => prev.map(s =>
      s.id === note.subjectId ? { ...s, noteCount: count } : s
    ))
    const updatedSubject = subjects.find(s => s.id === note.subjectId)
    if (updatedSubject) await db.subjects.save({ ...updatedSubject, noteCount: count })
  }, [subjects])

  const deleteNote = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id)
    await db.notes.delete(id)
    setNotes(prev => prev.filter(n => n.id !== id))
    if (note) {
      const allNotes = await db.notes.getAll()
      const count = allNotes.filter(n => n.subjectId === note.subjectId).length
      setSubjects(prev => prev.map(s =>
        s.id === note.subjectId ? { ...s, noteCount: count } : s
      ))
    }
  }, [notes])

  // ── Navigation ───────────────────────────────────────────────────────────────
  const openNote = (noteId: string) => { setActiveNoteId(noteId); setView('notebook') }
  const editNote = (noteId: string) => { setActiveNoteId(noteId); setView('editor') }
  const newNote  = (subjectId?: string) => {
    setActiveSubjectId(subjectId || null)
    setActiveNoteId(null)
    setView('editor')
  }

  const handleExport = async () => {
    const data = await db.exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `notecraft-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!ready) return <LoadingScreen />

  const activeNote = notes.find(n => n.id === activeNoteId)

  // Views where we hide bottom nav (full-screen views)
  const hideBottomNav = view === 'editor' || view === 'notebook'

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Toaster position="top-center" toastOptions={{ style: { fontSize: '14px' } }} />

      {/* ── Desktop Sidebar (hidden on mobile) */}
      <div className="hidden md:flex">
        <Sidebar
          open={sidebarOpen}
          subjects={subjects}
          activeSubjectId={activeSubjectId}
          onSelectSubject={(id) => { setActiveSubjectId(id); setView('dashboard') }}
          onNewNote={() => newNote()}
          onCapture={() => setShowCapture(true)}
          onToggle={() => setSidebarOpen(o => !o)}
          onViewChange={setView}
          currentView={view}
          onExport={handleExport}
        />
      </div>

      {/* ── Mobile Drawer overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer panel */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 z-50 flex flex-col shadow-2xl">
            <Sidebar
              open={true}
              subjects={subjects}
              activeSubjectId={activeSubjectId}
              onSelectSubject={(id) => {
                setActiveSubjectId(id)
                setView('dashboard')
                setDrawerOpen(false)
              }}
              onNewNote={() => { newNote(); setDrawerOpen(false) }}
              onCapture={() => { setShowCapture(true); setDrawerOpen(false) }}
              onToggle={() => setDrawerOpen(false)}
              onViewChange={(v) => { setView(v); setDrawerOpen(false) }}
              currentView={view}
              onExport={handleExport}
            />
          </div>
        </div>
      )}

      {/* ── Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Mobile top header */}
        <MobileHeader
          view={view}
          activeNote={activeNote}
          onMenuOpen={() => setDrawerOpen(true)}
          onCapture={() => setShowCapture(true)}
          onBack={() => setView('dashboard')}
        />

        {/* Page content */}
        <main className={`flex-1 overflow-auto ${!hideBottomNav ? 'pb-16 md:pb-0' : ''}`}>
          {view === 'dashboard' && (
            <Dashboard
              subjects={subjects}
              chapters={chapters}
              notes={notes}
              activeSubjectId={activeSubjectId}
              onOpenNote={openNote}
              onEditNote={editNote}
              onNewNote={newNote}
              onCapture={() => setShowCapture(true)}
              onAddSubject={saveSubject}
              onDeleteSubject={deleteSubject}
              onAddChapter={saveChapter}
              onSearchClick={() => setView('search')}
            />
          )}

          {view === 'notebook' && activeNote && (
            <NotebookView
              note={activeNote}
              subjects={subjects}
              chapters={chapters}
              onBack={() => setView('dashboard')}
              onEdit={() => editNote(activeNote.id)}
            />
          )}

          {view === 'editor' && (
            <NoteEditor
              note={activeNoteId ? activeNote : undefined}
              subjects={subjects}
              chapters={chapters}
              defaultSubjectId={activeSubjectId || undefined}
              onSave={async (note) => { await saveNote(note); openNote(note.id) }}
              onCancel={() => setView('dashboard')}
              onAddChapter={saveChapter}
            />
          )}

          {view === 'flashcards' && (
            <FlashcardsView
              notes={notes}
              subjects={subjects}
              onBack={() => setView('dashboard')}
            />
          )}

          {view === 'search' && (
            <SearchView
              notes={notes}
              subjects={subjects}
              chapters={chapters}
              onOpenNote={openNote}
              onBack={() => setView('dashboard')}
            />
          )}

          {view === 'mobile' && (
            <MobileAppPage onBack={() => setView('dashboard')} />
          )}
        </main>

        {/* Mobile bottom nav */}
        {!hideBottomNav && (
          <MobileBottomNav
            currentView={view}
            onViewChange={setView}
            onCapture={() => setShowCapture(true)}
            noteCount={notes.length}
          />
        )}
      </div>

      {/* Modals */}
      {showCapture && (
        <CaptureModal
          subjects={subjects}
          chapters={chapters}
          onClose={() => setShowCapture(false)}
          onSaveNote={async (note) => {
            await saveNote(note)
            setShowCapture(false)
            openNote(note.id)
          }}
          onAddChapter={saveChapter}
        />
      )}

      <InstallBanner />
    </div>
  )
}
