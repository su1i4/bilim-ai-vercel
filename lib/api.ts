import type { AiReply, ChatRequest, Mission, PhotoAnalysis, TeachReply, TeachRequest, TeacherData } from "./types";
import type { CheckResult, CopilotResult, Task } from "./tasks";
import type { M2 } from "./matrix";

// Пусто → встроенные mock-роуты Next (/api/*). Потом сюда — URL бэкенда на ASP.NET Core
const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(BASE + path, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!r.ok) throw new Error(await r.text());
  return r.json() as Promise<T>;
}

export const api = {
  missions: () => req<Mission[]>("/api/missions"),
  teacher: () => req<TeacherData>("/api/teacher"),
  nextTask: (solved: number, focus?: string) =>
    req<Task>(`/api/tasks?solved=${solved}${focus ? `&focus=${focus}` : ""}`),
  check: (task: Task, answer: M2) =>
    req<CheckResult>("/api/tasks", { method: "POST", body: JSON.stringify({ task, answer }) }),
  chat: (body: ChatRequest) => req<AiReply>("/api/chat", { method: "POST", body: JSON.stringify(body) }),
  teach: (body: TeachRequest) => req<TeachReply>("/api/teach", { method: "POST", body: JSON.stringify(body) }),
  photo: () => req<PhotoAnalysis>("/api/photo", { method: "POST", body: "{}" }),
  copilot: (variants: number, focus: boolean) =>
    req<CopilotResult>("/api/copilot", { method: "POST", body: JSON.stringify({ variants, focus }) }),
};
