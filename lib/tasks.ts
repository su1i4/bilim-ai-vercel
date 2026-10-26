import { type M2, mul, eq } from "./matrix";

export type TaskKind = "multiply" | "order" | "rotate" | "reflect";
export type MistakeTag = "order" | "index" | "basis" | "sign" | "reflect";

export interface Task {
  id: string;
  kind: TaskKind;
  level: number;
  title: string;
  prompt: string;
  A?: M2;
  B?: M2;
  hints: string[];
  geometric: boolean;
}
export interface CheckResult {
  correct: boolean;
  tag?: MistakeTag;
  feedback: string;
  wrongCells?: number[];
}

export const MISTAKE_LABELS: Record<MistakeTag, string> = {
  order: "Порядок умножения",
  index: "Строка × столбец",
  basis: "Столбцы = образы базиса",
  sign: "Направление поворота",
  reflect: "Ось отражения",
};

const CELLS = ["(1,1)", "(1,2)", "(2,1)", "(2,2)"];
const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
const uid = () => Math.random().toString(36).slice(2, 9);
const randM = (lvl: number): M2 => {
  const r = lvl > 1 ? 5 : 3;
  return [rnd(-r + 1, r), rnd(-r + 1, r), rnd(-r + 1, r), rnd(-r + 1, r)];
};
function pair(lvl: number): [M2, M2] {
  for (let i = 0; i < 50; i++) {
    const A = randM(lvl);
    const B = randM(lvl);
    if (!eq(mul(A, B), mul(B, A))) return [A, B];
  }
  return [[1, 2, 0, 1], [1, 0, 3, 1]];
}

const HINTS: Record<TaskKind, string[]> = {
  multiply: [
    "Элемент в левом верхнем углу: какую строку A и какой столбец B ты берёшь?",
    "(1,1) = a₁₁·b₁₁ + a₁₂·b₂₁. По тому же правилу: строка i матрицы A × столбец j матрицы B.",
  ],
  order: [
    "В B·A строки берутся из B, а столбцы — из A. Какая матрица теперь слева?",
    "Сравни с A·B. Совпадает? Как думаешь, почему?",
  ],
  rotate: [
    "Куда переходит вектор (1,0) при повороте на 90° против часовой? А (0,1)?",
    "Первый столбец матрицы — образ (1,0), второй — образ (0,1).",
  ],
  reflect: [
    "Что происходит с x при зеркальном отражении относительно оси Y? А с y?",
    "x меняет знак, y остаётся. Какая матрица делает (x, y) → (−x, y)?",
  ],
};

const PRAISE = ["Точно! Ты разобрался.", "Верно — так держать!", "Отлично, это правильный ответ."];

export function generateTask(solved: number, focus?: string): Task {
  const level = solved >= 4 ? 2 : 1;
  const kind: TaskKind =
    focus === "order" ? "order" : solved === 2 ? "rotate" : solved === 3 ? "reflect" : "multiply";
  const base = { id: uid(), kind, level, hints: HINTS[kind], geometric: kind === "rotate" || kind === "reflect" };

  if (kind === "multiply" || kind === "order") {
    const [A, B] = pair(level);
    return {
      ...base, A, B,
      title: kind === "order" ? "Задача на твою ошибку" : `Произведение матриц · уровень ${level}`,
      prompt: kind === "order" ? "Вычисли B·A. Обрати внимание, какая матрица стоит слева." : "Найди произведение A·B.",
    };
  }
  if (kind === "rotate")
    return { ...base, title: "Матрица поворота", prompt: "Подбери матрицу, которая поворачивает фигуру на 90° против часовой стрелки." };
  return { ...base, title: "Матрица отражения", prompt: "Подбери матрицу, которая отражает фигуру относительно оси Y — как в зеркале." };
}

export function expected(t: Pick<Task, "kind" | "A" | "B">): M2 {
  switch (t.kind) {
    case "multiply": return mul(t.A!, t.B!);
    case "order": return mul(t.B!, t.A!);
    case "rotate": return [0, -1, 1, 0];
    case "reflect": return [-1, 0, 0, 1];
  }
}

// Проверку вычислений делает код, а не ИИ
export function checkAnswer(t: Pick<Task, "kind" | "A" | "B">, ans: M2): CheckResult {
  const exp = expected(t);
  if (eq(ans, exp)) return { correct: true, feedback: PRAISE[rnd(0, PRAISE.length - 1)] };

  if (t.kind === "multiply" && eq(ans, mul(t.B!, t.A!)))
    return { correct: false, tag: "order", feedback: "Похоже, ты посчитал B·A вместо A·B. Подумай: в A·B строки берутся из какой матрицы?" };
  if (t.kind === "order" && eq(ans, mul(t.A!, t.B!)))
    return { correct: false, tag: "order", feedback: "Это A·B, а нужно B·A. Видишь — результаты разные: порядок умножения важен." };

  if (t.kind === "multiply" || t.kind === "order") {
    const wrong = exp.map((v, i) => (Math.abs(v - ans[i]) > 1e-6 ? i : -1)).filter((i) => i >= 0);
    if (wrong.length <= 2)
      return { correct: false, tag: "index", wrongCells: wrong, feedback: `Почти! Проверь ${wrong.map((i) => CELLS[i]).join(" и ")}: какую строку и какой столбец ты взял?` };
    return { correct: false, feedback: "Давай по шагам: начни с элемента (1,1) — строка 1 первой матрицы на столбец 1 второй." };
  }
  if (t.kind === "rotate") {
    if (eq(ans, [0, 1, -1, 0]))
      return { correct: false, tag: "sign", feedback: "Фигура повернулась по часовой стрелке. Куда должен уйти (1,0) при повороте против часовой?" };
    return { correct: false, tag: "basis", feedback: "Посмотри на превью: куда ушёл красный вектор (1,0)? Он должен стать (0,1) — это первый столбец." };
  }
  if (eq(ans, [1, 0, 0, -1]))
    return { correct: false, tag: "reflect", feedback: "Это отражение относительно оси X — фигура перевернулась вверх ногами. А нужно влево-вправо." };
  return { correct: false, tag: "basis", feedback: "При отражении относительно Y: (1,0) → (−1,0), а (0,1) остаётся. Это и есть столбцы матрицы." };
}

export interface CopilotTask extends Task {
  answer: M2;
  target: string;
}
export interface CopilotResult {
  variants: { name: string; tasks: CopilotTask[] }[];
}
