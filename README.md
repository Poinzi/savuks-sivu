# Savuks Oy – verkkosivut

Staattinen sivusto osoitteeseen www.savuks.fi. Railway julkaisee `main`-haaran automaattisesti.

| Tiedosto | Sisältö |
|---|---|
| `index.html` | Etusivu: palvelut, luvat, Ajankohtaista (3 uusinta), toimintatapa, yhteystiedot |
| `ajankohtaista.html` | Kaikki Ajankohtaista-jutut |
| `tietosuoja.html` | Tietosuojaseloste |
| `Caddyfile`, `Dockerfile` | Palvelin (Caddy) ja vanhan WordPress-sivuston osoitteiden uudelleenohjaukset |
| `style.css` | Yhteiset tyylit |
| `uutiset.json` | Ajankohtaista-jutut (päivittää viikoittainen agentti, ks. `AGENT.md`) |
| `uutiset.js` | Lukee `uutiset.json`:n ja piirtää jutut |
| `logot/` | Luvat ja jäsenyydet -logot: `spek.png`, `sppl.png`, `tukes.png`, `elinkeinolupa.png` |

Logo näkyy sivulla automaattisesti, kun tiedosto lisätään `logot/`-kansioon oikealla nimellä.
