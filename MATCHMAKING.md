# AI matchmaking — specification

Status: spec, not yet built. Written 12 Sept 2026.
Companion to `model/README.md` (the need index and the deprivation layer, both already running).

---

## 1. The decision this serves

One question, asked by one of two people:

> **An NGO programme lead** has capacity for 20 more schools next year. Which 20, and why those?
> **A CSR funder** has 400,000 lei. Which county, which programme, and what changes because of it?

Everything below exists to answer that with named schools, real contacts and a defensible reason.
It is *not* a dropout-prediction model, and it never scores a child.

---

## 2. The honest split: what is deterministic, what is AI

This is the most important section. Get it wrong and the product becomes unauditable, which kills it
with the only authority that matters (the ISJ).

| Layer | Method | Why |
|---|---|---|
| Need index per school | Empirical Bayes over EN results | Already built. Reproducible, defensible, recomputable by anyone with the same files |
| Deprivation per UAT | Budget line 04.02.01 per capita | Already built. Arithmetic on a published file |
| Constraint archetype | Thresholds on the two above | Derivable. No model needed — see §4 |
| Candidate filtering + ranking | Weighted score, fixed formula | **Must stay deterministic.** An ISJ will ask "why this school and not that one". A number you can recompute on paper is an answer; an LLM ranking is not |
| NGO purpose → capability profile | **LLM**, batch, cached | 125,840 free-text Romanian purpose statements. Genuinely a language problem |
| NGO service geography | **LLM**, batch, cached | Registered address ≠ where they work |
| Match explanation | **LLM**, on demand | Turning six numbers into a sentence a human will act on |
| Outreach email draft | **LLM**, on demand | Romanian, per school, naming real figures |

**The rule: AI reads text and writes text. Arithmetic ranks schools.** Say "weighted matching on
public data" in the pitch, and reserve the word AI for the jobs in §6, which genuinely are.

And be precise about what J1+J2 actually do: they are not a precision cleanup on a keyword filter.
**The register records where 125,840 NGOs are *registered*, not where they *work*.** That layer
does not exist anywhere — so AI here manufactures the product's input, it does not decorate its
output. One line for the pitch:

> *"The register says where 125,840 NGOs are registered. Nobody knows where they work. We use AI
> to build that layer — then rank with arithmetic you can check on paper."*

---

## 3. School need vector

Straight from `out/schools_need_index_rural.csv`, all columns already produced:

| Field | Meaning | Used for |
|---|---|---|
| `fail_rate_shrunk` | Share below 5, smoothed | Severity |
| `need_per_year` | Expected pupils below 5 per year | Volume — favours large schools |
| `rank_rate` | Concentration rank | "No one is here" list |
| `deprivation_score` | 0 richest UAT → 1 poorest | Money constraint |
| `equalization_per_capita` | State top-up per head | Fiscal dependence of the commune |
| `absent_rate` | Registered but did not sit EN | The pupils who vanish before the exam |
| `lat` / `lon` | Real school coordinates (5,877 of 6,335) | Distance, replacing county-capital hops |
| `email` / `phone` | Contact (6,037 with an email) | Operational reachability |
| `inbox` / `inbox_schools` | Normalised address + how many schools share it | **Grouping key for outreach.** 879 addresses are shared by 1,956 schools — a coordinating school and its *structuri arondate* under one administration. Not dirty data; real structure |
| `coverage_programmes` | Who is already there | Gap detection. **Built.** Careful with the denominators: `coverage.js` matches 1,201 eligible / 733 grants / 1,386 meals across the **18,022-unit network**; of the **6,335 ranked schools** that is 1,154 / 701 / 1,314, and of the **4,205 rural** ones, 555 have a grant, 1,136 a meal, **1,459 either** |

---

## 4. Constraint archetype — the product idea

The deprivation layer produced a finding that shapes the whole matcher (full numbers in
`model/README.md`): **commune purchasing power explains only ~2.6% of the variance in exam
failure** (r = −0.16 across the 3,969 rural schools with ≥10 candidates). Poverty does not rank severity.

What it *does* do is say **which intervention can possibly work**. That is the routing signal:

| Archetype | Rule | Sensible match |
|---|---|---|
| **Money-bound** | `deprivation ≥ 0.8` **and** `failPct ≥ 0.75` | Conditional cash with *enforced* conditions (strongest evidence). Meals move enrolment ~3pp, not attendance. **Not** transport or boarding — unevidenced, see below. **349 rural schools** |
| **School-bound** | `deprivation ≤ 0.2` **and** `failPct ≥ 0.75` | School management (+1 SD ≈ +0.24 SD scores) and teacher stability. Equipment without teacher training is the documented failure mode. **132 rural schools** |
| **Volume** | `need_per_year` top decile | Programmes that scale, not boutique pilots |
| **Invisible** | high `absent_rate` | Nobody sat the exam. Outreach and re-enrolment, before any academic programme |
| **Mixed** | everything else | Rank by `priority_score`, no strong prior |

`failPct` is a percentile over **all** schools, urban included — so "worst quartile" means the
national worst quartile, which is **31% of rural schools**, not 25%. Say "national worst quartile"
or state the denominator; a judge will divide 1,320 by 4,202.

The archetype is computed with four comparisons. It is the highest-value part of the matcher and
it uses no AI at all.

**Status of this rule: testable hypothesis, not established causality.** It is theory-consistent
(Jensen 2010 found information raised perceived returns equally across income but produced no
significant schooling gain among the poorest — money first, then information), but the ROSE
impact evaluation (41,524 students, 165 schools, ~€100k/school) found no significant impact and
**"no meaningful differences based on grant size, school location, student achievement levels, or
local economic conditions"** — the exact moderator this table assumes. ROSE tested *untied* grants,
so the survivable reading is that money-without-a-mechanism fails everywhere, which argues for
routing the *intervention* rather than only the place. Present it as a rule the ISJ can evaluate.
`RESEARCH.md` §3.1 has the evidence strength per intervention; note in particular that transport,
boarding, ZEP, Școala după școală and every named Romanian NGO programme are **unevidenced** (say
"unevidenced", never "ineffective"), school meals move enrolment (+3.44pp) but not attendance, and
schools with parents abroad are a **psychosocial** risk — route them to counselling, never cash.

Worked example, rank 1 by `need_per_year`: **Școala Gimnazială Nr. 1 Ștefăneștii de Jos (Ilfov)** —
4,364 lei/capita income tax (richest 0.2% of UATs), 71% shrunk fail rate. **School-bound.** Sending
a scholarship programme there would miss the problem entirely. That single row is the demo.

---

## 5. NGO capability profile

Target schema, one record per organisation, built once and cached:

```jsonc
{
  "cui": "1039/A/2023",            // Numar inreg Reg National — the stable key
  "name": "ASOCIAȚIA ...",
  "county": "CONSTANTA",           // registered seat, from the register
  "locality": "CONSTANTA",
  "lat": 44.17, "lon": 28.63,      // geocoded from Adresa (§6, J2)

  "education_relevant": true,      // J1
  "confidence": 0.86,              // J1
  "evidence": "sprijinirea elevilor din mediul rural în tranziția către liceu",

  "programme_types": ["mentoring", "scholarship", "remedial"],  // J1, fixed taxonomy
  "age_bands": ["gimnaziu", "liceu"],                           // J1
  "service_area": {"type": "counties", "values": ["CT", "TL"]}, // J2
  "stage": "running",              // running | stated_intent | dormant — see §9.3, own recall bar

  "capacity_pupils_per_year": null, // NEVER inferred — only from a partner conversation
  "source": "Registrul National ONG 2026, Scopul initial"
}
```

`programme_types` taxonomy, fixed and closed (an open taxonomy makes the matcher unscorable):
`mentoring`, `tutoring_remedial`, `scholarship_cash`, `transport`, `meals`, `career_guidance`,
`dual_vocational`, `parent_family`, `school_infrastructure`, `teacher_training`,
`roma_inclusion`, `special_needs`, `after_school`, `other`.

### Why this needs a model rather than the current regex

`app/index.html` currently filters the register with
`/educa|scoal|elev|abandon|invatam|meditat|after school|tutor/`. Measured against the real file:

- register: **125,840 organisations**, 9,459 with no purpose text at all
- regex matches: **31,080 (24.7%)** — the figure the page itself shows

Nearly a quarter of every NGO in Romania is not an education NGO. The regex is firing on boilerplate
purpose statements that mention *educație* in passing ("educarea publicului", "activități
educative" appended to a sports club's charter). Sending an outreach email to those wastes the
recipient's time, which is the one cost this product cannot afford. **Precision is the metric.**

---

## 6. The AI jobs

Shared rules: **no child-level data ever enters a prompt** — school-level aggregates only.
**J6 is the single deliberate exception**: it exists to read text that might contain child data
precisely so that data is never stored, and it is the only job permitted to see it. Everything else: every
output is cached to disk keyed by `cui` so a rerun costs nothing; every job degrades to a
deterministic fallback (§8).

### J1 — Purpose → capability profile *(batch, offline)*

- **Input:** `Denumire`, `Judet`, `Localitate`, and `Scopul initial` + `Modificari ale scopului 1..5`
  concatenated. Mean 759 chars for the prefiltered set.
- **Output:** the `education_relevant`, `confidence`, `evidence`, `programme_types`, `age_bands`,
  `stage` fields above, via `output_config: {format: {...}}` with a strict JSON schema.
- **`evidence` must be a verbatim span from the input.** It is the groundedness check and the thing
  a human reviewer reads first. Reject any response whose evidence string is not a substring.
- **Model:** `claude-haiku-4-5`. A deliberate cheap-worker choice for bulk extraction against a
  fixed taxonomy — no thinking, `max_tokens: 256`. Escalate to `claude-sonnet-5` only for rows
  where Haiku returns `confidence < 0.6`.
- **Surface:** Message Batches (`client.messages.batches.create`), 50% cheaper, results keyed by
  `custom_id = cui`. Results arrive in **any order** — key by `custom_id`, never position.
- **Prefilter first.** Run the regex as a *recall* filter (cheap, keep it generous), then let the
  model do precision. Running the model on all 125,840 costs ~3× more for no gain.

**Measured cost** (chars/3.5 ≈ tokens, ~60 output tokens/record, current list prices):

| Scope | Model | Est. cost | With Batch API |
|---|---|---|---|
| Prefiltered (31,080) | Haiku 4.5 | ~$16 | **~$8** |
| Prefiltered (31,080) | Sonnet 5 | ~$32 | ~$16 |
| All 125,840 | Haiku 4.5 | ~$52 | ~$26 |

Eight dollars, once, cached. Cost is not the constraint here — precision is.

### J2 — Service geography *(batch, offline)*

Registered address is the lawyer's office as often as the programme's. Two steps:

1. Geocode `Adresa` + `Localitate` + `Judet` deterministically against the SIRUTA nomenclator we
   already load in `deprivation.js` — no model, exact locality-name match first.
2. Only where the purpose text *states* a service area ("în județele Vaslui și Iași", "la nivel
   național", "în comuna X"), extract it with the same J1 call — one more field, no extra request.

Default when nothing is stated: seat county only, `confidence: low`. **Never widen a service area
by inference.** A wrongly widened radius produces confident recommendations to organisations that
do not work there.

### J3 — Match explanation *(template first; LLM only on request)*

**Demoted deliberately.** Turning six numbers into a Romanian sentence is a template's job, and it
is the one LLM call that undercuts the pitch: we tell the ISJ "a formula you can recompute on
paper", then generate the explanation with a model. Ship the template as the default, put the LLM
behind an "explică mai mult" control on a single card, and move the freed eval budget to J1's rare
-class and adversarial strata. Consequence for §9.4: judge–human κ then rests on J4 tone alone —
say so on the eval slide rather than implying two judged dimensions.

- **Input:** one school row + one NGO profile + the computed score components. Nothing else.
- **Output:** 2 sentences, Romanian, naming the archetype and the single strongest reason.
- **Model:** `claude-opus-5`, `thinking: {type: "adaptive"}`, `output_config: {effort: "low"}`.
- **Hard constraint:** every number in the output must appear in the input. Post-check it by
  regex-extracting numerals from the output and asserting each is present in the input payload.
  Fail closed to the template (§8) rather than ship an invented figure.

### J3b — NGO programme coverage from annual reports *(batch, offline)* — **the answer to "why won't this rot?"**

The `NGOS` array in `app/index.html` is nine organisations hand-curated in September 2026 from
their own sites and press releases. That is exactly how Harta IRSE died (`RESEARCH.md` §1.4): a
hand-built layer nobody re-curated. This job reads NGO annual reports and press releases and
extracts programme → counties → pupils reached, turning the most fragile asset in the product into
a refreshable one.

- **Input:** a report PDF or press page. **Output:** `{programme, counties[], pupils, year, quote}`
  where `quote` is a verbatim span, same groundedness rule as J1.
- **Test case:** World Vision's 2025 annual report, already cited in `SUMMARY.md` — we know the
  right answer (Pregătit pentru liceu 340 pupils, 91% EN pass; Vreau în clasa a 9-a 864).
- Without this, the deck has no answer to "why hasn't anyone done this, and why won't yours rot".

### J4 — Outreach draft *(on demand)*

**Group by inbox before drafting, never by school.** 1,956 of the 6,037 schools with an address
share it with another school. A six-school shortlist can collapse to four recipients — the default
Călărași view already does 6 → 5. Drafting per school sends the same person three mails, each
opening as if we had never heard of them, which is the fastest way to look automated to the one
audience that cannot afford to think that.

The better behaviour is not deduplication but **aggregation**: one message naming every unit on
that inbox — *"Școala Gimnazială Nr.1 Frumușani și Școala Primară Nr.2 Orăști"* — which also shows
we understand how rural school administration is actually organised. In front of an ISJ that is
itself a point.

- **Input:** the inbox group (one or more school rows), NGO profile (or funder), archetype, ISJ framing.
- **Output:** a Romanian email — subject, 120–160 words, one concrete ask, real figures.
- **Model:** `claude-opus-5`, adaptive thinking, `effort: "medium"`.
- **Never sends.** Renders into a copyable box; the human presses send. The Călărași pilot
  (72 rural schools · 68 with an email · 68 geocoded · **64 with both** → **50 distinct inboxes**; the two 68s are different sets) simulates the send — see `CLAUDE.md` task 5.

---


### J5 — Tip → school *(on demand, at submit time)*

A tips form receives free text: *"școala din satul de lângă Zimnicea, cea cu geamuri sparte"*.
Resolving that to a `COD SIIIR` across 6,335 schools is genuinely a language problem — colloquial
references, diacritic-stripped and ALL-CAPS input, village vs. commune confusion, a locality name
that appears in four counties. No deterministic matcher handles it, and the SIRUTA nomenclator we
already load is the candidate list.

- **Input:** the tip text + the submitter's county if given. **Output:**
  `{siiir, confidence, evidence, alternatives[]}`.
- **Deterministic first:** exact and normalised locality-name match against SIRUTA, as J2 step 1.
  Only unresolved or ambiguous tips reach the model.
- **`evidence` must be a verbatim span** from the tip, as in J1.
- **Never auto-accept below high confidence.** An unresolved tip is held for review, not guessed
  onto a school. A tip attached to the wrong school is worse than an unattached tip.
- **Output is a tip record, never a field on the school** (§8b: tips are a layer, never an input).

### J6 — Child-data guard *(on demand, blocking, before storage)*

**A guardrail, not a feature — and the strongest AI case on the landing page.** §8 commits that AI
never sees a child's name, grade or per-candidate row. A public tips form is the one surface where
someone else can break that commitment, and a regex cannot catch *"fetița lui Ionescu din clasa a
VII-a e însărcinată și nu mai vine la școală"*.

- **Runs before the tip is written to storage and blocks on detection** — not a post-hoc scan. The
  tip is rejected with an explanation and the text is **not retained**.
- **Output:** `{contains_personal_data, category, evidence_span}` — named minor · identifying
  description · health or pregnancy · family circumstance tied to an individual.
- **Fail closed.** If the API is unavailable the form rejects free text rather than storing it
  unchecked. This deliberately inverts §8's degradation rule: everywhere else a missing model costs
  quality, here it costs a GDPR breach.
- **Log the block, not the content.** Counts only, so we can report "N tips rejected" while keeping
  none of it.

> **State the limitation with the feature, or it becomes a false claim.** The guard stops child
> data being **stored**; it does not stop it being **transmitted**, because checking the text means
> sending it to the model provider first. That is a processing step needing a lawful basis, a DPA,
> and a line on the form itself. Say "rejected before storage, never retained" — never "child data
> never leaves your browser". An NGO lead on the jury is exactly the person who will ask, and
> answering it before they do is worth more than the feature.
>
> Reduce the exposure rather than hide it: keep a cheap client-side pre-screen (CNP patterns, "clasa
> a N-a" + a capitalised given name) that rejects the obvious cases **without any transmission**,
> and send only what survives.

### J7 — Outreach reply triage *(batch, as replies arrive)* — closes the calibration loop

Once J4 mail goes out, replies arrive as Romanian free text. Classifying them is the
**outcome-labelling step** that turns §7b's feasibility score into a calibrated probability: it is
how the dataset that does not exist starts existing.

- **Closed label set:** `interested` · `not_this_year` · `wrong_school` · `already_working_there` ·
  `not_our_field` · `refused` · `unclear`. Plus `capacity_mentioned` when a reply states a number —
  the field §5 refuses to infer, arriving from the only source that can legitimately supply it.
- **Output per reply:** `{label, confidence, capacity_pupils_per_year?, evidence}`.
- **Feeds `out/outcomes.jsonl`**, keyed by `(siiir, cui)`.
- **Never auto-replies.** Triage only; a human answers.
- **Abstain rather than guess:** `unclear` is correct behaviour, and abstention precision is the
  metric — as with J1's boilerplate handling in §9.3.

> **Selection bias, to be named before v2 is fitted.** NGOs that reply are not a random sample of
> NGOs, and schools that get replies are not a random sample of schools. A probability calibrated
> on this data will favour schools resembling those that already attracted a reply — which is the
> inbound-only bias of §8b re-entering through the back door, one step removed. v2 must model the
> response process or state the bias; it cannot quietly treat replies as ground truth.


### J8 — Collaboration packet *(on demand)* — Andrei's ask, 12 Sept

A director (or an NGO) clicks **"contact this NGO" / "contact this school"** and the system
pre-fills the paperwork: a collaboration request, a short school brief, the identified problem, the
pupils affected, and a proposed objective. The NGO accepts; the director names the diriginți who
will run it.

**Why this is the strongest AI case in the spec.** Every field is already in the school row — nothing
is invented. It is structure→text, the rule this whole section follows. And it attacks the real
barrier: NGO–school partnerships do not fail from lack of information, they fail on **paperwork and
coordination cost**. A director with thirty other problems will not draft a collaboration request
from scratch. That is what the model removes.

- **Input:** one school row + one NGO capability profile + the computed archetype, feasibility terms
  and coverage status. Nothing else.
- **Output:** a Romanian packet — request · school brief · problem statement · pupils affected ·
  proposed objective · suggested first step. Content contract, not format (§6's rule).
- **Model:** `claude-opus-5`, adaptive thinking, `effort: "medium"`, as J4.
- **Groundedness:** the J3/J4 post-check applies unchanged — every numeral in the output must appear
  in the input payload, or fail closed to a template.
- **Never sends and never files anything.** It renders; a human reads, edits and acts.

#### Three constraints, and the second one is a product decision

**1. It may cite exam candidates. It may not invent a class roster.** We hold `candidates_per_year`,
`n_fail`, `absent_rate`, `mean_avg` — **EN candidates, not enrolment**. There is no per-grade
enrolment in this repo (INS TEMPO SCL103D is still unadded) and no class composition or teacher
records anywhere. So the packet says *"about 12 grade-8 pupils sit EN each year, of whom about 7
score below 5"* — true and sourced — and never "clasa a VIII-a A has 24 pupils". Same discipline as
`capacity_pupils_per_year` in §5: fields we do not have, we **ask for**; we do not generate them.

**2. It inverts the product's direction, so the default must be *system initiates, director
confirms*.** Everything else here runs NGO→school: a resource-holder asking which schools. J8 runs
school→NGO, which is the direction this project deliberately abandoned (the diriginte tool, dropped
for GDPR and MATE overlap). Left as a form waiting to be found, it rebuilds the inbound-only bias
of §8b one level deeper: value would flow to schools whose director acts, and **the 789 "no one is
here" schools are precisely where nobody acts**.
Worse, a director-initiated flow *structurally cannot* serve the 789 — a director can only contact
an NGO that already works near them, and for those 789 the finding is that nobody does.
**So J8 is reached from our outbound (J4), not only from a director's search.** The director
receives a pre-filled packet and approves it; their effort drops from "write a request" to "approve
a request", and population-level targeting is preserved. **Show the packet's source in the UI** so a
director sees the system proposed it, rather than suspecting someone reported their school.

**3. "Desemnează diriginții" assigns a teacher to a project — never a pupil to a teacher.** The
moment diriginți sit in a project workspace, the pull toward tracking individual pupils is
immediate, and that is the product the pivot removed. No per-pupil records, no risk scores, no
child names — in the packet, in any workspace, in any prompt (§8). The diriginte is a **named
contact for a school-level intervention**. If that line blurs, the GDPR problem returns with extra
steps.

#### What does not exist yet, and must not be assumed

**Measured at midday, 12 Sept — two of these three have since changed, in our favour.** Stated with
their timestamps, because a present-tense claim about the build rots faster than anything else here:
- ~~no per-school detail view~~ → **the director profile shipped that afternoon.** The thing this
  flow exposed as missing is the thing it produced: EN trend, national position, archetype,
  coverage, matched NGOs.
- ~~the `NGOS` array holds 9 hand-curated organisations, so "contact the available NGOs" is thin~~ →
  **the register join shipped**: 1,260 candidates across 42 counties, minimum 30 each. Scope is
  keyword-derived until J1, so the thinness moved from *coverage* to *precision*.
- **no county-mean comparison — still true.** The national percentile over all 6,331 ranked schools
  (urban included) is the only comparison that exists, so a county-relative claim would be a
  different statistic wearing the same label. Do not imply one.

The archetype remains absent from the team's own workshop flow entirely, and this flow reuses it.

#### Scope, honestly

Request → accept → assign → onboard is a stateful multi-party workflow: accounts, state,
notifications. **Not buildable before the pitch.** What is: the **packet generation step**, which
needs no accounts — one button on an existing match card, one rendered packet, real school, real
numbers, real NGO. Ship that, present the four-step flow as the roadmap, and let the packet be the
proof the hard part works. It moves criterion #5 (shippability); a half-built workflow moves nothing.

#### Eval

30 packets, four code-gradeable binaries as J4 (correct school + județ · no invented statistic ·
no invented commitment on the NGO's behalf · a concrete first step), plus two specific to J8:
**no class-roster or enrolment claim** and **no named individual**. Both are the failure modes that
matter, and both are regex-checkable against the input payload.

## 7. Scoring

Hard filters, then score. Both deterministic.

**Filters (a school/NGO pair survives only if all hold):**
1. `education_relevant == true` and `confidence ≥ 0.6`
2. school lies inside the NGO's service area, or within `radius` km of its geocoded seat
3. `programme_types` intersects the archetype's sensible set (§4)
4. school is not already covered by a programme of the same type — **unblocked**, the coverage
   layer ships `pnras_grant` and `masa_sanatoasa` per school (`model/coverage.js`)
5. school has an email or phone

**Score:**

```
score = w_fit · archetype_fit          // 1.0 exact type match, 0.5 adjacent, 0 otherwise
      + w_need · priority_score        // already in the CSV
      + w_geo  · (1 − distance/radius) // real lat/lon, not county-capital hops
      + w_gap  · coverage_gap          // 1 if no programme of this type within 25 km
```

Defaults `w_fit .35 / w_need .30 / w_geo .20 / w_gap .15`, all exposed as sliders. The weights are
a *policy* choice, not a fact — let the funder move them and watch the shortlist change. That
interaction is the demo.

---

---

## 7b. Feasibility — what we ship instead of a probability

*Section from session 3, with the `availability` term reworked; see the note at the end.*

`score` (§7) ranks candidates by preference. **Feasibility answers a different question: can this
match actually happen?** Deterministic, recomputable on paper, no statistical claim attached.

**Do not call it a probability.** A probability needs outcome data — NGOs recorded as accepting or
declining schools. None exists, ours or public. A "probability" that is really a weighted score is
the same failure mode as the thirteen denominator errors fixed on 12 Sept, except the wrong label
is a statistical claim instead of a set.

**Multiplicative, not additive.** An additive score lets a strong term mask a fatal one, and every
factor here is a veto in the real world:

```
feasibility = reach × fit × availability × freshness
```

| Term | Graded by | Source |
|---|---|---|
| `reach` | distance against that NGO's **revealed** operating radius — derived from the spread of its own known sites, not a UI default | real coordinates (**3,960 of 4,205 rural** geocoded); J2 |
| `fit` | archetype × `programme_types`, weighted by the **evidence strengths** in `RESEARCH.md` §3.1 — money-bound → conditional cash with enforced conditions, meals (enrolment only); school-bound → management, teacher stability. **Never transport or boarding** | §4, §5 |
| `availability` | how much attention this school can actually receive — see below | coverage layer; `inbox_schools` |
| `freshness` | `stage`: running = 1 · stated_intent = reduced · **dormant = 0, a hard veto** | J1 |

### `availability` had to be reworked, and the reason generalises

As first specced it was "not already covered **and** has an inbox" — which is filters 4 and 5 of
§7 restated. After filtering it is **always 1**: a multiplicative term that never varies, implying
rigour it does not have. Any feasibility term that repeats a hard filter is dead weight.

The rule: **filters are the binary cut, feasibility terms are the graded residue.** So each term
must measure something the filter has already let through:

- **partial coverage**: a school with a meal but no academic programme survives filter 4, yet is
  not equally available — grade it down rather than treating it as untouched.
- **shared inbox**: a school sharing one address with four others is one administration's attention
  split five ways. Grade by `1/√inbox_schools`. This uses the shared-inbox data directly and is the
  kind of operational reality an ISJ will recognise immediately.

**Report `need_per_year × feasibility` — "expected children reached"** — not a bare score. That
answers §1's actual question ("capacity for 20 more schools — which 20?") instead of ranking
abstractly.

### The term we cannot compute — say it unprompted

`capacity_pupils_per_year` is deliberately never inferred (§5). **An NGO with 20 places and one
with 2,000 are identical to this formula.** That is the honest ceiling on the whole matcher. It is
also the strongest argument for talking to NGOs rather than only modelling them, and the first
field an NGO form should ask for.

### One new AI job

Infer each NGO's **revealed operating radius** from its own text and site list — a language job
producing a deterministic number, the pattern that has worked throughout. It belongs with J1/J2.
The score itself stays arithmetic an ISJ can recompute. Until J2 runs, `reach` degrades to the
current radius slider, which is fine — **but do not call the degraded version feasibility on a slide.**

### Calibration path — the answer to "how does this improve?"

Every outreach produces a labelled outcome (sent → opened → replied → accepted). One pilot county
yields the first NGO-placement outcome dataset in Romania. **v1 is a feasibility score on public
data; v2 is a calibrated probability fitted on data that does not currently exist.** That turns the
missing probability from a weakness into a roadmap.

**No eval, deliberately.** Feasibility has no gold set and no metric in §9, because there is nothing
to evaluate it against until outcomes exist. Stating that absence is stronger than omitting it.

## 8. Guardrails

**AI must never:**
- **be a chat interface over the data.** A chat box makes an auditable ranking unauditable — it
  trades the one property the ISJ cares about for a demo flourish. A judge will ask; refusing it
  out loud is the stronger answer.
- compute, adjust or re-order the ranking
- invent capacity, contact details, or a service area
- generate a "worst villages" narrative — two lists only (quick wins / no one is here)
- see a child's name, grade, or any per-candidate row

**Degradation.** If the API is unavailable the product still works: deterministic score, template
explanation ("Școala X: 71% sub 5, comună în decila Y de venit, niciun program la <25 km"), cached
J1/J2 profiles from disk. **Demo this path once before the pitch** — a hackathon wifi failure
mid-demo is the likeliest way this falls over.

---

## 8b. Crowdsourced tips — a layer, never an input

If a tips form ships, **tips must never enter the need index or any ranking.** Self-reported tips
are inbound-only signal — precisely what hartaedu.ro is and what this product exists to correct.
The schools closest to the 8→9 cliff are the ones with nobody to write the tip, so feeding tips
into the ranking rebuilds the bias we criticise and turns `RESEARCH.md` §2.2 into an argument
against our own product.

Legitimate uses, all separate from the index: **validating the ranking** (a tip landing on an
already-flagged school is a precision measurement worth a slide), **catching what public data
cannot see** (a school absent from EN entirely), and **generating warm leads**. Hard constraints:
no child-level information in any tip, and tips are never published as a "worst schools" list.

---

## 9. Done-when

Machine-checkable, in order. Metric choices follow `RESEARCH.md` §5; the whole plan is ~3–4 hours
and well under $1 of inference. **Say the cost and the confidence interval unprompted** — that is
what separates a team that ran an eval from a team that ran a demo.

### 9.0 Freeze the taxonomy first (20 min)

**The taxonomy is already frozen — it is `programme_types` in §5 (14 closed labels). Do not invent a
second one for the eval.** What §9 adds is a **reporting collapse**: score against all 14, but
report and draw the confusion matrix over the ~9 that change a match —
*tutoring_remedial · after_school · transport · meals · scholarship_cash · roma_inclusion ·
teacher_training · mentoring · other*. (`career_guidance`, `dual_vocational`, `parent_family`,
`school_infrastructure`, `special_needs` stay in the schema; they are too sparse in the register to
carry a per-class F1 at n=120, so fold them into the macro-F1 but not the matrix.)

The 20 minutes go on writing **one disambiguation sentence per label** before anyone labels a row —
most J1 disagreement is definition drift, not model error. The known hard boundaries:
*after_school* vs *tutoring_remedial*, *mentoring* vs *career_guidance*, and anything that is
*other* only because the charter is boilerplate (see abstention, §9.3).

### 9.0b J4 binary checks

Code-gradeable, no judge needed. The existing set checks correct school + județ; add a fifth:

5. **No two drafts in one run share a recipient address.** Costs nothing, and catches the
   shared-inbox failure mode directly.

### 9.0c Evals for J5–J7

- **J5** — 40 hand-written tips, deliberately vague, because that is the realistic input. Report
  resolution accuracy **and abstention rate**: holding an ambiguous tip is success, not failure.
- **J6 — tuned asymmetrically, and say so.** Report **recall on a hand-written adversarial set**,
  accepting precision loss. A false positive costs one annoyed submitter; a false negative puts a
  child's data in a database. Do not report a single F1 for this job — it would hide the trade
  that is the entire point.
- **J7** — macro-F1 on the closed label set, against whatever replies actually arrive. Too few to
  gold-set in advance; report n alongside the score.

### 9.1 Gold set (60 min) — `evals/gold.jsonl`

- **Sizes:** 120 rows J1 · 60 J2 · 30 J3 · 30 J4.
- **Dedupe by normalised 5-gram hash before sampling.** The register is full of copy-pasted
  statutes; without this the gold set silently measures one sentence fifteen times. **Report the
  dedup count** — it is a good slide detail.
- **Strata, reported separately, never pooled into one number:** 60 random (the honest headline) ·
  30 oversampled rare classes · 30 adversarial.
- **The adversarial 30 must include:** near-duplicate purpose statements · boilerplate that must
  map to *other* rather than be force-fit · diacritic-stripped and ALL-CAPS Romanian · OOD orgs
  (sports clubs, church foundations, vânătoare/pescuit) that must **not** classify as education.
- **Fields:** input, gold label, annotator, stratum.

### 9.2 Inter-annotator agreement (30 min) — the cheapest credibility available

Two people label the same **40 J1 rows** independently; report **Cohen's κ** per label.
κ ≥ 0.6 usable · < 0.4 means the taxonomy is broken, not the model.
State plainly on the slide: **model accuracy cannot exceed human agreement.** The ceiling is the
label, not the model.

### 9.3 Metrics per job

| Job | Metric | Bar |
|---|---|---|
| **stage** | recall on `running` specifically, reported apart from the other J1 fields. A wrong `running` matches a failing school to an association that stated an intent in 2013 and did nothing since — the most embarrassing output the system can produce, and the same seriousness §5 already applies to `capacity_pupils_per_year` | recall ≥ 0.85 on `running`; abstain rather than guess |
| **J1** | per-class precision/recall/F1 and **macro-F1** — **never accuracy** (heavily imbalanced; *other* would flatter it). Plus a **4×4 confusion matrix of only the classes that change a match**. Plus **abstention rate and abstention precision** — refusing to guess is correct behaviour for a system that emails real people | macro-F1 ≥ 0.80. Costly error is a false negative on *mediere romi* or *educație remedială* (school gets no match) — weight recall there |
| **J2** | exact-match on the județ set, **reported separately for national-scope NGOs** (the common failure) | ≥ 0.85 on stated-area rows; no silent widening (§6) |
| **J3** | **faithfulness**: decompose each explanation into atomic claims, mark supported / unsupported / contradicted, report **hallucination rate** | 0 contradicted on 30, reported as **"0/30, 95% upper bound ≈10%"** — never "no hallucinations" |
| **J4** | 4 binary code-gradeable checks (correct school + județ · no invented statistic · no invented commitment on the NGO's behalf · has a concrete ask) + 1–5 tone | 30/30 on all four binaries; tone ≥ 4 median |

**At n=120 and ~0.85 accuracy the Wilson 95% CI is ≈±6pp.** That is enough to claim "above 0.8" and
**not** enough to rank two prompts a point apart. Put that sentence on the slide.

### 9.4 LLM-as-judge, honestly (45 min)

Judge **only** J3 faithfulness and J4 tone, and **never as sole evidence**. Required mitigations:
- score **pointwise against a rubric** (removes position bias entirely, unlike pairwise);
- use a **different model to judge than to generate** (J3/J4 generate on Opus 5 → judge elsewhere);
- **one dimension per call**;
- **calibrate the judge against our humans on the 30 hand-scored items and report judge–human κ.**
  That calibration number is the most senior-looking thing on the slide.

### 9.5 Held-out geography test — build this first

World Vision, Teach for Romania and Junior Achievement have known, published county lists (in
`app/index.html`'s `NGOS`). Strip them from the input, run J1+J2 from the register text alone, and
check the recovered counties against the truth. **This is the only end-to-end test available
without new data collection**, and it needs no hand-labelling at all.

### 9.6 Non-negotiables

1. **Determinism:** the same school/NGO pair returns the same score twice, with the API off.
2. **Groundedness hard gate:** 0 of 50 sampled J3/J4 outputs contain a number absent from their
   input (§6 post-check, fail closed to the template in §8).
3. **Ethics:** no output path can produce a ranked list of localities labelled by failure.
4. **No child-level data in any prompt, ever** (§6).

### 9.7 Reproducibility

`evals/gold.jsonl` · `evals/run_eval.js` · `evals/results.md`. Model, temperature and prompt version
in the results filename; **keep the prior run to show a delta**. Cost: ~300 items × ~2 calls,
comfortably under $1 — say it, because it pre-empts "could you run this nightly?" with "yes, for
cents".

### 9.8 The eval slide

Scope line ("the matcher is deterministic; four narrow LLM jobs are evaluated here") · the metrics
table · one 4×4 confusion matrix · **two large credibility numbers (inter-annotator κ, judge–human
κ)** · a one-line limits box ("n=120 → ±6pp at 95%; stratified, not random; boilerplate abstention
is intentional").

**Superseded:** the earlier bar was "J1 precision ≥ 0.90 on 200 hand-labelled rows". Precision alone
on a pooled sample is the wrong metric on an imbalanced taxonomy, and 200 rows is not labellable in
the time left. Keep the 200-row version as a post-hackathon stretch; ship 120 with macro-F1, κ and
a stated CI.

---

## 10. Build order

1. ~~`coverage_programmes` (PNRAS + Masă sănătoasă)~~ **done** — `model/coverage.js`. Remaining
   gap: `data/pnras/elig_r2s2.pdf` is a scan. Measured, not OCR'd: a third of it read by vision is 92% the same schools, so the full list would move the counts by <1% (`model/README.md`)
2. Load the register, geocode seats against SIRUTA (J2 step 1, deterministic)
3. Freeze label definitions (§9.0), dedupe by 5-gram hash, then hand-label the gold set — 120 J1 /
   60 J2 / 30 J3 / 30 J4, with 40 J1 rows double-labelled for κ (§9.1–9.2). Before writing a single
   prompt. The held-out geography test (§9.5) needs no labelling — build it here, first
4. J1 on the prefiltered 31,080 via Batch, cache to `out/ngo_profiles.json`
5. Deterministic filters + score + sliders in `app/index.html`
6. J3, then J4
7. Călărași pilot end to end, simulated send

Steps 1–2 and 5 are most of the product's value and contain no AI. Ship them first; the model
work is an upgrade to a thing that already works, not the foundation.
