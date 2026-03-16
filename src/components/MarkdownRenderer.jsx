import { C } from '../config/theme.js';

export function renderMd(text) {
  if (!text) return null;

  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} style={{ fontSize: 19, fontWeight: 800, color: C.accent, marginTop: 28, marginBottom: 10 }}>
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} style={{ fontSize: 16, fontWeight: 700, color: C.white, marginTop: 22, marginBottom: 8 }}>
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith("- ")) {
      const items = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: "10px 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.75, color: C.text }}>
              <span style={{ flexShrink: 0, width: 6, height: 6, borderRadius: "50%", background: C.accent, marginTop: 10 }} />
              <span style={{ flex: 1 }}>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const items = [];
      while (i < lines.length) {
        const m = lines[i].match(/^(\d+)\.\s+(.*)$/);
        if (!m) break;
        items.push({ num: m[1], content: m[2] });
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: "10px 0", paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: "flex", gap: 12, fontSize: 14, lineHeight: 1.75, color: C.text }}>
              <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 7, background: C.accentDim, border: `1px solid ${C.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: C.accent, marginTop: 2 }}>
                {item.num}
              </span>
              <span style={{ flex: 1 }}>{renderInline(item.content)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (line.trim() === "") {
      elements.push(<div key={i} style={{ height: 6 }} />);
      i++;
      continue;
    }

    elements.push(
      <p key={i} style={{ fontSize: 14, lineHeight: 1.75, color: C.text, margin: "4px 0" }}>
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return elements;
}

export function renderInline(text) {
  if (!text) return null;
  const parts = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldIdx = remaining.indexOf("**");
    const italicSingleIdx = remaining.search(/(?<!\*)\*(?!\*)/);
    const linkIdx = remaining.indexOf("[");

    let earliestIdx = remaining.length;
    let earliestType = null;

    if (boldIdx !== -1 && boldIdx < earliestIdx) {
      earliestIdx = boldIdx;
      earliestType = "bold";
    }
    if (linkIdx !== -1 && linkIdx < earliestIdx) {
      const linkMatch = remaining.slice(linkIdx).match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        earliestIdx = linkIdx;
        earliestType = "link";
      }
    }
    if (italicSingleIdx !== -1 && italicSingleIdx < earliestIdx && earliestType !== "bold") {
      earliestIdx = italicSingleIdx;
      earliestType = "italic";
    }

    if (earliestType === null) {
      parts.push(remaining);
      break;
    }

    if (earliestIdx > 0) {
      parts.push(remaining.slice(0, earliestIdx));
    }

    if (earliestType === "bold") {
      const endIdx = remaining.indexOf("**", earliestIdx + 2);
      if (endIdx === -1) {
        parts.push(remaining.slice(earliestIdx));
        break;
      }
      const inner = remaining.slice(earliestIdx + 2, endIdx);
      parts.push(<strong key={key++} style={{ color: C.white, fontWeight: 700 }}>{inner}</strong>);
      remaining = remaining.slice(endIdx + 2);
      continue;
    }

    if (earliestType === "italic") {
      const afterStar = remaining.slice(earliestIdx + 1);
      const endIdx = afterStar.search(/(?<!\*)\*(?!\*)/);
      if (endIdx === -1) {
        parts.push(remaining.slice(earliestIdx));
        break;
      }
      const inner = afterStar.slice(0, endIdx);
      parts.push(<em key={key++} style={{ color: C.textMuted, fontStyle: "italic" }}>{renderInline(inner)}</em>);
      remaining = afterStar.slice(endIdx + 1);
      continue;
    }

    if (earliestType === "link") {
      const linkMatch = remaining.slice(earliestIdx).match(/^\[([^\]]+)\]\(([^)]+)\)/);
      parts.push(
        <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
          style={{ color: C.accent, textDecoration: "underline", textUnderlineOffset: 3 }}>
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(earliestIdx + linkMatch[0].length);
      continue;
    }

    break;
  }

  return parts;
}
