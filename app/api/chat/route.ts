import { aiReply } from "@/lib/ai";
import type { ChatRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as ChatRequest;
  if (process.env.AI_MODE !== "live") await new Promise((r) => setTimeout(r, 700 + Math.random() * 500));
  return Response.json(await aiReply(body));
}
