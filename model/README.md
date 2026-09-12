# EN need index — grade 8 → 9 cliff

Runs on the **real** ministry data (no longer synthetic). The Node version is the one to use:
Python is not installed on this machine, and the ministry publishes XLSX, not CSV.

```bash
npm install                       # once (xlsx reader)
npm run index                     # rebuilds out/*.csv from data/*.xlsx
```

or explicitly:

```bash
node model/need_index.js data/en_2023.xlsx data/en_2024.xlsx data/en_2025.xlsx data/en_2026.xlsx \
  --network data/retea_scolara_2025_2026.xlsx --coords data/scoli_coordonate_2017.xlsx --out out
```

## Inputs (all in `data/`, all from data.gov.ro, Ministerul Educației)

| File | What it is |
|---|---|
| `en_2023..2026.xlsx` | One row per EN candidate: `COD SIIIR`, `MEDIU`, `MEDIA`, grades. 629,616 rows over four years. EN 2026 was published 13 Aug 2026. |
| `retea_scolara_2025_2026.xlsx` | School network: name, locality, SIRUTA, county, type, phone, email. Header is on row 4; sheet `Export`. |
| `scoli_coordonate_2017.xlsx` | `Cod_SIIIR` + lat/long for 19,383 schools, geocoded from postal addresses (2016–2017 network, so some schools are missing). |

**The join key is `COD SIIIR`** (10 digits). The EN files carry no school name and no county
column: names, localities and contacts come from the network file, and the first two digits of
the code are the SIRUTA county code. That inference was checked against the network file's own
county column: 6,058 schools agree, 0 disagree.

## Outputs (in `out/`)

- `schools_need_index.csv` — 6,335 schools, ranked
- `schools_need_index_rural.csv` — the 4,205 rural ones
- `counties_summary.csv` — per county, including the rural share below 5

Columns worth knowing:

- `fail_rate_shrunk` — share below 5, smoothed toward the county × rural/urban average. Trust this, not `raw_fail_rate`.
- `fail_rate_p90` — pessimistic bound (90% credible): "could be this bad".
- `need_per_year` — expected pupils below 5 per year. **Where the most children are** — favours large schools.
- `rank_rate` — where the problem is most *concentrated*. Use both: `need_per_year` for "quick wins", `rank_rate` for "no one is here".
- `lat` / `lon` — real school coordinates where available (5,877 of 6,335), otherwise empty.
- `coverage_programmes` — still empty; fill by joining PNRAS / Masă sănătoasă / NGO school lists.

## Sanity check

The rural share below 5 in 2024 comes out at **42.3%**, against the **42.4%** World Vision published.
Recomputed from the raw ministry file, so the number can be defended rather than quoted.

| Year | Rural below 5 | Urban below 5 |
|---|---|---|
| 2023 | 39.3% | 13.8% |
| 2024 | 42.3% | 15.3% |
| 2025 | 30.1% | 9.0% |
| 2026 | 36.3% | 11.4% |

2025 looks like an easier exam rather than real progress — which is why the model pools four years.

## Known limits

- **The blind spot:** EN only sees pupils who sat the exam. The ~9% who vanish before it are invisible here. Add INS TEMPO SCL103D (pupils by locality) to estimate them.
- **277 of 6,335 schools** in the EN files are missing from the 2025–2026 network file (closed or renumbered), so they have no name or contact.
- Coordinates are from 2017 and geocoded from postal addresses, so a few will be off; 458 schools have none.
- `need_index.py` is the original Python model, kept for reference. It expects CSV and cannot read these files.

---

## Deprivation / purchasing-power layer (`deprivation.js`)

Run on its own with `npm run deprivation` (writes `out/uat_deprivation.csv`); `npm run index`
joins it automatically and adds the columns below to both school files.

### What "putere de cumpărare" actually is here

Romania publishes no income figure per commune. The closest honest proxy that exists at UAT
level is the local-budget line **04.02.01 "Cote defalcate din impozitul pe venit"** — the share
of wage income tax ANAF returns to the commune where the taxpayer is domiciled. Divided by
population, it ranks communes by formal earned income.

**State the bias when you present it.** It sees declared wage income only: subsistence farming,
remittances, undeclared work and pensions are invisible, which pushes it *down* hardest in the
poorest rural communes. Good for ranking, wrong as an income estimate. Never call it
"venit mediu" — call it "impozit pe venit colectat pe cap de locuitor".

### Sources

| File | What | Where |
|---|---|---|
| `data/uat_venituri_2025.xlsx` | Anexa 24, DEC-2025, per-UAT revenue (Sheet2) | https://dpfbl.mdlpa.ro/sit_ven_si_chelt_uat.html |
| `data/uat_populatie_2023.xlsx` | Population by domicile per UAT, 1 Jan 2023, keyed by SIRUTA | DPFBL `PDOM_SIRUTA2023.xlsx` (INS data) |
| `data/siruta_2026.csv` | SIRUTA nomenclator with `SIRSUP` | data.gov.ro, dataset "SIRUTA_s1 2026" |

### The join

Schools carry a **village** SIRUTA; budgets are per **UAT**. `SIRSUP` in the nomenclator walks
village → commune. Budget rows are keyed by fiscal code + name, so the name is matched back to
SIRUTA within its county.

- 18,022 / 18,022 school localities resolve to a UAT (100%)
- 3,180 / 3,186 UATs get budget + population (the 6 missing are Bucharest sectors)
- 3,187 budget rows: 3,172 exact, 9 by near-spelling, 2 by explicit alias, 6 sectors dropped
- **5,819 / 6,335 schools** carry a deprivation score — **4,088 / 4,205 rural (97.2%)**

Two traps handled in code: the budget file writes place names without diacritics and is
inconsistent about `Â`/`Î` (CÂMPENI→"CAMPENI", HOPÂRTA→"HOPIRTA", FÂNTÂNELE→"FANTINELE" —
both readings in one word), so every A/I spelling is indexed; and county names need the same
treatment or Dâmbovița and Vâlcea silently drop ~170 communes.

### New columns

`uat_siruta`, `uat_name`, `uat_population`, `income_tax_per_capita`,
`equalization_per_capita` (state top-up per head — the mirror image), `deprivation_score`
(0 = richest UAT in the country, 1 = poorest), `priority_score`.

`priority_score = (1−w)·failPct + w·deprivation`, both percentiles, `w = 0.5` by default and
settable with `--deprivation-weight`. Ranks, not raw values, so neither long tail dominates.
Schools with no budget match fall back to exam results alone rather than being guessed at.

### What the layer actually showed — read this before pitching it

Across the 4,202 rural schools that have a ranked need index (the correlation below uses the
3,969 of them with ≥10 candidates; the list counts use all 4,202):

```
Pearson r = -0.161 between log(income tax per capita) and fail_rate_shrunk   (r² = 0.026)

decile of commune income tax per capita -> mean share of pupils below 5
  D1    114 lei/cap   42.8%
  D5    218 lei/cap   37.8%
  D10  1360 lei/cap   33.6%
```

**Purchasing power explains about 2.6% of the variance.** The gradient is real and monotonic-ish
(42.8% → 33.6% across a 12× income range) but shallow. The big divide is rural vs urban
(36.3% vs 11.4% in 2026), not rich-rural vs poor-rural.

So do **not** sell this as "we found that poverty drives dropout" — the data does not support
that claim at this grain, and anyone with the file can check.

**And do not oversell the routing either.** See `RESEARCH.md` §3: the ROSE evaluation
(IDB/UQAM/Columbia, randomised, 41,524 pupils, 165 schools) found *no meaningful differences by
local economic conditions* — the exact moderator a poor-vs-rich routing rule assumes. Present the
split as a **testable hypothesis an ISJ can evaluate**, not a law. Two things survive that caveat
intact: ROSE tested untied grants rather than differentiated interventions, and the split itself
is a fact about the data whatever it implies for policy:

- **349 rural schools** are in the national worst quartile on results **and** the poorest fifth of
  communes on money. Where cash does bind, the evidenced lever is conditional transfers with
  *enforced* conditions; school meals move enrolment ~3pp but not attendance. **Not transport or
  boarding** — `RESEARCH.md` §3.1 finds no systematic review with usable effect sizes for either.
- **132 rural schools** are in the national worst quartile while sitting in the richest fifth of
  communes → money is not the binding constraint. The evidenced levers are school management
  (+1 SD ≈ +0.24 SD scores) and teacher stability. **Do not confuse this 132 with the 106
  "quick wins"** (ministry-flagged, no grant yet) — different sets, and both are printed by the
  same run.

The extreme case is rank 1 by `need_per_year`: **Școala Gimnazială Nr. 1 Ștefăneștii de Jos
(Ilfov)** — 4,364 lei/capita, among the richest 0.2% of UATs in the country, with a 71%
shrunk fail rate. A commuter commune on the edge of Bucharest where local wealth and the local
school have come apart completely.

### Sanity checks

Poorest by this measure: Ibănești (VS), Bărbulești (IL), Scânteia/Moșna/Costuleni/Prisăcani (IS),
Brăhășești (GL) — all known-poor communes. Richest: Jucu (CJ, the Nokia/Bosch industrial park),
Ghimbav (BV), Otopeni (IF). The ranking puts the right places at both ends.

One value to check by hand before quoting: **Ibănești (VS)** reports exactly 0 lei of income tax
for 1,459 people. Plausible for a commune with almost no formal employment, but it is the only
UAT under 10 lei/capita, so treat it as unverified.

---

## Coverage layer (`coverage.js` + `extract_pdfs.py`)

```bash
python3 model/extract_pdfs.py   # npm run extract   — PDFs -> data/*/*.txt (run once)
npm run coverage                # -> out/coverage.csv
npm run index                   # joins it; fills coverage_programmes
```

Fills `coverage_programmes`, which the NGO matcher needs in order to skip schools that already
have a programme (`MATCHMAKING.md` §7, filter 4).

### Three sources — two of them are not the same kind of thing

| Source | What it means | Rows matched |
|---|---|---|
| **PNRAS eligible** | The ministry's own judgement that a school is at high dropout risk. **Not coverage** — it means the ministry noticed, not that anything happened | 1,201 schools |
| **PNRAS grant** | Application admitted; a PNRR C15 project is running | 733 of 770 (95.2%) |
| **Masă sănătoasă** | Free hot meal, 16.5 lei/pupil/day in 2026 | 1,386 of 1,424 (97.3%) |

Of 4,205 rural schools: **555 have a PNRAS grant, 1,136 a meal, 1,459 either.**

Sources: PNRAS lists from edu.ro (`/PNRAS`, `/pnras2_2`, `/pnras2_3`); Masă sănătoasă from
Monitorul Oficial I nr. 3 bis/5.I.2026 (Ordin ME/MADR 7.111/422/2025) — 1,427 units,
542,402 beneficiaries, which matches the published national figure.

### The join

All three are published **only as PDF**, so `extract_pdfs.py` (pypdf) writes `.txt` next to each
and the Node code reads that. It is the one Python step in the pipeline.

- *Eligible* lists carry `COD SIIIR` → direct join, 1,201 of 1,263 codes are units in the network
  file (the rest are PJ-level or closed schools).
- *Grant* and *Masă* lists carry only a name and a county, so they go through normalise → exact
  match within county → token-Jaccard fallback. **An ambiguous match is rejected**, because
  silently marking the wrong school as covered is worse than leaving it unmarked.

Two traps, both of which caused silent data loss before they were fixed:

1. **Three different embedded fonts** encode Romanian diacritics as unmapped `/gNNN` glyphs at
   different code points (`/g658` *and* `/g249` are both Ș). Dropping the unmapped ones turned
   "Școala Gimnazială Zemeș" into "coala Gimnazială Zeme", which matched nothing.
   `extract_pdfs.py` now **refuses to write** if an unmapped glyph above /g200 remains.
2. Repeated page headers land *inside* records in the grant lists, so the applicant/county/status
   tail cannot be anchored to end-of-string — take the last match in the record instead.

### The scanned list — measured, not guessed

`elig_r2s2.pdf` (PNRAS Runda II seria 2, 63 pages, Anexa la OME 6735/28.11.2023) is a **scanned
image**: 62 characters of extractable text in the whole file, and no OCR tool is installed here.
It was read directly with a vision model instead — the pages are rotated 180° but otherwise clean,
and carry the same schema as the machine-readable lists, `COD SIIIR` included.

**19 of 63 pages (counties AB–CT, 153 rows) were transcribed and verified**, then stopped, because
the result showed the rest was not worth reading:

| | |
|---|---|
| rows transcribed | 153 |
| resolved to a school | **152 (99.3%)** — 142 by exact SIIIR, 10 repaired by name + locality |
| of those, **already** on the R2S1/R2S3 eligible lists | **134 of 145 (92%)** |
| genuinely new eligibility flags | **11** |
| of those, in our worst-quartile "no one is here" list | **1** |

**The ministry's three eligibility rounds overlap ~92%.** Extrapolating the 30% sampled to the
whole document, the full scan would add roughly 35 new flags nationally and move the "no one is
here" count by **about 3–5 schools out of 789** — under 1%.

So **789 is not a loose upper bound; it is accurate to about 1%**, and that is now a measured
claim rather than a hedge. Say it that way: *"one of the three ministry lists is a scan; we read a
third of it and it is 92% the same schools, so the number moves by under one percent."*

The transcription is kept at `out/pnras_r2s2_scan_partial.txt` (raw) and
`out/pnras_r2s2_resolved_partial.txt` (SIIIR-resolved). It is **deliberately not joined into the
model**: it covers counties AB–CT only, and feeding a partial list in would make early-alphabet
counties look better covered than the rest. Finish all 63 pages before wiring it in.

One transcription caveat worth knowing if anyone repeats this: vision misread 1 digit in 7 codes
on the first page tested. That is why every code is validated against the school network and
repaired by name + locality — raw vision output is not trustworthy at 10-digit precision, but
validated vision output is (99.3% here).

### What the ministry list showed — the pitch argument

`npm run index` prints this. Across the 4,202 rural schools that have a ranked need index (the correlation uses the 3,969 of
them with ≥10 candidates; the list counts below use all 4,202):

```
922 rural schools are on the ministry's risk list;
  their mean percentile in our ranking is 58        (50 = no agreement at all)
1,320 rural schools are in the NATIONAL worst quartile (percentile over all 6,331
  schools, urban included = 31% of rural schools); the ministry flagged 248 of them   (19%)

QUICK WINS      ministry flagged, no grant yet                              106
NO ONE IS HERE  worst quartile, no grant, no meal, not on the list          789
```

**The ministry's own risk list barely tracks actual exam outcomes** — mean percentile 58 against
a null of 50, and it catches 19% of the rural schools in the national worst quartile. That is the
argument for the product, and it is checkable by anyone with the same public files.

The two lists to show, never a "worst villages" ranking:
- **Quick wins** — already flagged as at-risk, no money has arrived. Someone has done the
  paperwork; a funder can move now.
- **No one is here** — worst quartile, no grant, no meal, not even flagged. Top of that list:
  Cojasca (DB), Gălbinași (CL), Zizin (BV), Topolog (TL), Gârbești (IS).

---

## Contact data — two things that bite the outreach step

**879 addresses are shared by 1,956 schools.** Of 6,335 schools, 6,037 have an email but only
**4,960 are distinct**; the worst inboxes serve five schools each. This is `școală coordonatoare`
+ `structuri arondate` — subordinate units under one administration — so it is real structure, not
corrupt data. `need_index.js` emits `inbox` (normalised address) and `inbox_schools` (how many
share it) so the grouping is explicit and auditable rather than an implicit behaviour of whatever
drafts the email.

**Restate the Călărași reachability claim — twice over.** "72 rural schools, 68 with an email" is
true and misleading in two separate ways:

1. 68 have an email and 68 are geocoded, but only **64 have both**. Same size, different sets —
   4 have an address and no coordinates, a different 4 the reverse. The pilot flow needs both:
   place the school, then write to it.
2. Those 64 resolve to **50 distinct inboxes**, not 64 recipients.

So the honest line is **72 rural · 68 email · 68 geocoded · 64 both → 50 inboxes**. The run prints
exactly this, including "the two 68s are different sets".

**One source defect, verified, worth naming before a demo:** in Dâmbovița the ministry file has two
schools' emails swapped —

| school | locality | email in the file |
|---|---|---|
| Școala Gimnazială Cojasca | COJASCA | `fantaneles@…` |
| Liceul Tehnologic Cojasca | FÂNTÂNELE | `cojasca@…` |

Both are in the worst quartile with no coverage, so both are exactly what the matcher surfaces.
**Render a redacted address in any live drafting demo** — a draft addressed to the wrong school on
screen during Q&A is worse than no draft at all.
