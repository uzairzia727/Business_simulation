import { CHANNELS } from "@/lib/marketing";

// Marketing agent: splits one quarter's marketing budget across channels and products, and writes a short ad line
// for each channel used. Planning only — it never posts anywhere. Uses Groq's free API (same key as the Advisor).
const MODEL = process.env.COMPETITOR_MODEL || "openai/gpt-oss-20b";

const SYSTEM = `You are the AI marketing manager of one company in StrataSim, a business strategy simulation in Pakistan
(currency Rs, amounts in Rs 000). The company sells Products 1, 2 and 3 (3 is the premium product).
Split the quarter's marketing budget across the allowed channels and products.
Spend beyond a channel's saturation point is mostly wasted, so spread money across channels that fit each product;
use export-reaching channels for products that sell abroad. Favour products with lost sales or
strong margins, cut spend on products with unsold stock, and match the company's strategist role.
Channels:
${CHANNELS.map((c) => `${c.id}: ${c.name} — ${c.note}; fit for P1/P2/P3 ${c.fit.join("/")} (1 = average); ${Math.round(c.export * 100)}% export reach; saturates around Rs ${c.sat}k per product`).join("\n")}
Respond with JSON only:
{"reasoning":"<max 45 words>","plan":[{"channel":"<id>","p1":<Rs 000>,"p2":<Rs 000>,"p3":<Rs 000>,"ad":"<ad line, max 14 words>"}]}
Use only allowed channel ids. The total of all p1+p2+p3 must not exceed the budget.`;

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return Response.json({ error: "The marketing agent needs GROQ_API_KEY in the environment." }, { status: 503 });

  const b = await req.json() as { budget: number; channels: string[]; company: unknown };
  const budget = Math.max(0, Math.min(1000, Number(b.budget) || 0));
  const allowed = CHANNELS.filter((c) => b.channels?.includes(c.id)).map((c) => c.id as string);
  if (!budget || !allowed.length) return Response.json({ error: "Set a budget and pick at least one channel." }, { status: 400 });

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: MODEL, temperature: 0.5, max_tokens: 3000, reasoning_effort: "low",
      messages: [{ role: "system", content: SYSTEM }, { role: "user", content: JSON.stringify({ budget, allowedChannels: allowed, company: b.company }) }],
    }),
  });
  if (res.status === 429) return Response.json({ error: "Free AI quota reached for this minute. Try again shortly." }, { status: 429 });
  if (!res.ok) { console.error("marketing agent:", res.status, (await res.text()).slice(0, 300)); return Response.json({ error: `AI error (${res.status}).` }, { status: 502 }); }

  let out: { reasoning?: unknown; plan?: { channel?: string; p1?: unknown; p2?: unknown; p3?: unknown; ad?: unknown }[] };
  try {
    const text: string = (await res.json()).choices?.[0]?.message?.content ?? "";
    out = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  } catch { return Response.json({ error: "The AI returned an unreadable answer." }, { status: 502 }); }

  // Validate: known channels only, non-negative whole numbers, scaled down if the AI overspent.
  const num = (v: unknown) => Math.max(0, Math.round(Number(v) || 0));
  let plan = (out.plan ?? []).filter((r) => allowed.includes(String(r.channel)))
    .map((r) => ({ channel: String(r.channel), p1: num(r.p1), p2: num(r.p2), p3: num(r.p3), ad: String(r.ad ?? "").slice(0, 120) }));
  const total = plan.reduce((s, r) => s + r.p1 + r.p2 + r.p3, 0);
  if (total > budget) { const k = budget / total; plan = plan.map((r) => ({ ...r, p1: Math.floor(r.p1 * k), p2: Math.floor(r.p2 * k), p3: Math.floor(r.p3 * k) })); }
  if (!plan.length) return Response.json({ error: "The AI did not return a usable plan. Try again." }, { status: 502 });
  return Response.json({ reasoning: String(out.reasoning ?? "").slice(0, 400), plan });
}
