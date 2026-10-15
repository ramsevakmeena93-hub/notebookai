# NoteCraft AI 📚✍️
### Your Personal AI Study Notebook

> Capture knowledge. Create notes. Master every subject.

---

## Quick Start (Frontend only — fully works without backend)

```bash
cd notecraft-frontend
npm install
npm run dev
```
Open → **http://localhost:3000**

The frontend uses localStorage, so everything works offline without any backend or database.

---

## Full Stack Setup

### Frontend
```bash
cd notecraft-frontend
npm install
npm run dev         # http://localhost:3000
```

### Backend (optional — for multi-device sync)
```bash
cd notecraft-backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
cp .env.example .env         # Edit DATABASE_URL
uvicorn app.main:app --reload --port 8000
```
API docs → **http://localhost:8000/docs**

### Database
Requires PostgreSQL. Create a database named `notecraft`.
Tables are auto-created on first backend startup.

---

## Features

### ✅ Phase 1 (Built)
- **Dashboard** — Subject sidebar, stats, recent notes, search
- **Subject & Chapter management** — Create, organize, delete
- **Note Editor** — Structured blocks: Heading, Definition, Formula, Example, Key Point, Margin Tip, Code, Question
- **Quick Capture** — Paste ChatGPT answers → auto-converted to structured blocks
- **Notebook View** — Realistic handwritten-style pages (Kalam / Caveat fonts)
- **Paper styles** — Ruled, Dotted, Graph, Plain
- **Ink colors** — Navy, Black, Blue, Red, Green, Purple
- **PDF Export** — Browser print dialog
- **Flashcards** — Auto-generated from note blocks, flip UI, score tracking
- **Full-text Search** — Search across all notes, subjects, tags
- **localStorage persistence** — Works 100% offline

### 🔜 Phase 2+ (Roadmap)
- Screenshot OCR (backend: Tesseract)
- PDF / DOCX import (backend: PyMuPDF, python-docx)
- Spaced repetition revision scheduler
- Knowledge graph across subjects
- PyTorch model for subject auto-classification

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Fonts | Google Fonts: Kalam, Caveat |
| Backend | Python FastAPI |
| Database | PostgreSQL + SQLAlchemy |
| OCR | Tesseract (pytesseract) |
| PDF | PyMuPDF |
| Auth | JWT (python-jose) |

---

## Project Structure

```
NOTES MAKER/
├── notecraft-frontend/      # React app
│   └── src/
│       ├── App.tsx           # Root, state management
│       ├── store.ts          # localStorage persistence
│       ├── utils.ts          # Text-to-blocks processing
│       └── components/
│           ├── Sidebar.tsx
│           ├── Dashboard.tsx
│           ├── NoteEditor.tsx
│           ├── NotebookView.tsx
│           ├── CaptureModal.tsx
│           ├── FlashcardsView.tsx
│           └── SearchView.tsx
├── notecraft-backend/       # FastAPI app
│   └── app/
│       ├── main.py
│       ├── models.py         # SQLAlchemy ORM
│       ├── schemas.py        # Pydantic models
│       ├── processing.py     # Text/OCR/PDF pipeline
│       └── routers/
│           ├── auth.py
│           ├── subjects.py
│           ├── chapters.py
│           ├── notes.py
│           ├── sources.py
│           └── search.py
├── start-frontend.bat
├── start-backend.bat
└── README.md
```
