"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowUpRight, CircleAlert, Printer, Rocket, Sparkles, TrendingUp, Users, Wand2, type LucideIcon } from "lucide-react";
import { api } from "@/lib/api";
import { TEACHER } from "@/lib/mock-data";
import { MatrixView } from "./matrix";
import type { Stat, StudentRow, SubmissionRow, TeacherData } from "@/lib/types";
import { Badge, Button, Card, Progress, cn } from "./ui";

const TEACHER_COURSE = TEACHER.course;
const ICONS: Record<Stat["key"], LucideIcon> = { students: Users, progress: TrendingUp, stuck: CircleAlert, missions: Rocket };

function Spark({ trend }: { trend: "up" | "down" }) {
  const d = trend === "up" ? "M0 18 L8 14 L14 16 L22 8 L30 10 L40 2" : "M0 4 L8 8 L14 6 L22 14 L30 12 L40 18";
  return (
    <svg viewBox="0 0 40 20" className="h-5 w-10">
      <path d={d} fill="none" stroke={trend === "up" ? "#22c55e" : "#ef4444"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StatCards({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((s, i) => {
        const hero = i === 0;
        const Icon = ICONS[s.key];
        return (
          <div
            key={s.key}
            className={cn(
              "relative rounded-[24px] p-4 sm:p-5",
              hero ? "bg-brand-600 text-white shadow-[0_14px_30px_-14px_rgba(79,76,230,.8)]" : "border border-slate-200/70 bg-white",
            )}
          >
            <span className={cn("grid h-9 w-9 place-items-center rounded-full", hero ? "bg-white/20" : "bg-brand-50 text-brand-600")}>
              <Icon size={16} />
            </span>
            <span
              className={cn(
                "absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full",
                hero ? "bg-white text-brand-600 ring-4 ring-page" : "border border-slate-200 text-slate-500",
              )}
            >
              <ArrowUpRight size={16} />
            </span>
            <p className={cn("mt-5 text-[10px] font-semibold uppercase tracking-wide sm:text-[11px]", hero ? "text-white/80" : "text-slate-500")}>
              {s.label}
            </p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-medium tracking-tight sm:text-3xl">{s.value}</p>
              {!hero && <Spark trend={s.trend} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ActivityChart({ data }: { data: number[] }) {
  const W = 600;
  const H = 170;
  const max = 100;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * W, H - (v / max) * (H - 20)] as const);
  const yAt = (x: number) => {
    const f = (x / W) * (data.length - 1);
    const i = Math.min(data.length - 2, Math.floor(f));
    const t = f - i;
    return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t;
  };
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
  const peak = data.length - 1;
  const days = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-44 w-full" preserveAspectRatio="none">
        {Array.from({ length: 150 }, (_, i) => {
          const x = (i / 149) * W;
          const hl = x > W * 0.72;
          return <line key={i} x1={x} x2={x} y1={yAt(x)} y2={H} stroke={hl ? "#a3e635" : "#e5e7ef"} strokeWidth={1.4} />;
        })}
        <path d={line} fill="none" stroke="#a1a5c4" strokeWidth={2} vectorEffect="non-scaling-stroke" />
      </svg>
      <div
        className="absolute -translate-x-full rounded-xl bg-gradient-to-br from-lime to-[#e8fb9c] px-3 py-1.5 text-ink shadow-lg"
        style={{ left: `${(peak / (data.length - 1)) * 100}%`, top: 0 }}
      >
        <p className="text-lg font-semibold leading-tight">+22%</p>
        <p className="text-[10px]">к прошлой неделе</p>
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        {data.map((_, i) => (
          <span key={i}>{days[i % 7]}</span>
        ))}
      </div>
    </div>
  );
}

export function StepsCards({ steps }: { steps: TeacherData["steps"] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((s) => (
        <Card key={s.label} className="p-4">
          <p className="text-sm font-semibold">{s.label}</p>
          <p className="text-[11px] text-slate-500">доля группы</p>
          <p className="my-3 text-3xl font-medium tracking-tight">{s.done}%</p>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
            <div>
              <p className="mb-1">Прошли</p>
              <div className="stripes-brand h-12 rounded-xl" style={{ opacity: 0.4 + s.done / 170 }} />
            </div>
            <div>
              <p className="mb-1">Застряли · {s.stuck}%</p>
              <div className={cn("h-12 rounded-xl", s.stuck > 10 ? "bg-lime" : "bg-amber-100")} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function ErrorsCard({ errors }: { errors: TeacherData["errors"] }) {
  return (
    <Card className="p-5">
      <p className="font-semibold">Типичные ошибки группы</p>
      <p className="mb-4 text-xs text-slate-500">ИИ собирает их из практики и разговоров</p>
      <div className="space-y-3.5">
        {errors.map((e, i) => (
          <div key={e.label}>
            <div className="mb-1.5 flex justify-between gap-3 text-sm">
              <span className={i === 0 ? "font-semibold" : ""}>{e.label}</span>
              <span className="font-semibold tabular-nums">{e.pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className={cn("h-full rounded-full", i === 0 ? "bg-brand-600" : "bg-brand-300")} style={{ width: `${e.pct * 2}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex gap-2.5 rounded-2xl bg-lime-soft px-4 py-3 text-xs leading-relaxed text-lime-900">
        <Sparkles size={15} className="mt-0.5 shrink-0" />
        {errors[0]?.pct}% путают порядок умножения — ИИ уже даёт этим студентам задачи ровно на эту ошибку.
      </div>
    </Card>
  );
}

export function Heatmap({ concepts, students, live }: { concepts: string[]; students: StudentRow[]; live?: string }) {
  return (
    <Card className="p-5">
      <p className="font-semibold">Карта понимания</p>
      <p className="mb-4 text-xs text-slate-500">Студент × понятие, насколько освоено</p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-separate border-spacing-1 text-xs">
          <thead>
            <tr>
              <th />
              {concepts.map((c) => (
                <th key={c} className="pb-1 font-medium text-slate-500">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.name}>
                <td className={cn("whitespace-nowrap pr-2 font-medium", s.name === live && "text-brand-700")}>
                  {s.name}
                  {s.name === live && <span className="ml-1.5 rounded-full bg-lime px-1.5 py-0.5 text-[9px] font-bold text-ink">LIVE</span>}
                </td>
                {s.mastery.map((v, i) => (
                  <td
                    key={i}
                    className={cn("h-8 rounded-lg text-center font-semibold", v > 55 ? "text-white" : "text-brand-700")}
                    style={{ background: v < 35 ? "#fde68a" : `rgba(79,76,230,${0.12 + (v / 100) * 0.88})` }}
                  >
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">Жёлтым — зона риска (&lt;35%).</p>
    </Card>
  );
}

const STEP_LABEL = { intro: "Знакомство", practice: "Практика", teach: "Научи ИИ", mission: "Миссия" } as const;
const STATUS = {
  ok: { label: "Учится", tone: "brand" },
  stuck: { label: "Застрял", tone: "amber" },
  done: { label: "Готово", tone: "green" },
} as const;

export function StudentsTable({ students }: { students: StudentRow[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="px-5 pt-5">
        <p className="font-semibold">Студенты</p>
        <p className="text-xs text-slate-500">Где каждый находится прямо сейчас</p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-y border-slate-100 bg-slate-50/60 text-left text-[11px] font-semibold text-slate-500">
              <th className="px-5 py-2.5">Студент</th>
              <th className="px-3 py-2.5">Шаг</th>
              <th className="px-3 py-2.5">Статус</th>
              <th className="px-3 py-2.5">Типичная ошибка</th>
              <th className="px-5 py-2.5">Прогресс</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.name} className="border-b border-slate-100 last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                      {s.name.split(" ").map((w) => w[0]).join("")}
                    </span>
                    <span className="font-medium">{s.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-600">{STEP_LABEL[s.step]}</td>
                <td className="px-3 py-3">
                  <Badge tone={STATUS[s.status].tone}>{STATUS[s.status].label}</Badge>
                </td>
                <td className="px-3 py-3 text-xs text-slate-500">{s.lastError}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Progress value={s.progress} className="w-28" />
                    <span className="text-xs font-semibold tabular-nums">{s.progress}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function Submissions({ rows }: { rows: (SubmissionRow & { mine?: boolean })[] }) {
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">Миссии на проверку</p>
          <p className="text-xs text-slate-500">ИИ делает черновой разбор, итоговое решение — за вами</p>
        </div>
        <Badge tone="brand">{rows.length} работ</Badge>
      </div>
      <div className="space-y-3">
        {rows.map((r) => {
          const g = grades[r.id] ?? String(r.aiGrade);
          return (
            <div key={r.id} className={cn("rounded-2xl border p-4", r.mine ? "border-brand-200 bg-brand-50/40" : "border-slate-200/70")}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{r.student}</p>
                {r.mine && <Badge tone="lime">демо-студент · только что</Badge>}
                <span className="ml-auto text-[11px] text-slate-400">{r.at}</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{r.mission}</p>
              <div className="mt-3 flex gap-2 rounded-xl bg-white/80 px-3 py-2 text-xs text-slate-600">
                <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-500" />
                <span>
                  <b className="text-ink">Черновая оценка ИИ: {r.aiGrade}.</b> {r.aiComment}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-slate-500">Итог:</span>
                <input
                  value={g}
                  disabled={confirmed[r.id]}
                  onChange={(e) => setGrades({ ...grades, [r.id]: e.target.value })}
                  className="h-8 w-16 rounded-lg border border-slate-200 bg-white text-center text-sm font-semibold outline-none focus:border-brand-500"
                />
                {confirmed[r.id] ? (
                  <Badge tone="green">Оценка поставлена</Badge>
                ) : (
                  <Button size="sm" onClick={() => setConfirmed({ ...confirmed, [r.id]: true })}>
                    Поставить
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function exportCsv(students: StudentRow[], group: string) {
  const head = ["ФИО", "Шаг", "Статус", "Прогресс, %", "Типичная ошибка"];
  const rows = students.map((s) => [s.name, STEP_LABEL[s.step], STATUS[s.status].label, s.progress, s.lastError]);
  const csv = "﻿" + [head, ...rows].map((r) => r.join(";")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `bilim-ai-${group}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ================= ИИ-копилот преподавателя ================= */
export function Copilot() {
  const [variants, setVariants] = useState(2);
  const [focus, setFocus] = useState(true);
  const [tab, setTab] = useState(0);
  const [answers, setAnswers] = useState(false);
  const gen = useMutation({ mutationFn: () => api.copilot(variants, focus), onSuccess: () => setTab(0) });
  const v = gen.data?.variants[tab];

  return (
    <Card className="p-5 sm:p-6 print:border-0 print:shadow-none">
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-ink text-lime print:hidden">
          <Wand2 size={18} />
        </span>
        <div className="flex-1">
          <p className="font-semibold">ИИ-копилот · контрольная работа</p>
          <p className="text-xs text-slate-500">ИИ составляет варианты по теме и ошибкам группы, ответы проверены кодом</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
          {[2, 3].map((n) => (
            <button key={n} onClick={() => setVariants(n)} className={cn("rounded-lg px-3 py-1.5", variants === n ? "bg-white shadow-sm" : "text-slate-500")}>
              {n} варианта
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={focus} onChange={(e) => setFocus(e.target.checked)} className="accent-brand-600" />
          Учесть ошибки группы (порядок умножения, 40%)
        </label>
        <Button size="sm" className="ml-auto" onClick={() => gen.mutate()} disabled={gen.isPending}>
          <Sparkles size={14} /> {gen.isPending ? "ИИ составляет…" : gen.data ? "Сгенерировать заново" : "Сгенерировать"}
        </Button>
      </div>

      {gen.isPending && <div className="mt-5 h-48 animate-pulse rounded-2xl bg-slate-100" />}

      {v && !gen.isPending && (
        <div className="fade-in mt-5">
          <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
            {gen.data!.variants.map((x, i) => (
              <button
                key={x.name}
                onClick={() => setTab(i)}
                className={cn("rounded-full px-3 py-1 text-xs font-semibold", tab === i ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600")}
              >
                {x.name}
              </button>
            ))}
            <label className="ml-auto flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={answers} onChange={(e) => setAnswers(e.target.checked)} className="accent-brand-600" /> Ответы
            </label>
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer size={14} /> Печать
            </Button>
          </div>
          <p className="mb-3 hidden text-lg font-semibold print:block">Контрольная · {TEACHER_COURSE} · {v.name}</p>
          <ol className="space-y-3">
            {v.tasks.map((tk, i) => (
              <li key={tk.id} className="rounded-2xl border border-slate-200/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">№{i + 1}.</span>
                  <span className="text-sm">{tk.prompt}</span>
                  <Badge tone={tk.kind === "order" ? "amber" : "slate"} className="ml-auto print:hidden">{tk.target}</Badge>
                </div>
                {(tk.A || answers) && (
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    {tk.A && <MatrixView m={tk.A} label="A" />}
                    {tk.B && <MatrixView m={tk.B} label="B" />}
                    {answers && (
                      <span className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-1 text-green-800">
                        <span className="text-xs font-semibold">Ответ:</span> <MatrixView m={tk.answer} />
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}
