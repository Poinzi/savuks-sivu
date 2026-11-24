// Ajankohtaista: lukee uutiset.json-tiedoston ja piirtää jutut elementtiin [data-uutiset].
// data-uutiset="3" näyttää kolme uusinta, data-uutiset="kaikki" kaikki.
{
  const kohteet = document.querySelectorAll("[data-uutiset]");
  const pvm = (s) => {
    const [y, m, d] = String(s).split("-").map(Number);
    return y && m && d ? `${d}.${m}.${y}` : "";
  };
  const el = (tag, cls, txt) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  };
  const turvallinen = (u) => /^https:\/\//i.test(String(u || ""));

  const piirra = (kohde, lista) => {
    const maara = kohde.dataset.uutiset === "kaikki" ? lista.length : Number(kohde.dataset.uutiset) || 3;
    kohde.textContent = "";
    if (!lista.length) { kohde.append(el("p", "empty", "Ei vielä juttuja.")); return; }
    for (const u of lista.slice(0, maara)) {
      const a = el("article", "post");
      a.id = String(u.id || "").replace(/[^a-z0-9-]/gi, "");
      const meta = el("div", "meta");
      const t = el("time", "", pvm(u.pvm)); t.dateTime = String(u.pvm || "");
      meta.append(t);
      if (u.aihe) meta.append(el("span", "tag", u.aihe));
      a.append(meta, el("h3", "", u.otsikko || ""), el("p", "", u.teksti || ""));
      if (turvallinen(u.lahde_url)) {
        const l = el("a", "src", "Lähde: " + (u.lahde || "alkuperäinen julkaisu") + " →");
        l.href = u.lahde_url; l.rel = "noopener"; l.target = "_blank";
        a.append(l);
      }
      kohde.append(a);
    }
  };

  if (kohteet.length) {
    fetch("uutiset.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => (Array.isArray(d) ? d : []))
      .catch(() => [])
      .then((d) => {
        d.sort((a, b) => String(b.pvm).localeCompare(String(a.pvm)));
        kohteet.forEach((k) => piirra(k, d));
      });
  }
}
