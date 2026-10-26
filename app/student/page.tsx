"use client";

import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, GraduationCap, Lock, MessageCircle, PenLine, RotateCcw, Rocket, Zap,
} from "lucide-react";
import { MISTAKE_LABELS, type MistakeTag } from "@/lib/tasks";
import { DEMO_STUDENT, TEACHER } from "@/lib/mock-data";
import type { Step } from "@/lib/types";
import { useAppStore, useT } from "@/store/use-app-store";
import { Badge, Button, Card, Progress, cn } from "@/components/ui";
import { IntroChat } from "@/components/student/intro-chat";
import { Practice } from "@/components/student/practice";
import { TeachAI } from "@/components/student/teach-ai";
import { Missions } from "@/components/student/missions";

const STEPS: { key: Step; icon: typeof MessageCircle }[] = [
  { key: "intro", icon: MessageCircle },
  { key: "practice", icon: PenLine },
  { key: "teach", icon: GraduationCap },
  { key: "mission", icon: Rocket },
];

export default function StudentPage() {
  const t = useT();
  const step = useAppStore((s) => s.step);
  const setStep = useAppStore((s) => s.setStep);
  const xp = useAppStore((s) => s.xp);
  const solved = useAppStore((s) => s.solved);
  const mistakes = useAppStore((s) => s.mistakes);
  const missionsDone = useAppStore((s) => s.missionsDone);
  const teachScore = useAppStore((s) => s.teachScore);
  const reset = useAppStore((s) => s.reset);

  const doneMap: Record<Step, boolean> = {
    intro: step !== "intro" || solved > 0,
    practice: solved >= 5,
    teach: teachScore !== null,
    mission: missionsDone.length > 0,
  };
  const doneCount = Object.values(doneMap).filter(Boolean).length;
  const lessonPct = Math.round((doneCount / STEPS.length) * 100);
  const coursePct = Math.round(((1 + doneCount / STEPS.length) / 6) * 100);
  const idx = STEPS.findIndex((s) => s.key === step);
  const gaps = Object.entries(mistakes).sort((a, b) => b[1] - a[1]);

  const sidebar = (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/70">Курс</p>
          <p className="mt-1 font-semibold leading-snug">Линейная алгебра</p>
          <p className="mt-0.5 text-xs text-white/70">{TEACHER.name}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
              <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${coursePct}%` }} />
            </div>
            <span className="text-xs font-semibold">{coursePct}%</span>
          </div>
        </div>
        <div className="p-3">
          <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Модуль 1 · Матрицы</p>
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm text-slate-500">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-green-500 text-white"><Check size={13} /></span>
            Что такое матрица
          </div>
          <div className="rounded-2xl bg-brand-50/70 p-2">
            <div className="flex items-center gap-2.5 px-0.5 py-1 text-sm font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-600 text-white"><BookOpen size={12} /></span>
              Умножение и преобразования
            </div>
            <ol className="mt-1 space-y-0.5 pl-1">
              {STEPS.map(({ key }, i) => (
                <li key={key}>
                  <button
                    onClick={() => setStep(key)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition",
                      step === key ? "bg-white font-semibold shadow-sm" : "text-slate-600 hover:bg-white/70",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                        doneMap[key] ? "bg-green-500 text-white" : step === key ? "bg-brand-600 text-white" : "bg-slate-200 text-slate-500",
                      )}
                    >
                      {doneMap[key] ? <Check size={11} /> : i + 1}
                    </span>
                    {t(`step_${key}`)}
                    {key === "practice" && !doneMap.practice && <span className="ml-auto text-[11px] text-slate-400">{solved}/5</span>}
                  </button>
                </li>
              ))}
            </ol>
          </div>
          {["Определитель", "Обратная матрица"].map((l) => (
            <div key={l} className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm text-slate-400">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100"><Lock size={11} /></span>
              {l}
            </div>
          ))}
          <p className="px-2 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Модуль 2 · Системы уравнений</p>
          <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 text-sm text-slate-400">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100"><Lock size={11} /></span>
            Откроется после модуля 1
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-1 font-semibold">{t("my_gaps")}</p>
        {gaps.length === 0 ? (
          <p className="text-xs leading-relaxed text-slate-500">Пока чисто. Ошибки из практики появятся здесь — и задачи подстроятся под них.</p>
        ) : (
          <div className="mt-3 space-y-2.5">
            {gaps.map(([tag, n]) => (
              <div key={tag}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{MISTAKE_LABELS[tag as MistakeTag] ?? tag}</span>
                  <span className="font-semibold">×{n}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="stripes-brand h-full rounded-full" style={{ width: `${Math.min(100, n * 25)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <button onClick={reset} className="flex w-full items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-slate-600">
        <RotateCcw size={12} /> Сбросить демо (для повторного показа)
      </button>
    </div>
  );

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-6">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="order-2 lg:order-1">{sidebar}</aside>

        <section className="order-1 min-w-0 lg:order-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                Линейная алгебра <ChevronRight size={12} /> Модуль 1 <ChevronRight size={12} /> Урок 2
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight">Умножение и преобразования</h1>
              <p className="mt-0.5 flex items-center gap-2 text-sm text-slate-500">
                {DEMO_STUDENT} <Badge tone="amber">МКТ-1-25</Badge>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-2xl bg-brand-600 px-3.5 py-2 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-white/70">Опыт</p>
                <p className="flex items-center gap-1 font-semibold"><Zap size={14} className="fill-lime text-lime" /> {xp} XP</p>
              </div>
              <div className="w-28 rounded-2xl border border-slate-200 bg-white px-3.5 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Урок</p>
                <p className="font-semibold">{lessonPct}%</p>
                <Progress value={lessonPct} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="no-scrollbar -mx-4 mb-5 overflow-x-auto px-4">
            <div className="inline-flex gap-1 rounded-full border border-slate-200/80 bg-white p-1 shadow-sm">
              {STEPS.map(({ key, icon: Icon }, i) => (
                <button
                  key={key}
                  onClick={() => setStep(key)}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition",
                    step === key ? "bg-brand-600 text-white shadow-[0_6px_16px_-6px_rgba(79,76,230,.7)]" : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {doneMap[key] && step !== key ? <Check size={15} className="text-green-500" /> : <Icon size={15} />}
                  {i + 1}. {t(`step_${key}`)}
                </button>
              ))}
            </div>
          </div>

          <div key={step} className="fade-in">
            {step === "intro" ? <IntroChat /> : step === "practice" ? <Practice /> : step === "teach" ? <TeachAI /> : <Missions />}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <Button variant="outline" disabled={idx === 0} onClick={() => setStep(STEPS[idx - 1].key)}>
              <ArrowLeft size={16} /> Назад
            </Button>
            <span className="text-xs text-slate-400">Шаг {idx + 1} из {STEPS.length}</span>
            <Button disabled={idx === STEPS.length - 1} onClick={() => setStep(STEPS[idx + 1].key)}>
              Далее <ArrowRight size={16} />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
