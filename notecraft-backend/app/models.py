from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

def gen_id():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id          = Column(String, primary_key=True, default=gen_id)
    email       = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    subjects    = relationship("Subject", back_populates="user", cascade="all, delete")

class Subject(Base):
    __tablename__ = "subjects"
    id          = Column(String, primary_key=True, default=gen_id)
    user_id     = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name        = Column(String, nullable=False)
    color       = Column(String, default="#3b82f6")
    icon        = Column(String, default="📚")
    description = Column(String, default="")
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    user        = relationship("User", back_populates="subjects")
    chapters    = relationship("Chapter", back_populates="subject", cascade="all, delete")

class Chapter(Base):
    __tablename__ = "chapters"
    id          = Column(String, primary_key=True, default=gen_id)
    subject_id  = Column(String, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    title       = Column(String, nullable=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    subject     = relationship("Subject", back_populates="chapters")
    notes       = relationship("Note", back_populates="chapter", cascade="all, delete")

class Note(Base):
    __tablename__ = "notes"
    id               = Column(String, primary_key=True, default=gen_id)
    subject_id       = Column(String, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    chapter_id       = Column(String, ForeignKey("chapters.id", ondelete="SET NULL"), nullable=True)
    title            = Column(String, nullable=False)
    tags             = Column(JSON, default=list)
    blocks           = Column(JSON, default=list)
    source_text      = Column(Text, default="")
    paper_style      = Column(String, default="ruled")
    handwriting_style = Column(String, default="kalam")
    ink_color        = Column(String, default="#1e3a5f")
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    chapter          = relationship("Chapter", back_populates="notes")
    flashcards       = relationship("Flashcard", back_populates="note", cascade="all, delete")

class Flashcard(Base):
    __tablename__ = "flashcards"
    id         = Column(String, primary_key=True, default=gen_id)
    note_id    = Column(String, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False)
    question   = Column(Text, nullable=False)
    answer     = Column(Text, nullable=False)
    difficulty = Column(String, default="medium")
    next_review = Column(DateTime(timezone=True), nullable=True)
    note       = relationship("Note", back_populates="flashcards")

class Source(Base):
    __tablename__ = "sources"
    id          = Column(String, primary_key=True, default=gen_id)
    note_id     = Column(String, ForeignKey("notes.id", ondelete="CASCADE"), nullable=True)
    source_type = Column(String)  # text | image | pdf | docx
    raw_content = Column(Text)
    file_name   = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
