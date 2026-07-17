const PRINT_STYLE = `
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; color: #111827; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.45; }
  .mye-ca-document { width: 100%; max-width: 178mm; margin: 0 auto; overflow-wrap: anywhere; }
  .mye-ca-document h1, .mye-ca-document h2, .mye-ca-document h3,
  .mye-ca-document h4, .mye-ca-document table, .mye-ca-document .keep-together {
    break-inside: avoid; page-break-inside: avoid;
  }
  .mye-ca-document h1, .mye-ca-document h2, .mye-ca-document h3,
  .mye-ca-document h4 { break-after: avoid; page-break-after: avoid; }
  .mye-ca-document thead { display: table-header-group; }
  .mye-ca-document tfoot { display: table-footer-group; }
  .mye-ca-document tr { break-inside: avoid; page-break-inside: avoid; }
  .mye-ca-document img { max-width: 100%; }
  .mye-ca-document p, .mye-ca-document li { orphans: 3; widows: 3; }
  .mye-ca-document .page-break { break-before: page; page-break-before: always; }
  .mye-ca-document .no-page-break { break-before: avoid; page-break-before: avoid; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
`;

export function escapeDocumentText(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function wrapPrintableDocument(htmlContent: string, title: string, notice?: string) {
  const noticeMarkup = notice
    ? `<p class="mye-ca-document-notice">${escapeDocumentText(notice)}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeDocumentText(title)}</title>
    <style>${PRINT_STYLE}</style>
  </head>
  <body>
    <main class="mye-ca-document" data-document-title="${escapeDocumentText(title)}">
      ${noticeMarkup}
      ${htmlContent}
    </main>
  </body>
</html>`;
}
