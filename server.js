// Savuks Oy:n verkkosivujen palvelin: staattiset sivut, vanhojen osoitteiden ohjaukset
// ja tarjouslomakkeen lähetys sähköpostina (Google Workspace SMTP). Ei ulkoisia riippuvuuksia.
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const net = require("net");
const tls = require("tls");

const PORT = Number(process.env.PORT) || 8080;
const ROOT = __dirname;
const SMTP = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE !== "false",
  user: process.env.SMTP_USER || "",
  pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""),
};
const MAIL_TO = process.env.MAIL_TO || "jari.mattila@savuks.fi";

// ---------- Staattiset tiedostot ----------
const FILES = ["index.html", "ajankohtaista.html", "tietosuoja.html", "tarkistuslista.html", "style.css",
  "uutiset.js", "uutiset.json", "sitemap.xml", "robots.txt", "og-kuva.png"];
const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".xml": "application/xml; charset=utf-8", ".txt": "text/plain; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };

const REDIRECTS = [
  [/^\/(palovaroittimet|vaestonsuojat|faq|pikapalopostit|savunpoisto|services|about)(\/.*)?$/, "/#palvelut"],
  [/^\/contact(\/.*)?$/, "/#yhteystiedot"],
  [/^\/testimonials(\/.*)?$/, "/ajankohtaista.html"],
  [/^\/tietopankki(\/.*)?$/, "/#toimintatapa"],
  [/^\/(wp-admin.*|wp-login\.php|wp-content\/.*|feed(\/.*)?|xmlrpc\.php)$/, "/"],
];

function resolveFile(p) {
  if (p === "/" ) return "index.html";
  const rel = p.replace(/^\/+/, "");
  if (FILES.includes(rel)) return rel;
  if (FILES.includes(rel + ".html")) return rel + ".html";
  if (/^logot\/[a-z0-9_-]+\.(png|jpg|jpeg|svg|webp)$/i.test(rel)) return rel;
  return null;
}

function sendFile(req, res, rel) {
  const full = path.join(ROOT, rel);
  if (!full.startsWith(ROOT + path.sep)) return notFound(res);
  fs.readFile(full, (err, buf) => {
    if (err) return rel.startsWith("logot/") ? notFound(res) : redirect(res, "/", 302);
    const ext = path.extname(rel).toLowerCase();
    const headers = { "Content-Type": TYPES[ext] || "application/octet-stream", "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": /\.(html|json|xml|txt)$/.test(ext) ? "no-cache" : "public, max-age=86400" };
    const gz = /gzip/.test(req.headers["accept-encoding"] || "") && /^(text|application\/(json|xml))/.test(headers["Content-Type"]);
    if (gz) { buf = zlib.gzipSync(buf); headers["Content-Encoding"] = "gzip"; headers["Vary"] = "Accept-Encoding"; }
    headers["Content-Length"] = buf.length;
    res.writeHead(200, headers);
    res.end(req.method === "HEAD" ? undefined : buf);
  });
}
function redirect(res, to, code) { res.writeHead(code, { Location: to, "Content-Length": 0 }); res.end(); }
function notFound(res) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("Ei löytynyt"); }
function json(res, code, obj) { const b = JSON.stringify(obj); res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Content-Length": Buffer.byteLength(b), "Cache-Control": "no-store" }); res.end(b); }

// ---------- SMTP (ilman kirjastoja) ----------
function smtpSend({ from, to, replyTo, subject, text }) {
  return new Promise((resolve, reject) => {
    const sock = SMTP.secure ? tls.connect({ host: SMTP.host, port: SMTP.port, servername: SMTP.host })
                             : net.connect({ host: SMTP.host, port: SMTP.port });
    sock.setEncoding("utf8");
    sock.setTimeout(20000, () => { sock.destroy(); reject(new Error("SMTP aikakatkaisu")); });
    let buf = "", step = 0;
    const b64 = (s) => Buffer.from(s, "utf8").toString("base64");
    const enc = (s) => "=?UTF-8?B?" + b64(s) + "?=";
    const date = new Date().toUTCString().replace("GMT", "+0000");
    const domain = (from.split("@")[1] || "localhost");
    const msg = [
      `From: ${enc("Savuks-verkkosivu")} <${from}>`,
      `To: <${to}>`,
      replyTo ? `Reply-To: <${replyTo}>` : null,
      `Subject: ${enc(subject)}`,
      `Date: ${date}`,
      `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@${domain}>`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=UTF-8",
      "Content-Transfer-Encoding: base64",
      "",
      b64(text).replace(/.{1,76}/g, "$&\r\n").trimEnd(),
    ].filter((l) => l !== null).join("\r\n");
    const cmds = [
      null,                                   // 220 tervehdys
      "EHLO savuks.fi",                       // 250
      "AUTH LOGIN",                           // 334
      b64(SMTP.user),                         // 334
      b64(SMTP.pass),                         // 235
      `MAIL FROM:<${from}>`,                  // 250
      `RCPT TO:<${to}>`,                      // 250
      "DATA",                                 // 354
      msg.replace(/^\./gm, "..") + "\r\n.",   // 250
      "QUIT",                                 // 221
    ];
    const expect = [220, 250, 334, 334, 235, 250, 250, 354, 250, 221];
    sock.on("data", (d) => {
      buf += d;
      let m;
      while ((m = buf.match(/^(\d{3})([ -])(.*)\r?\n/m))) {
        const line = m[0]; buf = buf.slice(buf.indexOf(line) + line.length);
        if (m[2] === "-") continue;            // monirivinen vastaus jatkuu
        const code = Number(m[1]);
        if (code !== expect[step]) { sock.destroy(); return reject(new Error(`SMTP ${code} ${m[3]}`.slice(0, 200))); }
        step++;
        if (step >= cmds.length) { sock.end(); return resolve(); }
        sock.write(cmds[step] + "\r\n");
      }
    });
    sock.on("error", reject);
  });
}

// ---------- Tarjouslomake ----------
const hits = new Map();
function limited(ip) {
  const now = Date.now(), list = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  list.push(now); hits.set(ip, list);
  return list.length > 5;
}
const clean = (v, max) => String(v == null ? "" : v).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0, max);
const oneLine = (v, max) => clean(v, max).replace(/[\r\n]+/g, " ");

function handleTarjous(req, res) {
  const ip = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  let body = "", too = false;
  req.setEncoding("utf8");
  req.on("data", (c) => { body += c; if (body.length > 20000) { too = true; req.destroy(); } });
  req.on("end", async () => {
    if (too) return;
    let d; try { d = JSON.parse(body); } catch { return json(res, 400, { ok: false, virhe: "Virheellinen pyyntö." }); }
    if (clean(d.sivusto, 200)) return json(res, 200, { ok: true });      // roskapostiansa: ei lähetetä
    const f = { nimi: oneLine(d.nimi, 120), email: oneLine(d.email, 160), puh: oneLine(d.puh, 40),
      palvelu: oneLine(d.palvelu, 80), asunnot: oneLine(d.asunnot, 20), viesti: clean(d.viesti, 4000) };
    if (!f.nimi || !/^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]+$/.test(f.email))
      return json(res, 400, { ok: false, virhe: "Täytä nimi ja toimiva sähköpostiosoite." });
    if (limited(ip)) return json(res, 429, { ok: false, virhe: "Liian monta lähetystä. Yritä hetken päästä uudelleen tai soita." });
    if (!SMTP.user || !SMTP.pass) return json(res, 503, { ok: false, virhe: "Lomake ei ole juuri nyt käytössä." });
    const text = [
      "Uusi tarjouspyyntö verkkosivulta www.savuks.fi", "",
      `Nimi:       ${f.nimi}`, `Sähköposti: ${f.email}`, `Puhelin:    ${f.puh || "-"}`,
      `Palvelu:    ${f.palvelu || "-"}`, `Asuntoja:   ${f.asunnot || "-"}`, "",
      "Kohde ja lisätiedot:", f.viesti || "-", "",
      "Vastaa tähän viestiin, niin vastaus menee suoraan asiakkaalle.",
    ].join("\n");
    try {
      await smtpSend({ from: SMTP.user, to: MAIL_TO, replyTo: f.email, subject: `Tarjouspyyntö: ${f.palvelu || "palvelu"} – ${f.nimi}`, text });
      console.log(`tarjouspyyntö lähetetty (${f.palvelu})`);
      json(res, 200, { ok: true });
    } catch (e) {
      console.error("lähetys epäonnistui:", e.message);
      json(res, 502, { ok: false, virhe: "Lähetys epäonnistui." });
    }
  });
}

// ---------- Palvelin ----------
http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, "http://x").pathname); } catch { return notFound(res); }
  if (p === "/api/tarjous") {
    if (req.method !== "POST") { res.writeHead(405, { Allow: "POST" }); return res.end(); }
    return handleTarjous(req, res);
  }
  if (p === "/healthz") return json(res, 200, { ok: true, lomake: !!(SMTP.user && SMTP.pass) });
  if (req.method !== "GET" && req.method !== "HEAD") { res.writeHead(405); return res.end(); }
  for (const [re, to] of REDIRECTS) if (re.test(p)) return redirect(res, to, 301);
  const rel = resolveFile(p);
  if (rel) return sendFile(req, res, rel);
  return redirect(res, "/", 302);
}).listen(PORT, () => console.log(`savuks-sivu kuuntelee porttia ${PORT}, lomake ${SMTP.user && SMTP.pass ? "käytössä" : "pois käytöstä (SMTP_USER/SMTP_PASS puuttuu)"}`));

module.exports = { smtpSend };
