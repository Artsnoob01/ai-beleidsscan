const STORAGE_KEY = 'ail_scan_progress';
const SCHEMA_VERSION = 1;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 dagen

export function loadProgress(questionnaireId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);

    if (data.version !== SCHEMA_VERSION) return null;
    if (data.questionnaireId !== questionnaireId) return null;
    if (Date.now() - data.savedAt > MAX_AGE_MS) return null;

    return {
      answers: data.answers || {},
      sectionIndex: data.sectionIndex || 0,
      email: data.email || '',
    };
  } catch {
    return null;
  }
}

export function saveProgress(questionnaireId, { answers, sectionIndex, email }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      version: SCHEMA_VERSION,
      questionnaireId,
      savedAt: Date.now(),
      answers,
      sectionIndex,
      email,
    }));
  } catch {
    // localStorage vol of niet beschikbaar
  }
}

export function clearProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
