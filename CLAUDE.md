# Puntea 8→9 — project notes for Claude Code

## Orientation (read this section only, then route)
Rural grade-8 pupils fail the Evaluare Națională and drop out between class 8 and 9. We rank
rural schools by an empirical-Bayes need index built from real ministry data, then match each
school to NGOs that can actually serve it. Output is a single-file web tool plus a Node
pipeline. Entry for a hackathon (see **Event context** below).

**Read only what the task needs — do not map the repo.**

| Task | Read |
|---|---|
| Picking up the project cold / "what's the state?" | `PROGRESS.md` (running state, what's next, traps already hit) |
| Anything on the page / UI | `app/index.html` (big; grep the named parts under Layout, don't read whole) |
| Model, joins, data caveats | `model/README.md` |
| NGO↔school matcher | `MATCHMAKING.md` (has its own done-when + build order) |
| **The AI feature flow — steps, contracts, unhappy paths** | **`WORKFLOW.md`** (Workshop 1 deliverable; §7 is what it changed) |
| Pitch, narrative, sources, risks | `SUMMARY.md` |
| **Claims discipline, stats, prior art, evals plan** | **`RESEARCH.md` — read §1 before touching the deck** |
| Animation, transitions, the scroll pitch | `MOTION.md` (tokens + what each file is allowed to do) |
| Just orienting | nothing else — this file is enough |

**Any session that changes something: update `PROGRESS.md` before finishing** (newest log entry
at the top). It is how the next session picks up without re-deriving.

**Never** read or list `data/` (~80 MB XLSX) or `node_modules/`. Never read `out/*.csv` whole —
`head`/`awk` a few rows. `source/CivicPTeam1.md` is the 118KB original team doc: grep, never read.

## Event context
Civic Producthon #2, eMAG HQ, 11–13 Sep 2026. Our case study: *combaterea abandonului școlar*.
- **Sun 13 Sep, 11:00** — final pitch: **5 min + 2 min Q&A**. That is the real deadline; anything
  that doesn't survive contact with a 5-minute pitch is not a priority.
- Saturday's workshops define the expected deliverables: (1) the civic case turned into a
  **workflow** for the AI feature, (2) an **interface that needs no explaining**, (3) evidence it
  **holds up** under testing. `MATCHMAKING.md` §6 is (1); `app/index.html` is (2); §9 done-when is (3).
- Panel incl. eMAG Data&AI and an NGO lead — expect questions on data provenance and on what is
  actually AI vs. deterministic. See **Claims discipline** at the bottom.
- Full participant guide: `../Guideline Participants.md` (agenda, mentors, jury).

### Judging criteria — what work is worth doing
1. **Customer discovery** — the problem definition, hypotheses, who we talked to. Lives in
   `SUMMARY.md`; keep the **Outreach log** current, it is the evidence for this criterion.
2. **Evals of the AI part** — not "does it work", but a measured eval of J1–J4. `MATCHMAKING.md`
   §9 done-when is the spec; a run with numbers beats a demo. Weakest area if left to Sunday.
3. **Does it actually reduce early school leaving (abandon școlar)** — every feature must trace
   to that outcome, not to "nice dashboard". The quick-wins / no-one-is-here framing is the trace.
4. **Presentation** — 5 min. One flow end to end (the Călărași pilot, `Next tasks` #5) beats
   five half-features.
5. **How shippable it is at pitch time** — real data on screen, real school names, real NGOs,
   no placeholders. Any synthetic data visibly labelled (see Conventions) — an unlabelled
   placeholder reads as a fake, and costs on both #3 and #5.

**Priority rule:** prefer work that moves #2 or #5. #1 and #3 are largely already earned by the
ministry-data model; #4 is a Sunday-morning task, not a Saturday one.

## Layout
- `app/pitch.html` — **the scroll pitch** (new, 12 Sept). Committed-dark narrative page, no build,
  no libraries: IntersectionObserver reveals + one Canvas 2D ambient layer. Separate from the tool
  on purpose — scroll narrative helps a 5-minute explanation and hinders a working data tool. Every
  figure on it is live-canonical; motion encodes data (cohort dots drain at the real 19.7%/2.8%,
  the coverage bar's widths *are* 248/283/789). See `MOTION.md`.
- `app/index.html` — single-file tool (HTML/CSS/vanilla JS, no build). **Opens on real data**: 6,335 schools are baked in between the `/*DATA:START*/` … `/*DATA:END*/` markers. That block is GENERATED — never hand-edit it; run `npm run app` after `npm run index`. The CSV drop zones still work and override the baked data. Key parts in the `<script>`:
  `parseCSV` / `detect` (column auto-detection), `model()` (empirical-Bayes need index, for uploaded CSVs), `inflate()` (baked payload → the same object shape), `rankPercentiles()`, `archetype()` (money-bound / school-bound), `SEATS` (county-seat lat/lon), `CODES`, `NGOS` (curated programmes), `matchCounty()`, `renderMatch()` (NGO matcher + SVG map), `synth()` (fallback sample, only if the payload is missing).
- `model/need_index.js` — **the model to run** (Node; `npm run index`). Reads the ministry XLSX files and joins school identity.
- `model/deprivation.js` — purchasing-power / deprivation layer per UAT (`npm run deprivation`). Joined automatically by `need_index.js`.
- `model/coverage.js` — which schools already have a programme: PNRAS eligible / PNRAS grant / Masă sănătoasă (`npm run coverage`). Joined automatically by `need_index.js`.
- `model/extract_pdfs.py` — the one Python step (`npm run extract`): the three coverage lists are published only as PDF. Run once after downloading them.
- `model/build_app_data.js` — bakes `out/schools_need_index.csv` into `app/index.html` (`npm run app`).
- `model/need_index.py` — original Python model, reference only; the ministry publishes XLSX, not CSV. (python3 *is* installed — `extract_pdfs.py` depends on it.)
- `data/` — ministry source files (~80 MB, not in git). `model/README.md` lists each one.
- `out/` — generated rankings. Regenerate them; don't hand-edit.
- `source/CivicPTeam1.md` — original team doc.
- `MATCHMAKING.md` — spec for the NGO↔school matcher: what stays deterministic, the four AI jobs, evals, build order.

## Conventions
- Aggregate data per school only; never store or display child-level data.
- Any synthetic data must be visibly labelled as such.
- **No invented quotes, ever.** Zero interviews have been conducted (`source/CivicPTeam1.md:910`,
  Interview Outcomes, is empty). The persona quote at `:239` was written by us, not said by anyone
  — see `RESEARCH.md` §1.6. Nothing in this project may be presented as voice-of-customer.
- Cite a source for every factual figure.
- Keep the page theme-aware (CSS tokens in `:root`, dark via prefers-color-scheme + `[data-theme]`).
- Publish rankings as two lists (quick wins / no one is here), never as a "worst villages" league table.

## State of the data
- EN 2023–2026 per candidate, the 2025–2026 school network, and 2017 school coordinates are all in `data/`.
- Join key is `COD SIIIR`; county = first two digits (verified: 6,058 agree, 0 differ).
- **6,335 schools, of which 4,205 are rural.** The other two counts are ALL-school, not rural:
  geocoding is 5,877 of 6,335 (**only 3,960 of the 4,205 rural**), and 6,058 of 6,335 carry
  name + locality + phone + email. Never print 5,877 or 6,058 next to a rural figure without
  its denominator — that exact comma-list shape has already produced two errors.
- The model reproduces World Vision's published 42.4% rural-below-5 for 2024 (we get 42.3%).
- Deprivation layer live: 3,180/3,186 UATs, 4,088/4,205 rural schools scored. Proxy is budget
  line 04.02.01 (cote defalcate din impozitul pe venit) per capita. **It explains only ~2.6% of
  the variance in exam failure** (r = -0.16) — use it to choose the intervention, not to rank
  severity. See `model/README.md` before pitching it.
- Coverage layer live: 1,201 PNRAS-eligible, 733 PNRAS grants (95.2% matched), 1,386 Masă
  sănătoasă (97.3%). Of 4,205 rural schools, 1,459 have a grant or a meal — but **inside the
  1,320-school worst quartile that figure is 466**, not 1,459. Quote one denominator per slide
  and say which. **The ministry's own
  risk list catches only 19% of our worst quartile** — that gap is the pitch. One eligibility
  list is a scan. **It is no longer an upper bound — the gap was measured.** 19 of 63 pages were
  read by vision and resolved against the school network (99.3%): **92% were already on the lists
  we could read**, yielding 11 new flags and **1** in the worst-quartile set. Extrapolated: 789
  moves by **under 1%**. Say "we read a third of it and it is 92% the same schools", never "upper
  bound". Caveat if repeated: raw vision misreads ~1 digit in 7 codes — it is the name+locality
  revalidation that turns ~86% into 99.3%.
- **Say "the national worst quartile", never "our worst quartile".** `failPct` is a percentile over
  all 6,331 schools, urban included, so the rural slice is **1,320 of 4,202 = 31%**, not 25%. State
  the 31% inline — it is the stronger framing: nearly a third of rural schools sit in the national
  worst quartile.
- **Archetype counts changed 12 Sept** after a reproducibility fix (app and model were computing
  different numbers; the exported CSV rounded threshold columns at 3dp). Canonical: money-bound
  **349**, school-bound **132**, no one is here **789**, quick wins **106**, ministry flagged
  **248 = 19%**. The old 286 / 104 / 737 are dead everywhere. See `RESEARCH.md` §5.1.

## Next tasks
1. ~~Feed the real schools into `app/index.html`~~ **done**. 6,335 schools baked in, real lat/lon for matcher distances, commune income as the second axis, and five lists: most children / most concentrated / money is the constraint / money is not / no one is here. Rebuild with `npm run index && npm run app`.
2. Load the Registrul Național ONG (`data/ong_2026.xlsx`, 125,840 rows); geocode NGOs; classify each NGO's field from its stated purpose. **Follow `MATCHMAKING.md`** — build order there puts the deterministic work first.
3. ~~Add PNRAS and Masă sănătoasă school lists as coverage layers~~ **done**. Remaining: OCR `data/pnras/elig_r2s2.pdf` (scanned, ~900 eligible schools missing) — needs `tesseract`, not installed.
4. Add INS TEMPO SCL103D grade-8 enrolment by locality to estimate the ~9% missing before the exam.
5. Build the Călărași pilot flow end to end (72 rural schools · 68 with an email · 68 geocoded ·
   **64 with both** → **50 distinct inboxes** to write to. The two 68s are different sets — 4 have
   an email but no coordinates, 4 the reverse. The flow needs both, so 64 is the pilot universe
   and 50 is what J4 actually addresses): red zone → school → recommended NGOs → draft email → "Vreau să ajut". Simulate the sending; do not send real email blasts. **`WORKFLOW.md` is the spec for this task** — trigger, 8 steps, per-step
   input/output, an unhappy path per AI step, and the three human decision points.

## Pipeline order
`npm run extract` (once, PDFs → txt) → `npm run index` (also runs deprivation + coverage) → `npm run app`.

## Claims discipline

- **Before any number reaches a slide, name its denominator out loud.** The property all of these
  share: **each was true of one set, printed next to a number true of a different set.** None was
  wrong in isolation — which is why proofreading the maths never catches them. The pass has to
  ask *"of what?"*, not *"is this right?"*. Five separate errors today
  were correct arithmetic attached to the wrong set: "worst quartile" that was 31% not 25%; a
  coverage bar whose "248 on the list" silently included 183 already-served schools; 4,202 ranked
  vs 4,205 raw rural; Cojasca at 71% pooled vs 51% in 2026 alone; and "68 with coordinates and
  email" that was two different 68s overlapping at 64. **Every one was checkable by a judge in
  seconds.** Do one deliberate pass over every parenthetical containing a count before the pitch.
- `RESEARCH.md` §1 lists claims currently made in this repo that are **wrong or unsafe as worded**
  (the Ghigiu quote, "1 in 5 never reach grade 9", the novelty claim, the supply/demand labels).
  Fix them there before they reach a slide.
- **NGO counts (decided 12 Sept):** quote **our** figure, always with the caveat — "31,080 of
  125,840 registered NGOs flag as education-related, a **keyword match which over-counts**".
  Never a hartaedu figure alongside it; they count different things. State the over-count
  unprompted: it is the reason J1 classification exists, so the caveat sets up the AI half of the
  pitch instead of undercutting the data half. (Verified against the baked payload:
  `"n":31080,"total":125840` = 24.7%.)
- "Putere de cumpărare" = income tax collected per capita, wage income only. Never "venit mediu".
- The matcher is a deterministic weighted score, not a model. Say "weighted matching on public
  data". Reserve "AI" for NGO-purpose classification and email drafting, which genuinely are.
