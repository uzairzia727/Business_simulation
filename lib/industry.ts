// Industries: the same strategy engine, re-skinned with each sector's products, markets, regulator and economics.
//  elasticity: how price-sensitive customers are (× the scenario's value)
//  rateSens:   extra demand lost per 1 point of interest above 5% (real estate buyers borrow; health patients don't)
//  cyclical:   how strongly booms and recessions move demand (1 = fully, 0.4 = mostly shielded)
export const INDUSTRIES = {
  manufacturing: {
    name: "Manufacturing", blurb: "Three consumer products sold at home and abroad.",
    products: ["Product 1", "Product 2", "Product 3"], short: ["P1", "P2", "P3"],
    regions: ["Export", "South", "West", "North"], regulator: "Industry Regulatory Authority",
    elasticity: 1, rateSens: 0, cyclical: 1, words: {} as Record<string, string>,
  },
  realEstate: {
    name: "Real estate", blurb: "Develop and sell homes and commercial property across Pakistan's cities.",
    products: ["Apartments", "Commercial plots", "Luxury villas"], short: ["Apartments", "Commercial", "Villas"],
    regions: ["Overseas Pakistanis", "Karachi", "Lahore", "Islamabad"], regulator: "Capital Development Authority (CDA)",
    elasticity: 1.1, rateSens: 2.5, cyclical: 1.3,
    words: { "Raw material": "Construction material", "raw material": "construction material", "Assembly": "Construction", "Workers": "Site workers", "workers": "site workers", "Machines": "Construction equipment", "machines": "construction equipment", "Salespeople": "Property agents", "Daraz & online marketplaces": "Zameen.com & property portals", "Units": "Units", "Quality standards": "Building codes", "Price cap": "Price cap" },
  },
  education: {
    name: "Education", blurb: "Run a private university competing for students at home and abroad.",
    products: ["Diploma programmes", "Undergraduate degrees", "MBA & postgraduate"], short: ["Diploma", "Undergrad", "MBA"],
    regions: ["International students", "Karachi campus", "Lahore campus", "Islamabad campus"], regulator: "Higher Education Commission (HEC)",
    elasticity: 0.9, rateSens: 0.5, cyclical: 0.6,
    words: { "Raw material": "Learning material", "raw material": "learning material", "Assembly": "Teaching", "Workers": "Faculty", "workers": "faculty", "Machines": "Labs & classrooms", "machines": "labs & classrooms", "Salespeople": "Admissions officers", "Daraz & online marketplaces": "Education portals & fairs", "Price cap": "Fee cap", "Home price": "Home fee", "Export price": "Export fee", "prices": "fees", "Quality standards": "HEC accreditation", "Units": "Students" },
  },
  health: {
    name: "Health care", blurb: "Run a private hospital group competing for patients.",
    products: ["OPD consultations", "Diagnostics & labs", "Surgery packages"], short: ["OPD", "Diagnostics", "Surgery"],
    regions: ["Medical tourism", "Karachi", "Lahore", "Islamabad"], regulator: "Healthcare Commission & DRAP",
    elasticity: 0.7, rateSens: 0.3, cyclical: 0.4,
    words: { "Raw material": "Medical supplies", "raw material": "medical supplies", "Assembly": "Clinical", "Workers": "Nurses & technicians", "workers": "nurses & technicians", "Machines": "Medical equipment", "machines": "medical equipment", "Salespeople": "Referral officers", "Daraz & online marketplaces": "Marham & Oladoc", "Quality standards": "Clinical accreditation", "Units": "Patients" },
  },
} as const;
export type IndustryId = keyof typeof INDUSTRIES;
export const industryOf = (id?: string) => INDUSTRIES[(id as IndustryId) in INDUSTRIES ? (id as IndustryId) : "manufacturing"];

// Re-word any label for the chosen industry: products, regions, then sector words.
export function term(text: string, id?: string) {
  const ind = industryOf(id);
  if (ind === INDUSTRIES.manufacturing) return text;
  let s = text;
  ind.products.forEach((p, k) => { s = s.replace(new RegExp(`\\bProduct ${k + 1}\\b`, "g"), p).replace(new RegExp(`\\bP${k + 1}\\b`, "g"), ind.short[k]); });
  // One pass, longest phrase first, so a replacement is never re-replaced ("Workers" -> "Site workers" stays put).
  const keys = Object.keys(ind.words).sort((a, b) => b.length - a.length);
  if (keys.length) s = s.replace(new RegExp(keys.join("|"), "g"), (m) => (ind.words as Record<string, string>)[m] ?? m); // keys are plain words, no regex symbols
  ["Export", "South", "West", "North"].forEach((r, k) => { s = s.replace(new RegExp(`\\b${r}\\b`, "g"), ind.regions[k]); });
  return s.replace("Industry Regulatory Authority", ind.regulator);
}
