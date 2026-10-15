from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any
from datetime import datetime

# ── Auth ──────────────────────────────────────────────
class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: str
    email: str
    created_at: datetime
    class Config: from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ── Subjects ─────────────────────────────────────────
class SubjectCreate(BaseModel):
    name: str
    color: str = "#3b82f6"
    icon: str = "📚"
    description: str = ""

class SubjectOut(BaseModel):
    id: str
    name: str
    color: str
    icon: str
    description: str
    created_at: datetime
    note_count: int = 0
    class Config: from_attributes = True

# ── Chapters ─────────────────────────────────────────
class ChapterCreate(BaseModel):
    subject_id: str
    title: str

class ChapterOut(BaseModel):
    id: str
    subject_id: str
    title: str
    created_at: datetime
    note_count: int = 0
    class Config: from_attributes = True

# ── Notes ─────────────────────────────────────────────
class NoteBlock(BaseModel):
    id: str
    type: str
    content: str
    label: Optional[str] = None

class NoteCreate(BaseModel):
    subject_id: str
    chapter_id: Optional[str] = None
    title: str
    tags: List[str] = []
    blocks: List[NoteBlock] = []
    source_text: str = ""
    paper_style: str = "ruled"
    handwriting_style: str = "kalam"
    ink_color: str = "#1e3a5f"

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    chapter_id: Optional[str] = None
    tags: Optional[List[str]] = None
    blocks: Optional[List[NoteBlock]] = None
    source_text: Optional[str] = None
    paper_style: Optional[str] = None
    handwriting_style: Optional[str] = None
    ink_color: Optional[str] = None

class NoteOut(BaseModel):
    id: str
    subject_id: str
    chapter_id: Optional[str]
    title: str
    tags: List[str]
    blocks: List[Any]
    source_text: str
    paper_style: str
    handwriting_style: str
    ink_color: str
    created_at: datetime
    updated_at: datetime
    class Config: from_attributes = True

# ── Flashcards ────────────────────────────────────────
class FlashcardOut(BaseModel):
    id: str
    note_id: str
    question: str
    answer: str
    difficulty: str
    class Config: from_attributes = True

# ── Search ────────────────────────────────────────────
class SearchResult(BaseModel):
    note_id: str
    note_title: str
    subject_name: str
    chapter_title: Optional[str]
    snippet: str

# ── Source / Capture ──────────────────────────────────
class TextCaptureIn(BaseModel):
    content: str
    suggested_subject_id: Optional[str] = None
    suggested_chapter_id: Optional[str] = None
