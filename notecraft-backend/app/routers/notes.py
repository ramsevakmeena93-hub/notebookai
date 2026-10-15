from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from ..database import get_db
from ..models import Note, Subject, Chapter, Flashcard, Source
from ..schemas import NoteCreate, NoteUpdate, NoteOut, FlashcardOut, SearchResult
from ..auth import get_current_user
from ..models import User
from ..processing import process_text_to_blocks, extract_image_text, extract_pdf_text, extract_docx_text
import uuid

router = APIRouter(prefix="/api/notes", tags=["notes"])

def _check_subject(subject_id: str, user: User, db: Session) -> Subject:
    s = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == user.id).first()
    if not s:
        raise HTTPException(404, "Subject not found")
    return s

@router.get("", response_model=List[NoteOut])
def list_notes(
    subject_id: Optional[str] = None,
    chapter_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    q = db.query(Note).join(Subject).filter(Subject.user_id == user.id)
    if subject_id: q = q.filter(Note.subject_id == subject_id)
    if chapter_id: q = q.filter(Note.chapter_id == chapter_id)
    return q.order_by(Note.updated_at.desc()).all()

@router.post("", response_model=NoteOut, status_code=201)
def create_note(data: NoteCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    _check_subject(data.subject_id, user, db)
    note = Note(
        id=str(uuid.uuid4()),
        subject_id=data.subject_id,
        chapter_id=data.chapter_id,
        title=data.title,
        tags=data.tags,
        blocks=[b.model_dump() for b in data.blocks],
        source_text=data.source_text,
        paper_style=data.paper_style,
        handwriting_style=data.handwriting_style,
        ink_color=data.ink_color,
    )
    db.add(note); db.commit(); db.refresh(note)
    return note

@router.get("/{note_id}", response_model=NoteOut)
def get_note(note_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    note = db.query(Note).join(Subject).filter(Note.id == note_id, Subject.user_id == user.id).first()
    if not note: raise HTTPException(404, "Note not found")
    return note

@router.patch("/{note_id}", response_model=NoteOut)
def update_note(note_id: str, data: NoteUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    note = db.query(Note).join(Subject).filter(Note.id == note_id, Subject.user_id == user.id).first()
    if not note: raise HTTPException(404, "Note not found")
    update_data = data.model_dump(exclude_unset=True)
    if 'blocks' in update_data:
        update_data['blocks'] = [b.model_dump() if hasattr(b, 'model_dump') else b for b in update_data['blocks']]
    for k, v in update_data.items():
        setattr(note, k, v)
    db.commit(); db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=204)
def delete_note(note_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    note = db.query(Note).join(Subject).filter(Note.id == note_id, Subject.user_id == user.id).first()
    if not note: raise HTTPException(404, "Note not found")
    db.delete(note); db.commit()

@router.get("/{note_id}/flashcards", response_model=List[FlashcardOut])
def get_flashcards(note_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    note = db.query(Note).join(Subject).filter(Note.id == note_id, Subject.user_id == user.id).first()
    if not note: raise HTTPException(404, "Note not found")
    return db.query(Flashcard).filter(Flashcard.note_id == note_id).all()

@router.post("/{note_id}/flashcards/generate", response_model=List[FlashcardOut])
def generate_flashcards(note_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    note = db.query(Note).join(Subject).filter(Note.id == note_id, Subject.user_id == user.id).first()
    if not note: raise HTTPException(404, "Note not found")

    # Delete old generated cards
    db.query(Flashcard).filter(Flashcard.note_id == note_id).delete()

    cards = []
    for block in (note.blocks or []):
        btype = block.get('type', '')
        content = block.get('content', '').strip()
        if not content: continue

        if btype == 'definition':
            cards.append(Flashcard(id=str(uuid.uuid4()), note_id=note_id,
                question=f"Define: {block.get('label', note.title)}",
                answer=content, difficulty='medium'))
        elif btype == 'formula':
            cards.append(Flashcard(id=str(uuid.uuid4()), note_id=note_id,
                question=f"What is the formula/notation for: {note.title}?",
                answer=content, difficulty='hard'))
        elif btype == 'keypoint':
            cards.append(Flashcard(id=str(uuid.uuid4()), note_id=note_id,
                question=f"Key point from '{note.title}':",
                answer=content, difficulty='easy'))
        elif btype == 'question':
            lines = content.split('\n')
            cards.append(Flashcard(id=str(uuid.uuid4()), note_id=note_id,
                question=lines[0],
                answer='\n'.join(lines[1:]) or '(See notes)', difficulty='hard'))

    for c in cards: db.add(c)
    db.commit()
    return cards
