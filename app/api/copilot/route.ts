import { expected, generateTask, type Task } from "@/lib/tasks";

export const dynamic = "force-dynamic";

const TARGET: Record<Task["kind"], string> = {
  multiply: "Строка × столбец",
  order: "Порядок умножения · ошибка 40% группы",
  rotate: "Столбцы = образы базиса",
  reflect: "Ось отражения",
};

export async function POST(req: Request) {
  const { variants = 2, focus = true } = (await req.json()) as { variants?: number; focus?: boolean };
  await new Promise((r) => setTimeout(r, 1500));
  const out = Array.from({ length: variants }, (_, v) => {
    const raw = [generateTask(0), generateTask(4), focus ? generateTask(0, "order") : generateTask(1), generateTask(2), generateTask(3)];
    return {
      name: `Вариант ${v + 1}`,
      tasks: raw.map((t) => ({ ...t, answer: expected(t), target: TARGET[t.kind] })),
    };
  });
  return Response.json({ variants: out });
}
