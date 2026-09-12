# Demo runbook — the three corner cases

For judging area 4: *"nu demonstrați doar happy path-ul, arătați și corner cases."*
Every case below is a real row in the shipped data, verified 12 Sept 2026. None is staged.

Run them in this order. Total ~90 seconds. The point of each is the same: **the system
says "I don't know" in a specific, checkable way instead of inventing an answer.**

---

## 1. The county where there is nobody to call

**Școala Profesională, comuna Valea Ursului, Neamț** — rank #32 of 4,205 by need,
deprivation 0.965 (the 97th percentile of hardship), 65% of its pupils below 5.

Neamț has **no organisation at all** among our nine curated programmes. Nor do Bihor,
Brăila, Covasna, Galați, Gorj or Harghita.

> **170 of the 1,320 rural schools in the national worst quartile (12.9%) are in a county
> with no curated organisation at all — and 247 (18.7%) have none the tool actually
> surfaces, because one of the nine is rated low-relevance and filtered from the UI.**

Quote 12.9% if you quote one. It is the conservative claim about absence, and when the
whole pitch is "nobody is here", understating absence is the right direction to err.

What to say: the honest output is an empty match with a reason, not a nearest-neighbour
suggestion. A CSR officer emailing a Cluj organisation about a school in Neamț wastes
two people's time and teaches them not to trust the next answer.

**Resolved, and worth knowing how.** `PROGRESS.md`'s "83% had fewer than three, 19.5% had
none" had its two halves computed over *different NGO sets*: the 83% over all nine, the
19.5% over the eight the UI surfaces. Recomputed over one set each way, 83.0% reproduces
to the decimal, which is what confirms 1,320 as the right denominator — rural schools
inside the **national** worst quartile (`failPct` over all 6,335, urban included), 31.4%
of rural. Diagnosis by session 1; denominator settled by re-measuring.

---

## 2. The school that was not on our own map

**Școala Gimnazială Cojasca, Dâmbovița** — rank **#2** of 4,205 rural by need. The school
the pitch opens with. **It is absent from the 2017 coordinate survey**, so until this
afternoon it could not be drawn at all.

It now draws at **44.712263, 25.878385** — the median position of the other schools in
its commune, carried in the payload as `geo_source = commune` and flagged `approx`. So
the live demo of this case is no longer "the dot is missing"; it is **"the dot is there
and the tool tells you it is the commune's dot, not the school's."**

> **Of the 4,205 ranked rural schools, 182 are placed at commune level and 63 (1.5%) have
> no position at all. Inside the 1,320 of the national worst quartile, 16 have none** —
> down from 71 before `59bdb98`, which recovered 55 of them.

Three states, and the UI distinguishes all three (`geo` = 1 / 2 / 0 in the payload,
asserted by `test/payload.mjs`):

| `geo` | meaning | tooltip says |
|---|---|---|
| 1 | the school's own 2017 position | nothing — it is exact |
| 2 | median of its commune's other schools | *"poziția altei școli din aceeași comună (abatere mediană ~1,7 km)"* |
| 0 | no school in the commune has one | *"distanțele sunt măsurate din reședința de județ"* |

What to say: the ranking never depended on geography, so none of these schools ever lost
its place in the need list — only the proximity term of the match score. What changed is
that the fallback is now **named on screen** instead of silently resolving to the county
seat. **Do not quote a precise distance from a commune-level school**: ~1.7 km median
error is fine for "closest three", useless for "12 km away".

**Ask us what broke.** This corner case is also a live example of the failure mode this
repo keeps logging: the fix landed in `59bdb98` at ~15:00 and **this file still said
"245 / 5.8% / 71" afterwards, because nobody swept the docs for claims the fix had
invalidated.** Session 1 shipped the fix and wrote the stale sentence's replacement only
when re-running the recipes in the last section — which is the argument for shipping
recipes rather than numbers.

---

## 3. The AI switched off mid-demo

Delete `out/ngo_profiles.json` and rebuild. Owned by session 1, who built and
screenshotted both states.

- **With it:** organisations rejected by J1 disappear from the director card; survivors
  show the verbatim register quote the verdict rests on.
- **Without it:** the page builds and behaves exactly as it does today, every row
  labelled *"scopul nu e verificat"*. Nothing crashes, nothing is fabricated, the
  ranking is untouched.

What to say: the ranking is arithmetic on published ministry files and never passes
through a model. The AI adds a layer that otherwise does not exist — which of 125,840
organisations actually works in education — and when it is absent the product falls back
to being what it was before, out loud.

---

## Before you start — clear localStorage

`app/index.html` remembers the chosen role in `puntea.role`. A stored `"dir"` from
rehearsal **hides the map**, which is the first thing the jury expects to see. Clear site
data for the page before the run. Flagged by session 3; it is their finding, not a fix
I made.

## Backup if the live demo dies

Record this runbook as a screen capture **before** 11:00. The public repo clone is
**not** a fallback: `app/contacts.js` is gitignored, so on a fresh clone every contact
row reads *"adresa nu este inclusă în acest export"* and the shared-inbox count has
nothing to group. Demo from Andrei's machine or from the recording.

---

## Definitions — every set used above, as a computation

Ship the definition with the number. "Worst quartile" names a concept, not a computation;
a judge asking "1,320 of what?" is asking the cheapest possible question.

**The 1,320.** In `out/schools_need_index.csv` (6,335 rows, all with `rank_rate`):
take `rank_rate <= 6335/4` — that is 1,583 rows, the **national** worst quartile, urban
included — then keep `mediu = rural`. That leaves **1,320**, which is **31.4% of the
4,205 ranked rural schools**, not 25% of anything. The quartile is national; the 1,320 is
its rural slice. This is why `CLAUDE.md:108` says *"say 'the national worst quartile',
never 'our worst quartile'"*.

Reproduces off that one filter, no other exclusions:

| Figure | Value |
|---|---|
| national quartile rows | 1,583 |
| rural slice | **1,320** (31.4% of 4,205) |
| `pnras_eligible == 1` inside it | **248 = 19%** (`journey.html:278`) |
| `pnras_grant == 1` inside it | 147 = 11% |
| `masa_sanatoasa == 1` inside it | 380 = 29% |
| no curated NGO in county, all 9 | **170 = 12.9%** |
| no curated NGO in county, excl. `rel:"low"` | **247 = 18.7%** |
| fewer than 3 in county, all 9 | **1,096 = 83.0%** — matches `PROGRESS.md` to the decimal |
| no position at all | **16** (was 71 before `59bdb98`) |
| placed at commune level | **55** — and 55 + 16 = the 71 this file used to report, which is what confirms the recovery |

**`pnras_priority` is NOT a flag — do not test it for 1.** It is categorical: across the
6,335 rows, blank 5,181 · `MEDIUM` 1,033 · `HIGH` 121. Testing `== "1"` returns **0**, not
248, and a recipe that returns 0 against a stated 248 reads as evidence the figure was
invented. The flag is `pnras_eligible`. Non-blank `pnras_priority` selects the same 248
schools inside the 1,320 (201 MEDIUM + 47 HIGH), and the two predicates agree on **every
one of the 6,335 rows** — they are the same set register-wide, not two counts that happen
to coincide in this slice. A school is eligible exactly when it carries a band. So both
routes give the number and only one of them executes: a reader who picks the wrong
predicate against the *right* column gets silence, not an error, and checking the column
name does not catch it.
`model/README.md`'s distinction applies: eligible is not coverage, and priority is a
third thing again.

**The "×4" reflex is the trap.** 1,320 × 4 = 5,280 and there is no 5,280-row population;
1,320 was never a quarter of anything. It is the rural residue of a national quartile.
Anyone who meets 1,320 without a filter beside it will reach for ×4 and find nothing.

**Do not** sort on `fail_rate_shrunk` to build this set — it gives a different 1,320 and
then 225/17% for the PNRAS line instead of 248/19%. The sort column is `rank_rate`.

**The NGO counties.** Parsed from the `NGOS=[…]` literal in `app/index.html`, `c:[…]`
per entry. **Fold diacritics and uppercase before comparing** — `Dâmbovița` does not
match `DAMBOVITA`, and the failure is silent: it returns a plausible wrong answer
(64.8% instead of 78.6%) with no error raised. One of the nine, SOS Satele Copiilor,
is `rel:"low"` and is filtered from the UI, which is the entire difference between the
12.9% and 18.7% rows above.

