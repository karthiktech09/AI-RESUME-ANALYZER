# 📤 Upload ResumeAI to GitHub - Complete Guide

## Prerequisites
- Git installed on your computer: https://git-scm.com/download/win
- GitHub account: https://github.com/signup

---

## 🔧 Step 1: Configure Git (One-time setup)

Open **PowerShell** and run:

```powershell
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
```

Replace:
- `your-email@example.com` with your actual email
- `Your Name` with your name

---

## 📁 Step 2: Initialize Local Repository

Open **PowerShell** and navigate to the project:

```powershell
cd "c:\Users\N KARTHIK\OneDrive\Desktop\resume analyzer"
```

Initialize git and commit files:

```powershell
git init
git add .
git commit -m "Initial commit: ResumeAI - AI Resume Screening Tool"
```

You should see output like:
```
[main (root-commit) xxxxx] Initial commit: ResumeAI - AI Resume Screening Tool
 7 files changed, 1000 insertions(+)
 create mode 100644 README.md
 create mode 100644 app.py
 create mode 100644 index.html
 create mode 100644 script.js
 create mode 100644 styles.css
 create mode 100644 requirements.txt
```

---

## 🌐 Step 3: Create GitHub Repository

1. Go to https://github.com/new
2. Fill in details:
   - **Repository name:** `resume-analyzer`
   - **Description:** `AI-powered resume screening tool`
   - **Public** or **Private** (your choice)
   - ✅ Do NOT initialize with README (we already have one)
3. Click **Create repository**

---

## 🚀 Step 4: Push to GitHub

Copy the commands from GitHub and run in PowerShell:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/resume-analyzer.git
git push -u origin main
```

⚠️ **Replace `YOUR-USERNAME` with your actual GitHub username**

Example: `https://github.com/john-smith/resume-analyzer.git`

---

## ✅ Verify Upload

Go to your GitHub repository and you should see:
- ✅ All files uploaded (README.md, app.py, index.html, styles.css, script.js, requirements.txt)
- ✅ Commit history with your message
- ✅ Green checkmarks indicating successful upload

---

## 📝 Future Updates

After the initial upload, to push future changes:

```powershell
cd "c:\Users\N KARTHIK\OneDrive\Desktop\resume analyzer"
git add .
git commit -m "Your update message here"
git push
```

---

## 🔗 Useful Links
- Your repo will be at: `https://github.com/YOUR-USERNAME/resume-analyzer`
- GitHub Docs: https://docs.github.com/en/get-started
- Git Cheat Sheet: https://git-scm.com/docs
