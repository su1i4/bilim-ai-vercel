"use client";

import { useMemo, useState } from "react";
import { Send, Shuffle, Sparkles, Trash2 } from "lucide-react";
import { mul, parseM, fmt } from "@/lib/matrix";
import type { Mission } from "@/lib/types";
import { useAppStore } from "@/store/use-app-store";
import { Button, cn } from "../ui";
import { MatrixInput, MatrixView } from "../matrix";

type Done = (r: { aiGrade: number; aiComment: string }) => void;

/* ================= Фильтр для фото: свёртка с ядром 3×3 ================= */
const N = 10;
const IMG: number[] = Array.from({ length: N * N }, (_, k) => {
  const x = k % N;
  const y = Math.floor(k / N);
  let v = Math.hypot(x - 4.5, y - 4.5) < 4 ? 215 : 40;
  if ((x === 3 || x === 6) && (y === 3 || y === 4)) v = 30;
  if (y === 6 && x >= 3 && x <= 6) v = 45;
  if (y === 5 && (x === 2 || x === 7)) v = 45;
  return v;
});
const KERNELS = [
  { label: "Оригинал", k: [0, 0, 0, 0, 1, 0, 0, 0, 0] },
  { label: "Размытие", k: Array(9).fill(1 / 9) as number[] },
  { label: "Резкость", k: [0, -1, 0, -1, 5, -1, 0, -1, 0] },
  { label: "Контуры", k: [-1, -1, -1, -1, 8, -1, -1, -1, -1] },
];
function convolve(img: number[], k: number[]) {
  return img.map((_, idx) => {
    const x = idx % N;
    const y = Math.floor(idx / N);
    let s = 0;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const xx = Math.min(N - 1, Math.max(0, x + dx));
        const yy = Math.min(N - 1, Math.max(0, y + dy));
        s += img[yy * N + xx] * k[(dy + 1) * 3 + (dx + 1)];
      }
    return Math.max(0, Math.min(255, Math.round(s)));
  });
}
const Pixels = ({ data, label }: { data: number[]; label: string }) => (
  <div>
    <p className="mb-1.5 text-xs font-semibold text-slate-500">{label}</p>
    <div className="grid aspect-square grid-cols-10 overflow-hidden rounded-xl border border-slate-200">
      {data.map((v, i) => (
        <div key={i} title={String(v)} style={{ background: `rgb(${v},${v},${v})` }} />
      ))}
    </div>
  </div>
);

export function FilterLab({ onDone }: { onDone: Done }) {
  const addXp = useAppStore((s) => s.addXp);
  const [k, setK] = useState<string[]>(KERNELS[0].k.map(String));
  const [tried, setTried] = useState<string[]>([]);
  const kernel = k.map((v) => Number(v.replace(",", ".")));
  const valid = kernel.every((v) => !Number.isNaN(v)) && k.every((v) => v.trim() !== "");
  const out = useMemo(() => (valid ? convolve(IMG, kernel) : IMG), [k.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps
  const sum = kernel.reduce((a, b) => a + b, 0);

  const pick = (label: string, kk: number[]) => {
    setK(kk.map((v) => fmt(v)));
    if (label !== "Оригинал" && !tried.includes(label)) setTried([...tried, label]);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <Pixels data={IMG} label="Исходная матрица 10×10" />
        <Pixels data={out} label="После фильтра" />
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <div>
          <p className="mb-2 text-xs font-semibold text-slate-500">Ядро фильтра 3×3</p>
          <div className="grid grid-cols-3 gap-1.5">
            {k.map((v, i) => (
              <input
                key={i}
                value={v}
                onChange={(e) => {
                  const n = [...k];
                  n[i] = e.target.value;
                  setK(n);
                }}
                className="h-10 w-14 rounded-lg border border-slate-200 bg-slate-50 text-center text-sm font-semibold outline-none focus:border-brand-500"
              />
            ))}
          </div>
          <p className={cn("mt-2 text-xs", Math.abs(sum - 1) < 0.01 ? "text-green-600" : "text-amber-600")}>
            Сумма ядра = {fmt(Math.round(sum * 100) / 100)} {Math.abs(sum - 1) < 0.01 ? "— яркость сохраняется" : "— яркость изменится"}
          </p>
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {KERNELS.map((kk) => (
              <button
                key={kk.label}
                onClick={() => pick(kk.label, kk.k)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium hover:border-brand-300"
              >
                {kk.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2.5 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
            <Sparkles size={16} className="mt-0.5 shrink-0" />
            Каждый новый пиксель — сумма соседей, умноженных на ядро. Попробуй готовые фильтры, а потом придумай свой.
          </div>
          <Button
            disabled={tried.length < 2}
            onClick={() => {
              addXp(60);
              onDone({
                aiGrade: tried.length >= 3 ? 90 : 82,
                aiComment: `Опробовано фильтров: ${tried.join(", ")}. Последнее ядро: сумма ${fmt(Math.round(sum * 100) / 100)}.`,
              });
            }}
          >
            <Send size={16} /> Сдать миссию {tried.length < 2 && `(попробуй ещё ${2 - tried.length})`}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ================= Мини-нейросеть: y = W·x ================= */
const DIGITS: Record<string, string[]> = {
  "0": [".###.", "#...#", "#...#", "#...#", ".###."],
  "1": ["..#..", ".##..", "..#..", "..#..", ".###."],
  "4": ["#..#.", "#..#.", "#####", "...#.", "...#."],
  "7": ["#####", "...#.", "..#..", ".#...", ".#..."],
};
const KEYS = Object.keys(DIGITS);
const W = KEYS.map((d) => DIGITS[d].join("").split("").map((c) => (c === "#" ? 1 : -0.5)));
const toX = (d: string) => DIGITS[d].join("").split("").map((c) => (c === "#" ? 1 : 0));

export function NeuroLab({ onDone }: { onDone: Done }) {
  const addXp = useAppStore((s) => s.addXp);
  const [x, setX] = useState<number[]>(Array(25).fill(0));
  const [found, setFound] = useState<string[]>([]);

  const scores = W.map((row) => row.reduce((s, w, i) => s + w * x[i], 0));
  const exps = scores.map((s) => Math.exp(s / 1.5));
  const total = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((e) => e / total);
  const best = probs.indexOf(Math.max(...probs));
  const confident = x.some(Boolean) && probs[best] > 0.6;

  const update = (nx: number[]) => {
    setX(nx);
    const sc = W.map((row) => row.reduce((s, w, i) => s + w * nx[i], 0));
    const ex = sc.map((s) => Math.exp(s / 1.5));
    const tt = ex.reduce((a, b) => a + b, 0);
    const b = ex.indexOf(Math.max(...ex));
    if (nx.some(Boolean) && ex[b] / tt > 0.6 && !found.includes(KEYS[b])) setFound([...found, KEYS[b]]);
  };

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-500">Нарисуй цифру (вектор x, 25 пикселей)</p>
        <div className="grid w-fit grid-cols-5 gap-1">
          {x.map((v, i) => (
            <button
              key={i}
              onClick={() => update(x.map((c, j) => (j === i ? 1 - c : c)))}
              className={cn("h-10 w-10 rounded-lg border transition", v ? "border-brand-600 bg-brand-600" : "border-slate-200 bg-slate-50 hover:bg-brand-50")}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {KEYS.map((d) => (
            <button key={d} onClick={() => update(toX(d))} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold hover:border-brand-300">
              {d}
            </button>
          ))}
          <button
            onClick={() => {
              const n = [...x];
              for (let k = 0; k < 3; k++) {
                const i = Math.floor(Math.random() * 25);
                n[i] = 1 - n[i];
              }
              update(n);
            }}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-xs hover:border-brand-300"
            title="Добавить шум"
          >
            <Shuffle size={12} />
          </button>
          <button onClick={() => update(Array(25).fill(0))} className="rounded-full border border-slate-200 px-2.5 py-1 text-xs hover:border-brand-300" title="Очистить">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="rounded-xl bg-slate-50 px-3 py-2 font-mono text-xs text-slate-600">
          y = W (4×25) · x (25×1) → 4 числа, по одному на цифру
        </p>
        {KEYS.map((d, i) => (
          <div key={d} className="flex items-center gap-3">
            <span className={cn("grid h-8 w-8 place-items-center rounded-lg text-sm font-bold", confident && i === best ? "bg-lime text-ink" : "bg-slate-100")}>
              {d}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${probs[i] * 100}%` }} />
            </div>
            <span className="w-24 text-right text-xs tabular-nums text-slate-500">
              {fmt(Math.round(scores[i] * 10) / 10)} · {Math.round(probs[i] * 100)}%
            </span>
          </div>
        ))}
        <div className="flex gap-2.5 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
          <Sparkles size={16} className="mt-0.5 shrink-0" />
          {confident
            ? `Сеть уверена: это «${KEYS[best]}». Добавь шум — узнает ли она цифру?`
            : "Каждая строка W — «шаблон» цифры. Чем больше совпадений с x, тем больше число. Нарисуй цифру."}
        </div>
        <Button
          disabled={found.length < 2}
          onClick={() => {
            addXp(60);
            onDone({ aiGrade: 85 + Math.min(found.length, 4) * 3, aiComment: `Сеть распознала цифры: ${found.join(", ")}. Понимает, что слой — это W·x.` })
          }}
        >
          <Send size={16} /> Сдать миссию {found.length < 2 && `(распознай ещё ${2 - found.length})`}
        </Button>
      </div>
    </div>
  );
}

/* ================= Лаборатория: чат + калькулятор ================= */
export function LabPanel({ mission, onDone }: { mission: Mission; onDone: Done }) {
  const setStep = useAppStore((s) => s.setStep);
  const [a, setA] = useState(["1", "2", "3", "4"]);
  const [b, setB] = useState(["0", "1", "1", "0"]);
  const A = parseM(a);
  const B = parseM(b);

  return (
    <div className="space-y-5">
      <div className="flex gap-2.5 rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
        <Sparkles size={16} className="mt-0.5 shrink-0" />
        <span>
          Формат «лаборатория»: задачу «{mission.problem.toLowerCase()}» ты решаешь в разговоре со мной, а считаешь в калькуляторе ниже.
        </span>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold text-slate-500">Матричный калькулятор</p>
        <div className="flex flex-wrap items-center gap-3">
          <MatrixInput value={a} onChange={setA} />
          <span className="text-lg font-bold text-slate-400">×</span>
          <MatrixInput value={b} onChange={setB} />
          <span className="text-lg font-bold text-slate-400">=</span>
          {A && B ? <MatrixView m={mul(A, B)} /> : <span className="text-sm text-slate-400">—</span>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setStep("intro")}>
          Обсудить с ИИ
        </Button>
        <Button onClick={() => onDone({ aiGrade: 78, aiComment: "Лабораторная миссия: решение в чате, расчёт в калькуляторе. Нужна проверка преподавателя." })}>
          <Send size={16} /> Сдать на проверку
        </Button>
      </div>
    </div>
  );
}
