"use client";

import Link from "next/link";
import { type CSSProperties, type ReactNode, useEffect, useMemo, useState } from "react";
import { multiplesSeaAssets } from "../../../lib/multiplesSeaAssets";

type MultiplesSeaStage =
  | "map_intro"
  | "beach_observe"
  | "stone_question"
  | "help_menu"
  | "island_jump"
  | "tower_question"
  | "truth_moment"
  | "truth_question"
  | "reflection"
  | "complete";

type CurrentQuestion = "stone" | "tower";
type ReflectionChoice = "pattern" | "ask_nova" | "not_blind_trust" | "island_light";

type MultiplesSeaSession = {
  stage: MultiplesSeaStage;
  currentQuestion: CurrentQuestion;
  inspirationStars: number;
  wrongAttemptsStone: number;
  wrongAttemptsTower: number;
  l1Count: number;
  l2Count: number;
  l3Count: number;
  truthDetectorOpened: boolean;
  truthDetectorSuccess: boolean;
  reflectionChoice: ReflectionChoice | null;
  completed: boolean;
};

const initialSession: MultiplesSeaSession = {
  stage: "map_intro",
  currentQuestion: "stone",
  inspirationStars: 3,
  wrongAttemptsStone: 0,
  wrongAttemptsTower: 0,
  l1Count: 0,
  l2Count: 0,
  l3Count: 0,
  truthDetectorOpened: false,
  truthDetectorSuccess: false,
  reflectionChoice: null,
  completed: false
};

const stageTitles: Record<MultiplesSeaStage, string> = {
  map_intro: "星球地图",
  beach_observe: "倍数海边",
  stone_question: "石头数字路",
  help_menu: "问问 Nova",
  island_jump: "跳向新岛",
  tower_question: "倍数塔",
  truth_moment: "Nova 的一句话",
  truth_question: "真相探测器",
  reflection: "探险笔记",
  complete: "纪念卡"
};

const reflectionStickers: Record<ReflectionChoice, string> = {
  pattern: "你今天找到了数字路的秘密：每次增加一样多，就能知道下一个数字。",
  ask_nova: "你今天学会了向 Nova 求助。先说自己看到什么，再一步一步问。",
  island_light: "你今天点亮了一座新岛！下一次还有新的地方等你发现。",
  not_blind_trust: "你今天打开了真相探测器！Nova 说错时，你能自己检查。"
};

const stageAssets: Partial<Record<MultiplesSeaStage, string>> = {
  map_intro: multiplesSeaAssets.mapBackground,
  beach_observe: multiplesSeaAssets.beachBackground,
  stone_question: multiplesSeaAssets.beachBackground,
  island_jump: multiplesSeaAssets.islandVictoryBackground,
  tower_question: multiplesSeaAssets.towerBackground,
  truth_moment: multiplesSeaAssets.truthBackground,
  truth_question: multiplesSeaAssets.truthBackground,
  reflection: multiplesSeaAssets.notebookBackground,
  complete: multiplesSeaAssets.completeBackground
};

const preloadAssets = Array.from(new Set(Object.values(multiplesSeaAssets)));

export default function MultiplesSeaPage() {
  const [session, setSession] = useState<MultiplesSeaSession>(initialSession);
  const [notice, setNotice] = useState("Nova 正陪你一起探险。");
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [helpStep, setHelpStep] = useState<"menu" | "l1" | "l2" | "l3_confirm" | "l3_answer">("menu");
  const [helpFeedback, setHelpFeedback] = useState("");
  const [selectedReflection, setSelectedReflection] = useState<ReflectionChoice | null>(null);

  useEffect(() => {
    preloadAssets.forEach((src) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = src;
    });
  }, []);

  const stageTitle = stageTitles[session.stage];
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
      ? multiplesSeaAssets.novaHappy
      : novaMood === "thinking"
        ? multiplesSeaAssets.novaThinking
        : multiplesSeaAssets.novaGuide;

  const novaLine = useMemo(() => {
    if (session.stage === "map_intro") return "倍数海好像出现了新岛屿……";
    if (session.stage === "beach_observe") return "看！算出第5块，我们就能跳过去！";
    if (session.stage === "stone_question") return "先看数字路，每次多了几个？";
    if (session.stage === "help_menu") return session.currentQuestion === "stone" ? "我们看看石头数字路。" : "我们看看塔上的数字路。";
    if (session.stage === "island_jump") return "我们成功啦！";
    if (session.stage === "tower_question") return "塔上也有一条数字路！";
    if (session.stage === "truth_moment") return "好像哪里有点怪怪的……";
    if (session.stage === "truth_question") return notice;
    if (session.stage === "reflection") return "选一张今天最喜欢的贴纸。";
    return "这次探险很漂亮。";
  }, [notice, session.currentQuestion, session.stage]);

  const currentGoal = useMemo(() => {
    if (session.stage === "map_intro") return "去看看发光的新岛屿";
    if (session.stage === "beach_observe") return "点击问号石头";
    if (session.stage === "stone_question") return "算出第5块石头";
    if (session.stage === "help_menu") return "选择一种问法";
    if (session.stage === "island_jump") return "登上新岛";
    if (session.stage === "tower_question") return "点亮倍数塔";
    if (session.stage === "truth_moment") return "听听 Nova 的话";
    if (session.stage === "truth_question") return "打开真相探测器";
    if (session.stage === "reflection") return "贴上探险贴纸";
    return "收下纪念卡";
  }, [session.stage]);

  const testRecord = {
    levelId: "multiples_sea_new_island_trial",
    wrongAttemptsStone: session.wrongAttemptsStone,
    wrongAttemptsTower: session.wrongAttemptsTower,
    l1Count: session.l1Count,
    l2Count: session.l2Count,
    l3Count: session.l3Count,
    inspirationStarsUsed: 3 - session.inspirationStars,
    truthDetectorOpened: session.truthDetectorOpened,
    truthDetectorSuccess: session.truthDetectorSuccess,
    reflectionChoice: session.reflectionChoice,
    completed: session.completed
  };

  const logEvent = (event: string, nextSession: MultiplesSeaSession = session) => {
    console.log("[multiples-sea-event]", { event, timestamp: Date.now(), session: nextSession });
  };

  const updateSession = (event: string, updater: (prev: MultiplesSeaSession) => MultiplesSeaSession) => {
    setSession((prev) => {
      const next = updater(prev);
      logEvent(event, next);
      return next;
    });
  };

  const goStage = (stage: MultiplesSeaStage, event = `stage_${stage}`) => {
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

  const answerStone = (answer: number) => {
    if (answer === 10) {
      setAnswerFeedback("哇！你看出来了！这条数字路每次加2。");
      logEvent("stone_correct");
      return;
    }
    if (session.wrongAttemptsStone === 0) {
      updateSession("stone_try_again", (prev) => ({ ...prev, wrongAttemptsStone: prev.wrongAttemptsStone + 1 }));
      setAnswerFeedback("差一点！再看看 2 到 4、4 到 6，中间都隔了几？");
      return;
    }
    setAnswerFeedback("我们一起想一想？");
    updateSession("stone_second_try_help", (prev) => ({ ...prev, wrongAttemptsStone: prev.wrongAttemptsStone + 1, currentQuestion: "stone", stage: "help_menu" }));
  };

  const answerTower = (answer: number) => {
    if (answer === 15) {
      setAnswerFeedback("塔亮起来了！这次是每次加3。");
      logEvent("tower_correct");
      return;
    }
    if (session.wrongAttemptsTower === 0) {
      updateSession("tower_try_again", (prev) => ({ ...prev, wrongAttemptsTower: prev.wrongAttemptsTower + 1 }));
      setAnswerFeedback("再看看 3、6、9、12，每次多了几个？");
      return;
    }
    setAnswerFeedback("我们可以请 Nova 一起想。");
    updateSession("tower_second_try_help", (prev) => ({ ...prev, wrongAttemptsTower: prev.wrongAttemptsTower + 1, currentQuestion: "tower", stage: "help_menu" }));
  };

  const returnToQuestion = () => {
    goStage(session.currentQuestion === "stone" ? "stone_question" : "tower_question", "return_from_help");
  };

  const chooseL1Pattern = (pattern: "+2" | "+3" | "other") => {
    const isStone = session.currentQuestion === "stone";
    if (isStone && pattern === "+2") setHelpFeedback("对呀！那 8 后面是多少？");
    else if (!isStone && pattern === "+3") setHelpFeedback("对呀！那 12 后面是多少？");
    else if (isStone && pattern === "+3") setHelpFeedback("再看看 2 到 4 之间差几？");
    else if (!isStone && pattern === "+2") setHelpFeedback("再看看 3 到 6 之间差几？");
    else setHelpFeedback(isStone ? "我们一起数：2、4、6、8，中间每次多几个？" : "我们一起数：3、6、9、12，中间每次多几个？");
    logEvent(`l1_pattern_${pattern}`);
  };

  const startL1 = () => {
    setHelpStep("l1");
    setHelpFeedback("");
    updateSession("help_l1", (prev) => ({ ...prev, l1Count: prev.l1Count + 1 }));
  };

  const startL2 = () => {
    const text =
      session.currentQuestion === "stone"
        ? "看，2 到 4 是 +2，4 到 6 也是 +2，6 到 8 也是 +2。那 8 后面是多少？"
        : "看，3 到 6 是 +3，6 到 9 也是 +3，9 到 12 也是 +3。那 12 后面是多少？";
    setHelpStep("l2");
    setHelpFeedback(text);
    updateSession("help_l2", (prev) => ({ ...prev, l2Count: prev.l2Count + 1 }));
  };

  const confirmL3 = () => {
    if (session.inspirationStars === 0) {
      setHelpStep("l2");
      setHelpFeedback(session.currentQuestion === "stone" ? "今天的灵感星用完啦，但我还能陪你想：这条路每次多2。" : "今天的灵感星用完啦，但我还能陪你想：这条路每次多3。");
      updateSession("help_l3_no_star", (prev) => ({ ...prev, l2Count: prev.l2Count + 1 }));
      return;
    }
    setHelpStep("l3_confirm");
    setHelpFeedback("");
    logEvent("help_l3_confirm_opened");
  };

  const useInspirationStar = () => {
    setHelpStep("l3_answer");
    setHelpFeedback(session.currentQuestion === "stone" ? "答案是10。这条石头路的规律是：每次加2。" : "答案是15。这座塔的规律是：每次加3。");
    updateSession("help_l3_used", (prev) => ({ ...prev, inspirationStars: Math.max(0, prev.inspirationStars - 1), l3Count: prev.l3Count + 1 }));
  };

  const chooseTruth = (choice: "a" | "b" | "c") => {
    if (choice === "c") {
      setNotice("再看一看刚才的两条数字路。");
      logEvent("truth_think_again");
      return;
    }
    updateSession(choice === "a" ? "truth_success" : "truth_tried", (prev) => ({ ...prev, truthDetectorOpened: true, truthDetectorSuccess: choice === "a", stage: "reflection" }));
    setNotice(choice === "a" ? "哇，你抓到我啦！可能是+2，也可能是+3。" : "那我们继续看看今天学到了什么吧。");
  };

  const chooseReflection = (choice: ReflectionChoice) => {
    setSelectedReflection(choice);
    updateSession("reflection_choice", (prev) => ({ ...prev, reflectionChoice: choice }));
  };

  const completeAdventure = () => {
    updateSession("complete_adventure", (prev) => ({ ...prev, completed: true, stage: "complete" }));
  };

  const resetAdventure = () => {
    setSession(initialSession);
    setNotice("Nova 正陪你一起探险。");
    setAnswerFeedback("");
    setHelpStep("menu");
    setHelpFeedback("");
    setSelectedReflection(null);
    logEvent("reset_adventure", initialSession);
  };

  return (
    <main className="min-h-screen bg-[#070b2c] bg-[radial-gradient(circle_at_top,#2736a4,#10194f_55%,#070b2c)] p-3 text-white sm:p-5 lg:p-6">
      <section className="mx-auto grid min-h-[calc(100vh-24px)] max-w-[1440px] grid-rows-[auto_1fr] gap-4 lg:min-h-[calc(100vh-48px)]">
        <header className="grid gap-3 rounded-[28px] border border-cyan-300/25 bg-[#101957]/85 p-3 shadow-[0_0_34px_rgba(71,150,255,0.24)] backdrop-blur-xl sm:grid-cols-[auto_1fr_auto] sm:items-center">
          <Link className="inline-flex min-h-11 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 text-sm font-black text-cyan-50 transition hover:bg-cyan-300/18 active:scale-95" href="/adventure">
            ← 返回地图
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-black tracking-wide text-white sm:text-2xl">倍数海新岛探险</h1>
            <p className="mt-1 text-xs font-black text-amber-200">{stageTitle}</p>
          </div>
          <button
            aria-label="真相探测器"
            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 text-sm font-black transition active:scale-95 ${
              session.stage === "truth_moment"
                ? "animate-pulse border-amber-200 bg-amber-300 text-slate-950 shadow-[0_0_28px_rgba(252,211,77,0.75)]"
                : "border-cyan-300/35 bg-blue-950/55 text-cyan-50 hover:bg-cyan-300/12"
            }`}
            data-testid="truth-detector"
            onClick={openTruthDetector}
            type="button"
          >
            🔍 真相探测器
          </button>
        </header>

        <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="relative aspect-[16/9] min-h-[520px] overflow-hidden rounded-[32px] border border-cyan-300/30 bg-[#101957]/90 shadow-[0_0_40px_rgba(71,150,255,0.35)] lg:min-h-[620px]">
            {renderStage()}
          </section>

          <aside className="flex flex-col gap-4 self-start rounded-[32px] border border-cyan-300/25 bg-[#101957]/80 p-4 shadow-[0_0_34px_rgba(71,150,255,0.22)] backdrop-blur-xl lg:p-5">
            <div className="overflow-hidden rounded-[28px] border border-cyan-300/20 bg-blue-950/45 p-4 shadow-[inset_0_0_30px_rgba(34,211,238,0.08)]">
              <div className="relative mx-auto flex h-52 w-full max-w-[280px] items-center justify-center overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.24),rgba(15,23,80,0.78)_58%,rgba(8,13,48,0.96))] shadow-[inset_0_0_45px_rgba(34,211,238,0.18),0_0_30px_rgba(34,211,238,0.12)]">
                <div
                  aria-label="Nova"
                  className="absolute inset-0 bg-contain bg-center bg-no-repeat drop-shadow-[0_0_18px_rgba(103,232,249,0.38)] [mask-image:radial-gradient(ellipse_at_center,black_58%,transparent_78%)]"
                  style={{ backgroundImage: `url(${novaAsset})` }}
                />
                <div className="pointer-events-none absolute bottom-2 h-10 w-32 rounded-[50%] bg-cyan-200/24 blur-md" />
                <div className="pointer-events-none absolute inset-x-6 bottom-0 h-12 rounded-[50%] border border-cyan-200/15 bg-blue-950/30" />
              </div>
              <h2 className="mt-4 text-center text-2xl font-black text-cyan-50">Nova</h2>
              <p className="mt-3 rounded-[22px] border border-cyan-300/20 bg-blue-950/65 p-3 text-sm font-bold leading-6 text-cyan-50">{novaLine}</p>
            </div>

            <div className="rounded-[24px] border border-amber-200/25 bg-amber-300/10 p-4 shadow-[0_0_22px_rgba(252,211,77,0.08)]">
              <p className="text-xs font-black tracking-[0.18em] text-amber-200">⭐ 当前目标</p>
              <p className="mt-2 text-lg font-black text-white">{currentGoal}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
              <div className="rounded-[24px] border border-amber-200/30 bg-blue-950/55 p-4 text-center text-sm font-black text-amber-200">
                灵感星<br />
                <span className="mt-2 inline-block text-xl">{session.inspirationStars > 0 ? "⭐".repeat(session.inspirationStars) : "今天用完啦"}</span>
              </div>
              <button className="rounded-[24px] border border-violet-300/30 bg-violet-500/20 p-4 text-sm font-black text-violet-50 transition hover:bg-violet-400/25 active:scale-95" onClick={askNova} type="button">
                ？问 Nova
              </button>
            </div>

            {notice && <div className="rounded-[24px] border border-cyan-300/20 bg-blue-950/45 p-3 text-sm font-bold leading-6 text-cyan-100">{notice}</div>}
          </aside>
        </div>
      </section>
    </main>
  );

  function renderStage() {
    switch (session.stage) {
      case "map_intro":
        return (
          <StageFrame asset={stageAssets.map_intro} title="发现倍数海新岛" eyebrow="数学星球地图">
            <button
              aria-label="去看看新岛"
              className="absolute right-[10%] top-[12%] h-36 w-44 rounded-full border border-amber-200/45 bg-amber-300/10 shadow-[0_0_46px_rgba(252,211,77,0.48)] ring-4 ring-amber-200/15 transition hover:scale-105 hover:bg-amber-300/18 focus:outline-none focus:ring-4 focus:ring-amber-200/60 active:scale-95"
              onClick={() => goStage("beach_observe", "go_new_island")}
              type="button"
            />
            <span className="absolute right-[13%] top-[8%] rounded-full border border-amber-200/40 bg-blue-950/60 px-4 py-2 text-sm font-black text-amber-100 shadow-[0_0_22px_rgba(252,211,77,0.24)]">NEW</span>
            <div className="absolute bottom-8 left-8 right-8 flex flex-wrap items-center justify-between gap-3">
              <p className="rounded-full border border-cyan-200/25 bg-blue-950/65 px-4 py-3 text-sm font-black text-cyan-50 backdrop-blur-md">倍数海好像出现了新岛屿……</p>
              <GameButton dataTestId="multiples-start" onClick={() => goStage("beach_observe", "go_new_island")}>去看看新岛</GameButton>
            </div>
          </StageFrame>
        );

      case "beach_observe":
        return (
          <StageFrame asset={stageAssets.beach_observe} title="海面上的数字石头" eyebrow="倍数海边">
            <SeaGlow />
            <div className="absolute inset-x-[7%] bottom-[17%] flex items-end justify-center gap-4 xl:gap-6">
              {[2, 4, 6, 8].map((num) => (
                <StoneButton key={num} onClick={() => setNotice("石头轻轻亮了一下。")}>{num}</StoneButton>
              ))}
              <button className="relative flex h-16 w-20 items-center justify-center rounded-full border border-amber-100/35 bg-amber-300/18 text-3xl font-black text-white shadow-[0_0_30px_rgba(252,211,77,0.5)] ring-4 ring-amber-200/35 backdrop-blur-[1px] transition hover:scale-105 active:scale-95" data-testid="stone-mystery" onClick={() => goStage("stone_question", "open_stone_question")} type="button">
                ?
              </button>
            </div>
          </StageFrame>
        );

      case "stone_question":
        return (
          <QuestionStage asset={stageAssets.stone_question} title="第5块石头应该是多少？" feedback={answerFeedback} showContinue={answerFeedback.startsWith("哇")} onContinue={() => goStage("island_jump", "stone_to_island_jump")}>
            <div className="mx-auto mt-20 max-w-3xl rounded-[30px] border border-cyan-300/25 bg-blue-950/56 p-4 shadow-[0_0_26px_rgba(34,211,238,0.14)] backdrop-blur-sm">
              <NumberRoad numbers={["2", "4", "6", "8", "?"]} />
            </div>
            <div className="mt-24 flex flex-wrap justify-center gap-5">
              <OptionGrid options={[9, 10, 12]} testPrefix="stone-answer" onChoose={answerStone} />
            </div>
          </QuestionStage>
        );

      case "help_menu":
        return (
          <StageFrame title="你想怎么问 Nova？" eyebrow="Nova 小帮手">
            <div className="mx-auto mt-16 w-full max-w-3xl rounded-[32px] border border-cyan-300/25 bg-blue-950/70 p-6 shadow-[0_0_34px_rgba(103,232,249,0.12)]">
              {helpStep === "menu" && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <SoftButton onClick={returnToQuestion}>我已经想到了</SoftButton>
                  <SoftButton onClick={startL1}>我看到一些规律</SoftButton>
                  <SoftButton onClick={startL2}>我完全不懂</SoftButton>
                  <SoftButton onClick={confirmL3}>请直接告诉我</SoftButton>
                </div>
              )}
              {helpStep === "l1" && (
                <div className="grid gap-4">
                  <p className="text-center text-xl font-black text-cyan-50">你看到的规律像哪一个？</p>
                  <div className="grid grid-cols-3 gap-3">
                    <SoftButton onClick={() => chooseL1Pattern("+2")}>+2</SoftButton>
                    <SoftButton onClick={() => chooseL1Pattern("+3")}>+3</SoftButton>
                    <SoftButton onClick={() => chooseL1Pattern("other")}>其他</SoftButton>
                  </div>
                  {helpFeedback && <HelpCard text={helpFeedback} />}
                  {helpFeedback && <GameButton onClick={returnToQuestion}>回到数字路</GameButton>}
                </div>
              )}
              {(helpStep === "l2" || helpStep === "l3_answer") && (
                <div className="grid gap-4">
                  <HelpCard text={helpFeedback} />
                  <GameButton onClick={returnToQuestion}>回到数字路</GameButton>
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
          <StageFrame asset={stageAssets.island_jump} title="新岛屿点亮！" eyebrow="跳向新岛">
            <SeaGlow />
            <div className="absolute bottom-[24%] left-[11%] right-[28%] flex items-center justify-between text-xl font-black">
              {["2", "4", "6", "8", "10"].map((num, index) => (
                <span className={`animate-pulse rounded-full px-4 py-3 shadow-[0_0_24px_rgba(252,211,77,0.55)] ${num === "10" ? "bg-amber-300 text-slate-950 ring-4 ring-amber-100/60" : "bg-blue-950/72 text-cyan-50 ring-2 ring-cyan-200/25"}`} key={num} style={{ animationDelay: `${index * 120}ms` }}>
                  {num}
                </span>
              ))}
            </div>
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
              <GameButton dataTestId="island-enter" onClick={() => updateSession("enter_island", (prev) => ({ ...prev, stage: "tower_question", currentQuestion: "tower" }))}>登上新岛</GameButton>
            </div>
          </StageFrame>
        );

      case "tower_question":
        return (
          <QuestionStage asset={stageAssets.tower_question} title="塔上的下一个数字是多少？" feedback={answerFeedback} showContinue={answerFeedback.startsWith("塔亮")} onContinue={() => goStage("truth_moment", "tower_to_truth_moment")}>
            <div className="absolute left-1/2 top-[17%] flex h-[340px] w-64 -translate-x-1/2 flex-col items-center rounded-t-[42px] border border-cyan-200/30 bg-gradient-to-b from-cyan-300/24 via-violet-500/20 to-blue-950/48 p-5 shadow-[0_0_54px_rgba(167,139,250,0.26)] backdrop-blur-[1px]">
              <div className="animate-pulse text-4xl">💎</div>
              <div className="mt-3 grid w-full gap-2">
                {["3", "6", "9", "12", "?"].map((num) => (
                  <span className="rounded-full border border-cyan-200/30 bg-blue-950/72 px-3 py-1 text-center text-xl font-black text-cyan-50 shadow-[0_0_14px_rgba(34,211,238,0.14)]" key={num}>{num}</span>
                ))}
              </div>
            </div>
            {!answerFeedback.startsWith("塔亮") && (
              <div className="absolute bottom-[9%] left-1/2 flex -translate-x-1/2 flex-wrap justify-center gap-5">
                <OptionGrid options={[14, 15, 18]} testPrefix="tower-answer" onChoose={answerTower} />
              </div>
            )}
          </QuestionStage>
        );

      case "truth_moment":
        return (
          <StageFrame asset={stageAssets.truth_moment} title="Nova 的一句话" eyebrow="塔顶平台">
            <div className="absolute left-1/2 top-[24%] -translate-x-1/2 rounded-full border border-cyan-200/25 bg-blue-950/62 px-12 py-8 text-7xl text-violet-100 shadow-[0_0_44px_rgba(103,232,249,0.24)]">
              ?
            </div>
            <div className="absolute left-[12%] top-[18%] animate-pulse text-3xl text-violet-200">?</div>
            <div className="absolute right-[18%] top-[24%] animate-pulse text-4xl text-amber-200">?</div>
            <p className="absolute bottom-[28%] left-1/2 w-[min(720px,84%)] -translate-x-1/2 rounded-[30px] border border-cyan-200/25 bg-blue-950/72 p-5 text-center text-2xl font-black leading-9 text-cyan-50 shadow-[0_0_28px_rgba(34,211,238,0.12)] backdrop-blur-md">
              今天你学会了数字路！所有这样的数字路都是每次加2。
            </p>
            <p className="absolute bottom-[18%] left-1/2 -translate-x-1/2 rounded-full border border-violet-200/30 bg-violet-400/15 px-5 py-3 text-sm font-black text-violet-100">好像哪里有点怪怪的……</p>
            <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
              <GameButton onClick={() => goStage("reflection", "skip_truth_detector")}>继续看看今天学到了什么</GameButton>
            </div>
          </StageFrame>
        );

      case "truth_question":
        return (
          <StageFrame asset={stageAssets.truth_question} title="真相探测器启动！" eyebrow="你觉得 Nova 哪里说得不对？">
            <div className="mx-auto mt-16 grid max-w-3xl gap-4 rounded-[34px] border border-cyan-300/25 bg-blue-950/70 p-6 shadow-[0_0_44px_rgba(103,232,249,0.18)] backdrop-blur-md">
              <div className="mx-auto flex h-28 w-28 animate-pulse items-center justify-center rounded-full bg-amber-300 text-6xl text-slate-950 shadow-[0_0_42px_rgba(252,211,77,0.65)]">🔍</div>
              <SoftButton dataTestId="truth-answer-a" onClick={() => chooseTruth("a")}>A 数字路不一定每次加2</SoftButton>
              <SoftButton onClick={() => chooseTruth("b")}>B 我相信 Nova</SoftButton>
              <SoftButton onClick={() => chooseTruth("c")}>C 让我再想想</SoftButton>
            </div>
          </StageFrame>
        );

      case "reflection":
        return (
          <StageFrame asset={stageAssets.reflection} title="今天最酷的发现是什么？" eyebrow="探险笔记本">
            <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-[260px_1fr]">
              <div className="grid self-start gap-3 rounded-[28px] border border-amber-200/25 bg-blue-950/45 p-3 shadow-[0_0_24px_rgba(252,211,77,0.12)] backdrop-blur-sm">
                <StickerButton dataTestId="reflection-pattern" onClick={() => chooseReflection("pattern")}>🔢 找规律</StickerButton>
                <StickerButton onClick={() => chooseReflection("ask_nova")}>🤔 问 Nova</StickerButton>
                <StickerButton onClick={() => chooseReflection("island_light")}>✨ 点亮新岛</StickerButton>
                {session.truthDetectorSuccess && <StickerButton onClick={() => chooseReflection("not_blind_trust")}>🔍 不全信 Nova</StickerButton>}
              </div>
              <div className="min-h-72 rounded-[34px] border border-amber-200/30 bg-[linear-gradient(135deg,rgba(255,245,210,0.14),rgba(30,41,124,0.34))] p-6 shadow-[0_0_40px_rgba(252,211,77,0.14)] backdrop-blur-[2px]">
                {selectedReflection ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="rotate-[-6deg] rounded-[30px] border border-amber-200/45 bg-amber-100/18 px-8 py-5 text-7xl shadow-[0_0_32px_rgba(252,211,77,0.24)]">⭐</div>
                    <p className="mt-5 max-w-xl rounded-[24px] border border-amber-100/25 bg-blue-950/45 p-4 text-lg font-black leading-8 text-amber-100">{reflectionStickers[selectedReflection]}</p>
                    <GameButton dataTestId="complete-button" onClick={completeAdventure}>完成今天的探险</GameButton>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-xl font-black text-cyan-100">选一张贴纸，贴进探险笔记。</div>
                )}
              </div>
            </div>
          </StageFrame>
        );

      case "complete":
        return (
          <StageFrame asset={stageAssets.complete} title="今日探险完成" eyebrow="倍数海纪念卡">
            <div className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-[320px_1fr]">
              <div className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-[34px] border border-amber-200/30 bg-blue-950/42 p-6 text-center shadow-[0_0_38px_rgba(252,211,77,0.14)] backdrop-blur-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(252,211,77,0.22),transparent_42%)]" />
                <div className="relative rounded-full border border-amber-200/35 bg-amber-300/12 p-5 text-8xl shadow-[0_0_32px_rgba(252,211,77,0.22)]">🏅</div>
                <p className="relative mt-4 rounded-full bg-blue-950/50 px-5 py-2 text-sm font-black text-amber-100">今日探险纪念</p>
              </div>
              <div className="rounded-[34px] border border-cyan-300/25 bg-blue-950/62 p-6 shadow-[0_0_30px_rgba(34,211,238,0.12)] backdrop-blur-md">
                <div className="grid gap-3">
                  <ResultLine label="新岛屿" value="已点亮" />
                  <ResultLine label="石头规律" value="已发现" />
                  <ResultLine label="倍数塔" value="已点亮" />
                  <ResultLine label="真相探测器" value={session.truthDetectorSuccess ? "已识破" : session.truthDetectorOpened ? "已尝试" : "下次再试"} />
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link className="inline-flex min-h-12 items-center justify-center rounded-[24px] border border-cyan-200/35 bg-cyan-300/20 px-6 text-base font-black text-cyan-50 transition active:scale-95" href="/adventure">回到地图</Link>
                  <GameButton dataTestId="reset-multiples" onClick={resetAdventure}>再玩一次</GameButton>
                  <Link className="inline-flex min-h-12 items-center justify-center rounded-[24px] border border-violet-200/35 bg-violet-400/25 px-6 text-base font-black text-violet-50 transition active:scale-95" href="/report">查看星星报告</Link>
                </div>
                <details className="mt-5 rounded-2xl border border-cyan-300/15 bg-blue-950/35 p-3 text-xs text-cyan-100/70">
                  <summary className="cursor-pointer font-black">记录小盒</summary>
                  <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap break-words">{JSON.stringify(testRecord, null, 2)}</pre>
                </details>
              </div>
            </div>
          </StageFrame>
        );
    }
  }
}

function StageFrame({ asset, children, eyebrow, title }: { asset?: string; children: ReactNode; eyebrow: string; title: string }) {
  const style: CSSProperties | undefined = asset
    ? { backgroundImage: `linear-gradient(rgba(7,11,44,0.16), rgba(7,11,44,0.42)), url(${asset})` }
    : undefined;

  return (
    <div className="relative h-full min-h-[520px] overflow-hidden bg-[radial-gradient(circle_at_50%_18%,rgba(34,211,238,0.26),rgba(30,41,124,0.72)_42%,rgba(5,8,36,0.98))] bg-cover bg-center p-4 sm:p-5 lg:min-h-[620px] lg:p-6" style={style}>
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

function QuestionStage({ asset, children, feedback, onContinue, showContinue, title }: { asset?: string; children: ReactNode; feedback: string; onContinue: () => void; showContinue: boolean; title: string }) {
  return (
    <StageFrame asset={asset} eyebrow="数字路机关" title={title}>
      {children}
      {feedback && <div className="absolute bottom-[19%] left-1/2 w-[min(760px,82%)] -translate-x-1/2 rounded-[26px] border border-amber-200/35 bg-blue-950/78 p-4 text-center text-base font-black leading-7 text-amber-100 shadow-[0_0_24px_rgba(252,211,77,0.16)] backdrop-blur-md">{feedback}</div>}
      {showContinue && <div className="absolute bottom-[8%] left-1/2 flex -translate-x-1/2 justify-center"><GameButton onClick={onContinue}>继续</GameButton></div>}
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

function OptionGrid({ onChoose, options, testPrefix }: { onChoose: (option: number) => void; options: number[]; testPrefix: string }) {
  return (
    <>
      {options.map((option) => (
        <button className="h-20 min-w-32 rounded-[32px] bg-gradient-to-br from-violet-700 via-blue-700 to-cyan-500 px-8 text-3xl font-black text-white shadow-[0_0_24px_rgba(34,211,238,0.28)] ring-4 ring-cyan-200/20 transition hover:scale-105 hover:shadow-[0_0_34px_rgba(34,211,238,0.45)] focus:outline-none focus:ring-4 focus:ring-amber-200/55 active:scale-95" data-testid={`${testPrefix}-${option}`} key={option} onClick={() => onChoose(option)} type="button">
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
    <div className="flex items-center justify-between gap-3 rounded-[24px] border border-cyan-300/20 bg-gradient-to-r from-blue-950/72 to-cyan-500/12 px-5 py-4 text-base font-black text-cyan-50 shadow-[0_0_18px_rgba(34,211,238,0.1)]">
      <span>{label}</span>
      <span className="shrink-0 rounded-full bg-emerald-300 px-4 py-1 text-emerald-950 shadow-[0_0_14px_rgba(110,231,183,0.35)]">{value}</span>
    </div>
  );
}
