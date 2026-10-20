# Lumen — ogni giorno qualcosa di vero

Lumen è un'app personale da installare sul telefono. Mostra un feed di schede da scorrere, come un social, ma senza persone che pubblicano: i contenuti arrivano **solo da fonti affidabili** (NASA, ESA, INAF, CERN, OMS, ISTAT, Nature, Science, università, enciclopedie). Un'intelligenza artificiale (Claude) li riassume in italiano e **un secondo controllo automatico** verifica che titolo e testo non esagerino rispetto alla fonte.

- **Novità**: notizie recenti, dalla più nuova alla più vecchia.
- **Lo sapevi?**: conoscenze consolidate e affascinanti.
- Ogni scheda mostra quanto è **solida** l'informazione: 🟩 *Consolidato*, 🟦 *Fonte ufficiale*, 🟧 *Studio recente, da confermare*.
- Toccando una scheda si apre la spiegazione completa, con citazioni e link alle fonti originali.

Indirizzo dell'app (dopo aver completato i passi qui sotto):
**https://l0renx0.github.io/Handy-/lumen/**

> L'app Handy+ già presente nel repository non è stata toccata: continua a funzionare all'indirizzo di sempre. Lumen vive nella cartella `lumen/`.

---

## Cosa devi fare tu (una volta sola, circa 15 minuti)

Non serve saper programmare: si fa tutto dal sito di GitHub e da quello di Anthropic.

### Passo 1 — Porta il lavoro sul ramo principale

Il codice è stato preparato sul ramo `claude/pwa-daily-learning-app-yag1cy`. Va unito al ramo principale (`main`), perché GitHub Pages e l'aggiornamento automatico lavorano su `main`.

1. Apri il repository su GitHub.
2. Se in alto compare un riquadro giallo con il nome del ramo e il pulsante **Compare & pull request**, cliccalo. Altrimenti vai nella scheda **Pull requests** → **New pull request**, scegli `base: main` e `compare: claude/pwa-daily-learning-app-yag1cy`.
3. Clicca **Create pull request**, poi **Merge pull request** → **Confirm merge**.

### Passo 2 — Attiva GitHub Pages

Se Handy+ è già online con GitHub Pages, questo passo è già fatto: controlla solo che le impostazioni siano queste.

1. Nel repository vai su **Settings** (ingranaggio in alto) → nel menu a sinistra **Pages**.
2. In **Build and deployment** → **Source** scegli **Deploy from a branch**.
3. In **Branch** scegli **main** e la cartella **/ (root)**, poi **Save**.
4. Dopo uno o due minuti l'app è online su `https://l0renx0.github.io/Handy-/lumen/`.

### Passo 3 — Crea la chiave dell'API di Claude

La chiave permette all'aggiornamento automatico di usare Claude per scrivere e verificare le schede.

1. Vai su **https://console.anthropic.com** e accedi (o crea un account).
2. In **Billing** aggiungi un metodo di pagamento e un po' di credito (per iniziare bastano 5–10 €).
3. Vai in **API Keys** → **Create Key**, dai un nome (es. `lumen`) e copia la chiave (inizia con `sk-ant-…`). **Non condividerla con nessuno**: viene mostrata una sola volta.

### Passo 4 — Inserisci la chiave su GitHub (in modo sicuro)

1. Nel repository vai su **Settings** → **Secrets and variables** → **Actions**.
2. Clicca **New repository secret**.
3. In **Name** scrivi esattamente: `ANTHROPIC_API_KEY`
4. In **Secret** incolla la chiave, poi **Add secret**.

La chiave resta cifrata: nessuno può leggerla, nemmeno tu dopo averla salvata.

### Passo 5 — Fai partire il primo aggiornamento

L'aggiornamento parte da solo ogni mattina verso le 6 (ora italiana). Per provarlo subito:

1. Vai nella scheda **Actions** del repository. Se GitHub chiede di abilitare i workflow, clicca il pulsante verde per abilitarli.
2. A sinistra clicca **Aggiorna Lumen** → a destra **Run workflow** → **Run workflow**.
3. Dopo qualche minuto compare un pallino verde ✅. Le nuove schede saranno nell'app entro un paio di minuti (il tempo che GitHub Pages pubblichi la nuova versione).

Se compare una ❌ rossa, guarda la sezione *Problemi frequenti* in fondo.

### Passo 6 — Installa l'app sul telefono

**iPhone (Safari)**
1. Apri `https://l0renx0.github.io/Handy-/lumen/` con **Safari**.
2. Tocca il pulsante **Condividi** (il quadrato con la freccia verso l'alto).
3. Scorri e scegli **Aggiungi alla schermata Home** → **Aggiungi**.

**Android (Chrome)**
1. Apri lo stesso indirizzo con **Chrome**.
2. Tocca il menu **⋮** in alto a destra.
3. Scegli **Installa app** (o **Aggiungi a schermata Home**) → **Installa**.

L'icona arancione di Lumen comparirà tra le tue app. Si apre a tutto schermo e funziona anche offline con le ultime schede scaricate.

---

## Come si usa

- **Scorri** verso l'alto: la scheda in primo piano è nitida, quella sotto si intravede sfocata.
- **Tocca** una scheda per leggere la spiegazione completa; chiudi con la ✕ o con il gesto "indietro" del telefono.
- **Filtri** in alto: Scienza, Spazio, Salute, Storia, Tecnologia, Natura.
- Quando arrivano contenuti nuovi compare in alto la scritta arancione **Nuove notizie · Aggiorna**: toccala per ricaricare.
- Il pulsante con la luna attiva la **modalità scura**.
- Il contatore "giorni" indica da quanti giorni di fila leggi almeno una scheda.

---

## Aggiungere o togliere una fonte

Le fonti sono in una lista chiusa ("whitelist") nel file [`pipeline/sources.json`](pipeline/sources.json). Solo quelle vengono lette.

**Per aggiungerne una:**

1. Trova l'indirizzo del **feed RSS** del sito. Di solito si trova cercando l'icona RSS 🟧 sul sito, oppure una pagina "RSS" o "Feed" nel fondo pagina. Spesso è l'indirizzo del sito seguito da `/feed/` o `/rss`.
2. Su GitHub apri il file `pipeline/sources.json` e clicca l'icona della **matita** ✏️ (Edit).
3. Copia un blocco esistente, dalla `{` alla `}`, incollalo dopo un altro blocco (ricordando la **virgola** tra un blocco e l'altro) e modifica i valori:

```json
{
  "id": "nome-breve-senza-spazi",
  "nome": "Nome dell'ente come lo vuoi vedere nell'app",
  "feed": "https://indirizzo-del-feed.xml",
  "domini": ["sito-dell-ente.it"],
  "sezione": "novita",
  "argomento": "scienza",
  "attiva": true
}
```

- `domini`: il sito a cui puntano gli articoli. Link verso altri siti vengono ignorati, per sicurezza.
- `sezione`: `novita` oppure `losapevi`.
- `argomento`: uno tra `scienza`, `spazio`, `salute`, `storia`, `tecnologia`, `natura` (è un suggerimento: Claude sceglie quello più adatto alla singola notizia).

4. In basso clicca **Commit changes**. Dal giorno dopo la fonte viene letta.

**Per spegnere una fonte** senza cancellarla, cambia `"attiva": true` in `"attiva": false`.

Consiglio: aggiungi solo enti pubblici, agenzie scientifiche, riviste con revisione tra pari, università ed enciclopedie. Evita siti di notizie generiche o blog.

---

## Impostazioni e costi

Nel file [`pipeline/config.json`](pipeline/config.json) puoi cambiare:

| Impostazione | Cosa fa | Valore attuale |
|---|---|---|
| `modello` | il modello Claude usato | `claude-opus-5-5` |
| `maxNuoveSchedePerGiorno` | massimo di schede create ogni giorno | `10` |
| `giorniMassimiNovita` | ignora notizie più vecchie di così | `10` |
| `elementiPerFonte` | quanti articoli recenti leggere da ogni fonte | `4` |

**Costo indicativo**: ogni scheda richiede due chiamate a Claude (scrittura + verifica), circa 0,10 $ con il modello attuale. Con 10 schede al giorno sono circa 1 $ al giorno, quindi circa 30 $ al mese. Per spendere meno puoi abbassare `maxNuoveSchedePerGiorno` (es. `4`) oppure usare `claude-sonnet-5-5`, che costa circa la metà. Puoi impostare un tetto di spesa mensile nella console di Anthropic (**Billing → Limits**).

---

## Come viene evitata la disinformazione

1. **Whitelist**: si leggono solo le fonti approvate e solo link verso i loro siti.
2. **Testo completo**: la pipeline scarica l'articolo originale, non si limita al titolo.
3. **Scrittura vincolata**: a Claude è chiesto di scrivere solo ciò che la fonte afferma, senza iperboli né clickbait, mantenendo la prudenza della fonte ("nei topi", "studio preliminare"…).
4. **Verifica separata**: un secondo passaggio confronta la scheda con la fonte e la approva, la riscrive o la scarta.
5. **Citazioni controllate dal programma**: una citazione viene mostrata solo se compare parola per parola nel testo originale.
6. **Solidità dichiarata**: ogni scheda dice se l'informazione è consolidata, ufficiale o preliminare.
7. **Fonti sempre visibili**: ogni scheda ha i link agli originali. In caso di dubbio, fa fede la fonte.

Le 25 schede iniziali sono state preparate insieme all'app, a partire da fonti reali (Fondazione Nobel, NASA, OMS, CERN, British Museum, riviste scientifiche, Wikipedia). Le "Novità" iniziali risalgono al 2024–2025: dal primo aggiornamento automatico arriveranno quelle del giorno.

---

## Problemi frequenti

- **L'aggiornamento fallisce con "Manca ANTHROPIC_API_KEY"** → ripeti il Passo 4 controllando che il nome sia esattamente `ANTHROPIC_API_KEY`.
- **Fallisce con un errore di credito o "401"** → la chiave è sbagliata o il credito è finito: controlla su console.anthropic.com.
- **Fallisce al passo "Salva i risultati" con "permission denied"** → Settings → Actions → General → in fondo **Workflow permissions** → scegli **Read and write permissions** → Save.
- **Una fonte compare con ✗ nel registro** → il suo feed non risponde o ha cambiato indirizzo. Le altre fonti continuano a funzionare; puoi correggere l'indirizzo o spegnerla con `"attiva": false`.
- **Sul telefono non vedo le novità** → apri l'app con la connessione attiva; se serve, tocca "Nuove notizie · Aggiorna".

Per vedere cosa è successo in un aggiornamento: scheda **Actions** → clicca l'esecuzione → **aggiorna** → apri il passo **Crea le nuove schede**. Ogni riga dice cosa è stato aggiunto (+), corretto o scartato (–) e perché.

---

## Struttura del progetto (per curiosità)

```
lumen/                  l'app (pubblicata da GitHub Pages)
  index.html            struttura della pagina
  styles.css            aspetto grafico (chiaro e scuro)
  app.js                feed, filtri, dettaglio, banner aggiornamenti
  art.js                illustrazioni generate per argomento
  sw.js                 funzionamento offline
  manifest.webmanifest  dati per l'installazione sul telefono
  data/cards.json       le schede (aggiornate ogni giorno)
  data/meta.json        data dell'ultimo aggiornamento (per il banner)
pipeline/               il programma che crea le schede
  sources.json          whitelist delle fonti
  config.json           impostazioni
  update.mjs            il procedimento completo
  lib/                  lettura feed, chiamate a Claude, salvataggio
  state/seen.json       articoli già valutati (per non ripagarli)
.github/workflows/      l'aggiornamento automatico quotidiano
```

Per provarlo sul computer (facoltativo, serve Node.js 22): `cd pipeline && npm install && npm run prova` mostra cosa verrebbe elaborato senza usare Claude; `npm test` esegue i controlli automatici.

---

## Handy+

Nella cartella principale c'è anche **Handy+**, l'app ordini del Velissima (`index.html`, `menu.js`, icone). È indipendente da Lumen.
