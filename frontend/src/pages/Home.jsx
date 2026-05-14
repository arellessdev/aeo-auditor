import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { C, Header, AuditResults } from "../components";

const API = import.meta.env.VITE_API_URL || "";

const LOAD_STEPS = [
  "Analyzing website structure & content clarity",
  "Evaluating structured data & schema markup",
  "Checking AI platform discoverability signals",
  "Assessing review & authority footprint",
  "Generating fix recommendations",
  "Calculating Agent Visibility Score",
];

export default function Home() {
  const [screen, setScreen] = useState("input");
  const [form, setForm] = useState({ name: "", url: "", category: "", location: "" });
  const [loadStep, setLoadStep] = useState(0);
  const [results, setResults] = useState(null);
  const [auditId, setAuditId] = useState(null);
  const [error, setError] = useState("");
  const timer = useRef(null);
  const navigate = useNavigate();

  const runAudit = async () => {
    if (!form.name || !form.url) return;
    setScreen("loading");
    setLoadStep(0);
    let step = 0;
    timer.current = setInterval(() => {
      step++;
      setLoadStep(step);
      if (step >= LOAD_STEPS.length - 1) clearInterval(timer.current);
    }, 1100);
    try {
      const res = await fetch(`${API}/api/audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || "Audit failed");
      clearInterval(timer.current);
      setLoadStep(LOAD_STEPS.length);
      setTimeout(() => {
        setResults(data);
        setAuditId(data.auditId);
        navigate(`/results/${data.auditId}`, { replace: true });
        setScreen("results");
      }, 600);
    } catch (err) {
      clearInterval(timer.current);
      setError(err.message);
      setScreen("error");
    }
  };

  const reset = () => {
    setScreen("input"); setResults(null); setAuditId(null); setError(""); navigate("/");
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Mono', monospace" }}>
      <Header />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 40px" }}>
        {screen === "input" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ marginBottom: "52px" }}>
              <span style={{ fontSize: "11px", letterSpacing: "3px", color: C.accent, textTransform: "uppercase", marginBottom: "16px", display: "block" }}>Agent Engine Optimization</span>
              <h1 style={{ fontSize: "42px", fontWeight: "700", lineHeight: "1.15", marginBottom: "16px", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-1px" }}>Is AI recommending<br />your business?</h1>
              <p style={{ fontSize: "16px", color: C.textDim, lineHeight: "1.6", maxWidth: "540px", fontFamily: "'DM Sans', sans-serif" }}>When someone asks ChatGPT, Claude, or Perplexity for a recommendation in your category — do you show up? Find out in 60 seconds.</p>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "36px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <Field label="Business Name" placeholder="Acme Design Studio" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
                <Field label="Website URL" placeholder="https://acmedesign.com" value={form.url} onChange={v => setForm(f => ({ ...f, url: v }))} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <Field label="Business Category" placeholder="Interior Design, Dentist..." value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} />
                <Field label="Location" placeholder="Austin, TX" value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} />
              </div>
              <button onClick={runAudit} disabled={!form.name || !form.url} style={{ background: C.accent, color: C.bg, border: "none", borderRadius: "8px", padding: "16px 32px", fontSize: "13px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", cursor: !form.name || !form.url ? "not-allowed" : "pointer", fontFamily: "'DM Mono', monospace", alignSelf: "flex-start", opacity: !form.name || !form.url ? 0.4 : 1 }}>
                Run Free Audit ?
              </button>
            </div>
          </div>
        )}
        {screen === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "32px" }}>
            <div style={{ width: "48px", height: "48px", border: `2px solid ${C.border}`, borderTop: `2px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: "20px", fontFamily: "'DM Sans', sans-serif" }}>Auditing {form.name}...</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "360px" }}>
              {LOAD_STEPS.map((step, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px", color: i < loadStep ? C.green : i === loadStep ? C.accent : C.muted, transition: "color 0.3s" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: i < loadStep ? C.green : i === loadStep ? C.accent : C.muted, boxShadow: i === loadStep ? `0 0 8px ${C.accent}` : "none", flexShrink: 0 }} />
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}
        {screen === "error" && (
          <div>
            <button onClick={reset} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.textDim, borderRadius: "8px", padding: "10px 20px", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Mono', monospace", marginBottom: "32px" }}>? Back</button>
            <div style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", borderRadius: "8px", padding: "16px", color: C.red, fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>{error}</div>
          </div>
        )}
        {screen === "results" && results && (
          <AuditResults results={results} auditId={auditId} businessName={form.name} location={form.location} onReset={reset} />
        )}
      </div>
    </div>
  );
}

function Field({ label, placeholder, value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{ fontSize: "11px", letterSpacing: "2px", color: C.textDim, textTransform: "uppercase" }}>{label}</label>
      <input placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: "8px", padding: "12px 16px", color: C.text, fontSize: "14px", fontFamily: "'DM Mono', monospace", outline: "none" }} />
    </div>
  );
}
