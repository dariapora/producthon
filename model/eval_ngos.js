// Evaluation harness for J1 (MATCHMAKING.md §9).
//
// Two modes, because you cannot score a model against labels that do not exist yet:
//
//   node model/eval_ngos.js --sample 120     -> writes out/ngo_gold_sample.csv, a stratified sample
//                                               with the purpose text and an EMPTY label column
//   node model/eval_ngos.js                  -> scores out/ngo_profiles.json against the labels
//
// The metric is macro-F1, never accuracy. The classes are heavily imbalanced — most of the regex's
// 1,259 candidates are not education organisations, which is the entire reason this job exists — so
// a model that answered "false" to everything would score ~0.8 accuracy and be useless. Macro-F1
// refuses to be flattered that way.
//
// Abstention is reported separately and is NOT counted as an error. A system that emails real people
// is right to refuse to guess; what must be checked is that it abstains on the hard rows rather
// than the easy ones, which is what abstention precision measures.

const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
const flag = n => argv.includes(n);

const PROFILES = opt('--profiles', 'out/ngo_profiles.json');
const GOLD     = opt('--gold', 'out/ngo_gold.csv');
const SAMPLE_N = parseInt(opt('--sample', '0'), 10) || 0;
const FAMILIES_ONLY = flag('--families');

const strip = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const NAME_EDU = /educa|scoal|elev|invatam|abandon|meditat|tutor|after school|pedagog|didactic/i;

// The organisation families that read as education by name and cannot run a programme for somebody
// else's school. These patterns ARE the definition of the "282 of 1,260" figure: a family count is a
// measurement relative to a pattern, so quoting the number without the pattern makes it unauditable
// — including by whoever wrote it, a week later. `node model/eval_ngos.js --families` reprints the
// breakdown from exactly these, so anyone can reproduce or dispute it.
//
// Not a family, deliberately: parish and Christian associations. An earlier pass matched
// CRESTIN|ORTODOX and reported 5. That was not a miscount, it was an indefensible CATEGORY — a
// religious name is no evidence at all that an organisation does not provide education, and in
// Romania a great many real after-school and remedial programmes are parish-run. Removed, not
// corrected: this line exists so nobody adds it back.
const FAMILIES = {
  'credit union (Casa de Ajutor Reciproc)': /casa de ajutor reciproc|\bc\.?a\.?r\.?\b/i,
  'parent association':                     /parint/i,
  'trade union':                            /sindicat|federatia.*sindica/i,
  'alumni / teaching staff body':           /absolven|alumni|cadrelor didactice/i,
  'sports / dance / hunting club':          /sportiv|tenis|fotbal|handbal|baschet|dans|vanatoare/i,
};
const inFamily = name => Object.values(FAMILIES).some(re => re.test(strip(name)));

const q = v => { const t = v == null ? '' : String(v); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
function parseCSV(text) {
  const rows = []; let row = [], field = '', qt = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (qt) { if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else qt = false; } else field += ch; }
    else if (ch === '"') qt = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// -------------------------------------------------------------- families mode
// Prints the number and the definition together, so "282 of 1,260" is a claim someone else can check.
if (FAMILIES_ONLY) {
  const src = opt('--in', 'out/ngo_candidates.csv');
  const rows = parseCSV(fs.readFileSync(src, 'utf8').replace(/^\ufeff/, '')).filter(r => r.length > 4);
  const h = rows[0].map(s => s.trim());
  const iN = h.indexOf('name'), iR = h.indexOf('reg');
  const data = rows.slice(1);
  const key = r => `${String(r[iR] || '').trim()}|${strip(r[iN]).toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 60)}`;
  console.log(`${src}\n`);
  console.log(`  ${String(data.length).padStart(5)}  data rows — the list as displayed, 30 per county`);
  console.log(`  ${String(new Set(data.map(key)).size).padStart(5)}  distinct (reg, normalised name) — what classify_ngos.js bills for`);
  console.log(`  ${String(new Set(data.map(r => String(r[iR]).trim())).size).padStart(5)}  distinct reg — NOT an organisation count; registration numbers are shared\n`);
  const hit = new Set();
  for (const [label, re] of Object.entries(FAMILIES)) {
    const m = data.filter(r => re.test(strip(r[iN] || '')));
    m.forEach(r => hit.add(key(r)));
    console.log(`  ${String(m.length).padStart(5)}  ${label}\n         ${re}`);
  }
  const union = data.filter(r => inFamily(r[iN] || '')).length;
  console.log(`\n  ${String(union).padStart(5)}  union, as rows  (${(100 * union / data.length).toFixed(1)}% of ${data.length})`);
  console.log(`  ${String(hit.size).padStart(5)}  union, as distinct (reg, name) organisations`);
  const edu = data.filter(r => NAME_EDU.test(strip(r[iN] || ''))).length;
  console.log(`\n  ${String(edu).padStart(5)}  carry an education word in the NAME (${(100 * edu / data.length).toFixed(1)}%)`);
  console.log(`         ${NAME_EDU}`);
  console.log(`         the name filter's hit rate on its own output — so it has no discriminating`);
  console.log(`         power left, and every unmailable row is hiding inside it`);
  process.exit(0);
}

// ---------------------------------------------------------------- sample mode
if (SAMPLE_N) {
  // Stratified, not random — three strata, named in the sheet so the scorer can report per-stratum.
  const src = opt('--in', 'out/ngo_candidates.csv');
  const rows = parseCSV(fs.readFileSync(src, 'utf8').replace(/^﻿/, '')).filter(r => r.length > 4);
  const h = rows[0].map(s => s.trim());
  const ix = n => h.indexOf(n);
  const [kReg, kName, kCty, kEdu] = ['reg', 'name', 'county', 'education_in_name'].map(ix);

  // Strata chosen from what the candidate list actually contains, not from theory. Two things
  // turned up when this sample was first generated and they set the design:
  //
  //   - NOT ONE sports club survives into the list. model/ngos.js already sorts them last and cuts
  //     at 30 per county, so the "riding club that mentions copii" failure MATCHMAKING.md §5 warns
  //     about is a register-wide problem that the ranking has already solved for what we display.
  //   - 1,123 of the 1,260 rows (89.1%) have an education word in the NAME. So the name regex has no
  //     discriminating power left here, and the false positives are hiding inside that 1,123 — 68
  //     credit unions ("Casa de Ajutor Reciproc a Salariaților din Învățământ" lends to teachers and
  //     matches on "învățământ" alone), 201 parent associations, 13 trade unions, 24 alumni bodies:
  //     282 rows, 22.4%. Every one carries an education term in its name and none can run a
  //     programme for somebody else's school.
  //
  // Denominators here, because three were in circulation and they are different sets (measured
  // 12 Sept 2026 from out/ngo_candidates.csv):
  //   1,260  data rows — the list as displayed, 30 per county. `wc -l` says 1,260 too but only by
  //          luck: the file has no trailing newline, so it undercounts by one and agrees by accident
  //   1,252  distinct (reg, normalised name) — what classify_ngos.js bills for
  //   1,251  distinct reg — NOT a count of organisations; 9 registration numbers are shared
  //
  // So the sample is weighted toward the suspect families and the no-signal rows, which is where
  // the model can be wrong in a way that matters. A uniform sample would spend the labelling budget
  // on rows nobody disputes.
  const strat = { suspect_family: [], name_edu: [], name_neutral: [] };
  for (const r of rows.slice(1)) {
    const n = r[kName] || '';
    if (inFamily(n)) strat.suspect_family.push(r);
    else if (NAME_EDU.test(strip(n))) strat.name_edu.push(r);
    else strat.name_neutral.push(r);
  }
  const share = { suspect_family: 0.40, name_edu: 0.35, name_neutral: 0.25 };
  // Deterministic pick (every k-th row) so re-running --sample reproduces the same sheet and a
  // half-finished labelling session is never invalidated. Any stratum that runs short gives its
  // remainder back to the largest one rather than silently shrinking the sample.
  const want = {};
  let short = 0;
  for (const k of Object.keys(share)) {
    const n = Math.round(SAMPLE_N * share[k]);
    want[k] = Math.min(n, strat[k].length);
    short += n - want[k];
  }
  if (short) {
    const big = Object.keys(strat).sort((x, y) => strat[y].length - strat[x].length)[0];
    want[big] = Math.min(want[big] + short, strat[big].length);
  }
  const pick = [];
  for (const k of Object.keys(want)) {
    const pool = strat[k], n = want[k];
    if (!n) continue;
    const step = Math.max(1, Math.floor(pool.length / n));
    for (let i = 0, c = 0; i < pool.length && c < n; i += step, c++) pick.push([k, pool[i]]);
  }

  const out = [['stratum', 'reg', 'name', 'county', 'education_relevant', 'programme_types', 'stage', 'notes'].join(',')];
  for (const [s, r] of pick) out.push([s, r[kReg], r[kName], r[kCty], '', '', '', ''].map(q).join(','));
  const dest = opt('--out', 'out/ngo_gold_sample.csv');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, '﻿' + out.join('\n'), 'utf8');
  console.log(`wrote ${dest}: ${pick.length} rows to label by hand`);
  console.log(`  strata: ${Object.entries(want).map(([k, v]) => `${k} ${v}`).join(' · ')}  (available: ${Object.entries(strat).map(([k, v]) => `${k} ${v.length}`).join(' · ')})`);
  console.log(`  fill education_relevant with 1 or 0. Leave a row blank to drop it from the score.`);
  console.log(`  then: cp ${dest} ${GOLD} && node model/eval_ngos.js`);
  process.exit(0);
}

// ----------------------------------------------------------------- score mode
if (!fs.existsSync(PROFILES)) { console.error(`${PROFILES} not found — run model/classify_ngos.js first.`); process.exit(1); }
if (!fs.existsSync(GOLD)) {
  console.error(`${GOLD} not found. Generate a sheet to label with:\n  node model/eval_ngos.js --sample 120`);
  process.exit(1);
}

const profiles = JSON.parse(fs.readFileSync(PROFILES, 'utf8')).profiles || {};
const byReg = new Map();
for (const p of Object.values(profiles)) if (p.reg) byReg.set(p.reg.trim(), p);

const gr = parseCSV(fs.readFileSync(GOLD, 'utf8').replace(/^﻿/, '')).filter(r => r.length > 3);
const gh = gr[0].map(s => s.trim());
const gx = n => gh.indexOf(n);
const [cStr, cReg, cLab, cTypes, cStage] = ['stratum', 'reg', 'education_relevant', 'programme_types', 'stage'].map(gx);

const pairs = [];                               // {stratum, gold, pred, abstained, profile}
let unlabelled = 0, missing = 0;
for (const r of gr.slice(1)) {
  const lab = (r[cLab] || '').trim();
  if (lab === '') { unlabelled++; continue; }
  const p = byReg.get((r[cReg] || '').trim());
  if (!p) { missing++; continue; }
  pairs.push({
    stratum: cStr >= 0 ? r[cStr] : 'all',
    gold: lab === '1' || /^true$/i.test(lab),
    pred: p.education_relevant,                 // null = abstained
    goldTypes: cTypes >= 0 ? (r[cTypes] || '').split(/[;|]/).map(s => s.trim()).filter(Boolean) : [],
    goldStage: cStage >= 0 ? (r[cStage] || '').trim() : '',
    p,
  });
}

const scored = pairs.filter(x => x.pred !== null && x.pred !== undefined);
const abstained = pairs.filter(x => x.pred === null || x.pred === undefined);

function prf(cls) {                              // cls === true  -> the "education" class
  const tp = scored.filter(x => x.pred === cls && x.gold === cls).length;
  const fp = scored.filter(x => x.pred === cls && x.gold !== cls).length;
  const fn = scored.filter(x => x.pred !== cls && x.gold === cls).length;
  const p = tp + fp ? tp / (tp + fp) : 0, r = tp + fn ? tp / (tp + fn) : 0;
  return { tp, fp, fn, p, r, f1: p + r ? 2 * p * r / (p + r) : 0 };
}
const pos = prf(true), neg = prf(false);
const macroF1 = (pos.f1 + neg.f1) / 2;
const pct = v => (100 * v).toFixed(1) + '%';

console.log(`gold: ${pairs.length} labelled rows scored · ${unlabelled} left blank · ${missing} with no profile (not classified)`);
console.log(`\n                 precision    recall       F1      support`);
console.log(`  education      ${pct(pos.p).padStart(8)}  ${pct(pos.r).padStart(8)}  ${pct(pos.f1).padStart(8)}   ${pos.tp + pos.fn}`);
console.log(`  not education  ${pct(neg.p).padStart(8)}  ${pct(neg.r).padStart(8)}  ${pct(neg.f1).padStart(8)}   ${neg.tp + neg.fn}`);
console.log(`\n  macro-F1  ${pct(macroF1)}   ${macroF1 >= 0.80 ? 'PASS' : 'FAIL'} (bar: 80.0%, MATCHMAKING.md §9.4)`);

console.log(`\nconfusion (rows = gold, cols = predicted)`);
console.log(`                 pred yes  pred no`);
console.log(`  gold yes   ${String(pos.tp).padStart(9)}${String(pos.fn).padStart(9)}`);
console.log(`  gold no    ${String(neg.fn).padStart(9)}${String(neg.tp).padStart(9)}`);

// Abstention. Refusing to answer is correct behaviour, but only if it happens on genuinely hard
// rows. "Abstention precision" here = the share of abstentions the deterministic name regex also
// could not settle, i.e. the model went quiet where there really was nothing to go on.
if (abstained.length) {
  const hard = abstained.filter(x => x.stratum === 'name_neutral' || x.stratum === 'suspect_family').length;
  console.log(`\nabstained: ${abstained.length} of ${pairs.length} (${pct(abstained.length / pairs.length)}) · ${hard} of those on a hard stratum (${pct(hard / abstained.length)})`);
} else {
  console.log(`\nabstained: none`);
}

// Baseline. The number that matters to the pitch is not the model's F1 in the abstract, it is the
// model's F1 against the thing it replaces — the regex that currently decides this list.
const base = pairs.map(x => ({ gold: x.gold, pred: NAME_EDU.test(strip(x.p.name || '')) }));
function bprf(cls) {
  const tp = base.filter(x => x.pred === cls && x.gold === cls).length;
  const fp = base.filter(x => x.pred === cls && x.gold !== cls).length;
  const fn = base.filter(x => x.pred !== cls && x.gold === cls).length;
  const p = tp + fp ? tp / (tp + fp) : 0, r = tp + fn ? tp / (tp + fn) : 0;
  return p + r ? 2 * p * r / (p + r) : 0;
}
const baseMacro = (bprf(true) + bprf(false)) / 2;
console.log(`\nbaseline (the name regex this replaces): macro-F1 ${pct(baseMacro)}`);
console.log(`model - baseline: ${(100 * (macroF1 - baseMacro)).toFixed(1)} points`);

const stages = pairs.filter(x => x.goldStage);
if (stages.length) {
  const runGold = stages.filter(x => x.goldStage === 'running');
  const hit = runGold.filter(x => x.p.stage === 'running').length;
  console.log(`\nstage recall on "running": ${runGold.length ? pct(hit / runGold.length) : 'n/a'} (${hit}/${runGold.length}, bar 85.0%)`);
}

const ungrounded = Object.values(profiles).filter(p => p.grounded === false).length;
console.log(`\ngroundedness across all ${Object.keys(profiles).length} profiles: ${ungrounded} evidence spans were not verbatim and were rejected`);
if (macroF1 < 0.80) process.exitCode = 1;
