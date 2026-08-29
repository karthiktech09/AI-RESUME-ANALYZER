import io
import re
from pathlib import Path
from typing import List, Set

from docx import Document
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pypdf import PdfReader

BASE_DIR = Path(__file__).resolve().parent

app = FastAPI(title="ResumeAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SKILLS = {
    "python",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "linux",
    "bash",
    "javascript",
    "typescript",
    "node",
    "react",
    "java",
    "c#",
    "c++",
    "go",
    "rust",
    "api",
    "rest",
    "graphql",
    "fastapi",
    "flask",
    "django",
    "spring",
    "html",
    "css",
    "git",
    "ci/cd",
    "pytest",
    "testing",
    "agile",
    "machine learning",
    "ml",
    "ai",
    "data analysis",
    "etl",
    "spark",
    "pandas",
    "numpy",
    "tableau",
    "excel",
    "power bi",
    "communication",
    "leadership",
    "project management",
    "product management",
    "cloud",
    "devops",
    "terraform",
    "airflow",
    "mongodb",
    "redis",
}

STOP_WORDS = {
    "the",
    "a",
    "an",
    "and",
    "or",
    "for",
    "with",
    "from",
    "into",
    "about",
    "that",
    "this",
    "their",
    "them",
    "your",
    "our",
    "you",
    "we",
    "are",
    "was",
    "been",
    "will",
    "have",
    "has",
    "had",
    "as",
    "at",
    "on",
    "in",
    "to",
    "of",
    "is",
    "it",
    "be",
    "by",
    "if",
    "not",
    "but",
    "can",
    "could",
    "should",
    "would",
    "through",
    "over",
    "under",
    "after",
    "before",
    "during",
    "using",
    "experience",
    "skills",
    "resume",
    "candidate",
    "role",
    "team",
    "job",
}


def normalize(value: str) -> str:
    return re.sub(r"[^a-z0-9+/\s-]", " ", (value or "").lower())


def normalize_tokens(value: str) -> List[str]:
    text = normalize(value)
    return [token for token in re.split(r"\s+", text.strip()) if token and token not in STOP_WORDS]


def extract_resume_text(file_bytes: bytes, filename: str) -> str:
    lower_name = (filename or "").lower()

    if lower_name.endswith(".pdf"):
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            pages = []
            for page in reader.pages:
                text = page.extract_text() or ""
                pages.append(text)
            return "\n".join(pages)
        except Exception:
            raise ValueError("Unable to read PDF")

    if lower_name.endswith(".docx"):
        try:
            document = Document(io.BytesIO(file_bytes))
            return "\n".join(paragraph.text for paragraph in document.paragraphs)
        except Exception:
            raise ValueError("Unable to read DOCX")

    if lower_name.endswith(".txt"):
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            return file_bytes.decode("latin-1", errors="ignore")

    raise ValueError("Unsupported file type")


def extract_skill_matches(text: str, required_skills: List[str]) -> List[str]:
    search_text = normalize(text)
    matches: List[str] = []

    for skill in sorted(SKILLS.union(set(required_skills)), key=len, reverse=True):
        if skill in search_text:
            matches.append(skill)

    return matches


def extract_job_keywords(job_text: str) -> List[str]:
    tokens = normalize_tokens(job_text)
    tokens = [token for token in tokens if len(token) > 2 and token not in STOP_WORDS]

    scored: Set[str] = set()
    for token in tokens:
        if token in SKILLS:
            scored.add(token)
        elif token.endswith("s") and token[:-1] in SKILLS:
            scored.add(token[:-1])

    return sorted(scored)


def compute_similarity_score(resume_text: str, job_text: str) -> float:
    resume_tokens = set(normalize_tokens(resume_text))
    job_tokens = set(normalize_tokens(job_text))

    if not resume_tokens or not job_tokens:
        return 0.0

    overlap = resume_tokens & job_tokens
    similarity = len(overlap) / max(len(job_tokens), 1)
    return round(min(100.0, max(0.0, similarity * 100)), 2)


def format_skill_name(skill: str) -> str:
    return skill.replace("-", " ").strip().title()


@app.get("/")
def index():
    return FileResponse(BASE_DIR / "index.html")


app.mount("/static", StaticFiles(directory=str(BASE_DIR)), name="static")


@app.post("/api/screen")
async def screen_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    required_skills: List[str] = Form(default=[]),
):
    if not resume:
        raise HTTPException(status_code=400, detail="Resume file is required")

    if not job_description or not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required")

    try:
        file_bytes = await resume.read()
        resume_text = extract_resume_text(file_bytes, resume.filename or "")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    clean_required_skills = [
        item.strip()
        for item in required_skills
        if isinstance(item, str) and item.strip()
    ]
    skill_list = [normalize(skill) for skill in clean_required_skills]

    resume_norm = normalize(resume_text)
    job_norm = normalize(job_description)

    similarity_score = compute_similarity_score(resume_text, job_description)
    job_keywords = extract_job_keywords(job_description)
    matched_keywords = [keyword for keyword in job_keywords if keyword in resume_norm]
    missing_keywords = [keyword for keyword in job_keywords if keyword not in resume_norm]

    all_resume_skills = extract_skill_matches(resume_text, clean_required_skills)
    required_skill_matches = [
        normalize(skill)
        for skill in clean_required_skills
        if normalize(skill) in resume_norm
    ]

    if clean_required_skills:
        required_skill_score = round((len(required_skill_matches) / len(clean_required_skills)) * 100)
    else:
        required_skill_score = round(min(100.0, max(0.0, similarity_score)))

    preferred_skill_score = 0.0
    if job_keywords:
        preferred_skill_score = round((len(matched_keywords) / len(job_keywords)) * 100)

    matched_skills = [format_skill_name(skill) for skill in required_skill_matches]
    if not matched_skills:
        matched_skills = [
            format_skill_name(skill)
            for skill in all_resume_skills
            if skill in job_keywords or skill in [normalize(item) for item in clean_required_skills]
        ]

    missing_skills = [format_skill_name(skill) for skill in clean_required_skills if normalize(skill) not in resume_norm]
    if not missing_skills:
        missing_skills = [
            format_skill_name(skill)
            for skill in job_keywords
            if skill not in resume_norm and skill not in matched_skills
        ]

    if not matched_skills:
        matched_skills = [
            format_skill_name(skill)
            for skill in job_keywords[:3]
            if skill in resume_norm
        ]

    overall_score = round(
        (similarity_score * 0.45)
        + (required_skill_score * 0.35)
        + (preferred_skill_score * 0.20)
    )

    if overall_score >= 80:
        match_label = "Strong Match"
    elif overall_score >= 60:
        match_label = "Good Match"
    elif overall_score >= 40:
        match_label = "Partial Match"
    else:
        match_label = "Low Match"

    recommendation = (
        "This candidate is a strong fit for the role and would benefit from a brief skill-upskilling plan."
        if overall_score >= 80
        else "This candidate has a promising profile and could be a strong fit with a few targeted skill gaps addressed."
        if overall_score >= 60
        else "This candidate shows potential and could be a good fit with a focused skills development plan."
        if overall_score >= 40
        else "This candidate shows opportunity for growth and may benefit from additional training in the most important role requirements."
    )

    if not matched_skills and not missing_skills:
        matched_skills = [
            format_skill_name(skill)
            for skill in job_keywords[:3]
            if skill in resume_norm
        ]
        missing_skills = [
            format_skill_name(skill)
            for skill in job_keywords[:3]
            if skill not in resume_norm
        ]

    payload = {
        "overall_score": int(overall_score),
        "similarity_score": round(similarity_score, 2),
        "required_skill_score": int(required_skill_score),
        "preferred_skill_score": int(preferred_skill_score),
        "matched_skills": matched_skills[:10],
        "missing_skills": missing_skills[:10],
        "matched_keywords": [keyword.title() for keyword in matched_keywords[:10]],
        "missing_keywords": [keyword.title() for keyword in missing_keywords[:10]],
        "recommendation": recommendation,
        "match_label": match_label,
    }

    return payload


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
