"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAppStore, useT } from "@/store/use-app-store";
import { Badge, Card, cn } from "../ui";
import { MissionIcon } from "../mission-icon";
import { ShipGame } from "./ship-game";
import { FilterLab, LabPanel, NeuroLab } from "./labs";

export function Missions() {
  const t = useT();
  const q = useQuery({ queryKey: ["missions"], queryFn: api.missions });
  const done = useAppStore((s) => s.missionsDone);
  const completeMission = useAppStore((s) => s.completeMission);
  const submit = useAppStore((s) => s.submit);
  const [sel, setSel] = useState<string | null>(null);

  const mission = q.data?.find((m) => m.id === sel);

  if (mission) {
    const onDone = (r: { aiGrade: number; aiComment: string }) => {
      completeMission(mission.id);
      submit({ missionId: mission.id, title: mission.mission, at: Date.now(), ...r });
    };
    return (
      <Card className="fade-in p-5 sm:p-7">
        <button onClick={() => setSel(null)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-ink">
          <ArrowLeft size={16} /> Все миссии
        </button>
        <div className="mb-5 flex items-start gap-3">
          <MissionIcon name={mission.icon} className="h-11 w-11" />
          <div>
            <p className="text-xs font-semibold text-slate-500">{mission.area}</p>
            <h2 className="text-xl font-semibold tracking-tight">{mission.mission}</h2>
          </div>
          <Badge tone={mission.format === "interactive" ? "lime" : "slate"} className="ml-auto shrink-0">
            {mission.format === "interactive" ? "Интерактив" : "Лаборатория"}
          </Badge>
        </div>
        {done.includes(mission.id) && (
          <div className="mb-5 flex gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 size={18} className="shrink-0" />
            Миссия сдана. ИИ сделал черновой разбор — итоговую оценку ставит преподаватель (загляни в кабинет преподавателя).
          </div>
        )}
        {mission.id === "ship" ? (
          <ShipGame onDone={onDone} />
        ) : mission.id === "filter" ? (
          <FilterLab onDone={onDone} />
        ) : mission.id === "nn" ? (
          <NeuroLab onDone={onDone} />
        ) : (
          <LabPanel mission={mission} onDone={onDone} />
        )}
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t("missions")}</h2>
          <p className="text-sm text-slate-500">12 областей, где матрицы — рабочий инструмент. ИИ будет напарником.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(q.data ?? Array.from({ length: 6 })).map((m, i) =>
          !m ? (
            <div key={i} className="h-32 animate-pulse rounded-[24px] bg-white" />
          ) : (
            <button
              key={m.id}
              onClick={() => setSel(m.id)}
              className={cn(
                "group relative rounded-[24px] border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-18px_rgba(79,76,230,.6)]",
                m.format === "interactive" ? "border-brand-200" : "border-slate-200/70",
              )}
            >
              <div className="mb-3 flex items-center gap-3">
                <MissionIcon name={m.icon} />
                <span className="text-xs font-semibold text-slate-500">{m.area}</span>
                {done.includes(m.id) ? (
                  <CheckCircle2 size={18} className="ml-auto text-green-500" />
                ) : (
                  <Badge tone={m.format === "interactive" ? "lime" : "slate"} className="ml-auto">
                    {m.format === "interactive" ? "Интерактив" : "Лаборатория"}
                  </Badge>
                )}
              </div>
              <p className="text-sm font-semibold leading-snug">{m.mission}</p>
              <p className="mt-1 text-xs text-slate-500">{m.problem}</p>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
