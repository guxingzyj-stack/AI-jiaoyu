"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { forestRpgAssets } from "../../../lib/forestRpgAssets";
import {
  forestRpgContent,
  type ForestFruit,
  type ForestRpgStage,
  type LampState
} from "../../../lib/forestRpgContentSource";
import {
  playClickSound,
  playCompleteSound,
  playCorrectSound,
  playRewardSound,
  playWrongSound
} from "../../../lib/soundEffects";

type PlayerPosition = "start" | "lamp" | string;

export default function ForestRpgPage() {
  const content = forestRpgContent;
  const [stage, setStage] = useState<ForestRpgStage>("intro");
  const [selectedFruits, setSelectedFruits] = useState<ForestFruit[]>([]);
  const [pickedFruitIds, setPickedFruitIds] = useState<string[]>([]);
  const [attemptCount, setAttemptCount] = useState(0);
  const [playerPosition, setPlayerPosition] = useState<PlayerPosition>("start");
  const [targetPosition, setTargetPosition] = useState<PlayerPosition>("start");
  const [lampState, setLampState] = useState<LampState>("sleeping");
  const [novaLine, setNovaLine] = useState(content.novaLines.intro);
  const [moving, setMoving] = useState(false);
  const [lampPulse, setLampPulse] = useState(false);
  const [lastTry, setLastTry] = useState<{ fruits: ForestFruit[]; sum: number } | null>(null);

  const bagSum = selectedFruits.reduce((sum, fruit) => sum + fruit.value, 0);
  const isAwake = stage === "result" || stage === "complete";
  const isTryingLamp = stage === "lamp";
  const hasFailedTry = (lampState === "too-low" || lampState === "too-high") && stage !== "result" && stage !== "complete";
  const isBagReady = selectedFruits.length === 2 && !hasFailedTry;
  const showAwakeningBurst = lampState === "lit" || stage === "result" || stage === "complete";
  const playerPoint = getPoint(moving ? targetPosition : playerPosition);

  const stageLabel = useMemo(() => {
    if (stage === "intro") return content.stageLabels.intro;
    if (stage === "result") return attemptCount === 1 ? content.stageLabels.perfect : content.stageLabels.success;
    if (stage === "complete") return content.stageLabels.complete;
    if (isTryingLamp) return content.stageLabels.lamp;
    return content.stageLabels.collect;
  }, [attemptCount, content.stageLabels, isTryingLamp, stage]);

  const taskPrompt = useMemo(() => {
    if (stage === "intro") return content.prompts.intro;
    if (stage === "result") return content.prompts.result;
    if (stage === "complete") return content.prompts.complete;
    if (isTryingLamp) return content.prompts.tryingLamp;
    if (lampState === "too-low") return content.prompts.tooLow;
    if (lampState === "too-high") return content.prompts.tooHigh;
    if (selectedFruits.length === 0) return content.prompts.emptyBag;
    if (selectedFruits.length === 1) return content.prompts.oneFruit;
    return content.prompts.bagReady;
  }, [content.prompts, isTryingLamp, lampState, selectedFruits.length, stage]);

  const startAdventure = () => {
    playClickSound();
    setStage("map");
    setNovaLine(content.novaLines.map);
  };

  const moveTo = (position: PlayerPosition, done?: () => void) => {
    setTargetPosition(position);
    setMoving(true);
    window.setTimeout(() => {
      setPlayerPosition(position);
      setMoving(false);
      done?.();
    }, 700);
  };

  const collectFruit = (fruit: ForestFruit) => {
    if (stage === "intro" || stage === "result" || stage === "complete") return;
    if (pickedFruitIds.includes(fruit.id) || moving || selectedFruits.length >= 2 || hasFailedTry) return;

    playClickSound();
    moveTo(fruit.id, () => {
      playRewardSound();
      const next = [...selectedFruits, fruit];
      setSelectedFruits(next);
      setPickedFruitIds((prev) => [...prev, fruit.id]);
      setStage("collect");
      setLampState("sleeping");
      setNovaLine(next.length === 1 ? content.novaLines.firstFruit(fruit.value) : content.novaLines.bagFull);
    });
  };

  const resetBag = () => {
    playClickSound();
    setSelectedFruits([]);
    setPickedFruitIds([]);
    setLastTry(null);
    setLampState("sleeping");
    setStage("map");
    setNovaLine(content.novaLines.map);
  };

  const handleLampClick = () => {
    if (stage === "intro" || stage === "result" || stage === "complete" || moving) return;
    if (selectedFruits.length === 0) {
      playClickSound();
      setNovaLine(content.novaLines.needTwoFruits);
      return;
    }
    if (selectedFruits.length === 1) {
      playClickSound();
      setNovaLine(content.novaLines.needOneFruit);
      return;
    }
    if (hasFailedTry) return;
    tryLamp();
  };

  const tryLamp = () => {
    if (selectedFruits.length < 2 || moving) return;

    playClickSound();
    setStage("lamp");
    setLampState("charging");
    setNovaLine(content.novaLines.goLamp);
    moveTo("lamp", () => {
      const sum = selectedFruits.reduce((total, fruit) => total + fruit.value, 0);
      setAttemptCount((count) => count + 1);
      setLastTry({ fruits: selectedFruits, sum });
      setLampPulse(true);
      window.setTimeout(() => setLampPulse(false), 520);

      if (sum === content.targetEnergy) {
        playCorrectSound();
        setLampState("lit");
        setNovaLine(content.novaLines.justRight);
        window.setTimeout(() => {
          playRewardSound();
          setStage("result");
        }, 820);
        return;
      }

      playWrongSound();
      setLampState(sum < content.targetEnergy ? "too-low" : "too-high");
      setNovaLine(sum < content.targetEnergy ? content.novaLines.tooLow : content.novaLines.tooHigh);
      setStage("collect");
    });
  };

  const completeAdventure = () => {
    playCompleteSound();
    setStage("complete");
    setNovaLine(content.novaLines.complete);
  };

  const resetAdventure = () => {
    playClickSound();
    setStage("intro");
    setSelectedFruits([]);
    setPickedFruitIds([]);
    setAttemptCount(0);
    setPlayerPosition("start");
    setTargetPosition("start");
    setLampState("sleeping");
    setNovaLine(content.novaLines.intro);
    setMoving(false);
    setLampPulse(false);
    setLastTry(null);
  };

  return (
    <main className={`min-h-screen overflow-hidden bg-[#07102f] text-white ${isAwake ? "forest-lit" : ""}`}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(70,230,255,0.24),transparent_34%),radial-gradient(circle_at_82%_20%,rgba(168,85,247,0.26),transparent_34%),linear-gradient(180deg,#121d62,#07102f_58%,#05101e)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.13)_1px,transparent_2px)] bg-[size:34px_34px] opacity-30" />

      <section className="relative mx-auto grid min-h-screen w-full max-w-6xl grid-rows-[auto_1fr] gap-3 px-3 py-3 sm:px-5 lg:py-5">
        <header className="hud-panel flex items-center justify-between gap-2 rounded-[22px] border border-cyan-200/25 bg-blue-950/70 px-3 py-2 shadow-[0_0_30px_rgba(34,211,238,0.16)] backdrop-blur-xl">
          <Link className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 text-xs font-black text-cyan-50" href="/adventure">
            ← 入口
          </Link>
          <div className="min-w-0 text-center">
            <h1 className="truncate text-base font-black sm:text-2xl">{content.name}</h1>
            <p className="mt-0.5 text-[10px] font-black text-amber-200 sm:text-xs">{stageLabel}</p>
          </div>
          <div className="shrink-0 rounded-full border border-amber-200/35 bg-amber-300/10 px-3 py-2 text-xs font-black text-amber-100">
            星光碎片 x{stage === "complete" ? content.rewards.amount : 0}
          </div>
        </header>

        <section className="game-stage relative min-h-[calc(100vh-92px)] overflow-hidden rounded-[30px] border border-cyan-200/25 bg-[#0d1850]/82 shadow-[0_0_42px_rgba(34,211,238,0.2)] sm:min-h-[680px] lg:min-h-[720px]">
          <ForestMap
            contentFruits={content.fruits}
            hasFailedTry={hasFailedTry}
            isAwake={isAwake}
            isBagReady={isBagReady}
            lampPulse={lampPulse}
            lampState={lampState}
            onCollect={collectFruit}
            onLampClick={handleLampClick}
            pickedFruitIds={pickedFruitIds}
            playerPoint={playerPoint}
            selectedFruits={selectedFruits}
            showAwakeningBurst={showAwakeningBurst}
            showMap={stage !== "intro"}
            targetEnergy={content.targetEnergy}
          />

          {stage !== "intro" && (
            <div className="pointer-events-none absolute left-3 right-3 top-3 z-50 flex justify-center">
              <div className={`max-w-[340px] rounded-full border px-4 py-2 text-center text-sm font-black shadow-[0_0_24px_rgba(34,211,238,0.18)] backdrop-blur-xl ${isBagReady ? "border-amber-200/60 bg-amber-300/95 text-slate-950" : "border-cyan-200/28 bg-blue-950/72 text-cyan-50"}`}>
                {taskPrompt}
              </div>
            </div>
          )}

          {stage === "intro" && (
            <SceneCard className="bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:w-[380px]">
              <p className="text-xs font-black tracking-[0.22em] text-cyan-200">冷开场</p>
              <h2 className="mt-2 text-2xl font-black leading-tight">{content.narrative.introTitle}</h2>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">{content.narrative.introLine}</p>
              <PrimaryButton onClick={startAdventure}>{content.buttons.start}</PrimaryButton>
            </SceneCard>
          )}

          {(stage === "map" || stage === "collect" || stage === "lamp") && (
            <div className="game-controls absolute bottom-3 left-3 right-3 z-50 mx-auto max-w-[520px] rounded-[28px] border border-cyan-200/24 bg-blue-950/72 p-3 shadow-[0_0_32px_rgba(34,211,238,0.18)] backdrop-blur-xl">
              <NovaHint line={novaLine} />
              <InventoryDock fruits={selectedFruits} hasFailedTry={hasFailedTry} onReset={resetBag} />
              {isTryingLamp && <LampMeter state={lampState} sum={bagSum} />}
              {hasFailedTry && (
                <SecondaryAction onClick={resetBag}>{content.buttons.retry}</SecondaryAction>
              )}
              {isBagReady && (
                <PrimaryButton onClick={tryLamp}>{content.buttons.tryLamp}</PrimaryButton>
              )}
            </div>
          )}

          {stage === "result" && lastTry && (
            <SceneCard className="awakening-card bottom-4 left-4 right-4 text-center sm:left-1/2 sm:w-[430px] sm:-translate-x-1/2">
              <p className="text-xs font-black tracking-[0.22em] text-amber-200">
                {attemptCount === 1 ? content.narrative.resultPerfectTitle : content.narrative.resultSuccessTitle}
              </p>
              <h2 className="mt-2 text-3xl font-black leading-tight">星光亮起来了！</h2>
              <p className="mt-1 text-lg font-black text-amber-100">小精灵醒来了！</p>
              <p className="mt-2 text-sm font-bold leading-6 text-cyan-50/88">
                {content.novaLines.successSummary(lastTry.fruits[0].value, lastTry.fruits[1].value)}
              </p>
              <p className="mt-2 rounded-full border border-emerald-200/30 bg-emerald-300/16 px-4 py-2 text-sm font-black text-emerald-50">
                {content.narrative.friendLine}
              </p>
              <p className="mt-3 rounded-full bg-amber-300 px-4 py-2 text-sm font-black text-slate-950">
                获得：{content.rewards.item} +{content.rewards.amount}
              </p>
              <PrimaryButton onClick={completeAdventure}>{content.buttons.seeSpirit}</PrimaryButton>
            </SceneCard>
          )}

          {stage === "complete" && (
            <SceneCard className="reward-card bottom-4 left-4 right-4 text-center sm:left-1/2 sm:w-[460px] sm:-translate-x-1/2">
              <p className="text-xs font-black tracking-[0.22em] text-amber-200">星光灯救援完成</p>
              <h2 className="mt-2 text-3xl font-black leading-tight">{content.narrative.rewardTitle}</h2>
              <div className="mt-4 grid gap-2 text-sm font-black text-cyan-50">
                <p className="rounded-[18px] border border-amber-200/30 bg-amber-300/16 px-4 py-2">{content.narrative.friendLine}</p>
                <p className="rounded-[18px] border border-emerald-200/30 bg-emerald-300/14 px-4 py-2">{content.narrative.pathProgress}</p>
              </div>
              <p className="mt-3 text-sm font-bold leading-6 text-cyan-50/88">{content.narrative.hookLine}</p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <PrimaryButton onClick={resetAdventure}>{content.buttons.replay}</PrimaryButton>
                <Link className="inline-flex min-h-12 items-center justify-center rounded-[22px] border border-cyan-200/30 bg-cyan-200/12 px-4 text-sm font-black text-cyan-50 transition active:scale-95" href="/adventure">
                  {content.buttons.backToAdventure}
                </Link>
              </div>
            </SceneCard>
          )}
        </section>

      </section>

      <style jsx global>{`
        @keyframes mistDrift {
          0%, 100% { transform: translateX(-8px) scale(1); opacity: 0.88; }
          50% { transform: translateX(10px) scale(1.06); opacity: 0.7; }
        }
        @keyframes fruitGlow {
          0%, 100% { box-shadow: 0 0 18px rgba(250,204,21,0.42), 0 0 0 0 rgba(250,204,21,0.32); }
          50% { box-shadow: 0 0 34px rgba(250,204,21,0.84), 0 0 0 10px rgba(250,204,21,0); }
        }
        @keyframes lampGlow {
          0%, 100% { box-shadow: 0 0 22px rgba(250,204,21,0.28); }
          50% { box-shadow: 0 0 54px rgba(250,204,21,0.78); }
        }
        @keyframes burstRing {
          0% { transform: translate(-50%, -50%) scale(0.34); opacity: 0.95; }
          100% { transform: translate(-50%, -50%) scale(1.45); opacity: 0; }
        }
        @keyframes rewardGlow {
          0%, 100% { box-shadow: 0 0 36px rgba(250,204,21,0.3); }
          50% { box-shadow: 0 0 68px rgba(250,204,21,0.58); }
        }
        @keyframes spiritWake {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.04); }
        }
        @keyframes nudge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .energy-fruit { animation: fruitGlow 2.2s ease-in-out infinite; }
        .lamp-ready, .lamp-lit { animation: lampGlow 1.7s ease-in-out infinite; }
        .tap-hint { animation: nudge 1.3s ease-in-out infinite; }
        .starlight-burst { animation: burstRing 1.2s ease-out infinite; }
        .reward-card, .awakening-card { animation: rewardGlow 2.2s ease-in-out infinite; }
        .spirit-awake { animation: spiritWake 2s ease-in-out infinite; }
        .sleepy-mist { animation: mistDrift 4s ease-in-out infinite; }
        .forest-lit .sleepy-mist { opacity: 0; transition: opacity 0.8s ease; }
        .forest-lit .forest-light { opacity: 1; }
        .forest-lit .game-stage { border-color: rgba(253,224,71,0.42); }
        .nova-bot::before {
          content: "";
          position: absolute;
          width: 46%;
          height: 30%;
          border-radius: 999px;
          background: #061634;
          box-shadow: inset 0 0 0 2px rgba(186,230,253,0.34);
        }
        .nova-bot::after {
          content: "";
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #67e8f9;
          box-shadow: 15px 0 #67e8f9, 0 0 9px #67e8f9, 15px 0 9px #67e8f9;
        }
        @media (prefers-reduced-motion: reduce) {
          .energy-fruit, .lamp-ready, .lamp-lit, .sleepy-mist, .tap-hint, .starlight-burst, .reward-card, .awakening-card, .spirit-awake { animation: none; }
        }
      `}</style>
    </main>
  );

  function getPoint(position: PlayerPosition) {
    if (position === "start") return { x: 10, y: 76 };
    if (position === "lamp") return { x: 58, y: 45 };
    const fruit = content.fruits.find((item) => item.id === position);
    return fruit?.position ?? { x: 10, y: 76 };
  }
}

function ForestMap({
  contentFruits,
  hasFailedTry,
  isAwake,
  isBagReady,
  lampPulse,
  lampState,
  onCollect,
  onLampClick,
  pickedFruitIds,
  playerPoint,
  selectedFruits,
  showAwakeningBurst,
  showMap,
  targetEnergy
}: {
  contentFruits: ForestFruit[];
  hasFailedTry: boolean;
  isAwake: boolean;
  isBagReady: boolean;
  lampPulse: boolean;
  lampState: LampState;
  onCollect: (fruit: ForestFruit) => void;
  onLampClick: () => void;
  pickedFruitIds: string[];
  playerPoint: { x: number; y: number };
  selectedFruits: ForestFruit[];
  showAwakeningBurst: boolean;
  showMap: boolean;
  targetEnergy: number;
}) {
  const spiritAwake = isAwake;
  const recommendedFruitId = getRecommendedFruitId(contentFruits, pickedFruitIds, selectedFruits, targetEnergy);
  const backgroundAsset = isAwake ? forestRpgAssets.backgrounds.bright : forestRpgAssets.backgrounds.dark;

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-cover bg-center ${isAwake ? "bg-emerald-500/10" : "bg-slate-950/20"}`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(9,18,58,0.38), rgba(5,16,30,0.52)), url(${backgroundAsset}), radial-gradient(circle at 50% 0%, rgba(34,211,238,0.22), transparent 44%), linear-gradient(180deg, #121d62, #07102f 58%, #05101e)`
      }}
    >
      <div className="absolute inset-x-[-10%] bottom-0 h-[58%] rounded-t-[50%] bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.28),rgba(21,128,61,0.22)_36%,rgba(5,46,22,0.72)_78%)]" />
      <div className="forest-light pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 bg-[radial-gradient(circle_at_60%_42%,rgba(250,204,21,0.3),transparent_30%),radial-gradient(circle_at_35%_72%,rgba(134,239,172,0.26),transparent_34%)]" />
      {showAwakeningBurst && <div className="starlight-burst pointer-events-none absolute left-[58%] top-[45%] z-30 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/40 bg-amber-200/18" />}
      {isAwake && <div className="distant-hook pointer-events-none absolute right-[7%] top-[10%] z-10 h-20 w-20 rounded-full border border-cyan-100/20 bg-slate-300/20 blur-sm" />}
      <div className="absolute bottom-[21%] left-[8%] right-[8%] h-12 rounded-[50%] bg-amber-100/12 blur-sm ring-1 ring-amber-200/20" />
      <div className="absolute bottom-[22%] left-[9%] right-[9%] h-2 rounded-full bg-gradient-to-r from-cyan-200/10 via-amber-200/30 to-emerald-200/18" />

      {Array.from({ length: 9 }).map((_, index) => (
        <span
          className="absolute bottom-[30%] h-20 w-10 rounded-t-full bg-gradient-to-b from-emerald-300/24 to-emerald-950/50"
          key={index}
          style={{ left: `${4 + index * 11}%`, height: `${72 + (index % 3) * 24}px` }}
        />
      ))}

      <div className="absolute left-[58%] top-[45%] z-20 -translate-x-1/2 -translate-y-1/2">
        <button
          aria-label="星光灯"
          className={`relative flex h-24 w-20 items-center justify-center rounded-[34px] border border-amber-100/50 bg-blue-950/72 shadow-[0_0_26px_rgba(250,204,21,0.18)] transition active:scale-95 ${isBagReady ? "lamp-ready bg-amber-300/25 ring-4 ring-amber-200/40" : ""} ${lampState === "lit" ? "lamp-lit bg-amber-300/80" : ""} ${lampPulse ? "scale-105" : ""}`}
          data-testid="starlight-lamp"
          onClick={onLampClick}
          style={{
            backgroundImage: `url(${lampState === "lit" ? forestRpgAssets.objects.starlightLampOn : forestRpgAssets.objects.starlightLampOff}), radial-gradient(circle at 50% 35%, rgba(250,204,21,0.28), rgba(23,37,84,0.9))`,
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain, cover"
          }}
          type="button"
        >
          <div className={`h-12 w-10 rounded-full ${lampState === "lit" ? "bg-amber-100" : lampState === "charging" ? "bg-amber-200/65" : lampState === "too-low" ? "bg-amber-200/45" : lampState === "too-high" ? "bg-violet-300/55" : "bg-cyan-200/24"} transition`} />
          <span className="absolute -bottom-7 whitespace-nowrap rounded-full bg-blue-950/70 px-2 py-1 text-[10px] font-black text-amber-100">星光灯</span>
          {isBagReady && <span className="tap-hint absolute -top-7 rounded-full bg-amber-300 px-2 py-1 text-[10px] font-black text-slate-950">点这里</span>}
        </button>
      </div>

      <div className="absolute right-[12%] top-[24%] z-20 flex flex-col items-center gap-2 sm:right-[18%]">
        <div
          className={`spirit-avatar relative h-20 w-20 rounded-[42%] border border-cyan-100/35 bg-center bg-contain bg-no-repeat ${spiritAwake ? "spirit-awake bg-[radial-gradient(circle_at_50%_30%,#fef3c7,#86efac_52%,#22c55e)] shadow-[0_0_42px_rgba(134,239,172,0.7)]" : "bg-[radial-gradient(circle_at_50%_30%,#dbeafe,#94a3b8_54%,#475569)] shadow-[0_0_28px_rgba(148,163,184,0.48)]"}`}
          style={{
            backgroundImage: `url(${spiritAwake ? forestRpgAssets.characters.awakeSpirit : forestRpgAssets.characters.sleepingSpirit}), ${spiritAwake ? "radial-gradient(circle at 50% 30%, #fef3c7, #86efac 52%, #22c55e)" : "radial-gradient(circle at 50% 30%, #dbeafe, #94a3b8 54%, #475569)"}`
          }}
        >
          <span className="absolute left-5 top-8 h-2 w-2 rounded-full bg-slate-900 shadow-[28px_0_0_#0f172a]" />
          <span className="absolute bottom-4 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-slate-900/45" />
        </div>
        <p className="rounded-full border border-cyan-100/25 bg-blue-950/58 px-3 py-1 text-xs font-black text-cyan-50">{spiritAwake ? "醒来了" : "睡着了"}</p>
      </div>

      <div className="sleepy-mist absolute right-[4%] top-[12%] z-10 h-72 w-72 rounded-full bg-slate-300/22 bg-contain bg-center bg-no-repeat blur-2xl sm:right-[12%]" style={{ backgroundImage: `url(${forestRpgAssets.objects.sleepyFog}), radial-gradient(circle, rgba(203,213,225,0.24), transparent 68%)` }} />
      <div className="sleepy-mist absolute right-[20%] top-[26%] z-10 h-48 w-64 rounded-full bg-cyan-200/16 bg-contain bg-center bg-no-repeat blur-2xl" style={{ backgroundImage: `url(${forestRpgAssets.objects.sleepyFog}), radial-gradient(circle, rgba(165,243,252,0.18), transparent 70%)` }} />

      {showMap && contentFruits.map((fruit) => {
        const picked = pickedFruitIds.includes(fruit.id);
        const carried = selectedFruits.some((item) => item.id === fruit.id);
        const canPick = !picked && selectedFruits.length < 2 && !hasFailedTry;
        const showTapHint = canPick && fruit.id === recommendedFruitId;
        return (
          <button
            className={`absolute z-30 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-100/60 bg-[radial-gradient(circle_at_35%_28%,#fef3c7,#facc15_34%,#22c55e_72%,#15803d)] text-xl font-black text-slate-950 transition active:scale-95 ${canPick ? "energy-fruit hover:scale-105" : "opacity-35 grayscale"} ${carried ? "ring-4 ring-cyan-100/60" : ""}`}
            data-testid={fruit.id}
            disabled={!canPick}
            key={fruit.id}
            onClick={() => onCollect(fruit)}
            style={{
              left: `${fruit.position.x}%`,
              top: `${fruit.position.y}%`,
              backgroundImage: `url(${forestRpgAssets.objects.energyFruit}), radial-gradient(circle at 35% 28%, #fef3c7, #facc15 34%, #22c55e 72%, #15803d)`,
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain, cover"
            }}
            type="button"
          >
            {fruit.label}
            {showTapHint && <span className="tap-hint pointer-events-none absolute -top-7 rounded-full bg-amber-200 px-2 py-1 text-[10px] font-black text-slate-950">点我</span>}
            {picked && <span className="pointer-events-none absolute -bottom-6 whitespace-nowrap rounded-full bg-blue-950/70 px-2 py-1 text-[10px] font-black text-cyan-50">已装入</span>}
          </button>
        );
      })}

      {showMap && (
        <div
          className="absolute z-40 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-100/35 bg-cyan-300 text-xl font-black text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.46)] transition-[left,top] duration-700 ease-in-out"
          data-testid="forest-rpg-player"
          style={{ left: `${playerPoint.x}%`, top: `${playerPoint.y}%` }}
        >
          你
        </div>
      )}
    </div>
  );
}

function getRecommendedFruitId(fruits: ForestFruit[], pickedFruitIds: string[], selectedFruits: ForestFruit[], targetEnergy: number) {
  const available = fruits.filter((fruit) => !pickedFruitIds.includes(fruit.id));
  if (selectedFruits.length === 0) {
    return available.find((fruit) => fruit.value === 6)?.id ?? available[0]?.id ?? null;
  }

  if (selectedFruits.length === 1) {
    const neededValue = targetEnergy - selectedFruits[0].value;
    return available.find((fruit) => fruit.value === neededValue)?.id ?? available.sort((left, right) => left.value - right.value)[0]?.id ?? null;
  }

  return null;
}

function SceneCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`absolute z-50 rounded-[28px] border border-cyan-200/25 bg-blue-950/78 p-4 shadow-[0_0_36px_rgba(34,211,238,0.18)] backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function NovaHint({ line }: { line: string }) {
  return (
    <div className="mb-2 grid grid-cols-[48px_minmax(0,1fr)] items-center gap-2">
      <div
        aria-label="Nova"
        className="nova-bot relative mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] border border-cyan-100/35 bg-[radial-gradient(circle_at_50%_30%,#dffbff,#38bdf8_48%,#1d4ed8)] bg-contain bg-center bg-no-repeat shadow-[0_0_20px_rgba(34,211,238,0.28)]"
        style={{ backgroundImage: `url(${forestRpgAssets.characters.nova}), radial-gradient(circle at 50% 30%, #dffbff, #38bdf8 48%, #1d4ed8)` }}
      />
      <p className="rounded-[16px] border border-cyan-200/16 bg-slate-950/28 p-2 text-xs font-bold leading-5 text-cyan-50">{line}</p>
    </div>
  );
}

function InventoryDock({ fruits, hasFailedTry, onReset }: { fruits: ForestFruit[]; hasFailedTry: boolean; onReset: () => void }) {
  return (
    <div className="rounded-[24px] border border-amber-200/30 bg-blue-950/72 p-3 shadow-[0_0_28px_rgba(34,211,238,0.16)] backdrop-blur-xl" data-testid="fruit-bag">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-black tracking-[0.18em] text-amber-200">背包</p>
        {(fruits.length > 0 || hasFailedTry) && (
          <button className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-3 py-1 text-xs font-black text-cyan-50 transition active:scale-95" onClick={onReset} type="button">
            换果子
          </button>
        )}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {[0, 1].map((index) => {
          const fruit = fruits[index];
          return (
            <div className={`flex min-h-12 items-center justify-center rounded-[18px] border px-2 text-sm font-black ${fruit ? "border-amber-100/55 bg-amber-300/18 text-amber-50 shadow-[0_0_18px_rgba(250,204,21,0.2)]" : "border-cyan-100/18 bg-slate-950/22 text-cyan-50/55"}`} key={index}>
              {fruit ? (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-amber-100/60 bg-[radial-gradient(circle_at_35%_28%,#fef3c7,#facc15_38%,#22c55e_76%)] text-base font-black text-slate-950">
                  {fruit.label}
                </span>
              ) : (
                <span>空</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LampMeter({ state, sum }: { state: LampState; sum: number }) {
  const width = Math.min(100, Math.max(8, sum * 10));
  const color = state === "too-high" ? "from-violet-300 to-fuchsia-300" : state === "lit" ? "from-amber-200 to-yellow-300" : "from-cyan-200 to-emerald-200";

  return (
    <div className="mt-2 rounded-[20px] border border-cyan-200/25 bg-slate-950/48 p-3" data-testid="lamp-meter">
      <p className="text-xs font-black tracking-[0.18em] text-cyan-200">星光灯能量</p>
      <div className="mt-2 h-4 overflow-hidden rounded-full bg-slate-950/70">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-[22px] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-5 text-base font-black text-slate-950 shadow-[0_0_28px_rgba(250,204,21,0.42)] transition active:scale-95" onClick={onClick} type="button">
      {children}
    </button>
  );
}

function SecondaryAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-[20px] border border-cyan-200/30 bg-cyan-200/12 px-4 text-sm font-black text-cyan-50 transition active:scale-95" onClick={onClick} type="button">
      {children}
    </button>
  );
}
