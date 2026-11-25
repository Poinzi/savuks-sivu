FROM node:22-alpine
WORKDIR /app
# Fontit haetaan build-vaiheessa (Fontsource 5.3.0, OFL-lisenssi) ja tarkistetaan tiivisteellä
RUN mkdir -p fonts \
 && wget -q -O fonts/archivo.woff2 https://cdn.jsdelivr.net/npm/@fontsource-variable/archivo@5.3.0/files/archivo-latin-wght-normal.woff2 \
 && wget -q -O fonts/inter.woff2 https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5.3.0/files/inter-latin-wght-normal.woff2 \
 && echo "8f704806dbedeaaeca334b11ec348bc3ac3a439d6431544b3afb54f534ee4967  fonts/archivo.woff2" | sha256sum -c - \
 && echo "3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62  fonts/inter.woff2" | sha256sum -c -
COPY server.js *.html style.css uutiset.js lahde.js uutiset.json sitemap.xml robots.txt llms.txt og-kuva.png ./
COPY logot/ ./logot/
ENV NODE_ENV=production
USER node
CMD ["node", "server.js"]
