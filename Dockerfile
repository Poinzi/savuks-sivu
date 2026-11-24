FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY index.html ajankohtaista.html tietosuoja.html tarkistuslista.html style.css uutiset.js uutiset.json sitemap.xml robots.txt og-kuva.png /srv/
COPY logot/ /srv/logot/
