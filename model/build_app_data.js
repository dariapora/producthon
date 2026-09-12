// Bake out/schools_need_index.csv into app/index.html so the page opens on real named schools
// instead of the synthetic sample.
//
// The app stays a single file with no build step for the reader, but this payload is GENERATED —
// never hand-edit the block between the DATA markers in app/index.html. Re-run after `npm run index`:
//
//     npm run index && npm run app
//
// Encoding: a column list plus one array per school, county and UAT names pooled into lookup
// tables. That is roughly a third the size of an array of objects, which matters because the
// whole thing is inlined into the HTML.

const fs = require('fs');
const path = require('path');

const IN = process.argv[2] || 'out/schools_need_index.csv';
const APP = process.argv[3] || 'app/index.html';
const START = '/*DATA:START*/';
const END = '/*DATA:END*/';

// --- read the CSV the model wrote (quoted fields, BOM, CRLF) -------------------
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const raw = fs.readFileSync(IN, 'utf8').replace(/^﻿/, '');
const rows = parseCSV(raw).filter(r => r.length > 3);
const head = rows[0].map(h => h.trim());
const ix = n => { const i = head.indexOf(n); if (i < 0) throw new Error(`${IN}: missing column ${n}`); return i; };

const col = {
  code: ix('siiir_code'), school: ix('school'), locality: ix('locality'), county: ix('county'),
  mediu: ix('mediu'), lat: ix('lat'), lon: ix('lon'), geo: ix('geo_source'), email: ix('email'),
  cpy: ix('candidates_per_year'), shrunk: ix('fail_rate_shrunk'), p90: ix('fail_rate_p90'),
  need: ix('need_per_year'), absent: ix('absent_rate'), n2026: ix('n_present_2026'),
  raw: ix('raw_fail_rate'), p10: ix('fail_rate_p10'), prior: ix('county_prior_rate'), mean: ix('mean_avg'),
  years: ix('years'),
  uat: ix('uat_name'), pop: ix('uat_population'), inc: ix('income_tax_per_capita'),
  dep: ix('deprivation_score'), pri: ix('priority_score'),
  inbox: ix('inbox'), inboxN: ix('inbox_schools'),
  pe: ix('pnras_eligible'), pg: ix('pnras_grant'), ms: ix('masa_sanatoasa'),
};

const counties = [], countyIx = new Map();
const uats = [], uatIx = new Map();
const pool = (arr, map, v) => {
  if (!v) return -1;
  if (!map.has(v)) { map.set(v, arr.length); arr.push(v); }
  return map.get(v);
};

const num = (v, d = 3) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? Number(n.toFixed(d)) : null;
};

// Contact addresses stay out of the repo. app/index.html is the thing we publish, and the
// ministry's contact column is 77% consumer addresses (yahoo.com, gmail.com) belonging to named
// head teachers — a public git history would make 5,015 of them permanently scrapeable. So no
// address is baked into the page: each one goes to app/contacts.js (gitignored, rewritten here,
// loaded by the page when present) and `inbox` is baked as an opaque group id, which is all the
// app actually needs — counting distinct inboxes and spotting the ones shared between a
// coordinating school and its structuri arondate.
const contacts = {};
const inboxId = new Map();

const out = [];
for (const r of rows.slice(1)) {
  const code = r[col.code];
  if (!code) continue;
  const mail = (r[col.email] || '').trim();
  if (mail) contacts[code] = mail;
  const box = (r[col.inbox] || '').trim();
  if (box && !inboxId.has(box)) inboxId.set(box, inboxId.size + 1);
  out.push([
    code,
    r[col.school] || '',
    r[col.locality] || '',
    pool(counties, countyIx, r[col.county]),
    r[col.mediu] === 'rural' ? 1 : 0,
    num(r[col.lat], 4), num(r[col.lon], 4),
    // 1 = the school's own surveyed position · 2 = its commune's, because the 2017 coordinate file
    // has no row for it · 0 = neither, and the page falls back to the county seat. Three states, not
    // two: a commune position is good to ~1.7 km and a county seat can be tens of km out, and the
    // page must not present them as the same kind of thing.
    r[col.geo] === 'school' ? 1 : r[col.geo] === 'commune' ? 2 : 0,
    '',   // email: never baked — app/contacts.js carries it, keyed by this siiir_code
    num(r[col.cpy], 1),
    num(r[col.raw]), num(r[col.shrunk], 6), num(r[col.p10]), num(r[col.p90]), num(r[col.prior]),
    num(r[col.need], 1), num(r[col.absent]),
    parseInt(r[col.n2026], 10) || 0, parseInt(r[col.years], 10) || 0, num(r[col.mean], 2),
    pool(uats, uatIx, r[col.uat]),
    parseInt(r[col.pop], 10) || null,
    num(r[col.inc], 0),
    num(r[col.dep], 6), num(r[col.pri], 6),
    box ? inboxId.get(box) : 0, parseInt(r[col.inboxN], 10) || 1,   // inbox = opaque group id, 0 = no address on file. 5dp: at 3dp, rounding flips schools across the dep>=0.8 / <=0.2 archetype boundaries and the app disagrees with the model by a couple of rows
    (r[col.pe] === '1' ? 1 : 0) | (r[col.pg] === '1' ? 2 : 0) | (r[col.ms] === '1' ? 4 : 0),
  ]);
}

// column names, in payload order — mirrored by inflate() in the app
const FIELDS = ['code', 'school', 'locality', 'ci', 'rural', 'lat', 'lon', 'geo', 'email',
  'perYear', 'raw', 'shr', 'lo', 'hi', 'prior', 'need', 'absent', 'n2026', 'nyears', 'meanAvg',
  'ui', 'uatPop', 'income', 'dep', 'prio', 'inbox', 'inboxN', 'flags'];

// --- NGO register: education-purpose counts per county -------------------------
// Baked so the page needs no upload. This is the KEYWORD match, and its precision is poor —
// it flags 27.1% of the registered NGOs that state a purpose and record a county (MATCHMAKING.md
// §5). Labelled as provisional in the UI until the classification job (J1) replaces it.
//
// Two things this set is NOT, both of which it gets mistaken for:
//   * It is not the candidate pipeline's set. `model/ngos.js` uses a WIDER regex (it adds
//     `copii|tineri`) and excludes struck-off organisations first. Same register, same purpose
//     rule, different answer: 40,684 there against 31,523 for this regex on the same rows.
//   * It is not a count of NGOs a director could actually partner with. Struck-off, in-liquidation
//     and dissolved organisations are all still in here. Never reuse it as a supply figure.
let ngo = null;
const ONG = 'data/ong_2026.xlsx';
if (fs.existsSync(ONG)) {
  const XLSX = require('xlsx');
  const wb = XLSX.readFile(ONG, { dense: true });
  const rs = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
  const H = rs[0].map(h => String(h).trim());
  const iJ = H.indexOf('Judet'), iN = H.indexOf('Denumire');
  const scopeCols = H.map((h, i) => /^Scopul initial$|^Modificari ale scopului/.test(h) ? i : -1).filter(i => i >= 0);
  const re = /educa|scoal|școal|elev|abandon|invatam|învățam|meditat|after school|tutor/i;
  const strip = v => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const per = {}; let n = 0, total = 0, noPurpose = 0, noCounty = 0, pool = 0;
  for (const r of rs.slice(1)) {
    if (!String(r[iN]).trim()) continue;
    total++;
    // No stated purpose anywhere (initial scope + all five modification columns) = not a candidate.
    // This purpose rule is the same one `model/ngos.js` applies; the two do NOT otherwise agree,
    // and the header comment says where they part company. Do not read agreement into this line.
    const purpose = scopeCols.map(i => String(r[i]).trim()).filter(Boolean).join(' ');
    if (!/\p{L}/u.test(purpose)) { noPurpose++; continue; }
    // The county gate has to sit on BOTH sides of the ratio. `n` is the sum of the per-county
    // buckets, so an organisation with a blank `Judet` can never enter it — and while this gate
    // stood after the keyword test, those 584 matches were dropped from the numerator while their
    // 2,246-strong parent set stayed in the denominator. That reported 30,939/116,342 = 26.6% for
    // a rate that is 31,523/116,342 = 27.1% counted either way round. Eighteenth time: correct
    // arithmetic, wrong set. Gate first, then count, so the headline equals what the map shows.
    const k = strip(String(r[iJ]).trim()).toUpperCase();
    if (!k) { noCounty++; continue; }
    pool++;
    const txt = strip(String(r[iN]) + ' ' + purpose);
    if (!re.test(txt)) continue;
    per[k] = (per[k] || 0) + 1; n++;
  }
  // `pool` is the denominator the rate is quoted against, because it is the set `n` was drawn
  // from. `withPurpose` and `noCounty` stay so the page can disclose what `pool` leaves out.
  ngo = { per, n, total, noPurpose, noCounty, pool, withPurpose: total - noPurpose };
  const sum = Object.values(per).reduce((a, b) => a + b, 0);
  if (sum !== n) throw new Error(`per-county buckets sum to ${sum} but n is ${n} — the headline no longer equals what the map shows`);
  if (pool + noCounty + noPurpose !== total) throw new Error(`${pool} + ${noCounty} + ${noPurpose} != ${total} — the exclusions do not partition the register`);
  console.log(`NGO register: ${n.toLocaleString('en')} education-keyword matches of ${pool.toLocaleString('en')} that state a purpose and record a county = ${(100 * n / pool).toFixed(1)}%`);
  console.log(`  excluded first: ${noPurpose.toLocaleString('en')} no purpose text · ${noCounty.toLocaleString('en')} no county · total register ${total.toLocaleString('en')}`);
}

// --- candidate NGOs per county (model/ngos.js). Kept as a county-bucketed lookup, not 31,716
// rows inline: the page is already ~1.5 MB.
// J1 profiles, if model/classify_ngos.js has been run. Optional on purpose: the page must build and
// work on a clone that has never called an API, and it does — without this file every candidate is
// simply "purpose not verified", exactly as before. §8's degraded mode is not a banner bolted on
// afterwards, it is the state the pipeline is already in when the file is absent.
let ngoProfiles = null;
const PROF = 'out/ngo_profiles.json';
if (fs.existsSync(PROF)) {
  try {
    const j = JSON.parse(fs.readFileSync(PROF, 'utf8'));
    ngoProfiles = j.profiles || null;
  } catch (e) { console.log(`warning: ${PROF} is unreadable (${e.message}) — building without J1 profiles`); }
}
// Same composite key as model/classify_ngos.js. The register number alone is not unique (3,186
// collisions register-wide, 9 inside the candidate list), so joining on it would attach one
// organisation's verdict to another's card.
const stripD = v => String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const keyOf = (reg, name) => `${String(reg || '').trim()}|${stripD(name).toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 60)}`;

let ngoByCounty = null;
const CAND = 'out/ngo_candidates.csv';
if (fs.existsSync(CAND)) {
  const cr = parseCSV(fs.readFileSync(CAND, 'utf8').replace(/^﻿/, '')).filter(r => r.length > 4);
  const ch = cr[0], cx = n => ch.indexOf(n);
  const [kReg, kName, kCty, kLoc, kLat, kLon, kUtil, kEdu] =
    ['reg', 'name', 'county', 'locality', 'lat', 'lon', 'public_utility', 'education_in_name'].map(cx);
  ngoByCounty = {};
  let prof = 0, relYes = 0, relNo = 0, relNull = 0;
  for (const r of cr.slice(1)) {
    const c = r[kCty];
    const row = [
      r[kName], r[kLoc], num(r[kLat], 4), num(r[kLon], 4),
      (r[kUtil] === '1' ? 1 : 0) | (r[kEdu] === '1' ? 2 : 0), r[kReg],
    ];
    const p = ngoProfiles && ngoProfiles[keyOf(r[kReg], r[kName])];
    if (p) {
      prof++;
      if (p.education_relevant === true) relYes++;
      else if (p.education_relevant === false) relNo++;
      else relNull++;
      // rel: 1 = the model read the purpose and says yes · 0 = says no · null = abstained because
      // its evidence span was not verbatim in the source. The quote ships with the verdict: a
      // recommendation a director cannot check against the register is worth no more than the regex.
      row.push(p.education_relevant === true ? 1 : p.education_relevant === false ? 0 : null,
               (p.evidence || '').slice(0, 240),
               (p.programme_types || []).join('|'));
    }
    (ngoByCounty[c] = ngoByCounty[c] || []).push(row);
  }
  console.log(`NGO candidates: ${cr.length - 1} rows across ${Object.keys(ngoByCounty).length} counties`);
  if (ngoProfiles) console.log(`J1 profiles joined: ${prof} of ${cr.length - 1} (${relYes} education-relevant, ${relNo} rejected, ${relNull} abstained)`);
  else console.log(`J1 profiles: none (${PROF} absent) — candidates ship as "purpose not verified"`);
}

const payload = {
  generated: new Date().toISOString().slice(0, 10),
  fields: FIELDS,
  counties,
  uats,
  ngo,
  ngoCand: ngoByCounty,
  ngoProfiled: !!ngoProfiles,
  rows: out,
};

// The payload is positional, so a FIELDS list one shorter than the rows does not fail — it silently
// shifts every field after the gap and the page reads `flags` out of `inboxN`. That is exactly what
// happened while adding geo_source, and the only reason it was caught is that a coverage count moved.
// Assert it instead of trusting it.
for (const r of out) {
  if (r.length !== FIELDS.length) {
    throw new Error(`payload row has ${r.length} values but FIELDS names ${FIELDS.length} — every field after the mismatch would be read from the wrong column`);
  }
}

const js = `${START}\nconst DATA=${JSON.stringify(payload)};\n${END}`;

const app = fs.readFileSync(APP, 'utf8');
const a = app.indexOf(START), b = app.indexOf(END);
if (a < 0 || b < 0) throw new Error(`${APP}: markers ${START} ... ${END} not found`);
fs.writeFileSync(APP, app.slice(0, a) + js + app.slice(b + END.length), 'utf8');

// The contact sidecar, next to the page so a plain <script src="contacts.js"> reaches it over
// file:// as well as http://. Gitignored: regenerate with `npm run index && npm run app`.
const CONTACTS = path.join(path.dirname(APP), 'contacts.js');
const cjs = `// GENERATED by model/build_app_data.js — not in git (see .gitignore), regenerate with \`npm run app\`.\n`
  + `// ${Object.keys(contacts).length} contact addresses from the ministry's retea_scolara, keyed by COD SIIIR.\n`
  + `// Personal data: do not commit, do not publish, do not paste into anything that leaves this machine.\n`
  + `window.CONTACTS=${JSON.stringify(contacts)};\n`;
fs.writeFileSync(CONTACTS, cjs, 'utf8');

const rural = out.filter(r => r[4] === 1).length;
const gi = FIELDS.indexOf('geo');
const geo = out.filter(r => r[gi] === 1).length;
const communeGeo = out.filter(r => r[gi] === 2).length;
const noGeo = out.filter(r => r[gi] === 0).length;
const di = FIELDS.indexOf('dep'), fi = FIELDS.indexOf('flags');
const withDep = out.filter(r => r[di] !== null).length;
const covered = out.filter(r => r[fi] & 6).length;
console.log(`${out.length} schools baked into ${APP} (${rural} rural, ${geo} geocoded, ${communeGeo} placed at commune level, ${noGeo} with no position, ${withDep} with deprivation, ${covered} with a programme)`);
console.log(`counties ${counties.length}, UAT names pooled ${uats.length}, payload ${(js.length / 1024).toFixed(0)} KB`);
console.log(`${Object.keys(contacts).length} contacts + ${inboxId.size} distinct inboxes written to ${CONTACTS} (gitignored; the page holds group ids only)`);
