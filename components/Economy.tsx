"use client";
import { Econ, SCENARIOS, ScenarioId, Team, gbp } from "@/lib/sim";
import Typewriter from "./Typewriter";
import { INDUSTRIES, IndustryId, industryOf } from "@/lib/industry";

const IDS = Object.keys(SCENARIOS) as ScenarioId[];
const pct = (x: number, dp = 1) => `${(x * 100).toFixed(dp)}%`;

// Economic scenario for the current quarter (set by the organiser) plus the economic report for the whole market.
export default function Economy({ teams, econ, setEcon }: { teams: Team[]; econ: Econ; setEcon: (e: Econ) => void }) {
  const s = SCENARIOS[econ.scenario];
  const rs = teams.map((t) => t.report!);
  const sum = (f: (r: (typeof rs)[number]) => number) => rs.reduce((a, r) => a + f(r), 0);
  const demand = sum((r) => r.demandU.reduce((a, b) => a + b, 0));
  const sold = sum((r) => r.soldU.reduce((a, b) => a + b, 0));
  const lost = sum((r) => r.lostSales.reduce((a, b) => a + b, 0));
  const unsold = sum((r) => r.unsold.reduce((a, b) => a + b, 0));
  const revenue = sum((r) => r.revenue), profit = sum((r) => r.net);
  const losing = rs.filter((r) => r.net < 0).length;
  const overdrawn = rs.filter((r) => r.overdraft > 0).length;
  const avgPrice = [1, 2, 3].map((p) => Math.round(teams.reduce((a, t) => a + Number(t.d[`p${p}home`] || 0), 0) / teams.length));
  const random = () => { const pool = IDS.filter((id) => id !== econ.scenario); setEcon({ ...econ, scenario: pool[Math.floor(Math.random() * pool.length)] }); };

  // Short written report built from the numbers (no AI call, so it is free and always available).
  const advice: Record<ScenarioId, string> = {
    normal: "Conditions favour steady plans: balance price, marketing and capacity.",
    boom: "Companies that deliver enough stock capture the extra demand; watch for lost sales.",
    recession: "Customers chase low prices, so cost control and sharper pricing matter most.",
    inflation: "Rising material and wage costs squeeze margins; consider price rises and buying materials early.",
    rateShock: "Overdrafts are expensive: protect cash, tighten credit and delay big purchases.",
  };
  const text = `${s.name}. ${s.desc} Industry demand is ${demand.toLocaleString("en-PK")} units and ${sold.toLocaleString("en-PK")} were sold (${pct(sold / (demand || 1), 0)} of demand). `
    + `${lost ? `${lost.toLocaleString("en-PK")} sales were lost to stock shortages` : "No sales were lost to shortages"} and ${unsold.toLocaleString("en-PK")} units went unsold. `
    + `Total industry profit is ${gbp(profit)}${losing ? `, with ${losing} compan${losing === 1 ? "y" : "ies"} making a loss` : ""}${overdrawn ? `, and ${overdrawn} compan${overdrawn === 1 ? "y is" : "ies are"} using an overdraft at ${pct(s.rate)} interest` : ""}. ${advice[econ.scenario]}`;

  return (
    <section className="card mt-6" aria-labelledby="econ-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="econ-h" className="font-semibold">Economy this quarter</h2>
          <p className="max-w-2xl text-sm text-mute">The organiser sets the economic scenario at the start of each quarter. It applies to all 8 companies and stays in place until changed.</p>
        </div>
        <button className="btn no-print" onClick={random}>Random scenario</button>
      </div>

      <div className="no-print mt-4 rounded-md border border-line bg-stone-50 p-3">
        <label className="text-sm font-semibold" htmlFor="industry">Industry</label>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <select id="industry" className="input w-56" value={econ.industry ?? "manufacturing"}
            onChange={(e) => { if (confirm(`Switch the whole game to ${INDUSTRIES[e.target.value as IndustryId].name}? Products, markets, the regulator and market behaviour change for all 8 companies. Best done at the start of a game.`)) setEcon({ ...econ, industry: e.target.value }); }}>
            {(Object.keys(INDUSTRIES) as IndustryId[]).map((id) => <option key={id} value={id}>{INDUSTRIES[id].name}</option>)}
          </select>
          <p className="min-w-0 flex-1 text-sm text-mute">{industryOf(econ.industry).blurb} Products: {industryOf(econ.industry).products.join(", ")}. Regulator: {industryOf(econ.industry).regulator}.</p>
        </div>
      </div>

      <div className="no-print mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5" role="radiogroup" aria-label="Economic scenario">
        {IDS.map((id) => {
          const on = id === econ.scenario;
          return (
            <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setEcon({ ...econ, scenario: id })}
              className={`rounded-md border p-3 text-left transition ${on ? "border-brand bg-[#eaf0ec]" : "border-line hover:bg-stone-50"}`}>
              <span className="block text-sm font-semibold">{SCENARIOS[id].name}</span>
              <span className="mt-1 block text-xs leading-5 text-mute">{SCENARIOS[id].desc}</span>
            </button>
          );
        })}
      </div>

      <h3 className="mt-6 font-serif text-lg font-semibold">Economic report</h3>
      <dl className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line text-sm sm:grid-cols-4">
        {[
          ["GDP index", econ.gdp.toFixed(1)], ["GDP growth (quarter)", pct(s.growth)], ["Inflation (annual)", pct(s.inflation)], ["Central bank rate", pct(s.rate)],
          ["Unemployment", pct(s.unemployment)], ["Market demand vs normal", `${s.demand >= 1 ? "+" : ""}${pct(s.demand - 1, 0)}`],
          ["Material costs vs normal", `${s.materials >= 1 ? "+" : ""}${pct(s.materials - 1, 0)}`], ["Wages vs normal", `${s.wages >= 1 ? "+" : ""}${pct(s.wages - 1, 0)}`],
          ["Industry demand (units)", demand.toLocaleString("en-PK")], ["Units sold", sold.toLocaleString("en-PK")],
          ["Industry revenue", gbp(revenue)], ["Average home prices P1/P2/P3", avgPrice.map((p) => `Rs ${p}`).join(" / ")],
        ].map(([k, v]) => (
          <div key={k} className="bg-white p-3"><dt className="text-xs text-mute">{k}</dt><dd className="mt-0.5 font-semibold tabular-nums">{v}</dd></div>
        ))}
      </dl>
      <p className="mt-4 rounded-md border-l-2 border-brand bg-stone-50 px-4 py-3 text-sm leading-6"><Typewriter key={text} text={text} speed={8} /></p>
    </section>
  );
}
