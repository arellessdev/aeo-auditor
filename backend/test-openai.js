/**
 * OpenAI web search diagnostic — node test-openai.js
 * Tests 5 businesses, shows web-search status, per-prompt match reason,
 * and a clean summary table at the end.
 */

require("dotenv").config();

// ─── Helpers (mirror server.js) ───────────────────────────────────────────────

function normalizeStr(str) {
  return str.toLowerCase().replace(/['\-\.]/g, "").replace(/\s+/g, " ").trim();
}

function extractDomain(url) {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch { return null; }
}

function isNationalBusiness(location) {
  if (!location) return true;
  const loc = location.toLowerCase().trim();
  return loc === "national" || loc === "online" || loc === "";
}

// Returns all conditions that matched (empty array = no match)
function matchReasons(name, url, text, citationDomains) {
  const reasons = [];
  const normText = normalizeStr(text);
  const normName = normalizeStr(name);

  if (normText.includes(normName)) reasons.push("name");

  const domain = extractDomain(url);
  if (domain && text.toLowerCase().includes(domain)) reasons.push("text-domain");
  if (domain && citationDomains.some((d) => d === domain)) reasons.push("citation");

  const words = normName.split(" ").filter(Boolean);
  if (words.length >= 3) {
    for (let i = 0; i < words.length - 1; i++) {
      if (normText.includes(`${words[i]} ${words[i + 1]}`)) {
        reasons.push("partial");
        break;
      }
    }
  }

  return reasons;
}

// ─── Extract citation domains from response body ──────────────────────────────

function extractCitationDomains(body) {
  return (body.output || [])
    .filter((o) => o.type === "message")
    .flatMap((o) => o.content || [])
    .filter((c) => c.type === "output_text")
    .flatMap((c) => c.annotations || [])
    .filter((a) => a.type === "url_citation")
    .map((a) => {
      try { return new URL(a.url).hostname.replace(/^www\./, ""); }
      catch { return null; }
    })
    .filter(Boolean);
}

function extractText(body) {
  return (body.output || [])
    .filter((o) => o.type === "message")
    .flatMap((o) => o.content || [])
    .filter((c) => c.type === "output_text")
    .map((c) => c.text)
    .join("");
}

function webSearchFired(body) {
  return (body.output || []).some((o) => o.type === "web_search_call");
}

// ─── Core fetch call ──────────────────────────────────────────────────────────

async function openAIWebSearch(prompt) {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      tools: [{ type: "web_search_preview" }],
      input: prompt,
    }),
    signal: AbortSignal.timeout(120_000),
  });
  const body = await res.json().catch(async () => ({ _raw: await res.text().catch(() => "") }));
  return { status: res.status, body };
}

// ─── Per-business test ────────────────────────────────────────────────────────

async function testBusiness(tc) {
  const { name, url, category, location } = tc;
  const national = isNationalBusiness(location);
  const cat = category || "business";
  const loc = location || "any area";

  const prompts = national
    ? [
        `${name} ${cat} reviews 2024`,
        `is ${name} a good ${cat} brand`,
        `${name} ${cat} official website`,
      ]
    : [
        `best ${cat} in ${loc}`,
        `recommend a ${cat} near ${loc}`,
        `${cat} ${loc}`,
      ];

  console.log(`\n${"═".repeat(70)}`);
  console.log(`📍 ${name}  [${category} / ${location}]  — ${national ? "NATIONAL" : "LOCAL"}`);
  console.log(`${"═".repeat(70)}`);

  let totalMatched = 0;
  const promptSummary = [];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`\n  Prompt ${i + 1}: "${prompt}"`);
    process.stdout.write("  Calling… ");

    const t0 = Date.now();
    const { status, body } = await openAIWebSearch(prompt);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1) + "s";

    if (status !== 200) {
      console.log(`❌ HTTP ${status} in ${elapsed}`);
      console.log("  " + JSON.stringify(body?.error || body).slice(0, 200));
      promptSummary.push({ prompt, matched: false, reasons: [], searched: false });
      continue;
    }

    const searched   = webSearchFired(body);
    const text       = extractText(body);
    const citations  = extractCitationDomains(body);
    const reasons    = matchReasons(name, url, text, citations);
    const matched    = reasons.length > 0;
    if (matched) totalMatched++;

    console.log(`✅ ${status} in ${elapsed}`);
    console.log(`  Web search fired : ${searched ? "✅ YES" : "❌ NO (training-data answer)"}`);
    console.log(`  Business matched : ${matched ? `✅ YES via [${reasons.join(", ")}]` : "❌ NO"}`);
    console.log(`  Citation domains : ${citations.slice(0, 5).join(", ") || "none"}`);
    console.log(`  Snippet          : ${text.slice(0, 220).replace(/\n/g, " ")}…`);

    promptSummary.push({ prompt, matched, reasons, searched });
  }

  const score = Math.round((totalMatched / prompts.length) * 100);
  console.log(`\n  ── Score: ${totalMatched}/${prompts.length} matched → ${score}/100 ──`);
  return { name, location, national, score, prompts: promptSummary };
}

// ─── Test cases ───────────────────────────────────────────────────────────────

const TEST_CASES = [
  { name: "AMC Automotive",      url: "amcautomotive.com",      category: "auto repair",      location: "Phoenix AZ"  },
  { name: "Birkenstock",         url: "birkenstock.com",         category: "footwear",         location: "national"    },
  { name: "Dakota's Restaurant", url: "dakotasrestaurantok.com", category: "restaurant",       location: "Blanchard OK"},
  { name: "Patagonia",           url: "patagonia.com",           category: "outdoor apparel",  location: "national"    },
  { name: "In-N-Out Burger",     url: "in-n-out.com",            category: "fast food",        location: "California"  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log("OpenAI Web Search Diagnostic — 5 businesses");
  console.log(`API key : ${process.env.OPENAI_API_KEY ? `✅ set (${process.env.OPENAI_API_KEY.slice(0, 8)}…)` : "❌ MISSING"}`);
  if (!process.env.OPENAI_API_KEY) process.exit(1);

  const results = [];
  for (const tc of TEST_CASES) {
    results.push(await testBusiness(tc));
  }

  // ─── Summary table ────────────────────────────────────────────────────────
  const SEP = "─".repeat(90);
  console.log(`\n\n${"═".repeat(90)}`);
  console.log("SUMMARY");
  console.log(`${"═".repeat(90)}`);
  console.log(
    "Business".padEnd(28) +
    "Type".padEnd(10) +
    "Score".padStart(7) + "  " +
    "P1".padStart(4) + "  " +
    "P2".padStart(4) + "  " +
    "P3".padStart(4) + "  " +
    "Match conditions"
  );
  console.log(SEP);

  for (const r of results) {
    const p = r.prompts;
    const conditions = [...new Set(p.flatMap((x) => x.reasons))].join("+") || "—";
    const pScore = (p) => p.matched ? `✅(${p.reasons.join(",")})` : "❌";
    console.log(
      r.name.padEnd(28) +
      (r.national ? "national" : "local").padEnd(10) +
      `${r.score}/100`.padStart(7) + "  " +
      pScore(p[0]).padStart(4) + "  " +
      pScore(p[1]).padStart(4) + "  " +
      pScore(p[2]).padStart(4) + "  " +
      conditions
    );
  }

  console.log(`${"═".repeat(90)}\nDone.`);
})();
