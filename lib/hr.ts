import { POSITIONS } from "./sim";
import type { Candidate, HR, PositionId } from "./sim";

// Candidate pool. True skill is hidden: the CV score is a rough guide (±20), an interview is much closer (±8).
const FIRST = ["Sana", "Usman", "Ayesha", "Bilal", "Hira", "Hamza", "Fatima", "Ali", "Zainab", "Omar", "Mahnoor", "Saad", "Iqra", "Faisal", "Maryam", "Ahmed", "Nimra", "Hassan", "Amna", "Tariq"];
const LAST = ["Malik", "Khan", "Aslam", "Farooq", "Mahmood", "Qureshi", "Siddiqui", "Butt", "Chaudhry", "Raza", "Sheikh", "Javed", "Iqbal", "Hussain", "Anwar"];
const EDU = ["MBA, LUMS", "MBA, IBA Karachi", "BBA, COMSATS", "MSc, NUST", "BSc Engineering, UET", "ACCA", "MBA, Quaid-i-Azam University", "BS, FAST", "MPhil, Punjab University"];
const PREV: Record<PositionId, string[]> = {
  ops: ["Plant supervisor", "Production planner", "Shift manager"],
  mkt: ["Brand manager", "Digital marketing lead", "Marketing executive"],
  sales: ["Regional sales lead", "Key account manager", "Sales executive"],
  fin: ["Senior accountant", "Treasury analyst", "Finance executive"],
  rnd: ["Product engineer", "Research scientist", "Design engineer"],
  hr: ["HR business partner", "Talent acquisition lead", "HR officer"],
};
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];
const clamp = (x: number) => Math.max(5, Math.min(99, Math.round(x)));
const noise = (r: number) => (Math.random() * 2 - 1) * r;

export function newCandidates(position: PositionId, n = 4): Candidate[] {
  return Array.from({ length: n }, () => {
    const skill = clamp(30 + Math.random() * 65);
    const years = Math.max(1, Math.round(skill / 6 + noise(4)));
    return {
      id: Math.random().toString(36).slice(2, 9), position, name: `${pick(FIRST)} ${pick(LAST)}`, years, education: pick(EDU),
      lastRole: pick(PREV[position]), skill, cv: clamp(skill + noise(20)),
      asking: Math.round((POSITIONS[position].base * (0.6 + (0.8 * skill) / 100)) / 1000) * 1000, status: "new",
    };
  });
}

export const interview = (c: Candidate): Candidate => ({ ...c, interview: clamp(c.skill + noise(8)), status: c.status === "new" ? "shortlisted" : c.status });
export const combined = (c: Candidate) => (c.interview === undefined ? c.cv : Math.round((c.cv + c.interview) / 2));

export function hire(hr: HR, c: Candidate, label: string, salary = c.asking): HR {
  return {
    ...hr,
    managers: { ...hr.managers, [c.position]: { name: c.name, skill: c.skill, salary, asking: c.asking, since: label } },
    candidates: (hr.candidates ?? []).map((x) => (x.id === c.id ? { ...x, status: "hired" as const } : x.position === c.position && x.status !== "rejected" ? { ...x, status: "rejected" as const } : x)),
    log: [`${label}: hired ${c.name} as ${POSITIONS[c.position].name}.`, ...(hr.log ?? [])].slice(0, 20),
  };
}

// Dismissal costs one quarter's salary as severance, charged this quarter.
export function fire(hr: HR, id: PositionId, label: string): HR {
  const m = hr.managers?.[id];
  if (!m) return hr;
  const managers = { ...hr.managers }; delete managers[id];
  return { ...hr, managers, severance: (hr.severance ?? 0) + m.salary, log: [`${label}: dismissed ${m.name} (${POSITIONS[id].name}), severance Rs ${m.salary.toLocaleString("en-PK")}.`, ...(hr.log ?? [])].slice(0, 20) };
}

// At quarter close: market pay rises with inflation; managers paid under 90% of their market rate resign. Severance is cleared.
export function closeHR(hr: HR | undefined, inflation: number, label: string): HR | undefined {
  if (!hr) return hr;
  const managers: HR["managers"] = {}, log = [...(hr.log ?? [])];
  for (const [id, m] of Object.entries(hr.managers ?? {}) as [PositionId, NonNullable<HR["managers"]>[PositionId]][]) {
    if (!m) continue;
    const asking = Math.round(m.asking * (1 + inflation / 4));
    if (m.salary < asking * 0.9) log.unshift(`${label}: ${m.name} (${POSITIONS[id].name}) resigned: salary below market rate.`);
    else managers[id] = { ...m, asking };
  }
  return { ...hr, managers, severance: 0, log: log.slice(0, 20) };
}
