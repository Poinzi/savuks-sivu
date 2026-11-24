FROM node:22-alpine
WORKDIR /app
COPY server.js index.html ajankohtaista.html tietosuoja.html tarkistuslista.html style.css uutiset.js uutiset.json sitemap.xml robots.txt og-kuva.png ./
COPY logot/ ./logot/
ENV NODE_ENV=production
USER node
CMD ["node", "server.js"]
