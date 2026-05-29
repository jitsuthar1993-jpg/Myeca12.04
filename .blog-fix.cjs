// Remediation: for every blog file whose BODY differs from backup, restore the
// frontmatter block byte-for-byte from backup and keep the (humanized) body.
// Also normalizes everything to LF so diffs stay clean. Idempotent.
const fs = require('fs'), p = require('path');
const dir = 'content/blog', bak = '.blog-backup';
const lf = (s) => s.replace(/\r\n/g, '\n');
const fmRe = /^---\n[\s\S]*?\n---\n/;

// 1) Normalize backup to LF (canonical baseline)
for (const f of fs.readdirSync(bak)) {
  if (!f.endsWith('.mdx')) continue;
  const fp = p.join(bak, f); const s = fs.readFileSync(fp, 'utf8');
  if (/\r\n/.test(s)) fs.writeFileSync(fp, lf(s), 'utf8');
}

let restored = 0, unchanged = 0, skipped = [];
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.mdx')) continue;
  const np = p.join(dir, f), bp = p.join(bak, f);
  if (!fs.existsSync(bp)) { skipped.push(f + ' (no backup)'); continue; }
  const cur = lf(fs.readFileSync(np, 'utf8'));
  const bb = lf(fs.readFileSync(bp, 'utf8'));
  if (cur === bb) { unchanged++; continue; }                 // body untouched
  const bm = bb.match(fmRe), cm = cur.match(fmRe);
  if (!bm || !cm) { skipped.push(f + ' (frontmatter parse fail)'); continue; }
  const rebuilt = bm[0] + cur.slice(cm[0].length);           // backup FM + current body
  fs.writeFileSync(np, rebuilt, 'utf8');
  restored++;
}
console.log(`Frontmatter restored on ${restored} changed file(s); ${unchanged} unchanged; skipped ${skipped.length}`);
for (const s of skipped) console.log('  SKIP: ' + s);
