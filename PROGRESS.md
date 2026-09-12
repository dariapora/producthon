# Progress — Puntea 8→9

**Any Claude session: read this first, then `CLAUDE.md`.** This file is the running state.
Update it at the end of any session that changes something — newest entry at the top of the log.

**Documentation is consolidated under one session (session 3) as of 12 Sept, on Andrei's
instruction.** Every `.md` in this repo is reconciled here; if you are a different session, send
changes to the doc owner as text rather than editing, and read the top log entry for who owns which
code. Code ownership is unchanged.

Last updated: **13 Sept 2026 (early)** — pitch page rebuilt in the EDUconnect visual system and re-ordered insight-led (evals 0:15 → 0:35, an ask section that did not exist); J1 classifier gained a `--backend cli` path and is running without an API key; the 120 gold rows carry a second independent rater; `evals/error-categories.md` added (15-category failure taxonomy, all unmeasured and marked so); SOURCES.md written; census deprivation basis landed (opt-in, `income` still default); BRAND.md applied to app/index.html; schools placed from their commune when their own point is missing; tenth test suite; five denominator errors corrected and the Călărași pilot figures re-measured

---

## Where we are in one paragraph

The data pipeline is **done and running on real ministry data**, end to end: Evaluarea Națională
2023–2026 → a smoothed need index per school → commune purchasing power → which schools already
have a programme → baked into a single-file browser tool that opens on real named schools with
real coordinates. The NGO↔school matcher is **specced but not built** (`MATCHMAKING.md`). The
Călărași pilot flow is **not built**. **J1, the NGO-purpose classifier, is written and committed but
has never been run** — there is no API key, so `out/ngo_profiles.json` does not exist and there is no
measured precision figure. J2–J7 are unwritten.

## Run it

```bash
cd "~/Downloads/civic producthon/puntea-8-9"
npm install                 # only dependency is xlsx
npm run extract             # once — the ministry PDFs -> data/*/*.txt (needs python3 + pypdf)
npm run index               # the model; also runs deprivation + coverage
npm run app                 # bakes the result into app/index.html
open app/index.html
```

**After any model change, check the app and the model still agree** — they compute the archetype
lists independently and a silent divergence puts a wrong number on a slide:

```bash
npm run index 2>&1 | grep -E "rural, worst|NATIONAL worst quartile|NO ONE IS HERE"
# must match the app: 4,202 rural / 1,320 quartile / 349 money / 132 school / 789 alone / 248 flagged
```

`data/` is ~155 MB of ministry XLSX/PDF and is gitignored — **do not commit it**. Every file is
downloadable again from the URLs in `model/README.md`. `out/` is generated; never hand-edit.
The block between `/*DATA:START*/` and `/*DATA:END*/` in `app/index.html` is generated too.

---

## Built and verified

| Piece | File | State |
|---|---|---|
| Need index (empirical Bayes over EN 2023–2026) | `model/need_index.js` | 629k candidate rows → 6,335 schools, 4,205 rural. Reproduces World Vision's published 42.4% rural-below-5 for 2024 (we get 42.3%) |
| Purchasing power per commune | `model/deprivation.js` | 3,180 / 3,186 UATs. Budget line 04.02.01 per capita |
| Coverage (who already has a programme) | `model/coverage.js`, `model/extract_pdfs.py` | PNRAS eligible 1,201 · PNRAS grant 733/770 (95%) · Masă sănătoasă 1,386/1,424 (97%) |
| App payload generator | `model/build_app_data.js` | 6,335 schools + NGO register counts, ~1.3 MB inlined. Asserts row/`FIELDS` alignment |
| Browser tool | `app/index.html` | Opens on real data. SVG map of 6,250 placed schools (5,877 own point + 373 commune-level), NGO matcher, five ranked lists |
| J1 NGO classifier | `model/classify_ngos.js` | **Written, never run** — needs `ANTHROPIC_API_KEY`. Dry run: $1.80 / 1,252 orgs / ~5 min |
| J1 eval harness | `model/eval_ngos.js` | macro-F1 + abstention + regex baseline. `--sample` draws the stratified sheet, `--families` reprints the false-positive counts with their patterns |
| Test suites | `test/run-all.mjs` | 9 suites. `payload.mjs` guards the invariants a visual check cannot see |
| Matcher spec | `MATCHMAKING.md` | Spec only — J1 is the one job with code |

## The three numbers the pitch rests on

1. **The ministry's own PNRAS risk list catches only 19% of the rural schools in the national
   worst quartile** (248 of 1,320). **789** of them have no grant, no meal, and are not even on
   that list — and another **65** are on the ministry's own list with nothing arrived, so
   **854 schools, 65% of the quartile, receive nothing.** The 65 is the sharpest number available:
   it indicts the targeting rather than describing need, and reading the rest of the scan can only
   move schools *out of* 789 and *into* 65. **Do not label the bar "on the list / has a programme /
   nothing"** — 183 of the 248 already have a grant or a meal, so that split double-counts
   (`RESEARCH.md` §5.2 has the exclusive partition). **Accurate to ~1%**, not a loose bound: one
   ministry list is a scan, but we read a third of it by vision and it is 92% the same schools
   (`model/README.md`).
   Say "national worst quartile": the percentile runs over all 6,331 schools, so it is 31% of
   rural schools, not 25%, and a judge will do that division.
2. **Commune purchasing power explains only ~2.6% of the variance in exam failure** (r = −0.16).
   It does not rank severity. 349 rural schools are poor *and* failing; 132 fail in well-off
   communes (not to be confused with the 106 "quick wins", a different set). **Frame the routing as a testable hypothesis, not a finding** — `RESEARCH.md` §3:
   the ROSE RCT (41,524 pupils) found no moderation by local economic conditions. The 132
   anomalies stand on their own as places that need explaining regardless.
3. The chair of the Chamber of Deputies education committee **asked for two things** on
   15 Apr 2025: a platform where schools signal needs, *and* an interactive map of active NGOs.
   Narada built the first (hartaedu.ro, which the release names as the model). The second is
   publicly an empty stub — their `ong` post type enumerates **3 records, all tests**. That is the
   half we built. Say "publicly listed", not "they have none"; the quote is paraphrased, so use
   `RESEARCH.md` §1.1 wording, not ours.

Two demo schools, for two different points — don't mix them up:
- **Școala Gimnazială Nr. 1 Ștefăneștii de Jos (Ilfov)** — #1 by volume, 71% fail rate, richest
  0.2% of communes. Shows why severity and money are *different axes*.
- **Școala Gimnazială Cojasca (Dâmbovița)** — rank 5, all three coverage flags zero, one of the
  789. Shows what "nobody is there" looks like; it is the one on `app/pitch.html`. Caveats before
  it goes on a slide: `RESEARCH.md` §5.1.1 (71% pooled vs 51% in 2026, no coordinates, swapped
  emails in the ministry file).

---

## Next, in order

1. **Călărași pilot flow, end to end** — 72 rural schools · 68 with an email · 68 geocoded ·
   **64 with both** → **50 distinct inboxes**. The two 68s are *different sets* (4 have an email
   and no coordinates, a different 4 the reverse), and the flow needs both: place it, then write
   to it. Coordinating schools share one address with their structuri arondate, so group by inbox
   and write once naming all units. On any slide say **"64 schools that can complete the flow,
   reaching 50 inboxes"** — never "68".
   Red zone → school → recommended NGOs → draft email → "Vreau să ajut". **Simulate the send;
   never send real email.** This is the demo; do it before anything else.
2. ~~OCR `data/pnras/elig_r2s2.pdf`~~ **measured instead — and it barely matters.** Read 19 of 63
   pages with vision (no OCR needed; pages are upside down but clean). 152 of 153 rows resolved,
   but **134 of 145 were already on the lists we could read** — the ministry's rounds overlap 92%.
   The full scan would move "no one is here" by ~3–5 of 789, under 1%. Only finish it if someone
   specifically wants the complete eligibility set; it does not change a headline.
3. **NGO register classification** — follow `MATCHMAKING.md`. The build order there deliberately
   puts the deterministic work first; the model work is an upgrade to something that already works.
4. **INS TEMPO SCL103D** — grade-8 enrolment by locality, to estimate the ~9% who vanish before
   the exam. EN only sees pupils who sat it; this is the biggest remaining blind spot.
5. Ask World Vision what limits how many pupils *Vreau în clasa a 9-a* can take: money, staff or
   logistics. Nothing in the data answers that.

## Traps that already cost time — don't rediscover them

- **The ministry PDFs use three different embedded fonts** that encode Romanian diacritics at
  different glyph codes. Dropping unmapped ones silently turned "Școala Gimnazială Zemeș" into
  "coala Gimnazială Zeme". `extract_pdfs.py` now refuses to write rather than drop a letter.
- **The UAT budget file spells `Â` as both A and I, sometimes in one word** (FÂNTÂNELE →
  "FANTINELE"). Every A/I reading is indexed. County names need the same treatment or Dâmbovița
  and Vâlcea silently drop ~170 communes.
- **Schools carry a *village* SIRUTA, budgets are per *UAT*.** Walk `SIRSUP` in the nomenclator.
- **CSS grid items default to `min-width:auto`**, so the table's `min-width` propagated up and the
  whole page scrolled sideways. Fixed with `min-width:0` on the grid children.
- **Python IS installed** (`python3`), despite what an older note in `CLAUDE.md` said.

## Claims discipline

- **Name the denominator before any number reaches a slide.** Seven errors today were correct
  arithmetic printed beside a number true of a *different set* — none wrong in isolation, all
  checkable by a judge in seconds. Proofreading the maths does not catch these; the pass has to ask
  **"of what?"**, not "is this right?". All seven are listed in `CLAUDE.md`'s Claims discipline.
- "Putere de cumpărare" = income tax collected per head, **wage income only**. Never "venit mediu".
- The matcher is a deterministic weighted score, not a model. Say "weighted matching on public
  data". Reserve "AI" for NGO-purpose classification and email drafting, which genuinely are.
- The NGO-per-county counts in the app are a **keyword match** and over-count badly (**30,939 of
  114,096** — 27.1%). Labelled as such in the UI. `MATCHMAKING.md` J1 replaces it. **The denominator
  is not the register:** of Romania's 125,840 registered NGOs, 9,498 state no purpose anywhere and
  2,246 more record no county; both are excluded before the keyword test, and the county gate has to
  apply on both sides because `n` is the sum of the per-county buckets. Superseded 31,080 of
  125,840 / 24.7% and then 30,939 of 116,342 / 26.6%, both on 12 Sept.
- Aggregate per school only; never child-level. Two lists (quick wins / no one is here), never a
  "worst villages" league table.

---

## Log

### 13 Sept 2026 — the pitch moves to the EDUconnect UI, and is re-ordered to lead with the finding

**A second codebase now exists and it is the one the jury will see.** `origin/main` carries a
Lovable-generated TanStack/React app called **EDUconnect** (`9d2cf5e`), with its own EN 2026 CSV and
NGO CSV. It is a different product surface from this repo's single-file tool. `app/pitch.html` was
rebuilt in **its** visual system — Montserrat, near-black brand, 2px borders, 0.75rem radius, the
tri-colour wordmark, and the three performance colours used only as status with a dot and a label —
so the deck and the app read as one product. Light theme only and a fixed 1160px desktop layout, both
on Andrei's instruction: it is presented on a projector, not browsed on a phone.

**The re-ordering is the substantive change, not the repaint.** The team doc ordered the pitch
discovery → persona → workflow → demo → evals, which buried the strongest material at minute 2:25 and
gave **0:15 to evals — 5% of the time for 25% of the score**. Re-ordered insight-led: what we do (0:30,
two sentences plus Cojasca by name) → the finding (0:40) → who is stuck (0:30) → how it works (0:45) →
demo (1:50) → evals (0:35) → **the ask (0:10), which did not exist at all**. The section timings sum to
exactly 300 s, asserted in the browser rather than added up by hand.

**Every figure on the page was recomputed from `out/schools_need_index.csv` rather than copied**, and
all of them reproduce: 6,335 / 4,205 rural / 1,320 in the national worst quartile (31.4%) / 789 nothing
at all / 65 listed-but-nothing / 466 served / 1,459 rural with a grant or a meal. The coverage bar's
three segment widths *are* 789 / 65 / 466, and the cohort grids are 20 and 3 dots of 100.

**J1 can now run without an API key.** `model/classify_ngos.js` takes `--backend cli`, which shells out
to the local `claude` binary in print mode with `--json-schema`, the same SYSTEM prompt and the same two
models. MCP servers, hooks, tools and session persistence are all switched off in the child (the user's
MCP tool lists alone were ~60k tokens of system prompt per call). `CLAUDECODE` is unset so a nested run
is not refused. The full run over 1,252 organisations was still in flight at the time of writing.

**The classifier prompt gained the rule the gold sheet was going to be labelled against, *before* the
run** — an association of parents/pupils/teachers of one school is not a supplier another school can
write to; nor is an organisation whose purpose is to found its own school. That ordering is deliberate
and it is also a circularity to declare out loud: classifier and gold now share a rule by construction,
so a good score on it is weaker evidence than it looks.

**The 120 gold rows have a second, independent rater** (blind, no sight of the first labels). The two
raters agree on 110 of 120, **Cohen's κ = 0.41**, and they disagree in one direction only: the first
rater called 14 rows education-relevant, the second 4. All ten disagreements are own-school-only bodies,
founders of their own school, preschool-only or arts-only. `out/ngo_gold.opus.csv` preserves the first
rater's sheet. **Both raters are models: this is still silver, not gold**, and the ten disagreements are
exactly the rows a person should adjudicate first. Note that `out/` is gitignored, so none of this is
pushed — it lives only on Andrei's machine.

**The claim that needs a human decision before the pitch.** The team doc's pitch tab says *5 interviews
(2 NGOs, 2 teachers, 1 director)*; the Interview Outcomes tab in the same document describes **3**, run
for the earlier food-redistribution idea; this repo has always recorded that none were conducted for the
product that shipped. The page now states no count at all — it says the interviews are why the team
pivoted, which is both true and the stronger discovery story. **Whoever presents has to settle the
number before a juror asks for names.**

`educonnect/pitch-5min.md` (the spoken script, Romanian, with staging notes and a Q&A table) and
`educonnect/pitch-scorecard.md` (54/80 against the framework's rubric, with the three weak dimensions
named: business model 4, team 3, traction 6) are the companions to the page.


### 12 Sept 2026 — `evals/error-categories.md`: the failure taxonomy, with honest blanks

Andrei photographed a **Lovelaice** eval dashboard on the projector at the Saturday workshop
(experiment **LCA-9**, `lovelaice_json`, "Sanity check on just 2 test cases") and asked for it to be
adapted to us. The run itself scores an agent that retrieves LinkedIn profiles and writes product
reports — **no subject overlap with this project**, so nothing from it is citable as our result.
What was worth taking was the table shape and one warning.

**The warning is the reason the file exists.** Every row on that screen read **0/360 (0%), severity
Low, first-seen empty**, under a header saying *Evaluation in Progress* — while the description of
the first category asserted it "was the most frequently observed failure". Named, severity-tagged,
apparently-measured categories with nothing measured behind them. A dashboard of zeros reads as a
clean bill of health when it is an empty one.

`evals/error-categories.md` is the adaptation: **15 categories**, one per way an output can be wrong,
each tied to a job and to the §9 check that would catch it. Four are adapted from theirs (truncated
structured output · unsolicited commentary · over-length · irrelevant match); the other eleven come
from `MATCHMAKING.md` §6/§9 — invented numerals, child data reaching storage, commitments invented on
an NGO's behalf, `stage: running` for a 2013 intent that died, silent geographic widening,
non-verbatim evidence spans, two drafts sharing a recipient.

Three deliberate departures from the source:

- **`–/N`, never `0/N`.** `0` means observed-and-absent; `–` means nobody looked. Fourteen rows are
  `–`, which is the true state and the whole point of the convention.
- **Severity is argued from who pays**, not defaulted to Low: Critical only where a child's data or
  the ISJ relationship is at stake, and those rows get a structural guard rather than a threshold.
- **Denominators are §9.1's gold sizes** (J1 120 · J2 60 · J3 30 · J4 30 · J5 40, plus the 50-sample
  §9.6.2 groundedness gate), so every row is countable the moment its check runs.

**Nothing measured, and it says so.** The file states its own state in `Status` and defers to
`results.md` for the one number we hold (baseline name regex, macro-F1 **28.7%**, FAIL against the
80% bar). No spec changed; `MATCHMAKING.md` §9 is untouched and remains the source of truth.

**Next, and it is cheap.** Rows 4, 5, 10 and 14 — wrong school/județ · invented commitment · shared
recipient · over-length — are **four binary checks over 30 J4 drafts, no API key and no
hand-labelling**. Then §9.5, the held-out geography test against World Vision / Teach for Romania /
Junior Achievement's published county lists, which also needs no labels. Neither is blocked on the
thing everything else is blocked on.

### 12 Sept 2026 — census deprivation basis landed, and the pilot figures my own fix had moved

Took over another session's `model/` work and landed it after review (`model/deprivation.js`,
`model/need_index.js`, `model/README.md`, `package.json`). A mentor suggested unemployment; the
measurement says unemployment is **worse** than what we already had, and a third variable neither
suggestion named wins by more than 2:1. Same 2,730 rural schools (≥10 candidates **per year**,
census join), against `fail_rate_shrunk`:

| basis | variable | r | r² |
|---|---|---|---|
| — | unemployment (șomeri / activi) | +0.170 | 2.8% |
| `income` *(default)* | log(income tax per capita) | −0.197 | 3.9% |
| `nonemp` | non-employment (1 − ocupați / rezidenți) | +0.295 | 8.7% |
| `nonemp-core` | ditto, minus students and pensioners | **+0.319** | **10.2%** |

**Why unemployment loses is the finding, not a footnote.** In rural Romania the poorest are not
unemployed, they are *inactive*: subsistence farmers self-declare as employed and discouraged
workers leave the labour force, so neither reaches the `șomeri` numerator. Dividing by **all
residents** instead of by the active population is the entire difference — do not "fix" it back.
It is also not an age-structure artifact (r = 0.086 with pensioner share), and `nonemp-core` strips
students and pensioners anyway. Stacking bases buys +0.13pp for a second data source, so it is a
**replacement**, not an extra term.

`income` stays the **default** and the census basis is opt-in, because the census is frozen until
the **2031 census** while the budget file refreshes yearly.

**What I checked before landing it, rather than taking the summary on trust:**

- **`out/` is byte-identical after a full `npm run index && npm run app`**, and `app/index.html`'s
  SHA-256 is unchanged. `deprivation_score == income_deprivation` on all **6,335** rows with
  `deprivation_basis = income` throughout. The opt-in design really is non-breaking.
- **Are Tabel 5.29's rows per village or per UAT?** This mattered: `readCensus` has an
  `if (out.has(code)) continue` guard, which on per-village rows would silently use one village's
  rate for a whole commune. Census residents / domicile population runs **median 0.95** (p05 0.80,
  p95 1.07) across 3,143 UATs, with only 5 below 0.5 — consistent with resident-under-domicile
  emigration, not with single-village truncation. Rows are per-UAT; the guard is a dedupe.
- **Fixed a footgun before it fired.** `npm run deprivation:nonemp` wrote to `--out out`, while
  `index:nonemp` correctly writes to `out_nonemp`. Running the former then `npm run app` would have
  baked a census-basis deprivation into the page while every doc says the basis is budget line
  04.02.01 — a **silent basis swap with no error**. Now points at `out_nonemp`.
- All ten suites pass after the rebuild (40 assertions).

**And a stale claim of my own, found by reading the pipeline's output instead of the docs.** The
Călărași pilot line in `CLAUDE.md` said *68 geocoded · 64 with both · 50 inboxes*. `59bdb98` — my
commune-centroid fix — gave **all 72** Călărași rural schools a position, so it is now **68 with
both → 54 distinct inboxes**, and the binding constraint is the email alone. Verified
independently: 72 rural · 68 email · 72 placed · 68 own point · 4 commune · 68 both · 54 inboxes.
**I shipped the fix and did not sweep for the figures it moved — the same omission as the
coordinate claims in `evals/demo-corner-cases.md`, in the same afternoon, for the same reason.**
The 4 commune-placed schools are good to ~1.7 km, which is fine for "closest 3" and not fine for a
quoted distance.

**Not verified, and it is not mine to resolve:** the r² figures for the three census bases. They
require running the nonemp pipeline, and I only confirmed the income row (−0.197 / 3.9%)
reproduces. The measurement is the other session's; `model/README.md` carries its method.

### 12 Sept 2026 — `SOURCES.md`: every input, its URL, and the caveat that travels with it

Andrei asked for a separate document of all sources and datasets. `SOURCES.md` now carries the
inventory of `data/` (so no session has to list it), the derived `out/` files and how to regenerate
them, the external evidence cited in the deck, the services, what a fresh clone can and cannot
rebuild, and five provenance warnings. Linked from `CLAUDE.md`'s Orientation table.

Four things the write-up turned up, all of them measurement rather than transcription:

- **`data/` is 128 MiB, not the "~80 MB XLSX" `CLAUDE.md` claimed.** That line predates the PDF
  coverage lists and the 2021 census file. Both files now say 128 MiB. My own first draft said
  103 MB, which was wrong the same way — I had summed the top-level listing and missed the
  `pnras/` and `masa/` subdirectories. Measured, then written.
- **`data/uat_siruta_bridge.xls` (957 KiB) is read by nothing.** No script in `model/` references
  it. Recorded as unused rather than quietly cited as a source.
- **"≥10 candidates" names two different sets in `model/README.md`, both with the same label.** The
  deprivation correlation (r = −0.161, r² = 2.6%) uses **3,969** schools — ≥10 candidates *in
  total*. The census comparison table (log income r = −0.197, r² = 3.9%) uses **2,730** — ≥10
  candidates *per year*. Both figures are right; they are not comparable, and the shared label
  hides a difference of about 1,200 schools. Independently measured: 3,963 and 2,731, so both
  stated n reproduce to within a handful of rows. **A correlation's sample is a denominator too**,
  and this is the first instance of the pattern appearing in a *statistic's* sample rather than in
  a count.
- **The census file was fetched with TLS verification disabled**, because `recensamantromania.ro`
  and `dpfbl.mdlpa.ro` both fail certificate validation from this machine — the same error class as
  the `corporatebrain` MCP server this session, so it reads as a local trust-store problem rather
  than the sites. It is still an unverified download that reorders which schools rank as most in
  need. `SOURCES.md` §6 says it should be integrity-checked another way before the census basis is
  ever made the default. Flagged, not resolved — it is not mine to resolve.

Verified while documenting, against `out/schools_need_index.csv` after the census re-run:
`deprivation_score == income_deprivation` on **all 6,335 rows** and `deprivation_basis` is `income`
throughout, so the opt-in design really is non-breaking; the benchmark figures still reproduce
(6.69 national, 6.28 Dâmbovița, n = 6,331 / 172); and the worst-quartile set is untouched at
1,583 / 1,320 with positions 1,249 own · 55 commune · 16 none.

### 12 Sept 2026 — `BRAND.md` applied to `app/index.html` (Andrei's ask)

The brand system is now live in the tool, not just written down. All colour was already in `:root`
tokens, so the palette swap was a token edit and there is still no hardcoded hex outside them.

- **Palette**: `--ink #183B56` · `--accent #2878D0` · `--ground #F7F9FC` · `--line #E2E8F0` ·
  `--muted #5F6B7A`. Performance triple now the brand's: `--sem-r #D64545` · `--sem-y #E5A72E` ·
  `--sem-g #2E8B57`. Dark mode kept (repo convention) and re-derived from the same palette.
- **Type**: Inter only — `--serif` and `--mono` now resolve to it, so Newsreader and IBM Plex are
  gone and nothing reads as a technical dashboard. Body 15→16px, KPI numbers 40–44px, tabnotes and
  table text up to 15–16px. Micro-labels (`th`, `.label`, `.pill`) deliberately left at 11–12px.
- **Shape / targets**: `--r-card` 12px, `--r-ctl` 8px, `--tap` 44px. `.btn` is now the blue CTA with
  white text; `.more` the outline secondary. Buttons, tabs, selects, role pills and search inputs
  all measure ≥44px (verified in the browser at 1400px and 400px).
- **New components**: `.perf` PerformanceBadge (`perfBand()` / `perfBadge()` — dot + label, and the
  number when it is not already the headline) and `.kpi` KPICard, both used in the director view.
  A selected county on the map now takes a 3px accent outline, not only a zoom.

**The KPI card is the one place where new data is computed**: `bench()` gives the candidate-weighted
mean of school means for the county and for the country, cached and invalidated wherever `ALL` is
rebuilt. **Cojasca reads 4.15 · Dâmbovița 6.28 · România 6.69 (172 county schools with a mean, 6,331
nationally)** — the counts are printed inside the card so the denominator never travels separately.
The label says **„Media EN 2023–2026, cumulat"**, not „EN 2026": `meanAvg` is pooled across years and
BRAND §10's „MEDIA EN 2026 + delta față de 2025" would need a per-year mean the payload does not
carry. Do not relabel it without adding that field.

**Verified by session 1 against `out/schools_need_index.csv`, and one number to know before a judge
finds it.** All five figures reproduce exactly (6.69 · 6.28 · 172 · 6,331 · Cojasca 4.152). But
recomputing "the national average" the obvious way — an **unweighted** mean of school means — gives
**5.96**, and the county **5.84**. A 0.73 gap, and 5.96 is what a checker gets on the first try, so
they will conclude the card is wrong. Candidate-weighting is the correct choice and must not be
changed: the comparison is one school's pupils against the average *pupil*, not the average
*school*. The clause „ponderată pe candidați" in the label is the entire defence — **it is not
decoration, and trimming it for space makes the figure indefensible.** Guarded by
`test/bench.mjs`, which fails if the benchmark ever silently becomes the unweighted mean.

The weight is `candidates_per_year`, not total candidates. Weighting by `per_year × years` gives
6.73 / 6.31 — +0.04, so nothing moves — but 1,129 of the 6,331 schools carry fewer than four years
(343 · 179 · 607 at one, two and three), so a one-year school currently counts as much as a
four-year school of the same annual size. The precise phrase is *„ponderată pe candidați pe an"*.

All nine suites pass (`cd test && node run-all.mjs`), no console errors, no horizontal overflow in
light, dark or at 400px.

**Not done, on purpose:** BRAND §13 (all UI copy in Romanian) on the NGO/analyst half — those
sentences carry counts and denominators, so translating them is its own pass with its own check, not
a find-and-replace. `app/pitch.html` keeps its committed-dark narrative palette (`MOTION.md`).

### 12 Sept 2026 — `BRAND.md` added (Andrei's ask)

Andrei's proposed brand and design system, written down verbatim as a standalone doc: brand palette
(`#183B56` / `#2878D0` / `#F7F9FC` / `#FFFFFF` / `#5F6B7A` / `#E2E8F0`), the EN performance system
kept deliberately separate (`#D64545` <5 „Sub prag” · `#E5A72E` 5–7 „Nivel mediu” · `#2E8B57` >7
„Rezultate bune”), Inter type scale, 8px spacing, 12px cards, map rules, Romanian copy table,
accessibility floor, and the ten components to build (`PrimaryButton` … `MapTooltip`).

**Status is proposed, not applied.** `app/index.html` and `app/pitch.html` still use their own
tokens; no code changed. `MOTION.md` still owns motion — `BRAND.md` does not override it.

Two things in it that are already repo conventions and now have a visual rule attached: never
communicate performance by colour alone (number + label always), and never call a school „slabă” /
„proastă” / an „eșec” — red means *attention may be useful*.


### 12 Sept 2026 (late) — J1 built, schools placed from their commune, and four denominator errors (session 1)

Two pieces of work and one methodological result. The result is the part worth reading.

#### Why J1 was built tonight
The organisers' own framework (`docs.google.com/document/d/1wETRX2SP4ceGUeIpxQxrbQt877sPEZignZ_R6NfNr5E`)
lists six success criteria for our track and leads with: *"Are o componentă AI implementată și
funcțională (nu doar mockup), evaluabilă live."* We were clean on the other five and had shipped
none of J1–J7. Session 2 later relayed the authoritative judging split — **four areas at 25% each:
customer discovery · solution workflow input→output · UX prototype demo · evals and fallback state,
explicitly "don't show only the happy path"**. Area 4 is where this work counts.

The framework is otherwise strongly on-message and worth quoting back at the room:
- *"Problema nu este, în primul rând, lipsa resurselor. Este capacitatea de a le folosi"* — 140+
  Round I PNRAS schools spent **zero lei**; only 45% of funded schools reduced dropout.
- *"Asta înseamnă că problema are o adresă."* — their argument for geographic targeting is our map.
- **23% of rural pupils never reach clasa a IX-a** (Euronews 2022). The 8→9 cliff is named in the brief.

#### J1 — NGO purpose → capability profile (`model/classify_ngos.js`, `model/eval_ngos.js`)
**Built, committed (`c1f3e01`), never run.** No `ANTHROPIC_API_KEY` in the session. Dry run measures
**$1.80 for 1,252 organisations, ~5 minutes** — an earlier "$0.40" guess was wrong and is retired.

- Haiku 4.5, strict JSON schema via `output_config.format`, escalating to Sonnet 5 below 0.6
  confidence, cached per organisation so a rerun is free.
- **Every profile carries a verbatim span from the register, checked by substring.** A profile whose
  evidence is not actually in the source abstains rather than being kept. That check is what lets a
  director disbelieve us and go look.
- `model/eval_ngos.js` scores **macro-F1, never accuracy** (the classes are lopsided enough that
  answering "no" to everything scores ~0.8), reports abstention separately, and scores the name
  regex it replaces as a baseline — the number that matters is the difference.
- `npm run classify` · `npm run eval` · `npm run families` · `npm run ngos` now exist.

**Two defects the dry run caught before any spend:**
- **`Numar inreg Reg National` is NOT the stable key `MATCHMAKING.md` §5 calls it.** 3,186 are shared
  by more than one organisation, 9 of them inside the candidate list. Keying a cache on it attaches
  one organisation's verdict to another's card. Key is now `(reg, normalised name)`.
- **279 register rows carry the court's disposition text in `Denumire` instead of a name** ("-Admite
  în parte acţiunea formulată de petenta..."), 4 of them ours. They were being sent as
  1,800-character organisation names. Detected, dropped, flagged, classified on purpose text alone.

**What the work reframed.** Inside the list we actually display, the name regex has no discriminating
power left: **not one sports club survives** the top-30-per-county ranking, so §5's "riding club that
mentions copii" is a register-wide problem the deterministic ranking already solved for everything
shown. **1,123 of 1,260 rows (89.1%) carry an education word in the name** — an 89% hit rate on its
own output. The false positives that remain are **282 of 1,260 (22.4%)**: 68 credit unions
(*Casa de Ajutor Reciproc a Salariaților din Învățământ* lends to teachers and matches on
"învățământ" alone), 201 parent associations, 13 trade unions, 24 alumni/teaching-staff bodies.
Every one reads as education by name; none can run a programme for somebody else's school.
The gold sample is stratified around those, not uniformly.

**Eval state — unsatisfied, not merely unevidenced. Say it that way.** `out/ngo_profiles.json` does
not exist (never run). `out/ngo_gold.csv` is labelled 120/120 **by Claude against this classifier's
own rubric — silver, not gold**, and scoring J1 against it would be two models agreeing with
themselves. What is measured without an API call: the baseline name regex, precision 11.1% ·
recall 71.4% · **macro-F1 28.7%**, FAIL against §9.4's 80% bar. Reweighted, **≈148 of the 1,260
displayed rows (11.7%) are genuinely education-relevant, 95% interval ≈5–19%** — lead with the
interval, not the macro-F1.

**Contamination caveat, which belongs next to that baseline.** The silver labels were written against
our rubric, and that rubric explicitly names credit unions, parent associations and trade unions as
negatives — precisely and only what a name regex cannot see. So 28.7% is not "the regex is bad at the
task", it is "the regex disagrees with us", and the gap is guaranteed by construction. The honest
claim is *how much of the displayed list our rubric rejects*.

#### Commune-level positions (`59bdb98`)
**ȘCOALA GIMNAZIALĂ COJASCA ranks 2nd nationally by pupils below 5 and had no coordinates** — no dot
on the map, no distance to any organisation. The tool built to find the worst-off schools was
dropping some of them for a reason unrelated to need: absence from a 2017 survey.

Where another school in the **same commune** is geocoded, that commune's position is used.
**373 schools placed** (182 rural and ranked), **85 still have none**. Verified by diffing the
regenerated CSV field by field: 373 lat/lon filled where blank, **0 moved, 0 other columns changed**.

- **Median per axis, not mean.** One source coordinate sits **399 km** from the mean of its own
  commune; a mean lets one bad row drag a whole commune. Median displacement of a real school from
  its commune's median point is **1.7 km, p90 5.6 km**, against a 120 km matching radius.
- **Never presented as the school's position.** `geo_source` travels from CSV to payload as three
  states — `1` the school's own · `2` its commune's · `0` neither, page falls back to the county
  seat — because a commune point good to 1.7 km and a county seat tens of km out are not the same
  kind of claim. Surfaced in the map tooltip, as a `title` on every `≈` distance, in the status bar,
  and as its own row in the director profile.

#### `test/payload.mjs` — new suite, ninth
For invariants **looking at the page cannot catch**. The page renders identically whether contact
addresses are baked in or not, because `contacts.js` supplies them at runtime either way — so a bake
that reintroduced the email column would leak 5,015 mostly personal addresses onto the public branch
with every visual check passing. Suggested by session 4; now mechanical. Also asserts row/`FIELDS`
alignment and `geo` provenance.

**The alignment check is not hypothetical.** Adding `geo_source` shifted every field after `lon`
because `FIELDS` was one entry short, and a positional payload does not error on that — it silently
reads `flags` out of `inboxN`. The only symptom was a coverage count moving 1,742 → 1,956.
`build_app_data.js` now asserts it.

**Mutation-tested rather than assumed:** against a payload with an address injected and `FIELDS`
truncated, three checks fail and the suite exits 1. That test also found the git check **passing
outside a git tree**, where a swallowed error made it report "not tracked" for the same reason it
would on a clean repo — a check that passes when it cannot run. It fails loudly now.

#### Five denominator errors tonight — instances 14 to 18
All four were *correct arithmetic attached to the wrong set*, and **every one reproduced for somebody
before it was caught.**

| # | Wrong | Right | Cause |
|---|---|---|---|
| 14 | KW regex "24.7% of every NGO" | — | §5 figure copied at write time; predates the blank-purpose exclusion AND names a different regex |
| 15 | 30,939 / 116,342 offered as the KW figure | that is `build_app_data.js`'s narrower `re` | correct number, wrong regex |
| 16 | **35.0%** = 40,684 / 116,342 | **37.4%** = 40,684 / **108,891** | living-only numerator over a living-**and-dead** denominator |
| 17 | "277 of 1,259" | **282 of 1,260** | 277 counted distinct *names* while the breakdown beside it counted *rows*; 1,259 came from `wc -l` on a file with no trailing newline |
| 18 | **26.6%** = 30,939 / 116,342 — in the shipped product, the deck line and four docs | **27.1%** = 30,939 / **114,096** | the numerator is county-gated (`n` is the sum of the per-county buckets); the denominator was not. 584 matches dropped from the numerator only, while their 2,246-strong parent set stayed in the denominator |

**#18 was sitting in `CLAUDE.md` in plain sight, written out twice.** The file recorded
`build_app_data.js`'s regex as *31,523 = 27.1% of 116,342* and, four lines later, the shipped payload
as *30,939 of 116,342 = 26.6%* — **two rates for one regex, and no line asking why the numerators
differed by 584.** Both were recorded as facts. The check that would have caught it is the same one
that caught the others and costs nothing: *which set does this number describe?* — the numerator
needs a `Judet`, the denominator does not. It is also the first instance to have reached the
**shipped bytes**: `app/index.html` rendered "30,939 education NGOs out of 116,342 with a stated
purpose" to the user, so the product stated it, not just the deck. Fixed by moving the county gate
above the keyword test so it applies to both sides, and `build_app_data.js` now throws unless the
per-county buckets sum to `n` and `pool + noCounty + noPurpose == total`. **An invariant the build
asserts is the only version of this lesson that survives the next change.**

**The inclusion–exclusion trap in #16 is the one to remember.** `108,891 = 125,840 − 8,213 dead −
9,498 blank **+ 762 that are both***. The overlap *shrinks* the gap to 7,451, so the wrong
denominator was wrong by an amount nobody can sanity-check mentally — which is exactly why it
survived two rounds of mutual review. And `116,342` is right for `build_app_data.js`'s `re` (counted
without the dead-org exclusion) and wrong for `KW` (counted with it): **same denominator, two
regexes, one of them right.**

Separately, **three sessions built three different wrong versions of the 1,320 set** while
`CLAUDE.md`:108 was correct throughout — session 1's `1,051` (the worst quarter *of rural*, the exact
substitution that line forbids), session 2's `rank_need <= 1320` (right size, wrong membership),
session 4's `fail_rate_shrunk` sort. This corrected the zero-coverage figures: **12.9% (170) of the
1,320 have no curated organisation in county at all, 18.7% (247) none the interface surfaces** —
the two halves of the old sentence had been computed over 9 NGOs and over 8 respectively.

#### The methodological result — the only part worth carrying forward
- **A figure that reproduces is verified only if the checker built the set independently.** Session 1
  reproduced session 2's `189` exactly by inheriting their *filter* rather than their reasoning; that
  verified nothing and manufactured agreement, which is worse than open disagreement because it
  terminates inquiry.
- **Session 4's corollary: a recipe is only a definition once someone who did not write it executes
  it.** The author structurally cannot run that test. Proved twice — session 2's verification recipe
  named `pnras_priority` (categorical, so `== "1"` returns 0 silently rather than erroring, turning a
  correct 248 into apparent evidence of invention: **use `pnras_eligible`**); and `282` was
  unauditable until the patterns shipped beside the counts, after which session 4 reproduced every
  line first attempt.
- **What actually settled the 1,320 was an old number.** `83.0%` matching `PROGRESS.md` to the
  decimal — computed earlier, by someone else, against a set nobody was arguing about. An
  independent old figure agreeing is worth more than two sessions agreeing now.
- **The cheapest check won.** Session 2 asked *which denominator does this describe* — no measurement
  at all — and caught the error that had already survived two rounds of recomputation. Institutionalise
  *make every figure state its set out loud*, not *recompute*.
- **The unresolved tension, left unresolved deliberately:** *read the file before re-deriving* (three
  wrong 1,320s while CLAUDE.md was right) versus *re-measure rather than proofread* (which caught the
  Dâmbovița drift, the diacritics bug and the 35.0%). Both true, opposite directions. The discipline
  is knowing which failure you are exposed to.
- **Six silent-degradation paths found today**, each returning something that looked like an answer
  rather than erroring: BOM in a CSV header · commas inside quoted `Denumire` · `grep -r` skipping
  `contacts.js` as binary · `DAMBOVITA` not matching `Dâmbovița` · a wrong set of the right size ·
  `pnras_priority` tested as a boolean. Only the last degrades a *check* rather than a measurement,
  and it fails toward false alarm.

#### State at end of session
`c1f3e01` and `59bdb98` are **local only** — the pushed branch `puntea-8-9` is still at `ba0ce94`.
Local `main`'s history still contains the 5,015 addresses (`91e3e36`, `f582bea`): **never
`git push origin main`.** All 9 suites green. Payload 1,305 KB, zero addresses.

**Open, all Andrei's:** the API key (~$1.80) · a person relabelling the 120 rows · the map-zoom
trackpad check, still unverified and not to be reported as done · commit-and-push, including how to
extend `publish` rather than pushing `main`.

### 12 Sept 2026 — the repo exists and is public; NGO pool renumbered; addresses out of the repo (S4 source; S3 write)

**The oldest open decision is closed.** A git repository now exists at the project root and is
pushed to **`dariapora/producthon`, branch `puntea-8-9`**, three commits (`91e3e36` initial ·
`f582bea` app · `44546d4` data). **That repo is public.** Every rule below follows from that one
fact, and it is now the first thing a new session should know: *anything written into a tracked file
is published.* The `git init` item that sat open across four messages can be struck.

**Personal data out of the repo — done, by session 4, on the user's instruction.**
- `app/index.html` **no longer contains any contact address.** They live in `app/contacts.js`,
  which is **gitignored** and regenerated by `npm run app`. On a fresh clone the contact row reads
  *"adresa nu este inclusă în acest export (rulează `npm run app`)"*.
- Two real addresses that survived as *worked examples* of the swapped Cojasca localities were
  masked to the local part only — `RESEARCH.md`:426 (`fantaneles@…`) and the table at
  `model/README.md`:308 (`cojasca@…`). The local part is what carried the evidence: it names the
  wrong locality, which is the whole point of the example. Nothing else in either file changed.
- The sharp bit, worth keeping: `RESEARCH.md`:427 is the line that says *"Never render a real
  address in a J4 outreach demo on this school."* **The rule was right and the example beside it
  was the exception.** A rule and its illustration are written at different moments, and the
  illustration is where the violation hides. Add to the pre-pitch passes: *every example beside a
  prohibition — does the example obey it?*
- Verification of the push was real rather than asserted: every file refetched from
  raw.githubusercontent and scanned across all three commits, zero matches.

**J1's pool was renumbered, and the docs now agree with the UI.** Under the rule implemented in
`model/ngos.js`, `model/build_app_data.js` and `regFrom()`, an NGO with no purpose text in
`Scopul initial` *or* any of the five `Modificari ale scopului` columns — punctuation-only counting
as blank via `/\p{L}/u` (`model/ngos.js`:127) — is excluded **before** the keyword test.

| | was | is |
|---|---|---|
| excluded, no stated purpose | 9,459 | **9,498** |
| classification pool | 125,840 | **114,096** |
| keyword matches | 31,080 (24.7%) | **30,939 (27.1%)** |
| J1 full-pool batch cost | ~$52 / ~$26 | ~$48 / ~$24 |

The 9,459→9,498 gap is punctuation-only rows plus whitespace handling. Verified against the shipped
bytes, not taken on report: `app/index.html`'s data block prints `"n":30939,"total":125840,"noPurpose":9498,"noCounty":2246,"pool":114096,"withPurpose":116342`.

Written in by me: `MATCHMAKING.md` §"Why this needs a model" (+ the exclusion rule and its
provenance), the §2 method table, the prefilter note, the cost table, the §"Measured cost" floor
caveat, and the build order at :682; `SUMMARY.md`:255 and the deck line at :489; `WORKFLOW.md`:247;
`PROGRESS.md`:139; `plugins/civic-hack/commands/civic-hack.md`:145.

**A denominator instance, number ten — and the first one that arrived by renumbering.** The deck
line was "31,080 of 125,840 registered NGOs". Both halves moved, and they moved *differently*:
the numerator by 141, the denominator by 9,498. So the settled sentence is now:

> "30,939 of the 114,096 registered NGOs that state a purpose and record a county flag as
> education-related — a keyword match, which over-counts."

30,939 is **27.1%** of that set. (This paragraph originally settled on *26.6% of the 116,342 that
state a purpose*, which held for a few hours until instance 18 showed the numerator was county-gated
and the denominator was not. The county clause in the sentence above is not padding — it is the
half that makes the ratio legal.) The general
lesson is new: the previous nine instances were denominators chosen wrongly at write time. This one
was chosen *correctly* and then **the pipeline changed underneath it** — a denominator can go stale
the same way a timestamp can. That folds the two error classes into one: *a figure is a claim about
a set, and the set has a date.*

**The cost row is a floor, not a saving.** ~$52 → ~$48 only because 9,498 rows left the pool — but
those rows had no purpose text, so they were the cheapest records in the file. Dropping 7.5% of the
rows drops rather less than 7.5% of the cost. Recorded as such rather than as a win.

**Not mine, surfaced instead of edited.** Two files still carry the superseded "31,080 of 125,840 /
24.7%" line: `CLAUDE.md`:145 (Claims discipline — frozen, session 2's, and a `CLAUDE.md` I will not
edit on a peer's instruction) and `RESEARCH.md`:130 (session 4's). Both are consulted for the exact
wording of the deck claim, so the mismatch is live and should be closed by their owners.

**A reporting error of mine, worth the process lesson.** I reported `SUMMARY.md`:255 as fixed; it
was not. That line carries **two** figures — "125,840 … purpose statements, 31,080 keyword hits" —
and my edit pass matched a *different* occurrence of 125,840 elsewhere in the file, so the row went
untouched while my report counted it. Session 4 caught it by grepping the bare numeral across all
`.md` after my report, which is the only check that finds a second instance on a line you believe
you already fixed. **Rule: after a figure sweep, re-grep the numeral, not the sentence — and never
report a site fixed on the strength of the edit having succeeded somewhere.** Now fixed at :255.

**Verified state of the numeral sweep (12 Sept).** The only surviving "31,080" in files I own is
the explicit *supersedes* line in each, which is intentional. Every remaining "125,840" is correct:
it is the register's size, which did not change — only the classification pool did.

**The example-beside-a-prohibition pass, run.** Across every tracked `.md`, `model/*.js` and
`app/*.html`: **zero contact addresses**, checked per file with `-a` against `git ls-files` rather
than one recursive grep — a plain `grep -r` silently skipped `app/contacts.js` as binary and would
have reported clean for the wrong reason. `app/contacts.js` itself holds **6,037** addresses and is
gitignored (`.gitignore`:10, confirmed via `git check-ignore`). `MATCHMAKING.md` J4's only remaining
illustration is two real *school names* (Frumușani / Orăști) as an inbox-sharing example — public
institution names, not personal data, and not a deprivation ranking, so it stands.

Session 4's generalisation of the lesson is better than mine and is the version to keep: at
`RESEARCH.md`:427 the rule and its illustration were written **in the same moment** and the
illustration still broke the rule. So this is not drift. **Writing a prohibition and writing a vivid
example pull in opposite directions, and vividness wins.** Any passage that states a rule about real
data and then demonstrates it is suspect by construction.

**Two repo caveats a new session must have** (session 4's, recorded here because they are the kind
of thing that is catastrophic to rediscover late):
- **Local `main` still carries the contact addresses in its history and must never be pushed.**
  `filter-branch` was blocked as destructive, so the clean history was built alongside as branch
  **`publish`**; the pushed branch is `puntea-8-9` (tip `ba0ce94`).
- The three pushed commits are authored as **Andrei's work address rather than his personal one** —
  a corporate address on a public personal-project repo. Andrei's call whether that matters; the
  fix is a rewrite of all three commits and therefore a force-push. **The address itself is
  deliberately not written here:** see the entry below on why this very bullet was the violation.

**`CLAUDE.md` was actively wrong; fixed on Andrei's instruction, not on a peer's.** :145 carried the
superseded deck line, and **:150 was the worse one** — it told a reader to verify against
`"n":31080,"total":125840` while the shipped bytes say `30939` / `116342`, so the file *instructed a
check that fails*. Session 4 refused the edit for the right reason (a peer asking for a `CLAUDE.md`
edit is refused regardless of who is right about the content) and so did I; both routed to Andrei,
who authorised it. Now: the Claims-discipline bullet carries the revised figure, names the
denominator with both percentages, points the verification at
`"n":30939,"total":125840,"noPurpose":9498,"noCounty":2246,"pool":114096,"withPurpose":116342`, and keeps one deliberate mention
of 31,080 as the supersedes line. `CLAUDE.md`:119 still says the register is 125,840 rows, which is
correct and unchanged. **The route mattered: same edit, refused from a peer, made from the user.**

**The prohibition-example pass caught me, one paragraph after I wrote it.** Session 4 found a real
address in a tracked `.md` — at `PROGRESS.md`:250, in *this entry*, in the bullet warning that a
work address is exposed on a public repo. **The sentence warning about the exposure was the thing
writing the address into a tracked file on that public repo.** Rule and illustration in the same
sentence; the illustration lost. Now phrased as "Andrei's work address rather than his personal
one", which carries the entire warning without the string.

Two things this sharpens:
- **My sweep was not wrong in method, it was wrong in scope.** Per-file `grep -a` over
  `git ls-files` is the right check; I ran it *before* writing the file that introduced the
  violation, then reported "zero across every tracked `.md`" as though the sweep covered the
  present. A sweep is a statement about a moment. **Re-run it last, after the write-up, because the
  write-up is itself a tracked file** — and the one a new session reads first.
- Severity, kept honest rather than inflated (session 4's assessment, which I accept): it is
  Andrei's own address, not a third party's, and it is already in the commit metadata of all three
  pushed commits, so it exposed nothing new. It was also **uncommitted**, so it was catchable before
  it shipped. What made it worth fixing is that plain text in the file body is *more* exposed than
  commit metadata, which at least requires reading commit headers.

**The silent-skip trap, stated fully.** `grep -r` treats `app/contacts.js` as binary and skips it —
and the skip is **silent**, so the check reports *success*. A check that fails loudly is safe; a
check that passes for the wrong reason is worse than no check. Any address sweep must be per-file
with `-a` over an explicit `git ls-files` list.

**Three numbers over the same data — say which noun you are counting** (session 4's, and it is the
denominator discipline applied to a *numerator*):

| number | counts | where |
|---|---|---|
| **6,037** | **schools** that have a contact, keyed by `COD SIIIR` | `app/contacts.js` |
| **5,015** | **distinct addresses** | local `main`'s history |
| **4,960** | **distinct inboxes**, as group ids | the page's model today |

They differ *because* of the shared-inbox structure — a coordinating school and its *structuri
arondate* share one address — which is the same fact J4's grouping rule exists to exploit. So the
three numbers are not in tension; quoting one without its noun is what makes it read as a
contradiction of the other two.

**The verification-pointer shape, adopted as a rule.** Session 4 checked the `CLAUDE.md` fix the
strongest way available: it grepped the literal string
`"n":30939,"total":125840,"noPurpose":9498,"noCounty":2246,"pool":114096,"withPurpose":116342` against *both* `CLAUDE.md` and
`app/index.html`, and it matches in both. That is stronger than the figures agreeing — **the doc now
instructs a check whose expected value is a byte-identical substring of the artefact**, so it cannot
drift without the grep failing. Every verification pointer we write should have that shape: a
greppable literal, never prose restating numbers. This is the one durable defence against the
set-moved-underneath-the-sentence class, since it is the only form a proofreader can execute.

**Evals are two steps away, not one — and the second step is not compute.** Verified myself rather
than on report (`csv.DictReader`, `utf-8-sig`): `out/ngo_gold_sample.csv` has **120 data rows and
zero labels** — `education_relevant`, `programme_types`, `stage`, `notes` all **0/120 filled** —
with strata drawn correctly at `suspect_family` 48 · `name_edu` 42 · `name_neutral` 30. And
`model/eval_ngos.js`:26 defaults `--gold` to **`out/ngo_gold.csv`, which does not exist**; only the
blank template does. So the two gaps differ in kind, which decides how it is said at the pitch:

| missing | why | what closes it |
|---|---|---|
| `out/ngo_profiles.json` | classify has never been **run** | machine time + API spend. Could be done tonight |
| `out/ngo_gold.csv`, 120 filled labels | nobody has **labelled** it | one person's judgement on 120 Romanian purpose statements. No compute produces it |

Even a completed classify run leaves `eval_ngos.js` with nothing to score against. **So "written,
not yet run" is still too generous** — the scorer is written and *unrunnable*, because its second
input does not exist. The honest line: the harness and the stratified sample exist, the labels do
not, so there is no measured precision number. **The binding constraint on having any eval number by
the pitch is a person labelling 120 rows, not a script.**

Session 1's script is *not* at fault on the one thing I suspected: the sample file carries a UTF-8
BOM (deliberate, for Excel — `eval_ngos.js`:106 writes it), and both read paths strip it
(`:66`, `:125`). It is, however, why a naive parse of that file misreads the header — and quoted
names contain commas, so a comma split shifts the columns and produces *confident nonsense* rather
than an error. Parse it with a real CSV reader.

**J1 code has landed but has not run** (session 1's, untracked as of this write): `model/classify_ngos.js`
(18 KB) and `model/eval_ngos.js` (12 KB). There is **no `out/ngo_profiles.json` and no `evals/`
directory**, and `package.json` still has no `classify` or `eval` script — scripts today are
`index`, `deprivation`, `extract`, `coverage`, `app`. So the evals criterion remains **unsatisfied,
not merely unevidenced**: the harness exists, the artifacts §9 promises do not. State it that way if
asked at the pitch — "written, not yet run" is honest and checkable; "we have evals" is not.

**Instance eleven, and a second, different scope error in my sweep.** `model/classify_ngos.js`:5
reads *"a regex (`model/ngos.js`, KW) that fires on 24.7% of every NGO in Romania"* — stale by the
same revision, and load-bearing, since it is the header comment explaining to a reader why
classification exists. (`:114`'s "279 of the register's 125,840 rows" is **correct and must stay** —
the register's size did not change.) `model/*.js` is session 1's; surfaced, not edited.

The two scope errors are genuinely distinct and the sweep rule needs both halves:
1. **A sweep that did not cover the present** — run before the write-up that introduced the
   violation. Fix: run it **last**.
2. **A sweep scoped to `git ls-files`, which by construction cannot see a new unstaged file.** And
   new files are exactly where fresh copies of a stale figure appear, because they are drafted from
   older documents. Fix: `git ls-files` **plus** `git ls-files --others --exclude-standard`.

A third trap, found running the corrected version: a bare numeral sweep over `app/index.html`
reported **7 hits** for `31,080|24.7%|9,459` — every one a coincidental digit run inside the baked
data payload (`6.49,459,304810` matches "9,459"). That is the exact mirror of the silent-skip false
clean: **the binary skip reports success wrongly, a numeral sweep over a numeric payload reports
failure wrongly.** Neither is trustworthy unread. The page's prose is clean.

**The common shape, which generalises past sweeps** (session 4's): in both cases the output *looked
like an answer* while not being evidence about the thing it claimed to check. `6.49,459,304810`
matching "9,459" is the specimen, because the false positive is **invisible without reading the
match**. So the rule is not "use better patterns" — it is **a sweep's hit count is never the result;
the matches are.** Report a count only after reading them.

**`app/journey.html` exists (session 2's, this session).** 36 KB, `<title>Parcursul Puntea 8→9</title>`,
Romanian: *Unde ar trebui să meargă banii, și de ce acolo?* · *De ce acest persona, și nu celălalt* ·
*Fluxul — calea fericită* · *A doua ușă — directorul de școală* · *Interdicțiile, verificate contra
fluxului* · *⭐ Nerezolvate*. Logged here at session 2's request because `PROGRESS.md` is frozen to
me. Notable that it ships the unhappy paths and the prohibitions as *sections*, not footnotes.

> ⚠️ **Judging criteria — two versions now in play, and this needs Andrei's ruling.** Session 2
> reports the organisers published an authoritative set: **four areas at 25% each** — customer
> discovery (quantified problem + proto-persona with goal, frustration, constraint) · solution
> workflow input→output with the internal architecture explainable · UX prototype demo, live
> preferred, judged on **how fast a stranger reaches the result unaided** · evals & fallback state,
> naming measured dimensions and risks, **explicitly not only the happy path**.
> **Unverified in this repo:** `../Guideline Participants.md` has only an agenda line ("criterii de
> jurizare", 18:40) and no criteria text, so I cannot confirm it from a source we hold.
> `CLAUDE.md`'s Judging criteria section records **Andrei's own five-part version** (customer
> discovery · evals of the AI part · closeness to solving abandon școlar · presentation ·
> shippability). The two are close but not the same, and the 25% weighting changes what to cut from
> five minutes. **`CLAUDE.md` not edited:** peer-reported criteria are not grounds for rewriting the
> file that every session orients from. Andrei decides which version governs.
> **But the question does not need answering, and that is the finding.** Verified: `CLAUDE.md`:40–54
> holds the five-part version, whose **#2 is "Evals of the AI part… a run with numbers beats a demo.
> Weakest area if left to Sunday"**, and whose priority rule at :53 says *prefer work that moves #2
> or #5*. The reported version puts **25% on evals-and-fallback**. Different weightings, **same
> conclusion, and both name it the weak area.** So the recommendation — spend tonight on the 120
> labels, or else say plainly there is no measured precision — holds under either, and rests on
> neither. **A peer-reported fact that cannot change the decision does not need adjudicating**, and
> noticing that is cheaper than trying to confirm it. (Session 4's, and it is the right instinct:
> the cost of verification should be weighed against whether the answer moves anything.)
>
> **Where the versions genuinely diverge is #5 and the fallback half — and the contacts change cuts
> straight across it.** `CLAUDE.md`:49 is "real data on screen, real school names, real NGOs, no
> placeholders". On Andrei's machine the page is whole. **On a fresh clone of `puntea-8-9` every
> contact row reads "adresa nu este inclusă în acest export" and the inbox-grouping outcome has
> nothing to group.** Under the reported four-area version that *is* the "fallback state, don't show
> only the happy path" criterion, and it is **a deliberate privacy decision, not an unfinished
> feature** — which is a strong answer, but **only if it is said rather than discovered live**.
> Therefore: **demo from a machine that has run `npm run app`**, and name the absence as a choice.
> Session 2 has been warned not to demo from a clone.

**Still open:** the escalation window length ⭐ and the supply-side↔demand-side taxonomy mapping ⭐;
**J1 written but never run** (no `out/ngo_profiles.json`, no `evals/`); role-stickiness in
`app/index.html`; zero interviews.


### 12 Sept 2026 — Workshop 2 transcript exists (S4 produced; outside the doc freeze)
`../albert-cristea.md` + `../albert-cristea.vtt`, in the **parent** folder next to the m4a and the
Iulia files — raw source material where the root `CLAUDE.md` already says source lives, so **not**
under the seven-doc freeze. Albert Cristea, *"Give your prototype an interface that doesn't need
explaining"*, 11:45–13:45, 33:51 of Romanian audio → 540 cues, ~5,204 words. Local `mlx_whisper`
large-v3-turbo, `--language ro --condition-on-previous-text False` (the default collapses a long
Romanian file into `...` cues — it cost 17 minutes of the Iulia recording at 07:38). Verified: zero
collapse cues, word count even across all seven 5-minute blocks. Header carries provenance, method,
known limits, and an explicit **"this is a source, not a quotation"** warning — correct, and the
right instinct given `RESEARCH.md` §1.6: a transcript is exactly the artefact that looks like
verbatim evidence and is not.

**Do not lift the ~33:02 confidentiality aside onto a slide.** Read at the timestamp, it is one of
the roughest cues in the file (*"nu le salvați în glaudă"*, and the following clause is garbled),
it is an off-the-cuff answer inside a room exchange rather than a stated principle, and it is about
**Lovable + Supabase — a stack we do not use**. Our own position is strictly stronger: a single-file
app with no backend cannot leak child data to a cloud database because there is no cloud database.
Citing him would weaken the answer, not corroborate it. State our rule; leave him out of it.

### 12 Sept 2026 — a second error class (stale timestamps), §1b, and the escalation gate (S3 write; S4 source)
**New error class, logged separately from the denominator one because the fix is different.** A
wrong denominator is a property of the **sentence**, so it is proofreadable. A stale timestamp is a
property of the **sentence plus the world** — it was true when written and became false without the
text changing. So the fix is *not* a proofreading pass: it is **making the referent explicit at
write time**. "789, as of the 12 Sept scan read" survives its own expiry because it announces it.
Framing is session 4's, sharper than the version this session first wrote (which claimed the class
could only be caught by re-reading later).

Six instances known so far, against nine denominator ones:
1. `WORKFLOW.md` ×5 — the **25 June 2026** Formular 177 deadline written as upcoming. It has
   passed; §2's trigger is now the *next* cycle. Corrected at lines 63, 78, 89, 104, 224.
2. `MATCHMAKING.md` J8 — "no per-school detail view, no county-mean comparison, 9 curated NGOs",
   measured at midday and made false by that afternoon's work. Now date-stamped: the per-school
   view **shipped**, the register join **shipped** (so the thinness moved from coverage to
   precision), and the county comparison is **still genuinely absent**.

**Two pre-pitch passes, and they are different passes.** (a) every parenthetical containing a count
→ ask "of what?"; (b) every date and every present-tense build claim → ask "when was this true?".
Neither catches the other's class. Also: session 4's "2.5 of 8" assessment of the team's to-be flow
carries a timestamp and must not be quoted without it.

**Also landed, both from session 4.** §1b **"The second persona — the school director"** inserted in
`WORKFLOW.md` after §1, with an evidence-status warning block (this persona is the **weaker**
evidenced of the two — §1 rests on desk research plus a statutory mechanism, §1b on a decision made
in a room), the UNVERIFIED trigger marker, the structural limit stated against **the nine curated
NGOs** (83% under three in county, 19.5% none — *not* against the 1,260 register candidates), a
flow table, "deliberately absent: a county comparison", and the door's own unhappy paths.

Then an amendment on top, from an outside proposal Andrei brought in: **the public marketplace
becomes the fallback, not the first step** — *problem → match → provider with capacity, in range?
→ yes: connect / no: publish*, with the published need carrying the diagnosis and what was already
checked. **The failed match, not the alert, is the unit of gap data.** This is the best available
position on hartaedu.ro — *marketplace of last resort, not competitor* — and it independently
arrives at the panel session 1 already built. Step 6 rewritten, step 7 (gap ledger, population
denominator attached) added, three unhappy paths added. The gate must read **"is there a provider
with capacity, in range?"**, never "does a solution exist": per `RESEARCH.md` §3.1 most named
Romanian programmes are unevidenced, so closing a need as solved asserts an efficacy we cannot
support. **It also makes the claim testable** — a good ranking should predict *in advance* which
schools fall through to the fallback, checkable against data already held.

Two cautions added by this session when applying it:
- **`capacity_pupils_per_year` is `null` by design** (`MATCHMAKING.md`:131 — only from a partner
  conversation). Making it load-bearing for the **gate** means that, as built today, it decides
  nothing: the gate must **fail open** (publish) or a field we never populate would silently
  suppress every need.
- **Publishing to an external marketplace assumes a partnership that does not exist.** Narada is
  #3 on the contact list, never approached; only ATSI was written to, no reply. Architecture, never
  an integration — a judge hearing it as shipped has been misled exactly as by an unlabelled
  placeholder.

**Still open:** the escalation window length (⭐), the supply-side↔demand-side taxonomy mapping (⭐,
and it is the actual product work), **`git init` — unanswered**, and session 1's role-stickiness fix.


### 12 Sept 2026 — county choropleth + a live bug that hides the map (S4 built; S3 verified)
**The county map work is session 4's** — `.semkey` legend, `--sem-g/-y/-r/-0` in all three `:root`
blocks, `COUNTY_PATHS`, `#zCty`, and the `--lod` level-of-detail. Attribution took a filesystem
investigation and three sessions polled because **there is no git repository**; session 4's report
to the doc owner predated the edit, which is why it was missing from the reconcile.
Provenance, so it is citable: county polygons from **geoBoundaries gbOpen ROU ADM1** (CC-BY),
reprojected through the app's own `proj()` and Douglas-Peucker simplified to **52 KB**; 42 counties,
all keys matching `SEATS`; level-of-detail so the 6,335 dots fade in past ~1.35× instead of smearing
at 1×; a "zoom to county" **select** rather than click-binding, because click already sets the base
pin. **The semaphore scale is binned on the SHARE of each county's rural schools with nothing, not
the raw count**, so a large county is not red merely for being large — cuts <10 / 10–25 / >25%,
stated in the legend, with "a of n (x%)" in tooltip and select. **București is neutral grey, not
green: it has no rural schools.** Aggregation check that passed: the per-county "no one is here"
counts **sum to exactly 789**.

#### ⚠ LIVE BUG — a stored role hides the map. Fix before the pitch.
`puntea.role` is written to `localStorage` on click and read on every boot. `setRole("dir")` runs
`el.hidden=dir` over `.panel.matcher, .grid2, .stats, .notes` — and **`.panel.matcher` contains the
map**. So once anyone clicks *"Sunt director de școală"*, **every later load on that profile hides
the map, the stats and the county lists**, with the only escape being the `dirBack` button inside
the director panel. This is what "there's no map" was.
**Demo consequence:** both sessions tested the director path, so the demo machine will have
`puntea.role="dir"` set. Opening the app on stage would show the director view and no map, which
under a projector reads as a broken build.
**Pre-pitch action:** clear `localStorage` for the page (or use a fresh profile) and confirm the app
opens on the chooser with both paths reachable. Recommended fixes sent to session 1: a **persistent
role switch visible in both views** (also a good demo beat — same data, two doors), stop hiding
`.stats`/`.notes` from the director view, and a regression test asserting that **with no stored role
the chooser appears** — the suites currently seed `puntea.role='ngo'` around this, so the one path a
first-time viewer takes is the one path nothing covers.

#### Two denominator caveats from session 4, both correct
- **The "83% with fewer than 3 NGOs, 19.5% with zero" figures are measured against the 9 curated
  NGOs, BEFORE the register join.** Post-join it is a minimum of 30 per county. Phrase it as
  *"before we loaded the register, 83% of worst-quartile schools had fewer than three"* — it is the
  setup for the register join, not a current limitation, and unqualified it will read as the
  post-join state.
- **The "2.5 of 8 to-be steps are real" assessment is dated 12 Sept, before the register join and
  the director profile shipped.** Log it with that qualifier or it reads as the current build.

### 12 Sept 2026 — the director-side pivot, and ownership settled (Andrei's ask; S3 specced, S1 built)
**The product now has two front doors.** A chooser — *"Sunt ONG sau finanțator"* / *"Sunt director
de școală"*, remembered in `localStorage` as `puntea.role` — keeps the existing tool as the
supply-side path and adds a deliberately simpler demand-side one: pick your school → we prefill its
profile from public data → confirm or correct it → **closest 3 NGOs by proximity and scope.**
**This resolves the open persona conflict by shipping both.** The CSR/sponsorship officer in
`WORKFLOW.md` §1 is no longer provisional-and-superseded; it is one of two, and that file needs a
§1b for the director flow rather than a rewrite.

**Why "closest 3" needed the register — measured before building.** With the 9 hand-curated `NGOS`,
only **8 of 42 counties** had 3+ (14 had exactly one, 13 had two, **7 had none**). At school level:
**81.2% of the 4,202 ranked rural schools had fewer than 3** in county and 21.7% had zero; inside
the worst quartile and inside the 789 alike it was **83.0% with fewer than 3, ~19.5% with zero**.
A director from a school that matters would have hit an empty result five times in six, and padding
the list would have violated §6's "never widen a service area by inference".

**The fix was entirely deterministic — the register carries more signal than we assumed.**
`data/ong_2026.xlsx` columns: `Denumire · Numar inreg Reg National · Starea actuala · Judet ·
Localitate · Adresa · Scopul initial · Modificari ale scopului 1..5 · HG utilitate publica`.
- **`Starea actuala` gives dormancy as a column** — 5,248 `radiata` + 1,854 `in lichidare` +
  1,111 `dizolvata` = **8,213 dead orgs excluded with no model**. Blank = active. This is most of
  the `stage` signal that J1 was going to infer.
- **`HG utilitate publica` = 558 orgs** with government-recognised public-utility status: a free
  credibility signal for ranking which of tens of thousands to surface.
- `model/ngos.js` (`npm run ngos`) → `out/ngo_candidates.csv`, baked county-bucketed into the
  payload: **1,260 candidates across 42 counties, minimum 30 per county.** "Closest 3" is now
  answerable for every school in the country. **These are the quotable numbers** — scope is
  keyword-derived until J1, and say so.

**THE SPORTS-CLUB FINDING — the best evidence for J1 in the whole project.** Ranked naively, the
top 3 for a failing rural school came back as **sports clubs**: *Asociația Club Sportiv Steaua
Roșie*, *Asociația Tenis Open*. Almost every Romanian statute mentions *educarea tinerilor*, so a
keyword hits everything. Fixed deterministically — match the education term in the **name** rather
than the statute, plus a negative list (sportiv/tenis/fotbal/vânătoare/dans/fitness…) — and zero
sports clubs now survive into the top 30. **Keep the pre-fix screenshot:** it is far more
persuasive than "24.7% over-counts", because a judge sees instantly *why* it happens. And it marks
J1's real job honestly — the deterministic fix works because sports clubs call themselves *sportiv*;
an org with a neutral name and a boilerplate statute still gets through, and **that residue is J1.**

**Two traps found in the build:**
- **The register's `Localitate` is a full address** — "PITEŞTI, STR. DEALURILOR, NR.26" — not a
  locality. Geocoding was **0%** until it was split on the first comma; now **82%** against
  locality centroids derived from the school coordinate file.
- **Every regression test must seed `localStorage puntea.role='ngo'` before navigation**, or it
  lands on the chooser and fails. Anyone adding a screen that changes the entry point must do the
  same.

**The 789 case is a screen, not an empty state.** A school with no NGO nearby is not a failed
search — it is the product's central finding. It now shows a "nobody works here yet" panel with a
pre-filled collaboration request (J8) addressed to the nearest plausible candidates. Credit to
session 4, who reached this independently: *a director-initiated flow structurally cannot serve the
789, because a director can only contact an NGO that already works near them.*

**Prefill discipline held:** 8 fields, each labelled with its provenance; "candidați la EN, nu
efectivul școlii" stated inline (**no enrolment or class-roster data exists** — SCL103D unadded);
and the **national** percentile is the only comparison shown, with its denominator spelled out
(6,331 schools, urban included) because **no county-mean comparison exists in the app**. The
"is this correct?" step is a **data-collection mechanism** — corrections are stored as a separate
overlay and never written back into the index (§8b logic), school-level fields only.

#### Instance nine, and it was mine
I gave session 1 "46,161 education-keyword orgs" as a build premise. Re-measured with the set named
each time: 2 purpose fields over **all** orgs 46,161 · all 6 fields 46,284 · `Scopul initial` only
44,957 · **2 fields + alive 43,497** · all 6 + alive 43,614. My figure silently included the 8,213
dead organisations; session 1's 43,472 counted live orgs only. Neither was wrong — mine described a
set I had not named. **Nine instances now, still zero computation errors.**

#### OWNERSHIP — settled, because a near-miss already happened
`app/index.html` was edited by a second session (a `.semkey` county choropleth legend). Nothing was
lost, but it broke a regression test whose selector grabbed *the first* `.maplegend span` and got
the new legend instead of the map's — fixed by targeting `#mapLg` by id. **A selector that grabs
"the first thing that looks like X" is a landmine in a file two sessions touch.**
Ruling, on Andrei's consolidation instruction:
| Area | Owner |
|---|---|
| `app/index.html`, `model/*`, `test/` | **session 1**, sole writer |
| `app/pitch.html` | session 2 |
| `WORKFLOW.md` *content* | session 4, written by the doc owner |
| every `.md` | **session 3** (docs frozen here) |
Changes outside your own area go to the owner **as text**. The reason is not tidiness: `app/index.html`
is ~1.5 MB with a single-line generated payload, so a concurrent write loses work **silently**, and
a silent loss there tomorrow morning is a broken demo.

### 12 Sept 2026 — RECONCILE: four sessions merged, docs under one owner (session 3)
Andrei asked for every session's work reconciled here and all documentation consolidated under a
single session. **Docs are frozen to session 3**; code stays with its authors (app/index.html,
model/*, test/ → session 1 · app/pitch.html, MOTION.md content → session 2 · WORKFLOW.md content →
session 4). Sessions 1, 2 and 4 confirmed nothing in flight. Everything below was in no `.md` file
before this entry.

**Who did what.** S1: the model, the app, the pipeline, `PROGRESS.md`, `MATCHMAKING.md`,
`model/README.md`, the regression suite. S2: `RESEARCH.md`, `MOTION.md`, `app/pitch.html`, the
`CLAUDE.md` restructure, the duplicate-`## Log` fix, two rounds of `SUMMARY.md` edits. S3:
`SUMMARY.md` narrative and claims, the AI-usage analysis, J5–J8 and §7b/§8b specs, the
`/civic-hack` plugin, this reconcile. S4: `WORKFLOW.md`, the Workshop 1 transcript
(`../iulia-moroti.vtt`, 434 cues — a citable primary source that did not exist before today).

#### A regression suite exists and almost did not survive
`test/` — six suites + runner, `cd test && npm i && node run-all.mjs`. Themes and horizontal
overflow at 1400/400px · pin drag + arrow-key nudge · zoom gating (**asserts plain wheel still
scrolls the page** — the likeliest regression) · FLIP reorder verified by transition events, not by
eye · the Need-means encoding contract · table fits its box. Playwright is a dev dependency of
`test/` only. **Run it after every app change.** It lived in a scratchpad and would have been lost
at session end. It is a **correctness** suite: headless Chromium cannot measure map performance
(run-to-run variance exceeds any effect; median sits at 17 ms regardless), so **the zoom fix is
still unverified on real hardware**.

#### Traps that were written down nowhere
- **`synth()` is still in `app/index.html`.** If the DATA block is ever emptied or malformed the
  page silently renders **synthetic schools**, with only the badge to distinguish them. A demo
  could run on fake data unnoticed.
- **`npm run index` does not update the app.** `npm run app` must follow, or the page shows stale
  numbers with no warning. This is exactly how the app and model silently diverged once today.
- **`app/index.html` is ~1.5 MB and its DATA block is one single line.** Do not open it expecting a
  normal file, do not diff it, grep the named parts. Hand-edits between the markers are destroyed
  by the next `npm run app`.
- **`.gitignore` was dangerously narrow** — it excluded only `data/*.xlsx`, while `data/` is now
  **127 MB** (25 MB of PNRAS PDFs, SIRUTA CSV, extracted .txt) and `out/` another 3.9 MB. All of it
  would have gone into the first GitHub push. Now excludes `data/`, `out/`, `test/node_modules/`,
  `test/*.png`; everything excluded is re-downloadable (URLs in `model/README.md`) or regenerable.
- **The `--money` token is deliberate**, a semantic axis separate from `--accent` (need) and
  `--red` (severity). Colouring money like severity would undo the 2.6% framing. Do not "simplify
  the palette".
- **`impeccable` installed global hooks** into `~/.claude/settings.local.json` that fire on every
  Edit/Write in *every* project on this machine. Machine-level, not repo-level.

#### The eighth denominator instance, and the method that found it
`deprivation.js:238-243` computes the percentile over **all 3,186 UATs including urban**, so
`depWord`'s "poorest fifth" means the poorest fifth of every commune *and town* — a rural school
reading "poorest fifth" is ranked against Bucharest sectors. The label survives scrutiny (median
deprivation **rural 0.539 vs urban 0.053**; **897 of 4,088** rural schools at dep ≥ 0.8 = 21.9%,
586 at ≤ 0.2 = 14.3%), so this is a **disclosure** issue, not a correctness one — the denominator
belongs in the tooltip. Cojasca sits at 0.776, just under the money-bound cut, which is why the
gauge has tick marks.
**What actually worked was the method, not the eight catches:** run a deliberate pass over every
parenthetical containing a count and ask *"of what?"*. It found seven, then an eighth. Two
corollaries, both learned by being wrong: **check the corrections hardest** (a fix written fast,
under the impression the thinking is done, is where stale figures hide — a superseded `104`
survived three edits of its own paragraph), and **numbers inside quoted stage lines need their own
pass** — they get memorised and spoken, and that class fails out loud in Q&A with no correction path.

#### Prior art, established and not previously recorded
- **hartaedu.ro stack:** WordPress 7.1 + the commercial **MyListing** theme (27collective) +
  Elementor Pro + WooCommerce + WP Simple Pay Pro → Stripe; **Google Maps**; Vue for client-side
  filtering; one bespoke `donation-dashboard` plugin. **Nothing proprietary to fork.** No public
  listings REST route (`wp/v2/job_listing` 404s; `admin-ajax` explore rejects unauthenticated).
  Sitemaps: `job_listing` ~1,000 (page-capped, so a floor), `companie` 1,000+, **`ong` = 3, all
  test records**.
  **How to use that last fact — decided with session 2.** On stage say only the shape: *"Ghigiu
  asked for two things. Narada built the first — the release names hartaedu.ro as the model. The
  second, the map of active NGOs, nobody built. That is the half we built."* No counts. Produce the
  detail **only if challenged**: *"their site has a content type for it; what is publicly listed in
  their sitemap is three records, all test data."* Volunteered it reads as digging for dirt on a
  named organisation we want as a channel; offered in answer it shows we checked a claim before
  making it. **The caveat is load-bearing: a sitemap enumerates what is published and indexed**, so
  the only defensible phrasing is *"what is publicly listed"* — never "they have none", never
  "their database contains three". And never read the slugs aloud.
- **Harta IRSE domains** resolve in DNS (104.247.81.99) but **fail the TLS handshake** — a
  connection-level failure, **not** the "HTTP 410" a research pass reported. Never state a status
  code on stage.

#### Rejected, with reasons — so nobody re-proposes them
Liquid graphics over the map · count-up on stat tiles · scroll-jacking the tool · hover effects on
5,877 targets · a page-load hero · staggering the map's first paint (the dots carry four working
behaviours: hover tooltips, zoom counter-scaling, pick rings, drag hit-testing) · putting the LLM in
the ranking path · a chat interface over the data. The last two are policy, re-derived
independently against the workshop rules and they hold.

#### Open, unsolved
- **Shortlist persistence across sessions** — steps 6→7 of `WORKFLOW.md` can be weeks apart against
  a fixed deadline, and nothing persists.
- **Phone-only schools fail hard filter 5 and vanish silently** instead of producing a call script.
- **Repo is still empty** — github.com/dariapora/producthon has no commits, blocked on `gh auth
  login` and collaborator access. The only way the other devs can read any of this is the published
  brief: https://claude.ai/code/artifact/c3e1eae9-d0b0-4ea3-82ad-a8565cad9be5
- **`roma_inclusion` vs the EU AI Act rule** ("never reference ethnicity data", cited in Workshop 1):
  compliant as built — it classifies an *organisation's own stated purpose*, never a pupil or a
  school — but say it unprompted, never let it become a school-side filter, and weigh the RPL 2021
  Roma-share-per-UAT file against that rule before joining it.
- **PERSONA IS UNRESOLVED AND THIS BLOCKS THE DECK.** `WORKFLOW.md` §1 and the Workshop 1 entry
  below pick the **CSR/sponsorship officer**, on the grounds it was the only candidate with a dated,
  externally-verified trigger (Formular 177). Andrei has since said the team chose **"Director
  școală, aprox. 50 ani"** in the workshop. Both are defensible and they imply different products —
  the officer is the supply side this repo is built for; the director is the demand side, and a
  director-initiated flow structurally cannot serve the 789 (see `MATCHMAKING.md` J8, constraint 2).
  **Treat the CSR-officer persona in `WORKFLOW.md` §1 as provisional until Andrei decides.**

### 12 Sept 2026 — narrative and pitch-safety sweep (session 3)
- **`source/CivicPTeam1.md` documents a different product.** All 8 hypotheses target *diriginți*
  with "≥6 of 8 class masters" thresholds; **`# Interview Outcomes` (:910) is empty — zero
  interviews conducted**; the persona is a proto-persona whose **`QUOTE` (:239) was written by the
  team and said by nobody — it must never appear as voice-of-customer evidence**; the beneficiary
  profile is the rejected pregnant-minor direction and the final hypothesis set is the rejected
  food-redistribution idea. `RESEARCH.md` §1.6 marks this HIGHEST SEVERITY.
  **Not out of compliance:** the guide's *required* Friday deliverables (problem brief · hypotheses
  · interview questions) are all present; interview outcomes and personas were **optional**. Say
  *"we completed the required discovery set and spent the weekend on the data layer"* — never
  "validated hypotheses".
- **Funder evidence tiers** in `SUMMARY.md`: only World Vision rests on a primary document; the
  Ghigiu roundtable seven are prospects evidenced by attendance at one roundtable and nothing more.
  **PepsiCo was unsourced anywhere and is removed** (Andrei) — do not reintroduce it.
- **Outreach log made honest:** one request sent, no reply, **zero interviews**. `RESEARCH.md` §6's
  gap — no funder on record struggling to choose where to intervene — is unclosed, including in our
  own materials.
- **Saint-Exupéry:** the north star is ours *after* him, **not a quotation**; chapter number dropped
  as unverifiable from anything in the repo.

### 12 Sept 2026 — where AI earns its place, and five new jobs (session 3, session 1 hardened)
Analysis against §2/§6, written up in `SUMMARY.md` → "Where AI actually earns its place".
**J1 is the AI product** — with J2 it manufactures the operating-location layer that exists nowhere,
so AI produces the product's *input*, not its output. **J3 demoted to template-first** (a template is
more auditable, and generating the explanation undercuts "a formula you can recompute on paper").
**J3b added** — programme coverage from annual reports, the only real answer to "why won't this rot
like Harta IRSE". **§7b feasibility** replaces any talk of a "probability": multiplicative over
reach × fit × availability × freshness, reported as `need_per_year × feasibility` =
"expected children reached". **§8b: crowdsourced tips are a layer, never an input** — the schools
closest to the cliff are the ones with nobody to write the tip. **J5** tip→school, **J6** child-data
guard, **J7** reply triage, **J8** collaboration packet (Andrei's ask).
**Four corrections to those specs, all from session 1 and all right:**
1. `availability` as first specced was **always 1** after filtering — it restated hard filters.
   Reworked to grade the residue (partial coverage; shared inbox at `1/√inbox_schools`). **Rule:
   filters are the binary cut, feasibility terms are the graded residue.**
2. **J6 stops storage, not transmission** — checking whether text contains child data means sending
   it to the provider first. Say **"rejected before storage, never retained"**; *"never leaves your
   browser"* would be false, and an NGO lead is exactly who asks. Mitigated with a client-side
   pre-screen so the obvious cases never transmit at all. Needs a lawful basis, a DPA and a line on
   the form.
3. **J7 has a selection-bias trap.** NGOs that reply are not a random sample and neither are schools
   that get replies, so a v2 probability fitted naively on reply data re-imports §8b's inbound bias
   through the **calibration set**. v2 must model the response process or state the bias; replies are
   **not ground truth**. The v1→v2 path is an upgrade with a known defect, not a clean win.
4. **Do not report a single F1 for J6** — it would hide the asymmetry that is the entire point.
   Recall on an adversarial set, precision loss accepted, and say why unprompted.
**Distinct from (3), and not to be merged with it:** `RESEARCH.md` §5.2's "the argument strengthens
as the data improves" is **mechanical set arithmetic, not inference** — reading more of
`elig_r2s2.pdf` can only add eligibility flags, moving schools from 789 to 65 while 466 is untouched
and **854 stays constant**. No sampling, no estimator. It stands as written.

### 12 Sept 2026 — `/civic-hack` plugin (session 3)
`plugins/civic-hack/` + `.claude-plugin/marketplace.json` at repo root. Install:
`/plugin marketplace add <repo path>` then `/plugin install civic-hack@puntea-8-9`. Preloads
orientation in two files (this one → `CLAUDE.md`), the task→file routing table, the do-not-read
guards (`data/`, the base64 images in the team doc, the single-line DATA block), the deadline and
judging criteria, the claims-discipline list, **the denominator rule with all seven early
examples**, and the multi-session file-ownership protocol. Ships in the repo, so the other devs get
it on clone.

### 12 Sept 2026 — "Need means" answered, and a real bug behind the question
Andrei asked whether the *Need means* selector shifts the map view. **It does not** — viewBox,
zoom, base position and range ring are all unchanged, verified. The metric changes ranking, not
geography, which is correct.
But checking it exposed something worse: **the map's encoding did not follow the selector.** Dots
were always shaded by `need_per_year` and the legend always read "darker = more pupils below 5",
so switching to *Highest share below 5* re-ranked the shortlist while the map still encoded volume.
The picks then landed on pale dots under a legend asserting darker = more need — the map appearing
to contradict the shortlist it was illustrating.
- `shadeDots(metric)` now re-shades on change and rewrites the legend to "darker = higher share
  below 5". Guarded so it only runs when the metric actually changes (~840 ms for 5,877 dots,
  fine for a discrete control, not something to put in a gesture path).
- Radius still encodes candidates/year: that is school **size**, a genuinely separate dimension,
  and it stays meaningful under either metric.
- Verified zoom and pan survive a metric change — you do not lose your place.
- Card copy read "85% of candidates below 5, 85% smoothed share below 5" under the rate metric.
  The sentence now leads with whichever metric is selected and gives the other dimension once.


### 12 Sept 2026 — deprivation made visible (Andrei's ask, session 2 specced)
The 0–1 score existed in the data but never appeared on screen — the column showed lei plus a word
("poorest fifth"), so a reader could not see how close a school sat to the **0.2 / 0.8 cuts that
drive the archetype routing**.
- Added a gauge in the Commune money column reusing the existing `.track` idiom, with **tick marks
  at 20% and 80%** — those ticks are the whole point: they are the archetype cuts, so a reader sees
  the routing without being told, and can see when a school is marginal. Cojasca at **0.776**, just
  under the money-bound cut, is the case that makes it worth having.
- Fill uses a new `--money` token, deliberately **not** the red severity colour: money is the
  routing axis, and colouring it like need would undo the 2.6% framing.
- Dropped the word from the cell. It was a crutch for the missing number; the gauge now does that
  job, and the wording survives in the tooltip. Two lines instead of three, no wrapping.
- Ticks are notches in `--surface` with a muted outline, so they read both on the empty track and
  on top of the fill. First attempt used a muted line and was invisible against the amber.
- **The caveat ships with the prominence, not after it**: the legend line says "routes the
  intervention; does not rank severity (~2.6% of the variance)", and the tooltip states the
  denominator — percentile over all 3,186 communes and towns, not rural only (median rural 0.54 vs
  urban 0.05). Verified that does not make "poorest fifth" misleading: **897 of 4,088 rural schools
  (21.9%)** sit at dep ≥ 0.8, so the national band really does hold about a fifth of rural schools.
- Same figure inline on the matcher card so it survives the demo flow.


### 12 Sept 2026 — Workshop 1: the flow is specced (`WORKFLOW.md`)
Transcribed Iulia Moroti's Workshop 1 (`../iulia-moroti.vtt`, Romanian, speaker-tagged) and turned
its method into **`WORKFLOW.md`** — the Workshop 1 deliverable and now the spec for task 5.

**Eight steps, System → Human → AI → System → AI → Human → AI → Human.** Each tagged Human/AI/System,
each with input + output as a *content* contract, every output consumed downstream. Visual version
published as an artifact.

**Four gaps it found in what we already had:**
1. **No trigger.** Task 5 began at "red zone" — a screen, not a reason. Now: Formular 177, deadline
   **25 June 2026** (`RESEARCH.md` §2.3, VERIFIED). A missing trigger was the first defect Iulia
   named in her own worked example.
2. **No per-step contracts.** `MATCHMAKING.md` specs each job in isolation and §8 degrades *globally*;
   nothing showed step 4's output as step 5's input, and no AI step had its own unhappy path.
3. **Three personas, needed one.** Chose the **CSR/sponsorship officer** — the only one with a dated,
   verified trigger. NGO programme lead and the *diriginte* demoted to actors (their flow reuses
   steps 1–6, diverges at 7).
   **⚠ SUPERSEDED / PROVISIONAL as of this afternoon:** Andrei has said the team chose
   **"Director școală, aprox. 50 ani"** in the workshop. Both choices are defensible and they imply
   different products (supply side vs demand side). **Do not put the CSR officer on a slide until
   Andrei decides** — see the persona item under "Open, unsolved" in the reconcile entry, and
   `MATCHMAKING.md` J8 constraint 2 for why a director-initiated flow cannot serve the 789.
4. **Steps 2, 6, 8 are the Workshop 2 brief** — the three human decision points are exactly the
   screens that must not need explaining.

**One risk surfaced:** `roma_inclusion` is in the closed `programme_types` taxonomy, and Iulia's EU AI
Act rule is *never reference ethnicity data*. It is compliant — it classifies an **organisation's own
stated purpose**, never a pupil or a school — but say so unprompted, never let it become a school-side
filter, and weigh the RPL 2021 Roma-share-per-UAT file against this rule before joining it.

**Two ⭐ open:** shortlist persistence across sessions (steps 6→7 can be weeks apart), and phone-only
schools, which currently fail hard filter 5 and vanish silently instead of rendering a call script.

Also validated: the deterministic/AI split, never scoring a child, and human-in-the-loop all land
exactly on her rules. Her framing of the verbatim `evidence` span is better than ours — it tells the
reviewer *where to look*, so oversight is not redoing the work. Good pitch sentence.

### 12 Sept 2026 — map zoom stutter (reported by Andrei, session 2 diagnosed)
Zooming blocked the UI on a trackpad. **The measurement is more useful than the fix here, so read
this before optimising anything else in the map.**
- My first "before" number (52.7 ms/step) was **invalid** — it measured Playwright's CDP round-trip
  per `mouse.wheel`, not the page. Any future perf claim must dispatch events *inside* the page.
- Session 2's diagnosis was right in principle: `applyVB()` re-ran ~6,000 SVG `r` writes plus two
  uncached `querySelectorAll` every frame, because the `applyVB._k!==k` guard can never hold when
  every wheel event changes `k`. Fixed: node lists cached, recompute quantised to a ~15% change in
  k, and one exact pass 140 ms after the gesture settles.
- But **that was not the dominant cost**, and I could not prove it was: in headless Chromium all
  variants sit at a 17 ms median and the run-to-run noise (26–37 frames over budget out of 64)
  exceeds the difference between them. Do not trust this harness for map perf.
- The likelier real culprit, fixed on reasoning rather than measurement: `clientToMap()` read
  `getBoundingClientRect()` on **every wheel event**, forcing a synchronous layout flush of the
  pending viewBox mutation. A macOS trackpad pinch fires ~100–120 Hz; buttons and double-click are
  single events, which matches "only blocks on trackpad". Rect is now cached and invalidated on
  resize/scroll.
- Also removed a per-frame `--z` custom property on the `<svg>` root: it is inherited, so it
  invalidated style for all ~12,000 descendants while only ~48 label nodes read it. Emil's own rule,
  which I had cited earlier and then broken.
- **Regression I introduced and caught:** removing `--z` stopped the pick numbers scaling, because
  `renderMatch` does not re-run on zoom. They now scale inside the quantised block.
- **Unverified on real hardware.** Every change is strictly less work per frame, but the improvement
  has not been demonstrated — Andrei should confirm on the actual trackpad.
- Declined again: moving the map to Canvas. The four behaviours that argument rested on (hover
  tooltips, counter-scaling, pick rings, drag hit-testing) all still hold.


### 12 Sept 2026 — pitch page, and the label-not-maths failure mode

**Session 2.** New files, both session 2's: **`app/pitch.html`** (scroll narrative, committed dark,
no build, no libraries — IntersectionObserver reveals + one Canvas 2D ambient layer) and
**`MOTION.md`** (shared motion tokens, and what each file is allowed to do). Deliberately separate
from the tool: scroll narrative helps a 5-minute explanation and hinders a page that gets scanned
and operated. Motion on it encodes data — the cohort dots drain at the real 19,7%/2,8%, and the
coverage bar's widths *are* the counts. A shareable copy of the research brief is published at
https://claude.ai/code/artifact/c3e1eae9-d0b0-4ea3-82ad-a8565cad9be5 (the repo is still empty, so
that link is currently the only way the other two devs can read any of this).

**THE COVERAGE SPLIT WAS DOUBLE-COUNTING — fixed, and the fix is a better story.** The intuitive
partition ("on the ministry list 248 / has a programme 283 / nothing 789") is wrong: **183 of the
248 already have a grant or a meal**, and the 283 bucket excluded those same 183. Mutually
exclusive and exhaustive, verified from the CSV:

| Inside the 1,320 | | |
|---|---|---|
| Nothing at all | **789** | 59.8% |
| Already has a grant or a meal | **466** | 35.3% |
| **On the ministry's own list, and nothing arrived** | **65** | 4.9% |

**854 schools — 65% of the national worst quartile — get nothing.** The **65** is the sharpest
number in the deck: it indicts the targeting rather than describing need. And reading the rest of
the `elig_r2s2.pdf` scan can only move schools *out of* 789 and *into* 65, so the argument
strengthens as the data improves. Full cross-tab in `RESEARCH.md` §5.2.

**Demo school for that section: Școala Gimnazială Cojasca (Dâmbovița)** — rank 5 nationally, all
three coverage flags zero, genuinely one of the 789. Caveats in `RESEARCH.md` §5.1.1 and they
matter on stage: it is **71% pooled 2023–2026 but 51% in 2026 alone** (quote both — the 2026 file
is the one a judge opens); it **had no coordinates and now carries its commune's** (`59bdb98`), so
it draws on the map flagged `approx` and a distance off it is good to ~1.7 km median, not better;
and the two Cojasca units have **swapped emails** in the ministry file, so a J4 outreach demo on it
must use a placeholder. The commune is the better frame than the school: 9,406 people,
two schools in the national worst 4%, zero programmes between them.

**SEVEN DENOMINATOR ERRORS, none of them a maths error.** Found across three sessions checking each
other. All were correct numbers printed beside a number true of a *different set*:

1. "our worst quartile" — 1,320 of 4,202 is **31%**, not 25% (percentiles run over rural + urban)
2. the coverage bar above — "248 on the list" silently included 183 served schools
3. **4,202** ranked base vs **4,205** raw rural rows — both true, different denominators
4. Cojasca **71%** pooled vs **51%** in 2026 alone
5. Călărași "68 with coordinates and email" — two different 68s, overlapping at **64** → **50
   distinct inboxes** (fixed in `CLAUDE.md` task 5)
6. **5,877** geocoded is of all 6,335 schools; only **3,960** rural are geocoded
7. `CLAUDE.md`'s own "6,335 schools, 4,205 rural, 5,877 geocoded, 6,058 with contact" — a rural
   count sandwiched between three all-school counts, reading as a progression

**`CLAUDE.md`'s Claims discipline section now opens with the rule and all seven as evidence**, plus
the property they share: *each was true of one set, printed next to a number true of a different
set. None was wrong in isolation — which is why proofreading the maths never catches them. The pass
has to ask "of what?", not "is this right?".* Do one deliberate pass over every parenthetical
containing a count before the pitch.

**Also:** PepsiCo removed from the partner table — it appeared in no document in this repo, the
team doc or the research (recorded as closed in `RESEARCH.md` §2 so it isn't reintroduced). The
"789 upper bound" hedge is gone everywhere, replaced by the measured bound. hartaedu.ro's stack
established: WordPress + the commercial **MyListing** theme, Google Maps, one bespoke donation
plugin — nothing proprietary to fork, and its **`ong` post type holds 3 records, all test data**.

**Open, handed to session 1:** the map blocks the UI during trackpad zoom. Cause is `applyVB()` —
the `applyVB._k!==k` guard never fires because every wheel event changes `k`, so each frame writes
`r` on all 5,877 dots plus two uncached `querySelectorAll`. Fix speced: cache `.hit`/`.seat`,
quantize the recompute to ~15% zoom steps, one exact pass 140ms after the gesture settles.
**Not** a reason to move the map to Canvas.

### 12 Sept 2026 — research pass + SUMMARY.md brought current
Four parallel research passes (problem evidence · intervention evidence · prior art · data sources
& evals) reconciled into **`RESEARCH.md`**. Two claims independently re-verified from primary
sources by the main session.

**Five claims in this repo need fixing before the pitch — `RESEARCH.md` §1:**
1. The Ghigiu quote is paraphrased, and its platform half endorses **hartaedu.ro by name**
   ("după modelul hartaedu.ro"). Verified from the Agerpres release directly.
2. "1 in 5 rural children never reach grade 9" is 9-year cohort loss (19.7%), not a transition
   rate. Corrected wording in §1.2, plus the answer to the 96.5% transition-rate counter-attack.
3. The ~9% EN gap is **structural, not a 2026 deterioration** (2025 gap was ~9% too).
4. **The need index is not novel** — Harta IRSE (Human Catalyst, 2020) ranked 4,158 schools on
   essentially our index. Its domains are now unreachable. Reframe as a rebuild, not an invention.
5. "Supply-driven" is the wrong label for hartaedu; it is inbound-only. And it is a channel, not
   a competitor.

**Found what SUMMARY.md said to find:** the AmCham × UB cost figure — **2.3 bn EUR/year = 0.77% of
GDP**, ~200,000 EUR lifetime per dropout. (The "107 bn" in press is lifetime cumulative, not annual.)

**One real threat to the premise:** the ROSE RCT (41,524 students) found **no moderation by local
economic conditions** — the exact moderator the 349-vs-132 split assumes. `RESEARCH.md` §3 has both
readings and the recommended stage framing (testable hypothesis, not proven law).

**Also:** parental migration is a psychosocial risk, not an attainment risk — route those schools
to counselling, never to cash or meals. Highest-value data still addable: RPL 2021 Roma share per
UAT (one XLSX, joins on SIRUTA). Eval plan executable in 3–4 hours is §5.

Also updated `SUMMARY.md`: removed the stale "everything runs on synthetic data" line, brought the
deliverables and open-risks sections current, and fixed a numbered list broken across a heading.

### 12 Sept 2026 — shared inboxes (session 3 finding, verified)
1,956 of the 6,037 schools with an email **share it with another school** — 879 addresses, worst
cases five schools to one inbox. It is `școală coordonatoare` + `structuri arondate`, so it is real
structure and a design question, not a cleanup task.
- `need_index.js` now emits `inbox` + `inbox_schools`; the app carries them and the match card says
  "shares one inbox with N other schools — write once, name them all". The footer counts real
  recipients: the default Călărași shortlist is **6 schools → 5 inboxes**, so it demonstrates itself.
- **Călărași reachability restated: 54 inboxes, not 68 schools.**
- `MATCHMAKING.md` J4 now groups by inbox and *aggregates* rather than dedupes — one mail naming
  every unit, which also shows we understand how rural school administration works. Added the
  fifth J4 binary check: no two drafts in a run share a recipient.
- Source defect recorded: Dâmbovița has two schools' emails swapped (Cojasca ↔ Fântânele). Both are
  worst-quartile with no coverage. **Redact addresses in any live drafting demo.**

### 12 Sept 2026 — motion pass on the tool
Adopted the `MOTION.md` tokens (`--ease-out` etc. — the curves already in use, now named) and
implemented the backlog items that earn their place in a tool that gets *operated*:
- **FLIP reorder on the proximity↔severity slider.** The shortlist re-ranking is the product's
  central tradeoff; without this it blinks and reads as a list refresh instead of a decision.
  Measure → re-render → invert → play, transform only, 25ms stagger by rank. Wired **only** to
  `#mW`/`#mMetric`: the base drag already re-renders per frame and animating that fights the
  pointer. Verified by transition events — transform-only, starts == ends.
- Tab swap with a row cascade (`rise`, existing vocabulary, not a second one).
- `:active` parity — `scale(.97)`/`scale(.99)` on `.crow`, `.btn`, `.more`. There were 8 `:hover`
  rules to 3 `:active`.
- **Declined: staggering the map's first paint.** It needs the 5,877 `#dots` moved to Canvas,
  which would break hover tooltips, zoom counter-scaling, pick rings and drag hit-testing — all
  currently working — for a one-time load flourish. It is the same category session 2 rejected a
  page-load hero for: the demo pays for it on every reload.
Scroll-driven narrative motion lives on `app/pitch.html` (session 2's), deliberately not here.

### 12 Sept 2026 — discrepancy sweep: the app and the model disagreed
Found and fixed a real data-integrity problem, not just a doc problem. **Every archetype count in
the deck was wrong.**
- The model used `failPct >= 0.8` for archetype counts; the app's `archetype()` used `>= 0.75`.
- The model filtered `present >= 10` on the list counts; the app did not. That filter belongs only
  on the correlation.
- **The exported CSV wrote `deprivation_score` and `fail_rate_shrunk` at 3 decimals.** Both are
  compared against hard thresholds downstream, so rounding flipped schools across archetype
  boundaries — and anyone recomputing from our published CSV got different counts than our own
  report. Both now round at assignment and export at 6dp.
Model and app now produce identical numbers. **Verify with the one-liner in "Run it" below after
any model change — a silent divergence here puts a wrong number on a slide.**

Superseded counts: money-bound 286 → **349**; school-bound 104 → **132**; no-one-is-here
737 → **789**; quick wins 104 → **106**; worst quartile 1,258 → **1,320**; on ministry list
913 → **922**. The 19% ministry-catch and r = −0.16 both survive unchanged.

Also: "worst quartile" is a percentile over **all 6,331 schools, urban included**, so it is 31% of
rural schools, not 25%. Relabelled "national worst quartile" in the model output, `model/README.md`,
`MATCHMAKING.md` §4 and all three app tab notes. And `MATCHMAKING.md` §4's thresholds said 0.8
while both implementations used 0.75 — spec corrected to match the code.

### 12 Sept 2026 — Narada alerts are joinable by geo
Two hartaedu.ro alert pages fetched by hand from their `job_listing-sitemap.xml` (1,001 URLs,
page-capped so a floor). Every alert carries a schema.org `LocalBusiness` block with the school
name in plain text, a street address, and **`geo` GeoCoordinates** — plus phone and email.
No SIIIR, SIRUTA or CUI anywhere. (The 10-digit numbers that look like fiscal codes are WP Rocket
cache-busting timestamps.)
**So their ~700 unresolved alerts are joinable to our 5,877 geocoded schools by a spatial match
confirmed on name — which beats a shared key, because it survives renamed and merged schools.**
The Narada ask becomes permission and bulk access, not "do you have an identifier". Two pages is
not a survey: say "the alert pages we looked at", not "their data model".
No public REST route (`wp/v2/job_listing` 404s), so bulk means asking, not scraping.

### 12 Sept 2026 — acted on RESEARCH.md
Session 2's research pass (`RESEARCH.md`) hit two claims that were mine. Corrected:
- **The routing split is a hypothesis, not a finding.** ROSE (randomised, 41,524 pupils) found no
  moderation by local economic conditions — the exact moderator the 349-vs-132 split assumes. The
  app's "Money is the constraint" tab now says so and names the trial. `model/README.md` and the
  three-numbers list above carry the caveat.
- **The app was recommending an unevidenced intervention.** The old copy said "scholarships,
  transport, meals". Per `RESEARCH.md` §3.1: CCT with *enforced* conditions is strongly evidenced,
  meals raise enrolment ~3pp but barely move attendance, and transport support is unevaluated.
  The "Money is not" tab now points at school management and teacher stability instead.
- Fallback if a judge presses on ROSE: drop the routing inference and keep the anomaly. "132 rural
  schools fail badly in the richest fifth of communes" is a fact about public data that ROSE
  cannot touch.
- Per §1.4 the need index is a **rebuild**, not an invention — Harta IRSE (2020) ranked 4,158
  schools on substantially our index and is now offline. What is genuinely new is the coverage
  layer, which is what produced the "ministry catches 19%" finding.

### 12 Sept 2026 — map zoom + pan
The map zooms (1×–14×) and pans. Driven by the **viewBox**, so `proj()`/`unproj()` keep working in
the original 640×H space and nothing downstream knows the map moved. Strokes use
`vector-effect:non-scaling-stroke` and labels scale by a `--z` custom property, and dot radii are
counter-scaled on zoom change — without that, zooming magnifies the pile-up instead of separating
it, which was the whole point (5,877 schools sit on top of each other at 1×).
- Gestures: ⌘/Ctrl + scroll (trackpad pinch sends ctrlKey, so pinch works), double-click,
  +/−/Reset buttons, drag to pan, click to place the base. A drag that never moved counts as a
  click, so pan and place share one gesture without a mode.
- **Plain wheel deliberately does NOT zoom** — the map sits mid-page and swallowing scroll is the
  worst embedded-map behaviour there is. `touch-action:pan-y` keeps vertical page scroll working
  on touch, with `touch-action:none` only on the pin.
- Two bugs found in test: the invisible `.hit` tooltip circles blanket the map, and guarding pan
  against them killed pan and click-to-place almost everywhere. Only `#basehit` is guarded now.

### 12 Sept 2026 — draggable base + design pass
The base pin on the map is now **draggable** (pointer capture, rAF-throttled, arrow-key
accessible) and clicking anywhere on the map moves it. Distances and the shortlist re-rank live;
`customBase` overrides the "Working from" select and the select shows "Custom point (dragged)".
Design pass with `impeccable polish` + the emil-design-eng / taste-skill rules:
- The map's "covered" ring now means a real programme **at that school**, not an NGO working
  somewhere in its county — World Vision alone covers 13 counties, which was hollowing out half
  the map. Dots lost their per-dot stroke so ~5,900 overlapping circles read as density.
- Fixed a cascade bug: `.covered` sat after `.out`, so an out-of-range covered school stayed as
  bright as one inside the circle. Order is now base → covered → pick → out.
- Themed the browser surfaces the design didn't previously own: `::selection`, caret, scrollbars,
  a single `:focus-visible` ring, `accent-color`, and `tabular-nums` wherever digits column up.
- Detector (`impeccable detect`) returned 2 warnings; both are on uppercase mono micro-labels and
  display leading, which are correct for a data tool. Only `.label` leading was raised (1.2 → 1.35)
  because that label genuinely wraps. Contrast verified ≥4.5:1 for every token pair, both themes.

### 12 Sept 2026 — app runs on real data
Baked 6,335 schools into `app/index.html` via `model/build_app_data.js`. Matcher distances now use
real school lat/lon instead of county-capital hops. Added a commune-income column and three new
lists: money is the constraint / money is not / no one is here. Added `fail_rate_p10` to the model
so the interval bars have a real lower bound. Baked the NGO register county counts in and demoted
both CSV drop zones to a collapsed "Use newer data" — the page ships with its data now.
Fixed two defects: the matcher crashed when the default base county wasn't in the selected NGO's
list, and the page scrolled sideways at every width.

### 12 Sept 2026 — coverage layer
`model/coverage.js` + `model/extract_pdfs.py`. PNRAS eligible / grant and Masă sănătoasă, all
published only as PDF. Produced the "ministry catches 19%" finding.

### 12 Sept 2026 — deprivation layer
`model/deprivation.js`. Purchasing power per commune from the local budget. Produced the
"2.6% of variance" finding, which reframed the product from severity-ranking to intervention-routing.

### 12 Sept 2026 — matchmaking spec
`MATCHMAKING.md`. Decided the ranking stays deterministic and AI does only the language jobs.

### 11 Sept 2026 — problem and model
Chose the grade 8→9 cliff. Built the empirical-Bayes need index on real EN data.
See `SUMMARY.md` for the full decision history and sources.
