"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Coins,
  MessageCircle,
  RotateCcw,
  Send,
  Shield,
  Sparkles,
  Star,
  Swords,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { questions, type Question } from "../../data/questions";
import { getAiTutorHint } from "../../lib/aiTutor";
import { applyDailyQuestCompletion } from "../../lib/dailyQuestEngine";
import { gameAssets } from "../../lib/gameAssets";
import { ensureMonstersForMistakes } from "../../lib/monsterEngine";
import type { AiTutorResponse } from "../../lib/mockAiTutor";
import { CURRENT_QUESTION_STORAGE_KEY, selectChallengeQuestion } from "../../lib/questionRotation";
import {
  defaultStudent,
  normalizeAnswer,
  readProgress,
  readStudent,
  saveStudentAndProgress,
  type AiHelpLevel,
  type LearningProgress,
  type MistakeRecord
} from "../../lib/learningProgress";

type ResultState = "idle" | "correct" | "wrong";

const aiButtonLabels: Record<AiHelpLevel, string> = {
  1: "Nova 给我一点线索",
  2: "Nova 再引导一步",
  3: "我还是不会，查看完整复盘"
};

export default function ChallengePage() {
  const [question, setQuestion] = useState<Question>(() => questions[0]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [result, setResult] = useState<ResultState>("idle");
  const [rewardApplied, setRewardApplied] = useState(false);
  const [progressAfterSubmit, setProgressAfterSubmit] = useState<LearningProgress | null>(null);
  const [aiMessages, setAiMessages] = useState<AiTutorResponse[]>([]);
  const [aiLoadingLevel, setAiLoadingLevel] = useState<AiHelpLevel | null>(null);
  const [skillCue, setSkillCue] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setQuestion(selectChallengeQuestion(readProgress()));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const isChoice = question.type === "choice";
  const canSubmit = selectedAnswer.trim().length > 0 && result === "idle";
  const aiHelpUsed = aiMessages.length;
  const maxAiLevel = aiMessages.reduce<AiHelpLevel | 0>(
    (max, message) => (message.level > max ? message.level : max),
    0
  );

  const stars = useMemo(
    () =>
      Array.from({ length: 3 }, (_, index) => (
        <Star
          className={index < question.difficulty ? "fill-amber-300 text-amber-300" : "text-slate-600"}
          key={index}
          size={16}
        />
      )),
    [question.difficulty]
  );

  const requestAiHelp = async (level: AiHelpLevel) => {
    if (aiLoadingLevel || result !== "idle" || aiMessages.some((message) => message.level === level)) {
      return;
    }

    setAiLoadingLevel(level);
    const aiResponse = await getAiTutorHint({
      question,
      selectedAnswer,
      level
    });
    const createdAt = new Date().toISOString();
    const student = readStudent();
    const progress = readProgress();
    const stepAskGain = level === 2 ? 2 : 1;
    const nextProgress: LearningProgress = {
      ...progress,
      aiHelpRecords: [
        ...progress.aiHelpRecords,
        {
          questionId: question.id,
          level,
          message: aiResponse.message,
          fullSolutionViewed: level === 3,
          createdAt
        }
      ],
      skillTelemetry: {
        ...progress.skillTelemetry,
        stepAskSkillExp: progress.skillTelemetry.stepAskSkillExp + stepAskGain,
        fullSolutionViewed: progress.skillTelemetry.fullSolutionViewed || level === 3
      }
    };

    const dailyResult = applyDailyQuestCompletion("ai_help", student, nextProgress);
    saveStudentAndProgress(dailyResult.student, dailyResult.progress);
    setAiMessages((messages) => [...messages, aiResponse].sort((a, b) => a.level - b.level));
    setSkillCue(
      level === 2
        ? `分步追问术经验 +2，你正在学会让 Nova 一步步引导。${dailyResult.awarded ? " 今日 Nova 任务完成，奖励已领取。" : ""}`
        : `分步追问术经验 +1，你正在学会正确使用 AI。${dailyResult.awarded ? " 今日 Nova 任务完成，奖励已领取。" : ""}`
    );
    setAiLoadingLevel(null);
  };

  const submitAnswer = () => {
    if (!canSubmit || rewardApplied) {
      return;
    }

    const isCorrect = normalizeAnswer(selectedAnswer) === normalizeAnswer(question.answer);
    const createdAt = new Date().toISOString();
    const student = readStudent();
    const progress = readProgress();
    const alreadyCompletedThisQuestion = progress.attempts.some(
      (attempt) => attempt.questionId === question.id && attempt.isCorrect
    );
    const mistakeRecord: MistakeRecord = {
      id: `mistake-${question.id}-${createdAt}`,
      questionId: question.id,
      stem: question.stem,
      selectedAnswer,
      correctAnswer: question.answer,
      knowledgePoint: question.knowledgePoint,
      mistakeTags: question.mistakeTags,
      status: "pending",
      createdAt
    };
    const nextMistakes = isCorrect ? progress.mistakes : [...progress.mistakes, mistakeRecord];

    const nextProgress: LearningProgress = {
      ...progress,
      exp: progress.exp + (isCorrect ? 10 : 2),
      coins: progress.coins + (isCorrect ? 5 : 0),
      completedChallenges:
        isCorrect && !alreadyCompletedThisQuestion
          ? progress.completedChallenges + 1
          : progress.completedChallenges,
      attempts: [
        ...progress.attempts,
        {
          questionId: question.id,
          selectedAnswer,
          isCorrect,
          knowledgePoint: question.knowledgePoint,
          aiHelpUsed,
          createdAt
        }
      ],
      mistakes: nextMistakes,
      monsters: isCorrect ? progress.monsters : ensureMonstersForMistakes(nextMistakes, progress.monsters),
      skillTelemetry: {
        ...progress.skillTelemetry,
        clearQuestionSkillExp: progress.skillTelemetry.clearQuestionSkillExp + (isCorrect ? 1 : 0)
      }
    };

    const nextStudent = {
      ...defaultStudent,
      ...student,
      exp: Math.min(student.maxExp, nextProgress.exp),
      coins: nextProgress.coins
    };
    nextProgress.exp = nextStudent.exp;

    const dailyResult = applyDailyQuestCompletion("challenge", nextStudent, nextProgress);
    saveStudentAndProgress(dailyResult.student, dailyResult.progress);
    window.localStorage.removeItem(CURRENT_QUESTION_STORAGE_KEY);
    setProgressAfterSubmit(dailyResult.progress);
    setResult(isCorrect ? "correct" : "wrong");
    setRewardApplied(true);
  };

  const resetLocalAttempt = () => {
    setSelectedAnswer("");
    setResult("idle");
    setRewardApplied(false);
    setProgressAfterSubmit(null);
    setAiMessages([]);
    setAiLoadingLevel(null);
    setSkillCue("");
  };

  const feedbackTitle =
    result === "correct"
      ? "攻击成功！能量塔恢复能量。"
      : "怪兽出现！这道错题变成了一只错题怪兽。";

  const feedbackMessage =
    result === "correct"
      ? maxAiLevel === 0
        ? "你独立击中了能量核心，今天的数学星球亮度上升。"
        : maxAiLevel === 3
          ? "你完成了这次学习复盘。建议再练一道同类题，把方法变成自己的技能。"
          : "你和 Nova 配合得不错：先得到线索，再自己发动关键一击。"
      : maxAiLevel === 0
        ? "别急着放弃。可以先让 Nova 给一点线索，再去怪兽图鉴复盘这道题。"
        : "你已经尝试过 Nova 引导了。去怪兽图鉴复盘错因，就能削弱这只怪兽。";

  return (
    <main className="min-h-screen overflow-hidden bg-[#18247a] text-white">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-18%] top-[-12%] h-80 w-80 rounded-full bg-cyan-500/25 blur-3xl" />
        <div className="absolute right-[-28%] top-[20%] h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute bottom-[-14%] left-[10%] h-72 w-72 rounded-full bg-amber-300/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.16)_1px,transparent_2px)] bg-[size:38px_38px] opacity-40" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-8 pt-5 sm:px-6">
        <header className="mb-5 flex items-center justify-between gap-3">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-cyan-300/30 bg-white/5 px-3 text-sm font-bold text-cyan-100"
            href="/adventure"
          >
            <ArrowLeft size={16} />
            冒险大厅
          </Link>
          <div className="flex items-center gap-2 rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-2 text-xs font-bold text-violet-100">
            <Swords size={15} />
            战斗关卡
          </div>
        </header>

        <section className="mb-4 overflow-hidden rounded-[36px] border-4 border-white/20 bg-white/15 shadow-glow backdrop-blur-xl">
          <div className="bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-600 p-5 text-slate-950">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.24em] opacity-80">Energy Tower</p>
                <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">
                  第 1 关：能量塔核心题
                </h1>
              </div>
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[30px] border-2 border-white/45 bg-white/35 sm:h-32 sm:w-32">
                <Image
                  alt="Nova 思考中"
                  className="h-full w-full object-contain p-1"
                  height={1254}
                  sizes="128px"
                  src={gameAssets.novaThinking}
                  width={1254}
                />
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-slate-950">
                {question.knowledgePoint}
              </span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold text-slate-200">
                {question.grade}
              </span>
              <span className="flex items-center gap-1 rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1">
                {stars}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-[32px] border-4 border-amber-200/35 bg-[#fff3c4] p-5 text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.2)]">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-300/40 blur-2xl" />
              <p className="relative mb-2 text-xs font-black uppercase tracking-[0.24em] text-violet-700">
                任务卷轴 / 能量题板
              </p>
              <p className="relative text-lg font-black leading-8 text-slate-900">{question.stem}</p>
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[32px] border border-white/15 bg-slate-950/60 p-4 backdrop-blur-xl sm:p-5">
          {isChoice ? (
            <div className="grid gap-3">
              {question.options?.map((option, index) => {
                const active = selectedAnswer === option;
                return (
                  <button
                    className={`flex min-h-14 items-center gap-3 rounded-[22px] border px-4 text-left font-black transition ${
                      active
                        ? "border-cyan-200 bg-cyan-300 text-slate-950 shadow-glow"
                        : "border-white/10 bg-white/5 text-slate-100 hover:border-cyan-200/50"
                    }`}
                    data-testid={`option-${index}`}
                    disabled={result !== "idle"}
                    key={option}
                    onClick={() => setSelectedAnswer(option)}
                    type="button"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950/80 text-sm text-cyan-100">
                      技{String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-200">输入你的攻击答案</span>
              <input
                className="h-14 w-full rounded-[22px] border border-white/15 bg-white/10 px-4 text-lg font-black text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200"
                data-testid="blank-answer"
                disabled={result !== "idle"}
                onChange={(event) => setSelectedAnswer(event.target.value)}
                placeholder="例如：3/4 或 8"
                value={selectedAnswer}
              />
            </label>
          )}

          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((level) => (
                <AiHelpButton
                  disabled={Boolean(aiLoadingLevel) || result !== "idle" || aiMessages.some((item) => item.level === level)}
                  key={level}
                  label={aiButtonLabels[level as AiHelpLevel]}
                  loading={aiLoadingLevel === level}
                  onClick={() => requestAiHelp(level as AiHelpLevel)}
                  testId={`ai-help-${level}`}
                />
              ))}
            </div>
            {aiMessages.length > 0 && (
              <AiHelpButton
                disabled={Boolean(aiLoadingLevel) || result !== "idle" || aiMessages.some((item) => item.level === 3)}
                label={aiButtonLabels[3]}
                loading={aiLoadingLevel === 3}
                onClick={() => requestAiHelp(3)}
                testId="ai-help-3"
                variant="full"
              />
            )}
          </div>

          {aiMessages.length > 0 && (
            <div className="mt-4 space-y-3" data-testid="ai-bubbles">
              {aiMessages.map((message) => (
                <article
                  className="relative rounded-[28px] border border-cyan-200/20 bg-cyan-200/10 p-4 pl-5 backdrop-blur"
                  data-testid={`ai-message-${message.level}`}
                  key={message.level}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-cyan-200 text-slate-950">
                      <Bot size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-cyan-100">Nova / Level {message.level}</p>
                      <h2 className="text-base font-black text-white">{message.title}</h2>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-100">{message.message}</p>
                  <p className="mt-3 rounded-2xl bg-slate-950/45 p-3 text-sm leading-6 text-cyan-50">
                    {message.encouragement}
                  </p>
                  <p className="mt-2 text-xs font-bold text-violet-100">下一步：{message.nextAction}</p>
                </article>
              ))}
            </div>
          )}

          {skillCue && (
            <div
              className="mt-4 rounded-2xl border border-emerald-200/25 bg-emerald-200/10 p-3 text-sm font-bold leading-6 text-emerald-100"
              data-testid="skill-cue"
            >
              {skillCue}
            </div>
          )}

          <button
            className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-[28px] bg-gradient-to-r from-amber-300 via-cyan-300 to-violet-400 px-6 py-3 text-lg font-black text-slate-950 shadow-glow transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            data-testid="submit-answer"
            disabled={!canSubmit}
            onClick={submitAnswer}
            type="button"
          >
            <Send size={20} />
            提交答案，发动攻击
          </button>
        </section>

        {result !== "idle" && (
          <section
            className={`rounded-[32px] border p-5 backdrop-blur-xl ${
              result === "correct"
                ? "border-emerald-200/30 bg-emerald-300/12"
                : "border-amber-200/30 bg-amber-300/12"
            }`}
            data-testid={result === "correct" ? "result-correct" : "result-wrong"}
          >
            <div className="flex gap-3">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] ${
                  result === "correct" ? "bg-emerald-300 text-slate-950" : "bg-amber-300 text-slate-950"
                }`}
              >
                {result === "correct" ? <CheckCircle2 size={30} /> : <XCircle size={30} />}
              </div>
              <div className="min-w-0">
                <div className="mb-4 overflow-hidden rounded-[28px] border border-white/15 bg-white/10">
                  <div className="flex h-52 items-center justify-center bg-gradient-to-br from-cyan-200/20 via-violet-300/20 to-amber-200/20 sm:h-64">
                    <Image
                      alt={result === "correct" ? "Nova 庆祝" : "错题怪兽预告"}
                      className="h-full w-full object-contain p-3 drop-shadow-[0_18px_30px_rgba(0,0,0,0.3)]"
                      height={1254}
                      sizes="(max-width: 768px) 100vw, 720px"
                      src={result === "correct" ? gameAssets.novaCheer : gameAssets.monsters.fog}
                      width={1254}
                    />
                  </div>
                </div>
                <h2 className="text-xl font-black">{feedbackTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-200">{feedbackMessage}</p>
                {result === "wrong" && (
                  <p className="mt-2 rounded-2xl border border-amber-200/25 bg-amber-200/10 p-3 text-sm font-bold leading-6 text-amber-50">
                    这道错题已经变成一只错题怪兽，去图鉴里复盘就能削弱它。
                  </p>
                )}
                <p className="mt-3 rounded-2xl bg-slate-950/45 p-3 text-sm leading-6 text-slate-100">
                  解析：{question.explanation}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-slate-100">
                    <Sparkles size={15} />
                    经验 +{result === "correct" ? 10 : 2}
                  </span>
                  {result === "correct" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-slate-100">
                      <Coins size={15} />
                      金币 +5
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-slate-100">
                    <MessageCircle size={15} />
                    Nova 帮助 {aiHelpUsed} 次
                  </span>
                  {progressAfterSubmit && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-slate-100">
                      今日进度 {Math.min(progressAfterSubmit.completedChallenges, 3)}/3
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {result === "wrong" && (
                    <Link
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 text-sm font-black text-slate-950"
                      data-testid="go-monsters"
                      href="/monsters"
                    >
                      <Shield size={17} />
                      去怪兽图鉴
                    </Link>
                  )}
                  <Link
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-black text-slate-950"
                    data-testid="back-adventure"
                    href="/adventure"
                  >
                    返回冒险大厅
                  </Link>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-violet-300 px-4 text-sm font-black text-slate-950"
                    data-testid="go-report"
                    href="/report"
                  >
                    查看冒险结算
                  </Link>
                  <button
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-black text-slate-100"
                    onClick={resetLocalAttempt}
                    type="button"
                  >
                    <RotateCcw size={17} />
                    再试一次
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function AiHelpButton({
  disabled,
  label,
  loading,
  onClick,
  testId,
  variant = "normal"
}: {
  disabled: boolean;
  label: string;
  loading: boolean;
  onClick: () => void;
  testId: string;
  variant?: "normal" | "full";
}) {
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[22px] border px-4 text-sm font-black disabled:opacity-50 ${
        variant === "full"
          ? "border-amber-200/30 bg-amber-200/10 text-amber-100"
          : "border-cyan-200/25 bg-cyan-200/10 text-cyan-100"
      }`}
      data-testid={testId}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Bot size={18} />
      {loading ? "Nova 正在分析能量波..." : label}
    </button>
  );
}
