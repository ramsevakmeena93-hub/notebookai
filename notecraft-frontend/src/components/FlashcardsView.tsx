import { useState } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react'
import { Note, Subject, Flashcard } from '../types'
import { nanoid } from '../utils'
import clsx from 'clsx'

interface Props {
  notes: Note[]
  subjects: Subject[]
  onBack: () => void
}

function generateFlashcards(notes: Note[]): Flashcard[] {
  const cards: Flashcard[] = []
  notes.forEach(note => {
    note.blocks.forEach(block => {
      if (block.type === 'definition' && block.content.trim()) {
        cards.push({
          id: nanoid(),
          noteId: note.id,
          question: `Define: ${block.label || note.title}`,
          answer: block.content,
          difficulty: 'medium',
        })
      }
      if (block.type === 'formula' && block.content.trim()) {
        cards.push({
          id: nanoid(),
          noteId: note.id,
          question: `What is the formula for "${note.title}"?`,
          answer: block.content,
          difficulty: 'hard',
        })
      }
      if (block.type === 'keypoint' && block.content.trim()) {
        cards.push({
          id: nanoid(),
          noteId: note.id,
          question: `Key concept from "${note.title}": fill in the blank`,
          answer: block.content,
          difficulty: 'easy',
        })
      }
      if (block.type === 'question' && block.content.trim()) {
        const parts = block.content.split('\n')
        cards.push({
          id: nanoid(),
          noteId: note.id,
          question: parts[0],
          answer: parts.slice(1).join('\n') || '(Check your notes)',
          difficulty: 'hard',
        })
      }
    })
  })
  return cards
}

const DIFF_COLOR: Record<string, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
}

export default function FlashcardsView({ notes, subjects, onBack }: Props) {
  const [cards] = useState(() => generateFlashcards(notes))
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [results, setResults] = useState<Record<string, 'right' | 'wrong'>>({})
  const [done, setDone] = useState(false)
  const [filterSubject, setFilterSubject] = useState<string>('all')

  const filteredCards = filterSubject === 'all'
    ? cards
    : cards.filter(c => {
        const note = notes.find(n => n.id === c.noteId)
        return note?.subjectId === filterSubject
      })

  const current = filteredCards[index]

  const next = () => {
    setFlipped(false)
    if (index < filteredCards.length - 1) {
      setIndex(i => i + 1)
    } else {
      setDone(true)
    }
  }

  const prev = () => {
    setFlipped(false)
    if (index > 0) setIndex(i => i - 1)
  }

  const mark = (r: 'right' | 'wrong') => {
    if (!current) return
    setResults(prev => ({ ...prev, [current.id]: r }))
    next()
  }

  const reset = () => {
    setIndex(0); setFlipped(false); setResults({}); setDone(false)
  }

  const rightCount = Object.values(results).filter(r => r === 'right').length
  const wrongCount = Object.values(results).filter(r => r === 'wrong').length

  if (cards.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="max-w-md mx-auto text-center py-20">
          <div className="text-5xl mb-4">🃏</div>
          <h2 className="text-xl font-bold text-slate-700 mb-2">No Flashcards Yet</h2>
          <p className="text-slate-500 text-sm">Create notes with Definitions, Key Points, Formulas or Questions — flashcards are auto-generated from them.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 text-sm">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">🃏 Flashcards</h1>
          <select
            className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white"
            value={filterSubject}
            onChange={e => { setFilterSubject(e.target.value); reset() }}
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}
          </select>
        </div>

        {done ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Session Complete!</h2>
            <div className="flex justify-center gap-8 my-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{rightCount}</div>
                <div className="text-sm text-slate-500">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{wrongCount}</div>
                <div className="text-sm text-slate-500">Wrong</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{Math.round(rightCount / filteredCards.length * 100)}%</div>
                <div className="text-sm text-slate-500">Score</div>
              </div>
            </div>
            <button
              onClick={reset}
              className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RotateCcw size={16} /> Try Again
            </button>
          </div>
        ) : current ? (
          <>
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
              <span>{index + 1} / {filteredCards.length}</span>
              <span className={clsx('px-2 py-0.5 rounded-full text-xs font-medium', DIFF_COLOR[current.difficulty])}>
                {current.difficulty}
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mb-6">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${((index) / filteredCards.length) * 100}%` }}
              />
            </div>

            {/* Card */}
            <div
              className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer select-none min-h-48 flex flex-col items-center justify-center text-center border-2 border-transparent hover:border-blue-200 transition-all"
              onClick={() => setFlipped(f => !f)}
            >
              {!flipped ? (
                <>
                  <div className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-4">❓ Question — tap to reveal</div>
                  <div className="font-hand text-2xl text-slate-800">{current.question}</div>
                </>
              ) : (
                <>
                  <div className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-4">✅ Answer</div>
                  <div className="font-hand text-xl text-slate-700 whitespace-pre-line">{current.answer}</div>
                </>
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-6">
              <button onClick={prev} disabled={index === 0} className="p-3 bg-white rounded-xl shadow hover:bg-slate-50 disabled:opacity-30">
                <ChevronLeft size={20} className="text-slate-600" />
              </button>

              {flipped ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => mark('wrong')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl border border-red-200 font-medium"
                  >
                    <X size={18} /> Wrong
                  </button>
                  <button
                    onClick={() => mark('right')}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl border border-green-200 font-medium"
                  >
                    <Check size={18} /> Got it
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setFlipped(true)}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
                >
                  Show Answer
                </button>
              )}

              <button onClick={next} className="p-3 bg-white rounded-xl shadow hover:bg-slate-50">
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
