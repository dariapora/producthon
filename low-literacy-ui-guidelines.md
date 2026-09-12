# User interface guidelines for people with low or no literacy

A practical standard for interfaces that prioritize visual recognition, voice guidance, direct touch, safe completion, and recovery without depending on reading.

## Core model

**See → Hear → Recognize → Act → Confirm**

Use this test on every critical screen:

> If all words are hidden, can a user still identify the primary action, predict what it will do, recover from an error, and confirm the result?

These guidelines are intended for product designers, content designers, researchers, and engineers working on mobile, web, kiosk, or public-service interfaces.

## Visual system

### Typography

Use **Montserrat** as the sole interface typeface.

```css
font-family: "Montserrat", sans-serif;
```

Recommended type scale:

| Role | Font | Suggested size |
| --- | --- | ---: |
| Display | Montserrat Bold | 30 px |
| Screen title | Montserrat Bold | 22 px |
| Primary action | Montserrat SemiBold | 17 px |
| Body and instructions | Montserrat Regular | 16 px |
| Supporting control | Montserrat Medium | 14 px |

Use weight, scale, and spacing to create hierarchy. Do not rely on decorative type, italics, capitalization, or color as the only cue.

### Complementary color palette

The palette is derived from the visible colors on [HartaEdu](https://hartaedu.ro/) by rotating their hue 180 degrees on the HSL color wheel.

| HartaEdu color | Complement | Recommended use |
| --- | --- | --- |
| Purple `#522E81` | Green `#5D812E` | Brand accent and selection |
| Violet `#4E3C86` | Olive `#74863C` | Secondary accent |
| Magenta `#F54CA8` | Mint `#4CF599` | Bright highlight with dark text |

Production tokens:

```css
:root {
  --color-primary: #3f5b1e;
  --color-primary-complement: #5d812e;
  --color-secondary-complement: #74863c;
  --color-bright-accent: #4cf599;
  --color-selected: #e7f5d6;
  --color-surface: #f4f8ef;
  --color-canvas: #ffffff;
  --color-ink: #11170d;
  --color-muted: #58634f;
  --color-border: #d8e2cf;
  --color-error: #9d2e2e;
  --color-warning: #8a4b00;
}
```

Use white text on `--color-primary`. Use dark text on the bright mint. Never communicate selection, urgency, success, or failure through color alone; pair color with shape, outline, position, imagery, text, or audio.

## Principles

### 1. Design for recognition before reading

- Use a recognizable photo, illustration, or tested icon for every important action.
- Prefer real-world objects and actions to abstract symbols.
- Keep text optional or supplementary wherever possible.
- Use the same visual for the same concept throughout the product.
- Pair potentially ambiguous visuals with replayable audio.

Avoid text-only buttons, abbreviations, unfamiliar symbols, and legacy digital metaphors unless testing proves that users understand them.

### 2. Treat audio as a primary interaction channel

- Provide a visible **Listen** control for choices and instructions.
- Speak consequential values such as names, quantities, dates, and money.
- Let users replay audio without leaving the screen.
- Speak confirmation, success, failure, and recovery instructions.
- Offer voice input only when privacy, noise, and recognition accuracy are acceptable.
- Always provide a direct non-voice alternative.

### 3. Use the user’s spoken language

Localize the complete experience rather than translating labels alone:

- Interface text
- Recorded instructions
- Voice input and output
- Names and examples
- Units, dates, and currency
- Images and cultural references

Write audio scripts for listening: use one idea per sentence, common verbs, concrete nouns, and action-first phrasing.

### 4. Make one screen answer one question

Prefer a guided sequence:

**Choose person → Choose amount → Check → Confirm → Done**

Avoid large forms, dense dashboards, and screens with several equally prominent actions.

### 5. Prefer direct touch

- Make visible objects directly tappable.
- Use the whole card as the target, not a small icon inside it.
- Do not require hidden gestures, long presses, or nested menus.
- Keep Home, Back, and Help in stable positions.
- Show an obvious selected and pressed state.

### 6. Design for safe completion

Before an irreversible or consequential action, repeat:

- The person or object involved
- The quantity, amount, or date
- What will happen next

Provide clearly distinct **Back** and **Confirm** actions. After completion, show the result visually, speak it, and provide one obvious route home.

## Pictures and symbols

Use the representation that requires the least interpretation:

1. Familiar photograph
2. Contextual illustration showing an action
3. Tested symbol or icon
4. Short text as reinforcement

### Icon rules

- Pair unfamiliar icons with spoken guidance and an optional short label.
- Use one icon for one concept everywhere.
- Show actions, not only objects. For example, a hand placing a card into a slot is clearer than a card alone.
- Use locally recognizable clothing, homes, money, crops, transportation, and gestures.
- Do not assume an icon is universal because designers recognize it.
- Do not encode meaning through color alone.

**Suggested comprehension gate:** At least 8 of 10 representative users should identify the intended meaning without being taught. If they cannot, replace the visual instead of adding more explanatory text.

## Interaction specifications

| Property | Requirement |
| --- | --- |
| Minimum touch target | 48 × 48 px |
| Preferred primary target | 56–64 px high |
| Minimum gap between targets | 8 px |
| Preferred gap for similar choices | 12–16 px |
| Dominant primary actions | One per screen |
| Required hidden gestures | None |

Every interaction needs three forms of feedback:

1. **Pressed:** Change fill, outline, scale, or motion immediately.
2. **Processing:** Show a simple animation and speak “Please wait” when a delay lasts longer than one second.
3. **Result:** Show and speak success, failure, or the next required action.

Avoid typing when users can tap, choose, photograph, scan, or speak. For numbers, use a dedicated numeric keypad with large digits, spoken values, a clear delete control, and an explicit confirmation screen.

## Navigation and information architecture

- Keep workflows shallow and predictable.
- Present no more than four to six meaningful choices at once unless testing supports more.
- Keep Home, Back, Listen, and Help visually stable.
- Avoid hamburger menus as the primary route through critical tasks.
- Avoid unconventional navigation and hidden gestures.
- Show progress with recognizable visuals, not text alone.

Example:

**Person → Money → Check → Done**

## Reusable components

### Visual action card

The primary reusable pattern combines:

**Photo or illustration + optional short label + audio + one large touch target**

| Property | Specification |
| --- | --- |
| Target | Minimum 96 × 112 px |
| Corner radius | 12–16 px |
| Central visual | 48–72 px |
| Label | 16–18 px, Montserrat SemiBold |
| Audio control | Separate 48 × 48 px target |
| Required states | Default, pressed, selected, loading, disabled, error |

The selected state must use both a pale fill and a strong outline. The entire card must be tappable.

### Listen control

- Use a familiar speaker shape.
- Keep it visible and in a stable position.
- Provide at least a 48 × 48 px target.
- Replay the relevant screen instruction or item name.
- Do not open a separate help screen merely to play audio.

### Progress indicator

Use a short visual path such as:

**Person → Amount → Check → Done**

Mark the current stage with position, fill, and shape. Do not rely only on text such as “Step 2 of 4.”

## System states

### Confirmation

- Repeat the selected person or object visually.
- Show and speak the amount, date, or quantity.
- State the consequence in one short sentence.
- Provide distinct Back and Confirm controls.

### Success

- Show a completed-result image or check symbol.
- Speak exactly what happened.
- Display the relevant person, object, or quantity.
- Present one obvious next action, usually Home.

### Error

- Point visually to the failed object or step.
- Explain the problem in plain speech.
- Offer one immediate recovery action.
- Preserve prior choices where it is safe to do so.

Avoid technical codes such as “Error 402” unless they are shown only as secondary diagnostic information.

### Timeout or lost connection

- Preserve entered choices where safe.
- Explain what happened with a visual and spoken message.
- Offer Retry or Resume as a large direct action.
- Do not force the user to restart without explanation.

## Content patterns

Avoid:

> Error 402: Invalid beneficiary information.

Use:

> We could not find this person. Choose another photo or listen for help.

Avoid:

> Transaction successful.

Use a completed-result image and spoken confirmation such as:

> 500 lei was sent to Ana.

## Release checklist

### Meaning

- [ ] Primary choices are recognizable without reading.
- [ ] Icons, photos, and gestures were tested with the intended community.
- [ ] The same visual always has the same meaning.
- [ ] Color is never the only indicator.

### Voice

- [ ] Every instruction and consequential value can be heard.
- [ ] Audio uses the local spoken language.
- [ ] Audio can be replayed.
- [ ] A non-voice path exists for noise, privacy, or recognition failure.

### Interaction

- [ ] Touch targets are at least 48 px and clearly separated.
- [ ] Every tap produces immediate visible feedback.
- [ ] No critical task depends on a hidden gesture or deep menu.
- [ ] One action is visually dominant on each screen.

### Safety

- [ ] Consequential actions repeat the person, object, quantity, and result.
- [ ] Errors explain what happened and offer one recovery action.
- [ ] Success is visible, spoken, and returns to a known place.
- [ ] Prior input is preserved after recoverable errors.

### Field testing

- [ ] Participants receive a real goal without being taught the interface.
- [ ] The team measures first-tap accuracy and task completion.
- [ ] The team records requests for help and error recovery.
- [ ] Participants explain what each important visual means.
- [ ] The design is changed when meaning is unclear instead of training users around it.

## Scope and evidence

These guidelines are research-informed starting points, not universal rules. Literacy, language, vision, hearing, dexterity, memory, and experience with digital devices vary independently. Do not infer one ability from another.

The source review notes that design effectiveness can vary by platform, country, and culture. Validate critical imagery, language, and task flows with the intended community.

### Research source

Islam, M. N., Khan, N. I., and Sarker, I. H. (2023). “Designing User Interfaces for Illiterate and Semi-Literate Users: A Systematic Review and Future Research Agenda.” *SAGE Open*. [https://doi.org/10.1177/21582440231172741](https://doi.org/10.1177/21582440231172741)

The review screened 527 records, included 45 studies, identified 16 design considerations, and grouped practical rules into five areas: text, interaction, pictography, audio-video, and information architecture.
