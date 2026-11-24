FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY index.html ajankohtaista.html tietosuoja.html style.css uutiset.js uutiset.json /srv/
COPY logot/ /srv/logot/
