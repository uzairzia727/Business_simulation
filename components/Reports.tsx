"use client";
import Typewriter from "./Typewriter";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { OPEN, REGION_ROWS, ROLES, Report, Team, fmt, gbp } from "@/lib/sim";
import { useTeams } from "@/lib/store";
import RoleIcon, { ROLE_BAR } from "./RoleIcon";
import Competitors from "./Competitors";

type Cell = string | number;
function Table({ head, rows }: { head: string[]; rows: Cell[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="tbl">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
const Block = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="card"><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-brand-dark">{title}</h3>{children}</section>
);

export default function Reports() {
  const router = useRouter();
  const { teams, ready, save, generateAll, closeQuarter, runCompetitors } = useTeams();

  // Any company without a report is auto-filled from its role and calculated.
  useEffect(() => { if (ready && teams.some((t) => !t.report)) generateAll(teams); }, [ready, teams, generateAll]);

  if (!ready || teams.some((t) => !t.report)) return <div className="wrap py-12 text-mute">Generating reports…</div>;

  const totalSold = teams.reduce((s, t) => s + t.report!.soldU.reduce((a, b) => a + b, 0), 0) || 1;
  const total = (t: Team) => (t.history ?? []).reduce((s, h) => s + h.net, 0) + t.report!.net;
  const league = teams.map((t, i) => ({ i, r: t.report!, total: total(t) })).sort((a, b) => b.total - a.total);
  const done = teams[0].history?.length ?? 0;
  const now = `Year ${teams[0].year} · Quarter ${teams[0].quarter}`;
  const pick = (i: number) => router.push(`/team/${i + 1}#team-report`);

  return (
    <div className="wrap py-10">
      <div className="team-hide flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">{now} · {done} quarter{done === 1 ? "" : "s"} completed</p>
          <h1 className="text-3xl font-bold text-brand-dark"><Typewriter text="League table" speed={45} /></h1>
          <p className="mt-1 text-mute">Ranked by total profit across all quarters. Click a company to open its full report.</p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <button className="btn btn-accent" onClick={() => { if (confirm(`Close ${now} for all 8 companies? Results are locked in and the next quarter starts from each company's closing position.`)) closeQuarter(teams); }}>Close quarter &amp; start next</button>
          <button className="btn" onClick={() => generateAll(teams.map((x) => ({ ...x, report: null })))}>Recalculate</button>
          <button className="btn btn-primary" onClick={() => window.print()}>Save as PDF</button>
          <button className="btn btn-danger" onClick={() => { if (confirm("Restart the whole simulation from Quarter 1? All quarters and edits will be lost.")) generateAll(teams.map(() => ({ year: "", quarter: "", simCode: "", groupNo: "", d: {}, report: null }))); }}>Reset all</button>
        </div>
      </div>

      <Competitors teams={teams} save={save} run={runCompetitors} />

      <section className="card mt-6 team-hide" id="league">
        <h2 className="mb-3 font-semibold">Ranking — total profit across all quarters</h2>
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Rank</th><th>Company</th><th>Revenue</th><th>Net profit (this quarter)</th><th>Total profit</th><th>Market share</th><th>Closing cash</th></tr></thead>
            <tbody>
              {league.map(({ i, r: x, total: tot }, k) => (
                <tr key={i} onClick={() => pick(i)} className={`cursor-pointer hover:bg-slate-50`}>
                  <td><span className={`inline-grid size-7 place-items-center rounded-full text-xs font-bold ${k === 0 ? "bg-accent text-ink" : "bg-slate-100"}`}>{k + 1}</span></td>
                  <td className="!text-left"><div className="flex items-center gap-3"><RoleIcon i={i} size="size-9" /><div><button className="text-left font-semibold text-brand hover:underline" onClick={() => pick(i)}>Team {i + 1}</button>
                    <span className="block text-xs text-mute">{ROLES[i].name}{teams[i].aiRun ? " · AI" : ""}</span></div></div></td>
                  <td>{gbp(x.revenue)}</td><td className={x.net < 0 ? "text-red-700" : ""}>{gbp(x.net)}</td>
                  <td className={`font-semibold ${tot < 0 ? "text-red-700" : "text-emerald-700"}`}>{gbp(tot)}</td>
                  <td>{((x.soldU.reduce((a, b) => a + b, 0) / totalSold) * 100).toFixed(1)}%</td>
                  <td>{gbp(x.cashShown - x.overdraft)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card mt-6 team-hide" aria-labelledby="chart-h">
        <h2 id="chart-h" className="font-semibold">Net profit by company</h2>
        <p className="sr-only">Bar chart of the league table above; highest is Team {league[0].i + 1}.</p>
        <div className="mt-4 grid gap-2" aria-hidden="true">
          {league.map(({ i, r: x }) => {
            const max = Math.max(...league.map((o) => Math.abs(o.r.net))) || 1;
            return (
              <button key={i} onClick={() => pick(i)} className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-3 text-left text-sm" tabIndex={-1}>
                <span className="truncate font-medium">Team {i + 1}</span>
                <span className="h-6 rounded-md bg-slate-100"><span className={`block h-full rounded-md ${ROLE_BAR[i]} transition-[width] duration-500`} style={{ width: `${Math.max(2, (Math.abs(x.net) / max) * 100)}%` }} /></span>
                <span className="w-28 text-right font-semibold tabular-nums">{gbp(x.net)}</span>
              </button>
            );
          })}
        </div>
      </section>

    </div>
  );
}

export function TeamReport({ t, idx, controls }: { t: Team; idx: number; controls?: React.ReactNode }) {
  const r = t.report!, d = r.d;
  return (
    <div id="team-report">
      <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">StrataSim management report</p>
          <h2 className="text-2xl font-bold">Team {idx + 1}: {ROLES[idx].name}</h2>
          <p className="text-sm text-mute">Year {t.year} · Quarter {t.quarter} · Simulation {t.simCode} · Group {t.groupNo}</p>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          {controls}
        </div>
      </div>

      <div className="mt-6 grid gap-6">
        <div className="grid gap-4 sm:grid-cols-4">
          {[["Revenue", r.revenue], ["Gross profit", r.gross], ["Net profit", r.net], ["Net assets", r.netAssets]].map(([k, v]) => (
            <div key={k as string} className="card"><p className="text-xs font-semibold uppercase text-mute">{k}</p><p className="mt-1 text-2xl font-bold tabular-nums">{gbp(v as number)}</p></div>
          ))}
        </div>
        <Block title="Decisions in effect">
          <Table head={["Decision", "Product 1", "Product 2", "Product 3"]} rows={[
            ["Major improvement", d.major1, d.major2, d.major3], ["Export price (Rs)", d.p1export, d.p2export, d.p3export],
            ["Home price (Rs)", d.p1home, d.p2home, d.p3home], ["Advertising (Rs 000)", d.p1advert, d.p2advert, d.p3advert],
            ["Trade press (Rs 000)", d.p1trade, d.p2trade, d.p3trade], ["Merchandising (Rs 000)", d.p1merch, d.p2merch, d.p3merch],
            ["Assembly time (mins)", d.p1time, d.p2time, d.p3time], ["Units delivered", ...r.u.map(fmt)]]} />
        </Block>
        <AiBlock t={t} />
        <Block title="Performance by quarter">
          <Table head={["Quarter", "Revenue", "Net profit", "Closing cash", "Market share"]} rows={[
            ...(t.history ?? []).map((h) => [h.label, gbp(h.revenue), gbp(h.net), gbp(h.cash), `${(h.share * 100).toFixed(1)}%`]),
            [`Y${t.year} Q${t.quarter} (current)`, gbp(r.revenue), gbp(r.net), gbp(r.cashShown - r.overdraft), "—"]]} />
        </Block>
        <Block title="Market performance">
          <Table head={["Measure", "Product 1", "Product 2", "Product 3"]} rows={[
            ["Customer demand (units)", ...r.demandU.map(fmt)], ["Stock carried in", ...r.open.fg.map(fmt)], ["Units delivered", ...r.u.map(fmt)],
            ["Units sold", ...r.soldU.map(fmt)], ["Unsold stock (units)", ...r.unsold.map(fmt)],
            ["Lost sales — not enough stock", ...r.lostSales.map(fmt)]]} />
          <p className="mt-3 text-sm text-mute">{insight(r)}</p>
        </Block>
        <div className="grid gap-6 lg:grid-cols-2">
          <Block title="Profit and loss account">
            <Table head={["Item", "Rs"]} rows={[
              ["Sales revenue", gbp(r.revenue)], ["Materials consumed", gbp(r.materialsConsumedCost)], ["Assembly wages", gbp(r.wages)],
              ["Production overheads", gbp(r.prodOH)], ["Cost of sales", gbp(r.costOfSales)], ["Gross profit", gbp(r.gross)],
              ["Selling overheads", gbp(r.sellingOH)], ["Administration & R&D", gbp(r.adminOH)], ["Vehicle depreciation", gbp(r.depVans)],
              ["Operating profit", gbp(r.operating)], ["Interest", gbp(r.interest)], ["Tax (19%)", gbp(r.tax)],
              ["Net profit", gbp(r.net)], ["Dividends", gbp(r.dividend)], ["Transferred to reserves", gbp(r.net - r.dividend)]]} />
          </Block>
          <Block title="Overhead cost analysis">
            <Table head={["Account", "Rs"]} rows={[
              ["Advertising", gbp(r.advert)], ["Trade press", gbp(r.trade)], ["Merchandising", gbp(r.merch)],
              ["Sales salaries", gbp(r.salesSalary)], ["Sales commission", gbp(r.commission)], ["Distribution", gbp(r.transport)],
              ["Product research", gbp(r.research)], ["Management budget", gbp(r.mgmt)], ["Factory & maintenance", gbp(r.factory)],
              ["Total selling + admin", gbp(r.sellingOH + r.adminOH)]]} />
          </Block>
          <Block title="Balance sheet">
            <Table head={["Assets / liabilities", "Rs"]} rows={[
              ["Property", gbp(OPEN.property)], ["Plant & machinery (NBV)", gbp(r.machineNBV)], ["Vehicles (NBV)", gbp(r.vehicleNBV)],
              ["Raw material stock", gbp(r.matValue)], ["Finished goods stock", gbp(r.fgValue)], ["Debtors", gbp(r.debtors)], ["Cash", gbp(r.cashShown)],
              ["Creditors", gbp(r.creditors)], ["Bank overdraft", gbp(r.overdraft)], ["Share capital", gbp(OPEN.shareCapital)],
              ["Reserves", gbp(r.reserves)], ["Net assets", gbp(r.netAssets)]]} />
          </Block>
          <Block title="Cash flow statement">
            <Table head={["Activity", "Rs"]} rows={[
              ["Trading receipts", gbp(r.revenue - r.debtors)], ["Materials paid", gbp(r.materialsPurchased - r.creditors)],
              ["Wages & overheads", gbp(r.wages + r.sellingOH + r.adminOH)], ["Capital expenditure", gbp(r.capex)],
              ["Asset sale proceeds", gbp(r.assetSales)], ["Interest paid", gbp(r.interest)], ["Tax paid", gbp(r.tax)],
              ["Dividends paid", gbp(r.dividend)], ["Closing cash / (overdraft)", gbp(r.cashShown - r.overdraft)]]} />
          </Block>
          <Block title="Availability and use of resources">
            <Table head={["Resource", "Opening", "Closing"]} rows={[
              ["Machines", r.open.machines, r.machines], ["Machine hours available", "—", fmt(r.mAvail)], ["Machine hours required", "—", fmt(r.mNeed)],
              ["Van fleet", r.open.vans, r.vans], ["Assembly workers", r.open.workers, r.workers], ["Worker hours capacity", "—", fmt(r.hoursCap)],
              ["Worker hours required", "—", fmt(r.hoursReq)], ["Overtime hours", "—", fmt(r.otHours)],
              ["Salespeople", "—", fmt(r.salesForce)], ["Raw material stock (units)", fmt(r.open.materialStock), fmt(r.materialStock)]]} />
          </Block>
          <div className="grid gap-6">
            <Block title="Units delivered by region">
              <Table head={["Region", "P1", "P2", "P3"]} rows={REGION_ROWS.map((row) => [row[0], ...row.slice(1).map((k) => fmt(d[k]))])} />
            </Block>
            <Block title="Economic information">
              <Table head={["Measure", "Value"]} rows={[["GDP index last quarter", fmt(r.gdp)], ["Unemployment rate", "5.0%"],
                ["Central bank rate", "5.0%"], ["Material price next quarter (Rs/000)", fmt(r.nextMat)]]} />
            </Block>
          </div>
        </div>
        <p className="text-xs text-mute">Simulated estimate calculated from the team&apos;s decisions; not a commercial simulation engine.</p>
      </div>
    </div>
  );
}

export const SavePdf = () => (
  <button className="btn btn-primary" onClick={() => { document.body.classList.add("print-team"); window.print(); document.body.classList.remove("print-team"); }}>Save as PDF</button>
);

// One plain-language takeaway about supply vs demand.
function insight(r: Report) {
  const lost = r.lostSales.reduce((a, b) => a + b, 0), unsold = r.unsold.reduce((a, b) => a + b, 0);
  if (lost > unsold && lost > 0) return `Customers wanted ${fmt(lost)} more units than you delivered: produce more, or raise prices to earn more per unit.`;
  if (unsold > 0) return `${fmt(unsold)} units were not sold and are held as stock: deliver fewer units, cut prices or market harder.`;
  return "Supply matched customer demand.";
}

// With vs without AI agents: same quarter, same rivals, only this company's agents switched off.
function AiBlock({ t }: { t: Team }) {
  const r = t.report!, ai = t.ai;
  if (!ai) return (
    <Block title="AI agents">
      <p className="text-sm text-mute">No AI agents are switched on. Turn some on in the decision form to see what they add.</p>
    </Block>
  );
  const sum = (a: number[]) => a.reduce((x, y) => x + y, 0);
  const rows: [string, number, number, boolean][] = [
    ["Net profit", r.net, ai.off.net, true], ["Revenue", r.revenue, ai.off.revenue, true],
    ["Units sold", sum(r.soldU), ai.off.sold, false], ["Lost sales (units)", sum(r.lostSales), ai.off.lost, false],
    ["Unsold stock (units)", sum(r.unsold), ai.off.unsold, false], ["Closing cash", r.cashShown - r.overdraft, ai.off.cash, true],
  ];
  const money = (v: number, m: boolean) => (m ? gbp(v) : fmt(v));
  const diff = (a: number, b: number, m: boolean) => (a - b >= 0 ? "+" : "−") + money(Math.abs(a - b), m).replace("−", "");
  const max = Math.max(1, ...ai.each.map((e) => Math.abs(e.value)));
  const gain = r.net - ai.off.net;
  return (
    <Block title={`AI agents: with vs without (${r.agentsOn} of 8 on)`}>
      <p className={`mb-3 text-sm font-semibold ${gain >= 0 ? "text-emerald-700" : "text-red-700"}`}>
        Your agents {gain >= 0 ? "add" : "cost"} {gbp(Math.abs(gain))} net profit this quarter, after their running cost of {gbp(r.agentCost)}.
      </p>
      <Table head={["Measure", "With agents", "Without agents", "Difference"]}
        rows={rows.map(([l, a, b, m]) => [l, money(a, m), money(b, m), diff(a, b, m)])} />
      <h4 className="mt-5 text-sm font-semibold">Value of each agent</h4>
      <p className="text-xs text-mute">Net profit lost if only this agent is switched off. Red means it costs more than it earns this quarter.</p>
      <div className="mt-3 grid gap-2">
        {ai.each.map((e) => (
          <div key={e.id} className="grid grid-cols-[9.5rem_1fr_6.5rem] items-center gap-3 text-sm">
            <span className="truncate">{e.name}</span>
            <span className="h-4 rounded bg-slate-100"><span className={`block h-full rounded ${e.value >= 0 ? "bg-brand" : "bg-red-500"}`} style={{ width: `${Math.max(2, (Math.abs(e.value) / max) * 100)}%` }} /></span>
            <span className={`text-right font-semibold tabular-nums ${e.value < 0 ? "text-red-700" : ""}`}>{e.value >= 0 ? "+" : "−"}{gbp(Math.abs(e.value)).replace("−", "")}</span>
          </div>
        ))}
      </div>
    </Block>
  );
}
