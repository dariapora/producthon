# Research brief — 12 Sept 2026

Four parallel research passes (problem evidence · intervention evidence · prior art & landscape ·
data sources & evals), reconciled. **Read §1 before touching the deck** — it lists claims the
project currently makes that are wrong or unsafe as worded.

Verification levels: **VERIFIED** = primary source fetched · **REPORTED** = secondary/press only ·
**UNCONFIRMED** = could not establish.

---

## 1. Claims to fix before the pitch

### 1.1 The Ghigiu quote — rewrite it (VERIFIED, fetched directly)

The Agerpres release of 15 Apr 2025 (Alexandru-Mihai Ghigiu, președintele Comisiei pentru
învățământ, Camera Deputaților) says, verbatim:

> „dezvoltarea unei **hărți interactive cu ONG-urile active în domeniu**"
> „o platformă națională digitală în care școlile să poată semnala nevoile lor specifice,
> **după modelul hartaedu.ro**"

Two corrections:

1. Our wording — „o hartă interactivă a ONG-urilor active" — is a paraphrase. **Do not put it in
   quotation marks.** Quote the real phrase or paraphrase openly.
2. **The platform half explicitly endorses hartaedu.ro by name.** Using this slide as validation
   for a hartaedu competitor is a misread any judge can check in one search.

**Safe framing:** Ghigiu asked for two things. Narada already built the first (schools signal
needs). **Nobody built the second** — the NGO-coverage map. That is ours, and the legislator
named it as a separate item. Concede the platform half out loud; it costs nothing and buys
credibility.

### 1.2 "1 in 5 rural children never reach grade 9" — imprecise (VERIFIED)

MEC, *Raport starea învățământului preuniversitar 2024–2025*, Tabel 19: of the rural cohort that
started clasa pregătitoare in 2015/16 (85,259), **19.7% were lost** across the nine years of
compulsory schooling (16.1% abandon + 3.6% repetenți) vs **2.8% urban**. That is cumulative
cohort loss — **not** a grade 8→9 transition rate. They never finish grade 8; that they never
reach grade 9 is implied, not measured.

**Corrected wording:** „Aproape 1 din 5 copii din rural (19,7%) se pierde pe parcursul celor 9 ani
de școală obligatorie, față de 1 din 36 în urban (2,8%)."

**Pre-empt the counter-attack.** The same report publishes **rata de tranziție gimnaziu→secundar
superior = 96,5%** (Tabel 26). A data judge may open with it. The answer: that denominator is
pupils *already enrolled in grade 8*, so it conditions on having survived — it cannot see the
19.7% already gone, and it has no rural/urban split at all. **That missing breakdown is the gap
the index fills.** Have this answer ready; it converts the strongest attack into the thesis.

### 1.3 The ~9% EN gap is structural, not a 2026 deterioration (VERIFIED)

162,616 enrolled in grade 8 → **148,268 registered** for EN 2026 → 143,251 sat it. Gap =
**14,348 = 8.8%**. But EN 2025 had a gap of **16,815 (~9%)**. Pitching 2026 as a worsening is
factually wrong and checkable. **Stable is the stronger claim** — it recurs every June.
Concede unprompted that the gap mixes repetenți, transfers and administrative loss, not pure
dropout.

### 1.4 The need index is not novel — it was built, and it died (VERIFIED as unreachable)

**Harta IRSE** (Asociația Human Catalyst, Nov 2020) ranked **4,158 schools (~90% of state units)**
by an *Indice de Risc Socio-Educațional* built from dropout, unqualified teachers, **Evaluarea
Națională participation and results**, and community marginalisation. That is substantially our
index, five years earlier.

Both `hartairse.humancatalyst.ro` and `humancatalyst.ro` resolve in DNS (104.247.81.99) but the
TLS handshake fails — the sites are dead. (A research pass reported "HTTP 410 Gone"; from here it
is a connection-level failure, not a 410. Either way: unreachable. Don't state a specific status
code on stage.)

**Claiming invention here is the single biggest credibility risk in the deck.** The stronger,
honest line: *"This existed. It worked. It rotted on 2019 data and went offline. We rebuilt it on
live EN data and added the coverage layer it never had."* That also answers "why hasn't anyone
done this" pre-emptively.

**And we can quantify what is new.** Harta IRSE had **no coverage layer**. Ours joins PNRAS
eligible/grant and Masă sănătoasă per school — which is exactly what produced the finding that the
ministry's own risk list catches only 19% of our worst quartile. The rebuild framing is not a
concession; it is the only framing in which that number is legible as an advance.

### 1.5 "Supply-driven vs data-driven" — the labels are backwards

hartaedu.ro is **demand-driven** (schools state demand). What it lacks is *needs assessment*.
Say **"self-reported / inbound-only vs. population-level"**. Also: it is a donor→alert funding
funnel, **not a matcher** — positioning it as a competitor overstates the overlap. It is a
channel and a plausible first customer. Live counters (12 Sep 2026): 1,259 alerts · 555 solved ·
9,095,170 lei raised — implying **~700 unresolved alerts**, a usable stat.

### 1.6 The persona quote was written by us — never put it on a slide ⚠ HIGHEST SEVERITY

`source/CivicPTeam1.md:239` carries this, in quotation marks:

> „Vreau sa ajut elevul, dar nu stiu intotdeauna care este urmatorul pas si unde gasesc sprijinul
> potrivit."

**Nobody said it.** Four lines above, at `:235`, the doc labels itself: *„Proto-persona: profil
construit din ipotezele actuale si date secundare, care urmeaza sa fie validat prin interviuri."*
The quote is our own hypothesis, written in a persona's voice.

In the doc it is labelled and legitimate. **Lifted onto a slide it is indistinguishable from
interview evidence** — and customer discovery is the criterion judged most on honesty, in front of
an NGO lead who has run real interviews. Presenting it as voice-of-customer would be fabricated
evidence.

**`# Interview Outcomes` at `:910` is empty — two blank bullets. Zero interviews have been
conducted.** Anything that reads as a customer quote in this project is therefore, necessarily,
written by us.

**The honest defence, and it holds.** The participant guide lists Friday's *required* deliverables
as problem brief · lista de ipoteze · lista de întrebări de interviu — we have all three.
Interview outcomes, validated hypotheses, personas and north star are listed **optional**, and the
only missing piece is optional. Say *"we completed the required discovery set and spent the weekend
on the data layer"* — accurate, and much better than being caught implying interviews happened.

**PepsiCo — removed 12 Sept (Andrei).** It appeared in no document in this repo, the team doc, or
the research; it had reached the users list from nowhere. Dropped rather than sourced. Recorded
here so nobody reintroduces it from an older draft — **every name in `SUMMARY.md`'s partner table
now carries an evidence tier.**

---

## 2. New ammunition

### 2.1 The cost figure we were missing (VERIFIED — primary PDF found)

**Claims discipline on NGO counts — DECIDED (Andrei, 12 Sept).** The deck uses **our** figure,
always with the caveat attached:

> **31,080 of 125,840 registered NGOs** flag as education-related — a **keyword match, which
> over-counts**. Precision is what J1 classification is for.

Never quote a hartaedu NGO figure alongside it; they count different things. And stating the
over-count unprompted is an asset, not a weakness — it is the reason J1 exists, so the caveat sets
up the AI half of the pitch instead of undercutting the data half.

`SUMMARY.md` said "get that report before citing any economic-cost figure". Found it: AmCham
România × Universitatea din București, *Impactul economic al abandonului școlar*, restated in
AmCham's position paper of 18 Dec 2025 (https://www.amcham.ro/download?file=mediaPool%2FuG0Ns0w.pdf):

- **2.3 bn EUR/year = 0.77% of GDP**
- **~200,000 EUR** less earned over a lifetime per dropout vs a liceu graduate
- ~23,000 pupils lost per cohort per year since 2005

**Do not repeat the "107 miliarde" figure** the way press does — it is a *lifetime cumulative*
across 12 cohorts, not annual. Antena 3 and Digi24 both got this wrong.

### 2.2 The targeting-failure evidence is stronger than we thought

- **Masă caldă (World Bank, first external evaluation, Apr 2025):** the programme ran for years in
  schools with **zero dropout** — 92 schools in the 2019–20 pilot and **200 schools in 2022–23**
  had no recorded dropout. Recommendation: deep revision of objectives. *This is a Romanian,
  recent, government-commissioned proof that untargeted programmes miss.* It is the single best
  slide for "why a coverage map".
- **PNRAS Round I (World Bank, Jun 2025):** 1,402 funded vs 1,255 eligible-unfunded; **634 of
  1,409 (45%)** moved to a lower risk category. Its own recommendation is *more personalised
  targeting by risk category, concentrated on high-risk schools* — literally the product.
- **DonorsChoose (US, ~1.8m requests 2009–2019):** funding tracked *which teachers had the time
  and network to ask*, not where need was greatest; DonorsChoose now runs "Equity Focus Schools"
  weighting to correct it. **The empirical proof that inbound-alert platforms under-serve the
  neediest** — i.e. the case for a data layer on top of hartaedu, without attacking Narada.

### 2.3 The buyer has a calendar (VERIFIED)

Romanian sponsorship mechanism, 2026: profit-tax payers may redirect **up to 20% of corporate
profit tax** (capped 0.75% of turnover) to an NGO — money that otherwise goes to the state, so
marginal cost ≈ zero. Filed on **Formular 177**, deadline **25 June 2026**; procedure amended by
Ordinul ANAF 773/2026. Micro-enterprises excluded.

**That is the buyer thesis:** a CSR officer must place a fixed, use-it-or-lose-it sum by a hard
annual deadline *and justify the choice*. "Where should this go?" is a recurring decision with a
date on it. Fundația OMV Petrom's "Azi. Împreună." fund (1,500,000 lei in grants, choosing among
applicants) is the concrete instance.

### 2.4 The most quotable statistic

> **„Din 100 de copii care intră în clasa pregătitoare la sat, 80 ajung să termine a VIII-a.
> La oraș, 97."** — MEC, Raport 2024–2025, Tabel 19.

Backup: rural PTȘ **23.7%** vs oraș mare **4.6%** (2025) — over **5× the risk**. Romania is first
in the EU at **15.5%** vs EU-27 **9.1%**.

### 2.5 Statistics to avoid

1. **16.8%** — 2024 data, superseded by 15.5% (2025). Quoting it signals stale research.
2. **107 bn EUR** as an annual figure — it is lifetime cumulative.
3. **"Rata abandonului = 1.6%"** next to the 15.5% PTȘ figure — different measures; AmCham warns
   the administrative rate is under-reported because per-capita funding incentivises schools to
   keep non-attending pupils enrolled.
4. **"1 din 5 copii din România"** — press routinely drops „din rural". National is 10.3%.

---

## 3. The honest threat to our premise — read this before pitching the 2.6% finding

Our routing rule (**349** poor+failing → money binds; **132** failing in well-off communes → money
does not) is **theory-consistent but not yet an evidenced causal moderator.**

**Supporting it:**
- **Jensen 2010 (QJE, RCT):** information on returns to education raised perceived returns equally
  across income, but produced **no significant schooling increase among the poorest** — information
  works only once the cash constraint is released. That is a real sequencing rule: Group A needs
  money first, then information; Group B can take information alone.
- Geographic targeting *combined* with school/household indicators reduces both inclusion and
  exclusion error vs proxy-means testing alone (Sabates-Wheeler et al. 2015).

**Challenging it — do not soften this:**
- **ROSE impact evaluation** (IDB/UQAM/Columbia, randomised rollout, **41,524 students, 165
  schools**, grants ~€100,000/school) found **no significant impact** on retention, graduation,
  Bac participation or scores — and critically **"no meaningful differences based on grant size,
  school location, student achievement levels, or local economic conditions."**

That last clause is the exact moderator our 349-vs-132 split assumes, and Romania's largest
school-grant RCT did not find it.

**Two readings, present both if asked:**
1. *Survivable:* ROSE tested **untied grants**, not differentiated interventions. It shows
   money-without-a-mechanism fails everywhere — which argues **for** routing the right
   *intervention*, not just the right *place*. The authors' own explanation agrees: grants failed
   because activities weren't tied to proven practices and accountability.
2. *Real threat:* if economic conditions don't moderate response to a €100k grant, our routing
   rule is assumed, not demonstrated. No study tests intervention-by-poverty interaction at school
   level in Romania.

**Recommended stage framing:** call the routing rule a **testable hypothesis the ISJ can evaluate**,
not a proven law. That is a stronger pitch than overclaiming, it gives the product a roadmap, and
it is exactly the kind of answer an eMAG Data & AI director rewards.

### 3.0.1 Why ROSE is weaker against us than it first looks (added after review)

**The two studies ask different questions.** ROSE asked: *does local economic condition moderate
the response to the **same untied grant**?* Ours asks: *among schools with equally bad outcomes,
does the **binding constraint** differ?* ROSE held the intervention constant and found no
moderation — that is evidence that **money-without-a-mechanism fails everywhere**. It is *not*
evidence that the constraint is the same everywhere. **Lead with Reading A; it is the stronger
one.**

**The two studies also do not measure the same thing.** Our proxy is *declared wage income per
capita* (budget line 04.02.01). It is blind to subsistence farming, remittances and undeclared
work — which biases it **downward hardest in the poorest communes**. ROSE's "local economic
conditions" is a different and probably coarser construct. This is not a rebuttal, but *"the two
studies do not measure the same thing"* is true, defensible, and worth saying.

**The bulletproof fallback if a judge presses hard.** Drop the routing inference entirely and keep
the anomaly:

> **132 rural schools fail badly while sitting in the richest fifth of communes in the country.**

**Say "the national worst quartile", never "our worst quartile".** `failPct` is a percentile over
all 6,331 schools, urban included, so the rural slice is **1,320 of 4,202 = 31%**, not 25%. State
the 31% inline — it is the stronger framing anyway: *nearly a third of rural schools sit in the
national worst quartile.*

That is a fact about public data that demands an explanation, and it is useful for targeting
investigation even if you reject every policy inference drawn from it. **ROSE cannot touch that
claim** — it is an observation, not a moderator hypothesis. Retreat to it and you still have a
product.

### 3.1 What the evidence says to route *to*

| Constraint | Intervention | Strength |
|---|---|---|
| Poverty binds | CCT with **enforced** conditions (enrolment odds +60% vs <20% unconditional); larger effects at secondary | Strong (Campbell SR, 35 studies) |
| Poverty binds | School meals — **enrolment +3.44pp**, but **little/no effect on attendance** | Strong, narrower than advocates claim (Cochrane 2025) |
| Transition point | **Early warning system + follow-up**: dropout at primary→lower-secondary **−1.3pp ITT, −3pp among compliers**, 4,000-school RCT on existing staff | Strong RCT, *directly on our transition point* |
| Either | **Information on returns**: +0.20–0.35 years schooling; **0.23 extra years per $100** — J-PAL's most cost-effective category, GEEAP's only "Great Buy" | Strong RCT |
| Poverty does NOT bind | **School management quality**: +1 SD management → **+0.24 SD** test scores; principals are a small trainable group | Strong correlational |
| Poverty does NOT bind | **Teacher turnover**: disruptive beyond the change in teacher-quality distribution. PNRAS Round I found improvement in **teacher stability** — live mechanism in our setting | Strong quasi-experimental |
| — | **GEEAP "Bad Buy": hardware/inputs without teacher training or better management** — the failure mode for Group B | Strong |

**Parental migration — counterintuitive, and it changes the routing.** ~536,000 children (~14%)
have a parent abroad (~184,000 both), vs only ~53,000 officially recorded — a ~10× administrative
blind spot that is itself a targeting argument. But Botezat & Pfeiffer (IV + bivariate probit) find
left-behind children in Romania get **higher** grades, while being significantly more likely to be
depressed and in poor health. **Parental migration is a psychosocial risk, not an attainment
risk — route these schools to counselling and mentoring, never to cash or meals.**

**Unevidenced, say so honestly:** transport/boarding; school meals for attendance or dropout; ZEP;
Școala după școală; and every named Romanian NGO programme (World Vision, Teach for Romania, REF)
— no rigorous impact evaluation found for any. Say "unevidenced", never "ineffective". Also: all
Masă sănătoasă attendance/grade improvement figures in circulation are **self-reported school
survey data, not evaluation.** Do not cite them as impact.

---

## 4. Data we can still add before the deadline

Ranked by value per hour. Everything below joins to keys we already have.

1. **RPL 2021, Tabel 2.02.2 — population by ethnicity per commune** → **Roma population share per
   UAT**. One XLSX, joins on SIRUTA, and it is the strongest single explanatory variable currently
   missing from the index.
   https://www.recensamantromania.ro/wp-content/uploads/2023/06/Tabel-2.02.1-si-Tabel-2.02.2.xlsx
2. **INS TEMPO SCL103D** — populația școlară by locality; this is the enrolment-vs-EN gap
   (`PROGRESS.md` next-task #4). Joins on SIRUTA. Caveat: level totals per locality, not per-grade
   per-school.
3. **EN 2014–2022 back-series on data.gov.ro** — extends the panel to ~12 years, enabling a
   **trajectory** term (schools getting worse) rather than a level. Expect fuzzy joins pre-2018.

**Out of scope before tomorrow:** commune-level education/deprivation microdata (formal request);
NUTS-3 education from Eurostat (only NUTS-2 exists — 8 regions, too coarse); SIIIR Cartografie
scraping; 42 separate ISJ sites.

**Name MATE on the slide, don't compete with it.** The ministry's per-pupil early-warning
mechanism exists and is statutory under Legea 198/2023, but is not public. Our index is the
**public-data proxy for MATE** — and the 19% overlap finding *is* the MATE-coverage argument.

### 4.1 Narada's alerts are joinable by coordinates (established 12 Sept)

Two hartaedu alert pages, fetched by hand from their public sitemap — **not scraped**. Every alert
carries a schema.org `LocalBusiness` block with `name` (the school in plain text), `address`, and
**`geo` GeoCoordinates**, plus telephone and email. No SIIIR, no SIRUTA, no CUI.

**That is better than a shared key.** We hold real coordinates for 5,877 of 6,335 schools, so a
spatial join at a few hundred metres, confirmed against the school name, **survives renamed and
merged schools — which SIIIR does not**. `coverage.js` already does the name half at 95–97%
against ministry lists.

So the Narada conversation changes shape: not *"do you have a joinable identifier"* (effectively
yes, via geo) but *"may we use it, and can you give us the ~700 unresolved alerts in bulk rather
than a thousand page fetches"*. A permission and goodwill ask, not a technical one — and we can
show working join code instead of requesting a spec. Say plainly that we did not scrape.

**Caveat for stage:** two pages is not a survey. Say *"the alert pages we looked at expose
coordinates"*, never *"their data model has coordinates"*.

**Note:** the Registrul Național ONG portal was relaunched by the Ministry of Justice on
**11 Sep 2026** — the day before the hackathon. It records where NGOs are *registered*, not where
programmes *operate*. **That operating-location layer does not exist anywhere.** It is the real
defensible novelty — more so than the need index (§1.4).

---

## 5. Evals — the plan for the weakest criterion

Executable in 3–4 hours; nothing here needs the matcher to be finished except J1.

1. **Freeze the label taxonomy first (20 min).** 8–12 closed labels (educație remedială,
   after-school, transport, hrană, consiliere psihologică, mediere școlară/romi, burse, formare
   profesori, altele/necalificabil). Most J1 disagreement is definition drift, not model error.
2. **Gold set: 120 for J1, 60 for J2, 30 each for J3/J4 (60 min).** At n=120 and ~0.85 accuracy the
   Wilson 95% CI is ≈±6pp — enough to claim "above 0.8", not enough to rank two prompts a point
   apart. **Say that on the slide.** Stratify: 60 random (honest headline), 30 oversampled rare
   classes, 30 adversarial. Report strata separately.
3. **Inter-annotator agreement (30 min) — the cheapest credibility available.** Two of us label the
   same 40 J1 rows independently; report **Cohen's κ** per label. κ≥0.6 usable; <0.4 means the
   taxonomy is broken. State plainly: **model accuracy cannot exceed human agreement.** That line
   shows you know the ceiling is the label, not the model.
4. **Metrics.** J1: per-class precision/recall/F1 and **macro-F1**, never accuracy (heavily
   imbalanced — *altele* would flatter it). Show a **4×4 confusion matrix of only the classes that
   change a match**; the costly error is a false negative on *mediere romi* or *educație remedială*
   (school gets no match). J2: exact-match on județ set, reported separately for national-scope
   NGOs (the common failure). J3: **faithfulness** — decompose each explanation into atomic claims,
   mark supported/unsupported/contradicted, report **hallucination rate**; target 0 contradicted on
   30, reported as "0/30, 95% upper bound ≈10%", not "no hallucinations". J4: 4 binary code-gradeable
   checks (correct school+județ, no invented statistic, no invented commitment on the NGO's behalf,
   has a concrete ask) + 1–5 tone.
5. **Adversarial stratum must include:** near-duplicate purpose statements (the register is full of
   copy-pasted statutes — **dedupe by normalised 5-gram hash before sampling**, or the gold set
   silently measures one sentence fifteen times; report the dedup count, it is a good slide
   detail); boilerplate that must map to *altele* rather than be force-fit (**measure abstention
   rate and abstention precision** — refusing to guess is correct behaviour for a system that
   emails real people); diacritic-stripped and ALL-CAPS Romanian; and OOD orgs (sports clubs,
   church foundations, vânătoare/pescuit) that must not classify as education.
6. **LLM-as-judge, honestly (45 min).** Judge only J3 faithfulness and J4 tone, never as sole
   evidence. Mitigate: score **pointwise against a rubric** (removes position bias entirely), use a
   **different model to judge than to generate**, **one dimension per call**, and
   **calibrate the judge against our humans on the 30 hand-scored items, reporting judge–human κ**.
   That calibration number is the most senior-looking thing on the slide.
7. **Reproducible:** `evals/gold.jsonl` (input, gold label, annotator, stratum), `run_eval.js`,
   `results.md`. Model/temp/prompt-version in the filename; keep the prior run to show a delta.
8. **Cost:** ~300 items × ~2 calls ≈ well under $1. Say it — it pre-empts "could you run this
   nightly?" with "yes, for cents".

**The slide:** scope line ("the matcher is deterministic; four narrow LLM jobs are evaluated here")
· the metrics table · one 4×4 confusion matrix · **two large credibility numbers (inter-annotator κ,
judge–human agreement)** · a one-line limits box ("n=120 → ±6pp at 95%; stratified, not random;
boilerplate abstention is intentional"). Stating the CI unprompted is what separates a team that
ran an eval from a team that ran a demo.

---

## 5.1 A reproducibility bug worth mentioning on stage

Found and fixed 12 Sept, during the cross-document sweep. Three faults made the app and the model
report **different archetype counts from the same data**: the model used `failPct >= 0.8` where the
app used `>= 0.75`; the model applied a `present >= 10` filter to the list counts that belongs only
on the correlation; and **the exported CSV wrote `deprivation_score` and `fail_rate_shrunk` at 3
decimals**, which is fatal because those columns are compared against hard thresholds downstream —
rounding flipped schools across archetype boundaries, so anyone recomputing from our published CSV
got different counts than our own printed report.

Both now round at assignment and export at 6dp; model and app agree exactly.

**Why say this out loud:** the panel includes a Senior Director of Data & AI. "We found our own
published CSV was not reproducible against our own report, and here is the cause" is a stronger
signal of rigour than any number in the deck. It is also the honest reason the archetype figures
changed between Saturday and Sunday.

**Canonical numbers — these replace every earlier figure:**

| Figure | Value | Was |
|---|---|---|
| Rural schools with a ranked index | **4,202** (of 4,205; 3 have no valid EN candidates) | — |
| Rural in the national worst quartile | **1,320** = 31% of rural | "1,258 / worst quartile" |
| Money-bound (worst quartile + poorest fifth) | **349** | 286 |
| School-bound (worst quartile + richest fifth) | **132** | 104 |
| No one is here | **789** — measured, not an upper bound (see below) | 737 |
| Quick wins | **106** | 104 |
| Ministry flagged in that quartile | **248 = 19%** | 19% — survives |
| Rural on the ministry list | **922**, mean percentile **58** | 913 / 58 |
| Correlation | r = −0.161, r² = **0.026**, over 3,969 rural schools with ≥10 candidates | unchanged |

### 5.1.1 Data-quality caveats on the demo school (Cojasca)

Verified against `out/schools_need_index.csv`, 12 Sept:

- **Quote both rates or a judge will catch you.** Școala Gimnazială Cojasca is **71% pooled
  2023–2026**, but **51% in 2026 alone** (72 pupils present). The 2026 file is the one a curious
  judge opens. Say "71% netezit 2023–2026, 51% în 2026" — showing the smoothing openly is
  stronger than hiding it. Even at 51% it is far above the 39.7% Dâmbovița rural prior, and the 38
  children a year is the number that matters.
- **It has no coordinates** — one of 458 ungeocoded schools. Fine as an illustration; never tie it
  to the map, a distance, or the matcher, or it silently falls back to the county seat.
- **The two Cojasca units have swapped emails in the ministry file.** Școala Gimnazială Cojasca
  (locality COJASCA) carries `fantaneles@…`; Liceul Tehnologic Cojasca (locality
  FÂNTÂNELE) carries `cojasca@…`. **Never render a real address in a J4 outreach demo on
  this school** — use a redacted placeholder on stage.
- **The commune is the better story than the school.** UAT Cojasca, 9,406 people: *two* schools in
  the national worst 4% — the gimnaziu at 71% pooled / media 4,15, and Liceul Tehnologic Cojasca at
  87% / media 3,42 — and **not one programme between them**, no grant, no meal, not even on the
  eligibility list.

### 5.2 The worst quartile splits three ways — use these labels, not the obvious ones

The intuitive split ("on the ministry list" vs "has a programme" vs "nothing") **double-counts**:
248 schools in the quartile are on the eligibility list, but **183 of them already have a grant or
a meal**. A bar labelled that way answers two judge questions wrongly — *"so the 248 are the
unserved ones?"* (no, 183 are served) and *"so only 283 get help?"* (no, 466 do).

Mutually exclusive, exhaustive, verified against `out/schools_need_index.csv`:

| Inside the 1,320 | Count | Share |
|---|---|---|
| Nothing at all — no grant, no meal, not on the list | **789** | 59.8% |
| Already has a grant or a meal | **466** | 35.3% |
| **On the ministry's own list, and nothing arrived** | **65** | 4.9% |

**854 schools — 65% of the national worst quartile — receive nothing.**

**The 65 is the sharpest number in the deck.** It indicts the targeting rather than merely
describing need: there the state identified the problem correctly and the help still did not come.
That is the World Bank's Masă caldă finding (§2.2) in miniature, on our own data. And reading the
remaining scan pages can only move schools *out of* 789 and *into* 65 — so the argument
strengthens as the data improves, which is a good thing to be able to say out loud.

**The scan is no longer a hedge — it is an error bar.** `elig_r2s2.pdf` was read by vision for
19 of 63 pages (153 rows): 152 resolved to a school (**99.3%** — 142 exact by SIIIR, 10 repaired
by name + locality), and **134 of 145 were already on the lists we could read: 92% overlap**. Only
11 new eligibility flags, of which **1** falls in the worst-quartile set. Extrapolated to all 63
pages that is ~35 new flags nationally and **3–5 schools off 789 — under 1%**.

Say: *"one of the three ministry lists is a scan; we read a third of it and it is 92% the same
schools, so the number moves by under one percent."* That is stronger than the old hedge **and**
stronger than claiming completeness, because it is a measured bound rather than an assertion.

⚠ **If anyone repeats the method:** raw vision misread **1 digit in 7** codes on the first page
tested. Vision output is not trustworthy at 10-digit precision; *validated* vision output is. Every
code must go through the school-network check with name + locality repair — that is what turns ~86%
raw into 99.3%. The partial transcription is deliberately **not** wired into the model: joining
counties AB–CT only would make the alphabet's first half look better covered than the rest.

The old `104` collision (school-bound vs quick wins) is **gone** — those are now 132 and 106. The
two still print a few lines apart in the model's output, so keep the "different set" label.

---

## 6. Still missing — worth one phone call

**No funder was found publicly stating they struggle to choose where to intervene.** Do not
fabricate one. The substitutes are the Formular 177 deadline (§2.3), the OMV Petrom grant fund, and
hartaedu's ~700 unresolved alerts. **One real quote from the ATSI / Social Incubator call before
tomorrow beats this entire document on the customer-discovery criterion.**
