export const printStyles = `
  @media print {
    body { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    * { color: #1a1a2e !important; background: white !important; border-color: #ddd !important; }
    h2 { color: #0a6847 !important; border-bottom: 2px solid #0a6847 !important; padding-bottom: 4px; }
    h3 { color: #333 !important; }
    strong { color: #111 !important; }
    em { color: #555 !important; }
    svg circle[stroke] { stroke: #0a6847 !important; }
    a { color: #0a6847 !important; }
    button, [style*="cursor: pointer"] { display: none !important; }
    [data-print-hide] { display: none !important; }
  }
`;
