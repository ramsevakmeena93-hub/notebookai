import { Menu, Zap, ArrowLeft, Search } from 'lucide-react'
import { View } from '../App'
import { Note } from '../types'

interface Props {
  view: View
  activeNote?: Note
  onMenuOpen: () => void
  onCapture: () => void
  onBack: () => void
}

const VIEW_TITLES: Record<View, string> = {
  dashboard:  'NoteCraft AI',
  notebook:   'Notebook',
  editor:     'Note Editor',
  flashcards: 'Flashcards',
  search:     'Search',
  mobile:     'Mobile App',
}

export default function MobileHeader({ view, activeNote, onMenuOpen, onCapture, onBack }: Props) {
  const showBack = view === 'notebook' || view === 'editor' || view === 'mobile'
  const title = view === 'notebook' && activeNote ? activeNote.title : VIEW_TITLES[view]

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0 safe-top">
      {/* Left: menu or back */}
      {showBack ? (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-300 hover:text-white active:opacity-70 p-1 -ml-1"
        >
          <ArrowLeft size={20} />
        </button>
      ) : (
        <button
          onClick={onMenuOpen}
          className="p-1 -ml-1 text-slate-300 hover:text-white active:opacity-70"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      )}

      {/* Center: title */}
      <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
        {view === 'dashboard' && (
          <img src="/logo.png" alt="logo" className="w-6 h-6 rounded-lg" />
        )}
        <span className="font-bold text-sm truncate max-w-[160px]">{title}</span>
      </div>

      {/* Right: quick capture */}
      {!showBack && (
        <button
          onClick={onCapture}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl"
        >
          <Zap size={13} /> Capture
        </button>
      )}
      {showBack && <div className="w-16" />}
    </header>
  )
}
