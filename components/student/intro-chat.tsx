"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, SendHorizontal, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import type { ChatTurn, Widget } from "@/lib/types";
import { MISSIONS } from "@/lib/mock-data";
import { useAppStore, useT } from "@/store/use-app-store";
import { Badge, Button, Card, cn } from "../ui";
import { MatrixPlayground } from "../matrix";
import { MissionIcon } from "../mission-icon";

type Msg = { id: string; role: "user" | "ai"; text: string; widget?: Widget; suggestions?: string[]; mode?: string };
const uid = () => Math.random().toString(36).slice(2, 10);

function WidgetView({ w }: { w: Widget }) {
  const setStep = useAppStore((s) => s.setStep);
  if (w.type === "matrix")
    return (
      <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
        <p className="mb-2 text-xs font-semibold text-brand-700">
          Интерактивная модель{w.caption ? ` · ${w.caption}` : ""}
        </p>
        <MatrixPlayground initial={w.matrix} compact />
      </div>
    );
  if (w.type === "apps")
    return (
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {MISSIONS.map((m) => (
          <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-3">
            <MissionIcon name={m.icon} className="mb-2 h-8 w-8" />
            <p className="text-xs font-semibold">{m.area}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{m.problem}</p>
          </div>
        ))}
      </div>
    );
  if (w.type === "missions")
    return (
      <div className="mt-3 space-y-2">
        {MISSIONS.slice(0, 4).map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5">
            <MissionIcon name={m.icon} />
            <p className="text-xs font-medium leading-snug">{m.mission}</p>
          </div>
        ))}
        <Button size="sm" onClick={() => setStep("mission")}>
          Все 12 миссий <ArrowRight size={14} />
        </Button>
      </div>
    );
  return (
    <Button className="mt-3" size="sm" onClick={() => setStep(w.step)}>
      {w.label} <ArrowRight size={14} />
    </Button>
  );
}

export function IntroChat() {
  const t = useT();
  const lang = useAppStore((s) => s.lang);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const chat = useMutation({
    mutationFn: api.chat,
    onSuccess: (r) => setMsgs((p) => [...p, { id: uid(), role: "ai", ...r }]),
    onError: () => setMsgs((p) => [...p, { id: uid(), role: "ai", text: "Связь с ИИ прервалась. Попробуй ещё раз." }]),
  });

  const send = (text: string, hidden = false) => {
    const v = text.trim();
    if (!v || chat.isPending) return;
    const history: ChatTurn[] = msgs.map((m) => ({ role: m.role, text: m.text }));
    if (!hidden) setMsgs((p) => [...p, { id: uid(), role: "user", text: v }]);
    setInput("");
    chat.mutate({ message: v, history, lang });
  };

  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    send("__start__", true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length, chat.isPending]);

  const lastAi = [...msgs].reverse().find((m) => m.role === "ai");

  // Три уровня объяснения: тот же материал проще или строже
  const explain = (level: "simple" | "strict") => {
    if (!lastAi || chat.isPending) return;
    const history: ChatTurn[] = msgs.map((m) => ({ role: m.role, text: m.text }));
    setMsgs((p) => [...p, { id: uid(), role: "user", text: level === "simple" ? "Объясни проще" : "Объясни строже" }]);
    chat.mutate({ message: "__level__", level, about: lastAi.text, history, lang });
  };

  return (
    <Card className="flex h-[calc(100dvh-230px)] min-h-[520px] flex-col overflow-hidden md:h-[680px]">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-white">
          <Sparkles size={18} />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold">Билим · ИИ-напарник</p>
          <p className="truncate text-xs text-slate-500">
            {t("step_intro")} — {t("step_intro_sub")}
          </p>
        </div>
        {lastAi?.mode && (
          <Badge tone={lastAi.mode === "live" ? "green" : "lime"} className="ml-auto shrink-0">
            {lastAi.mode === "live" ? "Claude" : "демо-ИИ"}
          </Badge>
        )}
      </div>

      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5">
        {msgs.map((m) => (
          <div key={m.id} className={cn("fade-in flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(m.role === "user" ? "max-w-[85%]" : m.widget ? "w-full" : "max-w-[90%]")}>
              <div
                className={cn(
                  "whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  m.role === "user" ? "rounded-tr-md bg-brand-600 text-white" : "rounded-tl-md bg-slate-50 text-ink",
                )}
              >
                {m.text}
              </div>
              {m.widget && <WidgetView w={m.widget} />}
              {m === lastAi && msgs.length > 1 && !chat.isPending && (
                <div className="mt-2 flex gap-1.5">
                  <button onClick={() => explain("simple")} className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-100">
                    🐣 Проще
                  </button>
                  <button onClick={() => explain("strict")} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-200">
                    🎓 Строже
                  </button>
                </div>
              )}
              {m === lastAi && m.suggestions && !chat.isPending && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {m.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {chat.isPending && (
          <div className="typing flex w-16 items-center justify-center gap-1 rounded-2xl rounded-tl-md bg-slate-50 py-4">
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-slate-100 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("ask")}
          className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand-400 focus:bg-white"
        />
        <Button type="submit" className="h-11 w-11 px-0" disabled={!input.trim() || chat.isPending} aria-label="send">
          <SendHorizontal size={18} />
        </Button>
      </form>
    </Card>
  );
}
