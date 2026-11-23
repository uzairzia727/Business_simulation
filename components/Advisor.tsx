"use client";
import Typewriter, { RobotWriting } from "./Typewriter";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ROLES, Team } from "@/lib/sim";
import { loadTeams } from "@/lib/store";

// Strip leftover Markdown symbols the model sometimes adds.
const clean = (t: string) => t.replace(/\*+/g, "").replace(/^#+ /gm, "");

type Msg = { role: "user" | "assistant"; text: string };
const TEAM_STARTERS = ["Explain my results in plain words", "Why did I lose sales or have unsold stock?", "What should I change next quarter?", "How am I doing against my rivals?"];

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

function leagueContext(teams: Team[]) {
  return {
    view: "League overview of all 8 companies",
    companies: teams.map((x, i) => x.report ? {
      company: `Team ${i + 1}`, strategy: ROLES[i].name, quarter: `Y${x.year} Q${x.quarter}`,
      revenue: Math.round(x.report.revenue), netProfit: Math.round(x.report.net),
      totalProfit: Math.round((x.history ?? []).reduce((s, h) => s + h.net, 0) + x.report.net),
      unitsSold: x.report.soldU.reduce((a, b) => a + b, 0), unsold: x.report.unsold.reduce((a, b) => a + b, 0),
      lostSales: x.report.lostSales.reduce((a, b) => a + b, 0), cash: Math.round(x.report.cashShown - x.report.overdraft), aiAgentsOn: x.report.agentsOn,
    } : { company: `Team ${i + 1}`, strategy: ROLES[i].name, note: "no report yet" }),
  };
}

function AdvisorChat({ getContext, starters, scope }: { getContext: () => unknown; starters: string[]; scope: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ask = async (q: string) => {
    if (!q.trim() || busy) return;
    const next: Msg[] = [...msgs, { role: "user", text: q.trim() }];
    setMsgs(next); setInput(""); setBusy(true); setError("");
    try {
      const res = await fetch("/api/advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ context: getContext(), messages: next }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setMsgs(msgs); return; }
      setMsgs([...next, { role: "assistant", text: data.text }]);
    } catch { setError("Could not reach the advisor. Check your connection and try again."); setMsgs(msgs); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="text-xs text-mute">{scope} Answers are written by AI from the numbers, so check before acting.</p>
      <div className="mt-3 grid min-h-0 flex-1 content-start gap-3 overflow-y-auto" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[88%] whitespace-pre-wrap rounded-lg px-4 py-3 text-sm leading-6 ${m.role === "user" ? "ml-auto bg-brand text-white" : "bg-stone-100 text-ink"}`}>{m.role === "assistant" ? (i === msgs.length - 1 ? <Typewriter text={clean(m.text)} speed={8} /> : clean(m.text)) : m.text}</div>
        ))}
        {busy && <div className="w-fit rounded-lg bg-stone-100 px-4 py-3"><RobotWriting label="Advisor is writing" /></div>}
        {!msgs.length && (
          <div className="flex flex-col gap-2">
            {starters.map((s) => <button key={s} className="btn justify-start text-left text-xs" disabled={busy} onClick={() => ask(s)}>{s}</button>)}
          </div>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(input); }}>
        <label htmlFor="advisor-q" className="sr-only">Your question</label>
        <input id="advisor-q" className="input flex-1" placeholder="Ask a question…" value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} />
        <button className="btn btn-primary" disabled={busy || !input.trim()}>{busy ? "…" : "Ask"}</button>
      </form>
    </div>
  );
}

const LEAGUE_STARTERS = ["Who is winning and why?", "Which strategy is working best?", "Which company is in the most trouble?", "What should the bottom team change?"];

// Floating "Ask Advisor" button on every page. On a team page it advises that team; elsewhere, the whole league.
export default function Advisor() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const m = path.match(/^\/team\/(\d)/);
  const idx = m ? Number(m[1]) - 1 : -1;
  const label = idx >= 0 ? `Team ${idx + 1}: ${ROLES[idx]?.name}` : "League overview";

  const getContext = () => {
    const teams = loadTeams() ?? [];
    const t = teams[idx];
    return idx >= 0 && t?.report ? context(t, idx, teams) : leagueContext(teams);
  };

  return (
    <div className="no-print">
      {open && (
        <div role="dialog" aria-label="Advisor" className="fixed inset-x-3 bottom-20 z-50 flex h-[min(34rem,calc(100dvh-7rem))] flex-col rounded-lg border border-line bg-white p-4 shadow-lg sm:inset-x-auto sm:right-5 sm:w-[24rem]">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="font-semibold">Advisor</p>
              <p className="text-xs font-medium text-brand">{label}</p>
            </div>
            <button className="btn size-11 px-0" aria-label="Close advisor" onClick={() => setOpen(false)}>✕</button>
          </div>
          {/* key resets the chat when the page context changes */}
          <AdvisorChat key={label} getContext={getContext} starters={idx >= 0 ? TEAM_STARTERS : LEAGUE_STARTERS}
            scope={idx >= 0 ? "Advising on this team's latest report (generate it first)." : "Advising on all 8 companies."} />
        </div>
      )}
      <button onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close advisor" : "Ask Advisor"}
        className="fixed bottom-4 right-4 z-50 flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-md bg-brand px-2.5 sm:bottom-5 sm:right-5 sm:px-5 font-semibold text-white shadow-lg transition hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
        <span className="grid size-7 place-items-center rounded-full bg-white/20 text-xs font-bold" aria-hidden="true">AI</span>
        <span className="hidden sm:inline">{open ? "Close" : "Ask Advisor"}</span>
      </button>
    </div>
  );
}
