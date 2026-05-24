import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { C, Header, ScoreGauge, CategoryBars } from "../components";

const API = import.meta.env.VITE_API_URL || "";

// ─── PriorityBadge ────────────────────────────────────────────────────────────
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

// ─── Card wrapper ─────────────────────────────────────────────────────────────
function Card({ title, children, style = {} }) {
  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px",
      padding: "28px", marginBottom: "20px", ...style,
    }}>
      {title && (
        <div style={{
          fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
          color: C.accent, marginBottom: "20px", fontFamily: "'DM Mono', monospace",
        }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── TierBanner ───────────────────────────────────────────────────────────────
function TierBanner({ label, message, linkLabel = "Upgrade →", href = "/pricing", accentColor, bgColor, borderColor }) {
  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: "8px",
      padding: "14px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      marginBottom: "20px",
      flexWrap: "wrap",
    }}>
      <span style={{
        fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
        fontWeight: "700", color: accentColor, fontFamily: "'DM Mono', monospace",
        flexShrink: 0,
      }}>
        {label}
      </span>
      <span style={{
        fontSize: "13px", color: C.textDim, fontFamily: "'DM Sans', sans-serif", flex: 1,
      }}>
        {message}
      </span>
      <Link to={href} style={{
        border: `1px solid ${accentColor}`, color: accentColor, borderRadius: "6px",
        padding: "6px 14px", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase",
        cursor: "pointer", fontFamily: "'DM Mono', monospace", textDecoration: "none",
        flexShrink: 0, whiteSpace: "nowrap",
      }}>
        {linkLabel}
      </Link>
    </div>
  );
}

// ─── QueryCard ────────────────────────────────────────────────────────────────
function QueryCard({ platform, query, matched, snippet, error, snippetMaxLen = 400 }) {
  if (!query && matched === undefined) {
    return (
      <div style={{
        background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px",
        padding: "20px 24px", marginBottom: "12px",
      }}>
        <div style={{
          fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          color: C.textDim, fontFamily: "'DM Mono', monospace", marginBottom: "10px",
        }}>
          {platform}
        </div>
        <div style={{ fontSize: "13px", color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
          Data not available — run a new audit to collect this signal
        </div>
      </div>
    );
  }

  const trimmedSnippet = snippet
    ? snippet.slice(0, snippetMaxLen) + (snippet.length > snippetMaxLen ? "…" : "")
    : null;

  return (
    <div style={{
      background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px",
      padding: "20px 24px", marginBottom: "12px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "14px", gap: "12px",
      }}>
        <div style={{
          fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase",
          color: C.textDim, fontFamily: "'DM Mono', monospace",
        }}>
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

// ─── ShareRow ─────────────────────────────────────────────────────────────────
function ShareRow({ auditId }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/results/${auditId}`;
  const copy = () =>
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
      <input
        readOnly
        value={shareUrl}
        style={{
          flex: 1, background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: "8px", padding: "10px 14px", color: C.textDim,
          fontSize: "13px", fontFamily: "'DM Mono', monospace", outline: "none",
        }}
      />
      <button
        onClick={copy}
        style={{
          background: copied ? C.green : "transparent",
          color: copied ? C.bg : C.accent,
          border: `1px solid ${copied ? C.green : C.accent}`,
          borderRadius: "8px", padding: "10px 16px", fontSize: "12px",
          letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer",
          fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap",
        }}
      >
        {copied ? "Copied" : "Copy Link"}
      </button>
    </div>
  );
}

// ─── Feedback options ─────────────────────────────────────────────────────────
const FEEDBACK_OPTS = [
  { id: "monitoring", label: "Monthly score monitoring and alerts", hasInput: false },
  { id: "competitors", label: "Competitor tracking dashboard", hasInput: false },
  { id: "whitelabel", label: "White-label reports for agencies", hasInput: false },
  { id: "content", label: "AI-optimized content suggestions", hasInput: false },
  { id: "schema_impl", label: "Direct schema code implementation", hasInput: false },
  { id: "other", label: "Something else", hasInput: true },
];

// ─── Main Report page ─────────────────────────────────────────────────────────
export default function Report() {
  const { id } = useParams();
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [votes, setVotes] = useState({});
  const [otherText, setOtherText] = useState("");
  const [otherSubmitted, setOtherSubmitted] = useState(false);

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

  const handleOtherSubmit = () => {
    if (!otherText.trim()) return;
    fetch(`${API}/api/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId: id, type: "other", message: otherText }),
    }).catch(() => {});
    setOtherSubmitted(true);
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
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", minHeight: "400px", gap: "20px",
          }}>
            <div style={{
              width: "40px", height: "40px",
              border: `2px solid ${C.border}`, borderTop: `2px solid ${C.accent}`,
              borderRadius: "50%", animation: "spin 0.8s linear infinite",
            }} />
            <div style={{ fontSize: "16px", color: C.textDim, fontFamily: "'DM Sans', sans-serif" }}>
              Loading report…
            </div>
          </div>
        )}

        {/* ── ERROR ── */}
        {state === "error" && (
          <div>
            <Link
              to={`/results/${id}`}
              style={{
                display: "inline-block", background: "transparent",
                border: `1px solid ${C.border}`, color: C.textDim, borderRadius: "8px",
                padding: "10px 20px", fontSize: "12px", letterSpacing: "1.5px",
                textTransform: "uppercase", cursor: "pointer",
                fontFamily: "'DM Mono', monospace", marginBottom: "32px", textDecoration: "none",
              }}
            >
              ← Results
            </Link>
            <div style={{
              background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)",
              borderRadius: "8px", padding: "16px", color: C.red,
              fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
            }}>
              {error}
            </div>
          </div>
        )}

        {/* ── READY ── */}
        {state === "ready" && data && (() => {
          const { auditId, businessName, location, overallScore, categories, insights, fixes, signals } = data;
          const aiSearch = signals?.aiSearch || {};
          const perplexity = signals?.perplexity;
          const claude = signals?.claude;
          const schema = signals?.schema || {};
          const firstPrompt = aiSearch.prompts?.[0];

          // First critical fix (or first fix if none is critical)
          const criticalFix = fixes?.find((f) => f.priority === "critical") || fixes?.[0];
          const extraFixCount = fixes ? fixes.length - 1 : 0;

          // Competitors: first response where matched === false
          const allResponses = [
            ...(aiSearch.prompts || []).map((p) => ({ snippet: p.snippet, matched: p.matched })),
            perplexity ? { snippet: perplexity.snippet, matched: perplexity.matched } : null,
            claude ? { snippet: claude.snippet, matched: claude.matched } : null,
          ].filter(Boolean);
          const firstNonMatch = allResponses.find((r) => r.matched === false);

          return (
            <div style={{ animation: "fadeIn 0.4s ease" }}>

              {/* ── Back link + business badge ── */}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                flexWrap: "wrap", gap: "12px", marginBottom: "32px",
              }}>
                <Link
                  to={`/results/${id}`}
                  style={{
                    background: "transparent", border: `1px solid ${C.border}`,
                    color: C.textDim, borderRadius: "8px", padding: "10px 20px",
                    fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase",
                    cursor: "pointer", fontFamily: "'DM Mono', monospace", textDecoration: "none",
                  }}
                >
                  ← Results
                </Link>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  background: C.accentDim, border: "1px solid rgba(0,229,255,0.2)",
                  borderRadius: "6px", padding: "6px 12px",
                  fontSize: "12px", color: C.accent, fontFamily: "'DM Mono', monospace",
                }}>
                  <span style={{ opacity: 0.6 }}>audited</span>
                  {businessName}
                  {location && (
                    <><span style={{ opacity: 0.4 }}>·</span>{location}</>
                  )}
                </div>
              </div>

              {/* ═══════════════════════════════════════
                  FREE SECTION
              ═══════════════════════════════════════ */}

              {/* 3. Score card */}
              <Card title="AI SEARCH VISIBILITY SCORE">
                <div style={{ display: "flex", gap: "24px", alignItems: "stretch", flexWrap: "wrap" }}>
                  <ScoreGauge score={overallScore} />
                  <CategoryBars categories={categories} />
                </div>
              </Card>

              {/* 4. Top fix card */}
              {criticalFix && (
                <>
                  <Card title="TOP RECOMMENDATION">
                    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                      <PriorityBadge p={criticalFix.priority} />
                      <div>
                        <div style={{
                          fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                          fontWeight: "600", color: C.text, marginBottom: "6px",
                        }}>
                          {criticalFix.title}
                        </div>
                        <div style={{
                          fontSize: "13px", color: C.textDim, lineHeight: "1.6",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {criticalFix.body}
                        </div>
                      </div>
                    </div>
                  </Card>
                  {extraFixCount > 0 && (
                    <div style={{
                      textAlign: "center", fontSize: "13px", color: C.textDim,
                      fontFamily: "'DM Sans', sans-serif", marginBottom: "32px", marginTop: "-8px",
                    }}>
                      {`${extraFixCount} more fix recommendation${extraFixCount !== 1 ? "s" : ""} identified — upgrade to Starter to see them all`}
                    </div>
                  )}
                </>
              )}

              {/* ═══════════════════════════════════════
                  STARTER SECTION
              ═══════════════════════════════════════ */}
              <div style={{ marginTop: "40px" }}>

                {/* 5. Starter tier banner */}
                <TierBanner
                  label="★ STARTER PREVIEW"
                  message="Upgrade to Starter for $29/mo — get all fix recommendations and key findings"
                  linkLabel="Upgrade to Starter →"
                  href="/pricing"
                  accentColor={C.yellow}
                  bgColor="rgba(255,214,10,0.06)"
                  borderColor="rgba(255,214,10,0.2)"
                />

                {/* 6. All fixes card */}
                <Card title="RECOMMENDED FIXES">
                  {fixes && fixes.map((fix, i) => (
                    <div
                      key={i}
                      style={{
                        borderBottom: i === fixes.length - 1 ? "none" : `1px solid ${C.border}`,
                        padding: "16px 0", display: "flex", gap: "16px", alignItems: "flex-start",
                      }}
                    >
                      <PriorityBadge p={fix.priority} />
                      <div>
                        <div style={{
                          fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
                          fontWeight: "600", color: C.text, marginBottom: "4px",
                        }}>
                          {fix.title}
                        </div>
                        <div style={{
                          fontSize: "13px", color: C.textDim, lineHeight: "1.6",
                          fontFamily: "'DM Sans', sans-serif",
                        }}>
                          {fix.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </Card>

                {/* 7. Key findings card */}
                <Card title="KEY FINDINGS">
                  {insights && insights.map((ins, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex", gap: "12px", alignItems: "flex-start",
                        marginBottom: i < insights.length - 1 ? "14px" : "0",
                      }}
                    >
                      <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>{ins.icon}</span>
                      <span style={{
                        fontSize: "14px", color: C.textDim, lineHeight: "1.6",
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        {ins.text}
                      </span>
                    </div>
                  ))}
                </Card>

                {/* 8. Shareable link */}
                <ShareRow auditId={auditId || id} />

              </div>

              {/* ═══════════════════════════════════════
                  PRO SECTION
              ═══════════════════════════════════════ */}
              <div style={{ marginTop: "40px" }}>

                {/* 9. Pro tier banner */}
                <TierBanner
                  label="★ PRO PREVIEW"
                  message="Upgrade to Pro for $49/mo — see exactly what AI says about your business"
                  linkLabel="Upgrade to Pro →"
                  href="/pricing"
                  accentColor={C.accent}
                  bgColor="rgba(0,229,255,0.06)"
                  borderColor="rgba(0,229,255,0.2)"
                />

                {/* 10. Platform responses section header */}
                <div style={{
                  fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
                  color: C.accent, marginBottom: "16px", fontFamily: "'DM Mono', monospace",
                }}>
                  PLATFORM RESPONSES
                </div>

                {/* 11. Three QueryCards */}
                <QueryCard
                  platform="ChatGPT"
                  query={firstPrompt?.prompt}
                  matched={firstPrompt?.matched}
                  snippet={firstPrompt?.snippet}
                  snippetMaxLen={400}
                />
                <QueryCard
                  platform="Perplexity"
                  query={perplexity?.query}
                  matched={perplexity?.matched}
                  snippet={perplexity?.snippet}
                  error={perplexity?.error}
                  snippetMaxLen={400}
                />
                <QueryCard
                  platform="Claude"
                  query={claude?.query}
                  matched={claude?.matched}
                  snippet={claude?.snippet}
                  error={claude?.error}
                  snippetMaxLen={400}
                />

                {/* 12. Schema details card */}
                <Card title="SCHEMA MARKUP" style={{ marginTop: "24px" }}>
                  {schema.found ? (
                    <>
                      <div style={{
                        fontSize: "14px", color: C.green,
                        fontFamily: "'DM Sans', sans-serif", marginBottom: "12px",
                      }}>
                        Found {schema.schemasFound} block{schema.schemasFound !== 1 ? "s" : ""}
                      </div>
                      {schema.relevantTypes && schema.relevantTypes.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                          {schema.relevantTypes.map((t, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: "11px", padding: "4px 10px", borderRadius: "20px",
                                background: C.accentDim, border: "1px solid rgba(0,229,255,0.2)",
                                color: C.accent, fontFamily: "'DM Mono', monospace", letterSpacing: "1px",
                              }}
                            >
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
                      <div style={{
                        fontSize: "14px", color: C.red,
                        fontFamily: "'DM Sans', sans-serif", marginBottom: "8px",
                      }}>
                        No schema markup detected
                      </div>
                      <div style={{ fontSize: "13px", color: C.textDim, fontFamily: "'DM Sans', sans-serif" }}>
                        Add LocalBusiness JSON-LD schema to your homepage to improve AI search visibility.
                      </div>
                    </>
                  )}
                </Card>

              </div>

              {/* ═══════════════════════════════════════
                  AGENCY SECTION
              ═══════════════════════════════════════ */}
              <div style={{ marginTop: "40px" }}>

                {/* 13. Agency tier banner */}
                <TierBanner
                  label="★ AGENCY PREVIEW"
                  message="Upgrade to Agency for $199/mo — all AI queries, competitor data & PDF export"
                  linkLabel="Upgrade to Agency →"
                  href="/pricing"
                  accentColor="#a78bfa"
                  bgColor="rgba(167,139,250,0.06)"
                  borderColor="rgba(167,139,250,0.2)"
                />

                {/* 14. Section header */}
                <div style={{
                  fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase",
                  color: C.accent, marginBottom: "16px", fontFamily: "'DM Mono', monospace",
                }}>
                  ALL PLATFORM RESPONSES
                </div>

                {/* 15. All 3 ChatGPT queries */}
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

                {/* 16. Perplexity full response */}
                <QueryCard
                  platform="Perplexity"
                  query={perplexity?.query}
                  matched={perplexity?.matched}
                  snippet={perplexity?.snippet}
                  error={perplexity?.error}
                  snippetMaxLen={600}
                />

                {/* 17. Claude full response */}
                <QueryCard
                  platform="Claude"
                  query={claude?.query}
                  matched={claude?.matched}
                  snippet={claude?.snippet}
                  error={claude?.error}
                  snippetMaxLen={600}
                />

                {/* 18. Competitors card */}
                <Card title="WHAT APPEARED INSTEAD">
                  {allResponses.length === 0 ? (
                    <p style={{
                      fontSize: "14px", color: C.muted,
                      fontFamily: "'DM Sans', sans-serif", margin: "0",
                    }}>
                      No competitor data available for this audit
                    </p>
                  ) : firstNonMatch ? (
                    firstNonMatch.snippet ? (
                      <p style={{
                        fontSize: "14px", color: C.textDim, lineHeight: "1.65",
                        fontFamily: "'DM Sans', sans-serif", margin: "0",
                      }}>
                        {firstNonMatch.snippet.slice(0, 600)}
                        {firstNonMatch.snippet.length > 600 ? "…" : ""}
                      </p>
                    ) : (
                      <p style={{
                        fontSize: "14px", color: C.muted,
                        fontFamily: "'DM Sans', sans-serif", margin: "0",
                      }}>
                        No competitor data available for this audit
                      </p>
                    )
                  ) : (
                    <p style={{
                      fontSize: "14px", color: C.green,
                      fontFamily: "'DM Sans', sans-serif", margin: "0",
                    }}>
                      Your business appeared in all tested queries — great visibility!
                    </p>
                  )}
                </Card>

                {/* 19. PDF Export placeholder */}
                <div style={{ marginBottom: "20px" }}>
                  <button
                    disabled
                    style={{
                      background: C.muted, color: C.bg, borderRadius: "8px",
                      padding: "14px 28px", fontSize: "13px", fontWeight: "700",
                      letterSpacing: "1.5px", textTransform: "uppercase",
                      cursor: "not-allowed", fontFamily: "'DM Mono', monospace", border: "none",
                    }}
                  >
                    Export PDF — Coming Soon
                  </button>
                </div>

              </div>

              {/* ═══════════════════════════════════════
                  FEEDBACK WIDGET — all users
              ═══════════════════════════════════════ */}
              <div style={{ marginTop: "40px" }}>

                {/* 20. Feedback card */}
                <Card title="HELP US BUILD WHAT YOU NEED NEXT">

                  {/* 5 non-input vote cards in a grid */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "12px",
                    marginBottom: "16px",
                  }}>
                    {FEEDBACK_OPTS.filter((o) => !o.hasInput).map((opt) => {
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
                            transition: "all 0.15s",
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          <div style={{
                            fontSize: "12px", fontWeight: "700",
                            color: voted ? C.green : C.textDim,
                            letterSpacing: "0px",
                          }}>
                            {voted ? `✓ ${opt.label}` : opt.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* "Something else" full-width row */}
                  {otherSubmitted ? (
                    <div style={{
                      fontSize: "13px", color: C.green,
                      fontFamily: "'DM Sans', sans-serif",
                    }}>
                      ✓ Thanks for your feedback!
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <input
                        type="text"
                        placeholder="Something else…"
                        value={otherText}
                        onChange={(e) => setOtherText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleOtherSubmit()}
                        style={{
                          flex: 1, background: C.bg, border: `1px solid ${C.border}`,
                          borderRadius: "8px", padding: "10px 14px",
                          color: C.text, fontSize: "13px",
                          fontFamily: "'DM Sans', sans-serif", outline: "none",
                        }}
                      />
                      <button
                        onClick={handleOtherSubmit}
                        style={{
                          background: "transparent", color: C.accent,
                          border: `1px solid ${C.accent}`, borderRadius: "8px",
                          padding: "10px 16px", fontSize: "12px",
                          letterSpacing: "1px", textTransform: "uppercase",
                          cursor: "pointer", fontFamily: "'DM Mono', monospace",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Submit
                      </button>
                    </div>
                  )}

                </Card>

              </div>

            </div>
          );
        })()}

      </div>
    </div>
  );
}
