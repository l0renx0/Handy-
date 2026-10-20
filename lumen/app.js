// Lumen — logica dell'app: carica le schede, gestisce feed, filtri, dettaglio e aggiornamenti.
import { artFor } from "./art.js";

const TOPICS = {
  scienza: "Scienza",
  spazio: "Spazio",
  salute: "Salute",
  storia: "Storia",
  tecnologia: "Tecnologia",
  natura: "Natura",
};

const SOLIDITY = {
  consolidato: { label: "Consolidato", hint: "Conoscenza stabile, confermata da molte evidenze nel tempo." },
  solido: { label: "Fonte ufficiale", hint: "Dato o evento verificato da un ente ufficiale o da una pubblicazione scientifica." },
  preliminare: { label: "Studio recente, da confermare", hint: "Risultato nuovo: potrebbe essere rivisto da studi successivi." },
};

const DATA_URL = "data/cards.json";
const META_URL = "data/meta.json";
const CHECK_EVERY_MS = 3 * 60 * 1000;

const $ = (sel) => document.querySelector(sel);
const feed = $("#feed");
const detail = $("#detail");
const banner = $("#update-banner");

const state = {
  section: "novita",
  topic: "tutti",
  cards: [],
  updatedAt: null,
  openId: null,
  pushed: false, // il dettaglio aperto ha aggiunto una voce alla cronologia
};

// ---------- Memoria locale (letture, tema, serie di giorni) ----------
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem("lumen:" + key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("lumen:" + key, JSON.stringify(value)); } catch {}
  },
};
const todayKey = () => new Date().toLocaleDateString("sv-SE"); // AAAA-MM-GG locale

function markRead(id) {
  const read = store.get("read", {});
  read[id] = todayKey();
  store.set("read", read);
  const days = new Set(store.get("days", []));
  days.add(todayKey());
  store.set("days", [...days].sort().slice(-400));
  renderStreak();
}

function renderStreak() {
  const days = new Set(store.get("days", []));
  let n = 0;
  const d = new Date();
  if (!days.has(todayKey())) d.setDate(d.getDate() - 1); // la serie resta valida fino a fine giornata
  while (days.has(d.toLocaleDateString("sv-SE"))) { n++; d.setDate(d.getDate() - 1); }
  const el = $("#streak");
  el.hidden = n === 0;
  el.textContent = `${n} ${n === 1 ? "giorno" : "giorni"}`;
}

// ---------- Utilità ----------
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u) ? u : "#");
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const fmtDate = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
};
const dateLabel = (c) => c.dateLabel || fmtDate(c.date);
const isNew = (c) => c.addedAt && Date.now() - new Date(c.addedAt) < 36 * 3600e3 && !store.get("read", {})[c.id];

const ICON_ARROW = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;
const ICON_EXT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>`;
const ICON_INFO = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></svg>`;

const solidityHtml = (level) => {
  const s = SOLIDITY[level] || SOLIDITY.solido;
  return `<span class="solidity" data-level="${esc(level)}"><span class="solidity-bars"><i></i><i></i><i></i></span><span>${esc(s.label)}</span></span>`;
};

// ---------- Dati ----------
async function fetchJson(url) {
  const res = await fetch(`${url}?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(res.status);
  return res.json();
}

async function loadCards() {
  const data = await fetchJson(DATA_URL);
  state.cards = data.cards || [];
  state.updatedAt = data.updatedAt;
}

async function checkForUpdates() {
  if (!state.updatedAt || document.hidden) return;
  try {
    const meta = await fetchJson(META_URL);
    if (meta.updatedAt && meta.updatedAt > state.updatedAt) banner.hidden = false;
  } catch {}
}

function visibleCards() {
  const list = state.cards.filter((c) => c.section === state.section && (state.topic === "tutti" || c.topic === state.topic));
  const key = state.section === "novita" ? (c) => c.date || "" : (c) => c.addedAt || "";
  return list.sort((a, b) => key(b).localeCompare(key(a)));
}

// ---------- Rendering ----------
function renderChips() {
  const items = [["tutti", "Tutti"], ...Object.entries(TOPICS)];
  $("#chips").innerHTML = items
    .map(([id, label]) => `<button class="chip" data-topic="${id}" aria-pressed="${state.topic === id}" style="${id === "tutti" ? "" : `--c: var(--t-${id})`}">${id === "tutti" ? "" : '<span class="dot"></span>'}${label}</button>`)
    .join("");
}

function cardHtml(c, i) {
  const read = store.get("read", {})[c.id];
  return `
  <article class="card" data-id="${esc(c.id)}" data-topic="${esc(c.topic)}" style="--i:${Math.min(i, 4)}" tabindex="0" role="button" aria-label="${esc(c.title)}">
    <div class="card-art">
      <div class="card-art-inner">${artFor(c.topic, c.id)}</div>
      <div class="card-tags">
        <span class="tag"><span class="dot"></span>${esc(TOPICS[c.topic] || c.topic)}</span>
        ${isNew(c) ? '<span class="tag tag-new">Nuovo</span>' : ""}
      </div>
    </div>
    <div class="card-content">
      <p class="eyebrow">${esc(c.publisher)} · ${esc(dateLabel(c))}</p>
      <h2 class="card-title">${esc(c.title)}</h2>
      <p class="card-summary">${esc(c.summary)}</p>
      <div class="card-foot">
        ${solidityHtml(c.solidity)}
        ${read ? '<span class="read-check">✓ Letto</span>' : `<span class="read-more">Leggi ${ICON_ARROW}</span>`}
      </div>
    </div>
  </article>`;
}

function renderFeed({ refreshing = false } = {}) {
  const list = visibleCards();
  if (list.length === 0) {
    feed.innerHTML = `<div class="empty"><span class="serif">Ancora nulla qui</span>Nessuna scheda per questo argomento. Prova un altro filtro.</div>`;
    return;
  }
  feed.innerHTML =
    list.map(cardHtml).join("") +
    `<div class="feed-end"><span class="serif">Sei in pari</span>${list.length} ${list.length === 1 ? "scheda" : "schede"} · nuove ogni mattina</div>`;
  feed.scrollTop = 0;
  feed.classList.toggle("is-refreshing", refreshing);
  updateFocus();
}

function renderSkeleton() {
  feed.innerHTML = `<div class="skeleton"></div><div class="skeleton"></div>`;
}

// ---------- Effetto messa a fuoco: la scheda in primo piano è nitida, le altre sfocate ----------
let ticking = false;
function updateFocus() {
  ticking = false;
  const fr = feed.getBoundingClientRect();
  const focusY = fr.top + 10;
  for (const card of feed.querySelectorAll(".card")) {
    const r = card.getBoundingClientRect();
    if (r.bottom < fr.top - 200 || r.top > fr.bottom + 200) continue;
    const d = (r.top - focusY) / (r.height + 14);
    const a = Math.min(Math.abs(d), 1);
    const blur = d > 0 ? a * 9 : a * 3;
    card.style.filter = blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : "none";
    card.style.transform = `scale(${(1 - a * 0.05).toFixed(4)})`;
    card.style.opacity = (1 - a * (d > 0 ? 0.2 : 0.55)).toFixed(3);
  }
}
const requestFocus = () => { if (!ticking) { ticking = true; requestAnimationFrame(updateFocus); } };

function setFeedHeight() {
  document.documentElement.style.setProperty("--feed-h", `${feed.clientHeight}px`);
  requestFocus();
}

// ---------- Dettaglio ----------
function detailHtml(c) {
  const quotes = (c.quotes || [])
    .map((q) => `
      <blockquote class="quote">
        <p>“${esc(q.text)}”</p>
        ${q.translation && q.translation !== q.text ? `<p class="translation">${esc(q.translation)}</p>` : ""}
        <cite>— ${esc(q.source || c.publisher)}</cite>
      </blockquote>`)
    .join("");
  const paragraphs = (c.body || []).map((p) => `<p>${esc(p)}</p>`);
  // Le citazioni compaiono dopo il primo paragrafo, come in un articolo.
  const text = paragraphs.length > 1 ? paragraphs[0] + `</div>${quotes}<div class="detail-text">` + paragraphs.slice(1).join("") : paragraphs.join("") + `</div>${quotes}<div class="detail-text">`;
  const s = SOLIDITY[c.solidity] || SOLIDITY.solido;
  return `
    <div class="detail-meta">
      <span class="tag"><span class="dot"></span>${esc(TOPICS[c.topic] || c.topic)}</span>
      <span class="detail-date">${esc(dateLabel(c))} · ${esc(c.publisher)}</span>
    </div>
    <h2 class="detail-title" id="detail-title">${esc(c.title)}</h2>
    <p class="detail-lead">${esc(c.summary)}</p>
    <div class="solidity-panel">
      <span class="solidity" data-level="${esc(c.solidity)}"><span class="solidity-bars"><i></i><i></i><i></i></span></span>
      <strong>${esc(s.label)}</strong>
      <p>${esc(c.solidityNote || s.hint)}</p>
    </div>
    <div class="detail-text">${text}</div>
    <h3 class="section-label">Fonti</h3>
    <ul class="sources">
      ${(c.sources || []).map((s) => `<li><a href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener noreferrer"><span><span class="src-name">${esc(s.name)}</span><span class="src-host">${esc(host(s.url))}</span></span>${ICON_EXT}</a></li>`).join("")}
    </ul>
    <p class="disclaimer">${ICON_INFO}<span>Testo riassunto con l'AI a partire dalle fonti indicate e ricontrollato per evitare esagerazioni. In caso di dubbio fa fede la fonte originale.</span></p>`;
}

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
function insetFrom(rect) {
  const w = innerWidth, h = innerHeight;
  return `inset(${Math.max(rect.top, 0)}px ${Math.max(w - rect.right, 0)}px ${Math.max(h - rect.bottom, 0)}px ${Math.max(rect.left, 0)}px round 28px)`;
}

function openDetail(id, { push = true } = {}) {
  const c = state.cards.find((x) => x.id === id);
  if (!c) return;
  state.openId = id;
  detail.dataset.topic = c.topic;
  $("#detail-hero").querySelector(".detail-art")?.remove();
  $("#detail-hero").insertAdjacentHTML("afterbegin", `<div class="detail-art">${artFor(c.topic, c.id)}</div>`);
  $("#detail-body").innerHTML = detailHtml(c);
  $("#detail-scroll").scrollTop = 0;
  detail.hidden = false;

  const card = feed.querySelector(`.card[data-id="${CSS.escape(id)}"]`);
  if (card) {
    detail.animate([{ clipPath: insetFrom(card.getBoundingClientRect()) }, { clipPath: "inset(0px 0px 0px 0px round 0px)" }], { duration: 560, easing: EASE });
  } else {
    detail.animate([{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "none" }], { duration: 400, easing: EASE });
  }
  if (push) history.pushState({ detail: id }, "", `#${id}`);
  state.pushed = push;
  markRead(id);
  $("#detail-close").focus({ preventScroll: true });
}

function closeDetail() {
  if (detail.hidden) return;
  const id = state.openId;
  state.openId = null;
  state.pushed = false;
  const card = feed.querySelector(`.card[data-id="${CSS.escape(id)}"]`);
  const r = card?.getBoundingClientRect();
  const onScreen = r && r.bottom > 0 && r.top < innerHeight;
  const anim = onScreen
    ? detail.animate([{ clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: insetFrom(r) }], { duration: 440, easing: EASE })
    : detail.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(24px)" }], { duration: 300, easing: EASE });
  anim.onfinish = () => {
    detail.hidden = true;
    if (card) {
      // aggiorna lo stato "Letto" della scheda senza ridisegnare il feed
      const fresh = document.createElement("div");
      fresh.innerHTML = cardHtml(state.cards.find((x) => x.id === id), 0);
      card.querySelector(".card-foot").replaceWith(fresh.querySelector(".card-foot"));
      card.querySelector(".tag-new")?.remove();
      card.style.animation = "none";
      card.focus({ preventScroll: true });
    }
  };
}

// ---------- Interazioni ----------
function setSection(section) {
  state.section = section;
  document.querySelectorAll(".section-tab").forEach((t) => t.setAttribute("aria-selected", t.dataset.section === section));
  $(".sections").dataset.active = section;
  renderFeed({ refreshing: true });
}

function setTopic(topic) {
  state.topic = topic;
  document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", c.dataset.topic === topic));
  renderFeed({ refreshing: true });
}

async function refresh() {
  banner.hidden = true;
  try {
    await loadCards();
  } catch {
    banner.hidden = false;
    return;
  }
  renderFeed({ refreshing: true });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  $("#theme-color").setAttribute("content", theme === "dark" ? "#0b0b0c" : "#ffffff");
  $("#theme-toggle").setAttribute("aria-label", theme === "dark" ? "Attiva modalità chiara" : "Attiva modalità scura");
  store.set("theme", theme);
}

function bind() {
  feed.addEventListener("scroll", requestFocus, { passive: true });
  new ResizeObserver(setFeedHeight).observe(feed);

  feed.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card) openDetail(card.dataset.id);
  });
  feed.addEventListener("keydown", (e) => {
    const card = e.target.closest(".card");
    if (card && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openDetail(card.dataset.id); }
  });

  $(".sections").addEventListener("click", (e) => {
    const tab = e.target.closest(".section-tab");
    if (tab && tab.dataset.section !== state.section) setSection(tab.dataset.section);
  });
  $("#chips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip && chip.dataset.topic !== state.topic) {
      setTopic(chip.dataset.topic);
      chip.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  });

  banner.addEventListener("click", refresh);
  $("#theme-toggle").addEventListener("click", () => applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  $("#detail-close").addEventListener("click", () => {
    if (state.pushed) return history.back();
    history.replaceState(null, "", location.pathname + location.search);
    closeDetail();
  });
  addEventListener("popstate", () => {
    if (history.state?.detail) openDetail(history.state.detail, { push: false });
    else closeDetail();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !detail.hidden) $("#detail-close").click(); });

  document.addEventListener("visibilitychange", checkForUpdates);
  setInterval(checkForUpdates, CHECK_EVERY_MS);
}

async function main() {
  $("#today").textContent = new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  applyTheme(store.get("theme", "light"));
  renderChips();
  renderStreak();
  bind();
  setFeedHeight();
  renderSkeleton();
  try {
    await loadCards();
    renderFeed();
  } catch {
    feed.innerHTML = `<div class="empty"><span class="serif">Sei offline</span>Non riesco a caricare le schede. Riprova tra poco.</div>`;
  }
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash && state.cards.some((c) => c.id === hash)) {
    openDetail(hash, { push: false });
  }
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
}

main();
