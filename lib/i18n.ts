import type { Lang } from "./types";

const ru = {
  nav_home: "Главная",
  nav_student: "Студент",
  nav_teacher: "Преподаватель",
  step_intro: "Знакомство",
  step_practice: "Практика",
  step_mission: "Миссия",
  step_intro_sub: "разговор с ИИ",
  step_practice_sub: "задачи под ошибки",
  step_mission_sub: "проект с ИИ",
  step_teach: "Научи ИИ",
  step_teach_sub: "объясни школьнику",
  ask: "Спроси что угодно о матрицах…",
  check: "Проверить",
  hint: "Подсказка",
  next: "Следующая задача",
  my_gaps: "Мои пробелы",
  missions: "Выбери миссию",
  greeting: "Добрый день",
  course: "Линейная алгебра · Матрицы",
  my_path: "Мой путь",
};

export type DictKey = keyof typeof ru;

const ky: Record<DictKey, string> = {
  nav_home: "Башкы бет",
  nav_student: "Студент",
  nav_teacher: "Окутуучу",
  step_intro: "Таанышуу",
  step_practice: "Практика",
  step_mission: "Миссия",
  step_intro_sub: "ИИ менен маек",
  step_practice_sub: "катага жараша тапшырмалар",
  step_mission_sub: "ИИ менен долбоор",
  step_teach: "ИИни үйрөт",
  step_teach_sub: "окуучуга түшүндүр",
  ask: "Матрицалар жөнүндө каалаганыңды сура…",
  check: "Текшерүү",
  hint: "Кеңеш",
  next: "Кийинки тапшырма",
  my_gaps: "Менин кемчиликтерим",
  missions: "Миссияны танда",
  greeting: "Кутман күн",
  course: "Сызыктуу алгебра · Матрицалар",
  my_path: "Менин жолум",
};

export const dict: Record<Lang, Record<DictKey, string>> = { ru, ky };
