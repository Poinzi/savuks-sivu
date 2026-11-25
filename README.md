# Savuks Oy – verkkosivut

Staattinen sivusto osoitteeseen www.savuks.fi. Railway julkaisee `main`-haaran automaattisesti.

| Tiedosto | Sisältö |
|---|---|
| `index.html` | Etusivu: palvelut, luvat, Ajankohtaista (3 uusinta), toimintatapa, yhteystiedot |
| `ajankohtaista.html` | Kaikki Ajankohtaista-jutut |
| `tietosuoja.html` | Tietosuojaseloste |
| `tarkistuslista.html` | Tarkistuslista pelastuslaitoksen tarkastukseen |
| `palovaroittimet.html`, `vaestonsuojat.html`, `kasisammuttimet.html`, `pikapalopostit.html` | Palvelusivut |
| `llms.txt` | Tiivis kuvaus tekoälyhakuja varten |
| `server.js`, `Dockerfile` | Palvelin (Node, ei riippuvuuksia): sivut, vanhojen osoitteiden ohjaukset ja tarjouslomakkeen lähetys |
| `style.css` | Yhteiset tyylit (fontit omalta palvelimelta, haetaan build-vaiheessa) |
| `uutiset.json` | Ajankohtaista-jutut (päivittää viikoittainen agentti, ks. `AGENT.md`) |
| `uutiset.js` | Lukee `uutiset.json`:n ja piirtää jutut |
| `logot/` | Luvat ja jäsenyydet -logot: `spek.png`, `sppl.png`, `tukes.png`, `elinkeinolupa.png` |

Logo näkyy sivulla automaattisesti, kun tiedosto lisätään `logot/`-kansioon oikealla nimellä.

## Tarjouslomake

Lomake lähettää viestin palvelimen kautta Google Workspacen SMTP:llä. Railwayn muuttujat:

| Muuttuja | Arvo |
|---|---|
| `SMTP_USER` | jari.mattila@savuks.fi |
| `SMTP_PASS` | Google-tilin sovellussalasana (16 merkkiä) |
| `MAIL_TO` | (valinnainen) vastaanottaja, oletus jari.mattila@savuks.fi |

Ilman näitä lomake ilmoittaa, ettei se ole käytössä, ja tarjoaa sähköpostilinkin. Tila näkyy osoitteessa `/healthz`.
