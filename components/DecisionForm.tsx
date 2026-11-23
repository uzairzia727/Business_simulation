"use client";
import Typewriter from "./Typewriter";
import MarketingAgent from "./MarketingAgent";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AGENTS, AGENT_COST, ALL_IDS, FIELDS, GROUP_TITLES, Group, REGION_ROWS, ROLES, Team, autofill, emptyTeam, isBlank, roleData } from "@/lib/sim";
import { useTeams } from "@/lib/store";
import { SavePdf, TeamReport } from "./Reports";

const META: [keyof Team, string][] = [["year", "Year"], ["quarter", "Quarter (1–4)"], ["simCode", "Simulation code"], ["groupNo", "Group number"]];

export default function DecisionForm({ idx }: { idx: number }) {
  const router = useRouter();
  const { teams, ready, save, generateAll } = useTeams();
  const [msg, setMsg] = useState("");
  const [showErr, setShowErr] = useState(false);
  const role = ROLES[idx];
  // A team that has never been touched starts pre-filled from its strategist role.
  const t = ready && !teams[idx].touched ? autofill(teams[idx], idx) : teams[idx];

  const update = (patch: Partial<Team>) => {
    const next = [...teams];
    next[idx] = { ...t, ...patch, touched: true, report: null };
    save(next);
    setMsg("Saved");
  };
  const setD = (id: string, v: string) => update({ d: { ...t.d, [id]: v } });
  const missing = ALL_IDS.filter((id) => isBlank(t.d[id])).concat(META.filter(([k]) => isBlank(t[k])).map(([k]) => k));
  const bad = (id: string) => showErr && isBlank(id in t.d ? t.d[id] : t[id as keyof Team]);

  const generate = () => {
    if (missing.length) { setShowErr(true); setMsg(`${missing.length} field(s) are blank — fill them or use “Reset to role strategy”.`); return; }
    // Every company competes in one market, so all eight are recalculated together.
    generateAll(teams.map((x, i) => (i === idx ? t : x)));
    setMsg("Report generated below");
    setTimeout(() => document.getElementById("team-report")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // Opened from the league table: jump to this team's report once data has loaded.
  useEffect(() => { if (ready && location.hash === "#team-report") document.getElementById("team-report")?.scrollIntoView(); }, [ready]);

  if (!ready) return <div className="wrap py-12 text-mute">Loading…</div>;

  const groups = (Object.keys(GROUP_TITLES) as Group[]).map((g) => [g, FIELDS.filter((f) => f[2] === g)] as const);

  return (
    <div className="wrap py-10">
      <nav className="text-sm text-mute"><Link href="/" className="hover:underline">Home</Link> / Team {idx + 1}</nav>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Team {idx + 1} · Company {idx + 1}</p>
          <h1 className="text-3xl font-bold text-brand-dark"><Typewriter text={role.name} speed={45} /></h1>
          <p className="mt-1 text-mute">{role.focus}</p>
        </div>
        <p role="status" aria-live="polite" className="text-sm font-medium text-emerald-700">{msg}</p>
      </div>

      {t.aiRun && (
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm">
          <p className="font-semibold text-brand-dark">This company is run by an AI competitor.</p>
          <p className="mt-1 text-slate-700">{t.aiNote ? `Its latest reasoning: ${t.aiNote}` : "It makes its decisions from the League table page."} Switch it to Human there to take over.</p>
        </div>
      )}
      <div className="no-print sticky top-16 z-30 mt-6 flex flex-wrap gap-2 rounded-2xl border border-line bg-white/90 p-3 shadow-sm backdrop-blur">
        <button className="btn btn-primary" onClick={generate}>Generate report</button>
        <button className="btn btn-accent" onClick={() => { generateAll(teams.map((x, i) => (i === idx ? t : x))); router.push("/reports"); }}>Auto-generate all 8 reports</button>
        <button className="btn" onClick={() => { update({ d: roleData(idx) }); setShowErr(false); setMsg(`${role.name} strategy restored`); }}>Reset to role strategy</button>
        <button className="btn btn-danger ml-auto" onClick={() => { if (confirm(`Clear every decision for Team ${idx + 1}?`)) { const next = [...teams]; next[idx] = { ...emptyTeam(), touched: true }; save(next); setMsg("Cleared"); } }}>Clear</button>
      </div>

      <MarketingAgent t={t} idx={idx} apply={(d) => { update({ d: { ...t.d, ...d } }); setMsg("Marketing plan applied"); }} />

      <section className="card mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">AI agents</h2>
            <p className="text-sm text-mute">Each agent costs Rs {AGENT_COST.toLocaleString("en-PK")} per quarter. The report shows what they earn back.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn" onClick={() => update({ agents: Object.fromEntries(AGENTS.map((a) => [a.id, true])) })}>All on</button>
            <button className="btn" onClick={() => update({ agents: {} })}>All off</button>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {AGENTS.map((a) => {
            const checked = !!t.agents?.[a.id];
            return (
              <label key={a.id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${checked ? "border-brand bg-blue-50" : "border-line hover:bg-slate-50"}`}>
                <input type="checkbox" className="mt-1 size-4 accent-brand" checked={checked}
                  onChange={(e) => update({ agents: { ...t.agents, [a.id]: e.target.checked } })} />
                <span><span className="block text-sm font-semibold">{a.name}</span><span className="block text-xs leading-5 text-mute">{a.does}</span></span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="card mt-6">
        <h2 className="font-semibold">Simulation data</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {META.map(([k, label]) => (
            <label key={k} className="text-sm font-medium text-slate-700">{label}
              <input className={`input mt-1 ${bad(k) ? "border-red-500 bg-red-50" : ""}`} value={String(t[k] ?? "")} onChange={(e) => update({ [k]: e.target.value })} />
            </label>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {groups.map(([g, fs]) => (
          <section key={g} className={`card ${g === "marketing" ? "lg:col-span-2" : ""}`}>
            <h2 className="font-semibold">{GROUP_TITLES[g]}</h2>
            <div className={`mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2 ${g === "marketing" ? "lg:grid-cols-3" : ""}`}>
              {fs.map(([id, label]) => (
                <label key={id} className="text-sm text-slate-700">{label}
                  <input type="number" step="any" inputMode="decimal" className={`input mt-1 ${bad(id) ? "border-red-500 bg-red-50" : ""}`}
                    value={t.d[id] ?? ""} onChange={(e) => setD(id, e.target.value)} aria-invalid={bad(id) || undefined} />
                </label>
              ))}
            </div>
          </section>
        ))}
        <section className="card lg:col-span-2">
          <h2 className="font-semibold">Distribution — units delivered</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Region</th><th>Product 1</th><th>Product 2</th><th>Product 3</th></tr></thead>
              <tbody>
                {REGION_ROWS.map((r) => (
                  <tr key={r[0]}><td className="font-medium">{r[0]}</td>
                    {r.slice(1).map((id, k) => (
                      <td key={id}><input type="number" inputMode="numeric" aria-label={`${r[0]} product ${k + 1}`}
                        className={`input ml-auto max-w-32 text-right ${bad(id) ? "border-red-500 bg-red-50" : ""}`} value={t.d[id] ?? ""} onChange={(e) => setD(id, e.target.value)} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
      {t.report && (
        <div className="mt-12 border-t-4 border-brand pt-8">
          <TeamReport t={t} idx={idx} controls={<><button className="btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to decisions</button><SavePdf /></>} />
        </div>
      )}
    </div>
  );
}
