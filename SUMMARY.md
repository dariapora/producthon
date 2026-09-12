# Puntea 8→9 — conversation summary

Civic Producthon 2026 (Innovation Labs Academy), challenge **Educație – Combaterea abandonului școlar**. Team doc: `source/CivicPTeam1.md`. Summary written 11 Sept 2026.

## Where we landed

- **Problem:** the **grade 8 → grade 9 cliff** in rural Romania. Almost 1 in 5 rural children (19.7%) is lost across the nine years of compulsory schooling, against 2.8% in urban areas, and about 14,600 grade-8 pupils (8.8%) didn't register for Evaluarea Națională (EN) 2026. Note both precisely: the 19.7% is cumulative cohort loss, not a grade 8→9 transition rate, and the EN gap is structural — it recurs every June.
- **Positioning:** *"We're not a new NGO. We're the infrastructure for programmes that already run."* (World Vision mentors, Teach for Romania teachers, Junior Achievement company visits.)
- **North star:** "Don't tell them what to do. Give them a taste for the sea — and make sure
  there's room in the boat." **Ours, after Saint-Exupéry — not a quotation. Never put it in
  quotation marks or on a slide with his name as the speaker.** The sentiment is his (*Citadelle*,
  published posthumously 1948, in the passage about creating the love of the sea); the familiar
  English "if you want to build a ship, don't drum up people to gather wood…" is a later
  condensation by others and appears nowhere in his text in that form. **Drop the chapter number**
  — "ch. 75" is repeated from secondary quote sites and we have not checked it against the text,
  and a precise-looking citation is exactly what a juror would look up.
- **Product (as shipped, 12 Sept):** a coverage-gap map plus an NGO→school matcher, on real
  ministry data for 6,335 schools.
  - **Risk:** EN results per school, empirical-Bayes smoothed so small schools don't read as noise.
  - **Constraint:** commune purchasing power as a second axis — it routes the intervention, it does
    not rank severity (~2.6% of variance; see the finding below before pitching it).
  - **Coverage:** PNRAS eligibility, PNRAS grants and Masă sănătoasă joined per school. **Three
    populations, never mix them:** across the **18,022-unit school network** the matches are
    1,201 / 733 / 1,386; among the **6,335 ranked schools** 1,154 / 701 / 1,314; among the
    **4,205 rural** 922 / 555 / 1,136. Rural with a grant or a meal: **1,459 of 4,205**.
    **Mind the denominator** — that is all rural schools. Inside the national worst quartile
    (1,320 rural schools, `failPct ≥ 0.75`) the figure is **466**, and **789 have nothing at all**.
    Quote one denominator per slide and say which.
  - **Output:** five ranked lists — most children · most concentrated · money is the constraint ·
    money is not the constraint · no one is here — plus a matcher shortlist weighted between
    proximity and need, on real school coordinates.
- **Users:** NGO programme leads and CSR funders. The ISJ is the authority behind it.
  **Do not read the funder names as a pipeline** — see Partners for what each one is actually
  evidenced by. We have spoken to none of them.

## How the idea evolved

1. **An AI helper for diriginți, with pregnant minors as the beneficiary.** Too vague, overlapped with MATE and PNRAS, and child data raised GDPR problems.
2. **Warm meals from catering surplus.** Catering surplus appears in the evening, school lunch is at midday. The programmes already exist: Masă sănătoasă (542k pupils, 16.5 lei/day) and World Vision's Pâine și Mâine.
3. **The grade 8→9 cliff** (chosen). Money, commuting and household work matter more than lack of information.
4. **Three pillars** — *framing only, none of it is built:*
   - risk identification by the diriginte (who);
   - apprenticeships and dual education as the reframe (why);
   - help with the paperwork: bursă socială, commuting reimbursement, dual enrolment (how).
5. **Human layer:** a "frate mai mare" mentor coordinated over WhatsApp. **Not in scope and not
   built** — kept here because the reasoning (uncertainty avoidance, collectivism, phones not
   laptops) still justifies why the output is an intervention *route* rather than an app for pupils.
6. **Data layer:** a coverage-gap map, then the NGO matcher. **This is the product** — steps 1, 2, 4
   and 5 are rejected or deferred alternatives, not current scope. Say that plainly if asked what
   happened to the diriginte tool: child-level data is a GDPR problem we chose not to take on, and
   MATE already occupies that space (statutory under Legea 198/2023, just not public).

### What the team doc actually contains — read this before claiming discovery

`source/CivicPTeam1.md` (118 KB) is the discovery artefact, and **it documents a different product
than the one we shipped.** Specifics, because a judge may ask for the discovery work by name:

- **All 8 hypotheses target *class masters / diriginți* as the user**, each with a validation
  threshold phrased as "≥6 out of 8 class masters…". Our shipped user is an NGO programme lead or
  a CSR funder. **None of those thresholds has been tested, and none of them tests our product.**
- **The "Interview Outcomes" section is empty** — two blank bullets. Zero interviews were run, so
  no hypothesis is validated or invalidated.
- **The persona is explicitly a proto-persona** ("profil construit din ipotezele actuale si date
  secundare, care urmeaza sa fie validat prin interviuri"). Its `QUOTE` field — „Vreau sa ajut
  elevul, dar nu stiu intotdeauna care este urmatorul pas…" — is **written by us, not said by
  anyone. It must never appear on a slide as a quotation.** It is the most dangerous single line
  in the repo: it looks exactly like interview evidence.
- **The beneficiary profile is the pregnant-minor direction** (idea 1) and the last hypothesis set
  in the file is the **food-redistribution** model (idea 2), marked *"Generat cu AI"*. Both are
  rejected directions. The file was never rewritten after the pivot.
- There are two full interview guides (EN + RO), 6 sections each, and they are good — but they are
  guides for interviewing diriginți, i.e. instruments for the product we did not build.

**We are not out of compliance, and that matters for how to say it.** The participant guide
(`../Guideline Participants.md`) lists Friday's deliverables as **problem brief · lista de ipoteze ·
lista de întrebări de interviu** — we have all three (this file is the brief; the team doc has the
8 hypotheses and both interview guides). *Outcome interviuri, ipoteze validate/invalidate, personas
and north star are listed as **optional*** — we have a proto-persona and a north star, and the
missing piece is only the optional one. So the framing is "we did the required discovery set and
chose to spend the weekend on the data layer", **not** "we skipped discovery".

**How to present this honestly, which is stronger than hiding it:** the discovery work moved us off
a GDPR-heavy, MATE-overlapping diriginte tool and onto a public-data product — that is discovery
doing its job, and the pivot *is* the finding. What we do not have is a single conducted interview
with the user we ended up serving. Say so, then say the ATSI call is booked to close exactly that
gap. Claiming validated hypotheses from this file would not survive one follow-up question.

## Key facts (with sources)

| Fact | Source |
|---|---|
| Rural cohort starting clasa pregătitoare in 2015/16 (85,259): **19.7% lost** across the 9 years of compulsory schooling (16.1% abandon + 3.6% repetenți) vs **2.8% urban**. Cumulative cohort loss, **not** a transition rate | MEC, *Raport starea învățământului preuniversitar 2024–2025*, Tabel 19 (press: https://tribunainvatamantului.ro/20-la-suta-renunta-la-scoala_rural/) |
| Counter-stat a data judge may open with: **rata de tranziție gimnaziu→secundar superior = 96.5%** (same report, Tabel 26). Answer: that denominator is pupils *already enrolled in grade 8*, so it conditions on having survived, and it has no rural/urban split — which is the gap the index fills | MEC, same report, Tabel 26 |
| Rural early school leaving 26.3% vs 3.3% in cities (2024). Romania last in EU: 15.5% in 2025 vs EU 9.1% | https://op.europa.eu/webpub/eac/education-and-training-monitor/en/country-reports/romania.html · https://ec.europa.eu/eurostat/web/products-eurostat-news/w/ddn-20260604-1 |
| 162,616 pupils in grade 8 → 148,268 registered for EN 2026 → 143,251 sat it. Gap = **14,348 (8.8%)**. EN 2025's gap was **16,815 (~9%)** — stable, so never pitch 2026 as a deterioration. Concede unprompted that the gap mixes repetenți, transfers and administrative loss, not pure dropout | https://www.edupedu.ro/aproape-15-000-de-elevi-care-erau-inscrisi-la-inceputul-acestui-an-scolar-in-clasa-a-viii-a-nu-apar-inscrisi-la-evaluarea-nationala-care-incepe-luni-generatia-2026-a-trecut-prin-pandemie-si-9-minis/ |
| 119,610 in computerised allocation; only 126 left without a place | https://www.euronews.ro/articole/rezultate-admitere-liceu-2026-doar-126-de-elevi-au-ramas-nerepartizati |
| 41% of rural pupils don't want high school; 62% do household work; about half of rural high-school students commute >1h a day (World Vision study) | https://curierulnational.ro/evaluarea-nationala-2026-tranzitia-catre-liceu-punctul-critic-al-abandonului-scolar/ |
| 12,368 dual grade-9 places lost the bursă tehnologică in 2026–27 | https://curierulnational.ro/12-368-de-locuri-la-liceul-tehnologic-dual-fara-bursa-tehnologica-in-anul-scolar-2026-2027/ |
| Bursă socială 300 lei a month, new rules for 2026–27 | https://www.edupedu.ro/burse-sociale-2026-2027-cei-300-de-lei-pe-luna-nu-se-mai-acorda-in-vacante-veniturile-din-strainatate-trebuie-declarate-scolile-pot-verifica-prin-patrimven-veniturile-documente-necesare-si-criter/ |
| World Bank: Masă caldă was run in schools with zero dropout (a targeting failure) | https://www.edupedu.ro/programul-de-masa-calda-a-fost-aplicat-ani-de-zile-in-scoli-cu-zero-abandon-scolar-arata-primul-raport-extern-facut-de-banca-mondiala-prin-pnrr-institutia-recomanda-revizuirea-profunda-a/ |
| Teachers can't give paid tutoring to their own students (ROFUIP 2024) | https://www.edupedu.ro/oficial-interdictia-ca-profesorii-sa-faca-meditatii-cu-elevii-de-la-clasa-a-fost-introdusa-si-in-rofuip-2024/ |
| The chair of the Chamber of Deputies' education committee publicly called for "o hartă interactivă a ONG-urilor active" plus a national platform where schools signal their needs — April 2025 | https://agerpres.ro/comunicate/2025/04/15/comunicat-de-presa---presedintele-comisiei-pentru-invatamant-din-camera-deputatilor-alexandru-mihai---1440778 |

## Policy tailwind and prior art

**The product was asked for in public, by the committee that legislates it.**
On 15 April 2025 Alexandru-Mihai Ghigiu, president of the education committee in the
Chamber of Deputies, issued a press release from a roundtable on school dropout. Among
the measures he proposed, two are this project almost word for word:

Verbatim, from the Agerpres release (re-verified against the release directly, 12 Sept):

- „dezvoltarea unei **hărți interactive cu ONG-urile active în domeniu**"
- „o platformă națională digitală în care școlile să poată semnala nevoile lor specifice,
  **după modelul hartaedu.ro**"

**Quote only those phrases.** Our earlier wording — „o hartă interactivă a ONG-urilor active" —
is a paraphrase and must not appear in quotation marks.

**The platform half names hartaedu.ro as the model, explicitly.** Do not use this release as
blanket validation: a judge can check it in one search. Safe framing — Ghigiu asked for two
things; Narada already built the first (schools signal needs); **nobody built the second**, the
NGO-coverage map, and the legislator named it as a separate item. Concede the platform half out
loud: it costs nothing and buys credibility.

Caveats to state honestly if asked:
- The release announces no figures of its own. It cites an AmCham × University of
  Bucharest report, *Impactul economic al abandonului școlar în România*, without quoting
  numbers. **Get that report before citing any economic-cost figure from it.**
- It is a committee press release, not a law or a funded programme.
- Other measures in the same release: scholarships and vocational counselling, teacher
  training, infrastructure and digitalisation, early-education expansion, multidisciplinary
  teams per school (teacher, counsellor, director, social worker, medical staff), and a
  best-practice guide for local authorities.

**Prior art — hartaedu.ro (Narada).** The release names it as the reference model, so we
will be asked about it. It is a *solution by Narada*, built by Andrei Năstase, developed
by Zitec. Schools publish "alerte" — individual needs (laptops, connectivity, repairs,
sports and reading spaces, supplies) — filterable by county, school cycle, urgency and
category; donors browse and fund them. Homepage counters: ~1,259 alerts, ~296,052 pupils.

How Puntea is different, in one line: **hartaedu.ro is self-reported and inbound-only — it needs
the school to speak first; Puntea works at population level and finds the schools that never file
an alert.** Avoid "supply-driven": hartaedu is demand-driven (schools state demand); what it lacks
is needs assessment. It is also a donor→alert funding funnel, **not a matcher**, so calling it a
competitor overstates the overlap — it is a channel and a plausible first customer. Live counters
(12 Sept 2026): 1,259 alerts · 555 solved · 9,095,170 lei raised, implying ~700 unresolved alerts.
The schools closest to the 8→9 cliff are exactly the ones with nobody to write the alert.
Ours starts from EN results the ministry already publishes, and it matches *programmes*
(World Vision, Teach for Romania, Junior Achievement) to places, not *donations* to items.

Treat Narada as a potential partner, not a competitor — their alert layer is the
"coverage" signal we currently lack, and a school that posts an alert is a warm lead.

**Prior art — Harta IRSE (Asociația Human Catalyst, Nov 2020). The need index is not novel.**
It ranked **4,158 schools (~90% of state units)** on an *Indice de Risc Socio-Educațional* built
from dropout, unqualified teachers, **EN participation and results**, and community
marginalisation — substantially our index, five years earlier. Both `hartairse.humancatalyst.ro`
and `humancatalyst.ro` resolve in DNS but the TLS handshake fails: the sites are dead. Don't state
a specific HTTP status on stage.
**Claiming invention here is the single biggest credibility risk in the deck.** The honest line is
stronger: *"This existed. It worked. It rotted on 2019 data and went offline. We rebuilt it on live
EN data and added the coverage layer it never had."* That also pre-empts "why hasn't anyone done
this".

**The roundtable attendee list is a prospect list, not a funder list.** World Vision, Step by Step,
Teach for Romania, Fundația Regina Maria, Accenture, Fundația Ameropa, Genpact,
**UiPath Foundation**, Fundația Vodafone. These organisations sat in a room about this
exact problem with the legislator who chairs the committee — that makes them *warm prospects*,
and it is a genuinely good targeting signal. It does **not** make them partners, funders or users.
Attendance at a roundtable is all it evidences; say exactly that if asked.

## Partners

- **World Vision România** (anchor). Pregătit pentru liceu: 340 pupils, 91% passed EN. Vreau în clasa a 9-a: 864 pupils, about 83–84% passed the Bac. Pâine și Mâine: about 1,200 pupils. Executive director Mihaela Nabăr. Their weak point is scale, not the model. https://worldvision.ro/wp-content/uploads/2026/05/Raport-anual-WVR-2025.pdf
- **Teach for Romania:** 248 teachers, 172 schools, 30 counties. Pilot channel for a diriginte tool.
- **Junior Achievement, "Mobilitate pentru viitor":** grades 7–8 in Argeș, Dâmbovița, Prahova and Buzău.
- **Salvați Copiii, Fundația Regală Margareta (Centrele Generații), Noi Orizonturi, Concordia, SOS Satele.** County lists are in `app/index.html` (the `NGOS` array).
- **Funders:** Fundația Dacia (funds the World Vision and Junior Achievement transition
  programmes), BRD (co-runs cumstam.ro).

**Evidence tier for every organisation we name — the customer-discovery criterion is judged on
this, and a short honest list beats a wall of logos:**

| Tier | Organisations | What it rests on |
|---|---|---|
| **Sourced from a primary document** | World Vision România | Their own 2025 annual report (URL above): programme names, pupil counts, pass rates, director |
| **Sourced, public programme pages / press** | Teach for Romania · Junior Achievement · Salvați Copiii · Fundația Regală Margareta · Noi Orizonturi · Concordia · SOS Satele | Their own sites and press releases, curated Sept 2026. County lists in `app/index.html` `NGOS`. Absence of a county is not proof of absence |
| **Sourced, but as a funder of *others*, not of us** | Fundația Dacia · BRD (cumstam.ro) | Public programme funding / co-running cumstam.ro. Neither has been approached |
| **Inferred from the Ghigiu roundtable attendee list** | Step by Step · Fundația Regina Maria · Accenture · Fundația Ameropa · Genpact · UiPath Foundation · Fundația Vodafone | Attendance at one roundtable, nothing more. Prospects |
| **Named in research, no relationship** | OMV Petrom | Has a grant fund (`RESEARCH.md` §6). Never contacted |

**Nobody in this table is a committed partner.** The only conversation actually opened is the ATSI
ask in the Outreach log below. If a judge asks "who have you spoken to", the honest answer today is
"one request sent, no reply yet" — say that, and say what we would ask them.

## Data map

| Data | Owner | Grain | Access |
|---|---|---|---|
| EN results per candidate | Ministry → data.gov.ro | candidate + school | CSV 2017–2025 (2026 on evaluare.edu.ro, per-county HTML: `RapoarteJ.aspx?jud=N`) |
| Admission allocation (school of origin → high school) | Ministry | candidate | published every July (HTML) |
| Pupils by level, by locality | INS TEMPO SCL103D | locality | export |
| MATE risk flags (absences >20/month, grades <6.5, repeated years, sanctions) | Ministry, in SIIIR | student | closed. Ask for **aggregate counts per school** (Legea 544/2001, Legea 179/2022) |
| National NGO register | Ministry of Justice → data.gov.ro (2026 dataset exists) | NGO + address + purpose | CSV |
| cumstam.ro | Ecoteca + BRD + mindit.io | county | proprietary; a partner, not a data source |

**Everything below runs on real ministry data.** The EN 2023–2026 files, the 2025–2026 school network, school coordinates, commune budget data and the PNRAS / Masă sănătoasă coverage lists were all downloaded and joined locally: 629k candidate rows → 6,335 schools, of which 4,205 are rural. **Geocoding is 5,877 of all 6,335 — but only 3,960 of the 4,205 rural.** Never put the 5,877 next to a rural count without that denominator. **Since 12 Sept a further 373 schools carry a commune-level position** — taken from another school in the same commune when the 2017 survey has no row for this one — so **6,250 are placed but only 5,877 are geocoded**, and the two words mean different things. It exists because ȘCOALA GIMNAZIALĂ COJASCA, 2nd nationally by need, had no dot on the map; a commune point is good to ~1.7 km (p90 5.6) against a 120 km matching radius, is computed as a median per axis because one source coordinate sits 399 km from its own commune's mean, and is labelled as commune-level everywhere it is shown or measured from. 85 schools still have no position at all. (An earlier draft of this project ran on synthetic data because the Cowork cloud sandbox couldn't reach evaluare.edu.ro or data.gov.ro; that limitation no longer applies.) The only synthetic path left is `synth()` in `app/index.html`, a labelled fallback that appears solely if the baked payload is missing.

## Deliverables in this folder

- `app/index.html`: **Puntea 8→9**, a standalone page that runs entirely in the browser, no build step (published artifact: https://claude.ai/code/artifact/e2fba90c-d5d3-46a5-bc5f-45cfab8dfd28). **It opens on real data** — 6,335 schools are baked in between the `/*DATA:START*/` … `/*DATA:END*/` markers, regenerated with `npm run app`. It contains:
  - an SVG map of the 5,877 geocoded schools (**3,960 of them rural**, which is what the map shows while the default "Rural schools only" filter is on);
  - five ranked lists: most children · most concentrated · money is the constraint · money is not · no one is here;
  - the empirical-Bayes need index, with commune purchasing power as the second axis;
  - curated NGO data and an **NGO matcher** (base, range, proximity↔need slider, shortlist cards) using real school coordinates;
  - drop zones for EN and NGO-register CSVs, which still work and override the baked data.
- `model/need_index.js`: the model that actually runs (Node, `npm run index`); `model/deprivation.js` and `model/coverage.js` for the money and coverage layers; `model/build_app_data.js` to bake the result into the page. `model/need_index.py` and `make_synthetic.py` are the original Python versions — reference only, superseded.
- `source/CivicPTeam1.md`: the team's original hypotheses, personas and interview guide.

## Model

- **Per school:** share of candidates with an EN average below 5, pooled across years.
- **Prior:** Beta(a, b) fitted by method of moments per **county × rural/urban**. Shrunk rate = (fails + a)/(n + a + b), with a p90 or ≈80% band.
- **need_per_year** = shrunk rate × candidates per year.
- **Matcher score** = w·severity_norm + (1−w)·(1 − distance/radius), within the radius, on real
  school coordinates. Schools already covered by another high-relevance programme are skipped —
  that skip is now live against real coverage data (PNRAS eligibility/grant, Masă sănătoasă), not
  a placeholder.
- **Deprivation layer:** budget line 04.02.01 (cote defalcate din impozitul pe venit) per capita
  per UAT, joined on SIRUTA — 3,180 of 3,186 UATs, 4,088 of 4,205 rural schools scored. It feeds
  the *archetype*, not the ranking.
- **Archetype (the routing signal):** four comparisons on the deprivation and fail-rate percentiles
  → money-bound (**349** rural schools) · school-bound (**132**) · volume · invisible · mixed. No
  AI. **Use 349/132, not 286/104** — the shipped `archetype()` cuts at `failPct ≥ 0.75` over a
  percentile computed across all 6,331 ranked schools (rural + urban), then the lists are filtered
  to rural. 286/104 is the same rule at `failPct ≥ 0.8`, which is what `MATCHMAKING.md` §4 still
  documents; both recompute exactly from `out/schools_need_index.csv`, so quote whichever the page
  shows and never both. Also: rural is **4,202** in the ranked base (`need_per_year > 0`), 4,205 by
  raw row count. See
  `MATCHMAKING.md` §4 — and state it as a testable hypothesis, not a proven law.
- **Not in the model:** anything per child. Every figure is a school-level aggregate.

## Where AI actually earns its place

Analysis written 12 Sept, against `MATCHMAKING.md` §2/§6. The spec's rule — **AI reads text and
writes text, arithmetic ranks schools** — is right and this does not change it. What follows is
whether the four jobs specced are the four that earn it. `MATCHMAKING.md` is owned elsewhere; this
is the copy of record for the narrative and the pitch.

### The four specced jobs

| Job | Verdict | Why |
|---|---|---|
| **J1** purpose → capability profile | **Keep — this is the AI product** | 116,342 Romanian legal purpose statements that state a purpose at all (of 125,840 registered; 9,498 state none and are excluded before the keyword test), 30,939 keyword hits with bad precision, boilerplate where *educație* appears in passing. No deterministic method touches it, volume rules out humans, $8 and cached |
| **J2** service geography | **Keep as specced** | Deterministic SIRUTA match first, LLM only where the text *states* an area, same call, no extra cost. "Never widen a service area by inference" is the best AI decision in the spec |
| **J3** match explanation | **Cut, or demote to a button** | Six numbers into a Romanian sentence is a template's job — see below |
| **J4** outreach draft | **Keep — strongest after J1** | Romanian prose per recipient with correct register and real figures. A template reads as mail merge and an NGO notices. The human presses send, so the failure mode is bounded. **Count recipients, not schools:** Călărași rural is 72 schools · 68 with an email · **54 distinct inboxes** · 64 with both email and coordinates → **50 inboxes** for the full pilot flow. J4 groups by inbox and names every unit in one message |

**J1 is undersold as "classification for precision", which is a cleanup job.** What J1 and J2
together do is **manufacture a dataset that exists nowhere**: the register records where NGOs are
*registered*, not where they *operate*, and that layer does not exist (`RESEARCH.md` §4). That is
AI producing the product's input, not decorating its output. Pitch it that way.

**Why J3 is the weak one.** To make it safe the spec commits to a regex numeral post-check, a
template fallback, 30 gold items, atomic-claim faithfulness scoring *and* judge–human calibration —
all to produce prose a template produces deterministically and auditably. It is also the one job
that undercuts the pitch: we tell the ISJ "a formula you can recompute on paper", then generate the
explanation with a model. Template-first, with the LLM behind an "explain more" on a single card,
frees that eval budget for J1. **If J3 stays as specced, say why out loud** — a judge can see the
tension without help.

### The three jobs nobody specced, ranked

1. **Read the scan — DONE, and the result corrected the premise of this recommendation.**
   `data/pnras/elig_r2s2.pdf` (63 pages, 62 characters of extractable text) was read directly with
   a vision model — no tesseract, no OCR pipeline, which was the point. **But the "~900 missing
   schools" figure this job was sold on was a guess, and it was wrong.** 19 of 63 pages were
   transcribed (153 rows, 99.3% resolved to a school) and then deliberately stopped, because the
   sample showed the ministry's three eligibility rounds **overlap ~92%**: only 11 genuinely new
   flags in the sample, one of them inside our worst quartile. Extrapolated, the full scan moves
   "no one is here" by **3–5 schools out of 789 — under 1%**.
   **The job was still worth doing, for a different reason than I gave.** It did not change the
   number; it converted a hedge into a measurement. Say it as `model/README.md` now does: *"one of
   the three ministry lists is a scan; we read a third of it and it is 92% the same schools, so the
   number moves by under one percent."* That is a stronger sentence than 789 ever was with an
   asterisk on it — and note the general lesson, which is that the cheap partial read was worth more
   than the complete one.
2. **NGO programme coverage from unstructured sources — the answer to "why won't this rot?"** The
   `NGOS` array is **nine hand-curated organisations**, "curated September 2026 from their own sites
   and press releases". That is exactly how Harta IRSE died: a hand-built layer nobody re-curated.
   An AI job reading annual reports and press releases to extract *programme → counties → pupil
   counts* turns our most fragile asset into a refreshable one. "Why hasn't anyone done this, and
   why won't it rot" is the deck's biggest credibility question — **this is the only real answer to
   it.** World Vision's 2025 annual report is already a source here and is the test case.
3. **Stage detection deserves its own eval slice.** `stage: running | stated_intent | dormant` is
   inferred by J1 and buried as one field among six. It is the field most likely to produce an
   actively embarrassing output: matching a failing school to an association that stated an intent
   in 2013 and has done nothing since. We correctly refuse to infer `capacity_pupils_per_year` — the
   same seriousness belongs here, with its own recall bar, because a wrong `running` is the costly
   error.

### What must never be AI — and say so unprompted

Ranking, the archetype, distance, anything per child. **Add one explicitly, because a judge will
ask: a chat interface over the data.** A chat box makes an auditable ranking unauditable — it trades
the only property the ISJ cares about for a demo flourish. Refusing it out loud is a stronger answer
than building it.

### The one line for the pitch

> **The register says where 125,840 NGOs are *registered*. Nobody knows where they *work*. We use AI
> to build that layer — then rank with arithmetic you can check on paper.**

That makes AI load-bearing and the ranking auditable in the same breath, which is the combination
the eMAG Data & AI judge is listening for.

## Getting an NGO and a school into the same room

The map ranks. It does not place anyone. This section is the half that turns a shortlist into a
conversation — and it is also where the honest limits of the model live.

### Why we do not ship a "probability of match"

A probability needs outcome data: NGOs recorded as having accepted or declined a school. **There is
none — not in our data, not anywhere public.** So P(match) is not estimable, and a "probability"
that is really a weighted score is the same failure that produced thirteen corrections on 12 Sept:
right arithmetic, wrong label. Except a statistical label is the one a Data & AI judge takes apart.

What we ship instead is a **feasibility score** — spec in `MATCHMAKING.md` — multiplicative across
reach × fit × availability × freshness, so any hard zero kills the match rather than being averaged
away. Every term is observable from public data. **The term we cannot compute is capacity**
(`capacity_pupils_per_year` is deliberately never inferred): an NGO with 20 places and one with
2,000 look identical to us. Say that out loud — it is the honest ceiling on the whole product, and
it is the single best reason to talk to NGOs rather than only model them.

Report **expected children reached** (`need_per_year × feasibility`), not a bare score. It answers
the question the user actually has: *"I have capacity for 20 schools — which 20?"*

### The outreach is also the missing dataset

Every direct contact produces a labelled outcome: sent → opened → replied → accepted. One pilot
county would yield **the first NGO-placement outcome dataset in Romania**. That is the roadmap
answer when a judge asks how this improves: v1 is a feasibility score on public data; v2 is a
calibrated probability fitted on data that does not currently exist. It turns "we cannot compute a
probability" from a weakness into a plan.

**One qualification, and it is not small — this was an overclaim in the first version of this
section.** Replies are **not a random sample**. NGOs that answer differ systematically from those
that do not, and so do schools that attract an answer. A v2 probability fitted naively on reply
data would favour schools resembling those that already got a reply — which is the inbound-only
bias of the tips rule below, re-entering one step removed, through the **calibration set** instead
of through the ranking. So: v2 must model the response process (or state the bias plainly), and
**replies cannot be treated as ground truth**. The path is still the right one; it is an upgrade
with a known defect, not a clean win. Say it that way.

### Direct contact, in priority order

Warm paths beat cold email, and we have real ones:
1. **The Ghigiu roundtable seven** — Step by Step, Regina Maria, Accenture, Ameropa, Genpact,
   UiPath Foundation, Vodafone. They sat in a room about this exact problem with the legislator who
   chairs the committee. Prospects, not partners (see the evidence tiers above).
2. **ATSI / Social Incubator** — the one conversation already opened.
3. **Narada / hartaedu.ro** — a channel and a plausible first customer, never a competitor. **A
   school that has already posted an alert is a warm lead**, and there are ~700 unresolved ones.
4. **ISJ** — the authority that makes an approach legitimate rather than cold.

**Write once per inbox, naming every unit.** Călărași is 72 rural schools · 68 with an email ·
**54 distinct inboxes** (50 among the 64 that also have coordinates). Two mails into one
coordinating school's inbox reads as automated and careless to the one audience that cannot be
allowed to think that.

**On the buyer's calendar — state the date correctly.** Formular 177 (redirecting up to 20% of
corporate profit tax, marginal cost ≈ zero) had a deadline of **25 June 2026, which has passed**.
That is not a problem: CSR officers are planning the *next* cycle now, which is a better moment to
be in the conversation than three weeks before a filing deadline. The live instance is Fundația OMV
Petrom's "Azi. Împreună." fund — 1,500,000 lei, choosing among applicants.

### The landing page — two audiences, two forms, never one

- **NGO side:** *"we work in these counties, this is our capacity."* This fills the one field the
  model refuses to infer. It is the highest-value form on the site and should be the primary call
  to action.
- **Everyone else:** tips about schools in trouble.

### The crowdsourcing trap — read this before building the tips form

Crowdsourced tips are self-reported, inbound-only signal. **That is exactly what hartaedu.ro is,
and exactly what this product exists to correct.** The schools closest to the 8→9 cliff are the
ones with nobody to write the tip. If tips enter the ranking, we rebuild the bias we are
criticising — and the DonorsChoose evidence (funding tracked which teachers had the time and
network to ask, not where need was greatest) becomes an argument against our own product.

**Rule: tips are a separate, visibly labelled layer and never enter the need index.** Their
legitimate uses are:
- **validating the ranking** — does a tip land on a school the index already flagged? That is a
  precision measurement, and a good slide;
- **catching what public data cannot see** — a school that never appears in EN at all;
- **generating warm leads**, which is the point of the page.

Say this on the page and on stage: it converts the most obvious criticism of a tips form into
evidence that we understood the problem. Two hard constraints: **no child-level information in any
tip** (GDPR, and this project's own rule), and tips are never published as a "worst schools" list.

**Three AI jobs live on these two surfaces** — specced as J5–J7 in `MATCHMAKING.md` §6:
- **J5, tip → school.** Resolving *"școala din satul de lângă Zimnicea"* to a `COD SIIIR` across
  6,335 schools is a real language problem. Deterministic SIRUTA match first; only ambiguous tips
  reach the model; an unresolved tip is held for review, never guessed onto a school.
- **J6, the child-data guard — the strongest AI case on the landing page, and a guardrail rather
  than a feature.** A public form is the one surface where our no-child-data commitment can be
  broken by someone else, and no regex catches *"fetița lui Ionescu din clasa a VII-a…"*. It blocks
  before storage, retains nothing, logs counts only, and **fails closed** — if the model is
  unavailable the form refuses free text rather than storing it unchecked. That is the opposite of
  how every other job degrades, deliberately: elsewhere a missing model costs quality, here it
  costs a GDPR breach. Its eval is tuned for **recall over precision**, because a false positive
  annoys one submitter and a false negative puts a child's data in a database. **Say this on stage**
  — the NGO lead on the jury will care about it more than about the matcher.
- **J7, outreach reply triage.** Closed label set over incoming replies, including
  `capacity_mentioned` — the field the model refuses to infer, arriving from the only source that
  can supply it. This is the step that makes the v1→v2 calibration above real rather than
  aspirational.

## Open risks and next steps

**Closed since this summary was first written (12 Sept):** the data join (EN 2023–2026 joined on
`COD SIIIR`, 6,058 agree / 0 differ), geocoding (5,877 of 6,335 schools have real coordinates, so
matcher distances are school-to-school, no longer county-capital to county-capital), and the
coverage joins (**across the 18,022-unit network**: PNRAS eligible 1,201 · grant 733 · Masă
sănătoasă 1,386 — among the 6,335 ranked schools these are 1,154 / 701 / 1,314, and among the
4,205 rural 922 / 555 / 1,136; the three sets are not interchangeable).

Still open:

1. **The blind spot:** EN only sees students who sat the exam. Add INS grade-8 enrolment by locality to estimate the ~9% who vanish before it.
2. **The matcher is specced, not built.** `MATCHMAKING.md` is the spec; the NGO register (125,840 rows) is geocoded but **not classified**. J1 — the purpose classifier — **is written and committed (`model/classify_ngos.js`) but has never been run**: no API key, so `out/ngo_profiles.json` does not exist. `npm run classify` costs a measured **$1.80 for 1,252 organisations and takes ~5 minutes**. This gates the evals criterion, and gates it twice: even a completed run leaves the eval unrunnable, because `out/ngo_gold.csv`'s 120 labels are **Claude-generated against this classifier's own rubric — silver, not gold**, and scoring J1 on them would be two models agreeing with themselves. **The honest statement is that the evals criterion is *unsatisfied*, not merely unevidenced.** What *is* measured without an API call: the name regex it replaces scores macro-F1 **28.7%** against the 80% bar, and reweighting puts **≈148 of the 1,260 displayed candidates (11.7%, 95% interval ≈5–19%)** in genuine education work. Quote the interval, not the macro-F1 — those silver labels were written against our own rubric, which names credit unions and parent associations as negatives, i.e. exactly and only what a name regex cannot see, so the gap is guaranteed by construction rather than measured.
3. ~~**One coverage list is an unreadable scan**, so every "not on the ministry list" count is an upper bound.~~ **Closed 12 Sept.** The scan was read with a vision model, a third of it transcribed and resolved, and the eligibility rounds shown to overlap ~92%. **789 is accurate to about 1%, not an upper bound** — see `model/README.md`, "The scanned list — measured, not guessed". The transcription is deliberately *not* joined into the model, because it covers counties AB–CT only and a partial join would bias early-alphabet counties.
4. **Real voices:** message World Vision's education team ("What limits how many students Vreau în clasa a 9-a can take: money, staff or logistics?"); have a 15-minute call with a Teach for Romania teacher.
5. **Ethics:** no public "worst villages" ranking; show two lists (quick wins / no one is here); no child-level data.
6. **Pitch question:** who opens this map on Monday, and what money moves because of it?

## Outreach log

**Status, stated plainly: one request sent, no reply received, zero interviews conducted.**
Everything below is "sent" or "lining up" — nothing is "spoke to". Do not let this read as a
research programme, and do not let anyone on the team round it up on stage. The fix is cheap and
it is the single highest-value hour left before the pitch: `RESEARCH.md` §6 says one real quote
from the ATSI / Social Incubator call beats that entire document on the customer-discovery
criterion, because **no funder anywhere is on public record saying they struggle to choose where
to intervene** — that is our central premise and it is currently unevidenced by any human voice.

**12 Sept 2026 — asked ATSI (Asociația The Social Incubator) for a 10–15 min call — SENT, no reply
as of writing.** Context given: civic hackathon
at Product Makers, Diana from our group is a mentor there, team theme is abandon școlar.
Pitch as sent: *"un kit de discovery al celor mai vulnerabile comunități, bazat agregat pe
gradul de promovare al școlilor, putere de cumpărare, și alte date publice, pe care să
facem matching cu toate ONG-urile care au proiecte în desfășurare sau vor pe tema
abandonului școlar. O hartă interactivă pt insighturi vizuale, un match making făcut cu AI
bazat pe câțiva parametri."* Also **lining up** 2 people from **Asociația The Social Incubator** — not yet contacted, no call
scheduled.

**Not done, and worth saying we know it:** World Vision's education team (the question in Open
risks #5 — "what limits how many students Vreau în clasa a 9-a can take: money, staff or
logistics?") and the 15-minute Teach for Romania teacher call. Both were identified as the
outreach that matters and neither has been sent.

Both gaps in that pitch are now closed — 12 Sept:

- **"putere de cumpărare" is in the model.** Built as budget line 04.02.01 (cote defalcate din
  impozitul pe venit) per capita, per UAT: 3,180 of 3,186 UATs, 4,088 of 4,205 rural schools
  scored. See `model/deprivation.js` and `model/README.md`.
  **But read the finding before pitching it:** purchasing power explains only ~2.6% of the
  variance in exam failure (r = −0.16). It does not rank severity; it routes the intervention —
  349 rural schools are poor *and* failing (money is the likeliest constraint), 132 fail in
  well-off communes (money probably is not) — at the shipped `failPct ≥ 0.75` threshold; the
  286/104 pair is the same split at ≥ 0.8. Call it "impozit pe venit colectat pe cap de
  locuitor", never "venit mediu".
  **State the routing rule as a testable hypothesis the ISJ can evaluate, not a proven law.**
  Romania's largest school-grant RCT (ROSE, 41,524 pupils, 165 schools) found no significant
  impact and explicitly "no meaningful differences based on grant size, school location, student
  achievement levels, or local economic conditions" — the exact moderator this split assumes.
  Survivable answer: ROSE tested *untied* grants, so it shows money-without-a-mechanism fails
  everywhere, which argues *for* routing the right intervention rather than just the right place.
  See `RESEARCH.md` §3 for both readings and §3.1 for what the evidence says to route *to*.
- **"matching făcut cu AI"** — specced in `MATCHMAKING.md`. The ranking stays deterministic on
  purpose: an ISJ will ask "why this school and not that one", and a formula you can recompute
  on paper is an answer. AI does the four jobs that are genuinely language problems — classifying
  116,342 NGO purpose statements, extracting service geography, explaining a match, drafting the
  email. ~$8 in batch, cached.
  **The NGO count, as settled for the deck — revised 12 Sept:** "**30,939** of the **116,342**
  registered NGOs that state a purpose at all flag as education-related — a keyword match, which
  over-counts." Always our figure, always with the caveat, and never alongside a hartaedu figure.
  State the over-count unprompted: it is the reason J1 classification exists, so the caveat sets up
  the AI half of the pitch instead of undercutting the data half.

  **Mind the denominator.** The register holds 125,840, but 9,498 of those state no purpose in any
  of the six purpose columns and are now excluded before the keyword test (`model/ngos.js`:127,
  punctuation-only counting as blank). So 30,939 is **26.6% of the 116,342 that state a purpose**
  and **24.6% of all 125,840 registered** — both true, different sentences. Say which one you mean.
  This supersedes the earlier deck line "31,080 of 125,840 … 24.7%", and 30,939 / 116,342 / 9,498
  are what the shipped `app/index.html` data block prints today.

Ask The Social Incubator and ATSI the questions the data cannot answer: what makes a
school say yes to a programme, who actually signs off in a rural school, and what killed
the partnerships that failed.
