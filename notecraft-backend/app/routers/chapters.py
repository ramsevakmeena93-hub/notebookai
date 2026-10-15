from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Chapter, Subject, Note
from ..schemas import ChapterCreate, ChapterOut
from ..auth import get_current_user
from ..models import User
import uuid

router = APIRouter(prefix="/api/chapters", tags=["chapters"])

@router.get("", response_model=List[ChapterOut])
def list_chapters(subject_id: str = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Chapter).join(Subject).filter(Subject.user_id == user.id)
    if subject_id:
        q = q.filter(Chapter.subject_id == subject_id)
    chapters = q.all()
    result = []
    for c in chapters:
        count = db.query(Note).filter(Note.chapter_id == c.id).count()
        out = ChapterOut.model_validate(c)
        out.note_count = count
        result.append(out)
    return result

@router.post("", response_model=ChapterOut, status_code=201)
def create_chapter(data: ChapterCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    # Verify subject belongs to user
    s = db.query(Subject).filter(Subject.id == data.subject_id, Subject.user_id == user.id).first()
    if not s:
        raise HTTPException(404, "Subject not found")
    c = Chapter(id=str(uuid.uuid4()), **data.model_dump())
    db.add(c); db.commit(); db.refresh(c)
    out = ChapterOut.model_validate(c)
    out.note_count = 0
    return out

@router.delete("/{chapter_id}", status_code=204)
def delete_chapter(chapter_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    c = db.query(Chapter).join(Subject).filter(Chapter.id == chapter_id, Subject.user_id == user.id).first()
    if not c:
        raise HTTPException(404, "Chapter not found")
    db.delete(c); db.commit()
