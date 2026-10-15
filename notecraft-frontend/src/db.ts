/**
 * NoteCraft AI — IndexedDB Database
 * Browser-native database, no backend needed.
 * Stores: subjects, chapters, notes, flashcards
 */

import { Subject, Chapter, Note, Flashcard } from './types'

const DB_NAME = 'notecraft_db'
const DB_VERSION = 1

// Store names
const STORES = {
  subjects:   'subjects',
  chapters:   'chapters',
  notes:      'notes',
  flashcards: 'flashcards',
} as const

// ── Open / init DB ────────────────────────────────────────────────────────────
let _db: IDBDatabase | null = null

export function openDB(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result

      // subjects — indexed by id
      if (!db.objectStoreNames.contains(STORES.subjects)) {
        db.createObjectStore(STORES.subjects, { keyPath: 'id' })
      }

      // chapters — indexed by subjectId
      if (!db.objectStoreNames.contains(STORES.chapters)) {
        const cs = db.createObjectStore(STORES.chapters, { keyPath: 'id' })
        cs.createIndex('subjectId', 'subjectId', { unique: false })
      }

      // notes — indexed by subjectId and chapterId
      if (!db.objectStoreNames.contains(STORES.notes)) {
        const ns = db.createObjectStore(STORES.notes, { keyPath: 'id' })
        ns.createIndex('subjectId', 'subjectId', { unique: false })
        ns.createIndex('chapterId', 'chapterId', { unique: false })
        ns.createIndex('updatedAt', 'updatedAt', { unique: false })
      }

      // flashcards — indexed by noteId
      if (!db.objectStoreNames.contains(STORES.flashcards)) {
        const fs = db.createObjectStore(STORES.flashcards, { keyPath: 'id' })
        fs.createIndex('noteId', 'noteId', { unique: false })
      }
    }

    req.onsuccess = (e) => {
      _db = (e.target as IDBOpenDBRequest).result
      resolve(_db)
    }

    req.onerror = () => reject(req.error)
  })
}

// ── Generic helpers ───────────────────────────────────────────────────────────

function getAll<T>(storeName: string): Promise<T[]> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).getAll()
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror  = () => reject(req.error)
  }))
}

function getByIndex<T>(storeName: string, indexName: string, value: string): Promise<T[]> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readonly')
    const idx = tx.objectStore(storeName).index(indexName)
    const req = idx.getAll(value)
    req.onsuccess = () => resolve(req.result as T[])
    req.onerror  = () => reject(req.error)
  }))
}

function getOne<T>(storeName: string, id: string): Promise<T | undefined> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).get(id)
    req.onsuccess = () => resolve(req.result as T | undefined)
    req.onerror  = () => reject(req.error)
  }))
}

function put<T>(storeName: string, item: T): Promise<void> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).put(item)
    req.onsuccess = () => resolve()
    req.onerror  = () => reject(req.error)
  }))
}

function putMany<T>(storeName: string, items: T[]): Promise<void> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx    = db.transaction(storeName, 'readwrite')
    const store = tx.objectStore(storeName)
    items.forEach(item => store.put(item))
    tx.oncomplete = () => resolve()
    tx.onerror    = () => reject(tx.error)
  }))
}

function remove(storeName: string, id: string): Promise<void> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).delete(id)
    req.onsuccess = () => resolve()
    req.onerror  = () => reject(req.error)
  }))
}

function clearStore(storeName: string): Promise<void> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readwrite')
    const req = tx.objectStore(storeName).clear()
    req.onsuccess = () => resolve()
    req.onerror  = () => reject(req.error)
  }))
}

function count(storeName: string): Promise<number> {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx  = db.transaction(storeName, 'readonly')
    const req = tx.objectStore(storeName).count()
    req.onsuccess = () => resolve(req.result)
    req.onerror  = () => reject(req.error)
  }))
}

// ── Subjects ──────────────────────────────────────────────────────────────────
export const db = {
  subjects: {
    getAll:  ()                  => getAll<Subject>(STORES.subjects),
    get:     (id: string)        => getOne<Subject>(STORES.subjects, id),
    save:    (s: Subject)        => put(STORES.subjects, s),
    saveAll: (arr: Subject[])    => putMany(STORES.subjects, arr),
    delete:  (id: string)        => remove(STORES.subjects, id),
    count:   ()                  => count(STORES.subjects),
  },

  chapters: {
    getAll:         ()                   => getAll<Chapter>(STORES.chapters),
    getBySubject:   (subjectId: string)  => getByIndex<Chapter>(STORES.chapters, 'subjectId', subjectId),
    get:            (id: string)         => getOne<Chapter>(STORES.chapters, id),
    save:           (c: Chapter)         => put(STORES.chapters, c),
    saveAll:        (arr: Chapter[])     => putMany(STORES.chapters, arr),
    delete:         (id: string)         => remove(STORES.chapters, id),
  },

  notes: {
    getAll:        ()                   => getAll<Note>(STORES.notes),
    getBySubject:  (subjectId: string)  => getByIndex<Note>(STORES.notes, 'subjectId', subjectId),
    getByChapter:  (chapterId: string)  => getByIndex<Note>(STORES.notes, 'chapterId', chapterId),
    get:           (id: string)         => getOne<Note>(STORES.notes, id),
    save:          (n: Note)            => put(STORES.notes, n),
    saveAll:       (arr: Note[])        => putMany(STORES.notes, arr),
    delete:        (id: string)         => remove(STORES.notes, id),
    count:         ()                   => count(STORES.notes),
  },

  flashcards: {
    getAll:      ()                 => getAll<Flashcard>(STORES.flashcards),
    getByNote:   (noteId: string)   => getByIndex<Flashcard>(STORES.flashcards, 'noteId', noteId),
    save:        (f: Flashcard)     => put(STORES.flashcards, f),
    saveAll:     (arr: Flashcard[]) => putMany(STORES.flashcards, arr),
    delete:      (id: string)       => remove(STORES.flashcards, id),
    deleteByNote:(noteId: string)   => getByIndex<Flashcard>(STORES.flashcards, 'noteId', noteId)
                                        .then(cards => Promise.all(cards.map(c => remove(STORES.flashcards, c.id))))
                                        .then(() => undefined),
  },

  // ── Utility: migrate from old localStorage data ────────────────────────────
  async migrateFromLocalStorage(): Promise<boolean> {
    try {
      const subjectsRaw   = localStorage.getItem('nc_subjects')
      const chaptersRaw   = localStorage.getItem('nc_chapters')
      const notesRaw      = localStorage.getItem('nc_notes')
      const flashcardsRaw = localStorage.getItem('nc_flashcards')

      if (!subjectsRaw && !notesRaw) return false  // nothing to migrate

      const alreadyMigrated = localStorage.getItem('nc_idb_migrated')
      if (alreadyMigrated) return false

      const subjects:   Subject[]   = subjectsRaw   ? JSON.parse(subjectsRaw)   : []
      const chapters:   Chapter[]   = chaptersRaw   ? JSON.parse(chaptersRaw)   : []
      const notes:      Note[]      = notesRaw      ? JSON.parse(notesRaw)      : []
      const flashcards: Flashcard[] = flashcardsRaw ? JSON.parse(flashcardsRaw) : []

      // Add images array to old notes that don't have it
      const fixedNotes = notes.map(n => ({ ...n, images: n.images || [] }))

      if (subjects.length)   await putMany(STORES.subjects, subjects)
      if (chapters.length)   await putMany(STORES.chapters, chapters)
      if (fixedNotes.length) await putMany(STORES.notes, fixedNotes)
      if (flashcards.length) await putMany(STORES.flashcards, flashcards)

      localStorage.setItem('nc_idb_migrated', 'true')
      console.log(`[NoteCraft] Migrated ${subjects.length} subjects, ${notes.length} notes to IndexedDB`)
      return true
    } catch (err) {
      console.error('[NoteCraft] Migration error:', err)
      return false
    }
  },

  // ── Full export (backup) ───────────────────────────────────────────────────
  async exportAll() {
    const [subjects, chapters, notes, flashcards] = await Promise.all([
      getAll<Subject>(STORES.subjects),
      getAll<Chapter>(STORES.chapters),
      getAll<Note>(STORES.notes),
      getAll<Flashcard>(STORES.flashcards),
    ])
    return { subjects, chapters, notes, flashcards, exportedAt: new Date().toISOString() }
  },

  // ── Full import (restore) ──────────────────────────────────────────────────
  async importAll(data: { subjects: Subject[]; chapters: Chapter[]; notes: Note[]; flashcards: Flashcard[] }) {
    await Promise.all([
      clearStore(STORES.subjects),
      clearStore(STORES.chapters),
      clearStore(STORES.notes),
      clearStore(STORES.flashcards),
    ])
    await Promise.all([
      putMany(STORES.subjects,   data.subjects),
      putMany(STORES.chapters,   data.chapters),
      putMany(STORES.notes,      data.notes.map(n => ({ ...n, images: n.images || [] }))),
      putMany(STORES.flashcards, data.flashcards),
    ])
  },
}
