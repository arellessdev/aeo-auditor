/**
 * Batch audit tester — node batch-test.js
 * Hits the live audit API for each business, writes batch-results.csv,
 * and prints a validation table flagging results that contradict expectations.
 *
 * Expected values:  high  → AI Presence score should be ≥ 50
 *                   low   → AI Presence score should be ≤ 33
 *                   unknown → no assertion made
 *
 * NEEDS REVIEW is flagged when:
 *   expected=high  and actual AI Presence < 50
 *   expected=low   and actual AI Presence > 33
 */

const fs   = require("fs");
const path = require("path");

const API_URL  = "https://aeo-auditor-production.up.railway.app/api/audit";
const OUT_CSV  = path.join(__dirname, "batch-results.csv");
const DELAY_MS = 2000;

const CATEGORIES = [
  "Website Content Clarity",
  "Structured Data & Schema",
  "AI Platform Presence",
  "Review & Authority Signals",
  "Content Specificity",
];

// ─── Business list ────────────────────────────────────────────────────────────

const BUSINESSES = [
  // ── KNOWN HIGH — should score high on AI presence ──────────────────────────
  { expected: "high",    name: "AMC Automotive",          url: "amcautomotive.com",               category: "auto repair",        location: "Phoenix AZ"      },
  { expected: "high",    name: "Dakota's Restaurant",      url: "dakotasrestaurantok.com",         category: "restaurant",         location: "Blanchard OK"    },
  { expected: "high",    name: "Lou Malnati's Pizzeria",   url: "loumalnatis.com",                 category: "pizza restaurant",   location: "Chicago IL"      },
  { expected: "high",    name: "Mi Tierra Cafe",           url: "mitierracafe.com",                category: "Mexican restaurant", location: "San Antonio TX"  },
  { expected: "high",    name: "Birkenstock",              url: "birkenstock.com",                 category: "footwear",           location: "national"        },
  { expected: "high",    name: "Reef",                     url: "reef.com",                        category: "footwear",           location: "national"        },
  { expected: "high",    name: "Patagonia",                url: "patagonia.com",                   category: "outdoor apparel",    location: "national"        },
  { expected: "high",    name: "In-N-Out Burger",          url: "in-n-out.com",                    category: "fast food",          location: "California"      },
  { expected: "high",    name: "Scheels",                  url: "scheels.com",                     category: "sporting goods",     location: "national"        },
  { expected: "high",    name: "Bob Usry and Sons",        url: "bobusryandsons.com",              category: "plumber",            location: "Norman OK"       },
  // ── KNOWN LOW — should score low or zero ──────────────────────────────────
  { expected: "low",     name: "Sunrise Wellness Spa",     url: "sunrisewellnessspa-tulsa.com",    category: "spa",                location: "Tulsa OK"        },
  { expected: "low",     name: "Peak Performance Fitness", url: "peakperformancefitness-boise.com",category: "gym",                location: "Boise ID"        },
  { expected: "low",     name: "Complete Landsculpture",   url: "completelandsculpture.com",       category: "lawn care",          location: "Dallas TX"       },
  { expected: "low",     name: "Blue Moon Yoga",           url: "bluemoonyogadenver.com",          category: "yoga studio",        location: "Denver CO"       },
  { expected: "low",     name: "Mountain West Dental",     url: "mountainwestdental.com",          category: "dentist",            location: "Salt Lake City UT"},
  // ── UNKNOWN ────────────────────────────────────────────────────────────────
  { expected: "unknown", name: "Forest Family Dentistry",  url: "forestfamilydentistry.com",       category: "dentist",            location: "Austin TX"       },
  { expected: "unknown", name: "Element Salon",            url: "elementsalonnashville.com",       category: "hair salon",         location: "Nashville TN"    },
  { expected: "unknown", name: "Seattle Athletic Club",    url: "seattleathleticclub.com",         category: "gym",                location: "Seattle WA"      },
  { expected: "unknown", name: "LexiDog Boutique",         url: "lexidog.com",                     category: "pet groomer",        location: "Portland OR"     },
  { expected: "unknown", name: "Crispy's Trading Post",    url: "crispystrading.com",              category: "restaurant",         location: "Blanchard OK"    },
  { expected: "unknown", name: "The Saucy Pig",            url: "thesaucypig.com",                 category: "restaurant",         location: "Blanchard OK"    },
  { expected: "unknown", name: "David's Plumbing",         url: "davidsplumbing.com",              category: "plumber",            location: "Norman OK"       },
  { expected: "unknown", name: "Brandon's Plumbing",       url: "brandonsplumbing.com",            category: "plumber",            location: "Norman OK"       },
  { expected: "unknown", name: "Cattlemen's Steakhouse",   url: "cattlemensrestaurant.com",        category: "steakhouse",         location: "Oklahoma City OK"},
  { expected: "unknown", name: "Raising Cane's",           url: "raisingcanes.com",                category: "fast food",          location: "national"        },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function csvCell(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"` : s;
}
const csvRow = (...cells) => cells.map(csvCell).join(",");

function getCatScore(categories, name) {
  const c = (categories || []).find((x) => x.name === name);
  return c != null ? c.score : "";
}

function pad(str, len, right = false) {
  const s = String(str ?? "");
  return right ? s.padStart(len) : s.padEnd(len);
}

function contradiction(expected, aiPresenceScore) {
  if (aiPresenceScore === null || aiPresenceScore === "") return false;
  const score = Number(aiPresenceScore);
  if (expected === "high"  && score < 50)  return true;
  if (expected === "low"   && score > 33)  return true;
  return false;
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function auditBusiness(biz) {
  const body = JSON.stringify({
    name:     biz.name,
    url:      biz.url.startsWith("http") ? biz.url : `https://${biz.url}`,
    category: biz.category,
    location: biz.location,
  });
  const res = await fetch(API_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body,
    signal:  AbortSignal.timeout(180_000),
  });
  const json = await res.json().catch(() => ({ error: `HTTP ${res.status} (non-JSON)` }));
  if (!res.ok) return { ok: false, status: res.status, error: json.error || `HTTP ${res.status}` };
  return { ok: true, status: res.status, data: json };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log("═".repeat(90));
  console.log(`AEO Batch Tester  —  ${BUSINESSES.length} businesses  (OpenAI web search signals)`);
  console.log(`API : ${API_URL}`);
  console.log(`Out : ${OUT_CSV}`);
  console.log("═".repeat(90));

  const csvLines = [csvRow(
    "Expected", "Name", "URL", "Category", "Location",
    "Overall Score", ...CATEGORIES,
    "Raw AI Score", "Status", "Error"
  )];
  const summary = [];

  for (let i = 0; i < BUSINESSES.length; i++) {
    const biz = BUSINESSES[i];
    const tag = `[${String(i + 1).padStart(2)}/${BUSINESSES.length}]`;
    process.stdout.write(`${tag} ${biz.name.padEnd(32)} `);

    let csvLine, row;
    try {
      const result = await auditBusiness(biz);

      if (result.ok) {
        const d = result.data;
        const catScores  = CATEGORIES.map((c) => getCatScore(d.categories, c));
        const aiPresence = getCatScore(d.categories, "AI Platform Presence");
        const rawAI      = d.signals?.aiSearch?.score ?? "";

        csvLine = csvRow(
          biz.expected, biz.name, biz.url, biz.category, biz.location,
          d.overallScore, ...catScores, rawAI, "ok", ""
        );
        row = { biz, overall: d.overallScore, aiPresence, rawAI, catScores, status: "ok" };
        const flag = contradiction(biz.expected, aiPresence) ? " ⚑ NEEDS REVIEW" : "";
        console.log(`✅ ${d.overallScore}/100  AI=${aiPresence}  rawAI=${rawAI}${flag}`);

      } else {
        const statusTag = result.status === 429 ? "rate_limited" : "error";
        csvLine = csvRow(
          biz.expected, biz.name, biz.url, biz.category, biz.location,
          "", ...CATEGORIES.map(() => ""), "", statusTag, result.error
        );
        row = { biz, overall: null, aiPresence: null, rawAI: null, catScores: [], status: statusTag, error: result.error };
        console.log(`${result.status === 429 ? "⛔ RATE LIMITED" : `❌ ${result.status}`} — ${result.error}`);
      }
    } catch (err) {
      csvLine = csvRow(
        biz.expected, biz.name, biz.url, biz.category, biz.location,
        "", ...CATEGORIES.map(() => ""), "", "timeout", err.message
      );
      row = { biz, overall: null, aiPresence: null, rawAI: null, catScores: [], status: "timeout", error: err.message };
      console.log(`⏱️  TIMEOUT — ${err.message}`);
    }

    csvLines.push(csvLine);
    summary.push(row);
    if (i < BUSINESSES.length - 1) await sleep(DELAY_MS);
  }

  fs.writeFileSync(OUT_CSV, csvLines.join("\n"), "utf8");
  console.log(`\n✅ CSV written → ${OUT_CSV}`);

  // ─── Validation table ────────────────────────────────────────────────────────
  const W = 105;
  console.log(`\n${"═".repeat(W)}`);
  console.log("VALIDATION TABLE");
  console.log(`${"═".repeat(W)}`);
  console.log(
    pad("#",   3)  +
    pad("Expected", 10) +
    pad("Business",              28) +
    pad("Location",              20) +
    pad("AI Presence", 13, true) + "  " +
    pad("Raw AI",  8, true)      + "  " +
    pad("Schema",  8, true)      + "  " +
    pad("Overall", 8, true)      + "  " +
    "Verdict"
  );
  console.log("─".repeat(W));

  let needsReview = 0;
  const scored = [];

  for (let i = 0; i < summary.length; i++) {
    const r = summary[i];
    const { biz } = r;

    if (r.status !== "ok") {
      console.log(
        pad(i + 1, 3) +
        pad(biz.expected.toUpperCase(), 10) +
        pad(biz.name, 28) +
        pad(biz.location, 20) +
        pad(`[${r.status}]`, 53, true) + "  " +
        (r.error?.slice(0, 30) ?? "")
      );
      continue;
    }

    const schemaScore = getCatScore(
      r.catScores.map((s, ci) => ({ name: CATEGORIES[ci], score: s })),
      "Structured Data & Schema"
    );
    const bad    = contradiction(biz.expected, r.aiPresence);
    const verdict = biz.expected === "unknown"
      ? "—"
      : bad ? "⚑ NEEDS REVIEW" : "✓ OK";
    if (bad) needsReview++;

    console.log(
      pad(i + 1, 3) +
      pad(biz.expected.toUpperCase(), 10) +
      pad(biz.name, 28) +
      pad(biz.location, 20) +
      pad(r.aiPresence, 13, true) + "  " +
      pad(r.rawAI ?? "—", 8, true) + "  " +
      pad(r.catScores[1] ?? "—", 8, true) + "  " +  // Structured Data & Schema is index 1
      pad(r.overall, 8, true) + "  " +
      verdict
    );
    scored.push(r);
  }

  console.log("─".repeat(W));

  // Averages by expected group
  for (const group of ["high", "low", "unknown"]) {
    const rows = scored.filter((r) => r.biz.expected === group);
    if (!rows.length) continue;
    const avgAI      = Math.round(rows.reduce((s, r) => s + Number(r.aiPresence || 0), 0) / rows.length);
    const avgOverall = Math.round(rows.reduce((s, r) => s + Number(r.overall || 0), 0) / rows.length);
    console.log(
      pad("", 3) +
      pad(`AVG ${group.toUpperCase()} (${rows.length})`, 10) +
      pad("", 48) +
      pad(avgAI, 13, true) + "  " +
      pad("", 8)  + "  " +
      pad("", 8)  + "  " +
      pad(avgOverall, 8, true)
    );
  }

  console.log(`${"═".repeat(W)}`);
  if (needsReview > 0) {
    console.log(`\n⚑  ${needsReview} result(s) need review — score contradicted the expected tier.`);
  } else {
    console.log("\n✓  All expected scores validated — no contradictions.");
  }

  const rateLimited = summary.filter((r) => r.status === "rate_limited").length;
  if (rateLimited) {
    console.log(`⛔ ${rateLimited} rate-limited — set AUDIT_RATE_LIMIT=50 on Railway and re-run.`);
  }

  console.log("\nDone.");
})();
