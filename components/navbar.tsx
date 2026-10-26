"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";
import { cn, Logo } from "./ui";
import { useAppStore, useT } from "@/store/use-app-store";

export function Navbar() {
  const path = usePathname();
  const t = useT();
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const xp = useAppStore((s) => s.xp);

  const links = [
    { href: "/", label: t("nav_home") },
    { href: "/student", label: t("nav_student") },
    { href: "/teacher", label: t("nav_teacher") },
  ];

  return (
    <header className="sticky top-3 z-50 px-3 sm:px-4 print:hidden">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border border-white/80 bg-white/85 px-2 py-1.5 shadow-[0_10px_30px_-14px_rgba(79,76,230,.35)] backdrop-blur-md sm:px-3 sm:py-2">
        <Link href="/" className="flex shrink-0 items-center gap-2 pl-1">
          <Logo />
          <span className="hidden font-bold tracking-tight sm:inline">Билим AI</span>
        </Link>

        <div className="no-scrollbar flex items-center gap-0.5 overflow-x-auto">
          {links.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium transition sm:px-3.5 sm:text-sm",
                  active ? "bg-brand-50 font-semibold text-ink" : "text-slate-500 hover:text-ink",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden items-center gap-1 rounded-full bg-lime-soft px-2.5 py-1 text-xs font-bold text-lime-800 md:inline-flex">
            <Zap size={12} className="fill-current" /> {xp} XP
          </span>
          <div className="flex rounded-full bg-slate-100 p-0.5 text-[11px] font-bold">
            {(["ru", "ky"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={cn("rounded-full px-2 py-1 transition", lang === l ? "bg-white text-ink shadow-sm" : "text-slate-400")}
              >
                {l === "ru" ? "РУ" : "КЫ"}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
