(function () {
  "use strict";
  const CFG = window.BOEKENKAST || {};
  const $ = (s) => document.querySelector(s);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  const KLEUREN = {
    "Radio & antennes": "#ffb547",
    "Elektronica": "#5df2a4",
    "Microcontrollers & Arduino": "#6cc6ff",
    "Computers & software": "#b493ff",
    "Werkplaats & techniek": "#ff8a6b",
    "Geschiedenis & varia": "#f2d36b"
  };
  const RESERVEKLEUREN = ["#ff6fb5", "#7ef0e6", "#c8f26b", "#ffa3a3", "#9db4ff"];
  const kleur = (c) => KLEUREN[c] || (KLEUREN[c] = RESERVEKLEUREN[Object.keys(KLEUREN).length % RESERVEKLEUREN.length]);

  let boeken = [];
  let filterRubriek = "Alles";
  let mand = new Set(laadMand());

  /* ---------- Opslag mandje (per bezoeker) ---------- */
  function laadMand() { try { return JSON.parse(localStorage.getItem("on4aub-mand") || "[]"); } catch (e) { return []; } }
  function bewaarMand() { try { localStorage.setItem("on4aub-mand", JSON.stringify([...mand])); } catch (e) {} }

  /* ---------- CSV inlezen ---------- */
  function parseCSV(text) {
    const rows = []; let row = [], cell = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    const head = (rows.shift() || []).map((h) => h.trim().toLowerCase());
    return rows.filter((r) => r.some((v) => v.trim())).map((r) => {
      const o = {}; head.forEach((h, i) => (o[h] = (r[i] || "").trim())); return o;
    });
  }

  function prijsGetal(p) {
    if (!p) return null;
    const m = String(p).replace(/\s/g, "").match(/(\d+)(?:[.,](\d{1,2}))?/);
    if (!m) return null;
    return parseFloat(m[1] + "." + (m[2] || "0"));
  }
  const euro = (n) => "€ " + n.toFixed(2).replace(".", ",");

  function normaliseer(lijst) {
    const gezien = {};
    return lijst.filter((b) => (b.titel || "").trim()).map((b) => {
      const basis = (b.titel + "|" + (b.isbn || "")).toLowerCase();
      gezien[basis] = (gezien[basis] || 0) + 1;
      const v = (b.verkocht || "").toLowerCase().trim();
      return {
        id: basis + "#" + gezien[basis],
        rubriek: (b.categorie || b.rubriek || "Overig").trim() || "Overig",
        titel: b.titel.trim(),
        auteur: (b.auteur || "").trim(),
        uitgever: (b.uitgever || "").trim(),
        isbn: (b.isbn || "").trim(),
        prijs: prijsGetal(b.prijs),
        foto: (b.foto || "").trim(),
        verkocht: ["ja", "x", "verkocht", "yes", "1", "true"].includes(v)
      };
    });
  }

  async function laadBoeken() {
    if (CFG.sheetCsvUrl) {
      try {
        const r = await fetch(CFG.sheetCsvUrl + (CFG.sheetCsvUrl.includes("?") ? "&" : "?") + "t=" + Date.now());
        if (!r.ok) throw new Error(r.status);
        const lijst = normaliseer(parseCSV(await r.text()));
        if (lijst.length) { $("#bijgewerkt").textContent = "Lijst live uit de boekenkast"; return lijst; }
      } catch (e) { console.warn("Google Sheet niet bereikbaar, reservelijst gebruikt.", e); }
    }
    $("#bijgewerkt").textContent = "";
    return normaliseer(window.BOEKEN_RESERVE || []);
  }

  /* ---------- Hero ---------- */
  const MORSE = { A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---", K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-", U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..", 0: "-----", 1: ".----", 2: "..---", 3: "...--", 4: "....-", 5: ".....", 6: "-....", 7: "--...", 8: "---..", 9: "----." };
  function bouwMorse() {
    const box = $("#morse"); const call = (CFG.roepnaam || "ON4AUB").toUpperCase();
    const elems = [];
    [...call].forEach((ch) => {
      const g = el("span", "ch");
      [...(MORSE[ch] || "")].forEach((s) => { const i = el("i", s === "." ? "dit" : "dah"); g.appendChild(i); elems.push([i, s === "." ? 1 : 3]); });
      box.appendChild(g);
      elems.push([null, 3]);
    });
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const unit = 110; let k = 0;
    (function stap() {
      const [i, len] = elems[k];
      if (i) { i.classList.add("on"); setTimeout(() => i.classList.remove("on"), len * unit); }
      k = (k + 1) % elems.length;
      setTimeout(stap, (len + 1) * unit + (k === 0 ? 1600 : 0));
    })();
  }
  function bouwGolf() {
    let d = "M0 30";
    for (let x = 0; x <= 1200; x += 6) {
      const y = 30 + Math.sin(x / 22) * 12 * Math.sin(x / 300) + Math.sin(x / 7) * 2;
      d += " L" + x + " " + y.toFixed(1);
    }
    $("#wavePath").setAttribute("d", d);
  }
  function telOp(node, eind, fmt) {
    const start = performance.now(), dur = 900;
    (function f(t) {
      const p = Math.min(1, (t - start) / dur), v = eind * (1 - Math.pow(1 - p, 3));
      node.textContent = fmt(v); if (p < 1) requestAnimationFrame(f);
    })(start);
  }

  /* ---------- Filters ---------- */
  function rubrieken() {
    const t = {}; boeken.forEach((b) => (t[b.rubriek] = (t[b.rubriek] || 0) + 1));
    return Object.entries(t).sort((a, b) => b[1] - a[1]);
  }
  function bouwChips() {
    const box = $("#chips"); box.innerHTML = "";
    const alles = [["Alles", boeken.length], ...rubrieken()];
    alles.forEach(([naam, n]) => {
      const c = el("button", "chip"); c.setAttribute("role", "tab");
      c.setAttribute("aria-selected", String(naam === filterRubriek));
      if (naam !== "Alles") { const d = el("span", "dot"); d.style.background = kleur(naam); c.appendChild(d); }
      c.appendChild(document.createTextNode(naam)); c.appendChild(el("small", null, String(n)));
      c.onclick = () => { filterRubriek = naam; bouwChips(); toon(); };
      box.appendChild(c);
    });
  }

  function gefilterd() {
    const z = $("#zoek").value.trim().toLowerCase();
    const woorden = z.split(/\s+/).filter(Boolean);
    let lijst = boeken.filter((b) => filterRubriek === "Alles" || b.rubriek === filterRubriek)
      .filter((b) => { const s = (b.titel + " " + b.auteur + " " + b.uitgever + " " + b.isbn).toLowerCase(); return woorden.every((w) => s.includes(w)); });
    const s = $("#sorteer").value;
    const coll = (a, b) => a.titel.localeCompare(b.titel, "nl", { sensitivity: "base", numeric: true });
    const pr = (b, dir) => (b.prijs == null ? (dir > 0 ? 1e9 : -1) : b.prijs);
    lijst.sort((a, b) => {
      if (a.verkocht !== b.verkocht) return a.verkocht ? 1 : -1;
      if (s === "prijs-laag") return pr(a, 1) - pr(b, 1) || coll(a, b);
      if (s === "prijs-hoog") return pr(b, -1) - pr(a, -1) || coll(a, b);
      if (s === "rubriek") return a.rubriek.localeCompare(b.rubriek) || coll(a, b);
      return coll(a, b);
    });
    return lijst;
  }

  /* ---------- Omslagen ----------
     Volgorde: 1) eigen foto uit de sheet  2) omslag via Open Library op ISBN  3) getekende omslag */
  function schoonIsbn(s) { const d = String(s || "").replace(/[^0-9Xx]/g, "").toUpperCase(); return d.length === 10 || d.length === 13 ? d : ""; }
  function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function fotoUrl(b) {
    if (b.foto) return b.foto;
    const i = schoonIsbn(b.isbn);
    return i ? "https://covers.openlibrary.org/b/isbn/" + i + "-M.jpg?default=false" : "";
  }
  const svg = (d) => '<svg viewBox="0 0 24 24">' + d + "</svg>";
  const ICONEN = {
    "Radio & antennes": svg('<path d="M12 22V9"/><path d="M5 2l7 7 7-7z"/><path d="M16.5 12.5a4 4 0 0 1 0 5"/><path d="M19.5 10a8 8 0 0 1 0 10"/><path d="M7.5 12.5a4 4 0 0 0 0 5"/><path d="M4.5 10a8 8 0 0 0 0 10"/>'),
    "Elektronica": svg('<path d="M1 12h4l1.5-3.5 3 7 3-7 3 7 3-7L20 12h3"/><path d="M8 4v3M16 4v3M8 17v3M16 17v3"/>'),
    "Microcontrollers & Arduino": svg('<rect x="6" y="6" width="12" height="12" rx="1.5"/><rect x="9.5" y="9.5" width="5" height="5"/><path d="M9 2v4M12 2v4M15 2v4M9 18v4M12 18v4M15 18v4M2 9h4M2 12h4M2 15h4M18 9h4M18 12h4M18 15h4"/>'),
    "Computers & software": svg('<rect x="2.5" y="3.5" width="19" height="13" rx="1.5"/><path d="M8 21h8M12 16.5V21"/><path d="M6.5 8l2.5 2-2.5 2M11 12.5h4"/>'),
    "Werkplaats & techniek": svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/><circle cx="12" cy="12" r="7"/>'),
    "Geschiedenis & varia": svg('<path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14"/><path d="M9 7h7M9 11h5"/>'),
    _: svg('<path d="M4 19.5V5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14"/>')
  };
  const mislukt = new Set();
  function omslag(b, groot) {
    const box = el("div", "cover" + (groot ? " groot" : ""));
    box.style.setProperty("--c", kleur(b.rubriek));
    box.style.setProperty("--h", (hash(b.titel) % 40) - 20 + "deg");
    const gen = el("div", "gen");
    gen.appendChild(el("span", "gen-rub", b.rubriek));
    gen.appendChild(el("span", "gen-titel", b.titel));
    if (b.auteur) gen.appendChild(el("span", "gen-auteur", b.auteur));
    { const ic = el("span", "gen-icoon"); ic.innerHTML = ICONEN[b.rubriek] || ICONEN._; gen.appendChild(ic); }
    box.appendChild(gen);
    const url = fotoUrl(b);
    if (url && !mislukt.has(url)) {
      const img = new Image();
      img.alt = "Omslag " + b.titel; img.loading = "lazy"; img.decoding = "async"; img.referrerPolicy = "no-referrer";
      img.onload = () => { if (img.naturalWidth < 20) { mislukt.add(url); img.remove(); } else box.classList.add("heeft-foto"); };
      img.onerror = () => { mislukt.add(url); img.remove(); };
      img.src = url;
      box.appendChild(img);
    }
    return box;
  }

  function prijsEl(b) { return b.prijs != null ? el("span", "prijs", euro(b.prijs)) : el("span", "prijs vraag", "Prijs op aanvraag"); }
  function knopEl(b) {
    if (b.verkocht) return el("span", "badge-sold", "Verkocht");
    const k = el("button", "add", mand.has(b.id) ? "✓ In mandje" : "+ In mandje");
    k.onclick = (e) => { e.stopPropagation(); wissel(b.id); };
    return k;
  }
  const wieTekst = (b) => [b.auteur, b.uitgever].filter(Boolean).join(" · ");

  /* Matrix */
  function kaart(b, i) {
    const c = el("article", "card" + (mand.has(b.id) ? " gekozen" : "") + (b.verkocht ? " verkocht" : ""));
    c.style.setProperty("--c", kleur(b.rubriek));
    c.style.animationDelay = Math.min(i, 20) * 18 + "ms";
    const cv = omslag(b); cv.onclick = () => detail(b); c.appendChild(cv);
    const body = el("div", "card-body");
    body.appendChild(el("span", "rub", b.rubriek));
    const h = el("h3", null, b.titel); h.onclick = () => detail(b); body.appendChild(h);
    if (wieTekst(b)) body.appendChild(el("p", "wie", wieTekst(b)));
    if (b.isbn) body.appendChild(el("p", "isbn", "ISBN " + b.isbn));
    const onder = el("div", "onder"); onder.appendChild(prijsEl(b)); onder.appendChild(knopEl(b));
    body.appendChild(onder); c.appendChild(body);
    return c;
  }

  /* Lijst */
  function rij(b) {
    const r = el("div", "rij" + (mand.has(b.id) ? " gekozen" : "") + (b.verkocht ? " verkocht" : ""));
    r.style.setProperty("--c", kleur(b.rubriek));
    const cv = omslag(b); cv.onclick = () => detail(b); r.appendChild(cv);
    const t = el("div", "rij-tekst");
    const h = el("h3", null, b.titel); h.onclick = () => detail(b); t.appendChild(h);
    t.appendChild(el("p", "wie", [wieTekst(b), b.isbn ? "ISBN " + b.isbn : ""].filter(Boolean).join(" · ")));
    r.appendChild(t);
    r.appendChild(el("span", "rij-rub", b.rubriek));
    r.appendChild(prijsEl(b));
    r.appendChild(knopEl(b));
    return r;
  }

  /* Boekenkast */
  function rug(b) {
    const h = hash(b.id);
    const w = el("div", "rug-slot");
    const r = el("button", "rug" + (mand.has(b.id) ? " gekozen" : "") + (b.verkocht ? " verkocht" : ""));
    r.style.setProperty("--c", kleur(b.rubriek));
    r.style.setProperty("--w", 30 + (h % 22) + "px");
    r.style.setProperty("--hh", 150 + (h % 50) + "px");
    r.style.setProperty("--tint", (h % 3) * 8 + "%");
    r.title = b.titel + (b.prijs != null ? " · " + euro(b.prijs) : "");
    r.appendChild(el("span", "rug-titel", b.titel));
    if (b.prijs != null) r.appendChild(el("span", "rug-prijs", "€" + (b.prijs % 1 ? b.prijs.toFixed(2).replace(".", ",") : b.prijs)));
    r.onclick = () => detail(b);
    w.appendChild(r);
    return w;
  }
  function kast(lijst) {
    const groepen = new Map();
    lijst.forEach((b) => { if (!groepen.has(b.rubriek)) groepen.set(b.rubriek, []); groepen.get(b.rubriek).push(b); });
    const frag = document.createDocumentFragment();
    groepen.forEach((items, naam) => {
      const sec = el("section", "plank-groep");
      const bord = el("div", "plank-bord"); bord.style.setProperty("--c", kleur(naam));
      bord.appendChild(el("span", null, naam)); bord.appendChild(el("small", null, items.length + " boeken"));
      sec.appendChild(bord);
      const plank = el("div", "plank");
      items.forEach((b) => plank.appendChild(rug(b)));
      sec.appendChild(plank); frag.appendChild(sec);
    });
    return frag;
  }

  /* Detailvenster */
  let detailBoek = null;
  function detail(b) {
    detailBoek = b;
    const m = $("#modal");
    m.style.setProperty("--c", kleur(b.rubriek));
    $("#mCover").innerHTML = ""; $("#mCover").appendChild(omslag(b, true));
    $("#mRub").textContent = b.rubriek;
    $("#mTitel").textContent = b.titel;
    $("#mWie").textContent = wieTekst(b);
    $("#mIsbn").textContent = b.isbn ? "ISBN " + b.isbn : "";
    vulDetailOnder();
    m.hidden = false; document.body.style.overflow = "hidden";
  }
  function vulDetailOnder() {
    if (!detailBoek) return;
    const o = $("#mOnder"); o.innerHTML = ""; o.appendChild(prijsEl(detailBoek)); o.appendChild(knopEl(detailBoek));
  }
  function sluitDetail() { $("#modal").hidden = true; detailBoek = null; if (!$("#drawer").classList.contains("open")) document.body.style.overflow = ""; }

  /* Weergave */
  let weergave = (() => { try { return localStorage.getItem("on4aub-view") || "matrix"; } catch (e) { return "matrix"; } })();
  function zetWeergave(v) {
    weergave = v; try { localStorage.setItem("on4aub-view", v); } catch (e) {}
    document.querySelectorAll(".views button").forEach((k) => k.setAttribute("aria-pressed", String(k.dataset.view === v)));
    toon();
  }

  function toon() {
    const lijst = gefilterd(), grid = $("#grid");
    grid.className = "boeken v-" + weergave;
    grid.innerHTML = "";
    if (weergave === "kast") grid.appendChild(kast(lijst));
    else {
      const frag = document.createDocumentFragment();
      lijst.forEach((b, i) => frag.appendChild(weergave === "lijst" ? rij(b) : kaart(b, i)));
      grid.appendChild(frag);
    }
    vulDetailOnder();
    $("#leeg").hidden = lijst.length > 0;
    $("#telling").textContent = lijst.length + " van " + boeken.length + " boeken";
  }

  /* ---------- Mandje ---------- */
  function wissel(id) {
    if (mand.has(id)) mand.delete(id); else { mand.add(id); const f = $("#fab"); f.classList.remove("bump"); void f.offsetWidth; f.classList.add("bump"); }
    bewaarMand(); toon(); toonMand();
  }
  function inMand() { return boeken.filter((b) => mand.has(b.id) && !b.verkocht); }

  function toonMand() {
    const lijst = inMand(), ul = $("#mand");
    ul.innerHTML = "";
    lijst.forEach((b) => {
      const li = el("li");
      const t = el("div", "t", b.titel); if (b.auteur) t.appendChild(el("small", null, b.auteur));
      li.appendChild(t);
      li.appendChild(el("span", "p", b.prijs != null ? euro(b.prijs) : "op aanvraag"));
      const x = el("button", "x", "✕"); x.setAttribute("aria-label", "Verwijder " + b.titel); x.onclick = () => wissel(b.id);
      li.appendChild(x); ul.appendChild(li);
    });
    $("#mandLeeg").hidden = lijst.length > 0;
    $("#fabCount").textContent = lijst.length;
    const tot = lijst.reduce((s, b) => s + (b.prijs || 0), 0);
    $("#totaal").textContent = euro(tot);
    const nv = lijst.filter((b) => b.prijs == null).length;
    $("#opAanvraag").textContent = nv ? "+ " + nv + " boek" + (nv > 1 ? "en" : "") + " met prijs op aanvraag" : "";
    $("#bestel").disabled = lijst.length === 0;
  }

  function bestelTekst() {
    const lijst = inMand();
    const regels = lijst.map((b, i) => (i + 1) + ". " + b.titel + (b.auteur ? " (" + b.auteur + ")" : "") + (b.isbn ? " ISBN " + b.isbn : "") + ": " + (b.prijs != null ? euro(b.prijs) : "prijs op aanvraag"));
    const tot = lijst.reduce((s, b) => s + (b.prijs || 0), 0);
    const naam = $("#klantNaam").value.trim(), extra = $("#klantExtra").value.trim(), msg = $("#klantMsg").value.trim();
    return [
      "Hallo " + (CFG.naam ? CFG.naam.split(" ")[0] : "") + ",",
      "",
      "Graag had ik volgende boeken uit je boekenkast:",
      "",
      ...regels,
      "",
      "Totaal gekende prijzen: " + euro(tot),
      msg ? "\nOpmerking: " + msg : "",
      "",
      "Groeten,",
      naam || "",
      extra || ""
    ].filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n").trim();
  }

  function toast(t) { const n = $("#toast"); n.textContent = t; n.classList.add("show"); clearTimeout(toast.h); toast.h = setTimeout(() => n.classList.remove("show"), 2200); }

  function openMand(open) {
    $("#drawer").classList.toggle("open", open);
    $("#drawer").setAttribute("aria-hidden", String(!open));
    $("#scrim").hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  }

  /* ---------- Start ---------- */
  async function start() {
    const call = CFG.roepnaam || "ON4AUB";
    $("#callsign").textContent = call; $("#footCall").textContent = call;
    $("#infoBetaling").textContent = CFG.betaling || "";
    $("#infoVerzending").textContent = CFG.verzending || "";
    $("#infoNaam").textContent = (CFG.naam || "") + (call ? " · " + call : "");
    $("#infoMail").textContent = CFG.email || ""; $("#infoMail").href = "mailto:" + (CFG.email || "");
    bouwMorse(); bouwGolf();

    boeken = await laadBoeken();
    const ids = new Set(boeken.map((b) => b.id));
    mand = new Set([...mand].filter((id) => ids.has(id))); bewaarMand();

    const beschikbaar = boeken.filter((b) => !b.verkocht);
    const prijzen = beschikbaar.map((b) => b.prijs).filter((p) => p != null && p > 0);
    telOp($("#statBoeken"), beschikbaar.length, (v) => String(Math.round(v)).padStart(3, "0"));
    telOp($("#statCats"), rubrieken().length, (v) => String(Math.round(v)));
    const min = prijzen.length ? Math.min(...prijzen) : 0;
    telOp($("#statVanaf"), min, (v) => "€" + Math.round(v));
    $("#statusText").textContent = beschikbaar.length + " boeken beschikbaar";

    bouwChips(); zetWeergave(weergave); toonMand();
    document.querySelectorAll(".views button").forEach((k) => (k.onclick = () => zetWeergave(k.dataset.view)));
    $("#modalSluit").onclick = sluitDetail;
    $("#modal").onclick = (e) => { if (e.target.id === "modal") sluitDetail(); };

    let t; $("#zoek").addEventListener("input", () => { clearTimeout(t); t = setTimeout(toon, 120); });
    $("#sorteer").addEventListener("change", toon);
    $("#fab").onclick = () => openMand(true);
    $("#sluit").onclick = () => openMand(false);
    $("#scrim").onclick = () => openMand(false);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { sluitDetail(); openMand(false); } });
    $("#bestel").onclick = () => {
      if (!inMand().length) return;
      const onderwerp = "Bestelling boeken " + call + " (" + inMand().length + " boek" + (inMand().length > 1 ? "en" : "") + ")";
      location.href = "mailto:" + CFG.email + "?subject=" + encodeURIComponent(onderwerp) + "&body=" + encodeURIComponent(bestelTekst());
    };
    $("#kopieer").onclick = async () => {
      if (!inMand().length) return toast("Je mandje is nog leeg");
      try { await navigator.clipboard.writeText(bestelTekst()); toast("Lijst gekopieerd. Plak hem in een mail naar " + CFG.email); }
      catch (e) { toast("Kopiëren lukte niet, gebruik Bestel per mail"); }
    };
    $("#leegmaken").onclick = () => { if (!mand.size) return; mand.clear(); bewaarMand(); toon(); toonMand(); toast("Mandje leeggemaakt"); };
  }
  start();
})();
