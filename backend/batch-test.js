/**
 * Batch audit tester — run with: node batch-test.js
 * Submits each business to the live audit API and writes results to batch-results.csv.
 * Uses a 2-second delay between requests to avoid the rate limiter.
 *
 * NOTE: The live API rate limit defaults to 3/day per IP.
 *       Set AUDIT_RATE_LIMIT=50 on Railway (or run against localhost) for a full batch run.
 */

const fs   = require("fs");
const path = require("path");

const API_URL    = "https://aeo-auditor-production.up.railway.app/api/audit";
const OUT_CSV    = path.join(__dirname, "batch-results.csv");
const DELAY_MS   = 2000;

const CATEGORIES = [
  "Website Content Clarity",
  "Structured Data & Schema",
  "AI Platform Presence",
  "Review & Authority Signals",
  "Content Specificity",
];

// ─── Business list ────────────────────────────────────────────────────────────

const BUSINESSES = [
  { name: "Forest Family Dentistry",  url: "forestfamilydentistry.com",    category: "dentist",           location: "Austin TX"       },
  { name: "The River",                url: "theriverdenveryoga.com",        category: "yoga studio",       location: "Denver CO"       },
  { name: "AMC Automotive",           url: "amcautomotivephoenix.com",      category: "auto repair",       location: "Phoenix AZ"      },
  { name: "Lou Malnati's Pizzeria",   url: "loumalnatis.com",               category: "pizza restaurant",  location: "Chicago IL"      },
  { name: "Complete Landsculpture",   url: "completelandsculpture.com",     category: "lawn care",         location: "Dallas TX"       },
  { name: "Element Salon",            url: "elementsalonnashville.com",     category: "hair salon",        location: "Nashville TN"    },
  { name: "Seattle Athletic Club",    url: "seattleathleticclub.com",       category: "gym",               location: "Seattle WA"      },
  { name: "Mi Tierra Cafe",           url: "mitierracafe.com",              category: "Mexican restaurant", location: "San Antonio TX" },
  { name: "LexiDog Boutique",         url: "lexidog.com",                   category: "pet groomer",       location: "Portland OR"     },
  { name: "Crispy's Trading Post",    url: "crispystrading.com",            category: "restaurant",        location: "Blanchard OK"    },
  { name: "The Saucy Pig",            url: "thesaucypig.com",               category: "restaurant",        location: "Blanchard OK"    },
  { name: "David's Plumbing",         url: "davidsplumbing.com",            category: "plumber",           location: "Norman OK"       },
  { name: "Bob Usry and Sons",        url: "bobusryandsons.com",            category: "plumber",           location: "Norman OK"       },
  { name: "Brandon's Plumbing",       url: "brandonsplumbing.com",          category: "plumber",           location: "Norman OK"       },
  { name: "Birkenstock",              url: "birkenstock.com",               category: "footwear",          location: "national"        },
  { name: "Teva",                     url: "teva.com",                      category: "footwear",          location: "national"        },
  { name: "Reef",                     url: "reef.com",                      category: "footwear",          location: "national"        },
  { name: "Dakota's Restaurant",      url: "dakotasrestaurantok.com",       category: "restaurant",        location: "Blanchard OK"    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function csvCell(val) {
  if (val === null || val === undefined) return "";
  const s = String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function csvRow(...cells) {
  return cells.map(csvCell).join(",");
}

function getCatScore(categories, name) {
  const c = (categories || []).find((x) => x.name === name);
  return c != null ? c.score : "";
}

function pad(str, len, right = false) {
  const s = String(str ?? "");
  return right ? s.padStart(len) : s.padEnd(len);
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
    signal:  AbortSignal.timeout(90_000),   // 90s — Perplexity + Claude can be slow
  });

  const json = await res.json().catch(() => ({ error: `HTTP ${res.status} (non-JSON)` }));

  if (!res.ok) {
    return { ok: false, status: res.status, error: json.error || `HTTP ${res.status}` };
  }
  return { ok: true, status: res.status, data: json };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  console.log("═".repeat(80));
  console.log(`AEO Batch Tester  —  ${BUSINESSES.length} businesses`);
  console.log(`API : ${API_URL}`);
  console.log(`Out : ${OUT_CSV}`);
  console.log(`Rate-limit note: live API defaults to 3/day. Set AUDIT_RATE_LIMIT=50 on Railway.`);
  console.log("═".repeat(80));

  // CSV header
  const header = csvRow(
    "Name", "URL", "Category", "Location",
    "Overall Score",
    ...CATEGORIES,
    "Status", "Error"
  );
  const lines = [header];
  const summary = [];

  for (let i = 0; i < BUSINESSES.length; i++) {
    const biz = BUSINESSES[i];
    process.stdout.write(`[${String(i + 1).padStart(2)}/${BUSINESSES.length}] ${biz.name.padEnd(30)} … `);

    let row, summaryRow;

    try {
      const result = await auditBusiness(biz);

      if (result.ok) {
        const d = result.data;
        const catScores = CATEGORIES.map((c) => getCatScore(d.categories, c));
        row = csvRow(
          biz.name, biz.url, biz.category, biz.location,
          d.overallScore,
          ...catScores,
          "ok", ""
        );
        summaryRow = {
          name:     biz.name,
          location: biz.location,
          overall:  d.overallScore,
          cats:     catScores,
          status:   "ok",
        };
        console.log(`✅ ${d.overallScore}/100`);
      } else {
        row = csvRow(
          biz.name, biz.url, biz.category, biz.location,
          "", ...CATEGORIES.map(() => ""),
          result.status === 429 ? "rate_limited" : "error",
          result.error
        );
        summaryRow = {
          name:     biz.name,
          location: biz.location,
          overall:  null,
          cats:     CATEGORIES.map(() => null),
          status:   result.status === 429 ? "rate_limited" : "error",
          error:    result.error,
        };
        const tag = result.status === 429 ? "⛔ RATE LIMITED" : `❌ ${result.status}`;
        console.log(`${tag} — ${result.error}`);
      }
    } catch (err) {
      row = csvRow(
        biz.name, biz.url, biz.category, biz.location,
        "", ...CATEGORIES.map(() => ""),
        "timeout", err.message
      );
      summaryRow = {
        name:     biz.name,
        location: biz.location,
        overall:  null,
        cats:     CATEGORIES.map(() => null),
        status:   "timeout",
        error:    err.message,
      };
      console.log(`⏱️  TIMEOUT — ${err.message}`);
    }

    lines.push(row);
    summary.push(summaryRow);

    // Delay between requests (skip after the last one)
    if (i < BUSINESSES.length - 1) await sleep(DELAY_MS);
  }

  // Write CSV
  fs.writeFileSync(OUT_CSV, lines.join("\n"), "utf8");
  console.log(`\n✅ CSV written → ${OUT_CSV}`);

  // ─── Console summary table ──────────────────────────────────────────────────
  const SEP = "─".repeat(105);
  console.log(`\n${"═".repeat(105)}`);
  console.log("RESULTS SUMMARY");
  console.log(`${"═".repeat(105)}`);
  console.log(
    pad("#",   3) +
    pad("Business",              30) +
    pad("Location",              18) +
    pad("Overall", 9, true)  + "  " +
    CATEGORIES.map((c) => pad(c.split(" ").pop(), 8, true)).join("  ")
  );
  console.log(SEP);

  for (let i = 0; i < summary.length; i++) {
    const r = summary[i];
    if (r.status !== "ok") {
      console.log(
        pad(i + 1, 3) +
        pad(r.name, 30) +
        pad(r.location, 18) +
        pad(`[${r.status}]`, 9, true) + "  " +
        r.error?.slice(0, 50)
      );
    } else {
      console.log(
        pad(i + 1, 3) +
        pad(r.name, 30) +
        pad(r.location, 18) +
        pad(r.overall, 9, true) + "  " +
        r.cats.map((s) => pad(s ?? "—", 8, true)).join("  ")
      );
    }
  }

  console.log(SEP);

  const scored = summary.filter((r) => r.status === "ok");
  if (scored.length) {
    const avgOverall = Math.round(scored.reduce((s, r) => s + r.overall, 0) / scored.length);
    const avgCats = CATEGORIES.map((_, ci) =>
      Math.round(scored.reduce((s, r) => s + (r.cats[ci] ?? 0), 0) / scored.length)
    );
    console.log(
      pad("", 3) +
      pad(`AVG (${scored.length}/${BUSINESSES.length} scored)`, 48) +
      pad(avgOverall, 9, true) + "  " +
      avgCats.map((s) => pad(s, 8, true)).join("  ")
    );
  }

  const failed    = summary.filter((r) => r.status === "error").length;
  const limited   = summary.filter((r) => r.status === "rate_limited").length;
  const timedOut  = summary.filter((r) => r.status === "timeout").length;
  if (failed || limited || timedOut) {
    console.log(`\n⚠️  ${limited} rate-limited  |  ${failed} errors  |  ${timedOut} timeouts`);
    if (limited > 0) {
      console.log("   → Set AUDIT_RATE_LIMIT=50 on Railway and redeploy to run the full batch.");
    }
  }

  console.log(`${"═".repeat(105)}\nDone.`);
})();
