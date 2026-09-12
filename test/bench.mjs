// The county/national benchmark in the director KPI card must stay CANDIDATE-WEIGHTED.
//
// bench() averages school means weighted by candidates per year: 6.69 nationally, 6.28 for
// Dâmbovița. Drop the weight — `acc.ro.s += w*s.meanAvg` becoming `+= s.meanAvg` — and it silently
// becomes the mean of school means: 5.96 and 5.84. A 0.73 shift, nothing thrown, and the wrong
// value is the one a checker reaches for first, so it reads as confirmation rather than a bug.
// No visual check can catch it: both render as a plausible average in the same two digits.
//
// The card compares one school's pupils against the average PUPIL. Candidate-weighting is what
// makes that claim true; unweighted answers a question nobody asked (the average SCHOOL). The
// label's „ponderată pe candidați" is the whole defence — see PROGRESS.md, the bench() entry.
//
// Two independent guards, because the page's script is an IIFE and nothing inside it is reachable
// from page.evaluate (the same reason payload.mjs reads source text rather than the live page):
//   1. the shipped bench() source, extracted and run against a fixture built so that weighted and
//      unweighted cannot coincide — this is the arithmetic check, and it runs the real code;
//   2. the rendered card, driven through the real director path, compared against a mean this file
//      computes from the payload itself — this is the does-it-reach-the-screen check.
// Nothing hardcodes 6.69, so a data rebuild does not break the suite.
import { readFileSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import path from 'path';
import { chromium } from 'playwright';

// fileURLToPath, not URL.pathname: the project lives under "civic producthon" and .pathname hands
// back the space percent-encoded, so the read fails on a path that looks correct in the error.
const APP_FILE = fileURLToPath(new URL('../app/index.html', import.meta.url));
const src = readFileSync(APP_FILE, 'utf8');
const DATA = JSON.parse(src.match(/\/\*DATA:START\*\/\s*const DATA=([\s\S]*?);\s*\/\*DATA:END\*\//)[1]);
const F = {}; DATA.fields.forEach((n, i) => F[n] = i);

let bad = 0;
const ok = (c, m, d = '') => { console.log(`${c ? ' ok  ' : 'FAIL '}${m}${d ? '  ' + d : ''}`); if (!c) bad++; };
const near = (a, b, eps = 1e-9) => a != null && b != null && Math.abs(a - b) < eps;

// ---- 1. the shipped bench(), run on a fixture that separates the two averages ----------------
const fnSrc = (src.match(/\nfunction bench\(\)\{[\s\S]*?\n\}/) || [])[0];
ok(!!fnSrc, 'bench() found in app/index.html');
if (!fnSrc) { console.log('\nCOULD NOT CHECK — bench() not located; the rest is meaningless'); process.exit(1); }

// One small school scoring badly and one large school scoring well. The weighted answer sits near
// the large school; the unweighted answer sits halfway. Anything that ignores perYear lands on 5.
const FIX = [
  { meanAvg: 2, perYear: 1,  county: 'A' },
  { meanAvg: 8, perYear: 99, county: 'A' },
  { meanAvg: 6, perYear: 10, county: 'B' },
  { meanAvg: null, perYear: 50, county: 'B' },   // no mean: must be skipped entirely
];
// National spans both counties; county A is the pair on its own. Keeping them separate here is
// the point — conflating them is exactly the mistake this fixture caught on its first run.
const EXPECT_W    = (2 * 1 + 8 * 99 + 6 * 10) / 110;   // 7.7636 national, weighted
const EXPECT_U    = (2 + 8 + 6) / 3;                   // 5.3333 national, unweighted
const EXPECT_W_A  = (2 * 1 + 8 * 99) / 100;            // 7.94   county A, weighted
const run = new Function('ALL', `let BENCH=null;${fnSrc};return bench();`);
const r = run(FIX);

ok(near(r.ro.v, EXPECT_W), 'bench() weights the national mean by candidates per year',
   `got ${r.ro.v.toFixed(4)}, weighted ${EXPECT_W.toFixed(4)}, unweighted would be ${EXPECT_U.toFixed(2)}`);
ok(!near(r.ro.v, EXPECT_U, 5e-3), 'bench() is NOT the unweighted mean of school means');
ok(r.ro.n === 3, 'schools with no mean are excluded from the count', `n=${r.ro.n}, expected 3`);
ok(near(r.cty.A.v, EXPECT_W_A) && r.cty.A.n === 2, 'per-county figure is weighted the same way',
   `A=${r.cty.A.v.toFixed(4)}, expected ${EXPECT_W_A.toFixed(4)}, n=${r.cty.A.n}`);
ok(r.cty.B && r.cty.B.n === 1, 'a county keeps only its schools that have a mean',
   `B n=${r.cty.B?.n}`);

// ---- 2. what actually reaches the card -------------------------------------------------------
const rows = DATA.rows
  .map(x => ({ mean: x[F.meanAvg], w: x[F.perYear] }))
  .filter(x => x.mean != null && isFinite(x.mean));
const weighted = (() => { let w = 0, s = 0; for (const x of rows) { const ww = x.w > 0 ? x.w : 1; w += ww; s += ww * x.mean; } return s / w; })();
const unweighted = rows.reduce((t, x) => t + x.mean, 0) / rows.length;

ok(Math.abs(weighted - unweighted) > 0.1,
   'weighted and unweighted differ enough on the real payload for this to mean anything',
   `weighted ${weighted.toFixed(2)} vs unweighted ${unweighted.toFixed(2)}`);

const APP = pathToFileURL(path.resolve(import.meta.dirname, '../app/index.html')).href;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
await p.addInitScript(() => { try { localStorage.setItem('puntea.role', 'dir') } catch (e) {} });
await p.goto(APP, { waitUntil: 'load' });
await p.waitForTimeout(2000);

await p.fill('#dirQ', 'Cojasca');
await p.waitForTimeout(400);
await p.press('#dirQ', 'Enter');
await p.waitForTimeout(600);

const card = await p.evaluate(() => {
  const el = document.querySelector('.kpi');
  return el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
});
await b.close();

ok(!!card, 'the director KPI card renders for a searched school');
if (card) {
  ok(/cumulat|2023.?2026/i.test(card), 'the label says the mean is pooled 2023-2026, not "EN 2026"');
  ok(/ponderat/i.test(card), 'the card discloses that the benchmark is candidate-weighted');

  // The national figure printed on the card, to 2dp, must be the weighted mean.
  const shown = (card.match(/Rom[âa]nia\s*([0-9]+[.,][0-9]{2})/i) || [])[1];
  ok(!!shown, 'the card prints a figure for România', shown ? `"${shown}"` : 'no match');
  if (shown) {
    const v = Number(shown.replace(',', '.'));
    ok(Math.abs(v - weighted) < 0.005, 'the printed national figure is the candidate-weighted mean',
       `card ${v} vs weighted ${weighted.toFixed(4)}`);
    ok(Math.abs(v - unweighted) > 0.05, 'the printed national figure is NOT the unweighted mean',
       `unweighted would print ${unweighted.toFixed(2)}`);
  }
  // The denominator has to travel with the figure — BRAND §16, CLAUDE.md claims discipline.
  ok(card.includes(rows.length.toLocaleString('ro-RO')) || card.includes(String(rows.length)),
     'the national school count is printed inside the same card',
     `looking for ${rows.length.toLocaleString('ro-RO')}`);
}

console.log(bad ? `\n${bad} benchmark check(s) failed` : '\nbenchmark stays candidate-weighted');
process.exit(bad ? 1 : 0);
