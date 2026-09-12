# Error categories — Puntea 8→9

The failure taxonomy for the AI jobs, one row per way an output can be wrong, each with the
denominator it would be counted over and the §9 check that would catch it. Form borrowed from the
Lovelaice eval dashboard shown at the Saturday workshop (provenance at the bottom); **the
categories, the severity scale and the denominators are ours**, derived from `MATCHMAKING.md` §6
and §9, not from that screen.

This is a companion to `results.md`, not a replacement: `results.md` reports what was measured,
this file enumerates what could go wrong and says, per row, whether anyone has looked.

## How to read `Occurrences`

**`0/N` here means "0 observed out of N gradeable", and `–/N` means nobody has looked.** Most rows
below are `–`. That is the honest state, and writing it as `0` would be the single worst thing this
file could do — a table of zeros reads as a clean bill of health when it is an empty one. Any row
whose check has never been executed says so in `Status`.

Denominators come from §9.1: **J1 120 · J2 60 · J3 30 · J4 30 · J5 40**, plus the **50** sampled
J3/J4 outputs of the §9.6.2 groundedness gate.

## Severity — who pays, not how it looks

| | Meaning |
|---|---|
| **Critical** | A child's data, or a claim that would end the ISJ relationship. No tolerable rate; fail closed. |
| **High** | A real person acts on a false statement — an email sent to the wrong school, an NGO's commitment invented for them. Costs trust we cannot re-earn inside a pilot. |
| **Medium** | The output is wrong but visibly wrong; the user discards it and loses time. |
| **Low** | Cosmetic or verbose; the user still gets the right answer. |

The Lovelaice screen tagged every category `Low` by default. Default severity is not a judgement —
below, each one is argued.

## The categories

| # | Category | What it looks like here | Job | Denominator | Occurrences | Severity | Check |
|---|---|---|---|---|---|---|---|
| 1 | **Number not present in the input** | A pupil count, pass rate or deprivation figure appears in an explanation or an email that is in no input field. The one failure that destroys "a formula you can recompute on paper". | J3, J4 | 50 sampled | –/50 | **Critical** | §9.6.2 hard gate — regex every numeral in the output back to the payload, fail closed to the §8 template |
| 2 | **Child-level data reaches a prompt or storage** | A tip naming a pupil passes the guard. | J6 | adversarial set | –/– | **Critical** | §9.0c — report **recall**, accept precision loss, never a single F1 |
| 3 | **Ranked list of localities labelled by failure** | Any output path that produces "worst schools in county X" as a shareable artefact. | all | — | –/– | **Critical** | §9.6.3, structural — no path may produce it |
| 4 | **Commitment invented on an NGO's behalf** | The draft says an organisation *will* run a programme at that school. We are not authorised to promise anyone's time. | J4 | 30 | –/30 | **High** | §9.0b binary 3 |
| 5 | **Wrong school or județ in a draft** | Right text, wrong recipient — indistinguishable from a mail merge. | J4 | 30 | –/30 | **High** | §9.0b binary 1 |
| 6 | **Stale `stage` — `running` for a dead intent** | An association that stated an intent in 2013 and did nothing since is matched to a failing school as active. §9.3 calls this the most embarrassing output the system can produce. | J1 | 120 | –/120 | **High** | recall ≥ 0.85 on `running`, reported apart from the other J1 fields; abstain rather than guess |
| 7 | **Silent geographic widening** | A national-scope NGO's service area is expanded to counties it never stated. The common J2 failure, and it manufactures matches out of nothing. | J2 | 60 | –/60 | **High** | §9.3 — exact-match on the județ set, **reported separately for national-scope rows** |
| 8 | **Tip guessed onto a school instead of held** | An ambiguous tip is resolved at low confidence. A tip attached to the wrong school is worse than an unattached tip. | J5 | 40 | –/40 | **High** | §9.0c — report resolution accuracy **and abstention rate**; holding is success |
| 9 | **Evidence span is not verbatim** | `evidence` / `quote` is paraphrased rather than a substring of the input. It is the groundedness check *and* the first thing a human reviewer reads; if it drifts, every other field is unverifiable. | J1, J3b, J5 | 120 | –/120 | **High** | reject any response whose evidence is not a substring (§6, J1 spec) |
| 10 | **Two drafts in one run share a recipient** | The inbox-grouping step didn't group — the same person gets three mails, each opening as if we'd never heard of them. | J4 | 30 | –/30 | **High** | §9.0b binary 5 |
| 11 | **Irrelevant match surfaced** | A school is matched to an organisation that cannot serve it — the direct analogue of the Lovelaice "irrelevant sources" row. Distinct from #7: the geography is right and the *programme* is wrong. | J1→score | 120 | –/120 | **Medium** | per-class F1, macro-F1 ≥ 0.80, weighted to recall on *mediere romi* / *educație remedială* |
| 12 | **Truncated structured output** | JSON cut mid-object. Romanian tokenises worse than English — this is why J1 runs `max_tokens` 512 rather than the spec's 256, and a truncated response is a wholly wasted call, not a degraded one. | J1, J3b | 120 | –/120 | **Medium** | schema parse failure rate, counted per run |
| 13 | **Unsolicited commentary on a structured field** | Editorial text appended around the JSON, or an email that explains itself instead of asking. | J1, J4 | 120 / 30 | –/– | **Low** | schema validation (J1); tone ≥ 4 median (J4) |
| 14 | **Over-length output** | J4 past the 120–160 word bound, J3 past two sentences. Length is a spec field here, so this is code-gradeable and costs nothing to check. | J3, J4 | 30 | –/30 | **Low** | word count assertion |
| 15 | **Nondeterminism** | The same school/NGO pair scores differently twice with the API off. | scorer | — | –/– | **Medium** | §9.6.1 |

Rows 1–3 are the fail-closed set: they have no acceptable rate, and each already has a structural
guard specified rather than a threshold. Rows 4, 5, 10 and 14 need no judge and no key — they are
code-gradeable today against 30 drafts.

## Status, stated plainly

**Not one row above has been measured.** The reason is in `results.md` and §9's state block: J1 has
a harness, a 120-row sheet and a rubric and has **never been run** (no `ANTHROPIC_API_KEY`, so
`out/ngo_profiles.json` does not exist), J3 is deliberately demoted to a template with the LLM
behind an "explică mai mult" control, and J4 on a fresh clone has no addresses to draft to
(`app/contacts.js` is gitignored). The only measured figure we hold is the **baseline name regex**:
macro-F1 **28.7%**, FAIL against the 80% bar.

The cheapest honest progress is not J1. It is **rows 4, 5, 10 and 14** — four binary checks over 30
drafts, no API key, no hand-labelling — and **§9.5**, the held-out geography test, which scores J1+J2
against World Vision / Teach for Romania / Junior Achievement's published county lists without a
single hand-drawn label.

## What to say if asked about this table on Sunday

That every category here is argued from a cost to a real person, that fifteen of them are unmeasured
and named as unmeasured, and that the four we can grade without a key are the ones being graded
first. A taxonomy with honest blanks is evidence of criterion #2; the same taxonomy filled with
zeros would be evidence of the opposite.

---

### Provenance

The shape of this table — categories with description, occurrences, severity, shift — is taken from
a Lovelaice experiment (**LCA-9**, `lovelaice_json`, "Sanity check on just 2 test cases") projected
at the workshop, eMAG HQ, 12 Sept 2026. Its five categories were *failed to retrieve LinkedIn
profile · incomplete output · unsolicited commentary added to output · excessively verbose response
· irrelevant sources included*; they scored an agent that writes product reports and have no subject
overlap with this project. Categories 12, 13, 14 and 11 above are their adaptations; the rest are ours.

The useful part was the warning, not the taxonomy. Every row on that screen read **0/360 (0%),
severity Low, first-seen empty**, under a header saying *Evaluation in Progress* — while the
description of the first category asserted it "was the most frequently observed failure". Named,
severity-tagged, apparently-measured categories, with nothing measured behind them. Hence the
`–/N` convention at the top of this file.
