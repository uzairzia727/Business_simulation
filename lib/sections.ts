// Company portal sections: shared by the global sidebar (links) and the team page (content).
export const SECTIONS = [
  { id: "dashboard", name: "Dashboard", icon: "M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z" },
  { id: "sales", name: "Sales & marketing", icon: "M3 11l18-8v18L3 13v-2Zm4 3v5h3v-4" },
  { id: "operations", name: "Operations", icon: "M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6" },
  { id: "people", name: "People", icon: "M16 11a4 4 0 1 0-8 0M4 21a8 8 0 0 1 16 0" },
  { id: "finance", name: "Finance", icon: "M12 3v18M17 7H9.5a3 3 0 0 0 0 6h5a3 3 0 0 1 0 6H6" },
  { id: "strategy", name: "Strategy & AI", icon: "M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.5-.8L12 3Z" },
  { id: "report", name: "Quarterly report", icon: "M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h6" },
] as const;
export type SectionId = (typeof SECTIONS)[number]["id"];
export const sectionName = (id: SectionId, industryName: string) =>
  id === "operations" && industryName === "Real estate" ? "Projects & construction" : SECTIONS.find((s) => s.id === id)!.name;
