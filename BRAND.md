# BRAND.md — brand & design system (propunere)

**Status: applied to `app/index.html` (12 Sept).** The visual system below is live in the tool —
palette, Inter, type scale, 12px cards, 44px tap targets, blue CTAs, and the EN performance badge.
**Not yet done:** `app/pitch.html` still runs its own committed-dark palette (deliberate — it is a
narrative page, see `MOTION.md`), and §13 (all user-facing copy in Romanian) is unapplied on the
NGO/analyst half of the tool, which is still English. Motion tokens stay in `MOTION.md` — this file
does not override them.

Scope of this document: establish the global visual language first. **Do not build additional
product functionality on the back of it** — the point is that every subsequent page uses the same
components.

---

## 1. Cine e utilizatorul

Aplicație de educație în limba română, pentru **directori de școală, tipic în jur de 50 de ani**.

Aplicația îi ajută să:

- înțeleagă performanța școlii lor la Evaluarea Națională;
- compare rezultatele cu media pe județ și pe țară;
- identifice școlile care ar putea avea nevoie de sprijin suplimentar;
- descopere ONG-uri din apropiere care oferă sprijin educațional;
- contacteze ușor ONG-ul potrivit.

Experiența trebuie să fie **de încredere, calmă, accesibilă și orientată spre acțiune**.

Produsul **NU** trebuie să pară: un dashboard complex de analytics, un produs SaaS corporate, sau un
site guvernamental învechit.

## 2. Principiul UX central

> **„De la date la sprijin pentru elevi.”**

Fiecare ecran trebuie să îl ajute pe director să răspundă la trei întrebări:

1. **Care este situația?**
2. **Cum mă compar?**
3. **Ce pot face mai departe?**

Prioritate: claritate și acțiuni, nu densitate de date. Informație puțină per ecran, fonturi mari,
contrast ridicat, mult spațiu alb, **maximum un CTA principal per zonă**, limbaj simplu în română.

Directorul trebuie să simtă „înțeleg imediat situația și știu ce pot face”, nu că se uită la un
dashboard statistic complicat.

## 3. Personalitate de brand

Calmă · credibilă · umană · educativă · accesibilă · optimistă · practică.

De evitat: ilustrații excesiv de jucăușe, gradienți, glassmorphism, culori neon, animații excesive,
interfețe „startup-ish” sau exagerat de rotunjite.

## 4. Culori

### Brand

| Rol | Hex | Folosire |
|---|---|---|
| Albastru închis (primar) | `#183B56` | titluri, navigație, etichete importante, stări selectate, text principal |
| Albastru de acțiune | `#2878D0` | butoane primare, linkuri, elemente interactive, outline de selecție pe hartă |
| Background | `#F7F9FC` | fundalul paginii |
| Carduri | `#FFFFFF` | suprafața cardurilor |
| Text secundar | `#5F6B7A` | descrieri, metadate |
| Borduri | `#E2E8F0` | 1px pe carduri și separatoare |

### Performanță EN — sistem semantic, separat de brand

Culorile de performanță **nu** fac parte din paleta de brand și nu se folosesc decorativ.

| Stare | Hex | Prag | Etichetă |
|---|---|---|---|
| 🔴 Roșu | `#D64545` | media EN < 5 | „Sub prag” |
| 🟡 Galben | `#E5A72E` | media EN 5–7 | „Nivel mediu” |
| 🟢 Verde | `#2E8B57` | media EN > 7 | „Rezultate bune” |

**Culoarea nu este niciodată singurul indicator.** Lângă ea afișăm mereu:

- valoarea numerică a mediei EN;
- o etichetă text acolo unde e cazul („Sub prag”, „Nivel mediu”, „Rezultate bune”, „Peste medie”);
- un tooltip sau o explicație contextuală.

**Ton pe stările slabe:** nu folosim „școală slabă”, „școală proastă”, „eșec”. Roșul înseamnă că
*poate fi utilă atenție sau sprijin suplimentar* — atât. (Vezi și convenția din `CLAUDE.md`:
publicăm liste de tip „quick wins” / „nimeni nu e aici”, niciodată un clasament al „celor mai slabe
sate”.)

## 5. Tipografie

**Inter, sans-serif.** Fără fonturi decorative.

| Nivel | Mărime |
|---|---|
| Body | 16–18px |
| Etichete importante | 18–20px |
| Titluri de secțiune | 24–28px |
| Titluri de pagină | 32–36px |
| KPI mari (media EN) | 36–44px |

Line-height confortabil, fără text mic. Un director trebuie să scaneze interfața fără efort.

## 6. Layout

- Mult spațiu alb; layout-uri dense sunt de evitat.
- Lățime maximă de conținut: **1280px**.
- Desktop-first, dar funcțional pe tabletă.
- Sistem de spațiere de **8px**, preferat: 8 · 16 · 24 · 32 · 48 · 64.

## 7. Carduri

Carduri albe pe fundal deschis. Border `1px solid #E2E8F0`, border-radius **12px**, umbre foarte
discrete și doar dacă sunt necesare. Cardurile grupează informație înrudită fără să fragmenteze
interfața.

## 8. Butoane

- **CTA principal:** fundal `#2878D0`, text alb. Exemple: „Vezi școlile”, „Vezi detalii”,
  „Contactează ONG-ul”.
- **Acțiuni secundare:** outline sau text button.
- Înălțime minimă **44px**.
- Etichete clare, orientate spre acțiune. De evitat: „Submit”, „Continue”, „Click here”.

## 9. Hărți

Harta este unul dintre cele mai importante elemente ale produsului: mare și vizual dominantă.
Fundal neutru, granițe clare, cele trei culori semantice.

### Harta României

- Toate județele, colorate după media EN 2026 (< 5 roșu · 5–7 galben · > 7 verde).
- Granițele județelor rămân clar vizibile.
- Tooltip la hover:

  ```
  [Județ]
  Media EN 2026: X.XX
  Media națională: X.XX
  Vezi școlile →
  ```

- La selectare, județul primește un **outline vizibil**, nu doar o schimbare subtilă de culoare.

### Harta de județ

- Școlile apar ca markere, cu același sistem roșu/galben/verde.
- Click pe marker arată: numele școlii · localitatea · media EN 2026 · „Vezi detalii”.
- Câmp de căutare vizibil: **„Caută școala ta”**. Utilizatorul nu trebuie niciodată forțat să își
  găsească școala manual pe hartă.

## 10. Vizualizare de date

Grafice extrem de simple. Fără dashboard-uri de analytics.

Pe pagina de detaliu a școlii, prioritatea vizuală este:

```
MEDIA EN 2026
5.42
↓ 0.31 față de 2025
```

Apoi comparația clară: **Școala ta · Județ · România**, plus un grafic simplu pentru evoluția
2025 → 2026. Utilizatorul trebuie să înțeleagă situația școlii în aproximativ **5 secunde**.

## 11. Descoperirea ONG-urilor

După performanță, tranziție naturală spre acțiune.

Secțiune: **„Resurse disponibile pentru școala ta”**
Subtitlu: *„ONG-uri care pot sprijini elevii și cadrele didactice.”*

Cardul de ONG prioritizează: numele ONG-ului · **distanța în km față de școală** · tipul de sprijin
educațional · o descriere scurtă. Distanța trebuie să fie ușor de identificat vizual.

```
Teach for Romania
8,4 km de școala ta
Pregătire Evaluare Națională · Mentorat · Training profesori
[Vezi detalii]
```

### Pagina de detaliu ONG

Nume · distanța față de școala selectată · descriere scurtă · tipuri de sprijin · date de contact ·
website. CTA principal: **„Contactează ONG-ul”** — va deschide clientul de email implicit printr-un
link `mailto:` cu un template predefinit.

## 12. Navigație

Navigație extrem de simplă, cu breadcrumbs unde ajută:

```
România / Vaslui / Școala Gimnazială X
```

Utilizatorul trebuie să știe mereu unde se află și cum se întoarce la nivelul anterior.

## 13. Limbaj

Tot UI-ul este **în limba română**, direct și orientat spre acțiune.

| Preferăm | În loc de |
|---|---|
| „Cum se compară școala ta” | „Analiză comparativă a performanței” |
| „ONG-uri care pot sprijini școala ta” | „Entități disponibile pentru intervenție educațională” |
| „Vezi detalii” | „Accesează profil” |
| „Contactează ONG-ul” | „Inițiază contact” |

## 14. Accesibilitate

Proiectăm pentru utilizatori care nu sunt neapărat experimentați digital:

- minimum 16px pentru text normal;
- contrast puternic;
- ținte de click mari (min. 44px);
- stări de hover clare;
- focus vizibil la navigarea cu tastatura;
- **niciodată bazat exclusiv pe culoare**;
- navigație simplă, fără interacțiuni ascunse și fără animații inutile.

## 15. Regulă de implementare

Creează componente reutilizabile de design system și folosește-le consecvent în toată aplicația.
Minimum:

- `PrimaryButton`
- `SecondaryButton`
- `PageHeader`
- `Breadcrumbs`
- `KPICard`
- `PerformanceBadge`
- `SchoolMarker`
- `NGOCard`
- `SearchInput`
- `MapTooltip`

Întâi sistemul vizual global; funcționalitatea nouă vine după.

---

## 16. Ce este deja în cod (`app/index.html`, 12 Sept)

Toate culorile stau în tokenii din `:root` — nu există hex hardcodat în afara lor, deci tema se
schimbă dintr-un singur loc. Varianta dark nu e în brand guidelines, dar rămâne (convenție de repo,
`CLAUDE.md`): e derivată din aceeași paletă, nu o a doua identitate.

| Componenta din §15 | În cod |
|---|---|
| `PrimaryButton` | `.btn` — `#2878D0`, text alb, min-height 44px |
| `SecondaryButton` | `.more` — outline albastru, aceeași înălțime |
| `PageHeader` | `header` + `h1`/`.lede` |
| `KPICard` | `.kpi` — etichetă, număr 44px, badge, rândul Școala ta · Județ · România |
| `PerformanceBadge` | `.perf` + `perfBand()` / `perfBadge()` în JS — punct, număr și etichetă |
| `SchoolMarker` | `.dot` pe hartă |
| `NGOCard` | `.ngo`, `.match`, `.ngorow` — distanța e bold, în culoarea textului principal |
| `SearchInput` | `#dirQ`, `#q` — min-height 44px, radius 8px |
| `MapTooltip` | `.tip` — 15px, radius 8px |
| `Breadcrumbs` | **nu există încă** — pagina e single-screen, fără nivele de navigat |

Tokeni noi: `--r-card` (12px), `--r-ctl` (8px), `--tap` (44px).

**Excepții conștiente de la §5 și §13:**

- Etichetele micro (`.label`, `th`, `.pill`, `.badge2`) au rămas la 11–12px uppercase. Sunt etichete
  de coloană, nu text de citit; la 16px ar fi dublat înălțimea tabelului.
- Media din KPI e **cumulată 2023–2026**, nu „EN 2026”, pentru că asta măsoară `meanAvg`. §10 cere
  „MEDIA EN 2026” și delta față de 2025 — ar fi nevoie de o medie pe an în payload, care nu există
  încă. Eticheta din card spune exact ce e, conform `CLAUDE.md` → Claims discipline.
- Media pe județ și pe România sunt medii ale mediilor pe școală, ponderate pe candidați, peste
  școlile care au o medie — numărul de școli e tipărit lângă figură, ca denominatorul să nu circule
  separat.
- Jumătatea ONG/analist a paginii e încă în engleză (§13 neaplicat acolo). Traducerea atinge fraze
  care poartă cifre și denominatoare; e o trecere separată, cu verificare, nu un find-and-replace.
- **Textul badge-ului galben ia culoarea din `--money`, nu din `--sem-y`.** `#E5A72E` ca text pe alb
  nu trece pragul de contrast din §14; conturul și fundalul rămân `--sem-y`, deci semnalul de
  culoare e cel din §4. Intenționat — nu „de aliniat" la `--sem-y`.

**Cea mai importantă excepție: pagina are două scale semafor care merg în direcții opuse.**

| Unde | Roșu înseamnă | Deci |
|---|---|---|
| `.perf` badge, §4 | media EN **sub** 5 | **mic = rău** |
| Harta pe județe | **peste** 25% din școlile rurale fără niciun program | **mare = rău** |
| Punctele pe hartă | mai închis = **mai mulți** elevi sub 5 pe an | **mare = rău** |

Fiecare e corectă în sine — nota mică e rea, acoperirea mică e rea — dar sunt aceleași trei culori
cu polaritate inversată pe același ecran. Ce le ține lizibile este exact regula din §4: **culoarea
nu circulă niciodată singură**, iar aici fiecare scală își poartă eticheta („Sub prag"; „share of
its rural schools with nothing"; „darker = more pupils below 5"). **Nu „armonizați" scalele.** O
trecere care le face să arate la fel va inversa una dintre ele fără să dea vreo eroare, iar
rezultatul e un director care citește roșu ca pe o veste bună.

