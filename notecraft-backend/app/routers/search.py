from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..auth import get_current_user
from ..models import User, Note, Subject, Chapter
from ..schemas import SearchResult

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("", response_model=List[SearchResult])
def search_notes(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    q_lower = q.lower()
    notes = db.query(Note).join(Subject).filter(Subject.user_id == user.id).all()
    results = []

    for note in notes:
        # Search across title, tags, blocks content, source text
        searchable = [
            note.title,
            ' '.join(note.tags or []),
            note.source_text or '',
            ' '.join(b.get('content', '') for b in (note.blocks or [])),
        ]
        combined = ' '.join(searchable).lower()

        if q_lower in combined:
            # Find best snippet
            snippet = ''
            for block in (note.blocks or []):
                content = block.get('content', '')
                if q_lower in content.lower():
                    idx = content.lower().find(q_lower)
                    start = max(0, idx - 40)
                    end = min(len(content), idx + len(q) + 60)
                    snippet = ('...' if start > 0 else '') + content[start:end] + ('...' if end < len(content) else '')
                    break
            if not snippet:
                snippet = note.title

            subject = db.query(Subject).filter(Subject.id == note.subject_id).first()
            chapter = db.query(Chapter).filter(Chapter.id == note.chapter_id).first() if note.chapter_id else None

            results.append(SearchResult(
                note_id=note.id,
                note_title=note.title,
                subject_name=subject.name if subject else '',
                chapter_title=chapter.title if chapter else None,
                snippet=snippet,
            ))

    return results[:20]  # cap at 20
