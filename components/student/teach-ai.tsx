"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, Check, GraduationCap, RotateCcw, SendHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import { TEACH_IDEAS } from "@/lib/ai/teach";
import type { TeachReply } from "@/lib/types";
import { useAppStore } from "@/store/use-app-store";
import { Badge, Button, Card, cn } from "../ui";

type Msg = { id: string; role: "pupil" | "me"; text: string };
const uid = () => Math.random().toString(36).slice(2, 10);
const IDEAS = Object.keys(TEACH_IDEAS);

export function TeachAI() {
  const addXp = useAppStore((s) => s.addXp);
  const setTeachScore = useAppStore((s) => s.setTeachScore);
  const setStep = useAppStore((s) => s.setStep);

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [covered, setCovered] = useState<string[]>([]);
  const [report, setReport] = useState<TeachReply["report"]>();
  const [turn, setTurn] = useState(0);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const m = useMutation({
    mutationFn: api.teach,
    onSuccess: (r) => {
      setMsgs((p) => [...p, { id: uid(), role: "pupil", text: r.text }]);
      setCovered(r.covered);
      if (r.done && r.report) {
        setReport(r.report);
        setTeachScore(r.report.score);
        addXp(Math.round(r.report.score / 2));
      }
    },
  });

  const start = () => {
    setMsgs([]);
    setCovered([]);
    setReport(undefined);
    setTurn(0);
    m.mutate({ message: "__start__", covered: [], turn: 0 });
  };
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length, m.isPending]);

  const send = () => {
    const v = input.trim();
    if (!v || m.isPending || report) return;
    setMsgs((p) => [...p, { id: uid(), role: "me", text: v }]);
    setInput("");
    const nt = turn + 1;
    setTurn(nt);
    m.mutate({ message: v, covered, turn: nt });
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_250px]">
      <Card className="flex h-[calc(100dvh-260px)] min-h-[500px] flex-col overflow-hidden md:h-[600px]">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3.5">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-100 text-xl">🧑‍🎓</div>
          <div className="min-w-0">
            <p className="truncate font-semibold">Айбек, 9 класс · ИИ-ученик</p>
            <p className="truncate text-xs text-slate-500">Объясни ему тему — если понял ты, поймёт и он</p>
          </div>
          <Badge tone="amber" className="ml-auto shrink-0">роль: учитель</Badge>
        </div>

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {msgs.map((x) => (
            <div key={x.id} className={cn("fade-in flex", x.role === "me" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  x.role === "me" ? "rounded-tr-md bg-brand-600 text-white" : "rounded-tl-md bg-amber-50 text-ink",
                )}
              >
                {x.text}
              </div>
            </div>
          ))}
          {m.isPending && (
            <div className="typing flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-md bg-amber-50 py-4">
              <span />
              <span />
              <span />
            </div>
          )}
          {report && (
            <div className="fade-in rounded-2xl border border-brand-200 bg-brand-50/60 p-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-brand-600" />
                <p className="font-semibold">Разбор от ИИ: ты объяснил на {report.score}%</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">{report.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={start}>
                  <RotateCcw size={14} /> Ещё раз
                </Button>
                <Button size="sm" onClick={() => setStep("mission")}>
                  К миссии <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-center gap-2 border-t border-slate-100 p-3"
        >
          <input
            value={input}
            disabled={!!report}
            onChange={(e) => setInput(e.target.value)}
            placeholder={report ? "Объяснение завершено" : "Объясни Айбеку своими словами…"}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
          />
          <Button type="submit" className="h-11 w-11 px-0" disabled={!input.trim() || m.isPending || !!report} aria-label="send">
            <SendHorizontal size={18} />
          </Button>
        </form>
      </Card>

      <Card className="h-fit p-5">
        <p className="font-semibold">Что Айбек должен понять</p>
        <p className="mb-4 text-xs text-slate-500">ИИ отмечает идеи, которые ты раскрыл</p>
        <ul className="space-y-2.5">
          {IDEAS.map((k, i) => {
            const ok = covered.includes(k);
            return (
              <li key={k} className="flex items-center gap-3">
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold transition", ok ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400")}>
                  {ok ? <Check size={14} /> : i + 1}
                </span>
                <span className={cn("text-sm", ok ? "font-medium" : "text-slate-400")}>{ok || report ? TEACH_IDEAS[k] : "Скрытая идея"}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-5 rounded-2xl bg-lime-soft px-3.5 py-3 text-xs leading-relaxed text-lime-900">
          Метод Фейнмана: объяснить другому — лучший способ проверить своё понимание. Для педвуза — ещё и тренировка будущего учителя.
        </p>
      </Card>
    </div>
  );
}
