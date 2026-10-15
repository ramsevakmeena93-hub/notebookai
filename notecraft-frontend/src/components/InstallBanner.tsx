import { useState, useEffect } from 'react'
import { X, Download, Smartphone, Monitor } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface Props {
  onInstalled?: () => void
}

export default function InstallBanner({ onInstalled }: Props) {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [show, setShow]     = useState(false)
  const [installed, setInstalled] = useState(false)
  const [isIOS, setIsIOS]   = useState(false)
  const [showIOSGuide, setShowIOSGuide] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if ((navigator as any).standalone) return

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(ios)

    // Already dismissed?
    const dismissed = localStorage.getItem('nc_install_dismissed')
    if (dismissed) return

    if (ios) {
      // Show iOS guide after 3 sec
      setTimeout(() => setShow(true), 3000)
      return
    }

    // Listen for Chrome/Android install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Detect successful install
    window.addEventListener('appinstalled', () => {
      setInstalled(true)
      setShow(false)
      onInstalled?.()
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setShow(false)
    }
    setPrompt(null)
  }

  const dismiss = () => {
    setShow(false)
    localStorage.setItem('nc_install_dismissed', 'true')
  }

  if (!show || installed) return null

  // ── iOS Guide ────────────────────────────────────────────────────────────────
  if (isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="logo" className="w-7 h-7 rounded-lg" />
              <span className="text-white font-bold text-sm">Add to Home Screen</span>
            </div>
            <button onClick={dismiss} className="text-white/70 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-slate-300 text-sm">Install NoteCraft AI on your iPhone for the best experience:</p>
            <div className="space-y-2">
              {[
                { step: '1', text: 'Tap the Share button', icon: '⬆️' },
                { step: '2', text: 'Scroll down and tap "Add to Home Screen"', icon: '📱' },
                { step: '3', text: 'Tap "Add" — Done!', icon: '✅' },
              ].map(({ step, text, icon }) => (
                <div key={step} className="flex items-center gap-3 bg-slate-800 rounded-xl px-3 py-2">
                  <span className="text-xl">{icon}</span>
                  <span className="text-slate-300 text-sm">{text}</span>
                </div>
              ))}
            </div>
            <button onClick={dismiss} className="w-full py-2 text-slate-500 text-xs hover:text-slate-300">
              Maybe later
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Android / Desktop Install Banner ─────────────────────────────────────────
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96 animate-slide-up">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl shadow" />
            <div>
              <div className="text-white font-bold text-sm leading-none">NoteCraft AI</div>
              <div className="text-blue-200 text-xs mt-0.5">Add to Home Screen</div>
            </div>
          </div>
          <button onClick={dismiss} className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            Install NoteCraft AI for instant access — works offline, opens like a real app!
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { icon: '⚡', label: 'Instant open' },
              { icon: '📴', label: 'Works offline' },
              { icon: '🔒', label: 'Private & secure' },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-slate-800 rounded-xl p-2.5 text-center">
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-slate-400 text-xs">{label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg hover:shadow-blue-600/30"
            >
              <Download size={16} /> Install App
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-2.5 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl text-sm transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s ease-out; }
      `}</style>
    </div>
  )
}
