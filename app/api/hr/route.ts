import { POSITIONS, PositionId } from "@/lib/sim";

// HR screening agent: reviews candidates' CVs for one position and recommends who to interview.
// The AI only recommends; the company's HR decision is the user's. It never sees the hidden true skill.
const MODEL = process.env.COMPETITOR_MODEL || "openai/gpt-oss-20b";
const LEVELS = ["Strong match", "Worth interviewing", "Not recommended"];

type C = { id: string; name: string; years: number; education: string; lastRole: string; cv: number; asking: number };

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return Response.json({ error: "AI screening needs GROQ_API_KEY in the environment." }, { status: 503 });
  const { position, candidates, company } = await req.json() as { position: PositionId; candidates: C[]; company: unknown };
  if (!(position in POSITIONS) || !Array.isArray(candidates) || !candidates.length) return Response.json({ error: "No candidates to screen." }, { status: 400 });

  const system = `You are the HR screening assistant of a company in StrataSim, a business simulation in Pakistan (salaries in Rs per quarter).
Position: ${POSITIONS[position].name}. The role's impact: ${POSITIONS[position].effect}.
Review each candidate's CV (experience, education, last role, CV score out of 100, asking salary) and recommend one of:
${LEVELS.join(", ")}. Weigh quality against salary cost for this company. You recommend; the HR manager decides.
Respond with JSON only: {"ranking":[{"id":"<id>","recommendation":"<one of the options>","reason":"<max 18 words>"}]}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL, temperature: 0.3, max_tokens: 2500, reasoning_effort: "low",
      messages: [{ role: "system", content: system }, { role: "user", content: JSON.stringify({ company, candidates: candidates.slice(0, 8).map(({ id, name, years, education, lastRole, cv, asking }) => ({ id, name, years, education, lastRole, cv, asking })) }) }],
    }),
  });
  if (res.status === 429) return Response.json({ error: "Free AI quota reached for this minute. Try again shortly." }, { status: 429 });
  if (!res.ok) { console.error("hr agent:", res.status, (await res.text()).slice(0, 300)); return Response.json({ error: `AI error (${res.status}).` }, { status: 502 }); }

  try {
    const text: string = (await res.json()).choices?.[0]?.message?.content ?? "";
    const out = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as { ranking?: { id?: string; recommendation?: string; reason?: string }[] };
    const ids = new Set(candidates.map((c) => c.id));
    const ranking = (out.ranking ?? []).filter((r) => ids.has(String(r.id))).map((r) => ({
      id: String(r.id), recommendation: LEVELS.includes(String(r.recommendation)) ? String(r.recommendation) : "Worth interviewing", reason: String(r.reason ?? "").slice(0, 160),
    }));
    return Response.json({ ranking });
  } catch { return Response.json({ error: "The AI returned an unreadable answer." }, { status: 502 }); }
}
