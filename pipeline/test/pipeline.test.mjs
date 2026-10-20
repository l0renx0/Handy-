import { test } from "node:test";
import assert from "node:assert/strict";
import { parseFeed } from "../lib/feeds.mjs";
import { canonicalUrl, quoteIsVerbatim, hostAllowed, htmlToText } from "../lib/text.mjs";
import { buildIndex } from "../lib/store.mjs";

test("legge un feed RSS 2.0", () => {
  const xml = `<?xml version="1.0"?><rss version="2.0"><channel><title>X</title>
    <item><title><![CDATA[Webb vede &amp; misura]]></title><link>https://www.nasa.gov/a/</link>
    <pubDate>Mon, 19 Oct 2026 10:00:00 GMT</pubDate><description><![CDATA[<p>Testo <b>importante</b>.</p>]]></description></item>
  </channel></rss>`;
  const [it] = parseFeed(xml);
  assert.equal(it.title, "Webb vede & misura");
  assert.equal(it.link, "https://www.nasa.gov/a/");
  assert.equal(it.description, "Testo importante .");
});

test("legge un feed Atom", () => {
  const xml = `<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Voce</title>
    <link rel="alternate" href="https://en.wikipedia.org/wiki/X"/><updated>2026-10-19T00:00:00Z</updated>
    <summary type="html">&lt;p&gt;Ciao&lt;/p&gt;</summary></entry></feed>`;
  const [it] = parseFeed(xml);
  assert.equal(it.link, "https://en.wikipedia.org/wiki/X");
  assert.equal(it.description, "Ciao");
});

test("normalizza gli URL e riconosce i duplicati", () => {
  assert.equal(canonicalUrl("http://www.NASA.gov/a/?utm_source=x#top"), "https://nasa.gov/a");
  const idx = buildIndex([{ title: "Titolo", originalTitle: "Original", sources: [{ url: "https://nasa.gov/a" }] }], {});
  assert.ok(idx.has({ link: "https://www.nasa.gov/a/", title: "altro" }));
  assert.ok(idx.has({ link: "https://esa.int/b", title: "ORIGINAL" }));
  assert.ok(!idx.has({ link: "https://esa.int/b", title: "Nuovo" }));
});

test("accetta solo citazioni presenti nella fonte", () => {
  const src = "The team said: “this is the strongest evidence yet” for the signal.";
  assert.ok(quoteIsVerbatim('"this is the strongest evidence yet"', src));
  assert.ok(!quoteIsVerbatim("this is definitive proof of life", src));
});

test("filtra i domini fuori whitelist", () => {
  assert.ok(hostAllowed("https://science.nasa.gov/x", ["nasa.gov"]));
  assert.ok(!hostAllowed("https://nasa.gov.evil.com/x", ["nasa.gov"]));
});

test("rimuove script dall'HTML", () => {
  assert.equal(htmlToText("<p>a</p><script>alert(1)</script><p>b</p>"), "a\nb");
});
