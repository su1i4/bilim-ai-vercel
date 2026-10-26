"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, Camera, CheckCircle2, CornerDownRight, ScanLine, Sparkles, X } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-app-store";
import { Button, Card, cn } from "../ui";

const HAND = { fontFamily: "'Caveat', cursive", fontSize: 28, fill: "#1e3a8a" } as const;

function Notebook({ marked }: { marked: boolean }) {
  return (
    <svg viewBox="0 0 520 270" className="h-auto w-full rounded-2xl border border-slate-200 bg-[#fffdf6]">
      {Array.from({ length: 27 }, (_, i) => (
        <line key={`v${i}`} x1={i * 20} y1={0} x2={i * 20} y2={270} stroke="#dbe6f5" />
      ))}
      {Array.from({ length: 14 }, (_, i) => (
        <line key={`h${i}`} x1={0} y1={i * 20} x2={520} y2={i * 20} stroke="#dbe6f5" />
      ))}
      <line x1={42} y1={0} x2={42} y2={270} stroke="#f4a3a3" strokeWidth={1.5} />
      <text x={56} y={48} {...HAND}>A = [2 1; 0 3],   B = [1 4; 2 1]</text>
      <text x={56} y={108} {...HAND}>A·B =</text>
      <text x={136} y={100} {...HAND}>[ 2·1+1·2</text>
      <text x={280} y={100} {...HAND}>2·4+</text>
      <text x={330} y={100} {...HAND}>1·2</text>
      <text x={372} y={100} {...HAND}>]</text>
      <text x={136} y={140} {...HAND}>[ 0·1+3·2</text>
      <text x={280} y={140} {...HAND}>0·4+3·1</text>
      <text x={372} y={140} {...HAND}>]</text>
      <text x={100} y={205} {...HAND}>=</text>
      <text x={136} y={200} {...HAND}>[ 4</text>
      <text x={206} y={200} {...HAND}>10</text>
      <text x={246} y={200} {...HAND}>]</text>
      <text x={136} y={240} {...HAND}>[ 6</text>
      <text x={212} y={240} {...HAND}>3</text>
      <text x={246} y={240} {...HAND}>]</text>
      {marked && (
        <g className="fade-in">
          <ellipse cx={346} cy={92} rx={28} ry={19} fill="none" stroke="#ef4444" strokeWidth={2.5} />
          <text x={378} y={70} fontSize={15} fontWeight={700} fill="#ef4444">шаг 2</text>
          <ellipse cx={218} cy={192} rx={22} ry={17} fill="none" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" />
        </g>
      )}
    </svg>
  );
}

export function PhotoCheck({ onClose }: { onClose: () => void }) {
  const addMistake = useAppStore((s) => s.addMistake);
  const [img, setImg] = useState<string | null>(null);
  const a = useMutation({ mutationFn: api.photo, onSuccess: () => addMistake("index") });

  return (
    <Card className="fade-in p-5 sm:p-6">
      <div className="mb-4 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Camera size={18} />
        </span>
        <div>
          <p className="font-semibold">Проверка решения из тетради</p>
          <p className="text-xs text-slate-500">ИИ находит шаг с ошибкой и задаёт вопрос — ответ не подсказывает</p>
        </div>
        <button onClick={onClose} className="ml-auto text-slate-400 hover:text-ink" aria-label="close">
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="relative">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="Фото решения" className="w-full rounded-2xl border border-slate-200 object-contain" />
          ) : (
            <Notebook marked={a.isSuccess} />
          )}
          {a.isPending && (
            <div className="absolute inset-0 grid place-items-center rounded-2xl bg-white/70 backdrop-blur-[2px]">
              <span className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
                <ScanLine size={16} className="animate-pulse" /> ИИ читает решение…
              </span>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold hover:bg-slate-50">
              <Camera size={14} /> Своё фото
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setImg(URL.createObjectURL(f));
                    a.reset();
                  }
                }}
              />
            </label>
            {img && (
              <Button size="sm" variant="ghost" onClick={() => { setImg(null); a.reset(); }}>
                Пример из тетради
              </Button>
            )}
            <Button size="sm" onClick={() => a.mutate()} disabled={a.isPending}>
              <Sparkles size={14} /> Разобрать
            </Button>
          </div>
        </div>

        <div>
          {!a.data ? (
            <div className="grid h-full min-h-40 place-items-center rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              Сфотографируй решение — ИИ разберёт его по шагам
            </div>
          ) : (
            <div className="fade-in space-y-2.5">
              {img && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                  Демо-режим: разбор показан на примере. С живым Claude ИИ читает именно ваше фото.
                </p>
              )}
              {a.data.lines.map((l, i) => (
                <div key={i} className="flex gap-2.5 text-sm">
                  {l.status === "ok" ? (
                    <CheckCircle2 size={18} className="shrink-0 text-green-500" />
                  ) : l.status === "error" ? (
                    <AlertCircle size={18} className="shrink-0 text-red-500" />
                  ) : (
                    <CornerDownRight size={18} className="shrink-0 text-amber-500" />
                  )}
                  <span className={cn(l.status === "error" && "font-medium")}>
                    <b className="mr-1 text-slate-400">Шаг {i + 1}.</b>
                    {l.text}
                  </span>
                </div>
              ))}
              <div className="mt-3 flex gap-2.5 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
                <Sparkles size={16} className="mt-0.5 shrink-0" />
                {a.data.question}
              </div>
              <p className="text-xs leading-relaxed text-slate-500">{a.data.summary}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
