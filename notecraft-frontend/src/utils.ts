import { NoteBlock } from './types'

export function nanoid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// ─────────────────────────────────────────────────────────────────────────────
// LaTeX → Unicode cleaner
// ChatGPT outputs \rightarrow, \( \), \[ \], \frac etc — clean all of it
// ─────────────────────────────────────────────────────────────────────────────
export function cleanLatex(raw: string): string {
  let t = raw

  // \[ block math \] → tag for formula detection
  t = t.replace(/\\\[[\s\S]*?\\\]/g, (m) => {
    const inner = m.replace(/^\s*\\\[/, '').replace(/\\\]\s*$/, '').trim()
    return '\n[FORMULA]' + latexToUnicode(inner) + '[/FORMULA]\n'
  })

  // \( inline math \)
  t = t.replace(/\\\([\s\S]*?\\\)/g, (m) => {
    const inner = m.replace(/^\s*\\\(/, '').replace(/\\\)\s*$/, '').trim()
    return latexToUnicode(inner)
  })

  // $$ block $$
  t = t.replace(/\$\$[\s\S]*?\$\$/g, (m) => {
    const inner = m.replace(/^\$\$/, '').replace(/\$\$$/, '').trim()
    return '\n[FORMULA]' + latexToUnicode(inner) + '[/FORMULA]\n'
  })

  // $ inline $
  t = t.replace(/\$([^$\n]{1,80})\$/g, (_, inner) => latexToUnicode(inner))

  // Remaining \commands
  t = latexToUnicode(t)

  return t
}

function latexToUnicode(s: string): string {
  return s
    .replace(/\\rightarrow/g, '→').replace(/\\leftarrow/g, '←')
    .replace(/\\Rightarrow/g, '⟹').replace(/\\Leftarrow/g, '⟸')
    .replace(/\\leftrightarrow/g, '↔').replace(/\\Leftrightarrow/g, '⟺')
    .replace(/\\to\b/g, '→').replace(/\\gets\b/g, '←')
    .replace(/\\forall/g, '∀').replace(/\\exists/g, '∃')
    .replace(/\\in\b/g, '∈').replace(/\\notin\b/g, '∉')
    .replace(/\\subseteq/g, '⊆').replace(/\\subset/g, '⊂')
    .replace(/\\supseteq/g, '⊇').replace(/\\supset/g, '⊃')
    .replace(/\\cup/g, '∪').replace(/\\cap/g, '∩')
    .replace(/\\emptyset/g, '∅').replace(/\\varnothing/g, '∅')
    .replace(/\\neg/g, '¬').replace(/\\wedge/g, '∧').replace(/\\vee/g, '∨')
    .replace(/\\neq/g, '≠').replace(/\\leq/g, '≤').replace(/\\geq/g, '≥')
    .replace(/\\equiv/g, '≡').replace(/\\approx/g, '≈').replace(/\\sim/g, '∼')
    .replace(/\\times/g, '×').replace(/\\div/g, '÷').replace(/\\pm/g, '±')
    .replace(/\\cdot/g, '·').replace(/\\circ/g, '∘')
    .replace(/\\sum/g, '∑').replace(/\\prod/g, '∏').replace(/\\int/g, '∫')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)').replace(/\\sqrt\b/g, '√')
    .replace(/\\infty/g, '∞').replace(/\\partial/g, '∂').replace(/\\nabla/g, '∇')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '($1)/($2)')
    .replace(/\\binom\{([^}]*)\}\{([^}]*)\}/g, 'C($1,$2)')
    .replace(/\^{([^}]+)}/g, '^$1').replace(/_{([^}]+)}/g, '_$1')
    .replace(/\\alpha/g,'α').replace(/\\beta/g,'β').replace(/\\gamma/g,'γ')
    .replace(/\\delta/g,'δ').replace(/\\Delta/g,'Δ').replace(/\\epsilon/g,'ε')
    .replace(/\\theta/g,'θ').replace(/\\Theta/g,'Θ').replace(/\\lambda/g,'λ')
    .replace(/\\mu/g,'μ').replace(/\\sigma/g,'σ').replace(/\\Sigma/g,'Σ')
    .replace(/\\pi/g,'π').replace(/\\Pi/g,'Π').replace(/\\phi/g,'φ').replace(/\\Phi/g,'Φ')
    .replace(/\\omega/g,'ω').replace(/\\Omega/g,'Ω').replace(/\\rho/g,'ρ')
    .replace(/\\tau/g,'τ').replace(/\\chi/g,'χ').replace(/\\psi/g,'ψ').replace(/\\Psi/g,'Ψ')
    .replace(/\\xi/g,'ξ').replace(/\\eta/g,'η').replace(/\\zeta/g,'ζ').replace(/\\nu/g,'ν')
    .replace(/\\text\{([^}]+)\}/g,'$1').replace(/\\mathrm\{([^}]+)\}/g,'$1')
    .replace(/\\mathbf\{([^}]+)\}/g,'$1').replace(/\\textbf\{([^}]+)\}/g,'$1')
    .replace(/\\textit\{([^}]+)\}/g,'$1').replace(/\\mathit\{([^}]+)\}/g,'$1')
    .replace(/\\operatorname\{([^}]+)\}/g,'$1')
    .replace(/\\left[\(\[\{]/g,'(').replace(/\\right[\)\]\}]/g,')')
    .replace(/\\,/g,' ').replace(/\\;/g,' ').replace(/\\:/g,' ').replace(/\\!/g,'')
    .replace(/\\quad/g,'  ').replace(/\\qquad/g,'    ')
    .replace(/\\\\/g,'\n')
    .replace(/[{}]/g,'')
    .replace(/\\[a-zA-Z]+/g, '')  // strip unknown commands
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// Strip markdown bold/italic/inline-code
// ─────────────────────────────────────────────────────────────────────────────
function stripMd(text: string): string {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// Line classifiers
// ─────────────────────────────────────────────────────────────────────────────
const MATH_CHARS = ['→','←','⟹','⟺','⟸','↔','∀','∃','∈','∉','⊆','⊂','∩','∪','≡','≠','≤','≥','∑','∏','√','∫','∂','∇','±','×','÷','∞']

function isHeading(line: string): boolean {
  if (line.length < 2 || line.length > 90) return false
  if (/^#{1,4}\s+/.test(line)) return true
  if (/^\*\*[^*]{2,70}\*\*:?\s*$/.test(line)) return true
  if (/^__[^_]{2,70}__:?\s*$/.test(line)) return true
  const alpha = line.replace(/[^A-Za-z ]/g,'').trim()
  if (alpha.length >= 3 && alpha === alpha.toUpperCase() && /[A-Z]{2,}/.test(alpha) && line.length <= 70) return true
  if (line.endsWith(':') && line.split(' ').length <= 7 && line.length <= 60 && /^[A-Z]/.test(line)) return true
  if (/^(Part|Section|Chapter|Unit)\s+\d+/i.test(line) && line.split(' ').length <= 8) return true
  return false
}

function cleanHeading(line: string): string {
  return line
    .replace(/^#{1,4}\s+/, '')
    .replace(/^\*\*/, '').replace(/\*\*:?\s*$/, '')
    .replace(/^__/, '').replace(/__:?\s*$/, '')
    .replace(/:$/, '')
    .replace(/^(Part|Section|Chapter|Unit)\s+\d+[\.\:\s]*/i, '')
    .trim()
}

function isFormula(line: string): boolean {
  if (MATH_CHARS.some(c => line.includes(c))) return true
  if (/[A-Z]\s*→\s*[A-Z\s,\(\)\{\}]/.test(line)) return true
  if (/O\([^)]+\)/.test(line)) return true
  if (/T\([^)]+\)\s*=/.test(line)) return true
  if (/\^[\dna]/.test(line) && line.length < 60) return true
  return false
}

function isBullet(line: string): boolean {
  return /^[\-•*]\s+/.test(line) || /^[→➤➔▶✓✗◆◇]\s+/.test(line)
}

function isNumberedItem(line: string): boolean {
  return /^\d+[\.\)]\s+/.test(line) && line.split(' ').length > 4
}

function isKeyTrigger(line: string): boolean {
  return /^(Note|Important|Remember|Tip|Key\s*[Pp]oint|Trick|Caution|Shortcut|Recall|Exam\s*[Tt]ip|GATE\s*[Tt]ip|Pro\s*[Tt]ip|Watch\s*[Oo]ut)[\s:]/i.test(line)
}

function isExampleTrigger(line: string): boolean {
  return /^(Example\s*\d*[:\.]?|Ex\.\s*\d*|For\s+example|E\.g\.|Consider|Suppose|Let'?s\s+say|Let\s+us|To\s+illustrate|Illustration)/i.test(line)
}

function isDefinition(line: string): boolean {
  return /\b(is\s+defined\s+as|is\s+called|refers\s+to|means\s+that|is\s+known\s+as|can\s+be\s+defined|is\s+a\s+|are\s+called|denotes|represents|is\s+said\s+to\s+be)\b/i.test(line) && line.length > 25
}

function isQuestion(line: string): boolean {
  return line.trim().endsWith('?') && line.length > 8
}

function cleanBullet(line: string): string {
  return line.replace(/^[\-•*→➤➔▶✓✗◆◇]\s+/, '').replace(/^\d+[\.\)]\s+/, '').trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PROCESSOR — paste anything, get structured blocks
// ─────────────────────────────────────────────────────────────────────────────
export function processTextToBlocks(rawInput: string): NoteBlock[] {
  // 1. Clean LaTeX
  const cleaned = cleanLatex(rawInput)

  // 2. Normalize lines
  const rawLines = cleaned.split('\n')
  const lines: string[] = []
  for (const raw of rawLines) {
    const t = raw.trimEnd()
    if (t === '') {
      if (lines.length > 0 && lines[lines.length - 1] !== '__BLANK__') lines.push('__BLANK__')
    } else {
      lines.push(t)
    }
  }

  const blocks: NoteBlock[] = []
  let i = 0
  let inCode = false
  let codeAcc: string[] = []
  let paraAcc: string[] = []

  const flushPara = () => {
    if (!paraAcc.length) return
    const text = paraAcc.join(' ').trim()
    paraAcc = []
    if (!text || text.length < 3) return
    blocks.push(classifyPara(text))
  }

  while (i < lines.length) {
    const line = lines[i]

    if (line === '__BLANK__') { flushPara(); i++; continue }

    // ── Tagged formula block (from \[...\])
    if (line.startsWith('[FORMULA]')) {
      flushPara()
      const content = line.replace('[FORMULA]', '').replace('[/FORMULA]', '').trim()
      if (content) blocks.push({ id: nanoid(), type: 'formula', content })
      i++; continue
    }

    // ── Code fence
    if (/^```/.test(line.trim())) {
      flushPara()
      if (!inCode) { inCode = true; codeAcc = [] }
      else {
        inCode = false
        if (codeAcc.length) blocks.push({ id: nanoid(), type: 'code', content: codeAcc.join('\n') })
        codeAcc = []
      }
      i++; continue
    }
    if (inCode) { codeAcc.push(line); i++; continue }

    // ── Heading
    if (isHeading(line)) {
      flushPara()
      blocks.push({ id: nanoid(), type: 'heading', content: cleanHeading(line) })
      i++; continue
    }

    // ── Formula line
    if (isFormula(line) && line.trim().split(' ').length < 20) {
      flushPara()
      const fLines = [stripMd(line)]
      while (i + 1 < lines.length && lines[i+1] !== '__BLANK__' && isFormula(lines[i+1]) && lines[i+1].split(' ').length < 20) {
        i++; fLines.push(stripMd(lines[i]))
      }
      blocks.push({ id: nanoid(), type: 'formula', content: fLines.join('\n') })
      i++; continue
    }

    // ── Key trigger
    if (isKeyTrigger(line)) {
      flushPara()
      blocks.push({ id: nanoid(), type: 'keypoint', content: stripMd(line) })
      i++; continue
    }

    // ── Bullet / numbered item
    if (isBullet(line) || isNumberedItem(line)) {
      flushPara()
      blocks.push({ id: nanoid(), type: 'keypoint', content: stripMd(cleanBullet(line)) })
      i++; continue
    }

    // ── Example block (collect multiple lines)
    if (isExampleTrigger(line)) {
      flushPara()
      const ex = [stripMd(line)]
      while (i + 1 < lines.length) {
        const nxt = lines[i+1]
        if (nxt === '__BLANK__') {
          const after = lines[i+2]
          if (!after || isHeading(after) || isExampleTrigger(after)) break
          i++; continue
        }
        if (isHeading(nxt) || isExampleTrigger(nxt) || ex.length >= 8) break
        i++; ex.push(stripMd(lines[i]))
      }
      blocks.push({ id: nanoid(), type: 'example', content: ex.join('\n'), label: 'Example' })
      i++; continue
    }

    // ── Question
    if (isQuestion(line)) {
      flushPara()
      blocks.push({ id: nanoid(), type: 'question', content: stripMd(line) })
      i++; continue
    }

    // ── Accumulate into paragraph
    paraAcc.push(line)
    i++
  }

  flushPara()
  if (inCode && codeAcc.length) blocks.push({ id: nanoid(), type: 'code', content: codeAcc.join('\n') })

  return blocks.filter(b => b.content.trim().length > 0)
}

function classifyPara(text: string): NoteBlock {
  const clean = stripMd(text)
  if (isFormula(clean) && clean.split(' ').length < 20)
    return { id: nanoid(), type: 'formula', content: clean }
  if (isKeyTrigger(clean))
    return { id: nanoid(), type: 'keypoint', content: clean }
  if (isExampleTrigger(clean))
    return { id: nanoid(), type: 'example', content: clean, label: 'Example' }
  if (isDefinition(clean))
    return { id: nanoid(), type: 'definition', content: clean, label: 'Definition' }
  return { id: nanoid(), type: 'explanation', content: clean }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
export function suggestTitle(blocks: NoteBlock[], fallback = ''): string {
  const h = blocks.find(b => b.type === 'heading')
  if (h) return h.content
  const d = blocks.find(b => b.type === 'definition')
  if (d) return d.content.split(' ').slice(0, 6).join(' ') + '...'
  return fallback
}

export function suggestSubject(text: string): string {
  const l = text.toLowerCase()
  if (/\b(normalization|functional.?depend|sql|dbms|relational|tuple|schema|bcnf|3nf|closure|superkey|candidate.?key|armstrong)\b/.test(l)) return 'DBMS'
  if (/\b(array|linked.?list|stack|queue|binary.?tree|bst|graph|dynamic.?program|sorting|recursion|big.?o|dsa|time.?complex)\b/.test(l)) return 'DSA'
  if (/\b(process|thread|semaphore|deadlock|paging|page.?fault|scheduling|kernel|operating.?system|mutex|race.?condition)\b/.test(l)) return 'OS'
  if (/\b(pipeline|alu|cache|instruction|register|flip.?flop|combinational|boolean|logic.?gate|coa|risc|cisc|datapath)\b/.test(l)) return 'COA'
  if (/\b(tcp|ip.?address|http|dns|routing|subnet|osi.?model|socket|bandwidth|network|packet|congestion|udp)\b/.test(l)) return 'CN'
  if (/\b(polity|constitution|parliament|judiciary|geography|history|economy|upsc|governance|article\s+\d)\b/.test(l)) return 'UPSC'
  if (/\b(integral|derivative|matrix|eigen|differential|probability|statistics|calculus|limit|continuity|theorem)\b/.test(l)) return 'Maths'
  if (/\b(newton|force|energy|quantum|atom|electron|bond|reaction|chemistry|physics|thermodynamics|velocity)\b/.test(l)) return 'Science'
  return ''
}
