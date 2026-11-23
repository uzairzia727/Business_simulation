"use client";
import { useState } from "react";
import { ROLES, Team } from "@/lib/sim";
import { CHANNELS, PlanRow, planToDecisions } from "@/lib/marketing";
import Typewriter, { RobotWriting } from "./Typewriter";

const LEVERS = ["advert", "trade", "merch"];

// AI marketing agent: picks how to split this quarter's marketing budget across channels, writes ad lines,
// and (only when the user clicks Apply) fills in the nine marketing decisions.
export default function MarketingAgent({ t, idx, apply }: { t: Team; idx: number; apply: (d: Record<string, string>) => void }) {
  const current = [1, 2, 3].reduce((s, p) => s + LEVERS.reduce((a, l) => a + (Number(t.d[`p${p}${l}`]) || 0), 0), 0);
  const [budget, setBudget] = useState(String(current || 90));
  const [picked, setPicked] = useState<string[]>(["google", "meta", "portals", "daraz"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ reasoning: string; plan: PlanRow[] } | null>(null);
  const [applied, setApplied] = useState(false);

  const run = async () => {
    setBusy(true); setError(""); setResult(null); setApplied(false);
    const r = t.report;
    const company = {
      role: `${ROLES[idx].name} — ${ROLES[idx].focus}`,
      prices: { p1: t.d.p1home, p2: t.d.p2home, p3: t.d.p3home },
      lastQuarter: r ? [0, 1, 2].map((p) => ({ product: p + 1, demand: r.demandU[p], sold: r.soldU[p], unsold: r.unsold[p], lostSales: r.lostSales[p] })) : "no report yet",
    };
    try {
      const res = await fetch("/api/marketing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ budget: Number(budget), channels: picked, company }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Something went wrong."); else setResult(data);
    } catch { setError("Could not reach the AI. Check your connection and try again."); }
    finally { setBusy(false); }
  };

  const total = result?.plan.reduce((s, r) => s + r.p1 + r.p2 + r.p3, 0) ?? 0;

  return (
    <section className="card no-print mt-6" aria-labelledby="mkt-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="mkt-h" className="font-semibold">AI marketing agent</h2>
          <p className="max-w-2xl text-sm text-mute">Pick your channels and budget. The AI splits the spend across channels and products and writes an ad line for each. Nothing changes until you click Apply. It plans only and never posts on real websites.</p>
        </div>
        <div className="flex items-end gap-2">
          <label className="text-sm font-medium">Budget (Rs 000)
            <input type="number" min={0} max={1000} className="input mt-1 w-28" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </label>
          <button className="btn btn-primary" disabled={busy || !picked.length || !Number(budget)} onClick={run}>{busy ? "Planning…" : "Plan my marketing"}</button>
        </div>
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">Channels</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {CHANNELS.map((c) => {
            const on = picked.includes(c.id);
            return (
              <button key={c.id} type="button" aria-pressed={on} disabled={busy} title={c.note}
                onClick={() => setPicked(on ? picked.filter((x) => x !== c.id) : [...picked, c.id])}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${on ? "border-brand bg-brand text-white" : "border-line hover:bg-slate-50"}`}>{c.name}</button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4" aria-live="polite">
        {busy && <div className="scan-line rounded-xl bg-slate-50 px-4 py-3"><RobotWriting label="Marketing agent is writing your plan" /></div>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {result && (
          <div className="grid gap-3">
            <p className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-brand-dark"><Typewriter text={result.reasoning} speed={18} /></p>
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Channel</th><th>P1</th><th>P2</th><th>P3</th><th>Ad line</th></tr></thead>
                <tbody>
                  {result.plan.map((r) => (
                    <tr key={r.channel}>
                      <td className="font-medium">{CHANNELS.find((c) => c.id === r.channel)?.name}</td>
                      <td>{r.p1}</td><td>{r.p2}</td><td>{r.p3}</td>
                      <td className="min-w-56 italic text-slate-700"><Typewriter text={`“${r.ad}”`} speed={22} /></td>
                    </tr>
                  ))}
                  <tr className="font-semibold"><td>Total</td><td colSpan={4}>Rs {total}k of Rs {budget}k</td></tr>
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="btn btn-accent" onClick={() => { apply(planToDecisions(result.plan)); setApplied(true); }}>Apply to my marketing decisions</button>
              {applied && <span className="text-sm font-medium text-emerald-700">Applied. Click Generate report to see the effect.</span>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
