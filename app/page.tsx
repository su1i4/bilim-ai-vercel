import Link from "next/link";
import { ArrowRight, Camera, GraduationCap, Layers, MessageCircle, PenLine, Rocket, Sparkles, Target, Wand2 } from "lucide-react";
import { TEACHER } from "@/lib/mock-data";
import { Card, Pill, btnClass } from "@/components/ui";
import { ActivityChart, ErrorsCard, StatCards } from "@/components/teacher";

const FEATURES = [
  { icon: Layers, title: "Объяснение под уровень", text: "Любой ответ ИИ можно попросить «проще» — на бытовой аналогии — или «строже», с формулами. Один материал для слабых и сильных." },
  { icon: Target, title: "Практика под ошибки", text: "ИИ видит, какую ошибку ты сделал, и следующая задача — ровно на неё. Подсказки только вопросами." },
  { icon: Camera, title: "Фото из тетради", text: "Решил на бумаге — сфоткал. ИИ находит шаг с ошибкой и спрашивает про него, не выдавая ответ." },
  { icon: GraduationCap, title: "Научи ИИ", text: "ИИ играет школьника, который не понял тему. Объяснил ему — значит, понял сам. Для педвуза — ещё и тренировка будущего учителя." },
  { icon: Wand2, title: "Копилот преподавателя", text: "Контрольная в 2–3 варианта за минуту, с учётом типичных ошибок группы и с проверенными ответами." },
  { icon: Sparkles, title: "Карта понимания", text: "Преподаватель видит, что понял каждый студент, — по его реальным действиям, а не по одному тесту." },
];

const STEPS = [
  { icon: MessageCircle, n: "01", title: "Знакомство", text: "ИИ начинает с «зачем»: узнаёт интересы и показывает тему на них. Объясняет по материалу преподавателя и строит интерактивные модели прямо в разговоре.", ex: "«Нейросеть, с которой ты говоришь, — это умножение матриц»" },
  { icon: PenLine, n: "02", title: "Практика", text: "Задачи с нарастающей сложностью подстраиваются под ошибки. Подсказки — вопросами, готовых ответов нет. Проверку вычислений делает код.", ex: "Перепутал порядок умножения → следующая задача ровно на это" },
  { icon: GraduationCap, n: "03", title: "Научи ИИ", text: "Студент объясняет тему ИИ-школьнику Айбеку. ИИ задаёт наивные вопросы и отмечает, какие ключевые идеи раскрыты.", ex: "«А если поменять матрицы местами, ответ же тот же?»" },
  { icon: Rocket, n: "04", title: "Миссия", text: "Студент сам выбирает проект из 12, где матрицы становятся инструментом. ИИ — напарник, а не исполнитель.", ex: "Мини-игра, фильтр для фото, мини-нейросеть, снежный барс" },
];

export default function Home() {
  return (
    <main className="pb-16">
      <section className="px-3 sm:px-4">
        <div className="hero-glow relative mx-auto -mt-[76px] max-w-7xl overflow-hidden rounded-b-[40px] px-4 pb-44 pt-32 text-center sm:pb-56 sm:pt-36">
          <Pill>Демо для ОшМПУ · Линейная алгебра: матрицы</Pill>
          <h1 className="mx-auto mt-6 max-w-4xl text-[34px] font-bold leading-[1.08] tracking-tight sm:text-6xl">
            <span className="text-gradient">Учёба, где ИИ</span> объясняет, тренирует и ведёт к проекту
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
            Билим AI проводит студента через три шага — разговор о теме, практику под его ошибки и миссию. Преподаватель видит карту понимания группы и ставит итоговую оценку.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/student" className={btnClass("primary", "lg")}>
              Начать как студент <ArrowRight size={16} />
            </Link>
            <Link href="/teacher" className={btnClass("dark", "lg")}>
              Кабинет преподавателя
            </Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-36 max-w-5xl px-4 sm:-mt-44">
        <div className="rounded-[34px] border border-white/70 bg-white/50 p-2 shadow-[0_30px_80px_-30px_rgba(79,76,230,.55)] backdrop-blur">
          <Card className="p-4 sm:p-6">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">Добрый день,</p>
                <p className="text-xl font-bold tracking-tight sm:text-2xl">{TEACHER.name}</p>
              </div>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">{TEACHER.group} · 32 студента</span>
            </div>
            <StatCards stats={TEACHER.stats} />
            <div className="mt-4 hidden rounded-[24px] border border-slate-200/70 p-4 sm:block">
              <p className="text-sm font-semibold">Активность группы</p>
              <ActivityChart data={TEACHER.activity} />
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-4 text-center">
        <Pill>Чем ИИ полезен в учёбе</Pill>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Личный наставник <span className="text-gradient">для каждого из 32 студентов</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">
          ИИ берёт на себя то, на что у преподавателя нет времени, — личное внимание. Оценку и решения оставляет человеку.
        </p>
        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="p-6">
              <span className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Icon size={19} />
              </span>
              <p className="font-semibold">{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-4 text-center">
        <Pill>Путь студента</Pill>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-gradient">Не «прочитал → тест»,</span> а четыре шага с ИИ
        </h2>
        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, n, title, text, ex }) => (
            <Card key={n} className="flex flex-col p-6">
              <div className="mb-5 flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-600 text-white">
                  <Icon size={19} />
                </span>
                <span className="text-sm font-bold text-slate-300">{n}</span>
              </div>
              <p className="text-lg font-semibold">{title}</p>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{text}</p>
              <p className="mt-4 rounded-2xl bg-lime-soft px-3.5 py-2.5 text-xs font-medium text-lime-900">{ex}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 grid max-w-5xl items-center gap-8 px-4 md:grid-cols-2">
        <div>
          <Pill>Для преподавателя</Pill>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">
            Карта понимания вместо <span className="text-gradient">32 тетрадей</span>
          </h2>
          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            {[
              "Видно, на каком шаге застряли и какие ошибки типичны для группы",
              "ИИ черново разбирает миссии — итоговую оценку ставите вы",
              "Экспорт в Excel, позже — запись оценок в AVN",
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <Sparkles size={16} className="mt-0.5 shrink-0 text-brand-500" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <ErrorsCard errors={TEACHER.errors} />
      </section>

      <section className="mx-auto mt-20 max-w-5xl px-4">
        <div className="rounded-[32px] bg-ink px-6 py-10 text-center text-white sm:px-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-lime">Предложение пилота</p>
          <p className="mx-auto mt-3 max-w-2xl text-2xl font-semibold tracking-tight sm:text-3xl">
            Факультет математики и КТ · весна 2027 · 2–3 преподавателя и 60–90 студентов
          </p>
          <Link href="/student" className={btnClass("lime", "lg", "mt-7")}>
            Посмотреть демо <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <p className="mt-10 text-center text-xs text-slate-400">Билим AI · концепт для ОшМПУ · 2026</p>
    </main>
  );
}
