# GitHub Workflow Prep (2026)

Tama tiedosto on nopea onboarding-opas uudelle kehittajalle.  
Tavoite: paasta ensimmaisesta paivasta asti tekemaan turvallisia, review-kelpoisia muutoksia yritysymparistossa.

## 1) Tyoelaman perusmalli (aina sama rytmi)

1. **Ymmarra tehtava**  
   - Mitka tiedostot muuttuvat?  
   - Miten muutos verifioidaan?
2. **Luo oma branch**  
   - Ei suoria muutoksia `main`-haaraan.
3. **Tee pieni, testattava muutos**  
   - Pidettava scope pienenna regressioriski.
4. **Aja nopeat tarkistukset**  
   - Sovellus kayntiin, smoke test, mahdolliset lint/test-komennot.
5. **Commit selkealla viestilla**  
   - Kerro miksi muutos tehtiin.
6. **Push + Pull Request**  
   - Reviewta varten tiivis kuvaus + testisuunnitelma.

---

## 2) Branching-kaytanto (suositus)

- **Base branch:** `main`
- **Feature branch naming:** `cursor/<lyhyt-kuvaus>`
- Esimerkkeja:
  - `cursor/handover-docs-engine`
  - `cursor/fix-level-transition-bug`
  - `cursor/add-inventory-ui-polish`

Luo uusi branch:

```bash
git checkout -b cursor/<lyhyt-kuvaus>
```

---

## 3) Pakollinen pre-flight ennen muutoksia

Tarkista aina nykytila:

```bash
git status
git branch --show-current
git log -1 --oneline
```

Jos branch tai status on vaarassa menna sekaisin, pysahdy ja korjaa ensin tila.

---

## 4) Safe git -komennot (aloittelija + tuotanto)

Stagetetaan vain halutut tiedostot:

```bash
git add <file1> <file2> <file3>
```

Commit:

```bash
git commit -m "Short imperative message"
```

Push oma branch:

```bash
git push -u origin <branch-name>
```

Vain stagingin peruutus (ei poista tiedostomuutoksia):

```bash
git restore --staged .
```

Viimeisimman commitin peruutus, mutta muutokset sailyvat:

```bash
git reset --soft HEAD~1
```

---

## 5) Mitä EI tehdä ilman erillista lupaa

- Ei `git push --force` (ellei sovittu prosessi).
- Ei `git reset --hard` (voi tuhota muutoksia).
- Ei suoraa tyoskentelya `main`-haaraan.
- Ei "isoja sekalaisia committeja", jotka vaikeuttavat reviewta.

---

## 6) Commit-viestin malli (toimiva oletus)

Pidä commitit pienina ja tarkoitukseen sidottuina.

Hyva malli:

```text
<verb> <target> and <intent>
```

Esimerkkeja:
- `Harden entity/map handling and sync architecture docs`
- `Fix inventory pickup guard for unknown item types`
- `Update level manager docs to match current behavior`

---

## 7) PR-malli (copy-paste runko)

```md
## Summary
- What changed (1-3 bullets)

## Why
- Why this change matters

## What changed
- File-by-file highlights

## Test plan
- [x] App starts
- [x] Core flow tested
- [x] No obvious regressions

## Risks / Follow-up
- Remaining gaps or next improvements
```

---

## 8) AI-avusteinen kehitys (Cursor/agentit) yrityksessa

Kaksi toimintatilaa:

- **SAFE mode (korkea kontrolli)**  
  - Ei komentoja ilman vahvistusta  
  - Yksi askel kerrallaan  
  - Hyva uusille kehittajille ja kriittisiin repoihin

- **TURBO mode (korkea autonomia)**  
  - Agentti analysoi ja ehdottaa kokonaisuuksia nopeasti  
  - Sopii kokeneille kehittajille, kun review-prosessi on kunnossa

Suositus: aloita SAFE, siirry TURBOon kun luottamus prosessiin kasvaa.

---

## 9) Nopea 15 min "battle rhythm" (toistettava)

1. Scope (2 min) - mita ratkaistaan nyt?  
2. Implement (6 min) - pieni rajattu muutos  
3. Verify (3 min) - kaynnistys + smoke test  
4. Commit (2 min) - selkea viesti  
5. PR note (2 min) - summary + testit

---

## 10) Retro Adventure -projektiin sopiva minimipolku

Kun teet muutoksen tassa repossa:

1. `git checkout -b cursor/<tehtava>`
2. Tee muutos rajatusti (`engine.js`, `main.js`, `systems/*`, `Docs/*`)
3. Testaa peli kaynnistamalla ja tekemalla smoke-run:
   - liike
   - interaction
   - attack/take
   - floor transition
4. Commit + push
5. Tee PR `main`-haaraan

---

## Yhteenveto

Työelamassa ei voiteta nopeudella vaan **toistettavalla laadulla**:
- pieni scope
- selkea branch
- varmistettu testaus
- siisti commit
- review-kelpoinen PR

Talla mallilla uusi kehittaja paasee nopeasti kiinni tekemiseen ilman turhaa riskiä.
