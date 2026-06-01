"use client";

import Link from "next/link";
import Image from "next/image";
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
  const [encounterIndex, setEncounterIndex] = useState(0);
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

  const currentEncounter = content.encounters[encounterIndex];
  const currentFragmentCount = stage === "complete" ? 3 : stage === "result" ? encounterIndex + 1 : stage === "gate" || stage === "bridgeIntro" ? 2 : stage === "follow" || encounterIndex > 0 ? encounterIndex : 0;
  const bagSum = selectedFruits.reduce((sum, fruit) => sum + fruit.value, 0);
  const sceneMode = stage === "gate" ? "gate" : currentEncounter.id === "star-bridge" ? "bridge" : "forest";
  const followerCount = stage === "complete" || stage === "gate" || sceneMode === "bridge" ? 2 : currentFragmentCount >= 1 && stage !== "result" && stage !== "follow" ? 1 : 0;
  const isAwake = stage === "result" || stage === "follow" || stage === "gate" || stage === "bridgeIntro" || stage === "complete";
  const isTryingLamp = stage === "lamp";
  const hasFailedTry = (lampState === "too-low" || lampState === "too-high") && stage !== "result" && stage !== "follow" && stage !== "gate" && stage !== "bridgeIntro" && stage !== "complete";
  const isBagReady = selectedFruits.length === 2 && !hasFailedTry;
  const showAwakeningBurst = lampState === "lit" || stage === "result" || stage === "gate" || stage === "complete";
  const playerPoint = getPoint(moving ? targetPosition : playerPosition);

  const taskPrompt = useMemo(() => {
    if (stage === "intro") return content.prompts.intro;
    if (stage === "result") return content.prompts.result;
    if (stage === "follow") return content.prompts.follow;
    if (stage === "gate") return content.prompts.gate;
    if (stage === "bridgeIntro") return content.prompts.bridgeIntro;
    if (stage === "complete") return content.prompts.complete;
    if (isTryingLamp) return content.prompts.tryingLamp;
    if (lampState === "too-low") return content.prompts.tooLow;
    if (lampState === "too-high") return content.prompts.tooHigh;
    if (selectedFruits.length === 0) return currentEncounter.startPrompt;
    if (selectedFruits.length === 1) return content.prompts.oneFruit;
    return content.prompts.bagReady;
  }, [content.prompts, currentEncounter.startPrompt, isTryingLamp, lampState, selectedFruits.length, stage]);

  const startAdventure = () => {
    playClickSound();
    setStage("map");
    setNovaLine(currentEncounter.mapLine);
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
    if (stage === "intro" || stage === "result" || stage === "follow" || stage === "gate" || stage === "bridgeIntro" || stage === "complete") return;
    if (pickedFruitIds.includes(fruit.id) || moving || selectedFruits.length >= 2 || hasFailedTry) return;

    playClickSound();
    moveTo(fruit.id, () => {
      playRewardSound();
      const next = [...selectedFruits, fruit];
      setSelectedFruits(next);
      setPickedFruitIds((prev) => [...prev, fruit.id]);
      setStage("collect");
      setLampState("sleeping");
      setNovaLine(next.length === 1 ? currentEncounter.firstFruitLine(fruit.value) : currentEncounter.bagFullLine);
    });
  };

  const resetBag = () => {
    playClickSound();
    setSelectedFruits([]);
    setPickedFruitIds([]);
    setLastTry(null);
    setLampState("sleeping");
    setStage("map");
    setNovaLine(currentEncounter.mapLine);
  };

  const handleLampClick = () => {
    if (stage === "intro" || stage === "result" || stage === "follow" || stage === "gate" || stage === "bridgeIntro" || stage === "complete" || moving) return;
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

      if (sum === currentEncounter.targetEnergy) {
        playCorrectSound();
        setLampState("lit");
        setNovaLine(currentEncounter.justRightLine);
        window.setTimeout(() => {
          playRewardSound();
          setStage("result");
        }, 820);
        return;
      }

      playWrongSound();
      setLampState(sum < currentEncounter.targetEnergy ? "too-low" : "too-high");
      setNovaLine(sum < currentEncounter.targetEnergy ? content.novaLines.tooLow : content.novaLines.tooHigh);
      setStage("collect");
    });
  };

  const advanceAfterResult = () => {
    if (encounterIndex === 0) {
      playClickSound();
      setStage("follow");
      setNovaLine(content.narrative.followLine);
      return;
    }

    if (encounterIndex === 1) {
      playClickSound();
      setStage("gate");
      setNovaLine(content.gateScene.novaLine);
      return;
    }

    playCompleteSound();
    setStage("complete");
    setNovaLine(content.novaLines.complete);
  };

  const continueToSecondEncounter = () => {
    playClickSound();
    setEncounterIndex(1);
    setSelectedFruits([]);
    setPickedFruitIds([]);
    setLastTry(null);
    setPlayerPosition("start");
    setTargetPosition("start");
    setLampState("sleeping");
    setStage("map");
    setNovaLine(content.encounters[1].mapLine);
  };

  const enterMistGate = () => {
    playRewardSound();
    setStage("bridgeIntro");
    setNovaLine(content.bridgeScene.novaLine);
  };

  const startBridgeEncounter = () => {
    playClickSound();
    setEncounterIndex(2);
    setSelectedFruits([]);
    setPickedFruitIds([]);
    setLastTry(null);
    setPlayerPosition("start");
    setTargetPosition("start");
    setLampState("sleeping");
    setStage("map");
    setNovaLine(content.encounters[2].mapLine);
  };

  const resetAdventure = () => {
    playClickSound();
    setEncounterIndex(0);
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

  const islandName = content.name.split(" · ")[0] ?? content.name;

  return (
    <main className={`h-[100dvh] overflow-hidden bg-[#07102f] text-white ${isAwake ? "forest-lit" : ""}`}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(70,230,255,0.24),transparent_34%),radial-gradient(circle_at_82%_20%,rgba(168,85,247,0.26),transparent_34%),linear-gradient(180deg,#121d62,#07102f_58%,#05101e)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_24px_24px,rgba(255,255,255,0.13)_1px,transparent_2px)] bg-[size:34px_34px] opacity-30" />

      <section className="relative mx-auto grid h-[100dvh] w-full max-w-6xl grid-rows-[auto_minmax(0,1fr)] gap-2 px-2 py-2 sm:px-5 sm:py-4 lg:py-5">
        <header className="hud-panel flex min-h-11 items-center justify-between gap-2 rounded-[18px] border border-cyan-200/22 bg-blue-950/66 px-2 py-1 shadow-[0_0_24px_rgba(34,211,238,0.14)] backdrop-blur-xl sm:min-h-14 sm:px-3 sm:py-2">
          <Link className="inline-flex min-h-8 shrink-0 items-center rounded-full border border-cyan-200/25 bg-cyan-200/10 px-2.5 text-xs font-black text-cyan-50 sm:min-h-10 sm:px-3" href="/adventure">
            ← 入口
          </Link>
          <div className="min-w-0 text-center">
            <h1 className="truncate text-base font-black leading-tight sm:text-2xl">{islandName}</h1>
            <p className="hidden text-[10px] font-black text-amber-200 sm:block">{content.name.replace(`${islandName} · `, "")}</p>
          </div>
          <div className="shrink-0 rounded-full border border-amber-200/35 bg-amber-300/10 px-2.5 py-1.5 text-[11px] font-black text-amber-100 sm:px-3 sm:py-2 sm:text-xs">
            星光碎片 x{currentFragmentCount}
          </div>
        </header>

        <section className="game-stage relative min-h-0 overflow-hidden rounded-[24px] border border-cyan-200/25 bg-[#0d1850]/82 shadow-[0_0_36px_rgba(34,211,238,0.18)] sm:min-h-[680px] sm:rounded-[30px] lg:min-h-[720px]">
          <ForestMap
            contentFruits={currentEncounter.fruits}
            encounterId={currentEncounter.id}
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
            followerCount={followerCount}
            sceneMode={sceneMode}
            targetEnergy={currentEncounter.targetEnergy}
          />

          {stage !== "intro" && (
            <div className="pointer-events-none absolute left-2 right-2 top-2 z-50 flex justify-center">
              <div className={`max-w-[330px] rounded-full border px-3 py-1.5 text-center text-xs font-black shadow-[0_0_20px_rgba(34,211,238,0.16)] backdrop-blur-xl sm:text-sm ${isBagReady ? "border-amber-200/60 bg-amber-300/95 text-slate-950" : "border-cyan-200/28 bg-blue-950/72 text-cyan-50"}`}>
                {taskPrompt}
              </div>
            </div>
          )}

          {stage === "intro" && (
            <SceneCard className="bottom-3 left-3 right-3 p-3 sm:bottom-6 sm:left-6 sm:right-auto sm:w-[380px] sm:p-4">
              <h2 className="text-xl font-black leading-tight sm:text-2xl">{content.intro.title}</h2>
              <p className="mt-1.5 text-xs font-bold leading-5 text-cyan-50/88 sm:text-sm sm:leading-6">{content.intro.line}</p>
              <PrimaryButton onClick={startAdventure}>{content.buttons.start}</PrimaryButton>
            </SceneCard>
          )}

          {(stage === "map" || stage === "collect" || stage === "lamp") && (
            <div className="game-controls absolute bottom-2 left-2 right-2 z-50 mx-auto max-w-[500px] rounded-[22px] border border-cyan-200/24 bg-blue-950/72 p-2 shadow-[0_0_28px_rgba(34,211,238,0.16)] backdrop-blur-xl sm:bottom-3 sm:rounded-[28px] sm:p-3">
              <NovaHint line={novaLine} />
              <InventoryDock fruits={selectedFruits} hasFailedTry={hasFailedTry} onReset={resetBag} />
              {isTryingLamp && <LampMeter state={lampState} sum={bagSum} />}
              {hasFailedTry && (
                <SecondaryAction onClick={resetBag}>{content.buttons.retry}</SecondaryAction>
              )}
              {isBagReady && (
                <PrimaryButton onClick={tryLamp}>{currentEncounter.tryButton}</PrimaryButton>
              )}
            </div>
          )}

          {stage === "result" && lastTry && (
            <SceneCard className="awakening-card bottom-3 left-3 right-3 p-3 text-center sm:bottom-4 sm:left-1/2 sm:w-[430px] sm:-translate-x-1/2 sm:p-4">
              <div className="mx-auto mb-1.5 flex h-16 w-16 items-center justify-center rounded-full border border-amber-100/40 bg-amber-200/18 shadow-[0_0_30px_rgba(250,204,21,0.34)] sm:h-20 sm:w-20">
                <AssetImage
                  alt=""
                  className="h-12 w-12 object-contain drop-shadow-[0_0_16px_rgba(250,204,21,0.75)] sm:h-16 sm:w-16"
                  src={forestRpgAssets.objects.starlightFragment}
                />
              </div>
              <p className="text-[10px] font-black tracking-[0.18em] text-amber-200 sm:text-xs">
                {attemptCount === 1 ? content.narrative.resultPerfectTitle : content.narrative.resultSuccessTitle}
              </p>
              <h2 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">{currentEncounter.kind === "bridge" ? "星光桥亮起来了！" : "星光亮起来了！"}</h2>
              <p className="text-base font-black text-amber-100 sm:mt-1 sm:text-lg">{currentEncounter.successText}</p>
              <p className="mt-1.5 text-xs font-bold leading-5 text-cyan-50/88 sm:text-sm sm:leading-6">
                {currentEncounter.successSummary(lastTry.fruits[0].value, lastTry.fruits[1].value)}
              </p>
              <p className="mt-1.5 rounded-full border border-emerald-200/30 bg-emerald-300/16 px-3 py-1.5 text-xs font-black text-emerald-50 sm:text-sm">
                {content.narrative.friendLine}
              </p>
              <p className="mt-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black text-slate-950 sm:text-sm">
                {currentEncounter.rewardText}
              </p>
              <PrimaryButton onClick={advanceAfterResult}>{encounterIndex === 0 ? content.buttons.continueForward : encounterIndex === 1 ? content.buttons.openGate : "看看森林小路"}</PrimaryButton>
            </SceneCard>
          )}

          {stage === "follow" && (
            <SceneCard className="awakening-card bottom-3 left-3 right-3 p-3 text-center sm:bottom-4 sm:left-1/2 sm:w-[430px] sm:-translate-x-1/2 sm:p-4">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100/40 bg-emerald-200/16 shadow-[0_0_30px_rgba(134,239,172,0.34)]">
                <AssetImage
                  alt=""
                  className="h-14 w-14 object-contain drop-shadow-[0_0_14px_rgba(134,239,172,0.72)]"
                  src={forestRpgAssets.characters.awakeSpirit}
                />
              </div>
              <h2 className="text-2xl font-black leading-tight">{content.narrative.followTitle}</h2>
              <p className="mt-1.5 rounded-full border border-emerald-200/30 bg-emerald-300/16 px-3 py-1.5 text-xs font-black text-emerald-50">
                {content.narrative.friendLine}
              </p>
              <p className="mt-2 text-xs font-bold leading-5 text-cyan-50/88 sm:text-sm sm:leading-6">{content.narrative.followLine}</p>
              <p className="mt-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black text-slate-950">
                {content.encounters[0].progressText}
              </p>
              <PrimaryButton onClick={continueToSecondEncounter}>{content.buttons.continueForward}</PrimaryButton>
            </SceneCard>
          )}

          {stage === "gate" && (
            <SceneCard className="awakening-card bottom-3 left-3 right-3 p-3 text-center sm:bottom-4 sm:left-1/2 sm:w-[430px] sm:-translate-x-1/2 sm:p-4">
              <div className="mx-auto mb-2 grid w-32 grid-cols-2 gap-2">
                {[0, 1].map((index) => (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-100/35 bg-emerald-200/18 shadow-[0_0_22px_rgba(134,239,172,0.38)]" key={index}>
                    <AssetImage
                      alt=""
                      className="h-12 w-12 object-contain drop-shadow-[0_0_12px_rgba(134,239,172,0.72)]"
                      src={forestRpgAssets.characters.awakeSpirit}
                    />
                  </div>
                ))}
              </div>
              <h2 className="text-2xl font-black leading-tight">{content.gateScene.title}</h2>
              <p className="mt-2 text-xs font-bold leading-5 text-cyan-50/88 sm:text-sm sm:leading-6">{content.gateScene.line}</p>
              <p className="mt-2 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-black text-slate-950">
                {content.encounters[1].progressText}
              </p>
              <PrimaryButton onClick={enterMistGate}>{content.buttons.enterGate}</PrimaryButton>
            </SceneCard>
          )}

          {stage === "bridgeIntro" && (
            <SceneCard className="awakening-card bottom-3 left-3 right-3 p-3 text-center sm:bottom-4 sm:left-1/2 sm:w-[430px] sm:-translate-x-1/2 sm:p-4">
              <div className="mx-auto mb-2 h-14 w-40 rounded-full border border-amber-100/30 bg-[linear-gradient(90deg,rgba(250,204,21,0.55)_0_38%,transparent_38%_62%,rgba(250,204,21,0.55)_62%_100%)] shadow-[0_0_28px_rgba(250,204,21,0.28)]" />
              <h2 className="text-2xl font-black leading-tight">{content.bridgeScene.title}</h2>
              <p className="mt-2 text-xs font-bold leading-5 text-cyan-50/88 sm:text-sm sm:leading-6">{content.bridgeScene.line}</p>
              <p className="mt-2 rounded-[16px] border border-cyan-200/28 bg-cyan-200/12 px-3 py-2 text-xs font-bold leading-5 text-cyan-50/86">
                {content.bridgeScene.novaLine}
              </p>
              <PrimaryButton onClick={startBridgeEncounter}>{content.buttons.startBridge}</PrimaryButton>
            </SceneCard>
          )}

          {stage === "complete" && (
            <SceneCard className="reward-card bottom-3 left-3 right-3 p-3 text-center sm:bottom-4 sm:left-1/2 sm:w-[440px] sm:-translate-x-1/2 sm:p-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-amber-100/45 bg-amber-200/18 shadow-[0_0_38px_rgba(250,204,21,0.42)] sm:h-24 sm:w-24">
                <AssetImage
                  alt=""
                  className="h-16 w-16 object-contain drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] sm:h-20 sm:w-20"
                  src={forestRpgAssets.objects.starlightFragment}
                />
              </div>
              <h2 className="mt-1.5 text-2xl font-black leading-tight sm:text-3xl">{content.finalComplete.title}</h2>
              <div className="mt-2 grid gap-1.5 text-xs font-black text-cyan-50 sm:gap-2 sm:text-sm">
                <p className="rounded-[16px] border border-amber-200/30 bg-amber-300/16 px-3 py-1.5">{content.finalComplete.friends}</p>
                <p className="rounded-[16px] border border-emerald-200/30 bg-emerald-300/14 px-3 py-1.5">{content.finalComplete.progress}</p>
                <p className="rounded-[16px] border border-cyan-200/30 bg-cyan-300/12 px-3 py-1.5">{content.finalComplete.fragments}</p>
                <p className="rounded-[16px] border border-violet-200/30 bg-violet-300/12 px-3 py-1.5">{content.finalComplete.bridge}</p>
              </div>
              <div className="mt-3 rounded-[18px] border border-cyan-200/28 bg-cyan-200/12 px-3 py-2 text-left shadow-[0_0_18px_rgba(34,211,238,0.12)]">
                <p className="text-xs font-black text-amber-100 sm:text-sm">{content.finalComplete.hookTitle}</p>
                <p className="mt-1 text-xs font-bold leading-5 text-cyan-50/82">{content.finalComplete.hookLine}</p>
                <p className="mt-1 text-xs font-bold leading-5 text-cyan-50/82">{content.finalComplete.novaHook}</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <PrimaryButton onClick={resetAdventure}>{content.buttons.replay}</PrimaryButton>
                <Link className="inline-flex min-h-11 items-center justify-center rounded-[20px] border border-cyan-200/30 bg-cyan-200/12 px-4 text-sm font-black text-cyan-50 transition active:scale-95 sm:min-h-12 sm:rounded-[22px]" href="/adventure">
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
        @keyframes gatePulse {
          0%, 100% { opacity: 0.64; box-shadow: 0 0 30px rgba(34,211,238,0.22); }
          50% { opacity: 0.92; box-shadow: 0 0 60px rgba(168,85,247,0.34); }
        }
        @keyframes bridgePulse {
          0%, 100% { filter: brightness(0.92); opacity: 0.7; }
          50% { filter: brightness(1.18); opacity: 0.94; }
        }
        .energy-fruit { animation: fruitGlow 2.2s ease-in-out infinite; }
        .lamp-ready, .lamp-lit { animation: lampGlow 1.7s ease-in-out infinite; }
        .tap-hint { animation: nudge 1.3s ease-in-out infinite; }
        .mist-gate { animation: gatePulse 2.4s ease-in-out infinite; }
        .star-bridge { animation: bridgePulse 2.1s ease-in-out infinite; }
        .starlight-burst { animation: burstRing 1.2s ease-out infinite; }
        .reward-card, .awakening-card { animation: rewardGlow 2.2s ease-in-out infinite; }
        .spirit-awake { animation: spiritWake 2s ease-in-out infinite; }
        .sleepy-mist { animation: mistDrift 4s ease-in-out infinite; }
        .forest-lit .sleepy-mist { opacity: 0; transition: opacity 0.8s ease; }
        .forest-lit .forest-light { opacity: 1; }
        .forest-lit .game-stage { border-color: rgba(253,224,71,0.42); }
        @media (prefers-reduced-motion: reduce) {
          .energy-fruit, .lamp-ready, .lamp-lit, .sleepy-mist, .tap-hint, .starlight-burst, .reward-card, .awakening-card, .spirit-awake, .mist-gate, .star-bridge { animation: none; }
        }
      `}</style>
    </main>
  );

  function getPoint(position: PlayerPosition) {
    if (position === "start") return { x: 12, y: 68 };
    if (position === "lamp") return currentEncounter.id === "star-bridge" ? { x: 54, y: 47 } : currentEncounter.id === "second-spirit" ? { x: 55, y: 44 } : { x: 58, y: 45 };
    const fruit = currentEncounter.fruits.find((item) => item.id === position);
    return fruit?.position ?? { x: 12, y: 68 };
  }
}

function ForestMap({
  contentFruits,
  encounterId,
  followerCount,
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
  sceneMode,
  showAwakeningBurst,
  showMap,
  targetEnergy
}: {
  contentFruits: ForestFruit[];
  encounterId: string;
  followerCount: number;
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
  sceneMode: "forest" | "gate" | "bridge";
  showAwakeningBurst: boolean;
  showMap: boolean;
  targetEnergy: number;
}) {
  const spiritAwake = isAwake;
  const recommendedFruitId = getRecommendedFruitId(contentFruits, pickedFruitIds, selectedFruits, targetEnergy);
  const backgroundAsset = isAwake ? forestRpgAssets.backgrounds.bright : forestRpgAssets.backgrounds.dark;
  const isSecondEncounter = encounterId === "second-spirit";
  const isBridge = sceneMode === "bridge";
  const lampPoint = isBridge ? { x: 54, y: 47 } : isSecondEncounter ? { x: 55, y: 44 } : { x: 58, y: 43 };
  const spiritClassName = isSecondEncounter ? "right-[6%] top-[20%] sm:right-[16%]" : "right-[5%] top-[18%] sm:right-[18%]";

  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-cover bg-center ${isAwake ? "bg-emerald-500/10" : "bg-slate-950/20"}`}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(9,18,58,0.38), rgba(5,16,30,0.52)), url(${backgroundAsset}), radial-gradient(circle at 50% 0%, rgba(34,211,238,0.22), transparent 44%), linear-gradient(180deg, #121d62, #07102f 58%, #05101e)`
      }}
    >
      <div className="absolute inset-x-[-10%] bottom-0 h-[58%] rounded-t-[50%] bg-[radial-gradient(circle_at_50%_0%,rgba(34,197,94,0.28),rgba(21,128,61,0.22)_36%,rgba(5,46,22,0.72)_78%)]" />
      <div className="forest-light pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 bg-[radial-gradient(circle_at_60%_42%,rgba(250,204,21,0.3),transparent_30%),radial-gradient(circle_at_35%_72%,rgba(134,239,172,0.26),transparent_34%)]" />
      {showAwakeningBurst && <div className="starlight-burst pointer-events-none absolute z-30 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/40 bg-amber-200/18" style={{ left: `${lampPoint.x}%`, top: `${lampPoint.y}%` }} />}
      {isAwake && <div className="distant-hook pointer-events-none absolute right-[7%] top-[10%] z-10 h-20 w-20 rounded-full border border-cyan-100/20 bg-slate-300/20 blur-sm" />}
      <div className="absolute bottom-[21%] left-[8%] right-[8%] h-12 rounded-[50%] bg-amber-100/12 blur-sm ring-1 ring-amber-200/20" />
      <div className="absolute bottom-[22%] left-[9%] right-[9%] h-2 rounded-full bg-gradient-to-r from-cyan-200/10 via-amber-200/30 to-emerald-200/18" />
      {(sceneMode === "gate" || sceneMode === "bridge") && (
        <div className="mist-gate pointer-events-none absolute left-1/2 top-[28%] z-10 h-40 w-32 -translate-x-1/2 rounded-full border border-cyan-100/28 bg-[radial-gradient(circle_at_50%_48%,rgba(34,211,238,0.22),rgba(88,28,135,0.3)_48%,rgba(15,23,42,0.05)_64%,transparent_72%)] shadow-[0_0_36px_rgba(34,211,238,0.24)]" />
      )}
      {sceneMode === "bridge" && (
        <div className="star-bridge pointer-events-none absolute left-[10%] right-[10%] top-[58%] z-10 h-16 rounded-full bg-[linear-gradient(90deg,rgba(250,204,21,0.72)_0_38%,transparent_38%_62%,rgba(250,204,21,0.72)_62%_100%)] shadow-[0_0_32px_rgba(250,204,21,0.28)]" />
      )}

      {Array.from({ length: 9 }).map((_, index) => (
        <span
          className="absolute bottom-[30%] h-20 w-10 rounded-t-full bg-gradient-to-b from-emerald-300/24 to-emerald-950/50"
          key={index}
          style={{ left: `${4 + index * 11}%`, height: `${72 + (index % 3) * 24}px` }}
        />
      ))}

      <div className="absolute z-20 -translate-x-1/2 -translate-y-1/2" style={{ left: `${lampPoint.x}%`, top: `${lampPoint.y}%` }}>
        <button
          aria-label="星光灯"
          className={`relative flex h-24 w-20 items-center justify-center rounded-[28px] border border-amber-100/45 bg-[radial-gradient(circle_at_50%_35%,rgba(250,204,21,0.24),rgba(23,37,84,0.86))] shadow-[0_0_24px_rgba(250,204,21,0.17)] transition active:scale-95 sm:h-32 sm:w-28 sm:rounded-[34px] ${isBagReady ? "lamp-ready bg-amber-300/25 ring-4 ring-amber-200/40" : ""} ${lampState === "lit" ? "lamp-lit bg-amber-300/80" : ""} ${lampPulse ? "scale-105" : ""}`}
          data-testid="starlight-lamp"
          onClick={onLampClick}
          type="button"
        >
          <AssetImage
            alt=""
            className="h-full w-full object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.45)]"
            src={lampState === "lit" ? forestRpgAssets.objects.starlightLampOn : forestRpgAssets.objects.starlightLampOff}
          />
          <div className={`absolute h-12 w-10 rounded-full ${lampState === "lit" ? "bg-amber-100/30" : lampState === "charging" ? "bg-amber-200/25" : lampState === "too-low" ? "bg-amber-200/16" : lampState === "too-high" ? "bg-violet-300/20" : "bg-cyan-200/12"} transition`} />
          {isBagReady && <span className="tap-hint absolute -top-7 rounded-full bg-amber-300 px-2 py-1 text-[10px] font-black text-slate-950">点这里</span>}
        </button>
      </div>

      {!isBridge && <div className={`absolute z-20 flex flex-col items-center gap-2 ${spiritClassName}`}>
        <div
          className={`spirit-avatar relative flex h-20 w-20 items-center justify-center rounded-[42%] border border-cyan-100/30 ${spiritAwake ? "spirit-awake bg-[radial-gradient(circle_at_50%_30%,rgba(254,243,199,0.36),rgba(134,239,172,0.18)_52%,rgba(34,197,94,0.1))] shadow-[0_0_36px_rgba(134,239,172,0.64)]" : "bg-[radial-gradient(circle_at_50%_30%,rgba(219,234,254,0.28),rgba(148,163,184,0.16)_54%,rgba(71,85,105,0.1))] shadow-[0_0_24px_rgba(148,163,184,0.42)]"} sm:h-28 sm:w-28`}
        >
          <AssetImage
            alt=""
            className="h-full w-full object-contain drop-shadow-[0_0_18px_rgba(125,211,252,0.56)]"
            src={spiritAwake ? forestRpgAssets.characters.awakeSpirit : forestRpgAssets.characters.sleepingSpirit}
          />
        </div>
      </div>}

      <div className="sleepy-mist absolute right-[4%] top-[12%] z-10 h-72 w-72 rounded-full bg-slate-300/22 bg-contain bg-center bg-no-repeat blur-2xl sm:right-[12%]" style={{ backgroundImage: `url(${forestRpgAssets.objects.sleepyFog}), radial-gradient(circle, rgba(203,213,225,0.24), transparent 68%)` }} />
      <div className="sleepy-mist absolute right-[20%] top-[26%] z-10 h-48 w-64 rounded-full bg-cyan-200/16 bg-contain bg-center bg-no-repeat blur-2xl" style={{ backgroundImage: `url(${forestRpgAssets.objects.sleepyFog}), radial-gradient(circle, rgba(165,243,252,0.18), transparent 70%)` }} />
      {isSecondEncounter && <div className="sleepy-mist absolute left-[56%] top-[18%] z-10 h-44 w-56 rounded-full bg-slate-300/18 bg-contain bg-center bg-no-repeat blur-2xl" style={{ backgroundImage: `url(${forestRpgAssets.objects.sleepyFog}), radial-gradient(circle, rgba(148,163,184,0.2), transparent 70%)` }} />}

      {showMap && contentFruits.map((fruit) => {
        const picked = pickedFruitIds.includes(fruit.id);
        const carried = selectedFruits.some((item) => item.id === fruit.id);
        const canPick = !picked && selectedFruits.length < 2 && !hasFailedTry;
        const showTapHint = canPick && fruit.id === recommendedFruitId;
        return (
          <button
            className={`absolute z-30 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-100/60 bg-[radial-gradient(circle_at_35%_28%,#fef3c7,#facc15_34%,#22c55e_72%,#15803d)] text-xl font-black text-slate-950 transition active:scale-95 ${canPick ? "energy-fruit hover:scale-105" : "opacity-35 grayscale"} ${carried ? "ring-4 ring-cyan-100/60" : ""}`}
            data-testid={fruit.id}
            disabled={!canPick}
            key={fruit.id}
            onClick={() => onCollect(fruit)}
            style={{
              left: `${fruit.position.x}%`,
              top: `${fruit.position.y}%`
            }}
            type="button"
          >
            <AssetImage
              alt=""
              className="absolute inset-0 h-full w-full object-contain drop-shadow-[0_0_14px_rgba(250,204,21,0.72)]"
              src={forestRpgAssets.objects.energyFruit}
            />
            <span className="relative z-10 rounded-full bg-slate-950/68 px-2 py-0.5 text-base font-black text-amber-100 shadow-[0_0_10px_rgba(15,23,42,0.72)]">
              {fruit.label}
            </span>
            {showTapHint && <span className="tap-hint pointer-events-none absolute -top-7 rounded-full bg-amber-200 px-2 py-1 text-[10px] font-black text-slate-950">点我</span>}
            {picked && <span className="pointer-events-none absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-100 text-[11px] font-black text-slate-950 shadow-[0_0_12px_rgba(186,230,253,0.75)]">✓</span>}
          </button>
        );
      })}

      {showMap && (
        <>
        {Array.from({ length: followerCount }).map((_, index) => (
          <div
            className="pointer-events-none absolute z-40 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-emerald-100/30 bg-emerald-200/18 shadow-[0_0_18px_rgba(134,239,172,0.42)] sm:h-12 sm:w-12"
            key={index}
            style={{ left: `${Math.min(88, playerPoint.x + 9 + index * 7)}%`, top: `${Math.max(14, playerPoint.y - 5 + index * 6)}%` }}
          >
            <AssetImage
              alt=""
              className="h-full w-full object-contain drop-shadow-[0_0_10px_rgba(134,239,172,0.65)]"
              src={forestRpgAssets.characters.awakeSpirit}
            />
          </div>
        ))}
        <div
          className="absolute z-40 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-100/35 bg-[radial-gradient(circle_at_50%_35%,#e0f2fe,#38bdf8_52%,#1d4ed8)] shadow-[0_0_24px_rgba(34,211,238,0.46)] transition-[left,top] duration-700 ease-in-out sm:h-20 sm:w-20"
          data-testid="forest-rpg-player"
          style={{ left: `${playerPoint.x}%`, top: `${playerPoint.y}%` }}
        >
          <AssetImage
            alt="小探险家"
            className="h-full w-full object-contain drop-shadow-[0_0_14px_rgba(34,211,238,0.65)]"
            src={forestRpgAssets.characters.playerAvatar}
          />
        </div>
        </>
      )}
    </div>
  );
}

function getRecommendedFruitId(fruits: ForestFruit[], pickedFruitIds: string[], selectedFruits: ForestFruit[], targetEnergy: number) {
  const available = fruits.filter((fruit) => !pickedFruitIds.includes(fruit.id));
  if (selectedFruits.length === 0) {
    return available.find((fruit) => available.some((other) => other.id !== fruit.id && other.value + fruit.value === targetEnergy))?.id ?? available[0]?.id ?? null;
  }

  if (selectedFruits.length === 1) {
    const neededValue = targetEnergy - selectedFruits[0].value;
    return available.find((fruit) => fruit.value === neededValue)?.id ?? available.sort((left, right) => left.value - right.value)[0]?.id ?? null;
  }

  return null;
}

function SceneCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`absolute z-50 rounded-[24px] border border-cyan-200/25 bg-blue-950/78 p-4 shadow-[0_0_32px_rgba(34,211,238,0.17)] backdrop-blur-xl sm:rounded-[28px] ${className}`}>
      {children}
    </div>
  );
}

function NovaHint({ line }: { line: string }) {
  return (
    <div className="mb-1.5 grid grid-cols-[44px_minmax(0,1fr)] items-center gap-2 sm:mb-2 sm:grid-cols-[56px_minmax(0,1fr)]">
      <div
        aria-label="Nova"
        className="relative mx-auto flex h-11 w-11 items-center justify-center rounded-[14px] border border-cyan-100/35 bg-[radial-gradient(circle_at_50%_30%,#dffbff,#38bdf8_48%,#1d4ed8)] shadow-[0_0_18px_rgba(34,211,238,0.26)] sm:h-14 sm:w-14 sm:rounded-[18px]"
      >
        <AssetImage
          alt=""
          className="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(34,211,238,0.6)]"
          src={forestRpgAssets.characters.nova}
        />
      </div>
      <p className="rounded-[14px] border border-cyan-200/16 bg-slate-950/28 px-2 py-1.5 text-[11px] font-bold leading-4 text-cyan-50 sm:rounded-[16px] sm:p-2 sm:text-xs sm:leading-5">{line}</p>
    </div>
  );
}

function InventoryDock({ fruits, hasFailedTry, onReset }: { fruits: ForestFruit[]; hasFailedTry: boolean; onReset: () => void }) {
  return (
    <div className="rounded-[18px] border border-amber-200/26 bg-blue-950/68 p-2 shadow-[0_0_24px_rgba(34,211,238,0.14)] backdrop-blur-xl sm:rounded-[24px] sm:p-3" data-testid="fruit-bag">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-black tracking-[0.14em] text-amber-200 sm:text-xs sm:tracking-[0.18em]">背包</p>
        {(fruits.length > 0 || hasFailedTry) && (
          <button className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-2.5 py-0.5 text-[11px] font-black text-cyan-50 transition active:scale-95 sm:px-3 sm:py-1 sm:text-xs" onClick={onReset} type="button">
            换果子
          </button>
        )}
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-2 sm:mt-2">
        {[0, 1].map((index) => {
          const fruit = fruits[index];
          return (
            <div className={`flex min-h-9 items-center justify-center rounded-[14px] border px-2 text-sm font-black sm:min-h-12 sm:rounded-[18px] ${fruit ? "border-amber-100/55 bg-amber-300/18 text-amber-50 shadow-[0_0_18px_rgba(250,204,21,0.2)]" : "border-cyan-100/18 bg-slate-950/22 text-cyan-50/55"}`} key={index}>
              {fruit ? (
                <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-amber-100/60 bg-[radial-gradient(circle_at_35%_28%,#fef3c7,#facc15_38%,#22c55e_76%)] text-base font-black text-slate-950 sm:h-10 sm:w-10">
                  <AssetImage
                    alt=""
                    className="absolute inset-0 h-full w-full object-contain"
                    src={forestRpgAssets.objects.energyFruit}
                  />
                  <span className="relative z-10 rounded-full bg-slate-950/68 px-1.5 text-xs text-amber-100">{fruit.label}</span>
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-cyan-100/28" />
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
    <div className="mt-1.5 rounded-[16px] border border-cyan-200/25 bg-slate-950/48 p-2 sm:mt-2 sm:rounded-[20px] sm:p-3" data-testid="lamp-meter">
      <p className="text-[11px] font-black tracking-[0.14em] text-cyan-200 sm:text-xs sm:tracking-[0.18em]">星光灯能量</p>
      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-slate-950/70 sm:mt-2 sm:h-4">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-[20px] bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 px-4 text-sm font-black text-slate-950 shadow-[0_0_24px_rgba(250,204,21,0.38)] transition active:scale-95 sm:mt-3 sm:min-h-12 sm:rounded-[22px] sm:px-5 sm:text-base" onClick={onClick} type="button">
      {children}
    </button>
  );
}

function SecondaryAction({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button className="mt-2 inline-flex min-h-10 w-full items-center justify-center rounded-[18px] border border-cyan-200/30 bg-cyan-200/12 px-4 text-sm font-black text-cyan-50 transition active:scale-95 sm:mt-3 sm:min-h-11 sm:rounded-[20px]" onClick={onClick} type="button">
      {children}
    </button>
  );
}

function AssetImage({ alt, className, src }: { alt: string; className?: string; src: string }) {
  return (
    <Image
      alt={alt}
      aria-hidden={alt === "" ? true : undefined}
      className={className}
      draggable={false}
      height={512}
      onError={(event) => {
        event.currentTarget.style.display = "none";
      }}
      src={src}
      unoptimized
      width={512}
    />
  );
}
