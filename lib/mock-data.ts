import type { Mission, TeacherData } from "./types";

export const MISSIONS: Mission[] = [
  { id: "nn", area: "Искусственный интеллект", icon: "brain", problem: "Каждый слой нейросети — умножение матрицы на вектор", mission: "Собрать мини-нейросеть, которая узнаёт цифру на картинке 5×5", format: "interactive" },
  { id: "ship", area: "Игры и 3D-графика", icon: "gamepad", problem: "Поворот, масштаб, перенос и проекция объектов", mission: "Мини-игра: управлять кораблём только матрицами", format: "interactive" },
  { id: "filter", area: "Фото и видео", icon: "image", problem: "Картинка — матрица пикселей, фильтры строятся на матрицах", mission: "Сделать свой фильтр: размытие, резкость, контуры", format: "interactive" },
  { id: "hill", area: "Кибербезопасность", icon: "lock", problem: "Шифрование и расшифровка через обратную матрицу", mission: "Зашифровать сообщение шифром Хилла и взломать чужое", format: "lab" },
  { id: "pagerank", area: "Поиск и соцсети", icon: "share", problem: "Матрица ссылок определяет важность сайтов и людей", mission: "Найти самого влиятельного человека в мини-соцсети", format: "lab" },
  { id: "recs", area: "Рекомендации", icon: "sparkles", problem: "Таблица «пользователь × товар» подсказывает, что советовать", mission: "Посоветовать одногруппникам фильмы или музыку", format: "lab" },
  { id: "leontief", area: "Экономика", icon: "coins", problem: "Модель Леонтьева: сколько произвести каждой отрасли", mission: "Рассчитать выпуск для экономики из трёх отраслей", format: "lab" },
  { id: "routes", area: "Логистика", icon: "route", problem: "Матрица смежности показывает маршруты между городами", mission: "Посчитать маршруты между Ошем, Бишкеком и Джалал-Абадом", format: "lab" },
  { id: "circuit", area: "Инженерия", icon: "zap", problem: "Системы уравнений для цепей и конструкций", mission: "Рассчитать токи в простой схеме", format: "lab" },
  { id: "leslie", area: "Биология и экология", icon: "leaf", problem: "Матрица Лесли прогнозирует численность популяций", mission: "Спрогнозировать численность снежного барса на 10 лет", format: "lab" },
  { id: "massey", area: "Спорт", icon: "trophy", problem: "Рейтинги команд по результатам матчей (метод Массея)", mission: "Составить честный рейтинг футбольных команд", format: "lab" },
  { id: "ct", area: "Медицина", icon: "scan", problem: "КТ и МРТ восстанавливают снимок из матрицы измерений", mission: "Восстановить «картинку» 3×3 по суммам строк и столбцов", format: "lab" },
];

export const DEMO_STUDENT = "Азамат Абдыкадыров";

export const TEACHER: TeacherData = {
  name: "Айгуль Токтосунова",
  dept: "Факультет математики и КТ",
  course: "Линейная алгебра: матрицы",
  group: "МКТ-1-25",
  stats: [
    { key: "students", label: "Студентов", value: "32", trend: "up" },
    { key: "progress", label: "Средний прогресс", value: "64%", trend: "up" },
    { key: "stuck", label: "Застряли", value: "7", trend: "down" },
    { key: "missions", label: "Миссий сдано", value: "11", trend: "up" },
  ],
  activity: [42, 48, 45, 60, 58, 71, 66, 74, 69, 82, 78, 90, 86, 94],
  steps: [
    { label: "Знакомство", done: 94, stuck: 3 },
    { label: "Практика", done: 71, stuck: 19 },
    { label: "Миссия", done: 34, stuck: 9 },
  ],
  errors: [
    { label: "Путают порядок умножения (A·B и B·A)", pct: 40 },
    { label: "Строка × столбец: ошибка индексов", pct: 28 },
    { label: "Столбцы матрицы ≠ образы базиса", pct: 22 },
    { label: "Знак при повороте", pct: 15 },
  ],
  concepts: ["Умножение", "Порядок", "Поворот", "Отражение", "Определитель"],
  students: [
    { name: "Айпери Маматова", step: "mission", progress: 92, status: "done", mastery: [95, 90, 88, 92, 80], lastError: "—" },
    { name: "Бекжан Турдубаев", step: "practice", progress: 58, status: "stuck", mastery: [70, 30, 55, 60, 40], lastError: "Порядок умножения" },
    { name: "Нурзат Осмонова", step: "practice", progress: 66, status: "ok", mastery: [85, 60, 70, 65, 50], lastError: "Строка × столбец" },
    { name: "Эрлан Жээнбеков", step: "intro", progress: 22, status: "stuck", mastery: [35, 20, 25, 30, 15], lastError: "Столбцы = образы базиса" },
    { name: "Гулзада Ташиева", step: "mission", progress: 84, status: "ok", mastery: [90, 85, 80, 70, 75], lastError: "Знак при повороте" },
    { name: "Тимур Исаков", step: "practice", progress: 47, status: "stuck", mastery: [60, 25, 40, 45, 30], lastError: "Порядок умножения" },
    { name: "Жибек Сыдыкова", step: "mission", progress: 100, status: "done", mastery: [98, 95, 92, 96, 90], lastError: "—" },
    { name: "Мирлан Касымов", step: "practice", progress: 61, status: "ok", mastery: [80, 45, 65, 58, 48], lastError: "Порядок умножения" },
    { name: "Асель Бакирова", step: "intro", progress: 35, status: "ok", mastery: [55, 40, 35, 40, 25], lastError: "—" },
    { name: "Данияр Эсенов", step: "practice", progress: 52, status: "stuck", mastery: [65, 35, 50, 55, 35], lastError: "Строка × столбец" },
  ],
  submissions: [
    { id: "s1", student: "Айпери Маматова", mission: "Мини-нейросеть: узнать цифру 5×5", aiGrade: 92, aiComment: "Верно собрала матрицу весов и объяснила W·x. Не проверила картинку с «шумом».", at: "сегодня, 10:42" },
    { id: "s2", student: "Жибек Сыдыкова", mission: "Мини-игра: корабль на матрицах", aiGrade: 97, aiComment: "Все 4 уровня с первой попытки, сама вывела поворот на 180°.", at: "вчера, 18:15" },
    { id: "s3", student: "Гулзада Ташиева", mission: "Фильтр для фото: контуры", aiGrade: 81, aiComment: "Ядро контуров верное, но сумма ядра размытия ≠ 1 — картинка посветлела.", at: "вчера, 14:03" },
  ],
};
