import type { NextRequest } from "next/server";
import { checkAnswer, generateTask, type Task } from "@/lib/tasks";
import type { M2 } from "@/lib/matrix";

export const dynamic = "force-dynamic";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  await delay(350);
  return Response.json(generateTask(Number(sp.get("solved") ?? 0), sp.get("focus") ?? undefined));
}

export async function POST(req: Request) {
  const { task, answer } = (await req.json()) as { task: Task; answer: M2 };
  await delay(300);
  return Response.json(checkAnswer(task, answer));
}
