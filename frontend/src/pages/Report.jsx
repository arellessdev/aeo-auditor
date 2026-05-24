import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { C, Header, ScoreGauge, CategoryBars } from "../components";

const API = import.meta.env.VITE_API_URL || "";

// ─── Helper: PriorityBadge ────────────────────────────────────────────────────
function PriorityBadge({ p }) {
  const colors = {
    critical: { bg: "rgba(255,71,87,0.15)", color: C.red, border: "rgba(255,71,87,0.3)" },
    high: { bg: "rgba(255,214,10,0.15)", color: C.yellow, border: "rgba(255,214,10,0.3)" },
    medium: { bg: "rgba(0,229,255,0.1)", color: C.accent, border: "rgba(0,229,255,0.2)" },
  };
  const s = colors[p] || colors.medium;
  return (
    <span style={{
      fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase",
      padding: "3px 8px", borderRadius: "4px", fontWeight: "700",
      flexShrink: 0, marginTop: "2px",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontFamily: "'DM Mono', monospace",
    }}>
      {p}
    </span>
  );
}

// ─── Helper: SectionBanner ────────────────────────────────────────────────────
function SectionBanner({ tier, color }) {
  return (
    <div style={{
      background: tier === "Pro" ? "rgba(255,214,10,0.06)" : "rgba(0,229,255,0.06)",
      border: tier === "Pro" ? "1px solid rgba(255,214,10,0.2)" : "1px solid rgba(0,229,255,0.2)",
      borderRadius: "8px",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",
      marginBottom: "16px",
    }}>
      <span style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", fontWeight: "700", color, fontFamily: "'DM Mono', monospace" }}>
        ★ {tier.toUpperCase()} PREVIEW
      </span>
      <span style={{ fontSize: "13px", color: C.textDim, fontFamily: "'DM Sans', sans-serif" }}>
        Upgrade to unlock on your account
      </span>
    </div>
  );
}

// ─── Helper: QueryCard ────────────────────────────────────────────────────────
function QueryCard({ platform, query, matched, snippet, error, snippetMaxLen = 400 }) {
  if (!query && matched === undefined) {
    return (
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px",
        padding: "20px 24px", marginBottom: "12px",
      }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.textDim, marginBottom: "10px" }}>
          {platform}
        </div>
        <div style={{ fontSize: "13px", color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
          Data not available for this audit
        </div>
      </div>
    );
  }

  const trimmedSnippet = snippet ? snippet.slice(0, snippetMaxLen) + (snippet.length > snippetMaxLen ? "…" : "") : null;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px",
      padding: "20px 24px", marginBottom: "12px",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", gap: "12px" }}>
        <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.textDim }}>
          {platform}
        </div>
        <span style={{
          fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: "700",
          padding: "3px 10px", borderRadius: "20px", fontFamily: "'DM Mono', monospace",
          background: matched ? "rgba(0,255,136,0.12)" : "rgba(255,71,87,0.12)",
          color: matched ? C.green : C.red,
          border: `1px solid ${matched ? "rgba(0,255,136,0.25)" : "rgba(255,71,87,0.25)"}`,
          flexShrink: 0,
        }}>
          {matched ? "✓ FOUND" : "✗ NOT FOUND"}
        </span>
      </div>

      {query && (
        <div style={{
          background: C.bg, borderRadius: "6px", padding: "10px 14px",
          marginBottom: trimmedSnippet || error ? "12px" : "0",
          fontSize: "13px", color: C.accent, fontFamily: "'DM Mono', monospace",
          wordBreak: "break-word",
        }}>
          {query}
        </div>
      )}

      {trimmedSnippet && (
        <p style={{
          fontSize: "13px", color: C.textDim, lineHeight: "1.65",
          fontFamily: "'DM Sans', sans-serif", margin: "0",
          marginBottom: error ? "8px" : "0",
        }}>
          {trimmedSnippet}
        </p>
      )}

      {error && (
        <div style={{ fontSize: "12px", color: C.red, fontFamily: "'DM Sans', sans-serif", marginTop: "4px" }}>
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px",
      padding: "28px", marginBottom: "20px", ...style,
    }}>
      {title && (
        <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.accent, marginBottom: "20px" }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHeading({ children }) {
  return (
    <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.textDim, marginBottom: "12px", marginTop: "24px" }}>
      {children}
    </div>
  );
}

// ─── Feedback widget options ───────────────────────────────────────────────────
const FEEDBACK_OPTS = [
  { id: "monitoring", label: "Monthly re-scoring", desc: "Track score changes over time" },
  { id: "competitors", label: "Competitor tracking", desc: "See who ranks instead of you" },
  { id: "alerts", label: "Email alerts", desc: "Get notified when score drops" },
  { id: "pdf", label: "PDF reports", desc: "Shareable reports for clients" },
  { id: "api", label: "API access", desc: "Integrate into your tools" },
];

// ─── Main Report page ─────────────────────────────────────────────────────────
export default function Report() {
  const { id } = useParams();
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [votes, setVotes] = useState({});

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/audit/${id}`)
      .then((res) => res.json().then((d) => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || "Audit not found");
        setData(d);
        setState("ready");
      })
      .catch((err) => {
        setError(err.message);
        setState("error");
      });
  }, [id]);

  const handleVote = (optId) => {
    if (votes[optId]) return;
    fetch(`${API}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId: id, type: optId }),
    }).catch(() => {});
    setVotes((prev) => ({ ...prev, [optId]: true }));
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Mono', monospace" }}>
      <Header />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 40px 100px" }}>

        {/* ── LOADING ── */}
        {state === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "20px" }}>
            <div style={{ width: "40px", height: "40px", border: `2px solid ${C.border}`, borderTop: `2px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: "16px", color: C.textDim, fontFamily: "'DM Sans', sans-serif" }}>Loading report…</div>
          </div>
        )}

        {/* ── ERROR ── */}
        {state === "error" && (
          <div>
            <Link to={`/results/${id}`} style={{ display: "inline-block", background: "transparent", border: `1px solid ${C.border}`, color: C.textDim, borderRadius: "8px", padding: "10px 20px", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Mono', monospace", marginBottom: "32px", textDecoration: "none" }}>
              ← Results
            </Link>
            <div style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", borderRadius: "8px", padding: "16px", color: C.red, fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </div>
          </div>
        )}

        {/* ── READY ── */}
        {state === "ready" && data && (() => {
          const { businessName, location, overallScore, categories, insights, fixes, signals } = data;
          const aiSearch = signals?.aiSearch || {};
          const perplexity = signals?.perplexity;
          const claude = signals?.claude;
          const schema = signals?.schema || {};
          const firstPrompt = aiSearch.prompts?.[0];

          // Agency: find first non-matching across all platforms
          const allResponses = [
            ...(aiSearch.prompts || []).map((p) => ({ snippet: p.snippet, matched: p.matched })),
            perplexity ? { snippet: perplexity.snippet, matched: perplexity.matched } : null,
            claude ? { snippet: claude.snippet, matched: claude.matched } : null,
          ].filter(Boolean);
          const firstNonMatch = allResponses.find((r) => r.matched === false);

          return (
            <div style={{ animation: "fadeIn 0.4s ease" }}>

              {/* ── Back link + business badge ── */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
                <Link to={`/results/${id}`} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textDim, borderRadius: "8px", padding: "10px 20px", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>
                  ← Results
                </Link>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: C.accentDim, border: "1px solid rgba(0,229,255,0.2)", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", color: C.accent }}>
                  <span style={{ opacity: 0.6 }}>audited</span>
                  {businessName}
                  {location && <><span style={{ opacity: 0.4 }}>·</span>{location}</>}
                </div>
              </div>

              {/* ═══════════════════════════════════════
                  FREE SECTION
              ═══════════════════════════════════════ */}

              {/* Score + Category bars */}
              <Card title="AI SEARCH VISIBILITY SCORE">
                <div style={{ display: "flex", gap: "24px", alignItems: "stretch", flexWrap: "wrap" }}>
                  <ScoreGauge score={overallScore} />
                  <CategoryBars categories={categories} />
                </div>
              </Card>

              {/* Key Findings */}
              <Card title="KEY FINDINGS">
                {insights.map((ins, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: i < insights.length - 1 ? "14px" : "0" }}>
                    <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>{ins.icon}</span>
                    <span style={{ fontSize: "14px", color: C.textDim, lineHeight: "1.6", fontFamily: "'DM Sans', sans-serif" }}>{ins.text}</span>
                  </div>
                ))}
              </Card>

              {/* Recommended Fixes — all 5 */}
              <Card title="RECOMMENDED FIXES">
                {fixes.map((fix, i) => (
                  <div key={i} style={{ borderBottom: i === fixes.length - 1 ? "none" : `1px solid ${C.border}`, padding: "16px 0", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <PriorityBadge p={fix.priority} />
                    <div>
                      <div style={{ fontSize: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: "600", color: C.text, marginBottom: "4px" }}>{fix.title}</div>
                      <div style={{ fontSize: "13px", color: C.textDim, lineHeight: "1.6", fontFamily: "'DM Sans', sans-serif" }}>{fix.body}</div>
                    </div>
                  </div>
                ))}
              </Card>

              {/* ═══════════════════════════════════════
                  PRO SECTION
              ═══════════════════════════════════════ */}
              <div style={{ marginTop: "40px" }}>
                <SectionBanner tier="Pro" color={C.yellow} />

                <div style={{ fontSize: "16px", fontWeight: "700", color: C.text, fontFamily: "'DM Sans', sans-serif", marginBottom: "20px", letterSpacing: "0.5px" }}>
                  Platform Responses
                </div>

                {/* ChatGPT — first prompt */}
                <QueryCard
                  platform="ChatGPT"
                  query={firstPrompt?.prompt}
                  matched={firstPrompt?.matched}
                  snippet={firstPrompt?.snippet}
                  snippetMaxLen={400}
                />

                {/* Perplexity */}
                <QueryCard
                  platform="Perplexity"
                  query={perplexity?.query}
                  matched={perplexity?.matched}
                  snippet={perplexity?.snippet}
                  error={perplexity?.error}
                  snippetMaxLen={400}
                />

                {/* Claude */}
                <QueryCard
                  platform="Claude"
                  query={claude?.query}
                  matched={claude?.matched}
                  snippet={claude?.snippet}
                  error={claude?.error}
                  snippetMaxLen={400}
                />

                {/* Schema Markup */}
                <Card title="SCHEMA MARKUP" style={{ marginTop: "24px" }}>
                  {schema.found ? (
                    <>
                      <div style={{ fontSize: "14px", color: C.green, fontFamily: "'DM Sans', sans-serif", marginBottom: "12px" }}>
                        Found {schema.schemasFound} JSON-LD block{schema.schemasFound !== 1 ? "s" : ""}
                      </div>
                      {schema.relevantTypes && schema.relevantTypes.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                          {schema.relevantTypes.map((t, i) => (
                            <span key={i} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "20px", background: C.accentDim, border: "1px solid rgba(0,229,255,0.2)", color: C.accent, fontFamily: "'DM Mono', monospace", letterSpacing: "1px" }}>
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                      {schema.rawSchemas && schema.rawSchemas.length > 0 && (
                        <pre style={{
                          background: C.bg, padding: "16px", borderRadius: "8px",
                          fontSize: "12px", color: "#a8d8a8", overflow: "auto",
                          maxHeight: "320px", margin: "0", fontFamily: "'DM Mono', monospace",
                          border: `1px solid ${C.border}`,
                        }}>
                          {JSON.stringify(schema.rawSchemas[0], null, 2)}
                        </pre>
                      )}
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: "14px", color: C.red, fontFamily: "'DM Sans', sans-serif", marginBottom: "8px" }}>
                        No schema markup detected
                      </div>
                      <div style={{ fontSize: "13px", color: C.textDim, fontFamily: "'DM Sans', sans-serif" }}>
                        Add LocalBusiness JSON-LD schema to your homepage to improve AI search visibility.
                      </div>
                    </>
                  )}
                </Card>

                {/* Feedback Widget */}
                <Card title="WHICH FEATURES WOULD YOU USE?">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
                    {FEEDBACK_OPTS.map((opt) => {
                      const voted = !!votes[opt.id];
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleVote(opt.id)}
                          style={{
                            background: voted ? "rgba(0,255,136,0.07)" : "transparent",
                            border: `1px solid ${voted ? C.green : C.border}`,
                            borderRadius: "10px",
                            padding: "14px 16px",
                            cursor: voted ? "default" : "pointer",
                            textAlign: "left",
                            transition: "all 0.2s ease",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          <div style={{ fontSize: "12px", fontWeight: "700", color: voted ? C.green : C.text, marginBottom: "4px", letterSpacing: "0.5px" }}>
                            {voted ? "✓ Voted" : `+ ${opt.label}`}
                          </div>
                          <div style={{ fontSize: "11px", color: C.textDim, fontFamily: "'DM Sans', sans-serif", lineHeight: "1.4" }}>
                            {opt.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </Card>
              </div>

              {/* ═══════════════════════════════════════
                  AGENCY SECTION
              ═══════════════════════════════════════ */}
              <div style={{ marginTop: "40px" }}>
                <SectionBanner tier="Agency" color={C.accent} />

                <div style={{ fontSize: "16px", fontWeight: "700", color: C.text, fontFamily: "'DM Sans', sans-serif", marginBottom: "20px", letterSpacing: "0.5px" }}>
                  All Platform Responses
                </div>

                {/* ChatGPT — all prompts */}
                <SectionHeading>ChatGPT — All Queries</SectionHeading>
                {aiSearch.prompts && aiSearch.prompts.length > 0 ? (
                  aiSearch.prompts.map((p, i) => (
                    <QueryCard
                      key={i}
                      platform={`ChatGPT — Query ${i + 1}`}
                      query={p.prompt}
                      matched={p.matched}
                      snippet={p.snippet}
                      snippetMaxLen={600}
                    />
                  ))
                ) : (
                  <QueryCard platform="ChatGPT" />
                )}

                {/* Perplexity */}
                <SectionHeading>Perplexity</SectionHeading>
                <QueryCard
                  platform="Perplexity"
                  query={perplexity?.query}
                  matched={perplexity?.matched}
                  snippet={perplexity?.snippet}
                  error={perplexity?.error}
                  snippetMaxLen={600}
                />

                {/* Claude */}
                <SectionHeading>Claude</SectionHeading>
                <QueryCard
                  platform="Claude"
                  query={claude?.query}
                  matched={claude?.matched}
                  snippet={claude?.snippet}
                  error={claude?.error}
                  snippetMaxLen={600}
                />

                {/* What appeared instead */}
                <SectionHeading>WHAT APPEARED INSTEAD</SectionHeading>
                <Card title="Responses where your business wasn't mentioned">
                  {firstNonMatch ? (
                    firstNonMatch.snippet ? (
                      <p style={{ fontSize: "14px", color: C.textDim, lineHeight: "1.65", fontFamily: "'DM Sans', sans-serif", margin: "0" }}>
                        {firstNonMatch.snippet.slice(0, 600)}{firstNonMatch.snippet.length > 600 ? "…" : ""}
                      </p>
                    ) : (
                      <p style={{ fontSize: "14px", color: C.muted, fontFamily: "'DM Sans', sans-serif", margin: "0" }}>
                        No snippet available for this response.
                      </p>
                    )
                  ) : (
                    <p style={{ fontSize: "14px", color: C.green, fontFamily: "'DM Sans', sans-serif", margin: "0" }}>
                      Your business appeared in all tested queries — great visibility!
                    </p>
                  )}
                </Card>

                {/* PDF Export placeholder */}
                <SectionHeading>PDF EXPORT</SectionHeading>
                <div>
                  <button
                    disabled
                    style={{
                      background: C.muted, color: C.bg,
                      border: "none", borderRadius: "8px",
                      padding: "14px 28px", fontSize: "13px",
                      fontWeight: "700", letterSpacing: "1.5px",
                      textTransform: "uppercase", cursor: "not-allowed",
                      fontFamily: "'DM Mono', monospace",
                    }}
                  >
                    Export PDF (Coming Soon)
                  </button>
                </div>
              </div>

            </div>
          );
        })()}

      </div>
    </div>
  );
}
