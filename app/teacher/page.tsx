"use client";

import { useQuery } from "@tanstack/react-query";
import { Download, Share2 } from "lucide-react";
import { api } from "@/lib/api";
import { DEMO_STUDENT } from "@/lib/mock-data";
import { useAppStore } from "@/store/use-app-store";
import { Badge, Button, Card } from "@/components/ui";
import { ActivityChart, Copilot, ErrorsCard, Heatmap, StatCards, StepsCards, StudentsTable, Submissions, exportCsv } from "@/components/teacher";
import type { StudentRow } from "@/lib/types";

export default function TeacherPage() {
  const q = useQuery({ queryKey: ["teacher"], queryFn: api.teacher });
  const local = useAppStore((s) => s.submissions);
  const solved = useAppStore((s) => s.solved);
  const mistakes = useAppStore((s) => s.mistakes);
  const teachScore = useAppStore((s) => s.teachScore);
  const missionsDone = useAppStore((s) => s.missionsDone);
  const d = q.data;

  if (!d)
    return (
      <main className="mx-auto max-w-6xl space-y-4 px-4 pt-8">
        <div className="h-16 w-72 animate-pulse rounded-2xl bg-white" />
        <div className="h-36 animate-pulse rounded-[28px] bg-white" />
        <div className="h-72 animate-pulse rounded-[28px] bg-white" />
      </main>
    );

  // Строка демо-студента считается из его реальных действий (задачи, ошибки, «Научи ИИ»)
  const clamp = (v: number) => Math.max(5, Math.min(100, Math.round(v)));
  const base = 25 + solved * 12 + (teachScore ?? 0) / 6;
  const pen = (k: string) => (mistakes[k] ?? 0) * 12;
  const demoRow: StudentRow | null =
    solved > 0 || teachScore !== null || Object.keys(mistakes).length
      ? {
          name: DEMO_STUDENT,
          step: missionsDone.length ? "mission" : teachScore !== null ? "teach" : "practice",
          progress: clamp(base),
          status: "ok",
          mastery: [
            clamp(base - pen("index")),
            clamp(base - pen("order")),
            clamp(base - pen("basis") - pen("sign") - (solved > 2 ? 0 : 20)),
            clamp(base - pen("reflect") - (solved > 3 ? 0 : 20)),
            clamp(solved >= 5 ? 50 : 20),
          ],
          lastError: Object.entries(mistakes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—",
        }
      : null;
  const heat = demoRow ? [demoRow, ...d.students] : d.students;

  const mine = local.map((s) => ({
    id: `local-${s.missionId}`,
    student: DEMO_STUDENT,
    mission: s.title,
    aiGrade: s.aiGrade,
    aiComment: s.aiComment,
    at: new Date(s.at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    mine: true,
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-8">
      <section className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Добрый день,</p>
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            {d.name} <Badge tone="amber">{d.group}</Badge>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {d.dept} · {d.course}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => exportCsv(d.students, d.group)}>
            <Download size={14} /> Экспорт в Excel
          </Button>
          <Button size="sm" variant="outline">
            <Share2 size={14} /> Поделиться
          </Button>
        </div>
      </section>

      <StatCards stats={d.stats} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="p-5">
          <p className="font-semibold">Активность группы</p>
          <p className="mb-4 text-xs text-slate-500">Решённые задачи и сообщения ИИ за 14 дней</p>
          <ActivityChart data={d.activity} />
        </Card>
        <ErrorsCard errors={d.errors} />
      </div>

      <div className="mt-4">
        <StepsCards steps={d.steps} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Heatmap concepts={d.concepts} students={heat} live={demoRow ? DEMO_STUDENT : undefined} />
        <Submissions rows={[...mine, ...d.submissions]} />
      </div>

      <div className="mt-4">
        <Copilot />
      </div>

      <div className="mt-4">
        <StudentsTable students={d.students} />
      </div>
    </main>
  );
}
