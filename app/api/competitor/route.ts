import { ALL_IDS, FIELDS, REGION_ROWS, bounds } from "@/lib/sim";

// Competitor agent: plays one company for the next quarter. Reads its own results and the market,
// then returns new decisions as JSON. The simulation engine (not the AI) still calculates every result.
// Uses Groq's free API (same key as the Advisor).
// Smaller model by default: 8 companies decide in a row, and the free tier limits tokens per minute.
const MODEL = process.env.COMPETITOR_MODEL || "openai/gpt-oss-20b";

const FIELD_GUIDE = FIELDS.map(([id, label]) => `${id}: ${label}`).join("\n") + "\n" +
  REGION_ROWS.map((r) => `${r[1]}, ${r[2]}, ${r[3]}: units of Product 1, 2, 3 delivered to ${r[0]}`).join("\n");

const SYSTEM = `You are the CEO of one company in StrataSim, a business strategy simulation where 8 companies compete
for the same customers (3 products, 4 regions, currency Rs). You decide next quarter's decisions.
Goal: maximise total profit over the coming quarters while staying true to your company's strategist role.
How the market works: customers split between companies by relative price (strongest effect), marketing spend
(builds brand over time), salespeople per region, product quality (research builds it over time; major improvements
are permanent) and credit days. The economy (boom, recession, inflation, rate shock) changes total demand, price sensitivity,
material and wage costs, and the overdraft interest rate: adapt to it. You sell the smaller of units delivered and customer demand: unsold units become stock,
shortfalls are lost sales. Overtime is expensive; negative cash costs interest.
Decision ids:
${FIELD_GUIDE}
Respond with JSON only: {"reasoning": "<max 50 words, plain English>", "decisions": {"<id>": <number>, ...}}
Change between 3 and 15 decisions; omit ids you keep the same. Use realistic steps (prices usually within ±10% per quarter).`;

type Body = { company: string; role: string; focus: string; decisions: Record<string, string>; results: unknown; market: unknown; economy?: unknown };

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return Response.json({ error: "AI competitors need GROQ_API_KEY in the environment." }, { status: 503 });

  const b = (await req.json()) as Body;
  const user = JSON.stringify({ you: `${b.company}, role: ${b.role} — ${b.focus}`, currentDecisions: b.decisions, lastResults: b.results, market: b.market, economy: b.economy });

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL, temperature: 0.4, max_tokens: 4000, reasoning_effort: "low",
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: user }],
    }),
  });
  if (res.status === 429) {
    const wait = Math.min(60, Math.ceil(Number(res.headers.get("retry-after")) || 20));
    return Response.json({ error: "Free AI quota reached for this minute.", retryAfter: wait }, { status: 429 });
  }
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    console.error("competitor agent:", res.status, detail);
    return Response.json({ error: `AI error (${res.status}).` }, { status: 502 });
  }

  let out: { reasoning?: unknown; decisions?: Record<string, unknown> };
  try {
    const text: string = (await res.json()).choices?.[0]?.message?.content ?? "";
    out = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)); // tolerate text around the JSON
  }
  catch { return Response.json({ error: "The AI returned an unreadable answer." }, { status: 502 }); }

  // Never trust the model's numbers blindly: keep only known decisions, clamp to allowed ranges.
  const decisions: Record<string, string> = {};
  for (const [id, v] of Object.entries(out.decisions ?? {})) {
    const num = Number(v);
    if (!ALL_IDS.includes(id) || !Number.isFinite(num)) continue;
    const [lo, hi] = bounds(id);
    const clamped = Math.min(hi, Math.max(lo, num));
    decisions[id] = String(Number.isInteger(clamped) || id === "wage" ? Math.round(clamped * 100) / 100 : Math.round(clamped));
  }
  return Response.json({ reasoning: String(out.reasoning ?? "").slice(0, 400), decisions });
}
