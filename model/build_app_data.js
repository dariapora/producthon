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
  mediu: ix('mediu'), lat: ix('lat'), lon: ix('lon'), email: ix('email'),
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

const out = [];
for (const r of rows.slice(1)) {
  const code = r[col.code];
  if (!code) continue;
  out.push([
    code,
    r[col.school] || '',
    r[col.locality] || '',
    pool(counties, countyIx, r[col.county]),
    r[col.mediu] === 'rural' ? 1 : 0,
    num(r[col.lat], 4), num(r[col.lon], 4),
    r[col.email] || '',
    num(r[col.cpy], 1),
    num(r[col.raw]), num(r[col.shrunk], 6), num(r[col.p10]), num(r[col.p90]), num(r[col.prior]),
    num(r[col.need], 1), num(r[col.absent]),
    parseInt(r[col.n2026], 10) || 0, parseInt(r[col.years], 10) || 0, num(r[col.mean], 2),
    pool(uats, uatIx, r[col.uat]),
    parseInt(r[col.pop], 10) || null,
    num(r[col.inc], 0),
    num(r[col.dep], 6), num(r[col.pri], 6),
    r[col.inbox] || '', parseInt(r[col.inboxN], 10) || 1,   // 5dp: at 3dp, rounding flips schools across the dep>=0.8 / <=0.2 archetype boundaries and the app disagrees with the model by a couple of rows
    (r[col.pe] === '1' ? 1 : 0) | (r[col.pg] === '1' ? 2 : 0) | (r[col.ms] === '1' ? 4 : 0),
  ]);
}

// column names, in payload order — mirrored by inflate() in the app
const FIELDS = ['code', 'school', 'locality', 'ci', 'rural', 'lat', 'lon', 'email',
  'perYear', 'raw', 'shr', 'lo', 'hi', 'prior', 'need', 'absent', 'n2026', 'nyears', 'meanAvg',
  'ui', 'uatPop', 'income', 'dep', 'prio', 'inbox', 'inboxN', 'flags'];

// --- NGO register: education-purpose counts per county -------------------------
// Baked so the page needs no upload. This is the KEYWORD match, and its precision is poor —
// it flags 24.3% of every NGO in Romania (MATCHMAKING.md §5). Labelled as provisional in the UI
// until the classification job (J1) replaces it.
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
  const per = {}; let n = 0, total = 0;
  for (const r of rs.slice(1)) {
    if (!String(r[iN]).trim()) continue;
    total++;
    const txt = strip(String(r[iN]) + ' ' + scopeCols.map(i => r[i]).join(' '));
    if (!re.test(txt)) continue;
    const k = strip(String(r[iJ]).trim()).toUpperCase();
    if (!k) continue;
    per[k] = (per[k] || 0) + 1; n++;
  }
  ngo = { per, n, total };
  console.log(`NGO register: ${n.toLocaleString('en')} education-keyword matches of ${total.toLocaleString('en')} registered`);
}

// --- candidate NGOs per county (model/ngos.js). Kept as a county-bucketed lookup, not 31,716
// rows inline: the page is already ~1.5 MB.
let ngoByCounty = null;
const CAND = 'out/ngo_candidates.csv';
if (fs.existsSync(CAND)) {
  const cr = parseCSV(fs.readFileSync(CAND, 'utf8').replace(/^﻿/, '')).filter(r => r.length > 4);
  const ch = cr[0], cx = n => ch.indexOf(n);
  const [kReg, kName, kCty, kLoc, kLat, kLon, kUtil, kEdu] =
    ['reg', 'name', 'county', 'locality', 'lat', 'lon', 'public_utility', 'education_in_name'].map(cx);
  ngoByCounty = {};
  for (const r of cr.slice(1)) {
    const c = r[kCty];
    (ngoByCounty[c] = ngoByCounty[c] || []).push([
      r[kName], r[kLoc], num(r[kLat], 4), num(r[kLon], 4),
      (r[kUtil] === '1' ? 1 : 0) | (r[kEdu] === '1' ? 2 : 0), r[kReg],
    ]);
  }
  console.log(`NGO candidates: ${cr.length - 1} rows across ${Object.keys(ngoByCounty).length} counties`);
}

const payload = {
  generated: new Date().toISOString().slice(0, 10),
  fields: FIELDS,
  counties,
  uats,
  ngo,
  ngoCand: ngoByCounty,
  rows: out,
};

const js = `${START}\nconst DATA=${JSON.stringify(payload)};\n${END}`;

const app = fs.readFileSync(APP, 'utf8');
const a = app.indexOf(START), b = app.indexOf(END);
if (a < 0 || b < 0) throw new Error(`${APP}: markers ${START} ... ${END} not found`);
fs.writeFileSync(APP, app.slice(0, a) + js + app.slice(b + END.length), 'utf8');

const rural = out.filter(r => r[4] === 1).length;
const geo = out.filter(r => r[5] !== null).length;
const di = FIELDS.indexOf('dep'), fi = FIELDS.indexOf('flags');
const withDep = out.filter(r => r[di] !== null).length;
const covered = out.filter(r => r[fi] & 6).length;
console.log(`${out.length} schools baked into ${APP} (${rural} rural, ${geo} geocoded, ${withDep} with deprivation, ${covered} with a programme)`);
console.log(`counties ${counties.length}, UAT names pooled ${uats.length}, payload ${(js.length / 1024).toFixed(0)} KB`);
