"use client";
import { useState } from "react";
import { Candidate, HR, POSITIONS, PositionId, ROLES, Team, gbp } from "@/lib/sim";
import { combined, fire, hire, interview, newCandidates } from "@/lib/hr";
import Typewriter, { RobotWriting } from "./Typewriter";

const IDS = Object.keys(POSITIONS) as PositionId[];
const STATUS: Record<Candidate["status"], string> = { new: "Screened", shortlisted: "Shortlisted", hold: "On hold", rejected: "Rejected", hired: "Hired" };

// HR & recruitment: managers improve parts of the business; the AI screens CVs, the user interviews and decides.
export default function HRPanel({ t, idx, update }: { t: Team; idx: number; update: (patch: Partial<Team>) => void }) {
  const hr: HR = t.hr ?? {};
  const label = `Y${t.year || "—"} Q${t.quarter || "—"}`;
  const [pos, setPos] = useState<PositionId>("ops");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const set = (next: HR) => update({ hr: next });
  const pool = (hr.candidates ?? []).filter((c) => c.position === pos && c.status !== "hired");
  const setCand = (id: string, f: (c: Candidate) => Candidate) => set({ ...hr, candidates: (hr.candidates ?? []).map((c) => (c.id === id ? f(c) : c)) });
  const r = t.report;

  const screen = async () => {
    const list = pool.filter((c) => c.status !== "rejected");
    if (!list.length) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/hr", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ position: pos, candidates: list, company: { strategy: ROLES[idx].name, netProfit: r ? Math.round(r.net) : null } }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); return; }
      const by = Object.fromEntries((data.ranking as { id: string; recommendation: string; reason: string }[]).map((x) => [x.id, x]));
      set({ ...hr, candidates: (hr.candidates ?? []).map((c) => (by[c.id] ? { ...c, ai: by[c.id].recommendation, aiNote: by[c.id].reason } : c)) });
    } catch { setError("Could not reach the AI. Check your connection and try again."); }
    finally { setBusy(false); }
  };

  return (
    <section className="card no-print mt-6" aria-labelledby="hr-h">
      <h2 id="hr-h" className="font-semibold">HR &amp; management team</h2>
      <p className="max-w-3xl text-sm text-mute">Hire managers to strengthen parts of the business; their skill decides how much they help and their salary is charged every quarter. Workers leave each quarter, more so when pay is below the market wage. The AI screens CVs and recommends; you interview and decide.</p>

      {r && (
        <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line text-sm sm:grid-cols-4">
          {[["Workers this quarter", String(r.workers)], ["Expected to leave", `${r.leavers} (${(r.turnover * 100).toFixed(1)}%)`],
            ["Management salaries", gbp(r.managerSalaries)], ["Managers in post", `${Object.keys(hr.managers ?? {}).length} of ${IDS.length}`]]
            .map(([k, v]) => <div key={k} className="bg-white p-3"><dt className="text-xs text-mute">{k}</dt><dd className="mt-0.5 font-semibold tabular-nums">{v}</dd></div>)}
        </dl>
      )}

      <h3 className="mt-6 text-sm font-semibold">Management team</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {IDS.map((id) => {
          const m = hr.managers?.[id];
          const low = m && m.salary < m.asking * 0.9;
          return (
            <div key={id} className={`rounded-md border p-3 ${pos === id ? "border-brand" : "border-line"}`}>
              <p className="text-sm font-semibold">{POSITIONS[id].name}</p>
              <p className="text-xs text-mute">{POSITIONS[id].effect}</p>
              {m ? (
                <div className="mt-2 text-sm">
                  <p><span className="font-medium">{m.name}</span> · skill {m.skill}/100 · since {m.since}</p>
                  <label className="mt-2 flex items-center gap-2 text-xs text-mute">Salary per quarter (Rs)
                    <input type="number" min={0} step={1000} className="input h-8 w-28" value={m.salary}
                      onChange={(e) => set({ ...hr, managers: { ...hr.managers, [id]: { ...m, salary: Math.max(0, Number(e.target.value) || 0) } } })} />
                  </label>
                  {low && <p className="mt-1 text-xs font-medium text-red-700">Below 90% of market rate ({gbp(m.asking)}): will resign at quarter close.</p>}
                  <button className="btn mt-2 h-8 min-h-0 text-xs" onClick={() => { if (confirm(`Dismiss ${m.name}? Severance of ${gbp(m.salary)} is charged this quarter.`)) set(fire(hr, id, label)); }}>Dismiss</button>
                </div>
              ) : (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-mute">Vacant</span>
                  <button className="btn h-8 min-h-0 text-xs" onClick={() => setPos(id)}>Recruit</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
        <label className="text-sm font-semibold">Recruiting for
          <select className="input mt-1 w-64" value={pos} onChange={(e) => setPos(e.target.value as PositionId)}>
            {IDS.map((id) => <option key={id} value={id}>{POSITIONS[id].name}{hr.managers?.[id] ? " (filled)" : ""}</option>)}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="btn" onClick={() => set({ ...hr, candidates: [...(hr.candidates ?? []), ...newCandidates(pos)] })}>Advertise job: 4 new candidates</button>
          <button className="btn btn-primary" disabled={busy || !pool.some((c) => c.status !== "rejected")} onClick={screen}>{busy ? "Screening…" : "AI screening of CVs"}</button>
        </div>
      </div>
      <p className="mt-2 text-xs text-mute">Combined score = 50% CV + 50% interview. A CV is only a rough guide to real skill; an interview is much more reliable.</p>
      {busy && <div className="scan-line mt-3 rounded-md bg-stone-50 px-4 py-2"><RobotWriting label="HR assistant is reading the CVs" /></div>}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}

      {pool.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Candidate</th><th>CV score</th><th>Interview</th><th>Combined</th><th>Asking salary</th><th>AI recommendation</th><th>Status</th><th>Decision</th></tr></thead>
            <tbody>
              {pool.map((c) => (
                <tr key={c.id} className={c.status === "rejected" ? "opacity-50" : ""}>
                  <td className="!text-left"><span className="block font-medium">{c.name}</span><span className="block text-xs text-mute">{c.lastRole} · {c.years} yrs · {c.education}</span></td>
                  <td>{c.cv}</td>
                  <td>{c.interview ?? <button className="btn h-8 min-h-0 text-xs" disabled={c.status === "rejected"} onClick={() => setCand(c.id, interview)}>Interview</button>}</td>
                  <td className="font-semibold">{combined(c)}</td>
                  <td>{gbp(c.asking)}</td>
                  <td className="!text-left min-w-48 whitespace-normal text-xs">{c.ai ? <><span className="font-semibold">{c.ai}</span>{c.aiNote && <span className="block text-mute"><Typewriter text={c.aiNote} speed={12} /></span>}</> : <span className="text-mute">—</span>}</td>
                  <td>{STATUS[c.status]}</td>
                  <td>
                    <span className="flex justify-end gap-1">
                      <button className="btn btn-primary h-8 min-h-0 px-2 text-xs" disabled={c.status === "rejected"}
                        onClick={() => { if (!hr.managers?.[pos] || confirm(`Replace the current ${POSITIONS[pos].name}? They will be dismissed with severance.`)) set(hire(hr.managers?.[pos] ? fire(hr, pos, label) : hr, c, label)); }}>Hire</button>
                      <button className="btn h-8 min-h-0 px-2 text-xs" onClick={() => setCand(c.id, (x) => ({ ...x, status: "hold" }))}>Hold</button>
                      <button className="btn h-8 min-h-0 px-2 text-xs" onClick={() => setCand(c.id, (x) => ({ ...x, status: "rejected" }))}>Reject</button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="mt-3 text-sm text-mute">No candidates for this position yet. Advertise the job to receive CVs.</p>}

      {!!hr.log?.length && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-semibold text-brand">HR activity log</summary>
          <ul className="mt-2 list-disc pl-5 text-sm text-mute">{hr.log.map((l, i) => <li key={i}>{l}</li>)}</ul>
        </details>
      )}
    </section>
  );
}
