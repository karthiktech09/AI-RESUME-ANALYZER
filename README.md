# ResumeAI

AI-powered resume screening tool. Upload a resume and compare it to a job description in seconds.

## Features
- 📄 Supports PDF, DOCX, and TXT resumes
- 🎯 Extracts skills and keywords automatically
- 📊 Provides detailed match scoring
- ⚡ Fast, client-side and server-side processing

## Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** FastAPI (Python)
- **Libraries:** pypdf, python-docx, uvicorn

## Quick Start

### Prerequisites
- Python 3.8+
- pip

### Installation
```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/resume-analyzer.git
cd resume-analyzer

# Install dependencies
pip install -r requirements.txt

# Run the app
python -m uvicorn app:app --host 0.0.0.0 --port 8000
```

Open http://localhost:8000 in your browser.

## Usage
1. Upload a resume (PDF, DOCX, or TXT)
2. Paste the job description
3. Add required skills (optional)
4. Click "Analyze"
5. View the match score and insights

## Project Structure
```
resume-analyzer/
├── index.html        # Frontend UI
├── styles.css        # Styling
├── script.js         # Frontend logic
├── app.py           # FastAPI backend
├── requirements.txt # Python dependencies
└── README.md        # This file
```

## API Endpoint

**POST /api/screen**
- Accepts multipart form data with resume file and job description
- Returns JSON with scoring and keyword analysis

## License
MIT
