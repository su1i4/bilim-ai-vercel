import clsx, { type ClassValue } from "clsx";
import type { ButtonHTMLAttributes, HTMLAttributes } from "react";

export const cn = (...a: ClassValue[]) => clsx(a);

export function Card({ className, ...p }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_28px_-14px_rgba(16,24,40,0.1)]",
        className,
      )}
      {...p}
    />
  );
}

type Variant = "primary" | "dark" | "outline" | "ghost" | "lime";
type Size = "sm" | "md" | "lg";
const V: Record<Variant, string> = {
  primary: "bg-brand-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_8px_18px_-8px_rgba(79,76,230,.7)] hover:bg-brand-700",
  dark: "bg-ink text-white shadow-[inset_0_1px_0_rgba(255,255,255,.15)] hover:bg-black",
  outline: "border border-slate-200 bg-white text-ink hover:bg-slate-50",
  ghost: "text-slate-600 hover:bg-slate-100",
  lime: "bg-lime text-ink hover:brightness-95",
};
const S: Record<Size, string> = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-[15px]" };

export const btnClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[.98] disabled:pointer-events-none disabled:opacity-50",
    V[variant],
    S[size],
    className,
  );

export function Button({
  variant,
  size,
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button className={btnClass(variant, size, className)} {...p} />;
}

type Tone = "brand" | "green" | "amber" | "red" | "slate" | "lime";
const T: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-700",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  slate: "bg-slate-100 text-slate-600",
  lime: "bg-lime-soft text-lime-800",
};
export function Badge({ tone = "brand", className, ...p }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", T[tone], className)}
      {...p}
    />
  );
}

export function Progress({ value, tone = "green", className }: { value: number; tone?: "green" | "brand"; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-slate-100", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", tone === "green" ? "bg-green-500" : "bg-brand-500")}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/90 px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-[0_4px_14px_-6px_rgba(79,76,230,.35)]",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
      {children}
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <defs>
        <linearGradient id="bilim-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8086fb" />
          <stop offset="1" stopColor="#4f4ce6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#bilim-logo-g)" />
      <path
        d="M10 23V9h10M10 15.5h6.5a3.75 3.75 0 0 1 0 7.5H10"
        stroke="white"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
