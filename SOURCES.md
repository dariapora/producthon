# SOURCES.md — every dataset and source this project uses

One rule, and it is the reason this file exists: **`CLAUDE.md` requires a source for every factual
figure, and the caveat travels with the figure.** Several numbers here are correct about one set
and wrong next to another, so each row below carries the constraint that makes it quotable rather
than just its provenance. Where a figure has a denominator, the denominator is named.

This file is provenance only. It does not adjudicate which claims are safe to present —
**`RESEARCH.md` §1 is the authority on that**, and it currently lists six claims in this repo that
are wrong or unsafe as worded.

---

## 1. Primary datasets

All live in `data/`. **None of them is in git** — **128 MiB** measured, of which the four exam
files are 61 MiB and the NGO register 32 MiB — so a fresh clone cannot rebuild `out/` without
re-downloading them. (`CLAUDE.md` says "~80 MB XLSX"; that predates the PDF coverage lists and the
census file. 128 MiB is the measured figure.) `CLAUDE.md` forbids reading or listing `data/` in a session — the
inventory below exists so nobody needs to.

### Exam results — the spine of the model

| File | Size | What it is | Source |
|---|---|---|---|
| `en_2023.xlsx` … `en_2026.xlsx` | 61 MiB total | One row per Evaluare Națională candidate: `COD SIIIR`, `MEDIU`, `MEDIA`, per-subject grades. **629,616 rows across four years.** EN 2026 published 13 Aug 2026 | data.gov.ro, Ministerul Educației |

**Caveats that must travel with it.** The EN files carry **no school name and no county column** —
those come from the network file, and the county is the first two digits of the SIIIR code (checked
against the network file's own column: 6,058 agree, 0 differ). The model **pools four years**
because 2025 looks like an easier exam rather than real progress: rural share below 5 runs 39.3% ·
42.3% · 30.1% · 36.3% for 2023–2026. And the structural blind spot — **EN only sees pupils who sat
the exam**; the ~9% who vanish before it are invisible here (`RESEARCH.md` §1.3: this is structural,
not a 2026 deterioration).

### School identity, contacts and position

| File | Size | What it is | Source |
|---|---|---|---|
| `retea_scolara_2025_2026.xlsx` | 2.9 MiB | School network: name, locality, SIRUTA, county, type, phone, email. **Header is on row 4, sheet `Export`** | data.gov.ro, Ministerul Educației |
| `scoli_coordonate_2017.xlsx` | 691 KB | `Cod_SIIIR` + lat/lon for **19,383 schools**, geocoded from postal addresses against the 2016–2017 network | data.gov.ro, Ministerul Educației |

**Caveats.** **277 of 6,335** schools in the EN files are absent from the 2025–2026 network file
(closed or renumbered) and so have no name or contact. The coordinates are **from 2017 and
geocoded from postal addresses**, so some are imprecise and 458 schools had none at all — which is
why position now has **three states, not two** (`geo_source`): the school's own point (5,877), its
commune's median (373), or nothing, falling back to the county seat (85). **6,250 of 6,335 are
placed but only 5,877 are geocoded** — different words, and the page says both.

Contacts are the reason `app/contacts.js` is gitignored: **6,037 schools have an address, 4,960
distinct inboxes**, and local `main`'s history carries **5,015 distinct addresses**. Those three
counts are not interchangeable — name the noun.

### Administrative geography

| File | Size | What it is | Source |
|---|---|---|---|
| `siruta_2026.csv` | 893 KB | SIRUTA nomenclator, including `SIRSUP` which walks village → commune | data.gov.ro, dataset "SIRUTA_s1 2026" |

Schools carry a **village** SIRUTA while budgets are per **UAT**, so this file is what makes the
deprivation join possible: **18,022 / 18,022 school localities resolve to a UAT (100%)**.

### Money — the deprivation layer (default basis)

| File | Size | What it is | Source |
|---|---|---|---|
| `uat_venituri_2025.xlsx` | 3.4 MiB | Anexa 24, DEC-2025, per-UAT revenue (Sheet2). Budget line **04.02.01 "Cote defalcate din impozitul pe venit"** | https://dpfbl.mdlpa.ro/sit_ven_si_chelt_uat.html |
| `uat_populatie_2023.xlsx` | 150 KB | Population by domicile per UAT, 1 Jan 2023, keyed by SIRUTA (`PDOM_SIRUTA2023.xlsx`) | DPFBL, INS data |

**The naming caveat is a hard rule, not a nuance.** This is the share of **wage** income tax ANAF
returns to the commune of domicile, divided by population. It sees declared wage income only —
subsistence farming, remittances, undeclared work and pensions are invisible, which pushes it
*down* hardest in the poorest rural communes. **Call it "impozit pe venit colectat pe cap de
locuitor" or "putere de cumpărare"; never "venit mediu".**

**And do not oversell what it explains.** On the 3,969 rural schools with ≥10 candidates *in total*,
`log(income tax per capita)` against `fail_rate_shrunk` gives **r = −0.161, r² = 2.6%**. The
gradient is real and monotonic-ish (42.8% → 33.6% of pupils below 5 across a 12× income range) but
shallow. The big divide is rural vs urban (36.3% vs 11.4% in 2026), not rich-rural vs poor-rural.
Use it to choose the intervention, not to rank severity.

### Non-employment — the census deprivation basis (opt-in, added 12 Sept)

| File | Size | What it is | Source |
|---|---|---|---|
| `rpl2021_activ_inactiv.xlsx` | 388 KB | RPL 2021 **Tabel 5.29**, resident population active/inactive per locality, **1 Dec 2021** | https://www.recensamantromania.ro/rezultate-rpl-2021/ |

**3,143 / 3,180 UATs** carry a census figure. Selected with `--deprivation-basis nonemp-core`;
`income` remains the **default** because the census is frozen until the **2031 census** while the
budget file refreshes yearly. Two provenance warnings for this file specifically are in §6.

### The NGO register

| File | Size | What it is | Source |
|---|---|---|---|
| `ong_2026.xlsx` | 32 MiB | Registrul Național ONG: `Denumire`, `Judet`, `Localitate`, `Starea actuala`, `HG utilitate publica`, `Scopul initial` + `Modificari ale scopului 1..5` | Ministerul Justiției |

**125,840 organisations.** Every denominator drawn from this file is listed in `CLAUDE.md` →
Claims discipline, and they are not interchangeable: **8,213 dead** (radiată / în lichidare /
dizolvată) · **9,498 with no purpose text** · **762 that are both** · **108,891 alive with a stated
purpose** · 116,342 with a purpose including the dead · **114,096 that state a purpose and record a
county**, which is the denominator the page's own figure divides by (**30,939 = 27.1%**).

The inclusion–exclusion overlap is the trap: `125,840 − 8,213 − 9,498` is **not** the answer, and
getting it wrong is wrong by 7,451 — an amount nobody sanity-checks mentally. Recount with
`node model/ngos.js` rather than copying a literal from any document.

### Coverage — published only as PDF

| Files | What they are | Source |
|---|---|---|
| `data/pnras/elig_r2s{1,2,3}.pdf` | PNRAS **eligible** — the ministry's own high-dropout-risk list with its composite index. **1,201 schools.** This is *not* coverage | Ministerul Educației / PNRR C15 |
| `data/pnras/benef_r2s{1,2,3}.pdf` | PNRAS **grants admitted** — this *is* coverage; money and a project are running (~€200–300k each). **733 schools, 95.2% matched** | idem |
| `data/masa/masa_2026.pdf` | **Masă sănătoasă** — free hot meal, 16.5 lei/pupil/day in 2026. **1,386 of 1,424 matched (97.3%)** | Guvernul României |

Each `.pdf` has a sibling `.txt` produced by `npm run extract` (`model/extract_pdfs.py`, the one
Python step). **Eligible and grant must never be conflated**: being on the eligibility list means
the ministry noticed, not that anything happened.

**One is still unread.** `data/pnras/elig_r2s2.pdf` is a **scan**, so ~900 eligible schools are
missing from the join; it needs `tesseract`, which is not installed. 19 of its 63 pages were read
by vision and revalidated against the school network (99.3%): **92% were already on the lists we
could read**, yielding 11 new flags and **1** inside the worst-quartile set. So say *"we read a
third of it and it is 92% the same schools"* — **not** "upper bound", which the measurement
retired.

### The file nothing reads

`data/uat_siruta_bridge.xls` (957 KiB) is **not referenced by any script** in `model/`. It is left
over from an earlier join attempt. Do not cite it as a source; do not assume removing it breaks
anything without grepping first.

---

## 2. Derived outputs

Everything in `out/` is **generated — regenerate it, never hand-edit it.** Same for the
`/*DATA:START*/ … /*DATA:END*/` block inside `app/index.html`.

| File | Produced by | Contents |
|---|---|---|
| `schools_need_index.csv` | `npm run index` | 6,335 schools ranked, all joined layers |
| `schools_need_index_rural.csv` | idem | the 4,205 rural ones |
| `counties_summary.csv` | idem | per county, including rural share below 5 |
| `uat_deprivation.csv` | `npm run deprivation` | per-UAT deprivation, joined automatically by `index` |
| `coverage.csv` | `npm run coverage` | PNRAS eligible / grant / Masă sănătoasă flags |
| `ngo_candidates.csv` | `npm run ngos` | **1,260 rows**, top 30 per county |
| `ngo_gold_sample.csv` | `npm run eval --sample` | 120 stratified rows |
| `ngo_gold.csv` | — | the same 120 rows, **labelled by Claude, not a person — silver, not gold** |
| `ngo_profiles.json` | `npm run classify` | **does not exist. J1 has never been run** (no API key) |

**Pipeline order:** `npm run extract` (once) → `npm run index` (runs deprivation + coverage too) →
`npm run app`.

**Candidate-list denominators, which differ by one and matter:** 1,260 data rows as displayed ·
**1,252** distinct `(reg, normalised name)`, which is what `classify_ngos.js` bills for · 1,251
distinct `reg` — never quote the last as an organisation count, 9 registration numbers are shared.
`wc -l` also says 1,260, but only by luck: the file has no trailing newline, so it undercounts by
one and agrees by accident.

---

## 3. External evidence cited in the deck and docs

Provenance only — **`RESEARCH.md` is the authority on which of these is safe to say out loud**, and
§1 flags six that are not.

### Cost of dropout

| Source | Used for |
|---|---|
| AmCham România × Universitatea din București, *Impactul economic al abandonului școlar*, restated in AmCham's position paper 18 Dec 2025 — https://www.amcham.ro/download?file=mediaPool%2FuG0Ns0w.pdf | **2.3 bn EUR/year = 0.77% of GDP**; ~200,000 EUR less earned per dropout over a lifetime vs a liceu graduate |

### Programme evaluations — the targeting-failure evidence

| Source | Used for |
|---|---|
| World Bank, first external evaluation of *masă caldă*, Apr 2025 (via edupedu) | The programme ran for years in schools with **zero** dropout; the Bank recommends profound revision |
| World Bank, PNRAS Round I, Jun 2025 | 1,402 funded vs 1,255 eligible-unfunded; **634** of the funded were not in the highest-risk band |
| DonorsChoose (US, ~1.8m requests 2009–2019) | Funding tracks *which teachers had time to apply*, not where need is greatest — the mechanism our tool targets |

### The honest threat to our own premise

| Source | Used for |
|---|---|
| **ROSE impact evaluation** (IDB / UQAM / Columbia; randomised rollout, **41,524 pupils, 165 schools**) | Found **no meaningful differences by local economic conditions** — the exact moderator a poor-vs-rich routing rule assumes. `RESEARCH.md` §3 and §3.0.1 |
| Jensen 2010 (QJE, RCT) | Information on returns to education raised perceived returns but not behaviour uniformly |

**Consequence for the pitch, and it is not optional:** the routing rule (349 poor+failing vs 132
failing in well-off communes) is a **testable hypothesis an ISJ can evaluate, not a proven law.**

### Benchmarks and context

| Source | Used for |
|---|---|
| World Vision România, *Raport anual 2025* — https://worldvision.ro/wp-content/uploads/2026/05/Raport-anual-WVR-2025.pdf | The **42.4%** rural-below-5 figure for 2024 our model reproduces at 42.3%, recomputed from the raw ministry file |
| Eurostat, Jun 2026 — https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260604-1 | EU comparison of early school leaving |
| European Commission, *Education and Training Monitor* — Romania | idem |
| INS RPL 2021 Tabel 2.02.1/2.02.2 — https://www.recensamantromania.ro/wp-content/uploads/2023/06/Tabel-2.02.1-si-Tabel-2.02.2.xlsx | Population context |
| edupedu, Jun 2026 | ~15,000 pupils enrolled in class 8 who do not appear at EN — the ~9% gap |
| Agerpres, Apr 2025 · Curierul Național · Euronews România · Tribuna Învățământului | Press context: the grade 8→9 transition, dual-track places, admission results |

### Sources deliberately **not** used

- **hartaedu NGO figures.** Never quote one alongside ours — they count different things.
- **The persona quote at `source/CivicPTeam1.md:239`.** Written by the team, not said by anyone.
  `RESEARCH.md` §1.6 marks this **highest severity**: zero interviews have been conducted
  (`:910`, Interview Outcomes, is empty). **Nothing in this project may be presented as
  voice-of-customer.**
- **INS TEMPO SCL103D** (grade-8 enrolment by locality) — would let us estimate the ~9% missing
  before the exam. Not yet added; listed in `CLAUDE.md` → Next tasks #4.

---

## 4. Services

| Service | Used for | State |
|---|---|---|
| **Anthropic API** (`@anthropic-ai/sdk` 0.125.0) | J1 NGO-purpose classification — `claude-haiku-4-5`, escalating to `claude-sonnet-5` below 0.6 confidence, structured outputs via `output_config` | **Built, never run.** Needs `ANTHROPIC_API_KEY`; the dry run measured **$1.80 for 1,252 organisations, ~5 min** |
| **Google Fonts** | Inter, loaded by `app/index.html` (`BRAND.md` §5) | live |

### Tooling that reads the sources

| Package | Role |
|---|---|
| `xlsx` ^0.18.5 | the only reader for every `.xlsx` above — the ministry publishes XLSX, not CSV |
| `@anthropic-ai/sdk` ^0.125.0 | J1 only |
| `playwright` | the ten test suites (`test/package.json`, dev-only — `cd test && npm i`) |
| `python3` + `pdfplumber` | `model/extract_pdfs.py`, the one Python step, for the PDF-only coverage lists |

`app/index.html` has no build step and loads no JS libraries — two `<script>` tags, one of which is
the gitignored `contacts.js` sidecar. Its only other network dependency is Google Fonts.

**The page cites its own sources inline**, which is where a judge will click: data.gov.ro (EN
results), pnrr.edu.ro (PNRAS), worldvision.ro, edupedu and Tribuna Învățământului. Those links are
part of the deliverable, not decoration — if a figure on screen has no link beside it, that is a
defect.

---

## 5. What a fresh clone can and cannot rebuild

| | Works on a clone? |
|---|---|
| `app/index.html`, `app/pitch.html`, `app/journey.html` | **Yes** — 6,335 schools are baked in |
| The test suite (`cd test && node run-all.mjs`) | **Yes** — ten suites, no data needed |
| Contact details in the UI | **No.** `app/contacts.js` is gitignored, so every row reads *"adresa nu este inclusă în acest export"* and the shared-inbox count has nothing to group |
| Re-running the pipeline | **No** — `data/` is not in git; re-download all of §1 first |

**Consequence for Sunday:** the public repo clone is **not** a demo fallback. Demo from Andrei's
machine or from a recording.

---

## 6. Provenance warnings

**1. `data/` is not in git, so no source file's integrity is version-controlled.** Every figure in
this project traces to a file whose only copy is on one laptop. The defence is that each layer is
recomputable and each recomputation is checked against a published external figure (the 42.3% vs
World Vision's 42.4% is the load-bearing one).

**2. Two sites fail TLS verification from this machine** — `dpfbl.mdlpa.ro` and
`recensamantromania.ro`, both *"unable to verify the first certificate"*, the same error class as
the `corporatebrain` MCP server this session. It looks like a local trust-store or proxy problem
rather than the sites. **`data/rpl2021_activ_inactiv.xlsx` was fetched with verification
disabled.** That file now reorders which schools are ranked most in need, so before the census
basis is ever made the default it should be integrity-checked another way — a second fetch from a
machine with a working trust store, or a published checksum. Flagged, not resolved.

**3. The budget series is annual and 2025 is the latest.** `Anexa24_2026.xlsx` 404s; the 2026 file
is due ~March 2027. The local copy was confirmed byte-identical to what DPFBL publishes.

**4. "≥10 candidates" means two different sets in `model/README.md`, and both are labelled the
same way.** The deprivation correlation (r = −0.161, r² = 2.6%) uses **3,969** schools — ≥10
candidates *in total*. The census comparison table (log income r = −0.197, r² = 3.9%) uses
**2,730** — ≥10 candidates *per year*. Both figures are correct; they are not comparable, and the
shared label hides it. **A correlation's sample is a denominator too.** Independently measured:
3,963 and 2,731 respectively, so both stated n are within a handful of rows of reproducing, but the
sets themselves differ by about 1,200 schools.

**5. PDF-only publication is a data-quality ceiling, not an inconvenience.** All three coverage
lists are published as PDF, one of them as a scan. Raw vision misreads about **1 digit in 7** SIIIR
codes — it is the name + locality revalidation that turns ~86% into 99.3%. Never quote a
vision-extracted code without that step.
