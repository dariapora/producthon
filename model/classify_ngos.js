// J1 — NGO purpose text -> capability profile.  (MATCHMAKING.md §5, §6)
//
// WHY THIS EXISTS
// ---------------
// out/ngo_candidates.csv is chosen by a regex (model/ngos.js, KW) that fires on 37.4% of the sector
// it selects from — 40,684 of 108,891. Over a third of Romania's living, purpose-stating NGOs look
// like education NGOs to a regex. It is matching boilerplate: "educarea publicului", "activități
// educative" appended to a hunting club's charter.
//
// DENOMINATOR (measured 12 Sept 2026; recount with `node model/ngos.js` before quoting anywhere):
//   125,840  organisations with a name in the register
//   -8,213   dead (Starea actuala set: radiata / in lichidare / dizolvata)
//   -9,498   no purpose text anywhere (initial scope + all five modification columns)
//   +762     counted twice above: dead AND blank. The two exclusions overlap, so this is NOT a
//            subtraction you can do in your head
//   =108,891 alive with a stated purpose — the set ngos.js actually selects from, and the only
//            denominator that matches a numerator counted after the dead-org exclusion
//
// Two wrong versions of this ratio were written before this one, both from mismatched sets:
//   24.7%  MATCHMAKING.md §5 — predates the blank-purpose exclusion, and counts a different regex
//   35.0%  40,684 / 116,342 — a living-only numerator over a living-and-dead denominator
// 116,342 is the trap: it is right for build_app_data.js's narrower `re`, whose 31,523 matches are
// counted WITHOUT the dead-org exclusion (27.1%), and wrong for KW's, which are counted with it.
// Same denominator, two regexes, one of them right — check which population a numerator came from
// before reusing a denominator that fits another one.
//
// The product's output is an outreach email to a real person, so a false positive costs a stranger's
// time. Precision is the metric, and a regex cannot deliver it.
//
// This job reads the stated purpose and returns a structured profile. It is offline, cached, and
// re-runnable at zero cost: every profile is keyed by the register number and written to
// out/ngo_profiles.json, so a second run only pays for rows it has never seen.
//
// WHAT IT DELIBERATELY DOES NOT DO
// --------------------------------
//   - It never sees child-level data. The input is a public register's purpose text. Nothing else.
//   - It never invents an `evidence` span. Every profile carries a verbatim quote from the input,
//     checked by substring after normalisation; a profile that fails that check is recorded as
//     ungrounded and abstains rather than being kept. Groundedness is what makes the output
//     reviewable by a person who does not trust it.
//   - It never widens scope. `stage: "running"` cannot honestly be read off a charter — a statute
//     states an intention, not an activity. Expect almost everything to come back stated_intent;
//     that is the correct answer from this input, and it is J3b (annual reports) that upgrades it.
//
// Usage:
//   node model/classify_ngos.js --dry-run          # prompt + measured cost estimate, no API calls
//   node model/classify_ngos.js --limit 20         # smoke test, ~$0.03
//   node model/classify_ngos.js                    # the 1,259 candidates
//   npm run classify
//
// Needs ANTHROPIC_API_KEY in the environment. It is read at call time and never written anywhere.

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Anthropic = require('@anthropic-ai/sdk');

// --- options -----------------------------------------------------------------
const argv = process.argv.slice(2);
const flag = n => argv.includes(n);
const opt = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };

const IN       = opt('--in', 'out/ngo_candidates.csv');
const ONG      = opt('--ong', 'data/ong_2026.xlsx');
const OUT      = opt('--out', 'out/ngo_profiles.json');
const LIMIT    = parseInt(opt('--limit', '0'), 10) || 0;
const CONC     = parseInt(opt('--concurrency', '8'), 10);
const DRY      = flag('--dry-run');
const FORCE    = flag('--force');           // ignore the cache and reclassify everything
// Backend: 'api' calls the Anthropic API with ANTHROPIC_API_KEY; 'cli' shells out to the local
// `claude` binary in print mode, which runs on whatever the machine is logged in as (a Claude
// subscription counts). Same system prompt, same JSON schema, same model names — only the
// transport differs. Added 12 Sept so J1 could run on a machine with no API key.
const BACKEND  = opt('--backend', process.env.ANTHROPIC_API_KEY ? 'api' : 'cli');

const MODEL      = 'claude-haiku-4-5';      // bulk extraction against a fixed taxonomy
const MODEL_HARD = 'claude-sonnet-5';       // escalation for confidence < 0.6 (§6)
const ESCALATE_BELOW = 0.6;

// list prices, USD per million tokens, for the run report
const PRICE = {
  'claude-haiku-4-5':  { in: 1,  out: 5  },
  'claude-sonnet-5':   { in: 3,  out: 15 },
};

// --- the closed taxonomy (§5) ------------------------------------------------
// Closed on purpose. An open taxonomy makes the matcher unscorable: you cannot compute recall on a
// class the model is free to invent, and the school-side scoring code has to switch on these.
const PROGRAMME_TYPES = ['mentoring', 'tutoring_remedial', 'scholarship_cash', 'transport', 'meals',
  'career_guidance', 'dual_vocational', 'parent_family', 'school_infrastructure', 'teacher_training',
  'roma_inclusion', 'special_needs', 'after_school', 'other'];
const AGE_BANDS = ['prescolar', 'primar', 'gimnaziu', 'liceu', 'adulti'];
const STAGES = ['running', 'stated_intent', 'dormant'];

const SCHEMA = {
  type: 'object',
  properties: {
    education_relevant: { type: 'boolean' },
    confidence: { type: 'number' },
    evidence: { type: 'string' },
    programme_types: { type: 'array', items: { type: 'string', enum: PROGRAMME_TYPES } },
    age_bands: { type: 'array', items: { type: 'string', enum: AGE_BANDS } },
    stage: { type: 'string', enum: STAGES },
  },
  required: ['education_relevant', 'confidence', 'evidence', 'programme_types', 'age_bands', 'stage'],
  additionalProperties: false,
};

const SYSTEM = `Ești un analist care citește scopul statutar al organizațiilor neguvernamentale din Registrul Național ONG din România și decide dacă organizația lucrează efectiv în educația copiilor și adolescenților de vârstă școlară.

Contextul deciziei: rezultatul tău este folosit pentru a recomanda unei școli rurale pe cine să contacteze. Un fals pozitiv trimite un email unei organizații care nu are ce să ofere școlii și consumă timpul unui om real. Precizia contează mai mult decât acoperirea.

REGULA CENTRALĂ. Aproape fiecare statut din România conține o formulă de tipul "educarea publicului", "activități educative", "promovarea valorilor educaționale". Aceste formule NU fac organizația relevantă. Marchează education_relevant=true doar dacă scopul descrie o activitate concretă adresată elevilor, școlilor, profesorilor sau părinților: meditații, burse, after-school, transport, masă, mentorat, orientare profesională, prevenirea abandonului, incluziune școlară.

Exemple de fals pozitiv, toate education_relevant=false:
- club sportiv al cărui scop menționează "educarea tinerilor prin sport"
- asociație de vânătoare / columbofilă / de dans care menționează "educativ" în statut
- casă de ajutor reciproc a salariaților din învățământ (este o unitate de creditare, nu un program educațional)
- asociație de părinți care administrează fondul clasei fără nicio activitate descrisă
- organizație de educație exclusiv pentru adulți sau formare profesională corporativă
- asociație de părinți, de elevi sau de cadre didactice a UNEI SINGURE școli sau grădinițe, chiar dacă descrie activități (after-school, burse, ajutoare) — ele sunt doar pentru elevii ei și nu are ce oferi altei școli
- organizație al cărei scop este să înființeze sau să administreze propria școală, grădiniță sau unitate de învățământ privată
- organizație exclusiv pentru preșcolari, sau exclusiv artistică / sportivă / de sănătate, fără legătură cu parcursul școlar

Regula de decizie, în numele produsului: education_relevant=true înseamnă "o școală rurală din alt sat ar putea să îi scrie și să primească un program pentru elevii ei".

evidence: un citat EXACT, copiat literă cu literă din textul primit, care justifică decizia. Nu rescrie, nu traduce, nu prescurta. Dacă nu găsești niciun fragment care să justifice education_relevant=true, întoarce education_relevant=false și citează fragmentul cel mai apropiat de subiect.

stage: statutul declară o intenție, nu dovedește o activitate. Întoarce "stated_intent" în mod normal. "running" doar dacă textul descrie explicit o activitate în desfășurare (centre deschise, număr de beneficiari, program derulat). "dormant" doar dacă textul însuși indică încetarea activității.

confidence: 0.0-1.0, cât de sigur ești de education_relevant. Sub 0.6 înseamnă că textul nu îți permite să decizi — folosește-l, nu ghici.

programme_types și age_bands: doar ce reiese din text. Liste goale sunt un răspuns corect.`;

// --- helpers -----------------------------------------------------------------
const strip = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
// Groundedness compare: fold diacritics, collapse whitespace, lowercase. Deliberately no more than
// that — the point of the check is that the span is really in the text, and a looser compare
// (dropping punctuation, fuzzy matching) would let a paraphrase through, which is the exact
// failure the check exists to catch.
const norm = s => strip(s).toLowerCase().replace(/\s+/g, ' ').trim();

// `Denumire` is corrupt on 279 of the register's 125,840 rows: the court's disposition text was
// written into the name column instead of the name ("-Admite în parte acţiunea formulată de
// petenta..."). Four of them are in our candidate list. Passing 1,800 characters of a court
// judgment to the model as an organisation's name wastes tokens and actively misleads it, so the
// name is dropped and the row is flagged — the purpose text still carries the decision.
const NAME_JUNK = /^\s*-?\s*(admite|respinge|prin hotarare|prin incheiere|indrepta|dispune|ia act)/i;
const nameSuspect = n => n.length > 150 || NAME_JUNK.test(strip(n));

// The register number is NOT a unique key, despite MATCHMAKING.md §5 calling it "the stable key":
// 3,186 of them appear on more than one organisation, 9 of those inside our candidate list. Keying
// the cache on it alone would silently overwrite one organisation's profile with another's. The key
// is the pair, and the name is normalised so a diacritic or spacing difference between the register
// and the candidate CSV does not split one organisation into two.
const keyOf = (reg, name) => `${String(reg || '').trim()}|${norm(name).slice(0, 60)}`;

function parseCSV(text) {
  const rows = []; let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += ch; }
    else if (ch === '"') q = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (ch !== '\r') field += ch;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// --- 1. which organisations -------------------------------------------------
const cand = parseCSV(fs.readFileSync(IN, 'utf8').replace(/^﻿/, '')).filter(r => r.length > 4);
const ch = cand[0].map(h => h.trim());
const cix = n => ch.indexOf(n);
const [kReg, kName, kCty, kLoc] = ['reg', 'name', 'county', 'locality'].map(cix);
const wanted = new Map();                       // key -> {reg,name,county,locality}
for (const r of cand.slice(1)) {
  const reg = (r[kReg] || '').trim(), name = (r[kName] || '').trim();
  if (!reg && !name) continue;
  wanted.set(keyOf(reg, name), { reg, name, county: r[kCty], locality: r[kLoc] });
}

// --- 2. their purpose text, from the register -------------------------------
// The candidate CSV carries no purpose column, so the register is re-scanned. Same source and the
// same blank-purpose rule as model/ngos.js, so the two agree on which organisations exist at all.
const wb = XLSX.readFile(ONG, { dense: true });
const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });
const H = rows[0].map(h => String(h).trim());
const hix = n => H.indexOf(n);
const iReg = hix('Numar inreg Reg National'), iName = hix('Denumire');
const iJud = hix('Judet'), iLoc = hix('Localitate');
const scopeCols = H.map((h, i) => /^Scopul initial$|^Modificari ale scopului/.test(h) ? i : -1).filter(i => i >= 0);

// A register row is one filing, not one organisation, so several rows can carry the same key. Their
// purpose texts are joined rather than one of them winning: a scope stated in 2008 and amended in
// 2019 are both evidence, and dropping either is how you get a stale answer.
const byKey = new Map();
for (const r of rows.slice(1)) {
  const rawName = String(r[iName]).replace(/\s+/g, ' ').trim();
  const key = keyOf(String(r[iReg]).trim(), rawName);
  if (!wanted.has(key)) continue;
  const purpose = scopeCols.map(i => String(r[i]).trim()).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  if (!/\p{L}/u.test(purpose)) continue;        // same exclusion as ngos.js
  const w = wanted.get(key);
  const suspect = nameSuspect(rawName);
  if (!byKey.has(key)) byKey.set(key, {
    key, reg: w.reg,
    name: suspect ? '(denumire indisponibilă în registru)' : rawName,
    nameSuspect: suspect,
    county: String(r[iJud]).trim() || w.county,
    locality: String(r[iLoc]).trim() || w.locality,
    purposes: [],
  });
  const o = byKey.get(key);
  if (!o.purposes.includes(purpose)) o.purposes.push(purpose);
}
const work = [...byKey.values()].map(o => ({ ...o, purpose: o.purposes.join(' ') }));
const suspectN = work.filter(o => o.nameSuspect).length;
if (work.length < wanted.size) {
  console.log(`note: ${wanted.size - work.length} of ${wanted.size} candidates have no purpose text in ${ONG} and are skipped`);
}
if (suspectN) console.log(`note: ${suspectN} candidates have court text in the Denumire column; classified on purpose text alone`);

const userText = o =>
  `Denumire: ${o.name}\nJudeț: ${o.county}\nLocalitate: ${o.locality}\n\nScop statutar:\n${o.purpose}`;

// --- 3. cache ----------------------------------------------------------------
let cache = {};
if (!FORCE && fs.existsSync(OUT)) {
  try { cache = JSON.parse(fs.readFileSync(OUT, 'utf8')).profiles || {}; }
  catch { console.log(`warning: ${OUT} is unreadable, starting fresh`); }
}
let todo = work.filter(o => !cache[o.key]);
if (LIMIT) todo = todo.slice(0, LIMIT);

// --- dry run: show one prompt and what the run would cost --------------------
if (DRY) {
  const chars = work.reduce((a, o) => a + userText(o).length, 0);
  const sysTok = SYSTEM.length / 3.5, inTok = chars / 3.5 + sysTok * work.length, outTok = 120 * work.length;
  const p = PRICE[MODEL];
  console.log(`--- one prompt, verbatim -------------------------------------------------`);
  console.log(userText(work[0]));
  console.log(`-------------------------------------------------------------------------`);
  console.log(`${work.length} organisations · mean ${Math.round(chars / work.length)} chars of purpose`);
  console.log(`est. ${Math.round(inTok).toLocaleString('en')} input + ${outTok.toLocaleString('en')} output tokens on ${MODEL}`);
  console.log(`est. cost $${(inTok / 1e6 * p.in + outTok / 1e6 * p.out).toFixed(2)} (estimate only — the real figure is printed from usage after a run)`);
  console.log(`cached already: ${Object.keys(cache).length} · would call: ${todo.length}`);
  process.exit(0);
}

if (BACKEND === 'api' && !process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY is not set. Use --dry-run to inspect the prompt and cost without it, or --backend cli.');
  process.exit(1);
}
const client = BACKEND === 'api' ? new Anthropic() : null;
const { execFile } = require('child_process');

// The `claude` CLI, print mode. Everything that is not the classification is switched off: no MCP
// servers (the user's Notion/Slack tool lists alone were 60k tokens of system prompt), no hooks,
// no tools, no session file, low effort. `--json-schema` gives the same structured output the API
// path relies on. CLAUDECODE is unset so a run started from inside a Claude Code session is not
// refused as nested.
function askCli(o, model) {
  const args = ['-p', '--no-session-persistence', '--model', model, '--tools', '', '--output-format', 'json',
    '--strict-mcp-config', '--mcp-config', '{"mcpServers":{}}',
    '--settings', '{"disableAllHooks":true,"env":{"CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC":"1"}}',
    '--effort', 'low', '--system-prompt', SYSTEM, '--json-schema', JSON.stringify(SCHEMA), userText(o)];
  const env = { ...process.env }; delete env.CLAUDECODE;
  return new Promise((resolve, reject) => {
    execFile('claude', args, { env, maxBuffer: 8 * 1024 * 1024, timeout: 180000 }, (err, stdout) => {
      let d;
      try { d = JSON.parse(String(stdout).trim().split('\n').filter(l => l.startsWith('{')).pop()); }
      catch { return reject(new Error('cli: unparseable output' + (err ? ': ' + err.message : ''))); }
      if (d.is_error) return reject(new Error('cli: ' + (d.result || 'error')));
      const mu = d.modelUsage || {};
      const sum = k => Object.values(mu).reduce((a, m) => a + (m[k] || 0), 0);
      const u = { input_tokens: sum('inputTokens') + sum('cacheReadInputTokens') + sum('cacheCreationInputTokens'), output_tokens: sum('outputTokens') };
      if (!d.structured_output) return reject(new Error('cli: no structured output'));
      resolve({ usage: u, content: [{ type: 'text', text: JSON.stringify(d.structured_output) }] });
    });
  });
}

// --- 4. one organisation -----------------------------------------------------
const usage = { in: 0, out: 0, inHard: 0, outHard: 0 };

async function ask(o, model) {
  const res = BACKEND === 'cli' ? await askCli(o, model) : await client.messages.create({
    model,
    max_tokens: 512,              // §6 says 256; Romanian tokenises worse and a truncated response
                                  // is a wasted call, so the ceiling is raised. Output is ~120.
    system: SYSTEM,
    messages: [{ role: 'user', content: userText(o) }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  });
  const u = res.usage || {};
  if (model === MODEL) { usage.in += u.input_tokens || 0; usage.out += u.output_tokens || 0; }
  else { usage.inHard += u.input_tokens || 0; usage.outHard += u.output_tokens || 0; }
  // output_config.format guarantees the first text block is valid JSON against SCHEMA
  const text = res.content.find(b => b.type === 'text').text;
  return JSON.parse(text);
}

async function classify(o) {
  let model = MODEL, out;
  try {
    out = await ask(o, model);
    if (typeof out.confidence === 'number' && out.confidence < ESCALATE_BELOW) {
      model = MODEL_HARD;                       // §6: the cheap worker said it could not decide
      out = await ask(o, model);
    }
  } catch (e) {
    return { key: o.key, error: String(e && e.message || e) };
  }

  // Groundedness. The evidence span is the whole reason a human can audit this without trusting it,
  // so a span that is not actually in the text invalidates the profile rather than merely annotating
  // it: the profile abstains and is flagged for review.
  const grounded = !!out.evidence && norm(o.purpose + ' ' + o.name).includes(norm(out.evidence));

  return {
    key: o.key,
    reg: o.reg,
    name: o.name,
    name_suspect: !!o.nameSuspect,
    county: o.county,
    locality: o.locality,
    education_relevant: grounded ? out.education_relevant : null,   // null = abstain
    confidence: out.confidence,
    evidence: out.evidence,
    grounded,
    programme_types: out.programme_types || [],
    age_bands: out.age_bands || [],
    stage: out.stage,
    model,
    escalated: model === MODEL_HARD,
    source: 'Registrul National ONG 2026, Scopul initial + Modificari ale scopului',
  };
}

// --- 5. run, saving as we go -------------------------------------------------
function save() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    generated: new Date().toISOString().slice(0, 10),
    model: MODEL, escalation_model: MODEL_HARD, backend: BACKEND,
    taxonomy: PROGRAMME_TYPES, age_bands: AGE_BANDS,
    source: IN,
    profiles: cache,
  }, null, 1), 'utf8');
}

(async () => {
  console.log(`${work.length} candidates · ${Object.keys(cache).length} cached · ${todo.length} to classify on ${MODEL} via ${BACKEND} (concurrency ${CONC})`);
  let done = 0, failed = 0;
  const queue = todo.slice();
  // Saving every 25 means a Ctrl-C, a rate limit or a flat battery costs at most 25 rows, not the run.
  const workers = Array.from({ length: Math.max(1, CONC) }, async () => {
    for (;;) {
      const o = queue.shift();
      if (!o) return;
      const p = await classify(o);
      if (p.error) { failed++; console.error(`  ${o.reg} ${o.name.slice(0, 40)} — ${p.error}`); }
      else cache[p.key] = p;
      if (++done % 25 === 0) { save(); process.stdout.write(`  ${done}/${todo.length}\r`); }
    }
  });
  await Promise.all(workers);
  save();

  const all = Object.values(cache);
  const yes = all.filter(p => p.education_relevant === true).length;
  const no = all.filter(p => p.education_relevant === false).length;
  const abstain = all.filter(p => p.education_relevant === null).length;
  const esc = all.filter(p => p.escalated).length;
  const low = all.filter(p => p.confidence < ESCALATE_BELOW).length;
  const cost = usage.in / 1e6 * PRICE[MODEL].in + usage.out / 1e6 * PRICE[MODEL].out
             + usage.inHard / 1e6 * PRICE[MODEL_HARD].in + usage.outHard / 1e6 * PRICE[MODEL_HARD].out;

  console.log(`\nwrote ${OUT}: ${all.length} profiles`);
  console.log(`education_relevant: ${yes} yes · ${no} no · ${abstain} abstained (ungrounded evidence)`);
  console.log(`escalated to ${MODEL_HARD}: ${esc} · still below ${ESCALATE_BELOW} confidence: ${low} · API failures: ${failed}`);
  console.log(`tokens: ${usage.in.toLocaleString('en')} in / ${usage.out.toLocaleString('en')} out (+${usage.inHard.toLocaleString('en')}/${usage.outHard.toLocaleString('en')} escalated) · cost $${cost.toFixed(2)}`);
  console.log(`the regex kept ${work.length}; the model keeps ${yes} (${(100 * yes / work.length).toFixed(0)}%) — that difference is the job`);
})();
