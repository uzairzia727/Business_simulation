// Advisor agent: reads one company's report and answers questions about it.
// Uses Groq's free API (OpenAI-compatible). Key: GROQ_API_KEY in .env.local and in Vercel env vars.
// Model can be changed with GROQ_MODEL without touching code.
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

const SYSTEM = `You are the business advisor inside StrataSim, a strategy simulation where 8 companies compete in one market
(3 products, 4 regions: Export, South, West, North; currency Pakistani rupees, Rs).
You receive one company's report data as JSON, plus a summary of its rivals.
Rules:
- Explain using the actual numbers in the data. Never invent figures.
- Be concise and practical: short paragraphs or bullets, plain English, no jargon without explanation.
- When asked what to do next, give 2-4 specific decision changes (e.g. "cut Product 1 home price from 150 to 140")
  and say which number in the report each change should improve.
- Unsold stock means too much was delivered; lost sales means too little. Market share depends on price,
  marketing, salespeople per region, product quality (research, improvements) and credit days, relative to rivals.
- The data includes the current economy (scenario, interest rate, inflation, demand change). Factor it into advice.
- If something cannot be answered from the data, say so.
- Format: plain text only. No Markdown: no tables, no ** or #. Use short lines starting with "- " for lists. Keep answers under 180 words.`;

type Msg = { role: "user" | "assistant"; text: string };

export async function POST(req: Request) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return Response.json({ error: "The advisor is not set up yet: add GROQ_API_KEY to the environment." }, { status: 503 });

  const { context, messages } = (await req.json()) as { context: unknown; messages: Msg[] };
  if (!Array.isArray(messages) || !messages.length) return Response.json({ error: "No question sent." }, { status: 400 });

  const chat = [
    { role: "system", content: `${SYSTEM}

Company data (JSON):
${JSON.stringify(context)}` },
    ...messages.slice(-12).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.text).slice(0, 2000) })),
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model: MODEL, messages: chat, max_tokens: 1500, temperature: 0.3 }),
  });
  if (res.status === 429) return Response.json({ error: "The free advisor quota is used up for now. Try again in a minute." }, { status: 429 });
  if (!res.ok) return Response.json({ error: `Advisor error (${res.status}). Please try again.` }, { status: 502 });

  const data = await res.json();
  const text: string = (data.choices?.[0]?.message?.content ?? "").trim();
  return Response.json({ text: text || "The advisor could not answer that. Try rephrasing." });
}
