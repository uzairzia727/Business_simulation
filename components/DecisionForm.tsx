"use client";
import { useIndustry } from "@/lib/useIndustry";
import MarketingAgent from "./MarketingAgent";
import HRPanel from "./HRPanel";
import WhatIf from "./WhatIf";
import { Announcement } from "./Instructor";
import { PolicyNotice } from "./Regulator";
import RoleIcon from "./RoleIcon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AGENTS, AGENT_COST, ALL_IDS, FIELDS, Group, REGION_ROWS, ROLES, Team, autofill, emptyTeam, gbp, isBlank, roleData } from "@/lib/sim";
import { useTeams } from "@/lib/store";
import { SavePdf, TeamReport } from "./Reports";

const META: [keyof Team, string][] = [["year", "Year"], ["quarter", "Quarter (1–4)"], ["simCode", "Simulation code"], ["groupNo", "Group number"]];

// Company portal sections. Each decision group lives in one section, so a team works one department at a time.
const SECTIONS = [
  { id: "dashboard", name: "Dashboard", icon: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" },
  { id: "sales", name: "Sales & marketing", groups: ["marketing"], icon: "M3 11l18-8v18L3 13v-2Zm4 3v5h3v-4" },
  { id: "operations", name: "Operations", groups: ["operations"], icon: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" },
  { id: "people", name: "People", groups: ["personnel"], icon: "M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0" },
  { id: "finance", name: "Finance", groups: ["finance", "management"], icon: "M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6" },
  { id: "strategy", name: "Strategy & AI", icon: "M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.5-.8L12 3Z" },
  { id: "report", name: "Quarterly report", icon: "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h6" },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

export default function DecisionForm({ idx }: { idx: number }) {
  const { teams, ready, save, generateAll, econ } = useTeams();
  const [msg, setMsg] = useState("");
  const [showErr, setShowErr] = useState(false);
  const [sec, setSec] = useState<SectionId>("dashboard");
  const role = ROLES[idx];
  const { t: w, ind, company } = useIndustry();
  // A team that has never been touched starts pre-filled from its strategist role.
  const t = ready && !teams[idx].touched ? autofill(teams[idx], idx) : teams[idx];

  // Deep links: /team/3#finance opens that section; the old #team-report link opens the report.
  useEffect(() => {
    const h = location.hash.slice(1);
    if (h === "team-report") setSec("report");
    else if (SECTIONS.some((s) => s.id === h)) setSec(h as SectionId);
  }, []);
  const go = (id: SectionId) => { setSec(id); history.replaceState(null, "", `#${id}`); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const update = (patch: Partial<Team>) => {
    // While the instructor has locked decisions, nothing on this page can change them.
    if (econ.locked) { setMsg("Decisions are locked by the instructor."); return false; }
    const next = [...teams];
    next[idx] = { ...t, ...patch, touched: true, report: null };
    save(next);
    setMsg("Saved");
    return true;
  };
  const setD = (id: string, v: string) => update({ d: { ...t.d, [id]: v }, ...(/^p[123](advert|trade|merch)$/.test(id) ? { channels: null } : {}) });
  const missing = ALL_IDS.filter((id) => isBlank(t.d[id])).concat(META.filter(([k]) => isBlank(t[k])).map(([k]) => k));
  const bad = (id: string) => showErr && isBlank(id in t.d ? t.d[id] : t[id as keyof Team]);

  const generate = () => {
    if (missing.length) { setShowErr(true); setMsg(`${missing.length} field(s) are blank — fill them or use “Reset to role strategy”.`); return; }
    // Every company competes in one market, so all eight are recalculated together.
    generateAll(teams.map((x, i) => (i === idx ? t : x)));
    setMsg("Report generated");
    go("report");
  };

  if (!ready) return <div className="wrap py-12 text-mute">Loading…</div>;

  const name = company(idx);
  const fieldsOf = (g: Group) => FIELDS.filter((f) => f[2] === g);
  // A plain function, not a component: a component defined here would remount inputs on every keystroke and lose focus.
  const fields = (g: Group, title: string) => (
    <section className="card">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 grid gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {fieldsOf(g).map(([id, label]) => (
          <label key={id} className="text-sm text-slate-700">{w(label)}
            <input type="number" step="any" inputMode="decimal" className={`input mt-1 ${bad(id) ? "border-red-500 bg-red-50" : ""}`}
              value={t.d[id] ?? ""} onChange={(e) => setD(id, e.target.value)} aria-invalid={bad(id) || undefined} />
          </label>
        ))}
      </div>
    </section>
  );
  const sectionName = (id: SectionId) => id === "operations" && ind.name === "Real estate" ? "Projects & construction" : SECTIONS.find((s) => s.id === id)!.name;

  return (
    <div className="wrap py-8">
      {/* Company header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <RoleIcon i={idx} size="size-14" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-brand">Team {idx + 1} · {ind.name} · Year {t.year || "—"} Q{t.quarter || "—"}</p>
            <h1 className="text-3xl text-ink">{name}</h1>
            <p className="text-sm text-mute">Strategy: <span className="font-medium text-ink">{role.name}</span> — {role.focus}</p>
          </div>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <p role="status" aria-live="polite" className="text-sm font-medium text-emerald-700">{msg}</p>
          <button className="btn btn-primary" onClick={generate}>Generate report</button>
        </div>
      </div>

      <Announcement econ={econ} />
      <PolicyNotice team={teams[idx]} econ={econ} />
      {t.aiRun && (
        <div className="mt-4 rounded-md border border-line bg-[#eaf0ec] p-4 text-sm">
          <p className="font-semibold">This company is run by an AI competitor.</p>
          <p className="mt-1 text-slate-700">{t.aiNote ? `Its latest reasoning: ${t.aiNote}` : "It makes its decisions from the Instructor page."} Switch it to Human there to take over.</p>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[13rem_1fr]">
        {/* Sidebar (desktop) / scrolling tabs (mobile) */}
        <nav aria-label="Company sections" className="no-print lg:sticky lg:top-20 lg:self-start">
          <ul className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {SECTIONS.map((s) => (
              <li key={s.id} className="shrink-0">
                <button type="button" onClick={() => go(s.id)} aria-current={sec === s.id ? "page" : undefined}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium transition ${sec === s.id ? "bg-brand text-white" : "text-ink hover:bg-stone-100"}`}>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={s.icon} /></svg>
                  <span className="whitespace-nowrap">{sectionName(s.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">
          <fieldset disabled={!!econ.locked} className="contents">
            {sec === "dashboard" && <Dashboard t={t} idx={idx} teams={teams} missing={missing.length} go={go} />}

            {sec === "sales" && (
              <div className="grid gap-6">
                {fields("marketing", "Prices, marketing & product improvements")}
                <MarketingAgent t={t} idx={idx} apply={(d, plan) => { if (update({ d: { ...t.d, ...d }, channels: plan })) setMsg("Channel plan applied"); }} />
              </div>
            )}

            {sec === "operations" && (
              <div className="grid gap-6">
                {fields("operations", ind.name === "Real estate" ? "Sales force, research, land & construction" : "Sales force, research, materials & production")}
                <section className="card">
                  <h2 className="font-semibold">{w("Units")} delivered by market</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="tbl">
                      <thead><tr><th>Market</th><th>{w("Product 1")}</th><th>{w("Product 2")}</th><th>{w("Product 3")}</th></tr></thead>
                      <tbody>
                        {REGION_ROWS.map((r) => (
                          <tr key={r[0]}><td className="font-medium">{w(r[0])}</td>
                            {r.slice(1).map((id, k) => (
                              <td key={id}><input type="number" inputMode="numeric" aria-label={`${w(r[0])} ${w(`Product ${k + 1}`)}`}
                                className={`input ml-auto max-w-32 text-right ${bad(id) ? "border-red-500 bg-red-50" : ""}`} value={t.d[id] ?? ""} onChange={(e) => setD(id, e.target.value)} /></td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}

            {sec === "people" && (
              <div className="grid gap-6">
                {fields("personnel", w("Workers, wages & training"))}
                <HRPanel t={t} idx={idx} update={(patch) => { if (update(patch)) setMsg("HR updated"); }} />
              </div>
            )}

            {sec === "finance" && (
              <div className="grid gap-6">
                {fields("finance", "Credit, dividends & fleet")}
                {fields("management", "Management budget & information")}
                <section className="card">
                  <h2 className="font-semibold">Simulation details</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {META.map(([k, label]) => (
                      <label key={k} className="text-sm font-medium text-slate-700">{label}
                        <input className={`input mt-1 ${bad(k) ? "border-red-500 bg-red-50" : ""}`} value={String(t[k] ?? "")} onChange={(e) => update({ [k]: e.target.value })} />
                      </label>
                    ))}
                  </div>
                </section>
                <section className="card">
                  <h2 className="font-semibold">Start again</h2>
                  <p className="text-sm text-mute">Restore this company&apos;s strategy defaults, or clear every decision.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button className="btn" disabled={!!econ.locked} onClick={() => { if (update({ d: roleData(idx) })) { setShowErr(false); setMsg(`${role.name} strategy restored`); } }}>Reset to role strategy</button>
                    <button className="btn btn-danger" disabled={!!econ.locked} onClick={() => { if (confirm(`Clear every decision for ${name}?`)) { const next = [...teams]; next[idx] = { ...emptyTeam(), touched: true }; save(next); setMsg("Cleared"); } }}>Clear all decisions</button>
                  </div>
                </section>
              </div>
            )}

            {sec === "strategy" && (
              <div className="grid gap-6">
                <WhatIf teams={teams} idx={idx} t={t} econ={econ} apply={(d, label) => { if (update({ d, ...(/marketing/.test(label) ? { channels: null } : {}) })) setMsg(`Applied: ${label}`); }} />
                <section className="card">
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
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {AGENTS.map((a) => {
                      const checked = !!t.agents?.[a.id];
                      return (
                        <label key={a.id} className={`flex cursor-pointer gap-3 rounded-md border p-3 transition ${checked ? "border-brand bg-[#eaf0ec]" : "border-line hover:bg-stone-50"}`}>
                          <input type="checkbox" className="mt-1 size-4 accent-brand" checked={checked} onChange={(e) => update({ agents: { ...t.agents, [a.id]: e.target.checked } })} />
                          <span><span className="block text-sm font-semibold">{a.name}</span><span className="block text-xs leading-5 text-mute">{a.does}</span></span>
                        </label>
                      );
                    })}
                  </div>
                </section>
              </div>
            )}
          </fieldset>

          {sec === "report" && (t.report
            ? <TeamReport t={t} idx={idx} controls={<SavePdf />} />
            : <div className="card text-center"><p className="font-semibold">No report for these decisions yet</p><p className="mt-1 text-sm text-mute">Decisions changed since the last report. Generate it to see this quarter&apos;s accounts.</p><button className="btn btn-primary mt-4" onClick={generate}>Generate report</button></div>)}
        </div>
      </div>
    </div>
  );
}

// Company dashboard: key numbers, standing in the market, and what needs attention this quarter.
function Dashboard({ t, idx, teams, missing, go }: { t: Team; idx: number; teams: Team[]; missing: number; go: (s: SectionId) => void }) {
  const { t: w } = useIndustry();
  const r = t.report;
  if (!r) return (
    <div className="card">
      <h2 className="font-semibold">Welcome to your company portal</h2>
      <p className="mt-1 text-sm text-mute">Work through each department in the menu, then generate this quarter&apos;s report to see your results here.</p>
      <ol className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {(["sales", "operations", "people", "finance", "strategy"] as SectionId[]).map((s, k) => (
          <li key={s}><button className="flex w-full items-center gap-3 rounded-md border border-line p-3 text-left hover:border-brand" onClick={() => go(s)}><span className="grid size-7 place-items-center rounded-full border border-brand font-serif text-xs text-brand">{k + 1}</span>{SECTIONS.find((x) => x.id === s)!.name}</button></li>
        ))}
      </ol>
    </div>
  );
  const total = (x: Team) => (x.history ?? []).reduce((s, h) => s + h.net, 0) + (x.report?.net ?? 0);
  const rank = 1 + teams.filter((x, i) => i !== idx && x.report && total(x) > total(t)).length;
  const sold = r.soldU.reduce((a, b) => a + b, 0);
  const share = sold / (teams.reduce((s, x) => s + (x.report?.soldU.reduce((a, b) => a + b, 0) ?? 0), 0) || 1);
  const cash = r.cashShown - r.overdraft;
  const lost = r.lostSales.reduce((a, b) => a + b, 0), unsold = r.unsold.reduce((a, b) => a + b, 0);
  const alerts: [string, SectionId][] = [
    ...(missing ? [[`${missing} decision field(s) are blank.`, "finance"] as [string, SectionId]] : []),
    ...(cash < 0 ? [[`Cash is overdrawn by ${gbp(-cash)}: interest is being charged.`, "finance"] as [string, SectionId]] : []),
    ...(lost > 0 ? [[`${lost.toLocaleString("en-PK")} sales lost: customers wanted more than you delivered.`, "operations"] as [string, SectionId]] : []),
    ...(unsold > 0 ? [[`${unsold.toLocaleString("en-PK")} ${w("Units").toLowerCase()} unsold and carried as stock.`, "operations"] as [string, SectionId]] : []),
    ...r.notices.map((n) => [w(n), "sales"] as [string, SectionId]),
    ...(r.leavers > 0 ? [[`${r.leavers} ${w("workers")} expected to leave this quarter.`, "people"] as [string, SectionId]] : []),
  ];
  const kpis: [string, string, string?][] = [
    ["Revenue", gbp(r.revenue)], ["Net profit", gbp(r.net), r.net < 0 ? "text-red-700" : ""], ["Cash", gbp(cash), cash < 0 ? "text-red-700" : ""],
    ["Market share", `${(share * 100).toFixed(1)}%`], ["League position", `${rank} of 8`], ["KSF score", t.ksf ? `${t.ksf.overall} / 100` : "—"],
  ];
  return (
    <div className="grid gap-6">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
        {kpis.map(([k, v, c]) => <div key={k} className="bg-white p-4"><dt className="text-xs text-mute">{k}</dt><dd className={`mt-1 font-serif text-2xl font-semibold tabular-nums ${c ?? ""}`}>{v}</dd></div>)}
      </dl>
      <section className="card">
        <h2 className="font-semibold">Needs attention</h2>
        {alerts.length ? (
          <ul className="mt-3 grid gap-2">
            {alerts.map(([a, s]) => (
              <li key={a} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-line px-3 py-2 text-sm">
                <span>{a}</span><button className="text-sm font-semibold text-brand hover:underline" onClick={() => go(s)}>Go to {SECTIONS.find((x) => x.id === s)!.name}</button>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-mute">Nothing urgent. Use Strategy &amp; AI to stress-test your plan against rival moves.</p>}
      </section>
      <section className="card">
        <h2 className="font-semibold">Sales by {w("product").toLowerCase()}</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>{w("Product")}</th><th>Demand</th><th>Sold</th><th>Unsold</th><th>Lost sales</th></tr></thead>
            <tbody>{[0, 1, 2].map((p) => <tr key={p}><td className="!text-left font-medium">{w(`Product ${p + 1}`)}</td><td>{r.demandU[p].toLocaleString("en-PK")}</td><td>{r.soldU[p].toLocaleString("en-PK")}</td><td>{r.unsold[p].toLocaleString("en-PK")}</td><td>{r.lostSales[p].toLocaleString("en-PK")}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="mt-3 flex flex-wrap gap-2"><button className="btn" onClick={() => go("report")}>Open full quarterly report</button><Link className="btn" href="/reports">League table</Link></div>
      </section>
    </div>
  );
}
