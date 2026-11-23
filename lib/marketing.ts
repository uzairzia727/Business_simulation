// Marketing channels. Each one feeds one of the simulation's three marketing levers:
// advert (brand advertising), trade (trade press / B2B) or merch (point of sale / direct).
export const CHANNELS = [
  { id: "google", name: "Google Search & Display", lever: "advert", note: "people already searching; good for all products" },
  { id: "meta", name: "Facebook & Instagram", lever: "advert", note: "broad consumer reach, cheap awareness" },
  { id: "tiktok", name: "TikTok", lever: "advert", note: "young audience, viral video" },
  { id: "youtube", name: "YouTube", lever: "advert", note: "video demos, premium storytelling" },
  { id: "billboard", name: "Billboards & TV", lever: "advert", note: "mass awareness, expensive" },
  { id: "linkedin", name: "LinkedIn", lever: "trade", note: "business buyers and distributors" },
  { id: "portals", name: "Industry websites & trade portals", lever: "trade", note: "wholesalers and trade buyers" },
  { id: "daraz", name: "Daraz & online marketplaces", lever: "merch", note: "direct online sales, listings and promotions" },
  { id: "crm", name: "Email, SMS & CRM software", lever: "merch", note: "repeat customers, low cost" },
] as const;

export type PlanRow = { channel: string; p1: number; p2: number; p3: number; ad: string };

// Turn a channel plan into the nine marketing decisions (p{1-3}{advert,trade,merch}).
export function planToDecisions(plan: PlanRow[]) {
  const d: Record<string, string> = {};
  for (const p of [1, 2, 3]) for (const lever of ["advert", "trade", "merch"]) {
    d[`p${p}${lever}`] = String(plan.filter((r) => CHANNELS.find((c) => c.id === r.channel)?.lever === lever)
      .reduce((s, r) => s + r[`p${p}` as "p1"], 0));
  }
  return d;
}
