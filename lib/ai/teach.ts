import type { TeachReply, TeachRequest } from "../types";

// «Научи ИИ»: ИИ играет школьника и проверяет, раскрыл ли студент 4 ключевые идеи
export const TEACH_IDEAS: Record<string, string> = {
  rowcol: "Правило «строка на столбец»",
  order: "A·B ≠ B·A",
  meaning: "Матрица — это преобразование",
  size: "Когда умножение возможно",
};
const ORDER = ["rowcol", "order", "meaning", "size"] as const;

const KW: Record<string, string[]> = {
  rowcol: ["строк", "столб", "сап", "мамыча", "row"],
  order: ["порядок", "местами", "не равн", "≠", "не одинаков", "разн", "коммутат", "переставить"],
  meaning: ["поворот", "поворач", "преобраз", "движ", "функц", "игр", "нейросет", "применя", "растяг", "фигур"],
  size: ["размер", "количеств", "совпада", "2×3", "3×2", "2x3", "согласован", "сколько столбцов", "сколько строк"],
};
const Q: Record<string, string> = {
  rowcol: "Как умножить две матрицы? Можно просто перемножить числа, которые стоят на одинаковых местах?",
  order: "А если поменять матрицы местами, ответ же тот же? Как 2·3 = 3·2?",
  meaning: "А зачем их вообще умножать? Это же просто таблички с числами…",
  size: "А любую матрицу можно умножить на любую? Например 2×3 на 2×3?",
};
const HINT_Q: Record<string, string> = {
  rowcol: "Вот A = [[1, 2], [3, 4]] и B = [[0, 1], [1, 0]] — как получить число в левом верхнем углу?",
  order: "Если я посчитаю B·A, выйдет то же самое, что A·B?",
  meaning: "Где такое вообще пригодится в жизни?",
  size: "А если у первой 3 столбца, а у второй 2 строки — получится?",
};
const ACK: Record<string, string> = {
  rowcol: "Ааа, строку на столбец! Теперь понятно 😄",
  order: "Ого, значит порядок важен — как носки и ботинки, не наоборот!",
  meaning: "То есть матрица — это как действие с фигурой? Прикольно!",
  size: "Понял: столбцов у первой должно быть столько же, сколько строк у второй.",
};
const CONFUSED = ["Хм, я всё ещё не понял 😅", "Слишком сложно… можно проще?", "Эээ, а на примере можно?"];

export function teachReply({ message, covered, turn }: TeachRequest): TeachReply {
  if (message === "__start__")
    return { text: `Привет! Я Айбек, 9 класс. Учитель сказал, что завтра матрицы, а я вообще не понял 😩 ${Q.rowcol}`, covered: [], newly: [], done: false };

  const m = message.toLowerCase();
  const newly = ORDER.filter((k) => !covered.includes(k) && KW[k].some((w) => m.includes(w)));
  const all = [...covered, ...newly];
  const next = ORDER.find((k) => !all.includes(k));
  const ack = newly.map((k) => ACK[k]).join(" ");

  if (!next || turn >= 6) {
    const missed = ORDER.filter((k) => !all.includes(k));
    return {
      text: (ack ? ack + " " : "") + (missed.length ? "Спасибо! Кажется, почти всё понял… но кое-что ещё путаю." : "Спасибо!! Завтра всему классу объясню 🙌"),
      covered: all,
      newly,
      done: true,
      report: {
        score: Math.round((all.length / ORDER.length) * 100),
        covered: all,
        missed,
        summary: missed.length
          ? `Ты понятно объяснил ${all.length} из 4 идей. Чтобы закрыть тему, повтори: ${missed.map((k) => TEACH_IDEAS[k]).join(", ")}.`
          : "Ты объяснил все 4 ключевые идеи — значит, тема понята по-настоящему, а не заучена.",
      },
    };
  }
  if (newly.length) return { text: `${ack} ${Q[next]}`, covered: all, newly, done: false };
  return { text: `${CONFUSED[turn % CONFUSED.length]} ${HINT_Q[next]}`, covered: all, newly, done: false };
}
