const MAX_OTHER_LENGTH = 200;

/**
 * Sanitize free-text input: trim, limit length, strip prompt injection patterns.
 */
export function sanitizeText(text, maxLen = MAX_OTHER_LENGTH) {
  if (typeof text !== 'string') return '';
  let clean = text.trim().slice(0, maxLen);
  clean = clean
    .replace(/\b(system|assistant|human|user)\s*:/gi, '')
    .replace(/<\/?[a-z][^>]*>/gi, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\n{3,}/g, '\n\n');
  return clean.trim();
}

/**
 * Sanitize the full answers object.
 * Only _other string values (free text) get sanitized.
 * Select values and arrays pass through unchanged.
 */
export function sanitizeAnswers(answers) {
  const sanitized = {};
  for (const [key, value] of Object.entries(answers)) {
    if (key.endsWith('_other') && typeof value === 'string') {
      sanitized[key] = sanitizeText(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
