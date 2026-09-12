# Eval results — J1 (NGO purpose → education relevance)

Run 12 Sept 2026. Spec: `MATCHMAKING.md` §9.

## Status, stated plainly

| Artifact | State |
|---|---|
| `model/eval_ngos.js` harness | exists, runs |
| `out/ngo_gold_sample.csv` — 120 stratified rows | exists |
| `out/ngo_gold.csv` — the same 120 rows, **labelled** | exists, **model-labelled, not human gold** |
| `out/ngo_profiles.json` — the model's predictions | **does not exist. J1 has never been run** (no `ANTHROPIC_API_KEY`) |

So there is **no measured score for J1 itself**. What is measured below is the
**baseline it replaces** — the name regex that decides the displayed list today.
That number needs no API call, and it is the one that justifies the job existing.

### The labels are model-generated

All 120 rows were labelled by Claude Opus 5 against the classifier's own rubric
(`model/classify_ngos.js` SYSTEM). **This is silver, not gold.** A model labelling the
task another model is scored on shares its blind spots, and the two models are not
independent. Treat every figure here as provisional until a person relabels the sheet;
the `notes` column of `out/ngo_gold.csv` says so on every row. Scoring J1 against these
labels would be close to self-evaluation and is **not** reported as a result.

## Labelling rubric

`education_relevant = 1` only where the stated purpose describes a **concrete activity
aimed at pupils, schools, teachers or parents** — tutoring, scholarships, after-school,
transport, meals, mentoring, careers guidance, dropout prevention, school inclusion.
Negative: generic charter boilerplate ("educarea tinerilor", "activități educative"),
credit unions for teaching staff, parent associations that administer a school fund with
no activity described, adult-only or corporate training.

**14 of 120 rows (11.7%) are positive.**

## Baseline — the name regex currently deciding the list

|  | precision | recall | F1 | support |
|---|---|---|---|---|
| education | 11.1% | 71.4% | 19.2% | 14 |
| not education | 86.7% | 24.5% | 38.2% | 106 |

**macro-F1 28.7% — FAIL against the 80.0% bar in §9.4.**

Confusion (rows = gold, cols = predicted):

|  | pred yes | pred no |
|---|---|---|
| **gold yes** | 10 | 4 |
| **gold no** | 80 | 26 |

It says yes to 90 of 120 and is right about 10 of them. It also misses 4 of the 14 real
ones. Per stratum, it fires on 48/48 suspect-family rows and 42/42 name-education rows,
and on 0/30 name-neutral rows — where 4 of the 14 positives live. Inside the list it is
close to a constant function, which is what "no discriminating power left" means.

### The baseline number is contaminated too, in the direction that flatters us

Raised by session 1 and accepted. The labels were made against the rubric in
`model/classify_ngos.js`, and that rubric **names credit unions, parent associations and
trade unions as negatives** — which is precisely and only what a regex over names cannot
see. So 28.7% is not "the regex is bad at the task". It is **"the regex disagrees with our
rubric"**, and the gap is guaranteed by construction before any measurement happens. We
wrote the rubric and we labelled against it; a jury asking who did both gets the same
answer twice.

That does not make it useless, it makes it a narrower claim: it quantifies **how much of
the displayed list our rubric rejects**. That is the reweighted estimate below, and that
estimate is the honest headline. **Lead with the interval, not the macro-F1.**

## Reweighted to the whole displayed list

Sample rates weighted by the strata's real sizes (845 name_edu · 282 suspect_family ·
133 name_neutral, of 1,260 displayed rows):

> **≈148 of the 1,260 organisations on screen (11.7%) are genuinely education-relevant.
> ≈1,112 (88.3%) should not be there.**

On n=120 the 95% interval is roughly **5%–19%**, so read it as "about one in eight,
not one in three". Narrowing it needs more labelled rows, not a better model.

## What this does and does not license

- **Licensed:** "the keyword filter is wrong about roughly seven rows in eight, measured
  on a stratified sample of 120, and that is why a classification step exists."
- **Not licensed:** any claim about J1's accuracy. It has not run.
- **Not licensed:** treating 11.7% as exact. The interval is wide and the labels are
  a model's.

## To finish this properly

1. A person relabels `out/ngo_gold.csv` (120 rows, ~600 chars each). Replaces silver with gold.
2. `ANTHROPIC_API_KEY=… npm run classify` — measured at ~$1.80 and ~5 min for 1,252 organisations.
3. `npm run eval` — then J1 gets its own macro-F1, abstention rate and confusion matrix,
   against the baseline above.
