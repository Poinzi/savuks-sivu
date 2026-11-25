// Kuljettaa Google Ads -klikkauksen tunnisteen (gclid) osoitteessa sivulta toiselle tarjouslomakkeelle asti.
// Ei evästeitä eikä tallennusta selaimeen: tunniste kulkee vain sivun osoitteessa.
(() => {
  const g = new URLSearchParams(location.search).get("gclid");
  if (!g || !/^[A-Za-z0-9_-]{10,200}$/.test(g)) return;
  for (const a of document.querySelectorAll("a[href]")) {
    if (a.getAttribute("href").startsWith("#")) continue;
    const u = new URL(a.getAttribute("href"), location.href);
    if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname) || u.searchParams.has("gclid")) continue;
    u.searchParams.set("gclid", g);
    a.setAttribute("href", u.pathname.replace(/^\//, "") + u.search + u.hash);
  }
})();
