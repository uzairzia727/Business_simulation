// Marketing channels. Each one feeds one of the simulation's three marketing levers
// (advert = brand advertising, trade = trade press / B2B, merch = point of sale / direct), and has its own:
//  fit:    how well it reaches buyers of Product 1, 2, 3 (1 = average)
//  export: share of its reach that is overseas (export market) rather than home regions
//  sat:    saturation point in Rs 000 per product — spend far beyond it is mostly wasted
export const CHANNELS = [
  { id: "google", name: "Google Search & Display", lever: "advert", note: "people already searching; good for all products", fit: [1.05, 1.1, 1.05], export: 0.35, sat: 30 },
  { id: "meta", name: "Facebook & Instagram", lever: "advert", note: "broad consumer reach, cheap awareness", fit: [1.2, 1.1, 0.8], export: 0.15, sat: 25 },
  { id: "tiktok", name: "TikTok", lever: "advert", note: "young buyers, viral video; weak for premium", fit: [1.35, 0.95, 0.6], export: 0.1, sat: 15 },
  { id: "youtube", name: "YouTube", lever: "advert", note: "video demos, premium storytelling", fit: [0.85, 1.05, 1.3], export: 0.25, sat: 20 },
  { id: "billboard", name: "Billboards & TV", lever: "advert", note: "mass awareness at home, expensive", fit: [1.0, 1.0, 0.95], export: 0, sat: 45 },
  { id: "linkedin", name: "LinkedIn", lever: "trade", note: "business buyers and distributors, strong abroad", fit: [0.75, 1.1, 1.3], export: 0.6, sat: 12 },
  { id: "portals", name: "Industry websites & trade portals", lever: "trade", note: "wholesalers and trade buyers, home and abroad", fit: [1.1, 1.15, 1.0], export: 0.5, sat: 20 },
  { id: "daraz", name: "Daraz & online marketplaces", lever: "merch", note: "direct online sales at home", fit: [1.3, 1.1, 0.8], export: 0, sat: 18 },
  { id: "crm", name: "Email, SMS & CRM software", lever: "merch", note: "repeat customers, low cost, saturates quickly", fit: [1.1, 1.15, 1.2], export: 0.2, sat: 6 },
] as const;

export type PlanRow = { channel: string; p1: number; p2: number; p3: number; ad: string };
const P = ["p1", "p2", "p3"] as const;
const ch = (id: string) => CHANNELS.find((c) => c.id === id);

// Turn a channel plan into the nine marketing decisions (p{1-3}{advert,trade,merch}).
export function planToDecisions(plan: PlanRow[]) {
  const d: Record<string, string> = {};
  for (const p of [1, 2, 3]) for (const lever of ["advert", "trade", "merch"]) {
    d[`p${p}${lever}`] = String(plan.filter((r) => ch(r.channel)?.lever === lever)
      .reduce((s, r) => s + r[`p${p}` as "p1"], 0));
  }
  return d;
}

// Effectiveness of one channel's spend on one product: product fit × diminishing returns.
// Calibrated so a moderate spend (about a quarter of the saturation point) on an average-fit channel ≈ 1.
export function channelEff(id: string, p: number, spend: number) {
  const c = ch(id);
  if (!c || spend <= 0) return 0;
  return c.fit[p] * (1.25 * c.sat) / (c.sat + spend);
}

// What the demand engine needs from a channel plan: per product, a multiplier on marketing effect,
// and the share of the spend that reaches the export market. Null plan = classic levers (multiplier 1).
export function channelMix(plan?: PlanRow[] | null) {
  if (!plan?.length) return null;
  return [0, 1, 2].map((p) => {
    let spend = 0, eff = 0, exp = 0;
    for (const r of plan) {
      const s = Number(r[P[p]]) || 0;
      if (s <= 0) continue;
      spend += s; eff += s * channelEff(r.channel, p, s); exp += s * (ch(r.channel)?.export ?? 0);
    }
    return spend ? { mult: eff / spend, exportShare: exp / spend } : { mult: 1, exportShare: 0.25 };
  });
}
