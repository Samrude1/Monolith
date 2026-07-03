---
description: Työnkulku uuden tason/kartan (level) luomiseen ja suunnitteluun
---

# Level Design Workflow

Tätä työnkulkua käytetään, kun peliin halutaan suunnitella uusia kerroksia (floors) tai muokata vanhoja karttoja. Peli käyttää tekstipohjaisia ASCII-karttoja tasojen luomiseen.

## 1. Kartan rakentaminen (ASCII)
- **Tiedoston luonti**: Avaa uusi tai olemassa oleva tekstitiedosto (esim. `data/Level2.txt` tai `Level2.txt`).
- **Pohjapiirros**: Piirrä kentän pohjapiirros käyttäen pelin standardisymboleja:
  - `#` = Seinä
  - `.` = Lattia (tyhjä tila)
  - `S` = Pelaajan aloituspiste (Spawn)
  - `D` = Ovi
  - `<` / `>` = Portaat ylös/alas
- **Suljettu tila**: Varmista aina, että kartta on reunoiltaan täysin seinien (`#`) ympäröimä, jotta pelaaja tai renderöintikoodi ei karkaa kartan ulkopuolelle.

## 2. Sisällön sijoittelu
- **Haasteet ja aarteet**: Sijoittele kartalle hirviöitä, ansoja, esineitä ja vipuja käyttäen niille varattuja ASCII-symboleja.
- **Rytmitys**: Rakenna tasosta pelaajalle mielekäs; älä laita liikaa vihollisia liian ahtaisiin tiloihin.

## 3. Moottorin Integraatio
- **Siirtymät**: Jos lisäät uuden tason, varmista että edellisen tason portaat (`>`) on koodattu lataamaan tämä uusi tekstitiedosto.
- **Assetit**: Varmista, että uusi taso käyttää oikeita tekstuureja, jos tasojen teemat vaihtelevat (esim. tyrmä vs. luola).

## 4. Pelitestaus
- **Testit**: Ihminen hoitaa testauksen.