/**
 * NoteCraft AI — Store
 * All persistence now goes through IndexedDB (db.ts).
 * localStorage is only used for the one-time migration flag.
 */

import { Subject, Chapter, Note } from './types'

// ── Seed data shown on very first launch ──────────────────────────────────────
export const SEED_SUBJECTS: Subject[] = [
  { id: 's1', name: 'DBMS',    color: '#3b82f6', icon: '🗄️', description: 'FDs, keys, normalization, SQL',     noteCount: 1, createdAt: new Date().toISOString() },
  { id: 's2', name: 'DSA',     color: '#10b981', icon: '🌳', description: 'Arrays, trees, graphs, DP',         noteCount: 0, createdAt: new Date().toISOString() },
  { id: 's3', name: 'COA',     color: '#f59e0b', icon: '💻', description: 'Arithmetic, architecture, pipeline', noteCount: 0, createdAt: new Date().toISOString() },
  { id: 's4', name: 'OS',      color: '#8b5cf6', icon: '⚙️', description: 'Processes, memory, scheduling',     noteCount: 0, createdAt: new Date().toISOString() },
  { id: 's5', name: 'CN',      color: '#06b6d4', icon: '🌐', description: 'TCP/IP, routing, OSI model',        noteCount: 0, createdAt: new Date().toISOString() },
]

export const SEED_CHAPTERS: Chapter[] = [
  { id: 'c1', subjectId: 's1', title: 'Functional Dependencies', noteCount: 1, createdAt: new Date().toISOString() },
  { id: 'c2', subjectId: 's1', title: 'Normalization',           noteCount: 0, createdAt: new Date().toISOString() },
  { id: 'c3', subjectId: 's2', title: 'Binary Trees',            noteCount: 0, createdAt: new Date().toISOString() },
  { id: 'c4', subjectId: 's2', title: 'Dynamic Programming',     noteCount: 0, createdAt: new Date().toISOString() },
  { id: 'c5', subjectId: 's3', title: 'Number Systems',          noteCount: 0, createdAt: new Date().toISOString() },
]

export const SEED_NOTES: Note[] = [
  {
    id: 'n1',
    subjectId: 's1',
    chapterId: 'c1',
    title: 'Functional Dependency Basics',
    tags: ['GATE', 'important'],
    paperStyle: 'ruled',
    handwritingStyle: 'kalam',
    inkColor: '#1e3a5f',
    images: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceText: 'A functional dependency X → Y means that whenever two tuples agree on X they must also agree on Y.',
    blocks: [
      { id: 'b1', type: 'heading',    content: 'Functional Dependency' },
      { id: 'b2', type: 'definition', content: 'A functional dependency X → Y means that whenever two rows agree on X, they must also agree on Y.', label: 'Definition' },
      { id: 'b3', type: 'formula',    content: 'X → Y  ⟺  ∀ t₁, t₂ ∈ R : t₁[X] = t₂[X] ⟹ t₁[Y] = t₂[Y]' },
      { id: 'b4', type: 'example',    content: 'Student_ID → Student_Name\nRollNo → {Name, Branch, Year}', label: 'Example' },
      { id: 'b5', type: 'keypoint',   content: 'X determines Y. Check whether the same X can produce two different Y values.' },
      { id: 'b6', type: 'margin',     content: '⚠️ GATE Trap: FD is a constraint — not just observed in current data!' },
    ],
  },
]
