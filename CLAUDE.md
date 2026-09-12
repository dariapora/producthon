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
| Colours, type, components, Romanian UI copy | `BRAND.md` (proposed brand/design system — not yet applied) |
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
- **Position has three states, not two (12 Sept).** `geo_source` in the CSV, `geo` in the payload:
  **1** = the school's own surveyed point (5,877) · **2** = its commune's, taken from another school
  there because the 2017 survey has no row for this one (**373**) · **0** = neither, and the page
  falls back to the county seat (85). So **6,250 of 6,335 are placed but only 5,877 are geocoded** —
  those are different words and the status bar says both. Never collapse them: a commune point is
  good to ~1.7 km (p90 5.6), a county seat can be tens of km out. Median per axis, not mean — one
  source coordinate sits 399 km from its own commune's mean. Exists because **ȘCOALA GIMNAZIALĂ
  COJASCA, 2nd nationally by need, had no dot on our map.**
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
  **Three sessions built three different wrong versions of this set on 12 Sept while this line was
  right the whole time.** The definition is executable and nothing else counts: `rank_rate <= 6335/4`
  → 1,583 national rows, urban included, then `mediu = rural` → **1,320 = 31.4% of 4,205**. The
  wrong ones were `1,051` (the worst quarter *of rural* — the substitution this bullet forbids),
  `rank_need <= 1320` (right size, wrong membership) and a `fail_rate_shrunk` sort. **1,320 was
  never a quarter of anything**, so the ×4 reflex invents a 5,280-row population that does not exist.
  Inside it: zero curated NGO in county **170 = 12.9%** (all nine) or **247 = 18.7%** (excluding the
  one rated `rel:"low"`, which is what the interface surfaces) · fewer than 3 in county **1,096 =
  83.0%** · no position at all **16** (it was 71 before `59bdb98` filled 55 of them from their
  commune; **any doc still saying 71 predates that commit**) · `pnras_eligible` **248 = 19%** ·
  `pnras_grant` 147 = 11% ·
  masă sănătoasă 380 = 29%. Quoting "83% / 19.5%" together was two NGO sets in one sentence.
  **Trap for any check you write here:** `pnras_eligible == 1` and `pnras_priority` non-blank are
  co-extensive on all 6,335 rows, but `pnras_priority` is categorical (blank 5,181 · MEDIUM 1,033 ·
  HIGH 121), so testing it for `"1"` returns 0 **silently** rather than erroring. Use `pnras_eligible`.
- **Archetype counts changed 12 Sept** after a reproducibility fix (app and model were computing
  different numbers; the exported CSV rounded threshold columns at 3dp). Canonical: money-bound
  **349**, school-bound **132**, no one is here **789**, quick wins **106**, ministry flagged
  **248 = 19%**. The old 286 / 104 / 737 are dead everywhere. See `RESEARCH.md` §5.1.

## Next tasks
1. ~~Feed the real schools into `app/index.html`~~ **done**. 6,335 schools baked in, real lat/lon for matcher distances, commune income as the second axis, and five lists: most children / most concentrated / money is the constraint / money is not / no one is here. Rebuild with `npm run index && npm run app`.
2. ~~Load the Registrul Național ONG; geocode NGOs~~ **done** (`model/ngos.js`, 1,260 candidates). **Classify each NGO's purpose — written, never run.** `npm run classify` needs `ANTHROPIC_API_KEY`; the dry run measures **$1.80 for 1,252 organisations, ~5 min**, and writes `out/ngo_profiles.json`, after which `npm run app` changes the director cards. Then `npm run eval` — but it needs `out/ngo_gold.csv` **relabelled by a person**: the 120 rows there now are Claude-labelled against this classifier's own rubric (silver, not gold), so scoring J1 on them is two models agreeing with themselves. **Two unblockers, different in kind: machine time for the profiles, human judgement for the labels. Only the second changes the figures' status.**
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
- **NGO counts (decided 12 Sept, revised same day):** quote **our** figure, always with the caveat
  — "**30,939** of the **114,096** registered NGOs **that state a purpose and record a county**
  flag as education-related, a **keyword match which over-counts**".
  Never a hartaedu figure alongside it; they count different things. State the over-count
  unprompted: it is the reason J1 classification exists, so the caveat sets up the AI half of the
  pitch instead of undercutting the data half.
  **Name the denominator.** The register holds 125,840. **9,498** state no purpose in any of the six
  purpose columns (`Scopul initial` + `Modificari 1..5`, punctuation-only counting as blank) and a
  further **2,246** record no county; both are excluded before the keyword test. So 30,939 is
  **27.1% of the 114,096 that state a purpose and record a county** — and that gate has to apply on
  both sides, because `n` is the sum of the per-county buckets. Quoting it against 116,342 (26.6%)
  or 125,840 (24.6%) puts a county-gated numerator over an ungated denominator; both are wrong, and
  27.1% is the rate counted consistently either way round. (Verify against the baked payload, not
  against this paragraph:
  `"n":30939,"total":125840,"noPurpose":9498,"noCounty":2246,"pool":114096,"withPurpose":116342`.)
  Supersedes "31,080 of 125,840 / 24.7%", which was **correctly computed against the pool as it
  stood** and went stale when the exclusion landed — the denominator was never wrong, the set moved.
  Proofreading cannot catch that class; only re-checking against the shipped bytes can.
- **The NGO denominators, all verified 12 Sept. Recount before quoting: `node model/ngos.js`.**
  Register: 125,840 organisations · 8,213 dead · 9,498 no purpose text · **762 BOTH** · **108,891
  alive WITH a purpose** · 116,342 with a purpose including the dead. The overlap is why
  `125,840 − 8,213 − 9,498` is not the answer, and why a wrong denominator here is wrong by 7,451 —
  an amount nobody sanity-checks mentally.
  - `model/ngos.js` **KW** (adds `copii|tineri`): **40,684 = 37.4% of 108,891** — counted *after* the
    dead-org exclusion, so 108,891 is its only matching denominator.
  - `model/build_app_data.js` **`re`** (narrower): **31,523 = 27.1% of 116,342** — counted *without*
    the dead-org exclusion, so 116,342 is right for this one and wrong for KW. **Same denominator,
    two regexes, one of them right.**
  - App status line / baked payload: **30,939 of 114,096 = 27.1%**. The numerator is county-gated
    (`n` is the sum of the per-county buckets) so the denominator is too — 2,246 of the
    purpose-stating organisations record no county. **The two rows above now report the same rate,
    27.1%, which is the check that they describe one regex and not two.**
  - **Retired, do not reuse:** 31,080 / 125,840 / 24.7% · 35.0% · and **26.6%**, which this file
    itself carried as a valid third figure while also recording 27.1% one line above. Two rates for
    one regex was the tell, and it sat here unread: **31,523/116,342 and 30,939/116,342 cannot both
    be right, and nothing in the file asked why the numerators differed by 584.**
- **Candidate-list denominators (`out/ngo_candidates.csv`):** **1,260 data rows** as displayed (30 per
  county) · **1,252** distinct `(reg, normalised name)`, which is what `classify_ngos.js` bills for ·
  1,251 distinct `reg` — **never quote the last as an organisation count**, 9 registration numbers
  are shared. `wc -l` says 1,260 too, but only by luck: the file has no trailing newline so it
  undercounts by one and agrees by accident.
- **The false-positive families: 282 of 1,260 = 22.4%.** 68 credit unions · 201 parent associations ·
  13 trade unions · 24 alumni/teaching-staff bodies · **0 sports clubs** (the top-30-per-county
  ranking already removed them, so §5's "riding club" example is register-wide, not displayed).
  **1,123 of 1,260 = 89.1% carry an education word in the name** — an 89% hit rate on its own output,
  which is why the name filter has no discriminating power left and every unmailable row hides inside
  it. **A family count is a measurement relative to a pattern: run `npm run families`, which prints
  each regex beside its count, rather than quoting these numbers bare.** Parish/Christian names are
  deliberately NOT a family — that was retracted as an indefensible category, not corrected as a
  count, because many real Romanian after-school programmes are parish-run.
- **Contacts — three counts that are not interchangeable.** 6,037 schools have an address · 4,960
  distinct inboxes · 5,015 distinct addresses in local `main`'s history. Name the noun.
- **Two rules that outrank recomputation, learned the hard way on 12 Sept:**
  1. **A figure that reproduces is verified only if the checker built the set independently.** One
     session reproduced another's number exactly by inheriting its *filter* rather than its
     reasoning. That verified nothing and manufactured agreement, which is worse than open
     disagreement because it stops the inquiry.
  2. **A recipe is only a definition once someone who did not write it executes it.** The author
     structurally cannot run that test. The cheapest check that worked all day was simply asking
     *"which set does this number describe?"* — no measurement at all — and it caught the error that
     had already survived two rounds of recomputation.
- "Putere de cumpărare" = income tax collected per capita, wage income only. Never "venit mediu".
- The matcher is a deterministic weighted score, not a model. Say "weighted matching on public
  data". Reserve "AI" for NGO-purpose classification and email drafting, which genuinely are.
