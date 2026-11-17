// Advisor agent: reads one company's report and answers questions about it.
// Uses Google's Gemini API (free tier). Key: GEMINI_API_KEY in .env.local and in Vercel env vars.
// Model can be changed with GEMINI_MODEL without touching code.
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
- If something cannot be answered from the data, say so.`;

type Msg = { role: "user" | "assistant"; text: string };

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return Response.json({ error: "The advisor is not set up yet: add GEMINI_API_KEY to the environment." }, { status: 503 });

  const { context, messages } = (await req.json()) as { context: unknown; messages: Msg[] };
  if (!Array.isArray(messages) || !messages.length) return Response.json({ error: "No question sent." }, { status: 400 });

  const contents = [
    { role: "user", parts: [{ text: `Company data (JSON):\n${JSON.stringify(context)}` }] },
    { role: "model", parts: [{ text: "Understood. I have the report data." }] },
    ...messages.slice(-12).map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: String(m.text).slice(0, 2000) }] })),
  ];

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM }] }, contents, generationConfig: { maxOutputTokens: 2048 } }),
  });
  if (res.status === 429) return Response.json({ error: "The free advisor quota is used up for now. Try again in a minute." }, { status: 429 });
  if (!res.ok) return Response.json({ error: `Advisor error (${res.status}). Please try again.` }, { status: 502 });

  const data = await res.json();
  const text: string = (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim();
  return Response.json({ text: text || "The advisor could not answer that. Try rephrasing." });
}
