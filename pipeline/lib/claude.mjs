// I due passaggi con Claude: (1) scrittura della scheda, (2) verifica anti-esagerazione.
import Anthropic from "@anthropic-ai/sdk";

export const TOPICS = ["scienza", "spazio", "salute", "storia", "tecnologia", "natura"];
export const SOLIDITY = ["consolidato", "solido", "preliminare"];

let client; // creato al primo uso: legge ANTHROPIC_API_KEY dall'ambiente

const WRITE_SYSTEM = `Sei il redattore di Lumen, un'app personale per imparare ogni giorno qualcosa di vero.
Ricevi il testo di UNA fonte affidabile (agenzia spaziale, rivista scientifica, ente pubblico, università, enciclopedia) e ne ricavi una scheda in italiano.

Regole, in ordine di importanza:
1. Fedeltà assoluta. Scrivi solo ciò che la fonte afferma. Non aggiungere numeri, nomi, date o conclusioni che non sono nel testo. Se la fonte è prudente ("potrebbe", "suggerisce", "nei topi"), la scheda è altrettanto prudente.
2. Niente clickbait. Il titolo incuriosisce con il contenuto reale, non con iperboli ("rivoluzionario", "sconvolgente", "gli scienziati sono sbalorditi"), domande retoriche o promesse che la fonte non mantiene. Massimo 90 caratteri.
3. Anteprima: 1-2 frasi (massimo 220 caratteri) che dicono esattamente il punto centrale e invogliano a leggere.
4. Spiegazione: da 2 a 5 paragrafi brevi, chiari per un lettore curioso non esperto. Spiega i termini tecnici. Se è uno studio, indica chi lo ha condotto, su cosa (campione, animali, simulazioni) e i limiti dichiarati.
5. Citazioni: da 0 a 2 frasi brevi copiate PAROLA PER PAROLA dal testo della fonte, nella lingua originale, più la traduzione italiana. Se non sei sicuro che siano identiche al testo, non metterle.
6. Solidità:
   - "consolidato": conoscenza stabile, confermata da molte evidenze nel tempo (fatti storici documentati, leggi scientifiche, scoperte replicate).
   - "solido": dato o evento verificato da una fonte ufficiale (lancio di una missione, statistica ufficiale, decisione di un ente) oppure risultato pubblicato e ben supportato ma recente.
   - "preliminare": studio singolo, recente, non ancora replicato, preprint, risultati su animali o campioni piccoli, ipotesi.
   Nella nota di solidità spiega in una frase perché.
7. Pertinenza: imposta pertinente=false per contenuti senza una conoscenza da imparare (nomine, bandi, eventi, contratti, promozioni, opinioni, avvisi tecnici, raccolte di link, terremoti di routine senza contenuto divulgativo).
8. Sezione: "novita" per notizie e risultati recenti; "losapevi" per conoscenze consolidate e affascinanti (scoperte storiche, fatti scientifici solidi). Per i contenuti di tipo "Accadde oggi" scegli un solo evento, il più interessante e documentato.`;

const VERIFY_SYSTEM = `Sei un verificatore severo per Lumen. Confronti una scheda scritta da un'AI con il testo della fonte originale.
Controlla che:
- titolo e anteprima non esagerino, non promettano più di quanto dice la fonte e non siano clickbait;
- ogni affermazione della spiegazione sia supportata dalla fonte (numeri, nomi, date, conclusioni);
- la prudenza della fonte sia rispettata (ipotesi presentate come ipotesi, studi su animali indicati come tali);
- il livello di solidità sia coerente con la natura dell'informazione.
Verdetto:
- "ok" se tutto è corretto: restituisci titolo, anteprima, spiegazione, solidità e nota invariati;
- "riscrivi" se ci sono errori correggibili: restituisci le versioni corrette (stesso stile, stessi limiti di lunghezza: titolo max 90 caratteri, anteprima max 220);
- "scarta" se la scheda è fuorviante in modo non recuperabile o la fonte non contiene una conoscenza verificabile.
Elenca i problemi trovati (vuoto se nessuno).`;

const str = { type: "string" };
const strArr = { type: "array", items: str };

const WRITE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["pertinente", "motivo_scarto", "sezione", "titolo", "anteprima", "spiegazione", "citazioni", "argomento", "solidita", "nota_solidita"],
  properties: {
    pertinente: { type: "boolean" },
    motivo_scarto: str,
    sezione: { type: "string", enum: ["novita", "losapevi"] },
    titolo: str,
    anteprima: str,
    spiegazione: strArr,
    citazioni: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["originale", "traduzione"],
        properties: { originale: str, traduzione: str },
      },
    },
    argomento: { type: "string", enum: TOPICS },
    solidita: { type: "string", enum: SOLIDITY },
    nota_solidita: str,
  },
};

const VERIFY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["verdetto", "problemi", "titolo", "anteprima", "spiegazione", "solidita", "nota_solidita"],
  properties: {
    verdetto: { type: "string", enum: ["ok", "riscrivi", "scarta"] },
    problemi: strArr,
    titolo: str,
    anteprima: str,
    spiegazione: strArr,
    solidita: { type: "string", enum: SOLIDITY },
    nota_solidita: str,
  },
};

async function askJson({ model, effort, system, prompt, schema }) {
  const params = {
    model,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort, format: { type: "json_schema", schema } },
    system,
    messages: [{ role: "user", content: prompt }],
  };
  client ??= new Anthropic();
  let res;
  try {
    // Se il modello declina per policy, il server riprova su un modello di riserva.
    res = await client.beta.messages.create({ ...params, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" });
  } catch (err) {
    if (!(err instanceof Anthropic.BadRequestError)) throw err;
    res = await client.messages.create(params); // stesso invio senza riserva, se non supportata
  }
  if (res.stop_reason === "refusal") throw new Error("richiesta declinata dal modello");
  if (res.stop_reason === "max_tokens") throw new Error("risposta troncata");
  const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  return JSON.parse(text);
}

function sourceBlock(item, source, text) {
  return `<fonte>
Ente: ${source.nome}
Sezione suggerita: ${source.sezione}
Argomento suggerito: ${source.argomento}
Titolo originale: ${item.title}
Data: ${item.date || "non indicata"}
URL: ${item.link}

Testo:
${text}
</fonte>`;
}

export function writeCard({ item, source, text, model, effort }) {
  return askJson({
    model, effort,
    system: WRITE_SYSTEM,
    schema: WRITE_SCHEMA,
    prompt: `${sourceBlock(item, source, text)}\n\nScrivi la scheda per questa fonte.`,
  });
}

export function verifyCard({ item, source, text, draft, model, effort }) {
  const scheda = {
    titolo: draft.titolo,
    anteprima: draft.anteprima,
    spiegazione: draft.spiegazione,
    solidita: draft.solidita,
    nota_solidita: draft.nota_solidita,
  };
  return askJson({
    model, effort,
    system: VERIFY_SYSTEM,
    schema: VERIFY_SCHEMA,
    prompt: `${sourceBlock(item, source, text)}\n\n<scheda>\n${JSON.stringify(scheda, null, 2)}\n</scheda>\n\nVerifica la scheda rispetto alla fonte.`,
  });
}
