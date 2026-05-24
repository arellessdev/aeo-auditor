import React, { useState } from "react";
import { Link } from "react-router-dom";

export const C = {
  bg: "#080c14", surface: "#0d1420", border: "#1a2540", accent: "#00e5ff",
  accentDim: "#0a3d47", green: "#00ff88", yellow: "#ffd60a", red: "#ff4757",
  muted: "#4a5a7a", text: "#e0e8ff", textDim: "#7a8aa8",
};

export const scoreColor = (s) => s >= 70 ? C.green : s >= 45 ? C.yellow : C.red;
export const scoreLabel = (s) => s >= 75 ? "Strong Visibility" : s >= 50 ? "Moderate Visibility" : s >= 30 ? "Weak Visibility" : "Near-Invisible";

export function Header() {
  return (
    <div style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: C.accent, boxShadow: `0 0 10px ${C.accent}`, animation: "pulse 2s infinite" }} />
        <a href="/" style={{ fontSize: "13px", letterSpacing: "4px", color: C.accent, fontWeight: "700", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>AIScorify</a>
      </div>
      <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        <Link to="/pricing" style={{ fontSize: "12px", letterSpacing: "2px", color: C.textDim, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>Pricing</Link>
        <Link to="/" style={{ background: C.accent, color: C.bg, borderRadius: "6px", padding: "8px 18px", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>Free Audit</Link>
      </nav>
    </div>
  );
}

export function ScoreGauge({ score }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: "180px", gap: "8px" }}>
      <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.textDim }}>Agent Score</div>
      <div style={{ fontSize: "64px", fontWeight: "700", lineHeight: "1", color: scoreColor(score), fontFamily: "'DM Sans', sans-serif" }}>{score}</div>
      <div style={{ fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", color: C.textDim, marginTop: "4px" }}>/ 100</div>
      <div style={{ fontSize: "13px", color: scoreColor(score), fontWeight: "600", textAlign: "center" }}>{scoreLabel(score)}</div>
    </div>
  );
}

export function CategoryBars({ categories }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px 28px", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
      {categories.map((c, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: C.textDim }}>{c.name}</span>
            <span style={{ fontSize: "13px", fontWeight: "700", color: scoreColor(c.score) }}>{c.score}</span>
          </div>
          <div style={{ height: "4px", background: C.border, borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${c.score}%`, background: scoreColor(c.score), borderRadius: "2px", transition: "width 1s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PriorityBadge({ p }) {
  const colors = {
    critical: { bg: "rgba(255,71,87,0.15)", color: C.red, border: "rgba(255,71,87,0.3)" },
    high: { bg: "rgba(255,214,10,0.15)", color: C.yellow, border: "rgba(255,214,10,0.3)" },
    medium: { bg: "rgba(0,229,255,0.1)", color: C.accent, border: "rgba(0,229,255,0.2)" },
  };
  const s = colors[p] || colors.medium;
  return (
    <span style={{ fontSize: "10px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "3px 8px", borderRadius: "4px", fontWeight: "700", flexShrink: 0, marginTop: "2px", background: s.bg, color: s.color, border: `1px solid ${s.border}`, fontFamily: "'DM Mono', monospace" }}>{p}</span>
  );
}

export function ShareRow({ auditId }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/results/${auditId}`;
  const copy = () => { navigator.clipboard.writeText(shareUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "28px" }}>
      <input readOnly value={shareUrl} style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "10px 14px", color: C.textDim, fontSize: "13px", fontFamily: "'DM Mono', monospace", outline: "none" }} />
      <button onClick={copy} style={{ background: copied ? C.green : "transparent", color: copied ? C.bg : C.accent, border: `1px solid ${copied ? C.green : C.accent}`, borderRadius: "8px", padding: "10px 16px", fontSize: "12px", letterSpacing: "1px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap" }}>
        {copied ? "Copied" : "Copy Link"}
      </button>
    </div>
  );
}

function TierBanner({ tier, color, message }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: `rgba(${color === C.yellow ? "255,214,10" : color === C.accent ? "0,229,255" : "167,139,250"}, 0.06)`,
      border: `1px solid rgba(${color === C.yellow ? "255,214,10" : color === C.accent ? "0,229,255" : "167,139,250"}, 0.2)`,
      borderRadius: "8px", padding: "10px 16px", marginBottom: "20px",
    }}>
      <span style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "2px", color, fontWeight: "700" }}>
        ★ {tier} PREVIEW
      </span>
      <span style={{ fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: C.textDim }}>{message}</span>
    </div>
  );
}

function QueryCard({ platform, query, matched, snippet, error }) {
  if (query == null && !error) {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "28px", marginBottom: "20px" }}>
        <div style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", color: C.textDim, marginBottom: "12px" }}>{platform}</div>
        <div style={{ fontSize: "13px", color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>Data not available — run a new audit to collect this signal</div>
      </div>
    );
  }
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "28px", marginBottom: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <span style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", color: C.textDim }}>{platform}</span>
        {!error && (
          <span style={{
            fontSize: "10px", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "700",
            padding: "3px 10px", borderRadius: "999px",
            background: matched ? "rgba(0,255,136,0.12)" : "rgba(255,71,87,0.12)",
            color: matched ? C.green : C.red,
            border: `1px solid ${matched ? "rgba(0,255,136,0.3)" : "rgba(255,71,87,0.3)"}`,
          }}>{matched ? "FOUND" : "NOT FOUND"}</span>
        )}
      </div>
      {query && (
        <div style={{ background: C.bg, borderRadius: "6px", padding: "10px 14px", marginBottom: "14px", fontSize: "13px", fontFamily: "'DM Mono', monospace", color: C.accent, border: `1px solid ${C.border}` }}>
          {query}
        </div>
      )}
      {snippet && !error && (
        <div style={{ fontSize: "13px", fontFamily: "'DM Sans', sans-serif", color: C.textDim, lineHeight: "1.65" }}>
          {snippet.length > 400 ? snippet.slice(0, 400) + "…" : snippet}
        </div>
      )}
      {error && (
        <div style={{ fontSize: "12px", fontFamily: "'DM Sans', sans-serif", color: C.red }}>{error}</div>
      )}
    </div>
  );
}

export function AuditResults({ results, auditId, businessName, location, onReset }) {
  const fixes = results?.fixes ?? [];
  const topFix = fixes.find((f) => f.priority === "critical") ?? fixes[0] ?? null;
  const remainingCount = topFix ? fixes.length - 1 : fixes.length;

  const aiS = results?.signals?.aiSearch;
  const plx = results?.signals?.perplexity;
  const cld = results?.signals?.claude;
  const schema = results?.signals?.schema;
  const firstPrompt = aiS?.prompts?.[0];

  const cardStyle = {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: "12px",
    padding: "28px",
    marginBottom: "20px",
  };

  const sectionHeader = (label) => (
    <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.accent, marginBottom: "20px", fontFamily: "'DM Mono', monospace" }}>
      {label}
    </div>
  );

  const fixRow = (fix, i, arr) => (
    <div key={i} style={{ borderBottom: i === arr.length - 1 ? "none" : `1px solid ${C.border}`, padding: "16px 0", display: "flex", gap: "16px", alignItems: "flex-start" }}>
      <PriorityBadge p={fix.priority} />
      <div>
        <div style={{ fontSize: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: "600", color: C.text, marginBottom: "4px" }}>{fix.title}</div>
        <div style={{ fontSize: "13px", color: C.textDim, lineHeight: "1.6", fontFamily: "'DM Sans', sans-serif" }}>{fix.body}</div>
      </div>
    </div>
  );

  return (
    <div style={{ animation: "fadeIn 0.5s ease" }}>

      {/* 0. Back buttons */}
      {onReset && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
          <button onClick={onReset} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textDim, borderRadius: "8px", padding: "10px 20px", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Mono', monospace" }}>← New Audit</button>
          {auditId && (
            <Link to={`/report/${auditId}`} style={{ display: "inline-flex", alignItems: "center", background: "transparent", border: `1px solid ${C.accent}`, color: C.accent, borderRadius: "8px", padding: "10px 20px", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>
              Full Report →
            </Link>
          )}
        </div>
      )}

      {/* 1. Business badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: C.accentDim, border: `1px solid ${C.accent}`, borderRadius: "6px", padding: "6px 12px", fontSize: "12px", color: C.accent, marginBottom: "28px", fontFamily: "'DM Sans', sans-serif" }}>
        <span style={{ opacity: 0.7 }}>audited</span>
        <span>{businessName}</span>
        {location && (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>{location}</span>
          </>
        )}
      </div>

      {/* ══ FREE TIER ══ */}

      {/* 2. Score row */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "28px", alignItems: "stretch" }}>
        <ScoreGauge score={results?.overallScore ?? 0} />
        <CategoryBars categories={results?.categories ?? []} />
      </div>

      {/* 3. Top fix */}
      {topFix && (
        <div style={cardStyle}>
          {sectionHeader("TOP RECOMMENDATION")}
          {fixRow(topFix, 0, [topFix])}
        </div>
      )}

      {/* 4. Teaser */}
      {remainingCount > 0 && (
        <div style={{ fontSize: "13px", color: C.textDim, fontFamily: "'DM Sans', sans-serif", textAlign: "center", padding: "12px 0", marginBottom: "8px" }}>
          "{remainingCount} more fix recommendation{remainingCount !== 1 ? "s" : ""} identified — upgrade to Starter to see them all"
        </div>
      )}

      {/* ══ STARTER SECTION ══ */}

      {/* 5. Starter banner */}
      <TierBanner tier="Starter" color={C.yellow} message="Upgrade to Starter for $29/mo to unlock" />

      {/* 6. All fixes card */}
      <div style={cardStyle}>
        {sectionHeader("RECOMMENDED FIXES")}
        {fixes.map((fix, i) => fixRow(fix, i, fixes))}
      </div>

      {/* 7. Key findings card */}
      <div style={cardStyle}>
        {sectionHeader("KEY FINDINGS")}
        {(results?.insights ?? []).map((ins, i) => (
          <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "14px" }}>
            <span style={{ fontSize: "16px", flexShrink: 0, marginTop: "1px" }}>{ins.icon}</span>
            <span style={{ fontSize: "14px", color: C.textDim, lineHeight: "1.6", fontFamily: "'DM Sans', sans-serif" }}>{ins.text}</span>
          </div>
        ))}
      </div>

      {/* 8. Shareable link */}
      {auditId && <ShareRow auditId={auditId} />}

      {/* ══ PRO SECTION ══ */}

      {/* 9. Pro banner */}
      <TierBanner tier="Pro" color={C.accent} message="Upgrade to Pro for $49/mo to unlock" />

      {/* 10. Platform query cards */}
      <QueryCard
        platform="ChatGPT"
        query={firstPrompt?.prompt}
        matched={firstPrompt?.matched}
        snippet={firstPrompt?.snippet}
      />
      <QueryCard
        platform="Perplexity"
        query={plx?.query}
        matched={plx?.matched}
        snippet={plx?.snippet}
        error={plx?.error}
      />
      <QueryCard
        platform="Claude"
        query={cld?.query}
        matched={cld?.matched}
        snippet={cld?.snippet}
        error={cld?.error}
      />

      {/* 11. Schema card */}
      <div style={cardStyle}>
        {sectionHeader("SCHEMA MARKUP")}
        {schema?.found ? (
          <>
            <div style={{ fontSize: "14px", color: C.green, fontFamily: "'DM Sans', sans-serif", marginBottom: "12px" }}>
              Found {schema.schemasFound ?? 1} JSON-LD block{(schema.schemasFound ?? 1) !== 1 ? "s" : ""}
            </div>
            {(schema.relevantTypes ?? []).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
                {schema.relevantTypes.map((type, i) => (
                  <span key={i} style={{ fontSize: "11px", fontFamily: "'DM Mono', monospace", color: C.accent, background: "rgba(0,229,255,0.08)", border: `1px solid rgba(0,229,255,0.2)`, borderRadius: "4px", padding: "3px 10px" }}>{type}</span>
                ))}
              </div>
            )}
            {schema.rawSchemas?.[0] && (
              <pre style={{ background: C.bg, color: "#a8d8a8", maxHeight: "280px", overflow: "auto", fontSize: "12px", padding: "16px", border: `1px solid ${C.border}`, borderRadius: "6px", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all", fontFamily: "'DM Mono', monospace" }}>
                {typeof schema.rawSchemas[0] === "string"
                  ? schema.rawSchemas[0]
                  : JSON.stringify(schema.rawSchemas[0], null, 2)}
              </pre>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: "14px", color: C.red, fontFamily: "'DM Sans', sans-serif", marginBottom: "8px" }}>No schema markup detected</div>
            <div style={{ fontSize: "13px", color: C.textDim, fontFamily: "'DM Sans', sans-serif", lineHeight: "1.6" }}>
              Add JSON-LD structured data to help AI search engines understand your business type, location, and services.
            </div>
          </>
        )}
      </div>

      {/* ══ AGENCY SECTION ══ */}

      {/* 12. Agency banner + placeholder */}
      <TierBanner tier="Agency" color="#a78bfa" message="All 3 AI platform queries, competitor data & PDF export" />
      <div style={cardStyle}>
        <div style={{ fontSize: "14px", fontFamily: "'DM Sans', sans-serif", color: C.textDim, lineHeight: "1.6" }}>
          View the full Agency report at /report/:id for all platform queries, competitor analysis, and PDF export.
          {auditId && (
            <>
              {" "}
              <Link to={`/report/${auditId}`} style={{ color: C.accent, textDecoration: "none" }}>/report/{auditId}</Link>
            </>
          )}
        </div>
      </div>

      {/* ══ BOTTOM CTA ══ */}

      {/* 13. CTA card */}
      <div style={{ background: C.accentDim, border: `1px solid rgba(0,229,255,0.2)`, borderRadius: "12px", padding: "28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ fontSize: "15px", fontFamily: "'DM Sans', sans-serif", fontWeight: "600", color: C.text, marginBottom: "4px" }}>Want us to fix this for you?</div>
          <div style={{ fontSize: "13px", color: C.textDim, fontFamily: "'DM Sans', sans-serif" }}>Full implementation, monthly monitoring, and competitor tracking.</div>
        </div>
        <Link to="/pricing" style={{ display: "inline-block", background: C.accent, color: C.bg, border: "none", borderRadius: "8px", padding: "16px 32px", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}>
          Get Full Report →
        </Link>
      </div>

    </div>
  );
}
