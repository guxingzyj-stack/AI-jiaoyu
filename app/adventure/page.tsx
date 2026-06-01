"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Bot,
  ChevronRight,
  Coins,
  Flame,
  Medal,
  Rocket,
  Sparkles,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createDailyQuests,
  readDailyQuestState,
  type DailyQuestState
} from "../../lib/dailyQuestEngine";
import { gameAssets } from "../../lib/gameAssets";
import {
  EXP_PER_LEVEL,
  LAUNCHES_STORAGE_KEY,
  computeLevel,
  defaultProgress,
  defaultStudent,
  readProgress,
  readStudent,
  type LearningProgress,
  type StudentProfile
} from "../../lib/learningProgress";

export default function AdventurePage() {
  const [student, setStudent] = useState<StudentProfile>(defaultStudent);
  const [progress, setProgress] = useState<LearningProgress>(defaultProgress);
  const [dailyState, setDailyState] = useState<DailyQuestState>(() => ({
    lastQuestDate: "",
    dailyQuests: createDailyQuests(),
    dailyCompleted: false,
    streak: defaultStudent.streak
  }));
  const [launches, setLaunches] = useState(0);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStudent(readStudent());
      setProgress(readProgress());
      setDailyState(readDailyQuestState());
      setLaunches(Number(window.localStorage.getItem(LAUNCHES_STORAGE_KEY) ?? 0));
      setPageReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const levelInfo = useMemo(() => computeLevel(student.exp), [student.exp]);
  const expPercent = levelInfo.percent;
  const tutorialDone = progress.tutorialFirstWinDone;
  const experienceStarted = launches > 0 || progress.attempts.length > 0;
  const experienceCompleted = progress.attempts.length > 0;
  const heroHref = "/map";
  const heroButtonLabel = "开始今天的冒险";
  const heroTitle = experienceCompleted ? "今天的小冒险完成啦！" : "第一颗星已经亮啦，继续帮 Nova 点亮能量塔。";
  const heroDescription = experienceCompleted
    ? "你已经完成今天的小挑战，可以去看看星星报告。"
    : "继续完成云朵迷雾小冒险，把 3 座小塔都点亮。";
  const heroHudLabel = experienceCompleted ? "已完成" : "继续中";
  const heroHudPercent = experienceCompleted ? 100 : 55;

  const handleStart = () => {
    const nextLaunches = launches + 1;
    setLaunches(nextLaunches);
    window.localStorage.setItem(LAUNCHES_STORAGE_KEY, String(nextLaunches));
  };

  const alwaysShowEntryCard = true;

  if (alwaysShowEntryCard || (pageReady && !tutorialDone)) {
    return (
      <main className="min-h-screen overflow-hidden bg-[#17206a] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[-24%] top-[-12%] h-96 w-96 rounded-full bg-cyan-400/25 blur-3xl" />
          <div className="absolute right-[-30%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-violet-600/30 blur-3xl" />
          <div className="absolute bottom-[-18%] left-[16%] h-80 w-80 rounded-full bg-amber-300/12 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-4 py-6 sm:px-6">
          <section className="overflow-hidden rounded-[38px] border border-white/15 bg-white/12 shadow-glow backdrop-blur-xl">
            <div className="relative min-h-[560px] overflow-hidden sm:min-h-[640px]">
              <Image
                alt="数学星球冒险"
                className="absolute inset-0 h-full w-full object-cover"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                src={gameAssets.lobbyHero}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#10145b]/95 via-[#10145b]/15 to-transparent" />
              <Image
                alt="Nova"
                className="absolute bottom-28 left-1/2 h-48 w-48 -translate-x-1/2 object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,0.35)] sm:h-56 sm:w-56"
                height={1254}
                priority
                src={gameAssets.novaHappy}
                width={1254}
              />
              <div className="absolute inset-x-4 bottom-5 rounded-[30px] border border-white/20 bg-slate-950/60 p-5 text-center backdrop-blur-xl">
                <h1 className="text-3xl font-black leading-tight">Nova 在数学星球等你。</h1>
                <Link
                  className="mt-5 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[26px] bg-amber-300 px-5 text-lg font-black text-slate-950 shadow-glow"
                  data-testid="start-challenge"
                  href="/map"
                  onClick={handleStart}
                >
                  开始今天的冒险
                  <ChevronRight size={22} />
                </Link>
                <Link
                  className="mt-3 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[26px] bg-gradient-to-r from-lime-300 via-amber-300 to-amber-400 px-5 text-lg font-black text-slate-950 shadow-glow"
                  data-testid="start-forest-map"
                  href="/adventure/forest-map"
                >
                  开始森林小地图探索
                  <ChevronRight size={22} />
                </Link>
                <ParentTestLinks />
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#17206a] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-24%] top-[-12%] h-96 w-96 rounded-full bg-cyan-400/25 blur-3xl" />
        <div className="absolute right-[-30%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[16%] h-80 w-80 rounded-full bg-amber-300/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.16)_1px,transparent_2px)] bg-[size:38px_38px] opacity-45" />
        <div className="absolute inset-x-0 top-32 h-px rotate-[-8deg] bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent" />
        <div className="absolute inset-x-0 top-56 h-px rotate-[7deg] bg-gradient-to-r from-transparent via-violet-200/30 to-transparent" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-8 pt-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">智学探险家</p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">
              今日冒险：点亮数学星球
            </h1>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[24px] border border-cyan-200/40 bg-cyan-200/15 shadow-glow">
            <Rocket className="text-cyan-100" size={28} />
          </div>
        </header>

        <section className="relative mb-5 overflow-hidden rounded-[36px] border-4 border-white/20 bg-white/15 shadow-glow backdrop-blur-xl">
          <div className="relative aspect-[16/10] min-h-[260px] overflow-hidden sm:aspect-[16/8] lg:min-h-[390px]">
            <Image
              alt="数学星球冒险大厅"
              className="h-full w-full object-cover"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              src={gameAssets.lobbyHero}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#10145b]/95 via-[#10145b]/15 to-transparent" />
            <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-amber-200/45 bg-slate-950/55 px-3 py-2 text-xs font-black text-amber-100 backdrop-blur">
              <Sparkles size={14} />
              今日体验：{experienceCompleted ? "已完成" : experienceStarted ? "已开始" : "未开始"}
            </div>
            <Link
              className="absolute bottom-4 left-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-[22px] bg-amber-300 px-4 text-sm font-black text-slate-950 shadow-glow"
              href={heroHref}
              onClick={handleStart}
            >
              {heroButtonLabel}
              <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_220px] lg:items-center">
            <div className="min-w-0">
              <h2 className="text-2xl font-black leading-tight sm:text-4xl">{heroTitle}</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-slate-100 sm:text-base">{heroDescription}</p>
              <div className="mt-4 rounded-[24px] border border-cyan-100/30 bg-slate-950/45 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-black text-cyan-100">
                  <span>星球能量 HUD</span>
                  <span>{heroHudLabel}</span>
                </div>
                <div className="h-5 overflow-hidden rounded-full border border-cyan-100/20 bg-slate-950/65">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-amber-300"
                    style={{ width: `${heroHudPercent}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <Image
                alt="Nova 开心学习伙伴"
                className="h-auto w-full drop-shadow-[0_22px_38px_rgba(0,0,0,0.35)]"
                height={640}
                priority
                src={gameAssets.novaHappy}
                width={640}
              />
            </div>
          </div>
        </section>

        <section className="mb-5 w-full max-w-full overflow-hidden rounded-[28px] border border-white/15 bg-slate-950/55 p-4 backdrop-blur-xl sm:p-5">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-cyan-300 via-blue-400 to-violet-500 text-2xl font-black text-slate-950">
              星
              <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-xs text-slate-950">
                {student.level}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-black">{student.nickname}</h2>
                <span className="rounded-full border border-amber-200/35 bg-amber-200/15 px-2.5 py-1 text-xs font-bold text-amber-100">
                  Lv.{student.level} 星图学员
                </span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-950/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400"
                  style={{ width: `${expPercent}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-300">
                <span>
                  经验 {levelInfo.expIntoLevel}/{EXP_PER_LEVEL}
                </span>
                <span>{expPercent}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid w-full max-w-full grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3">
            <StatPill icon={Coins} label="金币" value={student.coins.toLocaleString("zh-CN")} />
            <StatPill icon={Flame} label="连续学习" value={`${dailyState.streak} 天`} />
            <StatPill icon={Medal} label="今日体验" value={experienceCompleted ? "已完成" : experienceStarted ? "已开始" : "待开始"} />
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-violet-200">今日体验路线</p>
              <h2 className="mt-1 max-w-full break-words text-2xl font-black leading-tight sm:text-4xl">
                {experienceCompleted ? "今天的星星题已完成" : "5 分钟走完一次学习冒险"}
              </h2>
            </div>
            <span className="hidden rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 sm:inline-flex">
              推荐 5-10 分钟
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <ExperienceStep
              description="完成一道三年级数学题，点亮今天的第一颗星。"
              image={gameAssets.quests.challenge}
              index={1}
              status={experienceCompleted ? "已完成" : "主线"}
              title="做一道星星能量题"
            />
            <ExperienceStep
              description="如果卡住，可以让 Nova 给线索或讲一讲。"
              image={gameAssets.quests.ai_help}
              index={2}
              status="可选帮助"
              title="遇到困难可以问 Nova"
            />
            <ExperienceStep
              description="答题后查看星星报告。"
              image={gameAssets.quests.monster_review}
              index={3}
              status="最后一步"
              title="查看今日星星报告"
            />
          </div>
        </section>

        {experienceCompleted && (
          <section
            className="mb-5 rounded-[30px] border border-emerald-200/25 bg-emerald-200/10 p-5 shadow-glow backdrop-blur-xl"
            data-testid="season-complete"
          >
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-emerald-300 text-slate-950">
                <Sparkles size={30} />
              </div>
              <div>
                <h2 className="text-xl font-black">今日星星体验已完成</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  你已经完成今天的星星能量题。可以请家长查看今日星星报告。
                </p>
                <Link
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-300 px-4 text-sm font-black text-slate-950"
                  href="/report"
                >
                  查看星星报告
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="mb-5 rounded-[30px] border border-cyan-200/20 bg-cyan-200/10 p-4 backdrop-blur-xl sm:p-5">
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-cyan-200 text-slate-950">
              <Bot size={30} />
            </div>
            <div>
              <p className="text-sm font-black text-cyan-100">Nova 学习伙伴</p>
              <p className="mt-1 text-sm leading-6 text-slate-200 sm:text-base">
                今天先恢复能量塔。遇到卡点时，我会给你线索，不会直接抢走你的思考机会。
              </p>
            </div>
          </div>
        </section>

        <Link
          className="mb-4 flex min-h-16 items-center justify-center gap-3 rounded-[30px] bg-gradient-to-r from-amber-300 via-cyan-300 to-violet-400 px-6 py-4 text-lg font-black text-slate-950 shadow-glow transition active:scale-[0.98]"
          data-testid="start-challenge"
          href={heroHref}
          onClick={handleStart}
        >
          {heroButtonLabel}
          <ChevronRight size={24} />
        </Link>
        <Link
          className="mb-4 flex min-h-16 items-center justify-center gap-3 rounded-[30px] bg-gradient-to-r from-lime-300 via-amber-300 to-amber-400 px-6 py-4 text-lg font-black text-slate-950 shadow-glow transition active:scale-[0.98]"
          data-testid="start-forest-map"
          href="/adventure/forest-map"
        >
          开始森林小地图探索
          <ChevronRight size={24} />
        </Link>
        <ParentTestLinks />
      </div>
    </main>
  );
}

function ParentTestLinks() {
  return (
    <details className="mt-4 rounded-[22px] border border-white/10 bg-slate-950/25 px-4 py-3 text-left text-sm text-slate-200">
      <summary className="cursor-pointer text-center text-xs font-black text-cyan-100/80">
        家长 / 测试入口
      </summary>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <TestLink href="/adventure/forest-map">测试：森林小地图探索版</TestLink>
        <TestLink href="/adventure/starlight-sea">开始星光海跳岛航线</TestLink>
        <TestLink href="/map">进入星球地图</TestLink>
        <TestLink href="/adventure/multiples-sea">直接进入倍数海</TestLink>
        <TestLink href="/adventure/forest-island">直接进入森林岛</TestLink>
        <TestLink href="/adventure/forest-rpg">测试：星光灯救援原型</TestLink>
        <TestLink href="/report">查看星星报告</TestLink>
      </div>
    </details>
  );
}

function TestLink({ children, href }: { children: string; href: string }) {
  return (
    <Link
      className="inline-flex min-h-10 items-center justify-center rounded-[18px] border border-cyan-200/20 bg-cyan-200/8 px-3 text-xs font-black text-cyan-50/80 transition hover:bg-cyan-200/14 active:scale-95"
      href={href}
    >
      {children}
    </Link>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-slate-950/45 px-3 py-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-300">
        <Icon size={15} />
        {label}
      </div>
      <div className="text-lg font-black text-white">{value}</div>
    </div>
  );
}

function ExperienceStep({
  description,
  image,
  index,
  status,
  title
}: {
  description: string;
  image: string;
  index: number;
  status: string;
  title: string;
}) {
  return (
    <article className="min-w-0 overflow-hidden rounded-[30px] border border-white/15 bg-slate-950/55 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-white/25 to-cyan-200/10">
        <Image
          alt={title}
          className="h-full w-full object-contain p-2"
          height={1200}
          loading="eager"
          sizes="(max-width: 768px) 100vw, 33vw"
          src={image}
          width={1200}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-950">
          步骤 {index}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">
            {status}
          </span>
          <Sparkles className="text-amber-200" size={18} />
        </div>
        <h3 className="mt-3 text-xl font-black leading-tight">{title}</h3>
        <p className="mt-2 text-sm font-bold leading-6 text-slate-200">{description}</p>
      </div>
    </article>
  );
}
