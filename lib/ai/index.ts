import type { AiReply, ChatRequest, Widget } from "../types";
import { mockReply } from "./mock";

const SYSTEM = `Ты — Билим, ИИ-напарник студента ОшМПУ по теме «Линейная алгебра: матрицы».
Шаг «Знакомство»: сначала мотивируй (крючок по интересам студента → главная задача: сам ИИ работает на умножении матриц → карта применений → обещание миссии), потом объясняй.
Не давай готовых ответов к задачам — подводи наводящими вопросами. Отвечай на языке студента (кыргызский или русский), коротко.
Отвечай ТОЛЬКО JSON без markdown:
{"text": string, "widget"?: {"type":"matrix","matrix":[a,b,c,d],"caption"?:string} | {"type":"apps"} | {"type":"missions"} | {"type":"cta","step":"practice"|"mission","label":string}, "suggestions"?: string[]}
matrix — интерактивная модель 2×2 [[a,b],[c,d]], которую фронт нарисует.`;

function parseReply(raw: string): AiReply {
  const match = raw.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      const j = JSON.parse(match[0]) as { text?: unknown; widget?: Widget; suggestions?: unknown };
      if (typeof j.text === "string")
        return {
          text: j.text,
          widget: j.widget,
          suggestions: Array.isArray(j.suggestions) ? j.suggestions.filter((s): s is string => typeof s === "string") : undefined,
          mode: "live",
        };
    } catch {
      /* fallthrough */
    }
  }
  return { text: raw, mode: "live" };
}

export async function aiReply(req: ChatRequest): Promise<AiReply> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (process.env.AI_MODE !== "live" || !key) return { ...mockReply(req), mode: "mock" };

  // Сообщения должны чередоваться и начинаться с user
  const msgs: { role: "user" | "assistant"; content: string }[] = [];
  const push = (role: "user" | "assistant", content: string) => {
    const last = msgs[msgs.length - 1];
    if (last && last.role === role) last.content += "\n\n" + content;
    else msgs.push({ role, content });
  };
  push("user", `Начнём тему. Язык интерфейса: ${req.lang === "ky" ? "кыргызский" : "русский"}.`);
  for (const t of req.history) push(t.role === "ai" ? "assistant" : "user", t.text);
  if (req.level)
    push("user", `Объясни это ${req.level === "simple" ? "проще, на бытовой аналогии, без формул" : "строже, с формулами и определениями"}: ${req.about ?? ""}`);
  else if (req.message !== "__start__") push("user", req.message);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: process.env.AI_MODEL ?? "claude-opus-5-5", max_tokens: 1024, system: SYSTEM, messages: msgs }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text ?? "";
    return parseReply(text);
  } catch (e) {
    console.error("[ai] live failed, fallback to mock:", e);
    return { ...mockReply(req), mode: "mock" };
  }
}
