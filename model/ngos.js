// Candidate NGOs per county, from the Registrul Național ONG.
//
// Purpose: the director path needs "the closest 3 NGOs" for ANY school. With the 9 hand-curated
// organisations in app/index.html that is unanswerable — 81% of ranked rural schools have fewer
// than 3 in their county and 22% have none. The register closes that gap deterministically:
//
//   Starea actuala   blank = active. 5,248 radiata + 1,854 in lichidare + 1,111 dizolvata are
//                    excluded outright. This is the `stage` signal MATCHMAKING.md J1 was going to
//                    infer — for the dead-or-alive half of it, it is simply a column.
//   HG utilitate publica  558 orgs carry government-recognised public-utility status. Free, strong
//                    credibility signal for deciding which of thousands to surface.
//   Scopul initial   must be non-empty. An org with no stated purpose anywhere in the register
//                    (initial scope plus all five modification columns) is excluded before the
//                    keyword filter, so nothing enters on its name alone.
//   Judet/Localitate geocoded against the SIRUTA nomenclator we already load, so proximity is real
//                    distance rather than "same county".
//
// What this does NOT give us is scope precision. The keyword filter is a deliberate over-count
// (39,957 orgs; a riding club that mentions "copii" is in it), so everything this emits must be
// labelled "purpose not verified" in the UI until MATCHMAKING.md J1 classifies it.
//
// Usage:  node model/ngos.js --out out        (npm run ngos)

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const TOP_PER_COUNTY = 30;   // ~1,260 rows total: enough to pick 3 near any school, small enough to inline

const strip = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
// the school network stores the county as a 2-letter code, the ONG register as a full name
const ABBR = {AB:'ALBA',AR:'ARAD',AG:'ARGES',BC:'BACAU',BH:'BIHOR',BN:'BISTRITA NASAUD',BT:'BOTOSANI',
 BV:'BRASOV',BR:'BRAILA',BZ:'BUZAU',CS:'CARAS SEVERIN',CL:'CALARASI',CJ:'CLUJ',CT:'CONSTANTA',
 CV:'COVASNA',DB:'DAMBOVITA',DJ:'DOLJ',GL:'GALATI',GR:'GIURGIU',GJ:'GORJ',HR:'HARGHITA',
 HD:'HUNEDOARA',IL:'IALOMITA',IS:'IASI',IF:'ILFOV',MM:'MARAMURES',MH:'MEHEDINTI',MS:'MURES',
 NT:'NEAMT',OT:'OLT',PH:'PRAHOVA',SM:'SATU MARE',SJ:'SALAJ',SB:'SIBIU',SV:'SUCEAVA',TR:'TELEORMAN',
 TM:'TIMIS',TL:'TULCEA',VS:'VASLUI',VL:'VALCEA',VN:'VRANCEA',B:'BUCURESTI'};
const norm = s => strip(s).toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();

// Deliberately broad. Precision is J1's job; this is recall so that every county has candidates.
const KW = /educa|scoal|elev|abandon|invatam|meditat|after school|tutor|copii|tineri/i;
// An education term in the NAME is a far stronger signal than one buried in a statute: almost
// every association's charter says something about "educarea tinerilor", including tennis clubs.
const NAME_EDU = /educa|scoal|elev|invatam|abandon|meditat|tutor|after school|pedagog|didactic/i;
// Negative signal. These dominate the register and are what surfaces first without it.
const NOT_EDU = /club sportiv|sportiv|tenis|fotbal|handbal|baschet|sah\b|vanatoare|pescuit|chinolog|columbofil|karting|auto ?moto|motociclism|dans|majorete|culturism|fitness/i;

function loadSiruta(file) {
  const txt = fs.readFileSync(file, 'utf8').replace(/^﻿/, '');
  const lines = txt.split(/\r?\n/);
  const H = lines[0].split(';').map(h => h.trim().toUpperCase());
  const ix = n => H.indexOf(n);
  const [iC, iN, iJ, iNiv] = ['SIRUTA', 'DENLOC', 'JUD', 'NIV'].map(ix);
  const byName = new Map();           // "<jud>|<NORMNAME>" -> siruta
  const counties = new Map();         // jud number -> county name
  for (const line of lines.slice(1)) {
    if (!line.trim()) continue;
    const p = line.split(';');
    const jud = Number(p[iJ]), niv = Number(p[iNiv]);
    if (niv === 1) counties.set(jud, norm(String(p[iN]).replace(/^JUDE[ŢT]UL\s+/i, '')));
    const k = `${jud}|${norm(p[iN])}`;
    if (!byName.has(k)) byName.set(k, Number(p[iC]));
  }
  return { byName, counties };
}

const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args.splice(i, 2)[1] : null; };
const outDir = opt('--out') || 'out';
const ongFile = opt('--ong') || 'data/ong_2026.xlsx';
const sirutaFile = opt('--siruta') || 'data/siruta_2026.csv';
const coordsFile = opt('--coords') || 'data/scoli_coordonate_2017.xlsx';

const sir = loadSiruta(sirutaFile);
const countyNoByName = new Map([...sir.counties].map(([n, name]) => [name, n]));
// SIRUTA calls it "MUNICIPIUL BUCUREŞTI"; the register says "BUCURESTI"
countyNoByName.set('BUCURESTI', 40);

// Locality centroids: the school coordinate file is the only geocoding we have, so take the mean
// school position per locality and use it as that locality's point. Good to a few hundred metres,
// which is far finer than we need for "closest 3".
const centroid = new Map();
{
  const wb = XLSX.readFile(coordsFile, { dense: true });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
  const nw = XLSX.readFile('data/retea_scolara_2025_2026.xlsx', { dense: true });
  const nr = XLSX.utils.sheet_to_json(nw.Sheets['Export'], { header: 1, defval: '' });
  const hdr = nr.findIndex(r => String(r[0]).trim() === 'An');
  const locByCode = new Map();
  for (const r of nr.slice(hdr + 1)) {
    const code = String(r[11]).trim();
    const ab = String(r[1]).trim().toUpperCase();
    if (code && !locByCode.has(code)) locByCode.set(code, `${ABBR[ab] || ab}|${norm(r[7])}`);
  }
  const acc = new Map();
  for (const r of rows.slice(1)) {
    const code = String(r[0]).trim(), lat = Number(r[1]), lon = Number(r[2]);
    const key = locByCode.get(code);
    if (!key || !Number.isFinite(lat) || !Number.isFinite(lon) || !lat || !lon) continue;
    if (!acc.has(key)) acc.set(key, [0, 0, 0]);
    const a = acc.get(key); a[0] += lat; a[1] += lon; a[2]++;
  }
  for (const [k, a] of acc) centroid.set(norm(k.split('|')[0]) + '|' + k.split('|')[1], [a[0] / a[2], a[1] / a[2]]);
}

// ---------- read the register ----------
const wb = XLSX.readFile(ongFile, { dense: true });
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
const H = rows[0].map(h => String(h).trim());
const ix = n => H.indexOf(n);
const iName = ix('Denumire'), iReg = ix('Numar inreg Reg National'), iState = ix('Starea actuala');
const iJud = ix('Judet'), iLoc = ix('Localitate'), iUtil = ix('HG utilitate publica');
const scopeCols = H.map((h, i) => /^Scopul initial$|^Modificari ale scopului/.test(h) ? i : -1).filter(i => i >= 0);

const byCounty = new Map();
let total = 0, dead = 0, noPurpose = 0, kept = 0, geo = 0;
for (const r of rows.slice(1)) {
  const name = String(r[iName]).replace(/\s+/g, ' ').trim();
  if (!name) continue;
  total++;
  if (String(r[iState]).trim()) { dead++; continue; }              // radiata / in lichidare / dizolvata
  const purpose = scopeCols.map(i => String(r[i]).trim()).filter(Boolean).join(' ').trim();
  // No stated purpose, no candidate. A blank `Scopul initial` (and blank modifications) leaves
  // nothing for J1 to classify and nothing to show a director as a reason, so the org can only
  // ever enter on its name — which is the weakest evidence we have. A purpose of punctuation
  // only ("-") counts as blank.
  if (!/\p{L}/u.test(purpose)) { noPurpose++; continue; }
  const blob = `${name} ${purpose}`;
  if (!KW.test(strip(blob))) continue;
  const jud = String(r[iJud]).trim().toUpperCase();
  const judNo = countyNoByName.get(norm(jud));
  if (judNo === undefined) continue;
  const addr = String(r[iLoc]).trim();
  // first comma-separated part is the locality; drop a leading ORAS/MUNICIPIUL/COMUNA
  const loc = addr.split(',')[0].replace(/^\s*(MUNICIPIUL|ORAS(UL)?|ORA[ŞS](UL)?|COMUNA|SAT)\s+/i, '').trim();
  const ll = centroid.get(`${norm(jud)}|${norm(loc)}`) || null;
  if (ll) geo++;
  kept++;
  const rec = {
    name, reg: String(r[iReg]).trim(), county: jud, locality: loc,
    util: String(r[iUtil]).trim() ? 1 : 0,
    strong: NAME_EDU.test(strip(name)) ? 1 : 0,
    sport: NOT_EDU.test(strip(name)) ? 1 : 0,
    lat: ll ? +ll[0].toFixed(4) : null, lon: ll ? +ll[1].toFixed(4) : null,
  };
  if (!byCounty.has(jud)) byCounty.set(jud, []);
  byCounty.get(jud).push(rec);
}

// Rank within county: public-utility status first, then education-specific wording, then
// geocoded (so proximity can actually be computed), then name for stability.
const pick = [];
for (const [county, list] of byCounty) {
  list.sort((a, b) =>
    a.sport - b.sport ||                         // sports/hunting/dance clubs last
    b.util - a.util ||                           // public-utility status first
    b.strong - a.strong ||                       // education term in the NAME, not just the statute
    (b.lat ? 1 : 0) - (a.lat ? 1 : 0) ||         // geocoded, so proximity is computable
    a.name.localeCompare(b.name));
  pick.push(...list.slice(0, TOP_PER_COUNTY));
}

fs.mkdirSync(outDir, { recursive: true });
const q = v => { const t = v === null || v === undefined ? '' : String(v); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
const head = ['reg', 'name', 'county', 'locality', 'lat', 'lon', 'public_utility', 'education_in_name'];
fs.writeFileSync(path.join(outDir, 'ngo_candidates.csv'),
  '﻿' + [head.join(',')].concat(pick.map(r => [r.reg, r.name, r.county, r.locality, r.lat, r.lon, r.util, r.strong].map(q).join(','))).join('\n'), 'utf8');

const counts = [...byCounty.values()].map(l => l.length).sort((a, b) => a - b);
console.log(`register: ${total.toLocaleString('en')} orgs · ${dead.toLocaleString('en')} dead (radiata/lichidare/dizolvata) excluded`);
console.log(`alive but no stated purpose: ${noPurpose.toLocaleString('en')} excluded`);
console.log(`alive + stated purpose + education keyword: ${kept.toLocaleString('en')} in ${byCounty.size} counties (min ${counts[0]}, median ${counts[counts.length >> 1]})`);
console.log(`geocoded to a locality centroid: ${geo.toLocaleString('en')} (${(100 * geo / kept).toFixed(0)}%)`);
console.log(`kept top ${TOP_PER_COUNTY} per county -> ${pick.length} rows · ${pick.filter(r => r.util).length} public-utility · ${pick.filter(r => r.strong).length} education in the name · ${pick.filter(r => r.lat).length} geocoded · ${pick.filter(r => r.sport).length} sports clubs still in`);
console.log(`wrote ${path.join(outDir, 'ngo_candidates.csv')}`);
