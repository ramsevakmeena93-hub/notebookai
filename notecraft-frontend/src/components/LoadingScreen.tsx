import { useEffect, useState } from 'react'

const TIPS = [
  'Organizing your DBMS notes...',
  'Loading your flashcards...',
  'Preparing your study workspace...',
  'Fetching your subjects...',
  'Setting up handwriting renderer...',
  'Almost ready...',
]

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(interval); return 95 }
        return p + Math.random() * 18
      })
    }, 180)

    // Rotate tips
    const tipTimer = setInterval(() => {
      setTipIndex(i => (i + 1) % TIPS.length)
    }, 900)

    return () => { clearInterval(interval); clearInterval(tipTimer) }
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>

      {/* Background decorative circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/5 rounded-full blur-2xl" />
        {/* Floating paper lines */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-blue-400/10 rounded-full"
            style={{
              width: `${60 + i * 20}px`,
              top: `${15 + i * 14}%`,
              left: `${5 + i * 3}%`,
              transform: `rotate(${-5 + i * 2}deg)`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>

      {/* Logo + Name */}
      <div className="relative flex flex-col items-center mb-10">
        {/* Glow ring behind logo */}
        <div className="absolute w-36 h-36 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />

        {/* Logo */}
        <div className="relative w-28 h-28 mb-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl opacity-20 blur-lg animate-pulse" />
          <img
            src="/logo.png"
            alt="NoteCraft AI"
            className="relative w-full h-full object-contain drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.6))' }}
          />
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-white tracking-tight mb-1">
          NoteCraft <span className="text-blue-400">AI</span>
        </h1>
        <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">
          Your Personal Study Notebook
        </p>
      </div>

      {/* Progress section */}
      <div className="relative w-72 flex flex-col items-center gap-4">
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(progress, 95)}%`,
              background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s linear infinite',
            }}
          />
        </div>

        {/* Tip text */}
        <p className="text-slate-500 text-xs text-center h-4 transition-all duration-500">
          {TIPS[tipIndex]}
        </p>

        {/* Dots */}
        <div className="flex gap-2 mt-2">
          {[0,1,2,3].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-500/60"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
      </div>

      {/* Version badge */}
      <div className="absolute bottom-8 text-slate-600 text-xs flex items-center gap-2">
        <span>v1.0</span>
        <span>·</span>
        <span>Built for Students</span>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
