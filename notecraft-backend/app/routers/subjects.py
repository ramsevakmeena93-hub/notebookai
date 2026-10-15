from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Subject, Note
from ..schemas import SubjectCreate, SubjectOut
from ..auth import get_current_user
from ..models import User
import uuid

router = APIRouter(prefix="/api/subjects", tags=["subjects"])

@router.get("", response_model=List[SubjectOut])
def list_subjects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    subjects = db.query(Subject).filter(Subject.user_id == user.id).all()
    result = []
    for s in subjects:
        count = db.query(Note).filter(Note.subject_id == s.id).count()
        out = SubjectOut.model_validate(s)
        out.note_count = count
        result.append(out)
    return result

@router.post("", response_model=SubjectOut, status_code=201)
def create_subject(data: SubjectCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = Subject(id=str(uuid.uuid4()), user_id=user.id, **data.model_dump())
    db.add(s); db.commit(); db.refresh(s)
    out = SubjectOut.model_validate(s)
    out.note_count = 0
    return out

@router.delete("/{subject_id}", status_code=204)
def delete_subject(subject_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    s = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == user.id).first()
    if not s:
        raise HTTPException(404, "Subject not found")
    db.delete(s); db.commit()
