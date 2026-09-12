// School need index for the grade 8 -> 9 cliff — Node port of need_index.py, run against the
// real data.gov.ro files (XLSX, one row per candidate, keyed by COD SIIIR; the EN files carry
// no school name or county, so both come from the ministry school-network file).
//
// Usage: node need_index.js data/en_*.xlsx \
//          --network data/retea_scolara_2025_2026.xlsx --coords data/scoli_coordonate_2017.xlsx --out out
// Needs: npm install xlsx
//
// Model is identical to need_index.py: per school, share of present candidates with
// MEDIA < 5, pooled over years; Beta(a, b) prior fitted by weighted method of moments per
// county x mediu; shrunk rate = (fails + a) / (n + a + b); p90 from the Beta posterior;
// need_per_year = shrunk rate x candidates per year.
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { loadDeprivation } = require('./deprivation');

const FAIL_THRESHOLD = 5.0;

// SIRUTA county codes = first two digits of COD SIIIR (42 codes seen in EN 2023–2026).
// Verified against "Judet PJ" in the school-network file; see the match report at the end of a run.
const COUNTY = {
  '01': 'Alba', '02': 'Arad', '03': 'Argeș', '04': 'Bacău', '05': 'Bihor', '06': 'Bistrița-Năsăud',
  '07': 'Botoșani', '08': 'Brașov', '09': 'Brăila', '10': 'Buzău', '11': 'Caraș-Severin', '12': 'Cluj',
  '13': 'Constanța', '14': 'Covasna', '15': 'Dâmbovița', '16': 'Dolj', '17': 'Galați', '18': 'Gorj',
  '19': 'Harghita', '20': 'Hunedoara', '21': 'Ialomița', '22': 'Iași', '23': 'Ilfov', '24': 'Maramureș',
  '25': 'Mehedinți', '26': 'Mureș', '27': 'Neamț', '28': 'Olt', '29': 'Prahova', '30': 'Satu Mare',
  '31': 'Sălaj', '32': 'Sibiu', '33': 'Suceava', '34': 'Teleorman', '35': 'Timiș', '36': 'Tulcea',
  '37': 'Vaslui', '38': 'Vâlcea', '39': 'Vrancea', '40': 'București', '51': 'Călărași', '52': 'Giurgiu',
};
const BY_ABBR = {
  AB: 'Alba', AR: 'Arad', AG: 'Argeș', BC: 'Bacău', BH: 'Bihor', BN: 'Bistrița-Năsăud', BT: 'Botoșani',
  BV: 'Brașov', BR: 'Brăila', BZ: 'Buzău', CS: 'Caraș-Severin', CL: 'Călărași', CJ: 'Cluj', CT: 'Constanța',
  CV: 'Covasna', DB: 'Dâmbovița', DJ: 'Dolj', GL: 'Galați', GR: 'Giurgiu', GJ: 'Gorj', HR: 'Harghita',
  HD: 'Hunedoara', IL: 'Ialomița', IS: 'Iași', IF: 'Ilfov', MM: 'Maramureș', MH: 'Mehedinți', MS: 'Mureș',
  NT: 'Neamț', OT: 'Olt', PH: 'Prahova', SM: 'Satu Mare', SJ: 'Sălaj', SB: 'Sibiu', SV: 'Suceava',
  TR: 'Teleorman', TM: 'Timiș', TL: 'Tulcea', VS: 'Vaslui', VL: 'Vâlcea', VN: 'Vrancea', B: 'București',
};

// ---------- Beta distribution helpers (for the p90 credible bound) ----------
function lgamma(x) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091,
    -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x, tmp = x + 5.5, ser = 1.000000000190015;
  tmp -= (x + 0.5) * Math.log(tmp);
  for (const c of g) ser += c / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}
function betacf(a, b, x) {
  const EPS = 3e-14, FPMIN = 1e-300;
  let qab = a + b, qap = a + 1, qam = a - 1, c = 1, d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d; let h = d;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; const del = d * c; h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}
function ibeta(x, a, b) { // regularized incomplete beta I_x(a, b)
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
}
function betaPpf(p, a, b) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 60; i++) { const mid = (lo + hi) / 2; if (ibeta(mid, a, b) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
function fitBeta(rates, weights) { // weighted method of moments; weak prior fallback
  if (rates.length < 3) return [1, 1];
  const W = weights.reduce((s, w) => s + w, 0);
  let mu = rates.reduce((s, r, i) => s + r * weights[i], 0) / W;
  const v = rates.reduce((s, r, i) => s + (r - mu) ** 2 * weights[i], 0) / W;
  mu = Math.min(Math.max(mu, 1e-3), 1 - 1e-3);
  if (v <= 0 || v >= mu * (1 - mu)) return [mu * 2, (1 - mu) * 2];
  const k = mu * (1 - mu) / v - 1;
  return [mu * k, (1 - mu) * k];
}

// ---------- args ----------
const args = process.argv.slice(2);
function opt(name) { const i = args.indexOf(name); return i >= 0 ? args.splice(i, 2)[1] : null; }
const outDir = opt('--out') || '.';
const networkFile = opt('--network');
const coordsFile = opt('--coords');
// Deprivation layer (see deprivation.js). --no-deprivation turns it off; the weight sets how
// much purchasing power counts against exam results in `priority_score` (0 = results only).
const sirutaFile = opt('--siruta') || 'data/siruta_2026.csv';
const budgetFile = opt('--budget') || 'data/uat_venituri_2025.xlsx';
const popFile = opt('--population') || 'data/uat_populatie_2023.xlsx';
const noDeprivation = args.includes('--no-deprivation') && args.splice(args.indexOf('--no-deprivation'), 1);
const noCoverage = args.includes('--no-coverage') && args.splice(args.indexOf('--no-coverage'), 1);
const depWeight = Number(opt('--deprivation-weight') ?? 0.5);
const files = args;
if (!files.length) { console.error('usage: node need_index.js en_YYYY.xlsx ... [--network f] [--coords f] [--out dir]'); process.exit(1); }

const sheetRows = (f, sheet) => {
  const wb = XLSX.readFile(f, { dense: true });
  return XLSX.utils.sheet_to_json(wb.Sheets[sheet || wb.SheetNames[0]], { header: 1, defval: '' });
};

// ---------- load EN candidates ----------
const schools = new Map();
const national = {}; // year|mediu -> {present, fail}
for (const f of files) {
  const year = (path.basename(f).match(/20\d\d/) || ['na'])[0];
  const rows = sheetRows(f);
  const H = rows[0].map(h => String(h).trim().toUpperCase());
  const col = name => { const i = H.indexOf(name); if (i < 0) throw new Error(`${f}: no column ${name}`); return i; };
  const iCode = col('COD SIIIR'), iMediu = col('MEDIU'), iAvg = col('MEDIA'), iMath = col('NOTA FINALA MATEMATICA');
  for (const r of rows.slice(1)) {
    const code = String(r[iCode]).trim();
    if (!code) continue;
    const mediu = String(r[iMediu]).trim().toLowerCase();
    const avg = typeof r[iAvg] === 'number' ? r[iAvg] : parseFloat(String(r[iAvg]).replace(',', '.'));
    const math = typeof r[iMath] === 'number' ? r[iMath] : parseFloat(String(r[iMath]).replace(',', '.'));
    let s = schools.get(code);
    if (!s) {
      s = { code, county: COUNTY[code.slice(0, 2)] || `?${code.slice(0, 2)}`, rows: 0, present: 0, fail: 0,
        mathFail: 0, sumAvg: 0, years: new Set(), mediuCount: {}, byYear: {} };
      schools.set(code, s);
    }
    s.rows++; s.years.add(year);
    s.mediuCount[mediu] = (s.mediuCount[mediu] || 0) + 1;
    const y = s.byYear[year] || (s.byYear[year] = { present: 0, fail: 0 });
    const nk = `${year}|${mediu}`; const nat = national[nk] || (national[nk] = { present: 0, fail: 0 });
    if (Number.isFinite(avg)) {
      s.present++; s.sumAvg += avg; y.present++; nat.present++;
      if (avg < FAIL_THRESHOLD) { s.fail++; y.fail++; nat.fail++; }
      if (Number.isFinite(math) && math < FAIL_THRESHOLD) s.mathFail++;
    }
  }
  console.log(`loaded ${f}: ${rows.length - 1} candidates`);
}

// ---------- school identity: name, locality, contact (school-network file) ----------
const unitMap = new Map(), pjMap = new Map();
if (networkFile) {
  const rows = sheetRows(networkFile, 'Export');
  const hdr = rows.findIndex(r => String(r[0]).trim() === 'An');
  const H = rows[hdr].map(h => String(h).trim());
  const c = n => H.indexOf(n);
  const [iJud, iLocPJ, iSiirPJ, iDenPJ, iLoc, iSir, iMed, iSiir, iDen, iTip, iStat, iTel, iMail] =
    ['Judet PJ', 'Localitate PJ', 'Cod SIIIR PJ', 'Denumire PJ', 'Localitate unitate', 'Cod SIRUTA unitate',
      'Mediu loc. unitate', 'Cod SIIIR unitate', 'Denumire lunga unitate', 'Tip unitate', 'Statut unitate',
      'Telefon', 'Email'].map(c);
  for (const r of rows.slice(hdr + 1)) {
    const code = String(r[iSiir]).trim();
    if (!code) continue;
    const rec = {
      county: BY_ABBR[String(r[iJud]).trim().toUpperCase()] || String(r[iJud]).trim(),
      locality: String(r[iLoc] || r[iLocPJ]).trim(), siruta: String(r[iSir]).trim(),
      mediu: String(r[iMed]).trim().toLowerCase(), name: String(r[iDen]).trim(),
      tip: String(r[iTip]).trim(), statut: String(r[iStat]).trim(),
      phone: String(r[iTel]).trim(), email: String(r[iMail]).trim(),
      pjName: String(r[iDenPJ]).trim(), pjLocality: String(r[iLocPJ]).trim(),
    };
    if (!unitMap.has(code)) unitMap.set(code, rec);
    const pj = String(r[iSiirPJ]).trim();
    if (pj && !pjMap.has(pj)) pjMap.set(pj, { ...rec, name: rec.pjName, locality: rec.pjLocality });
  }
  console.log(`loaded ${networkFile}: ${unitMap.size} units, ${pjMap.size} legal entities (PJ)`);
}
const coords = new Map();
if (coordsFile) {
  const rows = sheetRows(coordsFile);
  for (const r of rows.slice(1)) {
    const code = String(r[0]).trim();
    const lat = Number(r[1]), lon = Number(r[2]);
    if (code && Number.isFinite(lat) && Number.isFinite(lon) && lat && lon) coords.set(code, [lat, lon]);
  }
  console.log(`loaded ${coordsFile}: ${coords.size} geocoded schools`);
}

// ---------- model ----------
const list = [...schools.values()];
let mixed = 0;
for (const s of list) {
  const e = Object.entries(s.mediuCount).sort((a, b) => b[1] - a[1]);
  s.mediu = e[0][0]; if (e.length > 1) mixed++;
  s.rawRate = s.present ? s.fail / s.present : NaN;
  s.group = `${s.county}|${s.mediu}`;
}
const groups = {};
for (const s of list) (groups[s.group] || (groups[s.group] = [])).push(s);
for (const g of Object.values(groups)) {
  const ok = g.filter(s => s.present > 0);
  const [a, b] = fitBeta(ok.map(s => s.rawRate), ok.map(s => s.present));
  for (const s of g) {
    s.priorRate = a / (a + b);
    s.shrunk = Number(((s.fail + a) / (s.present + a + b)).toFixed(6));
    s.p90 = betaPpf(0.9, s.fail + a, s.present - s.fail + b);
    s.p10 = betaPpf(0.1, s.fail + a, s.present - s.fail + b);  // lower bound, for the app's interval bar
  }
}
let viaUnit = 0, viaPJ = 0, unmatched = 0, countyOk = 0, countyBad = 0;
const badExamples = [];
for (const s of list) {
  s.cpy = s.present / s.years.size;
  s.need = s.shrunk * s.cpy;
  s.absentRate = (s.rows - s.present) / s.rows;
  s.meanAvg = s.present ? s.sumAvg / s.present : NaN;
  const y26 = s.byYear['2026'];
  s.rate2026 = y26 && y26.present ? y26.fail / y26.present : NaN;
  s.n2026 = y26 ? y26.present : 0;
  const rec = unitMap.get(s.code) || pjMap.get(s.code);
  if (unitMap.has(s.code)) viaUnit++; else if (pjMap.has(s.code)) viaPJ++; else unmatched++;
  if (rec) {
    s.name = rec.name; s.locality = rec.locality; s.siruta = rec.siruta;
    s.tip = rec.tip; s.phone = rec.phone; s.email = rec.email;
    if (rec.county) {
      if (rec.county === s.county) countyOk++;
      else { countyBad++; if (badExamples.length < 5) badExamples.push(`${s.code}: prefix->${s.county} vs network->${rec.county}`); }
    }
  }
  const xy = coords.get(s.code);
  if (xy) { s.lat = xy[0]; s.lon = xy[1]; }
}

// ---------- deprivation / purchasing power (per UAT, joined on the school's locality SIRUTA) ----------
let dep = null, depHit = 0;
if (!noDeprivation && fs.existsSync(sirutaFile) && fs.existsSync(budgetFile) && fs.existsSync(popFile)) {
  dep = loadDeprivation({ siruta: sirutaFile, budget: budgetFile, population: popFile });
  console.log(`loaded deprivation layer: ${dep.stats.uats} UATs, median ${dep.stats.median.toFixed(0)} lei/capita income tax`);
  for (const s of list) {
    const d = s.siruta ? dep.forLocality(s.siruta) : null;
    if (!d) continue;
    depHit++;
    s.uatSiruta = d.siruta; s.uatName = d.name; s.uatPop = d.pop;
    s.incomeTaxPc = d.incomeTaxPc; s.equalizationPc = d.equalizationPc;
    s.deprivation = Number(d.deprivation.toFixed(6));
  }
  console.log(`deprivation join: ${depHit}/${list.length} schools matched to a UAT budget`);
} else if (!noDeprivation) {
  console.log('deprivation layer skipped (missing one of: siruta/budget/population file)');
}

// ---------- coverage: who already has a programme (see coverage.js) ----------
let covMap = null;
if (!noCoverage && fs.existsSync('data/masa/masa_2026.txt')) {
  try {
    const { loadCoverage } = require('./coverage');
    const { cov } = loadCoverage({ network: networkFile });
    covMap = cov;
    let hit = 0;
    for (const s of list) {
      const c = covMap.get(s.code);
      if (!c) continue;
      hit++;
      s.pnrasEligible = c.eligible; s.pnrasPriority = c.priority;
      s.pnrasGrant = c.grant; s.masa = c.masa;
      const tags = [];
      if (c.grant) tags.push('PNRAS grant');
      if (c.masa) tags.push('Masă sănătoasă');
      if (c.eligible) tags.push('PNRAS eligible');
      s.coverage = tags.join('; ');
    }
    console.log(`coverage join: ${hit}/${list.length} schools carry at least one programme flag`);
  } catch (e) {
    console.log(`coverage layer skipped: ${e.message}`);
  }
} else if (!noCoverage) {
  console.log('coverage layer skipped (run `python3 model/extract_pdfs.py` first)');
}

// ---------- shared inboxes ----------
// 1,956 of the 6,037 schools that have an email share it with another school. That is not dirty
// data: it is `școală coordonatoare` + `structuri arondate` — subordinate units under one
// administration and one inbox. It matters because anything that drafts outreach must group by
// inbox, or a six-school shortlist sends three separate mails to the same person, each opening as
// though the school were a stranger to us.
{
  const byInbox = new Map();
  for (const s of list) {
    const e = (s.email || '').toLowerCase().trim();
    if (!e) continue;
    if (!byInbox.has(e)) byInbox.set(e, []);
    byInbox.get(e).push(s);
  }
  for (const [e, group] of byInbox) for (const s of group) { s.inbox = e; s.inboxSchools = group.length; }
  const shared = [...byInbox.values()].filter(g => g.length > 1);
  console.log(`inboxes: ${byInbox.size} distinct for ${list.filter(s => s.email).length} schools with an address; ` +
    `${shared.length} shared by ${shared.reduce((a, g) => a + g.length, 0)} schools`);
}

// `priority_score` blends two percentiles, both 0..1 and both "higher = worse":
//   - where the exam results are worst (fail_rate_shrunk, ranked across all schools)
//   - where the money is thinnest (deprivation, ranked across all UATs)
// Kept as a blend of ranks rather than raw values so one long tail cannot dominate the other.
{
  const scored = list.filter(s => s.present > 0).sort((a, b) => a.shrunk - b.shrunk);
  scored.forEach((s, i) => { s.failPct = scored.length > 1 ? i / (scored.length - 1) : 0.5; });
  const w = Math.min(Math.max(depWeight, 0), 1);
  for (const s of list) {
    if (!Number.isFinite(s.failPct)) continue;
    s.priority = Number.isFinite(s.deprivation)
      ? (1 - w) * s.failPct + w * s.deprivation
      : s.failPct;   // no budget match: fall back to exam results alone rather than guessing
  }
}

// ---------- output ----------
const q = v => {
  const t = v === undefined || v === null || (typeof v === 'number' && !Number.isFinite(v)) ? '' : String(v);
  return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
};
const f3 = x => Number.isFinite(x) ? x.toFixed(3) : '';
// deprivation and priority are compared against hard thresholds (>=0.8 / <=0.2) downstream, so
// 3dp rounding flips schools across an archetype boundary and anyone recomputing from this CSV
// gets different counts than our own report. Export them at full working precision.
const f6 = x => Number.isFinite(x) ? x.toFixed(6) : '';
function rankAndWrite(subset, file) {
  subset.sort((a, b) => b.need - a.need);
  const byRate = [...subset].sort((a, b) => b.shrunk - a.shrunk);
  const rr = new Map(); byRate.forEach((s, i) => rr.set(s, i + 1));
  const head = ['rank_need', 'siiir_code', 'school', 'locality', 'county', 'mediu', 'siruta', 'tip_unitate',
    'lat', 'lon', 'phone', 'email', 'years', 'candidates_per_year', 'n_fail', 'raw_fail_rate',
    'fail_rate_shrunk', 'fail_rate_p10', 'fail_rate_p90', 'county_prior_rate', 'need_per_year', 'absent_rate', 'mean_avg',
    'n_present_2026', 'raw_fail_rate_2026', 'rank_rate',
    'uat_siruta', 'uat_name', 'uat_population', 'income_tax_per_capita', 'equalization_per_capita',
    'deprivation_score', 'priority_score',
    'inbox', 'inbox_schools',
    'pnras_eligible', 'pnras_priority', 'pnras_grant', 'masa_sanatoasa',
    'coverage_programmes'];
  const lines = [head.join(',')];
  subset.forEach((s, i) => lines.push([i + 1, s.code, s.name, s.locality, s.county, s.mediu, s.siruta, s.tip,
    s.lat, s.lon, s.phone, s.email, s.years.size, f3(s.cpy), s.fail, f3(s.rawRate), f6(s.shrunk), f3(s.p10), f3(s.p90),
    f3(s.priorRate), f3(s.need), f3(s.absentRate), f3(s.meanAvg), s.n2026, f3(s.rate2026), rr.get(s),
    s.uatSiruta, s.uatName, s.uatPop,
    Number.isFinite(s.incomeTaxPc) ? s.incomeTaxPc.toFixed(1) : '',
    Number.isFinite(s.equalizationPc) ? s.equalizationPc.toFixed(1) : '',
    f6(s.deprivation), f6(s.priority),
    s.inbox || '', s.inboxSchools || '',
    s.pnrasEligible || 0, s.pnrasPriority || '', s.pnrasGrant || 0, s.masa || 0,
    s.coverage || '']
    .map(q).join(',')));
  fs.writeFileSync(path.join(outDir, file), '﻿' + lines.join('\n'), 'utf8');
  return subset;
}
fs.mkdirSync(outDir, { recursive: true });
rankAndWrite([...list], 'schools_need_index.csv');
const rural = rankAndWrite(list.filter(s => s.mediu === 'rural'), 'schools_need_index_rural.csv');

const cs = {};
for (const s of list) {
  const c = cs[s.county] || (cs[s.county] = { schools: 0, rural_schools: 0, cand: 0, need: 0, rural_cand: 0, rural_need: 0, prior_rural: NaN, prior_urban: NaN });
  c.schools++; c.cand += s.cpy; c.need += s.need;
  if (s.mediu === 'rural') { c.rural_schools++; c.rural_cand += s.cpy; c.rural_need += s.need; c.prior_rural = s.priorRate; }
  else c.prior_urban = s.priorRate;
}
const cl = Object.entries(cs).sort((a, b) => b[1].rural_need - a[1].rural_need);
fs.writeFileSync(path.join(outDir, 'counties_summary.csv'), '﻿' + ['county,schools,rural_schools,candidates_per_year,need_per_year,rural_candidates_per_year,rural_need_per_year,rural_share_below5,prior_fail_rate_rural,prior_fail_rate_urban',
  ...cl.map(([k, c]) => [k, c.schools, c.rural_schools, c.cand.toFixed(1), c.need.toFixed(1), c.rural_cand.toFixed(1),
    c.rural_need.toFixed(1), f3(c.rural_need / c.rural_cand), f3(c.prior_rural), f3(c.prior_urban)].map(q).join(','))].join('\n'), 'utf8');

// ---------- report ----------
console.log(`\n${list.length} schools (${rural.length} rural); ${mixed} schools have mixed MEDIU labels (majority used)`);
if (networkFile) {
  console.log(`identity join: ${viaUnit} matched as a unit, ${viaPJ} via the legal entity (PJ), ${unmatched} unmatched`);
  console.log(`county check (SIIIR prefix vs network): ${countyOk} agree, ${countyBad} differ ${badExamples.length ? JSON.stringify(badExamples) : ''}`);
}
if (coordsFile) console.log(`coordinates: ${list.filter(s => s.lat).length}/${list.length} schools geocoded (${rural.filter(s => s.lat).length}/${rural.length} rural)`);
console.log('\nNational share of present candidates with MEDIA < 5:');
for (const y of ['2023', '2024', '2025', '2026']) {
  const r = national[`${y}|rural`], u = national[`${y}|urban`];
  if (r) console.log(`  ${y}: rural ${(100 * r.fail / r.present).toFixed(1)}% (${r.fail}/${r.present}), urban ${(100 * u.fail / u.present).toFixed(1)}% (${u.fail}/${u.present})`);
}
console.log('\nTop 12 rural schools by need_per_year:');
rural.slice(0, 12).forEach((s, i) => console.log(`  ${String(i + 1).padStart(2)} ${(s.name || s.code).slice(0, 44).padEnd(44)} ${(s.locality || '').slice(0, 18).padEnd(18)} ${s.county.padEnd(14)} need ${s.need.toFixed(1).padStart(5)} shrunk ${(100 * s.shrunk).toFixed(0)}%`));
// ---------- does purchasing power actually explain anything the exam doesn't? ----------
if (dep) {
  const ok = rural.filter(s => s.present >= 10 && Number.isFinite(s.incomeTaxPc) && s.incomeTaxPc > 0);
  const xs = ok.map(s => Math.log(s.incomeTaxPc)), ys = ok.map(s => s.shrunk);
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length, my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < xs.length; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  const r = sxy / Math.sqrt(sxx * syy);
  console.log(`\nPurchasing power vs exam failure, ${ok.length} rural schools with >=10 candidates:`);
  console.log(`  Pearson r = ${r.toFixed(3)} between log(income tax per capita) and fail_rate_shrunk (r^2 = ${(r * r).toFixed(3)})`);

  const byInc = [...ok].sort((a, b) => a.incomeTaxPc - b.incomeTaxPc);
  const n = byInc.length;
  console.log('  decile of commune income tax per capita -> mean share of pupils below 5:');
  for (let d = 0; d < 10; d++) {
    const g = byInc.slice(Math.floor(d * n / 10), Math.floor((d + 1) * n / 10));
    const mean = g.reduce((a, s) => a + s.shrunk, 0) / g.length;
    const lei = g.reduce((a, s) => a + s.incomeTaxPc, 0) / g.length;
    console.log(`    D${d + 1} ${String(Math.round(lei)).padStart(5)} lei/cap  ${(100 * mean).toFixed(1)}%  ${'#'.repeat(Math.round(mean * 60))}`);
  }
  // Same cut the app's archetype() uses — worst quartile — so the slide and the live demo
  // cannot disagree. The shrunk rate already handles small schools, so no candidate-count
  // filter here; `present >= 10` stays on the correlation above, where it belongs.
  const poorAndFailing = rural.filter(s => s.deprivation >= 0.8 && s.failPct >= 0.75).length;
  const richAndFailing = rural.filter(s => s.deprivation <= 0.2 && s.failPct >= 0.75).length;
  console.log(`  rural, worst quartile AND poorest fifth of communes: ${poorAndFailing}`);
  console.log(`  rural, worst quartile in a well-off commune: ${richAndFailing} (money is not the binding constraint there)`);
}

// ---------- does the ministry's own risk list agree with ours? ----------
// PNRAS "eligible" is the Ministry of Education's independent judgement of which schools are at
// high dropout risk, built from its own indicators. It is the only external ranking we can check
// against, and the disagreements are the product's argument.
if (covMap) {
  const scored = rural.filter(s => Number.isFinite(s.failPct));
  const flagged = scored.filter(s => s.pnrasEligible);
  if (flagged.length) {
    const meanPct = flagged.reduce((a, s) => a + s.failPct, 0) / flagged.length;
    const scoredAll = list.filter(s => Number.isFinite(s.failPct)).length;
    console.log(`\nMinistry risk list (PNRAS eligible) vs our index, ${scored.length} rural schools:`);
    console.log(`  ${flagged.length} of them are on the ministry list; their mean percentile in our ranking is ${(100 * meanPct).toFixed(0)} (50 = no agreement)`);
    const topQ = scored.filter(s => s.failPct >= 0.75);
    const inBoth = topQ.filter(s => s.pnrasEligible).length;
    console.log(`  ${topQ.length} rural schools sit in the NATIONAL worst quartile (percentile over all ${scoredAll} schools, urban included) — that is ${(100 * topQ.length / scored.length).toFixed(0)}% of rural schools, because rural schools are worse on average`);
    console.log(`  of those ${topQ.length}, the ministry flagged ${inBoth} (${(100 * inBoth / topQ.length).toFixed(0)}%)`);

    // The two lists the product is actually for.
    const covered = s => s.pnrasGrant || s.masa;
    const quickWins = topQ.filter(s => s.pnrasEligible && !s.pnrasGrant).length;
    const nobody = topQ.filter(s => !covered(s) && !s.pnrasEligible);
    console.log(`  QUICK WINS — ministry already flagged, no grant yet: ${quickWins} (a DIFFERENT set from the well-off-commune schools below — do not let the two counts collide on a slide)`);
    console.log(`  NO ONE IS HERE — worst quartile, no grant, no meal, not even on the ministry list: ${nobody.length}`);
    console.log(`    CAVEAT: one of the three ministry eligibility lists (PNRAS R2 S2, 63 pages) is a`);
    console.log(`    scanned image we cannot read, so the ministry list here is incomplete. Roughly`);
    console.log(`    900 more flagged schools are missing, which means ${nobody.length} is an UPPER BOUND.`);
    nobody.sort((a, b) => b.need - a.need).slice(0, 8).forEach(s =>
      console.log(`    ${(s.name || s.code).slice(0, 42).padEnd(42)} ${(s.locality || '').slice(0, 16).padEnd(16)} ${s.county.padEnd(13)} need ${s.need.toFixed(1).padStart(5)} shrunk ${(100 * s.shrunk).toFixed(0)}%`));
  }
  const anyCov = rural.filter(s => s.pnrasGrant || s.masa).length;
  console.log(`\ncoverage of rural schools: ${rural.filter(s => s.pnrasGrant).length} PNRAS grant, ${rural.filter(s => s.masa).length} Masă sănătoasă, ${anyCov} with either (${rural.length} rural total)`);
}

const cal = rural.filter(s => s.county === 'Călărași');
// The pilot flow needs BOTH: place the school on the map, then write to it. The email count and
// the geocoded count are the same size here by coincidence, not the same set — 4 schools have an
// address and no coordinates, a different 4 have coordinates and no address.
const calBoth = cal.filter(s => s.email && s.lat);
const calInbox = new Set(calBoth.map(s => s.inbox));
console.log(`\nCălărași pilot: ${cal.length} rural schools · ${cal.filter(s => s.email).length} with an email · ${cal.filter(s => s.lat).length} geocoded · ${calBoth.length} with BOTH -> ${calInbox.size} distinct inboxes.`);
console.log(`  The two ${cal.filter(s => s.email).length}s are different sets. ${calBoth.length} schools can complete the flow end to end, reaching ${calInbox.size} parties. Top 6 by need:`);
cal.slice(0, 6).forEach(s => console.log(`  ${(s.name || s.code).slice(0, 44).padEnd(44)} ${(s.locality || '').padEnd(16)} need ${s.need.toFixed(1).padStart(5)} 2026 raw ${(100 * s.rate2026).toFixed(0)}% (n=${s.n2026})`));
