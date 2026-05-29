// Deterministic fact-preservation checker: compares .blog-backup/<f> (original) vs content/blog/<f> (new)
const fs = require('fs'), p = require('path');
const dir = 'content/blog', bak = '.blog-backup';

function splitFM(s) {
  const m = s.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: null, h1: null, body: s };
  const rest = s.slice(m[0].length);
  const h1m = rest.match(/^\s*(#[^\n]*)/);
  return { fm: m[1], h1: h1m ? h1m[1].trim() : null, body: rest };
}

// High-signal fact tokens, normalized (lowercased, spaces stripped)
function facts(body) {
  const t = [];
  const push = (arr) => { for (const x of arr) t.push(x.toLowerCase().replace(/\s+/g, '')); };
  push(body.match(/₹\s?[\d,]+(?:\.\d+)?/g) || []);
  push(body.match(/\b\d+(?:\.\d+)?\s?(?:lakh|crore|lakhs|crores)\b/gi) || []);
  push(body.match(/\b\d+(?:\.\d+)?\s?%/g) || []);
  push(body.match(/\b(?:section|sec\.?|u\/s)\s?\d+[A-Za-z]{0,4}(?:\(\d+[A-Za-z]?\))?/gi) || []);
  push(body.match(/\b\d{2,3}[A-Z]{1,4}\b/g) || []);            // 44ADA, 80C, 87A, 234B, 112A
  push(body.match(/\b\d{2,3}\(\d+[A-Za-z]?\)/g) || []);         // 139(9), 234C
  push(body.match(/\bITR-\d\b/gi) || []);
  push(body.match(/\bForm\s?\d+[A-Za-z]{0,3}\b/gi) || []);      // Form 16A, Form 67, Form 26AS, Form 10E
  push(body.match(/\bGSTR-\d[A-Za-z]?\b/gi) || []);
  push(body.match(/\b(?:FY|AY)\s?\d{4}-\d{2,4}\b/gi) || []);
  push(body.match(/\b(?:19|20)\d{2}\b/g) || []);               // years
  // multiset
  const m = {};
  for (const x of t) m[x] = (m[x] || 0) + 1;
  return m;
}

function missing(origM, newM) {
  const out = [];
  for (const k of Object.keys(origM)) {
    if ((newM[k] || 0) < origM[k]) out.push(`${k} (orig×${origM[k]} new×${newM[k] || 0})`);
  }
  return out;
}

const onlyArg = process.argv[2]; // optional: a file listing filenames, one per line
let targets;
if (onlyArg) targets = fs.readFileSync(onlyArg, 'utf8').split(/\r?\n/).filter(Boolean);
else targets = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));

const report = [];
for (const f of targets) {
  const np = p.join(dir, f), bp = p.join(bak, f);
  if (!fs.existsSync(bp)) { report.push({ f, status: 'NO_BACKUP' }); continue; }
  const nb = fs.readFileSync(np, 'utf8').replace(/\r\n/g, '\n'), bb = fs.readFileSync(bp, 'utf8').replace(/\r\n/g, '\n');
  if (nb === bb) { report.push({ f, status: 'UNCHANGED' }); continue; }
  const N = splitFM(nb), B = splitFM(bb);
  const issues = [];
  if (N.fm !== B.fm) issues.push('FRONTMATTER_CHANGED');
  if (N.h1 !== B.h1) issues.push(`H1_CHANGED: "${B.h1}" -> "${N.h1}"`);
  const miss = missing(facts(B.body), facts(N.body));
  if (miss.length) issues.push('MISSING_FACTS: ' + miss.join('; '));
  report.push({ f, status: issues.length ? 'REVIEW' : 'PASS', issues });
}

const counts = report.reduce((a, r) => (a[r.status] = (a[r.status] || 0) + 1, a), {});
console.log('STATUS COUNTS:', JSON.stringify(counts));
for (const r of report) {
  if (r.status === 'REVIEW') console.log('\n[REVIEW] ' + r.f + '\n  - ' + r.issues.join('\n  - '));
}
