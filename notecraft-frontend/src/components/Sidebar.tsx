import { LayoutDashboard, Zap, CreditCard, Search, ChevronLeft, ChevronRight, Plus, Download, Smartphone, MonitorDown } from 'lucide-react'
import { Subject } from '../types'
import { View } from '../App'
import clsx from 'clsx'
import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface Props {
  open: boolean
  subjects: Subject[]
  activeSubjectId: string | null
  onSelectSubject: (id: string) => void
  onNewNote: () => void
  onCapture: () => void
  onToggle: () => void
  onViewChange: (v: View) => void
  currentView: View
  onExport: () => void
}

export default function Sidebar({
  open, subjects, activeSubjectId,
  onSelectSubject, onNewNote, onCapture,
  onToggle, onViewChange, currentView, onExport
}: Props) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(
    window.matchMedia('(display-mode: standalone)').matches || !!(navigator as any).standalone
  )

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
    setInstallPrompt(null)
  }
  return (
    <aside className={clsx(
      'h-full bg-slate-900 text-white flex flex-col transition-all duration-300 shrink-0',
      open ? 'w-64' : 'w-16'
    )}>

      {/* ── Logo */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60">
        {open && (
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="NoteCraft AI"
              className="w-8 h-8 rounded-xl object-cover shadow-lg"
              onError={e => {
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <div>
              <span className="font-bold text-base tracking-tight leading-none block">
                NoteCraft <span className="text-blue-400">AI</span>
              </span>
              <span className="text-slate-500 text-xs">Study Notebook</span>
            </div>
          </div>
        )}
        {!open && (
          <div className="w-8 h-8 mx-auto">
            <img src="/logo.png" alt="logo" className="w-full h-full rounded-xl object-cover" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={clsx('p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white shrink-0', !open && 'hidden')}
        >
          <ChevronLeft size={16} />
        </button>
        {!open && (
          <button
            onClick={onToggle}
            className="absolute left-16 top-3 p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 shadow z-10"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* ── Quick actions */}
      <div className="p-3 border-b border-slate-700/60 space-y-1.5">
        <button
          onClick={onCapture}
          className="w-full flex items-center gap-3 px-3 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-semibold transition-colors shadow-md"
          title="Quick Capture"
        >
          <Zap size={16} />
          {open && <span>Quick Capture</span>}
        </button>
        <button
          onClick={onNewNote}
          className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl text-sm transition-colors"
          title="New Note"
        >
          <Plus size={16} />
          {open && <span>New Note</span>}
        </button>
      </div>

      {/* ── Nav */}
      <nav className="p-3 border-b border-slate-700/60 space-y-0.5">
        {([
          { icon: LayoutDashboard, label: 'Dashboard',  view: 'dashboard'  as View },
          { icon: Search,          label: 'Search',     view: 'search'     as View },
          { icon: CreditCard,      label: 'Flashcards', view: 'flashcards' as View },
          { icon: Smartphone,      label: 'Mobile App', view: 'mobile'     as View },
        ]).map(({ icon: Icon, label, view }) => (
          <button
            key={view}
            onClick={() => onViewChange(view)}
            title={label}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
              currentView === view
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:bg-slate-700 hover:text-white'
            )}
          >
            <Icon size={16} />
            {open && <span>{label}</span>}
            {open && view === 'mobile' && (
              <span className="ml-auto text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">APK</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Subjects */}
      <div className="flex-1 overflow-y-auto p-3">
        {open && (
          <p className="text-xs uppercase text-slate-500 font-semibold px-2 mb-2 tracking-wider">Your Subjects</p>
        )}
        <div className="space-y-0.5">
          {subjects.map(sub => (
            <button
              key={sub.id}
              onClick={() => onSelectSubject(sub.id)}
              title={sub.name}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors',
                activeSubjectId === sub.id
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              )}
            >
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: sub.color + '33', border: `1px solid ${sub.color}55` }}
              >
                {sub.icon}
              </span>
              {open && (
                <div className="flex-1 text-left overflow-hidden">
                  <div className="font-medium truncate text-sm">{sub.name}</div>
                  <div className="text-xs text-slate-500">{sub.noteCount} notes</div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Footer */}
      <div className={clsx('border-t border-slate-700/60', open ? 'p-3 space-y-1' : 'p-2')}>
        {open ? (
          <>
            {/* Install App button */}
            {!isInstalled && (
              <button
                onClick={handleInstall}
                className="w-full flex items-center gap-2 px-3 py-2.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 hover:text-blue-300 rounded-xl text-xs font-semibold transition-colors mb-1"
              >
                <MonitorDown size={14} /> Install App on Device
              </button>
            )}
            {isInstalled && (
              <div className="flex items-center gap-2 px-3 py-2 text-green-500 text-xs">
                ✅ App Installed
              </div>
            )}
            <button
              onClick={onExport}
              className="w-full flex items-center gap-2 px-3 py-2 text-slate-500 hover:bg-slate-700 hover:text-white rounded-xl text-xs transition-colors"
            >
              <Download size={13} /> Export Backup
            </button>
            <div className="flex items-center gap-2 px-3 py-1">
              <img src="/logo.png" alt="" className="w-4 h-4 rounded" />
              <span className="text-slate-600 text-xs">NoteCraft AI v1.0</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-1">
            {!isInstalled && (
              <button onClick={handleInstall} title="Install App" className="w-full flex justify-center p-2 text-blue-500 hover:text-blue-400">
                <MonitorDown size={15} />
              </button>
            )}
            <button onClick={onExport} title="Export Backup" className="w-full flex justify-center p-2 text-slate-500 hover:text-white">
              <Download size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
