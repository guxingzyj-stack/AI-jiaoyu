"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  Bot,
  ChevronRight,
  Coins,
  Flame,
  Medal,
  Rocket,
  RotateCcw,
  Shield,
  Sparkles,
  Swords,
  Zap,
  type LucideIcon
} from "lucide-react";
import { useMemo, useState } from "react";
import { readDailyQuestState, type DailyQuest } from "../../lib/dailyQuestEngine";
import { gameAssets } from "../../lib/gameAssets";
import {
  LAUNCHES_STORAGE_KEY,
  readProgress,
  readStudent,
  type LearningProgress,
  type StudentProfile
} from "../../lib/learningProgress";
import { calculateSkillCards } from "../../lib/skillEngine";

const navItems = [
  { label: "挑战", icon: Swords, active: true },
  { label: "怪兽", icon: Shield, active: false },
  { label: "技能", icon: Sparkles, active: false },
  { label: "报告", icon: BarChart3, active: false }
];

export default function AdventurePage() {
  const [student] = useState<StudentProfile>(() => readStudent());
  const [progress] = useState<LearningProgress>(() => readProgress());
  const [dailyState] = useState(() => readDailyQuestState());
  const [launches, setLaunches] = useState(() => {
    if (typeof window === "undefined") {
      return 0;
    }

    return Number(window.localStorage.getItem(LAUNCHES_STORAGE_KEY) ?? 0);
  });

  const expPercent = useMemo(
    () => Math.min(100, Math.round((student.exp / student.maxExp) * 100)),
    [student.exp, student.maxExp]
  );
  const completedToday = dailyState.dailyQuests.filter((quest) => quest.status === "completed").length;
  const activeMonsterCount = progress.monsters.filter((monster) => monster.status === "active").length;
  const hasSkillUpgrade = calculateSkillCards(progress).some((skill) => skill.level >= 2);
  const adventureCompleted = dailyState.dailyCompleted;

  const handleStart = () => {
    const nextLaunches = launches + 1;
    setLaunches(nextLaunches);
    window.localStorage.setItem(LAUNCHES_STORAGE_KEY, String(nextLaunches));
  };

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

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-24 pt-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
              智学探险家 · 第一季试映版
            </p>
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
              今日进度 {completedToday}/3
            </div>
            <Link
              className="absolute bottom-4 left-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-[22px] bg-amber-300 px-4 text-sm font-black text-slate-950 shadow-glow"
              href="/challenge"
              onClick={handleStart}
            >
              开始第一关
              <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[1fr_220px] lg:items-center">
            <div className="min-w-0">
              <h2 className="text-2xl font-black leading-tight sm:text-4xl">数学星球能量不足！</h2>
              <p className="mt-3 text-sm font-bold leading-6 text-slate-100 sm:text-base">
                完成 3 个任务，帮助 Nova 点亮今天的星球。挑战能量塔、收集线索、追踪错题怪兽，完成一次完整学习冒险。
              </p>
              <div className="mt-4 rounded-[24px] border border-cyan-100/30 bg-slate-950/45 p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-black text-cyan-100">
                  <span>星球能量 HUD</span>
                  <span>{completedToday}/3</span>
                </div>
                <div className="h-5 overflow-hidden rounded-full border border-cyan-100/20 bg-slate-950/65">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-violet-300 to-amber-300"
                    style={{ width: `${Math.round((completedToday / 3) * 100)}%` }}
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
                  经验 {student.exp}/{student.maxExp}
                </span>
                <span>{expPercent}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 grid w-full max-w-full grid-cols-1 gap-3 min-[360px]:grid-cols-2 sm:grid-cols-3">
            <StatPill icon={Coins} label="金币" value={student.coins.toLocaleString("zh-CN")} />
            <StatPill icon={Flame} label="连续学习" value={`${dailyState.streak} 天`} />
            <StatPill icon={Medal} label="今日进度" value={`${completedToday}/3`} />
          </div>
        </section>

        <section className="mb-5">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-bold text-violet-200">今日关卡任务</p>
              <h2 className="mt-1 max-w-full break-words text-2xl font-black leading-tight sm:text-4xl">
                {adventureCompleted ? "数学星球已点亮" : "完成三关，启动星球核心"}
              </h2>
            </div>
            <span className="hidden rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 sm:inline-flex">
              推荐 5-10 分钟
            </span>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {dailyState.dailyQuests.map((quest, index) => (
              <QuestCard key={quest.id} quest={quest} index={index} hasMonsters={progress.monsters.length > 0} />
            ))}
          </div>
        </section>

        {adventureCompleted && (
          <section
            className="mb-5 rounded-[30px] border border-emerald-200/25 bg-emerald-200/10 p-5 shadow-glow backdrop-blur-xl"
            data-testid="season-complete"
          >
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-emerald-300 text-slate-950">
                <Sparkles size={30} />
              </div>
              <div>
                <h2 className="text-xl font-black">第一季学习冒险闭环已完成</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  今天的 3 个任务已经完成。可以请家长查看今日成长报告，看看你点亮了哪些学习能力。
                </p>
                <Link
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-emerald-300 px-4 text-sm font-black text-slate-950"
                  href="/report"
                >
                  查看成长报告
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
          className="mb-6 flex min-h-16 items-center justify-center gap-3 rounded-[30px] bg-gradient-to-r from-amber-300 via-cyan-300 to-violet-400 px-6 py-4 text-lg font-black text-slate-950 shadow-glow transition active:scale-[0.98]"
          data-testid="start-challenge"
          href="/challenge"
          onClick={handleStart}
        >
          进入能量塔挑战
          <ChevronRight size={24} />
        </Link>
        <p className="mb-2 text-center text-xs font-bold text-slate-500">Version: S1 Screening Build v0.1</p>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 w-screen max-w-full overflow-hidden border-t border-white/10 bg-[#090d22]/90 px-3 py-2 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-[calc(100vw-24px)] grid-cols-4 gap-1.5 sm:max-w-md sm:gap-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const className = `relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold ${
              item.active
                ? "bg-cyan-300 text-slate-950"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`;
            const content = (
              <>
                <Icon size={20} />
                {item.label}
                {index === 1 && activeMonsterCount > 0 && (
                  <span className="absolute right-2 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1 text-[11px] font-black text-slate-950">
                    {activeMonsterCount}
                  </span>
                )}
                {index === 2 && hasSkillUpgrade && (
                  <span className="absolute right-1 top-1 rounded-full bg-emerald-300 px-1.5 py-0.5 text-[10px] font-black text-slate-950">
                    升级
                  </span>
                )}
              </>
            );

            return index === 1 || index === 2 || index === 3 ? (
              <Link
                className={className}
                data-testid={index === 1 ? "nav-monsters" : index === 2 ? "nav-skills" : "nav-report"}
                href={index === 1 ? "/monsters" : index === 2 ? "/skills" : "/report"}
                key={item.label}
              >
                {content}
              </Link>
            ) : (
              <button className={className} key={item.label} type="button">
                {content}
              </button>
            );
          })}
        </div>
      </nav>
    </main>
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

function QuestCard({ quest, index, hasMonsters }: { quest: DailyQuest; index: number; hasMonsters: boolean }) {
  const visual = getQuestVisual(quest, index);
  const Icon = visual.icon;
  const questDone = quest.status === "completed";

  return (
    <article className="group min-w-0 overflow-hidden rounded-[30px] border border-white/15 bg-slate-950/60 shadow-[0_18px_60px_rgba(0,0,0,0.24)] backdrop-blur transition hover:-translate-y-1 hover:border-cyan-200/50">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-white/25 to-cyan-200/10">
        <Image
          alt={visual.title}
          className="h-full w-full object-contain p-2"
          height={visual.height}
          loading="eager"
          sizes="(max-width: 768px) 100vw, 33vw"
          src={visual.image}
          width={visual.width}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-black text-slate-950">
          第 {index + 1} 关
        </div>
      </div>
      <div className={`bg-gradient-to-br ${visual.accent} p-4 text-slate-950`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black opacity-80">Quest Stage</p>
            <h3 className="mt-1 text-xl font-black leading-tight">{visual.title}</h3>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] bg-white/35">
            <Icon size={30} />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ${
              questDone ? "bg-emerald-300 text-slate-950" : "bg-white/10 text-slate-200"
            }`}
          >
            {questDone ? "已完成" : "待挑战"}
          </span>
          <span className="text-xs font-black text-amber-100">
            +{quest.rewardExp} XP / +{quest.rewardCoins} 金币
          </span>
        </div>
        <p className="mt-3 text-sm font-bold leading-6 text-slate-200">{visual.description}</p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${visual.accent}`}
            style={{ width: `${questDone ? 100 : 0}%` }}
          />
        </div>
        {quest.type === "monster_review" && !hasMonsters && !questDone && (
          <p className="mt-3 text-xs font-bold leading-5 text-amber-100">
            暂无怪兽，可先完成挑战生成错题怪兽。
          </p>
        )}
        <Link
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-white/10 px-4 text-sm font-black text-white hover:bg-white/15"
          href={visual.href}
        >
          {questDone ? "查看战果" : visual.action}
        </Link>
      </div>
    </article>
  );
}

function getQuestVisual(quest: DailyQuest, index: number) {
  if (quest.type === "challenge") {
    return {
      icon: Zap,
      accent: "from-cyan-300 to-blue-500",
      title: "能量塔挑战",
      description: "解开核心题，给数学星球补充第一格能量。",
      action: "开始挑战",
      href: "/challenge",
      image: gameAssets.quests.challenge,
      width: 1122,
      height: 1402
    };
  }

  if (quest.type === "ai_help") {
    return {
      icon: Bot,
      accent: "from-violet-300 to-fuchsia-500",
      title: "Nova 线索任务",
      description: "让 Nova 给你一点线索，练习先思考、再求助。",
      action: "去找线索",
      href: "/challenge",
      image: gameAssets.quests.ai_help,
      width: 1536,
      height: 1024
    };
  }

  return {
    icon: RotateCcw,
    accent: "from-emerald-300 to-green-600",
    title: "怪兽追踪战",
    description: "复盘错题怪兽，把薄弱点变成新的战斗经验。",
    action: index >= 0 ? "追踪怪兽" : quest.title,
    href: "/monsters",
    image: gameAssets.quests.monster_review,
    width: 1448,
    height: 1086
  };
}
