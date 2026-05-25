"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Coins,
  Gem,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Target,
  Zap,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { resetExperienceData } from "../../lib/dailyQuestEngine";
import { gameAssets } from "../../lib/gameAssets";
import { defaultProgress, readProgress } from "../../lib/learningProgress";
import { buildGrowthReport } from "../../lib/reportEngine";

export default function ReportPage() {
  const [progress, setProgress] = useState(defaultProgress);
  const report = useMemo(() => buildGrowthReport(progress), [progress]);
  const totalAttempts = progress.attempts.length;
  const correctAttempts = progress.attempts.filter((attempt) => attempt.isCorrect).length;
  const hasChallengeData = totalAttempts > 0;
  const topWeakPoint = report.weakPoints[0];
  const weakPointText = topWeakPoint?.knowledgePoint ?? "暂时没有薄弱点";
  const defeatedMonsters = report.monsterSummary.defeated;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProgress(readProgress());
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
        <div className="absolute left-[-18%] top-[-12%] h-80 w-80 rounded-full bg-cyan-400/24 blur-3xl" />
        <div className="absolute right-[-22%] top-[18%] h-96 w-96 rounded-full bg-violet-500/24 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[16%] h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.14)_1px,transparent_2px)] bg-[size:38px_38px] opacity-40" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-10 pt-5 sm:px-6">
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

        <section className="mb-5 overflow-hidden rounded-[34px] border border-white/15 bg-white/12 shadow-glow backdrop-blur-xl">
          <div className="relative min-h-48 bg-gradient-to-br from-cyan-300 via-violet-400 to-amber-300 p-5 text-slate-950">
            <Image
              alt="Nova 星星报告"
              className="absolute bottom-0 right-0 h-40 w-40 object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)] sm:h-52 sm:w-52"
              height={1254}
              priority
              sizes="(max-width: 768px) 160px, 208px"
              src={gameAssets.novaCheer}
              width={1254}
            />
            <div className="relative z-10 max-w-[72%]">
              <p className="text-xs font-black uppercase tracking-[0.22em] opacity-75">Star Report</p>
              <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">今日星星报告</h1>
              <p className="mt-3 text-base font-bold leading-7">
                {hasChallengeData ? "你已经完成了一次学习冒险。" : "先完成一道星星能量题，再回来查看报告。"}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[30px] border border-emerald-200/25 bg-emerald-200/10 p-5 backdrop-blur-xl">
          <div className="flex gap-4">
            <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[22px] bg-emerald-300 text-slate-950">
              <Sparkles size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black leading-tight">
                {hasChallengeData ? "今天完成了一次学习冒险！" : "还没有完成学习冒险"}
              </h2>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-100">
                {hasChallengeData
                  ? `你做了 ${totalAttempts} 道题，答对了 ${correctAttempts} 道，收服了 ${defeatedMonsters} 只小怪兽。`
                  : "先完成一道星星能量题，再回来查看报告。"}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[30px] border border-cyan-200/20 bg-cyan-200/10 p-5 backdrop-blur-xl">
          <h2 className="text-xl font-black">今日表现</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 min-[360px]:grid-cols-3">
            <SimpleStat label="完成题目" value={`${totalAttempts} 道`} />
            <SimpleStat label="答对题目" value={`${correctAttempts} 道`} />
            <SimpleStat label="需要再练" value={weakPointText} />
          </div>
        </section>

        <section className="mb-4 rounded-[30px] border border-amber-200/25 bg-amber-200/10 p-5 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-slate-950">
              <Target size={25} />
            </div>
            <div>
              <h2 className="text-xl font-black">需要再练</h2>
              {topWeakPoint ? (
                <>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-100">
                    今天有 {topWeakPoint.mistakeCount} 次卡在：{topWeakPoint.knowledgePoint}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-amber-50">建议明天再练 1 道同类题。</p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-100">今天表现不错！</p>
                  <p className="mt-2 text-sm leading-6 text-amber-50">明天可以挑战一道稍难一点的题。</p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="mb-5 rounded-[30px] border border-white/15 bg-slate-950/45 p-5 backdrop-blur-xl">
          <h2 className="text-xl font-black">给家长的一句话</h2>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-100">
            孩子今天完成了一次数学练习，并通过报告看到了需要继续练习的地方。
          </p>
        </section>

        <details className="mb-5 rounded-[28px] border border-white/15 bg-slate-950/45 p-5 backdrop-blur-xl">
          <summary className="cursor-pointer text-lg font-black text-cyan-100">查看更多成长细节</summary>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <DetailStat icon={Sparkles} label="XP" value={String(report.overview.exp)} />
            <DetailStat icon={Coins} label="金币" value={String(report.overview.coins)} />
            <DetailStat icon={Bot} label="AI 提示次数" value={String(report.overview.aiHelpCount)} />
            <DetailStat icon={Shield} label="怪兽数量" value={String(report.overview.monsterCount)} />
            <DetailStat icon={Gem} label="成长等级" value={`Lv.${Math.max(1, Math.floor(report.overview.exp / 100))}`} />
            <DetailStat icon={Zap} label="正确率" value={`${report.overview.accuracy}%`} />
          </div>

          <section className="mt-5 rounded-[24px] border border-cyan-200/15 bg-cyan-200/10 p-4">
            <h3 className="text-base font-black">AI 使用能力</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-100">AI 使用能力正在成长中。</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {report.aiSkillSummary.map((skill) => (
                <article className="rounded-2xl bg-slate-950/45 p-3" key={skill.id}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black">{skill.name}</p>
                    <span className="rounded-full bg-cyan-300 px-2 py-1 text-xs font-black text-slate-950">
                      Lv.{skill.level}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{skill.comment}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-4 rounded-[24px] border border-violet-200/15 bg-violet-200/10 p-4">
            <h3 className="text-base font-black">小怪兽记录</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-100">
              今天收服小怪兽：{report.monsterSummary.defeated} 只
            </p>
            {report.monsterSummary.active > 0 && (
              <p className="mt-2 text-sm leading-6 text-violet-50">还有小怪兽等你下次来收服。</p>
            )}
          </section>

          <section className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-4">
            <h3 className="text-base font-black">详细统计</h3>
            <p className="mt-2 text-sm leading-6 text-slate-200">{report.summaryText}</p>
          </section>
        </details>

        <div className="grid gap-3">
          <Link
            className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-amber-300 px-5 text-base font-black text-slate-950"
            data-testid="report-feedback"
            href="/feedback"
          >
            填写试映反馈
          </Link>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-4 text-sm font-black text-slate-950"
              href="/challenge"
            >
              再玩一题
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-violet-300 px-4 text-sm font-black text-slate-950"
              href="/adventure"
            >
              返回冒险大厅
            </Link>
          </div>
          <button
            className="mx-auto inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300"
            data-testid="report-reset"
            onClick={resetData}
            type="button"
          >
            <RotateCcw size={14} />
            重置体验数据
          </button>
        </div>
        <p className="mt-4 text-center text-xs font-bold text-slate-500">Version: S1 Screening Build v0.1</p>
      </div>
    </main>
  );
}

function SimpleStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <p className="text-xs font-bold text-slate-300">{label}</p>
      <p className="mt-2 break-words text-xl font-black text-white">{value}</p>
    </div>
  );
}

function DetailStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-300">
        <Icon size={15} />
        {label}
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}
