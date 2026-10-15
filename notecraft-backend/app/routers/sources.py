from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user
from ..models import User
from ..processing import process_text_to_blocks, extract_image_text, extract_pdf_text, extract_docx_text
from ..schemas import TextCaptureIn
from pydantic import BaseModel
from typing import List, Any

router = APIRouter(prefix="/api/sources", tags=["sources"])

class ProcessedContent(BaseModel):
    raw_text: str
    blocks: List[Any]
    source_type: str
    file_name: str = ""

@router.post("/text", response_model=ProcessedContent)
def capture_text(data: TextCaptureIn, user: User = Depends(get_current_user)):
    blocks = process_text_to_blocks(data.content)
    return ProcessedContent(raw_text=data.content, blocks=blocks, source_type="text")

@router.post("/image", response_model=ProcessedContent)
async def capture_image(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user)
):
    content = await file.read()
    text = extract_image_text(content)
    blocks = process_text_to_blocks(text)
    return ProcessedContent(raw_text=text, blocks=blocks, source_type="image", file_name=file.filename or "")

@router.post("/document", response_model=ProcessedContent)
async def capture_document(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user)
):
    content = await file.read()
    fname = file.filename or ""
    if fname.endswith(".pdf"):
        text = extract_pdf_text(content)
        stype = "pdf"
    elif fname.endswith(".docx"):
        text = extract_docx_text(content)
        stype = "docx"
    else:
        text = content.decode("utf-8", errors="replace")
        stype = "text"
    blocks = process_text_to_blocks(text)
    return ProcessedContent(raw_text=text, blocks=blocks, source_type=stype, file_name=fname)
