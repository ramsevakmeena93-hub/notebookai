# NoteCraft AI 📚✍️
### Your Personal AI Study Notebook

> Capture knowledge. Create notes. Master every subject.
> **100% Frontend — No backend, no server, no database setup needed.**

---

## 🚀 Quick Start

```bash
cd notecraft-frontend
npm install
npm run dev
```

Open → **http://localhost:5174**

That's it. Everything runs in your browser.

---

## 🧠 How It Works

| What you do | What happens |
|---|---|
| Paste ChatGPT answer | Auto-detected as Headings, Definitions, Formulas, Examples, Key Points |
| Upload screenshot | Attached to note, shown in notebook view |
| Create a note | Saved to **IndexedDB** (browser database, permanent) |
| Export Backup | Downloads a `.json` file with all your data |

---

## ✨ Features

- **Smart Capture** — Paste any text (ChatGPT, textbook, lecture notes). LaTeX like `\rightarrow` auto-converts to `→`
- **Structured Blocks** — Heading, Definition, Formula, Example, Key Point, Margin Tip, Code, Question
- **Handwritten Notebook View** — Realistic pages using Kalam / Caveat fonts
- **Paper Styles** — Ruled, Dotted, Graph, Plain
- **Screenshot Attachments** — Drag & drop or Ctrl+V screenshots directly into notes
- **Flashcards** — Auto-generated from your Definitions, Formulas, Key Points
- **Full-text Search** — Search across all notes, subjects, tags
- **PDF Export** — Print any note as PDF
- **IndexedDB Database** — All data stored permanently in your browser
- **Export / Import** — Backup your entire notebook as JSON
- **Subjects & Chapters** — Organize notes into DBMS, DSA, OS, COA, etc.
- **Mobile App Page** — APK download page built-in

---

## 🗂️ Project Structure

```
notecraft-frontend/
├── public/
│   └── logo.png              ← App logo
├── src/
│   ├── App.tsx               ← Root, routing, state
│   ├── db.ts                 ← IndexedDB database (all CRUD)
│   ├── store.ts              ← Seed data for first launch
│   ├── types.ts              ← TypeScript interfaces
│   ├── utils.ts              ← Smart text analyser + LaTeX cleaner
│   └── components/
│       ├── Sidebar.tsx       ← Navigation sidebar
│       ├── Dashboard.tsx     ← Home page with subjects & notes
│       ├── NoteEditor.tsx    ← Block-based note editor
│       ├── NotebookView.tsx  ← Handwritten notebook renderer
│       ├── CaptureModal.tsx  ← Smart capture (paste/link/screenshot)
│       ├── FlashcardsView.tsx← Flashcard study mode
│       ├── SearchView.tsx    ← Full-text search
│       ├── LoadingScreen.tsx ← Animated splash screen
│       └── MobileAppPage.tsx ← APK download page
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Fonts | Google Fonts: Kalam, Caveat |
| Database | IndexedDB (browser-native, no setup) |
| Icons | Lucide React |
| Toasts | React Hot Toast |

---

## 📦 Install & Run

```bash
# Clone
git clone https://github.com/ramsevakmeena93-hub/notebookai.git
cd notebookai/notecraft-frontend

# Install
npm install

# Run
npm run dev
```

Open → **http://localhost:5174**

---

## 💾 Data Storage

All your notes are stored in **IndexedDB** — your browser's built-in database.

- ✅ Works completely offline
- ✅ No account or login needed
- ✅ Data survives browser restarts
- ✅ Use **Export Backup** in sidebar to save a `.json` backup anytime

---

*Made for students — Study smarter, not harder* 🎯
