"""
Text processing pipeline — no external AI API needed.
Heuristic-based extraction: headings, formulas, key points, examples, definitions.
"""
import re
from typing import List
import uuid


def _uid() -> str:
    return str(uuid.uuid4())[:8]


MATH_CHARS = ['→', '←', '⟹', '⟺', '∀', '∃', '∈', '⊆', '∩', '∪',
               '≡', '≠', '≤', '≥', '∑', '∏', '√', '∫', '∂', '∇']

def is_heading(line: str) -> bool:
    if not (3 <= len(line) <= 80): return False
    if re.match(r'^#{1,4}\s', line): return True
    if line == line.upper() and re.search(r'[A-Z]', line): return True
    if line.endswith(':') and len(line.split()) <= 7: return True
    if re.match(r'^\d+\.\s+[A-Z]', line) and len(line.split()) <= 8: return True
    return False

def is_formula(line: str) -> bool:
    if any(c in line for c in MATH_CHARS): return True
    if re.search(r'[A-Z]\s*[→←⇒⇔]\s*[A-Z]', line): return True
    if re.search(r'\$.*?\$', line): return True
    return False

def is_keypoint(line: str) -> bool:
    return bool(re.match(r'^[*\-•★]\s+', line) or
                re.match(r'^(Note|Important|Remember|Warning|Tip|Key|Trick):', line, re.I))

def is_example(line: str) -> bool:
    return bool(re.match(r'^(Example|Ex\.|For example|E\.g\.|Sample|Illustration)', line, re.I))


def process_text_to_blocks(text: str) -> List[dict]:
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    blocks = []
    i = 0

    while i < len(lines):
        line = lines[i]

        if is_heading(line):
            blocks.append({"id": _uid(), "type": "heading", "content": line.rstrip(':')})
            i += 1; continue

        if is_formula(line):
            blocks.append({"id": _uid(), "type": "formula", "content": line})
            i += 1; continue

        if is_keypoint(line):
            content = re.sub(r'^[*\-•★]\s*', '', line)
            blocks.append({"id": _uid(), "type": "keypoint", "content": content})
            i += 1; continue

        if is_example(line):
            content_lines = [line]
            while i + 1 < len(lines) and not is_heading(lines[i + 1]):
                i += 1
                content_lines.append(lines[i])
                if len(content_lines) > 8: break
            blocks.append({"id": _uid(), "type": "example", "content": '\n'.join(content_lines), "label": "Example"})
            i += 1; continue

        if line.endswith('?'):
            blocks.append({"id": _uid(), "type": "question", "content": line})
            i += 1; continue

        # Definition heuristic: contains "is", "means", "defined as" etc.
        is_def = bool(re.search(r'\b(is|are|means|denotes|defined as|refers to|represents)\b', line, re.I))
        if is_def and len(blocks) <= 3 and len(line) > 30:
            blocks.append({"id": _uid(), "type": "definition", "content": line, "label": "Definition"})
        else:
            blocks.append({"id": _uid(), "type": "explanation", "content": line})

        i += 1

    return blocks


def extract_pdf_text(file_bytes: bytes) -> str:
    """Extract text from PDF using PyMuPDF."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        pages = []
        for page in doc:
            pages.append(page.get_text())
        return '\n\n'.join(pages)
    except Exception as e:
        return f"[PDF extraction error: {e}]"


def extract_image_text(file_bytes: bytes) -> str:
    """Extract text from image using Tesseract OCR."""
    try:
        from PIL import Image
        import pytesseract
        import io
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        return f"[OCR error: {e}. Make sure Tesseract is installed on your system.]"


def extract_docx_text(file_bytes: bytes) -> str:
    """Extract text from DOCX using python-docx."""
    try:
        from docx import Document
        import io
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return '\n'.join(paragraphs)
    except Exception as e:
        return f"[DOCX extraction error: {e}]"
