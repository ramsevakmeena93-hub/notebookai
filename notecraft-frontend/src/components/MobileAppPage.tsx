import { ArrowLeft, Smartphone, Download, Star, Shield, Zap, BookOpen, Brain, CreditCard, CheckCircle2 } from 'lucide-react'
import { View } from '../App'

interface Props {
  onBack: () => void
}

const FEATURES = [
  { icon: Brain,      label: 'Smart Capture',     desc: 'Paste ChatGPT answers & auto-structure them into notes' },
  { icon: BookOpen,   label: 'Handwritten Notes',  desc: 'Beautiful notebook-style pages with Kalam font' },
  { icon: CreditCard, label: 'Flashcards',         desc: 'Auto-generated flashcards from your notes' },
  { icon: Zap,        label: 'Offline First',      desc: 'Works 100% offline — no internet needed' },
  { icon: Shield,     label: 'Private & Secure',   desc: 'All data stored locally on your device' },
  { icon: Star,       label: 'GATE Ready',         desc: 'Optimized for GATE, university & competitive exams' },
]

const SCREENSHOTS = [
  { label: 'Dashboard',      bg: 'from-blue-500 to-blue-700',    emoji: '📊' },
  { label: 'Note Editor',    bg: 'from-indigo-500 to-purple-700', emoji: '✍️' },
  { label: 'Notebook View',  bg: 'from-green-500 to-teal-700',   emoji: '📖' },
  { label: 'Flashcards',     bg: 'from-orange-500 to-red-600',   emoji: '🃏' },
]

export default function MobileAppPage({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero */}
      <div className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Back button */}
        <div className="relative max-w-4xl mx-auto px-6 pt-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} /> Back to App
          </button>
        </div>

        {/* Hero content */}
        <div className="relative max-w-4xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
              <Smartphone size={14} className="text-blue-400" />
              <span className="text-blue-300 text-xs font-semibold uppercase tracking-wider">Mobile App</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              NoteCraft AI<br />
              <span className="text-blue-400">on your Phone</span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Study smarter on the go. All your notes, flashcards and notebooks — right in your pocket.
            </p>

            {/* Download buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a
                href="https://play.google.com/store/apps/details?id=com.notecraft.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white text-slate-900 px-6 py-3.5 rounded-2xl font-semibold hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
              >
                <div className="text-2xl">🤖</div>
                <div className="text-left">
                  <div className="text-xs text-slate-500 leading-none">Get it on</div>
                  <div className="text-sm font-bold leading-tight">Google Play</div>
                </div>
              </a>

              <a
                href="#apk-direct"
                onClick={e => {
                  e.preventDefault()
                  const el = document.getElementById('apk-direct')
                  el?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <Download size={20} />
                <div className="text-left">
                  <div className="text-xs text-blue-200 leading-none">Direct</div>
                  <div className="text-sm font-bold leading-tight">Download APK</div>
                </div>
              </a>
            </div>

            <p className="text-slate-600 text-xs mt-4">
              Free forever · No login required · Works offline
            </p>
          </div>

          {/* Phone mockup */}
          <div className="shrink-0">
            <div className="relative w-52 h-96">
              {/* Phone frame */}
              <div className="absolute inset-0 bg-slate-800 rounded-[2.5rem] shadow-2xl border border-white/10" />
              <div className="absolute inset-2 bg-slate-900 rounded-[2rem] overflow-hidden">
                {/* Status bar */}
                <div className="h-6 bg-slate-800 flex items-center justify-center">
                  <div className="w-16 h-3 bg-slate-700 rounded-full" />
                </div>
                {/* App preview */}
                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <img src="/logo.png" alt="logo" className="w-7 h-7 rounded-lg" />
                    <span className="text-white text-xs font-bold">NoteCraft AI</span>
                  </div>
                  {['DBMS', 'DSA', 'OS', 'COA'].map((sub, i) => (
                    <div key={sub} className="bg-slate-800 rounded-lg p-2 flex items-center gap-2">
                      <div className="w-6 h-6 rounded text-xs flex items-center justify-center"
                        style={{ background: ['#3b82f622','#10b98122','#8b5cf622','#f59e0b22'][i] }}>
                        {['🗄️','🌳','⚙️','💻'][i]}
                      </div>
                      <span className="text-slate-300 text-xs">{sub}</span>
                      <span className="ml-auto text-slate-500 text-xs">{[12,8,5,7][i]} notes</span>
                    </div>
                  ))}
                  <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-2 mt-2">
                    <div className="text-blue-400 text-xs font-semibold">Quick Capture</div>
                    <div className="text-slate-500 text-xs mt-0.5">Paste ChatGPT → Notes</div>
                  </div>
                </div>
              </div>
              {/* Home indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Features */}
      <div className="max-w-4xl mx-auto px-6 py-14">
        <h2 className="text-2xl font-bold text-slate-800 text-center mb-2">Everything in your pocket</h2>
        <p className="text-slate-500 text-center mb-10">Same powerful features as the web app — optimized for mobile</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <Icon size={20} className="text-blue-600" />
              </div>
              <div className="font-semibold text-slate-800 text-sm mb-1">{label}</div>
              <div className="text-slate-500 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Screenshots preview */}
      <div className="bg-white border-y border-slate-100 py-14">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-10">App Screens</h2>
          <div className="grid grid-cols-4 gap-4">
            {SCREENSHOTS.map(({ label, bg, emoji }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`w-full aspect-[9/16] rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center text-4xl shadow-md`}>
                  {emoji}
                </div>
                <span className="text-xs text-slate-500 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Direct APK download */}
      <div id="apk-direct" className="max-w-4xl mx-auto px-6 py-14">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="text-5xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-white mb-2">Direct APK Download</h3>
            <p className="text-slate-400 mb-6 text-sm">
              Install directly without Play Store.<br />
              Enable "Install from unknown sources" in your Android settings first.
            </p>

            <div className="flex flex-col items-center gap-3">
              <a
                href="/NoteCraft-AI-v1.0.apk"
                download
                className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-blue-600/30 hover:-translate-y-0.5"
              >
                <Download size={22} />
                Download NoteCraft AI v1.0.apk
              </a>

              <div className="flex items-center gap-6 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Android 8.0+</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Free</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> No ads</span>
              </div>
            </div>

            <div className="mt-8 bg-amber-900/30 border border-amber-700/40 rounded-xl p-4 text-left max-w-md mx-auto">
              <p className="text-amber-400 text-xs font-semibold mb-1">⚠️ Install Instructions</p>
              <ol className="text-amber-200/70 text-xs space-y-1 list-decimal list-inside">
                <li>Download the APK file above</li>
                <li>Open your phone's Settings → Security</li>
                <li>Enable "Unknown sources" or "Install unknown apps"</li>
                <li>Open the downloaded APK and tap Install</li>
                <li>Done! Open NoteCraft AI</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer */}
      <div className="border-t border-slate-200 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src="/logo.png" alt="logo" className="w-6 h-6 rounded-lg" />
          <span className="font-bold text-slate-700">NoteCraft AI</span>
        </div>
        <p className="text-slate-400 text-xs">Made for students · Study smarter, not harder</p>
      </div>
    </div>
  )
}
