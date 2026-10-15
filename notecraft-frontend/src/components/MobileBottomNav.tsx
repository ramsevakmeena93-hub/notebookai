import { LayoutDashboard, Search, CreditCard, Plus, Smartphone } from 'lucide-react'
import { View } from '../App'
import clsx from 'clsx'

interface Props {
  currentView: View
  onViewChange: (v: View) => void
  onCapture: () => void
  noteCount: number
}

const TABS = [
  { view: 'dashboard'  as View, icon: LayoutDashboard, label: 'Home' },
  { view: 'search'     as View, icon: Search,          label: 'Search' },
  { view: null,                 icon: Plus,             label: 'Capture' }, // center FAB
  { view: 'flashcards' as View, icon: CreditCard,       label: 'Cards' },
  { view: 'mobile'     as View, icon: Smartphone,       label: 'App' },
]

export default function MobileBottomNav({ currentView, onViewChange, onCapture }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900 border-t border-slate-700/60 safe-bottom">
      <div className="flex items-end justify-around px-2 pt-2 pb-3">
        {TABS.map(({ view, icon: Icon, label }, i) => {
          const isCapture = view === null
          const isActive  = !isCapture && currentView === view

          if (isCapture) {
            return (
              <button
                key="capture"
                onClick={onCapture}
                className="flex flex-col items-center -mt-5"
                aria-label="Quick Capture"
              >
                <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 border-4 border-slate-900 active:scale-95 transition-transform">
                  <Icon size={24} className="text-white" />
                </div>
                <span className="text-xs text-slate-500 mt-1">{label}</span>
              </button>
            )
          }

          return (
            <button
              key={view}
              onClick={() => onViewChange(view!)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 active:opacity-70 transition-opacity min-w-0"
            >
              <div className={clsx(
                'w-10 h-8 flex items-center justify-center rounded-xl transition-colors',
                isActive ? 'bg-blue-600/20' : ''
              )}>
                <Icon
                  size={20}
                  className={clsx(
                    'transition-colors',
                    isActive ? 'text-blue-400' : 'text-slate-500'
                  )}
                />
              </div>
              <span className={clsx(
                'text-xs font-medium transition-colors',
                isActive ? 'text-blue-400' : 'text-slate-500'
              )}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
