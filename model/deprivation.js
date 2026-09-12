// Deprivation / purchasing-power layer, per UAT (commune, town, municipality).
//
// "Putere de cumpărare" at locality level is not published directly in Romania. The closest
// honest proxy that exists per commune is the local budget line
// **04.02.01 "Cote defalcate din impozitul pe venit"**: the share of wage income tax that ANAF
// returns to the commune where the taxpayer is domiciled. It moves with the declared wage bill
// of the people who live there, so per capita it ranks communes by formal earned income.
//
// It has a known bias, stated here so nobody over-claims it: it sees **declared wage income
// only**. Subsistence farming, remittances from abroad, undeclared work and pensions are
// invisible. That biases it *down* in exactly the poorest rural communes — which is fine for
// ranking need (it errs toward flagging them) but makes the absolute lei/capita figure a floor,
// not an income estimate. Never present it as "average income".
//
// Sources (all public, all downloaded into data/):
//   - data/uat_venituri_2025.xlsx  Anexa 24, DEC-2025, Sheet2 "Detaliere pe consiliu, municipii,
//     orase, comune". https://dpfbl.mdlpa.ro/sit_ven_si_chelt_uat.html (MDLPA / DPFBL)
//   - data/uat_populatie_2023.xlsx Population by domicile per UAT, 1 Jan 2023, keyed by SIRUTA
//     (INS via DPFBL, PDOM_SIRUTA2023.xlsx)
//   - data/siruta_2026.csv         SIRUTA nomenclator (INS via data.gov.ro, "SIRUTA_s1 2026").
//     Gives SIRSUP, so a school's *village* SIRUTA can be walked up to its *UAT* SIRUTA.
//
// Usage as a module:  const { loadDeprivation } = require('./deprivation');
// Usage standalone:   node model/deprivation.js --out out      (writes out/uat_deprivation.csv)

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DEFAULTS = {
  siruta: 'data/siruta_2026.csv',
  budget: 'data/uat_venituri_2025.xlsx',
  population: 'data/uat_populatie_2023.xlsx',
};

// Budget line codes we pull, by their official indicator code in the header row.
const LINE = {
  total: '00.01.02',        // venituri totale
  own: '49.90',             // venituri proprii
  incomeTax: '04.02.01',    // cote defalcate din impozitul pe venit  <- the purchasing-power proxy
  equalCote: '04.02.04',    // sume din cote, pentru echilibrarea bugetelor locale
  equalTVA: '11.02.06',     // sume defalcate din TVA pentru echilibrare
};

// ---------------------------------------------------------------- name matching
// The budget file writes place names without diacritics, and it is inconsistent about  and Î:
// CÂMPENI -> "CAMPENI", HOPÂRTA -> "HOPIRTA", and FÂNTÂNELE -> "FANTINELE" (both, in one word).
// So we index every A/I reading of each SIRUTA name and look the budget spelling up against all
// of them. 3,167 of 3,187 budget rows match exactly this way; the rest go through `fuzzy`.
function baseName(s) {
  return String(s).toUpperCase()
    .replace(/[ȘŞŠ]/g, 'S').replace(/[ȚŢ]/g, 'T').replace(/[ĂÀÁÄ]/g, 'A')
    .replace(/[^A-ZÂÎ0-9]+/g, ' ').trim()
    .replace(/^PRIMARIA\s+(COMUNEI|ORASULUI|MUNICIPIULUI)\s+/, '')
    .replace(/^(COMUNA|ORASUL|ORAS|MUNICIPIULUI|MUNICIPIUL|MUNICIPIU|SECTORUL|SECTOR)\s+/, '')
    .trim();
}
function spellings(s) {
  let out = [s];
  for (let i = 0; i < 4; i++) {
    const next = [];
    for (const v of out) {
      const j = v.search(/[ÂÎ]/);
      if (j < 0) { next.push(v); continue; }
      next.push(v.slice(0, j) + 'A' + v.slice(j + 1), v.slice(0, j) + 'I' + v.slice(j + 1));
    }
    out = next;
  }
  return [...new Set(out)];
}
// Two communes the budget file names in a way no spelling rule recovers. Both are rural, so
// leaving them out would put a real hole in the map.
//   - Timiș writes the commune by its initials.
//   - Vâlcea has two communes called Păuşeşti; the budget disambiguates the first by its seat
//     village (Păuşeşti-Otăsău), which is not the commune's SIRUTA name.
const ALIAS = {
  '35|V V DELAMARINA': 159259,   // VICTOR VLAD DELAMARINA
  '38|PAUSESTI OTASAU': 171995,  // PĂUŞEŞTI (seat: Păuşeşti-Otăsău), not PĂUŞEŞTI-MĂGLAŞI
};

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99;
  const prev = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]; prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

// ---------------------------------------------------------------- loaders
function readSiruta(file) {
  const txt = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const lines = txt.split(/\r?\n/);
  const head = lines[0].split(';').map(h => h.trim().toUpperCase());
  const ix = n => head.indexOf(n);
  const [iCode, iName, iJud, iSup, iNiv, iMed] =
    ['SIRUTA', 'DENLOC', 'JUD', 'SIRSUP', 'NIV', 'MED'].map(ix);
  if ([iCode, iName, iJud, iSup, iNiv].some(i => i < 0)) throw new Error(`${file}: unexpected SIRUTA header`);

  const all = new Map();          // every SIRUTA entry (counties, UATs, villages)
  const counties = new Map();     // county number -> name
  const uatByName = new Map();    // "<jud>|<spelling>" -> uat siruta
  const uatNames = new Map();     // jud -> [[normName, siruta], ...]  (fuzzy fallback pool)

  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const p = line.split(';');
    const code = Number(p[iCode]), jud = Number(p[iJud]), niv = Number(p[iNiv]);
    if (!Number.isFinite(code) || !code) continue;
    all.set(code, { name: p[iName], jud, sup: Number(p[iSup]), niv, med: Number(p[iMed]) });
    if (niv === 1) counties.set(jud, baseName(String(p[iName]).replace(/^JUDE[ŢT]UL\s+/i, '')));
    if (niv === 2) {
      const nm = baseName(p[iName]);
      for (const v of spellings(nm)) {
        const k = `${jud}|${v}`;
        if (!uatByName.has(k)) uatByName.set(k, code);
      }
      if (!uatNames.has(jud)) uatNames.set(jud, []);
      uatNames.get(jud).push([spellings(nm)[0], code]);
    }
  }
  return { all, counties, uatByName, uatNames };
}

function readPopulation(file, all) {
  const wb = XLSX.readFile(file, { dense: true });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
  const pop = new Map();
  for (const r of rows) {
    const code = Number(r[0]), total = Number(r[2]);
    if (!Number.isFinite(code) || !code || !Number.isFinite(total) || total <= 0) continue;
    if (all.get(code)?.niv === 2) pop.set(code, total);
  }
  return pop;
}

function readBudget(file, { counties, uatByName, uatNames }) {
  const wb = XLSX.readFile(file, { dense: true });
  const sheet = wb.Sheets['Sheet2'] || wb.Sheets[wb.SheetNames[1]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  // find the row carrying the official indicator codes (00.01.02, 04.02.01, ...)
  const codeRow = rows.findIndex(r => r.some(c => String(c).trim() === LINE.incomeTax));
  if (codeRow < 0) throw new Error(`${file}: could not find the budget-code header row`);
  const codes = rows[codeRow].map(c => String(c).trim());
  const col = {};
  for (const [k, v] of Object.entries(LINE)) col[k] = codes.indexOf(v);

  // County names need the same Â/Î treatment as the UATs: the budget file writes Dâmbovița as
  // "Dambovita" and Vâlcea as "Valcea". Missing these silently drops ~170 communes.
  const judByName = new Map();
  for (const [j, n] of counties) for (const v of spellings(n)) judByName.set(v, j);
  judByName.set('BUCURESTI', 40);

  const num = v => { const n = typeof v === 'number' ? v : parseFloat(String(v).replace(/\s/g, '')); return Number.isFinite(n) ? n : 0; };

  const out = new Map();
  const unmatched = [];
  let jud = null, seen = 0, fuzzyHits = 0;

  for (const r of rows) {
    const a = String(r[0]).trim();
    if (!a) continue;
    const head = a.match(/^Judetul:\s*(.+)$/i);
    if (head) { jud = judByName.get(baseName(head[1])) ?? null; continue; }
    const m = a.match(/^(\d+)\s*-\s*(.+)$/);
    if (!m || jud === null) continue;
    seen++;

    const nm = baseName(m[2]);
    let code = uatByName.get(`${jud}|${nm}`) ?? ALIAS[`${jud}|${nm}`];
    if (code === undefined) {                       // typos in the source: MHAIL KOGALNICEANU, LIPOV
      let best = null, bestD = 3;
      for (const [cand, c] of (uatNames.get(jud) || [])) {
        const d = editDistance(nm, cand);
        if (d < bestD) { bestD = d; best = c; }
      }
      if (best !== null) { code = best; fuzzyHits++; }
    }
    if (code === undefined) { unmatched.push(`${jud}: ${m[2]}`); continue; }
    if (out.has(code)) continue;                    // first row wins (sectors dedupe)

    out.set(code, {
      cui: m[1],
      totalRevenue: num(r[col.total]),
      ownRevenue: num(r[col.own]),
      incomeTax: num(r[col.incomeTax]),
      equalization: num(r[col.equalCote]) + num(r[col.equalTVA]),
    });
  }
  return { budget: out, seen, fuzzyHits, unmatched };
}

// ---------------------------------------------------------------- public API
function loadDeprivation(opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const sir = readSiruta(o.siruta);
  const pop = readPopulation(o.population, sir.all);
  const { budget, seen, fuzzyHits, unmatched } = readBudget(o.budget, sir);

  // walk a village SIRUTA up to the UAT (NIV 2) it belongs to
  function resolveUAT(localitySiruta) {
    let cur = Number(localitySiruta);
    for (let guard = 0; cur && guard < 8; guard++) {
      const e = sir.all.get(cur);
      if (!e) return null;
      if (e.niv === 2) return cur;
      cur = e.sup;
    }
    return null;
  }

  // per-UAT record
  const rec = new Map();
  for (const [code, b] of budget) {
    const p = pop.get(code);
    const meta = sir.all.get(code);
    if (!p || !meta) continue;
    rec.set(code, {
      siruta: code,
      name: meta.name,
      jud: meta.jud,
      rural: meta.med === 3,                     // SIRUTA MED: 1 = urban (319), 3 = rural (2,862)
      pop: p,
      incomeTaxPc: b.incomeTax / p,
      ownRevenuePc: b.ownRevenue / p,
      equalizationPc: b.equalization / p,
      totalRevenuePc: b.totalRevenue / p,
    });
  }

  // Percentile of income tax per capita, computed over ALL UATs (a rural commune competes with
  // the whole country, which is the honest comparison for a funder deciding where money goes).
  const sorted = [...rec.values()].sort((a, b) => a.incomeTaxPc - b.incomeTaxPc);
  sorted.forEach((r, i) => {
    r.incomePct = sorted.length > 1 ? i / (sorted.length - 1) : 0.5;   // 0 = poorest
    r.deprivation = 1 - r.incomePct;                                    // 1 = poorest
  });

  return {
    records: rec,
    resolveUAT,
    forLocality(localitySiruta) {
      const u = resolveUAT(localitySiruta);
      return u === null ? null : (rec.get(u) || null);
    },
    stats: {
      uats: rec.size, budgetRows: seen, fuzzyHits, unmatched,
      median: sorted.length ? sorted[Math.floor(sorted.length / 2)].incomeTaxPc : NaN,
      p10: sorted.length ? sorted[Math.floor(sorted.length * 0.1)].incomeTaxPc : NaN,
      p90: sorted.length ? sorted[Math.floor(sorted.length * 0.9)].incomeTaxPc : NaN,
    },
  };
}

module.exports = { loadDeprivation, baseName, spellings };

// ---------------------------------------------------------------- standalone
if (require.main === module) {
  const args = process.argv.slice(2);
  const opt = n => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : null; };
  const outDir = opt('--out') || 'out';
  const d = loadDeprivation({
    siruta: opt('--siruta') || DEFAULTS.siruta,
    budget: opt('--budget') || DEFAULTS.budget,
    population: opt('--population') || DEFAULTS.population,
  });
  const s = d.stats;
  console.log(`UATs with budget + population: ${s.uats}`);
  console.log(`budget rows read: ${s.budgetRows} (${s.fuzzyHits} matched by near-spelling, ${s.unmatched.length} unmatched)`);
  if (s.unmatched.length) console.log('  unmatched:', s.unmatched.slice(0, 10));
  console.log(`income tax per capita (lei/year): p10 ${s.p10.toFixed(0)} | median ${s.median.toFixed(0)} | p90 ${s.p90.toFixed(0)}`);

  fs.mkdirSync(outDir, { recursive: true });
  const q = v => { const t = v === undefined || v === null || (typeof v === 'number' && !Number.isFinite(v)) ? '' : String(v); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  const head = ['uat_siruta', 'uat_name', 'county_no', 'rural', 'population',
    'income_tax_per_capita', 'own_revenue_per_capita', 'equalization_per_capita',
    'income_percentile', 'deprivation_score'];
  const lines = [head.join(',')];
  for (const r of [...d.records.values()].sort((a, b) => a.incomeTaxPc - b.incomeTaxPc)) {
    lines.push([r.siruta, r.name, r.jud, r.rural ? 'rural' : 'urban', r.pop,
      r.incomeTaxPc.toFixed(2), r.ownRevenuePc.toFixed(2), r.equalizationPc.toFixed(2),
      r.incomePct.toFixed(4), r.deprivation.toFixed(4)].map(q).join(','));
  }
  fs.writeFileSync(path.join(outDir, 'uat_deprivation.csv'), '﻿' + lines.join('\n'), 'utf8');
  console.log(`wrote ${path.join(outDir, 'uat_deprivation.csv')}`);
}
