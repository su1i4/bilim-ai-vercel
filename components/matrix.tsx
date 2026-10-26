"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { type M2, type V2, I, PRESETS, apply, det, fmt, lerp, parseM, toStrs } from "@/lib/matrix";
import { cn } from "./ui";

/* ---------- Координатная плоскость ---------- */
export interface PlaneApi {
  pts: (v: V2[]) => string;
  xy: (v: V2) => [number, number];
  u: number;
}

export function Plane({
  range = 5, size = 280, dark = false, className, children,
}: { range?: number; size?: number; dark?: boolean; className?: string; children: (p: PlaneApi) => ReactNode }) {
  const u = size / (2 * range);
  const xy = ([x, y]: V2): [number, number] => [size / 2 + x * u, size / 2 - y * u];
  const pts = (vs: V2[]) => vs.map((v) => xy(v).join(",")).join(" ");
  const ticks = Array.from({ length: 2 * range + 1 }, (_, i) => i - range);
  const grid = dark ? "rgba(255,255,255,.06)" : "#eceef5";
  const axis = dark ? "rgba(255,255,255,.22)" : "#c4c8da";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={cn("h-auto w-full select-none", className)}>
      {ticks.map((t) => {
        const [x] = xy([t, 0]);
        const [, y] = xy([0, t]);
        return (
          <g key={t}>
            <line x1={x} y1={0} x2={x} y2={size} stroke={t === 0 ? axis : grid} strokeWidth={t === 0 ? 1.3 : 1} />
            <line x1={0} y1={y} x2={size} y2={y} stroke={t === 0 ? axis : grid} strokeWidth={t === 0 ? 1.3 : 1} />
          </g>
        );
      })}
      {children({ pts, xy, u })}
    </svg>
  );
}

export function Vec({ p, to, color }: { p: PlaneApi; to: V2; color: string }) {
  const [x1, y1] = p.xy([0, 0]);
  const [x2, y2] = p.xy(to);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={x2} cy={y2} r={4} fill={color} />
    </g>
  );
}

/* ---------- Анимация матрицы ---------- */
export function useAnimatedMatrix(target: M2, ms = 450): M2 {
  const [m, setM] = useState<M2>(target);
  const cur = useRef<M2>(target);
  const key = target.join(",");
  useEffect(() => {
    const from = cur.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const v = lerp(from, target, e);
      cur.current = v;
      setM(v);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return m;
}

/* ---------- Ввод и отображение ---------- */
const Bracket = ({ side, big }: { side: "l" | "r"; big?: boolean }) => (
  <span
    className={cn(
      "self-stretch border-slate-400",
      big ? "w-2" : "w-1.5",
      side === "l" ? "rounded-l-md border-y-2 border-l-2" : "rounded-r-md border-y-2 border-r-2",
    )}
  />
);

export function MatrixInput({
  value, onChange, bad = [], disabled,
}: { value: string[]; onChange: (v: string[]) => void; bad?: number[]; disabled?: boolean }) {
  return (
    <div className="inline-flex items-stretch gap-1.5">
      <Bracket side="l" big />
      <div className="grid grid-cols-2 gap-1.5 py-1">
        {value.map((v, i) => (
          <input
            key={i}
            inputMode="decimal"
            value={v}
            disabled={disabled}
            onChange={(e) => {
              const n = [...value];
              n[i] = e.target.value;
              onChange(n);
            }}
            className={cn(
              "h-11 w-14 rounded-xl border bg-slate-50 text-center text-base font-semibold outline-none transition focus:bg-white",
              bad.includes(i) ? "border-red-300 bg-red-50 text-red-600" : "border-slate-200 focus:border-brand-500",
            )}
          />
        ))}
      </div>
      <Bracket side="r" big />
    </div>
  );
}

export function MatrixView({ m, label }: { m: M2; label?: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      {label && <span className="text-lg font-bold text-brand-600">{label} =</span>}
      <div className="inline-flex items-stretch gap-1">
        <Bracket side="l" />
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-1 py-1 text-center text-base font-semibold tabular-nums">
          {m.map((v, i) => (
            <span key={i} className="min-w-5">{fmt(v)}</span>
          ))}
        </div>
        <Bracket side="r" />
      </div>
    </div>
  );
}

/* ---------- Фигура «F» (асимметрична — видно отражение) ---------- */
const SHAPE: V2[] = [
  [0, 0], [0, 3], [2, 3], [2, 2.5], [0.5, 2.5], [0.5, 1.7], [1.5, 1.7], [1.5, 1.2], [0.5, 1.2], [0.5, 0],
];

function ShapeLayer({ p, m }: { p: PlaneApi; m: M2 }) {
  return (
    <>
      <polygon points={p.pts(SHAPE)} fill="none" stroke="#b9bdd3" strokeDasharray="4 4" strokeWidth={1.5} />
      <polygon
        points={p.pts(SHAPE.map((v) => apply(m, v)))}
        fill="rgba(99,102,241,.18)"
        stroke="#4f4ce6"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <Vec p={p} to={apply(m, [1, 0])} color="#ef4444" />
      <Vec p={p} to={apply(m, [0, 1])} color="#16a34a" />
    </>
  );
}

export function ShapePreview({ m }: { m: M2 | null }) {
  const a = useAnimatedMatrix(m ?? I);
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
      <Plane range={4} size={240}>{(p) => <ShapeLayer p={p} m={a} />}</Plane>
    </div>
  );
}

export function MatrixPlayground({ initial = I, compact = false }: { initial?: M2; compact?: boolean }) {
  const [vals, setVals] = useState(() => toStrs(initial));
  const parsed = parseM(vals);
  const last = useRef<M2>(initial);
  if (parsed) last.current = parsed;
  const target = parsed ?? last.current;
  const m = useAnimatedMatrix(target);
  const d = det(target);

  return (
    <div className={cn("grid items-start gap-4", compact ? "sm:grid-cols-[minmax(0,230px)_1fr]" : "md:grid-cols-[minmax(0,320px)_1fr]")}>
      <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-2">
        <Plane range={4} size={280}>{(p) => <ShapeLayer p={p} m={m} />}</Plane>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <MatrixInput value={vals} onChange={setVals} />
          <div className="text-xs leading-relaxed text-slate-500">
            det = <b className="text-ink">{fmt(d)}</b>
            <br />
            {d === 0 ? "фигура сплющилась в линию" : d < 0 ? "ориентация перевернулась" : `площадь ×${fmt(Math.abs(d))}`}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((pr) => (
            <button
              key={pr.label}
              onClick={() => setVals(toStrs(pr.m))}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium transition hover:border-brand-300 hover:text-brand-700"
            >
              {pr.label}
            </button>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          <span className="font-bold text-red-500">●</span> 1-й столбец — куда ушёл вектор i = (1, 0).{" "}
          <span className="font-bold text-green-600">●</span> 2-й столбец — куда ушёл j = (0, 1).
        </p>
      </div>
    </div>
  );
}
