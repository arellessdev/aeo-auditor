/**
 * Manual signal tester — run with: node test-signals.js
 * Tests the two real AEO measurement functions against known businesses.
 * Requires PERPLEXITY_API_KEY in .env (or set in environment).
 */

require("dotenv").config();

// ─── Copy of the signal functions (identical to server.js) ──────────────────

// ─── Name matching helpers ───────────────────────────────────────────────────
function normalizeStr(str) {
  return str.toLowerCase().replace(/['\-\.]/g, "").replace(/\s+/g, " ").trim();
}

function extractDomain(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch { return null; }
}

// Returns the condition that matched, or null.
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
    console.warn("  ⚠️  PERPLEXITY_API_KEY not set — skipping Perplexity check");
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
    const text =
      r.status === "fulfilled"
        ? (r.value?.choices?.[0]?.message?.content || "")
        : "";
    const reason = businessMatchReason(name, url, text);
    return { prompt, matched: reason !== null, matchedBy: reason, snippet: text.slice(0, 200) };
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
    if (!res.ok) return { found: false, types: [], error: `HTTP ${res.status}` };

    const html = await res.text();
    const jsonLdRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const schemas = [];
    let m;
    while ((m = jsonLdRe.exec(html)) !== null) {
      try {
        const parsed = JSON.parse(m[1].trim());
        const items = Array.isArray(parsed) ? parsed : [parsed];
        schemas.push(...items);
      } catch { /* malformed block */ }
    }

    const types = [
      ...new Set(schemas.flatMap((s) => (Array.isArray(s["@type"]) ? s["@type"] : [s["@type"]]).filter(Boolean))),
    ];
    const relevantTypes = types.filter((t) =>
      RELEVANT_SCHEMA_TYPES.some((rt) => t.includes(rt))
    );

    return {
      found: schemas.length > 0,
      types,
      relevantTypes,
      schemasFound: schemas.length,
      hasLocalBusiness: relevantTypes.length > 0,
      rawSchemas: schemas,
    };
  } catch (err) {
    return { found: false, types: [], error: err.message };
  }
}

// ─── Test cases ─────────────────────────────────────────────────────────────

const TEST_CASES = [
  {
    label: "Reef (known AI presence)",
    name: "Reef",
    url: "https://reef.com",
    category: "footwear",
    location: "beach",
  },
  {
    label: "Dakota's Restaurant (small local business)",
    name: "Dakota's Restaurant",
    url: "https://dakotasrestaurantok.com",
    category: "restaurant",
    location: "Blanchard OK",
  },
  {
    label: "Bob's Plumbing (no web presence baseline)",
    name: "Bob's Plumbing",
    url: "https://bobsplumbingnormanok.com",
    category: "plumber",
    location: "Norman OK",
  },
];

// ─── Runner ──────────────────────────────────────────────────────────────────

async function runTest({ label, name, url, category, location }) {
  console.log(`\n${"─".repeat(60)}`);
  console.log(`📍 ${label}`);
  console.log(`   Business : ${name}`);
  console.log(`   URL      : ${url}`);
  console.log(`   Category : ${category}  |  Location: ${location}`);
  console.log(`${"─".repeat(60)}`);

  // Perplexity
  console.log("\n🔍 Perplexity Presence Check...");
  const perplexity = await checkPerplexityPresence(name, url, category, location)
    .catch((err) => ({ score: null, error: err.message, prompts: [] }));

  if (perplexity.score !== null) {
    console.log(`   Score: ${perplexity.score}/100 (${perplexity.promptsMatched}/${perplexity.promptsTested} prompts matched)`);
    for (const p of perplexity.prompts) {
      const icon = p.matched ? "✅" : "❌";
      const via = p.matchedBy ? ` [via ${p.matchedBy}]` : "";
      console.log(`   ${icon}${via} "${p.prompt}"`);
      if (p.snippet) console.log(`      ↳ ${p.snippet.replace(/\n/g, " ")}...`);
    }
  } else {
    console.log(`   ⚠️  ${perplexity.error}`);
  }

  // Schema
  console.log("\n🏗️  Schema Markup Check...");
  const schema = await checkSchemaMarkup(url)
    .catch((err) => ({ found: false, types: [], error: err.message }));

  if (schema.error && !schema.found) {
    console.log(`   ⚠️  Error: ${schema.error}`);
  } else if (!schema.found) {
    console.log("   ❌ No JSON-LD schema found");
  } else {
    console.log(`   ✅ Found ${schema.schemasFound} schema block(s)`);
    console.log(`   Types         : ${schema.types.join(", ") || "none"}`);
    console.log(`   Relevant types: ${schema.relevantTypes.join(", ") || "none"}`);
    console.log(`   hasLocalBusiness: ${schema.hasLocalBusiness}`);
    if (process.argv.includes("--raw")) {
      console.log("   Raw schemas:");
      console.log(JSON.stringify(schema.rawSchemas, null, 2));
    }
  }
}

(async () => {
  console.log("AEO Signal Tester");
  console.log(`Perplexity key: ${process.env.PERPLEXITY_API_KEY ? "✅ set" : "❌ missing"}`);
  console.log("Pass --raw to dump raw schema JSON\n");

  for (const tc of TEST_CASES) {
    await runTest(tc);
  }

  console.log(`\n${"─".repeat(60)}`);
  console.log("Done.");
})();
