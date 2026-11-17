"use client";
import { useState } from "react";
import { ROLES, Team } from "@/lib/sim";

type Msg = { role: "user" | "assistant"; text: string };
const STARTERS = ["Explain my results in plain words", "Why did I lose sales or have unsold stock?", "What should I change next quarter?", "How am I doing against my rivals?"];

// Compact view of the numbers the advisor needs (keeps the request small).
function context(t: Team, idx: number, teams: Team[]) {
  const r = t.report!, round = (v: number) => Math.round(v);
  return {
    company: `Team ${idx + 1}`, strategy: ROLES[idx].name, quarter: `Y${t.year} Q${t.quarter}`,
    decisions: r.d,
    results: {
      revenue: round(r.revenue), grossProfit: round(r.gross), netProfit: round(r.net), closingCash: round(r.cashShown - r.overdraft),
      netAssets: round(r.netAssets), sellingOverheads: round(r.sellingOH), adminOverheads: round(r.adminOH), overtimeHours: round(r.otHours),
      perProduct: [0, 1, 2].map((p) => ({ product: p + 1, demand: r.demandU[p], delivered: r.u[p], sold: r.soldU[p], unsold: r.unsold[p], lostSales: r.lostSales[p] })),
      aiAgentsOn: r.agentsOn, aiAgentCost: r.agentCost,
    },
    history: t.history ?? [],
    rivals: teams.map((x, i) => x.report && i !== idx ? { company: `Team ${i + 1}`, strategy: ROLES[i].name, revenue: round(x.report.revenue), netProfit: round(x.report.net), unitsSold: x.report.soldU.reduce((a, b) => a + b, 0) } : null).filter(Boolean),
  };
}

export default function Advisor({ t, idx, teams }: { t: Team; idx: number; teams: Team[] }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ask = async (q: string) => {
    if (!q.trim() || busy) return;
    const next: Msg[] = [...msgs, { role: "user", text: q.trim() }];
    setMsgs(next); setInput(""); setBusy(true); setError("");
    try {
      const res = await fetch("/api/advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context: context(t, idx, teams), messages: next }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setMsgs(msgs); return; }
      setMsgs([...next, { role: "assistant", text: data.text }]);
    } catch { setError("Could not reach the advisor. Check your connection and try again."); setMsgs(msgs); }
    finally { setBusy(false); }
  };

  return (
    <section className="card no-print" aria-labelledby="advisor-h">
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-lg bg-brand text-sm font-bold text-white" aria-hidden="true">AI</span>
        <div>
          <h3 id="advisor-h" className="font-semibold">Advisor</h3>
          <p className="text-xs text-mute">Ask about this report. Answers are written by AI from your numbers, so check before acting.</p>
        </div>
      </div>

      {msgs.length > 0 && (
        <div className="mt-4 grid max-h-[28rem] gap-3 overflow-y-auto" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${m.role === "user" ? "ml-auto bg-brand text-white" : "bg-slate-100 text-ink"}`}>{m.text}</div>
          ))}
          {busy && <div className="w-fit rounded-2xl bg-slate-100 px-4 py-3 text-sm text-mute">Thinking…</div>}
        </div>
      )}

      {!msgs.length && (
        <div className="mt-4 flex flex-wrap gap-2">
          {STARTERS.map((s) => <button key={s} className="btn text-xs" disabled={busy} onClick={() => ask(s)}>{s}</button>)}
        </div>
      )}

      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}

      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <label htmlFor="advisor-q" className="sr-only">Your question</label>
        <input id="advisor-q" className="input flex-1" placeholder="Ask a question about your results…" value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} />
        <button className="btn btn-primary" disabled={busy || !input.trim()}>{busy ? "…" : "Ask"}</button>
      </form>
    </section>
  );
}
