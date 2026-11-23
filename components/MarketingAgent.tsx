"use client";
import { useIndustry } from "@/lib/useIndustry";
import { useState } from "react";
import { ROLES, Team } from "@/lib/sim";
import { CHANNELS, PlanRow, channelEff, channelMix, planToDecisions } from "@/lib/marketing";
import Typewriter, { RobotWriting } from "./Typewriter";

const P = ["p1", "p2", "p3"] as const;
const empty = (): PlanRow[] => CHANNELS.map((c) => ({ channel: c.id, p1: 0, p2: 0, p3: 0, ad: "" }));
const pct = (x: number) => `${Math.round(x * 100)}%`;

// Marketing channels: plan spend by channel and product (by hand or with the AI marketing agent), then apply.
// Each channel suits some products and markets better, and saturates when overspent.
export default function MarketingAgent({ t, idx, apply }: { t: Team; idx: number; apply: (d: Record<string, string>, plan: PlanRow[]) => void }) {
  const { t: w } = useIndustry();
  const [plan, setPlan] = useState<PlanRow[]>(() => CHANNELS.map((c) => t.channels?.find((r) => r.channel === c.id) ?? { channel: c.id, p1: 0, p2: 0, p3: 0, ad: "" }));
  const current = [1, 2, 3].reduce((s, p) => s + ["advert", "trade", "merch"].reduce((a, l) => a + (Number(t.d[`p${p}${l}`]) || 0), 0), 0);
  const [budget, setBudget] = useState(String(current || 90));
  const [picked, setPicked] = useState<string[]>(["google", "meta", "portals", "daraz"]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [applied, setApplied] = useState(false);

  const used = plan.filter((r) => r.p1 + r.p2 + r.p3 > 0);
  const total = used.reduce((s, r) => s + r.p1 + r.p2 + r.p3, 0);
  const mix = channelMix(used);
  const setCell = (id: string, k: (typeof P)[number], v: string) => { setApplied(false); setPlan(plan.map((r) => (r.channel === id ? { ...r, [k]: Math.max(0, Math.round(Number(v) || 0)) } : r))); };

  const run = async () => {
    setBusy(true); setError(""); setReasoning(""); setApplied(false);
    const r = t.report;
    const company = {
      role: `${ROLES[idx].name} — ${ROLES[idx].focus}`,
      prices: { p1: t.d.p1home, p2: t.d.p2home, p3: t.d.p3home },
      lastQuarter: r ? [0, 1, 2].map((p) => ({ product: p + 1, demand: r.demandU[p], sold: r.soldU[p], unsold: r.unsold[p], lostSales: r.lostSales[p], exportSold: r.sold[0][p] })) : "no report yet",
    };
    try {
      const res = await fetch("/api/marketing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ budget: Number(budget), channels: picked, company }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      const next = empty().map((row) => data.plan.find((x: PlanRow) => x.channel === row.channel) ?? row);
      setPlan(next); setReasoning(data.reasoning);
    } catch { setError("Could not reach the AI. Check your connection and try again."); }
    finally { setBusy(false); }
  };

  return (
    <section className="card no-print mt-6" aria-labelledby="mkt-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="mkt-h" className="font-semibold">Marketing channels &amp; AI marketing agent</h2>
          <p className="max-w-3xl text-sm text-mute">Split your marketing budget across channels and products. Each channel suits some products and markets better (TikTok reaches young buyers of Product 1, LinkedIn reaches trade buyers abroad), and spending too much on one channel gives diminishing returns. Plan by hand or let the AI agent plan; nothing changes until you click Apply. It plans only and never posts on real websites.</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3 rounded-md border border-line bg-stone-50 p-3">
        <label className="text-sm font-medium">AI budget (Rs 000)
          <input type="number" min={0} max={1000} className="input mt-1 w-28" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </label>
        <fieldset className="min-w-0 flex-1">
          <legend className="text-sm font-medium">Channels the AI may use</legend>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {CHANNELS.map((c) => {
              const on = picked.includes(c.id);
              return <button key={c.id} type="button" aria-pressed={on} disabled={busy} title={c.note} onClick={() => setPicked(on ? picked.filter((x) => x !== c.id) : [...picked, c.id])}
                className={`rounded-md border px-2.5 py-1 text-xs transition ${on ? "border-brand bg-brand text-white" : "border-line bg-white hover:bg-stone-50"}`}>{w(c.name)}</button>;
            })}
          </div>
        </fieldset>
        <button className="btn btn-primary" disabled={busy || !picked.length || !Number(budget)} onClick={run}>{busy ? "Planning…" : "AI: plan my marketing"}</button>
      </div>

      <div className="mt-3" aria-live="polite">
        {busy && <div className="scan-line rounded-md bg-stone-50 px-4 py-3"><RobotWriting label="Marketing agent is writing your plan" /></div>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {reasoning && <p className="rounded-md border-l-2 border-brand bg-[#eaf0ec] px-4 py-3 text-sm"><Typewriter text={reasoning} speed={18} /></p>}
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="tbl">
          <thead><tr><th>Channel</th><th>Best for</th><th>{w("P1")} (Rs 000)</th><th>{w("P2")}</th><th>{w("P3")}</th><th>Ad line</th></tr></thead>
          <tbody>
            {CHANNELS.map((c) => {
              const row = plan.find((r) => r.channel === c.id)!;
              const best = c.fit.map((f, p) => [f, p] as const).filter(([f]) => f >= 1.1).map(([, p]) => `P${p + 1}`);
              return (
                <tr key={c.id}>
                  <td className="!text-left"><span className="block font-medium">{w(c.name)}</span><span className="block text-xs text-mute">{c.note}</span></td>
                  <td className="!text-left text-xs">{best.map(w).join(", ") || "—"}{c.export >= 0.5 ? " · export" : c.export === 0 ? " · home only" : ""}</td>
                  {P.map((k, p) => (
                    <td key={k}>
                      <label className="sr-only" htmlFor={`ch-${c.id}-${k}`}>{c.name} Product {p + 1}</label>
                      <input id={`ch-${c.id}-${k}`} type="number" min={0} className="input h-8 w-20 text-right" value={row[k] || ""} placeholder="0" onChange={(e) => setCell(c.id, k, e.target.value)} />
                      {row[k] > 0 && <span className="mt-0.5 block text-[11px] text-mute">eff. {pct(channelEff(c.id, p, row[k]))}</span>}
                    </td>
                  ))}
                  <td className="!text-left min-w-48 whitespace-normal text-xs italic text-slate-700">{row.ad ? <Typewriter text={`“${row.ad}”`} speed={20} /> : <span className="not-italic text-mute">—</span>}</td>
                </tr>
              );
            })}
            <tr className="font-semibold">
              <td className="!text-left">Total Rs {total}k</td><td className="!text-left text-xs font-normal text-mute">Effectiveness</td>
              {[0, 1, 2].map((p) => <td key={p}>{mix ? pct(mix[p].mult) : "—"}</td>)}
              <td className="!text-left text-xs font-normal text-mute">100% = same as classic marketing</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button className="btn btn-accent" disabled={!total} onClick={() => { apply(planToDecisions(used), used); setApplied(true); }}>Apply channel plan</button>
        <button className="btn" onClick={() => { setPlan(empty()); setReasoning(""); setApplied(false); }}>Clear grid</button>
        {t.channels?.length ? <span className="text-sm text-mute">A channel plan is in use ({t.channels.length} channels).</span> : <span className="text-sm text-mute">Using classic marketing (advertising, trade press and merchandising fields).</span>}
        {applied && <span className="text-sm font-medium text-emerald-700">Applied. Click Generate report to see the effect.</span>}
      </div>
    </section>
  );
}
