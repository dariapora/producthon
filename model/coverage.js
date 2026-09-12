// Coverage layer: which schools already have a programme running.
//
// Fills `coverage_programmes` in the school files, which the NGO matcher needs in order to skip
// schools that are already served (MATCHMAKING.md §7, filter 4).
//
// Three sources, two of them very different in kind — do not conflate them:
//
//   PNRAS ELIGIBLE   The ministry's own list of schools it judged at high risk of dropout, with
//                    its own composite risk index. This is NOT coverage: being on it means the
//                    ministry noticed you, not that anything happened. Its real value is as an
//                    independent check on our need index — see the agreement report at the end.
//   PNRAS GRANT      Schools whose funding application was admitted. This IS coverage: money and
//                    a project are running there (~€200-300k per project, PNRR C15).
//   MASĂ SĂNĂTOASĂ   Schools serving a free hot meal, 16.5 lei/pupil/day in 2026. Coverage of a
//                    different kind: it addresses attendance and hunger, not attainment.
//
// Inputs are the .txt files produced by `python3 model/extract_pdfs.py` (the ministry publishes
// all three only as PDF). Run that first.
//
// Usage:  node model/coverage.js --network data/retea_scolara_2025_2026.xlsx --out out
//         npm run coverage

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const COUNTY_BY_ABBR = {
  AB: 'Alba', AR: 'Arad', AG: 'Argeș', BC: 'Bacău', BH: 'Bihor', BN: 'Bistrița-Năsăud',
  BT: 'Botoșani', BV: 'Brașov', BR: 'Brăila', BZ: 'Buzău', CS: 'Caraș-Severin', CL: 'Călărași',
  CJ: 'Cluj', CT: 'Constanța', CV: 'Covasna', DB: 'Dâmbovița', DJ: 'Dolj', GL: 'Galați',
  GR: 'Giurgiu', GJ: 'Gorj', HR: 'Harghita', HD: 'Hunedoara', IL: 'Ialomița', IS: 'Iași',
  IF: 'Ilfov', MM: 'Maramureș', MH: 'Mehedinți', MS: 'Mureș', NT: 'Neamț', OT: 'Olt',
  PH: 'Prahova', SM: 'Satu Mare', SJ: 'Sălaj', SB: 'Sibiu', SV: 'Suceava', TR: 'Teleorman',
  TM: 'Timiș', TL: 'Tulcea', VS: 'Vaslui', VL: 'Vâlcea', VN: 'Vrancea', B: 'București',
};

// ---------------------------------------------------------------- normalisation
// School names are written differently in every source: diacritics or not, quotes of four kinds,
// "Nr. 1" vs "NR.1", abbreviations. Fold all of it away before comparing.
function norm(s) {
  return String(s).toUpperCase()
    .replace(/[ȘŞŠ]/g, 'S').replace(/[ȚŢ]/g, 'T').replace(/[ĂÂÀÁÄ]/g, 'A').replace(/[Î]/g, 'I')
    .replace(/[ÔÓÖ]/g, 'O').replace(/[ÚÜ]/g, 'U').replace(/[ÉÈË]/g, 'E')
    .replace(/[„“”"'’‘]/g, ' ')
    .replace(/\bNR\.?\s*/g, 'NR ')
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}
const STOP = new Set(['SCOALA', 'GIMNAZIALA', 'LICEUL', 'LICEU', 'TEHNOLOGIC', 'TEORETIC',
  'COLEGIUL', 'NATIONAL', 'SCOALA GIMNAZIALA', 'DE', 'SI', 'A', 'AL', 'CU', 'PROGRAM',
  'PROFESIONALA', 'COMUNA', 'STRUCTURA', 'STRUCTURI']);
// Tokens that actually discriminate between two schools in the same county: the patron saint,
// the village, the number. Dropping the boilerplate is what makes the Jaccard fallback work.
function keyTokens(s) {
  return new Set(norm(s).split(' ').filter(t => t.length > 1 && !STOP.has(t)));
}
function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const t of a) if (b.has(t)) inter++;
  return inter / (a.size + b.size - inter);
}

// ---------------------------------------------------------------- school index
function loadSchools(networkFile) {
  const wb = XLSX.readFile(networkFile, { dense: true });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets['Export'], { header: 1, defval: '' });
  const hdr = rows.findIndex(r => String(r[0]).trim() === 'An');
  const H = rows[hdr].map(h => String(h).trim());
  const c = n => H.indexOf(n);
  const [iJud, iLoc, iSiir, iDen] =
    ['Judet PJ', 'Localitate unitate', 'Cod SIIIR unitate', 'Denumire lunga unitate'].map(c);

  const byCode = new Map();
  const byCounty = new Map();          // county -> [{code, name, locality, tokens}]
  for (const r of rows.slice(hdr + 1)) {
    const code = String(r[iSiir]).trim();
    if (!code || byCode.has(code)) continue;
    const county = COUNTY_BY_ABBR[String(r[iJud]).trim().toUpperCase()] || String(r[iJud]).trim();
    const rec = {
      code, county,
      name: String(r[iDen]).trim(),
      locality: String(r[iLoc]).trim(),
      nname: norm(r[iDen]),
      tokens: keyTokens(r[iDen]),
      nloc: norm(r[iLoc]),
    };
    byCode.set(code, rec);
    if (!byCounty.has(county)) byCounty.set(county, []);
    byCounty.get(county).push(rec);
  }
  return { byCode, byCounty };
}

// Resolve a free-text school name (+ county, + optional locality) to a SIIIR code.
// Exact normalised name first; then best token-overlap above a threshold, and only if it beats
// the runner-up clearly — an ambiguous match is worse than no match, because it silently marks
// the wrong school as covered.
function resolve(schools, county, name, locality) {
  const pool = schools.byCounty.get(county);
  if (!pool) return { code: null, how: 'no-county' };
  const nn = norm(name);
  const exact = pool.filter(s => s.nname === nn);
  if (exact.length === 1) return { code: exact[0].code, how: 'exact' };

  const want = keyTokens(name);
  const nloc = locality ? norm(locality) : null;
  let best = null, bestScore = 0, second = 0;
  for (const s of pool) {
    let score = jaccard(want, s.tokens);
    if (nloc && s.nloc === nloc) score += 0.25;            // same village is strong evidence
    if (score > bestScore) { second = bestScore; bestScore = score; best = s; }
    else if (score > second) second = score;
  }
  if (best && bestScore >= 0.5 && bestScore - second >= 0.12) {
    return { code: best.code, how: 'fuzzy', score: bestScore };
  }
  return { code: null, how: bestScore >= 0.5 ? 'ambiguous' : 'no-match', score: bestScore };
}

// A grant record's applicant field often has an all-caps project title glued to the front. Try
// the full string first, then progressively shorter tail-slices of it, and keep the best hit.
// The school name is always at the END of the span, so a suffix isolates it.
function resolveApplicant(schools, county, span) {
  const toks = span.split(/\s+/).filter(Boolean);
  let best = { code: null, how: 'no-match', score: 0 };
  for (const take of [toks.length, 12, 10, 8, 7, 6, 5, 4, 3]) {
    if (take > toks.length) continue;
    const cand = toks.slice(toks.length - take).join(' ');
    const r = resolve(schools, county, cand, null);
    if (r.how === 'exact') return r;
    if (r.code && (r.score || 0) > (best.score || 0)) best = r;
    else if (!best.code && r.how === 'ambiguous') best = r;
  }
  return best;
}

// ---------------------------------------------------------------- parsers
const read = f => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null);

// PNRAS eligible: rows carry COD SIIIR directly. r2s3 also carries a HIGH/MEDIUM/LOW priority.
function parseEligible(files) {
  const out = new Map();
  for (const f of files) {
    const txt = read(f);
    if (!txt || txt.trim().length < 500) { console.log(`  ${path.basename(f)}: no usable text (scanned) — skipped`); continue; }
    let n = 0;
    // split into records at each SIIIR code so the trailing fields belong to that school
    const parts = txt.split(/\b(\d{10})\b/);
    for (let i = 1; i < parts.length; i += 2) {
      const code = parts[i];
      const tail = (parts[i + 1] || '').slice(0, 220);
      const pr = tail.match(/\b(HIGH|MEDIUM|LOW)\b/);
      const prev = out.get(code) || {};
      out.set(code, { priority: pr ? pr[1] : (prev.priority || ''), round: prev.round || path.basename(f) });
      n++;
    }
    console.log(`  ${path.basename(f)}: ${n} rows with a SIIIR code`);
  }
  return out;
}

// PNRAS beneficiaries: no SIIIR. Each record runs from one "F-PNRAS-..." code to the next and
// ends "<APPLICANT IN CAPS> <County Title Case> <grade> <ADMIS|RESPINS>".
function parseBeneficiaries(files) {
  const rows = [];
  for (const f of files) {
    const txt = read(f);
    if (!txt) continue;
    const flat = txt.replace(/\r/g, '');
    const recs = flat.split(/(?=F-PNRAS-[\dA-Z-]+)/);
    let n = 0;
    for (const rec of recs) {
      if (!/^F-PNRAS-/.test(rec)) continue;
      const one = rec.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
      // Anchor at the end of the record: "<...> <County> <grade> <ADMIS|RESPINS>". The applicant
      // is the all-caps run before the county, but many project titles are ALSO all caps and run
      // straight into it with no delimiter, so we keep the whole span and let the resolver try
      // progressively shorter suffixes of it (see resolveApplicant).
      // Repeated page headers land inside records, so we cannot anchor at the end of the string:
      // take the LAST "<caps> <County> <grade> <ADMIS|RESPINS>" occurrence in the record.
      let m = null;
      const tail = /([A-ZĂÂÎȘȚ0-9][^a-zăâîșț]{5,}?)\s+([A-ZĂÂÎȘȚ][a-zăâîșț]+(?:[ -][A-ZĂÂÎȘȚ][a-zăâîșț]+)?)\s+(\d+(?:[,.]\d+)?)\s+(ADMIS|RESPINS)\b/g;
      for (let hit; (hit = tail.exec(one)) !== null; ) m = hit;
      if (!m) continue;
      rows.push({
        applicant: m[1].trim(),
        countyRaw: m[2].trim(),
        score: m[3],
        status: m[4],
        round: path.basename(f),
      });
      n++;
    }
    console.log(`  ${path.basename(f)}: ${n} application records parsed`);
  }
  return rows;
}

// Masă sănătoasă: "<n> <County> <UAT type> <UAT name> <school name> <beneficiaries>", county in
// Title Case, one block per county. The UAT name and the school name are not separated by any
// delimiter, so we keep the whole middle and let the matcher use it plus the county.
function parseMasa(file) {
  const txt = read(file);
  if (!txt) return [];
  const rows = [];
  const re = /^\s*(\d{1,4})\s+((?:(?!Comun[ăa]\b|Municipiu\b|Ora[șs]\b|Sector\b)[A-ZĂÂÎȘȚ][a-zăâîșț]+)(?:[ -](?:(?!Comun[ăa]\b|Municipiu\b|Ora[șs]\b|Sector\b)[A-ZĂÂÎȘȚ][a-zăâîșț]+))*)\s+(Comună|Municipiu|Oraș|Sector|Comuna|Oras)\s+(.+?)\s+(\d{1,5})\s*$/;
  const lines = txt.split('\n');
  for (let i = 0; i < lines.length; i++) {
    // records wrap over up to 4 lines; try progressively longer joins
    for (let span = 1; span <= 4; span++) {
      const joined = lines.slice(i, i + span).join(' ').replace(/\s+/g, ' ').trim();
      const m = joined.match(re);
      if (m) {
        // Columns 3 and 4 of the annex (UAT name, school name) run together in the extracted
        // text with no delimiter. Split at the first school-type word: everything before it is
        // the commune, everything from it on is the school. That gives the matcher a locality.
        const body = m[4].trim();
        const split = body.match(/^(.*?)\s*((?:Școala|Scoala|Liceul|Liceu|Colegiul|Grădinița|Gradinita|Școli|Centrul|Seminarul|Palatul)\b.*)$/);
        rows.push({
          county: m[2].trim(),
          uatType: m[3],
          uat: split ? split[1].trim() : '',
          school: split ? split[2].trim() : body,
          body,
          beneficiaries: Number(m[5]),
        });
        i += span - 1;
        break;
      }
    }
  }
  return rows;
}

// ---------------------------------------------------------------- main
function loadCoverage(opts = {}) {
  const networkFile = opts.network || 'data/retea_scolara_2025_2026.xlsx';
  const schools = loadSchools(networkFile);
  console.log(`school index: ${schools.byCode.size} units`);

  console.log('PNRAS eligible (ministry risk list):');
  const eligible = parseEligible([
    'data/pnras/elig_r2s1.txt', 'data/pnras/elig_r2s2.txt', 'data/pnras/elig_r2s3.txt',
  ].map(p => opts.dataDir ? path.join(opts.dataDir, path.basename(p)) : p));

  console.log('PNRAS grants (actual coverage):');
  const benef = parseBeneficiaries(['data/pnras/benef_r2s1.txt', 'data/pnras/benef_r2s2.txt', 'data/pnras/benef_r2s3.txt']);

  const masa = parseMasa('data/masa/masa_2026.txt');
  console.log(`Masă sănătoasă: ${masa.length} rows parsed`);

  // --- resolve the two name-keyed sources to SIIIR codes
  const cov = new Map();   // siiir -> {pnras_eligible, pnras_priority, pnras_grant, masa, masa_n}
  const touch = code => {
    if (!cov.has(code)) cov.set(code, { eligible: 0, priority: '', grant: 0, masa: 0, masaN: 0 });
    return cov.get(code);
  };
  for (const [code, e] of eligible) {
    if (!schools.byCode.has(code)) continue;    // PJ-level or closed school
    const r = touch(code); r.eligible = 1; r.priority = e.priority;
  }

  const tally = { grantExact: 0, grantFuzzy: 0, grantMiss: 0, masaExact: 0, masaFuzzy: 0, masaMiss: 0 };
  const missGrant = [], missMasa = [];
  for (const b of benef) {
    if (b.status !== 'ADMIS') continue;
    const county = COUNTY_BY_ABBR[b.countyRaw.toUpperCase()] || fixCounty(b.countyRaw);
    const res = resolveApplicant(schools, county, b.applicant);
    if (res.code) { touch(res.code).grant = 1; tally[res.how === 'exact' ? 'grantExact' : 'grantFuzzy']++; }
    else { tally.grantMiss++; if (missGrant.length < 6) missGrant.push(`${county} :: ${b.applicant.slice(0, 50)} (${res.how})`); }
  }
  for (const m of masa) {
    const county = fixCounty(m.county);
    // strip the "/Structura - ..." and "Structuri:..." tails: those name satellite schools,
    // and the grant/meal is recorded against the parent unit
    const name = m.school.split(/\s*(?:\/\s*)?Structur[aăi]\b/)[0].trim() || m.school;
    const res = resolve(schools, county, name, m.uat);
    if (res.code) { const r = touch(res.code); r.masa = 1; r.masaN = m.beneficiaries; tally[res.how === 'exact' ? 'masaExact' : 'masaFuzzy']++; }
    else { tally.masaMiss++; if (missMasa.length < 6) missMasa.push(`${county} :: ${m.body.slice(0, 55)} (${res.how})`); }
  }
  return { cov, schools, tally, missGrant, missMasa, counts: { eligible: eligible.size, benef: benef.length, masa: masa.length } };
}

// County names in these files are diacritic-free Title Case ("Calarasi", "Dambovita").
function fixCounty(s) {
  const n = norm(s);
  for (const full of Object.values(COUNTY_BY_ABBR)) if (norm(full) === n) return full;
  // Â/Î spelling drift, as in the budget file
  for (const full of Object.values(COUNTY_BY_ABBR)) if (norm(full).replace(/I/g, 'A') === n.replace(/I/g, 'A')) return full;
  return s;
}

module.exports = { loadCoverage, norm, keyTokens };

// ---------------------------------------------------------------- standalone
if (require.main === module) {
  const args = process.argv.slice(2);
  const opt = n => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : null; };
  const outDir = opt('--out') || 'out';
  const network = opt('--network') || 'data/retea_scolara_2025_2026.xlsx';
  const { cov, schools, tally, missGrant, missMasa, counts } = loadCoverage({ network });

  console.log(`\nname -> SIIIR resolution`);
  console.log(`  PNRAS grants:    ${tally.grantExact} exact, ${tally.grantFuzzy} fuzzy, ${tally.grantMiss} unmatched`);
  if (missGrant.length) console.log(`    e.g.`, missGrant);
  console.log(`  Masă sănătoasă:  ${tally.masaExact} exact, ${tally.masaFuzzy} fuzzy, ${tally.masaMiss} unmatched`);
  if (missMasa.length) console.log(`    e.g.`, missMasa);

  let e = 0, g = 0, m = 0;
  for (const r of cov.values()) { if (r.eligible) e++; if (r.grant) g++; if (r.masa) m++; }
  console.log(`\ncovered schools: ${cov.size} distinct | PNRAS eligible ${e} | PNRAS grant ${g} | Masă sănătoasă ${m}`);

  fs.mkdirSync(outDir, { recursive: true });
  const q = v => { const t = v === undefined || v === null ? '' : String(v); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  const lines = ['siiir_code,school,locality,county,pnras_eligible,pnras_priority,pnras_grant,masa_sanatoasa,masa_beneficiaries,coverage_programmes'];
  for (const [code, r] of [...cov.entries()].sort()) {
    const s = schools.byCode.get(code) || {};
    const tags = [];
    if (r.grant) tags.push('PNRAS grant');
    if (r.masa) tags.push('Masă sănătoasă');
    if (r.eligible) tags.push('PNRAS eligible');
    lines.push([code, s.name, s.locality, s.county, r.eligible, r.priority, r.grant, r.masa, r.masaN || '', tags.join('; ')].map(q).join(','));
  }
  fs.writeFileSync(path.join(outDir, 'coverage.csv'), '﻿' + lines.join('\n'), 'utf8');
  console.log(`wrote ${path.join(outDir, 'coverage.csv')}`);
}
