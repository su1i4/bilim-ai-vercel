import { TEACHER } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  await new Promise((r) => setTimeout(r, 400));
  return Response.json(TEACHER);
}
