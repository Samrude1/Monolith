# Tieyhtye 3D-maailmaan: Retro Adventure -muutossuunnitelma

Tämä asiakirja määrittelee teknisen strategian nykyisen pseudo-3D-moottorin muuttamiseksi täysiveriseksi reaaliaikaiseksi 3D-ympäristöksi käyttäen **Three.js**-kirjastoa.

## 1. Arkkitehtuuri: "Aivot" vs. "Silmät"

Suurin hyöty nykyisestä koodista saadaan pitämällä pelin logiikka erillään renderöinnistä. 

| Komponentti | Status | Toimenpide |
| :--- | :--- | :--- |
| **Kartanluku (ASCII)** | Säilytä | `.txt`-tiedostot toimivat suoraan 3D-maailman rakennuspiirustuksina. |
| **Pelisilmukka (main.js)** | Säilytä | Päivitä `update`-metodi tukemaan vapaata hiiriliikettä. |
| **UI & Stats** | Säilytä | HTML/CSS-kerros pysyy muuttumattomana Three.js-canvaksen päällä. |
| **Engine.js** | Korvaa | Tämä tiedosto korvataan uudella `Engine3D.js`-moduulilla. |

## 2. Tekniset askeleet siirtymässä

### Vaihe 1: Perusympäristön pystytys
1.  Luo `THREE.Scene`, `THREE.PerspectiveCamera` ja `THREE.WebGLRenderer`.
2.  Kytke `PointerLockControls` käyttöön hiiriohjausta varten.
3.  Lisää perusvalaistus (`AmbientLight` ja `DirectionalLight`).

### Vaihe 2: Älykäs maailman generointi (Skaalautuvuus)
Koska suorituskyky on prioriteetti nro 1, vältä tuhansien erillisten objektien luomista.
*   **Käytä `InstancedMesh`-tekniikkaa:** Luo yksi seinäpalikka ja monista se kartan `#`-merkkien kohtiin. Tämä pitää Draw Call -määrän minimissä ja FPS:n vakaana 60:ssä.
*   **Lattia ja katto:** Luo yksi suuri `PlaneGeometry`, jossa on toistuva (tiling) tekstuuri, sen sijaan että jokaisella ruudulla olisi oma lattiaobjekti.

### Vaihe 3: Teksturointi ja Dekaalit
*   Lataa tiiliseinät ja muut pinnat `TextureLoaderilla`.
*   Toteuta dekaalit (esim. verijäljet tai julisteet) käyttämällä `DecalGeometrya`, joka mahdollistaa pintojen "tarraamisen" seiniin ilman Z-fighting-ongelmia.

## 3. Nykyisen koodin hyödyntäminen

### LevelManager.js
Tämä on arvokkain osa nykyistä koodia. Sen `loadLevel`-metodia on muokattava siten, että:
1.  Se lukee ASCII-kartan kuten ennenkin.
2.  Sen sijaan että se välittää tiedon 2D-moottorille, se kutsuu `InstancedMesh.setMatrixAt()` -metodia asettaakseen seinät oikeisiin paikkoihin.
3.  Viholliset ja esineet spawnaavat samoihin x/y-koordinaatteihin, mutta ne piirretään 3D-malleina (tai 2.5D-spriteinä).

### Pelaajan liikkuminen
Nykyinen `moveForward` ja `rotate` -logiikka voidaan muuttaa vapaaksi WASD-liikkumiseksi:
*   Käytä `player.x` ja `player.y` arvoja suoraan kameran paikkana.
*   Toteuta seinään törmääminen (Collision) tarkistamalla pelaajan sijaintia suhteessa `LevelManagerin` tuntemaan karttaruudukkoon (Circle-vs-Grid).

## 4. Miksi tämä kannattaa?
*   **Moderni tuntuma:** Vapaa hiirikatselu on standardi, jota FPS-pelaajat odottavat.
*   **Skaalautuvuus:** WebGL (Three.js) pystyy käsittelemään moninkertaisen määrän yksityiskohtia verrattuna 2D Canvas -piirtoon.
*   **Tulevaisuus:** 3D-maailma mahdollistaa myöhemmin moninpelin, dynaamiset varjot ja fysiikkamoottorin (kuten Cannon.js) käytön.

---
*Dokumentti päivitetty: 2026-05-10*
