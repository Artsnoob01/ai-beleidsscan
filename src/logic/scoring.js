import { C } from '../config/theme.js';
import { t } from '../config/translations.js';

export function calcScores(answers, sections) {
  const axes = ["orde", "avg", "aiact"];
  let pos = { orde: 0, avg: 0, aiact: 0 };
  let neg = { orde: 0, avg: 0, aiact: 0 };
  let raw = { orde: 0, avg: 0, aiact: 0 };

  sections.forEach(s => s.questions.forEach(q => {
    if (!q.scoring) return;

    axes.forEach(axis => {
      let bestVal = -Infinity, worstVal = Infinity;
      Object.values(q.scoring).forEach(sc => {
        const val = sc[axis] || 0;
        if (val > bestVal) bestVal = val;
        if (val < worstVal) worstVal = val;
      });
      if (bestVal === -Infinity) bestVal = 0;
      if (worstVal === Infinity) worstVal = 0;

      if (bestVal > 0) pos[axis] += bestVal;
      if (worstVal < 0) neg[axis] += worstVal;
    });

    const v = answers[q.id];
    if (v && q.scoring[v]) {
      Object.entries(q.scoring[v]).forEach(([k, val]) => {
        raw[k] += val;
      });
    }
  }));

  const normalize = (axis) => {
    const range = pos[axis] - neg[axis];
    if (range === 0) return 50;
    return Math.max(0, Math.min(100, Math.round(((raw[axis] - neg[axis]) / range) * 100)));
  };

  const orde = normalize("orde");
  const avg = normalize("avg");
  const aiact = normalize("aiact");

  return {
    orde,
    avg,
    aiact,
    overall: Math.round((orde + avg + aiact) / 3),
  };
}

export function getLevel(s, lang = 'nl') {
  if (s >= 85) return { label: t(lang, 'level_excellent'), color: C.success, bg: C.successDim, border: C.successBorder };
  if (s >= 70) return { label: t(lang, 'level_good'), color: C.success, bg: C.successDim, border: C.successBorder };
  if (s >= 50) return { label: t(lang, 'level_fair'), color: C.warning, bg: C.warningDim, border: C.warningBorder };
  return { label: t(lang, 'level_poor'), color: C.danger, bg: C.dangerDim, border: C.dangerBorder };
}
