"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  type AdventureConfig,
  type AnswerOption,
  type AdventureSession,
  type AdventureStage,
  type ReflectionChoice,
  initialAdventureSession
} from "../lib/adventures";
import { markIslandCompleted, readAdventureProgress } from "../lib/adventureProgress";
import { readProgress, readStudent, saveStudentAndProgress } from "../lib/learningProgress";
import { getReflection } from "../lib/reflection";
import { REFLECTION_CHOICE_LABELS } from "../lib/reflectionPrompt";
import { trackEvent } from "../lib/telemetry";

// 无美术资源时退回的渐变背景（asset-light 关卡用）。各关可用 config.fallbackScene
// 覆写为主题色：组件把它写进 CSS 变量 --scene-bg，sceneStyle / StageFrame 统一引用，
// 这样有图的阶段用真图、没图的阶段自动落到该关主题渐变（如森林岛走森林绿）。
const DEFAULT_SCENE_BG =
  "radial-gradient(circle at 50% 18%, rgba(34,211,238,0.26), rgba(30,41,124,0.72) 42%, rgba(5,8,36,0.98))";
const SCENE_BG_VAR = `var(--scene-bg, ${DEFAULT_SCENE_BG})`;

function sceneStyle(asset?: string): CSSProperties {
  return asset
    ? { backgroundImage: `linear-gradient(rgba(7,11,44,0.16), rgba(7,11,44,0.42)), url(${asset})` }
    : { background: SCENE_BG_VAR };
}

export default function AdventureRunner({ config }: { config: AdventureConfig }) {
  const [session, setSession] = useState<AdventureSession>(initialAdventureSession);
  const [notice, setNotice] = useState("Nova 正陪你一起探险。");
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [helpStep, setHelpStep] = useState<"menu" | "l1" | "l2" | "l3_confirm" | "l3_answer">("menu");
  const [helpFeedback, setHelpFeedback] = useState("");
  const [selectedReflection, setSelectedReflection] = useState<ReflectionChoice | null>(null);
  // Beat 7 真 AI 复盘：贴纸文案改为向 /api/reflect 取（无 key/失败回落静态文案）。
  const [reflectionText, setReflectionText] = useState<string | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  // 防竞态：快速换贴纸时只采用最后一次请求的结果。
  const reflectionReqId = useRef(0);

  const preloadAssets = useMemo(
    () => Array.from(new Set(Object.values(config.assets).filter(Boolean) as string[])),
    [config]
  );

  useEffect(() => {
    preloadAssets.forEach((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
    });
  }, [preloadAssets]);

  // 两段不同步长，用于“别过度概括”的对照 + 生成 L1 选项按钮。
  const stepOptions = useMemo(() => {
    const set = [config.stone.step, config.towerStep];
    return Array.from(new Set(set));
  }, [config]);

  const stageTitle = config.stageTitles[session.stage];
  const novaMood =
    session.stage === "stone_question" ||
    session.stage === "help_menu" ||
    session.stage === "tower_question" ||
    session.stage === "truth_moment" ||
    session.stage === "truth_question"
      ? "thinking"
      : session.stage === "complete" || session.stage === "island_jump"
        ? "happy"
        : "guide";
  const novaAsset =
    novaMood === "happy"
      ? config.assets.novaHappy
      : novaMood === "thinking"
        ? config.assets.novaThinking
        : config.assets.novaGuide;

  const novaLine = useMemo(() => {
    if (session.stage === "help_menu") {
      return session.currentQuestion === "stone" ? config.novaLines.helpStone : config.novaLines.helpTower;
    }
    if (session.stage === "truth_question") return notice;
    return config.novaLines[session.stage];
  }, [config, notice, session.currentQuestion, session.stage]);

  const currentGoal = config.goals[session.stage];

  const logEvent = (event: string, nextSession: AdventureSession = session) => {
    // 真埋点：写入本地事件日志（lib/telemetry），附带本关 id 与一份精简的会话快照。
    trackEvent(event, {
      levelId: config.levelId,
      islandId: config.islandId,
      stage: nextSession.stage,
      currentQuestion: nextSession.currentQuestion,
      inspirationStars: nextSession.inspirationStars,
      towerStep: nextSession.towerStep,
      wrongAttemptsStone: nextSession.wrongAttemptsStone,
      wrongAttemptsTower: nextSession.wrongAttemptsTower,
      truthDetectorSuccess: nextSession.truthDetectorSuccess,
      reflectionChoice: nextSession.reflectionChoice
    });
  };

  const updateSession = (event: string, updater: (prev: AdventureSession) => AdventureSession) => {
    // 埋点必须在 setState 更新函数之外发生：React StrictMode 会双调用更新函数，
    // 把副作用放进去会让同一动作记录两条事件。这里用当前 session 算出 next 单独上报。
    setSession(updater);
    logEvent(event, updater(session));
  };

  const goStage = (stage: AdventureStage, event = `stage_${stage}`) => {
    setAnswerFeedback("");
    setHelpStep("menu");
    setHelpFeedback("");
    updateSession(event, (prev) => ({ ...prev, stage }));
  };

  const askNova = () => {
    if (session.stage === "stone_question") {
      updateSession("open_nova_help_stone", (prev) => ({ ...prev, currentQuestion: "stone", stage: "help_menu" }));
      return;
    }
    if (session.stage === "tower_question") {
      updateSession("open_nova_help_tower", (prev) => ({ ...prev, currentQuestion: "tower", stage: "help_menu" }));
      return;
    }
    setNotice("Nova 正陪你一起探险。");
    logEvent("nova_soft_hint");
  };

  const openTruthDetector = () => {
    if (session.stage === "truth_moment") {
      updateSession("truth_detector_opened", (prev) => ({ ...prev, truthDetectorOpened: true, stage: "truth_question" }));
      return;
    }
    setNotice("真相探测器安静地闪了一下。");
    logEvent("truth_detector_not_ready");
  };

  const answerStone = (answer: number | string) => {
    if (String(answer) === String(config.stone.answer)) {
      setAnswerFeedback(config.feedback?.stoneCorrect ?? `哇！你看出来了！这条数字路每次加${config.stone.step}。`);
      logEvent("stone_correct");
      return;
    }
    if (session.wrongAttemptsStone === 0) {
      const seq = config.stone.sequence;
      updateSession("stone_try_again", (prev) => ({ ...prev, wrongAttemptsStone: prev.wrongAttemptsStone + 1 }));
      setAnswerFeedback(config.feedback?.stoneWrongFirst ?? `差一点！再看看 ${seq[0]} 到 ${seq[1]}、${seq[1]} 到 ${seq[2]}，中间都隔了几？`);
      return;
    }
    setAnswerFeedback(config.feedback?.stoneSecondWrong ?? "我们一起想一想？");
    updateSession("stone_second_try_help", (prev) => ({ ...prev, wrongAttemptsStone: prev.wrongAttemptsStone + 1, currentQuestion: "stone", stage: "help_menu" }));
  };

  const answerTower = (answer: number | string) => {
    const step = config.towerSteps[session.towerStep];
    if (String(answer) === String(step.answer)) {
      const isLast = session.towerStep >= config.towerSteps.length - 1;
      if (isLast) {
        setAnswerFeedback(config.feedback?.towerCorrectAll ?? `塔亮起来了！${config.towerSteps.length}段数字路都点亮，每一段都是加${config.towerStep}。`);
        logEvent("tower_correct_all");
      } else {
        setAnswerFeedback(config.feedback?.towerCorrectStep ?? `第${session.towerStep + 1}段亮起来了！再看看上面那一段。`);
        logEvent(`tower_correct_step_${session.towerStep}`);
      }
      return;
    }
    if (session.wrongAttemptsTower === 0) {
      updateSession("tower_try_again", (prev) => ({ ...prev, wrongAttemptsTower: prev.wrongAttemptsTower + 1 }));
      setAnswerFeedback(config.feedback?.towerWrongFirst ?? `再看看 ${step.sequence.join("、")}，每次多了几个？`);
      return;
    }
    setAnswerFeedback(config.feedback?.towerSecondWrong ?? "我们可以请 Nova 一起想。");
    updateSession("tower_second_try_help", (prev) => ({ ...prev, wrongAttemptsTower: prev.wrongAttemptsTower + 1, currentQuestion: "tower", stage: "help_menu" }));
  };

  const advanceTower = () => {
    if (session.towerStep >= config.towerSteps.length - 1) {
      goStage("truth_moment", "tower_to_truth_moment");
      return;
    }
    setAnswerFeedback("");
    updateSession("tower_next_step", (prev) => ({ ...prev, towerStep: prev.towerStep + 1, wrongAttemptsTower: 0 }));
  };

  const returnToQuestion = () => {
    goStage(session.currentQuestion === "stone" ? "stone_question" : "tower_question", "return_from_help");
  };

  const currentSeqAndStep = () => {
    const isStone = session.currentQuestion === "stone";
    const seq = isStone ? config.stone.sequence : config.towerSteps[session.towerStep].sequence;
    const step = isStone ? config.stone.step : config.towerStep;
    return { isStone, seq, step };
  };

  const chooseL1Pattern = (chosen: number | "other") => {
    const { seq, step } = currentSeqAndStep();
    const last = seq[seq.length - 1];
    if (chosen === step) setHelpFeedback(`对呀！那 ${last} 后面是多少？`);
    else if (chosen === "other") setHelpFeedback(`我们一起数：${seq.join("、")}，中间每次多几个？`);
    else setHelpFeedback(`再看看 ${seq[0]} 到 ${seq[1]} 之间差几？`);
    logEvent(`l1_pattern_${chosen}`);
  };

  const startL1 = () => {
    setHelpStep("l1");
    // make-ten 关卡的 L1 是“引导卡”：进入时直接放出该题的引导文案；否则保持空（走 +step 选择器）。
    const l1Text = session.currentQuestion === "stone" ? config.help?.l1Stone : config.help?.l1Tower;
    setHelpFeedback(l1Text ?? "");
    updateSession("help_l1", (prev) => ({ ...prev, l1Count: prev.l1Count + 1 }));
  };

  const startL2 = () => {
    const feedbackOverride = session.currentQuestion === "stone" ? config.feedback?.helpL2Stone : config.feedback?.helpL2Tower;
    if (feedbackOverride) {
      setHelpStep("l2");
      setHelpFeedback(feedbackOverride);
      updateSession("help_l2", (prev) => ({ ...prev, l2Count: prev.l2Count + 1 }));
      return;
    }
    const { seq, step } = currentSeqAndStep();
    const parts = seq.slice(0, -1).map((n, i) => `${n} 到 ${seq[i + 1]} 是 +${step}`);
    const last = seq[seq.length - 1];
    setHelpStep("l2");
    setHelpFeedback(`看，${parts.join("，")}。那 ${last} 后面是多少？`);
    updateSession("help_l2", (prev) => ({ ...prev, l2Count: prev.l2Count + 1 }));
  };

  const confirmL3 = () => {
    if (session.inspirationStars === 0) {
      const noStarOverride = session.currentQuestion === "stone" ? config.feedback?.helpL3NoStarStone : config.feedback?.helpL3NoStarTower;
      if (noStarOverride) {
        setHelpStep("l2");
        setHelpFeedback(noStarOverride);
        updateSession("help_l3_no_star", (prev) => ({ ...prev, l2Count: prev.l2Count + 1 }));
        return;
      }
      const { step } = currentSeqAndStep();
      setHelpStep("l2");
      setHelpFeedback(`今天的灵感星用完啦，但我还能陪你想：这条路每次多${step}。`);
      updateSession("help_l3_no_star", (prev) => ({ ...prev, l2Count: prev.l2Count + 1 }));
      return;
    }
    setHelpStep("l3_confirm");
    setHelpFeedback("");
    logEvent("help_l3_confirm_opened");
  };

  const useInspirationStar = () => {
    const isStone = session.currentQuestion === "stone";
    const answerOverride = isStone ? config.feedback?.helpL3AnswerStone : config.feedback?.helpL3AnswerTower;
    if (answerOverride) {
      setHelpStep("l3_answer");
      setHelpFeedback(answerOverride);
      updateSession("help_l3_used", (prev) => ({ ...prev, inspirationStars: Math.max(0, prev.inspirationStars - 1), l3Count: prev.l3Count + 1 }));
      return;
    }
    const answer = isStone ? config.stone.answer : config.towerSteps[session.towerStep].answer;
    const step = isStone ? config.stone.step : config.towerStep;
    setHelpStep("l3_answer");
    setHelpFeedback(`答案是${answer}。这条路的规律是：每次加${step}。`);
    updateSession("help_l3_used", (prev) => ({ ...prev, inspirationStars: Math.max(0, prev.inspirationStars - 1), l3Count: prev.l3Count + 1 }));
  };

  const chooseTruth = (choice: "a" | "b" | "c") => {
    if (choice === "c") {
      setNotice(config.feedback?.truthThinkAgain ?? "再看一看刚才的两条数字路。");
      logEvent("truth_think_again");
      return;
    }
    updateSession(choice === "a" ? "truth_success" : "truth_tried", (prev) => ({ ...prev, truthDetectorOpened: true, truthDetectorSuccess: choice === "a", stage: "reflection" }));
    setNotice(choice === "a" ? (config.feedback?.truthSuccess ?? `哇，你抓到我啦！可能是+${config.stone.step}，也可能是+${config.towerStep}。`) : "那我们继续看看今天学到了什么吧。");
  };

  const chooseReflection = (choice: ReflectionChoice) => {
    setSelectedReflection(choice);
    updateSession("reflection_choice", (prev) => ({ ...prev, reflectionChoice: choice }));

    const seed = config.reflectionStickers[choice];
    const reqId = reflectionReqId.current + 1;
    reflectionReqId.current = reqId;
    setReflectionLoading(true);
    setReflectionText(null);

    void getReflection({
      islandName: config.copy.routeTitle,
      choice,
      choiceLabel: REFLECTION_CHOICE_LABELS[choice],
      stoneStep: config.stone.step,
      towerStep: config.towerStep,
      truthDetectorSuccess: session.truthDetectorSuccess,
      seed
    }).then((result) => {
      // 只采用最后一次点击的结果，避免快速换贴纸时旧请求覆盖新文案。
      if (reflectionReqId.current !== reqId) return;
      setReflectionText(result.text);
      setReflectionLoading(false);
      logEvent("reflection_ai_loaded");
      trackEvent("reflection_ai_source", { levelId: config.levelId, choice, source: result.source });
    });
  };

  const completeAdventure = () => {
    // 首次完成本岛探险才并入主进度（默默加经验/金币），重玩不再重复发放。
    const alreadyCompleted = readAdventureProgress().completedIslands.includes(config.islandId);
    markIslandCompleted(config.islandId);
    if (!alreadyCompleted) {
      const student = readStudent();
      const progress = readProgress();
      saveStudentAndProgress(student, {
        ...progress,
        exp: progress.exp + config.reward.exp,
        coins: progress.coins + config.reward.coins
      });
      logEvent("adventure_reward_granted");
    }
    updateSession("complete_adventure", (prev) => ({ ...prev, completed: true, stage: "complete" }));
  };

  const resetAdventure = () => {
    setSession(initialAdventureSession);
    setNotice("Nova 正陪你一起探险。");
    setAnswerFeedback("");
    setHelpStep("menu");
    setHelpFeedback("");
    setSelectedReflection(null);
    setReflectionText(null);
    setReflectionLoading(false);
    reflectionReqId.current += 1; // 丢弃任何在途的复盘请求
    logEvent("reset_adventure", initialAdventureSession);
  };

  const jumpNumbers = [...config.stone.sequence, String(config.stone.answer)];
  const jumpHighlight = String(config.stone.answer);
  const isMakeTen = config.kind === "make-ten";
  // 复盘贴纸标签：关卡可覆写（森林岛走“我会凑成10”等），否则用默认。
  const stickerLabel = (choice: ReflectionChoice, fallback: string) =>
    config.reflectionStickerLabels?.[choice] ?? fallback;
  // Nova 求助 L1：make-ten 关卡提供 l1 文案时改为“引导卡”，否则走默认的 +step 规律选择器。
  const helpL1AsGuidance = Boolean(session.currentQuestion === "stone" ? config.help?.l1Stone : config.help?.l1Tower);
  const helpL1Title = session.currentQuestion === "stone" ? config.help?.l1TitleStone : config.help?.l1TitleTower;

  // 该关主题渐变写进 CSS 变量，供 sceneStyle / StageFrame 在缺图时统一引用。
  const rootStyle = config.fallbackScene
    ? ({ "--scene-bg": config.fallbackScene } as CSSProperties)
    : undefined;

  return (
    <main className="min-h-screen bg-[#070b2c] bg-[radial-gradient(circle_at_top,#2736a4,#10194f_55%,#070b2c)] p-3 text-white sm:p-5 lg:p-6" style={rootStyle}>
      <section className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1440px] grid-cols-1 grid-rows-[auto_1fr] gap-4 lg:min-h-[calc(100vh-48px)]">
        <header className="grid gap-3 rounded-[28px] border border-cyan-300/25 bg-[#101957]/85 p-3 shadow-[0_0_34px_rgba(71,150,255,0.24)] backdrop-blur-xl sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 text-sm font-black text-cyan-50 transition hover:bg-cyan-300/18 active:scale-95" href="/adventure">
            ← 返回地图
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-black tracking-wide text-white sm:text-2xl">{config.copy.routeTitle}</h1>
            <p className="mt-1 text-xs font-black text-amber-200">{stageTitle}</p>
          </div>
          <button
            aria-label="真相探测器"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/35 bg-blue-950/55 px-4 text-sm font-black text-cyan-50 transition hover:bg-cyan-300/12 active:scale-95"
            data-testid="truth-detector"
            onClick={openTruthDetector}
            type="button"
          >
            🔍 真相探测器
          </button>
        </header>

        <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <section key={session.stage} className={`scene-in relative w-full min-w-0 overflow-hidden rounded-[32px] border border-cyan-300/30 bg-[#101957]/90 shadow-[0_0_40px_rgba(71,150,255,0.35)] lg:aspect-[16/9] lg:min-h-[620px] ${["map_intro", "beach_observe", "island_jump", "truth_moment", "stone_question", "reflection", "complete"].includes(session.stage) ? "" : "min-h-[520px]"} ${session.stage === "complete" ? "self-start" : ""}`}>
            {renderStage()}
          </section>

          <aside className="self-start rounded-[32px] border border-cyan-300/25 bg-[#101957]/80 p-4 shadow-[0_0_34px_rgba(71,150,255,0.22)] backdrop-blur-xl lg:flex lg:flex-col lg:gap-4 lg:p-5">
            <div className="flex items-start gap-3 lg:contents">
              <div className="shrink-0 overflow-hidden rounded-[22px] border border-cyan-300/20 bg-blue-950/45 p-2 shadow-[inset_0_0_30px_rgba(34,211,238,0.08)] lg:rounded-[28px] lg:p-4">
                <div className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.24),rgba(15,23,80,0.78)_58%,rgba(8,13,48,0.96))] shadow-[inset_0_0_45px_rgba(34,211,238,0.18),0_0_30px_rgba(34,211,238,0.12)] lg:mx-auto lg:h-52 lg:w-full lg:max-w-[280px] lg:rounded-[28px]">
                  <div
                    aria-label="Nova"
                    className="nova-float absolute inset-0 bg-contain bg-center bg-no-repeat drop-shadow-[0_0_18px_rgba(103,232,249,0.38)] [mask-image:radial-gradient(ellipse_at_center,black_58%,transparent_78%)]"
                    style={{ backgroundImage: `url(${novaAsset})` }}
                  />
                  <div className="pointer-events-none absolute bottom-2 h-10 w-32 rounded-[50%] bg-cyan-200/24 blur-md" />
                  <div className="pointer-events-none absolute inset-x-6 bottom-0 h-12 rounded-[50%] border border-cyan-200/15 bg-blue-950/30" />
                </div>
                <h2 className="mt-2 text-center text-sm font-black text-cyan-50 lg:mt-4 lg:text-2xl">Nova</h2>
                <p className="mt-3 hidden rounded-[22px] border border-cyan-300/20 bg-blue-950/65 p-3 text-sm font-bold leading-6 text-cyan-50 lg:block">{novaLine}</p>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-2 lg:contents">
                <p className="rounded-[16px] border border-cyan-300/20 bg-blue-950/65 p-2 text-xs font-bold leading-5 text-cyan-50 lg:hidden">{novaLine}</p>
                <div className="rounded-[18px] border border-amber-200/25 bg-amber-300/10 p-3 shadow-[0_0_22px_rgba(252,211,77,0.08)] lg:rounded-[24px] lg:p-4">
                  <p className="text-xs font-black tracking-[0.18em] text-amber-200">⭐ 当前目标</p>
                  <p className="mt-1 text-sm font-black text-white lg:mt-2 lg:text-lg">{currentGoal}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-3">
                  <div className="rounded-[18px] border border-amber-200/30 bg-blue-950/55 p-3 text-center text-xs font-black text-amber-200 lg:rounded-[24px] lg:p-4 lg:text-sm">
                    灵感星<br />
                    <span className="mt-1 inline-block text-sm lg:mt-2 lg:text-xl">{session.inspirationStars > 0 ? "⭐".repeat(session.inspirationStars) : "今天用完啦"}</span>
                  </div>
                  <button className="rounded-[18px] border border-violet-300/30 bg-violet-500/20 p-3 text-xs font-black text-violet-50 transition hover:bg-violet-400/25 active:scale-95 lg:rounded-[24px] lg:p-4 lg:text-sm" onClick={askNova} type="button">
                    ？问 Nova
                  </button>
                </div>
              </div>
            </div>

            {notice && <div className="mt-3 rounded-[24px] border border-cyan-300/20 bg-blue-950/45 p-3 text-sm font-bold leading-6 text-cyan-100 lg:mt-0">{notice}</div>}
          </aside>
        </div>
      </section>

      <style jsx global>{`
        @keyframes novaFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes sceneIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sparkPop { 0% { opacity: 0; transform: scale(0.6); } 30% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: translateY(-12px) scale(0.8); } }
        @keyframes thinkPulse { 0%, 100% { opacity: 0.35; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.15); } }
        .nova-float { animation: novaFloat 4.5s ease-in-out infinite; }
        .scene-in { animation: sceneIn 0.45s ease-out both; }
        .spark { animation: sparkPop 1.8s ease-out infinite; }
        .nova-think-dot { display: inline-block; width: 9px; height: 9px; border-radius: 9999px; background: rgba(252,211,77,0.9); box-shadow: 0 0 10px rgba(252,211,77,0.6); animation: thinkPulse 1.1s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .nova-float, .scene-in, .spark, .nova-think-dot { animation: none; }
        }
      `}</style>
    </main>
  );

  function renderStage() {
    switch (session.stage) {
      case "map_intro":
        return (
          <div className="flex h-full flex-col lg:block lg:h-full">
            <div className="relative aspect-[16/9] w-full bg-cover bg-center lg:absolute lg:inset-0 lg:aspect-auto lg:h-full" style={sceneStyle(config.assets.map)}>
              <div className="absolute -bottom-4 right-3 z-20 rounded-[18px] border border-cyan-200/25 bg-blue-950/58 px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.16)] backdrop-blur-md">
                <p className="text-[10px] font-black tracking-[0.18em] text-cyan-200">{config.copy.mapEyebrow}</p>
                <h2 className="mt-0.5 text-base font-black text-white drop-shadow-[0_0_18px_rgba(103,232,249,0.38)]">{config.copy.mapTitle}</h2>
              </div>
              <span className="absolute right-[8%] top-[9%] z-20 rounded-full border border-amber-200/40 bg-blue-950/60 px-3 py-1 text-xs font-black text-amber-100 shadow-[0_0_22px_rgba(252,211,77,0.24)] sm:px-4 sm:py-2 sm:text-sm lg:right-[13%] lg:top-[8%]">NEW</span>
              <button
                aria-label="去看看新岛"
                className="absolute right-[6%] top-[16%] h-20 w-24 rounded-full border border-amber-200/45 bg-amber-300/10 shadow-[0_0_46px_rgba(252,211,77,0.48)] ring-4 ring-amber-200/15 transition hover:scale-105 hover:bg-amber-300/18 focus:outline-none focus:ring-4 focus:ring-amber-200/60 active:scale-95 lg:right-[10%] lg:top-[12%] lg:h-36 lg:w-44"
                onClick={() => goStage("beach_observe", "go_new_island")}
                type="button"
              />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-4 text-center lg:absolute lg:inset-x-0 lg:bottom-8 lg:flex-row lg:items-center lg:justify-center lg:gap-3 lg:px-8 lg:p-0">
              <GameButton dataTestId="multiples-start" onClick={() => goStage("beach_observe", "go_new_island")}>{config.copy.mapButton}</GameButton>
            </div>
          </div>
        );

      case "beach_observe":
        return (
          <div className="flex h-full flex-col lg:block lg:h-full">
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-cover bg-center lg:absolute lg:inset-0 lg:aspect-auto lg:h-full" style={sceneStyle(config.assets.beach)}>
              <SeaGlow />
              <div className="absolute left-4 top-4 z-20 rounded-[22px] border border-cyan-200/25 bg-blue-950/58 px-4 py-3 shadow-[0_0_24px_rgba(34,211,238,0.16)] backdrop-blur-md sm:left-6 sm:top-6">
                <p className="text-xs font-black tracking-[0.2em] text-cyan-200">{config.copy.observeEyebrow}</p>
                <h2 className="mt-1 text-xl font-black text-white drop-shadow-[0_0_18px_rgba(103,232,249,0.38)] lg:text-2xl">{config.copy.observeTitle}</h2>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center gap-3 p-4 lg:absolute lg:inset-x-[7%] lg:bottom-[17%] lg:flex-none lg:items-end lg:justify-center lg:gap-4 lg:p-0 xl:gap-5">
              {isMakeTen && config.makeTen ? (
                <div className="flex max-w-[300px] flex-wrap items-center justify-center gap-2 sm:max-w-none">
                  {Array.from({ length: config.makeTen.have }).map((_, i) => (
                    <span className="h-9 w-9 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.7)] ring-2 ring-amber-100/60 lg:h-11 lg:w-11" key={`fruit-${i}`} />
                  ))}
                </div>
              ) : (
                config.stone.sequence.map((num) => (
                  <StoneButton key={num} onClick={() => setNotice("它轻轻亮了一下。")}>{num}</StoneButton>
                ))
              )}
              <button className="relative flex h-16 w-20 items-center justify-center rounded-full border border-amber-100/35 bg-amber-300/18 text-3xl font-black text-white shadow-[0_0_30px_rgba(252,211,77,0.5)] ring-4 ring-amber-200/35 backdrop-blur-[1px] transition hover:scale-105 active:scale-95" data-testid="stone-mystery" onClick={() => goStage("stone_question", "open_stone_question")} type="button">
                ?
              </button>
            </div>
          </div>
        );

      case "stone_question":
        return (
          <div className="flex h-full flex-col lg:block lg:h-full">
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-cover bg-center lg:absolute lg:inset-0 lg:aspect-auto lg:h-full" style={sceneStyle(config.assets.stoneQuestion)}>
              <SeaGlow />
              <div className="absolute left-4 top-4 z-20 rounded-[22px] border border-cyan-200/25 bg-blue-950/58 px-4 py-3 shadow-[0_0_24px_rgba(34,211,238,0.16)] backdrop-blur-md sm:left-6 sm:top-6">
                <p className="text-xs font-black tracking-[0.2em] text-cyan-200">{config.copy.stoneEyebrow}</p>
                <h2 className="mt-1 text-xl font-black text-white drop-shadow-[0_0_18px_rgba(103,232,249,0.38)] lg:text-2xl">{config.copy.stoneTitle}</h2>
              </div>
            </div>
            <div className="mx-4 mt-4 max-w-3xl rounded-[30px] border border-cyan-300/25 bg-blue-950/56 p-4 shadow-[0_0_26px_rgba(34,211,238,0.14)] backdrop-blur-sm lg:absolute lg:left-1/2 lg:top-[28%] lg:mx-0 lg:mt-0 lg:w-[min(680px,82%)] lg:-translate-x-1/2">
              {isMakeTen && config.makeTen ? (
                <MakeTenView have={config.makeTen.have} need={Number(config.stone.answer)} target={config.makeTen.target} />
              ) : (
                <NumberRoad numbers={[...config.stone.sequence, "?"]} />
              )}
            </div>
            {!answerFeedback && (
              <div className="mt-5 flex flex-wrap justify-center gap-5 p-2 lg:absolute lg:bottom-[20%] lg:left-1/2 lg:mt-0 lg:p-0 lg:-translate-x-1/2">
                <OptionGrid options={config.stone.options} testPrefix="stone-answer" onChoose={answerStone} small />
              </div>
            )}
            {answerFeedback && (
              <p className="mx-4 mt-4 rounded-[26px] border border-amber-200/35 bg-blue-950/78 p-4 text-center text-base font-black leading-7 text-amber-100 shadow-[0_0_24px_rgba(252,211,77,0.16)] backdrop-blur-md lg:absolute lg:bottom-[20%] lg:left-1/2 lg:mx-0 lg:mt-0 lg:w-[min(760px,82%)] lg:-translate-x-1/2">
                {answerFeedback}
              </p>
            )}
            {(answerFeedback === config.feedback?.stoneCorrect || answerFeedback.startsWith("哇")) && (
              <div className="flex justify-center p-4 lg:absolute lg:bottom-[8%] lg:left-1/2 lg:p-0 lg:-translate-x-1/2">
                <GameButton onClick={() => goStage("island_jump", "stone_to_island_jump")}>继续</GameButton>
              </div>
            )}
          </div>
        );

      case "help_menu":
        return (
          <StageFrame title="你想怎么问 Nova？" eyebrow="Nova 小帮手">
            <div className="mx-auto mt-16 w-full max-w-3xl rounded-[32px] border border-cyan-300/25 bg-blue-950/70 p-6 shadow-[0_0_34px_rgba(103,232,249,0.12)]">
              {helpStep === "menu" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <SoftButton onClick={returnToQuestion}>我已经想到了</SoftButton>
                  <SoftButton onClick={startL1}>{config.help?.menuL1Label ?? "我看到一些规律"}</SoftButton>
                  <SoftButton onClick={startL2}>我完全不懂</SoftButton>
                  <SoftButton onClick={confirmL3}>请直接告诉我</SoftButton>
                </div>
              )}
              {helpStep === "l1" && (
                helpL1AsGuidance ? (
                  <div className="grid gap-4">
                    {helpL1Title && <p className="text-center text-xl font-black text-cyan-50">{helpL1Title}</p>}
                    <HelpCard text={helpFeedback} />
                    <GameButton onClick={returnToQuestion}>{config.copy.helpReturnLabel ?? "回到数字路"}</GameButton>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <p className="text-center text-xl font-black text-cyan-50">你看到的规律像哪一个？</p>
                    <div className="grid grid-cols-3 gap-3">
                      {stepOptions.map((s) => (
                        <SoftButton key={s} onClick={() => chooseL1Pattern(s)}>+{s}</SoftButton>
                      ))}
                      <SoftButton onClick={() => chooseL1Pattern("other")}>其他</SoftButton>
                    </div>
                    {helpFeedback && <HelpCard text={helpFeedback} />}
                    {helpFeedback && <GameButton onClick={returnToQuestion}>{config.copy.helpReturnLabel ?? "回到数字路"}</GameButton>}
                  </div>
                )
              )}
              {(helpStep === "l2" || helpStep === "l3_answer") && (
                <div className="grid gap-4">
                  {(helpStep === "l3_answer" ? config.help?.l3Title : config.help?.l2Title) && (
                    <p className="text-center text-xl font-black text-cyan-50">{helpStep === "l3_answer" ? config.help?.l3Title : config.help?.l2Title}</p>
                  )}
                  <HelpCard text={helpFeedback} />
                  <GameButton onClick={returnToQuestion}>{config.copy.helpReturnLabel ?? "回到数字路"}</GameButton>
                </div>
              )}
              {helpStep === "l3_confirm" && (
                <div className="grid gap-4 rounded-[28px] border border-amber-200/35 bg-amber-300/10 p-5 text-center">
                  <p className="text-xl font-black text-amber-100">直接告诉会用掉1颗灵感星，确定吗？</p>
                  <div className="grid grid-cols-2 gap-3">
                    <SoftButton onClick={useInspirationStar}>确定</SoftButton>
                    <SoftButton onClick={() => setHelpStep("menu")}>我再想想</SoftButton>
                  </div>
                </div>
              )}
            </div>
          </StageFrame>
        );

      case "island_jump":
        return (
          <div className="flex h-full flex-col lg:block lg:h-full">
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-cover bg-center lg:absolute lg:inset-0 lg:aspect-auto lg:h-full" style={sceneStyle(config.assets.islandVictory)}>
              <SeaGlow />
              <Celebrate />
              <div className="absolute left-4 top-4 z-20 rounded-[22px] border border-cyan-200/25 bg-blue-950/58 px-4 py-3 shadow-[0_0_24px_rgba(34,211,238,0.16)] backdrop-blur-md sm:left-6 sm:top-6">
                <p className="text-xs font-black tracking-[0.2em] text-cyan-200">{config.copy.jumpEyebrow}</p>
                <h2 className="mt-1 text-xl font-black text-white drop-shadow-[0_0_18px_rgba(103,232,249,0.38)] lg:text-2xl">{config.copy.jumpTitle}</h2>
              </div>
            </div>
            {isMakeTen && config.makeTen ? (
              <div className="flex flex-1 items-center justify-center p-3 lg:absolute lg:inset-x-0 lg:bottom-[22%] lg:flex-none lg:justify-center lg:p-0">
                <MakeTenView have={config.makeTen.have} need={Number(config.stone.answer)} target={config.makeTen.target} solved />
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center gap-3 p-3 text-xl font-black lg:absolute lg:bottom-[24%] lg:left-[11%] lg:right-[28%] lg:flex-none lg:justify-between lg:p-0">
                {jumpNumbers.map((num, index) => (
                  <span className={`animate-pulse rounded-full px-3 py-2 text-base shadow-[0_0_24px_rgba(252,211,77,0.55)] sm:px-4 sm:py-3 sm:text-xl ${num === jumpHighlight ? "bg-amber-300 text-slate-950 ring-4 ring-amber-100/60" : "bg-blue-950/72 text-cyan-50 ring-2 ring-cyan-200/25"}`} key={`${num}-${index}`} style={{ animationDelay: `${index * 120}ms` }}>
                    {num}
                  </span>
                ))}
              </div>
            )}
            <div className="flex justify-center pb-4 lg:absolute lg:bottom-7 lg:left-1/2 lg:pb-0 lg:-translate-x-1/2">
              <GameButton dataTestId="island-enter" onClick={() => updateSession("enter_island", (prev) => ({ ...prev, stage: "tower_question", currentQuestion: "tower" }))}>{config.copy.jumpButton ?? "登上新岛"}</GameButton>
            </div>
          </div>
        );

      case "tower_question": {
        const towerStep = config.towerSteps[session.towerStep];
        const towerCorrect =
          answerFeedback === config.feedback?.towerCorrectAll ||
          answerFeedback === config.feedback?.towerCorrectStep ||
          answerFeedback.startsWith("塔亮") ||
          answerFeedback.startsWith("第");
        const litSegments = session.towerStep + (towerCorrect ? 1 : 0);
        // make-ten 不分段，去掉“第X段/共Y段”后缀，避免数字路语义混进森林岛。
        const towerTitle = isMakeTen
          ? config.copy.towerTitlePrefix
          : `${config.copy.towerTitlePrefix}（第${session.towerStep + 1}段 / 共${config.towerSteps.length}段）`;
        return (
          <QuestionStage asset={config.assets.tower} continueLabel={config.copy.towerContinue} eyebrow={config.copy.towerEyebrow ?? "数字路机关"} title={towerTitle} feedback={answerFeedback} showContinue={towerCorrect} onContinue={advanceTower}>
            {isMakeTen ? (
              <>
                <div className="absolute left-1/2 top-[33%] z-20 -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-emerald-200/45 bg-blue-950/70 px-5 py-3 text-center shadow-[0_0_24px_rgba(110,231,183,0.26)] backdrop-blur-sm lg:top-[44%] lg:rounded-[30px] lg:px-9 lg:py-6">
                  <p className="text-xs font-black tracking-[0.2em] text-emerald-200 lg:text-base">目标</p>
                  <p className="mt-1 whitespace-nowrap text-xl font-black text-white lg:mt-2 lg:text-[2.6rem] lg:leading-tight">凑成 {config.pairTarget ?? config.towerStep} 颗能量果</p>
                </div>
                {!towerCorrect && (
                  <div className="absolute bottom-[11%] left-1/2 flex w-[min(720px,92%)] -translate-x-1/2 flex-wrap justify-center gap-3 lg:gap-4">
                    <OptionGrid options={towerStep.options} testPrefix="tower-answer" onChoose={answerTower} />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="absolute left-1/2 top-[14px] z-20 flex -translate-x-1/2 gap-2 lg:top-[6%]">
                  {config.towerSteps.map((_, i) => (
                    <span className={`h-2.5 w-8 rounded-full transition ${i < litSegments ? "bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.7)]" : "bg-blue-950/60 ring-1 ring-cyan-200/25"}`} key={i} />
                  ))}
                </div>
                <div className="absolute left-1/2 top-[90px] -translate-x-1/2 flex flex-col items-center gap-[6px] lg:top-[17%]">
                  {[...towerStep.sequence, "?"].map((num, index) => (
                    <span className="flex h-[64px] w-[64px] items-center justify-center rounded-full border border-cyan-200/40 bg-blue-950/65 text-[26px] font-black text-white shadow-[0_0_16px_rgba(34,211,238,0.38)] lg:h-[70px] lg:w-[70px] lg:text-[31px]" key={`${num}-${index}`}>{num}</span>
                  ))}
                </div>
                {!towerCorrect && (
                  <div className="mt-[370px] flex flex-wrap justify-center gap-3 lg:absolute lg:bottom-[9%] lg:left-1/2 lg:mt-0 lg:-translate-x-1/2 lg:gap-4">
                    <OptionGrid options={towerStep.options} testPrefix="tower-answer" onChoose={answerTower} small />
                  </div>
                )}
              </>
            )}
          </QuestionStage>
        );
      }

      case "truth_moment":
        return (
          <div className="flex h-full flex-col lg:block lg:h-full">
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-cover bg-center lg:absolute lg:inset-0 lg:aspect-auto lg:h-full" style={sceneStyle(config.assets.truth)}>
              <div className="absolute left-4 top-4 z-20 rounded-[22px] border border-cyan-200/25 bg-blue-950/58 px-4 py-3 shadow-[0_0_24px_rgba(34,211,238,0.16)] backdrop-blur-md sm:left-6 sm:top-6">
                <p className="text-xs font-black tracking-[0.2em] text-cyan-200">{config.copy.truthEyebrow}</p>
                <h2 className="mt-1 text-xl font-black text-white drop-shadow-[0_0_18px_rgba(103,232,249,0.38)] lg:text-2xl">{config.copy.truthTitle}</h2>
              </div>
            </div>
            <p className="mx-4 mt-4 rounded-[30px] border border-cyan-200/25 bg-blue-950/72 p-4 text-center text-lg font-black leading-8 text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.12)] backdrop-blur-md lg:absolute lg:bottom-[28%] lg:left-1/2 lg:mx-0 lg:mt-0 lg:w-[min(720px,84%)] lg:-translate-x-1/2 lg:p-5 lg:text-2xl lg:leading-9">
              {config.truthStatement}
            </p>
            <div className="flex justify-center p-4 lg:absolute lg:bottom-7 lg:left-1/2 lg:p-0 lg:-translate-x-1/2">
              <GameButton onClick={() => goStage("reflection", "skip_truth_detector")}>继续看看今天学到了什么</GameButton>
            </div>
          </div>
        );

      case "truth_question":
        return (
          <StageFrame asset={config.assets.truth} title="真相探测器启动！" eyebrow="你觉得 Nova 哪里说得不对？">
            <div className="mx-auto mt-16 grid max-w-3xl gap-4 rounded-[34px] border border-cyan-300/25 bg-blue-950/70 p-6 shadow-[0_0_44px_rgba(103,232,249,0.18)] backdrop-blur-md">
              <div className="mx-auto flex h-28 w-28 animate-pulse items-center justify-center rounded-full bg-amber-300 text-6xl text-slate-950 shadow-[0_0_42px_rgba(252,211,77,0.65)]">🔍</div>
              <SoftButton dataTestId="truth-answer-a" onClick={() => chooseTruth("a")}>{config.feedback?.truthOptionA ?? <>A 数字路不一定每次加{config.stone.step}</>}</SoftButton>
              <SoftButton onClick={() => chooseTruth("b")}>B 我相信 Nova</SoftButton>
              <SoftButton onClick={() => chooseTruth("c")}>C 让我再想想</SoftButton>
            </div>
          </StageFrame>
        );

      case "reflection":
        return (
          <div className="flex h-full flex-col lg:block lg:h-full">
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-cover bg-center lg:absolute lg:inset-0 lg:aspect-auto lg:h-full" style={sceneStyle(config.assets.notebook)}>
              <div className="absolute left-4 top-4 z-20 rounded-[22px] border border-cyan-200/25 bg-blue-950/58 px-4 py-3 shadow-[0_0_24px_rgba(34,211,238,0.16)] backdrop-blur-md sm:left-6 sm:top-6">
                <p className="text-xs font-black tracking-[0.2em] text-cyan-200">{config.copy.reflectionEyebrow}</p>
                <h2 className="mt-1 text-xl font-black text-white drop-shadow-[0_0_18px_rgba(103,232,249,0.38)] lg:text-2xl">{config.copy.reflectionTitle}</h2>
              </div>
            </div>
            <div className="mx-auto w-full max-w-5xl p-4 lg:absolute lg:inset-x-[4%] lg:top-[17%] lg:bottom-[4%] lg:p-0">
              <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                <div className="grid self-start gap-3 rounded-[28px] border border-amber-200/25 bg-blue-950/45 p-3 shadow-[0_0_24px_rgba(252,211,77,0.12)] backdrop-blur-sm">
                  <StickerButton dataTestId="reflection-pattern" onClick={() => chooseReflection("pattern")}>{stickerLabel("pattern", "🔢 找规律")}</StickerButton>
                  <StickerButton onClick={() => chooseReflection("ask_nova")}>{stickerLabel("ask_nova", "🤔 问 Nova")}</StickerButton>
                  <StickerButton onClick={() => chooseReflection("island_light")}>{stickerLabel("island_light", "✨ 点亮新岛")}</StickerButton>
                  {session.truthDetectorSuccess && <StickerButton onClick={() => chooseReflection("not_blind_trust")}>{stickerLabel("not_blind_trust", "🔍 不全信 Nova")}</StickerButton>}
                </div>
                <div className="min-h-48 rounded-[34px] border border-amber-200/30 bg-[linear-gradient(135deg,rgba(255,245,210,0.14),rgba(30,41,124,0.34))] p-6 shadow-[0_0_40px_rgba(252,211,77,0.14)] backdrop-blur-[2px] lg:min-h-0">
                  {selectedReflection ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="rotate-[-6deg] rounded-[30px] border border-amber-200/45 bg-amber-100/18 px-8 py-5 text-7xl shadow-[0_0_32px_rgba(252,211,77,0.24)]">⭐</div>
                      <p className="mt-5 max-w-xl rounded-[24px] border border-amber-100/25 bg-blue-950/45 p-4 text-lg font-black leading-8 text-amber-100" data-testid="reflection-text">
                        {reflectionLoading || !reflectionText ? (
                          <span className="inline-flex items-center gap-2 text-amber-100/80">
                            <span className="nova-think-dot" aria-hidden />
                            Nova 正在把今天的发现写进笔记…
                          </span>
                        ) : (
                          reflectionText
                        )}
                      </p>
                      <GameButton dataTestId="complete-button" onClick={completeAdventure}>完成今天的探险</GameButton>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center text-xl font-black text-cyan-100">选一张贴纸，贴进探险笔记。</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "complete":
        return (
          <div className="flex h-full flex-col lg:block lg:h-full">
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-cover bg-center lg:absolute lg:inset-0 lg:aspect-auto lg:h-full" style={sceneStyle(config.assets.complete)}>
              <Celebrate />
              <div className="absolute inset-y-0 left-[6%] z-20 flex w-[44%] flex-col items-center justify-center text-center">
                <p className="text-xs font-black tracking-[0.2em] text-cyan-200 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">{config.copy.completeEyebrow}</p>
                <h2 className="mt-2 text-xl font-black text-white drop-shadow-[0_0_18px_rgba(103,232,249,0.6)] lg:text-2xl">{config.copy.completeTitle}</h2>
              </div>
            </div>
            <div className="mx-auto w-full max-w-5xl p-4 lg:absolute lg:inset-x-[4%] lg:top-[17%] lg:bottom-[4%] lg:p-0">
              <div className="grid grid-cols-[2fr_3fr] gap-3 lg:grid-cols-[320px_1fr] lg:gap-5">
                <div className="relative flex flex-col items-center justify-center gap-2 rounded-[24px] border border-amber-200/30 bg-blue-950/42 p-3 pb-4 text-center shadow-[0_0_24px_rgba(252,211,77,0.14)] backdrop-blur-sm lg:rounded-[34px] lg:p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(252,211,77,0.22),transparent_42%)]" />
                  <div className="relative flex w-[80%] aspect-square items-center justify-center rounded-full border border-amber-200/35 bg-amber-300/12 text-[88px] shadow-[0_0_20px_rgba(252,211,77,0.22)] lg:text-[140px]">🏅</div>
                  <p className="relative text-base font-black text-amber-100 lg:rounded-full lg:bg-blue-950/50 lg:px-5 lg:py-2 lg:text-lg">今日探险纪念</p>
                </div>
                <div className="rounded-[34px] border border-cyan-300/25 bg-blue-950/62 p-4 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-md">
                  <div className="grid gap-2">
                    <ResultLine label={config.copy.islandResultLabel ?? "新岛屿"} value="已点亮" />
                    <ResultLine label={config.copy.firstChallengeLabel} value={config.copy.firstChallengeValue ?? "已发现"} />
                    <ResultLine label={config.copy.secondChallengeLabel} value={config.copy.secondChallengeValue ?? "已点亮"} />
                    <ResultLine label="真相探测器" value={session.truthDetectorSuccess ? "已识破" : session.truthDetectorOpened ? "已尝试" : "下次再试"} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Link className="inline-flex h-9 items-center justify-center rounded-[16px] border border-cyan-200/35 bg-cyan-300/20 px-2 text-xs font-black text-cyan-50 transition active:scale-95 lg:h-10 lg:rounded-[18px] lg:px-4 lg:text-sm" href="/adventure">回到地图</Link>
                    <button className="inline-flex h-9 items-center justify-center rounded-[16px] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-2 text-xs font-black text-slate-950 shadow-[0_0_20px_rgba(252,211,77,0.4)] transition active:scale-95 lg:h-10 lg:rounded-[18px] lg:px-4 lg:text-sm" data-testid="reset-multiples" onClick={resetAdventure} type="button">再玩一次</button>
                    <Link className="col-span-2 inline-flex h-9 items-center justify-center rounded-[16px] border border-violet-200/35 bg-violet-400/25 px-2 text-xs font-black text-violet-50 transition active:scale-95 lg:col-span-1 lg:h-10 lg:rounded-[18px] lg:px-4 lg:text-sm" href="/report">查看星星报告</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  }
}

function StageFrame({ asset, children, eyebrow, title }: { asset?: string; children: ReactNode; eyebrow: string; title: string }) {
  const style: CSSProperties = asset
    ? { backgroundImage: `linear-gradient(rgba(7,11,44,0.16), rgba(7,11,44,0.42)), url(${asset})` }
    : { background: SCENE_BG_VAR };

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden bg-cover bg-center p-4 sm:p-5 lg:min-h-[620px] lg:p-6" style={style}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.22)_1px,transparent_2px)] bg-[size:34px_34px] opacity-25" />
      <div className="pointer-events-none absolute -left-20 top-20 h-56 w-56 rounded-full bg-cyan-300/18 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-64 w-64 rounded-full bg-violet-500/18 blur-3xl" />
      <div className="absolute left-4 top-4 z-20 rounded-[22px] border border-cyan-200/25 bg-blue-950/58 px-4 py-3 shadow-[0_0_24px_rgba(34,211,238,0.16)] backdrop-blur-md sm:left-6 sm:top-6">
        <p className="text-xs font-black tracking-[0.2em] text-cyan-200">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-black text-white drop-shadow-[0_0_18px_rgba(103,232,249,0.38)] lg:text-2xl">{title}</h2>
      </div>
      <div className="relative z-10 h-full min-h-[490px] pt-20 lg:min-h-[590px]">{children}</div>
    </div>
  );
}

function QuestionStage({ asset, children, continueLabel, eyebrow = "数字路机关", feedback, onContinue, showContinue, title }: { asset?: string; children: ReactNode; continueLabel?: string; eyebrow?: string; feedback: string; onContinue: () => void; showContinue: boolean; title: string }) {
  return (
    <StageFrame asset={asset} eyebrow={eyebrow} title={title}>
      {children}
      {feedback && <div className="absolute bottom-[19%] left-1/2 w-[min(760px,82%)] -translate-x-1/2 rounded-[26px] border border-amber-200/35 bg-blue-950/78 p-4 text-center text-base font-black leading-7 text-amber-100 shadow-[0_0_24px_rgba(252,211,77,0.16)] backdrop-blur-md">{feedback}</div>}
      {showContinue && <div className="absolute bottom-[8%] left-1/2 flex -translate-x-1/2 justify-center"><GameButton onClick={onContinue}>{continueLabel ?? "继续"}</GameButton></div>}
    </StageFrame>
  );
}

function GameButton({ children, dataTestId, onClick }: { children: ReactNode; dataTestId?: string; onClick: () => void }) {
  return (
    <button className="inline-flex min-h-12 min-w-56 items-center justify-center rounded-[24px] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-6 text-base font-black text-slate-950 shadow-[0_0_26px_rgba(252,211,77,0.4)] transition hover:shadow-[0_0_34px_rgba(252,211,77,0.62)] focus:outline-none focus:ring-4 focus:ring-amber-200/50 active:scale-95" data-testid={dataTestId} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function SoftButton({ children, dataTestId, onClick }: { children: ReactNode; dataTestId?: string; onClick: () => void }) {
  return (
    <button className="rounded-[24px] border border-cyan-300/25 bg-blue-950/64 px-5 py-4 text-base font-black text-cyan-50 shadow-md transition hover:bg-cyan-300/12 focus:outline-none focus:ring-4 focus:ring-amber-200/40 active:scale-95" data-testid={dataTestId} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function StickerButton({ children, dataTestId, onClick }: { children: ReactNode; dataTestId?: string; onClick: () => void }) {
  return (
    <button className="rotate-[-2deg] rounded-[20px] border border-amber-200/40 bg-gradient-to-br from-amber-100/18 to-violet-700/42 px-4 py-3 text-left text-sm font-black text-amber-50 shadow-[0_0_18px_rgba(252,211,77,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(252,211,77,0.24)] focus:outline-none focus:ring-4 focus:ring-amber-200/40 active:scale-95 even:rotate-[2deg]" data-testid={dataTestId} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function HelpCard({ text }: { text: string }) {
  return <div className="rounded-[24px] border border-cyan-300/25 bg-cyan-300/10 p-4 text-base font-black leading-7 text-cyan-50">{text}</div>;
}

function NumberRoad({ numbers }: { numbers: string[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      {numbers.map((num, index) => (
        <span className="flex items-center gap-3" key={`${num}-${index}`}>
          <span className="rounded-full border border-cyan-200/35 bg-blue-950/78 px-5 py-3 text-2xl font-black text-cyan-50 shadow-[0_0_18px_rgba(103,232,249,0.2)]">{num}</span>
          {index < numbers.length - 1 && <span className="text-2xl font-black text-cyan-200/80">→</span>}
        </span>
      ))}
    </div>
  );
}

// 凑成10题的可视化：已亮的果子（have 颗）+ 空位（target-have 个），配合 have + ? = target。
// solved=true 时空位变成发光的新果子、问号换成答案，用于 Beat 4 胜利（7 + 3 = 10）。
function MakeTenView({ have, target, need, solved }: { have: number; target: number; need: number; solved?: boolean }) {
  const gap = Math.max(0, target - have);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex max-w-[420px] flex-wrap items-center justify-center gap-2">
        {Array.from({ length: have }).map((_, i) => (
          <span className="h-7 w-7 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.7)] ring-2 ring-amber-100/60 lg:h-9 lg:w-9" key={`have-${i}`} />
        ))}
        {Array.from({ length: gap }).map((_, i) => (
          <span
            className={solved
              ? "h-7 w-7 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.75)] ring-2 ring-emerald-100/60 lg:h-9 lg:w-9"
              : "h-7 w-7 rounded-full border-2 border-dashed border-cyan-100/55 bg-blue-950/40 lg:h-9 lg:w-9"}
            key={`gap-${i}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 text-3xl font-black lg:text-4xl">
        <span className="rounded-2xl bg-amber-300/90 px-4 py-2 text-slate-950">{have}</span>
        <span className="text-cyan-200">+</span>
        <span className={solved
          ? "rounded-2xl bg-emerald-300/90 px-4 py-2 text-emerald-950"
          : "rounded-2xl border-2 border-dashed border-cyan-100/60 bg-blue-950/50 px-4 py-2 text-cyan-100"}>{solved ? need : "?"}</span>
        <span className="text-cyan-200">=</span>
        <span className="rounded-2xl bg-emerald-300/90 px-4 py-2 text-emerald-950">{target}</span>
      </div>
    </div>
  );
}

function OptionGrid({ onChoose, options, testPrefix, small }: { onChoose: (option: AnswerOption) => void; options: readonly AnswerOption[]; testPrefix: string; small?: boolean }) {
  return (
    <>
      {options.map((option) => (
        <button
          className={small
            ? "h-12 min-w-20 rounded-[20px] bg-gradient-to-br from-violet-700 via-blue-700 to-cyan-500 px-5 text-xl font-black text-white shadow-[0_0_16px_rgba(34,211,238,0.28)] ring-2 ring-cyan-200/20 transition hover:scale-105 hover:shadow-[0_0_24px_rgba(34,211,238,0.45)] focus:outline-none focus:ring-4 focus:ring-amber-200/55 active:scale-95"
            : "h-20 min-w-32 rounded-[32px] bg-gradient-to-br from-violet-700 via-blue-700 to-cyan-500 px-8 text-3xl font-black text-white shadow-[0_0_24px_rgba(34,211,238,0.28)] ring-4 ring-cyan-200/20 transition hover:scale-105 hover:shadow-[0_0_34px_rgba(34,211,238,0.45)] focus:outline-none focus:ring-4 focus:ring-amber-200/55 active:scale-95"
          }
          data-testid={`${testPrefix}-${String(option).replace(/\s+/g, "-")}`}
          key={String(option)}
          onClick={() => onChoose(option)}
          type="button"
        >
          {option}
        </button>
      ))}
    </>
  );
}

function StoneButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="flex h-16 w-20 items-center justify-center rounded-full border border-cyan-100/25 bg-cyan-300/12 text-3xl font-black text-white shadow-[0_0_24px_rgba(34,211,238,0.34)] ring-4 ring-cyan-200/18 backdrop-blur-[1px] transition hover:scale-105 hover:bg-cyan-300/20 hover:shadow-[0_0_34px_rgba(34,211,238,0.52)] focus:outline-none focus:ring-4 focus:ring-amber-200/55 active:scale-95" onClick={onClick} type="button">
      {children}
    </button>
  );
}

// 庆祝粒子：纯 CSS 星星迸发，用于"点亮新岛/完成"等高光时刻。低饱和、不喧宾夺主。
function Celebrate() {
  const stars = [
    { left: "10%", top: "20%", delay: "0ms", cls: "text-2xl" },
    { left: "26%", top: "12%", delay: "240ms", cls: "text-xl" },
    { left: "48%", top: "8%", delay: "120ms", cls: "text-3xl" },
    { left: "70%", top: "14%", delay: "360ms", cls: "text-xl" },
    { left: "86%", top: "22%", delay: "180ms", cls: "text-2xl" },
    { left: "60%", top: "26%", delay: "480ms", cls: "text-lg" }
  ];
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {stars.map((s, i) => (
        <span className={`spark absolute ${s.cls}`} key={i} style={{ left: s.left, top: s.top, animationDelay: s.delay }}>
          ✨
        </span>
      ))}
    </div>
  );
}

function SeaGlow() {
  return (
    <>
      <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-cyan-500/18 via-blue-500/10 to-transparent" />
      <div className="absolute left-[8%] right-[8%] bottom-[20%] h-16 rounded-[50%] bg-cyan-200/10 blur-xl" />
      <div className="absolute left-[20%] top-[12%] animate-pulse text-2xl">⭐</div>
      <div className="absolute right-[26%] top-[10%] text-xl">✦</div>
    </>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-1 rounded-[16px] border border-cyan-300/20 bg-gradient-to-r from-blue-950/72 to-cyan-500/12 px-2 py-1.5 text-xs font-black text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.1)] lg:gap-3 lg:rounded-[20px] lg:px-4 lg:py-2 lg:text-sm">
      <span>{label}</span>
      <span className="shrink-0 rounded-full bg-emerald-300 px-2 py-0.5 text-emerald-950 shadow-[0_0_14px_rgba(110,231,183,0.35)] lg:px-4 lg:py-1">{value}</span>
    </div>
  );
}

