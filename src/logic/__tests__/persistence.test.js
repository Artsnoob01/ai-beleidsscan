import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadProgress, saveProgress, clearProgress } from '../persistence.js';

// Mock localStorage
const store = {};
const localStorageMock = {
  getItem: vi.fn((key) => store[key] ?? null),
  setItem: vi.fn((key, val) => { store[key] = val; }),
  removeItem: vi.fn((key) => { delete store[key]; }),
};
vi.stubGlobal('localStorage', localStorageMock);

const QID = 'test-questionnaire-v1';

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  vi.clearAllMocks();
});

describe('saveProgress + loadProgress roundtrip', () => {
  it('saves and loads back correctly', () => {
    const data = { answers: { q1: 'a' }, sectionIndex: 2, email: 'test@test.nl' };
    saveProgress(QID, data);
    const loaded = loadProgress(QID);
    expect(loaded.answers).toEqual({ q1: 'a' });
    expect(loaded.sectionIndex).toBe(2);
    expect(loaded.email).toBe('test@test.nl');
  });
});

describe('loadProgress', () => {
  it('returns null when nothing is saved', () => {
    expect(loadProgress(QID)).toBeNull();
  });

  it('returns null for wrong questionnaireId', () => {
    saveProgress(QID, { answers: { q1: 'a' }, sectionIndex: 0, email: '' });
    expect(loadProgress('different-id')).toBeNull();
  });

  it('returns null for expired data (>7 days)', () => {
    saveProgress(QID, { answers: { q1: 'a' }, sectionIndex: 0, email: '' });
    // Manipulate the savedAt timestamp
    const raw = JSON.parse(store['ail_scan_progress']);
    raw.savedAt = Date.now() - (8 * 24 * 60 * 60 * 1000); // 8 days ago
    store['ail_scan_progress'] = JSON.stringify(raw);
    expect(loadProgress(QID)).toBeNull();
  });

  it('returns null for wrong schema version', () => {
    saveProgress(QID, { answers: { q1: 'a' }, sectionIndex: 0, email: '' });
    const raw = JSON.parse(store['ail_scan_progress']);
    raw.version = 999;
    store['ail_scan_progress'] = JSON.stringify(raw);
    expect(loadProgress(QID)).toBeNull();
  });

  it('returns null for corrupted JSON', () => {
    store['ail_scan_progress'] = 'not valid json{{{';
    expect(loadProgress(QID)).toBeNull();
  });

  it('defaults missing fields', () => {
    saveProgress(QID, { answers: {}, sectionIndex: undefined, email: undefined });
    const loaded = loadProgress(QID);
    expect(loaded.answers).toEqual({});
    expect(loaded.sectionIndex).toBe(0);
    expect(loaded.email).toBe('');
  });
});

describe('clearProgress', () => {
  it('removes stored data', () => {
    saveProgress(QID, { answers: { q1: 'a' }, sectionIndex: 0, email: '' });
    clearProgress();
    expect(loadProgress(QID)).toBeNull();
  });
});
