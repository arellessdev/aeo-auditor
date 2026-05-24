import { Link } from "react-router-dom";
import { C, Header } from "../components";

const TIERS = [
  {
    name: "Free",
    price: "Free",
    period: null,
    description: "Get your baseline AI Search Visibility Score. No card required.",
    cta: "Run Free Audit",
    ctaHref: "/",
    featured: false,
    features: [
      "Overall AI visibility score",
      "Category breakdown with scores",
      "Top 1 critical fix recommendation",
      "Instant results in under 20 seconds",
    ],
    missing: [
      "All fix recommendations",
      "Key findings breakdown",
      "AI platform response details",
      "Schema markup code",
      "Competitor data",
    ],
  },
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    description: "Get all your fix recommendations and a full breakdown of what's holding you back.",
    cta: "Start Starter",
    ctaHref: "#",
    featured: false,
    features: [
      "Everything in Free",
      "All fix recommendations with priority levels",
      "Full key findings breakdown",
      "Shareable results link",
      "Unlimited audits",
    ],
    missing: [
      "AI platform response details",
      "Schema markup code",
      "Competitor data",
      "PDF export",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "See exactly what ChatGPT, Perplexity, and Claude say about your business.",
    cta: "Start Pro Trial",
    ctaHref: "#",
    featured: true,
    badge: "Most Popular",
    features: [
      "Everything in Starter",
      "1 ChatGPT query with response snippet",
      "1 Perplexity query with response snippet",
      "1 Claude query with response snippet",
      "Schema markup details + copy-paste JSON-LD",
      "Monthly automated re-scoring",
      "Email alerts when your score drops",
    ],
    missing: [
      "All 3 queries per platform",
      "Competitor tracking",
      "PDF export",
    ],
  },
  {
    name: "Agency",
    price: "$199",
    period: "/mo",
    description: "Full AI query data, competitor tracking, and white-label reports for your clients.",
    cta: "Contact Sales",
    ctaHref: "mailto:hello@aiscorify.com",
    featured: false,
    features: [
      "Everything in Pro",
      "All 3 ChatGPT queries with full responses",
      "All 3 Perplexity queries with full responses",
      "All 3 Claude queries with full responses",
      "Top 3 competitors that appear instead of you",
      "PDF export for client reports",
      "Up to 50 business profiles",
      "Dedicated account manager",
    ],
    missing: [],
  },
];

const FAQ = [
  {
    q: "How is the AI Search Visibility Score calculated?",
    a: "We run your business against real ChatGPT, Perplexity, and Claude web-search queries in your category and location, check for structured data schema markup, and analyze other authority signals. The score reflects how likely you are to appear in AI-generated recommendations today.",
  },
  {
    q: "What's the difference between Starter and Pro?",
    a: "Starter gives you all your fix recommendations and key findings so you know exactly what to improve. Pro goes further — it shows you the actual AI responses, so you can see what ChatGPT, Perplexity, and Claude say (or don't say) about your business when someone searches for your category.",
  },
  {
    q: "What counts as an 'AI recommendation'?",
    a: "When someone asks ChatGPT, Claude, Perplexity, and similar AI search platforms 'best dentist in Austin' or 'recommend a plumber near me', the model searches the web and surfaces specific businesses. We measure whether yours shows up in those responses.",
  },
  {
    q: "Can I cancel my subscription any time?",
    a: "Yes — all plans are month-to-month with no lock-in. Cancel from your dashboard and you keep access until the end of your billing period.",
  },
  {
    q: "Do you offer discounts for annual billing?",
    a: "Annual plans are 20% off. Contact us after signing up and we'll switch your billing cycle and apply the discount immediately.",
  },
];

export default function Pricing() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Mono', monospace" }}>
      <Header />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px 40px 100px" }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: "center", marginBottom: "64px", animation: "fadeIn 0.4s ease" }}>
          <span style={{ fontSize: "11px", letterSpacing: "3px", color: C.accent, textTransform: "uppercase", marginBottom: "16px", display: "block" }}>
            Pricing
          </span>
          <h1 style={{ fontSize: "42px", fontWeight: "700", lineHeight: "1.15", marginBottom: "16px", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-1px", color: C.text }}>
            Know exactly where you stand<br />with AI search engines
          </h1>
          <p style={{ fontSize: "16px", color: C.textDim, lineHeight: "1.6", maxWidth: "520px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>
            Start free. Upgrade when you're ready to see what AI actually says about your business.
          </p>
        </div>

        {/* ── Tier cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", marginBottom: "80px", alignItems: "start" }}>
          {TIERS.map((tier) => (
            <TierCard key={tier.name} tier={tier} />
          ))}
        </div>

        {/* ── FAQ ── */}
        <div style={{ animation: "fadeIn 0.5s ease" }}>
          <div style={{ fontSize: "11px", letterSpacing: "3px", textTransform: "uppercase", color: C.accent, marginBottom: "32px", textAlign: "center" }}>
            Common Questions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {FAQ.map((item, i) => (
              <FAQItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>

        {/* ── Bottom CTA ── */}
        <div style={{ marginTop: "64px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "22px", fontFamily: "'DM Sans', sans-serif", fontWeight: "700", color: C.text, marginBottom: "10px" }}>
            Not sure which plan fits?
          </div>
          <p style={{ fontSize: "14px", color: C.textDim, fontFamily: "'DM Sans', sans-serif", marginBottom: "28px" }}>
            Run a free audit first — no sign-up needed. Upgrade in seconds when you're ready.
          </p>
          <Link
            to="/"
            style={{ display: "inline-block", background: C.accent, color: C.bg, border: "none", borderRadius: "8px", padding: "14px 32px", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Mono', monospace", textDecoration: "none" }}
          >
            Run Free Audit
          </Link>
        </div>
      </div>
    </div>
  );
}

function TierCard({ tier }) {
  const isAnchor = tier.ctaHref.startsWith("http") || tier.ctaHref.startsWith("mailto");

  const cardStyle = {
    background: tier.featured ? "rgba(0,229,255,0.04)" : C.surface,
    border: `1px solid ${tier.featured ? C.accent : C.border}`,
    borderRadius: "12px",
    padding: "28px 24px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    boxShadow: tier.featured ? `0 0 32px rgba(0,229,255,0.08)` : "none",
  };

  const btnStyle = {
    display: "block",
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 0",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
    textDecoration: "none",
    border: tier.featured ? "none" : `1px solid ${C.border}`,
    background: tier.featured ? C.accent : "transparent",
    color: tier.featured ? C.bg : C.textDim,
  };

  return (
    <div style={cardStyle}>
      {tier.badge && (
        <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: C.accent, color: C.bg, fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", padding: "4px 14px", borderRadius: "20px", whiteSpace: "nowrap" }}>
          {tier.badge}
        </div>
      )}

      <div style={{ fontSize: "11px", letterSpacing: "3px", color: tier.featured ? C.accent : C.textDim, textTransform: "uppercase", marginBottom: "16px" }}>
        {tier.name}
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", marginBottom: "10px" }}>
        <span style={{ fontSize: tier.price === "Free" ? "38px" : "42px", fontWeight: "700", lineHeight: "1", color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
          {tier.price}
        </span>
        {tier.period && (
          <span style={{ fontSize: "14px", color: C.textDim, marginBottom: "6px", fontFamily: "'DM Sans', sans-serif" }}>
            {tier.period}
          </span>
        )}
      </div>

      <p style={{ fontSize: "12px", color: C.textDim, lineHeight: "1.6", fontFamily: "'DM Sans', sans-serif", marginBottom: "10px", minHeight: "48px" }}>
        {tier.description}
      </p>

      <p style={{ fontSize: "10px", color: C.muted, fontFamily: "'DM Sans', sans-serif", marginBottom: "20px", letterSpacing: "0.3px" }}>
        Tested against ChatGPT · Claude · Perplexity · and more
      </p>

      {isAnchor ? (
        <a href={tier.ctaHref} style={btnStyle}>{tier.cta}</a>
      ) : (
        <Link to={tier.ctaHref} style={btnStyle}>{tier.cta}</Link>
      )}

      <div style={{ borderTop: `1px solid ${C.border}`, margin: "24px 0" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {tier.features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
            <span style={{ color: C.green, fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>✓</span>
            <span style={{ fontSize: "12px", color: C.text, lineHeight: "1.5", fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
          </div>
        ))}
        {tier.missing.map((f, i) => (
          <div key={`x-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: "8px", opacity: 0.3 }}>
            <span style={{ color: C.muted, fontSize: "12px", flexShrink: 0, marginTop: "1px" }}>—</span>
            <span style={{ fontSize: "12px", color: C.textDim, lineHeight: "1.5", fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  return (
    <details style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 0", cursor: "pointer" }}>
      <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", fontFamily: "'DM Sans', sans-serif", fontWeight: "600", color: C.text, userSelect: "none", outline: "none", listStyle: "none" }}>
        {q}
        <span style={{ color: C.accent, fontSize: "18px", flexShrink: 0, marginLeft: "16px", fontFamily: "system-ui" }}>+</span>
      </summary>
      <p style={{ fontSize: "14px", color: C.textDim, lineHeight: "1.7", fontFamily: "'DM Sans', sans-serif", marginTop: "14px", marginBottom: "0" }}>
        {a}
      </p>
    </details>
  );
}
