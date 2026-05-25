"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Cloud,
  Coins,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  Swords,
  Trophy,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NovaSpeechBubble } from "../../components/NovaSpeechBubble";
import { questions, type Question } from "../../data/questions";
import { getAiTutorHint } from "../../lib/aiTutor";
import { applyDailyQuestCompletion } from "../../lib/dailyQuestEngine";
import { gameAssets } from "../../lib/gameAssets";
import { ensureMonstersForMistakes } from "../../lib/monsterEngine";
import type { AiTutorResponse } from "../../lib/mockAiTutor";
import { getNovaLine } from "../../lib/novaLines";
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
type ChallengeMode = "normal" | "nova-check" | "nova-review" | "tutorial" | "newbie";

const aiButtonLabels: Record<AiHelpLevel, string> = {
  1: "Nova 给我一点线索",
  2: "Nova 再引导一步",
  3: "我还是不会，查看完整复盘"
};

const newbieQuestion: Question = {
  id: "q_g3_newbie_energy_tower",
  grade: "三年级",
  knowledgePoint: "两位数乘一位数",
  difficulty: 1,
  type: "choice",
  stem: "一座小能量塔需要 24 个能量块，3 座小能量塔一共需要多少个能量块？",
  options: ["62", "72", "82", "92"],
  answer: "72",
  explanation: "24 × 3 = 72，所以 3 座小能量塔一共需要 72 个能量块。",
  hint1: "每座塔一样多，求 3 座一共多少，可以用乘法。",
  hint2: "把 24 拆成 20 和 4，先算 20 × 3，再算 4 × 3。",
  mistakeTags: ["计算错误", "乘法口诀不熟"]
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
  const [challengeMode, setChallengeMode] = useState<ChallengeMode>("normal");
  const [novaCheckResult, setNovaCheckResult] = useState<AiTutorResponse | null>(null);
  const [tutorialCloudCleared, setTutorialCloudCleared] = useState(false);
  const [newbieStep, setNewbieStep] = useState<1 | 2 | 3>(1);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const progress = readProgress();
      const mode = new URLSearchParams(window.location.search).get("mode");
      const shouldShowTutorial = mode === "tutorial" || !progress.tutorialFirstWinDone;
      const shouldShowNewbie = mode === "newbie" || (progress.tutorialFirstWinDone && progress.attempts.length === 0);

      if (shouldShowTutorial) {
        setQuestion(selectChallengeQuestion(progress));
        setChallengeMode("tutorial");
      } else if (shouldShowNewbie) {
        setQuestion(newbieQuestion);
        setChallengeMode("newbie");
      } else {
        setQuestion(selectChallengeQuestion(progress));
        setChallengeMode(mode === "nova-check" || mode === "nova-review" ? mode : "normal");
      }
      setPageReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const isChoice = question.type === "choice";
  const canSubmit = selectedAnswer.trim().length > 0 && result === "idle";
  const aiHelpUsed = aiMessages.length;
  const visibleAiHelpUsed = aiHelpUsed + (novaCheckResult ? 1 : 0);
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
        ? `Nova 正在一步步帮你想。${dailyResult.awarded ? " 小帮手奖励已领取。" : ""}`
        : `你正在学会正确使用 Nova。${dailyResult.awarded ? " 小帮手奖励已领取。" : ""}`
    );
    setAiLoadingLevel(null);
  };

  const buildNovaCheckResponse = (): AiTutorResponse => ({
    level: 1,
    title: "Nova 讲解完成！",
    message: `这道题可以这样想：${question.explanation} 做“${question.knowledgePoint}”题时，先试试：${question.hint1} 再检查：${question.hint2}`,
    encouragement: "你已经完成今天的星星能量题，可以去看看星星报告。",
    nextAction: "查看今日星星报告。"
  });

  const buildNovaReviewResponse = (): AiTutorResponse => ({
    level: 3,
    title: "Nova 讲解完成！",
    message: `别着急，小怪兽只是提醒我们这里要再练一练。正确方法是：${question.explanation}`,
    encouragement: `下次遇到“${question.knowledgePoint}”题，可以先慢慢读题，再一步一步算。`,
    nextAction: "可以先看看小怪兽，也可以查看今日星星报告。"
  });

  const completeNovaTask = (mode: "nova-check" | "nova-review") => {
    if (mode === "nova-check" && novaCheckResult) {
      return;
    }

    const createdAt = new Date().toISOString();
    const student = readStudent();
    const progress = readProgress();
    const response = mode === "nova-check" ? buildNovaCheckResponse() : buildNovaReviewResponse();
    const message = mode === "nova-check" ? "Nova 讲解了这道题" : "Nova 帮你讲解了错题复盘";
    const attempts =
      mode === "nova-check" && result !== "idle"
        ? progress.attempts.map((attempt, index) =>
            index === progress.attempts.length - 1 && attempt.questionId === question.id
              ? { ...attempt, aiHelpUsed: attempt.aiHelpUsed + 1 }
              : attempt
          )
        : progress.attempts;
    const nextProgress: LearningProgress = {
      ...progress,
      attempts,
      aiHelpRecords: [
        ...progress.aiHelpRecords,
        {
          questionId: question.id,
          level: mode === "nova-check" ? 1 : 3,
          message,
          fullSolutionViewed: mode === "nova-review",
          createdAt
        }
      ],
      skillTelemetry: {
        ...progress.skillTelemetry,
        stepAskSkillExp: progress.skillTelemetry.stepAskSkillExp + 1,
        fullSolutionViewed: progress.skillTelemetry.fullSolutionViewed || mode === "nova-review"
      }
    };
    const dailyResult = applyDailyQuestCompletion("ai_help", student, nextProgress);

    saveStudentAndProgress(dailyResult.student, dailyResult.progress);
    if (response) {
      setNovaCheckResult(response);
    }
    setProgressAfterSubmit(dailyResult.progress);
    setSkillCue(
      mode === "nova-check"
        ? `Nova 已经讲完这道题。${dailyResult.awarded ? " Nova 小帮手奖励已领取。" : ""}`
        : `Nova 已经帮你复盘。${dailyResult.awarded ? " Nova 小帮手奖励已领取。" : ""}`
    );
    setChallengeMode("normal");
  };

  const completeTutorialFirstWin = () => {
    if (tutorialCloudCleared) {
      return;
    }

    const student = readStudent();
    const progress = readProgress();
    const shouldAward = !progress.tutorialFirstWinDone;
    const nextProgress: LearningProgress = {
      ...progress,
      tutorialFirstWinDone: true,
      exp: shouldAward ? Math.min(student.maxExp, progress.exp + 5) : progress.exp,
      coins: shouldAward ? progress.coins + 1 : progress.coins
    };
    const nextStudent = {
      ...defaultStudent,
      ...student,
      exp: nextProgress.exp,
      coins: nextProgress.coins
    };

    saveStudentAndProgress(nextStudent, nextProgress);
    setTutorialCloudCleared(true);
    setProgressAfterSubmit(nextProgress);
  };

  const continueAfterTutorial = () => {
    window.localStorage.removeItem(CURRENT_QUESTION_STORAGE_KEY);
    setQuestion(newbieQuestion);
    setTutorialCloudCleared(false);
    setNewbieStep(1);
    setChallengeMode("newbie");
    window.history.replaceState(null, "", "/challenge?mode=newbie");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const retryNewbieGuidance = () => {
    setSelectedAnswer("");
    setResult("idle");
    setRewardApplied(false);
    setProgressAfterSubmit(null);
    setNovaCheckResult(null);
    setNewbieStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    setNovaCheckResult(null);
  };

  const startNextChallenge = () => {
    window.localStorage.removeItem(CURRENT_QUESTION_STORAGE_KEY);
    setQuestion(selectChallengeQuestion(readProgress()));
    resetLocalAttempt();
    setChallengeMode("normal");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const feedbackTitle =
    result === "correct"
      ? "点亮成功！星球能量增加啦！"
      : "小怪兽出现啦！";

  const feedbackMessage =
    result === "correct"
      ? "你完成了今天的星星能量题，可以查看今日星星报告。"
      : "这道错题变成了一只小怪兽，去看看它哪里捣乱了。";

  if (!pageReady) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#17206a] px-4 text-white">
        <div className="rounded-[30px] border border-white/15 bg-white/10 p-6 text-center shadow-glow backdrop-blur-xl">
          <Sparkles className="mx-auto text-amber-200" size={34} />
          <p className="mt-3 text-lg font-black">Nova 正在打开教程岛...</p>
        </div>
      </main>
    );
  }

  if (challengeMode === "tutorial") {
    return (
      <main className="min-h-screen overflow-hidden bg-[#17206a] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[-20%] top-[-12%] h-80 w-80 rounded-full bg-cyan-400/25 blur-3xl" />
          <div className="absolute right-[-26%] top-[18%] h-96 w-96 rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute bottom-[-18%] left-[18%] h-72 w-72 rounded-full bg-amber-300/16 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.14)_1px,transparent_2px)] bg-[size:38px_38px] opacity-40" />
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
            <div className="flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-200/15 px-3 py-2 text-xs font-bold text-amber-100">
              <Sparkles size={15} />
              教程岛
            </div>
          </header>

          <section className="overflow-hidden rounded-[36px] border-4 border-white/20 bg-white/15 shadow-glow backdrop-blur-xl">
            <div className="bg-gradient-to-br from-cyan-300 via-blue-400 to-violet-500 p-5 text-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.24em] opacity-80">Tutorial Island</p>
                  <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">点亮第一颗星</h1>
                </div>
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[30px] border-2 border-white/45 bg-white/35 sm:h-32 sm:w-32">
                  <Image
                    alt="Nova 开心出现"
                    className="h-full w-full object-contain p-1"
                    height={1254}
                    sizes="128px"
                    src={tutorialCloudCleared ? gameAssets.novaCheer : gameAssets.novaHappy}
                    width={1254}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <NovaSpeechBubble
                line={tutorialCloudCleared ? getNovaLine("success") : getNovaLine("tutorial_start")}
                mood={tutorialCloudCleared ? "cheer" : "happy"}
              />
              <div className="relative min-h-[360px] overflow-hidden rounded-[34px] border border-cyan-200/25 bg-gradient-to-b from-sky-300 via-indigo-300 to-violet-500 p-4 text-slate-950">
                {!tutorialCloudCleared && (
                  <span className="absolute left-4 top-4 z-10 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950">
                    看这里
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-300/60 to-transparent" />
                <Image
                  alt="数学能量塔"
                  className={`absolute bottom-8 left-1/2 h-48 w-48 -translate-x-1/2 object-contain drop-shadow-[0_22px_32px_rgba(0,0,0,0.28)] transition ${
                    tutorialCloudCleared ? "scale-105 brightness-110" : "brightness-75"
                  }`}
                  height={1200}
                  src={gameAssets.quests.challenge}
                  width={1200}
                />
                <div
                  className={`absolute right-5 top-5 flex h-16 w-16 items-center justify-center rounded-full border-4 transition ${
                    tutorialCloudCleared
                      ? "border-amber-100 bg-amber-300 text-amber-950 shadow-[0_0_40px_rgba(252,211,77,0.9)]"
                      : "border-white/50 bg-slate-200 text-slate-400"
                  }`}
                >
                  <Star className={tutorialCloudCleared ? "fill-amber-600" : "fill-slate-300"} size={30} />
                </div>

                {[0, 1, 2].map((cloud) => (
                  <button
                    className={`absolute inline-flex min-h-16 min-w-24 items-center justify-center rounded-full border border-white/70 bg-white/85 px-5 text-slate-500 shadow-[0_14px_30px_rgba(15,23,42,0.22)] transition ${
                      tutorialCloudCleared ? "scale-75 opacity-0" : "shadow-[0_0_28px_rgba(255,255,255,0.85)] active:scale-95"
                    } ${cloud === 0 ? "left-5 top-24" : cloud === 1 ? "right-8 top-32" : "left-1/2 top-44 -translate-x-1/2"}`}
                    data-testid={`tutorial-cloud-${cloud}`}
                    disabled={tutorialCloudCleared}
                    key={cloud}
                    onClick={completeTutorialFirstWin}
                    type="button"
                  >
                    <Cloud className="fill-white" size={42} />
                  </button>
                ))}

                <p className="absolute bottom-4 left-4 right-4 rounded-3xl border border-white/45 bg-white/80 p-3 text-center text-sm font-black text-slate-900">
                  {tutorialCloudCleared ? "第一次点亮成功！" : "点一下云朵。"}
                </p>
              </div>

              {tutorialCloudCleared && (
                <section className="mt-4 rounded-[28px] border border-emerald-200/30 bg-emerald-200/10 p-4" data-testid="tutorial-success">
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-300 text-slate-950">
                      <Trophy size={26} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">第一次点亮成功！</h2>
                      <p className="mt-2 text-sm font-bold leading-6 text-slate-100">
                        你已经帮 Nova 找回了一点星星能量。
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-amber-100">+5 XP</span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-amber-100">+1 金币</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {tutorialCloudCleared && (
                  <button
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 text-base font-black text-slate-950"
                    data-testid="tutorial-continue"
                    onClick={continueAfterTutorial}
                    type="button"
                  >
                    继续小挑战
                    <Sparkles size={18} />
                  </button>
                )}
                <Link
                  className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-cyan-300 px-5 text-base font-black text-slate-950"
                  href="/adventure"
                >
                  返回冒险大厅
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (challengeMode === "newbie") {
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
              <Cloud size={15} />
              云朵迷雾
            </div>
          </header>

          <section className="overflow-hidden rounded-[36px] border-4 border-white/20 bg-white/15 shadow-glow backdrop-blur-xl">
            <div className="bg-gradient-to-br from-cyan-300 via-blue-500 to-violet-600 p-5 text-slate-950">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.24em] opacity-80">Cloud Adventure</p>
                  <h1 className="mt-2 text-3xl font-black leading-tight sm:text-5xl">云朵迷雾小冒险</h1>
                  <p className="mt-3 text-sm font-bold leading-6">
                    {newbieStep === 1
                      ? "太棒啦！第一颗星已经点亮了。"
                      : newbieStep === 2
                        ? "Nova 带你把 24 拆开看。"
                        : "现在来点亮 3 座小能量塔。"}
                  </p>
                </div>
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[30px] border-2 border-white/45 bg-white/35 sm:h-32 sm:w-32">
                  <Image
                    alt="Nova 主持小冒险"
                    className="h-full w-full object-contain p-1"
                    height={1254}
                    sizes="128px"
                    src={result === "correct" ? gameAssets.novaCheer : gameAssets.novaHappy}
                    width={1254}
                  />
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <NovaSpeechBubble
                line={
                  result === "correct"
                    ? getNovaLine("success")
                    : result === "wrong"
                      ? getNovaLine("wrong")
                      : newbieStep === 1
                        ? getNovaLine("step_1")
                        : newbieStep === 2
                          ? getNovaLine("step_2")
                          : getNovaLine("step_3")
                }
                mood={result === "correct" ? "cheer" : newbieStep === 2 || result === "wrong" ? "thinking" : "happy"}
              />
              {result === "idle" && newbieStep === 1 && (
                <section className="mt-4 rounded-[32px] border border-cyan-200/25 bg-cyan-200/10 p-4" data-testid="newbie-step-1">
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-100">
                    每座塔需要 24 个能量块，一共需要多少个呢？
                  </p>
                  <div className="relative mt-4 grid grid-cols-3 gap-2 rounded-[28px] border border-cyan-200/30 p-2 shadow-[0_0_34px_rgba(34,211,238,0.22)]">
                    <span className="absolute -top-3 left-4 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950">
                      看这里
                    </span>
                    {[1, 2, 3].map((tower) => (
                      <div className="rounded-[24px] border border-white/20 bg-white/10 p-2 text-center" key={tower}>
                        <Image
                          alt={`小能量塔 ${tower}`}
                          className="mx-auto h-24 w-full object-contain"
                          height={1200}
                          src={gameAssets.quests.challenge}
                          width={1200}
                        />
                        <p className="rounded-full bg-amber-300 px-2 py-1 text-sm font-black text-slate-950">24</p>
                      </div>
                    ))}
                  </div>
                  <button
                    className="mt-4 inline-flex min-h-13 w-full items-center justify-center rounded-2xl bg-amber-300 px-5 text-base font-black text-slate-950"
                    data-testid="newbie-step-1-next"
                    onClick={() => setNewbieStep(2)}
                    type="button"
                  >
                    我知道啦，继续
                  </button>
                </section>
              )}

              {result === "idle" && newbieStep === 2 && (
                <section className="mt-4 rounded-[32px] border border-violet-200/25 bg-violet-200/10 p-4" data-testid="newbie-step-2">
                  <div className="relative mt-2 grid gap-3 rounded-[28px] border border-violet-200/30 p-2 shadow-[0_0_34px_rgba(196,181,253,0.22)] sm:grid-cols-2">
                    <span className="absolute -top-3 left-4 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950">
                      看这里
                    </span>
                    <div className="rounded-[26px] bg-slate-950/45 p-4 text-center">
                      <p className="text-sm font-bold text-cyan-100">20</p>
                      <p className="mt-2 text-3xl font-black text-white">20 × 3 = ?</p>
                    </div>
                    <div className="rounded-[26px] bg-slate-950/45 p-4 text-center">
                      <p className="text-sm font-bold text-amber-100">4</p>
                      <p className="mt-2 text-3xl font-black text-white">4 × 3 = ?</p>
                    </div>
                  </div>
                  <button
                    className="mt-4 inline-flex min-h-13 w-full items-center justify-center rounded-2xl bg-amber-300 px-5 text-base font-black text-slate-950"
                    data-testid="newbie-step-2-next"
                    onClick={() => setNewbieStep(3)}
                    type="button"
                  >
                    开始点亮能量
                  </button>
                </section>
              )}

              {result === "idle" && newbieStep === 3 && (
                <section className="mt-4 rounded-[32px] border border-amber-200/25 bg-amber-200/10 p-4" data-testid="newbie-step-3">
                  <p className="text-xl font-black leading-8">3 座小能量塔一共需要多少个能量块？</p>
                  <div className="relative mt-4 grid gap-3 rounded-[28px] border border-amber-200/30 p-2 shadow-[0_0_34px_rgba(252,211,77,0.2)]">
                    <span className="absolute -top-3 left-4 rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950">
                      看这里
                    </span>
                    {newbieQuestion.options?.map((option, index) => {
                      const active = selectedAnswer === option;
                      return (
                        <button
                          className={`flex min-h-14 items-center gap-3 rounded-[22px] border px-4 text-left font-black transition ${
                            active
                              ? "border-cyan-200 bg-cyan-300 text-slate-950 shadow-glow"
                              : "border-white/10 bg-white/5 text-slate-100 hover:border-cyan-200/50"
                          }`}
                          data-testid={`newbie-option-${index}`}
                          key={option}
                          onClick={() => setSelectedAnswer(option)}
                          type="button"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950/80 text-sm text-cyan-100">
                            {String.fromCharCode(65 + index)}
                          </span>
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-[28px] bg-gradient-to-r from-amber-300 via-cyan-300 to-violet-400 px-6 py-3 text-lg font-black text-slate-950 shadow-glow transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    data-testid="newbie-submit"
                    disabled={!canSubmit}
                    onClick={submitAnswer}
                    type="button"
                  >
                    <Send size={20} />
                    提交答案，点亮能量
                  </button>
                </section>
              )}

              {result !== "idle" && (
                <section
                  className={`mt-4 rounded-[32px] border p-5 backdrop-blur-xl ${
                    result === "correct"
                      ? "border-emerald-200/30 bg-emerald-300/12"
                      : "border-amber-200/30 bg-amber-300/12"
                  }`}
                  data-testid={result === "correct" ? "newbie-result-correct" : "newbie-result-wrong"}
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[22px] ${
                        result === "correct" ? "bg-emerald-300 text-slate-950" : "bg-amber-300 text-slate-950"
                      }`}
                    >
                      {result === "correct" ? <CheckCircle2 size={30} /> : <Cloud size={30} />}
                    </div>
                    <div>
                      <h2 className="text-xl font-black">
                        {result === "correct" ? "点亮成功！3 座能量塔亮起来啦！" : "小云雾又出现啦！"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {result === "correct"
                          ? "你学会了把 24 拆成 20 和 4，再分别计算。"
                          : "别急，Nova 可以带你再看一遍。"}
                      </p>
                    </div>
                  </div>

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
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {result === "correct" ? (
                      <Link
                        className="relative inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 text-sm font-black text-slate-950 shadow-[0_0_28px_rgba(252,211,77,0.45)]"
                        data-testid="newbie-go-report"
                        href="/report"
                      >
                        <span className="absolute -top-3 left-4 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-950">
                          {getNovaLine("before_report", 1)}
                        </span>
                        <Sparkles size={17} />
                        查看今日星星报告
                      </Link>
                    ) : (
                      <button
                        className="relative inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 text-sm font-black text-slate-950 shadow-[0_0_28px_rgba(252,211,77,0.45)]"
                        data-testid="newbie-retry-guidance"
                        onClick={retryNewbieGuidance}
                        type="button"
                      >
                        <span className="absolute -top-3 left-4 rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-950">
                          看这里
                        </span>
                        <Bot size={17} />
                        让 Nova 再带我算一次
                      </button>
                    )}
                    {result === "correct" ? (
                      <button
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-black text-slate-100"
                        onClick={startNextChallenge}
                        type="button"
                      >
                        <RotateCcw size={17} />
                        再玩一题
                      </button>
                    ) : (
                      <Link
                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-violet-300 px-4 text-sm font-black text-slate-950"
                        href="/monsters"
                      >
                        看看小怪兽
                      </Link>
                    )}
                    <Link
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-black text-slate-950"
                      href="/adventure"
                    >
                      返回冒险大厅
                    </Link>
                  </div>
                </section>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

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
            星星关卡
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
                      选{String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
          ) : (
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-200">输入你的点亮答案</span>
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

          {challengeMode !== "normal" && result === "idle" && (
            <div
              className="mt-4 rounded-[28px] border border-cyan-200/25 bg-cyan-200/10 p-4"
              data-testid={challengeMode === "nova-check" ? "nova-check-card" : "nova-review-card"}
            >
              <p className="text-sm font-black text-cyan-100">
                Nova 讲解时间
              </p>
              <p className="mt-2 text-sm font-bold leading-6 text-slate-100">
                {challengeMode === "nova-check"
                  ? "你已经完成了这道题，要不要让 Nova 帮你检查一下思路？"
                  : "刚才的小怪兽题有点难，要不要让 Nova 帮你复盘一下？"}
              </p>
              <button
                className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-cyan-300 px-4 text-sm font-black text-slate-950"
                onClick={() => completeNovaTask(challengeMode)}
                type="button"
              >
                让 Nova 讲讲这道题
              </button>
            </div>
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
            提交答案，点亮能量
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
                    这道错题已经变成一只小怪兽，去图鉴里复盘就能收服它。
                  </p>
                )}
                <p className="mt-3 rounded-2xl bg-slate-950/45 p-3 text-sm leading-6 text-slate-100">
                  {result === "correct" ? `简短解释：${question.explanation}` : `先别急：${question.hint1}`}
                </p>
                {novaCheckResult && (
                  <article
                    className="mt-3 rounded-[1.5rem] border border-cyan-200/30 bg-cyan-200/10 p-4 shadow-[0_18px_40px_rgba(34,211,238,0.14)]"
                    data-testid="nova-check-card"
                  >
                    <div className="flex items-center gap-2 text-cyan-100">
                      <Bot size={18} />
                      <h3 className="text-base font-black">{novaCheckResult.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-100">{novaCheckResult.message}</p>
                    <p className="mt-2 rounded-2xl bg-white/10 p-3 text-sm font-bold leading-6 text-cyan-50">
                      {novaCheckResult.encouragement}
                    </p>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/80">
                      下一步：{novaCheckResult.nextAction}
                    </p>
                  </article>
                )}
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
                    Nova 帮助 {visibleAiHelpUsed} 次
                  </span>
                  {progressAfterSubmit && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-slate-100">
                      今日星星题已完成
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {result === "correct" && (
                    <Link
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 text-sm font-black text-slate-950"
                      data-testid="go-report-primary"
                      href="/report"
                    >
                      <Sparkles size={17} />
                      查看今日星星报告
                    </Link>
                  )}
                  {result === "wrong" && (
                    <Link
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 text-sm font-black text-slate-950"
                      data-testid="go-monsters-primary"
                      href="/monsters"
                    >
                      <Sparkles size={17} />
                      看看小怪兽
                    </Link>
                  )}
                  {!novaCheckResult && (
                    <button
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-200/25 bg-cyan-200/10 px-4 text-sm font-black text-cyan-100"
                      data-testid="nova-explain"
                      onClick={() => completeNovaTask(result === "correct" ? "nova-check" : "nova-review")}
                      type="button"
                    >
                      <Bot size={17} />
                      让 Nova 讲讲这道题
                    </button>
                  )}
                  {novaCheckResult && (
                    <span
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-200/25 bg-emerald-200/10 px-4 text-sm font-black text-emerald-100"
                      data-testid="nova-explained"
                    >
                      <Bot size={17} />
                      Nova 已讲解
                    </span>
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
                    查看今日星星报告
                  </Link>
                  <button
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 text-sm font-black text-slate-100"
                    onClick={result === "correct" ? startNextChallenge : resetLocalAttempt}
                    type="button"
                  >
                    <RotateCcw size={17} />
                    {result === "correct" ? "再玩一题" : "再试一次"}
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
