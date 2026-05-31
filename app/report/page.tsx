"use client";

import Image from "next/image";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";
import {
  ArrowLeft,
  Bot,
  Coins,
  Gem,
  RotateCcw,
  Shield,
  Sparkles,
  Star,
  Zap,
  type LucideIcon
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { resetExperienceData } from "../../lib/dailyQuestEngine";
import { gameAssets } from "../../lib/gameAssets";
import { computeLevel, defaultProgress, readProgress } from "../../lib/learningProgress";
import { buildGrowthReport } from "../../lib/reportEngine";

export default function ReportPage() {
  const [progress, setProgress] = useState(defaultProgress);
  const report = useMemo(() => buildGrowthReport(progress), [progress]);
  const totalAttempts = progress.attempts.length;
  const correctAttempts = progress.attempts.filter((attempt) => attempt.isCorrect).length;
  const hasChallengeData = totalAttempts > 0;
  const hasMistake = progress.mistakes.length > 0;
  const starsEarned = hasChallengeData ? Math.min(3, 1 + (correctAttempts > 0 ? 1 : 0) + 1) : 0;
  const tomorrowText = hasMistake
    ? "明天的小冒险：星星补给站"
    : "明天 Nova 想带你挑战一颗新的能量星。";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setProgress(readProgress());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const resetData = () => {
    if (window.confirm("确定要重新开始体验吗？这会清空本机的挑战、怪兽、技能和报告记录。")) {
      resetExperienceData();
      window.location.href = "/pilot";
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#17206a] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-18%] top-[-12%] h-80 w-80 rounded-full bg-cyan-400/24 blur-3xl" />
        <div className="absolute right-[-22%] top-[18%] h-96 w-96 rounded-full bg-violet-500/24 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[16%] h-72 w-72 rounded-full bg-amber-300/16 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.14)_1px,transparent_2px)] bg-[size:38px_38px] opacity-40" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-24 pt-5 sm:px-6">
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
          <div className="relative min-h-52 bg-gradient-to-br from-cyan-300 via-violet-400 to-amber-300 p-5 text-slate-950">
            <Image
              alt="Nova 庆祝"
              className="absolute bottom-0 right-0 h-40 w-40 object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.25)] sm:h-52 sm:w-52"
              height={1254}
              priority
              sizes="(max-width: 768px) 160px, 208px"
              src={gameAssets.novaCheer}
              width={1254}
            />
            <div className="relative z-10 max-w-[72%]">
              <p className="text-xs font-black uppercase tracking-[0.22em] opacity-75">Star Sticker</p>
              <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">今日星星报告</h1>
              <p className="mt-3 text-base font-bold leading-7">
                {hasChallengeData ? "你和 Nova 完成了一次小冒险！" : "先去找 Nova 点亮第一颗星吧。"}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[34px] border-4 border-amber-200/35 bg-amber-100 p-5 text-slate-950 shadow-[0_20px_50px_rgba(252,211,77,0.18)]">
          <div className="flex gap-4">
            <div className="flex h-16 w-16 shrink-0 rotate-[-6deg] items-center justify-center rounded-[24px] bg-amber-300 shadow-[0_12px_25px_rgba(15,23,42,0.22)]">
              <Star className="fill-amber-700 text-amber-700" size={36} />
            </div>
            <div>
              <h2 className="text-2xl font-black leading-tight">
                {hasChallengeData ? "今天你点亮了能量塔！" : "还没有完成小冒险"}
              </h2>
              <p className="mt-2 text-sm font-black leading-6">
                {hasChallengeData
                  ? `完成了 ${totalAttempts} 个小挑战，获得 ${starsEarned} 颗星星。`
                  : "先去找 Nova 点亮第一颗星吧。"}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[30px] border border-white/15 bg-slate-950/35 p-5 backdrop-blur-xl">
          <h2 className="text-xl font-black">星星贴纸</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <StickerStar active={progress.tutorialFirstWinDone} label="点亮第一颗星" />
            <StickerStar active={hasChallengeData} label="完成云朵小挑战" />
            <StickerStar active={hasChallengeData} label="查看星星报告" />
          </div>
        </section>

        <section className="mb-4 rounded-[30px] border border-cyan-200/20 bg-cyan-200/10 p-5 backdrop-blur-xl">
          <h2 className="text-xl font-black">今日小发现</h2>
          <p className="mt-3 text-base font-black leading-8 text-slate-100">
            {hasMistake
              ? "今天有一朵小云雾捣乱了，下次我们再一起看清楚。"
              : hasChallengeData
                ? "今天你发现：24 可以拆成 20 和 4，这样更好算。"
                : "今天先从第一颗星开始，Nova 在等你。"}
          </p>
        </section>

        <section className="mb-5 rounded-[30px] border border-violet-200/20 bg-violet-200/10 p-5 backdrop-blur-xl">
          <h2 className="text-xl font-black">明天的小冒险</h2>
          <p className="mt-3 text-base font-black leading-8 text-violet-50">{tomorrowText}</p>
        </section>

        <div className="mb-5 grid gap-3">
          <Link
            className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-amber-300 px-5 text-base font-black text-slate-950"
            data-testid="report-primary"
            href="/challenge"
          >
            {hasChallengeData ? "再来一颗星" : "去点亮第一颗星"}
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
        </div>

        <details className="mb-4 rounded-[28px] border border-white/15 bg-slate-950/45 p-5 backdrop-blur-xl">
          <summary className="cursor-pointer text-lg font-black text-cyan-100">给家长看的说明</summary>
          <div className="mt-4 grid gap-3">
            <ParentNote
              title="本关训练"
              text="本关训练的是三年级两位数乘一位数中的拆分思路：把 24 拆成 20 和 4，再分别计算。"
            />
            <ParentNote
              title="观察到的情况"
              text={
                hasChallengeData && correctAttempts > 0
                  ? "孩子能完成本次挑战，可以继续用同类题巩固。"
                  : hasChallengeData
                    ? "孩子可能在乘法拆分或计算过程中卡住，建议下次再练 1 道同类题。"
                    : "孩子还没有完成挑战，可以先从教程岛首胜开始。"
              }
            />
            <ParentNote
              title="下一步建议"
              text="明天建议继续练一道 20 多乘一位数的小题，保持 5 分钟以内。"
            />
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-cyan-300 px-4 text-sm font-black text-slate-950"
              href="/feedback"
            >
              家长填写试映反馈
            </Link>
            <button
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 text-xs font-bold text-slate-300"
              data-testid="report-reset"
              onClick={resetData}
              type="button"
            >
              <RotateCcw size={14} />
              重新开始体验
            </button>
          </div>
        </details>

        <details className="mb-5 rounded-[28px] border border-white/15 bg-slate-950/45 p-5 backdrop-blur-xl">
          <summary className="cursor-pointer text-lg font-black text-cyan-100">查看星星记录</summary>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <DetailStat icon={Sparkles} label="XP" value={String(report.overview.exp)} />
            <DetailStat icon={Coins} label="金币" value={String(report.overview.coins)} />
            <DetailStat icon={Bot} label="提示次数" value={String(report.overview.aiHelpCount)} />
            <DetailStat icon={Shield} label="小怪兽" value={String(report.overview.monsterCount)} />
            <DetailStat icon={Gem} label="成长等级" value={`Lv.${computeLevel(report.overview.exp).level}`} />
            <DetailStat icon={Zap} label="答对记录" value={`${correctAttempts}/${totalAttempts}`} />
          </div>

          <section className="mt-5 rounded-[24px] border border-cyan-200/15 bg-cyan-200/10 p-4">
            <h3 className="text-base font-black">Nova 使用记录</h3>
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
        </details>

      </div>
      <BottomNav />
    </main>
  );
}

function StickerStar({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/8 p-3 text-center">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] ${
          active ? "bg-amber-300 text-amber-950 shadow-[0_0_28px_rgba(252,211,77,0.55)]" : "bg-slate-300 text-slate-500"
        }`}
      >
        <Star className={active ? "fill-amber-700" : "fill-slate-400"} size={34} />
      </div>
      <p className="mt-2 text-xs font-black leading-5 text-slate-100">{label}</p>
    </div>
  );
}

function ParentNote({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-base font-black text-white">{title}</h3>
      <p className="mt-2 text-sm font-bold leading-6 text-slate-200">{text}</p>
    </article>
  );
}

function DetailStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-300">
        <Icon size={15} />
        {label}
      </div>
      <p className="break-words text-2xl font-black text-white">{value}</p>
    </div>
  );
}

