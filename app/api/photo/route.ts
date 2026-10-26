import type { PhotoAnalysis } from "@/lib/types";

export const dynamic = "force-dynamic";

// Демо: разбор заготовленного решения. С живым Claude сюда уходит фото (vision) и материал темы.
const SAMPLE: PhotoAnalysis = {
  lines: [
    { text: "Матрицы A и B переписаны верно", status: "ok" },
    { text: "Элемент (1,2): 2·4 + 1·2 — второй множитель взят из 1-го столбца B, а нужен из 2-го", status: "error" },
    { text: "Элементы (2,1) и (2,2) посчитаны верно", status: "ok" },
    { text: "Ответ 10 в правом верхнем углу — следствие ошибки во 2-м шаге", status: "followup" },
  ],
  question: "Для элемента (1,2) нужен 2-й столбец матрицы B. Какие в нём числа — и что тогда должно стоять вместо 1·2?",
  summary: "Правило «строка на столбец» понято, сбой в выборе столбца — типичная ошибка индексов. Следующие 2 задачи будут на неё.",
};

export async function POST() {
  await new Promise((r) => setTimeout(r, 1800));
  return Response.json(SAMPLE);
}
