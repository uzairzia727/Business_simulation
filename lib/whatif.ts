import { ALL_IDS, Econ, Team, Values, autofill, calculateAll } from "./sim";

// Competitive "what if" scenarios: change what rivals do, keep everything else, and see the effect on one company.
const PRICES = ["p1home", "p1export", "p2home", "p2export", "p3home", "p3export"];
const PROMO = [1, 2, 3].flatMap((p) => [`p${p}advert`, `p${p}trade`, `p${p}merch`]);
const SALES = ["exportSales", "southSales", "westSales", "northSales"];
const RESEARCH = ["research1", "research2", "research3"];
const scale = (d: Values, ids: string[], k: number, add = 0) => ({ ...d, ...Object.fromEntries(ids.map((id) => [id, String(Math.max(0, Math.round((Number(d[id]) || 0) * k + add)))])) });

export const RIVAL_MOVES = [
  { id: "cut", name: "Rivals cut prices 10%", apply: (d: Values) => scale(d, PRICES, 0.9) },
  { id: "raise", name: "Rivals raise prices 10%", apply: (d: Values) => scale(d, PRICES, 1.1) },
  { id: "war", name: "Price war: the market leader cuts 20%", leaderOnly: true, apply: (d: Values) => scale(d, PRICES, 0.8) },
  { id: "promo", name: "Rivals double marketing", apply: (d: Values) => scale(d, PROMO, 2) },
  { id: "sales", name: "Rivals add 2 salespeople per region", apply: (d: Values) => scale(d, SALES, 1, 2) },
  { id: "rnd", name: "Rivals double research", apply: (d: Values) => scale(d, RESEARCH, 2) },
] as const;

// Responses this company could make; the preview tests each one and reports the best.
export const MY_RESPONSES = [
  { id: "hold", name: "Hold your current plan", apply: (d: Values) => d },
  { id: "match", name: "Cut your prices 10%", apply: (d: Values) => scale(d, PRICES, 0.9) },
  { id: "premium", name: "Raise your prices 5%", apply: (d: Values) => scale(d, PRICES, 1.05) },
  { id: "promo", name: "Increase marketing 50%", apply: (d: Values) => scale(d, PROMO, 1.5) },
  { id: "sales", name: "Add 1 salesperson per region", apply: (d: Values) => scale(d, SALES, 1, 1) },
] as const;

type Out = { net: number; revenue: number; sold: number; share: number; lost: number; unsold: number };

export function whatIf(teams: Team[], idx: number, econ: Econ) {
  const base = teams.map((t, i) => autofill(t, i));
  const clean = (t: Team) => ({ ...t, d: Object.fromEntries(ALL_IDS.map((id) => [id, t.d[id] ?? ""])) });
  const run = (all: Team[]): Out => {
    const rs = calculateAll(all.map(clean), econ);
    const total = rs.reduce((s, r) => s + r.soldU.reduce((a, b) => a + b, 0), 0) || 1;
    const r = rs[idx], sold = r.soldU.reduce((a, b) => a + b, 0);
    return { net: r.net, revenue: r.revenue, sold, share: sold / total, lost: r.lostSales.reduce((a, b) => a + b, 0), unsold: r.unsold.reduce((a, b) => a + b, 0) };
  };
  const now = run(base);
  // Market leader = highest net profit among rivals under current plans.
  const rs0 = calculateAll(base.map(clean), econ);
  const leader = rs0.map((r, i) => ({ i, net: r.net })).filter((x) => x.i !== idx).sort((a, b) => b.net - a.net)[0].i;

  const rows = RIVAL_MOVES.map((m) => {
    const rivals = base.map((t, i) => (i === idx || ("leaderOnly" in m && i !== leader) ? t : { ...t, d: m.apply(t.d) }));
    const responses = MY_RESPONSES.map((r) => ({ id: r.id, name: r.name, out: run(rivals.map((t, i) => (i === idx ? { ...t, d: r.apply(t.d) } : t))) }));
    const hold = responses[0].out;
    const best = responses.reduce((b, r) => (r.out.net > b.out.net ? r : b));
    return { id: m.id, name: m.name, hold, best };
  });
  return { now, leader, rows };
}
