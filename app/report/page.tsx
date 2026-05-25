"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  BarChart3,
  Bot,
  CheckCircle2,
  Coins,
  Gem,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  createDailyQuests,
  readDailyQuestState,
  resetExperienceData,
  type DailyQuestState
} from "../../lib/dailyQuestEngine";
import { gameAssets } from "../../lib/gameAssets";
import { defaultProgress, defaultStudent, readProgress } from "../../lib/learningProgress";
import { buildGrowthReport } from "../../lib/reportEngine";

export default function ReportPage() {
  const [progress, setProgress] = useState(defaultProgress);
  const [dailyState, setDailyState] = useState<DailyQuestState>(() => ({
    lastQuestDate: "",
    dailyQuests: createDailyQuests(),
    dailyCompleted: false,
    streak: defaultStudent.streak
  }));
  const report = useMemo(() => buildGrowthReport(progress), [progress]);
  const hasLearningData =
    progress.attempts.length > 0 ||
    progress.aiHelpRecords.length > 0 ||
    progress.mistakes.length > 0 ||
    progress.monsters.length > 0;
  const remainingTasks = dailyState.dailyQuests.filter((quest) => quest.status !== "completed").length;
  const todayTitle =
    report.monsterSummary.defeated > 0
      ? "错题怪兽击破者"
      : report.overview.aiHelpCount > 0
        ? "Nova 协作学员"
        : "冒险新手";
  const nextLevelTip =
    report.monsterSummary.active > 0
      ? "下一关推荐：先去怪兽图鉴完成 1 次复盘。"
      : "下一关推荐：继续完成 1 道数学挑战，并先尝试独立思考。";
  const harvestSummary = `今日收获：${report.overview.exp} 经验、${report.overview.coins} 金币、${report.overview.aiHelpCount} 次 Nova 提示记录。`;
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProgress(readProgress());
      setDailyState(readDailyQuestState());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const resetData = () => {
    if (window.confirm("确定要重置体验数据吗？这会清空本机的挑战、怪兽、技能和报告记录。")) {
      resetExperienceData();
      window.location.href = "/pilot";
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#17206a] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-18%] top-[-12%] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-22%] top-[18%] h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[16%] h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 pb-10 pt-5 sm:px-6 lg:px-8">
        <header className="mb-5 flex items-center justify-between gap-3">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-300/30 bg-white/5 px-3 text-sm font-bold text-cyan-100"
            href="/adventure"
          >
            <ArrowLeft size={16} />
            今日冒险
          </Link>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-200/15 shadow-glow">
            <Star className="fill-amber-200 text-amber-200" size={25} />
          </div>
        </header>

        <section className="mb-5 rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-glow backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">Adventure Clear</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">今日冒险结算</h1>
          <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
            每一次挑战，都会变成可看见的成长奖励。
          </p>
        </section>

        {!hasLearningData && (
          <section
            className="mb-5 rounded-[28px] border border-cyan-200/20 bg-cyan-200/10 p-5 backdrop-blur-xl"
            data-testid="report-empty"
          >
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                <Bot size={27} />
              </div>
              <div>
                <h2 className="text-xl font-black">今天的报告还在等待第一条记录</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  先完成一次挑战，或使用 Nova 的提示，报告就会开始记录你的学习成长。
                </p>
                <Link
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-cyan-300 px-4 text-sm font-black text-slate-950"
                  href="/challenge"
                >
                  去完成第一场挑战
                </Link>
              </div>
            </div>
          </section>
        )}

        <section
          className={`mb-5 overflow-hidden rounded-[32px] border backdrop-blur-xl ${
            dailyState.dailyCompleted
              ? "border-emerald-200/25 bg-emerald-200/10"
              : "border-cyan-200/20 bg-cyan-200/10"
          }`}
          data-testid="report-settlement"
        >
          <div className="relative min-h-44 overflow-hidden bg-gradient-to-br from-cyan-300 via-violet-400 to-amber-300 p-5 text-slate-950 sm:min-h-56">
            <Image
              alt="Nova 冒险结算"
              className="absolute bottom-0 right-0 h-40 w-40 object-contain opacity-95 drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)] sm:h-56 sm:w-56"
              height={1254}
              sizes="(max-width: 768px) 160px, 224px"
              src={gameAssets.novaCheer}
              width={1254}
            />
            <div className="relative z-10 flex items-start justify-between gap-3 pr-20 sm:pr-40">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] opacity-75">通关结算</p>
                <h2 className="mt-2 text-3xl font-black leading-tight">
                  {dailyState.dailyCompleted ? "今日冒险完成！" : "今日冒险进行中"}
                </h2>
              </div>
              <div className="relative z-10 text-5xl leading-none">🏆</div>
            </div>
          </div>

          <div className="p-5">
          <div className="flex gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                dailyState.dailyCompleted ? "bg-emerald-300" : "bg-cyan-300"
              } text-slate-950`}
            >
              <Sparkles size={27} />
            </div>
            <div>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                {dailyState.dailyCompleted
                  ? "你已经完成一次完整学习闭环，可以请家长查看这份成长报告。"
                  : `还差 ${remainingTasks} 个任务即可完成今日冒险。`}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-bold leading-6 text-slate-100 sm:grid-cols-4">
                <p className="rounded-2xl bg-slate-950/45 p-3">
                  今日完成度：{dailyState.dailyQuests.length - remainingTasks}/3
                </p>
                <p className="rounded-2xl bg-slate-950/45 p-3">⭐ 获得 XP：{report.overview.exp}</p>
                <p className="rounded-2xl bg-slate-950/45 p-3">🪙 获得金币：{report.overview.coins}</p>
                <p className="rounded-2xl bg-slate-950/45 p-3">今日称号：{todayTitle}</p>
                <p className="rounded-2xl bg-slate-950/45 p-3">🎁 击败怪兽：{report.overview.defeatedMonsterCount}</p>
              </div>
              <div className="mt-3 grid gap-2 text-sm font-bold leading-6 text-slate-100">
                <p className="rounded-2xl bg-slate-950/45 p-3">{nextLevelTip}</p>
                <p className="rounded-2xl bg-slate-950/45 p-3">{harvestSummary}</p>
              </div>
            </div>
          </div>
          </div>
        </section>

        {dailyState.dailyCompleted && (
          <section className="mb-5 rounded-[28px] border border-emerald-200/25 bg-emerald-200/10 p-5 backdrop-blur-xl">
            <h2 className="text-xl font-black">第一季学习冒险闭环已完成</h2>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              今天的挑战、AI 使用和错题复盘任务已经连成闭环，可以请家长一起查看这份成长报告。
            </p>
          </section>
        )}

        <section className="mb-5" data-testid="report-overview">
          <SectionTitle icon={BarChart3} title="今日学习概览" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="完成挑战" value={String(report.overview.completedChallenges)} icon={CheckCircle2} />
            <MetricCard label="总经验" value={String(report.overview.exp)} icon={Sparkles} />
            <MetricCard label="当前金币" value={String(report.overview.coins)} icon={Coins} />
            <MetricCard label="正确率" value={`${report.overview.accuracy}%`} icon={Target} />
            <MetricCard label="AI 提示" value={String(report.overview.aiHelpCount)} icon={Bot} />
            <MetricCard label="怪兽数量" value={String(report.overview.monsterCount)} icon={Shield} />
            <MetricCard label="已击败" value={String(report.overview.defeatedMonsterCount)} icon={Zap} />
            <MetricCard label="成长等级" value={`Lv.${Math.max(1, Math.floor(report.overview.exp / 100))}`} icon={Gem} />
          </div>
        </section>

        <section
          className="mb-5 rounded-[28px] border border-white/15 bg-slate-950/55 p-5 backdrop-blur-xl"
          data-testid="report-summary"
        >
          <SectionTitle icon={Sparkles} title="今日冒险总结" />
          <p className="mt-3 text-base font-bold leading-8 text-slate-100">{report.summaryText}</p>
        </section>

        <section className="mb-5" data-testid="report-weak-points">
          <SectionTitle icon={Target} title="数学薄弱点" />
          {report.weakPoints.length === 0 ? (
            <div className="rounded-[28px] border border-emerald-200/20 bg-emerald-200/10 p-5 text-sm font-bold leading-6 text-emerald-50">
              今天表现不错，可以继续挑战更高难度。
            </div>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {report.weakPoints.map((point) => (
                <article
                  className="rounded-[28px] border border-white/15 bg-slate-950/55 p-4 backdrop-blur-xl"
                  key={point.knowledgePoint}
                >
                  <p className="text-sm font-bold text-cyan-100">{point.knowledgePoint}</p>
                  <h2 className="mt-1 text-2xl font-black">出错 {point.mistakeCount} 次</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{point.reviewTip}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mb-5" data-testid="report-ai-skills">
          <SectionTitle icon={Bot} title="AI 使用能力" />
          <div className="grid gap-3 lg:grid-cols-2">
            {report.aiSkillSummary.map((skill) => (
              <article
                className="rounded-[24px] border border-white/15 bg-white/8 p-4 backdrop-blur-xl"
                key={skill.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black">{skill.name}</h2>
                  <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">
                    Lv.{skill.level}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-200">{skill.comment}</p>
                <p className="mt-3 rounded-2xl bg-slate-950/45 p-3 text-sm leading-6 text-cyan-50">
                  下一步：{skill.nextTip}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mb-5 rounded-[28px] border border-white/15 bg-slate-950/55 p-5 backdrop-blur-xl"
          data-testid="report-monsters"
        >
          <SectionTitle icon={Shield} title="错题怪兽战报" />
          <div className="mt-4 grid grid-cols-1 gap-3 min-[360px]:grid-cols-3">
            <MiniStat label="活跃" value={String(report.monsterSummary.active)} />
            <MiniStat label="已复盘" value={String(report.monsterSummary.reviewed)} />
            <MiniStat label="已击败" value={String(report.monsterSummary.defeated)} />
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-200">
            最近一只怪兽：
            {report.monsterSummary.latestMonster
              ? `${report.monsterSummary.latestMonster.title}（${report.monsterSummary.latestMonster.status}）`
              : "暂无怪兽出现"}
          </p>
          {report.monsterSummary.active > 0 && (
            <Link
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-amber-300 px-4 text-sm font-black text-slate-950"
              href="/monsters"
            >
              去击败怪兽
            </Link>
          )}
        </section>

        <section
          className="rounded-[28px] border border-cyan-200/20 bg-cyan-200/10 p-5 backdrop-blur-xl"
          data-testid="report-tomorrow"
        >
          <SectionTitle icon={TrendingUp} title="明日推荐" />
          <div className="mt-4 grid gap-3">
            {report.tomorrowTips.map((tip, index) => (
              <div className="rounded-2xl bg-slate-950/45 p-3 text-sm font-bold leading-6 text-slate-100" key={tip}>
                {index + 1}. {tip}
              </div>
            ))}
          </div>
        </section>

        <button
          className="mx-auto mt-8 inline-flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-400"
          data-testid="report-reset"
          onClick={resetData}
          type="button"
        >
          重置体验数据
        </button>
        <Link
          className="mx-auto mt-3 inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-5 text-sm font-black text-slate-950"
          data-testid="report-feedback"
          href="/feedback"
        >
          填写试映反馈
        </Link>
        <p className="mt-4 text-center text-xs font-bold text-slate-500">Version: S1 Screening Build v0.1</p>
      </div>
    </main>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: typeof BarChart3; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-300 text-slate-950">
        <Icon size={19} />
      </div>
      <h2 className="text-xl font-black">{title}</h2>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof BarChart3 }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-300">
        <Icon size={15} />
        {label}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-xs font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black text-cyan-100">{value}</p>
    </div>
  );
}
