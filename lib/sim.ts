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

const OPEN = {
  machines: 10, vans: 17, workers: 85, materialStock: 8000,
  cash: 185000, property: 300000, machineNBV: 1594818, vehicleNBV: 175758,
  shareCapital: 1000000, reserves: 865000, shares: 500000, taxRate: 0.19,
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
export type Team = Meta & { d: Values; report: Report | null; touched?: boolean };

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

export type Report = ReturnType<typeof calculate>;

export function calculate(raw: Values, quarter: string | number = 1) {
  const d: Record<string, number> = Object.fromEntries(ALL_IDS.map((id) => [id, n(raw[id])]));
  const u = [1, 2, 3].map((p) => d[`p${p}exportQty`] + d[`p${p}southQty`] + d[`p${p}westQty`] + d[`p${p}northQty`]);
  const revenue = [1, 2, 3].reduce((s, p) =>
    s + d[`p${p}exportQty`] * d[`p${p}export`] + (d[`p${p}southQty`] + d[`p${p}westQty`] + d[`p${p}northQty`]) * d[`p${p}home`], 0);
  const matUsed = u[0] * OPEN.bom[0] + u[1] * OPEN.bom[1] + u[2] * OPEN.bom[2];
  const materialsPurchased = d.rawUnits * d.rawPrice;
  const materialStock = Math.max(0, OPEN.materialStock + d.rawUnits - matUsed);
  const materialsConsumedCost = matUsed * d.rawPrice;
  const hoursReq = (u[0] * d.p1time + u[1] * d.p2time + u[2] * d.p3time) / 60;
  const salesForce = d.exportSales + d.southSales + d.westSales + d.northSales;
  const workers = Math.max(0, OPEN.workers + d.recruitWorkers - d.dismissWorkers);
  const shiftFactor = d.shift <= 1 ? 1 : d.shift === 2 ? 1.15 : 1.33;
  const hoursCap = workers * 13 * 37.5 * shiftFactor * (1 + 0.04 * Math.min(d.trainWorkers, workers));
  const otHours = Math.max(0, hoursReq - hoursCap);
  const wages = Math.min(hoursReq, hoursCap) * d.wage + otHours * d.wage * 1.5;
  const advert = (d.p1advert + d.p2advert + d.p3advert) * 1000;
  const trade = (d.p1trade + d.p2trade + d.p3trade) * 1000;
  const merch = (d.p1merch + d.p2merch + d.p3merch) * 1000;
  const research = (d.research1 + d.research2 + d.research3) * 1000;
  const salesSalary = d.salary * 100 * salesForce;
  const commission = revenue * (d.commission / 100);
  const mgmt = d.budget * 1000;
  const maint = d.maintenance * d.wage * 1.25;
  const machines = Math.max(0, OPEN.machines + d.machinesOrder - d.machinesSell);
  const vans = Math.max(0, OPEN.vans + d.vansBuy - d.vansSell);
  const depMachines = OPEN.machineNBV * 0.031;
  const depVans = OPEN.vehicleNBV * 0.05;
  const factory = OPEN.factoryBase + machines * 2200 + maint;
  const transport = d.deliveries * 8500 + vans * 420;
  const sellingOH = advert + trade + merch + salesSalary + commission + transport;
  const adminOH = mgmt + research + (d.infoCompanies ? 2500 : 0) + (d.marketShares ? 4000 : 0);
  const prodOH = factory + depMachines;
  const costOfSales = materialsConsumedCost + wages + prodOH;
  const gross = revenue - costOfSales;
  const operating = gross - sellingOH - adminOH - depVans;
  const capex = d.machinesOrder * 80000 + d.vansBuy * 12000;
  const assetSales = d.machinesSell * (OPEN.machineNBV / OPEN.machines) * 0.45 + d.vansSell * 4000;
  const debtors = (revenue * Math.min(d.credit, 90)) / 90;
  const creditors = materialsPurchased * 0.35;
  let cash = OPEN.cash + (revenue - debtors) - (materialsPurchased - creditors) - wages - sellingOH - adminOH - factory - capex + assetSales;
  const interest = cash < 0 ? (Math.abs(cash) * OPEN.interestAnnual) / 4 : 0;
  cash -= interest;
  const pbt = operating - interest;
  const tax = pbt > 0 ? pbt * OPEN.taxRate : 0;
  const net = pbt - tax;
  const dividend = (d.dividend / 100) * OPEN.shares;
  cash -= dividend + tax;
  const overdraft = Math.max(0, -cash);
  const cashShown = Math.max(0, cash);
  const machineNBV = OPEN.machineNBV + d.machinesOrder * 80000 - d.machinesSell * (OPEN.machineNBV / OPEN.machines) - depMachines;
  const vehicleNBV = OPEN.vehicleNBV + d.vansBuy * 12000 - d.vansSell * (OPEN.vehicleNBV / OPEN.vans) - depVans;
  const matValue = materialStock * d.rawPrice;
  const netAssets = OPEN.property + machineNBV + vehicleNBV + matValue + debtors + cashShown - creditors - overdraft;
  const mNeed = u[0] * OPEN.mhrs[0] + u[1] * OPEN.mhrs[1] + u[2] * OPEN.mhrs[2];
  const q = n(quarter) || 1;
  return {
    u, revenue, materialsConsumedCost, materialsPurchased, wages, otHours, hoursReq, hoursCap,
    advert, trade, merch, research, salesSalary, commission, mgmt, sellingOH, adminOH, prodOH,
    factory, depVans, transport, costOfSales, gross, operating, interest, tax, net, dividend,
    machines, vans, workers, salesForce, materialStock, debtors, creditors, cashShown, overdraft,
    machineNBV, vehicleNBV, matValue, netAssets, capex, assetSales, mNeed, mAvail: machines * OPEN.machineHour,
    gdp: 734 + (q - 1) * 4, nextMat: Math.round(d.rawPrice * 1000 * 1.004), d,
  };
}

export const fmt = (x: number) => Number(x || 0).toLocaleString("en-GB", { maximumFractionDigits: 2 });
export const gbp = (x: number) => { const v = Math.round(x || 0); return (v < 0 ? "−Rs " : "Rs ") + Math.abs(v).toLocaleString("en-PK"); };
