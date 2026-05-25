"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Eye,
  HeartPulse,
  RotateCcw,
  Shield,
  Sparkles,
  Swords
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { applyDailyQuestCompletion } from "../../lib/dailyQuestEngine";
import { gameAssets } from "../../lib/gameAssets";
import { ensureMonstersForMistakes, getMonsterVisual } from "../../lib/monsterEngine";
import {
  readProgress,
  readStudent,
  saveStudentAndProgress,
  defaultProgress,
  defaultStudent,
  type LearningProgress,
  type MonsterRecord,
  type StudentProfile
} from "../../lib/learningProgress";

type MonsterPageState = {
  progress: LearningProgress;
  student: StudentProfile;
};

function loadMonsterState(): MonsterPageState {
  const student = readStudent();
  const progress = readProgress();
  const monsters = ensureMonstersForMistakes(progress.mistakes, progress.monsters);
  const nextProgress = { ...progress, monsters };

  if (typeof window !== "undefined" && monsters.length !== progress.monsters.length) {
    saveStudentAndProgress(student, nextProgress);
  }

  return {
    student,
    progress: nextProgress
  };
}

export default function MonstersPage() {
  const [pageState, setPageState] = useState<MonsterPageState>(() => ({
    progress: defaultProgress,
    student: defaultStudent
  }));
  const [expandedMonsterId, setExpandedMonsterId] = useState<string | null>(null);
  const [reviewMonsterId, setReviewMonsterId] = useState<string | null>(null);
  const [skillCue, setSkillCue] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPageState(loadMonsterState());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const { progress, student } = pageState;
  const stats = useMemo(
    () => ({
      active: progress.monsters.filter((monster) => monster.status === "active").length,
      reviewed: progress.monsters.filter((monster) => monster.status === "reviewed").length,
      defeated: progress.monsters.filter((monster) => monster.status === "defeated").length
    }),
    [progress.monsters]
  );

  const updateProgress = (nextProgress: LearningProgress, nextStudent: StudentProfile) => {
    saveStudentAndProgress(nextStudent, nextProgress);
    setPageState({
      progress: nextProgress,
      student: nextStudent
    });
  };

  const markReviewed = (monster: MonsterRecord) => {
    if (monster.status !== "active") {
      return;
    }

    const nextProgress: LearningProgress = {
      ...progress,
      exp: Math.min(student.maxExp, progress.exp + 10),
      monsters: progress.monsters.map((item) =>
        item.id === monster.id
          ? {
              ...item,
              status: "reviewed",
              hp: Math.ceil(item.maxHp / 2)
            }
          : item
      ),
      mistakes: progress.mistakes.map((mistake) =>
        mistake.questionId === monster.questionId
          ? {
              ...mistake,
              status: "reviewed"
            }
          : mistake
      )
    };
    const nextStudent = {
      ...student,
      exp: nextProgress.exp
    };

    const dailyResult = applyDailyQuestCompletion("monster_review", nextStudent, nextProgress);
    updateProgress(dailyResult.progress, dailyResult.student);
    setSkillCue(
      `复盘力经验提升，真相探测器经验提升。${dailyResult.awarded ? " 今日怪兽任务完成，奖励已领取。" : ""}`
    );
    setReviewMonsterId(null);
    setExpandedMonsterId(monster.id);
  };

  const defeatMonster = (monster: MonsterRecord) => {
    if (monster.status !== "reviewed") {
      return;
    }

    const nextProgress: LearningProgress = {
      ...progress,
      exp: Math.min(student.maxExp, progress.exp + 20),
      coins: progress.coins + 5,
      monsters: progress.monsters.map((item) =>
        item.id === monster.id
          ? {
              ...item,
              status: "defeated",
              hp: 0,
              defeatedAt: new Date().toISOString()
            }
          : item
      ),
      mistakes: progress.mistakes.map((mistake) =>
        mistake.questionId === monster.questionId
          ? {
              ...mistake,
              status: "defeated"
            }
          : mistake
      )
    };
    const nextStudent = {
      ...student,
      exp: nextProgress.exp,
      coins: nextProgress.coins
    };

    const dailyResult = applyDailyQuestCompletion("monster_review", nextStudent, nextProgress);
    updateProgress(dailyResult.progress, dailyResult.student);
    setSkillCue(
      `复盘力经验提升，真相探测器经验提升。${dailyResult.awarded ? " 今日怪兽任务完成，奖励已领取。" : ""}`
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#19205f] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-20%] top-[-14%] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-24%] top-[16%] h-96 w-96 rounded-full bg-violet-600/25 blur-3xl" />
        <div className="absolute bottom-[-14%] left-[12%] h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/30 bg-violet-300/15 shadow-glow">
            <Shield className="text-violet-100" size={25} />
          </div>
        </header>

        <section className="mb-5 rounded-[28px] border border-white/15 bg-white/10 p-5 shadow-glow backdrop-blur-xl">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-200">Monster Codex</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">错题怪兽图鉴</h1>
          <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
            每一道错题都会变成怪兽。展开原题，完成复盘，再击败它，把薄弱点变成经验和金币。
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 min-[360px]:grid-cols-3">
            <StatCard label="活跃怪兽" value={String(stats.active)} tone="text-amber-100" />
            <StatCard label="已复盘" value={String(stats.reviewed)} tone="text-cyan-100" />
            <StatCard label="已击败" value={String(stats.defeated)} tone="text-emerald-100" />
          </div>
        </section>

        {skillCue && (
          <div
            className="mb-5 rounded-2xl border border-emerald-200/25 bg-emerald-200/10 p-3 text-sm font-bold leading-6 text-emerald-100"
            data-testid="monster-skill-cue"
          >
            {skillCue}
            <Link
              className="ml-0 mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-300 px-3 text-xs font-black text-slate-950 sm:ml-3 sm:mt-0"
              data-testid="monster-go-report"
              href="/report"
            >
              查看今日成长
            </Link>
          </div>
        )}

        {progress.monsters.length === 0 ? (
          <section className="rounded-[28px] border border-white/15 bg-slate-950/55 p-6 text-center backdrop-blur-xl">
            <div className="mx-auto mb-4 flex max-w-64 items-center justify-center overflow-hidden rounded-[30px] border-4 border-cyan-200/25 bg-cyan-200/10 p-3">
              <Image
                alt="怪兽图鉴占位预览"
                className="aspect-square h-auto w-full object-contain"
                height={1254}
                src={gameAssets.monsters.fog}
                width={1254}
              />
            </div>
            <h2 className="text-xl font-black">图鉴暂时空空的</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              还没有错题怪兽出现。去挑战里试一题，答错也没关系，它会变成可复盘的训练目标。
            </p>
            <Link
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-300 px-5 text-sm font-black text-slate-950"
              href="/challenge"
            >
              去挑战
            </Link>
          </section>
        ) : (
          <section className="grid gap-4 lg:grid-cols-2">
            {progress.monsters.map((monster) => {
              const mistake = progress.mistakes.find((item) => item.questionId === monster.questionId);
              const visual = getMonsterVisual(monster.type);
              const hpPercent = Math.round((monster.hp / monster.maxHp) * 100);
              const expanded = expandedMonsterId === monster.id;
              const reviewing = reviewMonsterId === monster.id;

              return (
                <article
                  className="min-w-0 overflow-hidden rounded-[32px] border-4 border-white/15 bg-white/12 backdrop-blur-xl"
                  data-testid={`monster-card-${monster.questionId}`}
                  key={monster.id}
                >
                  <div className="grid gap-4 p-4 sm:grid-cols-[1fr_1.05fr]">
                    <div
                      className={`flex min-h-64 items-center justify-center overflow-hidden rounded-[30px] bg-gradient-to-br ${visual.tone} p-3 sm:min-h-72`}
                    >
                      <Image
                        alt={monster.title}
                        className="h-full max-h-72 w-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.28)]"
                        height={1254}
                        sizes="(max-width: 768px) 100vw, 420px"
                        src={gameAssets.monsters[monster.type]}
                        width={1254}
                      />
                    </div>
                    <div className="min-w-0">
                      <div>
                        <p className="text-sm font-black opacity-80">你遇到了：</p>
                        <h2 className="mt-1 text-2xl font-black leading-tight">{monster.title}！</h2>
                      </div>
                      <p className="mt-3 text-sm font-black leading-6 text-slate-200">{monster.description}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={monster.status} />
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-black text-slate-100">
                      {visual.label}
                    </span>
                    <span className="rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-black text-cyan-100">
                      {monster.knowledgePoint}
                    </span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="text-xs font-bold text-slate-400">怪兽宣言</p>
                    <p className="mt-1 text-sm font-bold leading-6 text-slate-100">
                      {getMonsterDeclaration(monster)}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <HeartPulse size={14} />
                        HP
                      </span>
                      <span>{monster.hp}/{monster.maxHp}</span>
                    </div>
                    <div className="h-5 overflow-hidden rounded-full border border-white/10 bg-slate-800 shadow-[inset_0_0_18px_rgba(0,0,0,0.35)]">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${visual.tone}`}
                        style={{ width: `${hpPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-cyan-200/15 bg-cyan-200/10 p-3 text-sm leading-6 text-cyan-50">
                    弱点：{monster.weakness}
                  </div>
                    </div>
                  </div>

                  <div className="grid gap-2 px-4 pb-4 sm:grid-cols-3">
                    <button
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 text-sm font-black text-slate-100"
                      onClick={() => setExpandedMonsterId(expanded ? null : monster.id)}
                      type="button"
                    >
                      <Eye size={16} />
                      查看原题
                    </button>
                    {monster.status === "active" && (
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-3 text-sm font-black text-slate-950"
                        data-testid={`review-${monster.questionId}`}
                        onClick={() => {
                          setExpandedMonsterId(monster.id);
                          setReviewMonsterId(monster.id);
                        }}
                        type="button"
                      >
                        <RotateCcw size={16} />
                        开始复盘
                      </button>
                    )}
                    {monster.status === "reviewed" && (
                      <button
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-emerald-300 px-3 text-sm font-black text-slate-950"
                        data-testid={`defeat-${monster.questionId}`}
                        onClick={() => defeatMonster(monster)}
                        type="button"
                      >
                        <Swords size={16} />
                        发动终结一击
                      </button>
                    )}
                    {monster.status === "defeated" && (
                      <span className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-emerald-200/25 bg-emerald-200/10 px-3 text-sm font-black text-emerald-100">
                        已击败
                      </span>
                    )}
                  </div>

                  {expanded && mistake && (
                    <div className="mt-4 space-y-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
                      <InfoBlock label="原题" value={mistake.stem} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <InfoBlock label="你的答案" value={mistake.selectedAnswer} />
                        <InfoBlock label="正确答案" value={mistake.correctAnswer} />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {mistake.mistakeTags.map((tag) => (
                          <span
                            className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-100"
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {reviewing && (
                        <div className="rounded-3xl border border-violet-200/20 bg-violet-200/10 p-4">
                          <p className="mb-3 text-sm font-black text-violet-100">复盘提示</p>
                          <ol className="space-y-2 text-sm leading-6 text-slate-100">
                            <li>1. 我错在哪里？</li>
                            <li>2. 正确方法是什么？</li>
                            <li>3. 下次遇到同类题先看什么？</li>
                          </ol>
                          <button
                            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-black text-slate-950"
                            data-testid={`complete-review-${monster.questionId}`}
                            onClick={() => markReviewed(monster)}
                            type="button"
                          >
                            <Sparkles size={17} />
                            我已完成复盘
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
      <p className="text-xs font-bold text-slate-300">{label}</p>
      <p className={`mt-1 text-2xl font-black ${tone}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: MonsterRecord["status"] }) {
  const labels = {
    active: "活跃",
    reviewed: "已复盘",
    defeated: "已击败"
  };
  const styles = {
    active: "bg-amber-300 text-slate-950",
    reviewed: "bg-cyan-300 text-slate-950",
    defeated: "bg-emerald-300 text-slate-950"
  };

  return <span className={`rounded-full px-3 py-1 text-xs font-black ${styles[status]}`}>{labels[status]}</span>;
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/45 p-3">
      <p className="mb-1 text-xs font-bold text-slate-400">{label}</p>
      <p className="text-sm font-bold leading-6 text-slate-100">{value}</p>
    </div>
  );
}

function getMonsterDeclaration(monster: MonsterRecord) {
  if (monster.type === "fog") {
    return "它会让折扣、百分数和单位变得模糊。先说清概念，就能削弱它。";
  }

  if (monster.type === "careless") {
    return "它会趁你急着计算时放出干扰电流。慢一步验算，就能抓住它。";
  }

  if (monster.type === "illusion") {
    return "它会把题目条件伪装起来。圈出关键词，它的幻象就会消失。";
  }

  if (monster.type === "armor") {
    return "它的铁甲会挡住列式方法。先写数量关系，再发起攻击。";
  }

  if (monster.type === "vine") {
    return "它会缠住你的解题步骤。把过程拆成三步，就能挣脱藤蔓。";
  }

  return "它来自一次还没整理好的错题。找出错因，就是击败它的第一步。";
}
