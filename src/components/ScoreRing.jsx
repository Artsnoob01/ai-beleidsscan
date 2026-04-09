import { C } from '../config/theme.js';
import { getLevel } from '../logic/scoring.js';

export const ScoreRing = ({ score, size = 120, label, sub, lang = 'nl' }) => {
  const lv = getLevel(score, lang), r = (size - 12) / 2, circ = 2 * Math.PI * r;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }} role="img" aria-label={`${label || 'Score'}: ${score}, ${lv.label}`}>
        <title>{`${label || 'Score'}: ${score}, ${lv.label}`}</title>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={lv.color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ marginTop: -size / 2 - 16, marginBottom: size / 2 - 28, position: "relative" }}>
        <div style={{ fontSize: size * 0.28, fontWeight: 800, color: C.white }}>{score}</div>
        <div style={{ fontSize: 10, color: lv.color, fontWeight: 700 }}>{lv.label}</div>
      </div>
      {label && <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginTop: 6 }}>{label}</div>}
      {sub && <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  );
};
