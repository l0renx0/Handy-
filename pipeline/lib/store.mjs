// Lettura e scrittura del file JSON delle schede, senza duplicati.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { canonicalUrl, titleKey } from "./text.mjs";

export async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return fallback;
    throw err;
  }
}

export async function writeJson(path, data) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2) + "\n");
}

// Indice per riconoscere un contenuto già presente: stesso URL o stesso titolo originale.
export function buildIndex(cards, seen) {
  const urls = new Set(Object.keys(seen));
  const titles = new Set();
  for (const c of cards) {
    for (const s of c.sources) urls.add(canonicalUrl(s.url));
    if (c.originalTitle) titles.add(titleKey(c.originalTitle));
    titles.add(titleKey(c.title));
  }
  return {
    has: (item) => urls.has(canonicalUrl(item.link)) || titles.has(titleKey(item.title)),
    add: (item) => {
      urls.add(canonicalUrl(item.link));
      titles.add(titleKey(item.title));
    },
  };
}

// Ordine: più recenti prima (data della notizia, poi data di aggiunta).
export function sortCards(cards) {
  return cards.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (b.addedAt || "").localeCompare(a.addedAt || ""));
}

// Tiene il registro dei link già valutati (anche quelli scartati) per non pagarli due volte.
export function pruneSeen(seen, days = 90) {
  const limit = Date.now() - days * 864e5;
  return Object.fromEntries(Object.entries(seen).filter(([, d]) => new Date(d).getTime() > limit));
}
