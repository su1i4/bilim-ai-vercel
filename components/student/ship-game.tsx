"use client";

import { useState } from "react";
import { ArrowRight, Rocket, RotateCcw, Sparkles } from "lucide-react";
import { type M2, type V2, I, apply, fmt, parseM, toStrs } from "@/lib/matrix";
import { useAppStore } from "@/store/use-app-store";
import { Button, cn } from "../ui";
import { MatrixInput, Plane, useAnimatedMatrix } from "../matrix";

const SHIP: V2[] = [[0, 1.6], [0.9, -1], [0, -0.45], [-0.9, -1]];
const LEVELS: { title: string; story: string; target: M2; hint: string }[] = [
  { title: "Разворот", story: "Астероид справа! Разверни корабль носом вправо.", target: [0, 1, -1, 0], hint: "Нос смотрит вдоль (0, 1). Куда должен уйти этот вектор, чтобы смотреть вправо? Это второй столбец матрицы." },
  { title: "Щит", story: "Включи щит — увеличь корабль ровно в 2 раза.", target: [2, 0, 0, 2], hint: "Каждую координату нужно умножить на 2. Какие числа стоят на диагонали?" },
  { title: "Портал", story: "Зеркальный портал: корабль должен перевернуться носом вниз.", target: [1, 0, 0, -1], hint: "x остаётся, а y меняет знак. Каким будет второй столбец?" },
  { title: "Щель", story: "Развернись назад и сожмись вдвое, чтобы пролететь в щель.", target: [-0.5, 0, 0, -0.5], hint: "Поворот на 180° — это умножение на −1, сжатие вдвое — на 0.5. Объедини." },
];
const STARS: V2[] = Array.from({ length: 36 }, (_, i) => [((i * 73) % 100) / 10 - 5, ((i * 37) % 100) / 10 - 5]);

const close = (a: V2, b: V2) => Math.hypot(a[0] - b[0], a[1] - b[1]) < 0.08;
const sameShape = (m: M2, t: M2) => {
  const a = SHIP.map((v) => apply(m, v));
  const b = SHIP.map((v) => apply(t, v));
  return a.every((p) => b.some((q) => close(p, q))) && b.every((q) => a.some((p) => close(p, q)));
};

export function ShipGame({ onDone }: { onDone: (r: { aiGrade: number; aiComment: string }) => void }) {
  const addXp = useAppStore((s) => s.addXp);
  const [lvl, setLvl] = useState(0);
  const [vals, setVals] = useState(toStrs(I));
  const [applied, setApplied] = useState<M2>(I);
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [tries, setTries] = useState(0);
  const [finished, setFinished] = useState(false);

  const m = useAnimatedMatrix(applied, 650);
  const level = LEVELS[lvl];
  const nose = apply(applied, [0, 1]);

  const launch = () => {
    const p = parseM(vals);
    if (!p) return;
    setApplied(p);
    setTries((t) => t + 1);
    const ok = sameShape(p, level.target);
    setStatus(ok ? "ok" : "fail");
    if (ok) addXp(50);
  };
  const nextLevel = () => {
    if (lvl === LEVELS.length - 1) {
      setFinished(true);
      const extra = Math.max(0, tries - LEVELS.length);
      onDone({
        aiGrade: Math.max(70, 100 - extra * 4),
        aiComment:
          extra === 0
            ? "Все уровни с первой попытки: понимает, что столбцы матрицы — образы базисных векторов."
            : `Прошёл все уровни, лишних попыток: ${extra}. Стоит повторить связь «столбец = образ базисного вектора».`,
      });
      return;
    }
    setLvl(lvl + 1);
    setApplied(I);
    setVals(toStrs(I));
    setStatus("idle");
  };

  return (
    <div className="grid items-start gap-5 md:grid-cols-[minmax(0,360px)_1fr]">
      <div className="overflow-hidden rounded-3xl bg-[#13122a] p-2 shadow-inner">
        <Plane range={5} size={320} dark>
          {(p) => (
            <>
              {STARS.map((s, i) => {
                const [x, y] = p.xy(s);
                return <circle key={i} cx={x} cy={y} r={i % 3 ? 0.8 : 1.4} fill="white" opacity={0.5} />;
              })}
              {!finished && (
                <polygon
                  points={p.pts(SHIP.map((v) => apply(level.target, v)))}
                  fill="rgba(198,243,94,.08)"
                  stroke="#c6f35e"
                  strokeWidth={1.6}
                  strokeDasharray="5 4"
                />
              )}
              <polygon
                points={p.pts(SHIP.map((v) => apply(m, v)))}
                fill={status === "ok" ? "#c6f35e" : "#8086fb"}
                stroke="white"
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
            </>
          )}
        </Plane>
      </div>

      <div>
        <div className="mb-4 flex gap-1.5">
          {LEVELS.map((l, i) => (
            <span
              key={l.title}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                i < lvl || finished ? "bg-lime-soft text-lime-800" : i === lvl ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-400",
              )}
            >
              {i + 1}. {l.title}
            </span>
          ))}
        </div>

        {finished ? (
          <div className="fade-in rounded-2xl bg-lime-soft p-5">
            <p className="text-lg font-semibold">🚀 Миссия пройдена!</p>
            <p className="mt-1 text-sm text-slate-600">
              Всего попыток: {tries}. Ты управлял кораблём только матрицами — так же двигаются объекты в любой 3D-игре.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-1 text-sm font-semibold text-brand-700">Уровень {lvl + 1}</p>
            <p className="mb-4 text-base font-medium">{level.story}</p>
            <p className="mb-3 text-xs text-slate-500">Пунктир — цель. Введи матрицу и запусти корабль.</p>
            <MatrixInput value={vals} onChange={setVals} disabled={status === "ok"} />

            {status === "fail" && (
              <div className="fade-in mt-4 flex gap-2.5 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
                <Sparkles size={16} className="mt-0.5 shrink-0" />
                <span>
                  Мимо! Сейчас вектор (0, 1) уходит в ({fmt(nose[0])}, {fmt(nose[1])}). {level.hint}
                </span>
              </div>
            )}
            {status === "ok" && (
              <div className="fade-in mt-4 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
                Точно в цель! +50 XP
              </div>
            )}

            <div className="mt-5 flex gap-2">
              {status === "ok" ? (
                <Button onClick={nextLevel}>
                  {lvl === LEVELS.length - 1 ? "Завершить миссию" : "Дальше"} <ArrowRight size={16} />
                </Button>
              ) : (
                <Button onClick={launch} disabled={!parseM(vals)}>
                  <Rocket size={16} /> Запуск
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setApplied(I);
                  setVals(toStrs(I));
                  setStatus("idle");
                }}
              >
                <RotateCcw size={16} />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
