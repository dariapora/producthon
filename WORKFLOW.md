# Workflow — the AI feature flow (Workshop 1 deliverable)

Written 12 Sept 2026, from Workshop 1 (*Turn your assigned civic case study into a workflow for your
AI feature*, Iulia Moroti). Transcript: `../iulia-moroti.vtt`.

This file is the **Workshop 1 deliverable** and the spec for `CLAUDE.md` task 5 (the Călărași pilot
flow). `MATCHMAKING.md` says what each AI job does; this file says **who does which step, in what
order, with what input and output, and what happens when it goes wrong.**

> **Sources Iulia cited**, if we want them in the deck: Elements of AI; EU AI Act definitions;
> Alistair Cockburn, *Effective Use Cases* (2000) — the Narrator View is where "5–7 steps,
> present-tense, say who does what" comes from.

---

## 0. The method, as specified in the workshop

A flow is a **narrative**: write it as a sports commentator would, or as a bird above the scene.
Present-tense action verbs, and every step names **who** acts. Her completion bar, verbatim in
substance:

1. A clear **trigger** and a clear **outcome**, with concrete steps between — 5–7, up to 10.
2. Every step tagged **Human / AI / System** — the three sources of (non)determinism: the user
   (messy input, non-deterministic), the system (deterministic), the AI (semi-/non-deterministic).
3. For **every step**, the **input** and the **output**. Every output must be consumed by a later
   step — *"if not, why did you produce it?"*
4. The output is a **contract**: say what **type of content** it carries, **not** its format. Not
   "10 lines in Romanian" — that is Workshop 2's problem.
5. Input does **not** only come from the user. Name the other sources (system prompt, a database,
   retrieval).
6. Build the **happy path** first, then interrogate it: an **unhappy path for every AI step** —
   what-ifs, edge cases, context changes, bad input — and **always a fallback** (plan B, C, D).
7. **Star anything you cannot resolve now** (⭐ below) and decide later whether it is a UX fix, an
   AI fix, or a cheap deterministic step placed *before* the AI one.
8. **Highlight every human decision point** — Workshop 2 (HMI) consumes exactly those.
9. Ask: **even when the AI step is wrong, what remains true and still usable?**

**Her two hard prohibitions, both from the EU AI Act:** never associate a **score with a person's
name**, and never collect or reference **ethnicity data**. And the structural one: the AI must not
own the decision. In the flow she used as the bad example — *resident sends report → AI analyses →
**AI decides** if it is a real problem → system notifies → officer sees a dashboard* — the defect
was that there was **no human in the flow at all**. The refinement that came out of the room is the
part worth keeping: it is fine for the AI to analyse and surface, **as long as the notification
fires regardless and the officer decides.** The AI may supply intelligence; the decision diamond
must belong to a person.

---

## 1. One persona, one sub-goal, one flow

Iulia's rule: pick **one** persona and **one** sub-goal; everyone else is an **actor** who exists
and shapes the context but is not solved for today.

**We had to make a choice here, because `MATCHMAKING.md` §1 names two users** (an NGO programme lead
*and* a CSR funder) **and `source/CivicPTeam1.md` personas a third** (the *diriginte*, the user we
pivoted away from — see `SUMMARY.md`). Under her rule that is one flow too many, not three flows.

**Chosen persona: the CSR / sponsorship officer.** Chosen because it is the only one of the three
with a **dated, externally verified trigger**, which is requirement 1 above:

> Romanian sponsorship mechanism, 2026: a profit-tax payer may redirect up to **20% of corporate
> profit tax** (capped at 0.75% of turnover) to an NGO — money that otherwise goes to the state, so
> marginal cost ≈ zero. Filed on **Formular 177**; the **25 June 2026** deadline has passed, so the
> live decision is the *next* cycle.
> (`RESEARCH.md` §2.3, VERIFIED.)

### Pain points → sub-goals

⚠️ **These are inferred from desk research, not observed.** Zero interviews have been conducted
(`RESEARCH.md` §1.6). Iulia's method assumes *"what you observed in your persona"*; we have no
observation for the user we actually serve, so every line below is a **hypothesis**, and the
prioritisation is a hypothesis about a hypothesis. Do not present it as discovery.

| Pain point | Level | Evidence |
|---|---|---|
| Cannot tell which of the **4,202 ranked** rural schools needs this most | functional | the ministry's own risk list catches **19%** of the national worst quartile (248 of 1,320) |
| The register says where 125,840 NGOs are *registered*, not where they *work* | functional | `MATCHMAKING.md` §2 — the layer does not exist anywhere |
| A fixed sum, use-it-or-lose-it, against a hard annual date | financial | Formular 177; the 2026 deadline (25 June) has passed — the open decision is the next cycle |
| Must justify the choice to a board, and fears funding something that does not work | emotional / reputational | ROSE RCT, 41,524 students: no significant impact for untied grants (`RESEARCH.md` §3) |
| Wants impact that is visible and attributable | social | — |

Three functional/financial against one emotional and one social. Applying her tip — *count the
levels, then form a hypothesis* — the hypothesis is that **the binding constraint is defensibility,
not goodwill**: this persona does not need to be persuaded to give, they need to be able to defend
where it went. That is why the flow's outcome is a *justified* shortlist, and why the ranking must
stay recomputable on paper.

**Sub-goals**, prioritised: **(A) choose where the money goes, defensibly** ← *this flow* ·
(B) justify it to the board · (C) place it before the next Formular 177 deadline · (D) see that it changed something.

### Actors — real, not solved for today

The **grade-8 rural pupil** is the beneficiary and never an input: no child-level row enters a
prompt, and nothing in this product scores a child. The **ISJ** is the authority that asks *"why
this school and not that one"* — the reason step 4 must stay arithmetic. The **school director /
secretary** owns the inbox we write to (879 addresses are shared by 1,956 schools). The **NGO
programme lead** is the parallel persona: their flow reuses steps 1–6 and diverges at step 7.
Also present: the **ministry** (publishes the lists), and the **board / CFO** who signs off.

---

## 1b. The second persona — the school director

**Persona: director de școală, ~50 de ani, rural.** The team's choice in the workshop, 12 Sept.

> ⚠️ **Evidence status — read before lifting any line below onto a slide.** The persona is a
> workshop choice, not a research finding. The pain points are inferred. **Zero interviews have
> been conducted with a director**, exactly as for §1. This persona is the *weaker* evidenced of
> the two, not the stronger: §1 at least rests on desk research plus a verified statutory
> mechanism, while this one rests on a decision made in a room. The only thing that has been
> *measured* about any director is what the public data says about their school. Precedent for
> marking this explicitly: `RESEARCH.md` §1.6, where an unmarked inference in a persona's voice is
> rated the highest-severity claim in the repo.

**Pain point, in the team's words:** promovabilitate mică la Evaluarea Națională, which leads to
abandon școlar.

**Sub-goal, in the team's words:** *"Vreau să găsesc ușor resurse specifice ca să ajut elevii să ia
note de trecere la EN și să continue ciclul școlar."*

### The trigger — and the asymmetry is a finding, not a gap in the writing

The obvious candidate is *"EN results for their school are published"*. **UNVERIFIED: no source in
this repo establishes that date, and it is not being supplied from memory.** It is also a weak
trigger even if dated — a results publication carries no personal deadline and no consequence
attached to acting on it. Compare §1's: a statutory annual filing, with a form number and a date,
where not acting forfeits the money.

**That asymmetry is the reason the supply side is the primary product and this is the second door.**
It is the same conclusion reached structurally further down this file — a director-initiated flow
cannot serve the 789 — arriving from a different direction. Two independent routes to one answer.

So the trigger we build on is not a calendar event but **our outbound message arriving** (J4, to the
school inbox, grouped so one coordinating school is not written to three times). The director does
not go looking; we arrive. Alongside it sits one condition that *is* verifiable from what we hold
today: a school in the national worst quartile with `pnras_grant`, `masa` and `pnras_eligible` all
zero is, factually, one of the **789**.

### The structural limit, measured

A director can only be matched to an organisation that already works near them — and for the
schools that matter most, none does. Measured against the **nine curated NGOs**: 83% of
worst-quartile schools had fewer than three organisations in county and **19.5% had none**. State
that denominator every time: it is against the nine, **not** against the 1,260 candidates the
register join now yields — different sets, and the pre-join figure will be read as the post-join
one unless the sentence says which.

The consequence is a hard requirement, not an edge case: for the 789, an empty result is the *modal*
outcome. **The director flow must never return an empty state.** Where nothing is in range it
returns a "nobody works here yet" panel with a pre-filled collaboration request.

### The escalation architecture — the public marketplace is the fallback, not the first step

*problem → match → provider with capacity, in range? → yes: connect / no: publish.* A school
describes the problem; we try it against providers that already exist; only where that fails does
the need get **published publicly**, carrying the diagnosis and what was already checked, so it does
not start from zero. **The failed match, not the alert, is the unit of gap data.**

This is the best available position on hartaedu.ro: **marketplace of last resort, not competitor**
— `SUMMARY.md`'s stance made structural. It also lands on the panel session 1 already built: the
"nobody works here yet" state with a pre-filled collaboration request *is* this escalation, one step
short of publishing.

**The gate reads "is there a provider with capacity, in range?" — never "does a solution exist".**
Per `RESEARCH.md` §3.1 most named Romanian NGO programmes are unevidenced, so "a solution exists"
asserts an efficacy we cannot support, and closing a need as solved on that basis is worse than
publishing it. Provider-and-capacity is checkable; solution-exists is not.

> ⚠️ **Dependency, must not be dropped.** Publishing into an external marketplace **assumes a
> partnership that does not exist**: Narada is #3 on the contact list, never approached, and the only
> conversation opened is ATSI, with no reply. Present this as **architecture, never as an
> integration**. A judge who hears "we publish to hartaedu" as a shipped capability has been misled
> exactly as by an unlabelled placeholder.

> ⚠️ **And the gate's key field is empty today.** `capacity_pupils_per_year` is `null` by design
> — `MATCHMAKING.md`:131, "only from a partner conversation". Making it load-bearing for the
> *gate* means that, as built today, it decides nothing: the gate must **fail open** (publish) rather
> than fail closed, or a field we never populate would silently suppress every need. This is one more
> argument for the NGO-side form being the primary call to action.

> **The claim this makes testable.** If the ranking is any good it should **predict in advance which
> schools fall through to the public fallback** — coverage-zero schools are where matching should
> fail most often. That is checkable against data we already hold, and it is a stronger
> demonstration than a map: the population layer forecasting the marketplace's own failures.

### The flow (second door) — seven steps

| # | Who | Step | Input | Output |
|---|---|---|---|---|
| 1 | System | Our outbound reaches the school inbox | inbox group, archetype, ISJ framing (J4, §3 step 7) | a message naming every unit on that inbox, with a link |
| 2 | **Human** | Director opens the link and finds their school | name, locality | one `COD SIIIR` |
| 3 | System | Prefills the profile from public data | that school's row | EN trend 2023–26, **national percentile with its denominator stated**, archetype, coverage flags, inbox group |
| 4 | **Human** | **Confirms or corrects the profile** | the prefilled profile | a confirmed profile — and the chance to state what we refuse to infer |
| 5 | AI | The closest three organisations, each with a cited reason | school row + NGO profiles + score components (J3, template first) | three matches with sources — **or** the "nobody works here yet" panel |
| 6 | **Human** | **Sends the request — or escalates** | the draft, or the empty result | a sent request to a named provider; **or**, where nothing matched, a structured public need carrying the diagnosis and what was already checked. The product still never sends by itself |
| 7 | System | Records the gap | the outcome of 5 and 6 | need type × county × date, **with the population denominator from the ranking attached** |

**Deliberately absent: a county comparison.** The profile shows the **national** percentile only,
with its denominator stated. `failPct` runs over all 6,331 schools, urban included, so a
county-relative figure would be a different statistic wearing the same label.

### Unhappy paths specific to this door

- **No organisation in range** — the modal case for the 789. Never an empty state; see above.
- **An organisation matches but is dormant** — a `stage: running` that is wrong is worse here than
  in §1, because a director acts on it personally and gets silence back.
- **The director corrects the profile and we disagree with the ministry data.** Their correction is
  not authoritative over the EN file, and the EN file is not authoritative over what they can see
  from the staff room. Record both; never silently overwrite the public figure.
- **⭐ The school has a phone but no email** — it never receives step 1 at all, so this door does
  not exist for it. Same open item as §3.
- **⭐ A false-positive match buries a real need — the new failure this gate introduces.** Before,
  a bad match wasted a director's time; now it can *remove* a need from the public queue altogether,
  most likely via a `stage: running` organisation dormant since 2013. **A matched need that draws no
  reply within a set window must escalate automatically.** Matching may delay publication; it may
  never cancel it. The window length is unresolved — ⭐.
- **The gap ledger inherits the bias it exists to expose.** "187 requests, 3 organisations" counts
  only schools that spoke. Left bare it is the DonorsChoose result again (`RESEARCH.md` §2.2:
  funding tracked which teachers had time and a network to ask). **Every gap figure carries the
  population denominator** — of the county's rural schools, not of those who asked. This is the one
  thing we can supply that the marketplace cannot compute for itself.
- **⭐ Two taxonomies.** Ours is supply-side (`programme_types`, closed, 14 values); a need-led flow
  needs a demand-side one. The mapping between them is the actual product work and does not exist.

## 2. Trigger and outcome

**Trigger.** The **25 June 2026** Formular 177 deadline has passed, so the officer is planning the
**next** sponsorship cycle: a fixed sum, redirected from corporate profit tax rather than added to
a budget, that must be placed and justified internally before the next annual deadline. Planning
season is a better moment to be in the conversation than three weeks before a filing date. They
open the tool asking one question: *where should this go, and why there?*

**Outcome.** A signed-off shortlist of **named rural schools**, each with a matched programme type
and a reason the ISJ can recompute by hand, plus a drafted Romanian email per inbox group — **which
the human sends.** The product never sends.

---

## 3. The flow (happy path)

Eight steps. **Bold = human decision point**, and those three are Workshop 2's surface.

| # | Who | Step | Input | Output (content, not format) |
|---|---|---|---|---|
| 1 | System | Ranks every school | ministry EN 2023–26 per candidate · 2025–26 school network · 2017 coordinates · UAT budget line 04.02.01 · 3 coverage lists | 6,335 schools ranked — 4,205 rural in the network, **4,202 of them ranked** — each carrying `fail_rate_shrunk`, `need_per_year`, `absent_rate`, `deprivation_score`, archetype, `coverage_programmes`, `inbox`, lat/lon |
| 2 | **Human** | **Sets the frame: county or national, the sum, the programme types they can actually fund, and the four weights** | officer's own constraints | a **policy frame** — hard filters + `w_fit .35 / w_need .30 / w_geo .20 / w_gap .15`. The weights are a policy choice, not a fact |
| 3 | AI | Reads NGO purpose text → capability + service area (**J1 + J2**, batch, cached) | `Denumire`, `Judet`, `Localitate`, `Scopul initial` + `Modificari 1..5` for the **40,684 prefiltered** by `model/ngos.js` from the 108,891 alive with a stated purpose (mean 759 chars; of the 125,840 registered, 9,498 state no purpose and 8,213 are struck off, and neither reaches the model). The shipped J1 run reads the top-30-per-county slice of that, **1,260 rows**. Also from: the system prompt's closed 14-type taxonomy, and the SIRUTA nomenclator for deterministic geocoding | per NGO: `education_relevant`, `confidence`, `programme_types`, `age_bands`, `stage`, `service_area`, and **`evidence` — a verbatim span from the input** |
| 4 | System | Filters, then scores — **no AI** | school rows + NGO profiles + the frame from step 2 | surviving pairs, scored `w_fit·archetype_fit + w_need·priority_score + w_geo·(1−d/r) + w_gap·coverage_gap`. Recomputable on paper |
| 5 | AI | Writes the reason (**J3**, template first; model only behind "explică mai mult") | **one** school row + **one** NGO profile + the score components. Nothing else | 2 Romanian sentences naming the archetype and the single strongest reason. **Every numeral must already appear in the input** |
| 6 | **Human** | **Reviews the shortlist and decides who to approach** | ranked pairs, each reason, each source | the approved shortlist. The AI ranked nothing and decided nothing |
| 7 | AI | Drafts outreach (**J4**, on demand) — **grouped by inbox, never by school** | the inbox group (one *or more* school rows), funder/NGO profile, archetype, ISJ framing | subject + 120–160 Romanian words, one concrete ask, real figures, naming **every unit on that inbox** |
| 8 | **Human** | **Edits and presses send** | the draft | a sent message. **The system has no send capability** |

Every output above is consumed downstream: 1→4, 2→4, 3→4, 4→5, 5→6, 6→7, 7→8.

---

## 4. Unhappy paths — one per AI step

### Step 3 (J1 + J2)
- **`evidence` is not a substring of the input** → reject the response and re-queue. An ungrounded
  profile never enters the pool. This is the groundedness check.
- **`confidence < 0.6`** → escalate `claude-haiku-4-5` → `claude-sonnet-5`; still below → the pair
  fails hard filter 1 and the NGO drops out.
- **The purpose text states no service area** → default to the seat county, `confidence: low`.
  **Never widen a service area by inference** — a wrongly widened radius confidently recommends an
  organisation that does not work there.
- **`stage` says `running` for an association dormant since 2013** → the costly error, and the most
  embarrassing possible output. Own recall bar (`SUMMARY.md`).
- **Batch results arrive out of order** → key by `custom_id = cui`, never by position.
- **Fallback:** cached profiles from disk; with no cache, the deterministic regex recall filter,
  with the list visibly labelled *neclasificat*.

### Step 5 (J3)
- **A numeral appears in the output that is not in the input** → regex-extract every numeral and
  assert membership; **fail closed to the template.** Never ship an invented figure.
- **Fallback:** the template is already the default — *"Școala X: 71% sub 5, comună în decila Y de
  venit, niciun program la <25 km."*

### Step 7 (J4)
- **Drafted per school instead of per inbox** → one director receives three mails, each opening as
  if we had never heard of them. Group first: the default Călărași view collapses 6 schools → 5
  recipients, and the pilot's 64 schools → **50 distinct inboxes**.
- **An invented figure or contact** → every figure must be present in the payload; block otherwise.
- **The school has a phone but no email** → it fails hard filter 5 and never reaches step 7. ⭐ It
  should instead render a call script — a UX fix, not an AI one.

### Context changes
- **Wifi dies mid-demo** — the likeliest way this falls over on Sunday. `MATCHMAKING.md` §8 is the
  degradation path; **demo it once before the pitch.**
- **The officer leaves and comes back the next day** (steps 6→7 can be hours or weeks apart, and the
  deadline is fixed) → the approved shortlist must persist. ⭐ Not yet specced.
- **The coverage lists refresh** → re-run `npm run coverage` before recommending; a school served
  since the last run must not receive a duplicate programme.
- **Cached NGO profiles rot** → this is what J3b exists for. Harta IRSE died exactly this way
  (`RESEARCH.md` §1.4).

### What remains true even when the AI is wrong

**Everything that ranks.** The need index, the archetype, the distances, the coverage gap and the
contact details are arithmetic on published files. With every AI step failing simultaneously, the
officer still gets a defensible shortlist of named schools with template reasons. The AI supplies a
layer that does not otherwise exist (where 125,840 NGOs actually work) and drafts Romanian prose —
it never touches the ranking.

This is also the answer to judging criterion #5, so it belongs in the pitch as one line.

---

## 5. Prohibitions, checked against the flow

| Her rule | Our status |
|---|---|
| Never a score beside a person's name | **We never score a person at all.** School-level aggregates only; no per-candidate row reaches a prompt |
| Never collect or reference ethnicity data | **Needs saying out loud — see the note below** |
| The AI must not own the decision | Decisions live at steps 2, 6, 8. The AI ranks nothing |
| Human oversight must be real, not decorative | Step 5 makes step 6 cheap: every field cites its source, so the reviewer knows where to look instead of redoing the work |
| No chat interface over the data | Refused deliberately (`MATCHMAKING.md` §8) — a chat box makes an auditable ranking unauditable |

> ⚠️ **`roma_inclusion` is in the closed `programme_types` taxonomy** (`MATCHMAKING.md` §5), and a
> judge who has also heard this workshop could read that as ethnicity data. It is not, and we should
> say why unprompted: it classifies **an organisation's own stated purpose**, from its own register
> entry — never a pupil, a school, or a locality. **It must never become a school-side filter.**
> Nothing in the school layer records ethnicity, and the RPL 2021 Roma-share-per-UAT file floated in
> `PROGRESS.md` as "highest-value data still addable" should be weighed against this rule before
> anyone joins it.

---

## 6. Done-when — her bar, checked

- [x] Trigger and outcome, both concrete — §2
- [x] 8 steps, each tagged Human / AI / System — §3
- [x] Input and output for every step, each output consumed later — §3
- [x] Outputs described as content, not format — §3
- [x] Non-user input sources named (system prompt taxonomy, SIRUTA, cache) — step 3
- [x] An unhappy path for every AI step, each with a fallback — §4
- [x] Human decision points highlighted — steps 2, 6, 8
- [x] "What survives an AI failure" answered — §4
- [ ] ⭐ Shortlist persistence across sessions (context change, step 6→7)
- [ ] ⭐ Phone-only schools: call script instead of silent exclusion
- [ ] Steps 2, 6 and 8 designed as interfaces — **Workshop 2**

## 7. What this changed about our approach

1. **We had no trigger.** `CLAUDE.md` task 5 began at "red zone" — a screen, not a reason. Missing
   trigger was the first defect Iulia named in her worked example. The Formular 177 sponsorship
   cycle supplies one, and it is verified.
2. **We had no per-step contracts.** `MATCHMAKING.md` specs each job in isolation and §8 degrades
   *globally*; there was no place where step 4's output was shown to be step 5's input, and no
   per-AI-step unhappy path. That is §3 and §4 above.
3. **We had three personas and needed one.** §1 picks one and demotes the rest to actors.
4. **Steps 2, 6 and 8 are the Workshop 2 brief** — the three human decisions are precisely the
   screens that must not need explaining.
5. **Her "every field cites its source" is a better argument than ours.** The repo justifies J1's
   verbatim `evidence` span as a groundedness check. The stronger reason is the reviewer's: it tells
   the human *where to look*, so oversight does not mean redoing the work. Same mechanism, and the
   better sentence for the pitch.
6. **`roma_inclusion` needs an unprompted explanation** — §5.
