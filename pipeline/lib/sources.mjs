// Carica e controlla la whitelist delle fonti.
import { readJson } from "./store.mjs";
import { TOPICS } from "./claude.mjs";

export async function readFeedSources(path) {
  const { fonti } = await readJson(path);
  const ids = new Set();
  return fonti.filter((f) => {
    const problems = [];
    if (!f.id || ids.has(f.id)) problems.push("id mancante o ripetuto");
    if (!/^https:\/\//.test(f.feed || "")) problems.push("feed deve iniziare con https://");
    if (!Array.isArray(f.domini) || f.domini.length === 0) problems.push("domini mancanti");
    if (!["novita", "losapevi"].includes(f.sezione)) problems.push("sezione deve essere novita o losapevi");
    if (!TOPICS.includes(f.argomento)) problems.push(`argomento deve essere uno di: ${TOPICS.join(", ")}`);
    if (problems.length) {
      console.warn(`⚠ fonte "${f.nome || f.id}" ignorata: ${problems.join("; ")}`);
      return false;
    }
    ids.add(f.id);
    return f.attiva !== false;
  });
}
