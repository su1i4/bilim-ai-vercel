// 2×2 матрица хранится как [a, b, c, d] = [[a, b], [c, d]]
export type M2 = [number, number, number, number];
export type V2 = [number, number];

export const I: M2 = [1, 0, 0, 1];

export const mul = (x: M2, y: M2): M2 => [
  x[0] * y[0] + x[1] * y[2],
  x[0] * y[1] + x[1] * y[3],
  x[2] * y[0] + x[3] * y[2],
  x[2] * y[1] + x[3] * y[3],
];

export const apply = (m: M2, [x, y]: V2): V2 => [m[0] * x + m[1] * y, m[2] * x + m[3] * y];
export const det = (m: M2) => m[0] * m[3] - m[1] * m[2];
export const eq = (a: M2, b: M2, eps = 1e-6) => a.every((v, i) => Math.abs(v - b[i]) <= eps);
export const lerp = (a: M2, b: M2, t: number): M2 => a.map((v, i) => v + (b[i] - v) * t) as M2;

const r3 = (v: number) => Math.round(v * 1000) / 1000;
export const rotation = (deg: number): M2 => {
  const r = (deg * Math.PI) / 180;
  const c = r3(Math.cos(r));
  const s = r3(Math.sin(r));
  return [c, -s, s, c];
};

export const fmt = (v: number) => (Number.isInteger(v) ? String(v) : String(r3(v)));
export const toStrs = (m: M2) => m.map(fmt);

export function parseM(vals: string[]): M2 | null {
  const n = vals.map((v) => {
    const s = v.trim().replace(",", ".");
    return s === "" || s === "-" ? NaN : Number(s);
  });
  return n.some(Number.isNaN) ? null : (n as M2);
}

export const PRESETS: { label: string; m: M2 }[] = [
  { label: "Исходная", m: [1, 0, 0, 1] },
  { label: "Поворот 90°", m: [0, -1, 1, 0] },
  { label: "Поворот 45°", m: rotation(45) },
  { label: "Растяжение ×2", m: [2, 0, 0, 1] },
  { label: "Отражение", m: [-1, 0, 0, 1] },
  { label: "Сдвиг", m: [1, 1, 0, 1] },
];
