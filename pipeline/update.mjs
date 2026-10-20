// Pipeline giornaliera di Lumen.
// 1) legge i feed della whitelist  2) Claude scrive la scheda  3) Claude la verifica  4) salva il JSON.
// Uso: node update.mjs            → esecuzione completa (serve ANTHROPIC_API_KEY)
//      node update.mjs --dry-run  → mostra solo cosa verrebbe elaborato, senza chiamare Claude
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { readFeedSources } from "./lib/sources.mjs";
import { readSource, readArticle } from "./lib/feeds.mjs";
import { writeCard, verifyCard, TOPICS, SOLIDITY } from "./lib/claude.mjs";
import { readJson, writeJson, buildIndex, sortCards, pruneSeen } from "./lib/store.mjs";
import { idFor, canonicalUrl, quoteIsVerbatim } from "./lib/text.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const config = await readJson(resolve(here, "config.json"));
const paths = Object.fromEntries(Object.entries(config.file).map(([k, p]) => [k, resolve(here, p)]));
const dryRun = process.argv.includes("--dry-run");

if (!dryRun && !process.env.ANTHROPIC_API_KEY) {
  console.error("Manca ANTHROPIC_API_KEY. Inseriscila nei Secrets del repository (vedi README).");
  process.exit(1);
}

const store = await readJson(paths.schede, { updatedAt: null, cards: [] });
const seen = pruneSeen(await readJson(paths.visti, {}));
const index = buildIndex(store.cards, seen);
const sources = await readFeedSources(resolve(here, "sources.json"));
const now = new Date();
const maxAge = config.giorniMassimiNovita * 864e5;

// 1. Raccolta dei candidati da tutte le fonti attive.
const candidates = [];
for (const source of sources) {
  try {
    const items = await readSource(source, config.elementiPerFonte);
    let fresh = 0;
    for (const item of items) {
      if (index.has(item)) continue;
      if (source.sezione === "novita" && item.date && now - new Date(item.date) > maxAge) continue;
      index.add(item);
      candidates.push({ item, source });
      fresh++;
    }
    console.log(`✓ ${source.nome}: ${items.length} letti, ${fresh} nuovi`);
  } catch (err) {
    console.warn(`✗ ${source.nome}: ${err.message}`);
  }
}

// Alterna le fonti, così nessuna occupa tutto lo spazio del giorno.
const bySource = Map.groupBy(candidates, (c) => c.source.id);
const queue = [];
for (let i = 0; queue.length < candidates.length; i++) {
  for (const list of bySource.values()) if (list[i]) queue.push(list[i]);
}
const todo = queue.slice(0, config.maxNuoveSchedePerGiorno);
console.log(`\n${candidates.length} candidati, ne elaboro ${todo.length}.\n`);

if (dryRun) {
  for (const { item, source } of todo) console.log(`• [${source.id}] ${item.title}\n  ${item.link}`);
  process.exit(0);
}

// 2-3. Scrittura e verifica.
const added = [];
for (const { item, source } of todo) {
  const tag = `[${source.id}] ${item.title.slice(0, 70)}`;
  seen[canonicalUrl(item.link)] = now.toISOString();
  try {
    const article = await readArticle(item.link, source.domini);
    const text = [item.description, article].filter(Boolean).join("\n\n").slice(0, 16000);
    if (text.length < 200) {
      console.log(`– saltata (testo insufficiente, riprovo domani): ${tag}`);
      delete seen[canonicalUrl(item.link)];
      continue;
    }

    const opts = { item, source, text, model: config.modello, effort: config.effort };
    const draft = await writeCard(opts);
    if (!draft.pertinente) { console.log(`– scartata (non pertinente: ${draft.motivo_scarto}): ${tag}`); continue; }

    const check = await verifyCard({ ...opts, draft });
    if (check.verdetto === "scarta") { console.log(`– scartata dalla verifica (${check.problemi.join("; ")}): ${tag}`); continue; }
    const final = check.verdetto === "riscrivi" ? { ...draft, ...check } : draft;

    if (!TOPICS.includes(final.argomento) || !SOLIDITY.includes(final.solidita) || !final.titolo || final.spiegazione.length === 0) {
      console.log(`– scartata (formato non valido): ${tag}`);
      continue;
    }

    // Tiene solo le citazioni che compaiono davvero, parola per parola, nella fonte.
    const quotes = final.citazioni
      .filter((q) => quoteIsVerbatim(q.originale, text))
      .map((q) => ({ text: q.originale.trim(), translation: q.traduzione.trim() }));

    added.push({
      id: idFor(item.link),
      section: final.sezione,
      topic: final.argomento,
      title: final.titolo.trim(),
      summary: final.anteprima.trim(),
      body: final.spiegazione.map((p) => p.trim()).filter(Boolean),
      quotes,
      sources: [{ name: source.nome, url: item.link }],
      publisher: source.nome,
      originalTitle: item.title,
      date: (item.date || now.toISOString()).slice(0, 10),
      addedAt: now.toISOString(),
      solidity: final.solidita,
      solidityNote: final.nota_solidita.trim(),
      verified: check.verdetto === "ok" ? "approvata" : "corretta",
    });
    console.log(`+ ${check.verdetto === "ok" ? "approvata" : "corretta "}: ${final.titolo}`);
  } catch (err) {
    console.warn(`! errore su ${tag}: ${err.message}`);
    delete seen[canonicalUrl(item.link)]; // riprova al prossimo giro
  }
}

// 4. Salvataggio.
const cards = sortCards([...added, ...store.cards]).slice(0, config.maxSchedeTotali);
await writeJson(paths.visti, seen);
if (added.length > 0) {
  const updatedAt = now.toISOString();
  await writeJson(paths.schede, { updatedAt, cards });
  await writeJson(paths.meta, { updatedAt, count: cards.length });
}
console.log(`\nFatto: ${added.length} nuove schede, ${cards.length} totali.`);
