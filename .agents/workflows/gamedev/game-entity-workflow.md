---
description: Työnkulku uuden peliobjektin (hirviö, esine, mekanismi) lisäämiseen
---

# Game Entity Workflow

Tätä työnkulkua käytetään, kun Monolith-moottoriin lisätään uusi objekti, kuten uusi vihollistyyppi, kerättävä esine, vipu tai ovi. Koska kyseessä on Vanilla JS -pohjainen pseudo-3D peli, uuden objektin lisääminen vaatii muutoksia niin grafiikoihin, logiikkaan kuin kartanlataukseenkin.

## 1. Assetin luonti / Valmistelu
- **Grafiikka**: Hanki tai generoi objektille kuva (PNG). 
- **Tyyli**: Varmista, että kuva noudattaa "1990s Modern" -estetiikkaa (pikselöity, jyrkkä kontrasti, sopiva resoluutio billboard-renderöintiin).
- **Sijainti**: Tallenna tiedosto oikeaan paikkaan (esim. `images/` tai `assets/`).

## 2. Rekisteröinti ja Pelilogiikka (`/architect`)
- **Tietomalli**: Määritä objektin tilastot ja ominaisuudet (esim. HP, vahinko, esineen tyyppi).
- **Koodi-integraatio**: Lisää objekti pelin sisäiseen rekisteriin tai vastaavaan manager-luokkaan (`systems/`-kansiossa tai `engine.js`/`main.js`).
- **Toiminnallisuus**: Ohjelmoi objektin interaktio. Esimerkiksi: mitä tapahtuu kun vipua vedetään (`USE`), tai miten uusi vihollinen käyttäytyy/hyökkää.

## 3. Karttasymbolin (ASCII) määritys
- **Symbolin valinta**: Valitse objektille vapaana oleva yksittäinen ASCII-merkki (esim. `G` Goblinille, `K` avaimelle).
- **Parserin päivitys**: Päivitä `engine.js`:n tai tasonlataajan koodi siten, että se tunnistaa uuden merkin luettaessa `.txt` -tiedostoa.
- **Instansiointi**: Varmista, että parseri luo oikean olion peliin annettuihin (X, Y) koordinaatteihin kartan rakennusvaiheessa.

## 4. Testaus ja Validointi (`/review`)
- **Testit**: Ihminen hoitaa testauksen.