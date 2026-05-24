import { Link } from "react-router-dom";
import { C, Header } from "../components";

const TIERS = [
  {
    name: "Starter",
    price: "Free",
    period: null,
    description: "Get your baseline AI Search Visibility Score. No card required.",
    cta: "Run Free Audit",
    ctaHref: "/",
    featured: false,
    features: [
      "1 audit per day",
      "AI presence score (ChatGPT, Claude, Perplexity)",
      "Schema markup detection",
      "Prioritized fix recommendations",
      "Shareable results link",
    ],
    missing: [
      "Monthly re-scoring",
      "Competitor comparison",
      "Email alerts",
      "Multi-location support",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "Track your AI visibility over time and stay ahead of competitors.",
    cta: "Start Pro Trial",
    ctaHref: "#",
    featured: true,
    badge: "Most Popular",
    features: [
      "Unlimited audits",
      "Monthly automated re-scoring",
      "Competitor comparison (up to 5)",
      "Email alerts when your score drops",
      "Full prompt-level audit breakdown",
      "Priority support",
    ],
    missing: [
      "Multi-location support",
      "White-label reporting",
      "API access",
    ],
  },
  {
    name: "Agency",
    price: "$199",
    period: "/mo",
    description: "Manage AI visibility for all your clients from one dashboard.",
    cta: "Contact Sales",
    ctaHref: "mailto:hello@aiscorify.com",
    featured: false,
    features: [
      "Everything in Pro",
      "Up to 50 business profiles",
      "Multi-location support",
      "White-label PDF reports",
      "API access",
      "Dedicated account manager",
      "Custom integrations on request",
    ],
    missing: [],
  },
];

const FAQ = [
  {
    q: "How is the AI Search Visibility Score calculated?",
    a: "We run your business against real ChatGPT web-search queries in your category and location, check for structured data schema markup, and analyze other authority signals. The score reflects how likely you are to appear in AI-generated recommendations today.",
  },
  {
    q: "What counts as an 'AI recommendation'?",
    a: "When someone asks ChatGPT, Claude, or Perplexity 'best dentist in Austin' or 'recommend a plumber near me', the model searches the web and surfaces specific businesses. We measure whether yours shows up in those responses.",
  },
  {
    q: "Can I cancel my subscription any time?",
    a: "Yes — Pro and Agency plans are month-to-month with no lock-in. Cancel from your dashboard and you keep access until the end of your billing period.",
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

      <div style={{ maxWidth: "1040px", margin: "0 auto", padding: "60px 40px 100px" }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: "center", marginBottom: "64px", animation: "fadeIn 0.4s ease" }}>
          <span style={{ fontSize: "11px", letterSpacing: "3px", color: C.accent, textTransform: "uppercase", marginBottom: "16px", display: "block" }}>
            Pricing
          </span>
          <h1 style={{ fontSize: "42px", fontWeight: "700", lineHeight: "1.15", marginBottom: "16px", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-1px", color: C.text }}>
            Know exactly where you stand<br />with AI search engines
          </h1>
          <p style={{ fontSize: "16px", color: C.textDim, lineHeight: "1.6", maxWidth: "520px", margin: "0 auto", fontFamily: "'DM Sans', sans-serif" }}>
            Start free. Upgrade when you're ready to monitor, compete, and grow your AI visibility over time.
          </p>
        </div>

        {/* ── Tier cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px", marginBottom: "80px", alignItems: "start" }}>
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
    padding: "32px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "0",
    position: "relative",
    boxShadow: tier.featured ? `0 0 32px rgba(0,229,255,0.08)` : "none",
  };

  const btnStyle = {
    display: "block",
    textAlign: "center",
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 0",
    borderRadius: "8px",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "'DM Mono', monospace",
    textDecoration: "none",
    border: tier.featured ? "none" : `1px solid ${C.border}`,
    background: tier.featured ? C.accent : "transparent",
    color: tier.featured ? C.bg : C.textDim,
    transition: "opacity 0.15s",
  };

  return (
    <div style={cardStyle}>
      {/* Badge */}
      {tier.badge && (
        <div style={{ position: "absolute", top: "-13px", left: "50%", transform: "translateX(-50%)", background: C.accent, color: C.bg, fontSize: "10px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", padding: "4px 14px", borderRadius: "20px", whiteSpace: "nowrap" }}>
          {tier.badge}
        </div>
      )}

      {/* Tier name */}
      <div style={{ fontSize: "11px", letterSpacing: "3px", color: tier.featured ? C.accent : C.textDim, textTransform: "uppercase", marginBottom: "20px" }}>
        {tier.name}
      </div>

      {/* Price */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", marginBottom: "12px" }}>
        <span style={{ fontSize: tier.price === "Free" ? "42px" : "48px", fontWeight: "700", lineHeight: "1", color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
          {tier.price}
        </span>
        {tier.period && (
          <span style={{ fontSize: "15px", color: C.textDim, marginBottom: "8px", fontFamily: "'DM Sans', sans-serif" }}>
            {tier.period}
          </span>
        )}
      </div>

      {/* Description */}
      <p style={{ fontSize: "13px", color: C.textDim, lineHeight: "1.6", fontFamily: "'DM Sans', sans-serif", marginBottom: "28px", minHeight: "52px" }}>
        {tier.description}
      </p>

      {/* CTA */}
      {isAnchor ? (
        <a href={tier.ctaHref} style={btnStyle}>{tier.cta}</a>
      ) : (
        <Link to={tier.ctaHref} style={btnStyle}>{tier.cta}</Link>
      )}

      {/* Divider */}
      <div style={{ borderTop: `1px solid ${C.border}`, margin: "28px 0" }} />

      {/* Included features */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {tier.features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <span style={{ color: C.green, fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✓</span>
            <span style={{ fontSize: "13px", color: C.text, lineHeight: "1.5", fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
          </div>
        ))}
        {tier.missing.map((f, i) => (
          <div key={`x-${i}`} style={{ display: "flex", alignItems: "flex-start", gap: "10px", opacity: 0.35 }}>
            <span style={{ color: C.muted, fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>—</span>
            <span style={{ fontSize: "13px", color: C.textDim, lineHeight: "1.5", fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FAQItem({ q, a }) {
  return (
    <details style={{ borderBottom: `1px solid ${C.border}`, padding: "20px 0", cursor: "pointer", listStyle: "none" }}>
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
