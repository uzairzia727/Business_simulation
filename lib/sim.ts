import { industryOf } from "./industry";
import { channelMix, type PlanRow } from "./marketing";
export type Group = "marketing" | "operations" | "finance" | "personnel" | "management";
export type Field = [id: string, label: string, group: Group, benchmark: number];
export type Values = Record<string, string>;

export const TEAMS = 8;
export const GROUP_TITLES: Record<Group, string> = {
  marketing: "Marketing & products",
  operations: "Operations & production",
  finance: "Market & finance",
  personnel: "Personnel",
  management: "Management",
};

export const REGION_ROWS = [
  ["Export", "p1exportQty", "p2exportQty", "p3exportQty"],
  ["South", "p1southQty", "p2southQty", "p3southQty"],
  ["West", "p1westQty", "p2westQty", "p3westQty"],
  ["North", "p1northQty", "p2northQty", "p3northQty"],
] as const;

export const FIELDS: Field[] = [
  ["major1", "Major improvement P1 (0/1)", "marketing", 0],
  ["major2", "Major improvement P2 (0/1)", "marketing", 0],
  ["major3", "Major improvement P3 (0/1)", "marketing", 1],
  ["p1export", "Export price P1 (Rs)", "marketing", 170],
  ["p1home", "Home price P1 (Rs)", "marketing", 150],
  ["p2export", "Export price P2 (Rs)", "marketing", 290],
  ["p2home", "Home price P2 (Rs)", "marketing", 270],
  ["p3export", "Export price P3 (Rs)", "marketing", 580],
  ["p3home", "Home price P3 (Rs)", "marketing", 550],
  ["p1advert", "Advertising P1 (Rs 000)", "marketing", 12],
  ["p2advert", "Advertising P2 (Rs 000)", "marketing", 14],
  ["p3advert", "Advertising P3 (Rs 000)", "marketing", 20],
  ["p1trade", "Trade press P1 (Rs 000)", "marketing", 10],
  ["p2trade", "Trade press P2 (Rs 000)", "marketing", 10],
  ["p3trade", "Trade press P3 (Rs 000)", "marketing", 18],
  ["p1merch", "Merchandising P1 (Rs 000)", "marketing", 8],
  ["p2merch", "Merchandising P2 (Rs 000)", "marketing", 8],
  ["p3merch", "Merchandising P3 (Rs 000)", "marketing", 10],
  ["p1time", "Assembly time P1 (mins)", "marketing", 118],
  ["p2time", "Assembly time P2 (mins)", "marketing", 165],
  ["p3time", "Assembly time P3 (mins)", "marketing", 330],
  ["exportSales", "Salespeople: Export", "operations", 13],
  ["southSales", "Salespeople: South", "operations", 1],
  ["westSales", "Salespeople: West", "operations", 1],
  ["northSales", "Salespeople: North", "operations", 3],
  ["research1", "Research P1 (Rs 000)", "operations", 15],
  ["research2", "Research P2 (Rs 000)", "operations", 15],
  ["research3", "Research P3 (Rs 000)", "operations", 15],
  ["rawUnits", "Raw material units to order", "operations", 12000],
  ["supplier", "Supplier number (1–3)", "operations", 2],
  ["deliveries", "Number of deliveries", "operations", 6],
  ["machinesOrder", "Machines to buy", "operations", 1],
  ["machinesSell", "Machines to sell", "operations", 0],
  ["maintenance", "Contract maintenance hours", "operations", 50],
  ["dividend", "Dividend (pence/share)", "finance", 4],
  ["credit", "Days credit allowed", "finance", 30],
  ["vansBuy", "Vans to buy", "finance", 0],
  ["vansSell", "Vans to sell", "finance", 0],
  ["infoCompanies", "Info on other companies (0/1)", "finance", 1],
  ["marketShares", "Info on market shares (0/1)", "finance", 0],
  ["recruitSales", "Salespeople recruit", "personnel", 0],
  ["dismissSales", "Salespeople dismiss", "personnel", 0],
  ["trainSales", "Salespeople train", "personnel", 1],
  ["recruitWorkers", "Workers recruit", "personnel", 0],
  ["dismissWorkers", "Workers dismiss", "personnel", 0],
  ["trainWorkers", "Workers train", "personnel", 1],
  ["salary", "Sales base salary (Rs 00/qtr)", "personnel", 50],
  ["commission", "Sales commission (%)", "personnel", 2],
  ["wage", "Assembly wage (Rs/hour)", "personnel", 6.95],
  ["shift", "Shift level (1–3)", "personnel", 2],
  ["budget", "Management budget (Rs 000)", "management", 120],
  ["rawPrice", "Raw material price (Rs/unit)", "management", 50],
  ["quarterBudget", "Quarterly budget note (Rs 000)", "management", 0],
];

export const ALL_IDS = FIELDS.map((f) => f[0]).concat(REGION_ROWS.flatMap((r) => r.slice(1) as string[]));

// Allowed range for each decision, used to validate decisions an AI competitor proposes.
export function bounds(id: string): [number, number] {
  if (/^major\d$/.test(id) || id === "infoCompanies" || id === "marketShares") return [0, 1];
  if (id === "supplier" || id === "shift") return [1, 3];
  if (id.endsWith("Qty")) return [0, 12000];
  const f = FIELDS.find((x) => x[0] === id);
  return [0, Math.max(5, (f?.[3] ?? 10) * 3)];
}

const OPEN = {
  machines: 10, vans: 17, workers: 85, materialStock: 8000,
  cash: 185000, property: 300000, machineNBV: 1594818, vehicleNBV: 175758,
  shareCapital: 1000000, reserves: 1655576, shares: 500000, taxRate: 0.19,
  interestAnnual: 0.05, factoryBase: 85000, machineHour: 500,
  bom: [1, 1.65, 3.3], mhrs: [0.35, 0.62, 1.25],
};
export { OPEN };

export type Role = { name: string; focus: string; set: Record<string, number>; mix: number[] };
export const ROLES: Role[] = [
  { name: "Cost Leader", focus: "Lowest prices, lean overheads, high volume.", set: { p1export: 150, p1home: 132, p2export: 262, p2home: 245, p3export: 530, p3home: 505, p1advert: 6, p2advert: 7, p3advert: 10, p1merch: 4, p2merch: 4, p3merch: 5, research1: 5, research2: 5, research3: 5, budget: 95, supplier: 1, shift: 3, major3: 0 }, mix: [1.15, 1.3, 1.3, 1.2] },
  { name: "Premium Differentiator", focus: "High prices justified by quality and product improvements.", set: { p1export: 195, p1home: 178, p2export: 330, p2home: 310, p3export: 650, p3home: 620, major1: 1, major2: 1, major3: 1, research1: 25, research2: 25, research3: 30, trainSales: 2 }, mix: [0.85, 0.85, 0.85, 0.85] },
  { name: "Export Expansionist", focus: "Wins overseas with a large export sales force.", set: { exportSales: 18, southSales: 1, westSales: 1, northSales: 1, p1export: 165, p2export: 280, p3export: 565, deliveries: 8, recruitSales: 3 }, mix: [1.35, 0.6, 0.6, 0.6] },
  { name: "Home-Market Specialist", focus: "Dominates South, West and North with regional coverage.", set: { exportSales: 7, southSales: 5, westSales: 5, northSales: 5, p1home: 145, p2home: 262, p3home: 540, vansBuy: 2 }, mix: [0.6, 2.5, 3, 1.6] },
  { name: "Innovation Leader", focus: "Heavy R&D and major improvements to lead future demand.", set: { research1: 35, research2: 35, research3: 40, major1: 1, major2: 1, major3: 1, p3export: 600, p3home: 575, trainWorkers: 3 }, mix: [0.95, 1, 1, 1] },
  { name: "Marketing Aggressor", focus: "Big advertising, trade press and merchandising push.", set: { p1advert: 25, p2advert: 28, p3advert: 40, p1trade: 18, p2trade: 18, p3trade: 30, p1merch: 15, p2merch: 15, p3merch: 20, commission: 3 }, mix: [1.2, 1.25, 1.25, 1.2] },
  { name: "Operations Optimiser", focus: "Machines, training and shorter assembly times.", set: { machinesOrder: 2, maintenance: 90, trainWorkers: 5, p1time: 105, p2time: 150, p3time: 300, shift: 3, recruitWorkers: 6, rawUnits: 14000 }, mix: [1.1, 1.1, 1.1, 1.1] },
  { name: "Financial Conservative", focus: "Protects cash: tight credit, low dividends, no capex.", set: { credit: 20, dividend: 2, machinesOrder: 0, vansBuy: 0, budget: 100, rawUnits: 9000, p1advert: 9, p2advert: 10, p3advert: 15 }, mix: [0.9, 0.9, 0.9, 0.9] },
];
const BASE_QTY = [[2800, 1400, 600], [200, 200, 100], [100, 75, 75], [600, 350, 125]];

export function roleData(i: number): Values {
  const d: Record<string, number> = {};
  FIELDS.forEach((f) => (d[f[0]] = f[3]));
  Object.assign(d, ROLES[i].set);
  REGION_ROWS.forEach((r, ri) => BASE_QTY[ri].forEach((v, k) => (d[r[k + 1]] = Math.round(v * ROLES[i].mix[ri]))));
  return Object.fromEntries(Object.entries(d).map(([k, v]) => [k, String(v)]));
}

export type Meta = { year: string; quarter: string; simCode: string; groupNo: string };
export type QuarterSummary = { label: string; revenue: number; net: number; cash: number; share: number; scenario?: string; ksf?: number };
export type Team = Meta & { d: Values; report: Report | null; touched?: boolean; agents?: Agents; aiRun?: boolean; aiNote?: string; ai?: ReturnType<typeof agentImpact>; ksf?: { items: KsfScore[]; overall: number }; hr?: HR; channels?: PlanRow[] | null; pos?: Position; history?: QuarterSummary[] };

export const isBlank = (v: unknown) => v === null || v === undefined || String(v).trim() === "";
const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function emptyTeam(): Team {
  return { year: "", quarter: "", simCode: "", groupNo: "", d: Object.fromEntries(ALL_IDS.map((id) => [id, ""])), report: null };
}

export function autofill(t: Team, i: number): Team {
  const rd = roleData(i);
  const d = { ...t.d };
  ALL_IDS.forEach((id) => { if (isBlank(d[id])) d[id] = rd[id]; });
  return { ...t, d, year: t.year || "2026", quarter: t.quarter || "1", simCode: t.simCode || "TV-2026", groupNo: t.groupNo || "1" };
}

// ---------- AI agents: each costs money every quarter and changes one part of the business ----------
export const AGENTS = [
  { id: "mi", name: "Market Intelligence", does: "Tracks rivals' prices and campaigns; +5% customer appeal." },
  { id: "ls", name: "Lead & Sales", does: "Finds and scores leads; salespeople 15% more effective." },
  { id: "df", name: "Demand Forecasting", does: "Moves deliveries 60% closer to real demand: less unsold stock, fewer lost sales." },
  { id: "pr", name: "Pricing", does: "Optimises deals and discounts; +2% revenue at the same prices." },
  { id: "cs", name: "Customer Success", does: "Keeps customers loyal; +6% customer appeal." },
  { id: "sp", name: "Supply & Procurement", does: "Negotiates materials; 4% cheaper raw materials." },
  { id: "ps", name: "Production Scheduling", does: "Plans shifts; halves overtime hours." },
  { id: "fc", name: "Finance & Cash", does: "Chases payments; 25% fewer debtors, 30% less interest." },
] as const;
export type AgentId = (typeof AGENTS)[number]["id"];
export type Agents = Partial<Record<AgentId, boolean>>;
export const AGENT_COST = 12000; // per agent per quarter
const on = (ag: Agents | undefined, id: AgentId) => !!ag?.[id];

// ---------- HR: the management team. Each manager's skill (0-100) improves one part of the business. ----------
export const POSITIONS = {
  ops: { name: "Operations Manager", effect: "Up to +8% worker hours and −6% factory overheads", base: 10000 },
  mkt: { name: "Marketing Manager", effect: "Up to +15% effect from marketing spend", base: 16000 },
  sales: { name: "Sales Manager", effect: "Up to +12% sales coverage from the sales force", base: 12000 },
  fin: { name: "Finance Manager", effect: "Up to −30% interest, −15% money owed by customers, −8% management budget", base: 10000 },
  rnd: { name: "R&D Manager", effect: "Up to +30% quality gained from research", base: 14000 },
  hr: { name: "HR Manager", effect: "Up to −60% staff turnover and +25% effect from training", base: 8000 },
} as const;
export type PositionId = keyof typeof POSITIONS;
export type Manager = { name: string; skill: number; salary: number; asking: number; since: string };
export type Candidate = {
  id: string; position: PositionId; name: string; years: number; education: string; lastRole: string;
  skill: number; cv: number; interview?: number; asking: number;
  status: "new" | "shortlisted" | "hold" | "rejected" | "hired"; ai?: string; aiNote?: string;
};
export type HR = { managers?: Partial<Record<PositionId, Manager>>; candidates?: Candidate[]; log?: string[]; severance?: number };
const mg = (hr: HR | undefined, id: PositionId) => (hr?.managers?.[id]?.skill ?? 0) / 100;
export const hrCost = (hr?: HR) => Object.values(hr?.managers ?? {}).reduce((s, m) => s + (m?.salary ?? 0), 0) + (hr?.severance ?? 0);

// ---------- Economy: one scenario applies to the whole market each quarter ----------
export type Econ = { scenario: ScenarioId; gdp: number; policies?: PolicyId[]; industry?: string; locked?: boolean; announcement?: string; pin?: string };
export const SCENARIOS = {
  normal: { name: "Stable economy", desc: "Steady growth, normal prices and interest.", demand: 1, elasticity: 2.5, materials: 1, wages: 1, rate: 0.05, growth: 0.005, inflation: 0.02, unemployment: 0.05 },
  boom: { name: "Boom", desc: "Customers spend more; all markets grow. Rates edge up.", demand: 1.15, elasticity: 2.2, materials: 1.03, wages: 1.02, rate: 0.06, growth: 0.015, inflation: 0.035, unemployment: 0.04 },
  recession: { name: "Recession", desc: "Demand falls and customers become more price-sensitive.", demand: 0.85, elasticity: 3.0, materials: 0.98, wages: 1, rate: 0.04, growth: -0.012, inflation: 0.01, unemployment: 0.08 },
  inflation: { name: "High inflation", desc: "Materials and wages cost more; demand softens slightly.", demand: 0.97, elasticity: 2.5, materials: 1.12, wages: 1.06, rate: 0.08, growth: 0.002, inflation: 0.11, unemployment: 0.055 },
  rateShock: { name: "Interest rate shock", desc: "The central bank raises rates sharply; borrowing is expensive and demand cools.", demand: 0.93, elasticity: 2.6, materials: 1, wages: 1, rate: 0.14, growth: -0.004, inflation: 0.03, unemployment: 0.06 },
} as const;
export type ScenarioId = keyof typeof SCENARIOS;
export const DEFAULT_ECON: Econ = { scenario: "normal", gdp: 734 };

// ---------- Regulator: policies the authority can switch on; every company must comply ----------
export const REGULATOR = "Industry Regulatory Authority";
export const POLICIES = {
  priceCap: { name: "Price cap on Product 1", rule: "Product 1 may not be sold above Rs 145 at home or abroad. Higher prices are cut to the cap." },
  minWage: { name: "Minimum wage", rule: "Assembly wage must be at least Rs 7.50 per hour. Lower wages are raised to the minimum." },
  adCap: { name: "Advertising limit", rule: "Advertising is limited to Rs 20k per product per quarter. Overspend is fined at twice the excess." },
  standards: { name: "Quality standards", rule: "Products below the quality standard (index 0.90) lose certification and 20% of their customers. Research spending builds quality." },
  taxRise: { name: "Corporate tax rise", rule: "Corporation tax rises from 19% to 29% of profit." },
  importDuty: { name: "Import duty on materials", rule: "A 15% duty is added to the price of raw materials." },
  creditRule: { name: "Fair payment rule", rule: "Customers may be given at most 45 days' credit. Longer terms are cut to 45 days." },
  exportIncentive: { name: "Export incentive", rule: "Exporters receive a 5% rebate on export revenue." },
} as const;
export type PolicyId = keyof typeof POLICIES;
const has = (e: Econ | undefined, p: PolicyId) => !!e?.policies?.includes(p);
const AD_CAP = 20, PRICE_CAP = 145, MIN_WAGE = 7.5, MAX_CREDIT = 45, QUALITY_STD = 0.9;

// Apply automatic compliance (caps and floors) to a company's decisions.
function regulate(d: Num, e?: Econ): Num {
  const x = { ...d };
  if (has(e, "priceCap")) { x.p1home = Math.min(x.p1home, PRICE_CAP); x.p1export = Math.min(x.p1export, PRICE_CAP); }
  if (has(e, "minWage")) x.wage = Math.max(x.wage, MIN_WAGE);
  if (has(e, "creditRule")) x.credit = Math.min(x.credit, MAX_CREDIT);
  return x;
}

const sc = (e?: Econ) => SCENARIOS[e?.scenario ?? "normal"] ?? SCENARIOS.normal;

// ---------- Position: what a company carries from one quarter into the next ----------
export type Position = {
  cash: number; debtors: number; creditors: number;
  machines: number; vans: number; workers: number; materialStock: number;
  fg: number[]; fgValue: number; matValue?: number; machineNBV: number; vehicleNBV: number; reserves: number;
  quality: number[]; goodwill: number[]; improved: number[];
};
export function initialPosition(): Position {
  return {
    cash: OPEN.cash, debtors: 0, creditors: 0, machines: OPEN.machines, vans: OPEN.vans, workers: OPEN.workers,
    materialStock: OPEN.materialStock, fg: [0, 0, 0], fgValue: 0, machineNBV: OPEN.machineNBV, vehicleNBV: OPEN.vehicleNBV,
    reserves: OPEN.reserves, quality: [1, 1, 1], goodwill: [1, 1, 1], improved: [0, 0, 0],
  };
}

// ---------- Market: 8 companies compete for the same customers ----------
// Attractiveness = price, marketing goodwill, sales coverage, product quality and credit terms, relative to the benchmark.
// Goodwill and quality build up over quarters, so marketing and R&D keep paying back later.
// At benchmark decisions every company gets exactly the base quantity, so the model is calibrated.
const BENCH: Record<string, number> = Object.fromEntries(FIELDS.map((f) => [f[0], f[3]]));
const SALES_KEY = ["exportSales", "southSales", "westSales", "northSales"];
export type Grid = number[][]; // [region][product]
type Num = Record<string, number>;
const toNum = (raw: Values): Num => Object.fromEntries(ALL_IDS.map((id) => [id, n(raw[id])]));

export function brand(d: Num, pos: Position, p: number, rnd = 0, chMult = 1) {
  const promo = (d[`p${p + 1}advert`] + d[`p${p + 1}trade`] + d[`p${p + 1}merch`]) /
    (BENCH[`p${p + 1}advert`] + BENCH[`p${p + 1}trade`] + BENCH[`p${p + 1}merch`]);
  return {
    goodwill: 0.5 * pos.goodwill[p] + 0.5 * promo * chMult,
    quality: 0.75 * pos.quality[p] + 0.25 * (d[`research${p + 1}`] / BENCH[`research${p + 1}`]) * (1 + 0.3 * rnd),
    improved: Math.max(pos.improved[p], Math.min(1, Math.max(0, d[`major${p + 1}`]))),
  };
}

function attractiveness(d: Num, pos: Position, g: number, p: number, ag?: Agents, elasticity = 2.5, econ?: Econ, hr?: HR, mix?: ReturnType<typeof channelMix>) {
  const priceKey = `p${p + 1}${g === 0 ? "export" : "home"}`;
  const b = brand(d, pos, p, mg(hr, "rnd"), mix?.[p].mult ?? 1);
  // Channels with an overseas audience help export sales; home-only channels help home regions (0.25 = neutral mix).
  const reach = mix ? (g === 0 ? 0.85 + 0.6 * mix[p].exportShare : 1.05 - 0.2 * mix[p].exportShare) : 1;
  const price = Math.max(1, d[priceKey]) / BENCH[priceKey];
  const marketing = Math.max(0.05, b.goodwill * (1 + 0.15 * mg(hr, "mkt")) * reach);
  // +2 smoothing: one extra salesperson in a small region helps, but does not double coverage.
  const coverage = Math.max(0.1, (d[SALES_KEY[g]] * (on(ag, "ls") ? 1.15 : 1) * (1 + 0.12 * mg(hr, "sales")) + 2) / (BENCH[SALES_KEY[g]] + 2));
  const quality = (1 + 0.12 * b.improved) * Math.max(0.2, b.quality) ** 0.25;
  const credit = (Math.max(10, d.credit) / BENCH.credit) ** 0.1;
  const ai = (on(ag, "mi") ? 1.05 : 1) * (on(ag, "cs") ? 1.06 : 1) * (has(econ, "standards") && b.quality < QUALITY_STD ? 0.8 : 1);
  return { a: price ** -elasticity * marketing ** 0.35 * coverage ** 0.3 * quality * credit * ai, price, marketing };
}

// Units a company can sell in each region: this quarter's deliveries plus stock carried in (spread like deliveries).
function available(d: Num, pos: Position): Grid {
  const grid = REGION_ROWS.map(() => [0, 0, 0]);
  [0, 1, 2].forEach((p) => {
    const total = REGION_ROWS.reduce((s, r) => s + d[r[p + 1]], 0);
    let left = Math.round(pos.fg[p]);
    REGION_ROWS.forEach((row, g) => {
      const share = total > 0 ? d[row[p + 1]] / total : g === 0 ? 1 : 0;
      // Floor each region's share of carried stock; the last region takes the remainder, so the parts add up exactly.
      const carry = g === REGION_ROWS.length - 1 ? left : Math.min(left, Math.floor(pos.fg[p] * share));
      left -= carry;
      grid[g][p] = d[row[p + 1]] + carry;
    });
  });
  return grid;
}

export function market(all: { d: Values; pos?: Position; agents?: Agents; hr?: HR; channels?: PlanRow[] | null }[], econ?: Econ) {
  const e = sc(econ), ind = industryOf(econ?.industry);
  // Industry economics: price sensitivity, how much booms/recessions move demand, and sensitivity to interest rates.
  const elasticity = e.elasticity * ind.elasticity;
  const demandMult = Math.max(0.3, (1 + (e.demand - 1) * ind.cyclical) * (1 - ind.rateSens * Math.max(0, e.rate - 0.05)));
  const ds = all.map((t) => regulate(toNum(t.d), econ));
  const mixes = all.map((t) => channelMix(t.channels));
  const ps = all.map((t) => t.pos ?? initialPosition());
  const k = ds.length;
  const demand: Grid[] = ds.map(() => REGION_ROWS.map(() => [0, 0, 0]));
  const sold: Grid[] = ds.map(() => REGION_ROWS.map(() => [0, 0, 0]));
  const avail = ds.map((d, i) => available(d, ps[i]));
  REGION_ROWS.forEach((_, g) => [0, 1, 2].forEach((p) => {
    const at = ds.map((d, i) => attractiveness(d, ps[i], g, p, all[i].agents, elasticity, econ, all[i].hr, mixes[i]));
    const sumA = at.reduce((s, x) => s + x.a, 0) || 1;
    const avgPrice = at.reduce((s, x) => s + x.price, 0) / k;
    const avgMkt = at.reduce((s, x) => s + x.marketing, 0) / k;
    // Total market grows when the industry is cheaper or markets harder.
    const size = BASE_QTY[g][p] * k * demandMult * avgPrice ** -1.2 * avgMkt ** 0.15;
    ds.forEach((_, i) => {
      const dem = Math.round((size * at[i].a) / sumA);
      demand[i][g][p] = dem;
    });
  }));
  // Demand Forecasting agent: delivered quantities move 60% of the way towards real demand.
  // Demand doesn't depend on quantities, so adjusting after the demand pass is exact.
  const adjusted = all.map((t, i) => {
    if (!on(t.agents, "df")) return t.d;
    const d2 = { ...t.d };
    REGION_ROWS.forEach((row, g) => [0, 1, 2].forEach((p) => {
      const gap = demand[i][g][p] - avail[i][g][p];
      const qty = Math.max(0, Math.round(ds[i][row[p + 1]] + 0.6 * gap));
      avail[i][g][p] += qty - ds[i][row[p + 1]];
      d2[row[p + 1]] = String(qty);
    }));
    return d2;
  });
  ds.forEach((_, i) => REGION_ROWS.forEach((_, g) => [0, 1, 2].forEach((p) => {
    sold[i][g][p] = Math.min(avail[i][g][p], demand[i][g][p]); // ponytail: lost sales don't spill over to rivals yet
  })));
  return { demand, sold, adjusted };
}

type Run = { d: Values; quarter: string; pos?: Position; agents?: Agents; hr?: HR; channels?: PlanRow[] | null };
export function calculateAll(all: Run[], econ?: Econ) {
  const m = market(all, econ);
  return all.map((t, i) => calculate(m.adjusted[i], t.quarter, m.sold[i], m.demand[i], t.pos, t.agents, econ, t.hr, t.channels));
}

// With-vs-without comparison: rerun the market with one company's agents changed, rivals unchanged.
export function agentImpact(all: Run[], i: number, econ?: Econ) {
  const net = (ag: Agents) => calculateAll(all.map((t, k) => (k === i ? { ...t, agents: ag } : t)), econ)[i];
  const ag = all[i].agents ?? {};
  const active = AGENTS.filter((a) => ag[a.id]);
  if (!active.length) return null;
  const off = net({});
  const base = calculateAll(all, econ)[i];
  return {
    off: { net: off.net, revenue: off.revenue, sold: off.soldU.reduce((a, b) => a + b, 0), lost: off.lostSales.reduce((a, b) => a + b, 0), unsold: off.unsold.reduce((a, b) => a + b, 0), cash: off.cashShown - off.overdraft },
    each: active.map((a) => ({ id: a.id, name: a.name, value: base.net - net({ ...ag, [a.id]: false }).net })),
  };
}

export type Report = ReturnType<typeof calculate>;

export function calculate(raw: Values, quarter: string | number = 1, soldIn?: Grid, demandIn?: Grid, posIn?: Position, ag?: Agents, econ?: Econ, hr?: HR, channels?: PlanRow[] | null) {
  const mix = channelMix(channels);
  const pos = posIn ?? initialPosition();
  const e = sc(econ);
  const d = regulate(toNum(raw), econ);
  const u = [1, 2, 3].map((p) => d[`p${p}exportQty`] + d[`p${p}southQty`] + d[`p${p}westQty`] + d[`p${p}northQty`]);
  const avail = available(d, pos);
  const sold = soldIn ?? avail;
  const demand = demandIn ?? avail;
  const soldU = [0, 1, 2].map((p) => sold.reduce((s, r) => s + r[p], 0));
  const demandU = [0, 1, 2].map((p) => demand.reduce((s, r) => s + r[p], 0));
  const unsold = u.map((x, p) => Math.max(0, x + pos.fg[p] - soldU[p]));
  const lostSales = demandU.map((x, p) => Math.max(0, x - soldU[p]));
  const revenue = [0, 1, 2].reduce((s, p) =>
    s + sold[0][p] * d[`p${p + 1}export`] * (has(econ, "exportIncentive") ? 1.05 : 1) + (sold[1][p] + sold[2][p] + sold[3][p]) * d[`p${p + 1}home`], 0) * (on(ag, "pr") ? 1.02 : 1);
  const agentsOn = AGENTS.filter((a) => on(ag, a.id)).length;
  const agentCost = agentsOn * AGENT_COST;
  const matPrice = d.rawPrice * e.materials * (has(econ, "importDuty") ? 1.15 : 1) * (on(ag, "sp") ? 0.96 : 1);
  const wage = d.wage * e.wages;
  const matUsed = u[0] * OPEN.bom[0] + u[1] * OPEN.bom[1] + u[2] * OPEN.bom[2];
  const materialsPurchased = d.rawUnits * matPrice;
  const materialStock = Math.max(0, pos.materialStock + d.rawUnits - matUsed);
  // Periodic stock method: consumption = opening stock value + purchases − closing stock value (keeps the books balanced when prices change).
  const openMatValue = pos.matValue ?? pos.materialStock * d.rawPrice;
  const matValue = materialStock * matPrice;
  const materialsConsumedCost = openMatValue + materialsPurchased - matValue;
  const hoursReq = (u[0] * d.p1time + u[1] * d.p2time + u[2] * d.p3time) / 60;
  const salesForce = d.exportSales + d.southSales + d.westSales + d.northSales;
  const workers = Math.max(0, pos.workers + d.recruitWorkers - d.dismissWorkers);
  const shiftFactor = d.shift <= 1 ? 1 : d.shift === 2 ? 1.15 : 1.33;
  const hoursCap = workers * 13 * 37.5 * shiftFactor * (1 + 0.04 * (1 + 0.25 * mg(hr, "hr")) * Math.min(d.trainWorkers, workers)) * (1 + 0.08 * mg(hr, "ops"));
  // Staff turnover: more workers leave when pay is below the market wage; training and an HR manager keep them.
  const marketWage = 6.95 * e.wages;
  const turnover = Math.min(0.25, Math.max(0.01, 0.03 + Math.max(0, (marketWage - wage) / marketWage) * 0.6 - 0.002 * Math.min(d.trainWorkers, 10))) * (1 - 0.6 * mg(hr, "hr"));
  const leavers = Math.round(workers * turnover);
  const otHours = Math.max(0, hoursReq - hoursCap) * (on(ag, "ps") ? 0.5 : 1);
  const wages = Math.min(hoursReq, hoursCap) * wage + otHours * wage * 1.5;
  const advert = (d.p1advert + d.p2advert + d.p3advert) * 1000;
  const trade = (d.p1trade + d.p2trade + d.p3trade) * 1000;
  const merch = (d.p1merch + d.p2merch + d.p3merch) * 1000;
  const research = (d.research1 + d.research2 + d.research3) * 1000;
  const salesSalary = d.salary * 100 * salesForce;
  const commission = revenue * (d.commission / 100);
  const mgmt = d.budget * 1000 * (1 - 0.08 * mg(hr, "fin"));
  const maint = d.maintenance * wage * 1.25;
  const machines = Math.max(0, pos.machines + d.machinesOrder - d.machinesSell);
  const vans = Math.max(0, pos.vans + d.vansBuy - d.vansSell);
  const depMachines = pos.machineNBV * 0.031;
  const depVans = pos.vehicleNBV * 0.05;
  const factory = (OPEN.factoryBase + machines * 2200 + maint) * (1 - 0.06 * mg(hr, "ops"));
  const transport = d.deliveries * 8500 + vans * 420;
  const sellingOH = advert + trade + merch + salesSalary + commission + transport;
  // Regulator: fines for advertising above the limit, plus plain-English notices of anything adjusted.
  const raw0 = toNum(raw);
  const adExcess = has(econ, "adCap") ? [1, 2, 3].reduce((s, p) => s + Math.max(0, d[`p${p}advert`] - AD_CAP), 0) : 0;
  const fines = adExcess * 1000 * 2;
  const managerSalaries = hrCost(hr);
  const adminOH = mgmt + research + agentCost + fines + managerSalaries + (d.infoCompanies ? 2500 : 0) + (d.marketShares ? 4000 : 0);
  const prodOH = factory + depMachines;
  // Production cost is shared across products by material content; unsold units are carried as finished-goods stock.
  const productionCost = materialsConsumedCost + wages + prodOH;
  const weight = u[0] * OPEN.bom[0] + u[1] * OPEN.bom[1] + u[2] * OPEN.bom[2] || 1;
  const fgValue = (productionCost / weight) * (unsold[0] * OPEN.bom[0] + unsold[1] * OPEN.bom[1] + unsold[2] * OPEN.bom[2]);
  const costOfSales = productionCost + pos.fgValue - fgValue;
  const gross = revenue - costOfSales;
  const operating = gross - sellingOH - adminOH - depVans;
  const capex = d.machinesOrder * 80000 + d.vansBuy * 12000;
  const assetSales = d.machinesSell * (pos.machineNBV / Math.max(1, pos.machines)) * 0.45 + d.vansSell * 4000;
  const debtors = ((revenue * Math.min(d.credit, 90)) / 90) * (on(ag, "fc") ? 0.75 : 1) * (1 - 0.15 * mg(hr, "fin"));
  const creditors = materialsPurchased * 0.35;
  // Last quarter's debtors are collected and last quarter's creditors are paid this quarter.
  let cash = pos.cash + (revenue - debtors + pos.debtors) - (materialsPurchased - creditors + pos.creditors)
    - wages - sellingOH - adminOH - factory - capex + assetSales;
  const interest = (cash < 0 ? (Math.abs(cash) * e.rate) / 4 : 0) * (on(ag, "fc") ? 0.7 : 1) * (1 - 0.3 * mg(hr, "fin"));
  cash -= interest;
  const pbt = operating - interest;
  const tax = pbt > 0 ? pbt * (has(econ, "taxRise") ? 0.29 : OPEN.taxRate) : 0;
  const net = pbt - tax;
  const dividend = (d.dividend / 100) * OPEN.shares;
  cash -= dividend + tax;
  const overdraft = Math.max(0, -cash);
  const cashShown = Math.max(0, cash);
  const machineNBV = pos.machineNBV + d.machinesOrder * 80000 - d.machinesSell * (pos.machineNBV / Math.max(1, pos.machines)) - depMachines;
  const vehicleNBV = pos.vehicleNBV + d.vansBuy * 12000 - d.vansSell * (pos.vehicleNBV / Math.max(1, pos.vans)) - depVans;
  const reserves = pos.reserves + net - dividend;
  const netAssets = OPEN.property + machineNBV + vehicleNBV + matValue + fgValue + debtors + cashShown - creditors - overdraft;
  const mNeed = u[0] * OPEN.mhrs[0] + u[1] * OPEN.mhrs[1] + u[2] * OPEN.mhrs[2];
  const brands = [0, 1, 2].map((p) => brand(d, pos, p, mg(hr, "rnd"), mix?.[p].mult ?? 1));
  const close: Position = {
    cash, debtors, creditors, machines, vans, workers: workers - leavers, materialStock, fg: unsold, fgValue, matValue, machineNBV, vehicleNBV, reserves,
    quality: brands.map((b) => b.quality), goodwill: brands.map((b) => b.goodwill), improved: brands.map((b) => b.improved),
  };
  const notices: string[] = [];
  if (has(econ, "priceCap") && (raw0.p1home > PRICE_CAP || raw0.p1export > PRICE_CAP)) notices.push(`Product 1 price cut to the Rs ${PRICE_CAP} cap.`);
  if (has(econ, "minWage") && raw0.wage < MIN_WAGE) notices.push(`Wage raised from Rs ${raw0.wage} to the Rs ${MIN_WAGE} minimum.`);
  if (has(econ, "creditRule") && raw0.credit > MAX_CREDIT) notices.push(`Credit cut from ${raw0.credit} to ${MAX_CREDIT} days.`);
  if (fines) notices.push(`Advertising Rs ${adExcess}k over the limit: fined ${gbp(fines)}.`);
  if (has(econ, "standards")) brands.forEach((b, p) => { if (b.quality < QUALITY_STD) notices.push(`Product ${p + 1} failed quality standards (index ${b.quality.toFixed(2)}): 20% fewer customers. Spend more on research.`); });
  return {
    fines, notices, managerSalaries, leavers, turnover, channelMix: mix,
    agentsOn, agentCost, u, soldU, demandU, unsold, lostSales, fgValue, productionCost, sold, demand, revenue,
    materialsConsumedCost, materialsPurchased, wages, otHours, hoursReq, hoursCap,
    advert, trade, merch, research, salesSalary, commission, mgmt, sellingOH, adminOH, prodOH,
    factory, depVans, transport, costOfSales, gross, operating, interest, tax, net, dividend,
    machines, vans, workers, salesForce, materialStock, debtors, creditors, cashShown, overdraft,
    machineNBV, vehicleNBV, matValue, reserves, netAssets, capex, assetSales, mNeed, mAvail: machines * OPEN.machineHour,
    gdp: econ?.gdp ?? DEFAULT_ECON.gdp, econ: { ...e, id: econ?.scenario ?? "normal" }, nextMat: Math.round(matPrice * 1000 * (1 + e.inflation / 4)), d, open: pos, close,
  };
}

export const fmt = (x: number) => Number(x || 0).toLocaleString("en-GB", { maximumFractionDigits: 2 });
export const gbp = (x: number) => { const v = Math.round(x || 0); return (v < 0 ? "−Rs " : "Rs ") + Math.abs(v).toLocaleString("en-PK"); };

// ---------- Key success factors: each company is scored 0–100 against the other seven every quarter ----------
export const KSF = [
  { id: "research", group: "Technology", name: "Research expertise", unit: "R&D as % of revenue", lower: false },
  { id: "scale", group: "Manufacturing", name: "Economies of scale & learning curve", unit: "Production cost per standard unit (Rs)", lower: true },
  { id: "quality", group: "Manufacturing", name: "Quality control know-how", unit: "Quality index (1.00 = standard)", lower: false },
  { id: "assets", group: "Manufacturing", name: "Utilisation of fixed assets", unit: "Machine hours used, % of available", lower: false },
  { id: "labour", group: "Manufacturing", name: "Labour productivity", unit: "Standard units per worker", lower: false },
  { id: "share", group: "Marketing", name: "Market share", unit: "% of units sold in the industry", lower: false },
  { id: "return", group: "Finance", name: "Return on net assets", unit: "Net profit, % of net assets", lower: false },
] as const;
export type KsfScore = { id: string; value: number; score: number; rank: number };

export function ksfAll(rs: Report[]): { items: KsfScore[]; overall: number }[] {
  const totalSold = rs.reduce((s, r) => s + r.soldU.reduce((a, b) => a + b, 0), 0) || 1;
  const std = (r: Report) => r.u[0] * OPEN.bom[0] + r.u[1] * OPEN.bom[1] + r.u[2] * OPEN.bom[2];
  const raw: Record<string, (r: Report) => number> = {
    research: (r) => (r.research / (r.revenue || 1)) * 100,
    scale: (r) => r.productionCost / (std(r) || 1),
    quality: (r) => r.close.quality.reduce((s, q, p) => s + q * (1 + 0.12 * r.close.improved[p]), 0) / 3,
    assets: (r) => Math.min(100, (r.mNeed / (r.mAvail || 1)) * 100),
    labour: (r) => std(r) / (r.workers || 1),
    share: (r) => (r.soldU.reduce((a, b) => a + b, 0) / totalSold) * 100,
    return: (r) => (r.net / (r.netAssets || 1)) * 100,
  };
  const cols = KSF.map((k) => {
    const v = rs.map(raw[k.id]);
    const lo = Math.min(...v), hi = Math.max(...v);
    return v.map((x) => {
      const pos = hi === lo ? 0.5 : (x - lo) / (hi - lo);
      return { id: k.id, value: x, score: Math.round((k.lower ? 1 - pos : pos) * 100), rank: 1 + v.filter((y) => (k.lower ? y < x : y > x)).length };
    });
  });
  return rs.map((_, i) => {
    const items = cols.map((c) => c[i]);
    return { items, overall: Math.round(items.reduce((s, x) => s + x.score, 0) / items.length) };
  });
}
