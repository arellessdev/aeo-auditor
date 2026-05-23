/**
 * Manual signal tester — run with: node test-signals.js
 * Tests the two real AEO measurement functions against known businesses.
 * Requires PERPLEXITY_API_KEY in .env (or set in environment).
 * Pass --raw to also dump raw schema JSON per business.
 */

require("dotenv").config();

// ─── Name matching helpers (identical to server.js) ──────────────────────────

function normalizeStr(str) {
  return str.toLowerCase().replace(/['\-\.]/g, "").replace(/\s+/g, " ").trim();
}

function extractDomain(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch { return null; }
}

function businessMatchReason(name, url, text) {
  const normText = normalizeStr(text);
  const normName = normalizeStr(name);
  if (normText.includes(normName)) return "name";
  const domain = extractDomain(url);
  if (domain && text.toLowerCase().includes(domain)) return "domain";
  const words = normName.split(" ").filter(Boolean);
  if (words.length >= 3) {
    for (let i = 0; i < words.length - 1; i++) {
      if (normText.includes(`${words[i]} ${words[i + 1]}`)) return "partial";
    }
  }
  return null;
}

function businessMatchesText(name, url, text) {
  return businessMatchReason(name, url, text) !== null;
}

// ─── Signal functions (identical to server.js) ───────────────────────────────

const RELEVANT_SCHEMA_TYPES = [
  "LocalBusiness", "Restaurant", "FoodEstablishment", "Organization",
  "Store", "Service", "Product", "Place", "ProfessionalService",
  "HealthAndBeautyBusiness", "LodgingBusiness", "SportsActivityLocation",
];

async function checkPerplexityPresence(name, url, category, location) {
  const cat = category || "business";
  const loc = location || "any area";
  const prompts = [
    `best ${cat} in ${loc}`,
    `recommend a ${cat} near ${loc}`,
    `top ${cat} ${loc}`,
  ];

  if (!process.env.PERPLEXITY_API_KEY) {
    return { score: null, promptsTested: 3, promptsMatched: 0, prompts: [], error: "No API key" };
  }

  const results = await Promise.allSettled(
    prompts.map((prompt) =>
      fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "sonar",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 512,
        }),
        signal: AbortSignal.timeout(15000),
      }).then((r) => r.json())
    )
  );

  const promptResults = prompts.map((prompt, i) => {
    const r = results[i];
    const text = r.status === "fulfilled"
      ? (r.value?.choices?.[0]?.message?.content || "") : "";
    const reason = businessMatchReason(name, url, text);
    return { prompt, matched: reason !== null, matchedBy: reason, snippet: text.slice(0, 180) };
  });

  const matched = promptResults.filter((p) => p.matched).length;
  return {
    score: Math.round((matched / prompts.length) * 100),
    promptsTested: prompts.length,
    promptsMatched: matched,
    prompts: promptResults,
  };
}

async function checkSchemaMarkup(url) {
  const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
  try {
    const res = await fetch(normalizedUrl, {
      headers: { "User-Agent": "AEOAuditor/1.0 (+https://aeoauditor.com)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return { found: false, types: [], relevantTypes: [], schemasFound: 0, error: `HTTP ${res.status}` };

    const html = await res.text();
    const jsonLdRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const schemas = [];
    let m;
    while ((m = jsonLdRe.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(m[1].trim());
        schemas.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      } catch { /* malformed block */ }
    }

    const types = [...new Set(
      schemas.flatMap((s) => (Array.isArray(s["@type"]) ? s["@type"] : [s["@type"]]).filter(Boolean))
    )];
    const relevantTypes = types.filter((t) =>
      RELEVANT_SCHEMA_TYPES.some((rt) => t.includes(rt))
    );

    return { found: schemas.length > 0, types, relevantTypes, schemasFound: schemas.length,
             hasLocalBusiness: relevantTypes.length > 0, rawSchemas: schemas };
  } catch (err) {
    return { found: false, types: [], relevantTypes: [], schemasFound: 0, error: err.message };
  }
}

// ─── Test cases ──────────────────────────────────────────────────────────────

const TEST_CASES = [
  // Large national brands
  { group: "National", name: "Reef",                url: "https://reef.com",                    category: "footwear",             location: "beach lifestyle" },
  { group: "National", name: "Patagonia",           url: "https://patagonia.com",               category: "outdoor apparel",      location: "national" },
  { group: "National", name: "Cheesecake Factory",  url: "https://thecheesecakefactory.com",    category: "restaurant chain",     location: "national" },
  { group: "National", name: "Jiffy Lube",          url: "https://jiffylube.com",               category: "auto service",         location: "national" },
  { group: "National", name: "Anytime Fitness",     url: "https://anytimefitness.com",          category: "gym",                  location: "national" },
  // Mid-size regional brands
  { group: "Regional", name: "Raising Cane's",      url: "https://raisingcanes.com",            category: "fast food",            location: "Baton Rouge LA" },
  { group: "Regional", name: "In-N-Out Burger",     url: "https://in-n-out.com",                category: "fast food",            location: "California" },
  { group: "Regional", name: "Hy-Vee",              url: "https://hy-vee.com",                  category: "grocery store",        location: "Des Moines IA" },
  { group: "Regional", name: "WinCo Foods",         url: "https://wincofoods.com",              category: "grocery store",        location: "Boise ID" },
  { group: "Regional", name: "Scheels",             url: "https://scheels.com",                 category: "sporting goods",       location: "Fargo ND" },
  // Small local businesses
  { group: "Local",    name: "Cattlemen's Steakhouse", url: "https://cattlemensrestaurant.com", category: "steakhouse",           location: "Oklahoma City OK" },
  { group: "Local",    name: "Anchor Down Bar and Grill", url: "https://anchordownbarandgrill.com", category: "bar and grill",    location: "Nashville TN" },
  { group: "Local",    name: "Green Leaf Juice Bar", url: "https://greenleafjuicebar.com",      category: "juice bar",            location: "Austin TX" },
  { group: "Local",    name: "Blue Moon Yoga",      url: "https://bluemoonyogadenver.com",       category: "yoga studio",          location: "Denver CO" },
  { group: "Local",    name: "Mountain West Dental", url: "https://mountainwestdental.com",     category: "dentist",              location: "Salt Lake City UT" },
  // Service businesses
  { group: "Service",  name: "Mr. Rooter Plumbing", url: "https://mrrooter.com",                category: "plumbing",             location: "national" },
  { group: "Service",  name: "Paul Davis Restoration", url: "https://pauldavis.com",            category: "restoration services", location: "national" },
  { group: "Service",  name: "Servpro",             url: "https://servpro.com",                 category: "disaster restoration", location: "national" },
  { group: "Service",  name: "Lawn Doctor",         url: "https://lawndoctor.com",              category: "lawn care",            location: "national" },
  { group: "Service",  name: "Dakota's Restaurant", url: "https://dakotasrestaurantok.com",     category: "restaurant",           location: "Blanchard OK" },
];

// ─── Runner ──────────────────────────────────────────────────────────────────

function pad(str, len, right = false) {
  const s = String(str ?? "");
  return right ? s.padStart(len) : s.padEnd(len);
}

async function runTest(tc, idx) {
  const { group, name, url, category, location } = tc;
  console.log(`\n[${idx + 1}/20] ${group.toUpperCase()} — ${name}`);
  console.log(`  ${url}  |  ${category}  |  ${location}`);

  const [perplexity, schema] = await Promise.all([
    checkPerplexityPresence(name, url, category, location)
      .catch((err) => ({ score: null, promptsMatched: 0, promptsTested: 3, prompts: [], error: err.message })),
    checkSchemaMarkup(url)
      .catch((err) => ({ found: false, types: [], relevantTypes: [], schemasFound: 0, error: err.message })),
  ]);

  // Perplexity detail
  if (perplexity.score !== null) {
    console.log(`  Perplexity: ${perplexity.score}/100 (${perplexity.promptsMatched}/${perplexity.promptsTested} matched)`);
    for (const p of perplexity.prompts) {
      const icon = p.matched ? "✅" : "❌";
      const via  = p.matchedBy ? ` [${p.matchedBy}]` : "";
      console.log(`    ${icon}${via} "${p.prompt}"`);
      if (p.snippet) console.log(`       ↳ ${p.snippet.replace(/\n/g, " ")}…`);
    }
  } else {
    console.log(`  Perplexity: ⚠️  ${perplexity.error}`);
  }

  // Schema detail
  if (schema.error && !schema.found) {
    console.log(`  Schema:     ⚠️  ${schema.error}`);
  } else if (!schema.found) {
    console.log("  Schema:     ❌ None found");
  } else {
    const rel = schema.relevantTypes.join(", ") || "—";
    console.log(`  Schema:     ✅ ${schema.schemasFound} block(s) — relevant: ${rel}`);
    if (process.argv.includes("--raw"))
      console.log(JSON.stringify(schema.rawSchemas, null, 2));
  }

  return { tc, perplexity, schema };
}

// ─── Summary table ────────────────────────────────────────────────────────────

function printTable(rows) {
  const SEP = "─".repeat(110);
  console.log(`\n\n${"═".repeat(110)}`);
  console.log("SUMMARY TABLE");
  console.log(`${"═".repeat(110)}`);
  console.log(
    pad("#",  3) +
    pad("Group",    10) +
    pad("Business",              26) +
    pad("Perplexity", 12) +
    pad("Match via",  16) +
    pad("Schema blocks", 15) +
    "Relevant schema types"
  );
  console.log(SEP);

  for (const { tc, perplexity, schema } of rows) {
    const pScore = perplexity.score !== null ? `${perplexity.score}/100` : "n/a";
    const matchVia = perplexity.prompts
      .filter((p) => p.matched && p.matchedBy)
      .map((p) => p.matchedBy)
      .filter((v, i, a) => a.indexOf(v) === i)   // unique
      .join("+") || "—";
    const schemaBlocks = schema.error && !schema.found
      ? `err`
      : schema.found ? `${schema.schemasFound}` : "0";
    const relTypes = schema.relevantTypes?.join(", ") || (schema.error ? schema.error.slice(0, 30) : "—");

    console.log(
      pad(tc._idx + 1,  3) +
      pad(tc.group,    10) +
      pad(tc.name,              26) +
      pad(pScore,      12) +
      pad(matchVia,    16) +
      pad(schemaBlocks, 15) +
      relTypes
    );
  }

  console.log(`${"═".repeat(110)}`);

  // Correlation summary by group
  console.log("\nAVERAGE PERPLEXITY BY GROUP:");
  const groups = [...new Set(rows.map((r) => r.tc.group))];
  for (const g of groups) {
    const scored = rows.filter((r) => r.tc.group === g && r.perplexity.score !== null);
    if (!scored.length) { console.log(`  ${g}: n/a`); continue; }
    const avg = Math.round(scored.reduce((s, r) => s + r.perplexity.score, 0) / scored.length);
    const schemaHit = rows.filter((r) => r.tc.group === g && r.schema.found).length;
    const total = rows.filter((r) => r.tc.group === g).length;
    console.log(`  ${pad(g, 10)} avg Perplexity: ${pad(avg + "/100", 8)}  schema present: ${schemaHit}/${total}`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log("═".repeat(60));
  console.log("AEO Signal Tester — 20 business benchmark");
  console.log(`Perplexity key: ${process.env.PERPLEXITY_API_KEY ? "✅ set" : "❌ missing"}`);
  console.log("Pass --raw to dump raw schema JSON per business");
  console.log("═".repeat(60));

  const rows = [];
  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = { ...TEST_CASES[i], _idx: i };
    const result = await runTest(tc, i);
    rows.push(result);
  }

  printTable(rows);
  console.log("\nDone.");
})();
