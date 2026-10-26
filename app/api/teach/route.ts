import { teachReply } from "@/lib/ai/teach";
import type { TeachRequest } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = (await req.json()) as TeachRequest;
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 500));
  return Response.json(teachReply(body));
}
