export interface Subject {
  id: string
  name: string
  color: string
  icon: string
  description: string
  noteCount: number
  createdAt: string
}

export interface Chapter {
  id: string
  subjectId: string
  title: string
  noteCount: number
  createdAt: string
}

export interface NoteBlock {
  id: string
  type: 'heading' | 'definition' | 'explanation' | 'formula' | 'example' | 'keypoint' | 'margin' | 'diagram' | 'code' | 'question'
  content: string
  label?: string
}

export interface NoteImage {
  id: string
  dataUrl: string      // base64 stored in localStorage
  caption: string
  createdAt: string
}

export interface Note {
  id: string
  subjectId: string
  chapterId: string
  title: string
  tags: string[]
  blocks: NoteBlock[]
  images: NoteImage[]  // attached screenshots
  sourceText?: string
  paperStyle: 'ruled' | 'dotted' | 'graph' | 'plain'
  handwritingStyle: 'kalam' | 'caveat'
  inkColor: string
  createdAt: string
  updatedAt: string
}

export interface Flashcard {
  id: string
  noteId: string
  question: string
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
  nextReview?: string
}

export interface SearchResult {
  noteId: string
  noteTitle: string
  subjectName: string
  chapterTitle: string
  snippet: string
}
