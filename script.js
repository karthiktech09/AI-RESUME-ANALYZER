const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

const uploadInput = document.getElementById('resumeInput');
const uploadDropzone = document.getElementById('uploadDropzone');
const uploadError = document.getElementById('uploadError');
const fileMeta = document.getElementById('fileMeta');
const jobDescription = document.getElementById('jobDescription');
const charCount = document.getElementById('charCount');
const jobError = document.getElementById('jobError');
const skillInput = document.getElementById('skillInput');
const addSkillBtn = document.getElementById('addSkillBtn');
const skillsList = document.getElementById('skillsList');
const analyzeBtn = document.getElementById('analyzeBtn');
const loadingState = document.getElementById('loadingState');
const analysisNotice = document.getElementById('analysisNotice');
const screenForm = document.getElementById('screen-form');

const resultsSection = document.getElementById('results');
const overallScore = document.getElementById('overallScore');
const scoreLabel = document.getElementById('scoreLabel');
const scoreInterpretation = document.getElementById('scoreInterpretation');
const scoreProgress = document.querySelector('.score-progress');
const strengthsList = document.getElementById('strengthsList');
const gapsList = document.getElementById('gapsList');
const similarityBar = document.getElementById('similarityBar');
const requiredBar = document.getElementById('requiredBar');
const preferredBar = document.getElementById('preferredBar');
const similarityValue = document.getElementById('similarityValue');
const requiredValue = document.getElementById('requiredValue');
const preferredValue = document.getElementById('preferredValue');
const matchedKeywordsList = document.getElementById('matchedKeywordsList');
const missingKeywordsList = document.getElementById('missingKeywordsList');
const recommendationText = document.getElementById('recommendationText');
const analysisDetailsContent = document.getElementById('analysisDetailsContent');
const analyzeAnotherBtn = document.getElementById('analyzeAnotherBtn');

const state = {
  selectedFile: null,
  requiredSkills: [],
};

function prettySize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function setErrorMessage(element, message) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('hidden');
}

function clearErrorMessage(element) {
  if (!element) return;
  element.textContent = '';
  element.classList.add('hidden');
}

function renderDefaultUploadState() {
  uploadDropzone.innerHTML = `
    <div class="upload-contents">
      <div class="upload-icon" aria-hidden="true">↓</div>
      <p class="upload-prompt">Upload Resume</p>
      <p class="upload-meta">PDF, DOCX, or TXT up to 5 MB</p>
    </div>
  `;
  uploadDropzone.classList.remove('is-filled');
  uploadDropzone.classList.remove('is-scanning');
}

function renderSelectedUploadState(file) {
  uploadDropzone.innerHTML = `
    <div class="upload-contents">
      <div class="upload-icon" aria-hidden="true">✓</div>
      <p class="upload-prompt">Resume ready ✓</p>
      <p class="upload-meta">${file.name} · ${prettySize(file.size)} · Change file</p>
    </div>
  `;
  uploadDropzone.classList.add('is-filled');
}

function updateCharCount() {
  const count = jobDescription.value.length;
  charCount.textContent = String(count);
}

function updateAnalyzeState() {
  const hasResume = Boolean(state.selectedFile);
  const hasDescription = jobDescription.value.trim().length > 0;
  analyzeBtn.disabled = !(hasResume && hasDescription);
}

function renderSkillTags() {
  skillsList.innerHTML = '';

  state.requiredSkills.forEach((skill) => {
    const tag = document.createElement('span');
    tag.className = 'skill-tag';
    tag.setAttribute('data-skill', skill);

    const label = document.createElement('span');
    label.textContent = skill;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.setAttribute('aria-label', `Remove skill ${skill}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => {
      state.requiredSkills = state.requiredSkills.filter((item) => item !== skill);
      renderSkillTags();
      updateAnalyzeState();
    });

    tag.append(label, removeBtn);
    skillsList.appendChild(tag);
  });
}

function addSkill() {
  const value = skillInput.value.trim();
  if (!value) return;

  const normalized = value.replace(/\s+/g, ' ');
  if (state.requiredSkills.includes(normalized)) {
    skillInput.value = '';
    return;
  }

  state.requiredSkills.push(normalized);
  skillInput.value = '';
  renderSkillTags();
  updateAnalyzeState();
}

function resetUploadState() {
  state.selectedFile = null;
  uploadInput.value = '';
  fileMeta.textContent = '';
  fileMeta.classList.add('hidden');
  renderDefaultUploadState();
  clearErrorMessage(uploadError);
  analysisNotice.classList.add('hidden');
}

function validateSelectedFile(file) {
  if (!file) {
    return false;
  }

  const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
  const name = file.name.toLowerCase();
  const isAllowedExt = /\.(pdf|docx|doc|txt)$/i.test(name);

  if (!isAllowedExt && !allowedTypes.includes(file.type) && file.type !== '') {
    setErrorMessage(uploadError, 'Please upload a PDF, DOCX, or TXT resume.');
    return false;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    setErrorMessage(uploadError, 'This file is too large. Please upload a smaller resume.');
    return false;
  }

  return true;
}

function setFileState(file) {
  state.selectedFile = file;
  renderSelectedUploadState(file);
  fileMeta.textContent = `✓ ${file.name} · ${prettySize(file.size)} · Change file`;
  fileMeta.classList.add('hidden');
  uploadDropzone.setAttribute('aria-label', `Selected file ${file.name}`);
  clearErrorMessage(uploadError);
  analysisNotice.classList.add('hidden');
  updateAnalyzeState();
}

function handleFileSelection(file) {
  if (!file) {
    resetUploadState();
    return;
  }

  if (!validateSelectedFile(file)) {
    state.selectedFile = null;
    uploadInput.value = '';
    updateAnalyzeState();
    return;
  }

  setFileState(file);
}

uploadDropzone.addEventListener('click', () => {
  uploadInput.click();
});

uploadDropzone.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    uploadInput.click();
  }
});

uploadInput.addEventListener('change', (event) => {
  const file = event.target.files && event.target.files[0];
  handleFileSelection(file);
});

['dragenter', 'dragover'].forEach((type) => {
  uploadDropzone.addEventListener(type, (event) => {
    event.preventDefault();
    uploadDropzone.classList.add('is-highlighted');
  });
});

['dragleave', 'drop'].forEach((type) => {
  uploadDropzone.addEventListener(type, (event) => {
    event.preventDefault();
    uploadDropzone.classList.remove('is-highlighted');
  });
});

uploadDropzone.addEventListener('drop', (event) => {
  const file = event.dataTransfer.files && event.dataTransfer.files[0];
  handleFileSelection(file);
});

jobDescription.addEventListener('input', () => {
  updateCharCount();
  updateAnalyzeState();
  clearErrorMessage(jobError);
});

addSkillBtn.addEventListener('click', addSkill);
skillInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    addSkill();
  }
});

function setScoreDisplay(score) {
  const clamped = Math.min(100, Math.max(0, Number(score) || 0));
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  scoreProgress.style.strokeDasharray = `${circumference}`;
  scoreProgress.style.strokeDashoffset = `${circumference}`;

  const start = Number(overallScore.dataset.value || 0);
  const duration = 700;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const current = start + (clamped - start) * progress;
    overallScore.textContent = `${Math.round(current)}`;
    const currentOffset = circumference - (current / 100) * circumference;
    scoreProgress.style.strokeDashoffset = `${currentOffset}`;

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      overallScore.dataset.value = String(clamped);
    }
  }

  overallScore.dataset.value = String(start);
  requestAnimationFrame(tick);
}

function getScoreLabel(score) {
  if (score >= 80) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Partial Match';
  return 'Low Match';
}

function getInterpretation(score) {
  if (score >= 80) {
    return 'This profile is a strong fit for the role and highlights the most relevant strengths.';
  }
  if (score >= 60) {
    return 'This profile lines up well with the role and has a solid foundation for growth.';
  }
  if (score >= 40) {
    return 'This profile shows a good starting point, with a few key skills to strengthen.';
  }
  return 'This profile shows potential and could be a strong fit with a few targeted skill gaps addressed.';
}

function renderTagList(container, items, kind) {
  container.innerHTML = '';

  if (!items || items.length === 0) {
    const empty = document.createElement('span');
    empty.className = 'tag missing';
    empty.textContent = kind === 'strength' ? 'No standout skills yet' : 'No gaps identified';
    container.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const tag = document.createElement('span');
    tag.className = `tag ${kind === 'strength' ? 'good' : 'missing'}`;
    tag.textContent = item;
    container.appendChild(tag);
  });
}

function renderKeywordList(container, items) {
  container.innerHTML = '';

  if (!items || items.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No items yet';
    container.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    container.appendChild(li);
  });
}

function setBarWidth(element, value) {
  element.style.width = `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
}

function resetResults() {
  resultsSection.classList.add('hidden');
  resultsSection.classList.remove('visible');
  loadingState.classList.add('hidden');
  uploadDropzone.classList.remove('is-scanning');
}

function showResults(data) {
  const scoreValue = Number(data.overall_score || 0);
  const similarity = Number(data.similarity_score || 0);
  const required = Number(data.required_skill_score || 0);
  const preferred = Number(data.preferred_skill_score || 0);

  setScoreDisplay(scoreValue);
  scoreLabel.textContent = getScoreLabel(scoreValue);
  scoreInterpretation.textContent = getInterpretation(scoreValue);

  renderTagList(strengthsList, data.matched_skills || [], 'strength');
  renderTagList(gapsList, data.missing_skills || [], 'missing');

  similarityValue.textContent = `${Math.round(similarity)}%`;
  requiredValue.textContent = `${Math.round(required)}%`;
  preferredValue.textContent = `${Math.round(preferred)}%`;

  setBarWidth(similarityBar, similarity);
  setBarWidth(requiredBar, required);
  setBarWidth(preferredBar, preferred);

  renderKeywordList(matchedKeywordsList, data.matched_keywords || []);
  renderKeywordList(missingKeywordsList, data.missing_keywords || []);

  recommendationText.textContent = data.recommendation || 'This candidate has a promising fit for the role.';
  analysisDetailsContent.textContent = JSON.stringify(data, null, 2);

  resultsSection.classList.remove('hidden');
  requestAnimationFrame(() => {
    resultsSection.classList.add('visible');
  });
}

function showLoadingState() {
  loadingState.classList.remove('hidden');
  uploadDropzone.classList.add('is-scanning');
  clearErrorMessage(uploadError);
  clearErrorMessage(jobError);
  analysisNotice.classList.add('hidden');
}

function showServerError() {
  setErrorMessage(uploadError, 'Something went wrong while analyzing your resume. Please try again.');
  loadingState.classList.add('hidden');
  uploadDropzone.classList.remove('is-scanning');
  analyzeBtn.disabled = false;
  analysisNotice.classList.add('hidden');
}

function hideLoadingState() {
  loadingState.classList.add('hidden');
  uploadDropzone.classList.remove('is-scanning');
}

screenForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!state.selectedFile) {
    setErrorMessage(uploadError, 'Please upload a PDF, DOCX, or TXT resume.');
    return;
  }

  if (!jobDescription.value.trim()) {
    setErrorMessage(jobError, 'Please add a job description before analyzing.');
    return;
  }

  showLoadingState();
  analyzeBtn.disabled = true;

  const formData = new FormData();
  formData.append('resume', state.selectedFile);
  formData.append('job_description', jobDescription.value.trim());

  state.requiredSkills.forEach((skill) => {
    formData.append('required_skills', skill);
  });

  try {
    const response = await fetch('/api/screen', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Request failed');
    }

    const data = await response.json();
    hideLoadingState();
    showResults(data);

    analysisNotice.textContent = 'Analysis complete ✓';
    analysisNotice.classList.remove('hidden');
    analysisNotice.classList.remove('error');
    analysisNotice.classList.add('success');
    analyzeBtn.disabled = false;
    updateAnalyzeState();
  } catch (error) {
    showServerError();
  }
});

analyzeAnotherBtn.addEventListener('click', () => {
  screenForm.reset();
  state.requiredSkills = [];
  renderSkillTags();
  updateCharCount();
  resetUploadState();
  clearErrorMessage(jobError);
  analysisNotice.classList.add('hidden');
  resetResults();
  updateAnalyzeState();
});

['click', 'keydown'].forEach((eventName) => {
  document.querySelectorAll('[data-scroll-target]').forEach((button) => {
    button.addEventListener(eventName, (event) => {
      if (eventName === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
        return;
      }
      const targetId = button.getAttribute('data-scroll-target');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});

document.querySelectorAll('.collapsible-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const targetId = toggle.getAttribute('data-target');
    const target = document.getElementById(targetId);
    const isHidden = target.classList.contains('hidden');

    target.classList.toggle('hidden', !isHidden);
    toggle.classList.toggle('is-open', isHidden);
    toggle.setAttribute('aria-expanded', String(isHidden));
  });
});

updateCharCount();
renderSkillTags();
updateAnalyzeState();
renderDefaultUploadState();
resetResults();
