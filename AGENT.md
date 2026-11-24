# Ajankohtaista-agentti – ohjeet

Tämä repo on Savuks Oy:n verkkosivusto (www.savuks.fi). Sivusto on staattinen: `index.html`,
`ajankohtaista.html`, `style.css`, `uutiset.js` ja `uutiset.json`. Railway julkaisee `main`-haaran
automaattisesti.

Ajankohtaista-agentti saa muokata **vain** tiedostoa `uutiset.json`. Muihin tiedostoihin se ei koske.

## Viikoittainen työ

1. Hae uudet tiedotteet ja uutiset edelliseltä noin 14 päivältä näistä lähteistä:
   - pelastustoimi.fi (erityisesti Varsinais-Suomen pelastuslaitos) ja pelastuslaitosten tiedotteet STT Infossa
   - sisäministeriö (intermin.fi / valtioneuvosto.fi), pelastustoimen osasto
   - SPEK (spek.fi), Isännöintiliitto ja Kiinteistöliitto, kun aihe koskee taloyhtiöitä
2. Valitse enintään 2 juttua, jotka koskevat taloyhtiöitä ja kuuluvat johonkin aiheeseen:
   - **Lait ja määräykset**: pelastuslaki, palovaroittimet, väestönsuojat, pelastussuunnitelmat, sammuttimet
   - **Pelastuslaitoksen valvonta**: palotarkastukset, aluevalvonta, valvontakampanjat
   - **Vinkit taloyhtiöille**: kausivinkit, esim. joulukynttilät, rappukäytävien tavarat, palovaroitinpäivä
   Älä valitse onnettomuusuutisia, henkilöuutisia, politiikkaa tai rekrytointeja.
3. Ohita juttu, jos sama asia on jo `uutiset.json`:ssa (vertaa `lahde_url` ja aihe).
4. Kirjoita jokaisesta jutusta lisäys `uutiset.json`:n alkuun.

## Kirjoitussäännöt

- Suomeksi, **omin sanoin**. Ei suoria lainauksia, ei kappaleiden kopiointia. Teksti 40–90 sanaa.
- Vain faktoja, jotka lähde sanoo. Ei omia lakitulkintoja, ei arvioita, ei mainoslauseita.
- Päivämäärät muodossa 17.11. tekstissä, kentässä `pvm` muodossa VVVV-KK-PP (lähteen julkaisupäivä).
- Otsikko enintään noin 70 merkkiä, asiallinen, ei klikkiotsikoita.
- `lahde_url` on aina alkuperäinen https-osoite.

## Muoto

```json
{
  "id": "VVVV-KK-PP-lyhyt-tunniste",
  "pvm": "VVVV-KK-PP",
  "aihe": "Lait ja määräykset | Pelastuslaitoksen valvonta | Vinkit taloyhtiöille",
  "otsikko": "…",
  "teksti": "…",
  "lahde": "Julkaisija",
  "lahde_url": "https://…"
}
```

Tiedoston on oltava kelvollista JSONia (taulukko). Tarkista se ennen committia, esim.
`python3 -c "import json;json.load(open('uutiset.json'))"`.

## Commit

- Commit suoraan `main`-haaraan viestillä `Ajankohtaista: <otsikko>`.
- Jos uutta sopivaa juttua ei löydy, älä tee committia.
