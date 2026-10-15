from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import auth, subjects, chapters, notes, sources, search

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NoteCraft AI API",
    description="Personal AI Study Notebook Backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(subjects.router)
app.include_router(chapters.router)
app.include_router(notes.router)
app.include_router(sources.router)
app.include_router(search.router)

@app.get("/")
def root():
    return {"message": "NoteCraft AI API", "version": "1.0.0", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "ok"}
