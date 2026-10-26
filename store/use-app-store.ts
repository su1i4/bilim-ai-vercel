"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang, Step } from "@/lib/types";
import { dict, type DictKey } from "@/lib/i18n";

export interface LocalSubmission {
  missionId: string;
  title: string;
  at: number;
  aiGrade: number;
  aiComment: string;
}

interface AppState {
  lang: Lang;
  step: Step;
  xp: number;
  solved: number;
  mistakes: Record<string, number>;
  missionsDone: string[];
  submissions: LocalSubmission[];
  teachScore: number | null;
  setTeachScore: (n: number | null) => void;
  setLang: (l: Lang) => void;
  setStep: (s: Step) => void;
  addXp: (n: number) => void;
  incSolved: () => void;
  addMistake: (tag: string) => void;
  completeMission: (id: string) => void;
  submit: (s: LocalSubmission) => void;
  reset: () => void;
}

const initial = {
  lang: "ru" as Lang,
  step: "intro" as Step,
  xp: 0,
  solved: 0,
  mistakes: {} as Record<string, number>,
  missionsDone: [] as string[],
  submissions: [] as LocalSubmission[],
  teachScore: null as number | null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initial,
      setLang: (lang) => set({ lang }),
      setTeachScore: (teachScore) => set({ teachScore }),
      setStep: (step) => set({ step }),
      addXp: (n) => set((s) => ({ xp: s.xp + n })),
      incSolved: () => set((s) => ({ solved: s.solved + 1 })),
      addMistake: (tag) => set((s) => ({ mistakes: { ...s.mistakes, [tag]: (s.mistakes[tag] ?? 0) + 1 } })),
      completeMission: (id) =>
        set((s) => (s.missionsDone.includes(id) ? s : { missionsDone: [...s.missionsDone, id] })),
      submit: (sub) =>
        set((s) => ({ submissions: [sub, ...s.submissions.filter((x) => x.missionId !== sub.missionId)] })),
      reset: () => set({ ...initial, lang: get().lang }),
    }),
    { name: "bilim-ai", skipHydration: true },
  ),
);

export function useT() {
  const lang = useAppStore((s) => s.lang);
  return (k: DictKey) => dict[lang][k];
}
