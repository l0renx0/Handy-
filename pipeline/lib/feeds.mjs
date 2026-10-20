// Lettura dei feed RSS/Atom delle fonti in whitelist e delle pagine originali.
import { XMLParser } from "fast-xml-parser";
import { htmlToText, mainText, hostAllowed } from "./text.mjs";

const UA = "LumenBot/1.0 (+https://github.com; lettore personale di notizie scientifiche)";
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@",
  textNodeName: "#text",
  cdataPropName: "#cdata",
});

async function get(url, timeoutMs = 20000) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml, application/atom+xml, application/xml, text/html;q=0.9, */*;q=0.8" },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return { text: await res.text(), finalUrl: res.url || url };
}

const asArray = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const textOf = (x) => {
  if (x == null) return "";
  if (typeof x === "string" || typeof x === "number") return String(x);
  return String(x["#cdata"] ?? x["#text"] ?? "");
};

function atomLink(links) {
  const all = asArray(links);
  const alt = all.find((l) => !l["@rel"] || l["@rel"] === "alternate") || all[0];
  return alt ? alt["@href"] || textOf(alt) : "";
}

export function parseFeed(xml) {
  const doc = parser.parse(xml);
  if (doc.rss?.channel) {
    return asArray(doc.rss.channel.item).map((it) => ({
      title: htmlToText(textOf(it.title)),
      link: textOf(it.link).trim() || textOf(it.guid).trim(),
      date: textOf(it.pubDate || it["dc:date"]),
      description: htmlToText(textOf(it["content:encoded"]) || textOf(it.description)),
    }));
  }
  if (doc.feed) {
    return asArray(doc.feed.entry).map((it) => ({
      title: htmlToText(textOf(it.title)),
      link: atomLink(it.link),
      date: textOf(it.published || it.updated),
      description: htmlToText(textOf(it.content) || textOf(it.summary)),
    }));
  }
  if (doc["rdf:RDF"]) {
    return asArray(doc["rdf:RDF"].item).map((it) => ({
      title: htmlToText(textOf(it.title)),
      link: textOf(it.link).trim(),
      date: textOf(it["dc:date"]),
      description: htmlToText(textOf(it.description)),
    }));
  }
  throw new Error("formato del feed non riconosciuto");
}

export async function readSource(source, limit) {
  const { text } = await get(source.feed);
  return parseFeed(text)
    .filter((it) => it.title && it.link && hostAllowed(it.link, source.domini))
    .map((it) => {
      const d = new Date(it.date);
      return { ...it, date: isNaN(d) ? null : d.toISOString() };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, limit);
}

// Scarica la pagina originale per dare a Claude il testo completo, non solo l'estratto del feed.
export async function readArticle(url, domains, maxChars = 14000) {
  try {
    const { text, finalUrl } = await get(url);
    if (!hostAllowed(finalUrl, domains)) return "";
    return mainText(text).slice(0, maxChars);
  } catch {
    return "";
  }
}
