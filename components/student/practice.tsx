"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowRight, Camera, CheckCircle2, Lightbulb, RotateCcw, Sparkles, Target } from "lucide-react";
import { PhotoCheck } from "./photo-check";
import { api } from "@/lib/api";
import { parseM } from "@/lib/matrix";
import type { CheckResult } from "@/lib/tasks";
import { useAppStore, useT } from "@/store/use-app-store";
import { Badge, Button, Card, Progress } from "../ui";
import { MatrixInput, MatrixView, ShapePreview } from "../matrix";

const GOAL = 5;
const EMPTY = ["", "", "", ""];

export function Practice() {
  const t = useT();
  const solved = useAppStore((s) => s.solved);
  const incSolved = useAppStore((s) => s.incSolved);
  const addXp = useAppStore((s) => s.addXp);
  const addMistake = useAppStore((s) => s.addMistake);
  const setStep = useAppStore((s) => s.setStep);

  const [focus, setFocus] = useState<string | undefined>();
  const q = useQuery({ queryKey: ["task", solved, focus], queryFn: () => api.nextTask(solved, focus), staleTime: Infinity });
  const task = q.data;

  const [vals, setVals] = useState(EMPTY);
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [photo, setPhoto] = useState(false);

  useEffect(() => {
    setVals(EMPTY);
    setHints(0);
    setResult(null);
  }, [task?.id]);

  const parsed = parseM(vals);
  const check = useMutation({
    mutationFn: () => api.check(task!, parsed!),
    onSuccess: (r) => {
      setResult(r);
      if (r.correct) addXp(hints ? 10 : 20);
      else if (r.tag) addMistake(r.tag);
    },
  });

  const next = () => {
    setFocus(undefined);
    incSolved();
  };
  const drill = () => {
    if (focus === "order") q.refetch();
    else setFocus("order");
  };

  return (
    <div className="space-y-4">
      {solved >= GOAL && (
        <Card className="fade-in flex flex-wrap items-center gap-4 border-lime bg-lime-soft p-5">
          <Target className="text-lime-800" />
          <div className="flex-1">
            <p className="font-semibold">Рука набита — можно к миссии!</p>
            <p className="text-sm text-slate-600">Решено {solved} задач. Можно продолжить тренировку или выбрать проект.</p>
          </div>
          <Button variant="dark" onClick={() => setStep("mission")}>
            К миссиям <ArrowRight size={16} />
          </Button>
        </Card>
      )}

      <Card className="p-5 sm:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              {task && <Badge tone={task.kind === "order" ? "amber" : "brand"}>{task.title}</Badge>}
            </div>
            <h2 className="text-xl font-semibold tracking-tight">{task?.prompt ?? "ИИ подбирает задачу…"}</h2>
          </div>
          <div className="w-40">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Решено</span>
              <span className="font-semibold text-ink">{Math.min(solved, GOAL)}/{GOAL}</span>
            </div>
            <Progress value={(Math.min(solved, GOAL) / GOAL) * 100} tone="brand" />
          </div>
        </div>

        {q.isLoading || !task ? (
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        ) : (
          <div className="fade-in">
            {task.geometric ? (
              <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,260px)_1fr]">
                <ShapePreview m={parsed} />
                <div>
                  <p className="mb-3 text-sm text-slate-500">Введи матрицу — фигура слева сразу покажет результат.</p>
                  <MatrixInput value={vals} onChange={(v) => { setVals(v); setResult(null); }} />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <MatrixView m={task.A!} label="A" />
                <MatrixView m={task.B!} label="B" />
                <span className="text-lg font-bold text-slate-400">→ {task.kind === "order" ? "B·A" : "A·B"} =</span>
                <MatrixInput
                  value={vals}
                  bad={result && !result.correct ? result.wrongCells : []}
                  onChange={(v) => { setVals(v); setResult(null); }}
                />
              </div>
            )}

            {hints > 0 && (
              <div className="mt-5 space-y-2">
                {task.hints.slice(0, hints).map((h) => (
                  <div key={h} className="fade-in flex gap-2.5 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
                    <Sparkles size={16} className="mt-0.5 shrink-0" /> {h}
                  </div>
                ))}
              </div>
            )}

            {result && (
              <div
                className={
                  "fade-in mt-5 flex gap-2.5 rounded-2xl px-4 py-3 text-sm " +
                  (result.correct ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800")
                }
              >
                {result.correct ? <CheckCircle2 size={18} className="shrink-0" /> : <Sparkles size={18} className="shrink-0" />}
                <span>
                  {result.feedback}
                  {result.correct && <b className="ml-1">+{hints ? 10 : 20} XP</b>}
                </span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              {result?.correct ? (
                <Button onClick={next}>
                  {t("next")} <ArrowRight size={16} />
                </Button>
              ) : (
                <Button onClick={() => check.mutate()} disabled={!parsed || check.isPending}>
                  {t("check")}
                </Button>
              )}
              {!result?.correct && (
                <Button variant="outline" onClick={() => setHints((h) => h + 1)} disabled={hints >= task.hints.length}>
                  <Lightbulb size={16} /> {t("hint")} {hints > 0 && `${hints}/${task.hints.length}`}
                </Button>
              )}
              <Button variant="ghost" onClick={() => setPhoto(true)} className="sm:ml-auto">
                <Camera size={16} /> Решил в тетради? Сфоткай
              </Button>
              {result?.tag === "order" && (
                <Button variant="lime" onClick={drill}>
                  <RotateCcw size={16} /> Задача на эту ошибку
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
      {photo && <PhotoCheck onClose={() => setPhoto(false)} />}
    </div>
  );
}
