import { describe, it, expect } from 'vitest';
import { buildPrompt } from '../prompts.js';

const mockAnswers = {
  org_size: 'medium',
  org_policy: 'active',
  usage_tools: ['chatgpt', 'claude'],
  usage_tier: 'no_paid',
};

const mockScores = { orde: 72, avg: 85, aiact: 60, overall: 72 };

describe('buildPrompt', () => {
  it('returns a Dutch prompt for lang=nl', () => {
    const prompt = buildPrompt(mockAnswers, mockScores, 'nl');
    expect(prompt).toContain('Schrijf een professioneel compliance-rapport');
    expect(prompt).toContain('NOvA');
  });

  it('returns an English prompt for lang=en', () => {
    const prompt = buildPrompt(mockAnswers, mockScores, 'en');
    expect(prompt).toContain('Write a professional compliance report');
    expect(prompt).toContain('NOvA');
  });

  it('includes the answers in the prompt', () => {
    const prompt = buildPrompt(mockAnswers, mockScores, 'nl');
    expect(prompt).toContain(JSON.stringify(mockAnswers));
  });

  it('includes score values in the prompt', () => {
    const prompt = buildPrompt(mockAnswers, mockScores, 'nl');
    expect(prompt).toContain('72');
    expect(prompt).toContain('85');
    expect(prompt).toContain('60');
  });

  it('produces a prompt of reasonable length', () => {
    const prompt = buildPrompt(mockAnswers, mockScores, 'nl');
    expect(prompt.length).toBeGreaterThan(500);
  });

  it('defaults to English for unknown lang', () => {
    const prompt = buildPrompt(mockAnswers, mockScores, 'fr');
    expect(prompt).toContain('Write a professional compliance report');
  });
});
