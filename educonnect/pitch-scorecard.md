# Pitch scorecard: EduConnect

*Skill: startup-pitch | Generated: 2026-09-12*

Scored against the 5-minute script (`pitch-5min.md`) and the page it drives (`app/pitch.html`).
Scored honestly — a high score on a weak pitch is useless in front of a real jury.

---

## What changed, and why

The team doc ordered the pitch **discovery → persona → workflow → demo → evals**. That is the order
of a report, not of an argument. Two problems with it:

1. **The strongest material was seventh.** The finding that the ministry's own risk list catches 19%
   of the national worst quartile, and that 789 rural schools receive nothing at all, sat inside the
   demo section at minute 2:25. The framework's rule is that you earn each additional minute — put
   the most impressive thing right after "what you do."
2. **The time was allocated against the scoring.** Each criterion is worth 25%. The doc gave evals
   and fallback **0:15**, which is 5% of the time for 25% of the score, and gave discovery+persona
   1:40, which is 33% of the time for the criterion where the evidence is weakest.

New order, insight-led: **what we do → the finding → who is stuck → how it works → demo → evals → the ask.**

| Section | Doc | Now | Why |
| --- | --- | --- | --- |
| Ce facem | in 1:05 block | 0:30 | Two sentences and a named school. The opener is now its own beat. |
| Ce am aflat (insight) | buried at 2:25 | 0:40 | Leads. It is the most impressive, most checkable thing you have. |
| Cine e blocat (persona) | 0:35 | 0:30 | Trimmed. Two quotes and one closing line. |
| Cum funcționează | 0:50 | 0:45 | Same content, plus the model-vs-arithmetic split moved up front. |
| Demo | 2:15 | 1:50 | Still the biggest block, now one path end to end. |
| Evals & fallback | 0:15 | 0:35 | 25% of the score. Was 5% of the time. |
| Ce cerem | absent | 0:10 | The doc had no ask at all. |

The page also gained a closing ask section that did not exist, and the whole narrative was reordered
to match the script, so the page and the spoken pitch are now the same argument.

---

## Scorecard

| Dimension | Score | Rationale |
| --- | --- | --- |
| **Clarity** — can someone explain what you do after 2 sentences? | 9 | "Arată care școli au cei mai mulți copii care pică, și care nu primesc niciun ajutor. Apoi găsește organizația și scrie e-mailul." No jargon, no acronyms, and a named school immediately after. |
| **Strength sequencing** — is the most impressive element in the first 60 seconds? | 8 | The 19% / 789 finding now lands at 0:30. Loses a point because the aha needs the 1,320 denominator said out loud, which costs a few seconds. |
| **Traction honesty** — accurate, timeframed, real? | 6 | There is no traction in the commercial sense: no users, no NGO contacted, no reply. The script says so rather than dressing it up, which is the right call, but it is still a real gap. |
| **Insight quality** — genuinely non-obvious? | 9 | Two independent insights: the coverage gap nobody had measured, and "the register says where NGOs are registered, not where they work." Both are checkable by a judge in seconds. |
| **Market sizing** — bottom-up with clear assumptions? | 7 | Fully bottom-up: 4,205 rural schools → 1,320 in the national worst quartile → 789 with nothing. Every step is a filter a judge can rerun. No monetary sizing, which is correct for a civic pitch but caps the score. |
| **Business model** — one model, clearly stated? | 4 | Absent by choice. In front of a civic jury with 5 minutes it is not what is scored, but "how does this survive after the hackathon" is a likely Q&A question with no prepared answer. |
| **Team credentials** — specific accomplishments? | 3 | The pitch has no team section at all. Defensible at a hackathon where the jury already knows the teams, but it means one of the framework's eight elements is simply missing. |
| **Ask clarity** — amount + milestones + timeframe? | 8 | Now present and specific: Călărași, the ISJ plus three organisations, 30 days to the first observed response data. Not 10 only because the "who exactly" is a role, not a named contact. |
| **Overall** | **54 / 80** | |

**Verdict: 50–64 — ready to pitch, with caveats. Address the weak dimensions first.**

### Fixes for everything below 7

**Business model (4).** Do not add a slide. Prepare one sentence for Q&A: who pays for this to exist
in year two. The honest options are a county inspectorate or ministry programme adopting it as a
targeting tool, or an NGO consortium funding the data layer they all currently rebuild separately.
Pick one and be able to say it in a sentence.

**Team (3).** Add one line to the closing, not a section: who built what, in what time, with one
verifiable accomplishment each. At a hackathon "we built the model and the app in 48 hours on real
ministry data" is itself the credential.

**Traction honesty (6).** The strongest available substitute for traction is the 30-day pilot
commitment already in the ask. Consider naming one organisation you would contact first and why —
it turns an abstract ask into a concrete next step.

---

## Delivery tips

- **The 60-second rule.** If the first 60 seconds are not compelling, the rest does not matter.
  Your first 60 seconds are now the two sentences, the Cojasca example, and the 789. That is a
  strong opening — rehearse exactly that minute more than anything else.
- **Pause after the insight.** Two full seconds after "Nimeni nu le-a pus una lângă alta." Let it
  land. If a judge reacts, let them talk; the more they talk, the better you score.
- **Own the denominators.** Every number on the page has one. If asked "1,320 of what", the answer
  is immediate: the national worst quartile, urban included, 1,583 schools, of which 1,320 rural.
- **Handle "I don't know" well.** For the classification accuracy question, "we have the bar, the
  sample and the baseline; the measured number is not in yet" is a strong answer. Inventing one is
  the only way to lose that exchange.
- **Do not thank the jury at the end.** It deflates the ask. Say the ask and stop.

---

## Red Flags

1. **The interview count contradicts itself across your own documents.** The pitch tab says 5
   interviews (2 NGOs, 2 teachers, 1 director). The Interview Outcomes tab in the same document
   describes 3, and those were run for the earlier food-redistribution idea. The project notes say
   none were run for the product you shipped. The page now says the interviews are the reason you
   pivoted and does not state a count. **Agree the number in the team before you present it**, and
   say only what you can defend if asked for names and roles.
2. **The persona quotes are written by the team, not said by anyone.** They are fine as persona
   voice on the page. They are fabricated evidence the moment anyone introduces them with
   "ne-a spus un director".
3. **No measured accuracy figure exists for the classification step yet.** The script and the page
   both say this explicitly. Do not replace it with an estimate.

## Yellow Flags

1. **The live demo is 37% of the time.** If it fails you lose more than one criterion. The backup
   recording is not optional, and `localStorage` must be cleared before the run.
2. **15.5% (Eurostat) and 19.7% (MEC) measure different things** — early leaving among 18–24 year
   olds versus cumulative cohort loss over nine years. Never put them side by side without saying
   which is which.
3. **Two of the eight framework elements are absent** (team, business model). Deliberate for this
   audience, but know that they are missing rather than discovering it during Q&A.

## Sources

- Framework: `startup-pitch` skill, `references/pitch-frameworks.md` (8 elements, insight-led
  template, delivery principles) and `references/honesty-protocol.md`.
- Original structure and section text: team doc *CivicP-Team1*, tab "Date pt pitch".
- All school and coverage figures: recomputed from `out/schools_need_index.csv`, 12 September 2026.
- Judging criteria and weights: event brief, four areas at 25% each.
