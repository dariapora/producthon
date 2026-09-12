# Progress — Puntea 8→9

**Any Claude session: read this first, then `CLAUDE.md`.** This file is the running state.
Update it at the end of any session that changes something — newest entry at the top of the log.

**Documentation is consolidated under one session (session 3) as of 12 Sept, on Andrei's
instruction.** Every `.md` in this repo is reconciled here; if you are a different session, send
changes to the doc owner as text rather than editing, and read the top log entry for who owns which
code. Code ownership is unchanged.

Last updated: **12 Sept 2026** — low-literacy interaction redesign on `app/index.html`

---

## Where we are in one paragraph

The data pipeline is **done and running on real ministry data**, end to end: Evaluarea Națională
2023–2026 → a smoothed need index per school → commune purchasing power → which schools already
have a programme → baked into a single-file browser tool that opens on real named schools with
real coordinates. The NGO↔school matcher is **specced but not built** (`MATCHMAKING.md`). The
Călărași pilot flow is **not built**.

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
| App payload generator | `model/build_app_data.js` | 6,335 schools + NGO register counts, ~1.2 MB inlined |
| Browser tool | `app/index.html` | Opens on real data. SVG map of 5,877 geocoded schools, NGO matcher, five ranked lists |
| Matcher spec | `MATCHMAKING.md` | Spec only — nothing built |

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
- The NGO-per-county counts in the app are a **keyword match** and over-count badly (31,080 of
  125,840 registered NGOs — 24.7%). Labelled as such in the UI. `MATCHMAKING.md` J1 replaces it.
- Aggregate per school only; never child-level. Two lists (quick wins / no one is here), never a
  "worst villages" league table.

---

## Log

### 12 Sept 2026 — low-literacy interaction layer

- Reworked the tool's first screen around one question and two large, illustrated role choices.
- Follow-up: the school-help path is now first, neither role is preselected, and all application
  content stays hidden until the visitor explicitly chooses a path. Stored roles no longer bypass
  this choice; **Acasă** clears it again.
- Applied the guideline palette and Montserrat throughout, with 48–56 px touch targets and a
  selected state that uses fill, outline, text, and a check mark rather than color alone.
- Kept a stable **Acasă** control; the experimental **Ascultă** controls and browser speech were
  removed after review to make the entry screen quieter.
- Simplified and translated the NGO matcher instructions and primary controls; advanced data
  replacement controls are hidden, and analytical panels sit behind **Vezi datele detaliate**.
- Translated the static interface, map legend, generated ranking explanations, match cards,
  validation errors, data status, NGO descriptions, and clipboard feedback into Romanian.
- Preserved the generated payload, ranking, matching, director search, and map behavior.
- `git diff --check` and the inline JavaScript syntax check pass. Browser suites could not run in
  this checkout because `test/node_modules` is absent (`playwright` is not installed).

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
is the one a judge opens); it has **no coordinates**, so never tie it to the map, a distance or the
matcher; and the two Cojasca units have **swapped emails** in the ministry file, so a J4 outreach
demo on it must use a placeholder. The commune is the better frame than the school: 9,406 people,
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
