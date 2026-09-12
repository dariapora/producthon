# Motion — direction and shared vocabulary

Two artifacts, two different jobs. **Do not mix them.**

| | `app/index.html` — the tool | `app/pitch.html` — the pitch |
|---|---|---|
| Read as | scanned and operated | watched, once, top to bottom |
| Frequency tier | occasional → tens/day | rare / first-time |
| Motion budget | four surgical additions, nothing more | this is where the delight budget lives |
| Theme | theme-aware (project convention) | **committed dark** — deliberate, see below |
| Owner | session 1 | session 2 |

The tool is close to right already. The reason the pitch exists as a separate file is that
scroll-driven narrative and long showy beats *hinder* a functional data tool and *help* a
five-minute explanation — and separating them means the pitch can be ambitious without putting
criterion #5 (shippability of the tool) at risk.

## Tokens — canonical, use these everywhere

The tool currently inlines its curves as literals. Same values, now named. Adopt in both files;
never invent a parallel scale.

```css
:root {
  /* curves — the tool's existing expo-out is the house curve, keep it */
  --ease-out:      cubic-bezier(.23, 1, .32, 1);
  --ease-in-out:   cubic-bezier(.77, 0, .175, 1);
  --ease-drawer:   cubic-bezier(.32, .72, 0, 1);

  /* durations */
  --dur-press:     160ms;   /* press feedback */
  --dur-swap:      200ms;   /* content swap, card entrance */
  --dur-reorder:   240ms;   /* FLIP list reorder */
  --dur-reveal:    600ms;   /* scroll reveal, pitch only */

  /* stagger */
  --stag-row:       30ms;
  --stag-card:      40ms;
}
```

**Animate `transform` and `opacity` only.** Anything else on 5,877 nodes drops frames.

## Reduced motion

Gentler, never zero — a reader who asked for less motion still needs to see that something
changed. Every reveal collapses to a 120ms opacity fade; the canvas layer renders one static
frame and stops its rAF loop.

```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: .01ms !important; transition-duration: 120ms !important; }
  .reveal { transform: none !important; }
}
```

## Libraries — none, and that is the point

**No library is loaded. No build step. Both files still open with `open app/*.html`.**

That is not a limitation, it is part of the pitch: a judge can open the file offline. The CSP
would allow cdnjs, and GSAP/Motion One are both there — we are choosing not to.

- **Scroll reveals** → `IntersectionObserver` toggling a class, CSS transitions do the work.
  Not `animation-timeline: view()` — support is still uneven and the demo machine is unknown.
- **Liquid / ambient layer** → Canvas 2D, one rAF loop, ~80 lines. Not WebGL, not three.js.
- **List reorder** → FLIP by hand: measure, invert with `translateY`, transition to 0.

If any of these needs a library, the answer is that the effect is too expensive for the deadline.

## The pitch's dark ground — a deliberate departure

`CLAUDE.md` requires the tool to be theme-aware. `pitch.html` commits to a single dark world
instead, because it is projected in a room rather than read at a desk, and a half-committed
palette reads worse than a chosen one. Every colour is painted explicitly from a token, so it
holds on any host background. **This exemption applies to `pitch.html` only.**

## What motion is allowed to say

Motion here encodes data or it does not ship. Three examples, all built:

- The cohort dots drain at **19.7% rural vs 2.8% urban** — the rate *is* the animation.
- Map dots enter staggered **by need percentile**, so the worst schools land last and the eye
  follows severity without a legend.
- The coverage bar splits at **248 of 1,320** — the 19% is the geometry, not a caption.

Decoration that carries no information belongs in the ambient canvas layer behind the hero, and
nowhere else. Specifically **not** over the map, the stat tiles or the rankings: those are
evidence a judge is reading, and moving them undermines the provenance claim the whole pitch
rests on.

## Tool-side work — shipped 12 Sept

Tokens are adopted in `app/index.html`; the two files now share one vocabulary.

- ✅ **FLIP reorder on the proximity↔severity slider.** Measure → re-render → invert → play,
  transform only, 25ms stagger by rank. Verified by transition events, not by eye. **Scoped to
  `#mW` and `#mMetric` only** — `#mRad`, the base drag and the filter checkboxes re-render too, and
  the drag re-renders every rAF, so FLIP there would animate against a moving base and fight the
  pointer. **Reordering controls animate; everything else stays instant.** That scoping is the
  interesting part of the decision, not the FLIP itself.
- ✅ **Tab swap** — `rise` with a 30ms cascade, first 14 rows only, and only when the view actually
  changed, so re-filtering inside a tab doesn't re-cascade.
- ✅ **Shortlist entrance** — already existed at `--stag-card` reusing `rise`; left alone rather
  than introducing a second vocabulary.
- ✅ **`:active` parity** — `scale(.97)` on `.btn`/`.more`, `.99` on `.crow`.

### ❌ Declined — map first paint staggered by need percentile

**Do not re-propose this before the pitch.** It requires moving the 5,877 `#dots` to Canvas, and
those nodes carry four working behaviours: hover tooltips (`.hit` targets), zoom counter-scaling
(radii recomputed per level so points separate rather than magnify), pick rings, and drag
hit-testing. Rewriting all four to buy a one-time 600ms flourish is a bad trade — and it is the
same category as the page-load hero already rejected: **the demo pays the cost on every reload.**

If the map ever moves to Canvas for *performance* reasons, do the stagger then — the recipe is
above and it is genuinely good. It just isn't worth its own rewrite.

Rejected and why: liquid graphics over the map (functional data, decoration hinders); count-up on
the stat tiles (a judge reading a number that is still wrong); scroll-jacking the tool; hover
effects on 5,877 map targets; a page-load hero on the tool, which every demo reload would pay for.
