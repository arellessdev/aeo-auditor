require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { v4: uuidv4 } = require("uuid");
const Anthropic = require("@anthropic-ai/sdk");
const path = require("path");
const fs = require("fs");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);
db.defaults({ audits: [] }).write();

const app = express();
const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", methods: ["GET", "POST"] }));

const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });
const auditLimiter = rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 3, standardHeaders: true, legacyHeaders: false, message: { error: "Free audit limit reached.", message: "You have used your 3 free audits for today." } });
app.use(globalLimiter);

function buildOGImage(businessName, score, location, category) {
  const scoreColor = score >= 70 ? "#00ff88" : score >= 45 ? "#ffd60a" : "#ff4757";
  const label = score >= 75 ? "Strong Visibility" : score >= 50 ? "Moderate Visibility" : score >= 30 ? "Weak Visibility" : "Near-Invisible to AI";
  const subtitle = [category, location].filter(Boolean).join(" · ") || "Business Audit";
  const displayName = businessName.length > 28 ? businessName.slice(0, 26) + "..." : businessName;
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#080c14"/><stop offset="100%" style="stop-color:#0d1a2e"/></linearGradient></defs><rect width="1200" height="630" fill="url(#bg)"/><circle cx="900" cy="315" r="120" fill="#0d1420" stroke="${scoreColor}" stroke-width="3"/><text x="900" y="295" text-anchor="middle" fill="${scoreColor}" font-family="system-ui" font-size="88" font-weight="700">${score}</text><text x="900" y="340" text-anchor="middle" fill="#4a5a7a" font-family="system-ui" font-size="18">/100</text><text x="900" y="385" text-anchor="middle" fill="${scoreColor}" font-family="system-ui" font-size="16" font-weight="600">${label}</text><rect x="60" y="52" width="12" height="12" rx="6" fill="#00e5ff"/><text x="84" y="63" fill="#00e5ff" font-family="system-ui" font-size="13" letter-spacing="4" font-weight="700">AEO AUDITOR</text><text x="60" y="200" fill="#e0e8ff" font-family="system-ui" font-size="52" font-weight="700">${displayName}</text><text x="60" y="250" fill="#7a8aa8" font-family="system-ui" font-size="18">${subtitle}</text><text x="60" y="340" fill="#4a5a7a" font-family="system-ui" font-size="13" letter-spacing="3">AGENT VISIBILITY SCORE</text><text x="60" y="570" fill="#4a5a7a" font-family="system-ui" font-size="14">See full report at aeoauditor.com</text></svg>`;
}

function buildOGHtml(audit, appHtml) {
  const title = `${audit.business_name} — AEO Score: ${audit.score}/100`;
  const description = `${audit.business_name} scored ${audit.score}/100 on Agent Visibility.`;
  const imageUrl = `${BASE_URL}/api/og-image/${audit.id}`;
  const pageUrl = `${BASE_URL}/results/${audit.id}`;
  const ogTags = `<title>${title}</title><meta name="description" content="${description}"><meta property="og:type" content="website"><meta property="og:url" content="${pageUrl}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="${imageUrl}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${description}"><meta name="twitter:image" content="${imageUrl}">`;
  return appHtml.replace("</head>", `${ogTags}</head>`);
}

const PUBLIC_DIR = path.join(__dirname, "public");
const INDEX_HTML = path.join(PUBLIC_DIR, "index.html");
if (fs.existsSync(PUBLIC_DIR)) app.use(express.static(PUBLIC_DIR));

app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

app.get("/api/og-image/:id", (req, res) => {
  const audit = db.get("audits").find({ id: req.params.id }).value();
  if (!audit) return res.status(404).send("Not found");
  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=86400");
  res.send(buildOGImage(audit.business_name, audit.score, audit.location, audit.category));
});

app.post("/api/audit", auditLimiter, async (req, res) => {
  const { name, url, category, location } = req.body;
  if (!name || !url) return res.status(400).json({ error: "Business name and URL are required." });
  try { new URL(url.startsWith("http") ? url : `https://${url}`); }
  catch { return res.status(400).json({ error: "Invalid URL." }); }
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: `You are an AEO expert. Analyze this business for AI agent visibility.\nBusiness: ${name}\nURL: ${url}\nCategory: ${category || "General"}\nLocation: ${location || "Not specified"}\n\nRespond ONLY with valid JSON no markdown:\n{"overallScore":<0-100>,"categories":[{"name":"Website Content Clarity","score":<0-100>},{"name":"Structured Data & Schema","score":<0-100>},{"name":"AI Platform Presence","score":<0-100>},{"name":"Review & Authority Signals","score":<0-100>},{"name":"Content Specificity","score":<0-100>}],"insights":[{"icon":"⚠️","text":"<observation>"},{"icon":"⚠️","text":"<gap>"},{"icon":"💡","text":"<opportunity>"}],"fixes":[{"priority":"critical","title":"<fix>","body":"<2 sentences>"},{"priority":"critical","title":"<fix>","body":"<explanation>"},{"priority":"high","title":"<fix>","body":"<explanation>"},{"priority":"high","title":"<fix>","body":"<explanation>"},{"priority":"medium","title":"<fix>","body":"<explanation>"}]}` }],
    });
    const raw = message.content.map(b => b.text || "").join("");
    const results = JSON.parse(raw.replace(/```json|```/g, "").trim());
    const auditId = uuidv4();
    const audit = { id: auditId, business_name: name, business_url: url, category: category || null, location: location || null, score: results.overallScore, results: JSON.stringify(results), ip_address: req.ip, created_at: new Date().toISOString() };
    db.get("audits").push(audit).write();
    return res.json({ auditId, shareUrl: `/results/${auditId}`, ...results });
  } catch (err) {
    console.error("Audit error:", err.message);
    if (err.status === 401) return res.status(500).json({ error: "Invalid API key." });
    if (err.status === 429) return res.status(429).json({ error: "AI rate limit hit. Try again shortly." });
    return res.status(500).json({ error: "Audit failed. Please try again." });
  }
});

app.get("/api/audit/:id", (req, res) => {
  const audit = db.get("audits").find({ id: req.params.id }).value();
  if (!audit) return res.status(404).json({ error: "Audit not found." });
  return res.json({ auditId: audit.id, businessName: audit.business_name, businessUrl: audit.business_url, category: audit.category, location: audit.location, createdAt: audit.created_at, shareUrl: `/results/${audit.id}`, ...JSON.parse(audit.results) });
});

app.get("/api/audits/recent", (req, res) => {
  if (req.headers["x-admin-key"] !== process.env.ADMIN_KEY) return res.status(401).json({ error: "Unauthorized." });
  const audits = db.get("audits").orderBy("created_at", "desc").take(50).value();
  return res.json({ audits });
});

app.get("/results/:id", (req, res) => {
  if (!fs.existsSync(INDEX_HTML)) return res.status(404).send("Frontend not built yet.");
  const audit = db.get("audits").find({ id: req.params.id }).value();
  const html = fs.readFileSync(INDEX_HTML, "utf8");
  if (!audit) return res.send(html);
  return res.send(buildOGHtml(audit, html));
});

app.get("*", (req, res) => {
  if (fs.existsSync(INDEX_HTML)) return res.sendFile(INDEX_HTML);
  res.send("Backend running. Frontend not built yet.");
});

app.listen(PORT, () => console.log(`\n AEO Auditor running on port ${PORT}\n`));