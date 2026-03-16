import { describe, it, expect } from 'vitest';
import { calcScores, getLevel } from '../scoring.js';

// Minimal sections for testing — mirrors the structure of questionnaire.js
const testSections = [
  {
    id: 'test',
    questions: [
      {
        id: 'q1', type: 'select',
        scoring: {
          bad:  { orde: -3, avg: -2, aiact: -2 },
          ok:   { orde: 0,  avg: 0,  aiact: 0 },
          good: { orde: 3,  avg: 2,  aiact: 2 },
        },
      },
      {
        id: 'q2', type: 'select',
        scoring: {
          bad:  { orde: -2, avg: -3, aiact: -1 },
          good: { orde: 2,  avg: 3,  aiact: 1 },
        },
      },
      {
        id: 'q3', type: 'multi', // multi-select questions have no scoring
      },
    ],
  },
];

describe('calcScores', () => {
  it('returns mid-range scores for empty answers', () => {
    const s = calcScores({}, testSections);
    expect(s.orde).toBeGreaterThanOrEqual(0);
    expect(s.orde).toBeLessThanOrEqual(100);
    expect(s.avg).toBeGreaterThanOrEqual(0);
    expect(s.avg).toBeLessThanOrEqual(100);
    expect(s.aiact).toBeGreaterThanOrEqual(0);
    expect(s.aiact).toBeLessThanOrEqual(100);
    expect(s.overall).toBeGreaterThanOrEqual(0);
    expect(s.overall).toBeLessThanOrEqual(100);
  });

  it('returns high scores for all best answers', () => {
    const s = calcScores({ q1: 'good', q2: 'good' }, testSections);
    expect(s.orde).toBe(100);
    expect(s.avg).toBe(100);
    expect(s.aiact).toBe(100);
    expect(s.overall).toBe(100);
  });

  it('returns low scores for all worst answers', () => {
    const s = calcScores({ q1: 'bad', q2: 'bad' }, testSections);
    expect(s.orde).toBe(0);
    expect(s.avg).toBe(0);
    expect(s.aiact).toBe(0);
    expect(s.overall).toBe(0);
  });

  it('returns intermediate scores for mixed answers', () => {
    const s = calcScores({ q1: 'good', q2: 'bad' }, testSections);
    expect(s.orde).toBeGreaterThan(0);
    expect(s.orde).toBeLessThan(100);
  });

  it('overall is the average of three axes', () => {
    const s = calcScores({ q1: 'ok' }, testSections);
    expect(s.overall).toBe(Math.round((s.orde + s.avg + s.aiact) / 3));
  });

  it('ignores questions without scoring', () => {
    const s1 = calcScores({}, testSections);
    const s2 = calcScores({ q3: ['a', 'b'] }, testSections);
    expect(s1).toEqual(s2);
  });
});

describe('getLevel', () => {
  it('returns Goed for score >= 75', () => {
    expect(getLevel(75).label).toBe('Goed');
    expect(getLevel(100).label).toBe('Goed');
  });

  it('returns Matig for score 45-74', () => {
    expect(getLevel(74).label).toBe('Matig');
    expect(getLevel(45).label).toBe('Matig');
  });

  it('returns Onvoldoende for score < 45', () => {
    expect(getLevel(44).label).toBe('Onvoldoende');
    expect(getLevel(0).label).toBe('Onvoldoende');
  });

  it('returns color and bg properties', () => {
    const level = getLevel(80);
    expect(level).toHaveProperty('color');
    expect(level).toHaveProperty('bg');
    expect(level).toHaveProperty('border');
  });
});
