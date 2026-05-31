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
import { trackEvent } from "../../lib/telemetry";
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
  const [newbieStep, setNewbieStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [newbieFeedback, setNewbieFeedback] = useState("");
  const [newbiePicked, setNewbiePicked] = useState("");
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
    trackEvent("challenge_ai_help", {
      questionId: question.id,
      knowledgePoint: question.knowledgePoint,
      level,
      fullSolutionViewed: level === 3,
      questAwarded: dailyResult.awarded
    });
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
    trackEvent("challenge_nova_task", {
      questionId: question.id,
      knowledgePoint: question.knowledgePoint,
      mode,
      questAwarded: dailyResult.awarded
    });
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
      exp: shouldAward ? progress.exp + 5 : progress.exp,
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
    setNewbieFeedback("");
    setNewbiePicked("");
    setChallengeMode("newbie");
    window.history.replaceState(null, "", "/challenge?mode=newbie");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const moveNewbieStep = (step: 1 | 2 | 3 | 4 | 5) => {
    setNewbieStep(step);
    setNewbieFeedback("");
    setNewbiePicked("");
  };

  const pickNewbieStepAnswer = (
    value: string,
    correctAnswer: string,
    correctMessage: string,
    wrongMessage: string
  ) => {
    const isCorrect = value === correctAnswer;
    setNewbiePicked(value);
    setNewbieFeedback(isCorrect ? correctMessage : wrongMessage);
  };

  const pickNewbieFinalAnswer = (value: string) => {
    setNewbiePicked(value);
    setSelectedAnswer(value);
    if (value === newbieQuestion.answer) {
      setNewbieFeedback("");
      submitAnswer(value);
      return;
    }
    setNewbieFeedback("差一点点，60 再加 12，往 72 看看。");
  };

  const retryNewbieGuidance = () => {
    setSelectedAnswer("");
    setResult("idle");
    setRewardApplied(false);
    setProgressAfterSubmit(null);
    setNovaCheckResult(null);
    setNewbieStep(2);
    setNewbieFeedback("");
    setNewbiePicked("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submitAnswer = (answerOverride?: string) => {
    const finalAnswer = answerOverride ?? selectedAnswer;
    if ((!answerOverride && !canSubmit) || rewardApplied || finalAnswer.trim().length === 0) {
      return;
    }

    const isCorrect = normalizeAnswer(finalAnswer) === normalizeAnswer(question.answer);
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
          selectedAnswer: finalAnswer,
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
      exp: nextProgress.exp,
      coins: nextProgress.coins
    };

    const dailyResult = applyDailyQuestCompletion("challenge", nextStudent, nextProgress);
    saveStudentAndProgress(dailyResult.student, dailyResult.progress);
    window.localStorage.removeItem(CURRENT_QUESTION_STORAGE_KEY);
    setProgressAfterSubmit(dailyResult.progress);
    setResult(isCorrect ? "correct" : "wrong");
    setRewardApplied(true);
    trackEvent("challenge_answer_submit", {
      questionId: question.id,
      knowledgePoint: question.knowledgePoint,
      difficulty: question.difficulty,
      isCorrect,
      aiHelpUsed,
      challengeMode,
      firstClear: isCorrect && !alreadyCompletedThisQuestion
    });
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
    setNewbieFeedback("");
    setNewbiePicked("");
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
      <main className="min-h-screen overflow-hidden bg-[#12258a] text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-[-18%] top-[-12%] h-96 w-96 rounded-full bg-cyan-300/25 blur-3xl" />
          <div className="absolute right-[-24%] top-[12%] h-[28rem] w-[28rem] rounded-full bg-violet-500/25 blur-3xl" />
          <div className="absolute bottom-[-18%] left-[18%] h-80 w-80 rounded-full bg-amber-300/18 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.14)_1px,transparent_2px)] bg-[size:38px_38px] opacity-40" />
        </div>

        <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-3 pb-5 pt-4 sm:px-6">
          <header className="mb-3 flex items-center justify-between gap-3">
            <Link
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-cyan-300/25 bg-slate-950/25 px-3 text-xs font-bold text-cyan-100 backdrop-blur"
              href="/adventure"
            >
              <ArrowLeft size={14} />
              冒险大厅
            </Link>
            <div className="flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-200/15 px-3 py-2 text-xs font-black text-amber-100 backdrop-blur">
              <Sparkles size={14} />
              教程岛
            </div>
          </header>

          <section className="relative min-h-[520px] overflow-hidden rounded-[36px] border border-white/15 bg-sky-300 shadow-glow sm:min-h-[600px]">
            <Image
              alt="教程岛背景"
              className={`absolute inset-0 h-full w-full object-cover transition duration-500 ${
                tutorialCloudCleared ? "brightness-110 saturate-125" : "brightness-90"
              }`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 1024px"
              src={gameAssets.lobbyHero}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-sky-200/15 via-indigo-500/10 to-[#11175d]/75" />
            <div
              className={`absolute inset-0 transition duration-500 ${
                tutorialCloudCleared ? "bg-amber-200/15 shadow-[inset_0_0_120px_rgba(252,211,77,0.35)]" : "bg-slate-900/10"
              }`}
            />

            <div className="absolute left-4 top-4 z-10 max-w-[68%] sm:left-6 sm:top-6">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-cyan-100 drop-shadow">Tutorial Island</p>
              <h1 className="mt-1 text-3xl font-black leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] sm:text-5xl">
                点亮第一颗星
              </h1>
            </div>

            <div className="absolute left-[60%] top-[36%] z-[3] -translate-x-1/2 -translate-y-1/2 sm:left-[60%] sm:top-[36%]">
              {!tutorialCloudCleared && (
                <div className="absolute -right-14 -top-16 flex items-center gap-2 rounded-full border border-amber-200/45 bg-slate-950/35 px-3 py-1 text-xs font-black text-amber-100 shadow-lg backdrop-blur sm:-right-20">
                  <span className="text-lg leading-none">↙</span>
                  点这朵云
                </div>
              )}
              <div
                className={`relative flex h-28 w-28 items-center justify-center rounded-full border-[6px] transition duration-500 sm:h-36 sm:w-36 ${
                  tutorialCloudCleared
                    ? "border-amber-100 bg-amber-300 text-amber-950 shadow-[0_0_80px_rgba(252,211,77,0.95)]"
                    : "border-white/45 bg-slate-100/55 text-slate-300 shadow-[0_0_34px_rgba(255,255,255,0.28)]"
                }`}
              >
                <Star className={tutorialCloudCleared ? "fill-amber-700" : "fill-slate-200"} size={58} />
                {tutorialCloudCleared && (
                  <>
                    <Sparkles className="absolute -right-5 -top-5 text-amber-200 drop-shadow" size={26} />
                    <Sparkles className="absolute -bottom-3 -left-6 text-yellow-100 drop-shadow" size={20} />
                    <Sparkles className="absolute -right-8 bottom-4 text-cyan-100 drop-shadow" size={18} />
                  </>
                )}
              </div>
            </div>

            {!tutorialCloudCleared && (
              <button
                aria-label="轻点云朵"
                className="absolute left-[43%] top-[31%] z-[5] block h-32 w-52 -translate-x-1/2 border-0 bg-transparent p-0 transition duration-500 hover:scale-105 active:scale-95 sm:left-[47%] sm:top-[32%] sm:h-36 sm:w-60"
                data-testid="tutorial-cloud-0"
                onClick={completeTutorialFirstWin}
                type="button"
              >
                <span className="absolute bottom-1 left-1/2 h-[58%] w-[78%] -translate-x-1/2 rounded-[999px] bg-white/78 shadow-[0_18px_42px_rgba(255,255,255,0.32)] backdrop-blur-[2px]" />
                <span className="absolute bottom-[18%] left-[10%] h-[58%] w-[42%] rounded-full bg-white/72 shadow-[0_0_30px_rgba(255,255,255,0.38)] backdrop-blur-[1px]" />
                <span className="absolute bottom-[24%] left-[32%] h-[78%] w-[46%] rounded-full bg-white/84 shadow-[0_0_34px_rgba(255,255,255,0.44)] backdrop-blur-[1px]" />
                <span className="absolute bottom-[16%] right-[8%] h-[56%] w-[39%] rounded-full bg-white/68 shadow-[0_0_26px_rgba(255,255,255,0.34)] backdrop-blur-[1px]" />
                <span className="absolute inset-0 rounded-full bg-white/20 blur-xl" />
              </button>
            )}

            <div
              className={`absolute left-[58%] top-[34%] z-[6] h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full transition duration-500 sm:left-[60%] sm:top-[36%] sm:h-32 sm:w-32 ${
                tutorialCloudCleared
                  ? "bg-amber-200/30 shadow-[0_0_90px_rgba(252,211,77,0.75)]"
                  : "pointer-events-none bg-transparent"
              }`}
            />

            <div className="absolute bottom-28 left-3 z-[6] h-32 w-32 sm:bottom-24 sm:left-8 sm:h-44 sm:w-44">
              <Image
                alt="Nova"
                className="h-full w-full object-contain drop-shadow-[0_20px_32px_rgba(0,0,0,0.35)]"
                height={1254}
                sizes="176px"
                src={tutorialCloudCleared ? gameAssets.novaCheer : gameAssets.novaHappy}
                width={1254}
              />
            </div>

            <div className="absolute inset-x-3 bottom-3 z-[7] sm:inset-x-6">
              <div className="rounded-[28px] border border-white/30 bg-slate-950/55 p-3 shadow-[0_18px_45px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <NovaSpeechBubble
                  line={tutorialCloudCleared ? getNovaLine("success") : "点中间这朵云，把星星找回来！"}
                  mood={tutorialCloudCleared ? "cheer" : "happy"}
                />
                <p className="mt-2 text-center text-sm font-black text-cyan-50">
                  {tutorialCloudCleared ? "你帮 Nova 找回第一颗星啦。" : "轻点云朵，找回第一颗星。"}
                </p>
              </div>

              {tutorialCloudCleared && (
                <section className="mt-3 rounded-[24px] border border-emerald-200/35 bg-emerald-200/15 p-3 text-center" data-testid="tutorial-success">
                  <h2 className="text-2xl font-black text-white">第一次点亮成功！</h2>
                  <div className="mt-2 flex justify-center gap-2">
                    <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-amber-100">+5 XP</span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-amber-100">+1 金币</span>
                  </div>
                </section>
              )}

              {tutorialCloudCleared && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 text-base font-black text-slate-950 shadow-[0_0_32px_rgba(252,211,77,0.45)]"
                    data-testid="tutorial-continue"
                    onClick={continueAfterTutorial}
                    type="button"
                  >
                    继续小挑战
                    <Sparkles size={18} />
                  </button>
                  <Link
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-cyan-200/90 px-5 text-sm font-black text-slate-950"
                    href="/adventure"
                  >
                    返回冒险大厅
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (challengeMode === "newbie") {
    const newbieLine =
      result === "correct"
        ? getNovaLine("success")
        : newbieStep === 1
          ? "3 座小塔，每座要 24 个能量块。"
          : newbieStep === 2
            ? "24 可以拆成 20 和 4。"
            : newbieStep === 3
              ? "先数 20 的部分。"
              : newbieStep === 4
                ? "再数小小的 4。"
                : "最后把两部分合起来。";

    const renderEnergyTowers = (label: string) => (
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((tower) => (
          <div className="rounded-[24px] border border-white/20 bg-white/10 p-2 text-center" key={tower}>
            <Image
              alt={`小能量塔 ${tower}`}
              className="mx-auto h-20 w-full object-contain sm:h-24"
              height={1200}
              src={gameAssets.quests.challenge}
              width={1200}
            />
            <p className="rounded-full bg-amber-300 px-2 py-1 text-sm font-black text-slate-950">{label}</p>
          </div>
        ))}
      </div>
    );

    const renderChoice = (
      options: string[],
      correctAnswer: string,
      testPrefix: string,
      onPick: (value: string) => void
    ) => (
      <div className="mt-4 grid grid-cols-3 gap-2">
        {options.map((option) => {
          const active = newbiePicked === option;
          const showCorrect = Boolean(newbieFeedback) && option === correctAnswer;
          return (
            <button
              className={`min-h-14 rounded-[22px] border px-3 text-lg font-black transition active:scale-95 ${
                showCorrect
                  ? "border-emerald-100 bg-emerald-300 text-slate-950 shadow-glow"
                  : active
                    ? "border-cyan-100 bg-cyan-300 text-slate-950 shadow-glow"
                    : "border-white/10 bg-white/8 text-white hover:border-cyan-200/50"
              }`}
              data-testid={`${testPrefix}-${option}`}
              key={option}
              onClick={() => onPick(option)}
              type="button"
            >
              {option}
            </button>
          );
        })}
      </div>
    );

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
                    {result === "correct" ? "3 座小塔都亮起来啦。" : "我们一起给小塔补能量。"}
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
                line={newbieLine}
                mood={result === "correct" ? "cheer" : newbieStep === 1 ? "happy" : "thinking"}
              />

              {result === "idle" && (
                <section className="mt-4 rounded-[32px] border border-cyan-200/25 bg-cyan-200/10 p-4" data-testid={`newbie-step-${newbieStep}`}>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black text-slate-950">
                      第 {newbieStep} 步 / 5
                    </span>
                    <span className="text-xs font-bold text-cyan-100">你来帮 Nova 选</span>
                  </div>

                  {newbieStep === 1 && (
                    <>
                      <p className="text-xl font-black leading-8">你先猜一猜，一共大约是多少？</p>
                      <div className="mt-4 rounded-[28px] border border-cyan-200/30 p-2 shadow-[0_0_34px_rgba(34,211,238,0.22)]">
                        {renderEnergyTowers("24")}
                      </div>
                      {renderChoice(["50", "72", "100"], "72", "newbie-guess", (value) =>
                        pickNewbieStepAnswer(value, "72", "你的感觉很准！", "没关系，我们一起拆开看。")
                      )}
                      {newbieFeedback && (
                        <NewbieStepFeedback message={newbieFeedback} onContinue={() => moveNewbieStep(2)} />
                      )}
                    </>
                  )}

                  {newbieStep === 2 && (
                    <>
                      <p className="text-xl font-black leading-8">24 可以拆成 20 和 4 两部分。</p>
                      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[28px] border border-violet-200/30 p-4 shadow-[0_0_34px_rgba(196,181,253,0.22)]">
                        <EnergyBlock label="20" tone="cyan" />
                        <span className="text-3xl font-black text-amber-200">+</span>
                        <EnergyBlock label="4" tone="amber" />
                      </div>
                      <button
                        className="mt-4 inline-flex min-h-13 w-full items-center justify-center rounded-2xl bg-amber-300 px-5 text-base font-black text-slate-950"
                        data-testid="newbie-step-2-next"
                        onClick={() => moveNewbieStep(3)}
                        type="button"
                      >
                        先数 20 的部分
                      </button>
                    </>
                  )}

                  {newbieStep === 3 && (
                    <>
                      <p className="text-xl font-black leading-8">
                        3 座塔，每座先放 20 个能量块，一共有多少个？
                      </p>
                      <div className="mt-4 rounded-[28px] border border-cyan-200/30 p-2">
                        {renderEnergyTowers("20")}
                      </div>
                      {renderChoice(["40", "60", "80"], "60", "newbie-20", (value) =>
                        pickNewbieStepAnswer(value, "60", "数对啦，20、40、60。", "看，20、40、60，数三次就是 60。")
                      )}
                      {newbieFeedback && (
                        <NewbieStepFeedback message={newbieFeedback} onContinue={() => moveNewbieStep(4)} />
                      )}
                    </>
                  )}

                  {newbieStep === 4 && (
                    <>
                      <p className="text-xl font-black leading-8">
                        每座塔还差 4 个小能量块，3 座塔一共还差多少个？
                      </p>
                      <div className="mt-4 rounded-[28px] border border-amber-200/30 p-2">
                        {renderEnergyTowers("4")}
                      </div>
                      {renderChoice(["7", "12", "16"], "12", "newbie-4", (value) =>
                        pickNewbieStepAnswer(value, "12", "很好，4、8、12。", "4、8、12，数三次就是 12。")
                      )}
                      {newbieFeedback && (
                        <NewbieStepFeedback message={newbieFeedback} onContinue={() => moveNewbieStep(5)} />
                      )}
                    </>
                  )}

                  {newbieStep === 5 && (
                    <>
                      <p className="text-xl font-black leading-8">最后把两部分合起来。</p>
                      <div className="mt-4 rounded-[28px] border border-amber-200/30 bg-slate-950/35 p-5 text-center shadow-[0_0_34px_rgba(252,211,77,0.2)]">
                        <span className="text-3xl font-black text-cyan-100">60</span>
                        <span className="mx-3 text-3xl font-black text-amber-200">+</span>
                        <span className="text-3xl font-black text-cyan-100">12</span>
                        <span className="mx-3 text-3xl font-black text-white">=</span>
                        <span className="text-3xl font-black text-white">?</span>
                      </div>
                      {renderChoice(["62", "72", "82"], "72", "newbie-final", pickNewbieFinalAnswer)}
                      {newbieFeedback && (
                        <div className="mt-4 rounded-2xl border border-amber-200/25 bg-amber-200/10 p-3 text-sm font-black leading-6 text-amber-50">
                          {newbieFeedback}
                        </div>
                      )}
                    </>
                  )}
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
                        {result === "correct" ? "点亮成功！" : "小云雾又出现啦！"}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        {result === "correct"
                          ? "你把 24 拆成 20 和 4，帮 3 座小塔都补好了能量。"
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
            onClick={() => submitAnswer()}
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

function EnergyBlock({ label, tone }: { label: string; tone: "cyan" | "amber" }) {
  return (
    <div
      className={`rounded-[26px] border p-5 text-center shadow-[0_0_28px_rgba(255,255,255,0.12)] ${
        tone === "cyan"
          ? "border-cyan-100/40 bg-cyan-200/20 text-cyan-50"
          : "border-amber-100/40 bg-amber-200/20 text-amber-50"
      }`}
    >
      <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-white/20 shadow-glow" />
      <p className="text-4xl font-black">{label}</p>
    </div>
  );
}

function NewbieStepFeedback({ message, onContinue }: { message: string; onContinue: () => void }) {
  return (
    <div className="mt-4 rounded-2xl border border-emerald-200/25 bg-emerald-200/10 p-3">
      <p className="text-sm font-black leading-6 text-emerald-50">{message}</p>
      <button
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-amber-300 px-4 text-sm font-black text-slate-950"
        onClick={onContinue}
        type="button"
      >
        我明白了，继续
      </button>
    </div>
  );
}
