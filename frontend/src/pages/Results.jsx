import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { C, Header, AuditResults } from "../components";

const API = import.meta.env.VITE_API_URL || "";

export default function Results() {
  const { id } = useParams();
  const [state, setState] = useState("loading");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`${API}/api/audit/${id}`)
      .then(res => res.json().then(d => ({ ok: res.ok, d })))
      .then(({ ok, d }) => {
        if (!ok) throw new Error(d.error || "Audit not found");
        setData(d);
        setState("ready");
      })
      .catch(err => { setError(err.message); setState("error"); });
  }, [id]);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Mono', monospace" }}>
      <Header />
      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 40px" }}>
        {state === "loading" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "400px", gap: "20px" }}>
            <div style={{ width: "40px", height: "40px", border: `2px solid ${C.border}`, borderTop: `2px solid ${C.accent}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: "16px", color: C.textDim, fontFamily: "'DM Sans', sans-serif" }}>Loading audit...</div>
          </div>
        )}
        {state === "error" && (
          <div>
            <Link to="/" style={{ display: "inline-block", background: "transparent", border: `1px solid ${C.border}`, color: C.textDim, borderRadius: "8px", padding: "10px 20px", fontSize: "12px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Mono', monospace", marginBottom: "32px", textDecoration: "none" }}>? Run Your Own Audit</Link>
            <div style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", borderRadius: "8px", padding: "16px", color: C.red, fontSize: "14px", fontFamily: "'DM Sans', sans-serif", marginBottom: "16px" }}>{error}</div>
            <p style={{ fontSize: "14px", color: C.textDim, fontFamily: "'DM Sans', sans-serif" }}>
              This link may be invalid. <Link to="/" style={{ color: C.accent }}>Run a new audit ?</Link>
            </p>
          </div>
        )}
        {state === "ready" && data && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: "10px", padding: "14px 20px", marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ fontSize: "13px", color: C.textDim, fontFamily: "'DM Sans', sans-serif" }}>
                Shared audit � {new Date(data.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <Link to={`/report/${data.auditId}`} style={{ fontSize: "12px", color: C.accent, textDecoration: "none", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>Full Report</Link>
                <Link to="/" style={{ fontSize: "12px", color: C.textDim, textDecoration: "none", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>New Audit</Link>
              </div>
            </div>
            <AuditResults results={data} auditId={data.auditId} businessName={data.businessName} location={data.location} />
          </div>
        )}
      </div>
    </div>
  );
}
