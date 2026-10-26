import type { M2 } from "./matrix";

export type Lang = "ru" | "ky";
export type Step = "intro" | "practice" | "teach" | "mission";

/* ---------- ИИ ---------- */
// ИИ отдаёт описание модели в JSON, фронт её рисует (как в ТЗ)
export type Widget =
  | { type: "matrix"; matrix: M2; caption?: string }
  | { type: "apps" }
  | { type: "missions" }
  | { type: "cta"; step: Step; label: string };

export interface AiReply {
  text: string;
  widget?: Widget;
  suggestions?: string[];
  mode?: "mock" | "live";
}
export interface ChatTurn {
  role: "user" | "ai";
  text: string;
}
export interface ChatRequest {
  message: string;
  history: ChatTurn[];
  lang: Lang;
  level?: "simple" | "strict";
  about?: string;
}

/* ---------- Научи ИИ ---------- */
export interface TeachRequest {
  message: string;
  covered: string[];
  turn: number;
}
export interface TeachReply {
  text: string;
  covered: string[];
  newly: string[];
  done: boolean;
  report?: { score: number; covered: string[]; missed: string[]; summary: string };
}

/* ---------- Фото решения ---------- */
export interface PhotoAnalysis {
  lines: { text: string; status: "ok" | "error" | "followup" }[];
  question: string;
  summary: string;
}

/* ---------- Миссии ---------- */
export type IconKey =
  | "brain" | "gamepad" | "image" | "lock" | "share" | "sparkles"
  | "coins" | "route" | "zap" | "leaf" | "trophy" | "scan";

export interface Mission {
  id: string;
  area: string;
  icon: IconKey;
  problem: string;
  mission: string;
  format: "interactive" | "lab";
}

/* ---------- Преподаватель ---------- */
export interface Stat {
  key: "students" | "progress" | "stuck" | "missions";
  label: string;
  value: string;
  trend: "up" | "down";
}
export interface StudentRow {
  name: string;
  step: Step;
  progress: number;
  status: "ok" | "stuck" | "done";
  mastery: number[];
  lastError: string;
}
export interface SubmissionRow {
  id: string;
  student: string;
  mission: string;
  aiGrade: number;
  aiComment: string;
  at: string;
}
export interface TeacherData {
  name: string;
  dept: string;
  course: string;
  group: string;
  stats: Stat[];
  activity: number[];
  steps: { label: string; done: number; stuck: number }[];
  errors: { label: string; pct: number }[];
  concepts: string[];
  students: StudentRow[];
  submissions: SubmissionRow[];
}
